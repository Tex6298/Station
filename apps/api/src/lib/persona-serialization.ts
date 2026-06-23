import type { PersonaPublicFields, PublicPersonaProfile } from "@station/types";

export const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyPublicPersonaName(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "persona";
}

export function publicPersonaRouteHref(publicSlug: string | null | undefined) {
  if (!publicSlug || !PUBLIC_PERSONA_SLUG_PATTERN.test(publicSlug)) return null;
  return `/personas/${publicSlug}`;
}

export function serializePersonaPublicFields(row: any): PersonaPublicFields {
  return {
    name: row.name,
    shortDescription: row.short_description,
    visibility: row.visibility,
    avatarUrl: row.avatar_url,
    publicSlug: row.public_slug ?? null,
  };
}

export function serializePublicPersona(row: any): PublicPersonaProfile {
  return {
    ...serializePersonaPublicFields(row),
    visibility: "public",
  };
}
