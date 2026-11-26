import { unstable_cache, updateTag } from "next/cache";

let redis: any = null;

if (process.env.REDIS_URL) {
  try {
    const Redis = require("ioredis");
    redis = new Redis(process.env.REDIS_URL);
    console.log("Redis cache client successfully initialized");
  } catch (e) {
    console.warn("Failed to initialize Redis client, falling back to memory cache:", e);
  }
}

export async function customCache<T>(
  fetchFn: () => Promise<T>,
  key: string,
  tags: string[],
  revalidateSeconds: number = 3600
): Promise<T> {
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      const data = await fetchFn();
      await redis.set(key, JSON.stringify(data), "EX", revalidateSeconds);
      return data;
    } catch (e) {
      console.warn("Redis read/write error, falling back to local memory cache:", e);
    }
  }

  // Default: Next.js Data Cache. Unlike a per-process Map, this is shared across
  // serverless instances and invalidated by tag (updateTag/revalidateTag), so a
  // change made on one instance is visible everywhere and cold instances don't
  // each re-query the database.
  return unstable_cache(fetchFn, [key], { tags, revalidate: revalidateSeconds })();
}

export async function invalidateCacheTag(tag: string) {
  if (redis) {
    try {
      const keys = await redis.keys(`*${tag}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      console.log(`Redis keys deleted for tag: ${tag}`);
    } catch (e) {
      console.warn("Redis delete error:", e);
    }
  }
  
  try {
    updateTag(tag);
  } catch (e) {
    // Suppress warning if updateTag is called outside of request context
  }
}
