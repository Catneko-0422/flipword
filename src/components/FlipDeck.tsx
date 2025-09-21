// components/FlipDeck.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import FlipCard from "./FlipCard";
import type { Vocab } from "@/data/topics";

type Mode = "zh-en" | "en-zh"; // 可切換模式

export default function FlipDeck({ words }: { words: Vocab[] }) {
  // 讀取上次的模式偏好
  const getInitialMode = (): Mode =>
    (typeof window !== "undefined" &&
      (localStorage.getItem("flipdeck-mode") as Mode)) || "zh-en";

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<Mode>(getInitialMode);

  // 記住使用者的模式選擇
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("flipdeck-mode", mode);
    }
  }, [mode]);

  const current = useMemo(() => words[idx] ?? null, [idx, words]);
  const progress = useMemo(
    () => (words.length ? (idx + (flipped ? 1 : 0)) / words.length : 0),
    [idx, flipped, words.length]
  );

  const flip = useCallback(() => setFlipped((f) => !f), []);
  const next = useCallback(() => {
    setFlipped(false);
    setIdx((i) => Math.min(i + 1, words.length - 1));
  }, [words.length]);
  const prev = useCallback(() => {
    setFlipped(false);
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  // 切換模式（按鈕/快捷鍵用）
  const toggleMode = useCallback(
    () => setMode((m) => (m === "zh-en" ? "en-zh" : "zh-en")),
    []
  );

  // 鍵盤操作：Space 翻面、左右鍵前後、M 切換模式
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        flip();
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, next, prev, toggleMode]);

  // 切換模式時，把卡片翻回正面
  useEffect(() => {
    setFlipped(false);
  }, [mode]);

  if (!current) return <div className="mut">沒有單字</div>;

  // 這裡組字面內容：上面是單字，下面是例句
  const buildFace = (
    title: string,
    pos: string,
    sentence: string,
    lang: "zh" | "en"
  ) => (
    <div>
      <div style={{ fontSize: 14, color: "#6b7280" }}>{pos}</div>
      <div style={{ fontSize: lang === "zh" ? 36 : 32, marginTop: 4 }}>
        {title}
      </div>
      <div
        style={{
          marginTop: 12,
          lineHeight: 1.6,
          fontSize: 14,
          color: "#6b7280",
        }}
      >
        {sentence}
      </div>
    </div>
  );

  const frontNode =
    mode === "zh-en"
      ? buildFace(current.zh, current.pos, current.zhSent, "zh")
      : buildFace(current.en, current.pos, current.enSent, "en");

  const backNode =
    mode === "zh-en"
      ? buildFace(current.en, current.pos, current.enSent, "en")
      : buildFace(current.zh, current.pos, current.zhSent, "zh");

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="mut">
          第 <span className="mono">{idx + 1}</span> /{" "}
          <span className="mono">{words.length}</span> 張
        </div>
        <div className="row hint">
          <span className="kbd">Space</span> 翻面
          <span className="kbd">←</span>/<span className="kbd">→</span> 上/下一張
          <span className="kbd">M</span> 切換模式
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <FlipCard front={frontNode} back={backNode} flipped={flipped} />
      </div>

      <div style={{ marginTop: 16 }} className="progress" aria-label="進度條">
        <div
          className="bar"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>

      <div
        className="row"
        style={{ marginTop: 16, justifyContent: "space-between" }}
      >
        <button className="btn" onClick={prev} disabled={idx === 0}>
          上一張
        </button>
        <div className="row" role="group" aria-label="顯示模式">
          <button className="btn" onClick={flip} style={{ marginLeft: 8 }}>
            翻面
          </button>
        </div>
        <button
          className="btn"
          onClick={next}
          disabled={idx === words.length - 1}
        >
          下一張
        </button>
      </div>
    </div>
  );
}
