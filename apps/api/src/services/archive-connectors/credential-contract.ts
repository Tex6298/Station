export const ARCHIVE_CONNECTOR_PROVIDER_IDS = ["reddit", "discord"] as const;

export type ArchiveConnectorProviderId = typeof ARCHIVE_CONNECTOR_PROVIDER_IDS[number];
export type ArchiveConnectorCredentialState =
  | "not_configured"
  | "oauth_app_missing"
  | "ready_for_oauth"
  | "connected_redacted"
  | "revoked"
  | "blocked";

export interface ArchiveConnectorCredentialReadbackInput {
  providerId: ArchiveConnectorProviderId;
  state: ArchiveConnectorCredentialState;
  oauthAppConfigured?: boolean | null;
  connectedAt?: string | null;
  revokedAt?: string | null;
  blockedReason?: string | null;
  accountLabel?: string | null;
  rawExternalAccountId?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  oauthCode?: string | null;
  cookie?: string | null;
  credential?: string | null;
}

export interface ArchiveConnectorCredentialReadback {
  providerId: ArchiveConnectorProviderId;
  providerLabel: string;
  purpose: "archive_connector";
  ownerOnly: true;
  state: ArchiveConnectorCredentialState;
  stateLabel: string;
  detail: string;
  oauthAppConfigured: boolean | null;
  connectedAt?: string;
  revokedAt?: string;
  accountReadback?: string;
  safeNextAction: string;
  safety: {
    secretValuesReturned: false;
    rawExternalAccountIdsReturned: false;
    tokenExchangeInThisSlice: false;
    importWritesBeforeOwnerConfirmation: false;
    sourceInventoryBodyAccess: false;
  };
}

export interface ArchiveConnectorContractReadback {
  purpose: "archive_connector";
  providers: Array<{
    id: ArchiveConnectorProviderId;
    label: string;
    authStyle: "oauth";
  }>;
  credentialStates: Array<{
    state: ArchiveConnectorCredentialState;
    label: string;
    detail: string;
  }>;
  oauthExpectations: string[];
  secretHandlingRules: string[];
  futureStorageExpectation: string;
  sourceInventoryBoundary: string[];
  importPermissionBoundary: string[];
}

const STATE_DETAILS: Record<ArchiveConnectorCredentialState, { label: string; detail: string; nextAction: string }> = {
  not_configured: {
    label: "Not configured",
    detail: "No archive connector credential setup has been started for this owner and provider.",
    nextAction: "Choose this provider only after a dedicated owner credential setup route exists.",
  },
  oauth_app_missing: {
    label: "OAuth app missing",
    detail: "Provider app configuration is not available for archive connector OAuth.",
    nextAction: "Configure provider app metadata in a future lane before redirecting an owner.",
  },
  ready_for_oauth: {
    label: "Ready for OAuth",
    detail: "The provider app can start an owner-bound OAuth handshake in a future route lane.",
    nextAction: "Create an owner/session-bound OAuth state before any provider redirect.",
  },
  connected_redacted: {
    label: "Connected (redacted)",
    detail: "A connector credential may exist, but public and owner readback must never return token material or raw external ids.",
    nextAction: "Use safe metadata and counts only; require owner confirmation before any import write.",
  },
  revoked: {
    label: "Revoked",
    detail: "The owner or system has revoked this connector credential.",
    nextAction: "Require a fresh owner-bound OAuth setup before future source inventory.",
  },
  blocked: {
    label: "Blocked",
    detail: "This connector is blocked by policy, missing configuration, or an unsafe credential state.",
    nextAction: "Resolve the blocker in a separate credential/storage lane before source inventory.",
  },
};

export function archiveConnectorProviderLabel(providerId: ArchiveConnectorProviderId) {
  return providerId === "reddit" ? "Reddit" : "Discord";
}

export function archiveConnectorCredentialReadback(
  input: ArchiveConnectorCredentialReadbackInput,
): ArchiveConnectorCredentialReadback {
  const state = STATE_DETAILS[input.state];
  const connected = input.state === "connected_redacted";
  const accountReadback = connected ? `${archiveConnectorProviderLabel(input.providerId)} account connected; external account id redacted.` : undefined;
  const blockedReason = input.state === "blocked" ? safeBlockedReason(input.blockedReason) : null;

  return {
    providerId: input.providerId,
    providerLabel: archiveConnectorProviderLabel(input.providerId),
    purpose: "archive_connector",
    ownerOnly: true,
    state: input.state,
    stateLabel: state.label,
    detail: blockedReason ? `${state.detail} ${blockedReason}` : state.detail,
    oauthAppConfigured: typeof input.oauthAppConfigured === "boolean" ? input.oauthAppConfigured : null,
    connectedAt: connected && input.connectedAt ? input.connectedAt : undefined,
    revokedAt: input.state === "revoked" && input.revokedAt ? input.revokedAt : undefined,
    accountReadback,
    safeNextAction: state.nextAction,
    safety: {
      secretValuesReturned: false,
      rawExternalAccountIdsReturned: false,
      tokenExchangeInThisSlice: false,
      importWritesBeforeOwnerConfirmation: false,
      sourceInventoryBodyAccess: false,
    },
  };
}

export function archiveConnectorCredentialContract(): ArchiveConnectorContractReadback {
  return {
    purpose: "archive_connector",
    providers: ARCHIVE_CONNECTOR_PROVIDER_IDS.map((id) => ({
      id,
      label: archiveConnectorProviderLabel(id),
      authStyle: "oauth",
    })),
    credentialStates: Object.entries(STATE_DETAILS).map(([state, detail]) => ({
      state: state as ArchiveConnectorCredentialState,
      label: detail.label,
      detail: detail.detail,
    })),
    oauthExpectations: [
      "OAuth state is bound to owner, active session, provider, and archive connector purpose.",
      "OAuth state uses a one-time nonce with a short expiry and csrf protection.",
      "Callback code is accepted only by a future callback route and is never logged, returned, or stored as readback.",
      "PR484A defines expectations only; it performs no provider redirect, callback handling, token exchange, refresh, or revocation.",
    ],
    secretHandlingRules: [
      "Access tokens, refresh tokens, OAuth codes, cookies, credentials, and secret-shaped values are never returned in readback.",
      "Raw external account ids are not returned; future readback may expose only safe provider labels and aggregate status.",
      "Logs, docs, tests, API responses, and UI must use redacted fixtures instead of real connector secrets.",
    ],
    futureStorageExpectation: "External archive connector secrets require a dedicated encrypted connector credential schema and environment key before storage.",
    sourceInventoryBoundary: [
      "Future provider inventory may return safe metadata and counts only.",
      "Private source bodies, private messages, archive snippets, unsafe permalinks, provider payloads, and raw external ids stay out of inventory readback.",
    ],
    importPermissionBoundary: [
      "No archive source, import job, Memory, Canon, Continuity, public document, or review candidate is created before explicit owner confirmation.",
      "Import preview remains the no-write model for local parser readback until a separate live connector lane is accepted.",
    ],
  };
}

function safeBlockedReason(value?: string | null) {
  if (!value) return null;
  if (/token|secret|cookie|credential|oauth|code|private|source|body|snippet|external|account|id|bearer|sk-/i.test(value)) {
    return "Blocker details redacted.";
  }
  return value.slice(0, 120);
}
