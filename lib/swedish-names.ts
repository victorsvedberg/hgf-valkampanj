/**
 * Swedish name validation module
 * Uses ~25,000 Swedish first names from SCB (Statistics Sweden)
 */

import namesData from "@/data/swedish-names.json";

// Create a Set for O(1) lookup - loaded once at module initialization
const swedishNamesSet = new Set(
  namesData.names.map((name: string) => name.toLowerCase())
);

/**
 * Check if a name is a valid Swedish first name
 * @param name - The name to validate
 * @returns true if the name is in the Swedish names database
 */
export function isValidSwedishName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  return swedishNamesSet.has(name.trim().toLowerCase());
}

/**
 * Sanitize and format a name for display
 * @param name - The raw name input
 * @returns Properly formatted name if valid, null if invalid
 */
export function sanitizeDisplayName(name: string): string | null {
  if (!name || typeof name !== "string") return null;

  const trimmed = name.trim();
  if (!trimmed) return null;

  // Check if it's a valid Swedish name
  if (!isValidSwedishName(trimmed)) return null;

  // Return properly capitalized name
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Get the display name for social proof
 * @param firstName - The person's first name
 * @returns The name to display, or "En supporter" if not a valid Swedish name
 */
export function getDisplayNameForSocialProof(firstName: string): string {
  const sanitized = sanitizeDisplayName(firstName);
  return sanitized || "En supporter";
}
