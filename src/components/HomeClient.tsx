// src/components/HomeClient.tsx
"use client";
import { useEffect, useState } from "react";
import TopicCard from "@/components/TopicCard";
import type { Topic } from "@/data/topics";

const LS_KEY = "topicsOverride";

export default function HomeClient({ initial }: { initial: Topic[] }) {
  const [topics, setTopics] = useState<Topic[]>(initial);

  // 讀取 localStorage 覆蓋
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const data: Topic[] = JSON.parse(saved);
        setTopics(data);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  return (
    <div className="grid">
      {topics.map((t) => (
        <TopicCard key={t.slug} topic={t} />
      ))}
    </div>
  );
}
