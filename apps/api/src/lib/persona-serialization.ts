import type {
  PersonaPublicFields,
  PublicPersonaChatCapability,
  PublicPersonaContextPreview,
  PublicPersonaContextSource,
  PublicPersonaProfile,
} from "@station/types";

export const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const PUBLIC_PERSONA_CONTEXT_PREVIEW_QUERY_MAX_LENGTH = 120;
export const PUBLIC_PERSONA_CONTEXT_EXCLUDED_PRIVATE_BUCKETS = [
  "memory",
  "archive",
  "canon",
  "continuity",
  "integrity",
  "owner_profile",
  "provider_settings",
] as const;

export function isSafePublicPersonaSlug(value: string | null | undefined): value is string {
  return Boolean(
    value &&
    PUBLIC_PERSONA_SLUG_PATTERN.test(value) &&
    !UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(value)
  );
}

export function slugifyPublicPersonaName(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const normalized = slug || "persona";
  return UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(normalized)
    ? `persona-${normalized}`
    : normalized;
}

export function publicPersonaRouteHref(publicSlug: string | null | undefined) {
  if (!isSafePublicPersonaSlug(publicSlug)) return null;
  return `/personas/${publicSlug}`;
}

export function publicPersonaChatCapability(row: any): PublicPersonaChatCapability {
  return {
    enabled: Boolean(row.public_chat_enabled),
    mode: "signed_in_alpha",
  };
}

export function serializePersonaPublicFields(row: any): PersonaPublicFields {
  return {
    name: row.name,
    shortDescription: row.short_description,
    visibility: row.visibility,
    avatarUrl: row.avatar_url,
    publicSlug: isSafePublicPersonaSlug(row.public_slug) ? row.public_slug : null,
    publicChat: publicPersonaChatCapability(row),
  };
}

export function serializePublicPersona(row: any): PublicPersonaProfile {
  return {
    ...serializePersonaPublicFields(row),
    visibility: "public",
  };
}

export function normalizePublicPersonaContextQuery(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function includesQuery(text: string | null | undefined, query: string) {
  if (!query) return false;
  return (text ?? "").toLowerCase().includes(query.toLowerCase());
}

function publicExcerpt(row: any, query: string) {
  const description = row.short_description ? String(row.short_description) : "";
  if (!description) return null;
  if (query && !includesQuery(description, query) && !includesQuery(row.name, query)) return null;
  return description.length > 180 ? `${description.slice(0, 177).trimEnd()}...` : description;
}

export function publicContextSourceMatchesQuery(
  query: string,
  ...fields: Array<string | null | undefined>
) {
  return fields.some((field) => includesQuery(field, query));
}

export function publicContextSourceExcerpt(
  query: string,
  ...fields: Array<string | null | undefined>
) {
  const selected = query
    ? fields.find((field) => includesQuery(field, query))
    : fields.find((field) => (field ?? "").trim());
  const clean = (selected ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > 180 ? `${clean.slice(0, 177).trimEnd()}...` : clean;
}

export function serializePublicPersonaContextPreview(
  row: any,
  query: string,
  options: {
    sources?: PublicPersonaContextSource[];
    counts?: Partial<PublicPersonaContextPreview["preview"]["counts"]>;
  } = {}
): PublicPersonaContextPreview {
  const publicSlug = isSafePublicPersonaSlug(row.public_slug) ? row.public_slug : null;
  if (!publicSlug) {
    throw new Error("Cannot serialize public persona context preview without a safe public slug.");
  }

  const matchesQuery = includesQuery(row.name, query) || includesQuery(row.short_description, query);

  return {
    persona: {
      name: row.name,
      publicSlug,
    },
    query,
    preview: {
      sources: [
        {
          type: "public_profile",
          title: row.name,
          href: `/personas/${publicSlug}`,
          label: "Public persona profile",
          excerpt: publicExcerpt(row, query),
          matchesQuery,
        },
        ...(options.sources ?? []),
      ],
      counts: {
        publicProfile: 1,
        publishedDocuments: options.counts?.publishedDocuments ?? 0,
        publicDiscussions: options.counts?.publicDiscussions ?? 0,
        publicSalonThreads: options.counts?.publicSalonThreads ?? 0,
      },
      excludedPrivateBuckets: [...PUBLIC_PERSONA_CONTEXT_EXCLUDED_PRIVATE_BUCKETS],
    },
  };
}
