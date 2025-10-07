import type { Topic, TopicsDocument } from "@/lib/types";
import { seedTopics } from "@/data/topics";
import { getRedisClient } from "@/lib/redis";
import { revalidatePath } from "next/cache";

const REDIS_KEY = "flipword:topics-document";

declare global {
  // eslint-disable-next-line no-var
  var __topicsCache__: TopicsDocument | undefined;
}

function getMemoryStore(): TopicsDocument {
  if (!globalThis.__topicsCache__) {
    globalThis.__topicsCache__ = seedTopics;
  }
  return globalThis.__topicsCache__;
}

function setMemoryStore(doc: TopicsDocument) {
  globalThis.__topicsCache__ = doc;
}

function cloneDoc(doc: TopicsDocument): TopicsDocument {
  return {
    topics: doc.topics.map((topic) => ({
      ...topic,
      words: topic.words.map((word) => ({ ...word })),
    })),
  };
}

async function readFromRedis(): Promise<TopicsDocument | null> {
  const client = await getRedisClient();
  if (!client) return null;

  try {
    const raw = await client.get(REDIS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TopicsDocument;
    if (!parsed || !Array.isArray(parsed.topics)) {
      throw new Error("Invalid topics payload in Redis");
    }
    return parsed;
  } catch (error) {
    console.error("[topics] Failed to read from Redis:", error);
    return null;
  }
}

async function writeToRedis(doc: TopicsDocument): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.set(REDIS_KEY, JSON.stringify(doc));
  } catch (error) {
    console.error("[topics] Failed to write to Redis:", error);
  }
}

export async function loadTopicsDocument(): Promise<TopicsDocument> {
  const redisDoc = await readFromRedis();
  if (redisDoc) {
    setMemoryStore(redisDoc);
    return cloneDoc(redisDoc);
  }
  const mem = getMemoryStore();
  try {
    await writeToRedis(mem);
  } catch (error) {
    console.error("[topics] Failed to seed Redis with initial data:", error);
  }
  return cloneDoc(mem);
}

export async function saveTopicsDocument(doc: TopicsDocument): Promise<void> {
  const snapshot = cloneDoc(doc);
  setMemoryStore(snapshot);
  await writeToRedis(snapshot);
}

export async function listTopics(): Promise<Topic[]> {
  const doc = await loadTopicsDocument();
  return doc.topics;
}

export async function findSeedTopic(slug: string): Promise<Topic | null> {
  const doc = seedTopics;
  return doc.topics.find((topic) => topic.slug === slug) ?? null;
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const doc = await loadTopicsDocument();
  return doc.topics.find((topic) => topic.slug === slug) ?? null;
}

export async function upsertTopic(nextTopic: Topic): Promise<void> {
  const doc = await loadTopicsDocument();
  const index = doc.topics.findIndex((topic) => topic.slug === nextTopic.slug);
  if (index === -1) {
    doc.topics.push(nextTopic);
  } else {
    doc.topics[index] = nextTopic;
  }
  await saveTopicsDocument(doc);
  await triggerRevalidate(nextTopic.slug);
}

export async function deleteTopic(slug: string): Promise<void> {
  const doc = await loadTopicsDocument();
  const nextTopics = doc.topics.filter((topic) => topic.slug !== slug);
  doc.topics = nextTopics;
  await saveTopicsDocument(doc);
  await triggerRevalidate(slug);
}

export async function replaceDocument(doc: TopicsDocument): Promise<void> {
  await saveTopicsDocument(doc);
  await triggerRevalidate();
}

async function triggerRevalidate(slug?: string): Promise<void> {
  await revalidatePath("/");
  if (slug) {
    await revalidatePath(`/${slug}`);
  }
}