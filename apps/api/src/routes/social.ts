import { Router, type Request, type Response } from "express";
import { env } from "../lib/env";
import { requireAuth } from "../middleware/require-auth";

export const socialRouter = Router();

const SOCIAL_READINESS_ERROR = {
  error: "Social publishing connectors are paused while credential storage and posting safety are reviewed.",
  code: "social_connectors_paused",
  credentialStorageAccepted: false,
  postingEnabled: false,
  connectionActionsEnabled: false,
} as const;

const SOCIAL_TARGETS = [
  { platform: "bluesky", label: "Bluesky", authStyle: "manual_credential", characterLimit: 300 },
  { platform: "mastodon", label: "Mastodon", authStyle: "manual_credential", characterLimit: 500 },
  { platform: "tumblr", label: "Tumblr", authStyle: "oauth", characterLimit: 4096 },
  { platform: "linkedin", label: "LinkedIn", authStyle: "oauth", characterLimit: 3000 },
  { platform: "reddit", label: "Reddit", authStyle: "oauth", characterLimit: 40000 },
  { platform: "wordpress", label: "WordPress", authStyle: "manual_credential", characterLimit: null },
  { platform: "ghost", label: "Ghost", authStyle: "manual_credential", characterLimit: null },
] as const;

const OAUTH_APP_ENV = {
  tumblr: ["TUMBLR_CLIENT_ID", "TUMBLR_CLIENT_SECRET"] as const,
  linkedin: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"] as const,
  reddit: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"] as const,
} as const;

socialRouter.use(requireAuth);

socialRouter.get("/readiness", (_req: Request, res: Response) => {
  res.json(socialPublishingReadiness());
});

for (const path of [
  "/connections",
  "/connections/simple",
  "/connections/:id",
  "/auth/:platform",
  "/callback/:platform",
  "/compose",
  "/posts",
  "/generate-teaser",
]) {
  socialRouter.all(path, pausedSocialConnectorRoute);
}

function pausedSocialConnectorRoute(_req: Request, res: Response) {
  return res.status(423).json(SOCIAL_READINESS_ERROR);
}

function socialPublishingReadiness() {
  return {
    mode: "readback_only",
    credentialStorageAccepted: false,
    postingEnabled: false,
    connectionActionsEnabled: false,
    teaserGenerationEnabled: false,
    supportedProviders: SOCIAL_TARGETS.map((target) => ({
      platform: target.platform,
      label: target.label,
      authStyle: target.authStyle,
      characterLimit: target.characterLimit,
      status: "paused",
      configured: false,
      oauthAppConfigured: target.authStyle === "oauth"
        ? oauthAppConfigured(target.platform as keyof typeof OAUTH_APP_ENV)
        : null,
    })),
    oauthApps: {
      tumblr: oauthAppStatus("tumblr"),
      linkedin: oauthAppStatus("linkedin"),
      reddit: oauthAppStatus("reddit"),
    },
    safety: {
      externalPosting: "paused",
      credentialStorage: "not_accepted",
      providerCalls: "disabled",
      queueDispatch: "disabled",
      webhookHandling: "disabled",
    },
    message: "Connector setup is paused until encrypted credential storage, OAuth callbacks, outbound payload safety, and posting execution contracts are accepted.",
  };
}

function oauthAppStatus(platform: keyof typeof OAUTH_APP_ENV) {
  const configured = oauthAppConfigured(platform);
  return {
    configured,
    status: configured ? "configured" : "missing",
  };
}

function oauthAppConfigured(platform: keyof typeof OAUTH_APP_ENV) {
  const [clientIdKey, secretKey] = OAUTH_APP_ENV[platform];
  return Boolean(env[clientIdKey] && env[secretKey]);
}
