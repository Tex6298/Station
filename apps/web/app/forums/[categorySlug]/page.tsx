"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface Author { username: string; display_name: string | null; }
interface Thread {
  id: string;
  title: string;
  body: string;
  status: string;
  visibility?: string;
  is_pinned?: boolean;
  linked_document_id?: string | null;
  score: number;
  comment_count: number;
  created_at: string;
  author_user_id: string;
  author: Author | null;
}
interface Category { id: string; slug: string; title: string; description: string | null; }

export default function ForumCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory]   = useState<Category | null>(null);
  const [threads, setThreads]     = useState<Thread[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [canPost, setCanPost]     = useState(false);

  useEffect(() => {
    if (!categorySlug) return;

    getSession().then(async (session) => {
      const data = await apiGet<{ category: Category; threads: Thread[] }>(
        `/forums/categories/${categorySlug}`,
        session?.access_token
      );
      setCategory(data.category);
      setThreads(data.threads);
      // Any authenticated user can see the post button; tier check happens on API
      if (session) setCanPost(true);
    }).catch((e) => {
      setError(e instanceof Error ? e.message : "Category not found.");
    }).finally(() => setLoading(false));
  }, [categorySlug]);

  if (loading) return <main className="container"><div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>Loading...</div></main>;
  if (error || !category) return <main className="container"><div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error ?? "Not found."}</div></main>;

  return (
    <main className="container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "1.5rem" }}>
        <Link href="/forums" style={{ color: "#666" }}>Forums</Link>
        {" / "}
        <span style={{ color: "#aaa" }}>{category.title}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.6rem" }}>{category.title}</h1>
          {category.description && (
            <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>{category.description}</p>
          )}
        </div>
        {canPost && (
          <Link href={`/forums/${categorySlug}/new`} className="button primary" style={{ textDecoration: "none", fontSize: "0.8rem" }}>
            + New thread
          </Link>
        )}
      </div>

      {/* Thread list */}
      {threads.length === 0 ? (
        <div className="card" style={{ color: "#555", fontStyle: "italic", textAlign: "center", padding: "3rem" }}>
          No threads yet. Be the first to post!
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {threads.map((t) => (
            <Link key={t.id} href={`/forums/${categorySlug}/${t.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                      {t.is_pinned && <span style={{ fontSize: "0.68rem", color: "#fbbf24" }}>Pinned</span>}
                      {t.linked_document_id && <span style={{ fontSize: "0.68rem", color: "#86efac" }}>Document discussion</span>}
                      {t.visibility && t.visibility !== "public" && <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{t.visibility}</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.975rem", marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.title}
                    </div>
                    <div style={{ color: "#666", fontSize: "0.82rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {t.body}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.75rem", color: "#555" }}>{t.comment_count} replies</div>
                    <div style={{ fontSize: "0.7rem", color: "#444", marginTop: "0.2rem" }}>
                      {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                {t.author && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.72rem", color: "#555" }}>
                    by {t.author.display_name ?? t.author.username}
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
