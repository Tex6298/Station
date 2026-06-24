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

export function publicPersonaContextPreviewCopy() {
  return "Preview which public source categories, including public Salon threads, a future visitor interaction may see. This does not start chat, call a model, or use private runtime context.";
}

export function publicPersonaChatCopy() {
  return "Signed-in public chat uses this persona's public profile, published public documents, and linked public discussions only.";
}

export function publicPersonaChatDisabledCopy() {
  return "Public chat is not enabled for this persona.";
}
