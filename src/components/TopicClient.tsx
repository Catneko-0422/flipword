"use client";

import { useMemo } from "react";
import FlipDeck from "@/components/FlipDeck";
import type { Topic, Vocab } from "@/data/topics";

export default function TopicClient({
 slug,
 initial,
}: {
 slug: string;
 initial: Topic[];
}) {
 const topic = useMemo(
   () => initial.find((item) => item.slug === slug),
   [initial, slug],
 );

 if (!topic) return <div className="mut">找不到主題</div>;

 return <FlipDeck words={topic.words as Vocab[]} />;
}
