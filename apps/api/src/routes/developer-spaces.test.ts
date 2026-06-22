import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import test from "node:test";
import express, { type Express } from "express";
import { bridgeObservedRuntimeFixtureToDeveloperSpaceImport } from "../../../web/lib/observed-runtime-fixture";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { hashDeveloperSpaceApiKey } from "../services/developer-space.service";
import {
  DisabledOperationalCacheProvider,
  resetOperationalCacheProviderForTests,
  setOperationalCacheProviderForTests,
  type OperationalCacheProvider,
} from "../services/operational-cache.service";
import { developerSpacesRouter } from "./developer-spaces";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "owner-user", tier: "canon", is_admin: false },
      { id: "other-user", tier: "canon", is_admin: false },
      { id: "admin-user", tier: "institutional", is_admin: true },
    ],
    projects: [],
    project_members: [],
    developer_spaces: [],
    developer_space_ingestion_keys: [],
    developer_space_documents: [],
    developer_space_usage: [],
    developer_space_nodes: [],
    developer_space_events: [],
    developer_space_snapshots: [],
    developer_space_observed_runtime_context: [],
    developer_space_observed_runtime_webhook_receipts: [],
    developer_space_webhook_signing_secrets: [],
    developer_space_agent_confirmations: [],
    documents: [],
    ai_trace_sessions: [],
    ai_trace_events: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-24T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["other-token", { id: "other-user", email: "other@example.test" }],
    ["admin-token", { id: "admin-user", email: "admin@example.test" }],
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
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  insertRow(table: string, payload: Row) {
    const row = this.prepareRow(table, payload);
    this.rows(table).push(row);
    return row;
  }

  timestamp() {
    const value = new Date(this.clock).toISOString();
    this.clock += 1000;
    return value;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `${table}-${this.idCounters[table]}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "developer_spaces") {
      row.project_id ??= null;
      row.description ??= null;
      row.provider_policy ??= "public_synthetic_only";
      row.visualisation_config ??= {};
      row.api_key_hash ??= null;
      row.api_key_last_four ??= null;
      row.api_key_created_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "projects") {
      row.description ??= null;
      row.visibility ??= "private";
      row.connection_tier ??= "tier_1_showcase";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "project_members") {
      row.role ??= "owner";
      row.status ??= "active";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "developer_space_ingestion_keys") {
      row.label ??= null;
      row.status ??= "active";
      row.last_used_at ??= null;
      row.revoked_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "developer_space_documents") {
      row.document_role ??= "note";
      row.link_visibility ??= "owner";
      row.sort_order ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "developer_space_usage") {
      row.project_id ??= null;
      row.ingested_nodes_count ??= 0;
      row.ingested_events_count ??= 0;
      row.ingested_snapshots_count ??= 0;
      row.storage_bytes ??= 0;
      row.public_detail_reads_count ??= 0;
      row.export_count ??= 0;
      row.updated_at ??= now;
    }

    if (table === "documents") {
      row.space_id ??= null;
      row.persona_id ??= null;
      row.body ??= "";
      row.document_type ??= "essay";
      row.status ??= "draft";
      row.visibility ??= "private";
      row.comments_enabled ??= false;
      row.published_at ??= null;
      row.provenance_type ??= "user_authored";
      row.source_type ??= "manual";
      row.source_id ??= null;
      row.source_label ??= null;
      row.source_persona_id ??= null;
      row.discussion_thread_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "developer_space_nodes") {
      row.created_at ??= now;
      row.updated_at ??= now;
      row.last_event_at ??= null;
    }

    if (table === "developer_space_events" || table === "developer_space_snapshots") {
      row.created_at ??= now;
    }

    if (table === "developer_space_observed_runtime_context") {
      row.external_id ??= null;
      row.source_ref ??= null;
      row.payload ??= {};
      row.observed_runtime_classifications ??= null;
      row.provenance ??= "imported";
      row.occurred_at ??= now;
      row.created_at ??= now;
    }

    if (table === "developer_space_observed_runtime_webhook_receipts") {
      row.response_body ??= {};
      row.created_at ??= now;
    }

    if (table === "developer_space_webhook_signing_secrets") {
      row.status ??= "active";
      row.last_used_at ??= null;
      row.revoked_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "developer_space_agent_confirmations") {
      row.status ??= "pending";
      row.sanitized_payload ??= {};
      row.requested_at ??= now;
      row.approved_at ??= null;
      row.cancelled_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "ai_trace_sessions") {
      row.source ??= "system";
      row.status ??= "running";
      row.metadata ??= {};
      row.started_at ??= now;
      row.completed_at ??= null;
      row.duration_ms ??= null;
      row.total_input_tokens ??= 0;
      row.total_output_tokens ??= 0;
      row.total_estimated_cost_pence ??= 0;
      row.error_message ??= null;
    }

    if (table === "ai_trace_events") {
      row.status ??= "completed";
      row.provider ??= null;
      row.model ??= null;
      row.input_tokens ??= 0;
      row.output_tokens ??= 0;
      row.estimated_cost_pence ??= 0;
      row.duration_ms ??= null;
      row.payload ??= {};
      row.created_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean; nullsFirst: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "upsert" | "update" = "select";
  private payload: Row | Row[] | null = null;
  private upsertConflictFields: string[] = ["id"];
  private countRequested = false;
  private head = false;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.countRequested = Boolean(options.count);
    this.head = Boolean(options.head);
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.inFilters.push([field, values]);
    return this;
  }

  order(field: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    this.orderSpec = {
      field,
      ascending: options.ascending ?? true,
      nullsFirst: options.nullsFirst ?? true,
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: Row, options: { onConflict?: string } = {}) {
    this.operation = "upsert";
    this.payload = payload;
    this.upsertConflictFields = options.onConflict?.split(",").map((field) => field.trim()) ?? ["id"];
    return this;
  }

  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  single() {
    return this.execute("single");
  }

  maybeSingle() {
    return this.execute("maybeSingle");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];

    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }

    for (const [field, values] of this.inFilters) {
      rows = rows.filter((row) => values.includes(row[field]));
    }

    if (this.orderSpec) {
      const { field, ascending, nullsFirst } = this.orderSpec;
      rows.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return nullsFirst ? -1 : 1;
        if (bValue == null) return nullsFirst ? 1 : -1;
        if (aValue === bValue) return 0;
        return (aValue > bValue ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    let rows: Row[];

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "upsert") {
      const payload = this.payload as Row;
      const existing = this.db.rows(this.table).find((row) =>
        this.upsertConflictFields.every((field) => row[field] === payload[field])
      );
      if (existing) {
        Object.assign(existing, payload);
        if ("updated_at" in existing) existing.updated_at = this.db.timestamp();
        rows = [existing];
      } else {
        rows = [this.db.insertRow(this.table, payload)];
      }
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        if ("updated_at" in row) row.updated_at = this.db.timestamp();
      }
    } else {
      rows = this.matchingRows();
    }

    const data = clone(rows);
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }
    if (mode === "maybeSingle") {
      return { data: data[0] ?? null, error: null, count };
    }
    return { data: this.head ? null : data, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function observedRuntimeFixture(name: string) {
  return JSON.parse(readFileSync(join(process.cwd(), "apps", "web", "lib", "__fixtures__", name), "utf8"));
}

function createDeveloperSpacesApp() {
  const app = express();
  app.use("/developer-spaces/ingest/observed-runtime", express.raw({ type: "application/json", limit: "2mb" }));
  app.use(express.json());
  app.use("/developer-spaces", developerSpacesRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; developerKey?: string; body?: unknown } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    if (options.developerKey) headers["X-Station-Developer-Key"] = options.developerKey;

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

async function requestText(app: Express, method: string, path: string) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { method });
    return {
      status: response.status,
      contentType: response.headers.get("content-type") ?? "",
      body: await response.text(),
    };
  } finally {
    await close(server);
  }
}

function parseSseUpdate<T = any>(body: string) {
  const lines = body.split(/\r?\n/);
  const id = lines.find((line) => line.startsWith("id: "))?.slice(4) ?? null;
  const event = lines.find((line) => line.startsWith("event: "))?.slice(7) ?? null;
  const retry = lines.find((line) => line.startsWith("retry: "))?.slice(7) ?? null;
  const data = lines
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6))
    .join("\n");
  return {
    id,
    event,
    retry,
    data: JSON.parse(data) as T,
  };
}

function assertNoPolicySecretLeak(value: unknown) {
  const serialized = JSON.stringify(value);
  for (const marker of [
    "secret-provider-key",
    "private prompt text",
    "private archive excerpt",
    "owner-only chunk",
  ]) {
    assert.equal(serialized.includes(marker), false, `${marker} leaked into provider-policy observability`);
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

function stationSignature(input: { rawBody: string; apiKey: string; timestamp?: number }) {
  const timestamp = input.timestamp ?? Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", input.apiKey)
    .update(`${timestamp}.`)
    .update(Buffer.from(input.rawBody, "utf8"))
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

function stableJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableJsonValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, stableJsonValue(nested)])
  );
}

function webhookPayloadHash(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(stableJsonValue(payload))).digest("hex");
}

async function requestObservedRuntimeWebhook<TBody = any>(
  app: Express,
  envelope: unknown,
  options: {
    developerKey?: string;
    signingSecret?: string;
    webhookId?: string;
    signature?: string | null;
    timestamp?: number;
  } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const rawBody = JSON.stringify(envelope);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (options.developerKey) {
      headers["X-Station-Developer-Key"] = options.developerKey;
      if (options.signature !== null) {
        headers["X-Station-Signature"] = options.signature ?? stationSignature({
          rawBody,
          apiKey: options.signingSecret ?? options.developerKey,
          timestamp: options.timestamp,
        });
      }
    }
    if (options.webhookId) headers["X-Station-Webhook-Id"] = options.webhookId;

    const response = await fetch(`http://127.0.0.1:${address.port}/developer-spaces/ingest/observed-runtime`, {
      method: "POST",
      headers,
      body: rawBody,
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

class TestRateLimitProvider implements OperationalCacheProvider {
  readonly enabled = true;
  readonly kind = "test" as const;
  readonly values = new Map<string, unknown>();
  readonly ttls = new Map<string, number>();

  get keys() {
    return [...this.values.keys()];
  }

  async getJson<T>(key: string): Promise<T | null> {
    return this.values.has(key) ? this.values.get(key) as T : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    this.values.set(key, value);
    this.ttls.set(key, ttlSeconds);
  }

  async increment(key: string, ttlSeconds: number) {
    const next = Number(this.values.get(key) ?? 0) + 1;
    this.values.set(key, next);
    if (!this.ttls.has(key)) this.ttls.set(key, ttlSeconds);
    return next;
  }

  async deleteKeys(keys: string[]) {
    for (const key of keys) this.values.delete(key);
    return keys.length;
  }
}

class ThrowingRateLimitProvider extends TestRateLimitProvider {
  override async increment(_key: string, _ttlSeconds: number): Promise<number> {
    throw new Error("upstash secret do-not-leak");
  }
}

test("Developer Space provider policy blocks private archive context unless explicitly allowed", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createDeveloperSpacesApp();
  const previousNvidiaKey = process.env.NVIDIA_AI_API_KEY;
  const previousEmbeddingProfile = process.env.EMBEDDING_PROFILE_CODE;
  const previousEmbeddingDim = process.env.EMBEDDING_DIM;
  process.env.NVIDIA_AI_API_KEY = "nvidia-test-key";
  process.env.EMBEDDING_PROFILE_CODE = "station_free_1536";
  process.env.EMBEDDING_DIM = "1536";

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Policy Observatory",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.space.providerPolicy, "public_synthetic_only");
    const spaceId = created.body.space.id;

    const invalidPolicy = await requestJson(app, "PATCH", `/developer-spaces/${spaceId}`, {
      token: "owner-token",
      body: {
        providerPolicy: "raw_private_archive",
      },
    });
    assert.equal(invalidPolicy.status, 400);

    const nonOwnerPolicy = await requestJson(app, "PATCH", `/developer-spaces/${spaceId}`, {
      token: "other-token",
      body: {
        providerPolicy: "private_archive_allowed",
      },
    });
    assert.equal(nonOwnerPolicy.status, 403);

    const blocked = await requestJson(app, "POST", `/developer-spaces/${spaceId}/provider-policy/evaluate`, {
      token: "owner-token",
      body: {
        privateArchiveRequested: true,
        providerMode: "platform",
        providerKey: "secret-provider-key",
        prompt: "private prompt text",
        privateArchiveChunks: ["private archive excerpt", "owner-only chunk"],
      },
    });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.decision.allowed, false);
    assert.equal(blocked.body.decision.providerPolicy, "public_synthetic_only");
    assert.equal(blocked.body.decision.includePrivateArchive, false);
    assert.equal(blocked.body.decision.denialReason, "private_archive_requires_private_archive_allowed");
    assert.equal(blocked.body.decision.posture.selectedProviderRoute, "nvidia_openai_compatible");
    assert.equal(blocked.body.decision.posture.platformRoute.nvidiaConfigured, true);
    assert.equal(blocked.body.decision.posture.privateArchive.requested, true);
    assert.equal(blocked.body.decision.posture.privateArchive.permitted, false);
    assert.equal(blocked.body.decision.posture.privateArchive.gate, "denied_without_private_archive_allowed");
    assert.deepEqual(blocked.body.decision.posture.embeddingProfile, {
      profileCode: "station_free_1536",
      provider: "gemini",
      dimension: 1536,
      activeUse: "active_product_testing",
      rollbackProfile: {
        profileCode: "openai_1536",
        provider: "openai",
        dimension: 1536,
        status: "paid_or_rollback_assumption",
      },
    });

    const publicContextBlocked = await requestJson(app, "POST", `/developer-spaces/${spaceId}/provider-policy/evaluate`, {
      token: "owner-token",
      body: {
        requestedContext: "public_context",
      },
    });
    assert.equal(publicContextBlocked.status, 403);
    assert.equal(publicContextBlocked.body.decision.denialReason, "public_context_not_allowed");

    const updated = await requestJson(app, "PATCH", `/developer-spaces/${spaceId}`, {
      token: "owner-token",
      body: {
        providerPolicy: "private_archive_allowed",
      },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.space.providerPolicy, "private_archive_allowed");

    const publicDetail = await requestJson(app, "GET", "/developer-spaces/policy-observatory");
    assert.equal(publicDetail.status, 200);
    assert.equal(publicDetail.body.access, "public");
    assert.equal(publicDetail.body.space.providerPolicy, "public_synthetic_only");

    const ownerDetail = await requestJson(app, "GET", "/developer-spaces/policy-observatory", {
      token: "owner-token",
    });
    assert.equal(ownerDetail.status, 200);
    assert.equal(ownerDetail.body.access, "owner");
    assert.equal(ownerDetail.body.space.providerPolicy, "private_archive_allowed");

    const allowed = await requestJson(app, "POST", `/developer-spaces/${spaceId}/provider-policy/evaluate`, {
      token: "owner-token",
      body: {
        requestedContext: "private_archive",
        providerMode: "platform",
        providerKey: "secret-provider-key",
        prompt: "private prompt text",
        privateArchiveChunks: ["private archive excerpt"],
      },
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.decision.allowed, true);
    assert.equal(allowed.body.decision.includePrivateArchive, true);
    assert.equal(allowed.body.decision.providerPolicy, "private_archive_allowed");
    assert.equal(allowed.body.decision.posture.privateArchive.permitted, true);
    assert.equal(allowed.body.decision.posture.privateArchive.gate, "explicit_private_archive_allowed");

    const ownerByokPolicy = await requestJson(app, "PATCH", `/developer-spaces/${spaceId}`, {
      token: "owner-token",
      body: {
        providerPolicy: "owner_byok_only",
      },
    });
    assert.equal(ownerByokPolicy.status, 200);

    const ownerByokPlatformBlocked = await requestJson(app, "POST", `/developer-spaces/${spaceId}/provider-policy/evaluate`, {
      token: "owner-token",
      body: {
        requestedContext: "public_synthetic",
        providerMode: "platform",
      },
    });
    assert.equal(ownerByokPlatformBlocked.status, 403);
    assert.equal(ownerByokPlatformBlocked.body.decision.denialReason, "owner_byok_required");
    assert.equal(ownerByokPlatformBlocked.body.decision.posture.selectedProviderRoute, "nvidia_openai_compatible");

    const ownerByokAllowed = await requestJson(app, "POST", `/developer-spaces/${spaceId}/provider-policy/evaluate`, {
      token: "owner-token",
      body: {
        requestedContext: "public_synthetic",
        providerMode: "owner_byok",
      },
    });
    assert.equal(ownerByokAllowed.status, 200);
    assert.equal(ownerByokAllowed.body.decision.allowed, true);
    assert.equal(ownerByokAllowed.body.decision.posture.selectedProviderRoute, "owner_byok");

    const adminPolicy = await requestJson(app, "PATCH", `/developer-spaces/${spaceId}`, {
      token: "admin-token",
      body: {
        providerPolicy: "platform_allowed",
      },
    });
    assert.equal(adminPolicy.status, 200);
    assert.equal(adminPolicy.body.space.providerPolicy, "platform_allowed");

    const traces = {
      sessions: db.tables.ai_trace_sessions,
      events: db.tables.ai_trace_events,
    };
    assert.equal(traces.sessions.length, 5);
    assert.equal(traces.events.length, 5);
    assert.equal(traces.sessions.some((trace) => trace.metadata.providerPolicy === "private_archive_allowed"), true);
    assert.equal(traces.events.every((event) => event.payload.providerPolicy), true);
    assert.equal(traces.events.every((event) => event.payload.providerPosture), true);
    assertNoPolicySecretLeak(traces);
  } finally {
    if (previousNvidiaKey == null) {
      delete process.env.NVIDIA_AI_API_KEY;
    } else {
      process.env.NVIDIA_AI_API_KEY = previousNvidiaKey;
    }
    if (previousEmbeddingProfile == null) {
      delete process.env.EMBEDDING_PROFILE_CODE;
    } else {
      process.env.EMBEDDING_PROFILE_CODE = previousEmbeddingProfile;
    }
    if (previousEmbeddingDim == null) {
      delete process.env.EMBEDDING_DIM;
    } else {
      process.env.EMBEDDING_DIM = previousEmbeddingDim;
    }
    setSupabaseAdminForTests(null);
  }
});

test("Developer Spaces smoke covers creation, keying, ingestion, and public/owner reads", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Animus Field",
        description: "A live observatory for project state.",
        visibility: "public",
        visualisationType: "world_map",
      },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.space.slug, "animus-field");
    assert.equal(created.body.space.providerPolicy, "public_synthetic_only");
    assert.equal(created.body.space.visualisationType, "world_map");
    assert.equal(db.tables.developer_spaces[0].project_id, null);

    const spaceId = created.body.space.id;
    const secondSpaceBlocked = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Second Observatory",
        visibility: "private",
      },
    });
    assert.equal(secondSpaceBlocked.status, 403);
    assert.match(secondSpaceBlocked.body.error, /Developer Space limit/);

    const visualConfigUpdate = await requestJson(app, "PATCH", `/developer-spaces/${spaceId}`, {
      token: "owner-token",
      body: {
        visualisationType: "world_map",
        visualisationConfig: {
          zoneField: "room",
          maxZones: 6,
          staggerZones: false,
          publicFieldControls: {
            nodeMetricKeys: ["uptime", "accessToken", "raw"],
            eventDataKeys: ["zone", "confidence", "nested", "token", "password", "dbPassword", "rawPayload"],
            snapshotDataKeys: ["summary", "nested", "secretKey"],
          },
        },
      },
    });
    assert.equal(visualConfigUpdate.status, 200);
    assert.equal(visualConfigUpdate.body.space.visualisationType, "world_map");
    assert.equal(visualConfigUpdate.body.space.visualisationConfig.zoneField, "room");
    assert.equal(visualConfigUpdate.body.space.visualisationConfig.maxZones, 6);
    assert.deepEqual(visualConfigUpdate.body.space.visualisationConfig.publicFieldControls.nodeMetricKeys, [
      "uptime",
      "accessToken",
      "raw",
    ]);

    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${spaceId}/api-key`, {
      token: "owner-token",
    });

    assert.equal(apiKeyResponse.status, 201);
    assert.match(apiKeyResponse.body.apiKey, /^station_dev_/);
    assert.equal(apiKeyResponse.body.space.apiKeyLastFour, apiKeyResponse.body.apiKey.slice(-4));
    assert.equal(db.tables.developer_spaces[0].api_key_hash, hashDeveloperSpaceApiKey(apiKeyResponse.body.apiKey));
    assert.equal(db.tables.developer_space_ingestion_keys.length, 1);
    assert.equal(db.tables.developer_space_ingestion_keys[0].status, "active");
    assert.equal(db.tables.developer_space_ingestion_keys[0].key_hash, hashDeveloperSpaceApiKey(apiKeyResponse.body.apiKey));
    assert.equal(JSON.stringify(apiKeyResponse.body.space).includes("api_key_hash"), false);

    const nodeResponse = await requestJson(app, "POST", "/developer-spaces/ingest/nodes/animus-alpha/state", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        nodeName: "Animus Alpha",
        topologyType: "radial",
        fragmentCount: 144,
        selfSimilarityScore: 0.81,
        metrics: {
          uptime: 99.8,
          raw: { hidden: true },
          Authorization: "node-auth",
          accessToken: "node-access-token",
          xApiKey: "node-x-api-key",
        },
        sourceRefs: [" station:log:node ", "", "station:archive:alpha"],
      },
    });

    assert.equal(nodeResponse.status, 202);
    assert.equal(nodeResponse.body.node.externalId, "animus-alpha");
    assert.deepEqual(db.tables.developer_space_events[0].source_refs, ["station:log:node", "station:archive:alpha"]);
    assert.equal(typeof db.tables.developer_space_ingestion_keys[0].last_used_at, "string");

    const rejectedLargePayload = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "payload.too_large",
        eventData: { blob: "x".repeat(33_000) },
      },
    });
    assert.equal(rejectedLargePayload.status, 400);
    assert.equal(rejectedLargePayload.body.code, "developer_space_validation_failed");
    assert.equal(rejectedLargePayload.body.category, "validation");
    assert.equal(typeof rejectedLargePayload.body.details.fieldErrors.eventData[0], "string");

    const missingKey = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      body: {
        eventType: "missing.key",
      },
    });
    assert.equal(missingKey.status, 401);
    assert.deepEqual(missingKey.body, {
      error: "Missing Developer Space API key.",
      code: "developer_space_key_missing",
      category: "auth",
    });

    const privateEvent = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "debug.private",
        eventLabel: "Private operator note",
        eventData: { prompt: "owner-only" },
        visibility: "private",
      },
    });

    assert.equal(privateEvent.status, 202);

    const publicEvent = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "signal.detected",
        eventLabel: "Signal detected",
        nodeId: "animus-alpha",
        eventData: {
          zone: "North Array",
          confidence: 0.92,
          raw: { prompt: "owner-only" },
          rawPayload: "public-raw-payload",
          token: "secret-token",
          password: "public-password",
          accessToken: "public-access-token",
          Authorization: "Bearer public-auth",
          secretKey: "public-secret-key",
          dbPassword: "public-db-password",
          bearerToken: "public-bearer-token",
          xApiKey: "public-x-api-key",
          nested: {
            safe: "public-safe-value",
            refreshToken: "public-refresh-token",
            clientSecret: "public-client-secret",
            credentials: { username: "operator", password: "nested-password" },
            cookie: "public-cookie",
            setCookie: "public-set-cookie",
            sessionCookie: "public-session-cookie",
          },
        },
        similarityScore: 0.88,
        sourceRefs: ["station:log:signal"],
        visibility: "public",
      },
    });

    assert.equal(publicEvent.status, 202);
    assert.equal(publicEvent.body.event.externalNodeId, "animus-alpha");

    const snapshot = await requestJson(app, "POST", "/developer-spaces/ingest/snapshots", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        snapshotData: {
          summary: "Stable",
          load: 0.44,
          raw: { prompt: "owner-only" },
          secretKey: "snapshot-secret-key",
          nested: {
            safe: "snapshot-safe-value",
            setCookie: "snapshot-set-cookie",
            bearerToken: "snapshot-bearer-token",
          },
        },
        sourceRefs: ["station:snapshot:1"],
        visibility: "public",
      },
    });

    assert.equal(snapshot.status, 202);

    const unauthenticatedTemplate = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents/template`, {
      body: {
        role: "methodology",
        title: "Unauthenticated note",
      },
    });
    assert.equal(unauthenticatedTemplate.status, 401);

    const otherUserTemplate = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents/template`, {
      token: "other-token",
      body: {
        role: "methodology",
        title: "Other user note",
      },
    });
    assert.equal(otherUserTemplate.status, 403);

    const draftMethodology = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents/template`, {
      token: "owner-token",
      body: {
        role: "methodology",
        title: "Animus private method",
        body: "Draft-only calibration method with internal assumptions.",
      },
    });

    assert.equal(draftMethodology.status, 201);
    assert.equal(draftMethodology.body.link.role, "methodology");
    assert.equal(draftMethodology.body.link.linkVisibility, "owner");
    assert.equal(draftMethodology.body.document.status, "draft");
    assert.equal(draftMethodology.body.document.visibility, "private");
    assert.equal(db.tables.developer_space_documents.length, 1);
    assert.equal(db.tables.documents[0].source_id, spaceId);

    const publicFieldLog = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents/template`, {
      token: "owner-token",
      body: {
        role: "field_log",
        title: "Animus field log one",
        body: "Published field log for visitors.",
        linkVisibility: "public",
      },
    });

    assert.equal(publicFieldLog.status, 201);
    assert.equal(publicFieldLog.body.link.role, "field_log");
    assert.equal(publicFieldLog.body.link.linkVisibility, "public");
    assert.equal(publicFieldLog.body.document.status, "published");
    assert.equal(publicFieldLog.body.document.visibility, "public");

    const publicMethodology = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents/template`, {
      token: "owner-token",
      body: {
        role: "methodology",
        title: "Animus public methodology",
        body: "Published methodology for visitors.",
        linkVisibility: "public",
        sortOrder: 0,
      },
    });

    assert.equal(publicMethodology.status, 201);
    assert.equal(publicMethodology.body.link.role, "methodology");
    assert.equal(publicMethodology.body.link.linkVisibility, "public");
    assert.equal(publicMethodology.body.document.status, "published");
    assert.equal(publicMethodology.body.document.visibility, "public");

    const publicFinding = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents/template`, {
      token: "owner-token",
      body: {
        role: "finding",
        title: "Animus public milestone",
        body: "Published milestone finding for visitors.",
        linkVisibility: "public",
        sortOrder: 1,
      },
    });

    assert.equal(publicFinding.status, 201);
    assert.equal(publicFinding.body.link.role, "finding");
    assert.equal(publicFinding.body.link.linkVisibility, "public");
    assert.equal(publicFinding.body.document.status, "published");
    assert.equal(publicFinding.body.document.visibility, "public");

    const privateAttachBlocked = await requestJson(app, "POST", `/developer-spaces/${spaceId}/documents`, {
      token: "owner-token",
      body: {
        documentId: draftMethodology.body.document.id,
        role: "methodology",
        linkVisibility: "public",
      },
    });
    assert.equal(privateAttachBlocked.status, 400);

    const publicFieldLogRow = db.tables.documents.find((document) => document.id === publicFieldLog.body.document.id);
    assert.ok(publicFieldLogRow);
    publicFieldLogRow.status = "draft";
    publicFieldLogRow.visibility = "private";

    const hiddenPublicLinkDetail = await requestJson(app, "GET", "/developer-spaces/animus-field");
    assert.equal(hiddenPublicLinkDetail.status, 200);
    assert.equal(hiddenPublicLinkDetail.body.linkedDocuments.length, 2);
    assert.deepEqual(
      hiddenPublicLinkDetail.body.linkedDocuments.map((link: Row) => link.role).sort(),
      ["finding", "methodology"],
    );
    assert.equal(JSON.stringify(hiddenPublicLinkDetail.body).includes("Published field log"), false);

    publicFieldLogRow.status = "published";
    publicFieldLogRow.visibility = "public";

    const publicDetail = await requestJson(app, "GET", "/developer-spaces/animus-field");
    assert.equal(publicDetail.status, 200);
    assert.equal(publicDetail.body.access, "public");
    assert.equal(publicDetail.body.space.apiKeyLastFour, null);
    assert.equal(publicDetail.body.space.visualisationType, "world_map");
    assert.equal(publicDetail.body.space.visualisationConfig.zoneField, "room");
    assert.equal(publicDetail.body.space.visualisationConfig.maxZones, 6);
    assert.equal(publicDetail.body.nodes.length, 1);
    assert.deepEqual(publicDetail.body.nodes[0].metrics, { uptime: 99.8 });
    assert.equal(publicDetail.body.nodes[0].metrics.raw, undefined);
    assert.equal(publicDetail.body.nodes[0].metrics.accessToken, undefined);
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.summary, "Stable");
    assert.deepEqual(publicDetail.body.latestSnapshot.snapshotData.nested, { safe: "snapshot-safe-value" });
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.load, undefined);
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.raw, undefined);
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.secretKey, undefined);
    assert.equal(publicDetail.body.events.some((event: Row) => event.visibility === "private"), false);
    assert.equal(publicDetail.body.events.some((event: Row) => event.eventType === "signal.detected"), true);
    const publicSignal = publicDetail.body.events.find((event: Row) => event.eventType === "signal.detected");
    assert.deepEqual(publicSignal.eventData, {
      zone: "North Array",
      confidence: 0.92,
      nested: { safe: "public-safe-value" },
    });
    assert.equal(publicDetail.body.linkedDocuments.length, 3);
    assert.deepEqual(
      publicDetail.body.linkedDocuments.map((link: Row) => link.role).sort(),
      ["field_log", "finding", "methodology"],
    );
    assert.equal(publicDetail.body.linkedDocuments.some((link: Row) => link.document.title === "Animus field log one"), true);
    const publicText = JSON.stringify(publicDetail.body);
    assert.equal(publicText.includes("api_key_hash"), false);
    assert.equal(publicText.includes("Draft-only calibration method"), false);
    assert.equal(publicText.includes("Published field log"), true);
    assert.equal(publicText.includes("Published methodology"), true);
    assert.equal(publicText.includes("Published milestone"), true);
    for (const hidden of [
      "secret-token",
      "owner-only",
      "node-auth",
      "node-access-token",
      "node-x-api-key",
      "public-password",
      "public-access-token",
      "Bearer public-auth",
      "public-secret-key",
      "public-db-password",
      "public-raw-payload",
      "public-bearer-token",
      "public-x-api-key",
      "public-refresh-token",
      "public-client-secret",
      "nested-password",
      "public-cookie",
      "public-set-cookie",
      "public-session-cookie",
      "snapshot-secret-key",
      "snapshot-set-cookie",
      "snapshot-bearer-token",
    ]) {
      assert.equal(publicText.includes(hidden), false, `${hidden} leaked into public detail`);
    }
    assert.equal(publicText.includes("public-safe-value"), true);
    assert.equal(publicText.includes("snapshot-safe-value"), true);

    const memberDetail = await requestJson(app, "GET", "/developer-spaces/animus-field", {
      token: "other-token",
    });
    assert.equal(memberDetail.status, 200);
    assert.equal(memberDetail.body.access, "member");
    assert.deepEqual(memberDetail.body.nodes[0].metrics, publicDetail.body.nodes[0].metrics);
    assert.deepEqual(
      memberDetail.body.events.find((event: Row) => event.eventType === "signal.detected").eventData,
      publicSignal.eventData,
    );
    assert.deepEqual(memberDetail.body.latestSnapshot.snapshotData, publicDetail.body.latestSnapshot.snapshotData);

    const ownerDetail = await requestJson(app, "GET", "/developer-spaces/animus-field", {
      token: "owner-token",
    });

    assert.equal(ownerDetail.status, 200);
    assert.equal(ownerDetail.body.access, "owner");
    assert.equal(ownerDetail.body.space.apiKeyLastFour, apiKeyResponse.body.apiKey.slice(-4));
    assert.equal(ownerDetail.body.events.some((event: Row) => event.visibility === "private"), true);
    assert.equal(ownerDetail.body.nodes[0].metrics.raw.hidden, true);
    assert.equal(ownerDetail.body.nodes[0].metrics.accessToken, "node-access-token");
    assert.equal(ownerDetail.body.latestSnapshot.snapshotData.raw.prompt, "owner-only");
    assert.equal(ownerDetail.body.latestSnapshot.snapshotData.load, 0.44);
    assert.equal(ownerDetail.body.linkedDocuments.length, 4);
    assert.equal(ownerDetail.body.linkedDocuments.some((link: Row) => link.role === "methodology" && link.linkVisibility === "owner"), true);
    assert.equal(ownerDetail.body.linkedDocuments.some((link: Row) => link.role === "field_log" && link.linkVisibility === "public"), true);
    assert.equal(ownerDetail.body.linkedDocuments.some((link: Row) => link.role === "finding" && link.linkVisibility === "public"), true);
    const ownerText = JSON.stringify(ownerDetail.body);
    assert.equal(ownerText.includes("api_key_hash"), false);
    assert.equal(ownerText.includes("Draft-only calibration method"), true);
    for (const retained of [
      "node-auth",
      "node-access-token",
      "node-x-api-key",
      "public-password",
      "public-access-token",
      "Bearer public-auth",
      "public-secret-key",
      "public-db-password",
      "public-raw-payload",
      "public-bearer-token",
      "public-x-api-key",
      "public-refresh-token",
      "public-client-secret",
      "nested-password",
      "public-cookie",
      "public-set-cookie",
      "public-session-cookie",
      "snapshot-secret-key",
      "snapshot-set-cookie",
      "snapshot-bearer-token",
    ]) {
      assert.equal(ownerText.includes(retained), true, `${retained} missing from owner detail`);
    }

    const publicStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1");
    assert.equal(publicStream.status, 200);
    assert.match(publicStream.contentType, /text\/event-stream/);
    const publicSse = parseSseUpdate(publicStream.body);
    assert.equal(publicSse.event, "developer_space.update");
    assert.equal(publicSse.retry, "5000");
    assert.equal(typeof publicSse.id, "string");
    assert.equal(publicSse.data.kind, "detail");
    assert.equal(publicSse.data.detail.access, "public");
    assert.deepEqual(publicSse.data.detail.nodes[0].metrics, publicDetail.body.nodes[0].metrics);
    assert.deepEqual(
      publicSse.data.detail.events.find((event: Row) => event.eventType === "signal.detected").eventData,
      publicSignal.eventData,
    );
    assert.deepEqual(publicSse.data.detail.latestSnapshot.snapshotData, publicDetail.body.latestSnapshot.snapshotData);
    assert.equal(publicSse.data.detail.events.some((event: Row) => event.visibility === "private"), false);
    assert.equal(publicSse.data.detail.linkedDocuments.length, 3);
    assert.equal(publicSse.data.detail.linkedDocuments.some((link: Row) => link.role === "methodology"), true);
    assert.equal(publicSse.data.detail.linkedDocuments.some((link: Row) => link.role === "finding"), true);
    assert.equal(publicSse.data.detail.linkedDocuments.some((link: Row) => link.role === "field_log"), true);
    assert.equal(JSON.stringify(publicSse.data).includes("Draft-only calibration method"), false);
    assert.equal(JSON.stringify(publicSse.data).includes("public-db-password"), false);
    assert.equal(typeof publicSse.data.freshness.streamId, "string");

    const ownerStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1&access_token=owner-token");
    assert.equal(ownerStream.status, 200);
    const ownerSse = parseSseUpdate(ownerStream.body);
    assert.equal(ownerSse.data.detail.access, "owner");
    assert.equal(ownerSse.data.detail.events.some((event: Row) => event.visibility === "private"), true);
    assert.equal(ownerSse.data.detail.linkedDocuments.length, 4);
    assert.equal(JSON.stringify(ownerSse.data).includes("public-db-password"), true);
    assert.equal(JSON.stringify(ownerSse.data).includes("Draft-only calibration method"), true);
    assert.equal(JSON.stringify(ownerSse.data).includes("api_key_hash"), false);

    const otherUsageBlocked = await requestJson(app, "GET", `/developer-spaces/${spaceId}/usage`, {
      token: "other-token",
    });
    assert.equal(otherUsageBlocked.status, 403);

    const usage = await requestJson(app, "GET", `/developer-spaces/${spaceId}/usage`, {
      token: "owner-token",
    });
    assert.equal(usage.status, 200);
    assert.equal(usage.body.usage.counters.nodes, 1);
    assert.equal(usage.body.usage.counters.events, 3);
    assert.equal(usage.body.usage.counters.snapshots, 1);
    assert.equal(usage.body.usage.counters.publicReads, 4);
    assert.equal(usage.body.usage.counters.exports, 0);
    assert.equal(usage.body.usage.limits.events, 100000);
    assert.equal(usage.body.usage.warningLevel, "ok");
    assert.equal(usage.body.usage.counters.storageBytes > 0, true);
    assert.equal(db.tables.developer_space_usage[0].project_id, null);

    const eventCountBeforeQuota = db.tables.developer_space_events.length;
    db.tables.developer_space_usage[0].ingested_events_count = 100000;
    const quotaBlocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "quota.blocked",
        eventData: { privateToken: "must-not-leak" },
      },
    });
    assert.equal(quotaBlocked.status, 429);
    assert.equal(quotaBlocked.body.code, "quota_exceeded");
    assert.equal(quotaBlocked.body.category, "quota");
    assert.equal(quotaBlocked.body.resource, "developer_space_events");
    assert.equal(quotaBlocked.body.limit, 100000);
    assert.equal(quotaBlocked.body.used, 100000);
    assert.doesNotMatch(JSON.stringify(quotaBlocked.body), /must-not-leak/);
    assert.equal(db.tables.developer_space_events.length, eventCountBeforeQuota);

    db.tables.profiles.find((row) => row.id === "owner-user")!.tier = "institutional";
    const institutionalAllowed = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "quota.allowed.institutional",
      },
    });
    assert.equal(institutionalAllowed.status, 202);
    assert.equal(db.tables.developer_space_events.length, eventCountBeforeQuota + 1);
    db.tables.profiles.find((row) => row.id === "owner-user")!.tier = "canon";
    db.tables.developer_space_usage[0].ingested_events_count = 3;

    const rotatedKeyResponse = await requestJson(app, "POST", `/developer-spaces/${spaceId}/api-key`, {
      token: "owner-token",
    });
    assert.equal(rotatedKeyResponse.status, 201);
    assert.notEqual(rotatedKeyResponse.body.apiKey, apiKeyResponse.body.apiKey);
    assert.equal(db.tables.developer_space_ingestion_keys[0].status, "revoked");
    assert.equal(db.tables.developer_space_ingestion_keys[1].status, "active");

    const oldKeyBlocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "old.key.blocked",
      },
    });
    assert.equal(oldKeyBlocked.status, 401);
    assert.equal(oldKeyBlocked.body.code, "developer_space_key_invalid");
    assert.equal(oldKeyBlocked.body.category, "auth");

    const revoked = await requestJson(app, "POST", `/developer-spaces/${spaceId}/api-key/revoke`, {
      token: "owner-token",
    });
    assert.equal(revoked.status, 200);
    assert.equal(revoked.body.space.apiKeyLastFour, null);
    assert.equal(db.tables.developer_spaces[0].api_key_hash, null);
    assert.equal(db.tables.developer_space_ingestion_keys[1].status, "revoked");

    const revokedKeyBlocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: rotatedKeyResponse.body.apiKey,
      body: {
        eventType: "revoked.key.blocked",
      },
    });
    assert.equal(revokedKeyBlocked.status, 401);
    assert.equal(revokedKeyBlocked.body.code, "developer_space_key_invalid");
    assert.equal(revokedKeyBlocked.body.category, "auth");

    db.tables.developer_spaces[0].visibility = "private";
    const blockedPrivateStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1");
    assert.equal(blockedPrivateStream.status, 403);
    const ownerPrivateStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1&access_token=owner-token");
    assert.equal(ownerPrivateStream.status, 200);
    assert.equal(parseSseUpdate(ownerPrivateStream.body).data.detail.access, "owner");
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("Developer Space agent registry and previews are owner-scoped and sanitized", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createDeveloperSpacesApp();
  const rawUuid = "123e4567-e89b-12d3-a456-426614174000";

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Agent Registry Observatory",
        description: `Owner brief with token=owner-secret and ${rawUuid}`,
        visibility: "public",
        providerPolicy: "private_archive_allowed",
      },
    });
    assert.equal(created.status, 201);
    const spaceId = created.body.space.id;

    db.insertRow("developer_space_nodes", {
      developer_space_id: spaceId,
      external_id: "node-secret-external-id",
      node_name: `Primary node token=node-secret ${rawUuid}`,
      topology_type: "radial",
      fragment_count: 12,
      metrics: {
        rawPayload: "raw node payload should not appear",
        token: "node-token-should-not-appear",
      },
      last_event_at: "2026-06-22T04:00:00.000Z",
    });
    db.insertRow("developer_space_events", {
      developer_space_id: spaceId,
      node_id: null,
      external_node_id: "node-secret-external-id",
      event_type: "deploy.private",
      event_label: `Deploy signal Bearer event-secret ${rawUuid}`,
      event_data: {
        rawPayload: "private event payload should not appear",
        token: "event-token-should-not-appear",
      },
      similarity_score: 0.8,
      source_refs: ["private:event:source"],
      provenance: "api",
      visibility: "private",
      occurred_at: "2026-06-22T04:05:00.000Z",
    });
    db.insertRow("developer_space_snapshots", {
      developer_space_id: spaceId,
      snapshot_data: {
        rawPrompt: "private snapshot prompt should not appear",
        publicSummary: "runtime stable",
      },
      source_refs: ["private:snapshot:source"],
      provenance: "api",
      visibility: "private",
      occurred_at: "2026-06-22T04:06:00.000Z",
    });
    db.insertRow("developer_space_observed_runtime_context", {
      developer_space_id: spaceId,
      context_type: "zone",
      external_id: "zone-private-external-id",
      source_ref: "private:context:source",
      payload: {
        privatePrompt: "private context prompt should not appear",
        token: "context-token-should-not-appear",
      },
      provenance: "api",
      occurred_at: "2026-06-22T04:07:00.000Z",
    });
    const privateDoc = db.insertRow("documents", {
      author_user_id: "owner-user",
      title: `Private evidence api_key=hidden-test-key ${rawUuid}`,
      slug: "private-agent-evidence",
      body: "private document body should not appear in agent preview",
      status: "draft",
      visibility: "private",
    });
    db.insertRow("developer_space_documents", {
      developer_space_id: spaceId,
      document_id: privateDoc.id,
      owner_user_id: "owner-user",
      document_role: "methodology",
      link_visibility: "owner",
      sort_order: 0,
    });

    const anonymousRegistry = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions`);
    assert.equal(anonymousRegistry.status, 401);

    const nonOwnerRegistry = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions`, {
      token: "other-token",
    });
    assert.equal(nonOwnerRegistry.status, 403);

    const ownerRegistry = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions`, {
      token: "owner-token",
    });
    assert.equal(ownerRegistry.status, 200);
    assert.equal(ownerRegistry.body.boundary.autonomousExecution, false);
    assert.equal(ownerRegistry.body.boundary.mutatesDeveloperSpace, false);
    assert.equal(ownerRegistry.body.actions.some((entry: Row) => entry.action === "read_developer_space_brief" && entry.futureLane === false), true);
    assert.equal(ownerRegistry.body.actions.some((entry: Row) => entry.action === "run_job" && entry.futureLane === true), true);

    const adminRegistry = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions`, {
      token: "admin-token",
    });
    assert.equal(adminRegistry.status, 200);

    const brief = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "read_developer_space_brief" },
    });
    assert.equal(brief.status, 200);
    assert.equal(brief.body.status, "previewed");
    assert.equal(brief.body.futureLane, false);
    assert.equal(brief.body.requiresConfirmation, false);

    const runtime = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "read_observed_runtime_status" },
    });
    assert.equal(runtime.status, 200);
    assert.equal(runtime.body.status, "previewed");
    assert.equal(runtime.body.sections.some((section: Row) => section.title === "Recent event labels"), true);

    const evidence = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "read_evidence_path" },
    });
    assert.equal(evidence.status, 200);
    assert.equal(evidence.body.status, "previewed");
    assert.match(JSON.stringify(evidence.body), /\[id\]|\[redacted\]/);

    const draft = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "draft_project_update" },
    });
    assert.equal(draft.status, 200);
    assert.equal(draft.body.status, "previewed");
    assert.equal(draft.body.requiresConfirmation, true);
    assert.equal(draft.body.futureLane, false);

    const previewText = JSON.stringify({ brief: brief.body, runtime: runtime.body, evidence: evidence.body, draft: draft.body });
    for (const hidden of [
      rawUuid,
      "owner-secret",
      "node-secret",
      "event-secret",
      "hidden-test-key",
      "raw node payload should not appear",
      "node-token-should-not-appear",
      "private event payload should not appear",
      "event-token-should-not-appear",
      "private snapshot prompt should not appear",
      "private context prompt should not appear",
      "context-token-should-not-appear",
      "private document body should not appear",
      "node-secret-external-id",
      "zone-private-external-id",
      "private:event:source",
      "private:snapshot:source",
      "private:context:source",
    ]) {
      assert.equal(previewText.includes(hidden), false, `${hidden} leaked into agent preview`);
    }
    assert.equal(db.tables.ai_trace_sessions.length, 0);
    assert.equal(db.tables.ai_trace_events.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Developer Space agent future and unsupported actions reject without side effects", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Agent Future Lane",
        visibility: "private",
      },
    });
    assert.equal(created.status, 201);
    const spaceId = created.body.space.id;

    const nonOwnerFuture = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "other-token",
      body: { action: "run_job" },
    });
    assert.equal(nonOwnerFuture.status, 403);

    const runJob = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "run_job", input: { command: "npm test", token: "secret-token" } },
    });
    assert.equal(runJob.status, 200);
    assert.equal(runJob.body.status, "requires_future_lane");
    assert.equal(runJob.body.futureLane, true);
    assert.equal(runJob.body.requiresConfirmation, true);

    const rotateKey = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "rotate_ingestion_key" },
    });
    assert.equal(rotateKey.status, 200);
    assert.equal(rotateKey.body.status, "requires_future_lane");

    const signingSecret = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "create_webhook_signing_secret" },
    });
    assert.equal(signingSecret.status, 200);
    assert.equal(signingSecret.body.status, "requires_future_lane");

    const unsupported = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/preview`, {
      token: "owner-token",
      body: { action: "delete_everything" },
    });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.status, "unsupported_action");
    assert.equal(unsupported.body.futureLane, false);
    assert.equal(unsupported.body.sections[0].items.some((item: Row) => item.title === "publish_to_page" && item.status === "requires_future_lane"), true);

    const responseText = JSON.stringify({ runJob: runJob.body, rotateKey: rotateKey.body, signingSecret: signingSecret.body, unsupported: unsupported.body });
    assert.doesNotMatch(responseText, /secret-token|npm test/);
    assert.equal(db.tables.developer_space_ingestion_keys.length, 0);
    assert.equal(db.tables.developer_space_webhook_signing_secrets.length, 0);
    assert.equal(db.tables.developer_space_events.length, 0);
    assert.equal(db.tables.developer_space_nodes.length, 0);
    assert.equal(db.tables.developer_space_snapshots.length, 0);
    assert.equal(db.tables.ai_trace_sessions.length, 0);
    assert.equal(db.tables.ai_trace_events.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Developer Space agent confirmations record owner intent without execution", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Agent Confirmation Lane",
        visibility: "private",
      },
    });
    assert.equal(created.status, 201);
    const spaceId = created.body.space.id;

    const anonymousList = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions/confirmations`);
    assert.equal(anonymousList.status, 401);

    const nonOwnerList = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "other-token",
    });
    assert.equal(nonOwnerList.status, 403);

    const previewOnly = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "owner-token",
      body: { action: "draft_project_update" },
    });
    assert.equal(previewOnly.status, 400);
    assert.equal(previewOnly.body.code, "developer_space_agent_confirmation_not_required");

    const unsupported = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "owner-token",
      body: { action: "delete_everything" },
    });
    assert.equal(unsupported.status, 400);
    assert.equal(unsupported.body.code, "developer_space_agent_confirmation_unsupported_action");
    assert.equal(db.tables.developer_space_agent_confirmations.length, 0);

    const publish = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "owner-token",
      body: {
        action: "publish_to_page",
        expiresInMinutes: 30,
        input: { rawPrompt: "publish this private owner prompt", privateMarker: "fixture-sensitive-marker" },
      },
    });
    assert.equal(publish.status, 201);
    assert.equal(publish.body.executionAvailable, false);
    assert.equal(publish.body.confirmation.action, "publish_to_page");
    assert.equal(publish.body.confirmation.status, "pending");
    assert.equal(typeof publish.body.confirmation.previewHash, "string");
    assert.equal(publish.body.confirmation.sanitizedPayload.executionAvailable, false);
    assert.equal(publish.body.confirmation.sanitizedPayload.mutationAvailable, false);
    assert.doesNotMatch(JSON.stringify(publish.body), /private owner prompt|fixture-sensitive-marker|rawPrompt/);

    const adminRunJob = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "admin-token",
      body: { action: "run_job" },
    });
    assert.equal(adminRunJob.status, 201);
    assert.equal(adminRunJob.body.confirmation.ownerUserId, "owner-user");

    const ownerList = await requestJson(app, "GET", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "owner-token",
    });
    assert.equal(ownerList.status, 200);
    assert.equal(ownerList.body.confirmations.length, 2);
    assert.deepEqual(
      ownerList.body.confirmations.map((confirmation: Row) => confirmation.action).sort(),
      ["publish_to_page", "run_job"],
    );

    const nonOwnerApprove = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations/${publish.body.confirmation.id}/approve`, {
      token: "other-token",
    });
    assert.equal(nonOwnerApprove.status, 403);

    const approved = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations/${publish.body.confirmation.id}/approve`, {
      token: "owner-token",
    });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.confirmation.status, "approved");
    assert.equal(approved.body.executionAvailable, false);
    assert.match(approved.body.message, /Execution is unavailable/);

    const approveAgain = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations/${publish.body.confirmation.id}/approve`, {
      token: "owner-token",
    });
    assert.equal(approveAgain.status, 409);
    assert.equal(approveAgain.body.code, "developer_space_agent_confirmation_not_pending");

    const rotate = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations`, {
      token: "owner-token",
      body: { action: "rotate_ingestion_key" },
    });
    assert.equal(rotate.status, 201);

    const cancelled = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations/${rotate.body.confirmation.id}/cancel`, {
      token: "owner-token",
    });
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.confirmation.status, "cancelled");
    assert.equal(cancelled.body.executionAvailable, false);

    const cancelledAgain = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations/${rotate.body.confirmation.id}/cancel`, {
      token: "owner-token",
    });
    assert.equal(cancelledAgain.status, 200);
    assert.equal(cancelledAgain.body.confirmation.status, "cancelled");

    const expired = db.insertRow("developer_space_agent_confirmations", {
      developer_space_id: spaceId,
      owner_user_id: "owner-user",
      action: "create_webhook_signing_secret",
      status: "pending",
      summary: "Expired signing-secret confirmation.",
      preview_hash: "expired-preview-hash",
      sanitized_payload: { action: "create_webhook_signing_secret", executionAvailable: false },
      requested_at: "2026-05-01T00:00:00.000Z",
      expires_at: "2026-05-01T00:05:00.000Z",
    });

    const approveExpired = await requestJson(app, "POST", `/developer-spaces/${spaceId}/agent/actions/confirmations/${expired.id}/approve`, {
      token: "owner-token",
    });
    assert.equal(approveExpired.status, 409);
    assert.equal(approveExpired.body.code, "developer_space_agent_confirmation_expired");
    assert.equal(approveExpired.body.confirmation.status, "expired");

    const responseText = JSON.stringify({
      publish: publish.body,
      adminRunJob: adminRunJob.body,
      approved: approved.body,
      cancelled: cancelled.body,
      approveExpired: approveExpired.body,
      rows: db.tables.developer_space_agent_confirmations,
    });
    assert.doesNotMatch(responseText, /fixture-sensitive-marker|private owner prompt|rawPrompt|npm test/);
    assert.equal(db.tables.developer_space_agent_confirmations.length, 4);
    assert.equal(db.tables.developer_space_ingestion_keys.length, 0);
    assert.equal(db.tables.developer_space_webhook_signing_secrets.length, 0);
    assert.equal(db.tables.developer_space_events.length, 0);
    assert.equal(db.tables.developer_space_nodes.length, 0);
    assert.equal(db.tables.developer_space_snapshots.length, 0);
    assert.equal(db.tables.documents.length, 0);
    assert.equal(db.tables.ai_trace_sessions.length, 0);
    assert.equal(db.tables.ai_trace_events.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Developer Space named ingestion keys support smoke keys without rotating active keys", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Named Key Smoke",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);
    const spaceId = created.body.space.id;

    const legacy = await requestJson(app, "POST", `/developer-spaces/${spaceId}/api-key`, {
      token: "owner-token",
    });
    assert.equal(legacy.status, 201);
    const legacyKeyId = db.tables.developer_space_ingestion_keys[0].id;

    const nonOwnerCreate = await requestJson(app, "POST", `/developer-spaces/${spaceId}/ingestion-keys`, {
      token: "other-token",
      body: { label: "Other user key" },
    });
    assert.equal(nonOwnerCreate.status, 403);

    const named = await requestJson(app, "POST", `/developer-spaces/${spaceId}/ingestion-keys`, {
      token: "owner-token",
      body: { label: "PR130 smoke operator" },
    });
    assert.equal(named.status, 201);
    assert.match(named.body.apiKey, /^station_dev_/);
    assert.equal(named.body.key.label, "PR130 smoke operator");
    assert.equal(named.body.key.status, "active");
    assert.equal(named.body.key.keyLastFour, named.body.apiKey.slice(-4));
    assert.equal(JSON.stringify(named.body.key).includes("key_hash"), false);
    assert.equal(JSON.stringify(named.body.key).includes(hashDeveloperSpaceApiKey(named.body.apiKey)), false);
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === legacyKeyId)!.status, "active");

    const adminNamed = await requestJson(app, "POST", `/developer-spaces/${spaceId}/ingestion-keys`, {
      token: "admin-token",
      body: { label: "Admin support key" },
    });
    assert.equal(adminNamed.status, 201);
    assert.equal(adminNamed.body.key.label, "Admin support key");

    const listed = await requestJson(app, "GET", `/developer-spaces/${spaceId}/ingestion-keys`, {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);
    assert.equal(listed.body.keys.length, 3);
    assert.deepEqual(
      listed.body.keys.map((key: Row) => key.label).sort(),
      ["Admin support key", "Default ingestion key", "PR130 smoke operator"],
    );
    const listedText = JSON.stringify(listed.body);
    assert.equal(listedText.includes(legacy.body.apiKey), false);
    assert.equal(listedText.includes(named.body.apiKey), false);
    assert.equal(listedText.includes(adminNamed.body.apiKey), false);
    assert.equal(listedText.includes(hashDeveloperSpaceApiKey(named.body.apiKey)), false);
    assert.equal(listedText.includes("key_hash"), false);

    const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
      observedRuntimeFixture("observed-runtime-canonical.json"),
      { developerSpaceId: spaceId },
    );
    const envelope = {
      schema: "station.observed_runtime.webhook.v1",
      deliveryId: "named-key-smoke-001",
      source: {
        id: "synthetic-observed-runtime",
        runtimeHostedBy: "external",
        stationRole: "observer",
      },
      observedAt: "2026-06-20T10:15:00.000Z",
      payload: bridge.importPayload,
    };

    const activeNamedAccepted = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: named.body.apiKey,
      webhookId: "named-key-smoke-001",
    });
    assert.equal(activeNamedAccepted.status, 202);
    assert.equal(activeNamedAccepted.body.accepted, true);
    assert.equal(typeof db.tables.developer_space_ingestion_keys.find((row) => row.id === named.body.key.id)!.last_used_at, "string");

    const otherSpace = await requestJson(app, "POST", "/developer-spaces", {
      token: "admin-token",
      body: {
        projectName: "Other Named Key Space",
        visibility: "private",
      },
    });
    assert.equal(otherSpace.status, 201);
    const otherSpaceKey = await requestJson(app, "POST", `/developer-spaces/${otherSpace.body.space.id}/ingestion-keys`, {
      token: "admin-token",
      body: { label: "Other space key" },
    });
    assert.equal(otherSpaceKey.status, 201);

    const crossSpaceRevoke = await requestJson(app, "POST", `/developer-spaces/${spaceId}/ingestion-keys/${otherSpaceKey.body.key.id}/revoke`, {
      token: "owner-token",
    });
    assert.equal(crossSpaceRevoke.status, 404);
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === otherSpaceKey.body.key.id)!.status, "active");

    const targetedRevoke = await requestJson(app, "POST", `/developer-spaces/${spaceId}/ingestion-keys/${named.body.key.id}/revoke`, {
      token: "owner-token",
    });
    assert.equal(targetedRevoke.status, 200);
    assert.equal(targetedRevoke.body.key.status, "revoked");
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === named.body.key.id)!.status, "revoked");
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === legacyKeyId)!.status, "active");
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === adminNamed.body.key.id)!.status, "active");

    const revokedNamedBlocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: named.body.apiKey,
      body: { eventType: "revoked.named.blocked" },
    });
    assert.equal(revokedNamedBlocked.status, 401);
    assert.equal(revokedNamedBlocked.body.code, "developer_space_key_invalid");

    const adminNamedStillActive = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: adminNamed.body.apiKey,
      body: { eventType: "admin.named.active" },
    });
    assert.equal(adminNamedStillActive.status, 202);

    const legacyRotate = await requestJson(app, "POST", `/developer-spaces/${spaceId}/api-key`, {
      token: "owner-token",
    });
    assert.equal(legacyRotate.status, 201);
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === legacyKeyId)!.status, "revoked");
    assert.equal(db.tables.developer_space_ingestion_keys.find((row) => row.id === adminNamed.body.key.id)!.status, "revoked");
    assert.equal(db.tables.developer_space_ingestion_keys.at(-1)!.status, "active");

    const postRotateAdminBlocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: adminNamed.body.apiKey,
      body: { eventType: "legacy.rotate.revoked.named" },
    });
    assert.equal(postRotateAdminBlocked.status, 401);
    assert.equal(postRotateAdminBlocked.body.code, "developer_space_key_invalid");

    const ownerDetail = await requestJson(app, "GET", "/developer-spaces/named-key-smoke", {
      token: "owner-token",
    });
    assert.equal(ownerDetail.status, 200);
    const ownerDetailText = JSON.stringify(ownerDetail.body);
    assert.equal(ownerDetailText.includes(named.body.apiKey), false);
    assert.equal(ownerDetailText.includes(adminNamed.body.apiKey), false);
    assert.equal(ownerDetailText.includes(hashDeveloperSpaceApiKey(adminNamed.body.apiKey)), false);
    assert.equal(ownerDetailText.includes("key_hash"), false);
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("Developer Space import persists observed runtime classifications with existing key auth", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Observed Runtime Bridge",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);

    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
      observedRuntimeFixture("observed-runtime-canonical.json"),
      { developerSpaceId: created.body.space.id },
    );
    assert.equal(bridge.auth.requiredHeader, "X-Station-Developer-Key");
    assert.equal(bridge.importPayload.supportingContext.length, 4);
    assert.equal(bridge.unmapped.zones.length, 0);

    const missingKey = await requestJson(app, "POST", bridge.route, {
      body: bridge.importPayload,
    });
    assert.equal(missingKey.status, 401);
    assert.equal(missingKey.body.category, "auth");
    assert.doesNotMatch(JSON.stringify(missingKey.body), /fixture-secret|fixture-private|owner-visible|member-visible/);

    const overexposed = clone(bridge.importPayload);
    overexposed.events[0].eventData = {
      ...overexposed.events[0].eventData,
      secretToken: "fixture-secret-overexposed",
    };
    overexposed.events[0].fieldClassifications = {
      ...overexposed.events[0].fieldClassifications,
      secretToken: "public",
    };
    overexposed.supportingContext[0].payload = {
      ...overexposed.supportingContext[0].payload,
      secretAccessToken: "fixture-secret-context-overexposed",
    };
    overexposed.supportingContext[0].fieldClassifications = {
      ...overexposed.supportingContext[0].fieldClassifications,
      secretAccessToken: "public",
    };
    const overexposedRejected = await requestJson(app, "POST", bridge.route, {
      developerKey: apiKeyResponse.body.apiKey,
      body: overexposed,
    });
    assert.equal(overexposedRejected.status, 400);
    assert.equal(overexposedRejected.body.code, "developer_space_observed_runtime_classification_failed");
    assert.doesNotMatch(JSON.stringify(overexposedRejected.body), /fixture-secret-overexposed|fixture-secret-context-overexposed/);

    const classifiedWithSecret = clone(bridge.importPayload);
    classifiedWithSecret.events[0].eventData = {
      ...classifiedWithSecret.events[0].eventData,
      secretToken: "fixture-secret-should-not-persist",
    };
    classifiedWithSecret.events[0].fieldClassifications = {
      ...classifiedWithSecret.events[0].fieldClassifications,
      secretToken: "secret",
    };
    classifiedWithSecret.supportingContext[0].payload = {
      ...classifiedWithSecret.supportingContext[0].payload,
      secretAccessToken: "fixture-secret-context-should-not-persist",
    };
    classifiedWithSecret.supportingContext[0].fieldClassifications = {
      ...classifiedWithSecret.supportingContext[0].fieldClassifications,
      secretAccessToken: "secret",
    };
    const imported = await requestJson(app, "POST", bridge.route, {
      developerKey: apiKeyResponse.body.apiKey,
      body: classifiedWithSecret,
    });
    assert.equal(imported.status, 202);
    assert.deepEqual(imported.body.imported, {
      nodes: 2,
      events: 1,
      snapshots: 1,
      supportingContext: 4,
    });
    assert.doesNotMatch(JSON.stringify(db.tables.developer_space_events), /fixture-secret-should-not-persist/);
    assert.doesNotMatch(JSON.stringify(db.tables.developer_space_observed_runtime_context), /fixture-secret-context-should-not-persist/);
    assert.equal(db.tables.developer_space_events[0].observed_runtime_classifications.fields.memberSignal, "member");
    assert.equal(db.tables.developer_space_events[0].observed_runtime_classifications.fields.secretToken, undefined);
    assert.equal(db.tables.developer_space_snapshots[0].observed_runtime_classifications.fields.privateMemoryTrace, "private");
    assert.equal(db.tables.developer_space_observed_runtime_context.length, 4);
    assert.equal(db.tables.developer_space_observed_runtime_context[0].observed_runtime_classifications.fields.memberDensityBand, "member");
    assert.equal(db.tables.developer_space_observed_runtime_context[0].observed_runtime_classifications.fields.secretAccessToken, undefined);

    const publicDetail = await requestJson(app, "GET", "/developer-spaces/observed-runtime-bridge");
    assert.equal(publicDetail.status, 200);
    assert.equal(publicDetail.body.access, "public");
    assert.equal(publicDetail.body.nodes.length, 2);
    assert.deepEqual(publicDetail.body.nodes[0].metrics, { publicState: "stable" });
    assert.equal(publicDetail.body.events[0].eventType, "zone_balance");
    assert.deepEqual(publicDetail.body.events[0].eventData, {
      publicSignal: "world gate reached balanced state",
    });
    assert.deepEqual(publicDetail.body.latestSnapshot.snapshotData, {
      publicSummary: "Synthetic runtime is observable but externally hosted.",
    });
    assert.deepEqual(publicDetail.body.supportingContext[0].payload, {
      id: "zone-crossroads",
      name: "Crossroads",
      publicOccupancy: 18,
    });

    const memberDetail = await requestJson(app, "GET", "/developer-spaces/observed-runtime-bridge", {
      token: "other-token",
    });
    assert.equal(memberDetail.status, 200);
    assert.deepEqual(memberDetail.body.nodes[0].metrics, {
      publicState: "stable",
      memberCohort: "alpha-watchers",
    });
    assert.deepEqual(memberDetail.body.events[0].eventData, {
      publicSignal: "world gate reached balanced state",
      memberSignal: "member-visible zone pulse",
    });
    assert.deepEqual(memberDetail.body.latestSnapshot.snapshotData, {
      publicSummary: "Synthetic runtime is observable but externally hosted.",
      memberEconomy: "credits stable in synthetic fixture",
    });
    assert.deepEqual(memberDetail.body.supportingContext[0].payload, {
      id: "zone-crossroads",
      name: "Crossroads",
      publicOccupancy: 18,
      memberDensityBand: "medium",
    });

    const ownerDetail = await requestJson(app, "GET", "/developer-spaces/observed-runtime-bridge", {
      token: "owner-token",
    });
    assert.equal(ownerDetail.status, 200);
    assert.deepEqual(ownerDetail.body.nodes[0].metrics, {
      publicState: "stable",
      memberCohort: "alpha-watchers",
      ownerShard: "world-gate-owner-shard",
      privateTrace: "fixture-private-node-trace",
    });
    assert.deepEqual(ownerDetail.body.events[0].eventData, {
      publicSignal: "world gate reached balanced state",
      memberSignal: "member-visible zone pulse",
      ownerNote: "owner-visible synthetic threshold",
      privateRuntimeTrace: "fixture-private-event-trace",
    });
    assert.deepEqual(ownerDetail.body.latestSnapshot.snapshotData, {
      publicSummary: "Synthetic runtime is observable but externally hosted.",
      memberEconomy: "credits stable in synthetic fixture",
      ownerDebug: "owner-safe fixture readback note",
      privateMemoryTrace: "fixture-private-snapshot-trace",
    });
    assert.deepEqual(ownerDetail.body.supportingContext[0].payload, {
      id: "zone-crossroads",
      name: "Crossroads",
      publicOccupancy: 18,
      memberDensityBand: "medium",
      privateModerationNote: "fixture-private-zone-note",
    });

    const publicStream = await requestText(app, "GET", "/developer-spaces/observed-runtime-bridge/stream?once=1");
    assert.equal(publicStream.status, 200);
    const publicSse = parseSseUpdate(publicStream.body);
    assert.deepEqual(publicSse.data.detail.nodes[0].metrics, publicDetail.body.nodes[0].metrics);
    assert.deepEqual(publicSse.data.detail.latestSnapshot.snapshotData, publicDetail.body.latestSnapshot.snapshotData);
    assert.deepEqual(publicSse.data.detail.supportingContext[0].payload, publicDetail.body.supportingContext[0].payload);

    const publicText = JSON.stringify({ public: publicDetail.body, sse: publicSse.data });
    assert.doesNotMatch(publicText, /fixture-secret|fixture-private|owner-visible|member-visible|alpha-watchers|owner-shard|fixture-owner/);
    const memberText = JSON.stringify(memberDetail.body);
    assert.doesNotMatch(memberText, /fixture-secret|fixture-private|owner-visible|owner-shard|fixture-owner/);
    const ownerText = JSON.stringify(ownerDetail.body);
    assert.match(ownerText, /fixture-private-node-trace/);
    assert.match(ownerText, /fixture-private-zone-note/);
    assert.match(ownerText, /owner-visible synthetic threshold/);
    assert.doesNotMatch(ownerText, /fixture-secret|secretToken|secretApiKey|secretCookie|secretAccessToken/);
    for (const response of [publicDetail.body, memberDetail.body, ownerDetail.body, publicSse.data]) {
      assert.equal(JSON.stringify(response).includes("observed_runtime_classifications"), false);
    }
  } finally {
    setSupabaseAdminForTests(null);
    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  }
});

test("Observed runtime webhook ingress uses key auth and idempotent import receipts", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Observed Runtime Webhook",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);

    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
      observedRuntimeFixture("observed-runtime-canonical.json"),
      { developerSpaceId: created.body.space.id },
    );
    const envelope = {
      schema: "station.observed_runtime.webhook.v1",
      deliveryId: "fixture-delivery-001",
      source: {
        id: "synthetic-observed-runtime",
        runtimeHostedBy: "external",
        stationRole: "observer",
      },
      observedAt: "2026-06-20T10:15:00.000Z",
      payload: bridge.importPayload,
    };

    const missingKey = await requestJson(app, "POST", "/developer-spaces/ingest/observed-runtime", {
      body: envelope,
    });
    assert.equal(missingKey.status, 401);
    assert.equal(missingKey.body.category, "auth");

    const unsigned = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
      signature: null,
    });
    assert.equal(unsigned.status, 401);
    assert.equal(unsigned.body.code, "developer_space_webhook_signature_malformed");
    assert.equal(db.tables.developer_space_nodes.length, 0);
    assert.equal(db.tables.developer_space_events.length, 0);
    assert.equal(db.tables.developer_space_snapshots.length, 0);
    assert.equal(db.tables.developer_space_observed_runtime_context.length, 0);
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 0);

    const malformedSignature = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
      signature: "not-a-station-signature",
    });
    assert.equal(malformedSignature.status, 401);
    assert.equal(malformedSignature.body.code, "developer_space_webhook_signature_malformed");
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 0);

    const staleSignature = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
      timestamp: Math.floor(Date.now() / 1000) - 1000,
    });
    assert.equal(staleSignature.status, 401);
    assert.equal(staleSignature.body.code, "developer_space_webhook_signature_stale");
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 0);

    const badSignature = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
      signature: `t=${Math.floor(Date.now() / 1000)},v1=${"0".repeat(64)}`,
    });
    assert.equal(badSignature.status, 401);
    assert.equal(badSignature.body.code, "developer_space_webhook_signature_invalid");
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 0);

    const missingWebhookId = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: undefined,
    }, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(missingWebhookId.status, 400);
    assert.equal(missingWebhookId.body.code, "developer_space_webhook_id_missing");

    const accepted = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(accepted.status, 202);
    assert.equal(accepted.body.accepted, true);
    assert.equal(accepted.body.replayed, false);
    assert.deepEqual(accepted.body.imported, {
      nodes: 2,
      events: 1,
      snapshots: 1,
      supportingContext: 4,
    });
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 1);
    assert.equal(JSON.stringify(db.tables.developer_space_observed_runtime_webhook_receipts).includes("fixture-private"), false);
    assert.deepEqual(db.tables.developer_space_observed_runtime_webhook_receipts[0].response_body, accepted.body);

    const replayed = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(replayed.status, 200);
    assert.equal(replayed.body.accepted, false);
    assert.equal(replayed.body.replayed, true);
    assert.deepEqual(replayed.body.imported, accepted.body.imported);
    assert.equal(db.tables.developer_space_events.length, 1);
    assert.equal(db.tables.developer_space_observed_runtime_context.length, 4);

    const conflict = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      payload: {
        ...envelope.payload,
        events: [
          {
            ...envelope.payload.events[0],
            eventData: {
              ...envelope.payload.events[0].eventData,
              publicSignal: "changed signal",
            },
          },
        ],
      },
    }, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.code, "developer_space_webhook_replay_conflict");
    assert.doesNotMatch(JSON.stringify(conflict.body), /changed signal|fixture-private|fixture-secret/);

    const publicDetail = await requestJson(app, "GET", "/developer-spaces/observed-runtime-webhook");
    assert.equal(publicDetail.status, 200);
    assert.deepEqual(publicDetail.body.nodes[0].metrics, { publicState: "stable" });
    assert.deepEqual(publicDetail.body.supportingContext[0].payload, {
      id: "zone-crossroads",
      name: "Crossroads",
      publicOccupancy: 18,
    });
    assert.doesNotMatch(JSON.stringify(publicDetail.body), /fixture-private|fixture-secret|owner-visible|member-visible|alpha-watchers/);
  } finally {
    setSupabaseAdminForTests(null);
    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  }
});

test("Observed runtime webhook receipt claim blocks in-progress duplicate delivery side effects", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Observed Runtime Concurrency Guard",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);

    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
      observedRuntimeFixture("observed-runtime-canonical.json"),
      { developerSpaceId: created.body.space.id },
    );
    const envelope = {
      schema: "station.observed_runtime.webhook.v1",
      deliveryId: "fixture-concurrent-001",
      source: {
        id: "synthetic-observed-runtime",
        runtimeHostedBy: "external",
        stationRole: "observer",
      },
      observedAt: "2026-06-20T10:15:00.000Z",
      payload: bridge.importPayload,
    };
    db.insertRow("developer_space_observed_runtime_webhook_receipts", {
      developer_space_id: created.body.space.id,
      webhook_id: envelope.deliveryId,
      payload_hash: webhookPayloadHash(envelope.payload),
      response_body: {
        accepted: false,
        replayed: false,
        webhookId: envelope.deliveryId,
        status: "processing",
      },
    });

    const duplicateInProgress = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(duplicateInProgress.status, 409);
    assert.equal(duplicateInProgress.body.code, "developer_space_webhook_in_progress");
    assert.equal(duplicateInProgress.body.details.retryable, true);
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 1);
    assert.equal(db.tables.developer_space_nodes.length, 0);
    assert.equal(db.tables.developer_space_events.length, 0);
    assert.equal(db.tables.developer_space_snapshots.length, 0);
    assert.equal(db.tables.developer_space_observed_runtime_context.length, 0);
    assert.equal(db.tables.developer_space_usage.length, 0);

    const conflictingPayload = {
      ...envelope,
      payload: {
        ...envelope.payload,
        events: [
          {
            ...envelope.payload.events[0],
            eventData: {
              ...envelope.payload.events[0].eventData,
              publicSignal: "changed concurrent signal",
            },
          },
        ],
      },
    };
    const conflict = await requestObservedRuntimeWebhook(app, conflictingPayload, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.code, "developer_space_webhook_replay_conflict");
    assert.doesNotMatch(JSON.stringify(conflict.body), /changed concurrent signal|fixture-private|fixture-secret/);
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 1);
    assert.equal(db.tables.developer_space_events.length, 0);
    assert.equal(db.tables.developer_space_usage.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  }
});

test("Observed runtime webhook receipt claim finalizes failed imports instead of leaving processing state", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Observed Runtime Failed Claim",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);

    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
      observedRuntimeFixture("observed-runtime-canonical.json"),
      { developerSpaceId: created.body.space.id },
    );
    const envelope = {
      schema: "station.observed_runtime.webhook.v1",
      deliveryId: "fixture-failed-claim-001",
      source: {
        id: "synthetic-observed-runtime",
        runtimeHostedBy: "external",
        stationRole: "observer",
      },
      observedAt: "2026-06-20T10:15:00.000Z",
      payload: {
        ...bridge.importPayload,
        events: [{
          ...bridge.importPayload.events[0],
          eventData: {
            publicSignal: "visible",
            unclassifiedSignal: "missing classification should fail after claim",
          },
          fieldClassifications: {
            publicSignal: "public",
          },
        }],
      },
    };
    const failed = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(failed.status, 400);
    assert.equal(failed.body.code, "developer_space_observed_runtime_classification_failed");
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 1);
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts[0].response_body.status, "failed");
    assert.equal(db.tables.developer_space_events.length, 0);
    const usageRowsAfterFailure = db.tables.developer_space_usage.length;

    const replayFailed = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(replayFailed.status, 400);
    assert.equal(replayFailed.body.code, "developer_space_webhook_processing_failed");
    assert.equal(db.tables.developer_space_observed_runtime_webhook_receipts.length, 1);
    assert.equal(db.tables.developer_space_events.length, 0);
    assert.equal(db.tables.developer_space_usage.length, usageRowsAfterFailure);
  } finally {
    setSupabaseAdminForTests(null);
    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  }
});

test("Observed runtime webhook signing secrets are owner-scoped encrypted and preferred over ingestion-key fallback", async () => {
  const previousEncryptionKey = process.env.DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY;
  delete process.env.DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY;
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Observed Runtime Signing Secret",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);

    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const bridge = bridgeObservedRuntimeFixtureToDeveloperSpaceImport(
      observedRuntimeFixture("observed-runtime-canonical.json"),
      { developerSpaceId: created.body.space.id },
    );
    const envelope = {
      schema: "station.observed_runtime.webhook.v1",
      deliveryId: "signing-secret-fallback-001",
      source: {
        id: "synthetic-observed-runtime",
        runtimeHostedBy: "external",
        stationRole: "observer",
      },
      observedAt: "2026-06-20T10:15:00.000Z",
      payload: bridge.importPayload,
    };

    const missingConfig = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/observed-runtime-signing-secret`, {
      token: "owner-token",
    });
    assert.equal(missingConfig.status, 503);
    assert.equal(missingConfig.body.code, "developer_space_webhook_signing_secret_encryption_unconfigured");
    assert.equal(db.tables.developer_space_webhook_signing_secrets.length, 0);

    const fallback = await requestObservedRuntimeWebhook(app, envelope, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(fallback.status, 202);
    assert.equal(fallback.body.accepted, true);

    process.env.DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY = "test-observed-runtime-webhook-signing-secret-encryption-key";

    const nonOwnerCreate = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/observed-runtime-signing-secret`, {
      token: "other-token",
    });
    assert.equal(nonOwnerCreate.status, 403);

    const createdSecret = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/observed-runtime-signing-secret`, {
      token: "owner-token",
    });
    assert.equal(createdSecret.status, 201);
    assert.match(createdSecret.body.signingSecret, /^station_whsec_/);
    assert.equal(createdSecret.body.secret.status, "active");
    assert.equal(typeof createdSecret.body.secret.fingerprint, "string");
    assert.equal("encryptedSecret" in createdSecret.body.secret, false);
    assert.equal("secretHash" in createdSecret.body.secret, false);
    assert.equal(db.tables.developer_space_webhook_signing_secrets.length, 1);
    assert.equal(db.tables.developer_space_webhook_signing_secrets[0].status, "active");
    assert.equal(JSON.stringify(db.tables.developer_space_webhook_signing_secrets).includes(createdSecret.body.signingSecret), false);
    assert.equal(typeof db.tables.developer_space_webhook_signing_secrets[0].encrypted_secret.ciphertext, "string");
    assert.equal(typeof db.tables.developer_space_webhook_signing_secrets[0].secret_hash, "string");

    const blockedFallback = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: "signing-secret-dedicated-001",
    }, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(blockedFallback.status, 401);
    assert.equal(blockedFallback.body.code, "developer_space_webhook_signature_invalid");

    const dedicatedAccepted = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: "signing-secret-dedicated-001",
    }, {
      developerKey: apiKeyResponse.body.apiKey,
      signingSecret: createdSecret.body.signingSecret,
    });
    assert.equal(dedicatedAccepted.status, 202);
    assert.equal(dedicatedAccepted.body.accepted, true);
    assert.equal(typeof db.tables.developer_space_webhook_signing_secrets[0].last_used_at, "string");

    const rotatedSecret = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/observed-runtime-signing-secret`, {
      token: "owner-token",
    });
    assert.equal(rotatedSecret.status, 201);
    assert.notEqual(rotatedSecret.body.signingSecret, createdSecret.body.signingSecret);
    assert.equal(db.tables.developer_space_webhook_signing_secrets.length, 2);
    assert.equal(db.tables.developer_space_webhook_signing_secrets[0].status, "revoked");
    assert.equal(db.tables.developer_space_webhook_signing_secrets[1].status, "active");
    assert.equal(JSON.stringify(db.tables.developer_space_webhook_signing_secrets).includes(rotatedSecret.body.signingSecret), false);

    const oldSecretRejected = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: "signing-secret-old-001",
    }, {
      developerKey: apiKeyResponse.body.apiKey,
      signingSecret: createdSecret.body.signingSecret,
    });
    assert.equal(oldSecretRejected.status, 401);
    assert.equal(oldSecretRejected.body.code, "developer_space_webhook_signature_invalid");

    const newSecretAccepted = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: "signing-secret-new-001",
    }, {
      developerKey: apiKeyResponse.body.apiKey,
      signingSecret: rotatedSecret.body.signingSecret,
    });
    assert.equal(newSecretAccepted.status, 202);

    const nonOwnerRevoke = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/observed-runtime-signing-secret/revoke`, {
      token: "other-token",
    });
    assert.equal(nonOwnerRevoke.status, 403);

    const revoke = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/observed-runtime-signing-secret/revoke`, {
      token: "owner-token",
    });
    assert.equal(revoke.status, 200);
    assert.equal(revoke.body.revoked.length, 1);
    assert.equal(db.tables.developer_space_webhook_signing_secrets.every((row) => row.status === "revoked"), true);

    const revokedSecretRejected = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: "signing-secret-revoked-001",
    }, {
      developerKey: apiKeyResponse.body.apiKey,
      signingSecret: rotatedSecret.body.signingSecret,
    });
    assert.equal(revokedSecretRejected.status, 401);

    const fallbackAfterRevoke = await requestObservedRuntimeWebhook(app, {
      ...envelope,
      deliveryId: "signing-secret-fallback-after-revoke-001",
    }, {
      developerKey: apiKeyResponse.body.apiKey,
    });
    assert.equal(fallbackAfterRevoke.status, 202);
    assert.equal(fallbackAfterRevoke.body.accepted, true);
  } finally {
    if (previousEncryptionKey === undefined) {
      delete process.env.DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY;
    } else {
      process.env.DEVELOPER_SPACE_WEBHOOK_SIGNING_SECRET_ENCRYPTION_KEY = previousEncryptionKey;
    }
    setSupabaseAdminForTests(null);
    setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  }
});

test("Developer Space project attachment is owner-only and syncs usage project id", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000001",
    owner_user_id: "owner-user",
    name: "Owner Project",
    slug: "owner-project",
  });
  const otherProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000002",
    owner_user_id: "other-user",
    name: "Other Project",
    slug: "other-project",
  });
  const space = db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_name: "Animus Field",
    slug: "animus-field",
    visibility: "private",
    visualisation_type: "node_field",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createDeveloperSpacesApp();

  try {
    const invalid = await requestJson(app, "PATCH", `/developer-spaces/${space.id}/project`, {
      token: "owner-token",
      body: {},
    });
    assert.equal(invalid.status, 400);

    const foreignProject = await requestJson(app, "PATCH", `/developer-spaces/${space.id}/project`, {
      token: "owner-token",
      body: { projectId: otherProject.id },
    });
    assert.equal(foreignProject.status, 404);
    assert.equal(db.tables.developer_spaces[0].project_id, null);
    assert.equal(db.tables.developer_space_usage.length, 0);

    const nonOwner = await requestJson(app, "PATCH", `/developer-spaces/${space.id}/project`, {
      token: "other-token",
      body: { projectId: otherProject.id },
    });
    assert.equal(nonOwner.status, 403);

    const attached = await requestJson(app, "PATCH", `/developer-spaces/${space.id}/project`, {
      token: "owner-token",
      body: { projectId: ownerProject.id },
    });
    assert.equal(attached.status, 200);
    assert.equal(attached.body.projectId, ownerProject.id);
    assert.equal(attached.body.space.id, space.id);
    assert.equal(db.tables.developer_spaces[0].project_id, ownerProject.id);
    assert.equal(db.tables.developer_space_usage.length, 1);
    assert.equal(db.tables.developer_space_usage[0].project_id, ownerProject.id);

    const detached = await requestJson(app, "PATCH", `/developer-spaces/${space.id}/project`, {
      token: "owner-token",
      body: { projectId: null },
    });
    assert.equal(detached.status, 200);
    assert.equal(detached.body.projectId, null);
    assert.equal(db.tables.developer_spaces[0].project_id, null);
    assert.equal(db.tables.developer_space_usage[0].project_id, null);
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("Developer Space ingestion rate limit is cache-backed and machine-readable", async () => {
  const db = new InMemorySupabase();
  const rateLimitProvider = new TestRateLimitProvider();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(rateLimitProvider);
  const previousLimit = process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE;
  const previousWindow = process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS;
  process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE = "2";
  process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS = "60";
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Rate Limited Observatory",
      },
    });
    assert.equal(created.status, 201);
    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const first = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: { eventType: "rate.first" },
    });
    const second = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: { eventType: "rate.second" },
    });
    const blocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "rate.third",
        eventData: { privateToken: "do-not-leak-rate-payload" },
      },
    });

    assert.equal(first.status, 202);
    assert.equal(second.status, 202);
    assert.equal(blocked.status, 429);
    assert.deepEqual(blocked.body, {
      error: "Developer Space ingestion rate limit exceeded.",
      code: "developer_space_rate_limited",
      category: "rate_limit",
      resource: "developer_space_ingest_requests",
      limit: 2,
      used: 3,
      retryAfter: 60,
    });
    assert.doesNotMatch(JSON.stringify(blocked.body), /do-not-leak-rate-payload/);
    assert.equal(db.tables.developer_space_events.length, 2);
    assert.equal(rateLimitProvider.keys.length, 1);
    assert.equal(rateLimitProvider.keys[0].includes(apiKeyResponse.body.apiKey), false);
    assert.equal(rateLimitProvider.keys[0].includes("developer-space:"), true);
    assert.equal(rateLimitProvider.ttls.get(rateLimitProvider.keys[0]), 60);
  } finally {
    if (previousLimit == null) {
      delete process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE;
    } else {
      process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE = previousLimit;
    }
    if (previousWindow == null) {
      delete process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS;
    } else {
      process.env.DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS = previousWindow;
    }
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("Developer Space public field controls keep default scrubber compatibility when unset", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("test_disabled"));
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Default Public Fields",
        visibility: "public",
      },
    });
    assert.equal(created.status, 201);
    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const event = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "default.public",
        eventData: {
          status: "visible",
          phase: "alpha",
          token: "hidden-token",
        },
      },
    });
    assert.equal(event.status, 202);

    const publicDetail = await requestJson(app, "GET", "/developer-spaces/default-public-fields");
    assert.equal(publicDetail.status, 200);
    const publicEvent = publicDetail.body.events.find((row: Row) => row.eventType === "default.public");
    assert.deepEqual(publicEvent.eventData, {
      status: "visible",
      phase: "alpha",
    });
    assert.equal(JSON.stringify(publicDetail.body).includes("hidden-token"), false);
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("Developer Space ingestion rate-limit provider failures are structured and non-leaky", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  setOperationalCacheProviderForTests(new ThrowingRateLimitProvider());
  const app = createDeveloperSpacesApp();

  try {
    const created = await requestJson(app, "POST", "/developer-spaces", {
      token: "owner-token",
      body: {
        projectName: "Rate Failure Observatory",
      },
    });
    assert.equal(created.status, 201);
    const apiKeyResponse = await requestJson(app, "POST", `/developer-spaces/${created.body.space.id}/api-key`, {
      token: "owner-token",
    });
    assert.equal(apiKeyResponse.status, 201);

    const blocked = await requestJson(app, "POST", "/developer-spaces/ingest/events", {
      developerKey: apiKeyResponse.body.apiKey,
      body: {
        eventType: "rate.failure",
        eventData: { privateToken: "do-not-leak-rate-provider-payload" },
      },
    });

    assert.equal(blocked.status, 500);
    assert.deepEqual(blocked.body, {
      error: "Could not check Developer Space ingestion rate limit.",
      code: "developer_space_server_error",
      category: "server",
    });
    assert.doesNotMatch(JSON.stringify(blocked.body), /upstash secret do-not-leak/);
    assert.doesNotMatch(JSON.stringify(blocked.body), /do-not-leak-rate-provider-payload/);
    assert.equal(db.tables.developer_space_events.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
    resetOperationalCacheProviderForTests();
  }
});

test("Developer Space owner list includes owner-scoped Project assignment readback", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000101",
    owner_user_id: "owner-user",
    name: "Owner Project",
    slug: "owner-project",
  });
  const otherProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000102",
    owner_user_id: "other-user",
    name: "Other Project",
    slug: "other-project",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000101",
    owner_user_id: "owner-user",
    project_id: ownerProject.id,
    project_name: "Assigned Developer Space",
    slug: "assigned-developer-space",
    visibility: "private",
    visualisation_type: "node_field",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000102",
    owner_user_id: "owner-user",
    project_id: null,
    project_name: "Unassigned Developer Space",
    slug: "unassigned-developer-space",
    visibility: "private",
    visualisation_type: "timeline",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000103",
    owner_user_id: "owner-user",
    project_id: otherProject.id,
    project_name: "Hostile Assignment Space",
    slug: "hostile-assignment-space",
    visibility: "private",
    visualisation_type: "world_map",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createDeveloperSpacesApp();

  try {
    const listed = await requestJson<{ spaces: Array<Record<string, any>> }>(app, "GET", "/developer-spaces", {
      token: "owner-token",
    });
    assert.equal(listed.status, 200);

    const bySlug = new Map(listed.body.spaces.map((space) => [space.slug, space]));
    const assigned = bySlug.get("assigned-developer-space")!;
    assert.equal(assigned.projectName, "Assigned Developer Space");
    assert.equal(assigned.projectId, ownerProject.id);
    assert.equal(assigned.assignedProjectName, "Owner Project");
    assert.equal(assigned.assignedProjectSlug, "owner-project");

    const unassigned = bySlug.get("unassigned-developer-space")!;
    assert.equal(unassigned.projectId, null);
    assert.equal(unassigned.assignedProjectName, null);
    assert.equal(unassigned.assignedProjectSlug, null);

    const hostile = bySlug.get("hostile-assignment-space")!;
    assert.equal(hostile.projectId, null);
    assert.equal(hostile.assignedProjectName, null);
    assert.equal(hostile.assignedProjectSlug, null);
    assert.equal(JSON.stringify(hostile).includes("Other Project"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
