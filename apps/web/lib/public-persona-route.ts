const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSafePublicPersonaSlug(publicSlug: string | null | undefined) {
  return Boolean(
    publicSlug &&
    PUBLIC_PERSONA_SLUG_PATTERN.test(publicSlug) &&
    !UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(publicSlug)
  );
}

export function publicPersonaHref(publicSlug: string | null | undefined) {
  if (!isSafePublicPersonaSlug(publicSlug)) return null;
  return `/personas/${publicSlug}`;
}

export function publicPersonaReadbackCopy() {
  return "Only the public profile is shown here. Private Studio memory, archive, canon, continuity, setup notes, provider settings, and owner data stay hidden.";
}
