export type Tier = "visitor" | "private" | "creator" | "canon" | "institutional";

export const TIER_LIMITS = {
  visitor:       { personas: 0,  spaces: 0, publicPersonas: 0,  pagesPerSpace: 0,  storageGb: 0,  canComment: false, canCreateThreads: false, canPublishDocuments: false },
  private:       { personas: 2,  spaces: 0, publicPersonas: 0,  pagesPerSpace: 0,  storageGb: 2,  canComment: true,  canCreateThreads: true,  canPublishDocuments: false },
  creator:       { personas: -1, spaces: 1, publicPersonas: -1, pagesPerSpace: 20, storageGb: 20, canComment: true,  canCreateThreads: true,  canPublishDocuments: true  },
  canon:         { personas: -1, spaces: 3, publicPersonas: -1, pagesPerSpace: 50, storageGb: 50, canComment: true,  canCreateThreads: true,  canPublishDocuments: true  },
  institutional: { personas: -1, spaces: 5, publicPersonas: -1, pagesPerSpace: 50, storageGb: 100, canComment: true, canCreateThreads: true,  canPublishDocuments: true  },
} as const;

// -1 = unlimited

export const TIER_PRICES_GBP = {
  visitor:       0,
  private:       10,
  creator:       100,
  canon:         250,
  institutional: 0, // custom / contact sales
} as const;

export const TIER_LABELS: Record<Tier, string> = {
  visitor:       "Free",
  private:       "Basic",
  creator:       "Creator",
  canon:         "Canon / Developer",
  institutional: "Institutional",
};
