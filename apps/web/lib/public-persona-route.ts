const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function publicPersonaHref(publicSlug: string | null | undefined) {
  if (!publicSlug || !PUBLIC_PERSONA_SLUG_PATTERN.test(publicSlug)) return null;
  return `/personas/${publicSlug}`;
}

export function publicPersonaReadbackCopy() {
  return "Only the public profile is shown here. Private Studio memory, archive, canon, continuity, setup notes, provider settings, and owner data stay hidden.";
}
