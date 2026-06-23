import type { PersonaPublicFields, PublicPersonaProfile } from "@station/types";

export const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
