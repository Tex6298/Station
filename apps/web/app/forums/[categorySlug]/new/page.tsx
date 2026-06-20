"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { AuthUser, CommunitySubcommunityRecord } from "@station/types";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  buildThreadCreatePayload,
  canCreateCommunityThread,
  categoryPath,
  threadCreatePath,
  threadDetailPath,
} from "@/lib/community-forum-create";
import { subcommunityBadgeLabel } from "@/lib/community-subcommunities";

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subcommunity?: CommunitySubcommunityRecord | null;
}
interface Persona { id: string; name: string; visibility?: string | null; }
interface Space { id: string; slug: string; title: string; is_public?: boolean; isPublic?: boolean; }
interface CurrentSession { access_token: string; user: AuthUser; }

const emptyForm = {
  title: "",
  body: "",
  linkedPersonaId: "",
  linkedSpaceId: "",
};

export default function NewThreadPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canPost = canCreateCommunityThread(session?.user);
  const categoryHref = categoryPath(categorySlug);
  const formReady = form.title.trim().length > 0 && form.body.trim().length > 0;

  useEffect(() => {
    if (!categorySlug) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setNotice(null);
      setFeedback(null);
      setCategory(null);
      setPersonas([]);
      setSpaces([]);

      const restored = await getSession();
      if (cancelled) return;

      const currentSession = restored ? { access_token: restored.access_token, user: restored.user } : null;
      setSession(currentSession);

      try {
        const data = await apiGet<{ category: Category; threads: unknown[] }>(
          `/forums/categories/${categorySlug}`,
          currentSession?.access_token
        );
        if (cancelled) return;
        setCategory(data.category);

        if (currentSession && canCreateCommunityThread(currentSession.user)) {
          const [personaData, spaceData] = await Promise.all([
            apiGet<{ personas: Persona[] }>("/personas", currentSession.access_token).catch(() => ({ personas: [] })),
            apiGet<{ spaces: Space[] }>("/spaces", currentSession.access_token).catch(() => ({ spaces: [] })),
          ]);
          if (cancelled) return;
          setPersonas((personaData.personas ?? []).filter((persona) => persona.visibility === "public"));
          setSpaces((spaceData.spaces ?? []).filter((space) => space.is_public !== false && space.isPublic !== false));
        }
      } catch (e) {
        if (!cancelled) {
          if (currentSession) {
            setError(e instanceof Error ? e.message : "Category not found.");
          } else {
            setNotice("Sign in to open this category or start a thread.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [categorySlug]);

  function set(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!session) {
      setError("Sign in before starting a thread.");
      return;
    }
    if (!canCreateCommunityThread(session.user)) {
      setError("Basic tier or higher is required to start threads.");
      return;
    }
    if (!category) {
      setError("Category not loaded.");
      return;
    }
    if (!formReady) {
      setError("Title and body are required.");
      return;
    }

    setSubmitting(true);
    try {
      const { thread } = await apiPost<{ thread: { id: string } }>(
        threadCreatePath(),
        buildThreadCreatePayload({ categoryId: category.id, ...form }, { personas, spaces }),
        session.access_token
      );
      setFeedback("Thread created. Opening it now.");
      router.push(threadDetailPath(categorySlug, thread.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create thread.");
      setSubmitting(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 760 }}>
      <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "1.5rem", overflowWrap: "anywhere" }}>
        <Link href="/forums" style={{ color: "#666" }}>Forums</Link>
        {" / "}
        <Link href={categoryHref} style={{ color: "#666" }}>
          {category?.title ?? categorySlug}
        </Link>
        {" / "}
        <span style={{ color: "#aaa" }}>New thread</span>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <section className="card">
          {loading ? (
            <div style={{ color: "#687078" }}>Loading category and session...</div>
          ) : (
            <>
              {category?.subcommunity && (
                <div style={pill}>
                  {subcommunityBadgeLabel(category.subcommunity)}
                </div>
              )}
              <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.5rem", lineHeight: 1.2 }}>
                Start a thread{category ? ` in ${category.title}` : ""}
              </h1>
              {category?.description && (
                <p style={{ margin: 0, color: "#687078", fontSize: "0.9rem", lineHeight: 1.55 }}>
                  {category.description}
                </p>
              )}
            </>
          )}
        </section>

        {error && (
          <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>
            {error}
          </div>
        )}
        {notice && (
          <div className="card" style={{ color: "#687078", lineHeight: 1.6 }}>
            <Link href="/login" style={{ color: "#534ab7", fontWeight: 800 }}>Sign in</Link> to open this category or start a thread.
          </div>
        )}
        {feedback && (
          <div className="card" style={{ background: "#10251a", borderColor: "#22583a", color: "#25633f" }}>
            {feedback}
          </div>
        )}

        {!loading && !error && !session && (
          <div className="card" style={{ color: "#687078", lineHeight: 1.6 }}>
            <Link href="/login" style={{ color: "#534ab7", fontWeight: 800 }}>Sign in</Link> to start a thread. Public reading stays open.
          </div>
        )}

        {!loading && session && !canPost && (
          <div className="card" style={{ color: "#687078", lineHeight: 1.6 }}>
            Basic tier or higher is required to start threads here. You can still read public discussions.
          </div>
        )}

        {!loading && category && canPost && (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Thread title"
              maxLength={300}
              style={{ fontSize: "1.1rem", fontWeight: 600, background: "transparent", border: "none", borderBottom: "1px solid #1e2535", borderRadius: 0, padding: "0.75rem 1rem", width: "100%" }}
            />

            <textarea
              className="textarea"
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Write your post..."
              style={{ minHeight: 260, fontSize: "0.95rem", lineHeight: 1.75, width: "100%" }}
            />

            {(personas.length > 0 || spaces.length > 0) && (
              <div className="card" style={{ display: "grid", gap: "0.75rem", padding: "0.9rem 1rem" }}>
                <div style={{ color: "#687078", fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Optional context
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {personas.length > 0 && (
                    <label style={{ flex: "1 1 220px", minWidth: 0, display: "grid", gap: "0.35rem" }}>
                      <select className="select" value={form.linkedPersonaId} onChange={(e) => set("linkedPersonaId", e.target.value)} style={{ width: "100%", fontSize: "0.82rem" }}>
                        <option value="">No linked persona</option>
                        {personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.name}</option>)}
                      </select>
                      <span style={{ color: "#687078", fontSize: "0.75rem", lineHeight: 1.4 }}>
                        Public persona context only. The post is still authored by you.
                      </span>
                    </label>
                  )}
                  {spaces.length > 0 && (
                    <label style={{ flex: "1 1 220px", minWidth: 0, display: "grid", gap: "0.35rem" }}>
                      <select className="select" value={form.linkedSpaceId} onChange={(e) => set("linkedSpaceId", e.target.value)} style={{ width: "100%", fontSize: "0.82rem" }}>
                        <option value="">No linked Space</option>
                        {spaces.map((space) => <option key={space.id} value={space.id}>{space.title}</option>)}
                      </select>
                      <span style={{ color: "#687078", fontSize: "0.75rem", lineHeight: 1.4 }}>
                        Public Space context only. The link does not change thread visibility.
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Link
                href={categoryHref}
                style={{ padding: "0.55rem 1.1rem", background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#687078", textDecoration: "none", fontSize: "0.875rem" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !formReady}
                style={{ padding: "0.55rem 1.25rem", background: submitting || !formReady ? "#a9a5c9" : "#534ab7", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: submitting || !formReady ? "not-allowed" : "pointer", fontSize: "0.875rem" }}
              >
                {submitting ? "Posting..." : "Post thread"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

const pill = {
  display: "inline-flex",
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: "#f8f7f4",
  color: "#534ab7",
  padding: "0.14rem 0.5rem",
  fontSize: 11,
  fontWeight: 800,
  marginBottom: "0.65rem",
};
