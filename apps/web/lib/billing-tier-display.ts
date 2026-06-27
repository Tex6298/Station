import {
  TIER_LABELS,
  TIER_LIMITS,
  TIER_PRICES_GBP,
  TIER_YEARLY_PRICES_GBP,
  type PaidTier,
  type Tier,
} from "@station/config";

export type PricingTier = "visitor" | PaidTier;

export const PRICING_TIER_ORDER: PricingTier[] = ["visitor", "private", "creator", "canon"];
export const BILLING_PLAN_TIERS: PaidTier[] = ["private", "creator", "canon"];

type TierDisplayCopy = {
  description: string;
  cta: string;
  href: string;
  featured: boolean;
};

const PRICING_COPY: Record<PricingTier, TierDisplayCopy> = {
  visitor: {
    description: "See what Station is about. No commitment.",
    cta: "Sign up free",
    href: "/signup",
    featured: false,
  },
  private: {
    description: "Your private studio. Two personas, full archive, community access.",
    cta: "Start Basic",
    href: "/signup?tier=private",
    featured: false,
  },
  creator: {
    description: "Unlimited personas, a public Space, and the tools to publish and share.",
    cta: "Become a Creator",
    href: "/signup?tier=creator",
    featured: true,
  },
  canon: {
    description: "For serious practitioners. Everything, plus more space and early access.",
    cta: "Join Canon / Developer",
    href: "/signup?tier=canon",
    featured: false,
  },
};

export interface TierPlanDisplay {
  name: string;
  tier: PricingTier;
  price: string;
  interval: "month" | null;
  yearlyPrice: string | null;
  yearlyPriceWithInterval: string | null;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
}

export interface BillingPlanDisplay {
  name: string;
  tier: PaidTier;
  price: string;
  interval: "month";
  yearlyPrice: string | null;
  yearlyPriceWithInterval: string | null;
  features: string[];
  featured: boolean;
}

export function billingTierLabel(tier: string | null | undefined): string {
  return tier && tier in TIER_LABELS ? TIER_LABELS[tier as Tier] : tier ?? "Unknown";
}

export function billingTierReadbackLabel(tier: string | null | undefined): string | null {
  return tier ? billingTierLabel(tier) : null;
}

export function billingPriceLabel(tier: Tier): string {
  return formatGbp(TIER_PRICES_GBP[tier]);
}

export function billingYearlyPriceLabel(tier: PaidTier): string {
  return formatGbp(TIER_YEARLY_PRICES_GBP[tier]);
}

export function billingYearlyPriceWithInterval(tier: PaidTier): string {
  return `${billingYearlyPriceLabel(tier)}/year`;
}

export function billingLimitLabel(value: number, singular: string, plural = `${singular}s`): string {
  if (value < 0) return `Unlimited ${plural}`;
  return `${value} ${value === 1 ? singular : plural}`;
}

export function billingStorageLimitLabel(tier: Tier): string {
  return billingLimitLabel(TIER_LIMITS[tier].storageGb, "GB", "GB");
}

export function billingSpaceLimitLabel(tier: Tier): string {
  return billingLimitLabel(TIER_LIMITS[tier].spaces, "Space");
}

export function billingPublicSpaceLimitLabel(tier: Tier): string {
  const value = TIER_LIMITS[tier].spaces;
  if (value < 0) return "Unlimited public Spaces";
  return `${value} ${value === 1 ? "public Space" : "public Spaces"}`;
}

export function billingDeveloperSpaceLimitLabel(tier: Tier): string {
  return billingLimitLabel(TIER_LIMITS[tier].developerSpaces, "Developer Space");
}

export function billingPersonaLimitLabel(tier: Tier): string {
  return billingLimitLabel(TIER_LIMITS[tier].personas, "persona");
}

export function pricingTierDisplay(tier: PricingTier): TierPlanDisplay {
  const copy = PRICING_COPY[tier];
  const yearlyPrice = visibleYearlyPrice(tier);
  return {
    name: billingTierLabel(tier),
    tier,
    price: billingPriceLabel(tier),
    interval: tier === "visitor" ? null : "month",
    yearlyPrice,
    yearlyPriceWithInterval: yearlyPrice ? `${yearlyPrice}/year` : null,
    description: copy.description,
    features: pricingFeatures(tier),
    cta: copy.cta,
    href: copy.href,
    featured: copy.featured,
  };
}

export function billingPlanDisplay(tier: PaidTier): BillingPlanDisplay {
  const yearlyPrice = visibleYearlyPrice(tier);
  return {
    name: billingTierLabel(tier),
    tier,
    price: billingPriceLabel(tier),
    interval: "month",
    yearlyPrice,
    yearlyPriceWithInterval: yearlyPrice ? `${yearlyPrice}/year` : null,
    features: billingFeatures(tier),
    featured: tier === "creator",
  };
}

function visibleYearlyPrice(tier: PricingTier): string | null {
  return tier === "creator" ? billingYearlyPriceLabel(tier) : null;
}

function pricingFeatures(tier: PricingTier): string[] {
  if (tier === "visitor") {
    return [
      "Browse public Spaces and documents",
      "Read the community forums",
      "Limited discover feed",
    ];
  }

  if (tier === "private") {
    return [
      billingPersonaLimitLabel(tier),
      "Private archive with memory + canon",
      "File and chat imports",
      "Full forum access",
      `${billingStorageLimitLabel(tier)} storage`,
      "BYOK or platform AI",
    ];
  }

  if (tier === "creator") {
    return [
      billingPersonaLimitLabel(tier),
      `${billingPublicSpaceLimitLabel(tier)} (website)`,
      "Full archive + semantic search",
      "Publish essays, codexes, and field logs",
      `${billingStorageLimitLabel(tier)} storage`,
      "BYOK or platform AI",
      "Forum + community access",
    ];
  }

  return [
    "Everything in Creator",
    billingSpaceLimitLabel(tier),
    billingDeveloperSpaceLimitLabel(tier),
    `${billingStorageLimitLabel(tier)} storage`,
    "Priority support",
    "Early access to new features",
  ];
}

function billingFeatures(tier: PaidTier): string[] {
  if (tier === "private") {
    return [
      billingPersonaLimitLabel(tier),
      `${billingStorageLimitLabel(tier)} storage`,
      "Private archive",
      "Forum access",
      "Chat (BYOK or platform)",
    ];
  }

  if (tier === "creator") {
    return [
      billingPersonaLimitLabel(tier),
      billingPublicSpaceLimitLabel(tier),
      `${billingStorageLimitLabel(tier)} storage`,
      "Full archive + RAG",
      "Publish essays & codexes",
      "Forum access",
    ];
  }

  return [
    "Everything in Creator",
    billingSpaceLimitLabel(tier),
    billingDeveloperSpaceLimitLabel(tier),
    `${billingStorageLimitLabel(tier)} storage`,
    "Priority support",
    "Early access to new features",
  ];
}

function formatGbp(value: number): string {
  return `GBP ${value.toLocaleString("en-GB")}`;
}
