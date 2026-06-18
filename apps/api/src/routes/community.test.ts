import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { commentsRouter } from "./comments";
import { discoverRouter } from "./discover";
import { documentsRouter } from "./documents";
import { forumsRouter } from "./forums";
import { threadsRouter } from "./threads";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const MEMBER_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ID = "33333333-3333-4333-8333-333333333333";
const ADMIN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const CATEGORY_ID = "44444444-4444-4444-8444-444444444444";
const PUBLIC_SPACE_ID = "55555555-5555-4555-8555-555555555551";
const PRIVATE_SPACE_ID = "55555555-5555-4555-8555-555555555552";
const OTHER_SPACE_ID = "55555555-5555-4555-8555-555555555553";
const PUBLIC_PAGE_ID = "66666666-6666-4666-8666-666666666661";
const PRIVATE_PAGE_ID = "66666666-6666-4666-8666-666666666662";
const PUBLIC_PERSONA_ID = "77777777-7777-4777-8777-777777777771";
const PRIVATE_PERSONA_ID = "77777777-7777-4777-8777-777777777772";
const OTHER_PERSONA_ID = "77777777-7777-4777-8777-777777777773";
const PUBLIC_DOC_ID = "88888888-8888-4888-8888-888888888881";
const COMMUNITY_DOC_ID = "88888888-8888-4888-8888-888888888882";
const UNLISTED_DOC_ID = "88888888-8888-4888-8888-888888888883";
const PRIVATE_DOC_ID = "88888888-8888-4888-8888-888888888884";
const OTHER_PRIVATE_DOC_ID = "88888888-8888-4888-8888-888888888885";
const LOCKED_THREAD_ID = "99999999-9999-4999-8999-999999999991";
const HIDDEN_THREAD_ID = "99999999-9999-4999-8999-999999999992";
const PUBLIC_THREAD_ID = "99999999-9999-4999-8999-999999999993";
const COMMUNITY_THREAD_ID = "99999999-9999-4999-8999-999999999994";
const PUBLIC_DEV_SPACE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const COMMUNITY_DEV_SPACE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const PRIVATE_DEV_SPACE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3";
const UNLISTED_DEV_SPACE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4";

class CommunitySupabase {
  rpcWithoutCatch = false;

  tables: Record<string, Row[]> = {
    profiles: [
      profile(OWNER_ID, "owner", "creator"),
      profile(MEMBER_ID, "member", "private"),
      profile(OTHER_ID, "other", "creator"),
      profile(ADMIN_ID, "admin", "canon", true),
    ],
    spaces: [
      space(PUBLIC_SPACE_ID, "public-space", true),
      space(PRIVATE_SPACE_ID, "private-space", false),
      { ...space(OTHER_SPACE_ID, "other-space", false), owner_user_id: OTHER_ID },
    ],
    space_pages: [
      page(PUBLIC_PAGE_ID, PUBLIC_SPACE_ID, true, true),
      page(PRIVATE_PAGE_ID, PRIVATE_SPACE_ID, true, true),
    ],
    personas: [
      persona(PUBLIC_PERSONA_ID, OWNER_ID, "Public Persona", "public"),
      persona(PRIVATE_PERSONA_ID, OWNER_ID, "Private Persona", "private"),
      persona(OTHER_PERSONA_ID, OTHER_ID, "Other Persona", "public"),
    ],
    documents: [
      document(PUBLIC_DOC_ID, "Public Document", "public-document", "public"),
      document(COMMUNITY_DOC_ID, "Community Document", "community-document", "community"),
      document(UNLISTED_DOC_ID, "Unlisted Document", "unlisted-document", "unlisted"),
      document(PRIVATE_DOC_ID, "Private Aurora Document", "private-document", "private"),
      document(OTHER_PRIVATE_DOC_ID, "Other Aurora Document", "other-private-document", "private", {
        author_user_id: OTHER_ID,
        persona_id: OTHER_PERSONA_ID,
        source_persona_id: OTHER_PERSONA_ID,
      }),
    ],
    document_versions: [],
    continuity_records: [
      privateSearchRow("continuity-owner", "Aurora continuity record", OWNER_ID, PUBLIC_PERSONA_ID, {
        record_type: "timeline",
        summary: "Owner-only continuity marker.",
        visibility: "private",
      }),
      privateSearchRow("continuity-other", "Other Aurora continuity record", OTHER_ID, OTHER_PERSONA_ID, {
        record_type: "timeline",
        summary: "Other-owner continuity marker.",
        visibility: "private",
      }),
    ],
    memory_items: [
      privateSearchRow("memory-owner", "Aurora memory", OWNER_ID, PUBLIC_PERSONA_ID, {
        summary: "Owner-only runtime memory.",
        source_type: "manual",
        relevance_weight: 3,
      }),
      privateSearchRow("memory-other", "Other Aurora memory", OTHER_ID, OTHER_PERSONA_ID, {
        summary: "Other-owner runtime memory.",
        source_type: "manual",
        relevance_weight: 3,
      }),
    ],
    canon_items: [
      privateSearchRow("canon-owner", "Aurora canon", OWNER_ID, PUBLIC_PERSONA_ID, {
        source_type: "manual",
        priority: 8,
      }),
      privateSearchRow("canon-other", "Other Aurora canon", OTHER_ID, OTHER_PERSONA_ID, {
        source_type: "manual",
        priority: 8,
      }),
    ],
    persona_files: [
      privateSearchRow("file-owner", "Aurora archive file", OWNER_ID, PUBLIC_PERSONA_ID, {
        file_name: "aurora-notebook.md",
        file_type: "text/markdown",
        source_type: "upload",
        processed: true,
      }),
      privateSearchRow("file-other", "Other Aurora archive file", OTHER_ID, OTHER_PERSONA_ID, {
        file_name: "other-aurora-notebook.md",
        file_type: "text/markdown",
        source_type: "upload",
        processed: true,
      }),
    ],
    import_jobs: [
      privateSearchRow("import-owner", "Aurora import", OWNER_ID, PUBLIC_PERSONA_ID, {
        kind: "chat",
        status: "completed",
        source_name: "aurora-import.txt",
        error_message: null,
      }),
      privateSearchRow("import-other", "Other Aurora import", OTHER_ID, OTHER_PERSONA_ID, {
        kind: "chat",
        status: "completed",
        source_name: "other-aurora-import.txt",
        error_message: null,
      }),
    ],
    archived_chat_transcripts: [
      privateSearchRow("chat-owner", "Aurora archived chat", OWNER_ID, PUBLIC_PERSONA_ID, {
        conversation_id: "conversation-owner",
        source_summary: "Owner-only archived chat.",
        message_count: 4,
      }),
      privateSearchRow("chat-other", "Other Aurora archived chat", OTHER_ID, OTHER_PERSONA_ID, {
        conversation_id: "conversation-other",
        source_summary: "Other-owner archived chat.",
        message_count: 4,
      }),
    ],
    forum_categories: [
      {
        id: CATEGORY_ID,
        slug: "community",
        title: "Community",
        description: "Community discussion",
        sort_order: 1,
        created_at: "2026-05-25T09:00:00.000Z",
      },
    ],
    threads: [
      thread(PUBLIC_THREAD_ID, "Public Thread", "public"),
      thread(COMMUNITY_THREAD_ID, "Community Thread", "community"),
      thread(LOCKED_THREAD_ID, "Locked Thread", "public", { status: "locked" }),
      thread(HIDDEN_THREAD_ID, "Hidden Thread", "public", { is_hidden: true }),
    ],
    comments: [],
    community_votes: [],
    community_moderation_actions: [
      {
        id: "moderation-action-public-thread",
        moderator_user_id: ADMIN_ID,
        target_type: "thread",
        target_id: PUBLIC_THREAD_ID,
        action_type: "hide",
        reason: "Seeded moderation note.",
        metadata: { internalNote: "visitor-should-not-see-this" },
        created_at: "2026-05-25T09:21:00.000Z",
      },
    ],
    discover_feed: [
      feed("feed-public-doc", "document", PUBLIC_DOC_ID, "Public Document"),
      feed("feed-community-doc", "document", COMMUNITY_DOC_ID, "Community Document"),
      feed("feed-unlisted-doc", "document", UNLISTED_DOC_ID, "Unlisted Document"),
      feed("feed-private-doc", "document", PRIVATE_DOC_ID, "Private Document"),
      feed("feed-public-thread", "thread", PUBLIC_THREAD_ID, "Public Thread"),
      feed("feed-community-thread", "thread", COMMUNITY_THREAD_ID, "Community Thread"),
      feed("feed-hidden-thread", "thread", HIDDEN_THREAD_ID, "Hidden Thread"),
      feed("feed-public-space", "space", PUBLIC_SPACE_ID, "Public Space"),
      feed("feed-private-space", "space", PRIVATE_SPACE_ID, "Private Space"),
      feed("feed-public-persona", "persona", PUBLIC_PERSONA_ID, "Public Persona"),
      feed("feed-private-persona", "persona", PRIVATE_PERSONA_ID, "Private Persona"),
      feed("feed-public-dev-space", "developer_space", PUBLIC_DEV_SPACE_ID, "Public Dev Space"),
      feed("feed-community-dev-space", "developer_space", COMMUNITY_DEV_SPACE_ID, "Community Dev Space"),
      feed("feed-private-dev-space", "developer_space", PRIVATE_DEV_SPACE_ID, "Private Dev Space"),
    ],
    developer_spaces: [
      developerSpace(PUBLIC_DEV_SPACE_ID, "public-observatory", "Public Observatory", "public"),
      developerSpace(COMMUNITY_DEV_SPACE_ID, "community-observatory", "Community Observatory", "community"),
      developerSpace(PRIVATE_DEV_SPACE_ID, "private-observatory", "Private Observatory", "private"),
      developerSpace(UNLISTED_DEV_SPACE_ID, "unlisted-observatory", "Unlisted Observatory", "unlisted"),
    ],
    developer_space_nodes: [
      developerSpaceNode("dev-node-public", PUBLIC_DEV_SPACE_ID),
      developerSpaceNode("dev-node-community", COMMUNITY_DEV_SPACE_ID),
    ],
    developer_space_events: [
      developerSpaceEvent("dev-event-public", PUBLIC_DEV_SPACE_ID, "signal.public", "Public signal", "public", {
        zone: "North Array",
        detail: "A".repeat(140),
        token: "public-token-should-scrub",
      }),
      developerSpaceEvent("dev-event-private", PUBLIC_DEV_SPACE_ID, "signal.private", "Private signal", "private", {
        zone: "Private Array",
        password: "private-password-should-not-leak",
      }),
      developerSpaceEvent("dev-event-community", COMMUNITY_DEV_SPACE_ID, "signal.community", "Community signal", "community", {
        zone: "Member Array",
        bearerToken: "community-token-should-scrub",
      }),
      developerSpaceEvent("dev-event-hidden-space", PRIVATE_DEV_SPACE_ID, "signal.hidden", "Hidden signal", "public", {
        zone: "Hidden Array",
      }),
    ],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T10:00:00.000Z");
  private forcedFailures: Array<{ table: string; operation: string; message: string }> = [];
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["member-token", { id: MEMBER_ID, email: "member@example.test" }],
    ["other-token", { id: OTHER_ID, email: "other@example.test" }],
    ["admin-token", { id: ADMIN_ID, email: "admin@example.test" }],
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
    rpc: (name: string, params: Row) => {
      if (name === "increment_thread_comment_count") {
        const found = this.rows("threads").find((row) => row.id === params.thread_id);
        if (found) found.comment_count = (found.comment_count ?? 0) + 1;
      }
      const result = { data: null, error: null };
      if (!this.rpcWithoutCatch) return Promise.resolve(result);
      return {
        then: (onfulfilled: (value: typeof result) => unknown) => {
          onfulfilled(result);
        },
      };
    },
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

  failNext(table: string, operation: string, message = "Forced operation failure.") {
    this.forcedFailures.push({ table, operation, message });
  }

  consumeFailure(table: string, operation: string) {
    const index = this.forcedFailures.findIndex(
      (failure) => failure.table === table && failure.operation === operation
    );
    if (index === -1) return null;
    const [failure] = this.forcedFailures.splice(index, 1);
    return failure;
  }

  relatedRow(table: string, row: Row, columns: string | null) {
    const copy = { ...row };
    if (!columns) return copy;

    if (columns.includes("author:profiles")) {
      const author = this.rows("profiles").find((candidate) => candidate.id === row.author_user_id);
      copy.author = author
        ? { username: author.username, display_name: author.display_name, avatar_url: author.avatar_url }
        : null;
    }

    if (table === "threads" && columns.includes("category:forum_categories")) {
      const category = this.rows("forum_categories").find((candidate) => candidate.id === row.category_id);
      copy.category = category ? { id: category.id, slug: category.slug, title: category.title } : null;
    }

    if (table === "documents" && columns.includes("space:spaces")) {
      const foundSpace = this.rows("spaces").find((candidate) => candidate.id === row.space_id);
      copy.space = foundSpace ? { slug: foundSpace.slug, title: foundSpace.title } : null;
    }

    if (table === "documents" && columns.includes("persona:personas")) {
      const foundPersona = this.rows("personas").find((candidate) => candidate.id === row.persona_id);
      copy.persona = foundPersona ? { id: foundPersona.id, name: foundPersona.name } : null;
    }

    if (table === "developer_spaces" && columns.includes("owner:profiles")) {
      const owner = this.rows("profiles").find((candidate) => candidate.id === row.owner_user_id);
      copy.owner = owner
        ? { username: owner.username, display_name: owner.display_name, avatar_url: owner.avatar_url }
        : null;
    }

    return copy;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `00000000-0000-4000-8000-${String(this.idCounters[table]).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "documents") {
      row.body ??= "";
      row.status ??= "draft";
      row.visibility ??= "private";
      row.document_type ??= "essay";
      row.comments_enabled ??= true;
      row.published_at ??= null;
      row.provenance_type ??= "user_authored";
      row.source_type ??= "manual";
      row.source_id ??= null;
      row.source_label ??= null;
      row.source_persona_id ??= null;
      row.discussion_thread_id ??= null;
      row.version ??= 1;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "document_versions") {
      row.summary ??= null;
      row.captured_at ??= now;
      row.created_at ??= now;
    }

    if (table === "threads") {
      row.linked_space_id ??= null;
      row.linked_persona_id ??= null;
      row.linked_document_id ??= null;
      row.visibility ??= "public";
      row.status ??= "active";
      row.score ??= 0;
      row.comment_count ??= 0;
      row.is_pinned ??= false;
      row.is_hidden ??= false;
      row.reported_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "comments") {
      row.status ??= "active";
      row.score ??= 0;
      row.is_pinned ??= false;
      row.is_hidden ??= false;
      row.reported_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private ilikeFilters: Array<[string, string]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private rangeSpec: { from: number; to: number } | null = null;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;
  private upsertConflict: string[] = [];
  private columns: string | null = null;
  private countRequested = false;
  private head = false;

  constructor(private db: CommunitySupabase, private table: string) {}

  select(columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.columns = columns;
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

  ilike(field: string, pattern: string) {
    this.ilikeFilters.push([field, pattern]);
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

  range(from: number, to: number) {
    this.rangeSpec = { from, to };
    return this;
  }

  insert(payload: Row | Row[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: Row | Row[], options: { onConflict?: string } = {}) {
    this.operation = "insert";
    this.payload = payload;
    this.upsertConflict = options.onConflict?.split(",").map((field) => field.trim()).filter(Boolean) ?? [];
    return this;
  }

  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
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

    for (const [field, pattern] of this.ilikeFilters) {
      const needle = pattern.replace(/%/g, "").toLowerCase();
      rows = rows.filter((row) => String(row[field] ?? "").toLowerCase().includes(needle));
    }

    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }

    if (this.rangeSpec) rows = rows.slice(this.rangeSpec.from, this.rangeSpec.to + 1);
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    let rows: Row[];
    const forcedFailure = this.db.consumeFailure(this.table, this.operation);
    if (forcedFailure) return { data: null, error: { message: forcedFailure.message }, count: null };

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => {
        if (this.upsertConflict.length > 0) {
          const found = this.db.rows(this.table).find((row) =>
            this.upsertConflict.every((field) => row[field] === payload[field])
          );
          if (found) {
            Object.assign(found, payload);
            return found;
          }
        }
        return this.db.insertRow(this.table, payload);
      });
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) {
        Object.assign(row, this.payload);
        if ("updated_at" in row) row.updated_at = this.db.timestamp();
      }
    } else if (this.operation === "delete") {
      const rowsToDelete = new Set(this.matchingRows());
      this.db.tables[this.table] = this.db.rows(this.table).filter((row) => !rowsToDelete.has(row));
      rows = [...rowsToDelete];
    } else {
      rows = this.matchingRows();
    }

    const projected = rows.map((row) => this.db.relatedRow(this.table, row, this.columns));
    const data = clone(projected);
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    if (mode === "maybeSingle") {
      return data.length <= 1
        ? { data: data[0] ?? null, error: null, count }
        : { data: null, error: { message: `Expected zero or one ${this.table} row.` }, count };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function profile(id: string, username: string, tier: string, isAdmin = false): Row {
  return {
    id,
    email: `${username}@example.test`,
    username,
    display_name: username,
    avatar_url: null,
    bio: null,
    tier,
    is_admin: isAdmin,
  };
}

function space(id: string, slug: string, isPublic: boolean): Row {
  return {
    id,
    owner_user_id: OWNER_ID,
    slug,
    title: slug,
    short_description: null,
    long_description: null,
    theme: null,
    is_public: isPublic,
    comments_default_enabled: true,
    created_at: "2026-05-25T09:00:00.000Z",
    updated_at: "2026-05-25T09:00:00.000Z",
  };
}

function page(id: string, spaceId: string, commentsEnabled: boolean, isPublished: boolean): Row {
  return {
    id,
    space_id: spaceId,
    slug: id,
    title: id,
    page_type: "custom",
    body: "Page body",
    comments_enabled: commentsEnabled,
    is_published: isPublished,
    sort_order: 1,
    created_at: "2026-05-25T09:00:00.000Z",
    updated_at: "2026-05-25T09:00:00.000Z",
  };
}

function persona(id: string, ownerUserId: string, name: string, visibility: string): Row {
  return {
    id,
    owner_user_id: ownerUserId,
    name,
    short_description: `${name} summary`,
    long_description: null,
    avatar_url: null,
    visibility,
    provider: "platform",
    created_at: "2026-05-25T09:00:00.000Z",
    updated_at: "2026-05-25T09:00:00.000Z",
  };
}

function document(id: string, title: string, slug: string, visibility: string, overrides: Row = {}): Row {
  return {
    id,
    author_user_id: OWNER_ID,
    space_id: PUBLIC_SPACE_ID,
    persona_id: PUBLIC_PERSONA_ID,
    title,
    slug,
    body: `${title} body.`,
    document_type: "essay",
    status: "published",
    visibility,
    comments_enabled: true,
    published_at: "2026-05-25T09:10:00.000Z",
    provenance_type: "user_authored",
    source_type: "manual",
    source_id: null,
    source_label: "Manual document",
    source_persona_id: PUBLIC_PERSONA_ID,
    discussion_thread_id: null,
    created_at: "2026-05-25T09:10:00.000Z",
    updated_at: "2026-05-25T09:10:00.000Z",
    ...overrides,
  };
}

function privateSearchRow(id: string, title: string, ownerUserId: string, personaId: string, overrides: Row = {}): Row {
  return {
    id,
    owner_user_id: ownerUserId,
    persona_id: personaId,
    title,
    created_at: "2026-05-25T09:16:00.000Z",
    updated_at: "2026-05-25T09:16:00.000Z",
    ...overrides,
  };
}

function thread(id: string, title: string, visibility: string, overrides: Row = {}): Row {
  return {
    id,
    category_id: CATEGORY_ID,
    author_user_id: OWNER_ID,
    linked_space_id: null,
    linked_persona_id: null,
    linked_document_id: null,
    title,
    body: `${title} body.`,
    status: "active",
    visibility,
    is_pinned: false,
    is_hidden: false,
    reported_count: 0,
    score: 0,
    comment_count: 0,
    created_at: "2026-05-25T09:20:00.000Z",
    updated_at: "2026-05-25T09:20:00.000Z",
    ...overrides,
  };
}

function feed(id: string, itemType: string, itemId: string, title: string): Row {
  return {
    id,
    item_type: itemType,
    event_type: "featured",
    item_id: itemId,
    title,
    description: null,
    href: `/${itemType}/${itemId}`,
    created_at: "2026-05-25T09:30:00.000Z",
  };
}

function developerSpace(id: string, slug: string, projectName: string, visibility: string): Row {
  return {
    id,
    owner_user_id: OWNER_ID,
    slug,
    project_name: projectName,
    description: `${projectName} public summary.`,
    visibility,
    visualisation_type: "world_map",
    visualisation_config: {},
    api_key_hash: "hidden-hash",
    api_key_last_four: "1234",
    api_key_created_at: "2026-05-25T09:30:00.000Z",
    created_at: "2026-05-25T09:30:00.000Z",
    updated_at: "2026-05-25T09:45:00.000Z",
  };
}

function developerSpaceNode(id: string, developerSpaceId: string): Row {
  return {
    id,
    developer_space_id: developerSpaceId,
    external_id: id,
    node_name: id,
    topology_type: "radial",
    fragment_count: 12,
    self_similarity_score: 0.7,
    dimensionality: 4,
    metrics: {},
    last_event_at: "2026-05-25T09:45:00.000Z",
    created_at: "2026-05-25T09:35:00.000Z",
    updated_at: "2026-05-25T09:45:00.000Z",
  };
}

function developerSpaceEvent(
  id: string,
  developerSpaceId: string,
  eventType: string,
  eventLabel: string,
  visibility: string,
  eventData: Row
): Row {
  return {
    id,
    developer_space_id: developerSpaceId,
    node_id: null,
    external_node_id: null,
    event_type: eventType,
    event_label: eventLabel,
    event_data: eventData,
    similarity_score: 0.82,
    source_refs: ["station:test"],
    provenance: "api",
    visibility,
    occurred_at: "2026-05-25T09:50:00.000Z",
    created_at: "2026-05-25T09:50:00.000Z",
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createCommunityApp() {
  const app = express();
  app.use(express.json());
  app.use("/comments", commentsRouter);
  app.use("/discover", discoverRouter);
  app.use("/documents", documentsRouter);
  app.use("/forums", forumsRouter);
  app.use("/threads", threadsRouter);
  return app;
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

test("forum thread creation validates linked entities and preserves visibility", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const communityThread = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Community document thread",
        body: "Discuss the community document.",
        linkedDocumentId: COMMUNITY_DOC_ID,
      },
    });

    assert.equal(communityThread.status, 201);
    assert.equal(communityThread.body.thread.visibility, "community");
    assert.equal(communityThread.body.thread.linked_document_id, COMMUNITY_DOC_ID);

    const visitorCategory = await requestJson(app, "GET", "/forums/categories/community");
    assert.equal(visitorCategory.status, 200);
    assert.equal(
      visitorCategory.body.threads.some((row: Row) => row.id === communityThread.body.thread.id),
      false
    );

    const memberCategory = await requestJson(app, "GET", "/forums/categories/community", {
      token: "member-token",
    });
    assert.equal(memberCategory.status, 200);
    assert.equal(
      memberCategory.body.threads.some((row: Row) => row.id === communityThread.body.thread.id),
      true
    );

    const privateDocumentLink = await requestJson(app, "POST", "/forums/threads", {
      token: "owner-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Private document leak",
        body: "This should be blocked.",
        linkedDocumentId: PRIVATE_DOC_ID,
      },
    });
    assert.equal(privateDocumentLink.status, 400);

    const privateSpaceLink = await requestJson(app, "POST", "/forums/threads", {
      token: "owner-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Private space leak",
        body: "This should be blocked.",
        linkedSpaceId: PRIVATE_SPACE_ID,
      },
    });
    assert.equal(privateSpaceLink.status, 400);

    const privatePersonaLink = await requestJson(app, "POST", "/forums/threads", {
      token: "owner-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Private persona leak",
        body: "This should be blocked.",
        linkedPersonaId: PRIVATE_PERSONA_ID,
      },
    });
    assert.equal(privatePersonaLink.status, 400);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("thread detail keeps moderation actions admin-only", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const visitor = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`);
    assert.equal(visitor.status, 200);
    assert.deepEqual(visitor.body.moderationActions, []);
    assert.equal(JSON.stringify(visitor.body).includes("visitor-should-not-see-this"), false);
    assert.equal(JSON.stringify(visitor.body).includes("Seeded moderation note."), false);

    const member = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`, {
      token: "member-token",
    });
    assert.equal(member.status, 200);
    assert.deepEqual(member.body.moderationActions, []);

    const admin = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`, {
      token: "admin-token",
    });
    assert.equal(admin.status, 200);
    assert.equal(admin.body.moderationActions.length, 1);
    assert.equal(admin.body.moderationActions[0].reason, "Seeded moderation note.");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("community vote recalculation tolerates rpc thenables without catch", async () => {
  const db = new CommunitySupabase();
  db.rpcWithoutCatch = true;
  const ownerComment = db.insertRow("comments", {
    author_user_id: OWNER_ID,
    parent_type: "thread",
    parent_id: PUBLIC_THREAD_ID,
    body: "Owner-authored comment for a non-owner vote.",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const threadVote = await requestJson(app, "POST", `/threads/${PUBLIC_THREAD_ID}/vote`, {
      token: "member-token",
      body: { value: 1 },
    });
    assert.equal(threadVote.status, 201);
    assert.equal(threadVote.body.vote.target_type, "thread");
    assert.equal(threadVote.body.vote.voter_user_id, MEMBER_ID);

    const commentVote = await requestJson(app, "POST", `/comments/${ownerComment.id}/vote`, {
      token: "member-token",
      body: { value: 1 },
    });
    assert.equal(commentVote.status, 201);
    assert.equal(commentVote.body.vote.target_type, "comment");
    assert.equal(commentVote.body.vote.target_id, ownerComment.id);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("comments enforce readable parents, lock state, and page visibility", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const locked = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: LOCKED_THREAD_ID,
        body: "Locked threads should stay locked.",
      },
    });
    assert.equal(locked.status, 400);

    const hidden = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: HIDDEN_THREAD_ID,
        body: "Hidden threads should not accept replies.",
      },
    });
    assert.equal(hidden.status, 404);

    const publicPage = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "space_page",
        parentId: PUBLIC_PAGE_ID,
        body: "Public page comment.",
      },
    });
    assert.equal(publicPage.status, 201);

    const listed = await requestJson(app, "GET", `/comments?parentType=space_page&parentId=${PUBLIC_PAGE_ID}`);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.comments.length, 1);

    const blockedPrivatePage = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "space_page",
        parentId: PRIVATE_PAGE_ID,
        body: "This private page should not be open.",
      },
    });
    assert.equal(blockedPrivatePage.status, 404);

    const ownerPrivatePage = await requestJson(app, "POST", "/comments", {
      token: "owner-token",
      body: {
        parentType: "space_page",
        parentId: PRIVATE_PAGE_ID,
        body: "Owner can work with their private page.",
      },
    });
    assert.equal(ownerPrivatePage.status, 201);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("documents protect persona ownership and owner-only updates", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const otherPersona = await requestJson(app, "POST", "/documents", {
      token: "owner-token",
      body: {
        title: "Borrowed persona draft",
        slug: "borrowed-persona-draft",
        personaId: OTHER_PERSONA_ID,
      },
    });
    assert.equal(otherPersona.status, 403);

    const ownPersona = await requestJson(app, "POST", "/documents", {
      token: "owner-token",
      body: {
        title: "Owned persona draft",
        slug: "owned-persona-draft",
        personaId: PUBLIC_PERSONA_ID,
      },
    });
    assert.equal(ownPersona.status, 201);
    assert.equal(ownPersona.body.document.persona_id, PUBLIC_PERSONA_ID);

    const blockedUpdate = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "member-token",
      body: { title: "Not mine" },
    });
    assert.equal(blockedUpdate.status, 404);

    const ownerUpdate = await requestJson(app, "PATCH", `/documents/${PUBLIC_DOC_ID}`, {
      token: "owner-token",
      body: { title: "Owner updated" },
    });
    assert.equal(ownerUpdate.status, 200);
    assert.equal(ownerUpdate.body.document.title, "Owner updated");
    assert.equal(ownerUpdate.body.document.version, 2);

    const ownerVersions = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/versions`, {
      token: "owner-token",
    });
    assert.equal(ownerVersions.status, 200);
    assert.equal(ownerVersions.body.currentVersion, 2);
    assert.equal(ownerVersions.body.versions.length, 1);
    assert.equal(ownerVersions.body.versions[0].versionNumber, 1);
    assert.equal(ownerVersions.body.versions[0].title, "Public Document");
    assert.equal(ownerVersions.body.versions[0].documentType, "essay");
    assert.equal(ownerVersions.body.versions[0].visibility, "public");

    const memberVersions = await requestJson(app, "GET", `/documents/${PUBLIC_DOC_ID}/versions`, {
      token: "member-token",
    });
    assert.equal(memberVersions.status, 404);

    const publicRead = await requestJson(app, "GET", `/documents/public/${PUBLIC_DOC_ID}`);
    assert.equal(publicRead.status, 200);
    assert.equal(publicRead.body.document.version, 2);
    assert.equal(JSON.stringify(publicRead.body).includes("versions"), false);

    const retryDraft = await requestJson(app, "POST", "/documents", {
      token: "owner-token",
      body: {
        title: "Retry draft",
        slug: "retry-draft",
        body: "Initial body",
      },
    });
    assert.equal(retryDraft.status, 201);

    db.failNext("documents", "update", "Forced document update failure.");
    const failedVersionedUpdate = await requestJson(app, "PATCH", `/documents/${retryDraft.body.document.id}`, {
      token: "owner-token",
      body: { title: "Should not persist" },
    });
    assert.equal(failedVersionedUpdate.status, 500);
    assert.equal(
      db.rows("document_versions").filter((row) => row.document_id === retryDraft.body.document.id).length,
      0
    );

    const retryVersionedUpdate = await requestJson(app, "PATCH", `/documents/${retryDraft.body.document.id}`, {
      token: "owner-token",
      body: { title: "Retry draft updated" },
    });
    assert.equal(retryVersionedUpdate.status, 200);
    assert.equal(retryVersionedUpdate.body.document.version, 2);

    const noSpaceDraft = await requestJson(app, "POST", "/documents", {
      token: "owner-token",
      body: {
        title: "Studio publish draft",
        slug: "studio-publish-draft",
      },
    });
    assert.equal(noSpaceDraft.status, 201);
    assert.equal(noSpaceDraft.body.document.space_id, null);

    const otherSpaceBlocked = await requestJson(app, "PATCH", `/documents/${noSpaceDraft.body.document.id}`, {
      token: "owner-token",
      body: { spaceId: OTHER_SPACE_ID },
    });
    assert.equal(otherSpaceBlocked.status, 403);

    const otherPersonaBlocked = await requestJson(app, "PATCH", `/documents/${noSpaceDraft.body.document.id}`, {
      token: "owner-token",
      body: { personaId: OTHER_PERSONA_ID },
    });
    assert.equal(otherPersonaBlocked.status, 403);

    const attachOwnedContext = await requestJson(app, "PATCH", `/documents/${noSpaceDraft.body.document.id}`, {
      token: "owner-token",
      body: {
        spaceId: PUBLIC_SPACE_ID,
        personaId: PUBLIC_PERSONA_ID,
      },
    });
    assert.equal(attachOwnedContext.status, 200);
    assert.equal(attachOwnedContext.body.document.space_id, PUBLIC_SPACE_ID);
    assert.equal(attachOwnedContext.body.document.persona_id, PUBLIC_PERSONA_ID);
    assert.equal(attachOwnedContext.body.document.source_persona_id, PUBLIC_PERSONA_ID);

    const publishAttached = await requestJson(app, "POST", `/documents/${noSpaceDraft.body.document.id}/publish`, {
      token: "owner-token",
      body: { visibility: "public" },
    });
    assert.equal(publishAttached.status, 200);
    assert.equal(publishAttached.body.document.status, "published");
    assert.equal(publishAttached.body.document.space_id, PUBLIC_SPACE_ID);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("featured Discover feed filters to public-safe and community-eligible items", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const visitor = await requestJson(app, "GET", "/discover/feed?tab=featured&limit=20");
    assert.equal(visitor.status, 200);
    assert.deepEqual(
      visitor.body.items.map((item: Row) => item.item_id).sort(),
      [PUBLIC_DEV_SPACE_ID, PUBLIC_DOC_ID, PUBLIC_PERSONA_ID, PUBLIC_SPACE_ID, PUBLIC_THREAD_ID].sort()
    );

    const member = await requestJson(app, "GET", "/discover/feed?tab=featured&limit=20", {
      token: "member-token",
    });
    assert.equal(member.status, 200);
    assert.deepEqual(
      member.body.items.map((item: Row) => item.item_id).sort(),
      [
        COMMUNITY_DOC_ID,
        COMMUNITY_DEV_SPACE_ID,
        COMMUNITY_THREAD_ID,
        PUBLIC_DEV_SPACE_ID,
        PUBLIC_DOC_ID,
        PUBLIC_PERSONA_ID,
        PUBLIC_SPACE_ID,
        PUBLIC_THREAD_ID,
      ].sort()
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Discover feed and search include public-safe Developer Spaces", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const visitorFeed = await requestJson(app, "GET", "/discover/feed?tab=new&limit=30");
    assert.equal(visitorFeed.status, 200);
    const visitorDeveloperSpaces = visitorFeed.body.items.filter((item: Row) => item.type === "developer_space");
    assert.deepEqual(visitorDeveloperSpaces.map((item: Row) => item.id), [PUBLIC_DEV_SPACE_ID]);

    const publicItem = visitorDeveloperSpaces[0];
    assert.equal(publicItem.href, "/developer-spaces/public-observatory");
    assert.equal(publicItem.developerSpace.nodeCount, 1);
    assert.equal(publicItem.developerSpace.eventCount, 1);
    assert.equal(publicItem.developerSpace.latestEventLabel, "Public signal");
    assert.equal(publicItem.developerSpace.latestEventSummary.includes("zone: North Array"), true);
    assert.match(publicItem.developerSpace.latestEventSummary, /detail: A{80}\.\.\./);
    assert.equal(publicItem.developerSpace.latestEventSummary.includes("A".repeat(100)), false);
    const visitorText = JSON.stringify(publicItem);
    assert.equal(visitorText.includes("private-password-should-not-leak"), false);
    assert.equal(visitorText.includes("public-token-should-scrub"), false);
    assert.equal(visitorText.includes("hidden-hash"), false);

    const memberFeed = await requestJson(app, "GET", "/discover/feed?tab=new&limit=30", {
      token: "member-token",
    });
    assert.equal(memberFeed.status, 200);
    assert.deepEqual(
      memberFeed.body.items
        .filter((item: Row) => item.type === "developer_space")
        .map((item: Row) => item.id)
        .sort(),
      [COMMUNITY_DEV_SPACE_ID, PUBLIC_DEV_SPACE_ID].sort()
    );
    const memberText = JSON.stringify(memberFeed.body.items);
    assert.equal(memberText.includes(PRIVATE_DEV_SPACE_ID), false);
    assert.equal(memberText.includes(UNLISTED_DEV_SPACE_ID), false);
    assert.equal(memberText.includes("community-token-should-scrub"), false);

    const visitorSearch = await requestJson(app, "GET", "/discover/search?q=Observatory");
    assert.equal(visitorSearch.status, 200);
    assert.deepEqual(
      visitorSearch.body.developerSpaces.map((space: Row) => space.id),
      [PUBLIC_DEV_SPACE_ID]
    );

    const memberSearch = await requestJson(app, "GET", "/discover/search?q=Observatory", {
      token: "member-token",
    });
    assert.deepEqual(
      memberSearch.body.developerSpaces.map((space: Row) => space.id).sort(),
      [COMMUNITY_DEV_SPACE_ID, PUBLIC_DEV_SPACE_ID].sort()
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Discover search separates owner-private archive, continuity, and memory results", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const visitor = await requestJson(app, "GET", "/discover/search?q=Aurora");
    assert.equal(visitor.status, 200);
    assert.equal(visitor.body.privateResults, undefined);
    assert.equal(JSON.stringify(visitor.body).includes(PRIVATE_DOC_ID), false);
    assert.equal(JSON.stringify(visitor.body).includes("memory-owner"), false);
    assert.equal(JSON.stringify(visitor.body).includes("canon-owner"), false);
    assert.equal(JSON.stringify(visitor.body).includes("continuity-owner"), false);
    assert.equal(JSON.stringify(visitor.body).includes("file-owner"), false);
    assert.equal(JSON.stringify(visitor.body).includes("import-owner"), false);
    assert.equal(JSON.stringify(visitor.body).includes("chat-owner"), false);

    const member = await requestJson(app, "GET", "/discover/search?q=Aurora", {
      token: "member-token",
    });
    assert.equal(member.status, 200);
    assert.deepEqual(member.body.privateResults, {
      documents: [],
      continuityRecords: [],
      memoryItems: [],
      canonItems: [],
      archiveFiles: [],
      importJobs: [],
      archivedChats: [],
    });
    assert.equal(JSON.stringify(member.body).includes(PRIVATE_DOC_ID), false);
    assert.equal(JSON.stringify(member.body).includes("memory-owner"), false);

    const owner = await requestJson(app, "GET", "/discover/search?q=Aurora", {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.documents.some((row: Row) => row.id === PRIVATE_DOC_ID), false);
    assert.deepEqual(owner.body.privateResults.documents.map((row: Row) => row.id), [PRIVATE_DOC_ID]);
    assert.deepEqual(owner.body.privateResults.continuityRecords.map((row: Row) => row.id), ["continuity-owner"]);
    assert.deepEqual(owner.body.privateResults.memoryItems.map((row: Row) => row.id), ["memory-owner"]);
    assert.deepEqual(owner.body.privateResults.canonItems.map((row: Row) => row.id), ["canon-owner"]);
    assert.deepEqual(owner.body.privateResults.archiveFiles.map((row: Row) => row.id), ["file-owner"]);
    assert.deepEqual(owner.body.privateResults.importJobs.map((row: Row) => row.id), ["import-owner"]);
    assert.deepEqual(owner.body.privateResults.archivedChats.map((row: Row) => row.id), ["chat-owner"]);

    const ownerText = JSON.stringify(owner.body);
    assert.equal(ownerText.includes(OTHER_PRIVATE_DOC_ID), false);
    assert.equal(ownerText.includes("memory-other"), false);
    assert.equal(ownerText.includes("canon-other"), false);
    assert.equal(ownerText.includes("continuity-other"), false);
    assert.equal(ownerText.includes("file-other"), false);
    assert.equal(ownerText.includes("import-other"), false);
    assert.equal(ownerText.includes("chat-other"), false);

    const otherOwner = await requestJson(app, "GET", "/discover/search?q=Aurora", {
      token: "other-token",
    });
    assert.equal(otherOwner.status, 200);
    assert.deepEqual(otherOwner.body.privateResults.documents.map((row: Row) => row.id), [OTHER_PRIVATE_DOC_ID]);
    assert.deepEqual(otherOwner.body.privateResults.continuityRecords.map((row: Row) => row.id), ["continuity-other"]);
    assert.deepEqual(otherOwner.body.privateResults.memoryItems.map((row: Row) => row.id), ["memory-other"]);
    assert.deepEqual(otherOwner.body.privateResults.canonItems.map((row: Row) => row.id), ["canon-other"]);
    assert.deepEqual(otherOwner.body.privateResults.archiveFiles.map((row: Row) => row.id), ["file-other"]);
    assert.deepEqual(otherOwner.body.privateResults.importJobs.map((row: Row) => row.id), ["import-other"]);
    assert.deepEqual(otherOwner.body.privateResults.archivedChats.map((row: Row) => row.id), ["chat-other"]);
    assert.equal(JSON.stringify(otherOwner.body).includes(PRIVATE_DOC_ID), false);
    assert.equal(JSON.stringify(otherOwner.body).includes("memory-owner"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
