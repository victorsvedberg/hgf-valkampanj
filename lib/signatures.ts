/**
 * Signature management module
 * Handles reading/writing signature data with Neon Postgres
 */

import { sql } from "./db";
import { cache, CACHE_TTL } from "./cache";
import { getDisplayNameForSocialProof } from "./swedish-names";

// Types
interface Petition {
  name: string;
  goal: number;
  brevoListId: number;
  count: number;
}

export interface SignerDisplay {
  displayName: string;
  minutesAgo: number;
}

// Default petition ID
export const DEFAULT_PETITION_ID = "stoppa-marknadshyror-2026";

// Sync interval (5 minutes)
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

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

  // Read from database
  const rows = await sql`
    SELECT count, goal, brevo_list_id, last_synced_at
    FROM petitions
    WHERE id = ${petitionId}
  `;

  const petition = rows[0];

  if (!petition) {
    return { count: 0, goal: 100 };
  }

  // Check if we need to sync from Brevo (stale-while-revalidate)
  const lastSynced = petition.last_synced_at
    ? new Date(petition.last_synced_at).getTime()
    : 0;
  const isStale = Date.now() - lastSynced > SYNC_INTERVAL_MS;

  if (isStale && petition.brevo_list_id) {
    // Trigger background sync (don't await)
    syncFromBrevo(petitionId, petition.brevo_list_id).catch((err) => {
      console.error("Background Brevo sync failed:", err);
    });
  }

  const result = {
    count: petition.count || 0,
    goal: petition.goal || 100,
  };

  // Cache the result
  cache.set(cacheKey, result, CACHE_TTL.SIGNATURE_COUNT);

  return result;
}

/**
 * Sync signature count from Brevo (background operation)
 */
async function syncFromBrevo(
  petitionId: string,
  listId: number
): Promise<void> {
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
    const count =
      brevoData.totalSubscribers || brevoData.uniqueSubscribers || 0;

    // Update database
    await sql`
      UPDATE petitions
      SET count = ${count}, last_synced_at = NOW()
      WHERE id = ${petitionId}
    `;

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

  // Read from database
  const rows = await sql`
    SELECT first_name, created_at
    FROM signatures
    WHERE petition_id = ${petitionId}
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  const now = Date.now();
  const recentSignatures = rows.map((row) => ({
    displayName: getDisplayNameForSocialProof(row.first_name),
    minutesAgo: Math.floor(
      (now - new Date(row.created_at).getTime()) / (60 * 1000)
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
  // Ensure petition exists with default values if not
  await sql`
    INSERT INTO petitions (id, name, goal, brevo_list_id, count)
    VALUES (${petitionId}, ${petitionId}, 10000, 3, 0)
    ON CONFLICT (id) DO NOTHING
  `;

  // Increment count and get new value
  const countResult = await sql`
    UPDATE petitions
    SET count = count + 1
    WHERE id = ${petitionId}
    RETURNING count
  `;

  const newCount = countResult[0]?.count || 0;

  // Add to signatures table
  await sql`
    INSERT INTO signatures (petition_id, first_name)
    VALUES (${petitionId}, ${firstName})
  `;

  // Clean up old signatures (older than 24 hours)
  await sql`
    DELETE FROM signatures
    WHERE created_at < NOW() - INTERVAL '24 hours'
  `;

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
  await sql`
    UPDATE petitions
    SET count = ${count}
    WHERE id = ${petitionId}
  `;

  cache.delete(`signature_count_${petitionId}`);
}

/**
 * Get petition configuration
 */
export async function getPetition(
  petitionId: string
): Promise<Petition | null> {
  const rows = await sql`
    SELECT name, goal, brevo_list_id as "brevoListId", count
    FROM petitions
    WHERE id = ${petitionId}
  `;

  if (rows.length === 0) return null;

  return rows[0] as Petition;
}

/**
 * Get all petitions (for admin dashboard)
 */
export async function getAllPetitions(): Promise<{
  petitions: Record<string, Petition>;
  lastSyncedAt: string | null;
}> {
  const rows = await sql`
    SELECT id, name, goal, brevo_list_id as "brevoListId", count, last_synced_at
    FROM petitions
  `;

  const petitions: Record<string, Petition> = {};
  let lastSyncedAt: string | null = null;

  for (const row of rows) {
    petitions[row.id] = {
      name: row.name,
      goal: row.goal,
      brevoListId: row.brevoListId,
      count: row.count,
    };
    if (row.last_synced_at) {
      lastSyncedAt = row.last_synced_at;
    }
  }

  return { petitions, lastSyncedAt };
}

/**
 * Force sync all petitions from Brevo
 */
export async function syncAllPetitionsFromBrevo(): Promise<{
  synced: string[];
  errors: string[];
}> {
  const synced: string[] = [];
  const errors: string[] = [];

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { synced: [], errors: ["BREVO_API_KEY not configured"] };
  }

  const rows = await sql`
    SELECT id, brevo_list_id
    FROM petitions
  `;

  for (const row of rows) {
    try {
      const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${row.brevo_list_id}`,
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

      await sql`
        UPDATE petitions
        SET count = ${count}, last_synced_at = NOW()
        WHERE id = ${row.id}
      `;

      synced.push(row.id);
    } catch (err) {
      errors.push(
        `${row.id}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  // Invalidate all caches
  for (const row of rows) {
    cache.delete(`signature_count_${row.id}`);
  }

  return { synced, errors };
}
