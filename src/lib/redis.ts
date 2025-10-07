import Redis from "ioredis";
import { getRedisUrl } from "@/lib/env";

declare global {
  var __redisClient__: Redis | null | undefined;
}

async function connectRedis(url: string): Promise<Redis | null> {
  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    client.disconnect();
    console.error("[redis] Connection failed:", error);
    return null;
  }
}

export async function getRedisClient(): Promise<Redis | null> {
  if (typeof globalThis.__redisClient__ !== "undefined") {
    return globalThis.__redisClient__;
  }

  const url = getRedisUrl();
  if (!url) {
    globalThis.__redisClient__ = null;
    return null;
  }

  const client = await connectRedis(url);
  globalThis.__redisClient__ = client;
  return client;
}

export function resetRedisClient(): void {
  if (globalThis.__redisClient__) {
    globalThis.__redisClient__.disconnect();
  }
  globalThis.__redisClient__ = undefined;
}