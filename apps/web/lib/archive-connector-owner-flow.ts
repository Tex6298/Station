import { ApiRequestError, apiGet, apiPost } from "./api-client";

export const ARCHIVE_CONNECTOR_OWNER_PROVIDER = "reddit" as const;
export const ARCHIVE_CONNECTOR_OWNER_PROVIDER_LABEL = "Reddit";
export const ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL = "Reddit saved items";
export const ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY = "reddit_user_history" as const;
export const ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND = "saved_items" as const;

export type ArchiveConnectorTone = "info" | "good" | "warning" | "danger";

export interface ArchiveConnectorReadinessProvider {
  id: "reddit" | "discord";
  label: string;
  status:
    | "credential_encryption_required"
    | "provider_app_missing"
    | "provider_app_partial"
    | "provider_app_configured";
  credentialEncryptionConfigured: boolean;
  oauthAppConfigured: boolean;
  oauthAppStatus: "missing" | "partial" | "configured";
}

export interface ArchiveConnectorReadinessResponse {
  purpose: "archive_connector";
  ownerOnly: true;
  credentialEncryptionConfigured: boolean;
  providers: ArchiveConnectorReadinessProvider[];
}

export interface ArchiveConnectorCredential {
  provider: "reddit" | "discord";
  purpose: "archive_connector";
  status: "active" | "revoked";
  configured: boolean;
  fingerprintPresent: boolean;
  externalAccountFingerprintPresent: boolean;
  scopeProfile: "connect" | "source_inventory";
  grantedScopes: string[];
  connectionScopeState: "account_proof_only" | "source_scope_ready" | "scope_missing";
  reconnectRequiredForSourceInventory: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  revokedAt: string | null;
}

export interface ArchiveConnectorCredentialProviderRow {
  provider: "reddit" | "discord";
  purpose: "archive_connector";
  connectionStatus: "missing" | "connected" | "revoked";
  credential: ArchiveConnectorCredential | null;
}

export interface ArchiveConnectorCredentialsResponse {
  status: "archive_connector_credentials_read";
  purpose: "archive_connector";
  ownerOnly: true;
  providers: ArchiveConnectorCredentialProviderRow[];
}

export interface ArchiveConnectorOAuthStartResponse {
  status: "oauth_state_created";
  provider: "reddit";
  purpose: "archive_connector";
  stateHandle: string;
  expiresAt: string;
  localRedirectPath: string | null;
  scopeProfile: "source_inventory";
}

export interface ArchiveConnectorOAuthAuthorizeResponse {
  status: "oauth_authorization_url_created";
  provider: "reddit";
  purpose: "archive_connector";
  authorizationUrl: string;
  scopeProfile: "source_inventory";
  requestedScopes: string[];
}

export interface ArchiveConnectorAccountLookupResponse {
  status: "archive_connector_account_lookup_complete";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  accountProofComplete: boolean;
  credential: ArchiveConnectorCredential;
}

export interface ArchiveConnectorSourceInventorySource {
  provider: "reddit" | "discord";
  purpose: "archive_connector";
  ownerOnly: true;
  sourceFamily: string;
  sourceKind: string;
  label: string;
  sourceKey: string;
  availability: "available" | "deferred" | "unsupported";
  truncated: boolean;
}

export interface ArchiveConnectorSourceInventoryResponse {
  status: "archive_connector_source_inventory_read";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  sources: ArchiveConnectorSourceInventorySource[];
  truncated: boolean;
}

export interface ArchiveConnectorImportIntent {
  id: string;
  provider: "reddit";
  purpose: "archive_connector";
  personaId: string;
  sourceFamily: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY;
  sourceKind: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND;
  sourceKey: string;
  sourceLabel: string;
  status: "pending" | "cancelled" | "activated";
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveConnectorImportIntentResponse {
  status: "archive_connector_import_intent_created" | "archive_connector_import_intent_exists";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  importIntentCreated: boolean;
  idempotent: boolean;
  duplicate: boolean;
  intent: ArchiveConnectorImportIntent;
}

export interface ArchiveConnectorImportIntentActivationResponse {
  status: "archive_connector_import_intent_activated" | "archive_connector_import_intent_already_activated";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  activated: boolean;
  idempotent: boolean;
  duplicate: boolean;
  intent: ArchiveConnectorImportIntent;
}

export interface ArchiveConnectorSourcePreview {
  pageLimit: 10;
  itemCount: number;
  postCount: number;
  commentCount: number;
  otherCount: number;
  truncated: boolean;
  contentReturned: false;
}

export interface ArchiveConnectorSourcePreviewResponse {
  status: "archive_connector_source_preview_read";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  intent: ArchiveConnectorImportIntent;
  preview: ArchiveConnectorSourcePreview;
}

export interface ArchiveConnectorSourceStagingRun {
  id: string;
  provider: "reddit";
  purpose: "archive_connector";
  personaId: string;
  importIntentId: string;
  sourceFamily: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY;
  sourceKind: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND;
  sourceKey: string;
  sourceLabel: string;
  status: "staged" | "superseded" | "revoked" | "imported";
  pageLimit: 10;
  itemCount: number;
  postCount: number;
  commentCount: number;
  skippedCount: number;
  truncated: boolean;
  sourceReadAt: string;
  expiresAt: string;
  importedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveConnectorSourceStagingResponse {
  status: "archive_connector_source_staging_run_created" | "archive_connector_source_staging_run_exists";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  staged: boolean;
  idempotent: boolean;
  duplicate: boolean;
  intent: ArchiveConnectorImportIntent;
  run: ArchiveConnectorSourceStagingRun;
}

export interface ArchiveConnectorStagedImportPreview {
  format: "reddit_saved_items";
  sourceFamily: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY;
  sourceKind: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND;
  pageLimit: 10;
  itemCount: number;
  postCount: number;
  commentCount: number;
  skippedCount: number;
  truncated: boolean;
  estimatedCharacterCount: number;
  estimatedNonEmptyItemCount: number;
  noWritePerformed: true;
}

export interface ArchiveConnectorStagedImportPreviewResponse {
  status: "archive_connector_source_staging_import_preview_ready";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  runId: string;
  intent: ArchiveConnectorImportIntent;
  run: ArchiveConnectorSourceStagingRun;
  preview: ArchiveConnectorStagedImportPreview;
}

export interface ArchiveConnectorImportJobReadback {
  id: string;
  kind: "archive_connector";
  status: "queued" | "processing" | "completed" | "failed";
  sourceName: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveConnectorStagedImportResponse {
  status:
    | "archive_connector_source_staging_import_completed"
    | "archive_connector_source_staging_import_already_completed"
    | "archive_connector_source_staging_import_processing";
  provider: "reddit";
  purpose: "archive_connector";
  ownerOnly: true;
  imported: boolean;
  duplicate: boolean;
  idempotent: boolean;
  pending?: boolean;
  runId: string;
  job: ArchiveConnectorImportJobReadback;
  chunksCreated: number;
  importMetadata: {
    format: "reddit_saved_items";
    sourceFamily: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY;
    sourceKind: typeof ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND;
    pageLimit: 10;
    itemCount: number;
    postCount: number;
    commentCount: number;
    skippedCount: number;
    truncated: boolean;
  };
}

export interface ArchiveConnectorOwnerStep {
  id:
    | "signed_out"
    | "loading"
    | "readiness_unavailable"
    | "readiness_disabled"
    | "credential_required"
    | "source_scope_required"
    | "account_proof_required"
    | "source_inventory_required"
    | "no_supported_source"
    | "intent_required"
    | "activation_required"
    | "source_preview_required"
    | "staging_required"
    | "staging_not_current"
    | "import_preview_required"
    | "import_ready"
    | "import_processing"
    | "import_completed"
    | "retryable_error";
  tone: ArchiveConnectorTone;
  label: string;
  body: string;
  nextAction: string;
}

export function readArchiveConnectorReadiness(token: string) {
  return apiGet<ArchiveConnectorReadinessResponse>("/archive-connectors/readiness", token);
}

export function readArchiveConnectorCredentials(token: string) {
  return apiGet<ArchiveConnectorCredentialsResponse>("/archive-connectors/credentials", token);
}

export function startArchiveConnectorRedditSourceOAuth(token: string, personaId: string) {
  return apiPost<ArchiveConnectorOAuthStartResponse>(
    "/archive-connectors/oauth/reddit/start",
    {
      localRedirectPath: archiveConnectorPersonaArchiveRedirectPath(personaId),
      scopeProfile: "source_inventory",
    },
    token,
  );
}

export function authorizeArchiveConnectorRedditOAuth(token: string, stateHandle: string) {
  return apiPost<ArchiveConnectorOAuthAuthorizeResponse>(
    "/archive-connectors/oauth/reddit/authorize",
    { stateHandle },
    token,
  );
}

export function lookupArchiveConnectorRedditAccount(token: string) {
  return apiPost<ArchiveConnectorAccountLookupResponse>(
    "/archive-connectors/credentials/reddit/account/lookup",
    strictEmptyBody(),
    token,
  );
}

export function readArchiveConnectorRedditSourceInventory(token: string) {
  return apiGet<ArchiveConnectorSourceInventoryResponse>("/archive-connectors/reddit/source-inventory", token);
}

export function createArchiveConnectorRedditSavedItemsImportIntent(input: {
  token: string;
  personaId: string;
  source: ArchiveConnectorSourceInventorySource;
}) {
  return apiPost<ArchiveConnectorImportIntentResponse>(
    "/archive-connectors/reddit/import-intents",
    archiveConnectorSavedItemsImportIntentBody(input.personaId, input.source),
    input.token,
  );
}

export function activateArchiveConnectorImportIntent(token: string, intentId: string) {
  return apiPost<ArchiveConnectorImportIntentActivationResponse>(
    `/archive-connectors/import-intents/${encodeURIComponent(intentId)}/activate`,
    strictEmptyBody(),
    token,
  );
}

export function previewArchiveConnectorIntentSource(token: string, intentId: string) {
  return apiPost<ArchiveConnectorSourcePreviewResponse>(
    `/archive-connectors/import-intents/${encodeURIComponent(intentId)}/source-preview`,
    strictEmptyBody(),
    token,
  );
}

export function createArchiveConnectorSourceStagingRun(token: string, intentId: string) {
  return apiPost<ArchiveConnectorSourceStagingResponse>(
    `/archive-connectors/import-intents/${encodeURIComponent(intentId)}/source-staging-runs`,
    strictEmptyBody(),
    token,
  );
}

export function previewArchiveConnectorSourceStagingImport(token: string, runId: string) {
  return apiPost<ArchiveConnectorStagedImportPreviewResponse>(
    `/archive-connectors/source-staging-runs/${encodeURIComponent(runId)}/import-preview`,
    strictEmptyBody(),
    token,
  );
}

export function importArchiveConnectorSourceStagingRun(token: string, runId: string) {
  return apiPost<ArchiveConnectorStagedImportResponse>(
    `/archive-connectors/source-staging-runs/${encodeURIComponent(runId)}/import`,
    strictEmptyBody(),
    token,
  );
}

export function archiveConnectorPersonaArchiveRedirectPath(personaId: string) {
  return `/studio/personas/${encodeURIComponent(personaId)}/files?connector=reddit`;
}

export function archiveConnectorRedditReadiness(readiness?: ArchiveConnectorReadinessResponse | null) {
  return readiness?.providers.find((provider) => provider.id === ARCHIVE_CONNECTOR_OWNER_PROVIDER) ?? null;
}

export function archiveConnectorRedditCredentialRow(credentials?: ArchiveConnectorCredentialsResponse | null) {
  return credentials?.providers.find((provider) => provider.provider === ARCHIVE_CONNECTOR_OWNER_PROVIDER) ?? null;
}

export function archiveConnectorCredentialIsSourceReady(row?: ArchiveConnectorCredentialProviderRow | null) {
  const credential = row?.credential;
  return Boolean(
    row?.connectionStatus === "connected" &&
    credential?.status === "active" &&
    credential.connectionScopeState === "source_scope_ready" &&
    credential.reconnectRequiredForSourceInventory === false,
  );
}

export function archiveConnectorCredentialHasAccountProof(row?: ArchiveConnectorCredentialProviderRow | null) {
  return Boolean(
    archiveConnectorCredentialIsSourceReady(row) &&
    row?.credential?.externalAccountFingerprintPresent === true,
  );
}

export function archiveConnectorSavedItemsSource(sources: ArchiveConnectorSourceInventorySource[]) {
  return sources.find((source) =>
    source.provider === ARCHIVE_CONNECTOR_OWNER_PROVIDER &&
    source.purpose === "archive_connector" &&
    source.ownerOnly === true &&
    source.sourceFamily === ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY &&
    source.sourceKind === ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND &&
    source.availability === "available"
  ) ?? null;
}

export function archiveConnectorSavedItemsSourceReadback(source?: ArchiveConnectorSourceInventorySource | null) {
  return {
    label: ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL,
    providerLabel: ARCHIVE_CONNECTOR_OWNER_PROVIDER_LABEL,
    sourceFamily: ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY,
    sourceKind: ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND,
    availability: source?.availability ?? "unavailable",
    truncated: source?.truncated === true,
  };
}

export function archiveConnectorSavedItemsImportIntentBody(
  personaId: string,
  source: ArchiveConnectorSourceInventorySource,
) {
  return {
    personaId,
    sourceKey: source.sourceKey,
    sourceFamily: ARCHIVE_CONNECTOR_OWNER_SOURCE_FAMILY,
    sourceKind: ARCHIVE_CONNECTOR_OWNER_SOURCE_KIND,
    sourceLabel: source.label,
  };
}

export function archiveConnectorOwnerStep(input: {
  accessTokenPresent: boolean;
  loading?: boolean;
  readiness?: ArchiveConnectorReadinessResponse | null;
  credentialRow?: ArchiveConnectorCredentialProviderRow | null;
  sourceChecked?: boolean;
  savedItemsSource?: ArchiveConnectorSourceInventorySource | null;
  intent?: ArchiveConnectorImportIntent | null;
  sourcePreview?: ArchiveConnectorSourcePreview | null;
  stagingRun?: ArchiveConnectorSourceStagingRun | null;
  importPreview?: ArchiveConnectorStagedImportPreview | null;
  importResult?: ArchiveConnectorStagedImportResponse | null;
  error?: string | null;
}): ArchiveConnectorOwnerStep {
  if (!input.accessTokenPresent) {
    return step("signed_out", "warning", "Sign in required", "Sign in to use owner-only archive connectors.", "Return after signing in.");
  }

  if (input.loading) {
    return step("loading", "info", "Checking connector state", "Station is reading safe connector status for this persona.", "No source material is imported while this loads.");
  }

  if (input.importResult?.pending) {
    return step("import_processing", "warning", "Import processing", "The connector import is already queued or processing.", "Refresh the import library after it completes.");
  }

  if (input.importResult?.imported) {
    return step("import_completed", "good", "Saved items imported", "Private connector chunks are indexed for owner-only retrieval.", "Review the refreshed import library.");
  }

  if (input.error) {
    return step(
      "retryable_error",
      "danger",
      "Connector step needs attention",
      input.error,
      input.stagingRun ? "Retry the current connector step or stage the source again." : "Retry the connector step from the last safe readback.",
    );
  }

  const redditReadiness = archiveConnectorRedditReadiness(input.readiness);
  if (!input.readiness || !redditReadiness) {
    return step("readiness_unavailable", "warning", "Connector status unavailable", "Station could not read connector readiness.", "Refresh this Archive tab before connecting Reddit.");
  }

  if (!input.readiness.credentialEncryptionConfigured || redditReadiness.status === "credential_encryption_required") {
    return step("readiness_disabled", "warning", "Credential storage unavailable", "Connector credential encryption is not configured.", "Ask for archive connector credential storage before connecting Reddit.");
  }

  if (redditReadiness.oauthAppStatus !== "configured") {
    return step("readiness_disabled", "warning", "Reddit app unavailable", "The archive-specific Reddit OAuth app is not fully configured.", "Complete provider setup before connecting Reddit.");
  }

  if (!input.credentialRow || input.credentialRow.connectionStatus === "missing" || input.credentialRow.connectionStatus === "revoked") {
    return step("credential_required", "info", "Connect Reddit saved items", "Connect Reddit with source inventory scope before importing saved items.", "Start Reddit setup from this persona Archive tab.");
  }

  if (!archiveConnectorCredentialIsSourceReady(input.credentialRow)) {
    return step("source_scope_required", "warning", "Reconnect for saved items", "The current Reddit credential is not source-ready.", "Reconnect Reddit with source inventory scope.");
  }

  if (!archiveConnectorCredentialHasAccountProof(input.credentialRow)) {
    return step("account_proof_required", "warning", "Confirm Reddit account", "Station needs an owner action to confirm the connected Reddit account before reading sources.", "Run account confirmation, then check saved-items availability.");
  }

  if (input.sourceChecked && !input.savedItemsSource) {
    return step("no_supported_source", "warning", "Saved items unavailable", "This lane only supports Reddit saved items, and that source was not available.", "Reconnect Reddit or try again later.");
  }

  if (!input.savedItemsSource) {
    return step("source_inventory_required", "info", "Check saved-items source", "Read safe Reddit source inventory and keep only the saved-items source.", "Check source availability before creating an import intent.");
  }

  if (!input.intent) {
    return step("intent_required", "info", "Prepare saved-items import", "Create an owner intent for Reddit saved items.", "Create the import intent.");
  }

  if (input.intent.status !== "activated") {
    return step("activation_required", "info", "Activate import intent", "Activate the saved-items intent before source preview.", "Activate this intent.");
  }

  if (!input.sourcePreview) {
    return step("source_preview_required", "info", "Preview saved-items counts", "Preview returns counts only and does not import source text.", "Preview saved-items counts.");
  }

  if (!input.stagingRun) {
    return step("staging_required", "info", "Stage private source batch", "Stage one encrypted owner-only saved-items batch.", "Stage the current saved-items batch.");
  }

  if (input.stagingRun.status !== "staged") {
    return step(
      input.stagingRun.status === "imported" ? "import_completed" : "staging_not_current",
      input.stagingRun.status === "imported" ? "good" : "warning",
      input.stagingRun.status === "imported" ? "Saved items imported" : "Staged run not current",
      input.stagingRun.status === "imported"
        ? "This staged saved-items run has already been imported."
        : "This staged saved-items run is no longer current.",
      input.stagingRun.status === "imported" ? "Refresh the import library." : "Stage the source again before importing.",
    );
  }

  if (!input.importPreview) {
    return step("import_preview_required", "info", "Preview final import", "Preview the staged batch as aggregate metadata before final import.", "Preview the staged import.");
  }

  return step("import_ready", "good", "Ready to import", "The staged saved-items batch is ready for final owner confirmation.", "Confirm final import.");
}

export function archiveConnectorOwnerErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (
      error.code === "archive_connector_credential_encryption_required" ||
      error.code === "archive_connector_provider_app_setup_required"
    ) {
      return "Connector setup is unavailable. Existing archive material remains safe.";
    }

    if (
      error.code === "archive_connector_oauth_state_invalid" ||
      error.code === "archive_connector_exchange_invalid"
    ) {
      return "Connector session expired or could not be verified. Restart Reddit setup from Station.";
    }

    if (
      error.code === "archive_connector_source_inventory_account_lookup_required" ||
      error.code === "archive_connector_account_credential_unavailable"
    ) {
      return "Confirm the Reddit account before reading saved-items availability.";
    }

    if (
      error.code === "archive_connector_source_staging_run_not_current" ||
      error.code === "archive_connector_source_staging_import_intent_not_current"
    ) {
      return "The staged saved-items batch is no longer current. Stage the source again.";
    }

    if (error.status === 401) {
      return "Sign in again before continuing this owner-only connector flow.";
    }
  }

  return "Connector step failed. Existing archive material remains safe.";
}

function strictEmptyBody(): Record<string, never> {
  return {};
}

function step(
  id: ArchiveConnectorOwnerStep["id"],
  tone: ArchiveConnectorTone,
  label: string,
  body: string,
  nextAction: string,
): ArchiveConnectorOwnerStep {
  return { id, tone, label, body, nextAction };
}
