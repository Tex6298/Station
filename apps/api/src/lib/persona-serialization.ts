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
export const ANONYMOUS_PUBLIC_PERSONA_CHAT_SLUG = "station-replay-alpha-persona";
const PUBLIC_PERSONA_AVATAR_URL_MAX_LENGTH = 2048;
const SECRET_QUERY_NAME_PATTERN = /(^|[_-])(token|secret|key|signature|sig|access[_-]?token|auth|jwt|cookie)($|[_-])/i;
const SECRET_QUERY_VALUE_PATTERN = /(token|secret|signature|access[_-]?token|jwt|cookie|x-amz-|sk-|ghp_|eyJ)/i;

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

export function sanitizePublicPersonaAvatarUrl(
  value: unknown,
  options: { rejectUnsafe?: boolean } = {}
) {
  const input = typeof value === "string" ? value.trim() : value;
  if (input === null || input === undefined || input === "") return null;
  if (typeof input !== "string") return invalidPublicPersonaAvatarUrl(options);
  if (input.length > PUBLIC_PERSONA_AVATAR_URL_MAX_LENGTH) return invalidPublicPersonaAvatarUrl(options);

  try {
    const url = new URL(input);
    url.hash = "";

    if (url.protocol !== "https:") return invalidPublicPersonaAvatarUrl(options);
    if (url.username || url.password) return invalidPublicPersonaAvatarUrl(options);
    if (!isPublicAvatarHostname(url.hostname)) return invalidPublicPersonaAvatarUrl(options);
    if (isBlockedStorageAvatarUrl(url)) return invalidPublicPersonaAvatarUrl(options);
    if (hasSecretAvatarQuery(url)) return invalidPublicPersonaAvatarUrl(options);

    return url.toString();
  } catch {
    return invalidPublicPersonaAvatarUrl(options);
  }
}

function invalidPublicPersonaAvatarUrl(options: { rejectUnsafe?: boolean }) {
  if (options.rejectUnsafe) {
    throw new Error("invalid_public_persona_avatar_url");
  }
  return null;
}

function isPublicAvatarHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!normalized) return false;
  if (normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local")) return false;
  if (isPrivateIPv4(normalized) || isPrivateIPv6(normalized)) return false;
  if (!normalized.includes(".") && !normalized.includes(":")) return false;
  return true;
}

function isPrivateIPv4(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet, index) => !Number.isInteger(octet) || octet < 0 || octet > 255 || String(octet) !== parts[index])) return false;
  const [first, second] = octets;
  return first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168);
}

function isPrivateIPv6(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:");
}

function isBlockedStorageAvatarUrl(url: URL) {
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  const storageHost = host.includes("supabase") || host.includes("railway") || host.includes("station");
  return storageHost && /(storage|signed|download|object|bucket)/.test(path);
}

function hasSecretAvatarQuery(url: URL) {
  if (url.search.toLowerCase().includes("x-amz-")) return true;
  for (const [name, value] of url.searchParams) {
    if (SECRET_QUERY_NAME_PATTERN.test(name) || SECRET_QUERY_VALUE_PATTERN.test(value)) return true;
  }
  return false;
}

export function publicPersonaChatCapability(row: any): PublicPersonaChatCapability {
  return {
    enabled: Boolean(row.public_chat_enabled),
    mode: publicPersonaChatMode(row.public_slug),
  };
}

export function publicPersonaChatMode(publicSlug: string | null | undefined): PublicPersonaChatCapability["mode"] {
  return publicSlug === ANONYMOUS_PUBLIC_PERSONA_CHAT_SLUG
    ? "anonymous_alpha"
    : "signed_in_alpha";
}

export function serializePersonaPublicFields(row: any): PersonaPublicFields {
  return {
    name: row.name,
    shortDescription: row.short_description,
    visibility: row.visibility,
    avatarUrl: sanitizePublicPersonaAvatarUrl(row.avatar_url),
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
