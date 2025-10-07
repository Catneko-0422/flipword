"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

type AdminLoginButtonProps = {
  authenticated?: boolean;
};

export default function AdminLoginButton({
  authenticated = false,
}: AdminLoginButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (authenticated) {
      setOpen(false);
    }
  }, [authenticated]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setMessage(null);
      requestAnimationFrame(() => {
        usernameInputRef.current?.focus();
      });
      return;
    }

    setUsername("");
    setPassword("");
    triggerRef.current?.focus();
  }, [open]);

  const isSubmitting = status === "submitting";

  if (authenticated) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response
        .json()
        .catch(() => ({ message: response.ok ? "登入成功" : "登入失敗" }));

      if (!response.ok) {
        setStatus("error");
        setMessage(
          typeof payload?.message === "string" ? payload.message : "登入失敗",
        );
        return;
      }

      setStatus("success");
      setMessage(
        typeof payload?.message === "string" ? payload.message : "登入成功",
      );
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch {
      setStatus("error");
      setMessage("登入失敗");
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="管理員登入"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          width: "14px",
          height: "14px",
          borderRadius: "9999px",
          backgroundColor: "rgba(15, 23, 42, 0.35)",
          border: "none",
          padding: 0,
          cursor: "pointer",
          opacity: 0.35,
          transition: "opacity 150ms ease, transform 150ms ease",
        }}
        onFocus={(event) => {
          event.currentTarget.style.opacity = "0.75";
        }}
        onBlur={(event) => {
          event.currentTarget.style.opacity = "0.35";
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.opacity = "0.6";
          event.currentTarget.style.transform = "scale(1.15)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.opacity = "0.35";
          event.currentTarget.style.transform = "scale(1)";
        }}
      >
        <span
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Admin Login
        </span>
      </button>

      {open ? (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            zIndex: 100,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "340px",
              backgroundColor: "white",
              borderRadius: "0.75rem",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.18)",
              padding: "1.5rem",
            }}
          >
            <h2
              id="admin-login-title"
              style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}
            >
              管理登入
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(15, 23, 42, 0.65)",
                marginTop: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              請輸入管理員帳號與密碼以管理所有主題。
            </p>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>帳號</span>
                <input
                  ref={usernameInputRef}
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                  style={{
                    fontSize: "0.95rem",
                    padding: "0.55rem 0.65rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(148, 163, 184, 0.65)",
                    outline: "none",
                    transition: "border-color 120ms ease, box-shadow 120ms ease",
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.7)";
                    event.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.2)";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.65)";
                    event.currentTarget.style.boxShadow = "none";
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>密碼</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    fontSize: "0.95rem",
                    padding: "0.55rem 0.65rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(148, 163, 184, 0.65)",
                    outline: "none",
                    transition: "border-color 120ms ease, box-shadow 120ms ease",
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.7)";
                    event.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.2)";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.65)";
                    event.currentTarget.style.boxShadow = "none";
                  }}
                />
              </label>

              {message ? (
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color:
                      status === "success"
                        ? "rgba(22, 163, 74, 0.9)"
                        : "rgba(220, 38, 38, 0.9)",
                    backgroundColor:
                      status === "success"
                        ? "rgba(220, 252, 231, 0.9)"
                        : "rgba(254, 226, 226, 0.9)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  {message}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    fontSize: "0.875rem",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(148, 163, 184, 0.5)",
                    backgroundColor: "white",
                    color: "rgba(15, 23, 42, 0.75)",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    fontSize: "0.875rem",
                    padding: "0.45rem 0.95rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    backgroundColor: "rgba(37, 99, 235, 0.92)",
                    color: "white",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.8 : 1,
                  }}
                >
                  {isSubmitting ? "登入中…" : "登入"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}