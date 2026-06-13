"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { AuthUser } from "@station/types";
import { apiGet } from "@/lib/api-client";
import { restoreSession } from "@/lib/auth";
import { SearchResultsDropdown } from "@/components/discover/search-dropdown";
import { type FeedItem, timeAgo } from "@/components/discover/feed-shared";
import { useStationSearch } from "@/lib/use-station-search";

type HomeUser = AuthUser & { email: string; isAdmin?: boolean };

const SURFACES = [
  {
    href: "/developer-spaces",
    label: "Developer Spaces",
    copy: "Public observatories for live projects, signals, snapshots, and field notes.",
  },
  {
    href: "/discover",
    label: "Publications",
    copy: "Published documents and public Space updates with provenance nearby.",
  },
  {
    href: "/forums",
    label: "Community",
    copy: "Forum threads and discussion around public work.",
  },
];

export function PublicHome() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<HomeUser | null>(null);
  const { search, setSearch, results: searchResults, searching } = useStationSearch();

  useEffect(() => {
    restoreSession().then((session) => setUser(session?.user ?? null));
  }, []);

  useEffect(() => {
    apiGet<{ items: FeedItem[] }>("/discover/feed?tab=new&limit=30")
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const developerSpaces = items.filter((item) => item.type === "developer_space").slice(0, 4);
  const publications = items.filter((item) => item.type === "document").slice(0, 4);
  const threads = items.filter((item) => item.type === "thread").slice(0, 4);
  const spaces = uniqueSpaces(items).slice(0, 4);

  return (
    <main className="public-home">
      <section className="public-home-hero">
        <div className="public-home-hero-copy">
          <p className="public-home-eyebrow">Station public front door</p>
          <h1>Find the public work around AI companions, personas, and live experiments.</h1>
          <p>
            Start with public Spaces, Developer Space observatories, published writing, and community
            discussion. Private Studio, archive, continuity, and owner search stay behind sign-in.
          </p>
          <div className="public-home-actions">
            <Link className="public-home-primary" href="/discover">Explore Discover</Link>
            <Link className="public-home-secondary" href={user ? "/studio" : "/signup"}>
              {user ? "Open Studio" : "Create an account"}
            </Link>
          </div>
        </div>
        <div className="public-home-note" aria-label="Public search boundary">
          <strong>Public search only</strong>
          <span>
            This page searches public-safe Developer Spaces, Spaces, publications, and forum threads.
            Owner-private archive, memory, canon, import, and continuity results remain in Studio.
          </span>
        </div>
      </section>

      <section className="public-home-search" aria-label="Search public Station">
        <label htmlFor="public-station-search">Search public Station</label>
        <div className="public-home-search-box">
          <span aria-hidden="true">Search</span>
          <input
            id="public-station-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search public projects, spaces, documents, and threads"
          />
          {search ? (
            <button type="button" onClick={() => setSearch("")}>Clear</button>
          ) : null}
        </div>
        {search.trim() ? (
          <SearchResultsDropdown
            query={search}
            results={searchResults}
            searching={searching}
            onNavigate={() => setSearch("")}
          />
        ) : null}
      </section>

      <section className="public-home-surfaces" aria-label="Public Station surfaces">
        {SURFACES.map((surface) => (
          <Link key={surface.href} href={surface.href}>
            <strong>{surface.label}</strong>
            <span>{surface.copy}</span>
          </Link>
        ))}
      </section>

      {loading ? (
        <section className="public-home-section">
          <div className="public-home-empty">Loading public Station...</div>
        </section>
      ) : (
        <>
          <PublicSection
            title="Developer Spaces"
            href="/developer-spaces"
            empty="No public Developer Spaces are available yet."
            items={developerSpaces}
            render={(item) => <FeedCard item={item} detail={developerSpaceDetail(item)} />}
          />

          <PublicSection
            title="Publications"
            href="/discover"
            empty="No public publications are available yet."
            items={publications}
            render={(item) => <FeedCard item={item} detail={publicationDetail(item)} />}
          />

          <PublicSection
            title="Public Spaces"
            href="/discover"
            empty="No public Spaces are available yet."
            items={spaces}
            render={(space) => <SpaceCard space={space} />}
          />

          <PublicSection
            title="Community Discussion"
            href="/forums"
            empty="No public forum threads are available yet."
            items={threads}
            render={(item) => <FeedCard item={item} detail={threadDetail(item)} />}
          />
        </>
      )}
    </main>
  );
}

function PublicSection<T>({
  title,
  href,
  empty,
  items,
  render,
}: {
  title: string;
  href: string;
  empty: string;
  items: T[];
  render: (item: T) => ReactNode;
}) {
  return (
    <section className="public-home-section">
      <div className="public-home-section-head">
        <h2>{title}</h2>
        <Link href={href}>View all</Link>
      </div>
      {items.length ? (
        <div className="public-home-card-grid">{items.map((item, index) => <div key={itemKey(item, index)}>{render(item)}</div>)}</div>
      ) : (
        <div className="public-home-empty">{empty}</div>
      )}
    </section>
  );
}

function FeedCard({ item, detail }: { item: FeedItem; detail: string }) {
  return (
    <Link className="public-home-card" href={item.href}>
      <span>{feedTypeLabel(item)}</span>
      <strong>{item.title}</strong>
      {item.excerpt ? <p>{item.excerpt}</p> : null}
      <small>{detail}</small>
    </Link>
  );
}

function SpaceCard({ space }: { space: { slug: string; title: string } }) {
  return (
    <Link className="public-home-card" href={`/space/${space.slug}`}>
      <span>Space</span>
      <strong>{space.title}</strong>
      <p>Public work and pages from this Station Space.</p>
      <small>Open public Space</small>
    </Link>
  );
}

function uniqueSpaces(items: FeedItem[]) {
  const seen = new Map<string, { slug: string; title: string }>();
  for (const item of items) {
    if (item.space?.slug && !seen.has(item.space.slug)) {
      seen.set(item.space.slug, { slug: item.space.slug, title: item.space.title });
    }
  }
  return [...seen.values()];
}

function feedTypeLabel(item: FeedItem) {
  if (item.type === "developer_space") return "Developer Space";
  if (item.type === "thread") return "Forum";
  return item.meta ?? "Publication";
}

function developerSpaceDetail(item: FeedItem) {
  if (!item.developerSpace) return "Public observatory";
  return `${item.developerSpace.nodeCount} nodes / ${item.developerSpace.eventCount} signals`;
}

function publicationDetail(item: FeedItem) {
  const author = item.author?.display_name ?? item.author?.username ?? "Station";
  return `${author} / ${timeAgo(item.createdAt)}`;
}

function threadDetail(item: FeedItem) {
  return `${item.replyCount ?? 0} replies / ${timeAgo(item.createdAt)}`;
}

function itemKey(item: unknown, index: number) {
  if (typeof item === "object" && item && "id" in item) return String((item as { id: unknown }).id);
  if (typeof item === "object" && item && "slug" in item) return String((item as { slug: unknown }).slug);
  return String(index);
}
