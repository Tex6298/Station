import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  archiveConnectorProviderLabel,
  type ArchiveConnectorProviderId,
} from "./credential-contract";

export type ArchiveConnectorSourceFamily =
  | "reddit_subreddit_memberships"
  | "reddit_user_history"
  | "reddit_read"
  | "discord_guilds"
  | "discord_channels"
  | "discord_messages"
  | "discord_dms"
  | "discord_bots_webhooks";

export type ArchiveConnectorSourceState =
  | "available"
  | "scope_missing"
  | "unsupported"
  | "deferred"
  | "blocked";

export type ArchiveConnectorScopeProfile = "connect" | "source_inventory";

export type ArchiveConnectorSourceFamilyContract = {
  provider: ArchiveConnectorProviderId;
  sourceFamily: ArchiveConnectorSourceFamily;
  label: string;
  state: ArchiveConnectorSourceState;
  requiredScopes: string[];
  consentCopy: string;
  reconnectRequired: boolean;
  ownerOnly: true;
  purpose: "archive_connector";
  safeFields: string[];
  capabilities: {
    accountProofOnly: boolean;
    sourceMetadataReadback: boolean;
    sourceBodyReadback: false;
    rawProviderIdsReturned: false;
    providerPayloadReturned: false;
    importWritesEnabled: false;
  };
};

export type ArchiveConnectorAccountScopeReadback = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  ownerOnly: true;
  providerLabel: string;
  accountLabel: string | null;
  externalAccountFingerprintPresent: boolean;
  connectionScopeState: "account_proof_only" | "source_scope_ready" | "scope_missing";
  reconnectRequiredForSourceInventory: boolean;
  allowedMetadata: string[];
  forbiddenMetadata: string[];
  safety: {
    rawExternalAccountIdsReturned: false;
    providerUsernamesReturned: false;
    tokenPayloadScopesReturned: false;
    encryptedCredentialReturned: false;
    tokenDecryptInThisSlice: false;
    providerLookupInThisSlice: false;
  };
};

export type ArchiveConnectorSourceScopeContractReadback = {
  purpose: "archive_connector";
  ownerOnly: true;
  providers: Array<{
    id: ArchiveConnectorProviderId;
    label: string;
    connectProofScope: string;
    connectProofOnlyState: "scope_missing";
    reconnectCopy: string;
  }>;
  sourceFamilies: ArchiveConnectorSourceFamilyContract[];
  accountMetadataPolicy: {
    allowed: string[];
    forbidden: string[];
  };
  noImportBoundary: {
    archiveSourceWritesEnabled: false;
    importJobsEnabled: false;
    memoryWritesEnabled: false;
    canonWritesEnabled: false;
    continuityWritesEnabled: false;
    publicDocumentWritesEnabled: false;
    reviewCandidateWritesEnabled: false;
  };
};

const SAFE_SOURCE_FIELDS = [
  "provider",
  "sourceFamily",
  "label",
  "state",
  "requiredScopes",
  "ownerOnly",
  "purpose",
  "capabilities",
];

const ACCOUNT_ALLOWED_METADATA = [
  "provider",
  "purpose",
  "accountLabel",
  "externalAccountFingerprintPresent",
  "connectionScopeState",
  "reconnectRequiredForSourceInventory",
];

const ACCOUNT_FORBIDDEN_METADATA = [
  "rawExternalAccountId",
  "providerUsername",
  "providerDisplayName",
  "email",
  "avatarUrl",
  "discriminator",
  "globalName",
  "locale",
  "premiumFlags",
  "providerPayload",
  "tokenPayloadScopes",
  "encryptedCredential",
  "oauthState",
  "secretValues",
];

const SOURCE_FAMILIES: ArchiveConnectorSourceFamilyContract[] = [
  sourceFamily({
    provider: "reddit",
    sourceFamily: "reddit_subreddit_memberships",
    label: "Reddit subreddit memberships",
    state: "scope_missing",
    requiredScopes: ["mysubreddits"],
    consentCopy: "Allow Station to list your Reddit subreddit memberships so you can choose archive sources.",
  }),
  sourceFamily({
    provider: "reddit",
    sourceFamily: "reddit_user_history",
    label: "Reddit saved, voted, submitted, and comment history",
    state: "scope_missing",
    requiredScopes: ["history"],
    consentCopy: "Allow Station to list your Reddit saved, voted, submitted, and comment history categories for source selection.",
  }),
  sourceFamily({
    provider: "reddit",
    sourceFamily: "reddit_read",
    label: "Reddit read access",
    state: "deferred",
    requiredScopes: ["read"],
    consentCopy: "Reddit read access is separate and requires a later owner consent decision before Station can use it.",
  }),
  sourceFamily({
    provider: "discord",
    sourceFamily: "discord_guilds",
    label: "Discord server availability",
    state: "scope_missing",
    requiredScopes: ["guilds"],
    consentCopy: "Allow Station to list your Discord servers so you can choose archive sources.",
  }),
  sourceFamily({
    provider: "discord",
    sourceFamily: "discord_channels",
    label: "Discord channel inventory",
    state: "deferred",
    requiredScopes: [],
    consentCopy: "Discord channel inventory is deferred until a later bot, install, or server-side access policy is accepted.",
  }),
  sourceFamily({
    provider: "discord",
    sourceFamily: "discord_messages",
    label: "Discord message inventory",
    state: "deferred",
    requiredScopes: [],
    consentCopy: "Discord message inventory is deferred and cannot be inferred from identify or guilds consent.",
  }),
  sourceFamily({
    provider: "discord",
    sourceFamily: "discord_dms",
    label: "Discord direct messages",
    state: "unsupported",
    requiredScopes: [],
    consentCopy: "Discord direct messages are unsupported for Station archive connector inventory.",
  }),
  sourceFamily({
    provider: "discord",
    sourceFamily: "discord_bots_webhooks",
    label: "Discord bots and webhooks",
    state: "deferred",
    requiredScopes: [],
    consentCopy: "Discord bot and webhook access requires a separate future installation and permission model.",
  }),
];

const SCOPE_PROFILE_SCOPES: Record<ArchiveConnectorProviderId, Record<ArchiveConnectorScopeProfile, string[]>> = {
  reddit: {
    connect: ["identity"],
    source_inventory: ["identity", "mysubreddits", "history"],
  },
  discord: {
    connect: ["identify"],
    source_inventory: ["identify", "guilds"],
  },
};

export function archiveConnectorSourceScopeContract(): ArchiveConnectorSourceScopeContractReadback {
  return {
    purpose: "archive_connector",
    ownerOnly: true,
    providers: ARCHIVE_CONNECTOR_PROVIDER_IDS.map((id) => ({
      id,
      label: archiveConnectorProviderLabel(id),
      connectProofScope: connectProofScopeForProvider(id),
      connectProofOnlyState: "scope_missing",
      reconnectCopy: reconnectCopyForProvider(id),
    })),
    sourceFamilies: SOURCE_FAMILIES.map((family) => ({ ...family })),
    accountMetadataPolicy: {
      allowed: [...ACCOUNT_ALLOWED_METADATA],
      forbidden: [...ACCOUNT_FORBIDDEN_METADATA],
    },
    noImportBoundary: {
      archiveSourceWritesEnabled: false,
      importJobsEnabled: false,
      memoryWritesEnabled: false,
      canonWritesEnabled: false,
      continuityWritesEnabled: false,
      publicDocumentWritesEnabled: false,
      reviewCandidateWritesEnabled: false,
    },
  };
}

export function archiveConnectorScopesForProfile(
  provider: ArchiveConnectorProviderId,
  scopeProfile: ArchiveConnectorScopeProfile,
) {
  return [...SCOPE_PROFILE_SCOPES[provider][scopeProfile]];
}

export function archiveConnectorScopeProfileReadback(
  provider: ArchiveConnectorProviderId,
  scopeProfile: ArchiveConnectorScopeProfile,
) {
  const requestedScopes = archiveConnectorScopesForProfile(provider, scopeProfile);
  return {
    provider,
    purpose: "archive_connector" as const,
    ownerOnly: true as const,
    scopeProfile,
    requestedScopes,
    consentCopy: consentCopyForProfile(provider, scopeProfile),
    connectProofOnly: scopeProfile === "connect",
    sourceInventoryRequested: scopeProfile === "source_inventory",
  };
}

export function archiveConnectorScopeProfileFromValue(value: unknown): ArchiveConnectorScopeProfile | null {
  if (value == null) return "connect";
  return value === "connect" || value === "source_inventory" ? value : null;
}

export function normalizeArchiveConnectorGrantedScopes(
  provider: ArchiveConnectorProviderId,
  grantedScopes: readonly string[] | null | undefined,
) {
  const values = (grantedScopes ?? []).filter((scope) => typeof scope === "string");
  const canonicalOrder = [
    ...SCOPE_PROFILE_SCOPES[provider].source_inventory,
    ...SCOPE_PROFILE_SCOPES[provider].connect,
  ];
  const unique = [...new Set(values.map((scope) => scope.trim()).filter(Boolean))];
  return canonicalOrder.filter((scope, index, all) =>
    all.indexOf(scope) === index && unique.includes(scope)
  );
}

export function archiveConnectorConnectionScopeState(input: {
  provider: ArchiveConnectorProviderId;
  grantedScopes: readonly string[];
}) {
  const normalized = normalizeArchiveConnectorGrantedScopes(input.provider, input.grantedScopes);
  const sourceScopes = archiveConnectorScopesForProfile(input.provider, "source_inventory");
  const connectScopes = archiveConnectorScopesForProfile(input.provider, "connect");
  const sourceReady = sameScopeSet(normalized, sourceScopes);
  const connectOnly = sameScopeSet(normalized, connectScopes);
  return {
    grantedScopes: normalized.length > 0 ? normalized : connectScopes,
    connectionScopeState: sourceReady
      ? "source_scope_ready" as const
      : connectOnly ? "account_proof_only" as const : "scope_missing" as const,
    reconnectRequiredForSourceInventory: !sourceReady,
  };
}

export function archiveConnectorAccountScopeReadback(input: {
  provider: ArchiveConnectorProviderId;
  grantedScopes: string[];
  accountLabel?: string | null;
  externalAccountFingerprintPresent?: boolean | null;
  rawExternalAccountId?: string | null;
  providerUsername?: string | null;
  providerPayload?: unknown;
  encryptedCredential?: unknown;
}) : ArchiveConnectorAccountScopeReadback {
  const scopeState = archiveConnectorConnectionScopeState({
    provider: input.provider,
    grantedScopes: input.grantedScopes,
  });

  return {
    provider: input.provider,
    purpose: "archive_connector",
    ownerOnly: true,
    providerLabel: archiveConnectorProviderLabel(input.provider),
    accountLabel: safeAccountLabel(input.accountLabel),
    externalAccountFingerprintPresent: Boolean(input.externalAccountFingerprintPresent),
    connectionScopeState: scopeState.connectionScopeState,
    reconnectRequiredForSourceInventory: scopeState.reconnectRequiredForSourceInventory,
    allowedMetadata: [...ACCOUNT_ALLOWED_METADATA],
    forbiddenMetadata: [...ACCOUNT_FORBIDDEN_METADATA],
    safety: {
      rawExternalAccountIdsReturned: false,
      providerUsernamesReturned: false,
      tokenPayloadScopesReturned: false,
      encryptedCredentialReturned: false,
      tokenDecryptInThisSlice: false,
      providerLookupInThisSlice: false,
    },
  };
}

export function archiveConnectorSourceFamiliesForProvider(provider: ArchiveConnectorProviderId) {
  return sourceFamiliesForProvider(provider).map((family) => ({ ...family }));
}

function sourceFamily(input: Omit<ArchiveConnectorSourceFamilyContract, "ownerOnly" | "purpose" | "safeFields" | "capabilities" | "reconnectRequired">): ArchiveConnectorSourceFamilyContract {
  return {
    ...input,
    reconnectRequired: input.state === "scope_missing",
    ownerOnly: true,
    purpose: "archive_connector",
    safeFields: [...SAFE_SOURCE_FIELDS],
    capabilities: {
      accountProofOnly: false,
      sourceMetadataReadback: input.state === "scope_missing",
      sourceBodyReadback: false,
      rawProviderIdsReturned: false,
      providerPayloadReturned: false,
      importWritesEnabled: false,
    },
  };
}

function sourceFamiliesForProvider(provider: ArchiveConnectorProviderId) {
  return SOURCE_FAMILIES.filter((family) => family.provider === provider);
}

function connectProofScopeForProvider(provider: ArchiveConnectorProviderId) {
  return provider === "reddit" ? "identity" : "identify";
}

function consentCopyForProfile(provider: ArchiveConnectorProviderId, scopeProfile: ArchiveConnectorScopeProfile) {
  if (provider === "reddit" && scopeProfile === "source_inventory") {
    return "Reconnect Reddit so Station can list subreddit memberships and Reddit history categories for archive source selection.";
  }
  if (provider === "discord" && scopeProfile === "source_inventory") {
    return "Reconnect Discord so Station can list your Discord servers for archive source selection.";
  }
  return `${archiveConnectorProviderLabel(provider)} connect proof confirms the account only; reconnect is required before source inventory.`;
}

function sameScopeSet(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && right.every((scope) => left.includes(scope));
}

function reconnectCopyForProvider(provider: ArchiveConnectorProviderId) {
  return provider === "reddit"
    ? "Reconnect Reddit with explicit source scopes before Station can list archive sources."
    : "Reconnect Discord with explicit guilds consent before Station can list archive sources.";
}

function safeAccountLabel(value?: string | null) {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (/token|secret|cookie|credential|oauth|code|private|source|body|snippet|payload|external|account[_ -]?id|bearer|sk-/i.test(trimmed)) {
    return null;
  }
  return trimmed.slice(0, 80);
}
