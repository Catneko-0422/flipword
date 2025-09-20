// src/components/TopicClient.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import FlipDeck from "@/components/FlipDeck";
import type { Topic, Vocab } from "@/data/topics";

const LS_KEY = "topicsOverride";

export default function TopicClient({ slug, initial }: { slug: string; initial: Topic[] }) {
  const [topics, setTopics] = useState<Topic[]>(initial);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const data: Topic[] = JSON.parse(saved);
        setTopics(data);
      } catch {}
    }
  }, []);

  const topic = useMemo(() => topics.find(t => t.slug === slug), [topics, slug]);

  if (!topic) return <div className="mut">找不到主題</div>;

  return <FlipDeck words={topic.words as Vocab[]} />;
}
