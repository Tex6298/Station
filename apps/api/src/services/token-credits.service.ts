import { TIER_LABELS, type Tier } from "@station/config";
import { getSupabaseAdmin } from "../lib/supabase";
import { getStripe } from "../lib/stripe";

export type TokenWarningLevel = "ok" | "notice" | "warning" | "blocked" | "review";

const TOKEN_LIMITS: Record<string, number> = {
  visitor: 0,
  basic: 750_000,
  private: 750_000,
  creator: 7_500_000,
  developer: 20_000_000,
  canon: 20_000_000,
  institutional: 20_000_000,
};

export class TokenQuotaError extends Error {
  statusCode = 402;

  constructor(message = "Your monthly token allocation has been used.") {
    super(message);
    this.name = "TokenQuotaError";
  }
}

const TOPUP_MODEL_TIERS = new Set(["haiku", "sonnet"]);

export function selectStationModel(tier: string | null | undefined) {
  switch (tier) {
    case "creator":
    case "developer":
    case "canon":
    case "institutional":
      return {
        model: "claude-sonnet-4-6",
        modelTier: "sonnet" as const,
        experienceLabel: "Creator depth",
      };
    case "basic":
    case "private":
    default:
      return {
        model: "claude-haiku-4-5-20251001",
        modelTier: "haiku" as const,
        experienceLabel: "Basic companion",
      };
  }
}

export function estimateTokensFromText(value: string) {
  if (!value) return 0;
  return Math.ceil(value.length / 4);
}

export function estimateConversationTokens(input: {
  systemPrompt?: string;
  userMessage: string;
  history?: Array<{ content: string | null }>;
}) {
  const historyTokens = (input.history ?? []).reduce((total, message) => total + estimateTokensFromText(message.content ?? ""), 0);
  return estimateTokensFromText(input.systemPrompt ?? "") + estimateTokensFromText(input.userMessage) + historyTokens + 1200;
}

export async function getTokenUsage(userId: string) {
  const sb = getSupabaseAdmin();
  const { data: profile } = await sb
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .single();

  const tier = profile?.tier ?? "visitor";
  const model = selectStationModel(tier);

  const { data: usage, error } = await (sb as any).rpc("ensure_current_token_usage", {
    p_user_id: userId,
  });

  if (error) throw new Error(error.message);

  const { data: purchases } = await (sb as any)
    .from("topup_purchases")
    .select("id, pack_id, amount_pence, tokens_purchased, expires_at, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  const tokensLimit = usage?.tokens_limit ?? TOKEN_LIMITS[tier] ?? 0;
  const topupTokens = usage?.topup_tokens ?? 0;
  const tokensUsed = usage?.tokens_used ?? 0;
  const effectiveLimit = tokensLimit + topupTokens;
  const percentUsed = effectiveLimit > 0 ? Math.min(100, Math.round((tokensUsed / effectiveLimit) * 1000) / 10) : 0;
  const subscriptionPercent = tokensLimit > 0 ? Math.round((tokensUsed / tokensLimit) * 1000) / 10 : 0;

  return {
    tier,
    tierLabel: TIER_LABELS[(tier as Tier) in TIER_LABELS ? tier as Tier : "visitor"],
    periodStart: usage?.period_start ?? currentPeriodStart(),
    resetDate: nextResetDate(),
    tokensUsed,
    tokensLimit,
    topupTokens,
    effectiveLimit,
    percentUsed,
    subscriptionPercent,
    warningLevel: warningLevel(tier, tokensUsed, effectiveLimit, tokensLimit),
    modelExperience: model.experienceLabel,
    availableTopups: topupPacksForTier(tier),
    purchaseHistory: (purchases ?? []).map((purchase: any) => ({
      id: purchase.id,
      packId: purchase.pack_id,
      amountPence: purchase.amount_pence,
      tokensPurchased: purchase.tokens_purchased,
      expiresAt: purchase.expires_at,
      status: purchase.status,
      createdAt: purchase.created_at,
    })),
  };
}

export async function assertTokenBudgetForEstimate(userId: string, estimatedTokens: number) {
  const usage = await getTokenUsage(userId);
  if (isSoftCapTier(usage.tier)) {
    return usage;
  }

  const projected = usage.tokensUsed + Math.max(0, Math.ceil(estimatedTokens));
  const hardRejectAt = Math.floor(usage.effectiveLimit * 1.2);
  if (usage.effectiveLimit <= 0 || projected > hardRejectAt || usage.tokensUsed >= usage.effectiveLimit) {
    throw new TokenQuotaError(
      `Your monthly token allocation has been used. Your allocation resets on ${usage.resetDate}.`
    );
  }
  return usage;
}

export async function recordLlmTokenUsage(input: {
  userId: string;
  model: string;
  chatId?: string | null;
  inputTokens: number;
  outputTokens: number;
}) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any).rpc("record_token_usage", {
    p_user_id: input.userId,
    p_model: input.model,
    p_chat_id: input.chatId ?? null,
    p_input_tokens: Math.ceil(Math.max(0, input.inputTokens)),
    p_output_tokens: Math.ceil(Math.max(0, input.outputTokens)),
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function createTopupCheckoutSession(input: {
  userId: string;
  email: string;
  packId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const usage = await getTokenUsage(input.userId);
  const pack = usage.availableTopups.find((candidate) => candidate.id === input.packId);
  if (!pack) throw new Error("This top-up pack is not available for your current tier.");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email || undefined,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Station ${pack.name} token top-up`,
            metadata: {
              station_pack_id: pack.id,
            },
          },
          unit_amount: pack.priceGbp * 100,
        },
        quantity: 1,
      },
    ],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    metadata: {
      station_kind: "token_topup",
      station_user_id: input.userId,
      station_pack_id: pack.id,
      station_tokens: String(pack.tokens),
      station_model_tier: pack.modelTier,
      station_amount_pence: String(pack.priceGbp * 100),
    },
    payment_intent_data: {
      metadata: {
        station_kind: "token_topup",
        station_user_id: input.userId,
        station_pack_id: pack.id,
        station_tokens: String(pack.tokens),
        station_model_tier: pack.modelTier,
        station_amount_pence: String(pack.priceGbp * 100),
      },
    },
  });

  return session.url!;
}

export async function grantTopupFromStripeMetadata(metadata: Record<string, string | undefined>, paymentId: string) {
  if (metadata.station_kind !== "token_topup") return false;
  const userId = metadata.station_user_id;
  const packId = metadata.station_pack_id;
  const tokens = Number(metadata.station_tokens);
  const amountPence = Number(metadata.station_amount_pence);
  const modelTier = metadata.station_model_tier;
  if (!userId || !packId || !Number.isFinite(tokens) || !Number.isFinite(amountPence) || !modelTier) {
    throw new Error("Token top-up metadata is incomplete.");
  }
  if (tokens <= 0 || amountPence <= 0) {
    throw new Error("Token top-up metadata must contain positive token and amount values.");
  }
  if (!TOPUP_MODEL_TIERS.has(modelTier)) {
    throw new Error("Token top-up metadata used an unsupported model tier.");
  }

  const sb = getSupabaseAdmin();
  const { error } = await (sb as any).rpc("grant_topup_purchase", {
    p_user_id: userId,
    p_stripe_payment_id: paymentId,
    p_pack_id: packId,
    p_amount_pence: amountPence,
    p_tokens_purchased: tokens,
    p_model_tier: modelTier,
  });
  if (error) throw new Error(error.message);
  return true;
}

export async function runMonthlyTokenReset() {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any).rpc("run_monthly_token_reset");
  if (error) throw new Error(error.message);
  return data;
}

export function tokenErrorResponse(error: unknown) {
  if (error instanceof TokenQuotaError) {
    return { status: error.statusCode, body: { error: error.message } };
  }
  return null;
}

function warningLevel(tier: string, used: number, effectiveLimit: number, subscriptionLimit: number): TokenWarningLevel {
  if (isSoftCapTier(tier) && subscriptionLimit > 0 && used >= 18_000_000) return "review";
  if (effectiveLimit <= 0) return "blocked";
  const percent = (used / effectiveLimit) * 100;
  if (percent >= 100) return "blocked";
  if (percent >= 90) return "warning";
  if (percent >= 75) return "notice";
  return "ok";
}

function isSoftCapTier(tier: string) {
  return tier === "developer" || tier === "canon" || tier === "institutional";
}

function topupPacksForTier(tier: string) {
  if (tier === "creator") {
    return [
      { id: "creator-starter", name: "Starter", priceGbp: 10, tokens: 500_000, approximateTurns: 125, modelTier: "sonnet" },
      { id: "creator-standard", name: "Standard", priceGbp: 25, tokens: 1_500_000, approximateTurns: 375, modelTier: "sonnet" },
      { id: "creator-large", name: "Large", priceGbp: 50, tokens: 3_500_000, approximateTurns: 875, modelTier: "sonnet" },
    ];
  }

  if (tier === "private" || tier === "basic") {
    return [
      { id: "basic-starter", name: "Starter", priceGbp: 5, tokens: 1_500_000, approximateTurns: 425, modelTier: "haiku" },
      { id: "basic-standard", name: "Standard", priceGbp: 10, tokens: 3_500_000, approximateTurns: 1000, modelTier: "haiku" },
    ];
  }

  return [];
}

function currentPeriodStart() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function nextResetDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
}
