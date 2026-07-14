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

const forumRoutes = [
  { href: "/forums", label: "Forums home" },
  { href: "/forums/subcommunities", label: "Subcommunities" },
  { href: "/forums/witnesses", label: "My recognition" },
  { href: "/forums/reports", label: "My reports" },
] as const;

function ForumRouteLinks({ className }: { className: string }) {
  return (
    <nav className={className} aria-label="Forum routes">
      {forumRoutes.map((route) => (
        <Link key={route.href} href={route.href} aria-current={route.href === "/forums" ? "page" : undefined}>
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

export default function ForumsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ categories: Category[] }>("/forums/categories")
      .then((data) => setCategories(data.categories))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load forums."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container forum-index">
      <div className="forum-index-layout">
        <aside className="forum-index-left-rail" aria-label="Forum navigation">
          <section className="forum-index-rail-section">
            <h2>Feeds</h2>
            <ForumRouteLinks className="forum-index-route-list" />
          </section>

          {!loading && !error && categories.length > 0 && (
            <section className="forum-index-rail-section">
              <h2>Communities</h2>
              <nav className="forum-index-community-list" aria-label="Forum communities">
                {categories.map((category) => (
                  <Link key={category.id} href={`/forums/${category.slug}`}>
                    {category.title}
                  </Link>
                ))}
              </nav>
            </section>
          )}
        </aside>

        <section className="forum-index-feed" aria-labelledby="forums-heading">
          <header className="forum-index-heading">
            <p className="forum-index-eyebrow">Community</p>
            <h1 id="forums-heading">Forums</h1>
            <p>Community discussion for the Station subculture.</p>

            <details className="forum-index-mobile-navigation">
              <summary>Forum routes</summary>
              <ForumRouteLinks className="forum-index-mobile-route-list" />
            </details>
          </header>

          {loading && (
            <div className="forum-index-state" role="status" aria-live="polite">
              Loading forums...
            </div>
          )}

          {error && (
            <div className="forum-index-state forum-index-error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="forum-index-state">No forum categories yet.</div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="forum-category-grid">
              {categories.map((category) => (
                <Link
                  className="forum-category-link"
                  key={category.id}
                  href={`/forums/${category.slug}`}
                >
                  <article className="forum-category-card">
                    <div className="forum-category-marker" aria-hidden="true">
                      <span />
                    </div>
                    <div className="forum-category-copy">
                      <div className="forum-category-title">{category.title}</div>
                      {category.subcommunity && (
                        <div className="forum-category-badge">
                          {subcommunityBadgeLabel(category.subcommunity)}
                        </div>
                      )}
                      {category.description && (
                        <div className="forum-category-description">
                          {forumCategoryDescriptionCopy(category.description)}
                        </div>
                      )}
                    </div>
                    <div className="forum-category-entry">
                      {forumCategoryEntryLabel({ subcommunity: category.subcommunity })}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="forum-index-context" aria-label="Forum context">
          <section>
            <h2>How this works</h2>
            <p>
              Each category opens its current discussions. Subcommunity labels appear only when the category
              response includes them.
            </p>
          </section>
          <section>
            <h2>Your community tools</h2>
            <p>
              Recognition and report status keep their existing sign-in and tier checks on their own routes.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
