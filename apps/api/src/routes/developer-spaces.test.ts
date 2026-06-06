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
    developer_spaces: [],
    developer_space_ingestion_keys: [],
    developer_space_documents: [],
    developer_space_nodes: [],
    developer_space_events: [],
    developer_space_snapshots: [],
    documents: [],
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
      row.description ??= null;
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

    if (table === "documents") {
      row.space_id ??= null;
      row.persona_id ??= null;
      row.body ??= "";
      row.document_type ??= "post";
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

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns = "*") {
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
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }
    if (mode === "maybeSingle") {
      return { data: data[0] ?? null, error: null };
    }
    return { data, error: null };
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
    assert.equal(created.body.space.visualisationType, "world_map");

    const spaceId = created.body.space.id;
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
    assert.equal(hiddenPublicLinkDetail.body.linkedDocuments.length, 0);

    publicFieldLogRow.status = "published";
    publicFieldLogRow.visibility = "public";

    const publicDetail = await requestJson(app, "GET", "/developer-spaces/animus-field");
    assert.equal(publicDetail.status, 200);
    assert.equal(publicDetail.body.access, "public");
    assert.equal(publicDetail.body.space.apiKeyLastFour, null);
    assert.equal(publicDetail.body.space.visualisationType, "world_map");
    assert.equal(publicDetail.body.nodes.length, 1);
    assert.equal(publicDetail.body.nodes[0].metrics.raw, undefined);
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.summary, "Stable");
    assert.equal(publicDetail.body.latestSnapshot.snapshotData.raw, undefined);
    assert.equal(publicDetail.body.events.some((event: Row) => event.visibility === "private"), false);
    assert.equal(publicDetail.body.events.some((event: Row) => event.eventType === "signal.detected"), true);
    assert.equal(publicDetail.body.linkedDocuments.length, 1);
    assert.equal(publicDetail.body.linkedDocuments[0].role, "field_log");
    assert.equal(publicDetail.body.linkedDocuments[0].document.title, "Animus field log one");
    const publicText = JSON.stringify(publicDetail.body);
    assert.equal(publicText.includes("api_key_hash"), false);
    assert.equal(publicText.includes("Draft-only calibration method"), false);
    assert.equal(publicText.includes("Published field log"), true);
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
    assert.equal(ownerDetail.body.linkedDocuments.length, 2);
    assert.equal(ownerDetail.body.linkedDocuments.some((link: Row) => link.role === "methodology" && link.linkVisibility === "owner"), true);
    assert.equal(ownerDetail.body.linkedDocuments.some((link: Row) => link.role === "field_log" && link.linkVisibility === "public"), true);
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
    assert.equal(publicSse.data.detail.linkedDocuments.length, 1);
    assert.equal(JSON.stringify(publicSse.data).includes("Draft-only calibration method"), false);
    assert.equal(JSON.stringify(publicSse.data).includes("public-db-password"), false);
    assert.equal(typeof publicSse.data.freshness.streamId, "string");

    const ownerStream = await requestText(app, "GET", "/developer-spaces/animus-field/stream?once=1&access_token=owner-token");
    assert.equal(ownerStream.status, 200);
    const ownerSse = parseSseUpdate(ownerStream.body);
    assert.equal(ownerSse.data.detail.access, "owner");
    assert.equal(ownerSse.data.detail.events.some((event: Row) => event.visibility === "private"), true);
    assert.equal(ownerSse.data.detail.linkedDocuments.length, 2);
    assert.equal(JSON.stringify(ownerSse.data).includes("public-db-password"), true);
    assert.equal(JSON.stringify(ownerSse.data).includes("Draft-only calibration method"), true);
    assert.equal(JSON.stringify(ownerSse.data).includes("api_key_hash"), false);

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
