import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import type { PublicSeminarInterestResponse, PublicSeminarsResponse } from "@station/types";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { eventsRouter } from "./events";

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

    return row;
  }
}

class QueryBuilder {
  private operation: "select" | "upsert" | "delete" = "select";
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private mutationPayload: Row | null = null;
  private onConflict: string[] = [];

  constructor(private db: InMemorySupabase, private table: string) {}

  select() {
    return this;
  }

  upsert(payload: Row, options: { onConflict?: string } = {}) {
    this.operation = "upsert";
    this.mutationPayload = payload;
    this.onConflict = options.onConflict?.split(",").map((field) => field.trim()).filter(Boolean) ?? [];
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
