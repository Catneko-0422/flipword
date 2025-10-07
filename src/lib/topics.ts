import type { Topic, TopicsDocument } from "@/lib/types";
import { seedTopics } from "@/data/topics";
import { isKvEnabled } from "@/lib/env";
import { revalidatePath } from "next/cache";

type KvClient = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
};

const KV_KEY = "topics-document";

declare global {
  var __topicsCache__: TopicsDocument | undefined;
  var __topicsKvClient__: KvClient | null | undefined;
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

async function getKvClient(): Promise<KvClient | null> {
  if (globalThis.__topicsKvClient__ !== undefined) {
    return globalThis.__topicsKvClient__;
  }
  if (!isKvEnabled()) {
    globalThis.__topicsKvClient__ = null;
    return null;
  }
  const mod = await import("@vercel/kv");
  globalThis.__topicsKvClient__ = mod.kv;
  return mod.kv;
}

async function readFromKv(): Promise<TopicsDocument | null> {
  const kv = await getKvClient();
  if (!kv) return null;
  const doc = await kv.get<TopicsDocument>(KV_KEY);
  return doc ?? null;
}

async function writeToKv(doc: TopicsDocument): Promise<void> {
  const kv = await getKvClient();
  if (!kv) return;
  await kv.set(KV_KEY, doc);
}

function cloneDoc(doc: TopicsDocument): TopicsDocument {
  return {
    topics: doc.topics.map((topic) => ({
      ...topic,
      words: topic.words.map((word) => ({ ...word })),
    })),
  };
}

export async function loadTopicsDocument(): Promise<TopicsDocument> {
  const kvDoc = await readFromKv();
  if (kvDoc) {
    setMemoryStore(kvDoc);
    return cloneDoc(kvDoc);
  }
  const mem = getMemoryStore();
  return cloneDoc(mem);
}

export async function saveTopicsDocument(doc: TopicsDocument): Promise<void> {
  const snapshot = cloneDoc(doc);
  setMemoryStore(snapshot);
  await writeToKv(snapshot);
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