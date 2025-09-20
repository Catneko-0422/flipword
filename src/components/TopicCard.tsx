// components/TopicCard.tsx
"use client";
import Link from "next/link";
import type { Topic } from "@/data/topics";

export default function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link href={`/${topic.slug}`} className="card" aria-label={`進入 ${topic.title}`}>
      <h2>{topic.title}</h2>
      <div className="mut">{topic.words.length} 個單字</div>
      <div className="hint" style={{ marginTop: 8 }}>點擊進入翻頁練習</div>
    </Link>
  );
}
