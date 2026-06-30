import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import {
  encryptArchiveConnectorCredential,
  fingerprintArchiveConnectorCredential,
  fingerprintArchiveConnectorExternalAccount,
} from "../services/archive-connectors/credential-storage";
import { setArchiveConnectorAccountLookupFetchForTests } from "../services/archive-connectors/account-lookup";
import { setArchiveConnectorSourcePreviewFetchForTests } from "../services/archive-connectors/source-preview";
import {
  decryptArchiveConnectorSourceStagingBatchForTests,
  setArchiveConnectorSourceStagingFetchForTests,
} from "../services/archive-connectors/source-staging";
import { setArchiveConnectorSourceInventoryFetchForTests } from "../services/archive-connectors/source-inventory";
import { setArchiveConnectorTokenEndpointFetchForTests } from "../services/archive-connectors/token-exchange";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;
const OWNER_AUTH_MARKER = "owner-session-marker";
const OWNER_PERSONA_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_PERSONA_ID = "22222222-2222-4222-8222-222222222222";
const VALID_ARCHIVE_CONNECTOR_CREDENTIAL_KEY = "archive-connector-credential-test-key-32-plus";

class ArchiveConnectorReadinessSupabase {
  tableCalls: string[] = [];
  writeCalls: string[] = [];
  insertErrorTables = new Set<string>();
  selectErrorTables = new Set<string>();
  updateErrorTables = new Set<string>();
  updateRaceTables = new Set<string>();

  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "creator",
        is_admin: false,
      },
    ],
    personas: [
      {
        id: OWNER_PERSONA_ID,
        owner_user_id: "owner-user",
        name: "Owner Persona",
      },
      {
        id: OTHER_PERSONA_ID,
        owner_user_id: "other-user",
        name: "Other Persona",
      },
    ],
    archive_connector_oauth_states: [],
    archive_connector_credentials: [],
    archive_connector_import_intents: [],
    archive_connector_source_staging_runs: [],
  };

  private usersByToken = new Map([
    [OWNER_AUTH_MARKER, { id: "owner-user", email: "owner@example.test" }],
  ]);

  client = {
    auth: {
      getUser: async (token: string) => {
        const user = this.usersByToken.get(token) ?? null;
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    from: (table: string) => {
      this.tableCalls.push(table);
      return new Query(this, table);
    },
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  addUserToken(token: string, user: { id: string; email: string; tier?: string; isAdmin?: boolean }) {
    this.usersByToken.set(token, { id: user.id, email: user.email });
    if (!this.rows("profiles").some((profile) => profile.id === user.id)) {
      this.rows("profiles").push({
        id: user.id,
        email: user.email,
        tier: user.tier ?? "creator",
        is_admin: user.isAdmin ?? false,
      });
    }
  }
}

class Query {
  private filters: Array<{ field: string; op: "eq" | "gt"; value: unknown }> = [];
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;
  private orderSpec: { field: string; ascending: boolean } | null = null;

  constructor(private db: ArchiveConnectorReadinessSupabase, private table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, op: "eq", value });
    return this;
  }

  gt(field: string, value: unknown) {
    this.filters.push({ field, op: "gt", value });
    return this;
  }

  insert(payload: Row) {
    if (
      this.table !== "archive_connector_oauth_states" &&
      this.table !== "archive_connector_credentials" &&
      this.table !== "archive_connector_import_intents" &&
      this.table !== "archive_connector_source_staging_runs"
    ) {
      this.db.writeCalls.push(`${this.table}.insert`);
      throw new Error(`${this.table} insert should not run in archive connector readiness tests.`);
    }
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    if (
      this.table !== "archive_connector_oauth_states" &&
      this.table !== "archive_connector_credentials" &&
      this.table !== "archive_connector_import_intents" &&
      this.table !== "archive_connector_source_staging_runs"
    ) {
      this.db.writeCalls.push(`${this.table}.update`);
      throw new Error(`${this.table} update should not run in archive connector readiness tests.`);
    }
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  single() {
    return this.execute("single");
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
    return this;
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  delete() {
    this.db.writeCalls.push(`${this.table}.delete`);
    throw new Error(`${this.table} delete should not run in archive connector readiness tests.`);
  }

  private async execute(mode?: "single") {
    let rows: Row[];
    if (this.operation === "insert") {
      this.db.writeCalls.push(`${this.table}.insert`);
      if (this.db.insertErrorTables.has(this.table)) {
        return Promise.resolve({
          data: null,
          error: { message: `SQL insert failed in ${this.table} owner_user_id=owner-user stack prompt` },
        });
      }

      const row = {
        id: generatedRowId(this.table, this.db.rows(this.table).length + 1),
        ...(this.table === "archive_connector_import_intents" ? { activated_at: null } : {}),
        ...(this.table === "archive_connector_source_staging_runs"
          ? { superseded_at: null, revoked_at: null }
          : {}),
        created_at: "2026-06-29T22:50:00.000Z",
        updated_at: "2026-06-29T22:50:00.000Z",
        ...(this.payload ?? {}),
      };
      this.db.rows(this.table).push(row);
      rows = [row];
    } else if (this.operation === "update") {
      this.db.writeCalls.push(`${this.table}.update`);
      if (this.db.updateErrorTables.has(this.table)) {
        return Promise.resolve({
          data: null,
          error: { message: `SQL update failed in ${this.table} owner_user_id=owner-user stack prompt` },
        });
      }
      if (this.db.updateRaceTables.has(this.table)) {
        rows = this.matchingRows();
        for (const row of rows) {
          Object.assign(row, {
            status: "activated",
            activated_at: "2026-06-29T22:59:00.000Z",
          });
          row.updated_at = "2026-06-29T22:59:00.000Z";
        }
        return Promise.resolve({
          data: null,
          error: { message: `SQL update raced in ${this.table} owner_user_id=owner-user stack prompt` },
        });
      }
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload ?? {});
        row.updated_at = "2026-06-29T22:55:00.000Z";
      }
    } else {
      if (this.db.selectErrorTables.has(this.table)) {
        return Promise.resolve({
          data: null,
          error: { message: `SQL select failed in ${this.table} owner_user_id=owner-user stack prompt` },
        });
      }
      rows = this.matchingRows();
    }

    if (mode === "single") {
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }

    return { data: rows, error: null };
  }

  private matchingRows() {
    let rows = this.db.rows(this.table).filter((candidate) =>
      this.filters.every(({ field, op, value }) => {
        if (op === "eq") return candidate[field] === value;
        if (op === "gt") return candidate[field] > value;
        return false;
      })
    );

    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows = [...rows].sort((left, right) => {
        if (left[field] === right[field]) return 0;
        if (left[field] == null) return 1;
        if (right[field] == null) return -1;
        return (left[field] > right[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    return rows;
  }
}

async function createArchiveConnectorApp() {
  const { archiveConnectorsRouter } = await import("./archive-connectors.js");
  const { errorHandler } = await import("../middleware/error-handler.js");
  const app = express();
  app.use(express.json());
  app.use("/archive-connectors", archiveConnectorsRouter);
  app.use(errorHandler);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) as TBody : null,
    };
  } finally {
    await close(server);
  }
}

function listen(app: Express) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server as unknown as Server));
  });
}

function close(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

function withEnv(updates: Record<string, string | null>, fn: () => Promise<void> | void) {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(updates)) {
    previous.set(key, process.env[key]);
    if (value == null) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return Promise.resolve(fn()).finally(() => {
    for (const [key, value] of previous.entries()) {
      if (value == null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

function archiveConnectorConfiguredEnv() {
  return {
    ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "archive-discord-id-marker",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
    REDDIT_CLIENT_ID: "reddit-client-id-marker",
    REDDIT_CLIENT_SECRET: "social-reddit-config-b",
  };
}

function archiveConnectorAuthorizeEnv(updates: Record<string, string | null> = {}) {
  return {
    ...archiveConnectorConfiguredEnv(),
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "reddit-public-client-id-fixture",
    ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "reddit-private-app-marker",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "discord-public-client-id-fixture",
    ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "discord-private-app-marker",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    ...updates,
  };
}

function archiveConnectorExchangeEnv(updates: Record<string, string | null> = {}) {
  return archiveConnectorAuthorizeEnv({
    ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: VALID_ARCHIVE_CONNECTOR_CREDENTIAL_KEY,
    ...updates,
  });
}

async function startArchiveConnectorOAuthState(
  app: Express,
  options: {
    provider?: "reddit" | "discord";
    token?: string;
    localRedirectPath?: string;
    scopeProfile?: "connect" | "source_inventory" | string;
    body?: unknown;
  } = {},
) {
  const body = options.body ?? (
    options.localRedirectPath == null && options.scopeProfile == null
      ? undefined
      : {
          ...(options.localRedirectPath == null ? {} : { localRedirectPath: options.localRedirectPath }),
          ...(options.scopeProfile == null ? {} : { scopeProfile: options.scopeProfile }),
        }
  );
  return requestJson<Row>(app, "POST", `/archive-connectors/oauth/${options.provider ?? "reddit"}/start`, {
    token: options.token ?? OWNER_AUTH_MARKER,
    body,
  });
}

async function authorizeArchiveConnectorOAuthState(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
    stateHandle?: string;
    body?: unknown;
  } = {},
) {
  return requestJson<Row>(app, "POST", `/archive-connectors/oauth/${options.provider ?? "reddit"}/authorize`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body: options.body ?? { stateHandle: options.stateHandle },
  });
}

async function exchangeArchiveConnectorOAuthCallback(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
    stateHandle?: string;
    code?: string;
    body?: unknown;
  } = {},
) {
  return requestJson<Row>(app, "POST", `/archive-connectors/oauth/${options.provider ?? "reddit"}/callback/exchange`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body: options.body ?? {
      stateHandle: options.stateHandle,
      code: options.code ?? "callback-code.fixture_~+/=",
    },
  });
}

async function readArchiveConnectorCredentials(
  app: Express,
  options: { token?: string | null } = {},
) {
  return requestJson<Row>(app, "GET", "/archive-connectors/credentials", {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
  });
}

async function revokeArchiveConnectorCredentialRoute(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
    body?: unknown;
  } = {},
) {
  return requestJson<Row>(app, "POST", `/archive-connectors/credentials/${options.provider ?? "reddit"}/revoke`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body: options.body,
  });
}

async function lookupArchiveConnectorCredentialAccountRoute(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
    body?: unknown;
  } = {},
) {
  return requestJson<Row>(app, "POST", `/archive-connectors/credentials/${options.provider ?? "reddit"}/account/lookup`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body: options.body,
  });
}

async function readArchiveConnectorSourceInventoryRoute(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
  } = {},
) {
  return requestJson<Row>(app, "GET", `/archive-connectors/${options.provider ?? "reddit"}/source-inventory`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
  });
}

async function createArchiveConnectorImportIntentRoute(
  app: Express,
  options: {
    provider?: "reddit" | "discord" | string;
    token?: string | null;
    body?: unknown;
  } = {},
) {
  const body = Object.prototype.hasOwnProperty.call(options, "body")
    ? options.body
    : validArchiveConnectorImportIntentBody();
  return requestJson<Row>(app, "POST", `/archive-connectors/${options.provider ?? "reddit"}/import-intents`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body,
  });
}

async function activateArchiveConnectorImportIntentRoute(
  app: Express,
  options: {
    intentId?: string;
    token?: string | null;
    body?: unknown;
  } = {},
) {
  const body = Object.prototype.hasOwnProperty.call(options, "body")
    ? options.body
    : undefined;
  return requestJson<Row>(app, "POST", `/archive-connectors/import-intents/${options.intentId ?? "33333333-3333-4333-8333-000000000001"}/activate`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body,
  });
}

async function previewArchiveConnectorImportIntentSourceRoute(
  app: Express,
  options: {
    intentId?: string;
    token?: string | null;
    body?: unknown;
  } = {},
) {
  const body = Object.prototype.hasOwnProperty.call(options, "body")
    ? options.body
    : undefined;
  return requestJson<Row>(app, "POST", `/archive-connectors/import-intents/${options.intentId ?? "33333333-3333-4333-8333-000000000001"}/source-preview`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body,
  });
}

async function createArchiveConnectorSourceStagingRunRoute(
  app: Express,
  options: {
    intentId?: string;
    token?: string | null;
    body?: unknown;
  } = {},
) {
  const body = Object.prototype.hasOwnProperty.call(options, "body")
    ? options.body
    : undefined;
  return requestJson<Row>(app, "POST", `/archive-connectors/import-intents/${options.intentId ?? "33333333-3333-4333-8333-000000000001"}/source-staging-runs`, {
    token: options.token === undefined ? OWNER_AUTH_MARKER : options.token ?? undefined,
    body,
  });
}

function validArchiveConnectorImportIntentBody(overrides: Row = {}) {
  return {
    personaId: OWNER_PERSONA_ID,
    sourceKey: "a".repeat(24),
    sourceFamily: "reddit_subreddit_memberships",
    sourceKind: "subreddit",
    sourceLabel: "r/StationLab",
    ...overrides,
  };
}

function archiveConnectorImportIntentRow(overrides: Row = {}) {
  return {
    id: "33333333-3333-4333-8333-000000000001",
    owner_user_id: "owner-user",
    persona_id: OWNER_PERSONA_ID,
    provider: "reddit",
    purpose: "archive_connector",
    source_family: "reddit_subreddit_memberships",
    source_kind: "subreddit",
    source_key: "a".repeat(24),
    source_label: "r/StationLab",
    status: "pending",
    idempotency_fingerprint: "c".repeat(64),
    activated_at: null,
    created_at: "2026-06-29T22:50:00.000Z",
    updated_at: "2026-06-29T22:50:00.000Z",
    ...overrides,
  };
}

function activatedRedditSavedItemsImportIntentRow(overrides: Row = {}) {
  return archiveConnectorImportIntentRow({
    source_family: "reddit_user_history",
    source_kind: "saved_items",
    source_key: "1109c5d91e731124a2b8d677",
    source_label: "Saved items",
    status: "activated",
    activated_at: "2026-06-29T23:00:00.000Z",
    updated_at: "2026-06-29T23:00:00.000Z",
    ...overrides,
  });
}

function archiveConnectorSourceStagingRunRow(overrides: Row = {}) {
  return {
    id: "44444444-4444-4444-8444-000000000001",
    owner_user_id: "owner-user",
    persona_id: OWNER_PERSONA_ID,
    import_intent_id: "33333333-3333-4333-8333-000000000001",
    provider: "reddit",
    purpose: "archive_connector",
    source_family: "reddit_user_history",
    source_kind: "saved_items",
    source_key: "1109c5d91e731124a2b8d677",
    source_label: "Saved items",
    status: "staged",
    page_limit: 10,
    item_count: 1,
    post_count: 1,
    comment_count: 0,
    skipped_count: 0,
    truncated: false,
    source_snapshot_fingerprint: "f".repeat(64),
    encrypted_source_batch: {
      schema: "station.archive_connector.source_staging_batch.v1",
      algorithm: "aes-256-gcm",
      iv: "iv-fixture",
      ciphertext: "ciphertext-fixture",
      authTag: "auth-tag-fixture",
    },
    source_read_at: "2026-06-29T23:00:00.000Z",
    expires_at: "2099-06-29T23:00:00.000Z",
    superseded_at: null,
    revoked_at: null,
    created_at: "2026-06-29T23:00:00.000Z",
    updated_at: "2026-06-29T23:00:00.000Z",
    ...overrides,
  };
}

type TokenFetchCall = {
  url: string;
  method: string | undefined;
  headers: Headers;
  body: string;
};

type AccountLookupFetchCall = {
  url: string;
  method: string | undefined;
  headers: Headers;
  signalPresent: boolean;
};

type SourceInventoryFetchCall = {
  url: string;
  method: string | undefined;
  headers: Headers;
  signalPresent: boolean;
};

type SourcePreviewFetchCall = {
  url: string;
  method: string | undefined;
  headers: Headers;
  signalPresent: boolean;
};

type SourceStagingFetchCall = {
  url: string;
  method: string | undefined;
  headers: Headers;
  signalPresent: boolean;
};

function tokenJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function accountLookupJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sourceInventoryJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sourcePreviewJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sourceStagingJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function redditSourceInventoryPayload() {
  return {
    data: {
      after: "after-cursor-fixture",
      children: [
        {
          kind: "t5",
          data: {
            id: "subreddit-raw-id-fixture",
            name: "t5_raw_fullname_fixture",
            display_name_prefixed: "r/StationLab",
            display_name: "StationLab",
            subscriber_count: 123456,
            url: "https://reddit.example/r/StationLab",
            public_description: "private-source-body-fixture",
            providerPayload: "provider-source-payload",
          },
        },
      ],
    },
  };
}

function discordSourceInventoryPayload() {
  return [
    {
      id: "guild-raw-id-fixture",
      name: "Station Guild",
      icon: "icon-fixture",
      owner: true,
      permissions: "8",
      approximate_member_count: 42,
      approximate_presence_count: 7,
      url: "https://discord.example/guild",
      providerPayload: "provider-source-payload",
    },
  ];
}

async function withTokenEndpointFetch(
  calls: TokenFetchCall[],
  fetcher: (input: string | URL, init?: RequestInit) => Promise<Response>,
  fn: () => Promise<void>,
) {
  setArchiveConnectorTokenEndpointFetchForTests(async (input, init) => {
    calls.push({
      url: String(input),
      method: init?.method,
      headers: new Headers(init?.headers),
      body: init?.body?.toString() ?? "",
    });
    return fetcher(input, init);
  });

  try {
    await fn();
  } finally {
    setArchiveConnectorTokenEndpointFetchForTests(null);
  }
}

function generatedRowId(table: string, index: number) {
  if (table === "archive_connector_import_intents") {
    return `33333333-3333-4333-8333-${String(index).padStart(12, "0")}`;
  }
  if (table === "archive_connector_source_staging_runs") {
    return `44444444-4444-4444-8444-${String(index).padStart(12, "0")}`;
  }
  return `${table}-${index}`;
}

async function withSourceInventoryFetch(
  calls: SourceInventoryFetchCall[],
  fetcher: (input: string | URL, init?: RequestInit) => Promise<Response>,
  fn: () => Promise<void>,
) {
  setArchiveConnectorSourceInventoryFetchForTests(async (input, init) => {
    calls.push({
      url: String(input),
      method: init?.method,
      headers: new Headers(init?.headers),
      signalPresent: Boolean(init?.signal),
    });
    return fetcher(input, init);
  });

  try {
    await fn();
  } finally {
    setArchiveConnectorSourceInventoryFetchForTests(null);
  }
}

async function withSourcePreviewFetch(
  calls: SourcePreviewFetchCall[],
  fetcher: (input: string | URL, init?: RequestInit) => Promise<Response>,
  fn: () => Promise<void>,
) {
  setArchiveConnectorSourcePreviewFetchForTests(async (input, init) => {
    calls.push({
      url: String(input),
      method: init?.method,
      headers: new Headers(init?.headers),
      signalPresent: Boolean(init?.signal),
    });
    return fetcher(input, init);
  });

  try {
    await fn();
  } finally {
    setArchiveConnectorSourcePreviewFetchForTests(null);
  }
}

async function withSourceStagingFetch(
  calls: SourceStagingFetchCall[],
  fetcher: (input: string | URL, init?: RequestInit) => Promise<Response>,
  fn: () => Promise<void>,
) {
  setArchiveConnectorSourceStagingFetchForTests(async (input, init) => {
    calls.push({
      url: String(input),
      method: init?.method,
      headers: new Headers(init?.headers),
      signalPresent: Boolean(init?.signal),
    });
    return fetcher(input, init);
  });

  try {
    await fn();
  } finally {
    setArchiveConnectorSourceStagingFetchForTests(null);
  }
}

async function withAccountLookupFetch(
  calls: AccountLookupFetchCall[],
  fetcher: (input: string | URL, init?: RequestInit) => Promise<Response>,
  fn: () => Promise<void>,
) {
  setArchiveConnectorAccountLookupFetchForTests(async (input, init) => {
    calls.push({
      url: String(input),
      method: init?.method,
      headers: new Headers(init?.headers),
      signalPresent: Boolean(init?.signal),
    });
    return fetcher(input, init);
  });

  try {
    await fn();
  } finally {
    setArchiveConnectorAccountLookupFetchForTests(null);
  }
}

function accountTokenMaterial(
  provider: "reddit" | "discord",
  scopeProfile: "connect" | "source_inventory" = "connect",
  overrides: Row = {},
) {
  const grantedScopes = provider === "reddit"
    ? scopeProfile === "source_inventory" ? ["identity", "mysubreddits", "history"] : ["identity"]
    : scopeProfile === "source_inventory" ? ["identify", "guilds"] : ["identify"];
  return {
    schema: "station.archive_connector.oauth_token.v1",
    provider,
    scopeProfile,
    tokenType: "bearer",
    accessToken: `${provider}-${scopeProfile}-account-proof-token`,
    refreshToken: `${provider}-${scopeProfile}-refresh-token-fixture`,
    expiresInSeconds: 3600,
    scope: grantedScopes.join(" "),
    grantedScopes,
    ...overrides,
  };
}

function encryptedArchiveConnectorCredentialRow(input: {
  ownerUserId?: string;
  provider?: "reddit" | "discord";
  scopeProfile?: "connect" | "source_inventory";
  grantedScopes?: string[];
  tokenMaterial?: Row;
  status?: string;
  purpose?: string;
  externalAccountFingerprint?: string | null;
  accountLabel?: string | null;
} = {}) {
  const provider = input.provider ?? "reddit";
  const scopeProfile = input.scopeProfile ?? "connect";
  const tokenMaterial = input.tokenMaterial ?? accountTokenMaterial(provider, scopeProfile);
  return {
    id: `row-id-fixture-${provider}-${scopeProfile}`,
    owner_user_id: input.ownerUserId ?? "owner-user",
    provider,
    purpose: input.purpose ?? "archive_connector",
    encrypted_credential: encryptArchiveConnectorCredential(tokenMaterial),
    credential_fingerprint: fingerprintArchiveConnectorCredential(provider, tokenMaterial),
    external_account_fingerprint: input.externalAccountFingerprint ?? null,
    account_label: input.accountLabel ?? null,
    status: input.status ?? "active",
    scope_profile: scopeProfile,
    granted_scopes: input.grantedScopes ?? tokenMaterial.grantedScopes,
    created_at: "2026-06-29T22:40:00.000Z",
    updated_at: "2026-06-29T22:40:00.000Z",
    rotated_at: null,
    revoked_at: input.status === "revoked" ? "2026-06-29T22:45:00.000Z" : null,
  };
}

function sourceReadyArchiveConnectorCredentialRow(input: {
  provider?: "reddit" | "discord";
  accountLabel?: string | null;
  externalAccountFingerprint?: string | null;
} = {}) {
  const provider = input.provider ?? "reddit";
  return encryptedArchiveConnectorCredentialRow({
    provider,
    scopeProfile: "source_inventory",
    accountLabel: input.accountLabel ?? (provider === "reddit" ? "Owner Reddit" : "Owner Discord"),
    externalAccountFingerprint: input.externalAccountFingerprint === undefined
      ? fingerprintArchiveConnectorExternalAccount(provider, `${provider}-raw-account-id-fixture`)
      : input.externalAccountFingerprint,
  });
}

function assertNoSensitiveArchiveConnectorReadback(body: unknown) {
  const text = JSON.stringify(body);
  const forbidden = [
    "ENCRYPTION_KEY",
    "CLIENT_ID",
    "CLIENT_SECRET",
    "archive-readiness-config-marker",
    "archive-reddit-id-marker",
    "archive-reddit-config-b",
    "archive-discord-id-marker",
    "archive-discord-config-b",
    "reddit-client-id-marker",
    "social-reddit-config-b",
    "access_token",
    "refresh_token",
    "oauth_code",
    "cookie",
    "raw-external-account",
    "owner-user",
    "archive_connector_credentials",
    "archive_connector_oauth_states",
    "archive_sources",
    "import_jobs",
    "memory_items",
    "canon_items",
    "continuity_candidates",
    "documents",
    "SQL",
    "stack",
    "signed-url",
    "storage-path",
    "prompt",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into archive connector readiness`);
  }
}

function assertNoSensitiveCredentialReadback(body: unknown) {
  const text = JSON.stringify(body);
  const forbidden = [
    "encrypted_credential",
    "ciphertext",
    "authTag",
    "access_token",
    "refresh_token",
    "oauth_code",
    "client_secret",
    "stateHandle",
    "session_id_hash",
    "nonce_hash",
    "csrf_hash",
    "credential_fingerprint",
    "external_account_fingerprint",
    "reddit-active-fingerprint",
    "reddit-old-fingerprint",
    "discord-new-fingerprint",
    "discord-old-fingerprint",
    "other-owner-fingerprint",
    "wrong-purpose-fingerprint",
    "unsupported-provider-fingerprint",
    "external-account-fixture",
    "raw-external-account",
    "row-id-fixture",
    "owner-user",
    "other-user",
    "archive_connector_oauth_states",
    "archive_sources",
    "import_jobs",
    "memory_items",
    "canon_items",
    "continuity_candidates",
    "documents",
    "private-source-body-fixture",
    "provider_payload",
    "provider-profile-payload",
    "SQL",
    "stack",
    "signed-url",
    "storage-path",
    "prompt",
    "secret-shaped-value",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into credential readback`);
  }
}

function assertNoSensitiveAccountLookupReadback(body: unknown) {
  assertNoSensitiveCredentialReadback(body);
  const text = JSON.stringify(body);
  const forbidden = [
    "reddit-connect-account-proof-token",
    "discord-connect-account-proof-token",
    "reddit-source_inventory-account-proof-token",
    "discord-source_inventory-account-proof-token",
    "reddit-source_inventory-refresh-token-fixture",
    "discord-source_inventory-refresh-token-fixture",
    "reddit-raw-account-id-fixture",
    "discord-raw-account-id-fixture",
    "different-raw-account-id-fixture",
    "provider-profile-payload",
    "request-id-fixture",
    "rate-limit-fixture",
    "Authorization",
    "Bearer",
    "users/@me",
    "api/v1/me",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into account lookup readback`);
  }
}

function assertNoSensitiveSourceInventoryReadback(body: unknown) {
  assertNoSensitiveCredentialReadback(body);
  const text = JSON.stringify(body);
  const forbidden = [
    "reddit-source_inventory-account-proof-token",
    "discord-source_inventory-account-proof-token",
    "reddit-source_inventory-refresh-token-fixture",
    "discord-source_inventory-refresh-token-fixture",
    "subreddit-raw-id-fixture",
    "guild-raw-id-fixture",
    "t5_raw_fullname_fixture",
    "after-cursor-fixture",
    "provider-source-payload",
    "request-id-fixture",
    "rate-limit-fixture",
    "subscriber_count",
    "member_count",
    "presence_count",
    "permissions",
    "icon-fixture",
    "avatar-fixture",
    "https://reddit.example",
    "https://discord.example",
    "private-source-body-fixture",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into source inventory readback`);
  }
}

function assertNoSensitiveImportIntentReadback(body: unknown) {
  assertNoSensitiveSourceInventoryReadback(body);
  const text = JSON.stringify(body);
  const forbidden = [
    "archive_connector_import_intents",
    "idempotency_fingerprint",
    "reddit-source_inventory-account-proof-token",
    "discord-source_inventory-account-proof-token",
    "reddit-source_inventory-refresh-token-fixture",
    "discord-source_inventory-refresh-token-fixture",
    "subreddit-raw-id-fixture",
    "guild-raw-id-fixture",
    "Authorization",
    "Bearer",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into import intent readback`);
  }
}

function assertNoSensitiveSourcePreviewReadback(body: unknown) {
  assertNoSensitiveImportIntentReadback(body);
  const text = JSON.stringify(body);
  const forbidden = [
    "reddit-raw-account-id-fixture",
    "different-raw-account-id-fixture",
    "OwnerPreviewUser",
    "stored-account-label-should-not-be-used",
    "after-preview-cursor-fixture",
    "provider-preview-payload",
    "saved-post-title-fixture",
    "saved-comment-body-fixture",
    "https://reddit.example/saved",
    "author-fixture",
    "subreddit-fixture",
    "request-id-fixture",
    "rate-limit-fixture",
    "Authorization",
    "Bearer",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into source preview readback`);
  }
}

function assertNoSensitiveSourceStagingReadback(body: unknown) {
  assertNoSensitiveSourcePreviewReadback(body);
  const text = JSON.stringify(body);
  const forbidden = [
    "encrypted_source_batch",
    "source_snapshot_fingerprint",
    "station.archive_connector.source_staging_batch.v1",
    "secret-shaped-source-content",
    "saved-post-title-fixture",
    "saved-post-selftext-fixture",
    "saved-comment-body-fixture",
    "skipped-secret-title-fixture",
    "https://reddit.example/saved",
    "author-fixture",
    "subreddit-fixture",
    "saved-post-id-fixture",
    "saved-comment-id-fixture",
    "after-staging-cursor-fixture",
    "provider-staging-payload",
    "staging-key-fixture",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into source staging readback`);
  }
}

function assertNoSensitiveAuthorizeReadback(body: Row, input: {
  stateHandle?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  rowId?: string;
}) {
  const text = JSON.stringify(body);
  const withoutUrl = JSON.stringify({ ...body, authorizationUrl: "" });
  const outsideUrlForbidden = [
    input.stateHandle ?? "",
    input.clientId ?? "",
    input.redirectUri ?? "",
    "stateHandle",
    "clientId",
    "redirectUri",
  ].filter(Boolean);
  const everywhereForbidden = [
    input.clientSecret ?? "",
    input.rowId ?? "",
    OWNER_AUTH_MARKER,
    "owner-user",
    "other-user",
    "session_id_hash",
    "nonce_hash",
    "csrf_hash",
    "archive_connector_oauth_states",
    "archive_connector_credentials",
    "access_token",
    "refresh_token",
    "oauth_code",
    "cookie",
    "provider_payload",
    "SQL",
    "stack",
    "prompt",
  ].filter(Boolean);

  for (const value of outsideUrlForbidden) {
    assert.equal(withoutUrl.includes(value), false, `${value} leaked outside authorizationUrl`);
  }

  for (const value of everywhereForbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into authorization readback`);
  }
}

function assertNoSensitiveExchangeReadback(body: Row, input: {
  stateHandle?: string;
  code?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  providerPayload?: string;
  rowId?: string;
}) {
  const text = JSON.stringify(body);
  const [nonce, csrf] = input.stateHandle?.split(".") ?? ["", ""];
  const forbidden = [
    input.stateHandle ?? "",
    nonce,
    csrf,
    input.code ?? "",
    input.clientId ?? "",
    input.clientSecret ?? "",
    input.accessToken ?? "",
    input.refreshToken ?? "",
    input.providerPayload ?? "",
    input.rowId ?? "",
    OWNER_AUTH_MARKER,
    "owner-user",
    "other-user",
    "session_id_hash",
    "nonce_hash",
    "csrf_hash",
    "archive_connector_oauth_states",
    "encrypted_credential",
    "ciphertext",
    "access_token",
    "refresh_token",
    "oauth_code",
    "client_secret",
    "provider_payload",
    "private-source-body-fixture",
    "SQL",
    "stack",
    "prompt",
  ].filter(Boolean);

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into exchange readback`);
  }
}

function assertNoSensitiveCallbackReadback(body: unknown, input: {
  stateHandle: string;
  code: string;
  rowId?: string;
}) {
  const text = JSON.stringify(body);
  const [nonce, csrf] = input.stateHandle.split(".");
  const forbidden = [
    input.stateHandle,
    nonce,
    csrf,
    input.code,
    input.rowId ?? "",
    OWNER_AUTH_MARKER,
    "owner-user",
    "other-user",
    "session_id_hash",
    "nonce_hash",
    "csrf_hash",
    "archive_connector_oauth_states",
    "archive_connector_credentials",
    "access_token",
    "refresh_token",
    "SQL",
    "stack",
    "prompt",
  ].filter(Boolean);

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into OAuth callback readback`);
  }
}

function assertNoSensitiveOAuthStateRow(row: unknown, stateHandle: string, token: string) {
  const text = JSON.stringify(row);
  const [nonce, csrf] = stateHandle.split(".");
  const forbidden = [
    stateHandle,
    nonce,
    csrf,
    token,
    "session-binding-fixture",
    "ENCRYPTION_KEY",
    "CLIENT_ID",
    "CLIENT_SECRET",
    "archive-readiness-config-marker",
    "archive-reddit-id-marker",
    "archive-reddit-config-b",
    "archive-discord-id-marker",
    "archive-discord-config-b",
    "reddit-client-id-marker",
    "social-reddit-config-b",
    "access_token",
    "refresh_token",
    "oauth_code",
    "cookie",
    "SQL",
    "stack",
    "prompt",
  ];

  for (const value of forbidden) {
    assert.equal(text.includes(value), false, `${value} leaked into stored OAuth state row`);
  }
}

function assertDisabledSafety(body: Row) {
  assert.deepEqual(body.safety, {
    credentialWritesEnabled: false,
    oauthStateCreationEnabled: false,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: false,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  });

  for (const provider of body.providers) {
    assert.equal(provider.credentialWritesEnabled, false);
    assert.equal(provider.oauthStateCreationEnabled, false);
    assert.equal(provider.oauthRedirectsEnabled, false);
    assert.equal(provider.oauthCallbacksEnabled, false);
    assert.equal(provider.tokenExchangeEnabled, false);
    assert.equal(provider.providerCallsEnabled, false);
    assert.equal(provider.sourceInventoryEnabled, false);
    assert.equal(provider.importWritesEnabled, false);
  }
}

test("archive connector readiness requires an authenticated owner session", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const response = await requestJson(app, "GET", "/archive-connectors/readiness");
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Missing or invalid Authorization header.");
    assert.equal(db.tableCalls.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports reddit and discord with missing encryption config bounded", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.purpose, "archive_connector");
      assert.equal(response.body.mode, "readiness_only");
      assert.equal(response.body.ownerOnly, true);
      assert.equal(response.body.credentialStorageAccepted, true);
      assert.equal(response.body.credentialEncryptionConfigured, false);
      assert.equal(response.body.providerOAuthAppConfigAccepted, true);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => provider.id),
        ["reddit", "discord"],
      );
      assert.deepEqual(
        response.body.providers.map((provider: Row) => provider.status),
        ["credential_encryption_required", "credential_encryption_required"],
      );
      assert.deepEqual(
        response.body.providers.map((provider: Row) => provider.oauthAppStatus),
        ["missing", "missing"],
      );
      for (const provider of response.body.providers) {
        assert.equal(provider.purpose, "archive_connector");
        assert.equal(provider.ownerOnly, true);
        assert.equal(provider.authStyle, "oauth");
        assert.equal(provider.credentialEncryptionConfigured, false);
        assert.equal(provider.providerOAuthAppConfigAccepted, true);
        assert.equal(provider.oauthAppConfigured, false);
        assert.deepEqual(
          provider.scopeProfiles.map((profile: Row) => [profile.scopeProfile, profile.requestedScopes, profile.sourceInventoryRequested]),
          provider.id === "reddit"
            ? [
                ["connect", ["identity"], false],
                ["source_inventory", ["identity", "mysubreddits", "history"], true],
              ]
            : [
                ["connect", ["identify"], false],
                ["source_inventory", ["identify", "guilds"], true],
              ],
        );
        assert.equal(provider.scopeProfiles.every((profile: Row) => profile.ownerOnly === true), true);
      }
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness flips encryption boolean without enabling routes or social config", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.credentialEncryptionConfigured, true);
      assert.equal(response.body.providerOAuthAppConfigAccepted, true);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_missing", "missing", false],
          ["discord", "provider_app_missing", "missing", false],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports id-only and secret-only provider app config as partial", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.providerOAuthAppConfigAccepted, true);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_partial", "partial", false],
          ["discord", "provider_app_partial", "partial", false],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports configured provider pairs independently", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.providerOAuthAppsConfigured, false);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_configured", "configured", true],
          ["discord", "provider_app_missing", "missing", false],
        ],
      );
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector readiness reports all provider app pairs configured without enabling actions", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "archive-readiness-config-marker-32-plus",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "archive-discord-id-marker",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const response = await requestJson(app, "GET", "/archive-connectors/readiness", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.providerOAuthAppsConfigured, true);
      assert.deepEqual(
        response.body.providers.map((provider: Row) => [provider.id, provider.status, provider.oauthAppStatus, provider.oauthAppConfigured]),
        [
          ["reddit", "provider_app_configured", "configured", true],
          ["discord", "provider_app_configured", "configured", true],
        ],
      );
      for (const provider of response.body.providers) {
        assert.match(provider.nextAction, /accepted OAuth start, authorization URL, callback, and token exchange routes/);
        assert.doesNotMatch(provider.nextAction, /future lane must add owner-bound OAuth state creation/);
      }
      assertDisabledSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.deepEqual(db.tableCalls, ["profiles"]);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start requires auth and rejects unsupported providers without writes", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const signedOut = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start");
    assert.equal(signedOut.status, 401);
    assert.equal(db.tableCalls.length, 0);
    assert.equal(db.rows("archive_connector_oauth_states").length, 0);

    const unsupported = await requestJson(app, "POST", "/archive-connectors/oauth/mastodon/start", {
      token: OWNER_AUTH_MARKER,
    });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
    assert.deepEqual(db.tableCalls, ["profiles"]);
    assert.equal(db.rows("archive_connector_oauth_states").length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start requires configured archive provider app without side leakage", async () => {
  const cases = [
    {
      name: "missing",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
    {
      name: "partial",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
        REDDIT_CLIENT_ID: "reddit-client-id-marker",
        REDDIT_CLIENT_SECRET: "social-reddit-config-b",
        ...setup.env,
      }, async () => {
        const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
          token: OWNER_AUTH_MARKER,
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_provider_app_setup_required");
        assert.equal(response.body.status, "setup_required");
        assert.equal(response.body.provider, "reddit");
        assert.equal("oauthAppStatus" in response.body, false);
        assertDisabledStartSafety(response.body);
        assertNoSensitiveArchiveConnectorReadback(response.body);
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth state start creates bounded state rows for configured providers", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: "archive-discord-id-marker",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: "archive-discord-config-b",
      REDDIT_CLIENT_ID: "reddit-client-id-marker",
      REDDIT_CLIENT_SECRET: "social-reddit-config-b",
    }, async () => {
      const reddit = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
        token: OWNER_AUTH_MARKER,
        body: {
          localRedirectPath: "/studio/archive?provider=reddit#ready",
          scopeProfile: "source_inventory",
        },
      });
      const discord = await requestJson(app, "POST", "/archive-connectors/oauth/discord/start", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(reddit.status, 201);
      assert.equal(discord.status, 201);
      assert.equal(reddit.body.status, "oauth_state_created");
      assert.equal(discord.body.status, "oauth_state_created");
      assert.equal(reddit.body.provider, "reddit");
      assert.equal(discord.body.provider, "discord");
      assert.equal(reddit.body.purpose, "archive_connector");
      assert.equal(discord.body.purpose, "archive_connector");
      assert.equal(reddit.body.localRedirectPath, "/studio/archive?provider=reddit#ready");
      assert.equal(discord.body.localRedirectPath, null);
      assert.equal(reddit.body.scopeProfile, "source_inventory");
      assert.equal(discord.body.scopeProfile, "connect");
      assert.deepEqual(reddit.body.requestedScopes, ["identity", "mysubreddits", "history"]);
      assert.deepEqual(discord.body.requestedScopes, ["identify"]);
      assert.equal(reddit.body.sourceInventoryRequested, true);
      assert.equal(discord.body.sourceInventoryRequested, false);
      assert.equal("reconnectRequiredForSourceInventory" in reddit.body, false);
      assert.equal("reconnectRequiredForSourceInventory" in discord.body, false);
      assert.match(reddit.body.stateHandle, /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/);
      assert.match(discord.body.stateHandle, /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/);
      assert.notEqual(reddit.body.stateHandle, discord.body.stateHandle);
      assertDisabledStartSafety(reddit.body);
      assertDisabledStartSafety(discord.body);
      assertNoSensitiveArchiveConnectorReadback(reddit.body);
      assertNoSensitiveArchiveConnectorReadback(discord.body);

      const rows = db.rows("archive_connector_oauth_states");
      assert.equal(rows.length, 2);
      assert.deepEqual(rows.map((row) => row.provider), ["reddit", "discord"]);
      for (const [index, row] of rows.entries()) {
        const response = index === 0 ? reddit.body : discord.body;
        assert.equal(row.owner_user_id, "owner-user");
        assert.equal(row.purpose, "archive_connector");
        assert.equal(row.consumed_at, null);
        assert.equal(typeof row.session_id_hash, "string");
        assert.equal(typeof row.nonce_hash, "string");
        assert.equal(typeof row.csrf_hash, "string");
        assert.equal(row.session_id_hash.length, 64);
        assert.equal(row.nonce_hash.length, 64);
        assert.equal(row.csrf_hash.length, 64);
        assert.equal(row.expires_at, response.expiresAt);
        assert.equal(row.local_redirect_path, response.localRedirectPath);
        assert.equal(row.scope_profile, response.scopeProfile);
        assertNoSensitiveOAuthStateRow(row, response.stateHandle, OWNER_AUTH_MARKER);
      }
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start returns bounded storage failure", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.insertErrorTables.add("archive_connector_oauth_states");
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({
      ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
      ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
      ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
    }, async () => {
      const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
        token: OWNER_AUTH_MARKER,
      });

      assert.equal(response.status, 500);
      assert.equal(response.body.code, "archive_connector_oauth_state_start_failed");
      assert.equal(response.body.status, "start_failed");
      assert.equal(response.body.provider, "reddit");
      assert.equal("stateHandle" in response.body, false);
      assertDisabledStartSafety(response.body);
      assertNoSensitiveArchiveConnectorReadback(response.body);
      assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth state start rejects invalid local redirects without writes", async () => {
  const invalidRedirects = [
    "https://example.invalid/callback",
    "//example.invalid/callback",
    "javascript:alert(1)",
    "/studio\\archive",
    "/studio/archive\u0001",
    `/${"a".repeat(201)}`,
    42,
  ];

  for (const localRedirectPath of invalidRedirects) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "archive-reddit-id-marker",
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: "archive-reddit-config-b",
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET: null,
      }, async () => {
        const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
          token: OWNER_AUTH_MARKER,
          body: { localRedirectPath },
        });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, "archive_connector_oauth_start_invalid");
        assertDisabledStartSafety(response.body);
        assertNoSensitiveArchiveConnectorReadback(response.body);
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth callback verify requires auth and rejects unsupported or malformed input without writes", async () => {
  const validStateHandle = `${"a".repeat(43)}.${"b".repeat(43)}`;
  const validCode = "callback-code.fixture_~+/=";

  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await requestJson(signedOutApp, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
      body: { stateHandle: validStateHandle, code: validCode },
    });

    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.deepEqual(signedOutDb.tableCalls, []);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const unsupportedDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(unsupportedDb.client as any);
  const unsupportedApp = await createArchiveConnectorApp();

  try {
    const unsupported = await requestJson(unsupportedApp, "POST", "/archive-connectors/oauth/mastodon/callback/verify", {
      token: OWNER_AUTH_MARKER,
      body: { stateHandle: validStateHandle, code: validCode },
    });

    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
    assert.deepEqual(unsupportedDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const malformedBodies = [
    { stateHandle: "not-a-state", code: validCode },
    { stateHandle: validStateHandle, code: "" },
    { stateHandle: validStateHandle, code: "code with spaces" },
    { stateHandle: validStateHandle, code: `${"a".repeat(1025)}` },
    { stateHandle: validStateHandle, code: validCode, ownerUserId: "owner-user" },
    { stateHandle: validStateHandle },
    { code: validCode },
    {},
  ];

  for (const body of malformedBodies) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
        token: OWNER_AUTH_MARKER,
        body,
      });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "archive_connector_callback_invalid");
      assertDisabledCallbackVerifySafety(response.body);
      assertNoSensitiveCallbackReadback(response.body, { stateHandle: validStateHandle, code: validCode });
      assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      assert.deepEqual(db.writeCalls, []);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth callback verify consumes a PR484E state exactly once", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();
  const callbackCode = "callback-code.fixture_~+/=";

  try {
    await withEnv(archiveConnectorConfiguredEnv(), async () => {
      const started = await startArchiveConnectorOAuthState(app, {
        localRedirectPath: "/studio/archive?provider=reddit",
      });
      assert.equal(started.status, 201);

      const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
        token: OWNER_AUTH_MARKER,
        body: { stateHandle: started.body.stateHandle, code: callbackCode },
      });

      assert.equal(response.status, 200);
      assert.equal(response.body.status, "oauth_state_verified");
      assert.equal(response.body.provider, "reddit");
      assert.equal(response.body.purpose, "archive_connector");
      assert.equal(response.body.consumed, true);
      assert.equal(response.body.localRedirectPath, "/studio/archive?provider=reddit");
      assertDisabledCallbackVerifySafety(response.body);
      assertNoSensitiveCallbackReadback(response.body, {
        stateHandle: started.body.stateHandle,
        code: callbackCode,
        rowId: db.rows("archive_connector_oauth_states")[0].id,
      });

      const stored = db.rows("archive_connector_oauth_states")[0];
      assert.equal(typeof stored.consumed_at, "string");

      const replay = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/callback/verify", {
        token: OWNER_AUTH_MARKER,
        body: { stateHandle: started.body.stateHandle, code: callbackCode },
      });

      assert.equal(replay.status, 409);
      assert.equal(replay.body.code, "archive_connector_oauth_state_invalid");
      assertDisabledCallbackVerifySafety(replay.body);
      assertNoSensitiveCallbackReadback(replay.body, {
        stateHandle: started.body.stateHandle,
        code: callbackCode,
        rowId: stored.id,
      });
      assert.deepEqual(db.writeCalls, [
        "archive_connector_oauth_states.insert",
        "archive_connector_oauth_states.update",
      ]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth callback verify fails closed on owner provider session csrf and expiry mismatches", async () => {
  const callbackCode = "callback-code.fixture_~+/=";

  const cases: Array<{
    name: string;
    mutateDb?: (db: ArchiveConnectorReadinessSupabase) => void;
    verifyProvider?: "reddit" | "discord";
    verifyToken?: string;
    stateHandle?: (original: string) => string;
    addToken?: [string, { id: string; email: string; tier?: string; isAdmin?: boolean }];
  }> = [
    {
      name: "owner",
      addToken: ["other-owner-marker", { id: "other-user", email: "other@example.test" }],
      verifyToken: "other-owner-marker",
    },
    {
      name: "session",
      addToken: ["owner-other-session-marker", { id: "owner-user", email: "owner@example.test" }],
      verifyToken: "owner-other-session-marker",
    },
    {
      name: "provider",
      verifyProvider: "discord",
    },
    {
      name: "csrf",
      stateHandle: (original) => `${original.split(".")[0]}.${"c".repeat(43)}`,
    },
    {
      name: "expiry",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].expires_at = "2000-01-01T00:00:00.000Z";
      },
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    if (setup.addToken) db.addUserToken(...setup.addToken);
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorConfiguredEnv(), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201, setup.name);
        setup.mutateDb?.(db);

        const response = await requestJson(app, "POST", `/archive-connectors/oauth/${setup.verifyProvider ?? "reddit"}/callback/verify`, {
          token: setup.verifyToken ?? OWNER_AUTH_MARKER,
          body: {
            stateHandle: setup.stateHandle?.(started.body.stateHandle) ?? started.body.stateHandle,
            code: callbackCode,
          },
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_oauth_state_invalid", setup.name);
        assertDisabledCallbackVerifySafety(response.body);
        assertNoSensitiveCallbackReadback(response.body, {
          stateHandle: started.body.stateHandle,
          code: callbackCode,
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize requires auth and rejects unsupported or malformed input without URL readback", async () => {
  const validStateHandle = `${"a".repeat(43)}.${"b".repeat(43)}`;

  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await authorizeArchiveConnectorOAuthState(signedOutApp, {
      token: null,
      body: { stateHandle: validStateHandle },
    });

    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.deepEqual(signedOutDb.tableCalls, []);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const unsupportedDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(unsupportedDb.client as any);
  const unsupportedApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorAuthorizeEnv(), async () => {
      const unsupported = await authorizeArchiveConnectorOAuthState(unsupportedApp, {
        provider: "mastodon",
        body: { stateHandle: validStateHandle },
      });

      assert.equal(unsupported.status, 400);
      assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
      assert.equal("authorizationUrl" in unsupported.body, false);
      assert.deepEqual(unsupportedDb.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const malformedBodies = [
    { stateHandle: "not-a-state" },
    { stateHandle: validStateHandle, code: "callback-code-fixture" },
    { stateHandle: validStateHandle, ownerUserId: "owner-user" },
    { stateHandle: validStateHandle, scopeProfile: "source_inventory" },
    { stateHandle: validStateHandle, scope: "identity history" },
    { stateHandle: validStateHandle, requestedScopes: ["identity", "history"] },
    {},
    [],
  ];

  for (const body of malformedBodies) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(), async () => {
        const response = await authorizeArchiveConnectorOAuthState(app, { body });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, "archive_connector_authorize_invalid");
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          stateHandle: validStateHandle,
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
        });
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
        assert.deepEqual(db.writeCalls, []);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize requires configured provider app without client id leakage", async () => {
  const setupCases = [
    {
      name: "missing",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
    {
      name: "partial",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: "reddit-public-client-id-fixture",
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
    },
  ];

  for (const setup of setupCases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(setup.env), async () => {
        const response = await authorizeArchiveConnectorOAuthState(app, {
          body: { stateHandle: `${"a".repeat(43)}.${"b".repeat(43)}` },
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_provider_app_setup_required");
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
        });
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
        assert.deepEqual(db.writeCalls, []);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize rejects missing invalid and unsafe web app origins", async () => {
  const cases: Array<{
    name: string;
    env: Record<string, string | null>;
    status: number;
    code: string;
  }> = [
    { name: "missing", env: { NEXT_PUBLIC_APP_URL: null }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "malformed", env: { NEXT_PUBLIC_APP_URL: "not a url" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "query", env: { NEXT_PUBLIC_APP_URL: "https://station.example?x=1" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "hash", env: { NEXT_PUBLIC_APP_URL: "https://station.example/#frag" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "credentials", env: { NEXT_PUBLIC_APP_URL: "https://user:pass@station.example" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "scheme", env: { NEXT_PUBLIC_APP_URL: "ftp://station.example" }, status: 400, code: "archive_connector_callback_origin_invalid" },
    { name: "http-nonlocal", env: { NEXT_PUBLIC_APP_URL: "http://station.example" }, status: 409, code: "archive_connector_callback_origin_unsafe" },
    { name: "prod-localhost", env: { NEXT_PUBLIC_APP_URL: "http://localhost:3000", NODE_ENV: "production" }, status: 409, code: "archive_connector_callback_origin_unsafe" },
    { name: "railway-localhost", env: { NEXT_PUBLIC_APP_URL: "http://localhost:3000", RAILWAY_ENVIRONMENT_NAME: "production" }, status: 409, code: "archive_connector_callback_origin_unsafe" },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(setup.env), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201, setup.name);

        const response = await authorizeArchiveConnectorOAuthState(app, {
          stateHandle: started.body.stateHandle,
        });

        assert.equal(response.status, setup.status, setup.name);
        assert.equal(response.body.code, setup.code, setup.name);
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          stateHandle: started.body.stateHandle,
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth authorize returns bounded Reddit and Discord authorization URLs without consuming state", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorAuthorizeEnv({ NEXT_PUBLIC_APP_URL: "https://station.example/app" }), async () => {
      const redditStart = await startArchiveConnectorOAuthState(app, { provider: "reddit" });
      const discordStart = await startArchiveConnectorOAuthState(app, { provider: "discord" });
      const redditSourceStart = await startArchiveConnectorOAuthState(app, {
        provider: "reddit",
        scopeProfile: "source_inventory",
      });
      const discordSourceStart = await startArchiveConnectorOAuthState(app, {
        provider: "discord",
        scopeProfile: "source_inventory",
      });
      assert.equal(redditStart.status, 201);
      assert.equal(discordStart.status, 201);
      assert.equal(redditSourceStart.status, 201);
      assert.equal(discordSourceStart.status, 201);

      const reddit = await authorizeArchiveConnectorOAuthState(app, {
        provider: "reddit",
        stateHandle: redditStart.body.stateHandle,
      });
      const redditAgain = await authorizeArchiveConnectorOAuthState(app, {
        provider: "reddit",
        stateHandle: redditStart.body.stateHandle,
      });
      const discord = await authorizeArchiveConnectorOAuthState(app, {
        provider: "discord",
        stateHandle: discordStart.body.stateHandle,
      });
      const redditSource = await authorizeArchiveConnectorOAuthState(app, {
        provider: "reddit",
        stateHandle: redditSourceStart.body.stateHandle,
      });
      const discordSource = await authorizeArchiveConnectorOAuthState(app, {
        provider: "discord",
        stateHandle: discordSourceStart.body.stateHandle,
      });

      assert.equal(reddit.status, 200);
      assert.equal(redditAgain.status, 200);
      assert.equal(discord.status, 200);
      assert.equal(redditSource.status, 200);
      assert.equal(discordSource.status, 200);
      assert.equal(reddit.body.authorizationUrl, redditAgain.body.authorizationUrl);
      assert.equal(reddit.body.scopeProfile, "connect");
      assert.equal(discord.body.scopeProfile, "connect");
      assert.equal(redditSource.body.scopeProfile, "source_inventory");
      assert.equal(discordSource.body.scopeProfile, "source_inventory");
      assert.deepEqual(reddit.body.requestedScopes, ["identity"]);
      assert.deepEqual(discord.body.requestedScopes, ["identify"]);
      assert.deepEqual(redditSource.body.requestedScopes, ["identity", "mysubreddits", "history"]);
      assert.deepEqual(discordSource.body.requestedScopes, ["identify", "guilds"]);
      assertAuthorizationUrlSafety(reddit.body);
      assertAuthorizationUrlSafety(discord.body);
      assertAuthorizationUrlSafety(redditSource.body);
      assertAuthorizationUrlSafety(discordSource.body);
      assertNoSensitiveAuthorizeReadback(reddit.body, {
        stateHandle: redditStart.body.stateHandle,
        clientId: "reddit-public-client-id-fixture",
        clientSecret: "reddit-private-app-marker",
        redirectUri: "https://station.example/archive-connectors/oauth/callback/reddit",
        rowId: db.rows("archive_connector_oauth_states")[0].id,
      });
      assertNoSensitiveAuthorizeReadback(discord.body, {
        stateHandle: discordStart.body.stateHandle,
        clientId: "discord-public-client-id-fixture",
        clientSecret: "discord-private-app-marker",
        redirectUri: "https://station.example/archive-connectors/oauth/callback/discord",
        rowId: db.rows("archive_connector_oauth_states")[1].id,
      });

      const redditUrl = new URL(reddit.body.authorizationUrl);
      assert.equal(`${redditUrl.origin}${redditUrl.pathname}`, "https://www.reddit.com/api/v1/authorize");
      assert.equal(redditUrl.searchParams.get("client_id"), "reddit-public-client-id-fixture");
      assert.equal(redditUrl.searchParams.get("response_type"), "code");
      assert.equal(redditUrl.searchParams.get("state"), redditStart.body.stateHandle);
      assert.equal(redditUrl.searchParams.get("redirect_uri"), "https://station.example/archive-connectors/oauth/callback/reddit");
      assert.equal(redditUrl.searchParams.get("duration"), "temporary");
      assert.equal(redditUrl.searchParams.get("scope"), "identity");
      assert.equal(redditUrl.searchParams.has("client_secret"), false);

      const discordUrl = new URL(discord.body.authorizationUrl);
      assert.equal(`${discordUrl.origin}${discordUrl.pathname}`, "https://discord.com/oauth2/authorize");
      assert.equal(discordUrl.searchParams.get("client_id"), "discord-public-client-id-fixture");
      assert.equal(discordUrl.searchParams.get("response_type"), "code");
      assert.equal(discordUrl.searchParams.get("state"), discordStart.body.stateHandle);
      assert.equal(discordUrl.searchParams.get("redirect_uri"), "https://station.example/archive-connectors/oauth/callback/discord");
      assert.equal(discordUrl.searchParams.get("scope"), "identify");
      assert.equal(discordUrl.searchParams.has("client_secret"), false);

      const redditSourceUrl = new URL(redditSource.body.authorizationUrl);
      assert.equal(redditSourceUrl.searchParams.get("scope"), "identity mysubreddits history");
      assert.equal(redditSourceUrl.searchParams.has("client_secret"), false);

      const discordSourceUrl = new URL(discordSource.body.authorizationUrl);
      assert.equal(discordSourceUrl.searchParams.get("scope"), "identify guilds");
      assert.equal(discordSourceUrl.searchParams.has("client_secret"), false);

      for (const row of db.rows("archive_connector_oauth_states")) {
        assert.equal(row.consumed_at, null);
      }
      assert.deepEqual(db.writeCalls, [
        "archive_connector_oauth_states.insert",
        "archive_connector_oauth_states.insert",
        "archive_connector_oauth_states.insert",
        "archive_connector_oauth_states.insert",
      ]);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth authorize validates existing state without consuming and fails closed on mismatches", async () => {
  const cases: Array<{
    name: string;
    mutateDb?: (db: ArchiveConnectorReadinessSupabase) => void;
    verifyProvider?: "reddit" | "discord";
    verifyToken?: string;
    stateHandle?: (original: string) => string;
    addToken?: [string, { id: string; email: string; tier?: string; isAdmin?: boolean }];
  }> = [
    {
      name: "owner",
      addToken: ["other-owner-marker", { id: "other-user", email: "other@example.test" }],
      verifyToken: "other-owner-marker",
    },
    {
      name: "session",
      addToken: ["owner-other-session-marker", { id: "owner-user", email: "owner@example.test" }],
      verifyToken: "owner-other-session-marker",
    },
    {
      name: "provider",
      verifyProvider: "discord",
    },
    {
      name: "csrf",
      stateHandle: (original) => `${original.split(".")[0]}.${"c".repeat(43)}`,
    },
    {
      name: "expiry",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].expires_at = "2000-01-01T00:00:00.000Z";
      },
    },
    {
      name: "consumed",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].consumed_at = "2026-06-29T23:00:00.000Z";
      },
    },
  ];

  for (const setup of cases) {
    const db = new ArchiveConnectorReadinessSupabase();
    if (setup.addToken) db.addUserToken(...setup.addToken);
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201, setup.name);
        setup.mutateDb?.(db);

        const response = await authorizeArchiveConnectorOAuthState(app, {
          provider: setup.verifyProvider ?? "reddit",
          token: setup.verifyToken ?? OWNER_AUTH_MARKER,
          stateHandle: setup.stateHandle?.(started.body.stateHandle) ?? started.body.stateHandle,
        });

        assert.equal(response.status, 409, setup.name);
        assert.equal(response.body.code, "archive_connector_oauth_state_invalid", setup.name);
        assert.equal("authorizationUrl" in response.body, false);
        assertAuthorizationUrlSafety(response.body);
        assertNoSensitiveAuthorizeReadback(response.body, {
          stateHandle: started.body.stateHandle,
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth exchange requires auth and rejects unsupported or malformed input without token work", async () => {
  const validStateHandle = `${"a".repeat(43)}.${"b".repeat(43)}`;
  const validCode = "callback-code.fixture_~+/=";
  const calls: TokenFetchCall[] = [];

  await withTokenEndpointFetch(calls, async () => tokenJsonResponse({ access_token: "should-not-run" }), async () => {
    const signedOutDb = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(signedOutDb.client as any);
    const signedOutApp = await createArchiveConnectorApp();

    try {
      const signedOut = await exchangeArchiveConnectorOAuthCallback(signedOutApp, {
        token: null,
        body: { stateHandle: validStateHandle, code: validCode },
      });

      assert.equal(signedOut.status, 401);
      assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
      assert.deepEqual(signedOutDb.tableCalls, []);
      assert.deepEqual(signedOutDb.writeCalls, []);
      assert.equal(calls.length, 0);
    } finally {
      setSupabaseAdminForTests(null);
    }

    const unsupportedDb = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(unsupportedDb.client as any);
    const unsupportedApp = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        const unsupported = await exchangeArchiveConnectorOAuthCallback(unsupportedApp, {
          provider: "mastodon",
          body: { stateHandle: validStateHandle, code: validCode },
        });

        assert.equal(unsupported.status, 400);
        assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
        assert.equal("credential" in unsupported.body, false);
        assert.deepEqual(unsupportedDb.writeCalls, []);
        assert.equal(calls.length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }

    const malformedBodies = [
      { stateHandle: "not-a-state", code: validCode },
      { stateHandle: validStateHandle, code: "" },
      { stateHandle: validStateHandle, code: "code with spaces" },
      { stateHandle: validStateHandle, code: validCode, clientSecret: "reddit-private-app-marker" },
      { stateHandle: validStateHandle },
      { code: validCode },
      {},
      [],
    ];

    for (const body of malformedBodies) {
      const db = new ArchiveConnectorReadinessSupabase();
      setSupabaseAdminForTests(db.client as any);
      const app = await createArchiveConnectorApp();

      try {
        await withEnv(archiveConnectorExchangeEnv(), async () => {
          const response = await exchangeArchiveConnectorOAuthCallback(app, { body });

          assert.equal(response.status, 400);
          assert.equal(response.body.code, "archive_connector_exchange_invalid");
          assertExchangeSafety(response.body, false);
          assertNoSensitiveExchangeReadback(response.body, {
            stateHandle: validStateHandle,
            code: validCode,
            clientSecret: "reddit-private-app-marker",
          });
          assert.equal(db.rows("archive_connector_oauth_states").length, 0);
          assert.deepEqual(db.writeCalls, []);
          assert.equal(calls.length, 0);
        });
      } finally {
        setSupabaseAdminForTests(null);
      }
    }
  });
});

test("archive connector OAuth exchange fails local config checks before state consume token fetch or credential write", async () => {
  const cases: Array<{
    name: string;
    env: Record<string, string | null>;
    status: number;
    code: string;
  }> = [
    {
      name: "missing-provider-app",
      env: {
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID: null,
        ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET: null,
      },
      status: 409,
      code: "archive_connector_provider_app_setup_required",
    },
    {
      name: "missing-encryption",
      env: { ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null },
      status: 409,
      code: "archive_connector_credential_encryption_required",
    },
    {
      name: "malformed-encryption",
      env: { ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: "short" },
      status: 409,
      code: "archive_connector_credential_encryption_required",
    },
    {
      name: "unsafe-origin",
      env: { NEXT_PUBLIC_APP_URL: "http://station.example" },
      status: 409,
      code: "archive_connector_callback_origin_unsafe",
    },
  ];

  for (const setup of cases) {
    const calls: TokenFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withTokenEndpointFetch(calls, async () => tokenJsonResponse({ access_token: "should-not-run" }), async () => {
        let stateHandle: string;
        await withEnv(archiveConnectorExchangeEnv(), async () => {
          const started = await startArchiveConnectorOAuthState(app);
          assert.equal(started.status, 201, setup.name);
          stateHandle = started.body.stateHandle;
        });

        await withEnv(archiveConnectorExchangeEnv(setup.env), async () => {
          const response = await exchangeArchiveConnectorOAuthCallback(app, {
            stateHandle,
            code: "callback-code.fixture_~+/=",
          });

          assert.equal(response.status, setup.status, setup.name);
          assert.equal(response.body.code, setup.code, setup.name);
          assertExchangeSafety(response.body, false);
          assertNoSensitiveExchangeReadback(response.body, {
            stateHandle,
            code: "callback-code.fixture_~+/=",
            clientId: "reddit-public-client-id-fixture",
            clientSecret: "reddit-private-app-marker",
            rowId: db.rows("archive_connector_oauth_states")[0].id,
          });
          assert.equal(db.rows("archive_connector_oauth_states")[0].consumed_at, null);
          assert.equal(db.rows("archive_connector_credentials").length, 0);
          assert.equal(calls.length, 0);
          assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth exchange calls Reddit and Discord token endpoints then stores encrypted credential metadata", async () => {
  const calls: TokenFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv({ NEXT_PUBLIC_APP_URL: "https://station.example/app" }), async () => {
      await withTokenEndpointFetch(calls, async (input) => {
        if (String(input).includes("reddit")) {
          assert.equal(typeof db.rows("archive_connector_oauth_states")[0].consumed_at, "string");
          return tokenJsonResponse({
            access_token: "reddit-access-token-fixture",
            refresh_token: "reddit-refresh-token-fixture",
            token_type: "bearer",
            expires_in: 3600,
            scope: "identity",
          });
        }

        assert.equal(typeof db.rows("archive_connector_oauth_states")[1].consumed_at, "string");
        return tokenJsonResponse({
          access_token: "discord-access-token-fixture",
          refresh_token: "discord-refresh-token-fixture",
          token_type: "Bearer",
          expires_in: 7200,
          scope: "identify",
        });
      }, async () => {
        const redditStart = await startArchiveConnectorOAuthState(app, { provider: "reddit" });
        const discordStart = await startArchiveConnectorOAuthState(app, { provider: "discord" });
        assert.equal(redditStart.status, 201);
        assert.equal(discordStart.status, 201);

        const reddit = await exchangeArchiveConnectorOAuthCallback(app, {
          provider: "reddit",
          stateHandle: redditStart.body.stateHandle,
          code: "reddit-code.fixture_~+/=",
        });
        const discord = await exchangeArchiveConnectorOAuthCallback(app, {
          provider: "discord",
          stateHandle: discordStart.body.stateHandle,
          code: "discord-code.fixture_~+/=",
        });

        assert.equal(reddit.status, 200);
        assert.equal(discord.status, 200);
        assert.equal(reddit.body.status, "archive_connector_connected");
        assert.equal(discord.body.status, "archive_connector_connected");
        assert.equal(reddit.body.tokenExchangeComplete, true);
        assert.equal(reddit.body.credentialWriteComplete, true);
        assertExchangeSafety(reddit.body, true);
        assertExchangeSafety(discord.body, true);
        assert.equal(reddit.body.credential.provider, "reddit");
        assert.equal(discord.body.credential.provider, "discord");
        assert.equal(reddit.body.scopeProfile, "connect");
        assert.equal(discord.body.scopeProfile, "connect");
        assert.deepEqual(reddit.body.grantedScopes, ["identity"]);
        assert.deepEqual(discord.body.grantedScopes, ["identify"]);
        assert.equal(reddit.body.credential.scopeProfile, "connect");
        assert.equal(discord.body.credential.scopeProfile, "connect");
        assert.deepEqual(reddit.body.credential.grantedScopes, ["identity"]);
        assert.deepEqual(discord.body.credential.grantedScopes, ["identify"]);
        assert.equal(reddit.body.credential.connectionScopeState, "account_proof_only");
        assert.equal(discord.body.credential.connectionScopeState, "account_proof_only");
        assert.equal(reddit.body.credential.reconnectRequiredForSourceInventory, true);
        assert.equal(discord.body.credential.reconnectRequiredForSourceInventory, true);
        assert.equal(reddit.body.credential.configured, true);
        assert.equal(discord.body.credential.configured, true);
        assert.equal(reddit.body.credential.accountLabel, null);
        assert.equal(discord.body.credential.accountLabel, null);
        assertNoSensitiveExchangeReadback(reddit.body, {
          stateHandle: redditStart.body.stateHandle,
          code: "reddit-code.fixture_~+/=",
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          accessToken: "reddit-access-token-fixture",
          refreshToken: "reddit-refresh-token-fixture",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assertNoSensitiveExchangeReadback(discord.body, {
          stateHandle: discordStart.body.stateHandle,
          code: "discord-code.fixture_~+/=",
          clientId: "discord-public-client-id-fixture",
          clientSecret: "discord-private-app-marker",
          accessToken: "discord-access-token-fixture",
          refreshToken: "discord-refresh-token-fixture",
          rowId: db.rows("archive_connector_oauth_states")[1].id,
        });

        assert.equal(calls.length, 2);
        const redditCall = calls[0];
        assert.equal(redditCall.url, "https://www.reddit.com/api/v1/access_token");
        assert.equal(redditCall.method, "POST");
        assert.equal(redditCall.headers.get("Content-Type"), "application/x-www-form-urlencoded");
        assert.equal(
          redditCall.headers.get("Authorization"),
          `Basic ${Buffer.from("reddit-public-client-id-fixture:reddit-private-app-marker", "utf8").toString("base64")}`,
        );
        const redditForm = new URLSearchParams(redditCall.body);
        assert.equal(redditForm.get("grant_type"), "authorization_code");
        assert.equal(redditForm.get("code"), "reddit-code.fixture_~+/=");
        assert.equal(redditForm.get("redirect_uri"), "https://station.example/archive-connectors/oauth/callback/reddit");
        assert.equal(redditForm.has("client_secret"), false);

        const discordCall = calls[1];
        assert.equal(discordCall.url, "https://discord.com/api/oauth2/token");
        assert.equal(discordCall.method, "POST");
        assert.equal(discordCall.headers.get("Content-Type"), "application/x-www-form-urlencoded");
        assert.equal(discordCall.headers.has("Authorization"), false);
        const discordForm = new URLSearchParams(discordCall.body);
        assert.equal(discordForm.get("client_id"), "discord-public-client-id-fixture");
        assert.equal(discordForm.get("client_secret"), "discord-private-app-marker");
        assert.equal(discordForm.get("grant_type"), "authorization_code");
        assert.equal(discordForm.get("code"), "discord-code.fixture_~+/=");
        assert.equal(discordForm.get("redirect_uri"), "https://station.example/archive-connectors/oauth/callback/discord");

        assert.equal(db.rows("archive_connector_credentials").length, 2);
        const [redditCredentialRow, discordCredentialRow] = db.rows("archive_connector_credentials");
        assert.equal(redditCredentialRow.scope_profile, "connect");
        assert.equal(discordCredentialRow.scope_profile, "connect");
        assert.deepEqual(redditCredentialRow.granted_scopes, ["identity"]);
        assert.deepEqual(discordCredentialRow.granted_scopes, ["identify"]);
        const credentialText = JSON.stringify(db.rows("archive_connector_credentials"));
        for (const forbidden of [
          "reddit-access-token-fixture",
          "reddit-refresh-token-fixture",
          "discord-access-token-fixture",
          "discord-refresh-token-fixture",
          "reddit-code.fixture_~+/=",
          "discord-code.fixture_~+/=",
          redditStart.body.stateHandle,
          discordStart.body.stateHandle,
          "reddit-private-app-marker",
          "discord-private-app-marker",
        ]) {
          assert.equal(credentialText.includes(forbidden), false, `${forbidden} leaked into encrypted credential rows`);
        }
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth exchange binds source inventory token scopes to consumed state profile", async () => {
  const calls: TokenFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv({ NEXT_PUBLIC_APP_URL: "https://station.example/app" }), async () => {
      await withTokenEndpointFetch(calls, async (input) => {
        if (String(input).includes("reddit")) {
          return tokenJsonResponse({
            access_token: "reddit-access-token-fixture",
            refresh_token: "reddit-refresh-token-fixture",
            token_type: "bearer",
            expires_in: 3600,
            scope: "history identity mysubreddits identity",
          });
        }

        return tokenJsonResponse({
          access_token: "discord-access-token-fixture",
          refresh_token: "discord-refresh-token-fixture",
          token_type: "Bearer",
          expires_in: 7200,
          scope: "guilds identify guilds",
        });
      }, async () => {
        const redditStart = await startArchiveConnectorOAuthState(app, {
          provider: "reddit",
          scopeProfile: "source_inventory",
        });
        const discordStart = await startArchiveConnectorOAuthState(app, {
          provider: "discord",
          scopeProfile: "source_inventory",
        });

        const reddit = await exchangeArchiveConnectorOAuthCallback(app, {
          provider: "reddit",
          stateHandle: redditStart.body.stateHandle,
          code: "reddit-code.fixture_~+/=",
        });
        const discord = await exchangeArchiveConnectorOAuthCallback(app, {
          provider: "discord",
          stateHandle: discordStart.body.stateHandle,
          code: "discord-code.fixture_~+/=",
        });

        assert.equal(reddit.status, 200);
        assert.equal(discord.status, 200);
        assert.equal(reddit.body.scopeProfile, "source_inventory");
        assert.equal(discord.body.scopeProfile, "source_inventory");
        assert.deepEqual(reddit.body.grantedScopes, ["identity", "mysubreddits", "history"]);
        assert.deepEqual(discord.body.grantedScopes, ["identify", "guilds"]);
        assert.equal(reddit.body.credential.scopeProfile, "source_inventory");
        assert.equal(discord.body.credential.scopeProfile, "source_inventory");
        assert.deepEqual(reddit.body.credential.grantedScopes, ["identity", "mysubreddits", "history"]);
        assert.deepEqual(discord.body.credential.grantedScopes, ["identify", "guilds"]);
        assert.equal(reddit.body.credential.connectionScopeState, "source_scope_ready");
        assert.equal(discord.body.credential.connectionScopeState, "source_scope_ready");
        assert.equal(reddit.body.credential.reconnectRequiredForSourceInventory, false);
        assert.equal(discord.body.credential.reconnectRequiredForSourceInventory, false);
        assert.equal(calls.length, 2);

        const [redditCredentialRow, discordCredentialRow] = db.rows("archive_connector_credentials");
        assert.equal(redditCredentialRow.scope_profile, "source_inventory");
        assert.equal(discordCredentialRow.scope_profile, "source_inventory");
        assert.deepEqual(redditCredentialRow.granted_scopes, ["identity", "mysubreddits", "history"]);
        assert.deepEqual(discordCredentialRow.granted_scopes, ["identify", "guilds"]);
        assertNoSensitiveExchangeReadback(reddit.body, {
          stateHandle: redditStart.body.stateHandle,
          code: "reddit-code.fixture_~+/=",
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          accessToken: "reddit-access-token-fixture",
          refreshToken: "reddit-refresh-token-fixture",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assertNoSensitiveExchangeReadback(discord.body, {
          stateHandle: discordStart.body.stateHandle,
          code: "discord-code.fixture_~+/=",
          clientId: "discord-public-client-id-fixture",
          clientSecret: "discord-private-app-marker",
          accessToken: "discord-access-token-fixture",
          refreshToken: "discord-refresh-token-fixture",
          rowId: db.rows("archive_connector_oauth_states")[1].id,
        });
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth exchange consumes state before bounded provider token failures", async () => {
  const failureCases: Array<{
    name: string;
    fetcher: (input: string | URL, init?: RequestInit) => Promise<Response>;
    leaked?: string;
  }> = [
    {
      name: "non-2xx",
      fetcher: async () => tokenJsonResponse({ error: "private-provider-payload" }, 400),
      leaked: "private-provider-payload",
    },
    {
      name: "malformed-json",
      fetcher: async () => new Response("not-json", { status: 200 }),
      leaked: "not-json",
    },
    {
      name: "missing-token",
      fetcher: async () => tokenJsonResponse({ token_type: "bearer", scope: "identity" }),
    },
    {
      name: "oversized-token",
      fetcher: async () => tokenJsonResponse({ access_token: "a".repeat(4097), scope: "identity" }),
      leaked: "a".repeat(80),
    },
    {
      name: "unexpected-scope",
      fetcher: async () => tokenJsonResponse({ access_token: "reddit-access-token-fixture", scope: "identity history" }),
      leaked: "reddit-access-token-fixture",
    },
    {
      name: "network",
      fetcher: async () => {
        throw new Error("provider network private payload");
      },
      leaked: "provider network private payload",
    },
  ];

  for (const setup of failureCases) {
    const calls: TokenFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        await withTokenEndpointFetch(calls, setup.fetcher, async () => {
          const started = await startArchiveConnectorOAuthState(app);
          assert.equal(started.status, 201, setup.name);

          const response = await exchangeArchiveConnectorOAuthCallback(app, {
            stateHandle: started.body.stateHandle,
            code: "callback-code.fixture_~+/=",
          });

          assert.equal(response.status, 502, setup.name);
          assert.equal(response.body.code, "archive_connector_token_exchange_failed", setup.name);
          assertExchangeSafety(response.body, false);
          assertNoSensitiveExchangeReadback(response.body, {
            stateHandle: started.body.stateHandle,
            code: "callback-code.fixture_~+/=",
            clientId: "reddit-public-client-id-fixture",
            clientSecret: "reddit-private-app-marker",
            accessToken: "reddit-access-token-fixture",
            providerPayload: setup.leaked,
            rowId: db.rows("archive_connector_oauth_states")[0].id,
          });
          assert.equal(typeof db.rows("archive_connector_oauth_states")[0].consumed_at, "string");
          assert.equal(db.rows("archive_connector_credentials").length, 0);
          assert.equal(calls.length, 1);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth exchange rejects source inventory token responses with missing or extra scopes", async () => {
  const failureCases: Array<{
    name: string;
    provider: "reddit" | "discord";
    scope?: string;
    accessToken: string;
  }> = [
    {
      name: "reddit-missing-mysubreddits",
      provider: "reddit",
      scope: "identity history",
      accessToken: "reddit-missing-scope-token-fixture",
    },
    {
      name: "reddit-read-extra",
      provider: "reddit",
      scope: "identity mysubreddits history read",
      accessToken: "reddit-read-extra-token-fixture",
    },
    {
      name: "reddit-omitted-source-scope",
      provider: "reddit",
      accessToken: "reddit-no-scope-token-fixture",
    },
    {
      name: "discord-missing-guilds",
      provider: "discord",
      scope: "identify",
      accessToken: "discord-missing-scope-token-fixture",
    },
    {
      name: "discord-message-extra",
      provider: "discord",
      scope: "identify guilds messages.read",
      accessToken: "discord-message-extra-token-fixture",
    },
    {
      name: "discord-dm-extra",
      provider: "discord",
      scope: "identify guilds dm_channels.read",
      accessToken: "discord-dm-extra-token-fixture",
    },
    {
      name: "discord-bot-extra",
      provider: "discord",
      scope: "identify guilds bot webhook.incoming",
      accessToken: "discord-bot-extra-token-fixture",
    },
  ];

  for (const setup of failureCases) {
    const calls: TokenFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        await withTokenEndpointFetch(calls, async () => tokenJsonResponse({
          access_token: setup.accessToken,
          refresh_token: "source-refresh-token-fixture",
          token_type: "bearer",
          expires_in: 3600,
          ...(setup.scope == null ? {} : { scope: setup.scope }),
        }), async () => {
          const started = await startArchiveConnectorOAuthState(app, {
            provider: setup.provider,
            scopeProfile: "source_inventory",
          });
          assert.equal(started.status, 201, setup.name);

          const response = await exchangeArchiveConnectorOAuthCallback(app, {
            provider: setup.provider,
            stateHandle: started.body.stateHandle,
            code: "callback-code.fixture_~+/=",
          });

          assert.equal(response.status, 502, setup.name);
          assert.equal(response.body.code, "archive_connector_token_exchange_failed", setup.name);
          assertExchangeSafety(response.body, false);
          assertNoSensitiveExchangeReadback(response.body, {
            stateHandle: started.body.stateHandle,
            code: "callback-code.fixture_~+/=",
            clientId: setup.provider === "reddit" ? "reddit-public-client-id-fixture" : "discord-public-client-id-fixture",
            clientSecret: setup.provider === "reddit" ? "reddit-private-app-marker" : "discord-private-app-marker",
            accessToken: setup.accessToken,
            refreshToken: "source-refresh-token-fixture",
            rowId: db.rows("archive_connector_oauth_states")[0].id,
          });
          assert.equal(typeof db.rows("archive_connector_oauth_states")[0].consumed_at, "string");
          assert.equal(db.rows("archive_connector_credentials").length, 0);
          assert.equal(calls.length, 1);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth exchange discards token material if encrypted credential write fails", async () => {
  const calls: TokenFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.insertErrorTables.add("archive_connector_credentials");
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      await withTokenEndpointFetch(calls, async () => tokenJsonResponse({
        access_token: "reddit-access-token-fixture",
        refresh_token: "reddit-refresh-token-fixture",
        token_type: "bearer",
        scope: "identity",
      }), async () => {
        const started = await startArchiveConnectorOAuthState(app);
        assert.equal(started.status, 201);

        const response = await exchangeArchiveConnectorOAuthCallback(app, {
          stateHandle: started.body.stateHandle,
          code: "callback-code.fixture_~+/=",
        });

        assert.equal(response.status, 500);
        assert.equal(response.body.code, "archive_connector_credential_write_failed");
        assertExchangeSafety(response.body, false);
        assertNoSensitiveExchangeReadback(response.body, {
          stateHandle: started.body.stateHandle,
          code: "callback-code.fixture_~+/=",
          clientId: "reddit-public-client-id-fixture",
          clientSecret: "reddit-private-app-marker",
          accessToken: "reddit-access-token-fixture",
          refreshToken: "reddit-refresh-token-fixture",
          rowId: db.rows("archive_connector_oauth_states")[0].id,
        });
        assert.equal(typeof db.rows("archive_connector_oauth_states")[0].consumed_at, "string");
        assert.equal(db.rows("archive_connector_credentials").length, 0);
        assert.equal(calls.length, 1);
        assert.deepEqual(db.writeCalls, [
          "archive_connector_oauth_states.insert",
          "archive_connector_oauth_states.update",
          "archive_connector_credentials.update",
          "archive_connector_credentials.insert",
        ]);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector OAuth exchange fails closed on owner provider session csrf expiry and consumed-state mismatches", async () => {
  const cases: Array<{
    name: string;
    mutateDb?: (db: ArchiveConnectorReadinessSupabase) => void;
    verifyProvider?: "reddit" | "discord";
    verifyToken?: string;
    stateHandle?: (original: string) => string;
    addToken?: [string, { id: string; email: string; tier?: string; isAdmin?: boolean }];
  }> = [
    {
      name: "owner",
      addToken: ["other-owner-marker", { id: "other-user", email: "other@example.test" }],
      verifyToken: "other-owner-marker",
    },
    {
      name: "session",
      addToken: ["owner-other-session-marker", { id: "owner-user", email: "owner@example.test" }],
      verifyToken: "owner-other-session-marker",
    },
    {
      name: "provider",
      verifyProvider: "discord",
    },
    {
      name: "csrf",
      stateHandle: (original) => `${original.split(".")[0]}.${"c".repeat(43)}`,
    },
    {
      name: "expiry",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].expires_at = "2000-01-01T00:00:00.000Z";
      },
    },
    {
      name: "consumed",
      mutateDb: (db) => {
        db.rows("archive_connector_oauth_states")[0].consumed_at = "2026-06-29T23:00:00.000Z";
      },
    },
  ];

  for (const setup of cases) {
    const calls: TokenFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    if (setup.addToken) db.addUserToken(...setup.addToken);
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        await withTokenEndpointFetch(calls, async () => tokenJsonResponse({ access_token: "should-not-run" }), async () => {
          const started = await startArchiveConnectorOAuthState(app);
          assert.equal(started.status, 201, setup.name);
          setup.mutateDb?.(db);

          const response = await exchangeArchiveConnectorOAuthCallback(app, {
            provider: setup.verifyProvider ?? "reddit",
            token: setup.verifyToken ?? OWNER_AUTH_MARKER,
            stateHandle: setup.stateHandle?.(started.body.stateHandle) ?? started.body.stateHandle,
            code: "callback-code.fixture_~+/=",
          });

          assert.equal(response.status, 409, setup.name);
          assert.equal(response.body.code, "archive_connector_oauth_state_invalid", setup.name);
          assertExchangeSafety(response.body, false);
          assertNoSensitiveExchangeReadback(response.body, {
            stateHandle: started.body.stateHandle,
            code: "callback-code.fixture_~+/=",
            clientId: "reddit-public-client-id-fixture",
            clientSecret: "reddit-private-app-marker",
            rowId: db.rows("archive_connector_oauth_states")[0].id,
          });
          assert.equal(calls.length, 0);
          assert.equal(db.rows("archive_connector_credentials").length, 0);
          assert.deepEqual(db.writeCalls, ["archive_connector_oauth_states.insert"]);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector OAuth state start rejects scope overrides unknown keys and secret-shaped bodies before state writes", async () => {
  const invalidBodies = [
    { scopeProfile: "source_inventory", scope: "identity history" },
    { scopeProfile: "connect", clientId: "client-id-fixture" },
    { scopeProfile: "connect", clientSecret: "client-secret-fixture" },
    { scopeProfile: "source_inventory", code: "oauth-code-fixture" },
    { scopeProfile: "source_inventory", token: "access-token-fixture" },
    { scopeProfile: "source_inventory", providerPayload: { id: "raw-provider-payload" } },
    { scopeProfile: "read_everything" },
    { scopeProfile: null },
    ["source_inventory"],
    "source_inventory",
    7,
    null,
  ];

  for (const body of invalidBodies) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorAuthorizeEnv(), async () => {
        const response = await requestJson(app, "POST", "/archive-connectors/oauth/reddit/start", {
          token: OWNER_AUTH_MARKER,
          body,
        });

        assert.equal(response.status, 400);
        assert.equal(
          ["archive_connector_oauth_start_invalid", "bad_request"].includes(response.body.code),
          true,
        );
        if (response.body.code === "archive_connector_oauth_start_invalid") {
          assertDisabledStartSafety(response.body);
        }
        assertNoSensitiveArchiveConnectorReadback(response.body);
        assert.equal(JSON.stringify(response.body).includes("client-secret-fixture"), false);
        assert.equal(JSON.stringify(response.body).includes("access-token-fixture"), false);
        assert.equal(db.rows("archive_connector_oauth_states").length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector credential readback requires auth and synthesizes missing provider rows", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const unauthenticated = await readArchiveConnectorCredentials(app, { token: null });
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.body.error, "Missing or invalid Authorization header.");
    assert.equal(db.tableCalls.length, 0);

    const response = await readArchiveConnectorCredentials(app);
    assert.equal(response.status, 200);
    assert.equal(response.body.status, "archive_connector_credentials_read");
    assert.equal(response.body.purpose, "archive_connector");
    assert.equal(response.body.ownerOnly, true);
    assert.deepEqual(
      response.body.providers.map((provider: Row) => provider.provider),
      ["reddit", "discord"],
    );
    for (const provider of response.body.providers) {
      assert.equal(provider.purpose, "archive_connector");
      assert.equal(provider.connectionStatus, "missing");
      assert.equal(provider.credential, null);
      assertCredentialReadbackSafety(provider);
    }
    assert.deepEqual(db.writeCalls, []);
    assert.equal(db.tableCalls.includes("archive_connector_credentials"), true);
    assertNoSensitiveCredentialReadback(response.body);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector credential readback is owner scoped and returns active or newest revoked metadata only", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_credentials").push(
    {
      id: "row-id-fixture-other-owner",
      owner_user_id: "other-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "private-source-body-fixture" },
      credential_fingerprint: "other-owner-fingerprint",
      external_account_fingerprint: "external-account-fixture-other",
      account_label: "Other owner label",
      status: "active",
      created_at: "2026-06-29T10:00:00.000Z",
      updated_at: "2026-06-29T10:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
    {
      id: "row-id-fixture-wrong-purpose",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "social_connector",
      encrypted_credential: { ciphertext: "private-source-body-fixture" },
      credential_fingerprint: "wrong-purpose-fingerprint",
      external_account_fingerprint: "external-account-fixture-wrong",
      account_label: "Wrong purpose label",
      status: "active",
      created_at: "2026-06-29T11:00:00.000Z",
      updated_at: "2026-06-29T11:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
    {
      id: "row-id-fixture-unsupported-provider",
      owner_user_id: "owner-user",
      provider: "mastodon",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "private-source-body-fixture" },
      credential_fingerprint: "unsupported-provider-fingerprint",
      external_account_fingerprint: "external-account-fixture-unsupported",
      account_label: "Unsupported provider label",
      status: "active",
      created_at: "2026-06-29T12:00:00.000Z",
      updated_at: "2026-06-29T12:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
    {
      id: "row-id-fixture-reddit-revoked",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "reddit-refresh-token-fixture" },
      credential_fingerprint: "reddit-old-fingerprint",
      external_account_fingerprint: null,
      account_label: "Reddit old safe label",
      status: "revoked",
      created_at: "2026-06-29T13:00:00.000Z",
      updated_at: "2026-06-29T13:05:00.000Z",
      rotated_at: null,
      revoked_at: "2026-06-29T13:05:00.000Z",
    },
    {
      id: "row-id-fixture-reddit-active",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "reddit-access-token-fixture" },
      credential_fingerprint: "reddit-active-fingerprint",
      external_account_fingerprint: "external-account-fixture-reddit",
      account_label: "Reddit connected label",
      status: "active",
      created_at: "2026-06-29T14:00:00.000Z",
      updated_at: "2026-06-29T14:00:00.000Z",
      rotated_at: "2026-06-29T14:00:00.000Z",
      revoked_at: null,
    },
    {
      id: "row-id-fixture-discord-revoked-old",
      owner_user_id: "owner-user",
      provider: "discord",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "discord-refresh-token-fixture" },
      credential_fingerprint: "discord-old-fingerprint",
      external_account_fingerprint: null,
      account_label: "Discord old safe label",
      status: "revoked",
      created_at: "2026-06-29T15:00:00.000Z",
      updated_at: "2026-06-29T15:05:00.000Z",
      rotated_at: null,
      revoked_at: "2026-06-29T15:05:00.000Z",
    },
    {
      id: "row-id-fixture-discord-revoked-new",
      owner_user_id: "owner-user",
      provider: "discord",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "discord-access-token-fixture" },
      credential_fingerprint: "discord-new-fingerprint",
      external_account_fingerprint: null,
      account_label: "Discord paused label",
      status: "revoked",
      created_at: "2026-06-29T16:00:00.000Z",
      updated_at: "2026-06-29T16:05:00.000Z",
      rotated_at: null,
      revoked_at: "2026-06-29T16:05:00.000Z",
    },
  );
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const response = await readArchiveConnectorCredentials(app);
    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.providers.map((provider: Row) => provider.connectionStatus),
      ["connected", "revoked"],
    );

    const [reddit, discord] = response.body.providers;
    const allowedProviderKeys = [
      "provider",
      "purpose",
      "connectionStatus",
      "credential",
      "tokenDecryptEnabled",
      "tokenExchangeEnabled",
      "providerTokenEndpointCallsEnabled",
      "credentialWritesEnabled",
      "credentialRevokeEnabled",
      "providerCallsEnabled",
      "sourceInventoryEnabled",
      "importWritesEnabled",
    ].sort();
    const allowedCredentialKeys = [
      "provider",
      "purpose",
      "status",
      "configured",
      "accountLabel",
      "fingerprintPresent",
      "externalAccountFingerprintPresent",
      "createdAt",
      "updatedAt",
      "rotatedAt",
      "revokedAt",
      "scopeProfile",
      "grantedScopes",
      "connectionScopeState",
      "reconnectRequiredForSourceInventory",
    ].sort();

    assert.deepEqual(Object.keys(reddit).sort(), allowedProviderKeys);
    assert.deepEqual(Object.keys(discord).sort(), allowedProviderKeys);
    assert.deepEqual(Object.keys(reddit.credential).sort(), allowedCredentialKeys);
    assert.deepEqual(Object.keys(discord.credential).sort(), allowedCredentialKeys);

    assert.equal(reddit.provider, "reddit");
    assert.equal(reddit.credential.provider, "reddit");
    assert.equal(reddit.credential.status, "active");
    assert.equal(reddit.credential.configured, true);
    assert.equal(reddit.credential.accountLabel, "Reddit connected label");
    assert.equal(reddit.credential.fingerprintPresent, true);
    assert.equal(reddit.credential.externalAccountFingerprintPresent, true);
    assert.equal(reddit.credential.createdAt, "2026-06-29T14:00:00.000Z");
    assert.equal(reddit.credential.revokedAt, null);
    assert.equal(reddit.credential.scopeProfile, "connect");
    assert.deepEqual(reddit.credential.grantedScopes, ["identity"]);
    assert.equal(reddit.credential.connectionScopeState, "account_proof_only");
    assert.equal(reddit.credential.reconnectRequiredForSourceInventory, true);

    assert.equal(discord.provider, "discord");
    assert.equal(discord.credential.provider, "discord");
    assert.equal(discord.credential.status, "revoked");
    assert.equal(discord.credential.configured, false);
    assert.equal(discord.credential.accountLabel, "Discord paused label");
    assert.equal(discord.credential.fingerprintPresent, true);
    assert.equal(discord.credential.externalAccountFingerprintPresent, false);
    assert.equal(discord.credential.revokedAt, "2026-06-29T16:05:00.000Z");
    assert.equal(discord.credential.scopeProfile, "connect");
    assert.deepEqual(discord.credential.grantedScopes, ["identify"]);
    assert.equal(discord.credential.connectionScopeState, "account_proof_only");
    assert.equal(discord.credential.reconnectRequiredForSourceInventory, true);

    for (const provider of response.body.providers) assertCredentialReadbackSafety(provider);
    assertNoSensitiveCredentialReadback(response.body);
    assert.deepEqual(db.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector credential readback returns bounded storage failures", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.selectErrorTables.add("archive_connector_credentials");
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const response = await readArchiveConnectorCredentials(app);
    assert.equal(response.status, 500);
    assert.equal(response.body.code, "archive_connector_credential_read_failed");
    assert.equal(response.body.status, "credential_read_failed");
    assert.equal(response.body.purpose, "archive_connector");
    assert.equal(response.body.ownerOnly, true);
    assertCredentialReadbackSafety(response.body);
    assertNoSensitiveCredentialReadback(response.body);
    assert.deepEqual(db.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector account lookup updates safe metadata for Reddit and Discord connect credentials", async () => {
  const calls: AccountLookupFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(
        encryptedArchiveConnectorCredentialRow({ provider: "reddit" }),
        encryptedArchiveConnectorCredentialRow({ provider: "discord" }),
      );

      await withAccountLookupFetch(calls, async (input, init) => {
        if (String(input).includes("reddit")) {
          return accountLookupJsonResponse({
            id: "reddit-raw-account-id-fixture",
            name: "Owner Reddit",
            email: "must-not-be-read@example.test",
            providerPayload: "provider-profile-payload",
          });
        }

        return accountLookupJsonResponse({
          id: "discord-raw-account-id-fixture",
          global_name: "Owner Discord",
          username: "Discord Username",
          avatar: "avatar-fixture",
          discriminator: "1234",
          locale: "en-US",
          providerPayload: "provider-profile-payload",
        });
      }, async () => {
        const reddit = await lookupArchiveConnectorCredentialAccountRoute(app, { provider: "reddit", body: {} });
        const discord = await lookupArchiveConnectorCredentialAccountRoute(app, { provider: "discord" });

        assert.equal(reddit.status, 200);
        assert.equal(discord.status, 200);
        assert.equal(reddit.body.status, "archive_connector_account_lookup_complete");
        assert.equal(discord.body.status, "archive_connector_account_lookup_complete");
        assert.equal(reddit.body.accountProofComplete, true);
        assert.equal(discord.body.accountProofComplete, true);
        assert.equal(reddit.body.accountMetadataUpdated, true);
        assert.equal(discord.body.accountMetadataUpdated, true);
        assert.equal(reddit.body.credential.provider, "reddit");
        assert.equal(discord.body.credential.provider, "discord");
        assert.equal(reddit.body.credential.accountLabel, "Owner Reddit");
        assert.equal(discord.body.credential.accountLabel, "Owner Discord");
        assert.equal(reddit.body.credential.externalAccountFingerprintPresent, true);
        assert.equal(discord.body.credential.externalAccountFingerprintPresent, true);
        assert.equal(reddit.body.credential.connectionScopeState, "account_proof_only");
        assert.equal(discord.body.credential.connectionScopeState, "account_proof_only");
        assertAccountLookupSafety(reddit.body, true);
        assertAccountLookupSafety(discord.body, true);
        assertNoSensitiveAccountLookupReadback(reddit.body);
        assertNoSensitiveAccountLookupReadback(discord.body);

        assert.equal(calls.length, 2);
        assert.equal(calls[0].url, "https://oauth.reddit.com/api/v1/me?raw_json=1");
        assert.equal(calls[0].method, "GET");
        assert.equal(calls[0].headers.get("Accept"), "application/json");
        assert.equal(calls[0].headers.get("Authorization"), "Bearer reddit-connect-account-proof-token");
        assert.match(calls[0].headers.get("User-Agent") ?? "", /StationArchiveConnector/);
        assert.equal(calls[0].signalPresent, true);
        assert.equal(calls[1].url, "https://discord.com/api/v10/users/@me");
        assert.equal(calls[1].method, "GET");
        assert.equal(calls[1].headers.get("Accept"), "application/json");
        assert.equal(calls[1].headers.get("Authorization"), "Bearer discord-connect-account-proof-token");
        assert.equal(calls[1].signalPresent, true);

        const redditRow = db.rows("archive_connector_credentials").find((row) => row.provider === "reddit");
        const discordRow = db.rows("archive_connector_credentials").find((row) => row.provider === "discord");
        assert.equal(
          redditRow?.external_account_fingerprint,
          fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
        );
        assert.equal(
          discordRow?.external_account_fingerprint,
          fingerprintArchiveConnectorExternalAccount("discord", "discord-raw-account-id-fixture"),
        );
        assert.equal(JSON.stringify(db.rows("archive_connector_credentials")).includes("reddit-raw-account-id-fixture"), false);
        assert.equal(JSON.stringify(db.rows("archive_connector_credentials")).includes("discord-raw-account-id-fixture"), false);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector account lookup accepts source inventory credentials without enabling source reads", async () => {
  const calls: AccountLookupFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(
        encryptedArchiveConnectorCredentialRow({
          provider: "reddit",
          scopeProfile: "source_inventory",
        }),
      );

      await withAccountLookupFetch(calls, async () => accountLookupJsonResponse({
        id: "reddit-raw-account-id-fixture",
        name: "token secret payload account id",
      }), async () => {
        const response = await lookupArchiveConnectorCredentialAccountRoute(app, { provider: "reddit" });

        assert.equal(response.status, 200);
        assert.equal(response.body.status, "archive_connector_account_lookup_complete");
        assert.equal(response.body.credential.scopeProfile, "source_inventory");
        assert.deepEqual(response.body.credential.grantedScopes, ["identity", "mysubreddits", "history"]);
        assert.equal(response.body.credential.connectionScopeState, "source_scope_ready");
        assert.equal(response.body.credential.reconnectRequiredForSourceInventory, false);
        assert.equal(response.body.credential.accountLabel, null);
        assert.equal(response.body.credential.externalAccountFingerprintPresent, true);
        assertAccountLookupSafety(response.body, true);
        assertNoSensitiveAccountLookupReadback(response.body);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "https://oauth.reddit.com/api/v1/me?raw_json=1");
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector account lookup requires auth supported provider and empty body before provider fetch", async () => {
  const calls: AccountLookupFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      await withAccountLookupFetch(calls, async () => {
        throw new Error("account lookup fetch should not run for invalid requests");
      }, async () => {
        const unauthenticated = await lookupArchiveConnectorCredentialAccountRoute(app, { token: null });
        assert.equal(unauthenticated.status, 401);
        assert.equal(unauthenticated.body.error, "Missing or invalid Authorization header.");
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);

        const unsupported = await lookupArchiveConnectorCredentialAccountRoute(app, { provider: "mastodon" });
        assert.equal(unsupported.status, 400);
        assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);

        const invalidBodies = [
          { body: { rowId: "row-id-fixture", rawExternalAccountId: "raw-external-account", accountLabel: "secret-shaped-value" }, routeHandled: true },
          { body: { scope: "identity", endpointUrl: "https://oauth.reddit.com/api/v1/me" }, routeHandled: true },
          { body: ["secret-shaped-value"], routeHandled: true },
          { body: "secret-shaped-value", routeHandled: false },
          { body: 7, routeHandled: false },
        ];

        for (const setup of invalidBodies) {
          const response = await lookupArchiveConnectorCredentialAccountRoute(app, setup);
          assert.equal(response.status, 400);
          assert.equal(
            response.body.code,
            setup.routeHandled ? "archive_connector_account_lookup_invalid" : "bad_request",
          );
          if (setup.routeHandled) assertAccountLookupSafety(response.body, false);
          assertNoSensitiveAccountLookupReadback(response.body);
        }

        assert.equal(calls.length, 0);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector account lookup maps credential provider and metadata failures to bounded responses", async () => {
  const cases: Array<{
    name: string;
    row?: () => Row;
    fetcher?: () => Promise<Response>;
    updateError?: boolean;
    expectedStatus: number;
    expectedCode: string;
    expectedProviderCalls: number;
  }> = [
    {
      name: "missing-credential",
      expectedStatus: 409,
      expectedCode: "archive_connector_account_credential_required",
      expectedProviderCalls: 0,
    },
    {
      name: "invalid-token-material",
      row: () => encryptedArchiveConnectorCredentialRow({
        tokenMaterial: accountTokenMaterial("reddit", "connect", { accessToken: "bad\u0001token" }),
      }),
      expectedStatus: 409,
      expectedCode: "archive_connector_account_credential_invalid",
      expectedProviderCalls: 0,
    },
    {
      name: "provider-reconnect",
      row: () => encryptedArchiveConnectorCredentialRow(),
      fetcher: async () => accountLookupJsonResponse({}, 401),
      expectedStatus: 409,
      expectedCode: "archive_connector_account_lookup_reconnect_required",
      expectedProviderCalls: 1,
    },
    {
      name: "provider-rate-limited",
      row: () => encryptedArchiveConnectorCredentialRow(),
      fetcher: async () => accountLookupJsonResponse({ error: "rate-limit-fixture" }, 429),
      expectedStatus: 429,
      expectedCode: "archive_connector_account_lookup_rate_limited",
      expectedProviderCalls: 1,
    },
    {
      name: "provider-5xx",
      row: () => encryptedArchiveConnectorCredentialRow(),
      fetcher: async () => accountLookupJsonResponse({ request_id: "request-id-fixture" }, 503),
      expectedStatus: 502,
      expectedCode: "archive_connector_account_lookup_failed",
      expectedProviderCalls: 1,
    },
    {
      name: "provider-invalid-json",
      row: () => encryptedArchiveConnectorCredentialRow(),
      fetcher: async () => new Response("{not-json", { status: 200 }),
      expectedStatus: 502,
      expectedCode: "archive_connector_account_lookup_response_invalid",
      expectedProviderCalls: 1,
    },
    {
      name: "provider-missing-id",
      row: () => encryptedArchiveConnectorCredentialRow(),
      fetcher: async () => accountLookupJsonResponse({ name: "Owner Reddit" }),
      expectedStatus: 502,
      expectedCode: "archive_connector_account_lookup_response_invalid",
      expectedProviderCalls: 1,
    },
    {
      name: "metadata-mismatch",
      row: () => encryptedArchiveConnectorCredentialRow({
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "different-raw-account-id-fixture"),
      }),
      fetcher: async () => accountLookupJsonResponse({ id: "reddit-raw-account-id-fixture", name: "Owner Reddit" }),
      expectedStatus: 409,
      expectedCode: "archive_connector_account_mismatch",
      expectedProviderCalls: 1,
    },
    {
      name: "metadata-update-failure",
      row: () => encryptedArchiveConnectorCredentialRow(),
      fetcher: async () => accountLookupJsonResponse({ id: "reddit-raw-account-id-fixture", name: "Owner Reddit" }),
      updateError: true,
      expectedStatus: 500,
      expectedCode: "archive_connector_account_metadata_update_failed",
      expectedProviderCalls: 1,
    },
  ];

  for (const setup of cases) {
    const calls: AccountLookupFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    if (setup.updateError) db.updateErrorTables.add("archive_connector_credentials");
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        if (setup.row) db.rows("archive_connector_credentials").push(setup.row());

        await withAccountLookupFetch(calls, async () => {
          if (!setup.fetcher) throw new Error(`${setup.name} should not fetch provider account.`);
          return setup.fetcher();
        }, async () => {
          const response = await lookupArchiveConnectorCredentialAccountRoute(app, { provider: "reddit" });

          assert.equal(response.status, setup.expectedStatus, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.accountProofComplete, false, setup.name);
          assert.equal(response.body.accountMetadataUpdated, false, setup.name);
          assertAccountLookupSafety(response.body, false);
          assertNoSensitiveAccountLookupReadback(response.body);
          assert.equal(calls.length, setup.expectedProviderCalls, setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source inventory requires auth source-ready credential and account proof before provider fetch", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      await withSourceInventoryFetch(calls, async () => {
        throw new Error("source inventory fetch should not run before prerequisites");
      }, async () => {
        const unauthenticated = await readArchiveConnectorSourceInventoryRoute(app, { token: null });
        assert.equal(unauthenticated.status, 401);
        assert.equal(unauthenticated.body.error, "Missing or invalid Authorization header.");
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);

        const unsupported = await readArchiveConnectorSourceInventoryRoute(app, { provider: "mastodon" });
        assert.equal(unsupported.status, 400);
        assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);

        db.rows("archive_connector_credentials").push(encryptedArchiveConnectorCredentialRow({
          provider: "reddit",
          externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
        }));
        const connectOnly = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });
        assert.equal(connectOnly.status, 409);
        assert.equal(connectOnly.body.code, "archive_connector_source_inventory_credential_required");
        assertSourceInventorySafety(connectOnly.body, false);
        assertNoSensitiveSourceInventoryReadback(connectOnly.body);

        db.rows("archive_connector_credentials").length = 0;
        db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
          provider: "reddit",
          externalAccountFingerprint: null,
        }));
        const missingAccountProof = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });
        assert.equal(missingAccountProof.status, 409);
        assert.equal(missingAccountProof.body.code, "archive_connector_source_inventory_account_lookup_required");
        assertSourceInventorySafety(missingAccountProof.body, false);
        assertNoSensitiveSourceInventoryReadback(missingAccountProof.body);

        assert.equal(calls.length, 0);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector Reddit source inventory returns safe subreddit rows and Station history categories", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        accountLabel: "Owner Reddit",
      }));

      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse({
        data: {
          after: "after-cursor-fixture",
          children: [
            {
              kind: "t5",
              data: {
                id: "subreddit-raw-id-fixture",
                name: "t5_raw_fullname_fixture",
                display_name_prefixed: "r/StationLab",
                display_name: "StationLab",
                subscriber_count: 123456,
                url: "https://reddit.example/r/StationLab",
                public_description: "private-source-body-fixture",
                providerPayload: "provider-source-payload",
              },
            },
          ],
        },
      }), async () => {
        const response = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });

        assert.equal(response.status, 200);
        assert.equal(response.body.status, "archive_connector_source_inventory_read");
        assert.equal(response.body.provider, "reddit");
        assert.equal(response.body.purpose, "archive_connector");
        assert.equal(response.body.ownerOnly, true);
        assert.equal(response.body.accountLabel, "Owner Reddit");
        assert.equal(response.body.externalAccountFingerprintPresent, true);
        assert.equal(response.body.truncated, true);
        assertSourceInventorySafety(response.body, true);
        assertNoSensitiveSourceInventoryReadback(response.body);

        assert.equal(response.body.sources.length, 7);
        const subreddit = response.body.sources.find((source: Row) => source.sourceFamily === "reddit_subreddit_memberships");
        assert.equal(subreddit.label, "r/StationLab");
        assert.equal(subreddit.sourceKind, "subreddit");
        assert.equal(subreddit.availability, "available");
        assert.equal(subreddit.truncated, true);
        const historyLabels = response.body.sources
          .filter((source: Row) => source.sourceFamily === "reddit_user_history")
          .map((source: Row) => source.label)
          .sort();
        assert.deepEqual(historyLabels, [
          "Comments",
          "Downvoted items",
          "Hidden items",
          "Saved items",
          "Submitted posts",
          "Upvoted items",
        ].sort());
        for (const row of response.body.sources) assertSourceInventoryRowSafety(row);

        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1");
        assert.equal(calls[0].method, "GET");
        assert.equal(calls[0].headers.get("Accept"), "application/json");
        assert.equal(calls[0].headers.get("Authorization"), "Bearer reddit-source_inventory-account-proof-token");
        assert.match(calls[0].headers.get("User-Agent") ?? "", /StationArchiveConnector/);
        assert.equal(calls[0].signalPresent, true);
        assert.equal(JSON.stringify(calls).includes("saved"), false);
        assert.equal(JSON.stringify(calls).includes("upvoted"), false);
        assert.equal(JSON.stringify(calls).includes("comments"), false);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector Discord source inventory returns safe guild rows only", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "discord",
        accountLabel: "Owner Discord",
      }));

      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse([
        {
          id: "guild-raw-id-fixture",
          name: "Station Guild",
          icon: "icon-fixture",
          owner: true,
          permissions: "8",
          approximate_member_count: 42,
          approximate_presence_count: 7,
          url: "https://discord.example/guild",
          providerPayload: "provider-source-payload",
        },
      ]), async () => {
        const response = await readArchiveConnectorSourceInventoryRoute(app, { provider: "discord" });

        assert.equal(response.status, 200);
        assert.equal(response.body.status, "archive_connector_source_inventory_read");
        assert.equal(response.body.provider, "discord");
        assert.equal(response.body.accountLabel, "Owner Discord");
        assert.equal(response.body.truncated, false);
        assertSourceInventorySafety(response.body, true);
        assertNoSensitiveSourceInventoryReadback(response.body);

        assert.equal(response.body.sources.length, 1);
        assert.equal(response.body.sources[0].sourceFamily, "discord_guilds");
        assert.equal(response.body.sources[0].sourceKind, "guild");
        assert.equal(response.body.sources[0].label, "Station Guild");
        assert.equal(response.body.sources[0].availability, "available");
        assert.equal(response.body.sources[0].truncated, false);
        assertSourceInventoryRowSafety(response.body.sources[0]);

        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false");
        assert.equal(calls[0].method, "GET");
        assert.equal(calls[0].headers.get("Accept"), "application/json");
        assert.equal(calls[0].headers.get("Authorization"), "Bearer discord-source_inventory-account-proof-token");
        assert.equal(calls[0].signalPresent, true);
        assert.equal(JSON.stringify(calls).includes("channels"), false);
        assert.equal(JSON.stringify(calls).includes("messages"), false);
        assert.equal(JSON.stringify(calls).includes("members"), false);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector source inventory maps provider failures to bounded responses", async () => {
  const cases: Array<{
    name: string;
    fetcher: () => Promise<Response>;
    expectedStatus: number;
    expectedCode: string;
  }> = [
    {
      name: "provider-reconnect",
      fetcher: async () => sourceInventoryJsonResponse({}, 401),
      expectedStatus: 409,
      expectedCode: "archive_connector_source_inventory_reconnect_required",
    },
    {
      name: "provider-rate-limited",
      fetcher: async () => sourceInventoryJsonResponse({ error: "rate-limit-fixture" }, 429),
      expectedStatus: 429,
      expectedCode: "archive_connector_source_inventory_rate_limited",
    },
    {
      name: "provider-5xx",
      fetcher: async () => sourceInventoryJsonResponse({ request_id: "request-id-fixture" }, 503),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_inventory_provider_failed",
    },
    {
      name: "network-error",
      fetcher: async () => {
        throw new Error("network should be bounded");
      },
      expectedStatus: 502,
      expectedCode: "archive_connector_source_inventory_provider_failed",
    },
    {
      name: "invalid-json",
      fetcher: async () => new Response("{not-json", { status: 200 }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_inventory_provider_response_invalid",
    },
    {
      name: "missing-children",
      fetcher: async () => sourceInventoryJsonResponse({ data: {} }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_inventory_provider_response_invalid",
    },
    {
      name: "unsafe-label",
      fetcher: async () => sourceInventoryJsonResponse({
        data: {
          children: [
            { data: { id: "subreddit-raw-id-fixture", display_name: "token secret payload" } },
          ],
        },
      }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_inventory_provider_response_invalid",
    },
  ];

  for (const setup of cases) {
    const calls: SourceInventoryFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
          provider: "reddit",
        }));

        await withSourceInventoryFetch(calls, setup.fetcher, async () => {
          const response = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });

          assert.equal(response.status, setup.expectedStatus, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.sources.length, 0, setup.name);
          assert.equal(response.body.truncated, false, setup.name);
          assertSourceInventorySafety(response.body, false);
          assertNoSensitiveSourceInventoryReadback(response.body);
          assert.equal(calls.length, 1, setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector import intent requires auth supported provider and strict safe body before work", async () => {
  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await createArchiveConnectorImportIntentRoute(signedOutApp, { token: null });
    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.equal(signedOutDb.tableCalls.length, 0);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const unsupportedDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(unsupportedDb.client as any);
  const unsupportedApp = await createArchiveConnectorApp();

  try {
    const unsupported = await createArchiveConnectorImportIntentRoute(unsupportedApp, {
      provider: "mastodon",
    });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
    assert.deepEqual(unsupportedDb.writeCalls, []);
    assert.equal(unsupportedDb.tableCalls.includes("archive_connector_credentials"), false);
    assert.equal(unsupportedDb.tableCalls.includes("archive_connector_import_intents"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const invalidBodies: Array<{ body: unknown; routeHandled: boolean }> = [
    { body: undefined, routeHandled: true },
    { body: {}, routeHandled: true },
    { body: [], routeHandled: true },
    { body: "secret-shaped-value", routeHandled: false },
    { body: validArchiveConnectorImportIntentBody({ sourceKey: "A".repeat(24) }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ personaId: "not-a-uuid" }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ sourceFamily: "reddit_saved_items" }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ sourceKind: "subreddit/read" }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ sourceLabel: "token secret payload" }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ rawProviderId: "subreddit-raw-id-fixture" }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ sourceBody: "private-source-body-fixture" }), routeHandled: true },
    { body: validArchiveConnectorImportIntentBody({ accessToken: "reddit-source_inventory-account-proof-token" }), routeHandled: true },
  ];

  for (const setup of invalidBodies) {
    const calls: SourceInventoryFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withSourceInventoryFetch(calls, async () => {
        throw new Error("source inventory fetch should not run for invalid import intent bodies");
      }, async () => {
        const response = await createArchiveConnectorImportIntentRoute(app, {
          body: setup.body,
        });

        assert.equal(response.status, 400);
        assert.equal(
          response.body.code,
          setup.routeHandled ? "archive_connector_import_intent_invalid" : "bad_request",
        );
        if (setup.routeHandled) {
          assert.equal(response.body.importIntentCreated, false);
          assert.equal(response.body.intent, null);
          assertImportIntentSafety(response.body, false);
        }
        assertNoSensitiveImportIntentReadback(response.body);
        assert.equal(db.tableCalls.includes("personas"), false);
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);
        assert.equal(db.tableCalls.includes("archive_connector_import_intents"), false);
        assert.deepEqual(db.writeCalls, []);
        assert.equal(calls.length, 0);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector import intent checks owner persona before credential decrypt provider fetch or writes", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      await withSourceInventoryFetch(calls, async () => {
        throw new Error("source inventory fetch should not run before persona ownership");
      }, async () => {
        const response = await createArchiveConnectorImportIntentRoute(app, {
          body: validArchiveConnectorImportIntentBody({ personaId: OTHER_PERSONA_ID }),
        });

        assert.equal(response.status, 404);
        assert.equal(response.body.code, "archive_connector_import_intent_persona_not_found");
        assert.equal(response.body.importIntentCreated, false);
        assert.equal(response.body.intent, null);
        assertImportIntentSafety(response.body, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.equal(db.tableCalls.includes("personas"), true);
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);
        assert.equal(db.tableCalls.includes("archive_connector_import_intents"), false);
        assert.deepEqual(db.writeCalls, []);
        assert.equal(calls.length, 0);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent requires source-ready credential and account proof before source inventory", async () => {
  const cases: Array<{
    name: string;
    row: () => Row;
    expectedCode: string;
  }> = [
    {
      name: "connect-proof-only",
      row: () => encryptedArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      }),
      expectedCode: "archive_connector_import_intent_credential_required",
    },
    {
      name: "missing-account-proof",
      row: () => sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: null,
      }),
      expectedCode: "archive_connector_import_intent_account_lookup_required",
    },
  ];

  for (const setup of cases) {
    const calls: SourceInventoryFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_credentials").push(setup.row);
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        db.rows("archive_connector_credentials").push(setup.row());
        await withSourceInventoryFetch(calls, async () => {
          throw new Error("source inventory fetch should not run before credential prerequisites");
        }, async () => {
          const response = await createArchiveConnectorImportIntentRoute(app);

          assert.equal(response.status, 409, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.importIntentCreated, false, setup.name);
          assert.equal(response.body.intent, null, setup.name);
          assertImportIntentSafety(response.body, false);
          assertNoSensitiveImportIntentReadback(response.body);
          assert.equal(db.rows("archive_connector_import_intents").length, 0);
          assert.equal(calls.length, 0, setup.name);
          assert.deepEqual(db.writeCalls, [], setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector Reddit import intent revalidates safe source metadata and writes only pending intent receipt", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        accountLabel: "Owner Reddit",
      }));
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });
        assert.equal(inventory.status, 200);
        const source = inventory.body.sources.find((row: Row) => row.sourceFamily === "reddit_subreddit_memberships");
        assert.equal(source.label, "r/StationLab");

        const response = await createArchiveConnectorImportIntentRoute(app, {
          provider: "reddit",
          body: validArchiveConnectorImportIntentBody({
            personaId: OWNER_PERSONA_ID,
            sourceKey: source.sourceKey,
            sourceFamily: source.sourceFamily,
            sourceKind: source.sourceKind,
            sourceLabel: source.label,
          }),
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.status, "archive_connector_import_intent_created");
        assert.equal(response.body.provider, "reddit");
        assert.equal(response.body.purpose, "archive_connector");
        assert.equal(response.body.ownerOnly, true);
        assert.equal(response.body.importIntentCreated, true);
        assert.equal(response.body.idempotent, true);
        assert.equal(response.body.duplicate, false);
        assertImportIntentSafety(response.body, true, true);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.deepEqual(response.body.intent, {
          id: "33333333-3333-4333-8333-000000000001",
          provider: "reddit",
          purpose: "archive_connector",
          personaId: OWNER_PERSONA_ID,
          sourceFamily: "reddit_subreddit_memberships",
          sourceKind: "subreddit",
          sourceKey: source.sourceKey,
          sourceLabel: "r/StationLab",
          status: "pending",
          activatedAt: null,
          createdAt: "2026-06-29T22:50:00.000Z",
          updatedAt: "2026-06-29T22:50:00.000Z",
        });

        assert.equal(calls.length, 2);
        assert.equal(calls[0].url, "https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1");
        assert.equal(calls[1].url, "https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1");
        assert.equal(JSON.stringify(calls).includes("saved"), false);
        assert.equal(JSON.stringify(calls).includes("comments"), false);
        assert.deepEqual(db.writeCalls, ["archive_connector_import_intents.insert"]);
        assert.equal(db.rows("archive_connector_import_intents").length, 1);

        const row = db.rows("archive_connector_import_intents")[0];
        assert.equal(row.owner_user_id, "owner-user");
        assert.equal(row.persona_id, OWNER_PERSONA_ID);
        assert.equal(row.provider, "reddit");
        assert.equal(row.purpose, "archive_connector");
        assert.equal(row.source_family, "reddit_subreddit_memberships");
        assert.equal(row.source_kind, "subreddit");
        assert.equal(row.source_key, source.sourceKey);
        assert.equal(row.source_label, "r/StationLab");
        assert.equal(row.status, "pending");
        assert.equal(typeof row.idempotency_fingerprint, "string");
        assert.equal(row.idempotency_fingerprint.length, 64);
        const stored = JSON.stringify(row);
        for (const forbidden of [
          "subreddit-raw-id-fixture",
          "t5_raw_fullname_fixture",
          "after-cursor-fixture",
          "private-source-body-fixture",
          "provider-source-payload",
          "reddit-source_inventory-account-proof-token",
          "reddit-source_inventory-refresh-token-fixture",
        ]) {
          assert.equal(stored.includes(forbidden), false, `${forbidden} leaked into import intent row`);
        }
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent returns existing pending receipt on duplicate confirmation", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });
        const history = inventory.body.sources.find((row: Row) =>
          row.sourceFamily === "reddit_user_history" && row.sourceKind === "saved_items"
        );
        const body = validArchiveConnectorImportIntentBody({
          sourceKey: history.sourceKey,
          sourceFamily: history.sourceFamily,
          sourceKind: history.sourceKind,
          sourceLabel: history.label,
        });

        const created = await createArchiveConnectorImportIntentRoute(app, { body });
        const duplicate = await createArchiveConnectorImportIntentRoute(app, { body });

        assert.equal(created.status, 201);
        assert.equal(duplicate.status, 200);
        assert.equal(duplicate.body.status, "archive_connector_import_intent_exists");
        assert.equal(duplicate.body.importIntentCreated, false);
        assert.equal(duplicate.body.idempotent, true);
        assert.equal(duplicate.body.duplicate, true);
        assert.deepEqual(duplicate.body.intent, created.body.intent);
        assertImportIntentSafety(duplicate.body, true, false);
        assertNoSensitiveImportIntentReadback(duplicate.body);
        assert.equal(db.rows("archive_connector_import_intents").length, 1);
        assert.deepEqual(db.writeCalls, ["archive_connector_import_intents.insert"]);
        assert.equal(calls.length, 3);
        assert.equal(JSON.stringify(calls).includes("saved"), false);
        assert.equal(JSON.stringify(calls).includes("upvoted"), false);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector Discord import intent confirms only safe guild source metadata", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "discord",
        accountLabel: "Owner Discord",
      }));
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(discordSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(app, { provider: "discord" });
        assert.equal(inventory.status, 200);
        const source = inventory.body.sources[0];

        const response = await createArchiveConnectorImportIntentRoute(app, {
          provider: "discord",
          body: validArchiveConnectorImportIntentBody({
            personaId: OWNER_PERSONA_ID,
            sourceKey: source.sourceKey,
            sourceFamily: source.sourceFamily,
            sourceKind: source.sourceKind,
            sourceLabel: source.label,
          }),
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.status, "archive_connector_import_intent_created");
        assert.equal(response.body.provider, "discord");
        assert.equal(response.body.intent.provider, "discord");
        assert.equal(response.body.intent.sourceFamily, "discord_guilds");
        assert.equal(response.body.intent.sourceKind, "guild");
        assert.equal(response.body.intent.sourceLabel, "Station Guild");
        assertImportIntentSafety(response.body, true, true);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.equal(calls.length, 2);
        assert.equal(calls[0].url, "https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false");
        assert.equal(calls[1].url, "https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false");
        assert.equal(JSON.stringify(calls).includes("channels"), false);
        assert.equal(JSON.stringify(calls).includes("messages"), false);
        assert.deepEqual(db.writeCalls, ["archive_connector_import_intents.insert"]);
        assert.equal(db.rows("archive_connector_import_intents")[0].source_key, source.sourceKey);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent rejects stale or tampered source echoes without writes", async () => {
  for (const setup of ["source-key", "source-family", "source-kind", "source-label"]) {
    const calls: SourceInventoryFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
        await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
          const inventory = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });
          const source = inventory.body.sources.find((row: Row) => row.sourceFamily === "reddit_subreddit_memberships");
          const body = validArchiveConnectorImportIntentBody({
            sourceKey: setup === "source-key" ? "b".repeat(24) : source.sourceKey,
            sourceFamily: setup === "source-family" ? "reddit_user_history" : source.sourceFamily,
            sourceKind: setup === "source-kind" ? "comments" : source.sourceKind,
            sourceLabel: setup === "source-label" ? "r/OtherLab" : source.label,
          });

          const response = await createArchiveConnectorImportIntentRoute(app, { body });

          assert.equal(response.status, 409, setup);
          assert.equal(response.body.code, "archive_connector_import_intent_source_unavailable", setup);
          assert.equal(response.body.importIntentCreated, false, setup);
          assert.equal(response.body.intent, null, setup);
          assertImportIntentSafety(response.body, false);
          assertNoSensitiveImportIntentReadback(response.body);
          assert.equal(db.rows("archive_connector_import_intents").length, 0, setup);
          assert.deepEqual(db.writeCalls, [], setup);
          assert.equal(calls.length, 2, setup);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector import intent maps provider and storage failures to bounded no-write responses", async () => {
  const providerFailureDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(providerFailureDb.client as any);
  const providerFailureApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      providerFailureDb.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      const calls: SourceInventoryFetchCall[] = [];
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse({ request_id: "request-id-fixture" }, 429), async () => {
        const response = await createArchiveConnectorImportIntentRoute(providerFailureApp);

        assert.equal(response.status, 429);
        assert.equal(response.body.code, "archive_connector_source_inventory_rate_limited");
        assert.equal(response.body.importIntentCreated, false);
        assert.equal(response.body.intent, null);
        assertImportIntentSafety(response.body, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.deepEqual(providerFailureDb.writeCalls, []);
        assert.equal(providerFailureDb.rows("archive_connector_import_intents").length, 0);
        assert.equal(calls.length, 1);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const writeFailureDb = new ArchiveConnectorReadinessSupabase();
  writeFailureDb.insertErrorTables.add("archive_connector_import_intents");
  setSupabaseAdminForTests(writeFailureDb.client as any);
  const writeFailureApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      writeFailureDb.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      const calls: SourceInventoryFetchCall[] = [];
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(writeFailureApp, { provider: "reddit" });
        const source = inventory.body.sources.find((row: Row) => row.sourceFamily === "reddit_subreddit_memberships");
        const response = await createArchiveConnectorImportIntentRoute(writeFailureApp, {
          body: validArchiveConnectorImportIntentBody({
            sourceKey: source.sourceKey,
            sourceFamily: source.sourceFamily,
            sourceKind: source.sourceKind,
            sourceLabel: source.label,
          }),
        });

        assert.equal(response.status, 500);
        assert.equal(response.body.code, "archive_connector_import_intent_write_failed");
        assert.equal(response.body.importIntentCreated, false);
        assert.equal(response.body.intent, null);
        assertImportIntentSafety(response.body, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.deepEqual(writeFailureDb.writeCalls, ["archive_connector_import_intents.insert"]);
        assert.equal(writeFailureDb.rows("archive_connector_import_intents").length, 0);
        assert.equal(calls.length, 2);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent activation requires auth UUID path and strict empty body before storage work", async () => {
  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await activateArchiveConnectorImportIntentRoute(signedOutApp, { token: null });
    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.equal(signedOutDb.tableCalls.length, 0);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const invalidCases: Array<{ name: string; intentId?: string; body?: unknown; routeHandled: boolean }> = [
    { name: "id", intentId: "not-a-uuid", body: {}, routeHandled: true },
    { name: "array", body: [], routeHandled: true },
    { name: "unknown-key", body: { activate: true }, routeHandled: true },
    { name: "secret-shaped", body: { accessToken: "reddit-source_inventory-account-proof-token" }, routeHandled: true },
    { name: "primitive", body: "secret-shaped-value", routeHandled: false },
  ];

  for (const setup of invalidCases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      const response = await activateArchiveConnectorImportIntentRoute(app, {
        intentId: setup.intentId,
        body: setup.body,
      });

      assert.equal(response.status, 400, setup.name);
      assert.equal(
        response.body.code,
        setup.routeHandled ? "archive_connector_import_intent_activation_invalid" : "bad_request",
        setup.name,
      );
      if (setup.routeHandled) assertImportIntentActivationSafety(response.body, false, false);
      assertNoSensitiveImportIntentReadback(response.body);
      assert.equal(db.tableCalls.includes("archive_connector_import_intents"), false, setup.name);
      assert.equal(db.tableCalls.includes("archive_connector_credentials"), false, setup.name);
      assert.deepEqual(db.writeCalls, [], setup.name);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector import intent activation fails missing wrong-owner and cancelled intents before credential provider or writes", async () => {
  const cases: Array<{
    name: string;
    rows?: Row[];
    expectedStatus: number;
    expectedCode: string;
  }> = [
    {
      name: "missing",
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "wrong-owner",
      rows: [archiveConnectorImportIntentRow({ owner_user_id: "other-user" })],
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "wrong-purpose",
      rows: [archiveConnectorImportIntentRow({ purpose: "other_purpose" })],
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "cancelled",
      rows: [archiveConnectorImportIntentRow({ status: "cancelled" })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_not_activatable",
    },
  ];

  for (const setup of cases) {
    const calls: SourceInventoryFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(...(setup.rows ?? []));
    db.rows("archive_connector_credentials").push({ should_not_decrypt: true });
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withSourceInventoryFetch(calls, async () => {
        throw new Error("source inventory fetch should not run for unavailable activation intents");
      }, async () => {
        const response = await activateArchiveConnectorImportIntentRoute(app, { body: {} });

        assert.equal(response.status, setup.expectedStatus, setup.name);
        assert.equal(response.body.code, setup.expectedCode, setup.name);
        assert.equal(response.body.intent, null, setup.name);
        assert.equal(response.body.activated, false, setup.name);
        assertImportIntentActivationSafety(response.body, false, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.equal(calls.length, 0, setup.name);
        assert.deepEqual(db.writeCalls, [], setup.name);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector import intent activation returns already activated receipts without provider fetch or writes", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow({
    status: "activated",
    activated_at: "2026-06-29T23:00:00.000Z",
    updated_at: "2026-06-29T23:00:00.000Z",
  }));
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withSourceInventoryFetch(calls, async () => {
      throw new Error("source inventory fetch should not run for already activated intents");
    }, async () => {
      const response = await activateArchiveConnectorImportIntentRoute(app, { body: {} });

      assert.equal(response.status, 200);
      assert.equal(response.body.status, "archive_connector_import_intent_already_activated");
      assert.equal(response.body.provider, "reddit");
      assert.equal(response.body.idempotent, true);
      assert.equal(response.body.duplicate, true);
      assert.equal(response.body.activated, false);
      assert.equal(response.body.intent.status, "activated");
      assert.equal(response.body.intent.activatedAt, "2026-06-29T23:00:00.000Z");
      assertImportIntentActivationSafety(response.body, false, false);
      assertNoSensitiveImportIntentReadback(response.body);
      assert.equal(calls.length, 0);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent activation rechecks persona before credential decrypt provider fetch or writes", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow({
    persona_id: OTHER_PERSONA_ID,
  }));
  db.rows("archive_connector_credentials").push({ should_not_decrypt: true });
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withSourceInventoryFetch(calls, async () => {
      throw new Error("source inventory fetch should not run before activation persona recheck");
    }, async () => {
      const response = await activateArchiveConnectorImportIntentRoute(app, { body: {} });

      assert.equal(response.status, 404);
      assert.equal(response.body.code, "archive_connector_import_intent_persona_not_found");
      assert.equal(response.body.intent, null);
      assertImportIntentActivationSafety(response.body, false, false);
      assertNoSensitiveImportIntentReadback(response.body);
      assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);
      assert.equal(calls.length, 0);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent activation requires source-ready credential and account proof before write", async () => {
  const cases: Array<{
    name: string;
    row: () => Row;
    expectedCode: string;
  }> = [
    {
      name: "connect-proof-only",
      row: () => encryptedArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      }),
      expectedCode: "archive_connector_import_intent_credential_required",
    },
    {
      name: "missing-account-proof",
      row: () => sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: null,
      }),
      expectedCode: "archive_connector_import_intent_account_lookup_required",
    },
  ];

  for (const setup of cases) {
    const calls: SourceInventoryFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow());
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        db.rows("archive_connector_credentials").push(setup.row());
        await withSourceInventoryFetch(calls, async () => {
          throw new Error("source inventory fetch should not run before activation credential prerequisites");
        }, async () => {
          const response = await activateArchiveConnectorImportIntentRoute(app, { body: {} });

          assert.equal(response.status, 409, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.intent, null, setup.name);
          assertImportIntentActivationSafety(response.body, false, false);
          assertNoSensitiveImportIntentReadback(response.body);
          assert.equal(calls.length, 0, setup.name);
          assert.deepEqual(db.writeCalls, [], setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector import intent activation revalidates source metadata and updates only activation receipt", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        accountLabel: "Owner Reddit",
      }));
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(app, { provider: "reddit" });
        const source = inventory.body.sources.find((row: Row) => row.sourceFamily === "reddit_subreddit_memberships");
        const body = validArchiveConnectorImportIntentBody({
          sourceKey: source.sourceKey,
          sourceFamily: source.sourceFamily,
          sourceKind: source.sourceKind,
          sourceLabel: source.label,
        });
        const created = await createArchiveConnectorImportIntentRoute(app, { body });
        assert.equal(created.status, 201);

        const activated = await activateArchiveConnectorImportIntentRoute(app, {
          intentId: created.body.intent.id,
          body: {},
        });
        const duplicate = await activateArchiveConnectorImportIntentRoute(app, {
          intentId: created.body.intent.id,
          body: {},
        });
        const reconfirmed = await createArchiveConnectorImportIntentRoute(app, { body });

        assert.equal(activated.status, 201);
        assert.equal(activated.body.status, "archive_connector_import_intent_activated");
        assert.equal(activated.body.provider, "reddit");
        assert.equal(activated.body.idempotent, true);
        assert.equal(activated.body.duplicate, false);
        assert.equal(activated.body.activated, true);
        assert.equal(activated.body.intent.status, "activated");
        assert.equal(typeof activated.body.intent.activatedAt, "string");
        assert.equal(activated.body.intent.sourceKey, source.sourceKey);
        assertImportIntentActivationSafety(activated.body, true, true);
        assertNoSensitiveImportIntentReadback(activated.body);

        assert.equal(duplicate.status, 200);
        assert.equal(duplicate.body.status, "archive_connector_import_intent_already_activated");
        assert.equal(duplicate.body.duplicate, true);
        assert.equal(duplicate.body.activated, false);
        assert.deepEqual(duplicate.body.intent, activated.body.intent);
        assertImportIntentActivationSafety(duplicate.body, false, false);
        assertNoSensitiveImportIntentReadback(duplicate.body);

        assert.equal(reconfirmed.status, 200);
        assert.equal(reconfirmed.body.status, "archive_connector_import_intent_exists");
        assert.equal(reconfirmed.body.importIntentCreated, false);
        assert.equal(reconfirmed.body.duplicate, true);
        assert.equal(reconfirmed.body.intent.status, "activated");
        assert.deepEqual(reconfirmed.body.intent, activated.body.intent);
        assertImportIntentSafety(reconfirmed.body, true, false);
        assertNoSensitiveImportIntentReadback(reconfirmed.body);

        assert.equal(calls.length, 4);
        assert.equal(calls.every((call) => call.url === "https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1"), true);
        assert.deepEqual(db.writeCalls, [
          "archive_connector_import_intents.insert",
          "archive_connector_import_intents.update",
        ]);
        assert.equal(db.rows("archive_connector_import_intents").length, 1);
        const row = db.rows("archive_connector_import_intents")[0];
        assert.equal(row.status, "activated");
        assert.equal(typeof row.activated_at, "string");
        assert.equal(row.updated_at, "2026-06-29T22:55:00.000Z");
        const stored = JSON.stringify(row);
        for (const forbidden of [
          "subreddit-raw-id-fixture",
          "t5_raw_fullname_fixture",
          "after-cursor-fixture",
          "private-source-body-fixture",
          "provider-source-payload",
          "reddit-source_inventory-account-proof-token",
          "reddit-source_inventory-refresh-token-fixture",
        ]) {
          assert.equal(stored.includes(forbidden), false, `${forbidden} leaked into activated import intent row`);
        }
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent activation rejects stale source metadata without update", async () => {
  const calls: SourceInventoryFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow());
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const response = await activateArchiveConnectorImportIntentRoute(app, { body: {} });

        assert.equal(response.status, 409);
        assert.equal(response.body.code, "archive_connector_import_intent_source_unavailable");
        assert.equal(response.body.intent, null);
        assertImportIntentActivationSafety(response.body, false, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.equal(calls.length, 1);
        assert.deepEqual(db.writeCalls, []);
        assert.equal(db.rows("archive_connector_import_intents")[0].status, "pending");
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector import intent activation maps provider update and race failures safely", async () => {
  const providerFailureDb = new ArchiveConnectorReadinessSupabase();
  providerFailureDb.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow());
  setSupabaseAdminForTests(providerFailureDb.client as any);
  const providerFailureApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      providerFailureDb.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      const calls: SourceInventoryFetchCall[] = [];
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse({ request_id: "request-id-fixture" }, 429), async () => {
        const response = await activateArchiveConnectorImportIntentRoute(providerFailureApp, { body: {} });

        assert.equal(response.status, 429);
        assert.equal(response.body.code, "archive_connector_source_inventory_rate_limited");
        assert.equal(response.body.intent, null);
        assertImportIntentActivationSafety(response.body, false, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.equal(calls.length, 1);
        assert.deepEqual(providerFailureDb.writeCalls, []);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const writeFailureDb = new ArchiveConnectorReadinessSupabase();
  writeFailureDb.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow());
  writeFailureDb.updateErrorTables.add("archive_connector_import_intents");
  setSupabaseAdminForTests(writeFailureDb.client as any);
  const writeFailureApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      writeFailureDb.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      const calls: SourceInventoryFetchCall[] = [];
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(writeFailureApp, { provider: "reddit" });
        const source = inventory.body.sources.find((row: Row) => row.sourceFamily === "reddit_subreddit_memberships");
        const row = writeFailureDb.rows("archive_connector_import_intents")[0];
        Object.assign(row, {
          source_key: source.sourceKey,
          source_family: source.sourceFamily,
          source_kind: source.sourceKind,
          source_label: source.label,
        });

        const response = await activateArchiveConnectorImportIntentRoute(writeFailureApp, { body: {} });

        assert.equal(response.status, 500);
        assert.equal(response.body.code, "archive_connector_import_intent_write_failed");
        assert.equal(response.body.intent, null);
        assertImportIntentActivationSafety(response.body, false, false);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.deepEqual(writeFailureDb.writeCalls, ["archive_connector_import_intents.update"]);
        assert.equal(writeFailureDb.rows("archive_connector_import_intents")[0].status, "pending");
        assert.equal(calls.length, 2);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }

  const raceDb = new ArchiveConnectorReadinessSupabase();
  raceDb.rows("archive_connector_import_intents").push(archiveConnectorImportIntentRow());
  raceDb.updateRaceTables.add("archive_connector_import_intents");
  setSupabaseAdminForTests(raceDb.client as any);
  const raceApp = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      raceDb.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({ provider: "reddit" }));
      const calls: SourceInventoryFetchCall[] = [];
      await withSourceInventoryFetch(calls, async () => sourceInventoryJsonResponse(redditSourceInventoryPayload()), async () => {
        const inventory = await readArchiveConnectorSourceInventoryRoute(raceApp, { provider: "reddit" });
        const source = inventory.body.sources.find((row: Row) => row.sourceFamily === "reddit_subreddit_memberships");
        const row = raceDb.rows("archive_connector_import_intents")[0];
        Object.assign(row, {
          source_key: source.sourceKey,
          source_family: source.sourceFamily,
          source_kind: source.sourceKind,
          source_label: source.label,
        });

        const response = await activateArchiveConnectorImportIntentRoute(raceApp, { body: {} });

        assert.equal(response.status, 200);
        assert.equal(response.body.status, "archive_connector_import_intent_already_activated");
        assert.equal(response.body.duplicate, true);
        assert.equal(response.body.activated, false);
        assert.equal(response.body.intent.status, "activated");
        assert.equal(response.body.intent.activatedAt, "2026-06-29T22:59:00.000Z");
        assertImportIntentActivationSafety(response.body, true, true);
        assertNoSensitiveImportIntentReadback(response.body);
        assert.deepEqual(raceDb.writeCalls, ["archive_connector_import_intents.update"]);
        assert.equal(calls.length, 2);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector source preview requires auth UUID path and strict empty body before storage work", async () => {
  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await previewArchiveConnectorImportIntentSourceRoute(signedOutApp, { token: null });
    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.equal(signedOutDb.tableCalls.length, 0);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const invalidCases: Array<{ name: string; intentId?: string; body?: unknown; routeHandled: boolean }> = [
    { name: "id", intentId: "not-a-uuid", body: {}, routeHandled: true },
    { name: "array", body: [], routeHandled: true },
    { name: "unknown-key", body: { preview: true }, routeHandled: true },
    { name: "secret-shaped", body: { accessToken: "reddit-source_inventory-account-proof-token" }, routeHandled: true },
    { name: "primitive", body: "secret-shaped-value", routeHandled: false },
  ];

  for (const setup of invalidCases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      const response = await previewArchiveConnectorImportIntentSourceRoute(app, {
        intentId: setup.intentId,
        body: setup.body,
      });

      assert.equal(response.status, 400, setup.name);
      assert.equal(
        response.body.code,
        setup.routeHandled ? "archive_connector_source_preview_invalid" : "bad_request",
        setup.name,
      );
      if (setup.routeHandled) assertSourcePreviewSafety(response.body, false);
      assertNoSensitiveSourcePreviewReadback(response.body);
      assert.equal(db.tableCalls.includes("archive_connector_import_intents"), false, setup.name);
      assert.equal(db.tableCalls.includes("archive_connector_credentials"), false, setup.name);
      assert.deepEqual(db.writeCalls, [], setup.name);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source preview fails unavailable non-activated and unsupported intents before credential provider or writes", async () => {
  const cases: Array<{
    name: string;
    rows?: Row[];
    expectedStatus: number;
    expectedCode: string;
  }> = [
    {
      name: "missing",
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "wrong-owner",
      rows: [activatedRedditSavedItemsImportIntentRow({ owner_user_id: "other-user" })],
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "wrong-purpose",
      rows: [activatedRedditSavedItemsImportIntentRow({ purpose: "other_purpose" })],
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "pending",
      rows: [activatedRedditSavedItemsImportIntentRow({ status: "pending", activated_at: null })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_not_activatable",
    },
    {
      name: "cancelled",
      rows: [activatedRedditSavedItemsImportIntentRow({ status: "cancelled" })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_not_activatable",
    },
    {
      name: "unsupported-family",
      rows: [archiveConnectorImportIntentRow({
        status: "activated",
        activated_at: "2026-06-29T23:00:00.000Z",
      })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_source_unsupported",
    },
    {
      name: "unsupported-kind",
      rows: [activatedRedditSavedItemsImportIntentRow({ source_kind: "upvoted_items" })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_source_unsupported",
    },
    {
      name: "stale-source-key",
      rows: [activatedRedditSavedItemsImportIntentRow({ source_key: "a".repeat(24) })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_source_unsupported",
    },
  ];

  for (const setup of cases) {
    const calls: SourcePreviewFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(...(setup.rows ?? []));
    db.rows("archive_connector_credentials").push({ should_not_decrypt: true });
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withSourcePreviewFetch(calls, async () => {
        throw new Error("source preview fetch should not run for unavailable intents");
      }, async () => {
        const response = await previewArchiveConnectorImportIntentSourceRoute(app, { body: {} });

        assert.equal(response.status, setup.expectedStatus, setup.name);
        assert.equal(response.body.code, setup.expectedCode, setup.name);
        assert.equal(response.body.intent, null, setup.name);
        assert.equal(response.body.preview, null, setup.name);
        assertSourcePreviewSafety(response.body, false);
        assertNoSensitiveSourcePreviewReadback(response.body);
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false, setup.name);
        assert.equal(calls.length, 0, setup.name);
        assert.deepEqual(db.writeCalls, [], setup.name);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source preview rechecks persona before credential decrypt provider fetch or writes", async () => {
  const calls: SourcePreviewFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow({
    persona_id: OTHER_PERSONA_ID,
  }));
  db.rows("archive_connector_credentials").push({ should_not_decrypt: true });
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withSourcePreviewFetch(calls, async () => {
      throw new Error("source preview fetch should not run before preview persona recheck");
    }, async () => {
      const response = await previewArchiveConnectorImportIntentSourceRoute(app, { body: {} });

      assert.equal(response.status, 404);
      assert.equal(response.body.code, "archive_connector_import_intent_persona_not_found");
      assert.equal(response.body.intent, null);
      assert.equal(response.body.preview, null);
      assertSourcePreviewSafety(response.body, false);
      assertNoSensitiveSourcePreviewReadback(response.body);
      assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);
      assert.equal(calls.length, 0);
      assert.deepEqual(db.writeCalls, []);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector source preview requires source-ready credential and account proof before provider read", async () => {
  const cases: Array<{
    name: string;
    row: () => Row;
    expectedCode: string;
  }> = [
    {
      name: "connect-proof-only",
      row: () => encryptedArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      }),
      expectedCode: "archive_connector_source_preview_credential_required",
    },
    {
      name: "missing-account-proof",
      row: () => sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: null,
      }),
      expectedCode: "archive_connector_source_preview_account_lookup_required",
    },
  ];

  for (const setup of cases) {
    const calls: SourcePreviewFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        db.rows("archive_connector_credentials").push(setup.row());
        await withSourcePreviewFetch(calls, async () => {
          throw new Error("source preview fetch should not run before credential prerequisites");
        }, async () => {
          const response = await previewArchiveConnectorImportIntentSourceRoute(app, { body: {} });

          assert.equal(response.status, 409, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.intent, null, setup.name);
          assert.equal(response.body.preview, null, setup.name);
          assertSourcePreviewSafety(response.body, false);
          assertNoSensitiveSourcePreviewReadback(response.body);
          assert.equal(calls.length, 0, setup.name);
          assert.deepEqual(db.writeCalls, [], setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source preview reads Reddit identity then saved items and returns counts only", async () => {
  const calls: SourcePreviewFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv(archiveConnectorExchangeEnv(), async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        accountLabel: "stored-account-label-should-not-be-used",
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      }));

      await withSourcePreviewFetch(calls, async (input) => {
        const url = String(input);
        if (url === "https://oauth.reddit.com/api/v1/me?raw_json=1") {
          return sourcePreviewJsonResponse({
            id: "reddit-raw-account-id-fixture",
            name: "OwnerPreviewUser",
            providerPayload: "provider-preview-payload",
          });
        }
        if (url === "https://oauth.reddit.com/user/OwnerPreviewUser/saved?limit=10&raw_json=1") {
          return sourcePreviewJsonResponse({
            data: {
              after: "after-preview-cursor-fixture",
              children: [
                {
                  kind: "t3",
                  data: {
                    id: "saved-post-id-fixture",
                    title: "saved-post-title-fixture",
                    url: "https://reddit.example/saved",
                    author: "author-fixture",
                    subreddit: "subreddit-fixture",
                  },
                },
                {
                  kind: "t1",
                  data: {
                    id: "saved-comment-id-fixture",
                    body: "saved-comment-body-fixture",
                    author: "author-fixture",
                    subreddit: "subreddit-fixture",
                  },
                },
                {
                  kind: "more",
                  data: {
                    children: ["provider-preview-payload"],
                  },
                },
              ],
            },
          });
        }
        throw new Error(`unexpected source preview URL ${url}`);
      }, async () => {
        const response = await previewArchiveConnectorImportIntentSourceRoute(app, { body: {} });

        assert.equal(response.status, 200);
        assert.equal(response.body.status, "archive_connector_source_preview_read");
        assert.equal(response.body.provider, "reddit");
        assert.equal(response.body.purpose, "archive_connector");
        assert.equal(response.body.ownerOnly, true);
        assert.equal(response.body.intent.status, "activated");
        assert.equal(response.body.intent.sourceFamily, "reddit_user_history");
        assert.equal(response.body.intent.sourceKind, "saved_items");
        assert.equal(response.body.intent.sourceLabel, "Saved items");
        assert.deepEqual(response.body.preview, {
          pageLimit: 10,
          itemCount: 3,
          postCount: 1,
          commentCount: 1,
          otherCount: 1,
          truncated: true,
          contentReturned: false,
        });
        assertSourcePreviewSafety(response.body, true);
        assertNoSensitiveSourcePreviewReadback(response.body);

        assert.equal(calls.length, 2);
        assert.equal(calls[0].url, "https://oauth.reddit.com/api/v1/me?raw_json=1");
        assert.equal(calls[1].url, "https://oauth.reddit.com/user/OwnerPreviewUser/saved?limit=10&raw_json=1");
        assert.equal(calls[0].method, "GET");
        assert.equal(calls[1].method, "GET");
        assert.equal(calls[0].headers.get("Accept"), "application/json");
        assert.equal(calls[1].headers.get("Accept"), "application/json");
        assert.equal(calls[0].headers.get("Authorization"), "Bearer reddit-source_inventory-account-proof-token");
        assert.equal(calls[1].headers.get("Authorization"), "Bearer reddit-source_inventory-account-proof-token");
        assert.match(calls[0].headers.get("User-Agent") ?? "", /StationArchiveConnector/);
        assert.match(calls[1].headers.get("User-Agent") ?? "", /StationArchiveConnector/);
        assert.equal(calls[0].signalPresent, true);
        assert.equal(calls[1].signalPresent, true);
        assert.equal(calls[1].url.includes("stored-account-label-should-not-be-used"), false);
        assert.deepEqual(db.writeCalls, []);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector source preview maps account and provider failures to bounded responses", async () => {
  const cases: Array<{
    name: string;
    fetcher: (input: string | URL) => Promise<Response>;
    expectedStatus: number;
    expectedCode: string;
    expectedCalls: number;
  }> = [
    {
      name: "identity-mismatch",
      fetcher: async () => sourcePreviewJsonResponse({
        id: "different-raw-account-id-fixture",
        name: "OwnerPreviewUser",
      }),
      expectedStatus: 409,
      expectedCode: "archive_connector_source_preview_account_mismatch",
      expectedCalls: 1,
    },
    {
      name: "invalid-identity-payload",
      fetcher: async () => sourcePreviewJsonResponse({
        id: "reddit-raw-account-id-fixture",
        name: "bad/user",
      }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_preview_provider_response_invalid",
      expectedCalls: 1,
    },
    {
      name: "identity-rate-limited",
      fetcher: async () => sourcePreviewJsonResponse({ error: "rate-limit-fixture" }, 429),
      expectedStatus: 429,
      expectedCode: "archive_connector_source_preview_rate_limited",
      expectedCalls: 1,
    },
    {
      name: "saved-reconnect",
      fetcher: async (input) => String(input).includes("/saved")
        ? sourcePreviewJsonResponse({}, 401)
        : sourcePreviewJsonResponse({ id: "reddit-raw-account-id-fixture", name: "OwnerPreviewUser" }),
      expectedStatus: 409,
      expectedCode: "archive_connector_source_preview_reconnect_required",
      expectedCalls: 2,
    },
    {
      name: "saved-rate-limited",
      fetcher: async (input) => String(input).includes("/saved")
        ? sourcePreviewJsonResponse({ error: "rate-limit-fixture" }, 429)
        : sourcePreviewJsonResponse({ id: "reddit-raw-account-id-fixture", name: "OwnerPreviewUser" }),
      expectedStatus: 429,
      expectedCode: "archive_connector_source_preview_rate_limited",
      expectedCalls: 2,
    },
    {
      name: "saved-5xx",
      fetcher: async (input) => String(input).includes("/saved")
        ? sourcePreviewJsonResponse({ request_id: "request-id-fixture" }, 503)
        : sourcePreviewJsonResponse({ id: "reddit-raw-account-id-fixture", name: "OwnerPreviewUser" }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_preview_provider_failed",
      expectedCalls: 2,
    },
    {
      name: "saved-invalid-payload",
      fetcher: async (input) => String(input).includes("/saved")
        ? sourcePreviewJsonResponse({ data: { after: 123, children: [] } })
        : sourcePreviewJsonResponse({ id: "reddit-raw-account-id-fixture", name: "OwnerPreviewUser" }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_preview_provider_response_invalid",
      expectedCalls: 2,
    },
  ];

  for (const setup of cases) {
    const calls: SourcePreviewFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv(archiveConnectorExchangeEnv(), async () => {
        db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
          provider: "reddit",
          externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
        }));

        await withSourcePreviewFetch(calls, setup.fetcher, async () => {
          const response = await previewArchiveConnectorImportIntentSourceRoute(app, { body: {} });

          assert.equal(response.status, setup.expectedStatus, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.intent, null, setup.name);
          assert.equal(response.body.preview, null, setup.name);
          assertSourcePreviewSafety(response.body, false);
          assertNoSensitiveSourcePreviewReadback(response.body);
          assert.equal(calls.length, setup.expectedCalls, setup.name);
          if (setup.expectedCalls === 1) {
            assert.equal(calls[0].url, "https://oauth.reddit.com/api/v1/me?raw_json=1", setup.name);
          }
          assert.deepEqual(db.writeCalls, [], setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source staging requires auth UUID path strict empty body and accepted activated intent before work", async () => {
  const signedOutDb = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(signedOutDb.client as any);
  const signedOutApp = await createArchiveConnectorApp();

  try {
    const signedOut = await createArchiveConnectorSourceStagingRunRoute(signedOutApp, { token: null });
    assert.equal(signedOut.status, 401);
    assert.equal(signedOut.body.error, "Missing or invalid Authorization header.");
    assert.equal(signedOutDb.tableCalls.length, 0);
    assert.deepEqual(signedOutDb.writeCalls, []);
  } finally {
    setSupabaseAdminForTests(null);
  }

  const invalidCases: Array<{ name: string; intentId?: string; body?: unknown; routeHandled: boolean }> = [
    { name: "id", intentId: "not-a-uuid", body: {}, routeHandled: true },
    { name: "array", body: [], routeHandled: true },
    { name: "unknown-key", body: { stage: true }, routeHandled: true },
    { name: "secret-shaped", body: { sourceBody: "secret-shaped-source-content" }, routeHandled: true },
    { name: "primitive", body: "secret-shaped-value", routeHandled: false },
  ];

  for (const setup of invalidCases) {
    const db = new ArchiveConnectorReadinessSupabase();
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      const response = await createArchiveConnectorSourceStagingRunRoute(app, {
        intentId: setup.intentId,
        body: setup.body,
      });

      assert.equal(response.status, 400, setup.name);
      assert.equal(
        response.body.code,
        setup.routeHandled ? "archive_connector_source_staging_invalid" : "bad_request",
        setup.name,
      );
      if (setup.routeHandled) assertSourceStagingSafety(response.body, false);
      assertNoSensitiveSourceStagingReadback(response.body);
      assert.equal(db.tableCalls.includes("archive_connector_import_intents"), false, setup.name);
      assert.equal(db.tableCalls.includes("archive_connector_credentials"), false, setup.name);
      assert.deepEqual(db.writeCalls, [], setup.name);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }

  const intentCases: Array<{
    name: string;
    rows?: Row[];
    expectedStatus: number;
    expectedCode: string;
  }> = [
    {
      name: "missing",
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "wrong-owner",
      rows: [activatedRedditSavedItemsImportIntentRow({ owner_user_id: "other-user" })],
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_not_found",
    },
    {
      name: "pending",
      rows: [activatedRedditSavedItemsImportIntentRow({ status: "pending", activated_at: null })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_not_activatable",
    },
    {
      name: "unsupported-source",
      rows: [activatedRedditSavedItemsImportIntentRow({ source_kind: "comments" })],
      expectedStatus: 409,
      expectedCode: "archive_connector_import_intent_source_unsupported",
    },
    {
      name: "persona-recheck",
      rows: [activatedRedditSavedItemsImportIntentRow({ persona_id: OTHER_PERSONA_ID })],
      expectedStatus: 404,
      expectedCode: "archive_connector_import_intent_persona_not_found",
    },
  ];

  for (const setup of intentCases) {
    const calls: SourceStagingFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(...(setup.rows ?? []));
    db.rows("archive_connector_credentials").push({ should_not_decrypt: true });
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withSourceStagingFetch(calls, async () => {
        throw new Error("source staging fetch should not run before accepted intent gates");
      }, async () => {
        const response = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });

        assert.equal(response.status, setup.expectedStatus, setup.name);
        assert.equal(response.body.code, setup.expectedCode, setup.name);
        assert.equal(response.body.intent, null, setup.name);
        assert.equal(response.body.run, null, setup.name);
        assertSourceStagingSafety(response.body, false);
        assertNoSensitiveSourceStagingReadback(response.body);
        assert.equal(db.tableCalls.includes("archive_connector_credentials"), false, setup.name);
        assert.equal(calls.length, 0, setup.name);
        assert.deepEqual(db.writeCalls, [], setup.name);
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source staging gates encryption credential and account proof before provider read", async () => {
  const configCases: Array<{
    name: string;
    envValue: string | null;
  }> = [
    { name: "missing-staging-key", envValue: null },
    { name: "malformed-staging-key", envValue: "short" },
  ];

  for (const setup of configCases) {
    const calls: SourceStagingFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
    db.rows("archive_connector_credentials").push({ should_not_decrypt: true });
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ...archiveConnectorExchangeEnv(),
        ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY: setup.envValue,
      }, async () => {
        await withSourceStagingFetch(calls, async () => {
          throw new Error("source staging fetch should not run before staging encryption config");
        }, async () => {
          const response = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });

          assert.equal(response.status, 409, setup.name);
          assert.equal(response.body.code, "archive_connector_source_staging_encryption_required", setup.name);
          assertSourceStagingSafety(response.body, false);
          assertNoSensitiveSourceStagingReadback(response.body);
          assert.equal(db.tableCalls.includes("archive_connector_credentials"), false, setup.name);
          assert.equal(calls.length, 0, setup.name);
          assert.deepEqual(db.writeCalls, [], setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }

  const credentialCases: Array<{
    name: string;
    row: () => Row;
    expectedCode: string;
  }> = [
    {
      name: "connect-proof-only",
      row: () => encryptedArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      }),
      expectedCode: "archive_connector_source_staging_credential_required",
    },
    {
      name: "missing-account-proof",
      row: () => sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        externalAccountFingerprint: null,
      }),
      expectedCode: "archive_connector_source_staging_account_lookup_required",
    },
  ];

  for (const setup of credentialCases) {
    const calls: SourceStagingFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ...archiveConnectorExchangeEnv(),
        ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY: "source-staging-key-fixture-32-characters",
      }, async () => {
        db.rows("archive_connector_credentials").push(setup.row());
        await withSourceStagingFetch(calls, async () => {
          throw new Error("source staging fetch should not run before credential prerequisites");
        }, async () => {
          const response = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });

          assert.equal(response.status, 409, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assertSourceStagingSafety(response.body, false);
          assertNoSensitiveSourceStagingReadback(response.body);
          assert.equal(calls.length, 0, setup.name);
          assert.deepEqual(db.writeCalls, [], setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source staging writes encrypted batch and supports duplicate and supersede lifecycle", async () => {
  const calls: SourceStagingFetchCall[] = [];
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();
  let savedVariant = "initial";

  try {
    await withEnv({
      ...archiveConnectorExchangeEnv(),
      ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY: "source-staging-key-fixture-32-characters",
    }, async () => {
      db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
        provider: "reddit",
        accountLabel: "stored-account-label-should-not-be-used",
        externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
      }));

      await withSourceStagingFetch(calls, async (input) => {
        const url = String(input);
        if (url === "https://oauth.reddit.com/api/v1/me?raw_json=1") {
          return sourceStagingJsonResponse({
            id: "reddit-raw-account-id-fixture",
            name: "OwnerPreviewUser",
            providerPayload: "provider-staging-payload",
          });
        }
        if (url === "https://oauth.reddit.com/user/OwnerPreviewUser/saved?limit=10&raw_json=1") {
          return sourceStagingJsonResponse({
            data: {
              after: "after-staging-cursor-fixture",
              children: [
                {
                  kind: "t3",
                  data: {
                    id: "saved-post-id-fixture",
                    title: savedVariant === "initial"
                      ? "saved-post-title-fixture secret-shaped-source-content"
                      : "saved-post-title-fixture changed source content",
                    selftext: "saved-post-selftext-fixture",
                    url: "https://reddit.example/saved",
                    author: "author-fixture",
                    subreddit: "subreddit-fixture",
                  },
                },
                {
                  kind: "t1",
                  data: {
                    id: "saved-comment-id-fixture",
                    body: "saved-comment-body-fixture secret-shaped-source-content",
                    author: "author-fixture",
                    subreddit: "subreddit-fixture",
                  },
                },
                {
                  kind: "more",
                  data: {
                    title: "skipped-secret-title-fixture",
                    children: ["provider-staging-payload"],
                  },
                },
              ],
            },
          });
        }
        throw new Error(`unexpected source staging URL ${url}`);
      }, async () => {
        const created = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });
        const duplicate = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });
        savedVariant = "changed";
        const changed = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });
        db.rows("archive_connector_source_staging_runs")[1].expires_at = "2000-01-01T00:00:00.000Z";
        const restagedAfterExpiry = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });

        assert.equal(created.status, 201);
        assert.equal(created.body.status, "archive_connector_source_staging_run_created");
        assert.equal(created.body.staged, true);
        assert.equal(created.body.duplicate, false);
        assert.equal(created.body.intent.status, "activated");
        assert.equal(created.body.run.status, "staged");
        assert.equal(created.body.run.pageLimit, 10);
        assert.equal(created.body.run.itemCount, 2);
        assert.equal(created.body.run.postCount, 1);
        assert.equal(created.body.run.commentCount, 1);
        assert.equal(created.body.run.skippedCount, 1);
        assert.equal(created.body.run.truncated, true);
        assertSourceStagingSafety(created.body, true);
        assertNoSensitiveSourceStagingReadback(created.body);

        assert.equal(duplicate.status, 200);
        assert.equal(duplicate.body.status, "archive_connector_source_staging_run_exists");
        assert.equal(duplicate.body.staged, false);
        assert.equal(duplicate.body.duplicate, true);
        assert.deepEqual(duplicate.body.run, created.body.run);
        assertSourceStagingSafety(duplicate.body, true);
        assertNoSensitiveSourceStagingReadback(duplicate.body);

        assert.equal(changed.status, 201);
        assert.equal(changed.body.status, "archive_connector_source_staging_run_created");
        assert.equal(changed.body.run.id, "44444444-4444-4444-8444-000000000002");
        assert.equal(changed.body.run.status, "staged");
        assertSourceStagingSafety(changed.body, true);
        assertNoSensitiveSourceStagingReadback(changed.body);

        assert.equal(restagedAfterExpiry.status, 201);
        assert.equal(restagedAfterExpiry.body.status, "archive_connector_source_staging_run_created");
        assert.equal(restagedAfterExpiry.body.run.id, "44444444-4444-4444-8444-000000000003");
        assert.equal(restagedAfterExpiry.body.duplicate, false);
        assertSourceStagingSafety(restagedAfterExpiry.body, true);
        assertNoSensitiveSourceStagingReadback(restagedAfterExpiry.body);

        assert.equal(calls.length, 8);
        assert.equal(calls[0].url, "https://oauth.reddit.com/api/v1/me?raw_json=1");
        assert.equal(calls[1].url, "https://oauth.reddit.com/user/OwnerPreviewUser/saved?limit=10&raw_json=1");
        assert.equal(calls.every((call) => call.method === "GET"), true);
        assert.equal(calls.every((call) => call.headers.get("Accept") === "application/json"), true);
        assert.equal(calls.every((call) => call.headers.get("Authorization") === "Bearer reddit-source_inventory-account-proof-token"), true);
        assert.equal(calls.every((call) => call.signalPresent), true);

        assert.deepEqual(db.writeCalls, [
          "archive_connector_source_staging_runs.update",
          "archive_connector_source_staging_runs.update",
          "archive_connector_source_staging_runs.insert",
          "archive_connector_source_staging_runs.update",
          "archive_connector_source_staging_runs.update",
          "archive_connector_source_staging_runs.insert",
          "archive_connector_source_staging_runs.update",
          "archive_connector_source_staging_runs.update",
          "archive_connector_source_staging_runs.insert",
        ]);
        const rows = db.rows("archive_connector_source_staging_runs");
        assert.equal(rows.length, 3);
        assert.equal(rows[0].status, "superseded");
        assert.equal(typeof rows[0].superseded_at, "string");
        assert.equal(rows[1].status, "superseded");
        assert.equal(typeof rows[1].superseded_at, "string");
        assert.equal(rows[2].status, "staged");
        assert.equal(rows[0].source_snapshot_fingerprint.length, 64);
        assert.notEqual(rows[0].source_snapshot_fingerprint, rows[1].source_snapshot_fingerprint);
        assert.equal(rows[1].source_snapshot_fingerprint, rows[2].source_snapshot_fingerprint);
        const createdAt = Date.parse(rows[0].source_read_at);
        const expiresAt = Date.parse(rows[0].expires_at);
        assert.equal(expiresAt - createdAt <= 24 * 60 * 60 * 1000, true);

        const plaintextRow = JSON.stringify(rows.map((row) => ({
          ...row,
          encrypted_source_batch: "[encrypted]",
          source_snapshot_fingerprint: "[fingerprint]",
        })));
        assert.equal(plaintextRow.includes("secret-shaped-source-content"), false);
        assert.equal(plaintextRow.includes("saved-post-title-fixture"), false);
        assert.equal(plaintextRow.includes("saved-comment-body-fixture"), false);
        assert.equal(plaintextRow.includes("https://reddit.example/saved"), false);
        assert.equal(plaintextRow.includes("author-fixture"), false);
        assert.equal(plaintextRow.includes("subreddit-fixture"), false);

        const decrypted = decryptArchiveConnectorSourceStagingBatchForTests(rows[0].encrypted_source_batch);
        assert.equal((decrypted as Row).schema, "station.archive_connector.source_staging_batch.v1");
        assert.equal((decrypted as Row).provider, "reddit");
        assert.equal((decrypted as Row).sourceFamily, "reddit_user_history");
        assert.equal((decrypted as Row).sourceKind, "saved_items");
        assert.equal((decrypted as Row).pageLimit, 10);
        assert.equal((decrypted as Row).truncated, true);
        assert.deepEqual((decrypted as Row).items.map((item: Row) => item.kind), ["post", "comment"]);
        assert.equal((decrypted as Row).items[0].normalizedText.includes("secret-shaped-source-content"), true);
        assert.equal((decrypted as Row).items[1].normalizedText.includes("saved-comment-body-fixture"), true);
        assert.equal(JSON.stringify(decrypted).includes("https://reddit.example/saved"), false);
        assert.equal(JSON.stringify(decrypted).includes("author-fixture"), false);
        assert.equal(JSON.stringify(decrypted).includes("subreddit-fixture"), false);
        assert.equal(JSON.stringify(decrypted).includes("saved-post-id-fixture"), false);
      });
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector source staging maps provider and empty-source failures without staging writes", async () => {
  const cases: Array<{
    name: string;
    fetcher: (input: string | URL) => Promise<Response>;
    expectedStatus: number;
    expectedCode: string;
    expectedCalls: number;
  }> = [
    {
      name: "identity-mismatch",
      fetcher: async () => sourceStagingJsonResponse({
        id: "different-raw-account-id-fixture",
        name: "OwnerPreviewUser",
      }),
      expectedStatus: 409,
      expectedCode: "archive_connector_source_staging_account_mismatch",
      expectedCalls: 1,
    },
    {
      name: "identity-rate-limited",
      fetcher: async () => sourceStagingJsonResponse({ error: "rate-limit-fixture" }, 429),
      expectedStatus: 429,
      expectedCode: "archive_connector_source_staging_rate_limited",
      expectedCalls: 1,
    },
    {
      name: "saved-5xx",
      fetcher: async (input) => String(input).includes("/saved")
        ? sourceStagingJsonResponse({ request_id: "request-id-fixture" }, 503)
        : sourceStagingJsonResponse({ id: "reddit-raw-account-id-fixture", name: "OwnerPreviewUser" }),
      expectedStatus: 502,
      expectedCode: "archive_connector_source_staging_provider_failed",
      expectedCalls: 2,
    },
    {
      name: "all-skipped",
      fetcher: async (input) => String(input).includes("/saved")
        ? sourceStagingJsonResponse({ data: { after: null, children: [{ kind: "more", data: {} }] } })
        : sourceStagingJsonResponse({ id: "reddit-raw-account-id-fixture", name: "OwnerPreviewUser" }),
      expectedStatus: 409,
      expectedCode: "archive_connector_source_staging_no_stageable_items",
      expectedCalls: 2,
    },
  ];

  for (const setup of cases) {
    const calls: SourceStagingFetchCall[] = [];
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_import_intents").push(activatedRedditSavedItemsImportIntentRow());
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      await withEnv({
        ...archiveConnectorExchangeEnv(),
        ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY: "source-staging-key-fixture-32-characters",
      }, async () => {
        db.rows("archive_connector_credentials").push(sourceReadyArchiveConnectorCredentialRow({
          provider: "reddit",
          externalAccountFingerprint: fingerprintArchiveConnectorExternalAccount("reddit", "reddit-raw-account-id-fixture"),
        }));

        await withSourceStagingFetch(calls, setup.fetcher, async () => {
          const response = await createArchiveConnectorSourceStagingRunRoute(app, { body: {} });

          assert.equal(response.status, setup.expectedStatus, setup.name);
          assert.equal(response.body.code, setup.expectedCode, setup.name);
          assert.equal(response.body.intent, null, setup.name);
          assert.equal(response.body.run, null, setup.name);
          assertSourceStagingSafety(response.body, false);
          assertNoSensitiveSourceStagingReadback(response.body);
          assert.equal(calls.length, setup.expectedCalls, setup.name);
          assert.deepEqual(db.writeCalls, [], setup.name);
          assert.equal(db.rows("archive_connector_source_staging_runs").length, 0, setup.name);
        });
      });
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector credential revoke marks only owner reddit staged source runs revoked", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_credentials").push(
    {
      id: "row-id-fixture-reddit-active-new",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "reddit-access-token-fixture" },
      credential_fingerprint: "reddit-active-fingerprint",
      external_account_fingerprint: "external-account-fixture-reddit",
      account_label: "Reddit connected label",
      status: "active",
      created_at: "2026-06-29T14:00:00.000Z",
      updated_at: "2026-06-29T14:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
  );
  db.rows("archive_connector_source_staging_runs").push(
    archiveConnectorSourceStagingRunRow({ id: "44444444-4444-4444-8444-000000000001" }),
    archiveConnectorSourceStagingRunRow({
      id: "44444444-4444-4444-8444-000000000002",
      owner_user_id: "other-user",
    }),
    archiveConnectorSourceStagingRunRow({
      id: "44444444-4444-4444-8444-000000000003",
      status: "superseded",
      superseded_at: "2026-06-29T23:30:00.000Z",
    }),
    archiveConnectorSourceStagingRunRow({
      id: "44444444-4444-4444-8444-000000000004",
      expires_at: "2000-06-29T23:00:00.000Z",
    }),
  );
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const response = await revokeArchiveConnectorCredentialRoute(app);

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "archive_connector_credential_revoked");
    assertCredentialRevokeSafety(response.body, true);
    assertNoSensitiveCredentialReadback(response.body);

    const rows = db.rows("archive_connector_source_staging_runs");
    assert.equal(rows[0].status, "revoked");
    assert.equal(typeof rows[0].revoked_at, "string");
    assert.equal(rows[1].status, "staged");
    assert.equal(rows[1].revoked_at, null);
    assert.equal(rows[2].status, "superseded");
    assert.equal(rows[2].revoked_at, null);
    assert.equal(rows[3].status, "staged");
    assert.equal(rows[3].revoked_at, null);
    assert.equal(JSON.stringify(rows).includes("reddit-access-token-fixture"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector credential revoke requires auth supported provider and empty body", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const unauthenticated = await revokeArchiveConnectorCredentialRoute(app, { token: null });
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.body.error, "Missing or invalid Authorization header.");
    assert.equal(db.tableCalls.length, 0);

    const unsupported = await revokeArchiveConnectorCredentialRoute(app, { provider: "mastodon" });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "archive_connector_provider_not_supported");
    assert.equal(db.tableCalls.includes("archive_connector_credentials"), false);
    assert.deepEqual(db.writeCalls, []);

    const invalidBodies = [
      { body: { reason: "secret-shaped-value", stateHandle: "state-handle-fixture" }, routeHandled: true },
      { body: ["secret-shaped-value"], routeHandled: true },
      { body: "secret-shaped-value", routeHandled: false },
      { body: 7, routeHandled: false },
    ];

    for (const setup of invalidBodies) {
      const response = await revokeArchiveConnectorCredentialRoute(app, setup);
      assert.equal(response.status, 400);
      assert.equal(
        response.body.code,
        setup.routeHandled ? "archive_connector_credential_revoke_invalid" : "bad_request",
      );
      if (setup.routeHandled) assertCredentialRevokeSafety(response.body, false);
      assertNoSensitiveCredentialReadback(response.body);
      assert.equal(JSON.stringify(response.body).includes("state-handle-fixture"), false);
    }

    const empty = await revokeArchiveConnectorCredentialRoute(app, { body: {} });
    assert.equal(empty.status, 200);
    assert.equal(empty.body.status, "archive_connector_credential_revoke_noop");
    assert.equal(empty.body.connectionStatus, "missing");
    assert.equal(empty.body.credential, null);
    assertCredentialRevokeSafety(empty.body, true);
    assertNoSensitiveCredentialReadback(empty.body);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector credential revoke is local owner scoped and returns newest revoked safe metadata", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_credentials").push(
    {
      id: "row-id-fixture-other-owner-active",
      owner_user_id: "other-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "other-owner-token-fixture" },
      credential_fingerprint: "other-owner-fingerprint",
      external_account_fingerprint: "external-account-fixture-other",
      account_label: "Other owner label",
      status: "active",
      created_at: "2026-06-29T10:00:00.000Z",
      updated_at: "2026-06-29T10:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
    {
      id: "row-id-fixture-wrong-purpose-active",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "social_connector",
      encrypted_credential: { ciphertext: "wrong-purpose-token-fixture" },
      credential_fingerprint: "wrong-purpose-fingerprint",
      external_account_fingerprint: "external-account-fixture-wrong",
      account_label: "Wrong purpose label",
      status: "active",
      created_at: "2026-06-29T11:00:00.000Z",
      updated_at: "2026-06-29T11:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
    {
      id: "row-id-fixture-unsupported-provider-active",
      owner_user_id: "owner-user",
      provider: "mastodon",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "unsupported-provider-token-fixture" },
      credential_fingerprint: "unsupported-provider-fingerprint",
      external_account_fingerprint: "external-account-fixture-unsupported",
      account_label: "Unsupported provider label",
      status: "active",
      created_at: "2026-06-29T12:00:00.000Z",
      updated_at: "2026-06-29T12:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
    {
      id: "row-id-fixture-reddit-revoked-old",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "reddit-refresh-token-fixture" },
      credential_fingerprint: "reddit-old-fingerprint",
      external_account_fingerprint: null,
      account_label: "Reddit old safe label",
      status: "revoked",
      created_at: "2026-06-29T13:00:00.000Z",
      updated_at: "2026-06-29T13:05:00.000Z",
      rotated_at: null,
      revoked_at: "2026-06-29T13:05:00.000Z",
    },
    {
      id: "row-id-fixture-reddit-active-new",
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "reddit-access-token-fixture" },
      credential_fingerprint: "reddit-active-fingerprint",
      external_account_fingerprint: "external-account-fixture-reddit",
      account_label: "Reddit connected label",
      status: "active",
      created_at: "2026-06-29T14:00:00.000Z",
      updated_at: "2026-06-29T14:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    },
  );
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    await withEnv({ ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY: null }, async () => {
      const response = await revokeArchiveConnectorCredentialRoute(app);
      assert.equal(response.status, 200);
      assert.equal(response.body.status, "archive_connector_credential_revoked");
      assert.equal(response.body.provider, "reddit");
      assert.equal(response.body.purpose, "archive_connector");
      assert.equal(response.body.ownerOnly, true);
      assert.equal(response.body.connectionStatus, "revoked");
      assert.equal(response.body.credential.provider, "reddit");
      assert.equal(response.body.credential.status, "revoked");
      assert.equal(response.body.credential.configured, false);
      assert.equal(response.body.credential.accountLabel, "Reddit connected label");
      assert.equal(response.body.credential.fingerprintPresent, true);
      assert.equal(response.body.credential.externalAccountFingerprintPresent, true);
      assert.equal(typeof response.body.credential.revokedAt, "string");
      assertCredentialRevokeSafety(response.body, true);
      assertNoSensitiveCredentialReadback(response.body);

      const rows = db.rows("archive_connector_credentials");
      assert.equal(rows.find((row) => row.id === "row-id-fixture-reddit-active-new")?.status, "revoked");
      assert.equal(rows.find((row) => row.id === "row-id-fixture-other-owner-active")?.status, "active");
      assert.equal(rows.find((row) => row.id === "row-id-fixture-wrong-purpose-active")?.status, "active");
      assert.equal(rows.find((row) => row.id === "row-id-fixture-unsupported-provider-active")?.status, "active");
      assert.equal(rows.length, 5);
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector credential revoke is idempotent for already revoked and missing providers", async () => {
  const db = new ArchiveConnectorReadinessSupabase();
  db.rows("archive_connector_credentials").push(
    {
      id: "row-id-fixture-discord-revoked-old",
      owner_user_id: "owner-user",
      provider: "discord",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "discord-refresh-token-fixture" },
      credential_fingerprint: "discord-old-fingerprint",
      external_account_fingerprint: null,
      account_label: "Discord old safe label",
      status: "revoked",
      created_at: "2026-06-29T12:00:00.000Z",
      updated_at: "2026-06-29T12:05:00.000Z",
      rotated_at: null,
      revoked_at: "2026-06-29T12:05:00.000Z",
    },
    {
      id: "row-id-fixture-discord-revoked-new",
      owner_user_id: "owner-user",
      provider: "discord",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "discord-access-token-fixture" },
      credential_fingerprint: "discord-new-fingerprint",
      external_account_fingerprint: null,
      account_label: "Discord paused label",
      status: "revoked",
      created_at: "2026-06-29T13:00:00.000Z",
      updated_at: "2026-06-29T13:05:00.000Z",
      rotated_at: null,
      revoked_at: "2026-06-29T13:05:00.000Z",
    },
  );
  setSupabaseAdminForTests(db.client as any);
  const app = await createArchiveConnectorApp();

  try {
    const revoked = await revokeArchiveConnectorCredentialRoute(app, { provider: "discord", body: {} });
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.status, "archive_connector_credential_revoke_noop");
    assert.equal(revoked.body.connectionStatus, "revoked");
    assert.equal(revoked.body.credential.accountLabel, "Discord paused label");
    assert.equal(revoked.body.credential.revokedAt, "2026-06-29T13:05:00.000Z");
    assertCredentialRevokeSafety(revoked.body, true);
    assertNoSensitiveCredentialReadback(revoked.body);

    const missing = await revokeArchiveConnectorCredentialRoute(app, { provider: "reddit" });
    assert.equal(missing.status, 200);
    assert.equal(missing.body.status, "archive_connector_credential_revoke_noop");
    assert.equal(missing.body.connectionStatus, "missing");
    assert.equal(missing.body.credential, null);
    assertCredentialRevokeSafety(missing.body, true);
    assertNoSensitiveCredentialReadback(missing.body);
    assert.equal(db.rows("archive_connector_credentials").length, 2);
    assert.equal(db.rows("archive_connector_credentials").every((row) => row.status === "revoked"), true);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("archive connector credential revoke returns bounded storage failures", async () => {
  for (const setup of ["update", "load"] as const) {
    const db = new ArchiveConnectorReadinessSupabase();
    db.rows("archive_connector_credentials").push({
      id: `row-id-fixture-${setup}-failure`,
      owner_user_id: "owner-user",
      provider: "reddit",
      purpose: "archive_connector",
      encrypted_credential: { ciphertext: "reddit-access-token-fixture" },
      credential_fingerprint: "reddit-active-fingerprint",
      external_account_fingerprint: null,
      account_label: "Reddit connected label",
      status: "active",
      created_at: "2026-06-29T14:00:00.000Z",
      updated_at: "2026-06-29T14:00:00.000Z",
      rotated_at: null,
      revoked_at: null,
    });
    if (setup === "update") db.updateErrorTables.add("archive_connector_credentials");
    if (setup === "load") db.selectErrorTables.add("archive_connector_credentials");
    setSupabaseAdminForTests(db.client as any);
    const app = await createArchiveConnectorApp();

    try {
      const response = await revokeArchiveConnectorCredentialRoute(app);
      assert.equal(response.status, 500, setup);
      assert.equal(response.body.code, "archive_connector_credential_revoke_failed", setup);
      assert.equal(response.body.status, "credential_revoke_failed", setup);
      assertCredentialRevokeSafety(response.body, false);
      assertNoSensitiveCredentialReadback(response.body);
    } finally {
      setSupabaseAdminForTests(null);
    }
  }
});

test("archive connector source stays bounded to credential source inventory and import intent lanes", () => {
  const routeSource = readFileSync("apps/api/src/routes/archive-connectors.ts", "utf8");
  const readinessSource = readFileSync("apps/api/src/services/archive-connectors/readiness.ts", "utf8");
  const tokenExchangeSource = readFileSync("apps/api/src/services/archive-connectors/token-exchange.ts", "utf8");
  const accountLookupSource = readFileSync("apps/api/src/services/archive-connectors/account-lookup.ts", "utf8");
  const sourceInventorySource = readFileSync("apps/api/src/services/archive-connectors/source-inventory.ts", "utf8");
  const sourcePreviewSource = readFileSync("apps/api/src/services/archive-connectors/source-preview.ts", "utf8");
  const sourceStagingSource = readFileSync("apps/api/src/services/archive-connectors/source-staging.ts", "utf8");
  const importIntentSource = readFileSync("apps/api/src/services/archive-connectors/import-intents.ts", "utf8");
  const source = `${routeSource}\n${readinessSource}`;
  const sourceWithoutAcceptedArchiveConfig = source.replace(
    /ARCHIVE_CONNECTOR_(REDDIT|DISCORD)_CLIENT_(ID|SECRET)/g,
    "",
  );
  const stateCreateMatches = routeSource.match(/createArchiveConnectorOAuthState/g) ?? [];
  const stateConsumeMatches = routeSource.match(/consumeArchiveConnectorOAuthState/g) ?? [];
  const stateValidateMatches = routeSource.match(/validateArchiveConnectorOAuthState/g) ?? [];
  const credentialStoreMatches = routeSource.match(/storeArchiveConnectorCredential/g) ?? [];
  const credentialRevokeMatches = routeSource.match(/revokeArchiveConnectorCredential/g) ?? [];
  const accountSecretMatches = routeSource.match(/loadArchiveConnectorAccountCredentialSecret/g) ?? [];
  const sourceInventorySecretMatches = routeSource.match(/loadArchiveConnectorSourceInventoryCredentialSecret/g) ?? [];
  const accountLookupMatches = routeSource.match(/lookupArchiveConnectorProviderAccount/g) ?? [];
  const sourceInventoryMatches = routeSource.match(/readArchiveConnectorProviderSourceInventory/g) ?? [];
  const accountMetadataUpdateMatches = routeSource.match(/updateArchiveConnectorCredentialAccountMetadata/g) ?? [];
  const tokenExchangeMatches = routeSource.match(/exchangeArchiveConnectorOAuthCode/g) ?? [];
  const importIntentCredentialSecretMatches = importIntentSource.match(/loadArchiveConnectorSourceInventoryCredentialSecret/g) ?? [];
  const importIntentSourceInventoryMatches = importIntentSource.match(/readArchiveConnectorProviderSourceInventory/g) ?? [];

  assert.equal(stateCreateMatches.length, 2);
  assert.equal(stateConsumeMatches.length, 3);
  assert.equal(stateValidateMatches.length, 2);
  assert.equal(credentialStoreMatches.length, 2);
  assert.equal(credentialRevokeMatches.length, 2);
  assert.equal(accountSecretMatches.length, 2);
  assert.equal(sourceInventorySecretMatches.length, 2);
  assert.equal(accountLookupMatches.length, 2);
  assert.equal(sourceInventoryMatches.length, 2);
  assert.equal(accountMetadataUpdateMatches.length, 2);
  assert.equal(tokenExchangeMatches.length, 3);
  assert.equal(importIntentCredentialSecretMatches.length, 3);
  assert.equal(importIntentSourceInventoryMatches.length, 3);
  assert.doesNotMatch(readinessSource, /createArchiveConnectorOAuthState/i);
  assert.doesNotMatch(readinessSource, /consumeArchiveConnectorOAuthState/i);
  assert.doesNotMatch(readinessSource, /validateArchiveConnectorOAuthState/i);
  assert.doesNotMatch(routeSource, /loadArchiveConnectorSourceCredentialSecret|ArchiveConnectorSourceCredentialSecret/i);
  assert.doesNotMatch(routeSource, /decryptArchiveConnectorCredential|providerTokenRevoke|revocation_endpoint|oauth\/revoke/i);
  assert.doesNotMatch(routeSource, /res\.redirect|redirect\s*\(/i);
  assert.doesNotMatch(sourceWithoutAcceptedArchiveConfig, /REDDIT_CLIENT_ID|REDDIT_CLIENT_SECRET|DISCORD_CLIENT_ID|DISCORD_CLIENT_SECRET/i);
  assert.doesNotMatch(routeSource, /fetch\s*\(|providerSdk|access_token|refresh_token/i);
  assert.match(tokenExchangeSource, /www\.reddit\.com\/api\/v1\/access_token/);
  assert.match(tokenExchangeSource, /discord\.com\/api\/oauth2\/token/);
  assert.doesNotMatch(tokenExchangeSource, /api\/v1\/me|users\/@me|guilds|channels|messages|listing|saved|upvoted|history|new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel/i);
  assert.match(accountLookupSource, /oauth\.reddit\.com\/api\/v1\/me\?raw_json=1/);
  assert.match(accountLookupSource, /discord\.com\/api\/v10\/users\/@me/);
  assert.doesNotMatch(accountLookupSource, /access_token|refresh_token|guilds|channels|messages|listing|saved|upvoted|history|submitted|comments|subreddits|archive_sources|import_jobs|new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel/i);
  assert.match(sourceInventorySource, /oauth\.reddit\.com\/subreddits\/mine\/subscriber\?limit=100&raw_json=1/);
  assert.match(sourceInventorySource, /discord\.com\/api\/v10\/users\/@me\/guilds\?limit=200&with_counts=false/);
  assert.doesNotMatch(sourceInventorySource, /\/user\/|\/saved|\/upvoted|\/downvoted|\/submitted|\/comments|\/hidden|\/overview|\/gilded|\/api\/v1\/me|channels|messages|\/members|guild-members|connections|webhooks|invites|archive_sources|import_jobs|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates|new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel/i);
  assert.match(sourcePreviewSource, /oauth\.reddit\.com\/api\/v1\/me\?raw_json=1/);
  assert.match(sourcePreviewSource, /oauth\.reddit\.com\/user\/\$\{encodeURIComponent\(account\.username\)\}\/saved\?limit=10&raw_json=1/);
  assert.doesNotMatch(sourcePreviewSource, /discord|guilds|channels|messages|\/members|guild-members|connections|webhooks|invites|subreddits\/mine|\/upvoted|\/downvoted|\/submitted|\/hidden|\/overview|\/gilded|archive_sources|import_jobs|persona_files|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates|new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel|providerSdk/i);
  assert.match(sourceStagingSource, /archive_connector_source_staging_runs/);
  assert.match(sourceStagingSource, /station\.archive_connector\.source_staging_batch\.v1/);
  assert.match(sourceStagingSource, /oauth\.reddit\.com\/api\/v1\/me\?raw_json=1/);
  assert.match(sourceStagingSource, /oauth\.reddit\.com\/user\/\$\{encodeURIComponent\(account\.username\)\}\/saved\?limit=10&raw_json=1/);
  assert.doesNotMatch(sourceStagingSource, /discord|guilds|channels|messages|\/members|guild-members|connections|webhooks|invites|subreddits\/mine|\/upvoted|\/downvoted|\/submitted|\/hidden|\/overview|\/gilded|archive_sources|import_jobs|persona_files|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates|new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel|providerSdk/i);
  assert.match(importIntentSource, /archive_connector_import_intents/);
  assert.doesNotMatch(importIntentSource, /archive_sources|import_jobs|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates|new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel|providerSdk|fetch\s*\(/i);
  assert.doesNotMatch(source, /archive_sources|import_jobs|memory_items|canon_items|continuity_candidates|documents\.insert|review_candidates/i);
  assert.doesNotMatch(source, /new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerModel/i);
});

function assertDisabledStartSafety(body: Row) {
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.oauthCallbacksEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertDisabledCallbackVerifySafety(body: Row) {
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertAuthorizationUrlSafety(body: Row) {
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.oauthCallbacksEnabled, true);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertExchangeSafety(body: Row, enabled: boolean) {
  assert.equal(body.credentialWritesEnabled, enabled);
  assert.equal(body.oauthRedirectsEnabled, false);
  assert.equal(body.oauthCallbacksEnabled, true);
  assert.equal(body.tokenExchangeEnabled, enabled);
  assert.equal(body.providerTokenEndpointCallsEnabled, enabled);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertCredentialReadbackSafety(body: Row) {
  assert.equal(body.tokenDecryptEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.credentialRevokeEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertCredentialRevokeSafety(body: Row, enabled: boolean) {
  assert.equal(body.localCredentialRevokeEnabled, enabled);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.tokenDecryptEnabled, false);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.providerCallsEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.importWritesEnabled, false);
}

function assertAccountLookupSafety(body: Row, enabled: boolean) {
  assert.equal(body.tokenDecryptEnabled, enabled);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerTokenRefreshEnabled, false);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.credentialMetadataUpdateEnabled, enabled);
  assert.equal(body.credentialWritesEnabled, enabled);
  assert.equal(body.providerAccountLookupEnabled, enabled);
  assert.equal(body.providerCallsEnabled, enabled);
  assert.equal(body.rawExternalAccountIdReadbackEnabled, false);
  assert.equal(body.providerPayloadReadbackEnabled, false);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.archiveSourceWritesEnabled, false);
  assert.equal(body.importWritesEnabled, false);
  assert.equal(body.jobWritesEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
}

function assertSourceInventorySafety(body: Row, enabled: boolean) {
  assert.equal(body.tokenDecryptEnabled, enabled);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerTokenRefreshEnabled, false);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.credentialMetadataUpdateEnabled, false);
  assert.equal(body.providerAccountLookupEnabled, false);
  assert.equal(body.providerCallsEnabled, enabled);
  assert.equal(body.sourceInventoryEnabled, enabled);
  assert.equal(body.sourceBodyReadEnabled, false);
  assert.equal(body.archiveSourceWritesEnabled, false);
  assert.equal(body.importWritesEnabled, false);
  assert.equal(body.jobWritesEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.publicWritesEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
  assert.equal(body.rawProviderIdReadbackEnabled, false);
  assert.equal(body.providerPayloadReadbackEnabled, false);
  assert.equal(body.providerHeadersReadbackEnabled, false);
}

function assertImportIntentSafety(
  body: Row,
  sourceInventoryEnabled: boolean,
  importIntentWritesEnabled = sourceInventoryEnabled,
) {
  assert.equal(body.tokenDecryptEnabled, sourceInventoryEnabled);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerTokenRefreshEnabled, false);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.credentialMetadataUpdateEnabled, false);
  assert.equal(body.providerAccountLookupEnabled, false);
  assert.equal(body.providerCallsEnabled, sourceInventoryEnabled);
  assert.equal(body.sourceInventoryEnabled, sourceInventoryEnabled);
  assert.equal(body.sourceBodyReadEnabled, false);
  assert.equal(body.archiveSourceWritesEnabled, false);
  assert.equal(body.importIntentWritesEnabled, importIntentWritesEnabled);
  assert.equal(body.importWritesEnabled, false);
  assert.equal(body.existingImportJobsWriteEnabled, false);
  assert.equal(body.jobWritesEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.publicWritesEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
  assert.equal(body.rawProviderIdReadbackEnabled, false);
  assert.equal(body.providerPayloadReadbackEnabled, false);
  assert.equal(body.providerHeadersReadbackEnabled, false);
  assert.equal(body.sourceInventoryCredentialMetadataUpdateEnabled, false);
}

function assertImportIntentActivationSafety(
  body: Row,
  sourceInventoryEnabled: boolean,
  activationWritesEnabled: boolean,
) {
  assert.equal(body.tokenDecryptEnabled, sourceInventoryEnabled);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerTokenRefreshEnabled, false);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.credentialMetadataUpdateEnabled, false);
  assert.equal(body.providerAccountLookupEnabled, false);
  assert.equal(body.providerCallsEnabled, sourceInventoryEnabled);
  assert.equal(body.sourceInventoryEnabled, sourceInventoryEnabled);
  assert.equal(body.sourceBodyReadEnabled, false);
  assert.equal(body.archiveSourceWritesEnabled, false);
  assert.equal(body.importIntentWritesEnabled, activationWritesEnabled);
  assert.equal(body.importIntentActivationWritesEnabled, activationWritesEnabled);
  assert.equal(body.importWritesEnabled, false);
  assert.equal(body.existingImportJobsWriteEnabled, false);
  assert.equal(body.connectorJobTableWritesEnabled, false);
  assert.equal(body.jobWritesEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.workerExecutionEnabled, false);
  assert.equal(body.recurringPullsEnabled, false);
  assert.equal(body.publicWritesEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
  assert.equal(body.rawProviderIdReadbackEnabled, false);
  assert.equal(body.providerPayloadReadbackEnabled, false);
  assert.equal(body.providerHeadersReadbackEnabled, false);
  assert.equal(body.sourceInventoryCredentialMetadataUpdateEnabled, false);
}

function assertSourcePreviewSafety(body: Row, enabled: boolean) {
  assert.equal(body.tokenDecryptEnabled, enabled);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerTokenRefreshEnabled, false);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.credentialMetadataUpdateEnabled, false);
  assert.equal(body.providerAccountLookupEnabled, false);
  assert.equal(body.providerCallsEnabled, enabled);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.sourcePreviewEnabled, enabled);
  assert.equal(body.sourceBodyReadEnabled, enabled);
  assert.equal(body.sourceBodyReadbackEnabled, false);
  assert.equal(body.privateStagingEnabled, false);
  assert.equal(body.archiveSourceWritesEnabled, false);
  assert.equal(body.importIntentWritesEnabled, false);
  assert.equal(body.importIntentActivationWritesEnabled, false);
  assert.equal(body.importWritesEnabled, false);
  assert.equal(body.existingImportJobsWriteEnabled, false);
  assert.equal(body.connectorJobTableWritesEnabled, false);
  assert.equal(body.jobWritesEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.workerExecutionEnabled, false);
  assert.equal(body.recurringPullsEnabled, false);
  assert.equal(body.publicWritesEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
  assert.equal(body.rawProviderIdReadbackEnabled, false);
  assert.equal(body.providerPayloadReadbackEnabled, false);
  assert.equal(body.providerHeadersReadbackEnabled, false);
  assert.equal(body.sourceInventoryCredentialMetadataUpdateEnabled, false);
}

function assertSourceStagingSafety(body: Row, enabled: boolean) {
  assert.equal(body.tokenDecryptEnabled, enabled);
  assert.equal(body.tokenExchangeEnabled, false);
  assert.equal(body.providerTokenEndpointCallsEnabled, false);
  assert.equal(body.providerTokenRefreshEnabled, false);
  assert.equal(body.providerTokenRevocationEnabled, false);
  assert.equal(body.credentialWritesEnabled, false);
  assert.equal(body.credentialMetadataUpdateEnabled, false);
  assert.equal(body.providerAccountLookupEnabled, false);
  assert.equal(body.providerCallsEnabled, enabled);
  assert.equal(body.sourceInventoryEnabled, false);
  assert.equal(body.sourcePreviewEnabled, enabled);
  assert.equal(body.sourceBodyReadEnabled, enabled);
  assert.equal(body.sourceBodyReadbackEnabled, false);
  assert.equal(body.sourceStagingEncryptionEnabled, enabled);
  assert.equal(body.privateStagingEnabled, enabled);
  assert.equal(body.privateStagingWritesEnabled, enabled);
  assert.equal(body.archiveSourceWritesEnabled, false);
  assert.equal(body.importIntentWritesEnabled, false);
  assert.equal(body.importIntentActivationWritesEnabled, false);
  assert.equal(body.importWritesEnabled, false);
  assert.equal(body.existingImportJobsWriteEnabled, false);
  assert.equal(body.connectorJobTableWritesEnabled, false);
  assert.equal(body.jobWritesEnabled, false);
  assert.equal(body.queueEnabled, false);
  assert.equal(body.workerExecutionEnabled, false);
  assert.equal(body.recurringPullsEnabled, false);
  assert.equal(body.publicWritesEnabled, false);
  assert.equal(body.uiChangesEnabled, false);
  assert.equal(body.rawProviderIdReadbackEnabled, false);
  assert.equal(body.providerPayloadReadbackEnabled, false);
  assert.equal(body.providerHeadersReadbackEnabled, false);
  assert.equal(body.encryptedSourceBatchReadbackEnabled, false);
  assert.equal(body.sourceSnapshotFingerprintReadbackEnabled, false);
  assert.equal(body.sourceInventoryCredentialMetadataUpdateEnabled, false);
}

function assertSourceInventoryRowSafety(row: Row) {
  assert.equal(row.purpose, "archive_connector");
  assert.equal(row.ownerOnly, true);
  assert.equal(typeof row.sourceKey, "string");
  assert.equal(row.sourceKey.length, 24);
  assert.equal(row.sourceBodyReadEnabled, false);
  assert.equal(row.importWritesEnabled, false);
  assert.equal(row.jobWritesEnabled, false);
  assert.equal(row.queueEnabled, false);
  assert.equal(row.publicWritesEnabled, false);
  assert.equal(row.rawProviderIdReadbackEnabled, false);
  assert.equal(row.providerPayloadReadbackEnabled, false);
}
