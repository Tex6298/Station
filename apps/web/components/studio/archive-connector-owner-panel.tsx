"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StudioPanel, StudioStatusBadge } from "@/components/studio/studio-frame";
import {
  ARCHIVE_CONNECTOR_OWNER_PROVIDER_LABEL,
  ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL,
  activateArchiveConnectorImportIntent,
  archiveConnectorCredentialHasAccountProof,
  archiveConnectorCredentialIsSourceReady,
  archiveConnectorOwnerErrorMessage,
  archiveConnectorOwnerStep,
  archiveConnectorRedditCredentialRow,
  archiveConnectorReadinessHasSetupBlocker,
  archiveConnectorSavedItemsSource,
  archiveConnectorSavedItemsSourceReadback,
  authorizeArchiveConnectorRedditOAuth,
  createArchiveConnectorRedditSavedItemsImportIntent,
  createArchiveConnectorSourceStagingRun,
  importArchiveConnectorSourceStagingRun,
  lookupArchiveConnectorRedditAccount,
  previewArchiveConnectorIntentSource,
  previewArchiveConnectorSourceStagingImport,
  readArchiveConnectorCredentials,
  readArchiveConnectorReadiness,
  readArchiveConnectorRedditSourceInventory,
  startArchiveConnectorRedditSourceOAuth,
  type ArchiveConnectorCredentialProviderRow,
  type ArchiveConnectorImportIntent,
  type ArchiveConnectorReadinessResponse,
  type ArchiveConnectorSourceInventorySource,
  type ArchiveConnectorSourcePreview,
  type ArchiveConnectorSourceStagingRun,
  type ArchiveConnectorStagedImportPreview,
  type ArchiveConnectorStagedImportResponse,
} from "@/lib/archive-connector-owner-flow";

type BusyStep =
  | "refresh"
  | "connect"
  | "account"
  | "sources"
  | "intent"
  | "activate"
  | "source-preview"
  | "staging"
  | "import-preview"
  | "import";

export function ArchiveConnectorOwnerPanel({
  token,
  personaId,
  onArchiveImported,
}: {
  token: string | null;
  personaId: string;
  onArchiveImported?: () => Promise<void> | void;
}) {
  const [readiness, setReadiness] = useState<ArchiveConnectorReadinessResponse | null>(null);
  const [credentialRow, setCredentialRow] = useState<ArchiveConnectorCredentialProviderRow | null>(null);
  const [savedItemsSource, setSavedItemsSource] = useState<ArchiveConnectorSourceInventorySource | null>(null);
  const [sourceChecked, setSourceChecked] = useState(false);
  const [intent, setIntent] = useState<ArchiveConnectorImportIntent | null>(null);
  const [sourcePreview, setSourcePreview] = useState<ArchiveConnectorSourcePreview | null>(null);
  const [stagingRun, setStagingRun] = useState<ArchiveConnectorSourceStagingRun | null>(null);
  const [importPreview, setImportPreview] = useState<ArchiveConnectorStagedImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ArchiveConnectorStagedImportResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [busy, setBusy] = useState<BusyStep | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastErrorSource, setLastErrorSource] = useState<BusyStep | null>(null);

  const refreshReadbacks = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLastError(null);
    setLastErrorSource(null);
    try {
      const [readinessResult, credentialResult] = await Promise.allSettled([
        readArchiveConnectorReadiness(token),
        readArchiveConnectorCredentials(token),
      ]);

      if (readinessResult.status === "rejected") {
        setReadiness(null);
        setCredentialRow(
          credentialResult.status === "fulfilled"
            ? archiveConnectorRedditCredentialRow(credentialResult.value)
            : null,
        );
        setLastError(archiveConnectorOwnerErrorMessage(readinessResult.reason));
        setLastErrorSource("refresh");
        return;
      }

      const readinessResponse = readinessResult.value;
      setReadiness(readinessResponse);

      if (credentialResult.status === "fulfilled") {
        setCredentialRow(archiveConnectorRedditCredentialRow(credentialResult.value));
        return;
      }

      setCredentialRow(null);
      if (readinessResponse && archiveConnectorReadinessHasSetupBlocker(readinessResponse)) {
        return;
      }

      setLastError(archiveConnectorOwnerErrorMessage(credentialResult.reason));
      setLastErrorSource("refresh");
    } catch (error) {
      setLastError(archiveConnectorOwnerErrorMessage(error));
      setLastErrorSource("refresh");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshReadbacks();
  }, [refreshReadbacks]);

  const step = useMemo(() => archiveConnectorOwnerStep({
    accessTokenPresent: Boolean(token),
    loading,
    readiness,
    credentialRow,
    sourceChecked,
    savedItemsSource,
    intent,
    sourcePreview,
    stagingRun,
    importPreview,
    importResult,
    error: lastError,
  }), [
    token,
    loading,
    readiness,
    credentialRow,
    sourceChecked,
    savedItemsSource,
    intent,
    sourcePreview,
    stagingRun,
    importPreview,
    importResult,
    lastError,
  ]);

  async function runAction(label: BusyStep, action: () => Promise<void>) {
    setBusy(label);
    setLastError(null);
    setLastErrorSource(null);
    try {
      await action();
    } catch (error) {
      setLastError(archiveConnectorOwnerErrorMessage(error));
      setLastErrorSource(label);
    } finally {
      setBusy(null);
    }
  }

  async function connectReddit() {
    if (!token) return;
    await runAction("connect", async () => {
      const started = await startArchiveConnectorRedditSourceOAuth(token, personaId);
      const authorized = await authorizeArchiveConnectorRedditOAuth(token, started.stateHandle);
      window.location.assign(authorized.authorizationUrl);
    });
  }

  async function confirmAccount() {
    if (!token) return;
    await runAction("account", async () => {
      await lookupArchiveConnectorRedditAccount(token);
      const credentialResponse = await readArchiveConnectorCredentials(token);
      setCredentialRow(archiveConnectorRedditCredentialRow(credentialResponse));
    });
  }

  async function checkSavedItemsSource() {
    if (!token) return;
    await runAction("sources", async () => {
      const inventory = await readArchiveConnectorRedditSourceInventory(token);
      setSourceChecked(true);
      setSavedItemsSource(archiveConnectorSavedItemsSource(inventory.sources));
      setIntent(null);
      setSourcePreview(null);
      setStagingRun(null);
      setImportPreview(null);
      setImportResult(null);
    });
  }

  async function createIntent() {
    if (!token || !savedItemsSource) return;
    await runAction("intent", async () => {
      const response = await createArchiveConnectorRedditSavedItemsImportIntent({
        token,
        personaId,
        source: savedItemsSource,
      });
      setIntent(response.intent);
      setSourcePreview(null);
      setStagingRun(null);
      setImportPreview(null);
      setImportResult(null);
    });
  }

  async function activateIntent() {
    if (!token || !intent) return;
    await runAction("activate", async () => {
      const response = await activateArchiveConnectorImportIntent(token, intent.id);
      setIntent(response.intent);
      setSourcePreview(null);
      setStagingRun(null);
      setImportPreview(null);
      setImportResult(null);
    });
  }

  async function previewSource() {
    if (!token || !intent) return;
    await runAction("source-preview", async () => {
      const response = await previewArchiveConnectorIntentSource(token, intent.id);
      setIntent(response.intent);
      setSourcePreview(response.preview);
      setStagingRun(null);
      setImportPreview(null);
      setImportResult(null);
    });
  }

  async function stageSource() {
    if (!token || !intent) return;
    await runAction("staging", async () => {
      const response = await createArchiveConnectorSourceStagingRun(token, intent.id);
      setIntent(response.intent);
      setStagingRun(response.run);
      setImportPreview(null);
      setImportResult(null);
    });
  }

  async function previewStagedImport() {
    if (!token || !stagingRun) return;
    await runAction("import-preview", async () => {
      const response = await previewArchiveConnectorSourceStagingImport(token, stagingRun.id);
      setIntent(response.intent);
      setStagingRun(response.run);
      setImportPreview(response.preview);
      setImportResult(null);
    });
  }

  async function importStagedRun() {
    if (!token || !stagingRun) return;
    await runAction("import", async () => {
      const response = await importArchiveConnectorSourceStagingRun(token, stagingRun.id);
      setImportResult(response);
      if (response.imported) {
        setStagingRun((current) => current ? { ...current, status: "imported", importedAt: new Date().toISOString() } : current);
      }
      await onArchiveImported?.();
    });
  }

  const sourceReadback = archiveConnectorSavedItemsSourceReadback(savedItemsSource);
  const canReadSources = archiveConnectorCredentialHasAccountProof(credentialRow);
  const canCreateIntent = Boolean(savedItemsSource);
  const canActivate = Boolean(intent && intent.status !== "activated");
  const canPreviewSource = Boolean(intent?.status === "activated");
  const canStage = Boolean(sourcePreview && intent?.status === "activated");
  const canPreviewImport = Boolean(stagingRun?.status === "staged");
  const canImport = Boolean(stagingRun?.status === "staged" && importPreview);
  const canRetryFinalImport = Boolean(
    step.id === "retryable_error" &&
    lastErrorSource === "import" &&
    stagingRun &&
    importPreview,
  );

  return (
    <StudioPanel className="archive-connector-owner-panel">
      <div className="studio-section-heading">
        <div className="section-label">Archive Connector</div>
        <h2>{ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL}</h2>
      </div>
      <p className="archive-trust-copy">
        {ARCHIVE_CONNECTOR_OWNER_PROVIDER_LABEL} saved-items import stays inside this owner persona Archive. Each write step waits for an owner action.
      </p>

      <article className="studio-item-card archive-trust-source-card">
        <div>
          <span>{step.label}</span>
          <div className="archive-trust-card-meta">
            <StudioStatusBadge tone={step.tone}>{step.id.replace(/_/g, " ")}</StudioStatusBadge>
            {credentialRow ? (
              <StudioStatusBadge tone={archiveConnectorCredentialIsSourceReady(credentialRow) ? "good" : "warning"}>
                {credentialRow.connectionStatus}
              </StudioStatusBadge>
            ) : null}
          </div>
        </div>
        <p>{step.body}</p>
        <div className="archive-trust-next-action">{step.nextAction}</div>
      </article>

      <div className="archive-format-grid">
        <ConnectorReadbackCard
          label="Credential"
          value={credentialRow?.connectionStatus ?? "unknown"}
          detail={
            credentialRow?.credential
              ? credentialRow.credential.connectionScopeState.replace(/_/g, " ")
              : "No Reddit credential readback"
          }
        />
        <ConnectorReadbackCard
          label="Source"
          value={sourceChecked ? sourceReadback.availability : "not checked"}
          detail={sourceReadback.label}
        />
        <ConnectorReadbackCard
          label="Preview"
          value={sourcePreview ? `${sourcePreview.itemCount} items` : "not run"}
          detail={sourcePreview ? `${sourcePreview.postCount} posts / ${sourcePreview.commentCount} comments` : "Counts only"}
        />
        <ConnectorReadbackCard
          label="Import"
          value={importResult?.job.status ?? stagingRun?.status ?? "not staged"}
          detail={importResult ? `${importResult.chunksCreated} private chunks` : "No final import yet"}
        />
      </div>

      {importPreview ? (
        <article className="studio-item-card archive-trust-source-card">
          <div>
            <span>Final import preview</span>
            <div className="archive-trust-card-meta">
              <StudioStatusBadge tone="info">{importPreview.itemCount} items</StudioStatusBadge>
              <StudioStatusBadge tone="info">page limit {importPreview.pageLimit}</StudioStatusBadge>
            </div>
          </div>
          <p>
            {importPreview.postCount} posts and {importPreview.commentCount} comments are ready for private archive import.
          </p>
          <div className="archive-trust-next-action">
            {importPreview.skippedCount} skipped / {importPreview.truncated ? "truncated" : "not truncated"} / no source text shown
          </div>
        </article>
      ) : null}

      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <button className="button" type="button" disabled={!token || busy === "refresh"} onClick={() => runAction("refresh", refreshReadbacks)}>
          {busy === "refresh" ? "Refreshing..." : "Refresh connector state"}
        </button>
        {step.id === "credential_required" || step.id === "source_scope_required" ? (
          <button className="button primary" type="button" disabled={!token || busy === "connect"} onClick={connectReddit}>
            {busy === "connect" ? "Opening Reddit..." : step.id === "source_scope_required" ? "Reconnect Reddit" : "Connect Reddit"}
          </button>
        ) : null}
        {step.id === "account_proof_required" ? (
          <button className="button primary" type="button" disabled={!token || busy === "account"} onClick={confirmAccount}>
            {busy === "account" ? "Confirming..." : "Confirm Reddit account"}
          </button>
        ) : null}
        {step.id === "source_inventory_required" || step.id === "no_supported_source" ? (
          <button className="button primary" type="button" disabled={!token || !canReadSources || busy === "sources"} onClick={checkSavedItemsSource}>
            {busy === "sources" ? "Checking..." : "Check saved-items source"}
          </button>
        ) : null}
        {step.id === "intent_required" ? (
          <button className="button primary" type="button" disabled={!token || !canCreateIntent || busy === "intent"} onClick={createIntent}>
            {busy === "intent" ? "Preparing..." : "Prepare saved-items import"}
          </button>
        ) : null}
        {step.id === "activation_required" ? (
          <button className="button primary" type="button" disabled={!token || !canActivate || busy === "activate"} onClick={activateIntent}>
            {busy === "activate" ? "Activating..." : "Activate import intent"}
          </button>
        ) : null}
        {step.id === "source_preview_required" ? (
          <button className="button primary" type="button" disabled={!token || !canPreviewSource || busy === "source-preview"} onClick={previewSource}>
            {busy === "source-preview" ? "Previewing..." : "Preview saved-items counts"}
          </button>
        ) : null}
        {step.id === "staging_required" ? (
          <button className="button primary" type="button" disabled={!token || !canStage || busy === "staging"} onClick={stageSource}>
            {busy === "staging" ? "Staging..." : "Stage private batch"}
          </button>
        ) : null}
        {step.id === "import_preview_required" ? (
          <button className="button primary" type="button" disabled={!token || !canPreviewImport || busy === "import-preview"} onClick={previewStagedImport}>
            {busy === "import-preview" ? "Previewing..." : "Preview final import"}
          </button>
        ) : null}
        {step.id === "import_ready" || canRetryFinalImport ? (
          <button className="button primary" type="button" disabled={!token || !canImport || busy === "import"} onClick={importStagedRun}>
            {busy === "import" ? "Importing..." : "Confirm final import"}
          </button>
        ) : null}
      </div>
    </StudioPanel>
  );
}

function ConnectorReadbackCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="archive-format-row">
      <div className="archive-format-row-header">
        <span>{label}</span>
        <StudioStatusBadge tone="info">{value}</StudioStatusBadge>
      </div>
      <p>{detail}</p>
    </article>
  );
}
