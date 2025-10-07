"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Topic, Word } from "@/lib/types";

type AdminPanelProps = {
  initialTopics: Topic[];
};

type BannerTone = "info" | "success" | "error";

type Banner = {
  tone: BannerTone;
  message: string;
};

type WordField = "en" | "zh" | "pos" | "enSent" | "zhSent";

const WORD_LABELS: Record<WordField, string> = {
  en: "英文單字",
  zh: "中文翻譯",
  pos: "詞性",
  enSent: "英文例句",
  zhSent: "中文例句",
};

const WORD_FIELDS: WordField[] = ["en", "zh", "pos", "enSent", "zhSent"];

const generateWordId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `word-${Math.random().toString(36).slice(2, 10)}`;
};

const cloneTopic = (topic: Topic): Topic => ({
  slug: topic.slug,
  title: topic.title,
  words: topic.words.map((word) => ({ ...word })),
});

const sanitizeTopic = (topic: Topic): Topic => ({
  slug: topic.slug.trim(),
  title: topic.title.trim(),
  words: topic.words.map((word) => ({
    ...word,
    en: word.en.trim(),
    zh: word.zh.trim(),
    pos: word.pos.trim(),
    enSent: word.enSent.trim(),
    zhSent: word.zhSent.trim(),
  })),
});

const createEmptyWord = (): Word => ({
  id: generateWordId(),
  en: "",
  zh: "",
  pos: "",
  enSent: "",
  zhSent: "",
});

const createNewTopic = (): Topic => ({
  slug: `topic-${Date.now()}`,
  title: "新主題",
  words: [],
});

export default function AdminPanel({ initialTopics }: AdminPanelProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(() =>
    initialTopics.map((topic) => cloneTopic(topic)),
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialTopics[0]?.slug ?? null,
  );
  const [draft, setDraft] = useState<Topic | null>(() =>
    initialTopics[0] ? cloneTopic(initialTopics[0]) : null,
  );
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    if (!banner) return;
    const handle = window.setTimeout(() => {
      setBanner(null);
    }, 4000);
    return () => window.clearTimeout(handle);
  }, [banner]);

  const topicList = useMemo(() => {
    if (!draft || !selectedSlug) {
      return topics;
    }
    return topics.map((topic) =>
      topic.slug === selectedSlug
        ? {
            ...topic,
            slug: draft.slug,
            title: draft.title,
          }
        : topic,
    );
  }, [topics, draft, selectedSlug]);

  const showBanner = (tone: BannerTone, message: string) => {
    setBanner({ tone, message });
  };

  const handleSelectTopic = (slug: string) => {
    if (slug === selectedSlug) return;
    if (dirty) {
      const confirmed = window.confirm("尚未儲存變更，確定要切換主題嗎？");
      if (!confirmed) return;
    }
    const target = topics.find((topic) => topic.slug === slug);
    if (!target) return;
    setSelectedSlug(slug);
    setDraft(cloneTopic(target));
    setDirty(false);
  };

  const handleCreateTopic = () => {
    if (dirty) {
      const confirmed = window.confirm("尚未儲存變更，確定要新增新的主題嗎？");
      if (!confirmed) return;
    }
    const fresh = createNewTopic();
    const nextTopics = [...topics, fresh];
    setTopics(nextTopics);
    setSelectedSlug(fresh.slug);
    setDraft(cloneTopic(fresh));
    setDirty(true);
    showBanner("info", "已建立新的主題草稿，請填寫內容並儲存。");
  };

  const handleTopicFieldChange = (field: "slug" | "title", value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setDirty(true);
  };

  const handleWordFieldChange = (
    wordId: string,
    field: WordField,
    value: string,
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        words: prev.words.map((word) =>
          word.id === wordId ? { ...word, [field]: value } : word,
        ),
      };
    });
    setDirty(true);
  };

  const handleAddWord = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        words: [...prev.words, createEmptyWord()],
      };
    });
    setDirty(true);
  };

  const handleRemoveWord = (wordId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        words: prev.words.filter((word) => word.id !== wordId),
      };
    });
    setDirty(true);
  };

  const handleReload = async () => {
    if (dirty) {
      const confirmed = window.confirm("尚未儲存變更，確定要放棄並重新載入嗎？");
      if (!confirmed) return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/admin/topics", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showBanner(
          "error",
          typeof payload?.message === "string"
            ? payload.message
            : "載入主題失敗",
        );
        return;
      }
      const fetchedTopics = Array.isArray(payload?.topics)
        ? (payload.topics as Topic[])
        : [];
      const snapshot = fetchedTopics.map((topic) => cloneTopic(topic));
      setTopics(snapshot);
      const target =
        selectedSlug != null
          ? snapshot.find((topic) => topic.slug === selectedSlug) ?? null
          : snapshot[0] ?? null;
      setSelectedSlug(target ? target.slug : null);
      setDraft(target ? cloneTopic(target) : null);
      setDirty(false);
      showBanner("success", "已重新載入最新資料。");
      router.refresh();
    } catch (error) {
      showBanner(
        "error",
        error instanceof Error ? error.message : "載入主題失敗",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    const sanitized = sanitizeTopic(draft);
    if (!sanitized.slug) {
      showBanner("error", "請填寫 slug。");
      return;
    }
    if (!sanitized.title) {
      showBanner("error", "請填寫標題。");
      return;
    }
    const hasIncompleteWord = sanitized.words.some((word) =>
      WORD_FIELDS.some((field) => !word[field]),
    );
    if (hasIncompleteWord) {
      showBanner("error", "請完整填寫每個單字的所有欄位。");
      return;
    }
    setSaving(true);
    const originalSlug = selectedSlug ?? sanitized.slug;
    try {
      const response = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showBanner(
          "error",
          typeof payload?.message === "string"
            ? payload.message
            : "儲存主題失敗",
        );
        return;
      }
      const saved: Topic =
        payload?.topic && typeof payload.topic === "object"
          ? (payload.topic as Topic)
          : sanitized;
      const savedClone = cloneTopic(saved);
      setTopics((prev) => {
        if (prev.some((topic) => topic.slug === originalSlug)) {
          return prev.map((topic) =>
            topic.slug === originalSlug ? savedClone : topic,
          );
        }
        return [...prev, savedClone];
      });
      setSelectedSlug(savedClone.slug);
      setDraft(cloneTopic(savedClone));
      setDirty(false);
      showBanner("success", "已儲存主題。");
      router.refresh();
    } catch (error) {
      showBanner(
        "error",
        error instanceof Error ? error.message : "儲存主題失敗",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlug) return;
    if (
      !window.confirm(
        "確定要刪除此主題嗎？此操作將移除該主題與所有單字。",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/topics/${encodeURIComponent(selectedSlug)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        showBanner(
          "error",
          typeof payload?.message === "string"
            ? payload.message
            : "刪除主題失敗",
        );
        return;
      }
      const updatedTopics = topics.filter(
        (topic) => topic.slug !== selectedSlug,
      );
      setTopics(updatedTopics);
      const nextTopic = updatedTopics[0] ?? null;
      setSelectedSlug(nextTopic?.slug ?? null);
      setDraft(nextTopic ? cloneTopic(nextTopic) : null);
      setDirty(false);
      showBanner("success", "已刪除主題。");
      router.refresh();
    } catch (error) {
      showBanner(
        "error",
        error instanceof Error ? error.message : "刪除主題失敗",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSave();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.reload();
    }
  };

  const isSaveDisabled =
    !draft ||
    saving ||
    !draft.slug.trim() ||
    !draft.title.trim() ||
    draft.words.some((word) =>
      WORD_FIELDS.some((field) => !word[field].trim()),
    );

  return (
    <section
      style={{
        margin: "2.5rem auto",
        maxWidth: "1100px",
        width: "100%",
        backgroundColor: "rgba(15, 23, 42, 0.04)",
        borderRadius: "1rem",
        padding: "1.75rem",
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.12)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>管理介面</div>
          <div style={{ fontSize: "0.85rem", color: "rgba(15, 23, 42, 0.6)" }}>
            已登入管理員，可管理所有主題與單字。
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleReload}
            disabled={loading || saving}
            style={{
              fontSize: "0.85rem",
              padding: "0.45rem 0.9rem",
              borderRadius: "0.55rem",
              border: "1px solid rgba(59, 130, 246, 0.45)",
              backgroundColor: "white",
              color: "rgba(37, 99, 235, 0.95)",
              cursor: loading || saving ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "載入中…" : "重新載入"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              fontSize: "0.85rem",
              padding: "0.45rem 0.9rem",
              borderRadius: "0.55rem",
              border: "none",
              backgroundColor: "rgba(220, 38, 38, 0.92)",
              color: "white",
              cursor: "pointer",
            }}
          >
            登出
          </button>
        </div>
      </header>

      {banner ? (
        <div
          role="status"
          style={{
            marginBottom: "1rem",
            padding: "0.6rem 0.85rem",
            borderRadius: "0.75rem",
            fontSize: "0.9rem",
            fontWeight: 500,
            backgroundColor:
              banner.tone === "success"
                ? "rgba(220, 252, 231, 0.9)"
                : banner.tone === "error"
                  ? "rgba(254, 226, 226, 0.9)"
                  : "rgba(191, 219, 254, 0.6)",
            color:
              banner.tone === "success"
                ? "rgba(22, 163, 74, 0.9)"
                : banner.tone === "error"
                  ? "rgba(220, 38, 38, 0.9)"
                  : "rgba(37, 99, 235, 0.9)",
          }}
        >
          {banner.message}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 0.8fr) minmax(0, 1.2fr)",
          gap: "1.5rem",
        }}
      >
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            alignSelf: "start",
          }}
        >
          <button
            type="button"
            onClick={handleCreateTopic}
            style={{
              fontSize: "0.9rem",
              padding: "0.55rem 0.85rem",
              borderRadius: "0.6rem",
              border: "none",
              backgroundColor: "rgba(22, 163, 74, 0.92)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            新增主題
          </button>
          <div
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              overflow: "hidden",
            }}
          >
            {topicList.length === 0 ? (
              <div
                style={{
                  padding: "0.75rem",
                  fontSize: "0.85rem",
                  color: "rgba(100, 116, 139, 0.8)",
                }}
              >
                目前沒有主題，請建立新的主題。
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  maxHeight: "420px",
                  overflowY: "auto",
                }}
              >
                {topicList.map((topic) => (
                  <li key={topic.slug}>
                    <button
                      type="button"
                      onClick={() => handleSelectTopic(topic.slug)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        width: "100%",
                        border: "none",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
                        backgroundColor:
                          topic.slug === selectedSlug
                            ? "rgba(59, 130, 246, 0.1)"
                            : "white",
                        padding: "0.7rem 0.8rem",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: topic.slug === selectedSlug ? 600 : 500,
                          fontSize: "0.95rem",
                          color:
                            topic.slug === selectedSlug
                              ? "rgba(37, 99, 235, 0.95)"
                              : "rgba(15, 23, 42, 0.85)",
                        }}
                      >
                        {topic.title || "(未命名主題)"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "rgba(100, 116, 139, 0.85)",
                          marginTop: "0.2rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {topic.slug}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section
          style={{
            borderRadius: "0.9rem",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            backgroundColor: "white",
            padding: "1.25rem",
          }}
        >
          {draft ? (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Slug</span>
                  <input
                    type="text"
                    value={draft.slug}
                    onChange={(event) =>
                      handleTopicFieldChange("slug", event.target.value)
                    }
                    placeholder="例如：daily-life"
                    pattern="^[a-z0-9-]+$"
                    required
                    style={{
                      fontSize: "0.95rem",
                      padding: "0.55rem 0.65rem",
                      borderRadius: "0.55rem",
                      border: "1px solid rgba(148, 163, 184, 0.65)",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>標題</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(event) =>
                      handleTopicFieldChange("title", event.target.value)
                    }
                    placeholder="主題名稱"
                    required
                    style={{
                      fontSize: "0.95rem",
                      padding: "0.55rem 0.65rem",
                      borderRadius: "0.55rem",
                      border: "1px solid rgba(148, 163, 184, 0.65)",
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    單字列表（{draft.words.length}）
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddWord}
                    style={{
                      fontSize: "0.85rem",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.55rem",
                      border: "none",
                      backgroundColor: "rgba(59, 130, 246, 0.92)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    新增單字
                  </button>
                </div>

                {draft.words.length === 0 ? (
                  <div
                    style={{
                      padding: "0.8rem",
                      borderRadius: "0.65rem",
                      border: "1px dashed rgba(148, 163, 184, 0.6)",
                      fontSize: "0.85rem",
                      color: "rgba(100, 116, 139, 0.9)",
                    }}
                  >
                    尚未加入任何單字。請點擊「新增單字」建立內容。
                  </div>
                ) : (
                  draft.words.map((word, index) => (
                    <div
                      key={word.id}
                      style={{
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        borderRadius: "0.75rem",
                        padding: "0.85rem",
                        display: "grid",
                        gap: "0.65rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "rgba(15, 23, 42, 0.85)",
                          }}
                        >
                          單字 #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWord(word.id)}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.35rem 0.6rem",
                            borderRadius: "0.5rem",
                            border: "none",
                            backgroundColor: "rgba(220, 38, 38, 0.12)",
                            color: "rgba(220, 38, 38, 0.9)",
                            cursor: "pointer",
                          }}
                        >
                          移除
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "0.6rem",
                        }}
                      >
                        {WORD_FIELDS.slice(0, 3).map((field) => (
                          <label
                            key={`${word.id}-${field}`}
                            style={{ display: "grid", gap: "0.3rem" }}
                          >
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                              {WORD_LABELS[field]}
                            </span>
                            <input
                              type="text"
                              value={word[field]}
                              onChange={(event) =>
                                handleWordFieldChange(
                                  word.id,
                                  field,
                                  event.target.value,
                                )
                              }
                              required
                              style={{
                                fontSize: "0.9rem",
                                padding: "0.45rem 0.6rem",
                                borderRadius: "0.55rem",
                                border: "1px solid rgba(148, 163, 184, 0.6)",
                              }}
                            />
                          </label>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: "0.6rem",
                        }}
                      >
                        {WORD_FIELDS.slice(3).map((field) => (
                          <label
                            key={`${word.id}-${field}`}
                            style={{ display: "grid", gap: "0.3rem" }}
                          >
                            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                              {WORD_LABELS[field]}
                            </span>
                            <textarea
                              value={word[field]}
                              onChange={(event) =>
                                handleWordFieldChange(
                                  word.id,
                                  field,
                                  event.target.value,
                                )
                              }
                              rows={3}
                              required
                              style={{
                                fontSize: "0.9rem",
                                padding: "0.5rem 0.6rem",
                                borderRadius: "0.55rem",
                                border: "1px solid rgba(148, 163, 184, 0.6)",
                                resize: "vertical",
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: dirty
                      ? "rgba(234, 88, 12, 0.9)"
                      : "rgba(100, 116, 139, 0.9)",
                  }}
                >
                  {dirty ? "有尚未儲存的變更" : "所有變更已儲存"}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || !selectedSlug}
                    style={{
                      fontSize: "0.85rem",
                      padding: "0.45rem 0.85rem",
                      borderRadius: "0.55rem",
                      border: "none",
                      backgroundColor: "rgba(220, 38, 38, 0.18)",
                      color: "rgba(220, 38, 38, 0.9)",
                      cursor:
                        deleting || !selectedSlug ? "not-allowed" : "pointer",
                    }}
                  >
                    {deleting ? "刪除中…" : "刪除此主題"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaveDisabled}
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.6rem",
                      border: "none",
                      backgroundColor: isSaveDisabled
                        ? "rgba(148, 163, 184, 0.55)"
                        : "rgba(37, 99, 235, 0.95)",
                      color: "white",
                      fontWeight: 600,
                      cursor: isSaveDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "儲存中…" : "儲存主題"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div
              style={{
                fontSize: "0.9rem",
                color: "rgba(100, 116, 139, 0.9)",
              }}
            >
              請從左側選擇主題或新增新主題開始編輯。
            </div>
          )}
        </section>
      </div>
    </section>
  );
}