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
import { notificationsRouter } from "./notifications";
import { threadsRouter } from "./threads";
import { canModerateSubcommunity } from "../services/community-subcommunities.service";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

type Row = Record<string, any>;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const MEMBER_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ID = "33333333-3333-4333-8333-333333333333";
const ADMIN_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const VISITOR_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CANON_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const INSTITUTIONAL_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
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
const AI_DOC_ID = "88888888-8888-4888-8888-888888888886";
const ARCHIVE_DOC_ID = "88888888-8888-4888-8888-888888888887";
const LOCKED_THREAD_ID = "99999999-9999-4999-8999-999999999991";
const HIDDEN_THREAD_ID = "99999999-9999-4999-8999-999999999992";
const PUBLIC_THREAD_ID = "99999999-9999-4999-8999-999999999993";
const COMMUNITY_THREAD_ID = "99999999-9999-4999-8999-999999999994";
const AI_THREAD_ID = "99999999-9999-4999-8999-999999999995";
const ARCHIVE_THREAD_ID = "99999999-9999-4999-8999-999999999996";
const PERSONA_THREAD_ID = "99999999-9999-4999-8999-999999999997";
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
      profile(VISITOR_ID, "visitor", "visitor"),
      profile(CANON_ID, "canon", "canon"),
      profile(INSTITUTIONAL_ID, "institutional", "institutional"),
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
      document(AI_DOC_ID, "AI Assisted Document", "ai-assisted-document", "public", {
        provenance_type: "ai_assisted",
        source_type: "integrity",
        source_label: "owner-only-ai-session-label",
        source_persona_id: PUBLIC_PERSONA_ID,
      }),
      document(ARCHIVE_DOC_ID, "Archive Import Document", "archive-import-document", "public", {
        provenance_type: "archive_import",
        source_type: "archive_file",
        source_label: "private-archive-file-name.txt",
        source_persona_id: null,
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
    community_subcommunities: [],
    community_subcommunity_moderators: [],
    threads: [
      thread(PUBLIC_THREAD_ID, "Public Thread", "public"),
      thread(COMMUNITY_THREAD_ID, "Community Thread", "community"),
      thread(LOCKED_THREAD_ID, "Locked Thread", "public", { status: "locked" }),
      thread(HIDDEN_THREAD_ID, "Hidden Thread", "public", { is_hidden: true }),
      thread(AI_THREAD_ID, "AI Provenance Thread", "public", { linked_document_id: AI_DOC_ID }),
      thread(ARCHIVE_THREAD_ID, "Archive Provenance Thread", "public", { linked_document_id: ARCHIVE_DOC_ID }),
      thread(PERSONA_THREAD_ID, "Persona Linked Thread", "public", { linked_persona_id: PUBLIC_PERSONA_ID }),
    ],
    comments: [],
    community_thread_watches: [],
    community_notifications: [],
    community_witnesses: [],
    community_votes: [],
    moderation_reports: [],
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
    ["visitor-token", { id: VISITOR_ID, email: "visitor@example.test" }],
    ["canon-token", { id: CANON_ID, email: "canon@example.test" }],
    ["institutional-token", { id: INSTITUTIONAL_ID, email: "institutional@example.test" }],
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

    if (table === "community_subcommunities" && columns.includes("category:forum_categories")) {
      const category = this.rows("forum_categories").find((candidate) => candidate.id === row.category_id);
      copy.category = category ? { slug: category.slug, title: category.title } : null;
    }

    if (table === "threads" && columns.includes("document:documents")) {
      const document = this.rows("documents").find((candidate) => candidate.id === row.linked_document_id);
      copy.document = document
        ? {
            id: document.id,
            title: document.title,
            provenance_type: document.provenance_type,
            source_type: document.source_type,
            source_persona_id: document.source_persona_id,
          }
        : null;
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
      row.authorship_kind ??= "user_authored";
      row.authorship_source_type ??= null;
      row.authorship_source_id ??= null;
      row.authorship_persona_id ??= null;
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

    if (table === "forum_categories") {
      row.description ??= null;
      row.sort_order ??= 100;
      row.created_at ??= now;
    }

    if (table === "community_subcommunities") {
      row.description ??= null;
      row.visibility ??= "public";
      row.status ??= "active";
      row.linked_space_id ??= null;
      row.linked_developer_space_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "community_subcommunity_moderators") {
      row.role ??= "moderator";
      row.status ??= "active";
      row.created_by ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "comments") {
      row.authorship_kind ??= "user_authored";
      row.authorship_source_type ??= null;
      row.authorship_source_id ??= null;
      row.authorship_persona_id ??= null;
      row.status ??= "active";
      row.score ??= 0;
      row.is_pinned ??= false;
      row.is_hidden ??= false;
      row.reported_count ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "community_thread_watches") {
      row.is_muted ??= false;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "community_witnesses") {
      row.revoked_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "community_notifications") {
      row.actor_user_id ??= null;
      row.summary ??= null;
      row.route_href ??= null;
      row.metadata ??= {};
      row.read_at ??= null;
      row.created_at ??= now;
    }

    if (table === "moderation_reports") {
      row.reason ??= "community_review";
      row.notes ??= null;
      row.status ??= "open";
      row.reviewed_by ??= null;
      row.reviewed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private isFilters: Array<[string, unknown]> = [];
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

  is(field: string, value: unknown) {
    this.isFilters.push([field, value]);
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

    for (const [field, value] of this.isFilters) {
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

function authUser(id: string, tier: "visitor" | "private" | "creator" | "canon" | "institutional", isAdmin = false) {
  return {
    id,
    email: `${id}@example.test`,
    tier,
    isAdmin,
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
    public_slug: visibility === "public" ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : null,
    public_chat_enabled: false,
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
    authorship_kind: "user_authored",
    authorship_source_type: null,
    authorship_source_id: null,
    authorship_persona_id: null,
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
  app.use("/notifications", notificationsRouter);
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
  const ineligiblePublicPersona = db.insertRow("personas", {
    ...persona("77777777-7777-4777-8777-777777777774", MEMBER_ID, "Member Salon Persona", "public"),
    public_slug: "member-salon-persona",
  });
  const unsafeSlugPersona = db.insertRow("personas", {
    ...persona("77777777-7777-4777-8777-777777777775", OWNER_ID, "Unsafe Salon Persona", "public"),
    public_slug: "550e8400-e29b-41d4-a716-446655440000",
  });
  const missingRoutePersona = db.insertRow("personas", {
    ...persona("77777777-7777-4777-8777-777777777776", OWNER_ID, "Missing Route Persona", "public"),
    public_slug: null,
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const categories = await requestJson(app, "GET", "/forums/categories");
    assert.equal(categories.status, 200);
    assert.equal(
      categories.body.categories.some((category: Row) => category.slug === "community"),
      true
    );

    const communityThread = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Community document thread",
        body: "Discuss the community document.",
        linkedDocumentId: COMMUNITY_DOC_ID,
        authorship_kind: "ai_assisted",
        authorshipSourceType: "ai",
      },
    });

    assert.equal(communityThread.status, 201);
    assert.equal(communityThread.body.thread.visibility, "community");
    assert.equal(communityThread.body.thread.linked_document_id, COMMUNITY_DOC_ID);
    assert.deepEqual(communityThread.body.thread.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(communityThread.body.thread.authorship_kind, undefined);
    assert.equal(communityThread.body.thread.authorship_source_id, undefined);

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

    const publicPersonaLink = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Public persona thread",
        body: "This public persona link is routeable.",
        linkedPersonaId: PUBLIC_PERSONA_ID,
      },
    });
    assert.equal(publicPersonaLink.status, 201);
    assert.equal(publicPersonaLink.body.thread.linked_persona_id, PUBLIC_PERSONA_ID);

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

    const unsafeSlugPersonaLink = await requestJson(app, "POST", "/forums/threads", {
      token: "owner-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Unsafe persona slug leak",
        body: "UUID-shaped public slugs should not be routeable.",
        linkedPersonaId: unsafeSlugPersona.id,
      },
    });
    assert.equal(unsafeSlugPersonaLink.status, 400);

    const missingRoutePersonaLink = await requestJson(app, "POST", "/forums/threads", {
      token: "owner-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Missing route persona leak",
        body: "Public personas without safe routes should not be linkable.",
        linkedPersonaId: missingRoutePersona.id,
      },
    });
    assert.equal(missingRoutePersonaLink.status, 400);

    const ineligiblePersonaLink = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Ineligible persona leak",
        body: "Private-tier public persona ownership is not enough.",
        linkedPersonaId: ineligiblePublicPersona.id,
      },
    });
    assert.equal(ineligiblePersonaLink.status, 400);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("forum legacy public category reads tolerate missing subcommunity schema cache", async () => {
  const db = new CommunitySupabase();
  const generalCategory = db.insertRow("forum_categories", {
    slug: "general",
    title: "General",
    description: "Public general discussion.",
    sort_order: 0,
  });
  db.insertRow("forum_categories", {
    slug: "documents-and-codexes",
    title: "Documents and Codexes",
    description: "Public document discussion.",
    sort_order: 2,
  });
  db.insertRow("forum_categories", {
    slug: "private-canon",
    title: "Private Canon",
    description: "Must not become public if the subcommunity relation is unavailable.",
    sort_order: 3,
  });
  db.insertRow(
    "threads",
    thread("51515151-5151-4151-9151-515151515151", "General public replay thread", "public", {
      category_id: generalCategory.id,
    })
  );
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();
  const missingSchema = "Could not find the table 'public.community_subcommunities' in the schema cache";

  try {
    db.failNext("community_subcommunities", "select", missingSchema);
    const categories = await requestJson(app, "GET", "/forums/categories");
    assert.equal(categories.status, 200);
    assert.deepEqual(
      categories.body.categories.map((category: Row) => category.slug),
      ["general", "documents-and-codexes"]
    );
    assert.equal(categories.body.categories.every((category: Row) => category.subcommunity === null), true);
    assert.doesNotMatch(JSON.stringify(categories.body), /schema cache/i);

    db.failNext("community_subcommunities", "select", missingSchema);
    const general = await requestJson(app, "GET", "/forums/categories/general?sort=active");
    assert.equal(general.status, 200);
    assert.equal(general.body.category.slug, "general");
    assert.equal(general.body.category.subcommunity, null);
    assert.equal(
      general.body.threads.some((row: Row) => row.title === "General public replay thread"),
      true
    );
    assert.doesNotMatch(JSON.stringify(general.body), /schema cache/i);

    db.failNext("community_subcommunities", "select", missingSchema);
    const privateCategory = await requestJson(app, "GET", "/forums/categories/private-canon?sort=active");
    assert.equal(privateCategory.status, 404);
    assert.doesNotMatch(JSON.stringify(privateCategory.body), /schema cache/i);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("forum legacy public thread detail tolerates missing subcommunity schema cache", async () => {
  const db = new CommunitySupabase();
  const category = db.rows("forum_categories").find((row) => row.id === CATEGORY_ID);
  assert.ok(category);
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();
  const missingSchema = "Could not find the table 'public.community_subcommunities' in the schema cache";

  try {
    db.failNext("community_subcommunities", "select", missingSchema);
    const nonLegacy = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`);
    assert.equal(nonLegacy.status, 404);
    assert.doesNotMatch(JSON.stringify(nonLegacy.body), /schema cache/i);

    category.slug = "documents-and-codexes";
    category.title = "Documents & Codexes";

    db.failNext("community_subcommunities", "select", missingSchema);
    const legacyThread = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`);
    assert.equal(legacyThread.status, 200);
    assert.equal(legacyThread.body.thread.id, PUBLIC_THREAD_ID);
    assert.equal(legacyThread.body.thread.category.slug, "documents-and-codexes");
    assert.doesNotMatch(JSON.stringify(legacyThread.body), /schema cache/i);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("forum public thread detail tolerates missing hosted comment authorship columns", async () => {
  const db = new CommunitySupabase();
  db.insertRow("comments", {
    id: "comment-hosted-authorship-fallback",
    author_user_id: MEMBER_ID,
    parent_type: "thread",
    parent_id: PUBLIC_THREAD_ID,
    body: "Hosted comments can render without authorship columns.",
    status: "active",
    is_hidden: false,
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    db.failNext("comments", "select", "column comments.authorship_kind does not exist");
    const detail = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`);
    assert.equal(detail.status, 200);
    assert.doesNotMatch(JSON.stringify(detail.body), /authorship_kind|schema cache|does not exist/i);

    const comment = detail.body.comments.find((row: Row) => row.id === "comment-hosted-authorship-fallback");
    assert.equal(comment.body, "Hosted comments can render without authorship columns.");
    assert.deepEqual(comment.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.deepEqual(comment.discussion_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("forum category thread reads tolerate missing hosted authorship columns", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    db.failNext("threads", "select", "Could not find the 'authorship_kind' column of 'threads' in the schema cache");
    const category = await requestJson(app, "GET", "/forums/categories/community?sort=active");
    assert.equal(category.status, 200);
    assert.doesNotMatch(JSON.stringify(category.body), /schema cache/i);
    assert.doesNotMatch(JSON.stringify(category.body), /authorship_source_id/i);

    const publicThread = category.body.threads.find((row: Row) => row.id === PUBLIC_THREAD_ID);
    assert.deepEqual(publicThread.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(
      category.body.threads.some((row: Row) => row.id === PUBLIC_THREAD_ID),
      true
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("subcommunity foundation gates creation and filters public/community/owner reads", async () => {
  const db = new CommunitySupabase();
  const privateCategory = db.insertRow("forum_categories", {
    slug: "private-canon",
    title: "Private Canon",
    description: "Owner-only canon area.",
  });
  const privateSubcommunity = db.insertRow("community_subcommunities", {
    category_id: privateCategory.id,
    owner_user_id: OWNER_ID,
    slug: "private-canon",
    title: "Private Canon",
    description: "Owner-only canon area.",
    subcommunity_type: "canon",
    visibility: "private",
    status: "active",
  });
  const privateSubcommunityThread = db.insertRow(
    "threads",
    thread("77777777-7777-4777-8777-777777777777", "Private Canon Thread", "public", {
      category_id: privateCategory.id,
    })
  );
  const privateSubcommunityComment = db.insertRow("comments", {
    parent_type: "thread",
    parent_id: privateSubcommunityThread.id,
    author_user_id: OWNER_ID,
    body: "Private subcommunity comment.",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const anonymousCreate = await requestJson(app, "POST", "/forums/subcommunities", {
      body: {
        slug: "developer-lab",
        title: "Developer Lab",
        type: "developer",
      },
    });
    assert.equal(anonymousCreate.status, 401);

    const memberCreate = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "member-token",
      body: {
        slug: "developer-lab",
        title: "Developer Lab",
        type: "developer",
      },
    });
    assert.equal(memberCreate.status, 403);

    db.insertRow("community_subcommunity_moderators", {
      subcommunity_id: privateSubcommunity.id,
      user_id: MEMBER_ID,
      created_by: OWNER_ID,
    });
    const delegatedModeratorSalonCreate = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "member-token",
      body: {
        slug: "moderator-salon",
        title: "Moderator Salon",
        type: "salon",
      },
    });
    assert.equal(delegatedModeratorSalonCreate.status, 403);

    const creatorSalonCreate = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "owner-token",
      body: {
        slug: "creator-salon",
        title: "Creator Salon",
        type: "salon",
      },
    });
    assert.equal(creatorSalonCreate.status, 403);

    const privateDeveloperSpace = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "admin-token",
      body: {
        slug: "private-dev-lab",
        title: "Private Developer Lab",
        type: "developer",
        linkedDeveloperSpaceId: PRIVATE_DEV_SPACE_ID,
      },
    });
    assert.equal(privateDeveloperSpace.status, 400);

    const privateSalon = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "admin-token",
      body: {
        slug: "private-salon",
        title: "Private Salon",
        type: "salon",
        visibility: "private",
      },
    });
    assert.equal(privateSalon.status, 400);

    const unlistedSalon = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "admin-token",
      body: {
        slug: "unlisted-salon",
        title: "Unlisted Salon",
        type: "salon",
        visibility: "unlisted",
      },
    });
    assert.equal(unlistedSalon.status, 400);

    const adminSalon = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "admin-token",
      body: {
        slug: "public-salon",
        title: "Public Salon",
        description: "Public asynchronous Salon discussion.",
        type: "salon",
        visibility: "public",
      },
    });
    assert.equal(adminSalon.status, 201);
    assert.equal(adminSalon.body.subcommunity.type, "salon");
    assert.equal(adminSalon.body.subcommunity.visibility, "public");
    assert.equal(adminSalon.body.subcommunity.ownerUserId, ADMIN_ID);

    const canonSalon = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "canon-token",
      body: {
        slug: "canon-salon",
        title: "Canon Salon",
        type: "salon",
        visibility: "public",
      },
    });
    assert.equal(canonSalon.status, 201);
    assert.equal(canonSalon.body.subcommunity.ownerUserId, CANON_ID);

    const institutionalSalon = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "institutional-token",
      body: {
        slug: "institutional-salon",
        title: "Institutional Salon",
        type: "salon",
        visibility: "community",
      },
    });
    assert.equal(institutionalSalon.status, 201);
    assert.equal(institutionalSalon.body.subcommunity.type, "salon");
    assert.equal(institutionalSalon.body.subcommunity.visibility, "community");

    const pausedSalonCategory = db.insertRow("forum_categories", {
      slug: "paused-salon",
      title: "Paused Salon",
      description: "Inactive Salon category.",
    });
    db.insertRow("community_subcommunities", {
      category_id: pausedSalonCategory.id,
      owner_user_id: CANON_ID,
      slug: "paused-salon",
      title: "Paused Salon",
      subcommunity_type: "salon",
      visibility: "public",
      status: "paused",
    });

    const created = await requestJson(app, "POST", "/forums/subcommunities", {
      token: "admin-token",
      body: {
        slug: "developer-lab",
        title: "Developer Lab",
        description: "Community developer coordination.",
        type: "developer",
        visibility: "community",
        linkedDeveloperSpaceId: PUBLIC_DEV_SPACE_ID,
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.subcommunity.slug, "developer-lab");
    assert.equal(created.body.subcommunity.type, "developer");
    assert.equal(created.body.subcommunity.visibility, "community");
    assert.equal(created.body.subcommunity.ownerUserId, ADMIN_ID);
    assert.equal(created.body.subcommunity.linkedDeveloperSpaceId, PUBLIC_DEV_SPACE_ID);

    const anonymousList = await requestJson(app, "GET", "/forums/subcommunities");
    assert.equal(anonymousList.status, 200);
    const anonymousPublicSalon = anonymousList.body.subcommunities.find((row: Row) => row.slug === "public-salon");
    assert.equal(anonymousPublicSalon.type, "salon");
    assert.equal(anonymousPublicSalon.ownerUserId, undefined);
    assert.equal(anonymousList.body.subcommunities.some((row: Row) => row.slug === "developer-lab"), false);
    assert.equal(anonymousList.body.subcommunities.some((row: Row) => row.slug === "institutional-salon"), false);
    assert.equal(anonymousList.body.subcommunities.some((row: Row) => row.slug === "paused-salon"), false);
    assert.equal(anonymousList.body.subcommunities.some((row: Row) => row.slug === "private-canon"), false);

    const memberList = await requestJson(app, "GET", "/forums/subcommunities", {
      token: "member-token",
    });
    assert.equal(memberList.status, 200);
    assert.equal(memberList.body.subcommunities.some((row: Row) => row.slug === "public-salon"), true);
    assert.equal(memberList.body.subcommunities.some((row: Row) => row.slug === "institutional-salon"), true);
    const memberDeveloper = memberList.body.subcommunities.find((row: Row) => row.slug === "developer-lab");
    assert.equal(memberDeveloper.type, "developer");
    assert.equal(memberDeveloper.ownerUserId, undefined);
    assert.equal(memberDeveloper.linkedDeveloperSpaceId, undefined);
    assert.equal(memberList.body.subcommunities.some((row: Row) => row.slug === "private-canon"), false);

    const anonymousRead = await requestJson(app, "GET", "/forums/subcommunities/developer-lab");
    assert.equal(anonymousRead.status, 404);

    const memberRead = await requestJson(app, "GET", "/forums/subcommunities/developer-lab", {
      token: "member-token",
    });
    assert.equal(memberRead.status, 200);
    assert.equal(memberRead.body.subcommunity.ownerUserId, undefined);
    assert.equal(memberRead.body.subcommunity.linkedDeveloperSpaceId, undefined);

    const anonymousSalonRead = await requestJson(app, "GET", "/forums/subcommunities/public-salon");
    assert.equal(anonymousSalonRead.status, 200);
    assert.equal(anonymousSalonRead.body.subcommunity.type, "salon");
    assert.equal(anonymousSalonRead.body.subcommunity.ownerUserId, undefined);
    assert.equal(anonymousSalonRead.body.subcommunity.linkedSpaceId, undefined);
    assert.equal(anonymousSalonRead.body.subcommunity.linkedDeveloperSpaceId, undefined);

    const anonymousCommunitySalonRead = await requestJson(app, "GET", "/forums/subcommunities/institutional-salon");
    assert.equal(anonymousCommunitySalonRead.status, 404);

    const memberCommunitySalonRead = await requestJson(app, "GET", "/forums/subcommunities/institutional-salon", {
      token: "member-token",
    });
    assert.equal(memberCommunitySalonRead.status, 200);
    assert.equal(memberCommunitySalonRead.body.subcommunity.type, "salon");
    assert.equal(memberCommunitySalonRead.body.subcommunity.ownerUserId, undefined);

    const ownerPrivateRead = await requestJson(app, "GET", "/forums/subcommunities/private-canon", {
      token: "owner-token",
    });
    assert.equal(ownerPrivateRead.status, 200);
    assert.equal(ownerPrivateRead.body.subcommunity.id, privateSubcommunity.id);
    assert.equal(ownerPrivateRead.body.subcommunity.ownerUserId, OWNER_ID);

    const memberPrivateRead = await requestJson(app, "GET", "/forums/subcommunities/private-canon", {
      token: "member-token",
    });
    assert.equal(memberPrivateRead.status, 404);

    const anonymousCategories = await requestJson(app, "GET", "/forums/categories");
    assert.equal(anonymousCategories.status, 200);
    assert.equal(anonymousCategories.body.categories.some((category: Row) => category.slug === "public-salon"), true);
    assert.equal(anonymousCategories.body.categories.some((category: Row) => category.slug === "developer-lab"), false);
    assert.equal(anonymousCategories.body.categories.some((category: Row) => category.slug === "institutional-salon"), false);
    assert.equal(anonymousCategories.body.categories.some((category: Row) => category.slug === "paused-salon"), false);
    assert.equal(anonymousCategories.body.categories.some((category: Row) => category.slug === "private-canon"), false);

    const memberCategories = await requestJson(app, "GET", "/forums/categories", {
      token: "member-token",
    });
    assert.equal(memberCategories.status, 200);
    assert.equal(memberCategories.body.categories.some((category: Row) => category.slug === "public-salon"), true);
    assert.equal(memberCategories.body.categories.some((category: Row) => category.slug === "developer-lab"), true);
    assert.equal(memberCategories.body.categories.some((category: Row) => category.slug === "institutional-salon"), true);
    assert.equal(memberCategories.body.categories.some((category: Row) => category.slug === "private-canon"), false);

    const publicSalonCategory = await requestJson(app, "GET", "/forums/categories/public-salon");
    assert.equal(publicSalonCategory.status, 200);
    assert.equal(publicSalonCategory.body.category.subcommunity.type, "salon");
    assert.equal(publicSalonCategory.body.category.subcommunity.ownerUserId, undefined);

    const anonymousCommunitySalonCategory = await requestJson(app, "GET", "/forums/categories/institutional-salon");
    assert.equal(anonymousCommunitySalonCategory.status, 404);

    const memberCommunitySalonCategory = await requestJson(app, "GET", "/forums/categories/institutional-salon", {
      token: "member-token",
    });
    assert.equal(memberCommunitySalonCategory.status, 200);
    assert.equal(memberCommunitySalonCategory.body.category.subcommunity.type, "salon");

    const category = await requestJson(app, "GET", "/forums/categories/developer-lab", {
      token: "member-token",
    });
    assert.equal(category.status, 200);
    assert.equal(category.body.category.subcommunity.slug, "developer-lab");

    const anonymousCategory = await requestJson(app, "GET", "/forums/categories/developer-lab");
    assert.equal(anonymousCategory.status, 404);

    const memberThread = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: created.body.subcommunity.categoryId,
        title: "Developer lab thread",
        body: "Community-visible thread.",
      },
    });
    assert.equal(memberThread.status, 201);

    const visitorSalonThread = await requestJson(app, "POST", "/forums/threads", {
      token: "visitor-token",
      body: {
        categoryId: adminSalon.body.subcommunity.categoryId,
        title: "Visitor Salon thread",
        body: "Visitors should not post in Salons.",
      },
    });
    assert.equal(visitorSalonThread.status, 403);

    const salonThread = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: adminSalon.body.subcommunity.categoryId,
        title: "Salon thread",
        body: "Public Salon thread.",
        linkedPersonaId: PUBLIC_PERSONA_ID,
      },
    });
    assert.equal(salonThread.status, 201);
    assert.equal(salonThread.body.thread.linked_persona_id, PUBLIC_PERSONA_ID);

    const hiddenSalonThread = db.insertRow("threads", thread("77777777-7777-4777-8777-777777777778", "Hidden Salon Thread", "public", {
      category_id: adminSalon.body.subcommunity.categoryId,
      is_hidden: true,
    }));
    const removedSalonThread = db.insertRow("threads", thread("77777777-7777-4777-8777-777777777779", "Removed Salon Thread", "public", {
      category_id: adminSalon.body.subcommunity.categoryId,
      status: "removed",
    }));
    const lockedSalonThread = db.insertRow("threads", thread("77777777-7777-4777-8777-777777777780", "Locked Salon Thread", "public", {
      category_id: adminSalon.body.subcommunity.categoryId,
      status: "locked",
    }));

    const publicSalonWithThreads = await requestJson(app, "GET", "/forums/categories/public-salon");
    assert.equal(publicSalonWithThreads.status, 200);
    assert.equal(
      publicSalonWithThreads.body.threads.some((row: Row) => row.id === salonThread.body.thread.id),
      true
    );
    assert.equal(publicSalonWithThreads.body.threads.some((row: Row) => row.id === hiddenSalonThread.id), false);
    assert.equal(publicSalonWithThreads.body.threads.some((row: Row) => row.id === removedSalonThread.id), false);

    const anonymousSalonComment = await requestJson(app, "POST", "/comments", {
      body: {
        parentType: "thread",
        parentId: salonThread.body.thread.id,
        body: "Anonymous Salon comment.",
      },
    });
    assert.equal(anonymousSalonComment.status, 401);

    const visitorSalonComment = await requestJson(app, "POST", "/comments", {
      token: "visitor-token",
      body: {
        parentType: "thread",
        parentId: salonThread.body.thread.id,
        body: "Visitor Salon comment.",
      },
    });
    assert.equal(visitorSalonComment.status, 403);

    const memberSalonComment = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: salonThread.body.thread.id,
        body: "Member Salon comment.",
      },
    });
    assert.equal(memberSalonComment.status, 201);

    const lockedSalonComment = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: lockedSalonThread.id,
        body: "Locked Salon comment.",
      },
    });
    assert.equal(lockedSalonComment.status, 400);

    const privateThread = await requestJson(app, "POST", "/forums/threads", {
      token: "member-token",
      body: {
        categoryId: privateCategory.id,
        title: "Private category bypass",
        body: "This should not land.",
      },
    });
    assert.equal(privateThread.status, 404);

    const directPrivateThread = await requestJson(app, "GET", `/threads/${privateSubcommunityThread.id}`, {
      token: "member-token",
    });
    assert.equal(directPrivateThread.status, 404);

    const privateCommentList = await requestJson(
      app,
      "GET",
      `/comments?parentType=thread&parentId=${privateSubcommunityThread.id}`,
      { token: "member-token" }
    );
    assert.equal(privateCommentList.status, 404);

    const privateCommentVote = await requestJson(app, "POST", `/comments/${privateSubcommunityComment.id}/vote`, {
      token: "member-token",
      body: { value: 1 },
    });
    assert.equal(privateCommentVote.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("subcommunity moderator role foundation is owner-admin managed and serializer-safe", async () => {
  const db = new CommunitySupabase();
  const category = db.insertRow("forum_categories", {
    id: "12345678-1234-4123-8123-123456789abc",
    slug: "moderator-lab",
    title: "Moderator Lab",
  });
  const subcommunity = db.insertRow("community_subcommunities", {
    id: "12345678-1234-4123-8123-123456789abd",
    category_id: category.id,
    owner_user_id: OWNER_ID,
    slug: "moderator-lab",
    title: "Moderator Lab",
    description: "Moderator foundation checks.",
    subcommunity_type: "canon",
    visibility: "community",
    status: "active",
  });
  const otherSubcommunity = db.insertRow("community_subcommunities", {
    id: "12345678-1234-4123-8123-123456789abe",
    category_id: CATEGORY_ID,
    owner_user_id: OTHER_ID,
    slug: "other-lab",
    title: "Other Lab",
    subcommunity_type: "canon",
    visibility: "community",
  });
  db.insertRow("community_subcommunity_moderators", {
    subcommunity_id: subcommunity.id,
    user_id: VISITOR_ID,
    status: "revoked",
    created_by: OWNER_ID,
  });

  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    assert.equal(await canModerateSubcommunity(subcommunity as any, null), false);
    assert.equal(await canModerateSubcommunity(subcommunity as any, authUser(ADMIN_ID, "canon", true)), true);
    assert.equal(await canModerateSubcommunity(subcommunity as any, authUser(OWNER_ID, "creator")), true);
    assert.equal(await canModerateSubcommunity(subcommunity as any, authUser(MEMBER_ID, "private")), false);
    assert.equal(await canModerateSubcommunity(subcommunity as any, authUser(VISITOR_ID, "visitor")), false);

    const anonymousList = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab/moderators");
    assert.equal(anonymousList.status, 401);

    const memberList = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab/moderators", {
      token: "member-token",
    });
    assert.equal(memberList.status, 403);

    const unrelatedOwnerList = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab/moderators", {
      token: "other-token",
    });
    assert.equal(unrelatedOwnerList.status, 403);

    const ownerInitialList = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab/moderators", {
      token: "owner-token",
    });
    assert.equal(ownerInitialList.status, 200);
    assert.deepEqual(ownerInitialList.body.moderators.map((row: Row) => row.userId), [VISITOR_ID]);
    assert.equal(ownerInitialList.body.moderators[0].status, "revoked");
    assert.equal(ownerInitialList.body.moderators[0].profile.username, "visitor");
    assert.equal(JSON.stringify(ownerInitialList.body).includes("visitor@example.test"), false);

    const ownerSelfAssignment = await requestJson(app, "POST", "/forums/subcommunities/moderator-lab/moderators", {
      token: "owner-token",
      body: { userId: OWNER_ID },
    });
    assert.equal(ownerSelfAssignment.status, 400);

    const missingAssignment = await requestJson(app, "POST", "/forums/subcommunities/moderator-lab/moderators", {
      token: "owner-token",
      body: { userId: "99999999-9999-4999-8999-999999999999" },
    });
    assert.equal(missingAssignment.status, 404);

    const memberAssignment = await requestJson(app, "POST", "/forums/subcommunities/moderator-lab/moderators", {
      token: "member-token",
      body: { userId: MEMBER_ID },
    });
    assert.equal(memberAssignment.status, 403);

    const ownerAssignment = await requestJson(app, "POST", "/forums/subcommunities/moderator-lab/moderators", {
      token: "owner-token",
      body: { userId: MEMBER_ID },
    });
    assert.equal(ownerAssignment.status, 201);
    assert.equal(ownerAssignment.body.moderator.subcommunityId, subcommunity.id);
    assert.equal(ownerAssignment.body.moderator.userId, MEMBER_ID);
    assert.equal(ownerAssignment.body.moderator.status, "active");
    assert.equal(ownerAssignment.body.moderator.role, "moderator");
    assert.equal(ownerAssignment.body.moderator.createdBy, OWNER_ID);
    assert.deepEqual(ownerAssignment.body.moderator.profile, {
      username: "member",
      displayName: "member",
      avatarUrl: null,
    });
    assert.equal(await canModerateSubcommunity(subcommunity as any, authUser(MEMBER_ID, "private")), true);

    const publicRead = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab", {
      token: "member-token",
    });
    assert.equal(publicRead.status, 200);
    assert.equal(publicRead.body.subcommunity.ownerUserId, undefined);
    assert.equal(publicRead.body.subcommunity.viewerCanModerate, true);
    assert.equal(JSON.stringify(publicRead.body).includes(MEMBER_ID), false);
    assert.equal(publicRead.body.subcommunity.moderators, undefined);
    assert.equal(publicRead.body.subcommunity.moderatorCount, undefined);

    const adminAssignment = await requestJson(app, "POST", "/forums/subcommunities/other-lab/moderators", {
      token: "admin-token",
      body: { userId: MEMBER_ID },
    });
    assert.equal(adminAssignment.status, 201);
    assert.equal(adminAssignment.body.moderator.subcommunityId, otherSubcommunity.id);

    const ownerRevoke = await requestJson(app, "DELETE", `/forums/subcommunities/moderator-lab/moderators/${MEMBER_ID}`, {
      token: "owner-token",
    });
    assert.equal(ownerRevoke.status, 200);
    assert.equal(ownerRevoke.body.moderator.status, "revoked");
    assert.equal(await canModerateSubcommunity(subcommunity as any, authUser(MEMBER_ID, "private")), false);

    const revokedRead = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab", {
      token: "member-token",
    });
    assert.equal(revokedRead.status, 200);
    assert.equal(revokedRead.body.subcommunity.viewerCanModerate, undefined);

    const adminList = await requestJson(app, "GET", "/forums/subcommunities/moderator-lab/moderators", {
      token: "admin-token",
    });
    assert.equal(adminList.status, 200);
    assert.deepEqual(
      adminList.body.moderators.map((row: Row) => [row.userId, row.status]).sort(),
      [[MEMBER_ID, "revoked"], [VISITOR_ID, "revoked"]]
    );
    const adminListJson = JSON.stringify(adminList.body);
    assert.equal(adminListJson.includes("member@example.test"), false);
    assert.equal(adminListJson.includes("visitor@example.test"), false);
    assert.equal(adminListJson.includes("is_admin"), false);
    assert.equal(adminListJson.includes("tier"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("subcommunity owner and moderator actions are bounded to safety actions and local targets", async () => {
  const db = new CommunitySupabase();
  const category = db.insertRow("forum_categories", {
    id: "22345678-1234-4123-8123-123456789abc",
    slug: "action-lab",
    title: "Action Lab",
  });
  const subcommunity = db.insertRow("community_subcommunities", {
    id: "22345678-1234-4123-8123-123456789abd",
    category_id: category.id,
    owner_user_id: OWNER_ID,
    slug: "action-lab",
    title: "Action Lab",
    subcommunity_type: "salon",
    visibility: "community",
    status: "active",
  });
  const otherCategory = db.insertRow("forum_categories", {
    id: "22345678-1234-4123-8123-123456789abe",
    slug: "other-action-lab",
    title: "Other Action Lab",
  });
  db.insertRow("community_subcommunities", {
    id: "22345678-1234-4123-8123-123456789abf",
    category_id: otherCategory.id,
    owner_user_id: OTHER_ID,
    slug: "other-action-lab",
    title: "Other Action Lab",
    subcommunity_type: "salon",
    visibility: "community",
    status: "active",
  });
  const subcommunityThread = db.insertRow("threads", thread("22345678-1234-4123-8123-123456789ac0", "Subcommunity target", "community", {
    category_id: category.id,
    author_user_id: OTHER_ID,
    moderation_state: "normal",
  }));
  const ownerAuthoredThread = db.insertRow("threads", thread("22345678-1234-4123-8123-123456789ac1", "Owner-authored target", "community", {
    category_id: category.id,
    author_user_id: OWNER_ID,
    moderation_state: "normal",
  }));
  const memberAuthoredThread = db.insertRow("threads", thread("22345678-1234-4123-8123-123456789ac2", "Moderator-authored target", "community", {
    category_id: category.id,
    author_user_id: MEMBER_ID,
    moderation_state: "normal",
  }));
  const otherSubcommunityThread = db.insertRow("threads", thread("22345678-1234-4123-8123-123456789ac3", "Other subcommunity target", "community", {
    category_id: otherCategory.id,
    author_user_id: OWNER_ID,
    moderation_state: "normal",
  }));
  const subcommunityComment = db.insertRow("comments", {
    author_user_id: OTHER_ID,
    parent_type: "thread",
    parent_id: subcommunityThread.id,
    body: "Subcommunity comment that needs a bounded action.",
    moderation_state: "normal",
  });
  const memberAuthoredComment = db.insertRow("comments", {
    author_user_id: MEMBER_ID,
    parent_type: "thread",
    parent_id: subcommunityThread.id,
    body: "Moderator-authored comment should not be self-moderated.",
    moderation_state: "normal",
  });
  const documentComment = db.insertRow("comments", {
    author_user_id: OTHER_ID,
    parent_type: "document",
    parent_id: PUBLIC_DOC_ID,
    body: "Document comment stays admin-only.",
    moderation_state: "normal",
  });
  const spacePageComment = db.insertRow("comments", {
    author_user_id: OTHER_ID,
    parent_type: "space_page",
    parent_id: PUBLIC_PAGE_ID,
    body: "Space page comment stays admin-only.",
    moderation_state: "normal",
  });
  db.insertRow("community_subcommunity_moderators", {
    subcommunity_id: subcommunity.id,
    user_id: VISITOR_ID,
    status: "revoked",
    created_by: OWNER_ID,
  });

  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const anonymousHide = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      body: { action: "hide", reason: "anonymous should not apply" },
    });
    assert.equal(anonymousHide.status, 401);

    const adminOrdinaryLock = await requestJson(app, "PATCH", `/threads/${PUBLIC_THREAD_ID}/moderation`, {
      token: "admin-token",
      body: { action: "lock", reason: "admin ordinary category lock" },
    });
    assert.equal(adminOrdinaryLock.status, 200);
    assert.equal(adminOrdinaryLock.body.thread.status, "locked");

    const memberOrdinaryHide = await requestJson(app, "PATCH", `/threads/${PUBLIC_THREAD_ID}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "ordinary member should not moderate ordinary category" },
    });
    assert.equal(memberOrdinaryHide.status, 403);

    const memberBeforeAssignment = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "ordinary member should not moderate subcommunity" },
    });
    assert.equal(memberBeforeAssignment.status, 403);

    const memberReadBeforeAssignment = await requestJson(app, "GET", `/threads/${subcommunityThread.id}`, {
      token: "member-token",
    });
    assert.equal(memberReadBeforeAssignment.status, 200);
    assert.deepEqual(memberReadBeforeAssignment.body.thread.viewer_moderation_actions, []);

    db.insertRow("community_subcommunity_moderators", {
      subcommunity_id: subcommunity.id,
      user_id: MEMBER_ID,
      status: "active",
      created_by: OWNER_ID,
    });

    const ownerCapabilityRead = await requestJson(app, "GET", `/threads/${subcommunityThread.id}`, {
      token: "owner-token",
    });
    assert.equal(ownerCapabilityRead.status, 200);
    assert.deepEqual(ownerCapabilityRead.body.thread.viewer_moderation_actions, ["hide", "remove"]);
    const ownerVisibleComment = ownerCapabilityRead.body.comments.find((row: Row) => row.id === subcommunityComment.id);
    assert.deepEqual(ownerVisibleComment.viewer_moderation_actions, ["hide", "remove"]);

    const memberCapabilityRead = await requestJson(app, "GET", `/threads/${subcommunityThread.id}`, {
      token: "member-token",
    });
    assert.equal(memberCapabilityRead.status, 200);
    assert.deepEqual(memberCapabilityRead.body.thread.viewer_moderation_actions, ["hide", "remove"]);
    const memberVisibleComment = memberCapabilityRead.body.comments.find((row: Row) => row.id === subcommunityComment.id);
    assert.deepEqual(memberVisibleComment.viewer_moderation_actions, ["hide", "remove"]);
    const memberSelfCommentRead = memberCapabilityRead.body.comments.find((row: Row) => row.id === memberAuthoredComment.id);
    assert.deepEqual(memberSelfCommentRead.viewer_moderation_actions, []);

    const memberSelfThreadRead = await requestJson(app, "GET", `/threads/${memberAuthoredThread.id}`, {
      token: "member-token",
    });
    assert.equal(memberSelfThreadRead.status, 200);
    assert.deepEqual(memberSelfThreadRead.body.thread.viewer_moderation_actions, []);

    const unrelatedOwnerRead = await requestJson(app, "GET", `/threads/${subcommunityThread.id}`, {
      token: "other-token",
    });
    assert.equal(unrelatedOwnerRead.status, 200);
    assert.deepEqual(unrelatedOwnerRead.body.thread.viewer_moderation_actions, []);

    const visitorCapabilityRead = await requestJson(app, "GET", `/threads/${subcommunityThread.id}`, {
      token: "visitor-token",
    });
    assert.equal(visitorCapabilityRead.status, 404);

    const memberOrdinaryRead = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`, {
      token: "member-token",
    });
    assert.equal(memberOrdinaryRead.status, 200);
    assert.deepEqual(memberOrdinaryRead.body.thread.viewer_moderation_actions, []);

    const adminOrdinaryRead = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`, {
      token: "admin-token",
    });
    assert.equal(adminOrdinaryRead.status, 200);
    assert.deepEqual(adminOrdinaryRead.body.thread.viewer_moderation_actions, ["hide", "remove"]);

    db.failNext("community_subcommunities", "select", "Could not prove subcommunity authority.");
    const blockedByLookupFailure = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "lookup failure should not mutate target" },
    });
    assert.equal(blockedByLookupFailure.status, 500);
    assert.equal(blockedByLookupFailure.body.error, "Could not verify subcommunity moderation authority.");
    assert.equal(JSON.stringify(blockedByLookupFailure.body).includes("Could not prove subcommunity authority."), false);

    const ownerHide = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "owner-token",
      body: { action: "hide", reason: "owner bounded thread hide" },
    });
    assert.equal(ownerHide.status, 200);
    assert.equal(ownerHide.body.thread.is_hidden, true);
    assert.equal(ownerHide.body.moderationAction.actionType, "hide");

    const ownerSelfRemove = await requestJson(app, "PATCH", `/threads/${ownerAuthoredThread.id}/moderation`, {
      token: "owner-token",
      body: { action: "remove", reason: "owner self remove is allowed" },
    });
    assert.equal(ownerSelfRemove.status, 200);
    assert.equal(ownerSelfRemove.body.thread.status, "removed");

    const memberUnhide = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "member-token",
      body: { action: "unhide", reason: "active moderator bounded thread unhide" },
    });
    assert.equal(memberUnhide.status, 200);
    assert.equal(memberUnhide.body.thread.is_hidden, false);

    const memberLock = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "member-token",
      body: { action: "lock", reason: "active moderator should not lock" },
    });
    assert.equal(memberLock.status, 403);

    const memberOtherSubcommunity = await requestJson(app, "PATCH", `/threads/${otherSubcommunityThread.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "active moderator should not cross subcommunities" },
    });
    assert.equal(memberOtherSubcommunity.status, 403);

    const unrelatedOwner = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "other-token",
      body: { action: "hide", reason: "unrelated owner should not moderate" },
    });
    assert.equal(unrelatedOwner.status, 403);

    const revokedModerator = await requestJson(app, "PATCH", `/threads/${subcommunityThread.id}/moderation`, {
      token: "visitor-token",
      body: { action: "hide", reason: "revoked moderator should not moderate" },
    });
    assert.equal(revokedModerator.status, 403);

    const memberSelfThread = await requestJson(app, "PATCH", `/threads/${memberAuthoredThread.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "moderator self-thread should not moderate" },
    });
    assert.equal(memberSelfThread.status, 403);

    const memberCommentHide = await requestJson(app, "PATCH", `/comments/${subcommunityComment.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "active moderator bounded comment hide" },
    });
    assert.equal(memberCommentHide.status, 200);
    assert.equal(memberCommentHide.body.comment.is_hidden, true);

    const memberCommentPin = await requestJson(app, "PATCH", `/comments/${subcommunityComment.id}/moderation`, {
      token: "member-token",
      body: { action: "pin", reason: "active moderator should not pin" },
    });
    assert.equal(memberCommentPin.status, 403);

    const memberSelfComment = await requestJson(app, "PATCH", `/comments/${memberAuthoredComment.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "moderator self-comment should not moderate" },
    });
    assert.equal(memberSelfComment.status, 403);

    const ownerDocumentComment = await requestJson(app, "PATCH", `/comments/${documentComment.id}/moderation`, {
      token: "owner-token",
      body: { action: "hide", reason: "document comments remain admin-only" },
    });
    assert.equal(ownerDocumentComment.status, 403);

    const ownerSpaceComment = await requestJson(app, "PATCH", `/comments/${spacePageComment.id}/moderation`, {
      token: "owner-token",
      body: { action: "hide", reason: "space page comments remain admin-only" },
    });
    assert.equal(ownerSpaceComment.status, 403);

    const adminDocumentComment = await requestJson(app, "PATCH", `/comments/${documentComment.id}/moderation`, {
      token: "admin-token",
      body: { action: "hide", reason: "admin document comment hide" },
    });
    assert.equal(adminDocumentComment.status, 200);
    assert.equal(adminDocumentComment.body.comment.is_hidden, true);

    const adminSpaceComment = await requestJson(app, "PATCH", `/comments/${spacePageComment.id}/moderation`, {
      token: "admin-token",
      body: { action: "hide", reason: "admin space comment hide" },
    });
    assert.equal(adminSpaceComment.status, 200);
    assert.equal(adminSpaceComment.body.comment.is_hidden, true);

    const publicThread = await requestJson(app, "GET", `/threads/${subcommunityThread.id}`, {
      token: "member-token",
    });
    assert.equal(publicThread.status, 200);
    assert.deepEqual(publicThread.body.moderationActions, []);
    const publicThreadJson = JSON.stringify(publicThread.body);
    assert.equal(publicThreadJson.includes("owner bounded thread hide"), false);
    assert.equal(publicThreadJson.includes("active moderator bounded thread unhide"), false);
    assert.equal(publicThreadJson.includes("active moderator bounded comment hide"), false);
    assert.equal(publicThreadJson.includes("moderator_user_id"), false);

    const actionRows = db.tables.community_moderation_actions.filter(
      (row) => row.target_id === subcommunityThread.id || row.target_id === subcommunityComment.id
    );
    assert.equal(actionRows.some((row) => row.moderator_user_id === OWNER_ID && row.action_type === "hide"), true);
    assert.equal(actionRows.some((row) => row.moderator_user_id === MEMBER_ID && row.action_type === "unhide"), true);
    assert.equal(actionRows.some((row) => row.moderator_user_id === MEMBER_ID && row.target_id === subcommunityComment.id), true);
    assert.equal(actionRows.some((row) => row.reason === "lookup failure should not mutate target"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("delegated subcommunity moderation queue is scoped and privacy-safe", async () => {
  const db = new CommunitySupabase();
  const category = db.insertRow("forum_categories", {
    id: "32345678-1234-4123-8123-123456789abc",
    slug: "queue-lab",
    title: "Queue Lab",
  });
  const subcommunity = db.insertRow("community_subcommunities", {
    id: "32345678-1234-4123-8123-123456789abd",
    category_id: category.id,
    owner_user_id: OWNER_ID,
    slug: "queue-lab",
    title: "Queue Lab",
    subcommunity_type: "salon",
    visibility: "community",
    status: "active",
  });
  const otherCategory = db.insertRow("forum_categories", {
    id: "32345678-1234-4123-8123-123456789abe",
    slug: "other-queue-lab",
    title: "Other Queue Lab",
  });
  db.insertRow("community_subcommunities", {
    id: "32345678-1234-4123-8123-123456789abf",
    category_id: otherCategory.id,
    owner_user_id: OTHER_ID,
    slug: "other-queue-lab",
    title: "Other Queue Lab",
    subcommunity_type: "salon",
    visibility: "community",
    status: "active",
  });
  const threadTarget = db.insertRow("threads", thread("32345678-1234-4123-8123-123456789ac0", "Queue Thread", "community", {
    category_id: category.id,
    author_user_id: OTHER_ID,
    body: "Hidden/private thread body should not appear in delegated queue.",
    moderation_state: "needs_review",
  }));
  const commentTarget = db.insertRow("comments", {
    id: "32345678-1234-4123-8123-123456789ac1",
    author_user_id: OTHER_ID,
    parent_type: "thread",
    parent_id: threadTarget.id,
    body: "Hidden/private comment body should not appear in delegated queue.",
    moderation_state: "needs_review",
  });
  const otherThreadTarget = db.insertRow("threads", thread("32345678-1234-4123-8123-123456789ac2", "Other Queue Thread", "community", {
    category_id: otherCategory.id,
  }));
  const documentComment = db.insertRow("comments", {
    id: "32345678-1234-4123-8123-123456789ac3",
    author_user_id: OTHER_ID,
    parent_type: "document",
    parent_id: PUBLIC_DOC_ID,
    body: "Document comment body should not appear.",
  });
  const spaceComment = db.insertRow("comments", {
    id: "32345678-1234-4123-8123-123456789ac4",
    author_user_id: OTHER_ID,
    parent_type: "space_page",
    parent_id: PUBLIC_PAGE_ID,
    body: "Space page comment body should not appear.",
  });
  db.insertRow("community_subcommunity_moderators", {
    subcommunity_id: subcommunity.id,
    user_id: VISITOR_ID,
    status: "revoked",
    created_by: OWNER_ID,
  });

  const includedThreadReport = db.insertRow("moderation_reports", {
    id: "report-thread-queue",
    reporter_id: VISITOR_ID,
    target_type: "thread",
    target_id: threadTarget.id,
    reason: "unsafe_thread",
    notes: "Reporter private note should not appear.",
    status: "open",
    reviewed_by: ADMIN_ID,
    reviewed_at: "2026-05-25T10:30:00.000Z",
  });
  const includedCommentReport = db.insertRow("moderation_reports", {
    id: "report-comment-queue",
    reporter_id: VISITOR_ID,
    target_type: "comment",
    target_id: commentTarget.id,
    reason: "unsafe_comment",
    notes: "Another private note should not appear.",
    status: "reviewing",
  });
  db.insertRow("moderation_reports", {
    id: "report-cross-subcommunity",
    reporter_id: VISITOR_ID,
    target_type: "thread",
    target_id: otherThreadTarget.id,
    reason: "cross_subcommunity",
  });
  db.insertRow("moderation_reports", {
    id: "report-ordinary-category",
    reporter_id: VISITOR_ID,
    target_type: "thread",
    target_id: PUBLIC_THREAD_ID,
    reason: "ordinary_category",
  });
  db.insertRow("moderation_reports", {
    id: "report-document",
    reporter_id: VISITOR_ID,
    target_type: "document",
    target_id: PUBLIC_DOC_ID,
    reason: "document_report",
  });
  db.insertRow("moderation_reports", {
    id: "report-space",
    reporter_id: VISITOR_ID,
    target_type: "space",
    target_id: PUBLIC_SPACE_ID,
    reason: "space_report",
  });
  db.insertRow("moderation_reports", {
    id: "report-persona",
    reporter_id: VISITOR_ID,
    target_type: "persona",
    target_id: PUBLIC_PERSONA_ID,
    reason: "persona_report",
  });
  db.insertRow("moderation_reports", {
    id: "report-user",
    reporter_id: VISITOR_ID,
    target_type: "user",
    target_id: OTHER_ID,
    reason: "user_report",
  });
  db.insertRow("moderation_reports", {
    id: "report-document-comment",
    reporter_id: VISITOR_ID,
    target_type: "comment",
    target_id: documentComment.id,
    reason: "document_comment",
  });
  db.insertRow("moderation_reports", {
    id: "report-space-comment",
    reporter_id: VISITOR_ID,
    target_type: "comment",
    target_id: spaceComment.id,
    reason: "space_comment",
  });

  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const anonymous = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports");
    assert.equal(anonymous.status, 401);

    const anonymousPatch = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      body: { status: "reviewing" },
    });
    assert.equal(anonymousPatch.status, 401);

    const invalidStatus = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      token: "owner-token",
      body: { status: "open" },
    });
    assert.equal(invalidStatus.status, 400);

    const memberBeforeAssignment = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports", {
      token: "member-token",
    });
    assert.equal(memberBeforeAssignment.status, 403);

    const memberPatchBeforeAssignment = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      token: "member-token",
      body: { status: "reviewing" },
    });
    assert.equal(memberPatchBeforeAssignment.status, 403);

    db.insertRow("community_subcommunity_moderators", {
      subcommunity_id: subcommunity.id,
      user_id: MEMBER_ID,
      status: "active",
      created_by: OWNER_ID,
    });

    const ownerRead = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports", {
      token: "owner-token",
    });
    assert.equal(ownerRead.status, 200);
    assert.deepEqual(
      ownerRead.body.reports.map((report: Row) => report.id).sort(),
      [includedCommentReport.id, includedThreadReport.id].sort()
    );

    const ownerLimitedRead = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports?limit=1", {
      token: "owner-token",
    });
    assert.equal(ownerLimitedRead.status, 200);
    assert.deepEqual(ownerLimitedRead.body.reports.map((report: Row) => report.id), [includedCommentReport.id]);

    db.failNext("community_subcommunity_moderators", "select", "moderator lookup should fail closed");
    const activeModeratorLookupFailure = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports", {
      token: "member-token",
    });
    assert.equal(activeModeratorLookupFailure.status, 403);
    assert.equal(JSON.stringify(activeModeratorLookupFailure.body).includes("moderator lookup should fail closed"), false);

    const activeModeratorRead = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports", {
      token: "member-token",
    });
    assert.equal(activeModeratorRead.status, 200);
    assert.deepEqual(
      activeModeratorRead.body.reports.map((report: Row) => report.id).sort(),
      [includedCommentReport.id, includedThreadReport.id].sort()
    );

    const adminRead = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports?status=open", {
      token: "admin-token",
    });
    assert.equal(adminRead.status, 200);
    assert.deepEqual(adminRead.body.reports.map((report: Row) => report.id), [includedThreadReport.id]);

    const unrelatedOwner = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports", {
      token: "other-token",
    });
    assert.equal(unrelatedOwner.status, 403);

    const revokedModerator = await requestJson(app, "GET", "/forums/subcommunities/queue-lab/moderation/reports", {
      token: "visitor-token",
    });
    assert.equal(revokedModerator.status, 403);

    const missingSubcommunity = await requestJson(app, "GET", "/forums/subcommunities/missing-queue/moderation/reports", {
      token: "admin-token",
    });
    assert.equal(missingSubcommunity.status, 404);

    const serialized = JSON.stringify(ownerRead.body);
    assert.equal(serialized.includes(VISITOR_ID), false);
    assert.equal(serialized.includes(ADMIN_ID), false);
    assert.equal(serialized.includes("reporter"), false);
    assert.equal(serialized.includes("Reporter private note"), false);
    assert.equal(serialized.includes("reviewed"), false);
    assert.equal(serialized.includes("Hidden/private thread body"), false);
    assert.equal(serialized.includes("Hidden/private comment body"), false);
    assert.equal(serialized.includes("Document comment body"), false);
    assert.equal(serialized.includes("Space page comment body"), false);
    assert.equal(serialized.includes("cross_subcommunity"), false);
    assert.equal(serialized.includes("ordinary_category"), false);
    assert.equal(serialized.includes("document_report"), false);
    assert.equal(serialized.includes("space_report"), false);
    assert.equal(serialized.includes("persona_report"), false);
    assert.equal(serialized.includes("user_report"), false);
    assert.equal(ownerRead.body.reports[0].targetContext.canOpenRoute, false);
    assert.equal(ownerRead.body.reports[0].targetContext.supportedActions.every((action: string) =>
      ["hide", "unhide", "remove", "restore"].includes(action)
    ), true);

    const ownerTransition = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      token: "owner-token",
      body: { status: "reviewing" },
    });
    assert.equal(ownerTransition.status, 200);
    assert.equal(ownerTransition.body.report.id, includedThreadReport.id);
    assert.equal(ownerTransition.body.report.status, "reviewing");
    const ownerTransitionJson = JSON.stringify(ownerTransition.body);
    assert.equal(ownerTransitionJson.includes(VISITOR_ID), false);
    assert.equal(ownerTransitionJson.includes(OWNER_ID), false);
    assert.equal(ownerTransitionJson.includes("reviewed"), false);
    assert.equal(ownerTransitionJson.includes("Reporter private note"), false);
    assert.equal(db.tables.moderation_reports.find((row: Row) => row.id === includedThreadReport.id).reviewed_by, OWNER_ID);
    assert.equal(db.tables.community_notifications.length, 1);
    assert.equal(db.tables.community_notifications[0].recipient_user_id, VISITOR_ID);
    assert.equal(db.tables.community_notifications[0].actor_user_id, null);
    assert.equal(db.tables.community_notifications[0].notification_type, "report_status");
    assert.equal(db.tables.community_notifications[0].metadata.status, "reviewing");

    const idempotentTransition = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      token: "owner-token",
      body: { status: "reviewing" },
    });
    assert.equal(idempotentTransition.status, 200);
    assert.equal(idempotentTransition.body.report.status, "reviewing");
    assert.equal(db.tables.community_notifications.length, 1);

    const activeModeratorTransition = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedCommentReport.id}`, {
      token: "member-token",
      body: { status: "resolved" },
    });
    assert.equal(activeModeratorTransition.status, 200);
    assert.equal(activeModeratorTransition.body.report.id, includedCommentReport.id);
    assert.equal(activeModeratorTransition.body.report.status, "resolved");
    assert.equal(JSON.stringify(activeModeratorTransition.body).includes(MEMBER_ID), false);
    assert.equal(db.tables.moderation_reports.find((row: Row) => row.id === includedCommentReport.id).reviewed_by, MEMBER_ID);

    const missingReportPatch = await requestJson(app, "PATCH", "/forums/subcommunities/queue-lab/moderation/reports/report-missing", {
      token: "owner-token",
      body: { status: "dismissed" },
    });
    assert.equal(missingReportPatch.status, 404);

    const missingSubcommunityPatch = await requestJson(app, "PATCH", `/forums/subcommunities/missing-queue/moderation/reports/${includedThreadReport.id}`, {
      token: "admin-token",
      body: { status: "dismissed" },
    });
    assert.equal(missingSubcommunityPatch.status, 404);

    const unrelatedOwnerPatch = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      token: "other-token",
      body: { status: "dismissed" },
    });
    assert.equal(unrelatedOwnerPatch.status, 403);

    const revokedModeratorPatch = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${includedThreadReport.id}`, {
      token: "visitor-token",
      body: { status: "dismissed" },
    });
    assert.equal(revokedModeratorPatch.status, 403);

    for (const blockedReportId of [
      "report-cross-subcommunity",
      "report-ordinary-category",
      "report-document",
      "report-space",
      "report-persona",
      "report-user",
      "report-document-comment",
      "report-space-comment",
    ]) {
      const blocked = await requestJson(app, "PATCH", `/forums/subcommunities/queue-lab/moderation/reports/${blockedReportId}`, {
        token: "owner-token",
        body: { status: "dismissed" },
      });
      assert.equal(blocked.status, 404, blockedReportId);
    }

    assert.equal(threadTarget.status, "active");
    assert.equal(threadTarget.is_hidden, false);
    assert.equal(commentTarget.status, "active");
    assert.equal(commentTarget.is_hidden, false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("community participation requires private tier for create, vote, and community reads", async () => {
  const db = new CommunitySupabase();
  const ownerComment = db.insertRow("comments", {
    author_user_id: OWNER_ID,
    parent_type: "thread",
    parent_id: PUBLIC_THREAD_ID,
    body: "Owner-authored comment for tier participation checks.",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const visitorCategory = await requestJson(app, "GET", "/forums/categories/community", {
      token: "visitor-token",
    });
    assert.equal(visitorCategory.status, 200);
    assert.equal(
      visitorCategory.body.threads.some((thread: Row) => thread.id === COMMUNITY_THREAD_ID),
      false
    );

    const visitorCommunityThread = await requestJson(app, "GET", `/threads/${COMMUNITY_THREAD_ID}`, {
      token: "visitor-token",
    });
    assert.equal(visitorCommunityThread.status, 404);

    const visitorThreadCreate = await requestJson(app, "POST", "/forums/threads", {
      token: "visitor-token",
      body: {
        categoryId: CATEGORY_ID,
        title: "Visitor thread",
        body: "Visitor tier should not create threads.",
      },
    });
    assert.equal(visitorThreadCreate.status, 403);

    const visitorCommentCreate = await requestJson(app, "POST", "/comments", {
      token: "visitor-token",
      body: {
        parentType: "thread",
        parentId: PUBLIC_THREAD_ID,
        body: "Visitor tier should not comment.",
      },
    });
    assert.equal(visitorCommentCreate.status, 403);

    const visitorThreadVote = await requestJson(app, "POST", `/threads/${PUBLIC_THREAD_ID}/vote`, {
      token: "visitor-token",
      body: { value: 1 },
    });
    assert.equal(visitorThreadVote.status, 403);

    const visitorCommentVote = await requestJson(app, "POST", `/comments/${ownerComment.id}/vote`, {
      token: "visitor-token",
      body: { value: 1 },
    });
    assert.equal(visitorCommentVote.status, 403);

    const anonymousThreadVote = await requestJson(app, "POST", `/threads/${PUBLIC_THREAD_ID}/vote`, {
      body: { value: 1 },
    });
    assert.equal(anonymousThreadVote.status, 401);

    const anonymousCommentVote = await requestJson(app, "POST", `/comments/${ownerComment.id}/vote`, {
      body: { value: 1 },
    });
    assert.equal(anonymousCommentVote.status, 401);

    const memberThreadVote = await requestJson(app, "POST", `/threads/${PUBLIC_THREAD_ID}/vote`, {
      token: "member-token",
      body: { value: 1 },
    });
    assert.equal(memberThreadVote.status, 201);

    const adminCommentVote = await requestJson(app, "POST", `/comments/${ownerComment.id}/vote`, {
      token: "admin-token",
      body: { value: 1 },
    });
    assert.equal(adminCommentVote.status, 201);

    const memberCommunityThread = await requestJson(app, "GET", `/threads/${COMMUNITY_THREAD_ID}`, {
      token: "member-token",
    });
    assert.equal(memberCommunityThread.status, 200);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("community witnesses are current-user scoped, idempotent, and aggregate-only", async () => {
  const db = new CommunitySupabase();
  const ownerComment = db.insertRow("comments", {
    author_user_id: OWNER_ID,
    parent_type: "thread",
    parent_id: PUBLIC_THREAD_ID,
    body: "Owner-authored comment for witness checks.",
  });
  const hiddenComment = db.insertRow("comments", {
    author_user_id: OWNER_ID,
    parent_type: "thread",
    parent_id: PUBLIC_THREAD_ID,
    body: "Hidden comment should fail closed.",
    is_hidden: true,
  });
  const hiddenParentComment = db.insertRow("comments", {
    author_user_id: MEMBER_ID,
    parent_type: "thread",
    parent_id: HIDDEN_THREAD_ID,
    body: "Comment under a hidden thread should fail closed.",
  });
  const otherThread = db.insertRow("threads", thread("other-witness-thread", "Other Witness Thread", "public", {
    author_user_id: OTHER_ID,
  }));
  const ownerCommentOnOtherThread = db.insertRow("comments", {
    author_user_id: OWNER_ID,
    parent_type: "thread",
    parent_id: otherThread.id,
    body: "Owner-authored comment on another readable thread.",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const anonymousWitness = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/witness/helpful`);
    assert.equal(anonymousWitness.status, 401);

    const visitorWitness = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/witness/helpful`, {
      token: "visitor-token",
    });
    assert.equal(visitorWitness.status, 403);

    const unsupportedKind = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/witness/loud`, {
      token: "member-token",
    });
    assert.equal(unsupportedKind.status, 400);

    const selfWitness = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/witness/helpful`, {
      token: "owner-token",
    });
    assert.equal(selfWitness.status, 400);

    const hiddenTarget = await requestJson(app, "PUT", `/threads/${HIDDEN_THREAD_ID}/witness/helpful`, {
      token: "member-token",
    });
    assert.equal(hiddenTarget.status, 404);

    const adminHiddenTarget = await requestJson(app, "PUT", `/threads/${HIDDEN_THREAD_ID}/witness/helpful`, {
      token: "admin-token",
    });
    assert.equal(adminHiddenTarget.status, 404);

    const adminHiddenParentComment = await requestJson(app, "PUT", `/comments/${hiddenParentComment.id}/witness/careful`, {
      token: "admin-token",
    });
    assert.equal(adminHiddenParentComment.status, 404);

    const firstWitness = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/witness/helpful`, {
      token: "member-token",
    });
    assert.equal(firstWitness.status, 200);
    assert.deepEqual(firstWitness.body.witness.witness_counts, { helpful: 1, grounded: 0, careful: 0 });
    assert.deepEqual(firstWitness.body.witness.viewer_witnesses, ["helpful"]);
    assert.equal(JSON.stringify(firstWitness.body).includes(MEMBER_ID), false);

    const duplicateWitness = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/witness/helpful`, {
      token: "member-token",
    });
    assert.equal(duplicateWitness.status, 200);
    assert.equal(db.tables.community_witnesses.length, 1);
    assert.deepEqual(duplicateWitness.body.witness.witness_counts, { helpful: 1, grounded: 0, careful: 0 });

    const publicThread = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`);
    assert.equal(publicThread.status, 200);
    assert.deepEqual(publicThread.body.thread.witness_counts, { helpful: 1, grounded: 0, careful: 0 });
    assert.equal(publicThread.body.thread.viewer_witnesses, undefined);
    assert.equal(JSON.stringify(publicThread.body).includes("witness_user_id"), false);
    assert.equal(JSON.stringify(publicThread.body).includes(MEMBER_ID), false);

    const memberThread = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`, {
      token: "member-token",
    });
    assert.deepEqual(memberThread.body.thread.viewer_witnesses, ["helpful"]);

    const commentWitness = await requestJson(app, "PUT", `/comments/${ownerComment.id}/witness/grounded`, {
      token: "member-token",
    });
    assert.equal(commentWitness.status, 200);
    assert.deepEqual(commentWitness.body.witness.witness_counts, { helpful: 0, grounded: 1, careful: 0 });

    const otherThreadCommentWitness = await requestJson(app, "PUT", `/comments/${ownerCommentOnOtherThread.id}/witness/careful`, {
      token: "member-token",
    });
    assert.equal(otherThreadCommentWitness.status, 200);
    assert.deepEqual(otherThreadCommentWitness.body.witness.witness_counts, { helpful: 0, grounded: 0, careful: 1 });

    const hiddenCommentWitness = await requestJson(app, "PUT", `/comments/${hiddenComment.id}/witness/careful`, {
      token: "member-token",
    });
    assert.equal(hiddenCommentWitness.status, 404);

    const threadWithComments = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}`, {
      token: "member-token",
    });
    const witnessedComment = threadWithComments.body.comments.find((comment: Row) => comment.id === ownerComment.id);
    assert.deepEqual(witnessedComment.witness_counts, { helpful: 0, grounded: 1, careful: 0 });
    assert.deepEqual(witnessedComment.viewer_witnesses, ["grounded"]);
    assert.equal(JSON.stringify(threadWithComments.body).includes("witness_user_id"), false);

    db.insertRow("community_witnesses", {
      witness_user_id: MEMBER_ID,
      target_type: "comment",
      target_id: hiddenComment.id,
      witness_kind: "careful",
    });
    db.insertRow("community_witnesses", {
      witness_user_id: OWNER_ID,
      target_type: "thread",
      target_id: otherThread.id,
      witness_kind: "grounded",
    });

    const anonymousRecognition = await requestJson(app, "GET", "/forums/witnesses/mine");
    assert.equal(anonymousRecognition.status, 401);

    const visitorRecognition = await requestJson(app, "GET", "/forums/witnesses/mine", {
      token: "visitor-token",
    });
    assert.equal(visitorRecognition.status, 403);

    const memberRecognition = await requestJson(app, "GET", "/forums/witnesses/mine", {
      token: "member-token",
    });
    assert.equal(memberRecognition.status, 200);
    assert.deepEqual(memberRecognition.body.recognitions, []);

    const ownerLimitedRecognition = await requestJson(app, "GET", "/forums/witnesses/mine?limit=1", {
      token: "owner-token",
    });
    assert.equal(ownerLimitedRecognition.status, 200);
    assert.equal(ownerLimitedRecognition.body.recognitions.length, 1);

    const ownerRecognition = await requestJson(app, "GET", "/forums/witnesses/mine", {
      token: "owner-token",
    });
    assert.equal(ownerRecognition.status, 200);
    assert.deepEqual(
      ownerRecognition.body.recognitions.map((recognition: Row) => [recognition.targetType, recognition.targetId]).sort(),
      [["comment", ownerComment.id], ["comment", ownerCommentOnOtherThread.id], ["thread", PUBLIC_THREAD_ID]].sort()
    );
    const recognitionJson = JSON.stringify(ownerRecognition.body);
    assert.equal(recognitionJson.includes(MEMBER_ID), false);
    assert.equal(recognitionJson.includes(OTHER_ID), false);
    assert.equal(recognitionJson.includes("witness_user_id"), false);
    assert.equal(recognitionJson.includes("Hidden comment should fail closed"), false);
    assert.equal(recognitionJson.includes("Owner-authored comment on another readable thread"), false);
    assert.equal(recognitionJson.includes("Other Witness Thread body"), false);
    assert.equal(recognitionJson.includes("category_id"), false);
    assert.equal(ownerRecognition.body.recognitions.find((recognition: Row) => recognition.targetType === "thread").witnessCounts.helpful, 1);
    assert.equal(ownerRecognition.body.recognitions.find((recognition: Row) => recognition.targetId === ownerComment.id).witnessCounts.grounded, 1);
    assert.equal(ownerRecognition.body.recognitions.find((recognition: Row) => recognition.targetId === ownerCommentOnOtherThread.id).witnessCounts.careful, 1);
    assert.equal(ownerRecognition.body.recognitions.every((recognition: Row) => recognition.targetContext.canOpenRoute), true);

    const removeWitness = await requestJson(app, "DELETE", `/threads/${PUBLIC_THREAD_ID}/witness/helpful`, {
      token: "member-token",
    });
    assert.equal(removeWitness.status, 200);
    assert.deepEqual(removeWitness.body.witness.witness_counts, { helpful: 0, grounded: 0, careful: 0 });
    assert.deepEqual(removeWitness.body.witness.viewer_witnesses, []);
    assert.equal(db.tables.community_witnesses[0].revoked_at !== null, true);

    const ownerRecognitionAfterRemoval = await requestJson(app, "GET", "/forums/witnesses/mine", {
      token: "owner-token",
    });
    assert.deepEqual(
      ownerRecognitionAfterRemoval.body.recognitions
        .map((recognition: Row) => [recognition.targetType, recognition.targetId])
        .sort(),
      [["comment", ownerComment.id], ["comment", ownerCommentOnOtherThread.id]].sort()
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("thread watches and notifications are owner-scoped and comment fanout is participant-safe", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const anonymousWatch = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/watch`);
    assert.equal(anonymousWatch.status, 401);

    const visitorWatch = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/watch`, {
      token: "visitor-token",
    });
    assert.equal(visitorWatch.status, 403);

    const hiddenWatch = await requestJson(app, "PUT", `/threads/${HIDDEN_THREAD_ID}/watch`, {
      token: "member-token",
    });
    assert.equal(hiddenWatch.status, 404);

    const watch = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/watch`, {
      token: "member-token",
    });
    assert.equal(watch.status, 200);
    assert.equal(watch.body.isWatching, true);
    assert.equal(watch.body.watch.userId, MEMBER_ID);
    assert.equal(watch.body.watch.threadId, PUBLIC_THREAD_ID);

    const duplicateWatch = await requestJson(app, "PUT", `/threads/${PUBLIC_THREAD_ID}/watch`, {
      token: "member-token",
    });
    assert.equal(duplicateWatch.status, 200);
    assert.equal(db.tables.community_thread_watches.length, 1);

    const watchState = await requestJson(app, "GET", `/threads/${PUBLIC_THREAD_ID}/watch`, {
      token: "member-token",
    });
    assert.equal(watchState.status, 200);
    assert.equal(watchState.body.isWatching, true);

    const ownerComment = await requestJson(app, "POST", "/comments", {
      token: "owner-token",
      body: {
        parentType: "thread",
        parentId: PUBLIC_THREAD_ID,
        body: "Owner body should never leak through notification rows.",
      },
    });
    assert.equal(ownerComment.status, 201);
    assert.equal(db.tables.community_notifications.length, 1);
    assert.equal(db.tables.community_notifications[0].recipient_user_id, MEMBER_ID);
    assert.equal(db.tables.community_notifications[0].actor_user_id, OWNER_ID);
    assert.equal(db.tables.community_notifications[0].notification_type, "thread_comment");
    assert.equal(db.tables.community_notifications[0].route_href, `/forums/community/${PUBLIC_THREAD_ID}#comment-${ownerComment.body.comment.id}`);
    assert.equal(JSON.stringify(db.tables.community_notifications[0]).includes("Owner body should never leak"), false);

    const memberNotifications = await requestJson(app, "GET", "/notifications?unreadOnly=true", {
      token: "member-token",
    });
    assert.equal(memberNotifications.status, 200);
    assert.equal(memberNotifications.body.notifications.length, 1);
    assert.equal(memberNotifications.body.notifications[0].targetType, "comment");
    assert.equal(memberNotifications.body.notifications[0].metadata.threadId, PUBLIC_THREAD_ID);
    assert.equal(memberNotifications.body.notifications[0].actorUserId, undefined);
    assert.equal(memberNotifications.body.notifications[0].recipientUserId, undefined);
    assert.equal(JSON.stringify(memberNotifications.body).includes("Owner body should never leak"), false);

    const ownerNotifications = await requestJson(app, "GET", "/notifications", {
      token: "owner-token",
    });
    assert.equal(ownerNotifications.status, 200);
    assert.equal(ownerNotifications.body.notifications.length, 0);

    const blockedRead = await requestJson(
      app,
      "PATCH",
      `/notifications/${memberNotifications.body.notifications[0].id}/read`,
      { token: "owner-token" }
    );
    assert.equal(blockedRead.status, 404);

    const read = await requestJson(
      app,
      "PATCH",
      `/notifications/${memberNotifications.body.notifications[0].id}/read`,
      { token: "member-token" }
    );
    assert.equal(read.status, 200);
    assert.equal(typeof read.body.notification.readAt, "string");

    const unreadAfterRead = await requestJson(app, "GET", "/notifications?unreadOnly=true", {
      token: "member-token",
    });
    assert.equal(unreadAfterRead.status, 200);
    assert.equal(unreadAfterRead.body.notifications.length, 0);

    const explicitAllAfterRead = await requestJson(app, "GET", "/notifications?unreadOnly=false", {
      token: "member-token",
    });
    assert.equal(explicitAllAfterRead.status, 200);
    assert.equal(explicitAllAfterRead.body.notifications.length, 1);

    const otherComment = await requestJson(app, "POST", "/comments", {
      token: "other-token",
      body: {
        parentType: "thread",
        parentId: PUBLIC_THREAD_ID,
        body: "Other participant comment body should not leak.",
      },
    });
    assert.equal(otherComment.status, 201);
    const otherCommentNotifications = db.tables.community_notifications.filter(
      (row) => row.event_key === `thread_comment:${otherComment.body.comment.id}`
    );
    assert.deepEqual(
      otherCommentNotifications.map((row) => row.recipient_user_id).sort(),
      [MEMBER_ID, OWNER_ID].sort()
    );

    const memberMarkAll = await requestJson(app, "PATCH", "/notifications/read-all", {
      token: "member-token",
    });
    assert.equal(memberMarkAll.status, 200);
    assert.equal(memberMarkAll.body.markedRead, 1);

    const unwatch = await requestJson(app, "DELETE", `/threads/${PUBLIC_THREAD_ID}/watch`, {
      token: "member-token",
    });
    assert.equal(unwatch.status, 200);
    assert.equal(unwatch.body.isWatching, false);
    assert.equal(db.tables.community_thread_watches.length, 0);
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

test("forum thread payloads expose only proven safe provenance labels", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const importedThread = db.tables.threads.find((thread: Row) => thread.id === PUBLIC_THREAD_ID)!;
    importedThread.authorship_kind = "imported";
    importedThread.authorship_source_type = "import";
    importedThread.authorship_source_id = PUBLIC_DOC_ID;
    importedThread.authorship_persona_id = PUBLIC_PERSONA_ID;

    const category = await requestJson(app, "GET", "/forums/categories/community");
    assert.equal(category.status, 200);

    const aiThread = category.body.threads.find((thread: Row) => thread.id === AI_THREAD_ID);
    assert.equal(aiThread.document, undefined);
    assert.deepEqual(aiThread.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.deepEqual(aiThread.discussion_provenance, {
      kind: "ai_assisted",
      label: "AI-assisted",
      document_provenance_type: "ai_assisted",
      document_source_type: "integrity",
      source_persona_id: PUBLIC_PERSONA_ID,
    });

    const archiveThread = category.body.threads.find((thread: Row) => thread.id === ARCHIVE_THREAD_ID);
    assert.deepEqual(archiveThread.discussion_provenance, {
      kind: "archive_import",
      label: "Archive import",
      document_provenance_type: "archive_import",
      document_source_type: "archive_file",
      source_persona_id: null,
    });

    const personaThread = category.body.threads.find((thread: Row) => thread.id === PERSONA_THREAD_ID);
    assert.deepEqual(personaThread.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.deepEqual(personaThread.discussion_provenance, {
      kind: "persona_linked",
      label: "Persona-linked",
      linked_persona_id: PUBLIC_PERSONA_ID,
    });

    const ordinaryThread = category.body.threads.find((thread: Row) => thread.id === PUBLIC_THREAD_ID);
    assert.deepEqual(ordinaryThread.authorship_provenance, {
      kind: "imported",
      label: "Imported",
      source_type: "import",
      has_source: true,
    });
    assert.deepEqual(ordinaryThread.discussion_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(JSON.stringify(category.body).includes("authorship_source_id"), false);
    assert.equal(JSON.stringify(category.body).includes("authorship_persona_id"), false);

    assert.equal(JSON.stringify(category.body).includes("owner-only-ai-session-label"), false);
    assert.equal(JSON.stringify(category.body).includes("private-archive-file-name.txt"), false);

    const createdComment = await requestJson(app, "POST", "/comments", {
      token: "member-token",
      body: {
        parentType: "thread",
        parentId: AI_THREAD_ID,
        body: "Comment should not inherit document AI provenance.",
        authorship_kind: "persona_authored",
        authorshipPersonaId: PUBLIC_PERSONA_ID,
      },
    });
    assert.equal(createdComment.status, 201);
    assert.deepEqual(createdComment.body.comment.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(createdComment.body.comment.authorship_kind, undefined);
    assert.equal(createdComment.body.comment.authorship_persona_id, undefined);

    const detail = await requestJson(app, "GET", `/threads/${AI_THREAD_ID}`);
    assert.equal(detail.status, 200);
    assert.deepEqual(detail.body.thread.document, {
      id: AI_DOC_ID,
      title: "AI Assisted Document",
      space: null,
    });
    assert.equal(detail.body.thread.document.provenance_type, undefined);
    assert.equal(detail.body.thread.document.source_type, undefined);
    assert.equal(detail.body.thread.document.source_persona_id, undefined);
    assert.deepEqual(detail.body.thread.authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(detail.body.thread.discussion_provenance.kind, "ai_assisted");
    assert.deepEqual(detail.body.comments[0].authorship_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.deepEqual(detail.body.comments[0].discussion_provenance, {
      kind: "user_authored",
      label: "User-authored",
    });
    assert.equal(JSON.stringify(detail.body).includes("owner-only-ai-session-label"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("comment moderation actions are admin-only and hide public comments", async () => {
  const db = new CommunitySupabase();
  const comment = db.insertRow("comments", {
    author_user_id: MEMBER_ID,
    parent_type: "thread",
    parent_id: PUBLIC_THREAD_ID,
    body: "Comment that needs moderation.",
    moderation_state: "normal",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const anonymousActions = await requestJson(app, "GET", `/comments/${comment.id}/moderation-actions`);
    assert.equal(anonymousActions.status, 401);

    const memberActions = await requestJson(app, "GET", `/comments/${comment.id}/moderation-actions`, {
      token: "member-token",
    });
    assert.equal(memberActions.status, 403);

    const memberHide = await requestJson(app, "PATCH", `/comments/${comment.id}/moderation`, {
      token: "member-token",
      body: { action: "hide", reason: "Member should not moderate." },
    });
    assert.equal(memberHide.status, 403);

    const adminHide = await requestJson(app, "PATCH", `/comments/${comment.id}/moderation`, {
      token: "admin-token",
      body: { action: "hide", reason: "Public-safe admin reason." },
    });
    assert.equal(adminHide.status, 200);
    assert.equal(adminHide.body.comment.is_hidden, true);
    assert.equal(adminHide.body.comment.moderation_state, "hidden");
    assert.equal(adminHide.body.moderationAction.targetType, "comment");
    assert.equal(adminHide.body.moderationAction.actionType, "hide");
    assert.equal(adminHide.body.moderationAction.reason, "Public-safe admin reason.");

    const publicList = await requestJson(app, "GET", `/comments?parentType=thread&parentId=${PUBLIC_THREAD_ID}`);
    assert.equal(publicList.status, 200);
    assert.equal(publicList.body.comments.some((row: Row) => row.id === comment.id), false);
    assert.equal(JSON.stringify(publicList.body).includes("Public-safe admin reason."), false);

    const adminActions = await requestJson(app, "GET", `/comments/${comment.id}/moderation-actions`, {
      token: "admin-token",
    });
    assert.equal(adminActions.status, 200);
    assert.equal(adminActions.body.moderationActions.length, 1);
    assert.equal(adminActions.body.moderationActions[0].targetType, "comment");
    assert.equal(adminActions.body.moderationActions[0].reason, "Public-safe admin reason.");

    const adminRestore = await requestJson(app, "PATCH", `/comments/${comment.id}/moderation`, {
      token: "admin-token",
      body: { action: "restore", reason: "Return after review." },
    });
    assert.equal(adminRestore.status, 200);
    assert.equal(adminRestore.body.comment.status, "active");
    assert.equal(adminRestore.body.comment.is_hidden, false);
    assert.equal(adminRestore.body.comment.moderation_state, "normal");

    const restoredList = await requestJson(app, "GET", `/comments?parentType=thread&parentId=${PUBLIC_THREAD_ID}`);
    assert.equal(restoredList.status, 200);
    assert.equal(restoredList.body.comments.some((row: Row) => row.id === comment.id), true);
    assert.equal(JSON.stringify(restoredList.body).includes("Return after review."), false);

    const restoredActions = await requestJson(app, "GET", `/comments/${comment.id}/moderation-actions`, {
      token: "admin-token",
    });
    assert.equal(restoredActions.status, 200);
    assert.deepEqual(
      restoredActions.body.moderationActions.map((action: Row) => action.actionType).sort(),
      ["hide", "restore"],
    );
    assert.equal(restoredActions.body.moderationActions.some((action: Row) => action.reason === "Return after review."), true);
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

test("Discover search surfaces public Salons through safe forum category routes", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    const publicCategory = db.insertRow("forum_categories", {
      id: "44444444-4444-4444-8444-444444444451",
      slug: "station-replay-salon-alpha",
      title: "Station Replay Salon Alpha",
    });
    const communityCategory = db.insertRow("forum_categories", {
      id: "44444444-4444-4444-8444-444444444452",
      slug: "member-salon",
      title: "Member Salon",
    });
    const privateCategory = db.insertRow("forum_categories", {
      id: "44444444-4444-4444-8444-444444444453",
      slug: "private-salon",
      title: "Private Salon",
    });
    const pausedCategory = db.insertRow("forum_categories", {
      id: "44444444-4444-4444-8444-444444444454",
      slug: "paused-salon",
      title: "Paused Salon",
    });
    const canonCategory = db.insertRow("forum_categories", {
      id: "44444444-4444-4444-8444-444444444455",
      slug: "canon-lab",
      title: "Canon Lab",
    });
    const mismatchCategory = db.insertRow("forum_categories", {
      id: "44444444-4444-4444-8444-444444444456",
      slug: "safe-mismatch-salon",
      title: "Safe Mismatch Route",
    });

    db.insertRow("community_subcommunities", {
      category_id: publicCategory.id,
      owner_user_id: CANON_ID,
      slug: "station-replay-salon-alpha",
      title: "Station Replay Salon Alpha",
      description: "Public staging Salon.",
      subcommunity_type: "salon",
      visibility: "public",
    });
    db.insertRow("community_subcommunities", {
      category_id: communityCategory.id,
      owner_user_id: INSTITUTIONAL_ID,
      slug: "member-salon",
      title: "Member Salon",
      description: "Community-visible Salon.",
      subcommunity_type: "salon",
      visibility: "community",
    });
    db.insertRow("community_subcommunities", {
      category_id: privateCategory.id,
      owner_user_id: CANON_ID,
      slug: "private-salon",
      title: "Private Salon",
      description: "Private Salon.",
      subcommunity_type: "salon",
      visibility: "private",
    });
    db.insertRow("community_subcommunities", {
      category_id: pausedCategory.id,
      owner_user_id: CANON_ID,
      slug: "paused-salon",
      title: "Paused Salon",
      description: "Paused public Salon.",
      subcommunity_type: "salon",
      visibility: "public",
      status: "paused",
    });
    db.insertRow("community_subcommunities", {
      category_id: canonCategory.id,
      owner_user_id: CANON_ID,
      slug: "canon-lab",
      title: "Canon Salon Adjacent Lab",
      description: "Not a Salon type.",
      subcommunity_type: "canon",
      visibility: "public",
    });
    db.insertRow("community_subcommunities", {
      category_id: mismatchCategory.id,
      owner_user_id: CANON_ID,
      slug: "550e8400-e29b-41d4-a716-446655440000",
      title: "Mismatch Route",
      description: "Route should come from the safe category slug.",
      subcommunity_type: "salon",
      visibility: "public",
    });

    const visitor = await requestJson(app, "GET", "/discover/search?q=Salon");
    assert.equal(visitor.status, 200);
    assert.deepEqual(visitor.body.salons, [{
      slug: "station-replay-salon-alpha",
      categorySlug: "station-replay-salon-alpha",
      title: "Station Replay Salon Alpha",
      description: "Public staging Salon.",
      type: "salon",
      label: "Salon",
      visibility: "public",
      status: "active",
      href: "/forums/station-replay-salon-alpha",
    }]);
    const visitorText = JSON.stringify(visitor.body.salons);
    for (const forbidden of [
      CANON_ID,
      INSTITUTIONAL_ID,
      privateCategory.id,
      communityCategory.id,
      "owner_user_id",
      "linked_space_id",
      "linked_developer_space_id",
      "Private Salon",
      "Member Salon",
      "Paused Salon",
      "Canon Salon Adjacent Lab",
      "Mismatch Route",
      "550e8400-e29b-41d4-a716-446655440000",
    ]) {
      assert.equal(visitorText.includes(forbidden), false, `${forbidden} leaked into visitor Salon search`);
    }

    const mismatch = await requestJson(app, "GET", "/discover/search?q=Mismatch");
    assert.equal(mismatch.status, 200);
    assert.deepEqual(mismatch.body.salons, [{
      slug: "safe-mismatch-salon",
      categorySlug: "safe-mismatch-salon",
      title: "Mismatch Route",
      description: "Route should come from the safe category slug.",
      type: "salon",
      label: "Salon",
      visibility: "public",
      status: "active",
      href: "/forums/safe-mismatch-salon",
    }]);
    assert.equal(JSON.stringify(mismatch.body.salons).includes("550e8400-e29b-41d4-a716-446655440000"), false);

    const member = await requestJson(app, "GET", "/discover/search?q=Salon", {
      token: "member-token",
    });
    assert.equal(member.status, 200);
    assert.deepEqual(
      member.body.salons.map((row: Row) => [row.title, row.href]).sort(),
      [
        ["Member Salon", "/forums/member-salon"],
        ["Station Replay Salon Alpha", "/forums/station-replay-salon-alpha"],
      ].sort()
    );
    const memberText = JSON.stringify(member.body.salons);
    assert.equal(memberText.includes("Private Salon"), false);
    assert.equal(memberText.includes("Paused Salon"), false);
    assert.equal(memberText.includes("Canon Salon Adjacent Lab"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Discover search returns routeable eligible public persona cards only", async () => {
  const db = new CommunitySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createCommunityApp();

  try {
    db.insertRow("personas", {
      ...persona("77777777-7777-4777-8777-777777777774", MEMBER_ID, "Member Persona", "public"),
      public_slug: "member-persona",
    });
    db.insertRow("personas", {
      ...persona("77777777-7777-4777-8777-777777777775", OWNER_ID, "Unsafe UUID Persona", "public"),
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
    });

    const visitorSearch = await requestJson(app, "GET", "/discover/search?q=Persona");
    assert.equal(visitorSearch.status, 200);
    assert.deepEqual(
      visitorSearch.body.personas.map((row: Row) => row.name).sort(),
      ["Other Persona", "Public Persona"]
    );

    const publicPersona = visitorSearch.body.personas.find((row: Row) => row.name === "Public Persona");
    assert.deepEqual(publicPersona, {
      name: "Public Persona",
      short_description: "Public Persona summary",
      avatar_url: null,
      publicSlug: "public-persona",
      href: "/personas/public-persona",
      publicChat: {
        enabled: false,
        mode: "signed_in_alpha",
      },
    });

    const responseJson = JSON.stringify(visitorSearch.body.personas);
    for (const forbidden of [
      PUBLIC_PERSONA_ID,
      OTHER_PERSONA_ID,
      OWNER_ID,
      OTHER_ID,
      MEMBER_ID,
      "owner_user_id",
      "visibility",
      "provider",
      "Member Persona",
      "Unsafe UUID Persona",
      "550e8400-e29b-41d4-a716-446655440000",
    ]) {
      assert.equal(responseJson.includes(forbidden), false, `${forbidden} leaked into persona search`);
    }
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
