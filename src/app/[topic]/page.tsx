// src/app/[topic]/page.tsx
import Link from "next/link";
import { TOPICS } from "@/data/topics";
import "../globals.css";
import TopicClient from "@/components/TopicClient";

type Params = { topic: string };

export function generateStaticParams() {
  return TOPICS.map(t => ({ topic: t.slug }));
}

export function generateMetadata({ params }: { params: Params }) {
  const topic = TOPICS.find(t => t.slug === params.topic);
  return { title: topic ? `${topic.title} - English Flip` : "Not Found" };
}

export default function TopicPage({ params }: { params: Params }) {
  const topic = TOPICS.find(t => t.slug === params.topic);

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>{topic?.title ?? "主題"}</h1>
        <Link href="/" className="btn">← 回首頁</Link>
      </div>
      <div style={{ marginTop: 16 }}>
        <TopicClient slug={params.topic} initial={TOPICS} />
      </div>
    </main>
  );
}
