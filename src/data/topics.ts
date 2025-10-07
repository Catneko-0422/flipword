import type { Topic, TopicsDocument, Word } from "@/lib/types";
import raw from "./topics.json";

export type { Topic, TopicsDocument };
export type Vocab = Word;

const document = raw as TopicsDocument;

export const seedTopics: TopicsDocument = document;

export const TOPICS: Topic[] = seedTopics.topics;

export const DEFAULT_TOPIC_SLUG = TOPICS[0]?.slug ?? "default-topic";

export function findSeedTopic(slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}
