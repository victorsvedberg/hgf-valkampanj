/**
 * Signature management module
 * Handles reading/writing signature data with in-memory caching
 */

import { promises as fs } from "fs";
import path from "path";
import { cache, CACHE_TTL } from "./cache";
import { getDisplayNameForSocialProof } from "./swedish-names";

// File paths
const DATA_DIR = path.join(process.cwd(), "data");
const PETITIONS_FILE = path.join(DATA_DIR, "petitions.json");
const RECENT_SIGNATURES_FILE = path.join(DATA_DIR, "recent-signatures.json");

// Sync interval (5 minutes)
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

// Types
interface Petition {
  name: string;
  goal: number;
  brevoListId: number;
  count: number;
}

interface PetitionsData {
  petitions: Record<string, Petition>;
  lastSyncedAt?: string | null;
}

interface RecentSignature {
  firstName: string;
  petitionId: string;
  timestamp: string;
}

interface RecentSignaturesData {
  signatures: RecentSignature[];
}

export interface SignerDisplay {
  displayName: string;
  minutesAgo: number;
}

// Default petition ID
export const DEFAULT_PETITION_ID = "stoppa-marknadshyror-2026";

/**
 * Read petitions data from file
 */
async function readPetitionsData(): Promise<PetitionsData> {
  try {
    const data = await fs.readFile(PETITIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { petitions: {} };
  }
}

/**
 * Write petitions data to file
 */
async function writePetitionsData(data: PetitionsData): Promise<void> {
  await fs.writeFile(PETITIONS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Read recent signatures from file
 */
async function readRecentSignatures(): Promise<RecentSignaturesData> {
  try {
    const data = await fs.readFile(RECENT_SIGNATURES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { signatures: [] };
  }
}

/**
 * Write recent signatures to file
 */
async function writeRecentSignatures(
  data: RecentSignaturesData
): Promise<void> {
  await fs.writeFile(RECENT_SIGNATURES_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get the signature count for a petition
 * Uses in-memory cache with 10s TTL
 * Triggers background sync from Brevo if data is stale
 */
export async function getSignatureCount(
  petitionId: string = DEFAULT_PETITION_ID
): Promise<{ count: number; goal: number }> {
  const cacheKey = `signature_count_${petitionId}`;

  // Check cache first
  const cached = cache.get<{ count: number; goal: number }>(cacheKey);
  if (cached) return cached;

  // Read from file
  const data = await readPetitionsData();
  const petition = data.petitions[petitionId];

  // Check if we need to sync from Brevo (stale-while-revalidate)
  const lastSynced = data.lastSyncedAt ? new Date(data.lastSyncedAt).getTime() : 0;
  const isStale = Date.now() - lastSynced > SYNC_INTERVAL_MS;

  if (isStale && petition?.brevoListId) {
    // Trigger background sync (don't await)
    syncFromBrevo(petitionId, petition.brevoListId).catch((err) => {
      console.error("Background Brevo sync failed:", err);
    });
  }

  const result = {
    count: petition?.count || 0,
    goal: petition?.goal || 100,
  };

  // Cache the result
  cache.set(cacheKey, result, CACHE_TTL.SIGNATURE_COUNT);

  return result;
}

/**
 * Sync signature count from Brevo (background operation)
 */
async function syncFromBrevo(petitionId: string, listId: number): Promise<void> {
  const syncLockKey = `sync_lock_${petitionId}`;

  // Prevent concurrent syncs
  if (cache.get(syncLockKey)) return;
  cache.set(syncLockKey, true, 60000); // Lock for 1 minute

  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("BREVO_API_KEY not set, skipping sync");
      return;
    }

    const response = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${listId}`,
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status}`);
    }

    const brevoData = await response.json();
    const count = brevoData.totalSubscribers || brevoData.uniqueSubscribers || 0;

    // Update local data
    const data = await readPetitionsData();
    if (data.petitions[petitionId]) {
      data.petitions[petitionId].count = count;
    }
    data.lastSyncedAt = new Date().toISOString();
    await writePetitionsData(data);

    // Invalidate cache
    cache.delete(`signature_count_${petitionId}`);

    console.log(`Auto-synced from Brevo: ${petitionId} = ${count} signatures`);
  } finally {
    cache.delete(syncLockKey);
  }
}

/**
 * Get recent signers for social proof display
 * Returns up to `limit` signers from the last 24 hours
 */
export async function getRecentSigners(
  petitionId: string = DEFAULT_PETITION_ID,
  limit: number = 5
): Promise<SignerDisplay[]> {
  const cacheKey = `recent_signers_${petitionId}_${limit}`;

  // Check cache first
  const cached = cache.get<SignerDisplay[]>(cacheKey);
  if (cached) return cached;

  // Read from file
  const data = await readRecentSignatures();
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  // Filter by petition and time, then take the most recent ones
  const recentSignatures = data.signatures
    .filter(
      (sig) =>
        sig.petitionId === petitionId &&
        new Date(sig.timestamp).getTime() > twentyFourHoursAgo
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit)
    .map((sig) => ({
      displayName: getDisplayNameForSocialProof(sig.firstName),
      minutesAgo: Math.floor(
        (now - new Date(sig.timestamp).getTime()) / (60 * 1000)
      ),
    }));

  // Cache the result
  cache.set(cacheKey, recentSignatures, CACHE_TTL.RECENT_SIGNERS);

  return recentSignatures;
}

/**
 * Add a new signature
 * Updates both the count and recent signatures
 */
export async function addSignature(
  petitionId: string,
  firstName: string
): Promise<{ newCount: number; displayName: string }> {
  // Read current data
  const petitionsData = await readPetitionsData();
  const recentData = await readRecentSignatures();

  // Ensure petition exists
  if (!petitionsData.petitions[petitionId]) {
    petitionsData.petitions[petitionId] = {
      name: petitionId,
      goal: 10000,
      brevoListId: 3,
      count: 0,
    };
  }

  // Increment count
  petitionsData.petitions[petitionId].count += 1;
  const newCount = petitionsData.petitions[petitionId].count;

  // Add to recent signatures
  const timestamp = new Date().toISOString();
  recentData.signatures.unshift({
    firstName,
    petitionId,
    timestamp,
  });

  // Clean up old signatures (keep only last 24 hours, max 1000)
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  recentData.signatures = recentData.signatures
    .filter((sig) => new Date(sig.timestamp).getTime() > twentyFourHoursAgo)
    .slice(0, 1000);

  // Write both files
  await Promise.all([
    writePetitionsData(petitionsData),
    writeRecentSignatures(recentData),
  ]);

  // Invalidate caches
  cache.delete(`signature_count_${petitionId}`);
  cache.delete(`recent_signers_${petitionId}_5`);
  cache.delete(`recent_signers_${petitionId}_3`);

  // Get display name
  const displayName = getDisplayNameForSocialProof(firstName);

  return { newCount, displayName };
}

/**
 * Update petition count from Brevo (for syncing)
 */
export async function updatePetitionCount(
  petitionId: string,
  count: number
): Promise<void> {
  const data = await readPetitionsData();

  if (data.petitions[petitionId]) {
    data.petitions[petitionId].count = count;
    await writePetitionsData(data);
    cache.delete(`signature_count_${petitionId}`);
  }
}

/**
 * Get petition configuration
 */
export async function getPetition(
  petitionId: string
): Promise<Petition | null> {
  const data = await readPetitionsData();
  return data.petitions[petitionId] || null;
}

/**
 * Get all petitions (for admin dashboard)
 */
export async function getAllPetitions(): Promise<{
  petitions: Record<string, Petition>;
  lastSyncedAt: string | null;
}> {
  const data = await readPetitionsData();
  return {
    petitions: data.petitions,
    lastSyncedAt: data.lastSyncedAt || null,
  };
}

/**
 * Force sync all petitions from Brevo
 */
export async function syncAllPetitionsFromBrevo(): Promise<{
  synced: string[];
  errors: string[];
}> {
  const data = await readPetitionsData();
  const synced: string[] = [];
  const errors: string[] = [];

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { synced: [], errors: ["BREVO_API_KEY not configured"] };
  }

  for (const [petitionId, petition] of Object.entries(data.petitions)) {
    try {
      const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${petition.brevoListId}`,
        {
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Brevo API error: ${response.status}`);
      }

      const brevoData = await response.json();
      const count =
        brevoData.totalSubscribers || brevoData.uniqueSubscribers || 0;
      data.petitions[petitionId].count = count;
      synced.push(petitionId);
    } catch (err) {
      errors.push(
        `${petitionId}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  data.lastSyncedAt = new Date().toISOString();
  await writePetitionsData(data);

  // Invalidate all caches
  for (const petitionId of Object.keys(data.petitions)) {
    cache.delete(`signature_count_${petitionId}`);
  }

  return { synced, errors };
}
