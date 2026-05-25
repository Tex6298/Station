"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface FeedItem {
  id: string;
  type: "document" | "thread";
  title: string;
  excerpt: string | null;
  href: string;
  meta: string | null;
  space: { slug: string; title: string } | null;
  author: { username: string; display_name: string | null; avatar_url: string | null } | null;
  persona: { id: string; name: string } | null;
  score: number;
  replyCount: number;
  createdAt: string;
  promoted: boolean;
}

interface Persona { id: string; name: string; visibility: string; provider: string; }
interface RecentPost { id: string; title: string; type: string; href: string; date: string; }
interface Stats { members: number; personas: number; posts: number; threads: number; }

interface SidebarData {
  recentPosts: RecentPost[];
  personas: Persona[];
  stats: Stats;
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
    return <img src={author.avatar_url} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
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

const TYPE_COLOURS: Record<string, string> = {
  document: "#1e3a5f", thread: "#1a2e1a",
  post: "#1e3a5f", essay: "#2a1a3a", manifesto: "#3a1a1a",
};
const TYPE_TEXT: Record<string, string> = {
  document: "#60a5fa", thread: "#4ade80",
  post: "#60a5fa", essay: "#c084fc", manifesto: "#f87171",
};

function FeedCard({ item }: { item: FeedItem }) {
  const typeLabel = item.type === "thread" ? "Forum" : (item.meta ?? "Post");
  const bg = TYPE_COLOURS[item.meta ?? item.type] ?? TYPE_COLOURS.document;
  const col = TYPE_TEXT[item.meta ?? item.type] ?? TYPE_TEXT.document;

  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <article className="card" style={{ cursor: "pointer", padding: "1rem 1.1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.68rem", padding: "0.1rem 0.45rem", borderRadius: 999, background: bg, color: col, border: `1px solid ${col}44` }}>
            {typeLabel}
          </span>
          {item.space && <span style={{ fontSize: "0.68rem", color: "#68738a" }}>in {item.space.title}</span>}
          {item.promoted && (
            <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: 999, background: "#2a1a00", border: "1px solid #7d5a00", color: "#f59e0b" }}>
              Featured
            </span>
          )}
          <span style={{ fontSize: "0.68rem", color: "#596377", marginLeft: "auto" }}>{timeAgo(item.createdAt)}</span>
        </div>

        <div style={{ fontWeight: 650, fontSize: "0.975rem", marginBottom: "0.35rem", lineHeight: 1.35 }}>
          {item.title}
        </div>

        {item.excerpt && (
          <div style={{ fontSize: "0.83rem", color: "#8b96aa", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.excerpt}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.65rem" }}>
          {item.author && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Avatar author={item.author} size={20} />
              <span style={{ fontSize: "0.75rem", color: "#7f8aa0" }}>
                {item.author.display_name ?? item.author.username}
              </span>
            </div>
          )}
          {item.persona && <span style={{ fontSize: "0.72rem", color: "#a89af7" }}>via {item.persona.name}</span>}
          {item.replyCount > 0 && <span style={{ fontSize: "0.72rem", color: "#68738a", marginLeft: "auto" }}>Replies {item.replyCount}</span>}
        </div>
      </article>
    </Link>
  );
}

function Sidebar({ sidebar, profile, loading }: {
  sidebar: SidebarData | null;
  profile: { display_name: string | null; username: string; tier: string; avatar_url: string | null } | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <aside style={{ width: 260, flexShrink: 0 }}>
        <div className="card" style={{ padding: "1.25rem", marginBottom: "0.75rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1a1f2e", marginBottom: "0.75rem" }} />
          <div style={{ height: 14, background: "#1a1f2e", borderRadius: 4, marginBottom: "0.4rem" }} />
          <div style={{ height: 10, background: "#1a1f2e", borderRadius: 4, width: "60%" }} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="discover-sidebar" style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {profile ? (
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.85rem" }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "#7c6af7", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "#fff", flexShrink: 0,
              }}>
                {(profile.display_name ?? profile.username).slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.display_name ?? profile.username}
              </div>
              <div className="pill" style={{ fontSize: "0.68rem", marginTop: "0.25rem", color: "#c4b5fd", textTransform: "capitalize" }}>
                {profile.tier}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            {[["Studio", "/studio"], ["My Space", "/space"], ["Forums", "/forums"], ["Settings", "/settings"]].map(([label, href]) => (
              <Link key={href} href={href} style={{
                fontSize: "0.78rem", padding: "0.35rem 0.5rem", borderRadius: 7,
                background: "#0f1220", border: "1px solid #1e2535",
                textDecoration: "none", color: "#adb7cc", textAlign: "center",
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
          <div className="kicker" style={{ justifyContent: "center", marginBottom: "0.5rem" }}>Continuity first</div>
          <div style={{ fontWeight: 650, fontSize: "0.9rem", marginBottom: "0.3rem" }}>Join Station</div>
          <div style={{ fontSize: "0.78rem", color: "#8b96aa", lineHeight: 1.6, marginBottom: "0.85rem" }}>
            A home for AI persona practitioners, researchers, and the communities around them.
          </div>
          <div style={{ display: "grid", gap: "0.4rem" }}>
            <Link href="/signup" className="button primary" style={{ fontSize: "0.82rem" }}>Create account</Link>
            <Link href="/login" className="button" style={{ fontSize: "0.82rem" }}>Sign in</Link>
          </div>
        </div>
      )}

      {sidebar?.personas && sidebar.personas.length > 0 && (
        <div className="card" style={{ padding: "1rem" }}>
          <div className="section-label">Your personas</div>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            {sidebar.personas.map((p) => (
              <Link key={p.id} href={`/studio/personas/${p.id}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", padding: "0.3rem 0.4rem", borderRadius: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.visibility === "public" ? "#4ade80" : "#7c6af7" }} />
                <span style={{ fontSize: "0.82rem", color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebar?.recentPosts && sidebar.recentPosts.length > 0 && (
        <div className="card" style={{ padding: "1rem" }}>
          <div className="section-label">Recent activity</div>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {sidebar.recentPosts.slice(0, 5).map((post) => (
              <Link key={post.id} href={post.href} style={{ textDecoration: "none" }}>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.35 }}>{post.title}</div>
                <div style={{ fontSize: "0.68rem", color: "#68738a", marginTop: "0.1rem" }}>{post.type} / {timeAgo(post.date)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {sidebar?.stats && (
        <div className="card" style={{ padding: "1rem" }}>
          <div className="section-label">Station</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[
              ["Members", sidebar.stats.members],
              ["Personas", sidebar.stats.personas],
              ["Posts", sidebar.stats.posts],
              ["Threads", sidebar.stats.threads],
            ].map(([label, count]) => (
              <div key={label as string} style={{ background: "#0f1220", borderRadius: 7, padding: "0.5rem 0.6rem", border: "1px solid #1e2535" }}>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#c4b9ff" }}>{(count as number).toLocaleString()}</div>
                <div style={{ fontSize: "0.68rem", color: "#7f8aa0" }}>{label as string}</div>
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
const TAB_LABELS: Record<Tab, string> = { new: "New", rising: "Rising", featured: "Featured" };

export default function DiscoverFrontDoor() {
  const [tab, setTab] = useState<Tab>("new");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const [sidebar, setSidebar] = useState<SidebarData | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; username: string; tier: string; avatar_url: string | null } | null>(null);
  const [sideLoading, setSideLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setFeedLoading(true);
    apiGet<{ items: FeedItem[] }>(`/discover/feed?tab=${tab}&limit=30`)
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setFeedLoading(false));
  }, [tab]);

  useEffect(() => {
    getSession().then(async (session) => {
      const token = session?.access_token;

      apiGet<SidebarData>("/discover/sidebar", token)
        .then(setSidebar)
        .catch(() => setSidebar(null))
        .finally(() => setSideLoading(false));

      if (token) {
        apiGet<{ profile: typeof profile }>("/auth/me", token)
          .then((d) => setProfile(d.profile ?? null))
          .catch(() => setProfile(null));
      } else {
        setSideLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return; }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiGet<any>(`/discover/search?q=${encodeURIComponent(search)}`);
        setSearchResults(data);
      } catch { setSearchResults(null); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="discover-layout">
      <Sidebar sidebar={sidebar} profile={profile} loading={sideLoading} />

      <main style={{ flex: 1, minWidth: 0 }}>
        <section className="hero-card" style={{ marginBottom: "1rem" }}>
          <div className="kicker" style={{ marginBottom: "0.7rem" }}>Discover</div>
          <h1 style={{ margin: 0, maxWidth: 760 }}>A living archive for AI personas, worlds, research, and the people building them.</h1>
          <p style={{ color: "#b7c1d6", lineHeight: 1.7, maxWidth: 760, margin: "0.8rem 0 0" }}>
            Read new documents, follow live Developer Spaces, find public personas, and watch the culture of Station take shape without losing the thread of where anything came from.
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1.1rem" }}>
            <Link className="button primary" href="/space">Explore Spaces</Link>
            <Link className="button" href="/developer-spaces">Live observatories</Link>
            <Link className="button" href="/forums">Forums</Link>
          </div>
          <div className="discover-surface-grid">
            <Link href="/space">
              <strong>Authored Spaces</strong>
              <span>Personal microsites, public works, personas, and archive previews.</span>
            </Link>
            <Link href="/developer-spaces">
              <strong>Developer Spaces</strong>
              <span>Live observatories for project state, events, nodes, and snapshots.</span>
            </Link>
          </div>
        </section>

        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <label className="visually-hidden" htmlFor="station-search">Search Station</label>
          <input
            id="station-search"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Station - personas, posts, threads, spaces"
            style={{ width: "100%", paddingLeft: "2.25rem", fontSize: "0.875rem" }}
          />
          <span style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "#68738a", pointerEvents: "none" }}>
            Find
          </span>
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8b96aa", cursor: "pointer", fontSize: "0.9rem" }}>
              Clear
            </button>
          )}
        </div>

        {search.trim() && (
          <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
            {searching && <div style={{ color: "#8b96aa", fontSize: "0.85rem" }}>Searching...</div>}
            {!searching && searchResults && (
              <div style={{ display: "grid", gap: "1rem" }}>
                {(["personas", "spaces", "documents", "threads"] as const).map((key) => {
                  const results = searchResults[key] ?? [];
                  if (!results.length) return null;
                  const label = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key}>
                      <div className="section-label">{label}</div>
                      <div style={{ display: "grid", gap: "0.3rem" }}>
                        {results.map((r: any) => {
                          const href = key === "personas" ? `/studio/personas/${r.id}`
                            : key === "spaces" ? `/space/${r.slug}`
                            : key === "documents" ? (r.space ? `/space/${r.space.slug}/documents/${r.id}` : `/documents/${r.id}`)
                            : r.category ? `/forums/${r.category.slug}/${r.id}` : `/forums`;
                          return (
                            <Link key={r.id} href={href} onClick={() => setSearch("")} style={{ textDecoration: "none", display: "block", padding: "0.3rem 0.5rem", borderRadius: 6, fontSize: "0.85rem", color: "#cbd5e1" }}>
                              {r.name ?? r.title}
                              {key === "spaces" && r.presentation && (
                                <span style={{ color: "#a7f3d0", fontSize: "0.72rem", marginLeft: "0.45rem", textTransform: "capitalize" }}>
                                  {r.presentation.theme} / {r.presentation.layout}
                                </span>
                              )}
                              {(r.short_description || r.body) && (
                                <span style={{ color: "#7f8aa0", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                                  - {(r.short_description ?? r.body ?? "").slice(0, 60)}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!["personas", "spaces", "documents", "threads"].some((k) => (searchResults[k] ?? []).length > 0) && (
                  <div style={{ color: "#8b96aa", fontSize: "0.85rem" }}>No results for "{search}".</div>
                )}
              </div>
            )}
          </div>
        )}

        {!search.trim() && (
          <>
            <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem", borderBottom: "1px solid #1e2535", paddingBottom: "0.1rem" }}>
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "0.4rem 0.9rem", background: "none", border: "none",
                    borderBottom: tab === t ? "2px solid #7c6af7" : "2px solid transparent",
                    color: tab === t ? "#c4b9ff" : "#7f8aa0", cursor: "pointer",
                    fontSize: "0.875rem", fontWeight: tab === t ? 650 : 400,
                    marginBottom: "-1px",
                  }}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.7rem", alignItems: "center" }}>
                <Link href="/forums" style={{ fontSize: "0.75rem", color: "#7f8aa0", textDecoration: "none" }}>Forums</Link>
                <Link href="/space" style={{ fontSize: "0.75rem", color: "#7f8aa0", textDecoration: "none" }}>Spaces</Link>
              </div>
            </div>

            {feedLoading ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card" style={{ height: 110, background: "#0d111a", animation: "pulse 1.5s infinite" }} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "#8b96aa" }}>
                {tab === "featured" ? "No featured work yet. Station staff will feature standout content here." : "Nothing here yet - be the first to post."}
                {tab !== "featured" && (
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    <Link href="/studio/new" className="button primary">Kindle a persona</Link>
                    <Link href="/forums" className="button">Browse forums</Link>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {items.map((item) => <FeedCard key={item.type + item.id} item={item} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
