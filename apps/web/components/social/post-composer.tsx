"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface Connection { id: string; platform: string; handle: string | null; }

const PLATFORM_INFO: Record<string, { label: string; icon: string; limit: number }> = {
  bluesky:   { label: "Bluesky",   icon: "🦋", limit: 300   },
  mastodon:  { label: "Mastodon",  icon: "🐘", limit: 500   },
  tumblr:    { label: "Tumblr",    icon: "📝", limit: 4096  },
  linkedin:  { label: "LinkedIn",  icon: "💼", limit: 3000  },
  reddit:    { label: "Reddit",    icon: "🤖", limit: 40000 },
  wordpress: { label: "WordPress", icon: "🌐", limit: 0     },
  ghost:     { label: "Ghost",     icon: "👻", limit: 0     },
};

interface PostComposerProps {
  documentId?: string;
  documentTitle?: string;
  initialContent?: string;
  onClose?: () => void;
}

export function PostComposer({ documentId, documentTitle, initialContent = "", onClose }: PostComposerProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [content,     setContent]     = useState(initialContent);
  const [title,       setTitle]       = useState(documentTitle ?? "");
  const [subreddit,   setSubreddit]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);
  const [token,       setToken]       = useState<string | null>(null);

  const hasReddit   = [...selected].some((p) => p === "reddit");
  const hasLongForm = [...selected].some((p) => ["wordpress", "ghost"].includes(p));
  const shortestLimit = Math.min(
    ...[...selected]
      .map((p) => PLATFORM_INFO[p]?.limit ?? 99999)
      .filter((l) => l > 0)
  );
  const overLimit = shortestLimit < 99999 && content.length > shortestLimit;

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      setToken(session.access_token);
      const data = await apiGet<{ connections: Connection[] }>("/social/connections", session.access_token).catch(() => ({ connections: [] }));
      setConnections(data.connections ?? []);
    });
  }, []);

  function togglePlatform(platform: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(platform) ? next.delete(platform) : next.add(platform);
      return next;
    });
  }

  async function generateTeaser() {
    if (!token || !documentId) return;
    setGenerating(true);
    setError(null);
    try {
      const platform = [...selected][0] ?? "bluesky";
      const data = await apiPost<{ teaser: string }>(
        "/social/generate-teaser",
        { documentId, platform },
        token
      );
      setContent(data.teaser ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Teaser generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || selected.size === 0 || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost(
        "/social/compose",
        {
          platforms:  [...selected],
          content:    content.trim(),
          title:      title.trim() || undefined,
          documentId: documentId ?? undefined,
          subreddit:  subreddit.trim() || undefined,
        },
        token
      );
      setSuccess(true);
      setTimeout(() => { setSuccess(false); if (onClose) onClose(); }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Post failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (connections.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem", color: "#555" }}>
        No social accounts connected.{" "}
        <a href="/settings/social" style={{ color: "#7c6af7" }}>Connect accounts →</a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
        <div style={{ color: "#4ade80", fontWeight: 500 }}>Posted successfully</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      {/* Platform selector */}
      <div>
        <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
          Post to
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {connections.map((conn) => {
            const info = PLATFORM_INFO[conn.platform];
            if (!info) return null;
            const active = selected.has(conn.platform);
            return (
              <button
                key={conn.platform}
                type="button"
                onClick={() => togglePlatform(conn.platform)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.35rem",
                  padding: "0.3rem 0.7rem", borderRadius: 999, fontSize: "0.8rem",
                  border: active ? "1px solid #7c6af7" : "1px solid #1e2535",
                  background: active ? "#1a1535" : "transparent",
                  color: active ? "#c4b9ff" : "#666", cursor: "pointer",
                }}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
                {conn.handle && <span style={{ fontSize: "0.68rem", opacity: 0.6 }}>{conn.handle}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title — shown for long-form platforms or Reddit */}
      {(hasLongForm || hasReddit) && (
        <div>
          <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
            {hasReddit ? "Post title (required for Reddit)" : "Post title"}
          </div>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title…"
            style={{ fontSize: "0.9rem" }}
          />
        </div>
      )}

      {/* Subreddit override */}
      {hasReddit && (
        <div>
          <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
            Subreddit (overrides default)
          </div>
          <input
            className="input"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value.replace(/^r\//, ""))}
            placeholder="e.g. AIPersonas (leave blank to use default)"
            style={{ fontSize: "0.85rem" }}
          />
        </div>
      )}

      {/* Content */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
          <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Content
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {shortestLimit < 99999 && (
              <span style={{ fontSize: "0.72rem", color: overLimit ? "#eb5757" : "#555" }}>
                {content.length} / {shortestLimit}
              </span>
            )}
            {documentId && (
              <button
                type="button"
                onClick={generateTeaser}
                disabled={generating || selected.size === 0}
                style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem", background: "none", border: "1px solid #334155", borderRadius: 6, color: "#7c6af7", cursor: "pointer" }}
              >
                {generating ? "Generating…" : "✦ AI teaser"}
              </button>
            )}
          </div>
        </div>
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post…"
          style={{ minHeight: 120, fontSize: "0.9rem", lineHeight: 1.65, borderColor: overLimit ? "#7d2e2e" : undefined }}
        />
      </div>

      {error && (
        <div style={{ background: "#2d1515", border: "1px solid #7d2e2e", color: "#eb5757", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end" }}>
        {onClose && (
          <button type="button" onClick={onClose} style={{ padding: "0.45rem 1rem", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#aaa", cursor: "pointer", fontSize: "0.85rem" }}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || selected.size === 0 || !content.trim() || overLimit}
          style={{
            padding: "0.5rem 1.25rem", background: "#7c6af7", border: "none", borderRadius: 8,
            color: "#fff", fontWeight: 600, fontSize: "0.875rem",
            cursor: submitting || selected.size === 0 ? "not-allowed" : "pointer",
            opacity: submitting || selected.size === 0 ? 0.6 : 1,
          }}
        >
          {submitting ? "Posting…" : `Post${selected.size > 1 ? ` to ${selected.size} platforms` : ""}`}
        </button>
      </div>
    </form>
  );
}
