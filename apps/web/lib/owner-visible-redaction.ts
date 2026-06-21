const UUID_SHAPED_VALUE_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

export function redactOwnerVisibleIds(value: string, replacement = "[redacted-id]") {
  return value.replace(UUID_SHAPED_VALUE_PATTERN, replacement);
}

export function ownerVisibleText(value: string | null | undefined, fallback: string) {
  const text = value?.trim();
  if (!text) return fallback;
  return redactOwnerVisibleIds(text);
}
