interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  cachedAt: string;
}

export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 4 * 60 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): { value: T; cachedAt: string } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return {
      value: entry.value as T,
      cachedAt: entry.cachedAt,
    };
  }

  set<T>(key: string, value: T, ttlMs: number = this.defaultTtlMs): string {
    const cachedAt = new Date().toISOString();
    this.store.set(key, {
      value,
      cachedAt,
      expiresAt: Date.now() + ttlMs,
    });
    return cachedAt;
  }
}
