"use client";

import Link from "next/link";
import { publicPersonaHref } from "../../lib/public-persona-route";
import { publicProjectHref } from "../../lib/public-project-profile";

const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PUBLIC_SEARCH_GROUPS = [
  ["projects", "Public Projects"],
  ["developerSpaces", "Developer Spaces"],
  ["salons", "Salons"],
  ["personas", "Public personas"],
  ["spaces", "Spaces"],
  ["documents", "Publications"],
  ["threads", "Forum"],
] as const;

export type PublicSearchGroup = typeof PUBLIC_SEARCH_GROUPS[number][0];

export function searchHref(key: PublicSearchGroup, result: any): string | null {
  switch (key) {
    case "projects":
      return publicProjectHref(result.slug);
    case "developerSpaces":
      return result.slug ? `/developer-spaces/${result.slug}` : null;
    case "salons": {
      const slug = result.categorySlug ?? result.slug;
      return typeof slug === "string" &&
        SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
        !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
        ? `/forums/${slug}`
        : null;
    }
    case "personas":
      return publicPersonaHref(result.publicSlug ?? result.public_slug);
    case "spaces":
      return typeof result.slug === "string" &&
        SAFE_ROUTE_SLUG_PATTERN.test(result.slug) &&
        !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(result.slug)
        ? `/space/${result.slug}`
        : null;
    case "documents":
      return result.id && result.space?.slug ? `/space/${result.space.slug}/documents/${result.id}` : null;
    case "threads":
      return result.id && result.category?.slug ? `/forums/${result.category.slug}/${result.id}` : "/forums";
    default:
      return null;
  }
}

export function routeablePublicSearchItems(key: PublicSearchGroup, results: any) {
  return ((results?.[key] ?? []) as any[])
    .map((result) => ({ result, href: searchHref(key, result) }))
    .filter((item): item is { result: any; href: string } => Boolean(item.href));
}

export function SearchResultsDropdown({
  query,
  results,
  searching,
  onNavigate,
}: {
  query: string;
  results: any;
  searching: boolean;
  onNavigate: () => void;
}) {
  const hasResults = Boolean(
    results && PUBLIC_SEARCH_GROUPS.some(([key]) => routeablePublicSearchItems(key, results).length > 0)
  );

  return (
    <div className="public-home-search-results">
      {searching ? <div className="public-home-search-status">Searching...</div> : null}
      {!searching && hasResults ? (
        PUBLIC_SEARCH_GROUPS.map(([key, label]) => {
          const items = routeablePublicSearchItems(key, results).slice(0, 5);
          if (!items.length) return null;
          return (
            <div key={key} className="public-home-search-group">
              <div>{label}</div>
              {items.map(({ result, href }) => (
                <Link key={`${key}-${href}`} href={href} onClick={onNavigate}>
                  {result.name ?? result.title ?? result.projectName}
                </Link>
              ))}
            </div>
          );
        })
      ) : null}
      {!searching && !hasResults ? (
        <div className="public-home-search-status">No public results for &quot;{query}&quot;.</div>
      ) : null}
    </div>
  );
}
