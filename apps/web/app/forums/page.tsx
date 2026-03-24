"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
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
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ margin: "0 0 0.25rem" }}>Forums</h1>
        <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
          Community discussion for the Station subculture.
        </p>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#555" }}>Loading…</div>
      )}
      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#eb5757" }}>{error}</div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "#555" }}>
          No forum categories yet.
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/forums/${cat.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div className="card" style={{ cursor: "pointer", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: "#1a1535", border: "1px solid #2a2050",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem",
                }}>
                  💬
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.2rem" }}>{cat.title}</div>
                  {cat.description && (
                    <div style={{ color: "#666", fontSize: "0.85rem" }}>{cat.description}</div>
                  )}
                </div>
                <div style={{ marginLeft: "auto", color: "#555", fontSize: "0.75rem", paddingTop: "0.15rem", whiteSpace: "nowrap" }}>
                  View →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
