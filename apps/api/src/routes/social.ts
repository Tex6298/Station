import { Router, type Request, type Response } from "express";
import { env } from "../lib/env";
import { requireAuth } from "../middleware/require-auth";
import {
  SOCIAL_CONNECTOR_PROVIDER_IDS,
  SOCIAL_CONNECTOR_PURPOSE,
  isSocialConnectorProviderId,
  type SocialConnectorCredentialReadback,
  type SocialConnectorProviderId,
} from "../services/social-connectors/credential-contract";
import {
  SocialConnectorCredentialStorageError,
  loadSocialConnectorCredentialReadbacks,
  revokeSocialConnectorCredential,
  socialConnectorCredentialEncryptionConfigured,
  storeSocialConnectorCredential,
} from "../services/social-connectors/credential-storage";

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

socialRouter.get("/connectors/credentials", async (req: Request, res: Response) => {
  try {
    const credentials = await loadSocialConnectorCredentialReadbacks(req.user!.id);
    return res.json({
      status: "social_connector_credentials_read",
      purpose: SOCIAL_CONNECTOR_PURPOSE,
      ownerOnly: true,
      providers: socialCredentialProviderRows(credentials),
      ...socialCredentialReadbackSafety(),
    });
  } catch (error) {
    return socialCredentialStorageFailureResponse(res, error);
  }
});

socialRouter.post("/connectors/credentials", async (req: Request, res: Response) => {
  let input: BlueskyCredentialInput;
  try {
    input = blueskyCredentialInputFromBody(req.body);
  } catch {
    return socialCredentialInvalidResponse(res);
  }

  if (!socialConnectorCredentialEncryptionConfigured()) {
    return socialCredentialEncryptionRequiredResponse(res);
  }

  try {
    const credential = await storeSocialConnectorCredential({
      ownerUserId: req.user!.id,
      provider: input.provider,
      credentialMaterial: input.credential,
    });

    return res.status(201).json({
      status: "social_connector_credential_stored",
      provider: input.provider,
      purpose: SOCIAL_CONNECTOR_PURPOSE,
      ownerOnly: true,
      connectionStatus: "connected",
      credential,
      ...socialCredentialWriteSafety(true),
    });
  } catch (error) {
    return socialCredentialStorageFailureResponse(res, error);
  }
});

socialRouter.delete("/connectors/credentials/:provider", async (req: Request, res: Response) => {
  const provider = socialConnectorProvider(req.params.provider);
  if (!provider) return socialCredentialInvalidResponse(res);

  try {
    assertEmptyCredentialRevokeBody(req.body);
  } catch {
    return socialCredentialInvalidResponse(res);
  }

  try {
    const before = await loadSocialConnectorCredentialReadbacks(req.user!.id);
    const hadActiveCredential = before.some((credential) =>
      credential.provider === provider &&
      credential.purpose === SOCIAL_CONNECTOR_PURPOSE &&
      credential.status === "active"
    );
    const credentials = await revokeSocialConnectorCredential({
      ownerUserId: req.user!.id,
      provider,
    });
    const credential = newestSocialCredentialReadbackForProvider(credentials, provider);

    return res.status(200).json({
      status: hadActiveCredential
        ? "social_connector_credential_revoked"
        : "social_connector_credential_revoke_noop",
      provider,
      purpose: SOCIAL_CONNECTOR_PURPOSE,
      ownerOnly: true,
      connectionStatus: credential
        ? credential.status === "active" ? "connected" : "revoked"
        : "missing",
      credential,
      ...socialCredentialRevokeSafety(true),
    });
  } catch (error) {
    return socialCredentialStorageFailureResponse(res, error);
  }
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

type BlueskyCredentialInput = {
  provider: "bluesky";
  credential: {
    identifier: string;
    appPassword: string;
  };
};

const MAX_BLUESKY_IDENTIFIER_LENGTH = 256;
const MAX_BLUESKY_APP_PASSWORD_LENGTH = 512;

function blueskyCredentialInputFromBody(body: unknown): BlueskyCredentialInput {
  if (!plainRecord(body)) throw new Error("invalid credential body");

  const bodyKeys = Object.keys(body);
  if (
    bodyKeys.length !== 2 ||
    !bodyKeys.includes("provider") ||
    !bodyKeys.includes("credential") ||
    body.provider !== "bluesky" ||
    !plainRecord(body.credential)
  ) {
    throw new Error("invalid credential body");
  }

  const credential = body.credential;
  const credentialKeys = Object.keys(credential);
  if (
    credentialKeys.length !== 2 ||
    !credentialKeys.includes("identifier") ||
    !credentialKeys.includes("appPassword")
  ) {
    throw new Error("invalid credential body");
  }

  return {
    provider: "bluesky",
    credential: {
      identifier: trimmedCredentialString(credential.identifier, MAX_BLUESKY_IDENTIFIER_LENGTH),
      appPassword: trimmedCredentialString(credential.appPassword, MAX_BLUESKY_APP_PASSWORD_LENGTH),
    },
  };
}

function socialConnectorProvider(value: unknown): SocialConnectorProviderId | null {
  return isSocialConnectorProviderId(value) ? value : null;
}

function trimmedCredentialString(value: unknown, maxLength: number) {
  if (typeof value !== "string") throw new Error("invalid credential value");
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw new Error("invalid credential value");
  }
  return trimmed;
}

function assertEmptyCredentialRevokeBody(body: unknown) {
  if (body === undefined) return;
  if (!plainRecord(body) || Object.keys(body).length > 0) {
    throw new Error("invalid credential revoke body");
  }
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function socialCredentialProviderRows(credentials: SocialConnectorCredentialReadback[]) {
  return SOCIAL_CONNECTOR_PROVIDER_IDS.map((provider) => {
    const credential = newestSocialCredentialReadbackForProvider(credentials, provider);
    return {
      provider,
      purpose: SOCIAL_CONNECTOR_PURPOSE,
      connectionStatus: credential
        ? credential.status === "active" ? "connected" : "revoked"
        : "missing",
      credential,
      ...socialCredentialReadbackSafety(),
    };
  });
}

function newestSocialCredentialReadbackForProvider(
  credentials: SocialConnectorCredentialReadback[],
  provider: SocialConnectorProviderId,
) {
  const providerCredentials = credentials.filter((credential) =>
    credential.provider === provider &&
    credential.purpose === SOCIAL_CONNECTOR_PURPOSE &&
    (credential.status === "active" || credential.status === "revoked")
  );
  return newestSocialCredentialReadback(providerCredentials.filter((credential) => credential.status === "active")) ??
    newestSocialCredentialReadback(providerCredentials.filter((credential) => credential.status === "revoked"));
}

function newestSocialCredentialReadback(credentials: SocialConnectorCredentialReadback[]) {
  return credentials.reduce<SocialConnectorCredentialReadback | null>((selected, credential) => {
    if (!selected) return credential;
    return socialCredentialReadbackTimestamp(credential) > socialCredentialReadbackTimestamp(selected)
      ? credential
      : selected;
  }, null);
}

function socialCredentialReadbackTimestamp(credential: SocialConnectorCredentialReadback) {
  const candidates = credential.status === "revoked"
    ? [credential.revokedAt, credential.updatedAt, credential.createdAt]
    : [credential.createdAt, credential.updatedAt, credential.rotatedAt];

  for (const value of candidates) {
    if (!value) continue;
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) return timestamp;
  }

  return 0;
}

function socialCredentialInvalidResponse(res: Response) {
  return res.status(400).json({
    error: "Social connector credential request is invalid.",
    code: "social_connector_credential_invalid",
    status: "invalid_request",
    purpose: SOCIAL_CONNECTOR_PURPOSE,
    ownerOnly: true,
    ...socialCredentialWriteSafety(false),
  });
}

function socialCredentialEncryptionRequiredResponse(res: Response) {
  return res.status(503).json({
    error: "Social connector credential encryption is not configured.",
    code: "social_connector_credential_encryption_required",
    status: "encryption_required",
    purpose: SOCIAL_CONNECTOR_PURPOSE,
    ownerOnly: true,
    ...socialCredentialWriteSafety(false),
  });
}

function socialCredentialStorageFailureResponse(res: Response, error: unknown) {
  if (
    error instanceof SocialConnectorCredentialStorageError &&
    (
      error.code === "social_connector_credential_provider_unsupported" ||
      error.code === "social_connector_credential_payload_invalid"
    )
  ) {
    return socialCredentialInvalidResponse(res);
  }

  if (
    error instanceof SocialConnectorCredentialStorageError &&
    (
      error.code === "social_connector_credential_encryption_unconfigured" ||
      error.code === "social_connector_credential_encryption_malformed"
    )
  ) {
    return socialCredentialEncryptionRequiredResponse(res);
  }

  return res.status(503).json({
    error: "Social connector credential storage is unavailable.",
    code: "social_connector_credential_unavailable",
    status: "credential_storage_unavailable",
    purpose: SOCIAL_CONNECTOR_PURPOSE,
    ownerOnly: true,
    ...socialCredentialWriteSafety(false),
  });
}

function socialCredentialReadbackSafety() {
  return {
    tokenDecryptEnabled: false,
    tokenExchangeEnabled: false,
    providerTokenEndpointCallsEnabled: false,
    credentialWritesEnabled: false,
    localCredentialRevokeEnabled: false,
    providerCallsEnabled: false,
    postingEnabled: false,
    queueEnabled: false,
    uiChangesEnabled: false,
    legacySocialTablesEnabled: false,
  };
}

function socialCredentialWriteSafety(credentialWritesEnabled: boolean) {
  return {
    tokenDecryptEnabled: false,
    tokenExchangeEnabled: false,
    providerTokenEndpointCallsEnabled: false,
    credentialWritesEnabled,
    localCredentialRevokeEnabled: false,
    providerTokenRevocationEnabled: false,
    providerCallsEnabled: false,
    postingEnabled: false,
    queueEnabled: false,
    uiChangesEnabled: false,
    legacySocialTablesEnabled: false,
  };
}

function socialCredentialRevokeSafety(localCredentialRevokeEnabled: boolean) {
  return {
    tokenDecryptEnabled: false,
    tokenExchangeEnabled: false,
    providerTokenEndpointCallsEnabled: false,
    credentialWritesEnabled: false,
    localCredentialRevokeEnabled,
    providerTokenRevocationEnabled: false,
    providerCallsEnabled: false,
    postingEnabled: false,
    queueEnabled: false,
    uiChangesEnabled: false,
    legacySocialTablesEnabled: false,
  };
}
