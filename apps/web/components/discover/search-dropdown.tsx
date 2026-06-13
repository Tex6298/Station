"use client";

import Link from "next/link";

export const PUBLIC_SEARCH_GROUPS = [
  ["developerSpaces", "Developer Spaces"],
  ["spaces", "Spaces"],
  ["documents", "Publications"],
  ["threads", "Forum"],
] as const;

export type PublicSearchGroup = typeof PUBLIC_SEARCH_GROUPS[number][0];

export function searchHref(key: PublicSearchGroup, result: any): string | null {
  switch (key) {
    case "developerSpaces":
      return result.slug ? `/developer-spaces/${result.slug}` : null;
    case "spaces":
      return result.slug ? `/space/${result.slug}` : null;
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
                <Link key={`${key}-${result.id}`} href={href} onClick={onNavigate}>
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
