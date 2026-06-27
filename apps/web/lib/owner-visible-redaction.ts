const UUID_SHAPED_VALUE_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const STRUCTURED_OWNER_VISIBLE_PREVIEW =
  "Structured source preview redacted. Safe title, source, status, and memory context remain visible.";

export function redactOwnerVisibleIds(value: string, replacement = "[redacted-id]") {
  return value.replace(UUID_SHAPED_VALUE_PATTERN, replacement);
}

export function ownerVisibleText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  if (!text) return fallback;
  if (isStructuredSourceText(text)) return STRUCTURED_OWNER_VISIBLE_PREVIEW;
  return redactOwnerVisibleIds(text);
}

function isStructuredSourceText(value: string) {
  const candidate = value.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  if (candidate.length < 12) return false;
  if (!candidate.startsWith("{") && !candidate.startsWith("[")) return false;

  try {
    const parsed = JSON.parse(candidate);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return /^[{\[]\s*["']?[\w-]+["']?\s*:/.test(candidate)
      || (/^\[\s*[\[{"']/.test(candidate) && /["']?[\w-]+["']?\s*:/.test(candidate));
  }
}
