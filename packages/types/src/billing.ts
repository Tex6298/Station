import type { Tier } from "./user";

export type TokenWarningLevel = "ok" | "notice" | "warning" | "blocked" | "review";
export type TokenTopupModelTier = "haiku" | "sonnet";
export type TokenPurchaseStatus = "pending" | "completed" | "refunded";

export interface TokenTopupPack {
  id: string;
  name: string;
  priceGbp: number;
  tokens: number;
  approximateTurns: number;
  modelTier: TokenTopupModelTier;
}

export interface TokenPurchaseHistoryItem {
  id: string;
  packId: string;
  amountPence: number;
  tokensPurchased: number;
  expiresAt: string;
  status: TokenPurchaseStatus;
  createdAt: string;
}

export interface TokenUsage {
  tier: Tier | "basic" | "developer";
  tierLabel: string;
  periodStart: string;
  resetDate: string;
  tokensUsed: number;
  tokensLimit: number;
  topupTokens: number;
  effectiveLimit: number;
  percentUsed: number;
  subscriptionPercent: number;
  warningLevel: TokenWarningLevel;
  modelExperience: string;
  availableTopups: TokenTopupPack[];
  purchaseHistory: TokenPurchaseHistoryItem[];
}
