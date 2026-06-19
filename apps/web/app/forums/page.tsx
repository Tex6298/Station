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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem" }}>Forums</h1>
          <p style={{ margin: 0, color: "#687078", fontSize: "0.875rem" }}>
            Community discussion for the Station subculture.
          </p>
        </div>
        <Link
          href="/forums/reports"
          style={{ padding: "0.45rem 0.75rem", border: "1px solid #d8d3c8", borderRadius: 7, color: "#1f2529", textDecoration: "none", fontSize: "0.8rem", background: "#fff" }}
        >
          My reports
        </Link>
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
                  background: "#f8f7f4", border: "1px solid #d8d3c8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem",
                }} aria-hidden="true">
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: "999px",
                    background: "#534ab7",
                    boxShadow: "0 0 0 4px rgba(83, 74, 183, 0.12)",
                  }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.2rem" }}>{cat.title}</div>
                  {cat.description && (
                    <div style={{ color: "#687078", fontSize: "0.85rem" }}>{cat.description}</div>
                  )}
                </div>
                <div style={{ marginLeft: "auto", color: "#687078", fontSize: "0.75rem", paddingTop: "0.15rem", whiteSpace: "nowrap" }}>
                  View
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
