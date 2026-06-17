export type RuntimeHistoryRole = "user" | "assistant";

export type RuntimeHistoryRow = {
  role?: string | null;
  content?: string | null;
  created_at?: string | null;
};

export type RuntimeHistoryMessage = {
  role: RuntimeHistoryRole;
  content: string;
};

/**
 * Supabase applies limit after ordering, so chat routes fetch newest rows first.
 * Providers need the retained window in chronological order and should never
 * receive system rows, blank rows, or malformed records.
 */
export function toChronologicalRuntimeHistory(rows: RuntimeHistoryRow[], limit = 20): RuntimeHistoryMessage[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0) return [];

  return rows
    .filter((row): row is RuntimeHistoryRow & { role: RuntimeHistoryRole; content: string } => {
      return (row.role === "user" || row.role === "assistant") && Boolean(row.content?.trim());
    })
    .sort((a, b) => timestampValue(a.created_at) - timestampValue(b.created_at))
    .slice(-safeLimit)
    .map((row) => ({ role: row.role, content: row.content.trim() }));
}

/**
 * Runtime debug exposes counts/provider hints only. Keep it opt-in in local and
 * staging, and never emit it from production chat responses.
 */
export function includeRuntimeDebug(
  debugFlag: unknown,
  nodeEnv = process.env.NODE_ENV,
  envFlag = process.env.STATION_EXPOSE_AI_DEBUG,
) {
  if (nodeEnv === "production") return false;
  return isTruthyDebugFlag(debugFlag) || envFlag === "true";
}

function isTruthyDebugFlag(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(isTruthyDebugFlag);
  return value === true || value === "true" || value === "1";
}

function timestampValue(value: string | null | undefined) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
