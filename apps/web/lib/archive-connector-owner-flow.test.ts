import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ApiRequestError } from "./api-client";
import {
  ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL,
  activateArchiveConnectorImportIntent,
  archiveConnectorOwnerErrorMessage,
  archiveConnectorOwnerStep,
  archiveConnectorPersonaArchiveRedirectPath,
  archiveConnectorReadinessHasSetupBlocker,
  archiveConnectorSavedItemsImportIntentBody,
  archiveConnectorSavedItemsSource,
  archiveConnectorSavedItemsSourceReadback,
  authorizeArchiveConnectorRedditOAuth,
  createArchiveConnectorRedditSavedItemsImportIntent,
  createArchiveConnectorSourceStagingRun,
  importArchiveConnectorSourceStagingRun,
  lookupArchiveConnectorRedditAccount,
  previewArchiveConnectorIntentSource,
  previewArchiveConnectorSourceStagingImport,
  readArchiveConnectorReadiness,
  readArchiveConnectorRedditSourceInventory,
  startArchiveConnectorRedditSourceOAuth,
  type ArchiveConnectorCredentialProviderRow,
  type ArchiveConnectorImportIntent,
  type ArchiveConnectorReadinessResponse,
  type ArchiveConnectorSourceInventorySource,
  type ArchiveConnectorSourceStagingRun,
  type ArchiveConnectorStagedImportResponse,
} from "./archive-connector-owner-flow";

const personaId = "11111111-1111-4111-8111-111111111111";
const ownerToken = "owner-session-marker";
const sourceKey = "a".repeat(24);
const intentId = "33333333-3333-4333-8333-000000000001";
const runId = "44444444-4444-4444-8444-000000000001";

function source(path: string) {
  return readFileSync(path, "utf8");
}

test("archive connector owner flow states cover signed-out disabled credential source preview staging import and retry", () => {
  assert.equal(archiveConnectorOwnerStep({ accessTokenPresent: false }).id, "signed_out");
  assert.equal(archiveConnectorOwnerStep({ accessTokenPresent: true, loading: true }).id, "loading");
  assert.equal(archiveConnectorOwnerStep({ accessTokenPresent: true }).id, "readiness_unavailable");
  assert.equal(
    archiveConnectorOwnerStep({ accessTokenPresent: true, readiness: readiness({ encryption: false }) }).id,
    "readiness_disabled",
  );
  assert.equal(
    archiveConnectorOwnerStep({ accessTokenPresent: true, readiness: readiness({ app: "partial" }) }).id,
    "readiness_disabled",
  );
  assert.equal(
    archiveConnectorOwnerStep({ accessTokenPresent: true, readiness: readiness(), credentialRow: null }).id,
    "credential_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow({ connectionScopeState: "account_proof_only" }),
    }).id,
    "source_scope_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow({ externalAccountFingerprintPresent: false }),
    }).id,
    "account_proof_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      sourceChecked: true,
      savedItemsSource: null,
    }).id,
    "no_supported_source",
  );

  const savedSource = savedItemsSource();
  const activatedIntent = intent({ status: "activated" });
  const stagedRun = stagingRun({ status: "staged" });
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
    }).id,
    "intent_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: intent({ status: "pending" }),
    }).id,
    "activation_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
    }).id,
    "source_preview_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
    }).id,
    "staging_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
      stagingRun: stagingRun({ status: "revoked" }),
    }).id,
    "staging_not_current",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
      stagingRun: stagedRun,
    }).id,
    "import_preview_required",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
      stagingRun: stagedRun,
      importPreview: importPreview(),
    }).id,
    "import_ready",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
      stagingRun: stagedRun,
      importPreview: importPreview(),
      importResult: importResult({ pending: true, imported: false }),
    }).id,
    "import_processing",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
      stagingRun: stagedRun,
      importPreview: importPreview(),
      importResult: importResult({ imported: true }),
    }).id,
    "import_completed",
  );
  assert.equal(
    archiveConnectorOwnerStep({
      accessTokenPresent: true,
      readiness: readiness(),
      credentialRow: credentialRow(),
      savedItemsSource: savedSource,
      intent: activatedIntent,
      sourcePreview: sourcePreview(),
      stagingRun: stagedRun,
      importPreview: importPreview(),
      importResult: importResult({ imported: true }),
      error: "Follow-up archive refresh failed.",
    }).id,
    "import_completed",
  );
  const retry = archiveConnectorOwnerStep({
    accessTokenPresent: true,
    readiness: readiness(),
    credentialRow: credentialRow(),
    stagingRun: stagedRun,
    error: "Connector step failed. Existing archive material remains safe.",
  });
  assert.equal(retry.id, "retryable_error");
  assert.match(retry.nextAction, /Retry/);
});

test("archive connector owner flow lets readiness setup blockers win over credential readback failures", () => {
  assert.equal(archiveConnectorReadinessHasSetupBlocker(readiness({ encryption: false })), true);
  assert.equal(archiveConnectorReadinessHasSetupBlocker(readiness({ app: "missing" })), true);
  assert.equal(archiveConnectorReadinessHasSetupBlocker(readiness()), false);

  const credentialError = "Connector step failed. Existing archive material remains safe.";
  const storageBlocked = archiveConnectorOwnerStep({
    accessTokenPresent: true,
    readiness: readiness({ encryption: false }),
    error: credentialError,
  });
  const providerBlocked = archiveConnectorOwnerStep({
    accessTokenPresent: true,
    readiness: readiness({ app: "missing" }),
    error: credentialError,
  });
  const retryable = archiveConnectorOwnerStep({
    accessTokenPresent: true,
    readiness: readiness(),
    error: credentialError,
  });

  assert.equal(storageBlocked.id, "readiness_disabled");
  assert.equal(storageBlocked.label, "Credential storage unavailable");
  assert.equal(providerBlocked.id, "readiness_disabled");
  assert.equal(providerBlocked.label, "Reddit app unavailable");
  assert.equal(retryable.id, "retryable_error");
  assert.match(retryable.body, /Existing archive material remains safe/);
  assert.doesNotMatch(
    JSON.stringify([storageBlocked, providerBlocked, retryable]),
    /access_token|refresh_token|client_secret|oauth_code|provider_payload|sourceBody|normalizedText|itemFingerprint|source_snapshot_fingerprint|encrypted_source_batch|sql|stack|token=/i,
  );
});

test("archive connector owner flow filters to saved items and renders only generic source labels", () => {
  const sources: ArchiveConnectorSourceInventorySource[] = [
    {
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      sourceFamily: "reddit_subreddit_memberships",
      sourceKind: "subreddit",
      label: "r/PrivateStation",
      sourceKey: "b".repeat(24),
      availability: "available",
      truncated: true,
    },
    {
      provider: "discord",
      purpose: "archive_connector",
      ownerOnly: true,
      sourceFamily: "discord_guilds",
      sourceKind: "guild",
      label: "Private Guild",
      sourceKey: "c".repeat(24),
      availability: "available",
      truncated: false,
    },
    savedItemsSource(),
    {
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      sourceFamily: "reddit_user_history",
      sourceKind: "upvoted_items",
      label: "Upvoted items",
      sourceKey: "d".repeat(24),
      availability: "available",
      truncated: false,
    },
  ];

  const saved = archiveConnectorSavedItemsSource(sources);
  assert.equal(saved?.sourceFamily, "reddit_user_history");
  assert.equal(saved?.sourceKind, "saved_items");
  assert.equal(archiveConnectorSavedItemsSourceReadback(saved).label, ARCHIVE_CONNECTOR_OWNER_SOURCE_LABEL);
  assert.doesNotMatch(JSON.stringify(archiveConnectorSavedItemsSourceReadback(saved)), /PrivateStation|Private Guild|Upvoted|r\//);

  assert.deepEqual(archiveConnectorSavedItemsImportIntentBody(personaId, saved!), {
    personaId,
    sourceKey,
    sourceFamily: "reddit_user_history",
    sourceKind: "saved_items",
    sourceLabel: "Saved items",
  });
});

test("archive connector owner flow builds only accepted endpoints and strict empty bodies", async () => {
  const calls: Array<{ url: string; method?: string; body: unknown; authorization: string | null }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({
      url,
      method: init?.method,
      body: init?.body ? JSON.parse(String(init.body)) : null,
      authorization: new Headers(init?.headers).get("Authorization"),
    });
    return jsonResponse(responseForPath(new URL(url).pathname));
  }) as typeof fetch;

  try {
    await readArchiveConnectorReadiness(ownerToken);
    const started = await startArchiveConnectorRedditSourceOAuth(ownerToken, personaId);
    const authorized = await authorizeArchiveConnectorRedditOAuth(ownerToken, started.stateHandle);
    await lookupArchiveConnectorRedditAccount(ownerToken);
    const inventory = await readArchiveConnectorRedditSourceInventory(ownerToken);
    const saved = archiveConnectorSavedItemsSource(inventory.sources);
    assert.ok(saved);
    const createdIntent = await createArchiveConnectorRedditSavedItemsImportIntent({
      token: ownerToken,
      personaId,
      source: saved,
    });
    const activated = await activateArchiveConnectorImportIntent(ownerToken, createdIntent.intent.id);
    await previewArchiveConnectorIntentSource(ownerToken, activated.intent.id);
    const staged = await createArchiveConnectorSourceStagingRun(ownerToken, activated.intent.id);
    await previewArchiveConnectorSourceStagingImport(ownerToken, staged.run.id);
    await importArchiveConnectorSourceStagingRun(ownerToken, staged.run.id);

    assert.equal(authorized.authorizationUrl.startsWith("https://www.reddit.com/api/v1/authorize"), true);
    assert.deepEqual(calls.map((call) => new URL(call.url).pathname), [
      "/archive-connectors/readiness",
      "/archive-connectors/oauth/reddit/start",
      "/archive-connectors/oauth/reddit/authorize",
      "/archive-connectors/credentials/reddit/account/lookup",
      "/archive-connectors/reddit/source-inventory",
      "/archive-connectors/reddit/import-intents",
      `/archive-connectors/import-intents/${intentId}/activate`,
      `/archive-connectors/import-intents/${intentId}/source-preview`,
      `/archive-connectors/import-intents/${intentId}/source-staging-runs`,
      `/archive-connectors/source-staging-runs/${runId}/import-preview`,
      `/archive-connectors/source-staging-runs/${runId}/import`,
    ]);
    assert.deepEqual(calls[1].body, {
      localRedirectPath: archiveConnectorPersonaArchiveRedirectPath(personaId),
      scopeProfile: "source_inventory",
    });
    assert.deepEqual(calls[2].body, { stateHandle: started.stateHandle });
    assert.deepEqual(calls[3].body, {});
    assert.deepEqual(calls[5].body, {
      personaId,
      sourceKey,
      sourceFamily: "reddit_user_history",
      sourceKind: "saved_items",
      sourceLabel: "Saved items",
    });
    assert.deepEqual(calls[6].body, {});
    assert.deepEqual(calls[7].body, {});
    assert.deepEqual(calls[8].body, {});
    assert.deepEqual(calls[9].body, {});
    assert.deepEqual(calls[10].body, {});
    assert.equal(calls.every((call) => call.authorization === `Bearer ${ownerToken}`), true);
    assert.doesNotMatch(JSON.stringify(calls), /\/imports\/chat|\/archive-connectors\/discord|channels|messages|guilds\/.+messages/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("archive connector owner errors redact provider source and infrastructure details", () => {
  assert.equal(
    archiveConnectorOwnerErrorMessage(new Error("saved-post-body token=abc123 SQL stack trace")),
    "Connector step failed. Existing archive material remains safe.",
  );
  assert.equal(
    archiveConnectorOwnerErrorMessage(new ApiRequestError({
      message: "private provider payload",
      status: 409,
      code: "archive_connector_oauth_state_invalid",
    })),
    "Connector session expired or could not be verified. Restart Reddit setup from Station.",
  );
  assert.equal(
    archiveConnectorOwnerErrorMessage(new ApiRequestError({
      message: "saved-post-body token=abc123",
      status: 409,
      code: "archive_connector_source_staging_run_not_current",
    })),
    "The staged saved-items batch is no longer current. Stage the source again.",
  );
});

test("archive connector owner UI source stays inside persona Archive and avoids drift", () => {
  const pageSource = source("apps/web/app/studio/personas/[personaId]/files/page.tsx");
  const panelSource = source("apps/web/components/studio/archive-connector-owner-panel.tsx");
  const helperSource = source("apps/web/lib/archive-connector-owner-flow.ts");
  const combined = `${panelSource}\n${helperSource}`;

  assert.match(pageSource, /ArchiveConnectorOwnerPanel/);
  assert.match(combined, /\/archive-connectors\/readiness/);
  assert.match(panelSource, /Promise\.allSettled/);
  assert.match(panelSource, /archiveConnectorReadinessHasSetupBlocker\(readinessResponse\)/);
  assert.match(combined, /\/archive-connectors\/oauth\/reddit\/start/);
  assert.match(combined, /scopeProfile: "source_inventory"/);
  assert.match(combined, /\/archive-connectors\/source-staging-runs\/\$\{encodeURIComponent\(runId\)\}\/import/);
  assert.match(panelSource, /window\.location\.assign\(authorized\.authorizationUrl\)/);
  assert.doesNotMatch(panelSource, /step\.id === "readiness_disabled"[\s\S]{0,600}<button className="button primary"/);
  assert.doesNotMatch(combined, /\/imports\/chat|\/archive-connectors\/discord\/source-inventory|\/archive-connectors\/oauth\/discord|parseImportFile|createImportReviewCandidates|persona_files|canon|continuity|review_candidates/i);
  assert.doesNotMatch(combined, /cloudflare|redis|stripe|billing|marketplace|partner|social|new Queue|Worker\(|recurring|pagination|upvoted|downvoted|submitted|hidden|subreddits\/mine|guilds\/.+messages|channels|members/i);
  assert.doesNotMatch(combined, /access_token|refresh_token|client_secret|oauth_code|provider_payload|sourceBody|normalizedText|itemFingerprint|source_snapshot_fingerprint|encrypted_source_batch|sql|stack|secret-shaped/i);
});

function readiness(input: { encryption?: boolean; app?: "missing" | "partial" | "configured" } = {}): ArchiveConnectorReadinessResponse {
  const encryption = input.encryption ?? true;
  const app = input.app ?? "configured";
  return {
    purpose: "archive_connector",
    ownerOnly: true,
    credentialEncryptionConfigured: encryption,
    providers: [
      {
        id: "reddit",
        label: "Reddit",
        status: !encryption
          ? "credential_encryption_required"
          : app === "configured"
            ? "provider_app_configured"
            : app === "partial"
              ? "provider_app_partial"
              : "provider_app_missing",
        credentialEncryptionConfigured: encryption,
        oauthAppConfigured: app === "configured",
        oauthAppStatus: app,
      },
    ],
  };
}

function credentialRow(input: Partial<ArchiveConnectorCredentialProviderRow["credential"]> = {}): ArchiveConnectorCredentialProviderRow {
  return {
    provider: "reddit",
    purpose: "archive_connector",
    connectionStatus: "connected",
    credential: {
      provider: "reddit",
      purpose: "archive_connector",
      status: "active",
      configured: true,
      fingerprintPresent: true,
      externalAccountFingerprintPresent: true,
      scopeProfile: "source_inventory",
      grantedScopes: ["identity", "mysubreddits", "history"],
      connectionScopeState: "source_scope_ready",
      reconnectRequiredForSourceInventory: false,
      createdAt: "2026-06-30T08:00:00.000Z",
      updatedAt: "2026-06-30T08:00:00.000Z",
      revokedAt: null,
      ...input,
    },
  };
}

function savedItemsSource(): ArchiveConnectorSourceInventorySource {
  return {
    provider: "reddit",
    purpose: "archive_connector",
    ownerOnly: true,
    sourceFamily: "reddit_user_history",
    sourceKind: "saved_items",
    label: "Saved items",
    sourceKey,
    availability: "available",
    truncated: false,
  };
}

function intent(input: Partial<ArchiveConnectorImportIntent> = {}): ArchiveConnectorImportIntent {
  return { ...baseIntent(), ...input };
}

function baseIntent(): ArchiveConnectorImportIntent {
  return {
    id: intentId,
    provider: "reddit" as const,
    purpose: "archive_connector" as const,
    personaId,
    sourceFamily: "reddit_user_history" as const,
    sourceKind: "saved_items" as const,
    sourceKey,
    sourceLabel: "Saved items",
    status: "pending" as const,
    activatedAt: null,
    createdAt: "2026-06-30T08:00:00.000Z",
    updatedAt: "2026-06-30T08:00:00.000Z",
  };
}

function sourcePreview() {
  return {
    pageLimit: 10 as const,
    itemCount: 2,
    postCount: 1,
    commentCount: 1,
    otherCount: 0,
    truncated: false,
    contentReturned: false as const,
  };
}

function stagingRun(input: Partial<ArchiveConnectorSourceStagingRun> = {}): ArchiveConnectorSourceStagingRun {
  return { ...baseStagingRun(), ...input };
}

function baseStagingRun(): ArchiveConnectorSourceStagingRun {
  return {
    id: runId,
    provider: "reddit" as const,
    purpose: "archive_connector" as const,
    personaId,
    importIntentId: intentId,
    sourceFamily: "reddit_user_history" as const,
    sourceKind: "saved_items" as const,
    sourceKey,
    sourceLabel: "Saved items",
    status: "staged" as const,
    pageLimit: 10 as const,
    itemCount: 2,
    postCount: 1,
    commentCount: 1,
    skippedCount: 0,
    truncated: false,
    sourceReadAt: "2026-06-30T08:05:00.000Z",
    expiresAt: "2026-07-01T08:05:00.000Z",
    importedAt: null,
    createdAt: "2026-06-30T08:05:00.000Z",
    updatedAt: "2026-06-30T08:05:00.000Z",
  };
}

function importPreview() {
  return {
    format: "reddit_saved_items" as const,
    sourceFamily: "reddit_user_history" as const,
    sourceKind: "saved_items" as const,
    pageLimit: 10 as const,
    itemCount: 2,
    postCount: 1,
    commentCount: 1,
    skippedCount: 0,
    truncated: false,
    estimatedCharacterCount: 240,
    estimatedNonEmptyItemCount: 2,
    noWritePerformed: true as const,
  };
}

function importResult(input: Partial<ArchiveConnectorStagedImportResponse> = {}): ArchiveConnectorStagedImportResponse {
  return { ...baseImportResult(), ...input };
}

function baseImportResult(): ArchiveConnectorStagedImportResponse {
  return {
    status: "archive_connector_source_staging_import_completed" as const,
    provider: "reddit" as const,
    purpose: "archive_connector" as const,
    ownerOnly: true as const,
    imported: true,
    duplicate: false,
    idempotent: false,
    runId,
    job: {
      id: "55555555-5555-4555-8555-000000000001",
      kind: "archive_connector" as const,
      status: "completed" as const,
      sourceName: "Reddit saved items" as const,
      createdAt: "2026-06-30T08:10:00.000Z",
      updatedAt: "2026-06-30T08:10:00.000Z",
    },
    chunksCreated: 1,
    importMetadata: {
      format: "reddit_saved_items" as const,
      sourceFamily: "reddit_user_history" as const,
      sourceKind: "saved_items" as const,
      pageLimit: 10 as const,
      itemCount: 2,
      postCount: 1,
      commentCount: 1,
      skippedCount: 0,
      truncated: false,
    },
  };
}

function responseForPath(pathname: string) {
  if (pathname === "/archive-connectors/readiness") return readiness();
  if (pathname === "/archive-connectors/oauth/reddit/start") {
    return {
      status: "oauth_state_created",
      provider: "reddit",
      purpose: "archive_connector",
      stateHandle: `${"a".repeat(43)}.${"b".repeat(43)}`,
      expiresAt: "2026-06-30T08:10:00.000Z",
      localRedirectPath: archiveConnectorPersonaArchiveRedirectPath(personaId),
      scopeProfile: "source_inventory",
    };
  }
  if (pathname === "/archive-connectors/oauth/reddit/authorize") {
    return {
      status: "oauth_authorization_url_created",
      provider: "reddit",
      purpose: "archive_connector",
      authorizationUrl: "https://www.reddit.com/api/v1/authorize?state=redacted",
      scopeProfile: "source_inventory",
      requestedScopes: ["identity", "mysubreddits", "history"],
    };
  }
  if (pathname === "/archive-connectors/credentials/reddit/account/lookup") {
    return {
      status: "archive_connector_account_lookup_complete",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      accountProofComplete: true,
      credential: credentialRow().credential,
    };
  }
  if (pathname === "/archive-connectors/reddit/source-inventory") {
    return {
      status: "archive_connector_source_inventory_read",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      sources: [savedItemsSource()],
      truncated: false,
    };
  }
  if (pathname === "/archive-connectors/reddit/import-intents") {
    return {
      status: "archive_connector_import_intent_created",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      importIntentCreated: true,
      idempotent: true,
      duplicate: false,
      intent: baseIntent(),
    };
  }
  if (pathname === `/archive-connectors/import-intents/${intentId}/activate`) {
    return {
      status: "archive_connector_import_intent_activated",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      activated: true,
      idempotent: true,
      duplicate: false,
      intent: intent({ status: "activated", activatedAt: "2026-06-30T08:02:00.000Z" }),
    };
  }
  if (pathname === `/archive-connectors/import-intents/${intentId}/source-preview`) {
    return {
      status: "archive_connector_source_preview_read",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      intent: intent({ status: "activated" }),
      preview: sourcePreview(),
    };
  }
  if (pathname === `/archive-connectors/import-intents/${intentId}/source-staging-runs`) {
    return {
      status: "archive_connector_source_staging_run_created",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      staged: true,
      idempotent: true,
      duplicate: false,
      intent: intent({ status: "activated" }),
      run: baseStagingRun(),
    };
  }
  if (pathname === `/archive-connectors/source-staging-runs/${runId}/import-preview`) {
    return {
      status: "archive_connector_source_staging_import_preview_ready",
      provider: "reddit",
      purpose: "archive_connector",
      ownerOnly: true,
      runId,
      intent: intent({ status: "activated" }),
      run: baseStagingRun(),
      preview: importPreview(),
    };
  }
  if (pathname === `/archive-connectors/source-staging-runs/${runId}/import`) {
    return baseImportResult();
  }
  throw new Error(`unexpected path ${pathname}`);
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
