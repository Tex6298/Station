import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  archiveConnectorProviderLabel,
  type ArchiveConnectorProviderId,
} from "./credential-contract";
import { archiveConnectorCredentialEncryptionConfigured } from "./credential-storage";

export type ArchiveConnectorReadinessProvider = {
  id: ArchiveConnectorProviderId;
  label: string;
  authStyle: "oauth";
  ownerOnly: true;
  purpose: "archive_connector";
  status: "setup_required" | "provider_app_not_accepted";
  nextAction: string;
  credentialStorageAccepted: true;
  credentialEncryptionConfigured: boolean;
  oauthAppConfigured: false;
  oauthAppStatus: "not_accepted";
  credentialWritesEnabled: false;
  oauthStateCreationEnabled: false;
  oauthRedirectsEnabled: false;
  oauthCallbacksEnabled: false;
  tokenExchangeEnabled: false;
  providerCallsEnabled: false;
  sourceInventoryEnabled: false;
  importWritesEnabled: false;
};

export type ArchiveConnectorReadiness = {
  purpose: "archive_connector";
  mode: "readiness_only";
  ownerOnly: true;
  credentialStorageAccepted: true;
  credentialEncryptionConfigured: boolean;
  providerOAuthAppsAccepted: false;
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

export function archiveConnectorReadiness(): ArchiveConnectorReadiness {
  const credentialEncryptionConfigured = archiveConnectorCredentialEncryptionConfigured();

  return {
    purpose: "archive_connector",
    mode: "readiness_only",
    ownerOnly: true,
    credentialStorageAccepted: true,
    credentialEncryptionConfigured,
    providerOAuthAppsAccepted: false,
    providers: ARCHIVE_CONNECTOR_PROVIDER_IDS.map((providerId) =>
      archiveConnectorProviderReadiness(providerId, credentialEncryptionConfigured)
    ),
    safety: disabledSafety(),
  };
}

function archiveConnectorProviderReadiness(
  providerId: ArchiveConnectorProviderId,
  credentialEncryptionConfigured: boolean,
): ArchiveConnectorReadinessProvider {
  const status = credentialEncryptionConfigured ? "provider_app_not_accepted" : "setup_required";

  return {
    id: providerId,
    label: archiveConnectorProviderLabel(providerId),
    authStyle: "oauth",
    ownerOnly: true,
    purpose: "archive_connector",
    status,
    nextAction: credentialEncryptionConfigured
      ? "Accept archive connector provider app configuration before enabling owner OAuth setup."
      : "Configure archive connector credential encryption before enabling any credential write lane.",
    credentialStorageAccepted: true,
    credentialEncryptionConfigured,
    oauthAppConfigured: false,
    oauthAppStatus: "not_accepted",
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
