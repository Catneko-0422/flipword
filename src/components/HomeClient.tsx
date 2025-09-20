// src/components/HomeClient.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import TopicCard from "@/components/TopicCard";
import type { Topic } from "@/data/topics";

const LS_KEY = "topicsOverride";

export default function HomeClient({ initial }: { initial: Topic[] }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [edit, setEdit] = useState(false);
  const [topics, setTopics] = useState<Topic[]>(initial);

  // 讀取 localStorage 覆蓋
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const data: Topic[] = JSON.parse(saved);
        setTopics(data);
      } catch {}
    }
  }, []);

  function onLogin() {
    setIsAdmin(true);
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(topics));
    alert("已儲存到瀏覽器（localStorage）");
  }

  function reset() {
    if (!confirm("要清除自訂資料並還原預設嗎？")) return;
    localStorage.removeItem(LS_KEY);
    setTopics(initial);
  }

  // 編輯 UI
  return (
    <>
      {isAdmin && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="mut">管理工具</div>
            <div className="row">
              <button className="btn" onClick={() => setEdit(v => !v)}>
                {edit ? "關閉編輯模式" : "開啟編輯模式"}
              </button>
              <button className="btn" onClick={save}>儲存</button>
              <button className="btn" onClick={reset}>還原預設</button>
            </div>
          </div>

          {edit && (
            <div style={{ marginTop: 12 }}>
              {topics.map((t, ti) => (
                <fieldset key={t.slug} className="card" style={{ marginTop: 12 }}>
                  <legend className="mut">主題 {ti + 1}</legend>
                  <div className="row">
                    <label className="mut">slug</label>
                    <input
                      value={t.slug}
                      onChange={e => {
                        const v = e.target.value;
                        setTopics(s => s.map((x, i) => i === ti ? { ...x, slug: v } : x));
                      }}
                      style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb" }}
                    />
                    <label className="mut">title</label>
                    <input
                      value={t.title}
                      onChange={e => {
                        const v = e.target.value;
                        setTopics(s => s.map((x, i) => i === ti ? { ...x, title: v } : x));
                      }}
                      style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", minWidth: 240 }}
                    />
                    <button
                      className="btn"
                      onClick={() => setTopics(s => s.filter((_, i) => i !== ti))}
                    >
                      刪除主題
                    </button>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {t.words.map((w, wi) => (
                      <div key={wi} className="card" style={{ marginTop: 8 }}>
                        <div className="row" style={{ flexWrap: "wrap" }}>
                          <label className="mut">英文</label>
                          <input
                            value={w.en}
                            onChange={e => {
                              const v = e.target.value;
                              setTopics(s => s.map((x, i) => i === ti ? {
                                ...x, words: x.words.map((y, j) => j === wi ? { ...y, en: v } : y)
                              } : x));
                            }}
                            style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", minWidth: 180 }}
                          />
                          <label className="mut">中文</label>
                          <input
                            value={w.zh}
                            onChange={e => {
                              const v = e.target.value;
                              setTopics(s => s.map((x, i) => i === ti ? {
                                ...x, words: x.words.map((y, j) => j === wi ? { ...y, zh: v } : y)
                              } : x));
                            }}
                            style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", minWidth: 180 }}
                          />
                          <label className="mut">詞性</label>
                          <input
                            value={(w as any).pos ?? ""}
                            onChange={e => {
                              const v = e.target.value;
                              setTopics(s => s.map((x, i) => i === ti ? {
                                ...x, words: x.words.map((y, j) => j === wi ? { ...y, pos: v } as any : y)
                              } : x));
                            }}
                            style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", width: 80 }}
                          />
                          <label className="mut">英文例句</label>
                          <input
                            value={(w as any).enSent ?? ""}
                            onChange={e => {
                              const v = e.target.value;
                              setTopics(s => s.map((x, i) => i === ti ? {
                                ...x, words: x.words.map((y, j) => j === wi ? { ...y, enSent: v } as any : y)
                              } : x));
                            }}
                            style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", minWidth: 300 }}
                          />
                          <label className="mut">中文例句</label>
                          <input
                            value={(w as any).zhSent ?? ""}
                            onChange={e => {
                              const v = e.target.value;
                              setTopics(s => s.map((x, i) => i === ti ? {
                                ...x, words: x.words.map((y, j) => j === wi ? { ...y, zhSent: v } as any : y)
                              } : x));
                            }}
                            style={{ padding: 8, borderRadius: 12, border: "1px solid #e5e7eb", minWidth: 300 }}
                          />
                          <button
                            className="btn"
                            onClick={() => setTopics(s => s.map((x, i) => i === ti ? {
                              ...x, words: x.words.filter((_, j) => j !== wi)
                            } : x))}
                          >
                            刪除此單字
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn"
                    style={{ marginTop: 8 }}
                    onClick={() => setTopics(s => s.map((x, i) => i === ti ? {
                      ...x,
                      words: x.words.concat([{ en: "", zh: "", pos: "", enSent: "", zhSent: "" } as any])
                    } : x))}
                  >
                    + 新增單字
                  </button>
                </fieldset>
              ))}

              <button
                className="btn"
                style={{ marginTop: 12 }}
                onClick={() => setTopics(s => s.concat([{ slug: "new-topic", title: "新主題", words: [] }]))}
              >
                + 新增主題
              </button>
            </div>
          )}
        </div>
      )}

      {/* 主題方塊列表 */}
      <div className="grid" style={{ marginTop: isAdmin ? 16 : 0 }}>
        {topics.map(t => (<TopicCard key={t.slug} topic={t} />))}
      </div>
    </>
  );
}
