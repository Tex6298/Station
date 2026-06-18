import type { PersonaRuntimeContext } from "@station/ai/retrieval/context-builder";

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

export type RuntimeContextBudgetBucket = {
  itemCount: number;
  estimatedTokens: number;
  searched?: number;
  skipped?: Record<string, number>;
  retrievalMode?: string;
  notes?: string[];
};

export type ChatRuntimeBudgetReport = {
  schema: "station.chat_runtime_budget.v1";
  productionSafe: true;
  generatedAt: string;
  provider: {
    route: string;
    modelTier: string;
    model: string;
  };
  totals: {
    estimatedInputTokens: number;
    bucketTokens: number;
    historyMessages: number;
  };
  buckets: {
    recentTurns: RuntimeContextBudgetBucket;
    canon: RuntimeContextBudgetBucket;
    memory: RuntimeContextBudgetBucket;
    integrity: RuntimeContextBudgetBucket;
    archive: RuntimeContextBudgetBucket;
    continuity: RuntimeContextBudgetBucket;
  };
  truncation: {
    history: {
      requested: number;
      retained: number;
      dropped: number;
      limit: number;
    };
  };
};

type BuildChatRuntimeBudgetReportInput = {
  systemPrompt: string;
  userMessage: string;
  history: RuntimeHistoryMessage[];
  rawHistoryCount: number;
  historyLimit: number;
  runtimeContext: PersonaRuntimeContext;
  providerRoute: string;
  modelTier: string;
  model: string;
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

export function buildChatRuntimeBudgetReport(input: BuildChatRuntimeBudgetReportInput): ChatRuntimeBudgetReport {
  const recentTurnTokens = estimateRuntimeTokens([
    ...input.history.map((message) => message.content),
    input.userMessage,
  ]);
  const buckets = {
    recentTurns: {
      itemCount: input.history.length + 1,
      estimatedTokens: recentTurnTokens,
    },
    canon: sourceBucket(input.runtimeContext.canon),
    memory: {
      ...sourceBucket(input.runtimeContext.memory),
      searched: input.runtimeContext.trace.searched.memory,
      skipped: numericSkipped(input.runtimeContext.trace.skipped.memory),
      retrievalMode: input.runtimeContext.trace.retrievalMode.memory,
    },
    integrity: sourceBucket(input.runtimeContext.integrity),
    archive: {
      ...sourceBucket(input.runtimeContext.archive),
      searched: input.runtimeContext.trace.searched.archive,
      skipped: numericSkipped(input.runtimeContext.trace.skipped.archive),
      retrievalMode: input.runtimeContext.trace.retrievalMode.archive,
    },
    continuity: {
      itemCount: 0,
      estimatedTokens: 0,
      notes: ["continuity_records_not_in_chat_context_yet"],
    },
  };
  const bucketTokens = Object.values(buckets).reduce((sum, bucket) => sum + bucket.estimatedTokens, 0);

  return {
    schema: "station.chat_runtime_budget.v1",
    productionSafe: true,
    generatedAt: new Date().toISOString(),
    provider: {
      route: input.providerRoute,
      modelTier: input.modelTier,
      model: input.model,
    },
    totals: {
      estimatedInputTokens: estimateRuntimeTokens([input.systemPrompt, input.userMessage, ...input.history.map((message) => message.content)]),
      bucketTokens,
      historyMessages: input.history.length,
    },
    buckets,
    truncation: {
      history: {
        requested: input.rawHistoryCount,
        retained: input.history.length,
        dropped: Math.max(0, input.rawHistoryCount - input.history.length),
        limit: input.historyLimit,
      },
    },
  };
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

function sourceBucket(sources: Array<{ content?: string | null }>): RuntimeContextBudgetBucket {
  return {
    itemCount: sources.length,
    estimatedTokens: estimateRuntimeTokens(sources.map((source) => source.content ?? "")),
  };
}

function numericSkipped(skipped: Record<string, unknown> | undefined): Record<string, number> {
  if (!skipped) return {};
  return Object.fromEntries(
    Object.entries(skipped)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number")
  );
}

function estimateRuntimeTokens(parts: string[]): number {
  const characterCount = parts.reduce((sum, part) => sum + part.length, 0);
  return Math.max(0, Math.ceil(characterCount / 4));
}

function timestampValue(value: string | null | undefined) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
