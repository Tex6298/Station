"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface Author { username: string; display_name: string | null; }
interface CommunityProfile { trustLevel: number; reputationScore: number; }
interface Thread {
  id: string;
  title: string;
  body: string;
  status: string;
  visibility?: string;
  is_pinned?: boolean;
  linked_document_id?: string | null;
  score: number;
  viewer_vote?: number;
  vote_count?: number;
  hot_score?: number;
  last_activity_at?: string;
  author_community_profile?: CommunityProfile | null;
  comment_count: number;
  created_at: string;
  author_user_id: string;
  author: Author | null;
}
interface Category { id: string; slug: string; title: string; description: string | null; }
const PARTICIPATION_TIERS = new Set(["private", "creator", "canon", "institutional"]);

export default function ForumCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory]   = useState<Category | null>(null);
  const [threads, setThreads]     = useState<Thread[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [canPost, setCanPost]     = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [token, setToken]         = useState<string | undefined>();
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const [sort, setSort]           = useState("active");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    if (!categorySlug) return;

    getSession().then(async (session) => {
      const accessToken = session?.access_token;
      setToken(accessToken);
      setIsSignedIn(Boolean(session));
      setViewerUserId(session?.user.id ?? null);
      const params = new URLSearchParams({ sort });
      if (search.trim()) params.set("search", search.trim());
      const data = await apiGet<{ category: Category; threads: Thread[] }>(
        `/forums/categories/${categorySlug}?${params.toString()}`,
        accessToken
      );
      setCategory(data.category);
      setThreads(data.threads);
      setCanPost(Boolean(session && PARTICIPATION_TIERS.has(session.user.tier)));
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Category not found.");
    }).finally(() => setLoading(false));
  }, [categorySlug, sort, search]);

  async function vote(threadId: string, value: -1 | 1) {
    if (!token) return;
    setError(null);
    try {
      const response = await apiPost<{ thread: { id: string; score: number; vote_count?: number; hot_score?: number } }>(
        `/threads/${threadId}/vote`,
        { value },
        token
      );
      setThreads((current) => current.map((thread) => thread.id === threadId
        ? { ...thread, score: response.thread.score, vote_count: response.thread.vote_count, hot_score: response.thread.hot_score, viewer_vote: value }
        : thread));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not vote on thread.");
    }
  }

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div></main>;
  if (error || !category) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Not found."}</div></main>;

  return (
    <main className="container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.78rem", color: "#8b8f92", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#687078" }}>Forums</Link>
        {" / "}
        <span style={{ color: "#534ab7" }}>{category.title}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.6rem" }}>{category.title}</h1>
          {category.description && (
            <p style={{ margin: 0, color: "#687078", fontSize: "0.875rem" }}>{category.description}</p>
          )}
        </div>
        {canPost && (
          <Link href={`/forums/${categorySlug}/new`} className="button primary" style={{ textDecoration: "none", fontSize: "0.8rem" }}>
            + New thread
          </Link>
        )}
        {isSignedIn && !canPost && (
          <div style={{ color: "#687078", fontSize: "0.78rem", maxWidth: 260 }}>
            Basic tier or higher is required to start threads. Public reading stays open.
          </div>
        )}
      </div>

      <div className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem", padding: "0.75rem 1rem" }}>
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search this category"
          style={{ flex: "1 1 220px", minWidth: 0 }}
        />
        <select className="input" value={sort} onChange={(event) => setSort(event.target.value)} style={{ width: 150 }}>
          <option value="active">Active</option>
          <option value="hot">Hot</option>
          <option value="new">Newest</option>
        </select>
      </div>

      {/* Thread list */}
      {threads.length === 0 ? (
        <div className="card" style={{ color: "#687078", fontStyle: "italic", textAlign: "center", padding: "3rem" }}>
          No threads yet. Be the first to post!
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {threads.map((t) => (
            <Link key={t.id} href={`/forums/${categorySlug}/${t.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ cursor: "pointer" }}>
                <div style={{ display: "grid", gap: "0.55rem", minWidth: 0 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                      {t.is_pinned && <span style={{ fontSize: "0.68rem", color: "#854f0b" }}>Pinned</span>}
                      {t.linked_document_id && <span style={{ fontSize: "0.68rem", color: "#25633f" }}>Document discussion</span>}
                      {t.visibility && t.visibility !== "public" && <span style={{ fontSize: "0.68rem", color: "#687078" }}>{t.visibility}</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.975rem", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.title}
                    </div>
                    <div style={{ color: "#687078", fontSize: "0.82rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {t.body}
                    </div>
                  </div>
                  <div style={{ display: "flex", width: "100%", minWidth: 0, justifyContent: "flex-start", gap: "0.45rem 0.65rem", flexWrap: "wrap", textAlign: "left", color: "#687078" }}>
                    <div style={{ fontSize: "0.85rem", color: "#1f2529", fontWeight: 700 }}>{t.score} votes</div>
                    <div style={{ fontSize: "0.75rem", color: "#687078" }}>{t.comment_count} replies</div>
                    <div style={{ fontSize: "0.7rem", color: "#8b8f92" }}>
                      {new Date(t.last_activity_at ?? t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                {t.author && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.72rem", color: "#687078", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span>by {t.author.display_name ?? t.author.username}</span>
                    <span>trust {t.author_community_profile?.trustLevel ?? 0}</span>
                    {token && viewerUserId !== t.author_user_id && (
                      <span style={{ display: "inline-flex", gap: 4 }}>
                        <button type="button" onClick={(event) => { event.preventDefault(); vote(t.id, 1); }} style={voteButton(t.viewer_vote === 1)}>Up</button>
                        <button type="button" onClick={(event) => { event.preventDefault(); vote(t.id, -1); }} style={voteButton(t.viewer_vote === -1)}>Down</button>
                      </span>
                    )}
                    {token && viewerUserId === t.author_user_id && (
                      <span style={{ color: "#8b8f92" }}>Own post</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function voteButton(active: boolean) {
  return {
    border: "1px solid #d8d3c8",
    borderRadius: 6,
    background: active ? "#1f2529" : "#fff",
    color: active ? "#fff" : "#687078",
    fontSize: "0.68rem",
    padding: "0.1rem 0.35rem",
    cursor: "pointer",
  };
}
