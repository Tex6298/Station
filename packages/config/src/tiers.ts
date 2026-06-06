export type Tier = "visitor" | "private" | "creator" | "canon" | "institutional";
export type PaidTier = "private" | "creator" | "canon";
export type BillingInterval = "monthly" | "yearly";

export const TIER_LIMITS = {
  visitor:       { personas: 0,  spaces: 0, developerSpaces: 0, publicPersonas: 0,  pagesPerSpace: 0,  storageGb: 0,   canComment: false, canCreateThreads: false, canPublishDocuments: false },
  private:       { personas: 2,  spaces: 0, developerSpaces: 0, publicPersonas: 0,  pagesPerSpace: 0,  storageGb: 5,   canComment: true,  canCreateThreads: true,  canPublishDocuments: false },
  creator:       { personas: -1, spaces: 1, developerSpaces: 0, publicPersonas: -1, pagesPerSpace: 20, storageGb: 50,  canComment: true,  canCreateThreads: true,  canPublishDocuments: true  },
  canon:         { personas: -1, spaces: 3, developerSpaces: 1, publicPersonas: -1, pagesPerSpace: 50, storageGb: 200, canComment: true,  canCreateThreads: true,  canPublishDocuments: true  },
  institutional: { personas: -1, spaces: 5, developerSpaces: 5, publicPersonas: -1, pagesPerSpace: 50, storageGb: 200, canComment: true,  canCreateThreads: true,  canPublishDocuments: true  },
} as const;

// -1 = unlimited

export const TIER_PRICES_GBP = {
  visitor:       0,
  private:       10,
  creator:       100,
  canon:         250,
  institutional: 0, // custom / contact sales
} as const;

export const TIER_YEARLY_PRICES_GBP = {
  visitor:       0,
  private:       100,
  creator:       1000,
  canon:         2500,
  institutional: 0,
} as const;

export const TIER_LABELS: Record<Tier, string> = {
  visitor:       "Free",
  private:       "Basic",
  creator:       "Creator",
  canon:         "Canon / Developer",
  institutional: "Institutional",
};

export const PAID_TIERS: PaidTier[] = ["private", "creator", "canon"];

export const STRIPE_PRICE_ENV_BY_TIER_INTERVAL: Record<PaidTier, Record<BillingInterval, string>> = {
  private: {
    monthly: "STRIPE_PRICE_BASIC_MONTHLY",
    yearly: "STRIPE_PRICE_BASIC_YEARLY",
  },
  creator: {
    monthly: "STRIPE_PRICE_CREATOR_MONTHLY",
    yearly: "STRIPE_PRICE_CREATOR_YEARLY",
  },
  canon: {
    monthly: "STRIPE_PRICE_CANON_MONTHLY",
    yearly: "STRIPE_PRICE_CANON_YEARLY",
  },
};

export const LEGACY_STRIPE_PRICE_ENV_ALIASES: Partial<Record<PaidTier, Partial<Record<BillingInterval, string[]>>>> = {
  private: {
    monthly: ["STRIPE_PRICE_SEEKER_MONTHLY"],
    yearly: ["STRIPE_PRICE_SEEKER_YEARLY"],
  },
  creator: {
    monthly: ["STRIPE_PRICE_KEEPER_MONTHLY"],
    yearly: ["STRIPE_PRICE_KEEPER_YEARLY"],
  },
};
