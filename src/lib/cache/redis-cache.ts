/**
 * Redis Caching Layer
 * Provides query result caching with TTL, invalidation, and versioning
 *
 * Features:
 * - Cache-aside pattern
 * - Automatic JSON serialization/deserialization
 * - Configurable TTL per cache key
 * - Cache invalidation helpers
 * - Graceful degradation (returns undefined on cache errors)
 */

import { Redis } from "ioredis";

// Singleton Redis client
let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 * Returns null if Redis is not configured (graceful degradation)
 */
function getRedisClient(): Redis | null {
  if (!process.env["REDIS_URL"]) {
    console.warn("[Cache] REDIS_URL not configured - caching disabled");
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(process.env["REDIS_URL"], {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
      });

      redisClient.on("error", (error) => {
        console.error("[Cache] Redis connection error:", error);
      });

      redisClient.on("connect", () => {
        console.log("[Cache] Redis connected");
      });
    } catch (error) {
      console.error("[Cache] Failed to create Redis client:", error);
      return null;
    }
  }

  return redisClient;
}

/**
 * Cache key prefix for namespacing
 */
const CACHE_PREFIX = "refleqt:v1:";

/**
 * Generate cache key with prefix
 */
function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * Get cached value by key
 * Returns null if cache miss or error
 */
export async function get<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(getCacheKey(key));
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error);
    return null;
  }
}

/**
 * Set cache value with TTL
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 */
export async function set<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.setex(getCacheKey(key), ttlSeconds, serialized);
    return true;
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete cached value(s)
 * Supports wildcards (e.g., "user:*" to delete all user keys)
 */
export async function del(pattern: string): Promise<number> {
  const client = getRedisClient();
  if (!client) return 0;

  try {
    const fullPattern = getCacheKey(pattern);

    // If pattern contains wildcard, use SCAN + DEL
    if (pattern.includes("*")) {
      let cursor = "0";
      let deletedCount = 0;

      do {
        const [newCursor, keys] = await client.scan(
          cursor,
          "MATCH",
          fullPattern,
          "COUNT",
          100
        );
        cursor = newCursor;

        if (keys.length > 0) {
          deletedCount += await client.del(...keys);
        }
      } while (cursor !== "0");

      return deletedCount;
    } else {
      // Single key deletion
      return await client.del(fullPattern);
    }
  } catch (error) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Cache-aside pattern: Get from cache or fetch and cache
 *
 * @param key - Cache key
 * @param fetcher - Function to fetch data if cache miss
 * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 * @returns Cached or freshly fetched data
 *
 * @example
 * const insights = await getCached(
 *   `insights:${userId}`,
 *   () => prisma.synthesizedInsight.findMany({ where: { userId } }),
 *   300
 * );
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = await get<T>(key);
  if (cached !== null) {
    console.log(`[Cache] HIT: ${key}`);
    return cached;
  }

  console.log(`[Cache] MISS: ${key}`);

  // Cache miss - fetch fresh data
  const data = await fetcher();

  // Store in cache (fire and forget)
  set(key, data, ttlSeconds).catch((error) => {
    console.error(`[Cache] Failed to cache ${key}:`, error);
  });

  return data;
}

/**
 * Invalidate cache for a user
 * Deletes all cache keys starting with "user:{userId}:"
 */
export async function invalidateUser(userId: string): Promise<number> {
  return del(`user:${userId}:*`);
}

/**
 * Invalidate cache for insights
 */
export async function invalidateInsights(userId: string): Promise<number> {
  return del(`insights:${userId}:*`);
}

/**
 * Invalidate cache for research goals
 */
export async function invalidateResearchGoals(userId: string): Promise<number> {
  return del(`research-goals:${userId}:*`);
}

/**
 * Invalidate cache for smart trackers
 */
export async function invalidateSmartTrackers(userId: string): Promise<number> {
  return del(`smart-trackers:${userId}:*`);
}

/**
 * Invalidate all caches for a user
 */
export async function invalidateAllForUser(userId: string): Promise<void> {
  await Promise.all([
    invalidateUser(userId),
    invalidateInsights(userId),
    invalidateResearchGoals(userId),
    invalidateSmartTrackers(userId),
  ]);
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  connected: boolean;
  keyCount: number | null;
  memoryUsed: string | null;
}> {
  const client = getRedisClient();
  if (!client) {
    return { connected: false, keyCount: null, memoryUsed: null };
  }

  try {
    const info = await client.info("memory");
    const dbsize = await client.dbsize();
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memoryUsed = memoryMatch ? memoryMatch[1]?.trim() || null : null;

    return {
      connected: true,
      keyCount: dbsize,
      memoryUsed,
    };
  } catch (error) {
    console.error("[Cache] Error getting stats:", error);
    return { connected: false, keyCount: null, memoryUsed: null };
  }
}

/**
 * Flush all cache (use with caution!)
 */
export async function flushAll(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.flushdb();
    console.log("[Cache] All cache flushed");
    return true;
  } catch (error) {
    console.error("[Cache] Error flushing cache:", error);
    return false;
  }
}

// Export types for convenience
export type CacheOptions = {
  ttl?: number;
  prefix?: string;
};
