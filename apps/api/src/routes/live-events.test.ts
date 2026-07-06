import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import type {
  OwnerPublicSeminarRecordResponse,
  OwnerPublicSeminarRecordsResponse,
  PublicSeminarInterestResponse,
  PublicSeminarsResponse,
} from "@station/types";
import { setSupabaseAdminForTests } from "../lib/supabase";
import {
  durablePublicSeminarCardId,
  eventsRouter,
  mergePublicSeminarCardsWithDurableCards,
  resolveDurablePublicSeminarRecordCard,
  seminarInterestKey,
  type ResolvedPublicSeminarCard,
} from "./events";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    discover_feed: [],
    documents: [],
    spaces: [],
    threads: [],
    forum_categories: [],
    community_subcommunities: [],
    profiles: [],
    public_seminar_interests: [],
    public_seminar_records: [],
  };
  private failures: Array<{ table: string; operation: string; message: string }> = [];
  private clock = Date.parse("2026-06-29T08:00:00.000Z");
  private authUsers: Record<string, { id: string; email: string }> = {
    "owner-token": { id: "owner-user", email: "owner@example.test" },
    "member-token": { id: "member-user", email: "member@example.test" },
    "visitor-token": { id: "visitor-user", email: "visitor@example.test" },
  };

  client = {
    auth: {
      getUser: async (token: string) => {
        const user = this.authUsers[token];
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token." } };
      },
    },
    from: (table: string) => new QueryBuilder(this, table),
  };

  constructor() {
    this.insertRow("profiles", {
      id: "owner-user",
      email: "owner@example.test",
      tier: "creator",
      is_admin: false,
    });
    this.insertRow("profiles", {
      id: "member-user",
      email: "member@example.test",
      tier: "private",
      is_admin: false,
    });
    this.insertRow("profiles", {
      id: "visitor-user",
      email: "visitor@example.test",
      tier: "visitor",
      is_admin: false,
    });
  }

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  insertRow(table: string, payload: Row) {
    const row = this.prepareRow(table, payload);
    this.rows(table).push(row);
    return row;
  }

  failNext(table: string, operation: string, message: string) {
    this.failures.push({ table, operation, message });
  }

  consumeFailure(table: string, operation: string) {
    const index = this.failures.findIndex((failure) =>
      failure.table === table && failure.operation === operation
    );
    if (index === -1) return null;
    const [failure] = this.failures.splice(index, 1);
    return { message: failure.message };
  }

  timestamp() {
    const value = new Date(this.clock).toISOString();
    this.clock += 1000;
    return value;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= `${table}-${this.rows(table).length + 1}`;

    if (table === "discover_feed") {
      row.event_type ??= "featured";
      row.created_at ??= now;
    }
    if (table === "documents") {
      row.title ??= "Untitled document";
      row.body ??= "";
      row.status ??= "published";
      row.visibility ??= "public";
      row.published_at ??= now;
      row.created_at ??= now;
      row.space_id ??= null;
      row.discussion_thread_id ??= null;
    }
    if (table === "spaces") {
      row.title ??= row.slug ?? row.id;
      row.slug ??= row.id;
      row.short_description ??= null;
      row.is_public ??= true;
      row.created_at ??= now;
      row.updated_at ??= now;
    }
    if (table === "threads") {
      row.title ??= "Untitled thread";
      row.body ??= "";
      row.status ??= "active";
      row.visibility ??= "public";
      row.is_hidden ??= false;
      row.linked_document_id ??= null;
      row.category_id ??= null;
      row.created_at ??= now;
    }
    if (table === "forum_categories") {
      row.title ??= row.slug ?? row.id;
      row.slug ??= row.id;
      row.created_at ??= now;
    }
    if (table === "community_subcommunities") {
      row.category_id ??= null;
      row.slug ??= row.id;
      row.title ??= row.slug;
      row.description ??= null;
      row.subcommunity_type ??= "salon";
      row.visibility ??= "public";
      row.status ??= "active";
      row.owner_user_id ??= "owner-test";
      row.created_at ??= now;
      row.updated_at ??= now;
    }
    if (table === "profiles") {
      row.username ??= row.id;
      row.display_name ??= null;
      row.bio ??= null;
      row.avatar_url ??= null;
      row.tier ??= "visitor";
      row.is_admin ??= false;
      row.created_at ??= now;
      row.updated_at ??= now;
    }
    if (table === "public_seminar_interests") {
      row.created_at ??= now;
      row.updated_at ??= now;
    }
    if (table === "public_seminar_records") {
      row.source_type ??= "document";
      row.title ??= "Untitled seminar";
      row.summary ??= null;
      row.status ??= "draft";
      row.visibility ??= "private";
      row.discussion_thread_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private operation: "select" | "upsert" | "update" | "delete" = "select";
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private mutationPayload: Row | null = null;
  private onConflict: string[] = [];

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns?: string) {
    return this;
  }

  upsert(payload: Row, options: { onConflict?: string } = {}) {
    this.operation = "upsert";
    this.mutationPayload = payload;
    this.onConflict = options.onConflict?.split(",").map((field) => field.trim()).filter(Boolean) ?? [];
    return this;
  }

  update(payload: Row) {
    this.operation = "update";
    this.mutationPayload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
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

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    return this.execute("maybeSingle");
  }

  single() {
    return this.execute("single");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(mode?: "maybeSingle" | "single") {
    const failure = this.db.consumeFailure(this.table, this.operation);
    if (failure) return { data: null, error: failure };

    if (this.operation === "upsert") {
      const row = this.upsertRow();
      const data = JSON.parse(JSON.stringify(row));
      return { data: mode ? data : [data], error: null };
    }

    if (this.operation === "update") {
      const rows = this.updateRows();
      const data = JSON.parse(JSON.stringify(rows));
      if (mode === "single") {
        return data.length > 0
          ? { data: data[0], error: null }
          : { data: null, error: { message: "No rows returned." } };
      }
      return { data, error: null };
    }

    if (this.operation === "delete") {
      const sourceRows = this.db.rows(this.table);
      const deleted = sourceRows.filter((row) => this.matches(row));
      this.db.tables[this.table] = sourceRows.filter((row) => !this.matches(row));
      return { data: JSON.parse(JSON.stringify(deleted)), error: null };
    }

    const rows = this.selectedRows();
    const data = JSON.parse(JSON.stringify(rows));
    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null }
        : { data: null, error: null };
    }
    if (mode === "single") {
      return data.length > 0
        ? { data: data[0], error: null }
        : { data: null, error: { message: "No rows returned." } };
    }
    return { data, error: null };
  }

  private selectedRows() {
    let rows = [...this.db.rows(this.table)];
    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }
    for (const [field, values] of this.inFilters) {
      rows = rows.filter((row) => values.includes(row[field]));
    }
    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((left, right) => {
        if (left[field] === right[field]) return 0;
        if (left[field] == null) return 1;
        if (right[field] == null) return -1;
        return (left[field] > right[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private matches(row: Row) {
    for (const [field, value] of this.filters) {
      if (row[field] !== value) return false;
    }
    for (const [field, values] of this.inFilters) {
      if (!values.includes(row[field])) return false;
    }
    return true;
  }

  private upsertRow() {
    if (!this.mutationPayload) throw new Error("Missing upsert payload.");
    const rows = this.db.rows(this.table);
    const conflictFields = this.onConflict.length > 0 ? this.onConflict : ["id"];
    const existing = rows.find((row) =>
      conflictFields.every((field) => row[field] === this.mutationPayload![field])
    );

    if (existing) {
      Object.assign(existing, this.mutationPayload, { updated_at: this.db.timestamp() });
      return existing;
    }

    return this.db.insertRow(this.table, this.mutationPayload);
  }

  private updateRows() {
    if (!this.mutationPayload) throw new Error("Missing update payload.");
    const rows = this.db.rows(this.table).filter((row) => this.matches(row));
    for (const row of rows) {
      Object.assign(row, this.mutationPayload, { updated_at: this.db.timestamp() });
    }
    return rows;
  }
}

function createEventsApp() {
  const app = express();
  app.use(express.json());
  app.use("/events", eventsRouter);
  return app;
}

async function listen(app: Express): Promise<Server> {
  return await new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    return {
      status: response.status,
      body: await response.json() as TBody,
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
    });
  }
}

function seedFeatured(db: InMemorySupabase, item_type: string, item_id: string, id = `${item_type}-${item_id}`) {
  db.insertRow("discover_feed", {
    id: `feed-${id}`,
    item_type,
    item_id,
    event_type: "featured",
    title: "Curated title that should not be trusted",
    description: "Curated private-note-shaped text should not leak.",
    href: "/private/internal/path",
  });
}

function seedPublicSeminarFixture(db: InMemorySupabase) {
  db.insertRow("spaces", {
    id: "space-public",
    slug: "station-house",
    title: "Station House",
    short_description: "A public Space for seminar readbacks.",
    is_public: true,
  });
  db.insertRow("documents", {
    id: "doc-public",
    title: "Public Readback Notes",
    body: "Public excerpt about careful seminar preparation.",
    status: "published",
    visibility: "public",
    space_id: "space-public",
  });
  seedFeatured(db, "document", "doc-public");
}

function seedOwnerSeminarRecordSource(db: InMemorySupabase, overrides: Row = {}) {
  const spaceId = overrides.space_id ?? "space-public";
  if (!db.rows("spaces").some((row) => row.id === spaceId)) {
    db.insertRow("spaces", {
      id: spaceId,
      slug: "station-house",
      title: "Station House",
      short_description: "A public Space for seminar records.",
      is_public: true,
    });
  }
  return db.insertRow("documents", {
    id: overrides.id ?? "doc-public",
    title: "Public Readback Notes",
    body: "Public excerpt about careful seminar preparation.",
    status: "published",
    visibility: "public",
    author_user_id: "owner-user",
    space_id: spaceId,
    discussion_thread_id: "thread-discussion",
    ...overrides,
  });
}

function seedOwnerSeminarRecord(db: InMemorySupabase, recordOverrides: Row = {}, sourceOverrides: Row = {}) {
  const source = seedOwnerSeminarRecordSource(db, {
    id: recordOverrides.source_id ?? sourceOverrides.id ?? "doc-public",
    ...sourceOverrides,
  });
  return db.insertRow("public_seminar_records", {
    id: recordOverrides.id ?? "record-public",
    owner_user_id: "owner-user",
    source_type: "document",
    source_id: source.id,
    title: "Public Readback Notes",
    summary: "Public excerpt about careful seminar preparation.",
    status: "draft",
    visibility: "private",
    discussion_thread_id: "thread-discussion",
    ...recordOverrides,
  });
}

function seedPublicSeminarDiscussion(db: InMemorySupabase, overrides: Row = {}) {
  const categoryId = overrides.category_id ?? "category-public";
  if (!db.rows("forum_categories").some((row) => row.id === categoryId)) {
    db.insertRow("forum_categories", {
      id: categoryId,
      slug: "seminar-room",
      title: "Seminar Room",
    });
  }
  return db.insertRow("threads", {
    id: overrides.id ?? "thread-discussion",
    title: "Public Seminar Discussion",
    body: "Public follow-up discussion.",
    category_id: categoryId,
    linked_document_id: overrides.linked_document_id ?? "doc-public",
    ...overrides,
  });
}

function resolvedSeminarCard(
  sourceType: ResolvedPublicSeminarCard["sourceType"],
  sourceId: string,
  title: string,
  featuredAt: string
): ResolvedPublicSeminarCard {
  const href = sourceType === "space"
    ? `/space/${sourceId}`
    : sourceType === "thread"
      ? `/forums/seminar-room/${sourceId}`
      : `/space/station-house/documents/${sourceId}`;

  return {
    sourceType,
    sourceId,
    card: {
      id: `seminar_${sourceType}_${sourceId}`,
      sourceType,
      label: sourceType === "document" ? "Published readback" : "Public seminar",
      title,
      description: null,
      href,
      discussionHref: null,
      featuredAt,
      publishedAt: featuredAt,
      interestCount: 0,
      space: sourceType === "document"
        ? { title: "Station House", href: "/space/station-house" }
        : null,
    },
  };
}

test("owner seminar record routes require auth and creator tier", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecordSource(db);

    const signedOutList = await requestJson(app, "GET", "/events/seminars/records");
    assert.equal(signedOutList.status, 401);

    const signedOutCreate = await requestJson(app, "POST", "/events/seminars/records", {
      body: { sourceType: "document", sourceId: "doc-public" },
    });
    assert.equal(signedOutCreate.status, 401);

    const insufficientTier = await requestJson(app, "POST", "/events/seminars/records", {
      token: "member-token",
      body: { sourceType: "document", sourceId: "doc-public" },
    });
    assert.equal(insufficientTier.status, 403);
    assert.equal(db.rows("public_seminar_records").length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner can create, list, and idempotently restore a durable seminar record", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecordSource(db, {
      id: "doc-public",
      title: "Owner Seminar source_id=doc-public",
      body: "Public preparation with Bearer super-secret-token source_id=doc-public author_user_id=owner-user stack trace 10.0.0.1",
      discussion_thread_id: "thread-discussion",
    });
    db.insertRow("public_seminar_records", {
      owner_user_id: "member-user",
      source_type: "document",
      source_id: "doc-public",
      title: "Other owner seminar",
      summary: "Should not appear in owner list.",
    });

    const created = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records",
      {
        token: "owner-token",
        body: { sourceType: "document", sourceId: "doc-public" },
      }
    );

    assert.equal(created.status, 200);
    assert.equal(created.body.record.sourceType, "document");
    assert.equal(created.body.record.title, "Owner Seminar [redacted]");
    assert.equal(created.body.record.status, "draft");
    assert.equal(created.body.record.visibility, "private");
    assert.equal(created.body.record.publicDocumentHref, "/space/station-house/documents/doc-public");
    assert.deepEqual(created.body.record.publicSpace, {
      title: "Station House",
      href: "/space/station-house",
    });
    assert.equal(created.body.record.discussionLinked, true);
    assert.equal(db.rows("public_seminar_records").length, 2);

    const duplicate = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records",
      {
        token: "owner-token",
        body: { sourceType: "document", sourceId: "doc-public" },
      }
    );
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.record.id, created.body.record.id);
    assert.equal(db.rows("public_seminar_records").length, 2);

    const listed = await requestJson<OwnerPublicSeminarRecordsResponse>(
      app,
      "GET",
      "/events/seminars/records",
      { token: "owner-token" }
    );
    assert.equal(listed.status, 200);
    assert.equal(listed.body.records.length, 1);
    assert.equal(listed.body.records[0].id, created.body.record.id);

    const json = JSON.stringify({ created: created.body, listed: listed.body });
    for (const forbidden of [
      "Bearer",
      "super-secret-token",
      "source_id",
      "sourceId",
      "owner_user_id",
      "author_user_id",
      "discussion_thread_id",
      "thread-discussion",
      "stack trace",
      "10.0.0.1",
      "Other owner seminar",
      "Should not appear",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record creation fails closed for invalid source targets", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    db.insertRow("spaces", {
      id: "space-private",
      slug: "private-house",
      title: "Private House",
      is_public: false,
    });
    db.insertRow("spaces", {
      id: "space-uuid",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe UUID Space",
      is_public: true,
    });
    db.insertRow("spaces", {
      id: "space-bad-slug",
      slug: "Bad Slug!",
      title: "Unsafe Slug Space",
      is_public: true,
    });

    const invalidDocuments = [
      { id: "doc-private", visibility: "private" },
      { id: "doc-community", visibility: "community" },
      { id: "doc-unlisted", visibility: "unlisted" },
      { id: "doc-draft", status: "draft" },
      { id: "doc-archived", status: "archived" },
      { id: "doc-missing-space", space_id: null },
      { id: "doc-private-space", space_id: "space-private" },
      { id: "doc-uuid-space", space_id: "space-uuid" },
      { id: "doc-bad-slug", space_id: "space-bad-slug" },
      { id: "doc-not-owned", author_user_id: "member-user" },
    ];
    for (const overrides of invalidDocuments) {
      seedOwnerSeminarRecordSource(db, overrides);
    }

    const unsupported = await requestJson(app, "POST", "/events/seminars/records", {
      token: "owner-token",
      body: { sourceType: "thread", sourceId: "thread-public" },
    });
    assert.equal(unsupported.status, 400);
    assert.deepEqual(unsupported.body, {
      error: "Unsupported seminar record source.",
      code: "seminar_record_invalid_source",
    });

    for (const { id } of invalidDocuments) {
      const response = await requestJson(app, "POST", "/events/seminars/records", {
        token: "owner-token",
        body: { sourceType: "document", sourceId: id },
      });
      assert.equal(response.status, 404, `${id} should not be accepted`);
      assert.deepEqual(response.body, {
        error: "Seminar source not available.",
        code: "seminar_source_not_available",
      });
    }

    assert.equal(db.rows("public_seminar_records").length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record storage failures return bounded errors", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecordSource(db);

    db.failNext(
      "public_seminar_records",
      "select",
      "table=public_seminar_records owner_user_id=owner-user stack trace"
    );
    const failedList = await requestJson(app, "GET", "/events/seminars/records", {
      token: "owner-token",
    });
    assert.equal(failedList.status, 503);
    assert.deepEqual(failedList.body, {
      error: "Could not load seminar records.",
      code: "seminar_records_unavailable",
    });

    db.failNext(
      "documents",
      "select",
      "table=documents source_id=doc-public owner_user_id=owner-user provider stack trace"
    );
    const failedSource = await requestJson(app, "POST", "/events/seminars/records", {
      token: "owner-token",
      body: { sourceType: "document", sourceId: "doc-public" },
    });
    assert.equal(failedSource.status, 503);
    assert.deepEqual(failedSource.body, {
      error: "Could not create seminar record.",
      code: "seminar_record_create_unavailable",
    });

    db.failNext(
      "public_seminar_records",
      "upsert",
      "table=public_seminar_records source_id=doc-public owner_user_id=owner-user stack trace"
    );
    const failedCreate = await requestJson(app, "POST", "/events/seminars/records", {
      token: "owner-token",
      body: { sourceType: "document", sourceId: "doc-public" },
    });
    assert.equal(failedCreate.status, 503);
    assert.deepEqual(failedCreate.body, {
      error: "Could not create seminar record.",
      code: "seminar_record_create_unavailable",
    });

    const json = JSON.stringify({ failedList: failedList.body, failedSource: failedSource.body, failedCreate: failedCreate.body });
    for (const forbidden of [
      "public_seminar_records",
      "documents",
      "owner-user",
      "doc-public",
      "source_id",
      "owner_user_id",
      "author_user_id",
      "provider",
      "stack trace",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record transition requires auth, creator tier, and owner scope", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecord(db);
    db.insertRow("public_seminar_records", {
      id: "record-member",
      owner_user_id: "member-user",
      source_type: "document",
      source_id: "doc-public",
      title: "Other owner seminar",
      status: "ready",
      visibility: "private",
    });
    db.insertRow("public_seminar_records", {
      id: "record-member-published",
      owner_user_id: "member-user",
      source_type: "document",
      source_id: "doc-public",
      title: "Other owner published seminar",
      status: "published",
      visibility: "public",
    });

    const signedOut = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      body: { status: "ready" },
    });
    assert.equal(signedOut.status, 401);
    const signedOutPublish = await requestJson(app, "POST", "/events/seminars/records/record-member/transition", {
      body: { status: "published" },
    });
    assert.equal(signedOutPublish.status, 401);
    const signedOutRollback = await requestJson(app, "POST", "/events/seminars/records/record-member-published/transition", {
      body: { status: "ready" },
    });
    assert.equal(signedOutRollback.status, 401);

    const insufficientTier = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      token: "member-token",
      body: { status: "ready" },
    });
    assert.equal(insufficientTier.status, 403);
    const insufficientPublishTier = await requestJson(app, "POST", "/events/seminars/records/record-member/transition", {
      token: "member-token",
      body: { status: "published" },
    });
    assert.equal(insufficientPublishTier.status, 403);
    const insufficientRollbackTier = await requestJson(app, "POST", "/events/seminars/records/record-member-published/transition", {
      token: "member-token",
      body: { status: "ready" },
    });
    assert.equal(insufficientRollbackTier.status, 403);

    const nonOwner = await requestJson(app, "POST", "/events/seminars/records/record-member/transition", {
      token: "owner-token",
      body: { status: "ready" },
    });
    assert.equal(nonOwner.status, 404);
    assert.deepEqual(nonOwner.body, {
      error: "Seminar draft not found.",
      code: "seminar_record_not_found",
    });
    const nonOwnerPublish = await requestJson(app, "POST", "/events/seminars/records/record-member/transition", {
      token: "owner-token",
      body: { status: "published" },
    });
    assert.equal(nonOwnerPublish.status, 404);
    const nonOwnerRollback = await requestJson(app, "POST", "/events/seminars/records/record-member-published/transition", {
      token: "owner-token",
      body: { status: "ready" },
    });
    assert.equal(nonOwnerRollback.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record transition moves draft to ready and back while staying private", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecord(db, {
      title: "Transition source_id=doc-public",
      summary: "Summary with Bearer super-secret-token discussion_thread_id=thread-discussion",
    });

    const ready = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "ready" } }
    );
    assert.equal(ready.status, 200);
    assert.equal(ready.body.record.id, "record-public");
    assert.equal(ready.body.record.status, "ready");
    assert.equal(ready.body.record.visibility, "private");
    assert.equal(db.rows("public_seminar_records").find((row) => row.id === "record-public")?.status, "ready");

    const published = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "published" } }
    );
    assert.equal(published.status, 200);
    assert.equal(published.body.record.id, "record-public");
    assert.equal(published.body.record.status, "published");
    assert.equal(published.body.record.visibility, "public");
    assert.equal(db.rows("public_seminar_records").find((row) => row.id === "record-public")?.status, "published");
    assert.equal(db.rows("public_seminar_records").find((row) => row.id === "record-public")?.visibility, "public");

    const duplicatePublish = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "published" } }
    );
    assert.equal(duplicatePublish.status, 200);
    assert.equal(duplicatePublish.body.record.id, "record-public");
    assert.equal(duplicatePublish.body.record.status, "published");
    assert.equal(duplicatePublish.body.record.visibility, "public");

    const durableCard = await resolveDurablePublicSeminarRecordCard(
      db.client as any,
      db.rows("public_seminar_records").find((row) => row.id === "record-public")
    );
    assert.ok(durableCard);
    assert.equal(durableCard.sourceType, "document");
    assert.equal(seminarInterestKey(durableCard), "document:doc-public");

    const publicReadback = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars?limit=20");
    assert.equal(publicReadback.status, 200);
    assert.equal(publicReadback.body.source, "discover_feed_featured");
    assert.deepEqual(publicReadback.body.cards, []);

    seedFeatured(db, "document", "doc-public");
    const sourceDerived = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars?limit=20");
    assert.equal(sourceDerived.status, 200);
    assert.equal(sourceDerived.body.cards.length, 1);
    assert.equal(sourceDerived.body.cards[0].label, "Published readback");
    assert.notEqual(sourceDerived.body.cards[0].id, durablePublicSeminarCardId("record-public"));

    const marked = await requestJson<PublicSeminarInterestResponse>(
      app,
      "POST",
      `/events/seminars/${sourceDerived.body.cards[0].id}/interest`,
      { token: "owner-token" }
    );
    assert.equal(marked.status, 200);
    assert.equal(db.rows("public_seminar_interests")[0].source_type, "document");
    assert.equal(db.rows("public_seminar_interests")[0].source_id, "doc-public");

    const rolledBack = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "ready" } }
    );
    assert.equal(rolledBack.status, 200);
    assert.equal(rolledBack.body.record.id, "record-public");
    assert.equal(rolledBack.body.record.status, "ready");
    assert.equal(rolledBack.body.record.visibility, "private");

    const duplicateRollback = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "ready" } }
    );
    assert.equal(duplicateRollback.status, 200);
    assert.equal(duplicateRollback.body.record.id, "record-public");
    assert.equal(duplicateRollback.body.record.status, "ready");
    assert.equal(duplicateRollback.body.record.visibility, "private");

    const draft = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "draft" } }
    );
    assert.equal(draft.status, 200);
    assert.equal(draft.body.record.id, "record-public");
    assert.equal(draft.body.record.status, "draft");
    assert.equal(draft.body.record.visibility, "private");

    const json = JSON.stringify({
      ready: ready.body,
      published: published.body,
      duplicatePublish: duplicatePublish.body,
      rolledBack: rolledBack.body,
      duplicateRollback: duplicateRollback.body,
      draft: draft.body,
      marked: marked.body,
    });
    for (const forbidden of [
      "source_id",
      "sourceId",
      "owner_user_id",
      "author_user_id",
      "discussion_thread_id",
      "thread-discussion",
      "Bearer",
      "super-secret-token",
      "provider payload",
      "storage_path",
      "stack trace",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record transition revalidates source routeability", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    db.insertRow("spaces", {
      id: "space-private",
      slug: "private-house",
      title: "Private House",
      is_public: false,
    });
    db.insertRow("spaces", {
      id: "space-uuid",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe UUID Space",
      is_public: true,
    });
    db.insertRow("spaces", {
      id: "space-bad-slug",
      slug: "Bad Slug!",
      title: "Unsafe Slug Space",
      is_public: true,
    });

    const invalidSources = [
      { id: "doc-private", visibility: "private" },
      { id: "doc-community", visibility: "community" },
      { id: "doc-unlisted", visibility: "unlisted" },
      { id: "doc-draft", status: "draft" },
      { id: "doc-archived", status: "archived" },
      { id: "doc-missing-space", space_id: null },
      { id: "doc-private-space", space_id: "space-private" },
      { id: "doc-uuid-space", space_id: "space-uuid" },
      { id: "doc-bad-slug", space_id: "space-bad-slug" },
      { id: "doc-not-owned", author_user_id: "member-user" },
    ];

    for (const source of invalidSources) {
      seedOwnerSeminarRecord(db, {
        id: `record-${source.id}`,
        source_id: source.id,
      }, source);
    }

    for (const { id } of invalidSources) {
      const response = await requestJson(app, "POST", `/events/seminars/records/record-${id}/transition`, {
        token: "owner-token",
        body: { status: "ready" },
      });
      assert.equal(response.status, 404, `${id} should not transition`);
      assert.deepEqual(response.body, {
        error: "Seminar source not available.",
        code: "seminar_source_not_available",
      });
      assert.equal(db.rows("public_seminar_records").find((row) => row.id === `record-${id}`)?.status, "draft");
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record publish revalidates source routeability and serializer compatibility", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    db.insertRow("spaces", {
      id: "space-private",
      slug: "private-house",
      title: "Private House",
      is_public: false,
    });
    db.insertRow("spaces", {
      id: "space-uuid",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe UUID Space",
      is_public: true,
    });
    db.insertRow("spaces", {
      id: "space-bad-slug",
      slug: "Bad Slug!",
      title: "Unsafe Slug Space",
      is_public: true,
    });

    const invalidSources = [
      { id: "doc-private", visibility: "private" },
      { id: "doc-community", visibility: "community" },
      { id: "doc-unlisted", visibility: "unlisted" },
      { id: "doc-draft", status: "draft" },
      { id: "doc-archived", status: "archived" },
      { id: "doc-missing-space", space_id: null },
      { id: "doc-private-space", space_id: "space-private" },
      { id: "doc-uuid-space", space_id: "space-uuid" },
      { id: "doc-bad-slug", space_id: "space-bad-slug" },
      { id: "doc-not-owned", author_user_id: "member-user" },
    ];

    for (const source of invalidSources) {
      seedOwnerSeminarRecord(db, {
        id: `record-publish-${source.id}`,
        source_id: source.id,
        status: "ready",
      }, source);
    }

    for (const { id } of invalidSources) {
      const response = await requestJson(app, "POST", `/events/seminars/records/record-publish-${id}/transition`, {
        token: "owner-token",
        body: { status: "published" },
      });
      assert.equal(response.status, 404, `${id} should not publish`);
      assert.deepEqual(response.body, {
        error: "Seminar source not available.",
        code: "seminar_source_not_available",
      });
      const row = db.rows("public_seminar_records").find((item) => item.id === `record-publish-${id}`);
      assert.equal(row?.status, "ready");
      assert.equal(row?.visibility, "private");
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record rollback does not require routeable source", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecord(db, {
      status: "published",
      visibility: "public",
    });
    db.rows("documents").find((row) => row.id === "doc-public")!.visibility = "private";

    const response = await requestJson<OwnerPublicSeminarRecordResponse>(
      app,
      "POST",
      "/events/seminars/records/record-public/transition",
      { token: "owner-token", body: { status: "ready" } }
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.record.status, "ready");
    assert.equal(response.body.record.visibility, "private");
    assert.equal(response.body.record.publicDocumentHref, null);
    assert.equal(db.rows("public_seminar_records").find((row) => row.id === "record-public")?.status, "ready");
    assert.equal(db.rows("public_seminar_records").find((row) => row.id === "record-public")?.visibility, "private");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record transition rejects unsupported payloads and states", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecord(db);
    seedOwnerSeminarRecord(db, { id: "record-ready", source_id: "doc-ready", status: "ready" }, { id: "doc-ready" });
    seedOwnerSeminarRecord(db, { id: "record-published", source_id: "doc-published", status: "published" }, { id: "doc-published" });
    seedOwnerSeminarRecord(db, { id: "record-published-public", source_id: "doc-published-public", status: "published", visibility: "public" }, { id: "doc-published-public" });
    seedOwnerSeminarRecord(db, { id: "record-cancelled", source_id: "doc-cancelled", status: "cancelled" }, { id: "doc-cancelled" });
    seedOwnerSeminarRecord(db, { id: "record-public-visibility", source_id: "doc-public-visibility", visibility: "public" }, { id: "doc-public-visibility" });
    seedOwnerSeminarRecord(db, { id: "record-thread", source_type: "thread", source_id: "thread-public" });

    const invalidRequests = [
      { body: { status: "published" }, recordId: "record-public" },
      { body: { status: "cancelled" }, recordId: "record-public" },
      { body: { status: "ready", visibility: "public" }, recordId: "record-public" },
      { body: { status: "published", visibility: "public" }, recordId: "record-ready" },
      { body: { status: "ready", sourceId: "doc-public" }, recordId: "record-public" },
      { body: { status: "ready", title: "Client title" }, recordId: "record-public" },
      { body: { status: "ready", summary: "Client summary" }, recordId: "record-public" },
      { body: { status: "published", title: "Client title" }, recordId: "record-ready" },
      { body: { status: "published", summary: "Client summary" }, recordId: "record-ready" },
      { body: { status: "published", sourceId: "doc-public" }, recordId: "record-ready" },
      { body: { status: "published", ownerUserId: "owner-user" }, recordId: "record-ready" },
      { body: { status: "published", discussionThreadId: "thread-discussion" }, recordId: "record-ready" },
      { body: { state: "ready" }, recordId: "record-public" },
      { body: { status: "ready" }, recordId: "record-published" },
      { body: { status: "draft" }, recordId: "record-published-public" },
      { body: { status: "ready" }, recordId: "record-cancelled" },
      { body: { status: "published" }, recordId: "record-cancelled" },
      { body: { status: "ready" }, recordId: "record-public-visibility" },
      { body: { status: "published" }, recordId: "record-public-visibility" },
      { body: { status: "ready" }, recordId: "record-thread" },
      { body: { status: "published" }, recordId: "record-thread" },
    ];

    for (const { body, recordId } of invalidRequests) {
      const response = await requestJson(app, "POST", `/events/seminars/records/${recordId}/transition`, {
        token: "owner-token",
        body,
      });
      assert.equal(response.status, 400, `${recordId} ${JSON.stringify(body)} should be rejected`);
      assert.deepEqual(response.body, {
        error: "Unsupported seminar draft status.",
        code: "seminar_record_invalid_transition",
      });
    }
    assert.equal(db.rows("public_seminar_records").find((row) => row.id === "record-public")?.status, "draft");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner seminar record transition storage failures return bounded errors", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecord(db);

    db.failNext(
      "public_seminar_records",
      "select",
      "table=public_seminar_records owner_user_id=owner-user source_id=doc-public stack trace"
    );
    const failedLoad = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      token: "owner-token",
      body: { status: "ready" },
    });
    assert.equal(failedLoad.status, 503);

    db.failNext(
      "documents",
      "select",
      "table=documents author_user_id=owner-user source_id=doc-public provider payload stack trace"
    );
    const failedSource = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      token: "owner-token",
      body: { status: "ready" },
    });
    assert.equal(failedSource.status, 503);

    db.failNext(
      "public_seminar_records",
      "update",
      "table=public_seminar_records owner_user_id=owner-user source_id=doc-public stack trace"
    );
    const failedUpdate = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      token: "owner-token",
      body: { status: "ready" },
    });
    assert.equal(failedUpdate.status, 503);

    db.rows("public_seminar_records").find((row) => row.id === "record-public")!.status = "ready";
    db.failNext(
      "documents",
      "select",
      "table=documents author_user_id=owner-user source_id=doc-public provider payload stack trace"
    );
    const failedPublishSource = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      token: "owner-token",
      body: { status: "published" },
    });
    assert.equal(failedPublishSource.status, 503);

    db.failNext(
      "public_seminar_records",
      "update",
      "table=public_seminar_records owner_user_id=owner-user source_id=doc-public stack trace"
    );
    const failedPublishUpdate = await requestJson(app, "POST", "/events/seminars/records/record-public/transition", {
      token: "owner-token",
      body: { status: "published" },
    });
    assert.equal(failedPublishUpdate.status, 503);

    for (const body of [
      failedLoad.body,
      failedSource.body,
      failedUpdate.body,
      failedPublishSource.body,
      failedPublishUpdate.body,
    ]) {
      assert.deepEqual(body, {
        error: "Could not update seminar draft status.",
        code: "seminar_record_transition_unavailable",
      });
    }

    const json = JSON.stringify({
      failedLoad: failedLoad.body,
      failedSource: failedSource.body,
      failedUpdate: failedUpdate.body,
      failedPublishSource: failedPublishSource.body,
      failedPublishUpdate: failedPublishUpdate.body,
    });
    for (const forbidden of [
      "public_seminar_records",
      "documents",
      "owner-user",
      "doc-public",
      "source_id",
      "owner_user_id",
      "author_user_id",
      "provider payload",
      "stack trace",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("durable public seminar serializer emits safe published public document cards", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    seedOwnerSeminarRecordSource(db, {
      id: "doc-public",
      title: "Source title should not be used",
      body: "Source body should not be used.",
      author_user_id: "owner-user",
    });
    seedPublicSeminarDiscussion(db, {
      id: "thread-discussion",
      linked_document_id: "doc-public",
    });
    const record = db.insertRow("public_seminar_records", {
      id: "record-secret-id",
      owner_user_id: "owner-user",
      source_type: "document",
      source_id: "doc-public",
      title: "Durable title Bearer super-token cookie=session authorization=header source_id=doc-public owner_user_id=owner-user discussion_thread_id=thread-discussion 10.0.0.1 550e8400-e29b-41d4-a716-446655440000 stack trace secret=value",
      summary: "Summary token=abc password=hunter2 source_id=doc-public owner_user_id=owner-user discussion_thread_id=thread-discussion 10.0.0.2 stack trace secret=value",
      status: "published",
      visibility: "public",
      discussion_thread_id: "thread-discussion",
      created_at: "2026-07-05T11:00:00.000Z",
      updated_at: "2026-07-05T12:00:00.000Z",
    });
    db.rows("spaces").find((row) => row.id === "space-public")!.title =
      "Station House cookie=session source_id=doc-public owner_user_id=owner-user secret=value";

    const resolved = await resolveDurablePublicSeminarRecordCard(db.client as any, record);

    assert.ok(resolved);
    assert.equal(resolved.sourceType, "document");
    assert.equal(resolved.sourceId, "doc-public");
    assert.equal(seminarInterestKey(resolved), "document:doc-public");
    assert.equal(resolved.card.id, durablePublicSeminarCardId("record-secret-id"));
    assert.match(resolved.card.id, /^seminar_[a-f0-9]{16}$/);
    assert.equal(resolved.card.id.includes("record-secret-id"), false);
    assert.equal(resolved.card.label, "Public seminar");
    assert.equal(resolved.card.href, "/space/station-house/documents/doc-public");
    assert.equal(resolved.card.discussionHref, "/forums/seminar-room/thread-discussion");
    assert.equal(resolved.card.featuredAt, "2026-07-05T12:00:00.000Z");
    assert.equal(resolved.card.publishedAt, "2026-07-05T12:00:00.000Z");
    assert.equal(resolved.card.interestCount, 0);
    assert.deepEqual(resolved.card.space, {
      title: "Station House [redacted] [redacted] [redacted] [redacted]",
      href: "/space/station-house",
    });

    const json = JSON.stringify(resolved.card);
    for (const forbidden of [
      "record-secret-id",
      "owner-user",
      "owner_user_id",
      "source_id",
      "discussion_thread_id",
      "Bearer",
      "super-token",
      "cookie=session",
      "authorization=header",
      "token=abc",
      "password=hunter2",
      "secret=value",
      "10.0.0.1",
      "10.0.0.2",
      "550e8400-e29b-41d4-a716-446655440000",
      "stack trace",
      "Source body should not be used",
      "Source title should not be used",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("durable public seminar serializer rejects ineligible records and sources", async () => {
  const scenarios: Array<{
    name: string;
    record?: Row;
    source?: Row;
    space?: Row;
  }> = [
    { name: "missing record id", record: { id: "" } },
    { name: "draft record", record: { status: "draft", visibility: "public" } },
    { name: "ready record", record: { status: "ready", visibility: "public" } },
    { name: "cancelled record", record: { status: "cancelled", visibility: "public" } },
    { name: "private record", record: { status: "published", visibility: "private" } },
    { name: "non-document record", record: { source_type: "thread", status: "published", visibility: "public" } },
    { name: "private source", source: { visibility: "private" } },
    { name: "community source", source: { visibility: "community" } },
    { name: "unlisted source", source: { visibility: "unlisted" } },
    { name: "draft source", source: { status: "draft" } },
    { name: "archived source", source: { status: "archived" } },
    { name: "no Space", source: { space_id: null } },
    {
      name: "private Space",
      source: { space_id: "space-private" },
      space: { id: "space-private", slug: "private-house", is_public: false },
    },
    {
      name: "unsafe UUID Space",
      source: { space_id: "space-uuid" },
      space: { id: "space-uuid", slug: "550e8400-e29b-41d4-a716-446655440000", is_public: true },
    },
    {
      name: "unsafe slug Space",
      source: { space_id: "space-bad-slug" },
      space: { id: "space-bad-slug", slug: "Bad Slug!", is_public: true },
    },
    { name: "owner mismatch", source: { author_user_id: "member-user" } },
  ];

  for (const scenario of scenarios) {
    const db = new InMemorySupabase();
    if (scenario.space) db.insertRow("spaces", scenario.space);
    const source = seedOwnerSeminarRecordSource(db, {
      id: "doc-public",
      author_user_id: "owner-user",
      ...scenario.source,
    });
    const record = db.insertRow("public_seminar_records", {
      id: `record-${scenario.name.replace(/\W+/g, "-")}`,
      owner_user_id: "owner-user",
      source_type: "document",
      source_id: source.id,
      status: "published",
      visibility: "public",
      ...scenario.record,
    });

    const resolved = await resolveDurablePublicSeminarRecordCard(db.client as any, record);
    assert.equal(resolved, null, scenario.name);
  }
});

test("durable public seminar serializer only links public routeable discussions", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    seedOwnerSeminarRecordSource(db, { id: "doc-public", author_user_id: "owner-user" });
    db.insertRow("forum_categories", {
      id: "category-unsafe",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe Category",
    });
    db.insertRow("forum_categories", {
      id: "category-private",
      slug: "private-seminar",
      title: "Private Seminar",
    });
    db.insertRow("community_subcommunities", {
      id: "subcommunity-private",
      category_id: "category-private",
      slug: "private-seminar",
      title: "Private Seminar",
      visibility: "community",
      status: "active",
    });

    seedPublicSeminarDiscussion(db, { id: "thread-public", linked_document_id: "doc-public" });
    seedPublicSeminarDiscussion(db, { id: "thread-hidden", linked_document_id: "doc-public", is_hidden: true });
    seedPublicSeminarDiscussion(db, { id: "thread-wrong-document", linked_document_id: "doc-other" });
    seedPublicSeminarDiscussion(db, {
      id: "thread-unsafe-category",
      linked_document_id: "doc-public",
      category_id: "category-unsafe",
    });
    seedPublicSeminarDiscussion(db, {
      id: "thread-private-subcommunity",
      linked_document_id: "doc-public",
      category_id: "category-private",
    });

    const baseRecord = {
      id: "record-public-discussion",
      owner_user_id: "owner-user",
      source_type: "document",
      source_id: "doc-public",
      status: "published",
      visibility: "public",
      title: "Public discussion contract",
    };

    const publicResolved = await resolveDurablePublicSeminarRecordCard(db.client as any, {
      ...baseRecord,
      discussion_thread_id: "thread-public",
    });
    assert.equal(publicResolved?.card.discussionHref, "/forums/seminar-room/thread-public");

    for (const discussion_thread_id of [
      "thread-hidden",
      "thread-wrong-document",
      "thread-unsafe-category",
      "thread-private-subcommunity",
      "thread-missing",
    ]) {
      const resolved = await resolveDurablePublicSeminarRecordCard(db.client as any, {
        ...baseRecord,
        id: `record-${discussion_thread_id}`,
        discussion_thread_id,
      });
      assert.ok(resolved, `${discussion_thread_id} should still serialize the document card`);
      assert.equal(resolved.card.discussionHref, null, `${discussion_thread_id} should not link`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("durable public seminar merge contract dedupes by source interest key", () => {
  const sourceDocument = resolvedSeminarCard("document", "doc-1", "Source document", "2026-07-05T10:00:00.000Z");
  const sourceThread = resolvedSeminarCard("thread", "thread-1", "Source thread", "2026-07-05T09:00:00.000Z");
  const sourceSpace = resolvedSeminarCard("space", "space-1", "Source Space", "2026-07-05T08:00:00.000Z");
  const malformedDurableThread = resolvedSeminarCard("thread", "thread-1", "Malformed durable thread", "2026-07-05T14:00:00.000Z");
  const malformedDurableSpace = resolvedSeminarCard("space", "space-1", "Malformed durable Space", "2026-07-05T14:00:00.000Z");
  const durableDocument = {
    ...resolvedSeminarCard("document", "doc-1", "Durable document", "2026-07-05T12:00:00.000Z"),
    card: {
      ...resolvedSeminarCard("document", "doc-1", "Durable document", "2026-07-05T12:00:00.000Z").card,
      id: durablePublicSeminarCardId("record-doc-1"),
      label: "Public seminar",
    },
  };
  const durableOnly = {
    ...resolvedSeminarCard("document", "doc-2", "Durable only", "2026-07-05T13:00:00.000Z"),
    card: {
      ...resolvedSeminarCard("document", "doc-2", "Durable only", "2026-07-05T13:00:00.000Z").card,
      id: durablePublicSeminarCardId("record-doc-2"),
      label: "Public seminar",
    },
  };
  const olderDurableDuplicate = {
    ...resolvedSeminarCard("document", "doc-2", "Older durable only", "2026-07-05T11:00:00.000Z"),
    card: {
      ...resolvedSeminarCard("document", "doc-2", "Older durable only", "2026-07-05T11:00:00.000Z").card,
      id: durablePublicSeminarCardId("record-doc-2-older"),
      label: "Public seminar",
    },
  };

  const merged = mergePublicSeminarCardsWithDurableCards(
    [sourceDocument, sourceThread, sourceSpace],
    [olderDurableDuplicate, malformedDurableThread, malformedDurableSpace, durableOnly, durableDocument],
    10
  );

  assert.deepEqual(merged.map((resolved) => resolved.card.title), [
    "Durable document",
    "Source thread",
    "Source Space",
    "Durable only",
  ]);
  assert.equal(merged[0].card.id, durablePublicSeminarCardId("record-doc-1"));
  assert.equal(merged[1].card.id, sourceThread.card.id);
  assert.equal(merged[2].card.id, sourceSpace.card.id);
  assert.equal(merged[3].card.id, durablePublicSeminarCardId("record-doc-2"));
  assert.equal(seminarInterestKey(merged[0]), "document:doc-1");
  assert.equal(seminarInterestKey(merged[3]), "document:doc-2");

  const limited = mergePublicSeminarCardsWithDurableCards(
    [sourceDocument, sourceThread, sourceSpace],
    [durableOnly, durableDocument],
    2
  );
  assert.deepEqual(limited.map((resolved) => resolved.card.title), ["Durable document", "Source thread"]);
});

test("public seminar readback ignores durable records until enabled in a later lane", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedOwnerSeminarRecordSource(db, { id: "doc-public", author_user_id: "owner-user" });
    const record = db.insertRow("public_seminar_records", {
      id: "record-published-public",
      owner_user_id: "owner-user",
      source_type: "document",
      source_id: "doc-public",
      title: "Durable public seminar",
      summary: "This should not appear until durable readback is enabled.",
      status: "published",
      visibility: "public",
    });

    const empty = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars?limit=20");
    assert.equal(empty.status, 200);
    assert.equal(empty.body.source, "discover_feed_featured");
    assert.deepEqual(empty.body.cards, []);

    seedFeatured(db, "document", "doc-public");
    const sourceDerived = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars?limit=20");
    assert.equal(sourceDerived.status, 200);
    assert.equal(sourceDerived.body.source, "discover_feed_featured");
    assert.equal(sourceDerived.body.cards.length, 1);
    assert.equal(sourceDerived.body.cards[0].label, "Published readback");
    assert.notEqual(sourceDerived.body.cards[0].id, durablePublicSeminarCardId(record.id));

    const marked = await requestJson<PublicSeminarInterestResponse>(
      app,
      "POST",
      `/events/seminars/${sourceDerived.body.cards[0].id}/interest`,
      { token: "owner-token" }
    );
    assert.equal(marked.status, 200);
    assert.equal(db.rows("public_seminar_interests")[0].source_type, "document");
    assert.equal(db.rows("public_seminar_interests")[0].source_id, "doc-public");
    assert.equal(db.rows("public_seminar_interests")[0].source_id === record.id, false);

    const withdrawn = await requestJson<PublicSeminarInterestResponse>(
      app,
      "DELETE",
      `/events/seminars/${sourceDerived.body.cards[0].id}/interest`,
      { token: "owner-token" }
    );
    assert.equal(withdrawn.status, 200);
    assert.equal(db.rows("public_seminar_interests").length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("durable public seminar serializer storage failures are bounded", async () => {
  const db = new InMemorySupabase();
  const record = seedOwnerSeminarRecord(db, {
    id: "record-public",
    status: "published",
    visibility: "public",
  });

  db.failNext(
    "documents",
    "select",
    "table=documents owner_user_id=owner-user source_id=doc-public stack trace storage_path=secret"
  );

  await assert.rejects(
    resolveDurablePublicSeminarRecordCard(db.client as any, record),
    (error: any) => {
      assert.equal(error.message, "Could not resolve durable seminar source.");
      for (const forbidden of [
        "documents",
        "owner-user",
        "doc-public",
        "source_id",
        "storage_path",
        "secret",
        "stack trace",
      ]) {
        assert.equal(error.message.includes(forbidden), false, `${forbidden} leaked`);
      }
      return true;
    }
  );
});

test("durable public seminar helper is not wired into public sourcing or interests", () => {
  const routeSource = readFileSync("apps/api/src/routes/events.ts", "utf8");
  const loadStart = routeSource.indexOf("async function loadPublicSeminarCards");
  const targetStart = routeSource.indexOf("async function resolvePublicSeminarTargetByCardId");
  const cardStart = routeSource.indexOf("async function resolvePublicSeminarCard");
  const postInterestStart = routeSource.indexOf('eventsRouter.post("/seminars/:seminarId/interest"');
  const transitionHelperStart = routeSource.indexOf("function transitionTarget");

  assert.notEqual(loadStart, -1);
  assert.notEqual(targetStart, -1);
  assert.notEqual(cardStart, -1);
  assert.notEqual(postInterestStart, -1);
  assert.notEqual(transitionHelperStart, -1);
  assert.equal(postInterestStart < transitionHelperStart, true);
  assert.match(routeSource, /source:\s*"discover_feed_featured"/);
  assert.match(routeSource, /export async function resolveDurablePublicSeminarRecordCard/);

  const loadPublicSource = routeSource.slice(loadStart, targetStart);
  assert.doesNotMatch(loadPublicSource, /public_seminar_records/);
  assert.doesNotMatch(loadPublicSource, /resolveDurablePublicSeminarRecordCard/);
  assert.doesNotMatch(loadPublicSource, /mergePublicSeminarCardsWithDurableCards/);

  const targetLookupSource = routeSource.slice(targetStart, cardStart);
  assert.doesNotMatch(targetLookupSource, /public_seminar_records/);
  assert.doesNotMatch(targetLookupSource, /durablePublicSeminarCardId/);

  const interestRouteSource = routeSource.slice(postInterestStart, transitionHelperStart);
  assert.doesNotMatch(interestRouteSource, /public_seminar_records/);
  assert.doesNotMatch(interestRouteSource, /durablePublicSeminarCardId/);
  assert.doesNotMatch(interestRouteSource, /resolveDurablePublicSeminarRecordCard/);
});

test("public seminar readback returns only public routeable featured bundles", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    db.insertRow("spaces", {
      id: "space-public",
      slug: "station-house",
      title: "Station House",
      short_description: "A public Space for seminar readbacks.",
      is_public: true,
    });
    db.insertRow("spaces", {
      id: "space-private",
      slug: "private-house",
      title: "Private House",
      short_description: "Private source body should not leak.",
      is_public: false,
    });
    db.insertRow("spaces", {
      id: "space-unsafe",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe Space",
      is_public: true,
    });
    db.insertRow("forum_categories", {
      id: "category-public",
      slug: "seminar-room",
      title: "Seminar Room",
    });
    db.insertRow("forum_categories", {
      id: "category-unsafe",
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Unsafe Category",
    });
    db.insertRow("forum_categories", {
      id: "category-private",
      slug: "private-seminar",
      title: "Private Seminar",
    });
    db.insertRow("community_subcommunities", {
      id: "subcommunity-private",
      category_id: "category-private",
      slug: "private-seminar",
      title: "Private Seminar",
      visibility: "community",
      status: "active",
    });
    db.insertRow("documents", {
      id: "doc-public",
      title: "Public Readback Notes",
      body: "Public excerpt about careful seminar preparation.",
      status: "published",
      visibility: "public",
      space_id: "space-public",
      discussion_thread_id: "thread-discussion",
    });
    db.insertRow("documents", {
      id: "doc-private",
      title: "Private Runtime Notes",
      body: "Private memory archive canon continuity integrity payload.",
      status: "published",
      visibility: "private",
      space_id: "space-public",
    });
    db.insertRow("documents", {
      id: "doc-community",
      title: "Community Notes",
      body: "Community-only body.",
      status: "published",
      visibility: "community",
      space_id: "space-public",
    });
    db.insertRow("documents", {
      id: "doc-private-space",
      title: "Public Row In Private Space",
      body: "Hidden by private Space.",
      status: "published",
      visibility: "public",
      space_id: "space-private",
    });
    db.insertRow("documents", {
      id: "doc-unsafe-space",
      title: "Unsafe Space Document",
      body: "Unsafe route.",
      status: "published",
      visibility: "public",
      space_id: "space-unsafe",
    });
    db.insertRow("threads", {
      id: "thread-discussion",
      title: "Public Document Discussion",
      body: "Public follow-up discussion.",
      category_id: "category-public",
      linked_document_id: "doc-public",
    });
    db.insertRow("threads", {
      id: "thread-public",
      title: "Open Seminar Thread",
      body: "Public questions for the seminar.",
      category_id: "category-public",
    });
    db.insertRow("threads", {
      id: "thread-hidden",
      title: "Hidden Thread",
      body: "Hidden source body.",
      category_id: "category-public",
      is_hidden: true,
    });
    db.insertRow("threads", {
      id: "thread-community",
      title: "Community Thread",
      body: "Community-only source body.",
      category_id: "category-public",
      visibility: "community",
    });
    db.insertRow("threads", {
      id: "thread-unsafe-category",
      title: "Unsafe Category Thread",
      body: "Unsafe category body.",
      category_id: "category-unsafe",
    });
    db.insertRow("threads", {
      id: "thread-private-subcommunity",
      title: "Private Subcommunity Thread",
      body: "Private subcommunity source body.",
      category_id: "category-private",
    });

    for (const [type, id] of [
      ["document", "doc-public"],
      ["thread", "thread-public"],
      ["space", "space-public"],
      ["document", "doc-private"],
      ["document", "doc-community"],
      ["document", "doc-private-space"],
      ["document", "doc-unsafe-space"],
      ["thread", "thread-hidden"],
      ["thread", "thread-community"],
      ["thread", "thread-unsafe-category"],
      ["thread", "thread-private-subcommunity"],
      ["space", "space-private"],
      ["space", "space-unsafe"],
      ["persona", "persona-public"],
      ["document", "doc-missing"],
    ]) {
      seedFeatured(db, type, id);
    }

    const response = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars?limit=20");
    assert.equal(response.status, 200);

    const cards = response.body.cards;
    assert.deepEqual(cards.map((card) => card.sourceType).sort(), ["document", "space", "thread"]);
    for (const card of cards) {
      assert.match(card.id, /^seminar_[a-f0-9]{16}$/);
      assert.equal(card.id.includes("doc-public"), false);
      assert.equal(card.id.includes("thread-public"), false);
      assert.equal(card.id.includes("space-public"), false);
      assert.equal(card.interestCount, 0);
      assert.equal("viewerInterested" in card, false);
    }

    const document = cards.find((card) => card.sourceType === "document")!;
    assert.equal(document.sourceType, "document");
    assert.equal(document.href, "/space/station-house/documents/doc-public");
    assert.equal(document.discussionHref, "/forums/seminar-room/thread-discussion");
    assert.equal(document.description, "Public excerpt about careful seminar preparation.");
    assert.deepEqual(document.space, {
      title: "Station House",
      href: "/space/station-house",
    });

    const thread = cards.find((card) => card.sourceType === "thread")!;
    assert.equal(thread.sourceType, "thread");
    assert.equal(thread.href, "/forums/seminar-room/thread-public");
    assert.equal(thread.discussionHref, null);

    const space = cards.find((card) => card.sourceType === "space")!;
    assert.equal(space.sourceType, "space");
    assert.equal(space.href, "/space/station-house");

    const json = JSON.stringify(response.body);
    for (const forbidden of [
      "Private Runtime Notes",
      "Private memory archive",
      "Community Notes",
      "Community-only",
      "Public Row In Private Space",
      "Hidden Thread",
      "Hidden source body",
      "Unsafe Category Thread",
      "Unsafe category body",
      "Private Subcommunity Thread",
      "Private subcommunity source body",
      "private-seminar",
      "private-house",
      "550e8400-e29b-41d4-a716-446655440000",
      "Curated private-note-shaped",
      "/private/internal/path",
      "owner_user_id",
      "storage_path",
      "provider payload",
      "secret",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("signed-in seminar interest is idempotent, private to the viewer, and withdrawable", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedPublicSeminarFixture(db);

    const signedOut = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars");
    assert.equal(signedOut.status, 200);
    assert.equal(signedOut.body.cards.length, 1);
    const seminarId = signedOut.body.cards[0].id;
    assert.equal(signedOut.body.cards[0].interestCount, 0);
    assert.equal("viewerInterested" in signedOut.body.cards[0], false);

    const unauthenticated = await requestJson(app, "POST", `/events/seminars/${seminarId}/interest`);
    assert.equal(unauthenticated.status, 401);

    const marked = await requestJson<PublicSeminarInterestResponse>(
      app,
      "POST",
      `/events/seminars/${seminarId}/interest`,
      { token: "owner-token" }
    );
    assert.equal(marked.status, 200);
    assert.equal(marked.body.card.id, seminarId);
    assert.equal(marked.body.card.interestCount, 1);
    assert.equal(marked.body.card.viewerInterested, true);
    assert.equal(db.rows("public_seminar_interests").length, 1);

    const duplicate = await requestJson<PublicSeminarInterestResponse>(
      app,
      "POST",
      `/events/seminars/${seminarId}/interest`,
      { token: "owner-token" }
    );
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.card.interestCount, 1);
    assert.equal(db.rows("public_seminar_interests").length, 1);

    const otherViewer = await requestJson<PublicSeminarsResponse>(
      app,
      "GET",
      "/events/seminars",
      { token: "member-token" }
    );
    assert.equal(otherViewer.status, 200);
    assert.equal(otherViewer.body.cards[0].interestCount, 1);
    assert.equal(otherViewer.body.cards[0].viewerInterested, false);

    const otherMarked = await requestJson<PublicSeminarInterestResponse>(
      app,
      "POST",
      `/events/seminars/${seminarId}/interest`,
      { token: "member-token" }
    );
    assert.equal(otherMarked.status, 200);
    assert.equal(otherMarked.body.card.interestCount, 2);
    assert.equal(otherMarked.body.card.viewerInterested, true);

    const withdrawn = await requestJson<PublicSeminarInterestResponse>(
      app,
      "DELETE",
      `/events/seminars/${seminarId}/interest`,
      { token: "owner-token" }
    );
    assert.equal(withdrawn.status, 200);
    assert.equal(withdrawn.body.card.interestCount, 1);
    assert.equal(withdrawn.body.card.viewerInterested, false);
    assert.equal(
      db.rows("public_seminar_interests").some((row) => row.user_id === "owner-user"),
      false
    );

    const repeatedWithdraw = await requestJson<PublicSeminarInterestResponse>(
      app,
      "DELETE",
      `/events/seminars/${seminarId}/interest`,
      { token: "owner-token" }
    );
    assert.equal(repeatedWithdraw.status, 200);
    assert.equal(repeatedWithdraw.body.card.interestCount, 1);
    assert.equal(repeatedWithdraw.body.card.viewerInterested, false);

    const json = JSON.stringify(repeatedWithdraw.body);
    for (const forbidden of [
      "sourceId",
      "source_id",
      "user_id",
      "owner-user",
      "member-user",
      "owner@example.test",
      "member@example.test",
      "public_seminar_interests",
      "attendee",
    ]) {
      assert.equal(json.includes(forbidden), false, `${forbidden} leaked`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public seminar cards still render when interest readback storage is unavailable", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedPublicSeminarFixture(db);
    db.failNext(
      "public_seminar_interests",
      "select",
      "table=public_seminar_interests source_id=doc-public stack trace"
    );

    const response = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars");

    assert.equal(response.status, 200);
    assert.equal(response.body.cards.length, 1);
    assert.equal(response.body.cards[0].sourceType, "document");
    assert.equal(response.body.cards[0].interestCount, 0);
    assert.equal("viewerInterested" in response.body.cards[0], false);

    const json = JSON.stringify(response.body);
    assert.equal(json.includes("public_seminar_interests"), false);
    assert.equal(json.includes("doc-public stack trace"), false);

    db.failNext(
      "public_seminar_interests",
      "select",
      "table=public_seminar_interests user_id=owner-user stack trace"
    );
    const signedIn = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars", {
      token: "owner-token",
    });
    assert.equal(signedIn.status, 200);
    assert.equal(signedIn.body.cards.length, 1);
    assert.equal(signedIn.body.cards[0].interestCount, 0);
    assert.equal("viewerInterested" in signedIn.body.cards[0], false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("seminar interest fails closed for stale or private targets", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedPublicSeminarFixture(db);
    const response = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars");
    const seminarId = response.body.cards[0].id;

    const invalid = await requestJson(app, "POST", "/events/seminars/not-a-seminar/interest", {
      token: "owner-token",
    });
    assert.equal(invalid.status, 404);
    assert.deepEqual(invalid.body, {
      error: "Seminar not found.",
      code: "seminar_not_found",
    });

    db.rows("documents").find((row) => row.id === "doc-public")!.visibility = "private";
    const privateTarget = await requestJson(app, "POST", `/events/seminars/${seminarId}/interest`, {
      token: "owner-token",
    });
    assert.equal(privateTarget.status, 404);
    assert.deepEqual(privateTarget.body, {
      error: "Seminar not found.",
      code: "seminar_not_found",
    });
    assert.equal(db.rows("public_seminar_interests").length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public seminar readback failures return bounded public errors", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    db.failNext(
      "discover_feed",
      "select",
      "table=discover_feed storage_path=secret/provider-payload private-source-body stack trace"
    );
    const response = await requestJson(app, "GET", "/events/seminars");
    assert.equal(response.status, 503);
    assert.deepEqual(response.body, {
      error: "Could not load public seminars.",
      code: "live_events_unavailable",
    });
    const json = JSON.stringify(response.body);
    assert.equal(json.includes("discover_feed"), false);
    assert.equal(json.includes("storage_path"), false);
    assert.equal(json.includes("private-source-body"), false);
    assert.equal(json.includes("stack trace"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("seminar interest mutation failures return bounded errors", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createEventsApp();

  try {
    seedPublicSeminarFixture(db);
    const response = await requestJson<PublicSeminarsResponse>(app, "GET", "/events/seminars");
    const seminarId = response.body.cards[0].id;

    db.failNext(
      "public_seminar_interests",
      "upsert",
      "table=public_seminar_interests user_id=owner-user source_id=doc-public stack trace"
    );
    const failed = await requestJson(app, "POST", `/events/seminars/${seminarId}/interest`, {
      token: "owner-token",
    });

    assert.equal(failed.status, 503);
    assert.deepEqual(failed.body, {
      error: "Could not update seminar interest.",
      code: "seminar_interest_unavailable",
    });
    const json = JSON.stringify(failed.body);
    assert.equal(json.includes("public_seminar_interests"), false);
    assert.equal(json.includes("owner-user"), false);
    assert.equal(json.includes("doc-public"), false);
    assert.equal(json.includes("stack trace"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
