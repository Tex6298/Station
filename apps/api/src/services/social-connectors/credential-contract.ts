export const SOCIAL_CONNECTOR_PROVIDER_IDS = ["bluesky"] as const;

export type SocialConnectorProviderId = typeof SOCIAL_CONNECTOR_PROVIDER_IDS[number];
export type SocialConnectorCredentialCategory = "manual_credential";
export type SocialConnectorCredentialStatus = "active" | "revoked";

export const SOCIAL_CONNECTOR_PURPOSE = "social_connector" as const;
export const SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA = "station.social_connector.credential.v1";
export const SOCIAL_CONNECTOR_CREDENTIAL_ALGORITHM = "aes-256-gcm";
export const SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV = "SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY";

export interface SocialConnectorCredentialReadbackInput {
  provider: SocialConnectorProviderId;
  status: SocialConnectorCredentialStatus;
  category?: SocialConnectorCredentialCategory;
  createdAt?: string | null;
  updatedAt?: string | null;
  rotatedAt?: string | null;
  revokedAt?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  appPassword?: string | null;
  oauthCode?: string | null;
  providerAccountId?: string | null;
  handle?: string | null;
  callbackValue?: string | null;
  encryptedCredential?: unknown;
}

export interface SocialConnectorCredentialReadback {
  provider: SocialConnectorProviderId;
  providerLabel: string;
  purpose: typeof SOCIAL_CONNECTOR_PURPOSE;
  status: SocialConnectorCredentialStatus;
  category: SocialConnectorCredentialCategory;
  configured: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  rotatedAt: string | null;
  revokedAt: string | null;
  safety: {
    secretValuesReturned: false;
    rawEncryptedPayloadReturned: false;
    oauthInThisSlice: false;
    providerLookupInThisSlice: false;
    postingInThisSlice: false;
  };
}

export interface SocialConnectorCredentialContract {
  purpose: typeof SOCIAL_CONNECTOR_PURPOSE;
  envelopeSchema: typeof SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA;
  keyEnvironmentVariable: typeof SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV;
  providers: Array<{
    id: SocialConnectorProviderId;
    label: string;
    authStyle: SocialConnectorCredentialCategory;
    status: "storage_contract_only";
  }>;
  secretHandlingRules: string[];
  pausedRuntimeBoundary: string[];
}

export function socialConnectorProviderLabel(provider: SocialConnectorProviderId) {
  return provider === "bluesky" ? "Bluesky" : "Bluesky";
}

export function socialConnectorCredentialReadback(
  input: SocialConnectorCredentialReadbackInput,
): SocialConnectorCredentialReadback {
  return {
    provider: input.provider,
    providerLabel: socialConnectorProviderLabel(input.provider),
    purpose: SOCIAL_CONNECTOR_PURPOSE,
    status: input.status,
    category: input.category ?? "manual_credential",
    configured: input.status === "active",
    createdAt: input.createdAt ?? null,
    updatedAt: input.updatedAt ?? null,
    rotatedAt: input.rotatedAt ?? null,
    revokedAt: input.revokedAt ?? null,
    safety: {
      secretValuesReturned: false,
      rawEncryptedPayloadReturned: false,
      oauthInThisSlice: false,
      providerLookupInThisSlice: false,
      postingInThisSlice: false,
    },
  };
}

export function socialConnectorCredentialContract(): SocialConnectorCredentialContract {
  return {
    purpose: SOCIAL_CONNECTOR_PURPOSE,
    envelopeSchema: SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA,
    keyEnvironmentVariable: SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV,
    providers: SOCIAL_CONNECTOR_PROVIDER_IDS.map((id) => ({
      id,
      label: socialConnectorProviderLabel(id),
      authStyle: "manual_credential",
      status: "storage_contract_only",
    })),
    secretHandlingRules: [
      "Credential material is encrypted with a social-specific AES-256-GCM envelope before storage.",
      "Access tokens, refresh tokens, app passwords, OAuth codes, callback values, provider account ids, handles, webhook payloads, and env values are never returned in readback.",
      "Readback contains only provider, status, timestamp, and category metadata.",
    ],
    pausedRuntimeBoundary: [
      "PR500A creates no OAuth redirect, callback verification, token exchange, provider lookup, provider API call, queue, worker, webhook, billing, or posting execution.",
      "Active /social routes remain PR476A readback-only and fail closed before social table writes or provider calls.",
      "Legacy plaintext social publishing tables are not used for new credential behavior.",
    ],
  };
}

export function isSocialConnectorProviderId(value: unknown): value is SocialConnectorProviderId {
  return SOCIAL_CONNECTOR_PROVIDER_IDS.includes(value as SocialConnectorProviderId);
}
