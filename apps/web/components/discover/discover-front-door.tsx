"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AuthUser } from "@station/types";
import { apiGet, apiUrl } from "@/lib/api-client";
import { restoreSession } from "@/lib/auth";
import {
  DISCOVER_FEED_FILTERS,
  discoverFeedFilterCounts,
  discoverFeedFilterEmptyCopy,
  discoverFeedFilterStatusCopy,
  discoverPublicSpaceHighlights,
  filterDiscoverFeedItems,
  normalizeDiscoverFeedItems,
  type DiscoverFeedFilter,
  type DiscoverFeedItem as FeedItem,
} from "@/lib/discover-feed-controls";
import {
  discoverRouletteStatusCopy,
  type DiscoverRouletteStatus,
} from "@/lib/discover-roulette";
import {
  PUBLIC_SEARCH_GROUPS,
  publicSearchResultLabels,
  routeablePublicSearchItems,
} from "@/components/discover/search-dropdown";
import { discoverDiscussionCue } from "@/lib/public-story-polish";

interface Persona { id: string; name: string; visibility: string; provider: string; }
interface RecentPost { id: string; title: string; type: string; href: string; date: string; }
interface Stats { members: number; personas: number; posts: number; threads: number; }

interface SidebarData {
  recentPosts: RecentPost[];
  personas: Persona[];
  stats: Stats;
}

interface PublicPersonaRouletteCard {
  name: string;
  shortDescription?: string | null;
  avatarUrl?: string | null;
  publicSlug: string;
  href: string;
  publicChat?: {
    enabled: boolean;
    mode: "signed_in_alpha" | "anonymous_alpha";
  };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ author, size = 28 }: { author: FeedItem["author"]; size?: number }) {
  const label = author?.display_name ?? author?.username ?? "?";
  const initials = label.slice(0, 2).toUpperCase();
  if (author?.avatar_url) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundImage: cssUrl(author.avatar_url),
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "#2a2050", border: "1px solid #3a3070",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35 + "px", fontWeight: 700, color: "#a89af7",
    }}>
      {initials}
    </div>
  );
}

function cssUrl(value: string) {
  return `url(${JSON.stringify(value)})`;
}

const TYPE_COLOURS: Record<string, string> = {
  document: "#1e3a5f", thread: "#1a2e1a", developer_space: "#082f49",
  space: "#173b30", persona: "#2a2050",
  essay: "#2a1a3a", codex: "#24311a", manifesto: "#3a1a1a", field_log: "#332c10",
  research: "#0f2f3a", archive_note: "#2e2733", transcript: "#1f2937",
};
const TYPE_TEXT: Record<string, string> = {
  document: "#60a5fa", thread: "#4ade80", developer_space: "#67e8f9",
  space: "#86efac", persona: "#c4b5fd",
  essay: "#c084fc", codex: "#bef264", manifesto: "#f87171", field_log: "#facc15",
  research: "#22d3ee", archive_note: "#d8b4fe", transcript: "#cbd5e1",
};
const PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

function FeedCard({ item }: { item: FeedItem }) {
  const typeLabel = item.type === "developer_space"
    ? "Developer Space"
    : item.type === "thread" ? "Forum"
    : item.type === "space" ? "Space"
    : item.type === "persona" ? "Persona"
    : (item.meta ?? "Post");
  const colourKey = item.meta && TYPE_COLOURS[item.meta] ? item.meta : item.type;
  const bg = TYPE_COLOURS[colourKey] ?? TYPE_COLOURS.document;
  const col = TYPE_TEXT[colourKey] ?? TYPE_TEXT.document;
  const discussionCue = discoverDiscussionCue({ type: item.type, discussionThreadId: item.discussionThreadId });
  const spaceCue = item.type === "space" ? "Open public Space" : null;

  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <article className="discover-public-card">
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.68rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: bg, color: col, border: `1px solid ${col}44` }}>
            {typeLabel}
          </span>
          {item.space && item.type !== "space" && <span style={{ fontSize: "0.68rem", color: "var(--public-home-muted)" }}>in {item.space.title}</span>}
          {item.provenanceType && (
            <span style={{ fontSize: "0.68rem", color: "#7dd3fc" }}>
              {PROVENANCE_LABELS[item.provenanceType] ?? item.provenanceType}
            </span>
          )}
          {item.discussionThreadId && (
            <span style={{ fontSize: "0.68rem", color: "#86efac" }}>
              Discussion open
            </span>
          )}
          {item.developerSpace && (
            <span style={{ fontSize: "0.68rem", color: "#67e8f9" }}>
              {item.developerSpace.nodeCount} nodes / {item.developerSpace.eventCount} signals
            </span>
          )}
          {item.promoted && (
            <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 999, background: "#2a1a00", border: "1px solid #7d5a00", color: "#f59e0b" }}>
              Featured
            </span>
          )}
          <span style={{ fontSize: "0.68rem", color: "var(--public-home-faint)", marginLeft: "auto" }}>{timeAgo(item.createdAt)}</span>
        </div>

        <div style={{ fontWeight: 650, fontSize: "0.975rem", marginBottom: "0.35rem", lineHeight: 1.35, color: "var(--public-home-text)" }}>
          {item.title}
        </div>

        {item.excerpt && (
          <div style={{ fontSize: "0.83rem", color: "var(--public-home-muted)", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.excerpt}
          </div>
        )}

        {item.developerSpace?.latestEventLabel || item.developerSpace?.latestEventType ? (
          <div style={{ marginTop: "0.6rem", padding: "0.55rem 0.65rem", borderRadius: 7, background: "var(--public-home-soft)", border: "1px solid var(--public-home-border)", color: "var(--public-home-muted)", fontSize: "0.78rem", lineHeight: 1.45 }}>
            <strong style={{ color: "var(--public-home-text)" }}>{item.developerSpace.latestEventLabel ?? item.developerSpace.latestEventType}</strong>
            {item.developerSpace.latestEventSummary ? <span> / {item.developerSpace.latestEventSummary}</span> : null}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.65rem" }}>
          {item.author && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Avatar author={item.author} size={20} />
              <span style={{ fontSize: "0.75rem", color: "var(--public-home-muted)" }}>
                {item.author.display_name ?? item.author.username}
              </span>
            </div>
          )}
          {item.persona && <span style={{ fontSize: "0.72rem", color: "#a89af7" }}>via {item.persona.name}</span>}
          {item.sourceLabel && <span style={{ fontSize: "0.72rem", color: "var(--public-home-muted)" }}>{item.sourceLabel}</span>}
          {discussionCue && (
            <span style={{ fontSize: "0.72rem", color: "#86efac", marginLeft: item.author || item.persona || item.sourceLabel ? "auto" : 0 }}>
              {discussionCue}
            </span>
          )}
          {spaceCue && (
            <span style={{ fontSize: "0.72rem", color: "#86efac", marginLeft: item.author || item.persona || item.sourceLabel || discussionCue ? "auto" : 0 }}>
              {spaceCue}
            </span>
          )}
          {item.type === "developer_space" && item.developerSpace ? (
            <span style={{ fontSize: "0.72rem", color: "var(--public-home-muted)", marginLeft: "auto" }}>
              {item.developerSpace.visualisationType.replace("_", " ")}
            </span>
          ) : !discussionCue && !spaceCue && item.replyCount > 0 && <span style={{ fontSize: "0.72rem", color: "var(--public-home-muted)", marginLeft: "auto" }}>Replies {item.replyCount}</span>}
        </div>
      </article>
    </Link>
  );
}

type SidebarUser = AuthUser & { email: string; isAdmin?: boolean };

function Sidebar({ sidebar, user, loading, roulette, rouletteStatus, onRouletteShuffle }: {
  sidebar: SidebarData | null;
  user: SidebarUser | null;
  loading: boolean;
  roulette: PublicPersonaRouletteCard[];
  rouletteStatus: DiscoverRouletteStatus;
  onRouletteShuffle: () => void;
}) {
  if (loading) {
    return (
      <aside className="discover-public-sidebar">
        <div className="discover-public-sidebar-panel">
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--public-home-soft)", marginBottom: "0.75rem" }} />
          <div style={{ height: 14, background: "var(--public-home-soft)", borderRadius: 4, marginBottom: "0.4rem" }} />
          <div style={{ height: 10, background: "var(--public-home-soft)", borderRadius: 4, width: "60%" }} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="discover-public-sidebar">
      {user ? (
        <div className="discover-public-sidebar-panel">
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.85rem" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "#7c6af7", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user.email.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--public-home-text)" }}>
                {user.email}
              </div>
              <div style={{ fontSize: "0.68rem", marginTop: "0.25rem", color: "var(--public-home-accent)", textTransform: "capitalize" }}>
                {user.tier}
              </div>
            </div>
          </div>
          <div className="discover-public-side-link-grid">
            {[["Studio", "/studio"], ["My Space", "/space"], ["Forums", "/forums"], ["Settings", "/settings"]].map(([label, href]) => (
              <Link key={href} href={href} className="discover-public-side-link">
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="discover-public-sidebar-panel" style={{ textAlign: "center" }}>
          <div className="public-home-eyebrow" style={{ marginBottom: "0.5rem" }}>Continuity first</div>
          <div style={{ fontWeight: 650, fontSize: "0.9rem", marginBottom: "0.3rem" }}>Join Station</div>
          <div style={{ fontSize: "0.78rem", color: "var(--public-home-muted)", lineHeight: 1.6, marginBottom: "0.85rem" }}>
            A home for AI persona practitioners, researchers, and the communities around them.
          </div>
          <div style={{ display: "grid", gap: "0.4rem" }}>
            <Link href="/signup" className="public-home-primary" style={{ fontSize: "0.82rem" }}>Create account</Link>
            <Link href="/login" className="public-home-secondary" style={{ fontSize: "0.82rem" }}>Sign in</Link>
          </div>
        </div>
      )}

      <div className="discover-public-sidebar-panel">
        <div className="section-label">Persona roulette</div>
        {rouletteStatus === "loading" ? (
          <div className="public-home-search-status">{discoverRouletteStatusCopy(rouletteStatus)}</div>
        ) : rouletteStatus === "ready" && roulette.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {roulette.map((persona) => (
              <Link key={persona.href} href={persona.href} style={{ textDecoration: "none" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--public-home-text)", lineHeight: 1.35 }}>
                  {persona.name}
                </div>
                {persona.shortDescription && (
                  <div style={{ fontSize: "0.72rem", color: "var(--public-home-muted)", marginTop: "0.15rem", lineHeight: 1.45 }}>
                    {persona.shortDescription.slice(0, 88)}
                  </div>
                )}
              </Link>
            ))}
            <button
              type="button"
              className="public-home-secondary"
              style={{ fontSize: "0.82rem", width: "100%", cursor: "pointer" }}
              onClick={onRouletteShuffle}
            >
              Shuffle
            </button>
            <Link href="/discover/roulette" className="public-home-primary" style={{ fontSize: "0.82rem", textAlign: "center" }}>
              Start encounter
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div className="public-home-search-status">{discoverRouletteStatusCopy(rouletteStatus)}</div>
            {rouletteStatus === "unavailable" && (
              <button
                type="button"
                className="public-home-secondary"
                style={{ fontSize: "0.82rem", width: "100%", cursor: "pointer" }}
                onClick={onRouletteShuffle}
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {sidebar?.personas && sidebar.personas.length > 0 && (
        <div className="discover-public-sidebar-panel">
          <div className="section-label">Your personas</div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            {sidebar.personas.map((p) => (
              <Link key={p.id} href={`/studio/personas/${p.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", padding: "0.3rem 0.4rem", borderRadius: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.visibility === "public" ? "#4ade80" : "#7c6af7" }} />
                <span style={{ fontSize: "0.82rem", color: "var(--public-home-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebar?.recentPosts && sidebar.recentPosts.length > 0 && (
        <div className="discover-public-sidebar-panel">
          <div className="section-label">Recent activity</div>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {sidebar.recentPosts.slice(0, 5).map((post) => (
              <Link key={post.id} href={post.href} style={{ textDecoration: "none" }}>
                <div style={{ fontSize: "0.82rem", color: "var(--public-home-text)", lineHeight: 1.35 }}>{post.title}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--public-home-muted)", marginTop: "0.1rem" }}>{post.type} / {timeAgo(post.date)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebar?.stats && (
        <div className="discover-public-sidebar-panel">
          <div className="section-label">Station</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[
              ["Members", sidebar.stats.members],
              ["Personas", sidebar.stats.personas],
              ["Posts", sidebar.stats.posts],
              ["Threads", sidebar.stats.threads],
            ].map(([label, count]) => (
              <div key={label as string} className="discover-public-stat">
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--public-home-accent)" }}>{(count as number).toLocaleString()}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--public-home-muted)" }}>{label as string}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

const TABS = ["new", "rising", "featured"] as const;
type Tab = typeof TABS[number];
const TAB_LABELS: Record<Tab, string> = { new: "Latest", rising: "Rising", featured: "Staff picks" };
const ROULETTE_TIMEOUT_MS = 7000;

export default function DiscoverFrontDoor() {
  const [tab, setTab] = useState<Tab>("new");
  const [activeFilter, setActiveFilter] = useState<DiscoverFeedFilter>("all");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const [sidebar, setSidebar] = useState<SidebarData | null>(null);
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [sideLoading, setSideLoading] = useState(true);
  const [roulette, setRoulette] = useState<PublicPersonaRouletteCard[]>([]);
  const [rouletteStatus, setRouletteStatus] = useState<DiscoverRouletteStatus>("loading");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const loadRoulette = useCallback(async (seed = new Date().toISOString()) => {
    setRouletteStatus("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ROULETTE_TIMEOUT_MS);
    try {
      const response = await fetch(
        apiUrl(`/personas/public/roulette?limit=3&seed=${encodeURIComponent(seed)}`),
        { cache: "no-store", signal: controller.signal }
      );
      if (!response.ok) throw new Error("Persona roulette unavailable.");
      const data = await response.json() as { personas?: PublicPersonaRouletteCard[] };
      const personas = data.personas ?? [];
      setRoulette(personas);
      setRouletteStatus(personas.length > 0 ? "ready" : "empty");
    } catch {
      setRoulette([]);
      setRouletteStatus("unavailable");
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    setFeedLoading(true);
    apiGet<{ items: unknown[] }>(`/discover/feed?tab=${tab}&limit=30`, token ?? undefined)
      .then((d) => setItems(normalizeDiscoverFeedItems(d.items ?? [])))
      .catch(() => setItems([]))
      .finally(() => setFeedLoading(false));
  }, [tab, token]);

  useEffect(() => {
    restoreSession().then(async (session) => {
      const token = session?.access_token;
      setToken(token ?? null);
      setUser(session?.user ?? null);

      apiGet<SidebarData>("/discover/sidebar", token)
        .then(setSidebar)
        .catch(() => setSidebar(null))
        .finally(() => setSideLoading(false));

      if (!token) setSideLoading(false);
    });
  }, []);

  useEffect(() => {
    void loadRoulette();
  }, [loadRoulette]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiGet<any>(`/discover/search?q=${encodeURIComponent(search)}`, token ?? undefined);
        setSearchResults(data);
      } catch { setSearchResults(null); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timeout);
  }, [search, token]);

  const visibleItems = useMemo(
    () => filterDiscoverFeedItems(items, activeFilter),
    [activeFilter, items]
  );
  const filterCounts = useMemo(() => discoverFeedFilterCounts(items), [items]);
  const filterStatus = discoverFeedFilterStatusCopy(activeFilter, visibleItems.length, items.length);
  const publicSpaceHighlights = useMemo(
    () => discoverPublicSpaceHighlights(items),
    [items]
  );

  return (
    <div className="discover-public">
      <div className="discover-public-layout">
      <main className="discover-public-main">
        <section className="discover-public-hero">
          <div className="public-home-eyebrow">Discover</div>
          <h1>A living archive for AI personas, worlds, research, and the people building them.</h1>
          <p>
            Start with public work, live project observatories, or community discussion. Station keeps authorship, provenance, and visibility labels close to each item so visitors can understand what they are reading before they go deeper.
          </p>
          <div className="public-home-actions">
            <Link className="public-home-primary" href="#discover-feed">Read the public feed</Link>
            <Link className="public-home-secondary" href="/developer-spaces">Watch live projects</Link>
            <Link className="public-home-secondary" href="/forums">Read forums</Link>
          </div>
          <div className="discover-public-surfaces">
            <Link href="#discover-feed">
              <strong>Read public work</strong>
              <span>The feed below opens public Space pages, published documents, discussions, and project updates.</span>
            </Link>
            <Link href="/developer-spaces">
              <strong>Watch live projects</strong>
              <span>Developer Space observatories show public nodes, signals, snapshots, and project notes.</span>
            </Link>
            <Link href="/forums">
              <strong>Join the conversation</strong>
              <span>Forum threads and public Salons carry discussion, questions, and community context around public work.</span>
            </Link>
            <Link href={user ? "/studio" : "/signup"}>
              <strong>{user ? "Continue in Studio" : "Create your Studio"}</strong>
              <span>{user ? "Return to private personas, archive trust states, and continuity work." : "Sign up when you are ready to build private personas and publish selectively."}</span>
            </Link>
          </div>
        </section>

        <section className="discover-public-search" aria-label="Search Station">
          <label className="visually-hidden" htmlFor="station-search">Search Station</label>
          <div className="discover-public-search-box">
            <span aria-hidden="true">Search</span>
            <input
              id="station-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                user
                  ? "Search public and community-visible Station - personas, projects, Salons, Spaces, publications, forums"
                  : "Search public Station - personas, projects, Salons, Spaces, publications, forums"
              }
            />
            {search && <button type="button" onClick={() => setSearch("")}>Clear</button>}
          </div>
        </section>
        <p className="discover-public-helper">
          {user
            ? "Signed-in search may include community-visible results. Private Studio archive, memory, canon, import, and continuity stay out."
            : "Public search returns routeable personas, projects, Salons, Spaces, publications, and forum threads."}
        </p>

        {search.trim() && (
          <div className="discover-public-search-results">
            {searching && <div className="public-home-search-status">Searching...</div>}
            {!searching && searchResults && (
              <div style={{ display: "grid", gap: "1rem" }}>
                {PUBLIC_SEARCH_GROUPS.map(([key, label]) => {
                  const results = routeablePublicSearchItems(key, searchResults);
                  if (!results.length) return null;
                  return (
                    <div key={key}>
                      <div className="section-label">{label}</div>
                      <div className="public-home-search-group">
                        {results.map(({ result: r, href }) => {
                          const title = r.name ?? r.title ?? r.projectName;
                          const labels = publicSearchResultLabels(key, r);
                          return (
                            <Link key={href} href={href} onClick={() => setSearch("")}>
                              <span className="public-home-search-title">{title}</span>
                              {labels.length > 0 ? (
                                <span className="public-home-search-readback">{labels.join(" / ")}</span>
                              ) : null}
                              {(r.short_description || r.description || r.summary || r.body) && (
                                <span style={{ color: "#7f8aa0", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                                  - {(r.short_description ?? r.description ?? r.summary ?? r.body ?? "").slice(0, 60)}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!PUBLIC_SEARCH_GROUPS.some(([key]) => routeablePublicSearchItems(key, searchResults).length > 0) && (
                  <div className="public-home-search-status">
                    No {user ? "public or community-visible" : "public"} results for &quot;{search}&quot;.
                    Try a persona, project, Salon, Space, publication, or forum topic.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!search.trim() && (
          <>
            <div id="discover-feed" className="discover-public-feed-tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setActiveFilter("all");
                  }}
                  style={{
                    padding: "0.4rem 0.9rem", background: tab === t ? "#fff" : "transparent", border: "1px solid",
                    borderColor: tab === t ? "var(--public-home-text)" : "var(--public-home-border)",
                    color: tab === t ? "var(--public-home-text)" : "var(--public-home-muted)", cursor: "pointer",
                    fontSize: "0.875rem", fontWeight: tab === t ? 650 : 400,
                    borderRadius: 8,
                  }}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
              <div className="discover-public-feed-links">
                <Link href="/forums">Forums</Link>
                <Link href="#discover-feed">Public feed</Link>
              </div>
            </div>

            {activeFilter === "all" && publicSpaceHighlights.length > 0 && (
              <section style={{ margin: "0 0 1rem" }} aria-label="Public Spaces">
                <div className="section-label">Public Spaces</div>
                <div className="discover-public-feed-list">
                  {publicSpaceHighlights.map((item) => <FeedCard key={`space-highlight-${item.id}`} item={item} />)}
                </div>
              </section>
            )}

            <div className="discover-public-feed-controls" aria-label="Filter public feed">
              <div className="discover-public-filter-row">
                {DISCOVER_FEED_FILTERS.map((filter) => {
                  const active = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      aria-pressed={active}
                      className="discover-public-filter-button"
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      <span>{filter.label}</span>
                      <small>{filterCounts[filter.id]}</small>
                    </button>
                  );
                })}
              </div>
              <div className="discover-public-filter-status">{filterStatus}</div>
            </div>

            {feedLoading ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="discover-public-card" style={{ height: 110, animation: "pulse 1.5s infinite" }} />)}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="public-home-empty">
                {tab === "featured" && activeFilter === "all" ? "No staff picks yet. Station staff will feature standout public content here." : discoverFeedFilterEmptyCopy(activeFilter)}
                {(tab !== "featured" || activeFilter !== "all") && (
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                    {activeFilter !== "all" && (
                      <button type="button" className="public-home-secondary" style={{ cursor: "pointer" }} onClick={() => setActiveFilter("all")}>
                        Show all
                      </button>
                    )}
                    {tab !== "featured" && <Link href={user ? "/studio/new" : "/signup"} className="public-home-primary">{user ? "Kindle a persona" : "Create an account"}</Link>}
                    <Link href="/forums" className="public-home-secondary">Browse forums</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="discover-public-feed-list">
                {visibleItems.map((item) => <FeedCard key={item.type + item.id} item={item} />)}
              </div>
            )}
          </>
        )}
      </main>
      <Sidebar
        sidebar={sidebar}
        user={user}
        loading={sideLoading}
        roulette={roulette}
        rouletteStatus={rouletteStatus}
        onRouletteShuffle={() => void loadRoulette(`${Date.now()}`)}
      />
      </div>
    </div>
  );
}
