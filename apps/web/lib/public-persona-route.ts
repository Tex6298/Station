export type PublicPersonaChatMode = "signed_in_alpha" | "anonymous_alpha";

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

export function publicPersonaUpdatesCopy() {
  return "Public updates are derived from published documents, public document discussions, and public Salon threads linked to this persona. This is not live activity, provider activity, private memory, or a complete history.";
}

export function publicPersonaUpdatesEmptyCopy() {
  return "No published documents or public discussions are available for this persona yet.";
}

export function publicPersonaChatCopy(mode: PublicPersonaChatMode = "signed_in_alpha") {
  if (mode === "anonymous_alpha") {
    return "Anonymous alpha chat uses this persona's public profile, published public documents, and linked public discussions only. Reports still require sign-in.";
  }

  return "Signed-in public chat uses this persona's public profile, published public documents, and linked public discussions only.";
}

export function publicPersonaChatDisabledCopy() {
  return "Public chat is not enabled for this persona.";
}

export function publicPersonaChatAccess(input: {
  enabled?: boolean | null;
  mode?: PublicPersonaChatMode | null;
  hasSession: boolean;
}) {
  if (!input.enabled) return "disabled";
  if (input.mode === "anonymous_alpha") return "anonymous_alpha";
  return input.hasSession ? "signed_in_alpha" : "sign_in_required";
}
