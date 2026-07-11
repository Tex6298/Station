"use client";

import Link from "next/link";
import { publicPersonaHref } from "../../lib/public-persona-route";
import { publicProjectHref } from "../../lib/public-project-profile";

const SAFE_ROUTE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_ROUTE_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeSpaceHref(slug: unknown) {
  return typeof slug === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
    ? `/space/${slug}`
    : null;
}

function safeDeveloperSpaceHref(slug: unknown) {
  return typeof slug === "string" &&
    SAFE_ROUTE_SLUG_PATTERN.test(slug) &&
    !UUID_SHAPED_ROUTE_SLUG_PATTERN.test(slug)
    ? `/developer-spaces/${slug}`
    : null;
}

function safePublicEncounterExhibitHref(slug: unknown) {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*-[a-z0-9]{8}$/.test(slug)
    ? `/encounters/${slug}`
    : null;
}

function safeSpaceDocumentHref(spaceSlug: unknown, documentId: unknown) {
  const spaceHref = safeSpaceHref(spaceSlug);
  return spaceHref && typeof documentId === "string" ? `${spaceHref}/documents/${documentId}` : null;
}

export const PUBLIC_SEARCH_GROUPS = [
  ["projects", "Public Projects"],
  ["developerSpaces", "Developer Spaces"],
  ["publicEncounterExhibits", "Encounter Exhibits"],
  ["salons", "Salons"],
  ["personas", "Public personas"],
  ["spaces", "Spaces"],
  ["documents", "Publications"],
  ["threads", "Forum"],
] as const;

export type PublicSearchGroup = typeof PUBLIC_SEARCH_GROUPS[number][0];

const PROVENANCE_LABELS: Record<string, string> = {
  user_authored: "User-authored",
  ai_assisted: "AI-assisted",
  archive_import: "Archive import",
  integrity_session: "Integrity Session",
  persona_derived: "Persona-derived",
};

export function searchHref(key: PublicSearchGroup, result: any): string | null {
  switch (key) {
    case "projects":
      return publicProjectHref(result.slug);
    case "developerSpaces":
      return safeDeveloperSpaceHref(result.slug);
    case "publicEncounterExhibits":
      return safePublicEncounterExhibitHref(result.slug);
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
      return safeSpaceHref(result.slug);
    case "documents":
      return safeSpaceDocumentHref(result.space?.slug, result.id);
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

export function publicSearchResultLabels(key: PublicSearchGroup, result: any): string[] {
  const labels: Array<string | null> = [];

  switch (key) {
    case "projects":
      labels.push("Public Project");
      break;
    case "developerSpaces":
      labels.push(visibilityLabel(result.visibility, "Developer Space"));
      labels.push(labelize(result.visualisationType ?? result.visualisation_type));
      break;
    case "publicEncounterExhibits":
      labels.push("Public encounter exhibit");
      labels.push(result.provenance?.label === "Metadata-only public encounter exhibit"
        ? "Metadata-only public encounter exhibit"
        : null);
      break;
    case "salons":
      labels.push(visibilityLabel(result.visibility, "Salon"));
      break;
    case "personas":
      labels.push("Public persona");
      if (result.publicChat?.enabled) labels.push("Signed-in chat alpha");
      break;
    case "spaces":
      labels.push("Public Space");
      labels.push(spacePresentationLabel(result.presentation));
      break;
    case "documents":
      labels.push(visibilityLabel(result.visibility, "Publication"));
      labels.push(provenanceLabel(result.provenance_type ?? result.provenanceType));
      if (result.discussion_thread_id ?? result.discussionThreadId) labels.push("Discussion open");
      break;
    case "threads":
      labels.push(visibilityLabel(result.visibility, "Forum thread"));
      break;
    default:
      break;
  }

  return labels.filter((label): label is string => Boolean(label));
}

function SearchResultLink({
  href,
  result,
  group,
  onNavigate,
}: {
  href: string;
  result: any;
  group: PublicSearchGroup;
  onNavigate: () => void;
}) {
  const labels = publicSearchResultLabels(group, result);
  const title = result.name ?? result.title ?? result.projectName;

  return (
    <Link href={href} onClick={onNavigate}>
      <span className="public-home-search-title">{title}</span>
      {labels.length > 0 ? (
        <span className="public-home-search-readback">{labels.join(" / ")}</span>
      ) : null}
    </Link>
  );
}

function visibilityLabel(value: unknown, noun: string) {
  if (value === "community" || value === "members") return `Community-visible ${noun}`;
  if (value === "public") return `Public ${noun}`;
  return noun;
}

function provenanceLabel(value: unknown) {
  return typeof value === "string" && value
    ? PROVENANCE_LABELS[value] ?? labelize(value)
    : null;
}

function spacePresentationLabel(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const presentation = value as { theme?: unknown; layout?: unknown };
  const theme = labelize(presentation.theme);
  const layout = labelize(presentation.layout);
  return [theme, layout].filter(Boolean).join(" / ") || null;
}

function labelize(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/[_-]+/g, " ").trim();
  return normalized ? normalized.replace(/^./, (letter) => letter.toUpperCase()) : null;
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
                <SearchResultLink
                  key={`${key}-${href}`}
                  group={key}
                  result={result}
                  href={href}
                  onNavigate={onNavigate}
                />
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
