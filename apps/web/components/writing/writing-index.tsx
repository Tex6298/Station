"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

type WritingItem = {
  id: string;
  type: string;
  title: string;
  excerpt: string | null;
  href: string;
  meta: string | null;
  author: { display_name?: string | null; username?: string | null } | null;
  createdAt: string;
};

type FeedResponse = {
  items: WritingItem[];
};

type WritingTab = "Latest" | "Featured" | "Staff picks";
type WritingFilter = "All" | "Essay" | "Codex" | "Manifesto" | "Research" | "Field Log" | "Theory";

const tabs: WritingTab[] = ["Latest", "Featured", "Staff picks"];
const filters: WritingFilter[] = ["All", "Essay", "Codex", "Manifesto", "Research", "Field Log", "Theory"];

export function WritingIndex() {
  const [items, setItems] = useState<WritingItem[]>([]);
  const [activeTab, setActiveTab] = useState<WritingTab>("Latest");
  const [activeFilter, setActiveFilter] = useState<WritingFilter>("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "Staff picks") {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    const feedTab = activeTab === "Featured" ? "featured" : "new";
    setLoading(true);
    setError(null);
    apiGet<FeedResponse>(`/discover/feed?tab=${feedTab}&limit=48`)
      .then((data) => {
        setItems(data.items.filter((item) => item.type === "document"));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load writing."))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const itemType = normalizeDocumentType(item.meta);
      if (activeFilter !== "All" && itemType !== activeFilter) return false;

      if (!normalizedQuery) return true;
      const author = item.author?.display_name ?? item.author?.username ?? "";
      return [
        item.title,
        item.excerpt ?? "",
        item.meta ?? "",
        author,
      ].some((part) => part.toLowerCase().includes(normalizedQuery));
    });
  }, [activeFilter, items, query]);

  const featured = useMemo(() => visibleItems.slice(0, 2), [visibleItems]);
  const emptyMessage = emptyStateFor(activeTab, activeFilter, query);

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Station Library
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(34px, 6vw, 56px)", lineHeight: 1.03 }}>
              Writing
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Essays, codexes, research notes, field logs, and theory from the Station community.
            </p>
          </div>
          <Link href="/studio/publish" style={primaryLink}>Write</Link>
        </header>

        <section style={panel}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {tabs.map((tab) => {
              const active = tab === activeTab;
              return (
              <button
                key={tab}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveFilter("All");
                  setQuery("");
                }}
                style={{
                  ...tabButton,
                  borderColor: active ? "#2563eb" : "#334155",
                  background: active ? "#13233d" : "#0d1420",
                }}
              >
                {tab}
              </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
            {filters.map((filter) => {
              const active = filter === activeFilter;
              return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveFilter(filter)}
                style={{
                  ...pillButton,
                  borderColor: active ? "#2563eb" : "#334155",
                  background: active ? "#12305f" : "#111827",
                }}
              >
                {filter}
              </button>
              );
            })}
          </div>
          <input
            placeholder="Search essays, codexes, research..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={input}
          />
        </section>

        {loading ? (
          <section style={{ ...panel, marginTop: 20, color: "#a9b0bd" }}>Loading published writing...</section>
        ) : error ? (
          <section style={{ ...panel, marginTop: 20, color: "#fca5a5" }}>{error}</section>
        ) : visibleItems.length === 0 ? (
          <section style={{ ...panel, marginTop: 20 }}>
            <h2 style={{ margin: "0 0 8px", color: "#f8fafc", fontSize: 18 }}>{emptyMessage.title}</h2>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 14, lineHeight: 1.6 }}>
              {emptyMessage.body}
            </p>
          </section>
        ) : (
          <>
            {activeTab === "Latest" && (
            <section style={{ marginTop: 20 }}>
              <SectionTitle title="Featured" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                {featured.map((item) => <WritingCard key={item.id} item={item} featured />)}
              </div>
            </section>
            )}

            <section style={{ marginTop: 24 }}>
              <SectionTitle title={activeTab} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
                {visibleItems.map((item) => <WritingCard key={item.id} item={item} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 style={{ margin: "0 0 12px", color: "#f8fafc", fontSize: 18 }}>{title}</h2>;
}

function WritingCard({ item, featured = false }: { item: WritingItem; featured?: boolean }) {
  const author = item.author?.display_name ?? item.author?.username ?? "Station";
  const date = formatDate(item.createdAt);
  const itemType = item.meta ?? "Writing";

  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <article style={{ ...card, minHeight: featured ? 230 : 210 }}>
        <div style={thumb}>
          <span style={{ color: "#f8fafc", fontWeight: 900, fontSize: featured ? 24 : 18 }}>{itemType.slice(0, 1).toUpperCase()}</span>
        </div>
        <div style={{ padding: 14, display: "grid", gap: 8 }}>
          <span style={{ color: "#fca5a5", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{itemType}</span>
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: featured ? 18 : 15, lineHeight: 1.3 }}>{item.title}</h3>
          <p style={{ margin: 0, color: "#a9b0bd", fontSize: 13, lineHeight: 1.55 }}>{item.excerpt ?? "No excerpt available."}</p>
          <span style={{ color: "#7d8796", fontSize: 12 }}>{author} - {date}</span>
        </div>
      </article>
    </Link>
  );
}

function normalizeDocumentType(value: string | null): WritingFilter {
  const normalized = (value ?? "").toLowerCase().replace(/[_-]+/g, " ");
  if (normalized.includes("essay")) return "Essay";
  if (normalized.includes("codex")) return "Codex";
  if (normalized.includes("manifesto")) return "Manifesto";
  if (normalized.includes("research")) return "Research";
  if (normalized.includes("field") || normalized.includes("log")) return "Field Log";
  if (normalized.includes("theory")) return "Theory";
  return "All";
}

function emptyStateFor(activeTab: WritingTab, activeFilter: WritingFilter, query: string) {
  if (activeTab === "Staff picks") {
    return {
      title: "No staff picks yet",
      body: "Curated public writing will appear here after Station staff review it.",
    };
  }

  if (query.trim() || activeFilter !== "All") {
    return {
      title: "No matching writing",
      body: "Try another search term or switch the selected writing type.",
    };
  }

  if (activeTab === "Featured") {
    return {
      title: "No featured writing yet",
      body: "Featured public documents will appear here after they are curated.",
    };
  }

  return {
    title: "No public writing yet",
    body: "Published public documents will appear here when they are available.",
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
};

const card = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  overflow: "hidden",
};

const thumb = {
  height: 72,
  background: "linear-gradient(135deg, #7f1d1d, #0f766e)",
  display: "grid",
  placeItems: "center",
};

const primaryLink = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const tabButton = {
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#dbeafe",
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const pillButton = {
  border: "1px solid #334155",
  borderRadius: 999,
  color: "#cbd5e1",
  padding: "6px 11px",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};

const input = {
  width: "100%",
  border: "1px solid #334155",
  borderRadius: 8,
  background: "#0d1420",
  color: "#f8fafc",
  padding: "11px 12px",
  fontSize: 13,
};
