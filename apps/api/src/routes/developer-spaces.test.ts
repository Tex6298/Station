import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { hashDeveloperSpaceApiKey } from "../services/developer-space.service";
import { developerSpacesRouter } from "./developer-spaces";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "owner-user", tier: "canon", is_admin: false },
      { id: "other-user", tier: "canon", is_admin: false },
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
    documents: [],
    ai_trace_sessions: [],
    ai_trace_events: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-24T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["other-token", { id: "other-user", email: "other@example.test" }],
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

function createDeveloperSpacesApp() {
  const app = express();
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
      },
    });
    assert.equal(created.status, 201);
    const spaceId = created.body.space.id;

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
        },
      },
    });
    assert.equal(visualConfigUpdate.status, 200);
    assert.equal(visualConfigUpdate.body.space.visualisationType, "world_map");
    assert.equal(visualConfigUpdate.body.space.visualisationConfig.zoneField, "room");
    assert.equal(visualConfigUpdate.body.space.visualisationConfig.maxZones, 6);

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
    assert.equal(publicDetail.body.nodes[0].metrics.raw, undefined);
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.summary, "Stable");
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.raw, undefined);
    assert.equal(publicDetail.body.events.some((event: Row) => event.visibility === "private"), false);
    assert.equal(publicDetail.body.events.some((event: Row) => event.eventType === "signal.detected"), true);
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

    const ownerDetail = await requestJson(app, "GET", "/developer-spaces/animus-field", {
      token: "owner-token",
    });

    assert.equal(ownerDetail.status, 200);
    assert.equal(ownerDetail.body.access, "owner");
    assert.equal(ownerDetail.body.space.apiKeyLastFour, apiKeyResponse.body.apiKey.slice(-4));
    assert.equal(ownerDetail.body.events.some((event: Row) => event.visibility === "private"), true);
    assert.equal(ownerDetail.body.nodes[0].metrics.raw.hidden, true);
    assert.equal(ownerDetail.body.latestSnapshot.snapshotData.raw.prompt, "owner-only");
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
    assert.equal(usage.body.usage.counters.publicReads, 3);
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

    db.tables.developer_spaces[0].visibility = "private";
    const blockedPrivateStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1");
    assert.equal(blockedPrivateStream.status, 403);
    const ownerPrivateStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1&access_token=owner-token");
    assert.equal(ownerPrivateStream.status, 200);
    assert.equal(parseSseUpdate(ownerPrivateStream.body).data.detail.access, "owner");
  } finally {
    setSupabaseAdminForTests(null);
  }
});
