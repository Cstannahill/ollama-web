/**
 * Step Output Caching Service
 * Caches results from individual pipeline steps to improve performance
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  metadata?: Record<string, any>;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalAttempts: number;
  size: number; // Approximate memory usage
}

export class StepCacheService {
  private cache = new Map<string, CacheEntry>();
  private hits = 0;
  private attempts = 0;
  private readonly MAX_ENTRIES = 100;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate a cache key from input parameters
   */
  private generateKey(stepName: string, inputs: any[]): string {
    const inputStr = JSON.stringify(inputs);
    return `${stepName}:${this.hashString(inputStr)}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Check if an entry has expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entries if cache is full
   */
  private evictOldest(): void {
    if (this.cache.size <= this.MAX_ENTRIES) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, entries.length - this.MAX_ENTRIES);
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }
  }

  /**
   * Get cached result for a step
   */
  get<T>(stepName: string, inputs: any[]): T | null {
    this.attempts++;

    const key = this.generateKey(stepName, inputs);
    const entry = this.cache.get(key);

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    this.hits++;

    // Update timestamp to implement LRU-like behavior
    entry.timestamp = Date.now();

    return entry.data as T;
  }

  /**
   * Store result in cache
   */
  set<T>(
    stepName: string,
    inputs: any[],
    data: T,
    options?: { ttl?: number; metadata?: Record<string, any> }
  ): void {
    const key = this.generateKey(stepName, inputs);
    const ttl = options?.ttl || this.DEFAULT_TTL;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      metadata: options?.metadata,
    });

    this.evictOldest();
  }

  /**
   * Execute a function with caching
   */
  async cached<T>(
    stepName: string,
    inputs: any[],
    fn: () => Promise<T>,
    options?: { ttl?: number; metadata?: Record<string, any> }
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(stepName, inputs);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    this.set(stepName, inputs, result, options);

    return result;
  }

  /**
   * Invalidate cache entries by step name
   */
  invalidateStep(stepName: string): number {
    let removed = 0;
    for (const [key] of this.cache.entries()) {
      if (key.startsWith(`${stepName}:`)) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.attempts = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.cleanup(); // Clean up expired entries before reporting stats

    const hitRate = this.attempts > 0 ? this.hits / this.attempts : 0;

    // Estimate memory usage
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // Approximate string size
      size += JSON.stringify(entry).length * 2; // Approximate object size
    }

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.hits,
      totalAttempts: this.attempts,
      size,
    };
  }

  /**
   * Get cache entries by step name (for debugging)
   */
  getEntriesByStep(
    stepName: string
  ): Array<{ key: string; entry: CacheEntry }> {
    const entries: Array<{ key: string; entry: CacheEntry }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(`${stepName}:`)) {
        entries.push({ key, entry });
      }
    }

    return entries.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
  }
}

// Global cache instance
export const stepCache = new StepCacheService();
