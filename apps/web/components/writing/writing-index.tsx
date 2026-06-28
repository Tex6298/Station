"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { type WritingFeedItem, type WritingItem, isWritingItem, normalizeWritingFeedItem, writingCardDiscussionCue } from "@/lib/writing-feed";

type FeedResponse = {
  items: WritingFeedItem[];
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
        setItems(data.items.map(normalizeWritingFeedItem).filter(isWritingItem));
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
    <main className="station-page">
      <div className="station-page-inner">
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Station Library</div>
            <h1 className="station-page-title station-page-title-large">Writing</h1>
            <p className="station-page-lede">
              Essays, codexes, research notes, field logs, and theory from the Station community.
            </p>
          </div>
          <Link href="/studio/publish" className="station-link-button">Write</Link>
        </header>

        <section style={panel}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {tabs.map((tab) => {
              const active = tab === activeTab;
              const disabled = tab === "Staff picks";
              return (
              <button
                key={tab}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                title={disabled ? "Staff picks are preview-only until curated writing is available." : undefined}
                onClick={() => {
                  if (disabled) return;
                  setActiveTab(tab);
                  setActiveFilter("All");
                  setQuery("");
                }}
                style={{
                  ...tabButton,
                  borderColor: active ? "#1f2529" : "#d8d3c8",
                  background: active ? "#1f2529" : "#fff",
                  color: active ? "#fff" : "#1f2529",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {tab}
              </button>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              maxWidth: "100%",
              overflowX: "visible",
              paddingBottom: 4,
              marginBottom: 12,
            }}
          >
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
                  borderColor: active ? "#534ab7" : "#d8d3c8",
                  background: active ? "#eeedfe" : "#fff",
                  color: active ? "#332c82" : "#1f2529",
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
          <section style={{ ...panel, marginTop: 20, color: "#687078" }}>Loading published writing...</section>
        ) : error ? (
          <section style={{ ...panel, marginTop: 20, color: "#fca5a5" }}>{error}</section>
        ) : visibleItems.length === 0 ? (
          <section style={{ ...panel, marginTop: 20 }}>
            <h2 style={{ margin: "0 0 8px", color: "#1f2529", fontSize: 18 }}>{emptyMessage.title}</h2>
            <p style={{ margin: 0, color: "#687078", fontSize: 14, lineHeight: 1.6 }}>
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
  return <h2 style={{ margin: "0 0 12px", color: "#1f2529", fontSize: 18 }}>{title}</h2>;
}

function WritingCard({ item, featured = false }: { item: WritingItem; featured?: boolean }) {
  const author = item.author?.display_name ?? item.author?.username ?? "Station";
  const date = formatDate(item.createdAt);
  const itemType = item.meta ?? "Writing";
  const discussionCue = writingCardDiscussionCue(item);

  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <article style={{ ...card, minHeight: featured ? 230 : 210 }}>
        <div style={thumb}>
          <span style={{ color: "#1f2529", fontWeight: 900, fontSize: featured ? 24 : 18 }}>{itemType.slice(0, 1).toUpperCase()}</span>
        </div>
        <div style={{ padding: 14, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: "#534ab7", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{itemType}</span>
          </div>
          <h3 style={{ margin: 0, color: "#1f2529", fontSize: featured ? 18 : 15, lineHeight: 1.3 }}>{item.title}</h3>
          <p style={{ margin: 0, color: "#687078", fontSize: 13, lineHeight: 1.55 }}>{item.excerpt ?? "No excerpt available."}</p>
          {discussionCue && <span style={discussionCueStyle}>{discussionCue}</span>}
          <span style={{ color: "#8b8f92", fontSize: 12 }}>{author} - {date}</span>
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
  border: "1px solid #d8d3c8",
  background: "#ffffff",
  borderRadius: 8,
  padding: 16,
};

const card = {
  border: "1px solid #d8d3c8",
  background: "#ffffff",
  borderRadius: 8,
  overflow: "hidden",
};

const thumb = {
  height: 72,
  background: "linear-gradient(135deg, #eeedfe, #eceae4)",
  display: "grid",
  placeItems: "center",
};

const discussionCueStyle = {
  alignSelf: "start",
  background: "#e6f6ed",
  border: "1px solid #b7e3c8",
  borderRadius: 6,
  color: "#14532d",
  padding: "7px 9px",
  fontSize: 12,
  fontWeight: 800,
  lineHeight: 1.35,
};

const tabButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  color: "#1f2529",
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const pillButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  color: "#1f2529",
  padding: "6px 11px",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};

const input = {
  width: "100%",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#ffffff",
  color: "#1f2529",
  padding: "11px 12px",
  fontSize: 13,
};
