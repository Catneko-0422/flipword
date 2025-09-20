// components/FlipCard.tsx
"use client";
import { useEffect, useRef } from "react";

export default function FlipCard({
  front,
  back,
  flipped,
}: {
  front: React.ReactNode; // 中文
  back: React.ReactNode;  // 英文
  flipped: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 小動畫的焦點/無障礙
    cardRef.current?.setAttribute("aria-live", "polite");
  }, []);

  return (
    <div className="flip-wrap">
      <div ref={cardRef} className={`flip-card ${flipped ? "flipped" : ""}`}>
        <div className="face front">
          <div className="mut">中文</div>
          <div style={{ fontSize: 36, marginTop: 8 }}>{front}</div>
        </div>
        <div className="face back">
          <div className="mut">English</div>
          <div style={{ fontSize: 32, marginTop: 8 }}>{back}</div>
        </div>
      </div>
    </div>
  );
}
