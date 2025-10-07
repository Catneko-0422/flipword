import Link from "next/link";
import { notFound } from "next/navigation";
import "../globals.css";
import TopicClient from "@/components/TopicClient";
import { getTopicBySlug, listTopics } from "@/lib/topics";

type Params = { topic: string };

export async function generateStaticParams() {
 const topics = await listTopics();
 return topics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const topic = await getTopicBySlug(params.topic);
  return { title: topic ? `${topic.title} - English Flip` : "Not Found" };
}

export default async function TopicPage({ params }: { params: Params }) {
 const topics = await listTopics();
 const topic = topics.find((t) => t.slug === params.topic);
 if (!topic) {
   notFound();
 }

 return (
   <main className="container">
     <div className="row" style={{ justifyContent: "space-between" }}>
       <h1>{topic.title}</h1>
       <Link href="/" className="btn">← 回首頁</Link>
     </div>
     <div style={{ marginTop: 16 }}>
       <TopicClient slug={params.topic} initial={topics} />
     </div>
   </main>
 );
}
