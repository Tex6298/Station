export type SocialReadinessMode = "readback_only";
export type SocialReadinessStatus = "paused";
export type SocialAuthStyle = "manual_credential" | "oauth";

export interface SocialProviderReadiness {
  platform: string;
  label: string;
  authStyle: SocialAuthStyle;
  characterLimit: number | null;
  status: SocialReadinessStatus;
  configured: boolean;
  oauthAppConfigured: boolean | null;
}

export interface SocialPublishingReadinessResponse {
  mode: SocialReadinessMode;
  credentialStorageAccepted: false;
  postingEnabled: false;
  connectionActionsEnabled: false;
  teaserGenerationEnabled: false;
  supportedProviders: SocialProviderReadiness[];
  oauthApps: Record<string, { configured: boolean; status: "configured" | "missing" }>;
  safety: {
    externalPosting: "paused";
    credentialStorage: "not_accepted";
    providerCalls: "disabled";
    queueDispatch: "disabled";
    webhookHandling: "disabled";
  };
  message: string;
}

export const SOCIAL_PROVIDER_ORDER = [
  "bluesky",
  "mastodon",
  "tumblr",
  "linkedin",
  "reddit",
  "wordpress",
  "ghost",
] as const;

export function socialPublishingIntroCopy() {
  return "Social publishing is in readiness mode while Station finishes the credential and posting safety contracts.";
}

export function socialPublishingSafetyCopy() {
  return "No provider credentials are collected here. Live posting, OAuth redirects, teaser generation, queues, webhooks, and external account linking are paused.";
}

export function socialPublishingStatusLabel(status: SocialReadinessStatus) {
  if (status === "paused") return "Paused";
  return "Paused";
}

export function socialPublishingAuthStyleLabel(style: SocialAuthStyle) {
  if (style === "manual_credential") return "Manual credential contract pending";
  return "OAuth contract pending";
}

export function socialPublishingCharacterLimitLabel(limit: number | null) {
  return limit && limit > 0 ? `${limit.toLocaleString()} character readback` : "Long-form readback";
}

export function socialPublishingActionLabel() {
  return "Connector paused";
}

export function socialPublishingEmptyReadiness(): SocialPublishingReadinessResponse {
  return {
    mode: "readback_only",
    credentialStorageAccepted: false,
    postingEnabled: false,
    connectionActionsEnabled: false,
    teaserGenerationEnabled: false,
    supportedProviders: SOCIAL_PROVIDER_ORDER.map((platform) => ({
      platform,
      label: providerLabel(platform),
      authStyle: providerAuthStyle(platform),
      characterLimit: providerCharacterLimit(platform),
      status: "paused",
      configured: false,
      oauthAppConfigured: providerAuthStyle(platform) === "oauth" ? false : null,
    })),
    oauthApps: {
      tumblr: { configured: false, status: "missing" },
      linkedin: { configured: false, status: "missing" },
      reddit: { configured: false, status: "missing" },
    },
    safety: {
      externalPosting: "paused",
      credentialStorage: "not_accepted",
      providerCalls: "disabled",
      queueDispatch: "disabled",
      webhookHandling: "disabled",
    },
    message: socialPublishingIntroCopy(),
  };
}

function providerLabel(platform: typeof SOCIAL_PROVIDER_ORDER[number]) {
  if (platform === "bluesky") return "Bluesky";
  if (platform === "mastodon") return "Mastodon";
  if (platform === "tumblr") return "Tumblr";
  if (platform === "linkedin") return "LinkedIn";
  if (platform === "reddit") return "Reddit";
  if (platform === "wordpress") return "WordPress";
  return "Ghost";
}

function providerAuthStyle(platform: typeof SOCIAL_PROVIDER_ORDER[number]): SocialAuthStyle {
  if (platform === "bluesky" || platform === "mastodon" || platform === "wordpress" || platform === "ghost") {
    return "manual_credential";
  }
  return "oauth";
}

function providerCharacterLimit(platform: typeof SOCIAL_PROVIDER_ORDER[number]) {
  if (platform === "bluesky") return 300;
  if (platform === "mastodon") return 500;
  if (platform === "tumblr") return 4096;
  if (platform === "linkedin") return 3000;
  if (platform === "reddit") return 40000;
  return null;
}
