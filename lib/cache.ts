/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton cache instance
export const cache = new Cache();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SIGNATURE_COUNT: 10 * 1000, // 10 seconds
  RECENT_SIGNERS: 10 * 1000, // 10 seconds
  BREVO_SYNC: 5 * 60 * 1000, // 5 minutes
} as const;
