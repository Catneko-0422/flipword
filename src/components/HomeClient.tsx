"use client";

import TopicCard from "@/components/TopicCard";
import type { Topic } from "@/data/topics";

export default function HomeClient({ initial }: { initial: Topic[] }) {
 return (
   <div className="grid">
     {initial.map((topic) => (
       <TopicCard key={topic.slug} topic={topic} />
     ))}
   </div>
 );
}
