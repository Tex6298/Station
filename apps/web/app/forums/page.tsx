"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CommunitySubcommunityRecord } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { subcommunityBadgeLabel } from "@/lib/community-subcommunities";
import { forumCategoryDescriptionCopy, forumCategoryEntryLabel } from "@/lib/forum-copy";

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  subcommunity?: CommunitySubcommunityRecord | null;
}

export default function ForumsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ categories: Category[] }>("/forums/categories")
      .then((d) => setCategories(d.categories))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load forums."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem" }}>Forums</h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.875rem" }}>
            Community discussion for the Station subculture.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/forums/witnesses"
            style={{ padding: "0.45rem 0.75rem", border: "1px solid #d8d3c8", borderRadius: 7, color: "#1f2529", textDecoration: "none", fontSize: "0.8rem", background: "#fff" }}
          >
            My recognition
          </Link>
          <Link
            href="/forums/subcommunities"
            style={{ padding: "0.45rem 0.75rem", border: "1px solid #d8d3c8", borderRadius: 7, color: "#1f2529", textDecoration: "none", fontSize: "0.8rem", background: "#fff" }}
          >
            Subcommunities
          </Link>
          <Link
            href="/forums/reports"
            style={{ padding: "0.45rem 0.75rem", border: "1px solid #d8d3c8", borderRadius: 7, color: "#1f2529", textDecoration: "none", fontSize: "0.8rem", background: "#fff" }}
          >
            My reports
          </Link>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading...</div>
      )}
      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error}</div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "#687078" }}>
          No forum categories yet.
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="forum-category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/forums/${cat.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article className="card forum-category-card">
                <div className="forum-category-marker" aria-hidden="true">
                  <span />
                </div>
                <div className="forum-category-copy">
                  <div className="forum-category-title">{cat.title}</div>
                  {cat.subcommunity && (
                    <div className="forum-category-badge">
                      {subcommunityBadgeLabel(cat.subcommunity)}
                    </div>
                  )}
                  {cat.description && (
                    <div className="forum-category-description">{forumCategoryDescriptionCopy(cat.description)}</div>
                  )}
                </div>
                <div className="forum-category-entry">
                  {forumCategoryEntryLabel({ subcommunity: cat.subcommunity })}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
