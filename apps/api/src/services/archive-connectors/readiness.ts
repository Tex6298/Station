import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  archiveConnectorProviderLabel,
  type ArchiveConnectorProviderId,
} from "./credential-contract";
import { archiveConnectorCredentialEncryptionConfigured } from "./credential-storage";
import { archiveConnectorScopeProfileReadback } from "./source-scope-contract";

export type ProviderOAuthAppStatus = "missing" | "partial" | "configured";
type ProviderReadinessStatus =
  | "credential_encryption_required"
  | "provider_app_missing"
  | "provider_app_partial"
  | "provider_app_configured";

export type ArchiveConnectorReadinessProvider = {
  id: ArchiveConnectorProviderId;
  label: string;
  authStyle: "oauth";
  ownerOnly: true;
  purpose: "archive_connector";
  status: ProviderReadinessStatus;
  nextAction: string;
  credentialStorageAccepted: true;
  credentialEncryptionConfigured: boolean;
  providerOAuthAppConfigAccepted: true;
  oauthAppConfigured: boolean;
  oauthAppStatus: ProviderOAuthAppStatus;
  credentialWritesEnabled: false;
  oauthStateCreationEnabled: false;
  oauthRedirectsEnabled: false;
  oauthCallbacksEnabled: false;
  tokenExchangeEnabled: false;
  providerCallsEnabled: false;
  sourceInventoryEnabled: false;
  importWritesEnabled: false;
  scopeProfiles: ReturnType<typeof archiveConnectorScopeProfileReadback>[];
};

export type ArchiveConnectorReadiness = {
  purpose: "archive_connector";
  mode: "readiness_only";
  ownerOnly: true;
  credentialStorageAccepted: true;
  credentialEncryptionConfigured: boolean;
  providerOAuthAppConfigAccepted: true;
  providerOAuthAppsConfigured: boolean;
  providers: ArchiveConnectorReadinessProvider[];
  safety: {
    credentialWritesEnabled: false;
    oauthStateCreationEnabled: false;
    oauthRedirectsEnabled: false;
    oauthCallbacksEnabled: false;
    tokenExchangeEnabled: false;
    providerCallsEnabled: false;
    sourceInventoryEnabled: false;
    importWritesEnabled: false;
  };
};

const ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG: Record<
  ArchiveConnectorProviderId,
  { clientId: string; clientSecret: string }
> = {
  reddit: {
    clientId: "ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID",
    clientSecret: "ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET",
  },
  discord: {
    clientId: "ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID",
    clientSecret: "ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET",
  },
};

export function archiveConnectorReadiness(): ArchiveConnectorReadiness {
  const credentialEncryptionConfigured = archiveConnectorCredentialEncryptionConfigured();
  const providers = ARCHIVE_CONNECTOR_PROVIDER_IDS.map((providerId) =>
    archiveConnectorProviderReadiness(providerId, credentialEncryptionConfigured)
  );

  return {
    purpose: "archive_connector",
    mode: "readiness_only",
    ownerOnly: true,
    credentialStorageAccepted: true,
    credentialEncryptionConfigured,
    providerOAuthAppConfigAccepted: true,
    providerOAuthAppsConfigured: providers.every((provider) => provider.oauthAppConfigured),
    providers,
    safety: disabledSafety(),
  };
}

function archiveConnectorProviderReadiness(
  providerId: ArchiveConnectorProviderId,
  credentialEncryptionConfigured: boolean,
): ArchiveConnectorReadinessProvider {
  const oauthAppStatus = archiveConnectorProviderOAuthAppStatus(providerId);
  const status = providerReadinessStatus(credentialEncryptionConfigured, oauthAppStatus);

  return {
    id: providerId,
    label: archiveConnectorProviderLabel(providerId),
    authStyle: "oauth",
    ownerOnly: true,
    purpose: "archive_connector",
    status,
    nextAction: providerNextAction(status),
    credentialStorageAccepted: true,
    credentialEncryptionConfigured,
    providerOAuthAppConfigAccepted: true,
    oauthAppConfigured: oauthAppStatus === "configured",
    oauthAppStatus,
    credentialWritesEnabled: false,
    oauthStateCreationEnabled: false,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: false,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
    scopeProfiles: [
      archiveConnectorScopeProfileReadback(providerId, "connect"),
      archiveConnectorScopeProfileReadback(providerId, "source_inventory"),
    ],
  };
}

export function archiveConnectorProviderOAuthAppStatus(providerId: ArchiveConnectorProviderId): ProviderOAuthAppStatus {
  const config = ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG[providerId];
  const hasClientId = hasEnvValue(config.clientId);
  const hasClientSecret = hasEnvValue(config.clientSecret);

  if (hasClientId && hasClientSecret) return "configured";
  if (hasClientId || hasClientSecret) return "partial";
  return "missing";
}

export function archiveConnectorProviderOAuthClientId(providerId: ArchiveConnectorProviderId) {
  const config = ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG[providerId];
  return process.env[config.clientId]?.trim() || null;
}

export function archiveConnectorProviderOAuthClientSecret(providerId: ArchiveConnectorProviderId) {
  const config = ARCHIVE_CONNECTOR_PROVIDER_APP_CONFIG[providerId];
  return process.env[config.clientSecret]?.trim() || null;
}

function providerReadinessStatus(
  credentialEncryptionConfigured: boolean,
  oauthAppStatus: ProviderOAuthAppStatus,
): ProviderReadinessStatus {
  if (!credentialEncryptionConfigured) return "credential_encryption_required";
  if (oauthAppStatus === "configured") return "provider_app_configured";
  if (oauthAppStatus === "partial") return "provider_app_partial";
  return "provider_app_missing";
}

function providerNextAction(status: ProviderReadinessStatus) {
  if (status === "credential_encryption_required") {
    return "Configure connector credential encryption before enabling provider OAuth setup.";
  }
  if (status === "provider_app_configured") {
    return "Provider app config and credential encryption are present; accepted OAuth start, authorization URL, callback, and token exchange routes remain owner-gated while source inventory and imports require future lanes.";
  }
  if (status === "provider_app_partial") {
    return "Complete the accepted archive-specific provider app pair; readiness does not expose which side is present.";
  }
  return "Add both accepted archive-specific provider app values before enabling owner OAuth setup.";
}

function hasEnvValue(name: string) {
  return Boolean(process.env[name]?.trim());
}

function disabledSafety(): ArchiveConnectorReadiness["safety"] {
  return {
    credentialWritesEnabled: false,
    oauthStateCreationEnabled: false,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: false,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  };
}
