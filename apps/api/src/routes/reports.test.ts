import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { reportsRouter } from "./reports";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class ReportsSupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        username: "owner",
        display_name: "Owner User",
        tier: "creator",
        is_admin: false,
      },
      {
        id: "other-user",
        email: "other@example.test",
        username: "other",
        display_name: "Other User",
        tier: "private",
        is_admin: false,
      },
      {
        id: "admin-user",
        email: "admin@example.test",
        username: "admin",
        display_name: "Admin User",
        tier: "canon",
        is_admin: true,
      },
      {
        id: "visitor-user",
        email: "visitor@example.test",
        username: "visitor",
        display_name: "Visitor User",
        tier: "visitor",
        is_admin: false,
      },
      {
        id: "persona-owner-private-id",
        email: "persona-owner@example.test",
        username: "persona-owner",
        display_name: "Persona Owner",
        tier: "creator",
        is_admin: false,
      },
    ],
    moderation_reports: [],
    moderation_review_requests: [],
    community_notifications: [],
    forum_categories: [],
    threads: [],
    comments: [],
    persona_encounter_public_exhibits: [],
    persona_encounter_cross_owner_consents: [],
    persona_encounter_cross_owner_public_exhibits: [],
    persona_encounter_cross_owner_generated_artifacts: [],
    persona_encounter_cross_owner_generated_revisions: [],
    persona_encounter_cross_owner_generated_revision_approvals: [],
    persona_encounter_cross_owner_generated_publications: [],
    persona_encounter_cross_owner_generated_publication_audit_events: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-05-25T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["other-token", { id: "other-user", email: "other@example.test" }],
    ["admin-token", { id: "admin-user", email: "admin@example.test" }],
    ["visitor-token", { id: "visitor-user", email: "visitor@example.test" }],
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

    if (table === "moderation_reports") {
      row.notes ??= null;
      row.status ??= "open";
      row.reviewed_by ??= null;
      row.reviewed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "moderation_review_requests") {
      row.moderation_action_id ??= null;
      row.status ??= "open";
      row.resolution_summary ??= null;
      row.admin_notes ??= null;
      row.reviewed_by ??= null;
      row.reviewed_at ??= null;
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

    if (table === "persona_encounter_public_exhibits") {
      row.public_tags ??= [];
      row.status ??= "published";
      row.provenance_schema ??= "station.persona_encounter.public_exhibit.v1";
      row.reported_count ??= 0;
      row.published_at ??= now;
      row.retracted_at ??= null;
      row.removed_at ??= null;
      row.removed_by ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_consents") {
      row.status ??= "approved";
      row.requested_scopes ??= ["publish_metadata_only_public_exhibit"];
      row.requested_scope_version ??= 1;
      row.requester_approved_at ??= now;
      row.counterparty_approved_at ??= now;
      row.revoked_at ??= null;
      row.moderation_locked_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_public_exhibits") {
      row.public_tags ??= [];
      row.status ??= "published";
      row.contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_public_exhibit.v1";
      row.requester_metadata_approved_at ??= now;
      row.counterparty_metadata_approved_at ??= now;
      row.reported_count ??= 0;
      row.published_at ??= now;
      row.retracted_at ??= null;
      row.removed_at ??= null;
      row.removed_by ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_artifacts") {
      row.lifecycle_status ??= "active";
      row.contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_private_generated_artifact.v1";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_revisions") {
      row.status ??= "approved";
      row.contract_version ??= 1;
      row.approval_contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_generated_revision.v1";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_revision_approvals") {
      row.approval_contract_version ??= 1;
      row.approved_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_publications") {
      row.status ??= "published";
      row.public_excerpt ??= null;
      row.private_artifact_contract_version ??= 1;
      row.revision_contract_version ??= 1;
      row.approval_contract_version ??= 1;
      row.publication_contract_version ??= 1;
      row.provenance_schema ??= "station.persona_encounter.cross_owner_generated_publication.v1";
      row.reported_count ??= 0;
      row.published_at ??= now;
      row.retracted_at ??= null;
      row.revoked_at ??= null;
      row.source_invalidated_at ??= null;
      row.removed_at ??= null;
      row.removed_by ??= null;
      row.restored_at ??= null;
      row.restored_by ??= null;
      row.deleted_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_encounter_cross_owner_generated_publication_audit_events") {
      row.actor_user_id ??= null;
      row.publication_contract_version ??= 1;
      row.created_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private selectColumns = "*";
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | Row[] | null = null;
  private countRequested = false;
  private head = false;

  constructor(private db: ReportsSupabase, private table: string) {}

  select(columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.selectColumns = columns;
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

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
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
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    const selectError = this.validateSelectedColumns();
    if (selectError) {
      return { data: null, error: selectError, count: this.countRequested ? 0 : null };
    }

    let rows: Row[];
    if (this.operation === "insert") {
      rows = (Array.isArray(this.payload) ? this.payload : [this.payload as Row])
        .map((payload) => this.db.insertRow(this.table, payload));
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
      return data.length >= 1
        ? { data: data[0], error: null }
        : { data: null, error: null };
    }

    return { data: this.head ? null : data, error: null, count: this.countRequested ? rows.length : null };
  }

  private validateSelectedColumns() {
    if (this.table !== "persona_encounter_public_exhibits") return null;
    if (this.selectColumns === "*" || !this.selectColumns.trim()) return null;
    const requested = this.selectColumns.split(",").map((column) => column.trim()).filter(Boolean);
    if (requested.includes("consent_id")) {
      return { message: "column persona_encounter_public_exhibits.consent_id does not exist" };
    }
    return null;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createReportsApp() {
  const app = express();
  app.use(express.json());
  app.use("/reports", reportsRouter);
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

test("reports route persists reports through Supabase and scopes reporter to auth user", async () => {
  const db = new ReportsSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const blocked = await requestJson(app, "POST", "/reports", {
      body: {
        targetType: "document",
        targetId: "doc-1",
        reason: "spam",
      },
    });
    assert.equal(blocked.status, 401);
    assert.equal(db.tables.moderation_reports.length, 0);

    const visitorBlocked = await requestJson(app, "POST", "/reports", {
      token: "visitor-token",
      body: {
        targetType: "document",
        targetId: "doc-1",
        reason: "spam",
      },
    });
    assert.equal(visitorBlocked.status, 403);
    assert.equal(db.tables.moderation_reports.length, 0);

    const created = await requestJson(app, "POST", "/reports", {
      token: "owner-token",
      body: {
        reporterUserId: "spoofed-user",
        status: "resolved",
        targetType: "persona",
        targetId: "persona-1",
        reason: "unsafe impersonation",
      },
    });

    assert.equal(created.status, 201);
    assert.deepEqual(created.body.report, {
      id: "moderation_reports-1",
      reporterUserId: "owner-user",
      targetType: "persona",
      targetId: "persona-1",
      reason: "unsafe impersonation",
      status: "open",
      createdAt: "2026-05-25T09:00:00.000Z",
      updatedAt: "2026-05-25T09:00:00.000Z",
    });
    assert.deepEqual(db.tables.moderation_reports[0], {
      id: "moderation_reports-1",
      reporter_id: "owner-user",
      target_type: "persona",
      target_id: "persona-1",
      reason: "unsafe impersonation",
      notes: null,
      status: "open",
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2026-05-25T09:00:00.000Z",
      updated_at: "2026-05-25T09:00:00.000Z",
    });

    const duplicate = await requestJson(app, "POST", "/reports", {
      token: "owner-token",
      body: {
        targetType: "persona",
        targetId: "persona-1",
        reason: "unsafe impersonation",
      },
    });

    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(duplicate.body.report.id, "moderation_reports-1");
    assert.equal(db.tables.moderation_reports.length, 1);

    const withNotes = await requestJson(app, "POST", "/reports", {
      token: "other-token",
      body: {
        targetType: "comment",
        targetId: "comment-1",
        reason: "harassment",
        notes: "Contains direct abuse.",
      },
    });

    assert.equal(withNotes.status, 201);
    assert.equal(withNotes.body.report.reporterUserId, "other-user");
    assert.equal(withNotes.body.report.notes, "Contains direct abuse.");
    assert.equal(db.tables.moderation_reports.length, 2);

    const publicExhibit = db.insertRow("persona_encounter_public_exhibits", {
      slug: "public-exhibit-12345678",
      public_title: "Safe public exhibit title",
      public_summary: "Public metadata only.",
      initiator_name_snapshot: "Harbor",
      responder_name_snapshot: "Lantern",
      owner_user_id: "owner-user",
      private_session_id: "private-session-id",
    });
    const exhibitReport = await requestJson(app, "POST", "/reports", {
      token: "owner-token",
      body: {
        targetType: "persona_encounter_public_exhibit",
        targetId: publicExhibit.id,
        reason: "unsafe public exhibit metadata",
      },
    });

    assert.equal(exhibitReport.status, 201);
    assert.equal(exhibitReport.body.report.targetType, "persona_encounter_public_exhibit");
    assert.equal(exhibitReport.body.report.targetId, publicExhibit.id);
    assert.equal(db.tables.persona_encounter_public_exhibits[0].reported_count, 1);
    assert.equal(db.tables.moderation_reports.length, 3);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("reports queue and status updates are admin-only and server-owned", async () => {
  const db = new ReportsSupabase();
  const openReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "thread",
    target_id: "thread-1",
    reason: "spam",
    notes: "Visible only to admins.",
    status: "open",
  });
  const reviewingReport = db.insertRow("moderation_reports", {
    reporter_id: "other-user",
    target_type: "comment",
    target_id: "comment-1",
    reason: "harassment",
    status: "reviewing",
  });
  const resolvedReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "persona",
    target_id: "persona-1",
    reason: "impersonation",
    status: "resolved",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T08:00:00.000Z",
  });
  db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "document",
    target_id: "doc-1",
    reason: "off-topic",
    status: "dismissed",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const anonymousQueue = await requestJson(app, "GET", "/reports");
    assert.equal(anonymousQueue.status, 401);

    const visitorQueue = await requestJson(app, "GET", "/reports", {
      token: "visitor-token",
    });
    assert.equal(visitorQueue.status, 403);

    const memberQueue = await requestJson(app, "GET", "/reports", {
      token: "owner-token",
    });
    assert.equal(memberQueue.status, 403);

    const adminQueue = await requestJson(app, "GET", "/reports", {
      token: "admin-token",
    });
    assert.equal(adminQueue.status, 200);
    assert.deepEqual(
      adminQueue.body.reports.map((report: Row) => report.id),
      [reviewingReport.id, openReport.id]
    );
    assert.equal(adminQueue.body.reports[1].notes, "Visible only to admins.");

    const limitedQueue = await requestJson(app, "GET", "/reports?limit=1", {
      token: "admin-token",
    });
    assert.equal(limitedQueue.status, 200);
    assert.deepEqual(limitedQueue.body.reports.map((report: Row) => report.id), [reviewingReport.id]);

    const commentQueue = await requestJson(app, "GET", "/reports?targetType=comment", {
      token: "admin-token",
    });
    assert.equal(commentQueue.status, 200);
    assert.deepEqual(commentQueue.body.reports.map((report: Row) => report.id), [reviewingReport.id]);

    const resolvedQueue = await requestJson(app, "GET", "/reports?status=resolved", {
      token: "admin-token",
    });
    assert.equal(resolvedQueue.status, 200);
    assert.deepEqual(resolvedQueue.body.reports.map((report: Row) => report.id), [resolvedReport.id]);

    const invalidQueue = await requestJson(app, "GET", "/reports?status=deleted", {
      token: "admin-token",
    });
    assert.equal(invalidQueue.status, 400);

    const anonymousUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      body: { status: "resolved" },
    });
    assert.equal(anonymousUpdate.status, 401);

    const visitorUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "visitor-token",
      body: { status: "resolved" },
    });
    assert.equal(visitorUpdate.status, 403);

    const memberUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "owner-token",
      body: { status: "resolved" },
    });
    assert.equal(memberUpdate.status, 403);

    const invalidUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "admin-token",
      body: { status: "open" },
    });
    assert.equal(invalidUpdate.status, 400);

    const adminUpdate = await requestJson(app, "PATCH", `/reports/${openReport.id}`, {
      token: "admin-token",
      body: {
        status: "resolved",
        reviewedBy: "spoofed-user",
        reviewedAt: "2000-01-01T00:00:00.000Z",
      },
    });
    assert.equal(adminUpdate.status, 200);
    assert.equal(adminUpdate.body.report.id, openReport.id);
    assert.equal(adminUpdate.body.report.status, "resolved");
    assert.equal(adminUpdate.body.report.reviewedBy, "admin-user");
    assert.notEqual(adminUpdate.body.report.reviewedAt, "2000-01-01T00:00:00.000Z");
    assert.equal(typeof adminUpdate.body.report.reviewedAt, "string");

    const stored = db.tables.moderation_reports.find((report) => report.id === openReport.id);
    assert.equal(stored?.status, "resolved");
    assert.equal(stored?.reviewed_by, "admin-user");
    assert.notEqual(stored?.reviewed_at, "2000-01-01T00:00:00.000Z");

    assert.equal(db.tables.community_notifications.length, 1);
    assert.equal(db.tables.community_notifications[0].recipient_user_id, "owner-user");
    assert.equal(db.tables.community_notifications[0].actor_user_id, null);
    assert.equal(db.tables.community_notifications[0].notification_type, "report_status");
    assert.equal(db.tables.community_notifications[0].target_type, "moderation_report");
    assert.equal(db.tables.community_notifications[0].target_id, openReport.id);
    assert.equal(db.tables.community_notifications[0].summary, "Your report is now resolved.");
    assert.deepEqual(db.tables.community_notifications[0].metadata, {
      reportId: openReport.id,
      status: "resolved",
    });
    const notificationJson = JSON.stringify(db.tables.community_notifications[0]);
    assert.equal(notificationJson.includes("Visible only to admins."), false);
    assert.equal(notificationJson.includes("admin-user"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("reporters can read only their own safe report status records", async () => {
  const db = new ReportsSupabase();
  const ownerOpen = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "thread",
    target_id: "thread-1",
    reason: "spam",
    notes: "Reporter detail that should stay out of reporter readback.",
    status: "open",
  });
  const ownerResolved = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "comment",
    target_id: "comment-1",
    reason: "harassment",
    notes: "Moderator-only handling note.",
    status: "resolved",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T10:00:00.000Z",
  });
  db.insertRow("moderation_reports", {
    reporter_id: "other-user",
    target_type: "persona",
    target_id: "persona-1",
    reason: "impersonation",
    notes: "Other reporter note.",
    status: "reviewing",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T11:00:00.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const anonymousReadback = await requestJson(app, "GET", "/reports/mine");
    assert.equal(anonymousReadback.status, 401);

    const ownerReadback = await requestJson(app, "GET", "/reports/mine", {
      token: "owner-token",
    });
    assert.equal(ownerReadback.status, 200);
    assert.deepEqual(
      ownerReadback.body.reports.map((report: Row) => report.id),
      [ownerResolved.id, ownerOpen.id]
    );
    assert.deepEqual(ownerReadback.body.reports[0], {
      id: ownerResolved.id,
      targetType: "comment",
      targetId: "comment-1",
      reason: "harassment",
      status: "resolved",
      reviewedAt: "2026-05-25T10:00:00.000Z",
      createdAt: "2026-05-25T09:00:01.000Z",
      updatedAt: "2026-05-25T09:00:01.000Z",
    });
    const ownerResolvedReadback = ownerReadback.body.reports[0] as Row;
    assert.equal(ownerResolvedReadback.notes, undefined);
    assert.equal(ownerResolvedReadback.reviewedBy, undefined);
    assert.equal(ownerResolvedReadback.reporterUserId, undefined);
    assert.equal(ownerReadback.body.reports.some((report: Row) => report.targetId === "persona-1"), false);
    assert.equal(ownerReadback.body.reports.some((report: Row) => report.targetContext), false);
    const ownerReadbackJson = JSON.stringify(ownerReadback.body);
    assert.equal(ownerReadbackJson.includes("Reporter detail that should stay out of reporter readback."), false);
    assert.equal(ownerReadbackJson.includes("Moderator-only handling note."), false);
    assert.equal(ownerReadbackJson.includes("reviewed_by"), false);
    assert.equal(ownerReadbackJson.includes("reporter_id"), false);
    assert.equal(ownerReadbackJson.includes("admin-user"), false);

    const statusFiltered = await requestJson(app, "GET", "/reports/mine?status=open", {
      token: "owner-token",
    });
    assert.equal(statusFiltered.status, 200);
    assert.deepEqual(statusFiltered.body.reports.map((report: Row) => report.id), [ownerOpen.id]);

    const targetFiltered = await requestJson(app, "GET", "/reports/mine?targetType=comment", {
      token: "owner-token",
    });
    assert.equal(targetFiltered.status, 200);
    assert.deepEqual(targetFiltered.body.reports.map((report: Row) => report.id), [ownerResolved.id]);

    const invalidFilter = await requestJson(app, "GET", "/reports/mine?status=deleted", {
      token: "owner-token",
    });
    assert.equal(invalidFilter.status, 400);

    const otherReadback = await requestJson(app, "GET", "/reports/mine", {
      token: "other-token",
    });
    assert.equal(otherReadback.status, 200);
    assert.deepEqual(
      otherReadback.body.reports.map((report: Row) => report.targetId),
      ["persona-1"]
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("admin report queue includes safe target context for thread and comment reports", async () => {
  const db = new ReportsSupabase();
  db.insertRow("forum_categories", {
    id: "cat-1",
    slug: "general",
    title: "General",
  });
  db.insertRow("threads", {
    id: "thread-1",
    category_id: "cat-1",
    author_user_id: "thread-author-private-id",
    title: "Thread needing review",
    body: "Thread body that must stay out of admin report context.",
    status: "active",
    visibility: "public",
    is_hidden: false,
    moderation_state: "needs_review",
    private_metadata: { secret: "thread-private-marker" },
  });
  db.insertRow("threads", {
    id: "thread-parent",
    category_id: "cat-1",
    author_user_id: "thread-parent-author-private-id",
    title: "Comment parent",
    body: "Parent body that must stay out of admin report context.",
    status: "active",
    visibility: "community",
    is_hidden: false,
    moderation_state: "normal",
  });
  db.insertRow("comments", {
    id: "comment-1",
    author_user_id: "comment-author-private-id",
    parent_type: "thread",
    parent_id: "thread-parent",
    body: "Comment body that must stay out of admin report context.",
    status: "active",
    is_hidden: true,
    moderation_state: "hidden",
  });
  db.insertRow("comments", {
    id: "comment-doc-1",
    author_user_id: "document-comment-author-private-id",
    parent_type: "document",
    parent_id: "doc-1",
    body: "Document comment body that must stay out of admin report context.",
    status: "active",
    is_hidden: false,
    moderation_state: "needs_review",
  });
  db.insertRow("spaces", {
    id: "space-1",
    owner_user_id: "space-owner-private-id",
    slug: "private-space",
    title: "Private Space",
    short_description: "Space summary that is safe for admin context.",
    long_description: "Space body that must stay out of admin report context.",
    is_public: false,
  });
  db.insertRow("documents", {
    id: "doc-1",
    author_user_id: "document-owner-private-id",
    space_id: "space-1",
    persona_id: "persona-private",
    title: "Private Document",
    slug: "private-document",
    body: "Document body that must stay out of admin report context.",
    document_type: "essay",
    status: "published",
    visibility: "private",
    source_label: "Archive source label that must stay out.",
    source_id: "raw-source-id-private",
  });
  db.insertRow("documents", {
    id: "doc-orphan",
    author_user_id: "document-owner-private-id",
    space_id: null,
    title: "Document Without Space",
    slug: "document-without-space",
    body: "Orphan document body that must stay out.",
    document_type: "essay",
    status: "draft",
    visibility: "private",
  });
  db.insertRow("personas", {
    id: "persona-1",
    owner_user_id: "persona-owner-private-id",
    name: "Public Persona",
    short_description: "Persona safe summary.",
    long_description: "Persona long private context that must stay out.",
    visibility: "public",
    public_slug: "public-persona",
    provider: "openai",
    awakening_prompt: "Prompt text that must stay out of admin report context.",
    style_notes: "Style notes that must stay out.",
  });
  db.insertRow("personas", {
    id: "persona-private",
    owner_user_id: "persona-owner-private-id",
    name: "Private Persona",
    visibility: "private",
    provider: "anthropic",
    awakening_prompt: "Private prompt that must stay out.",
  });
  const publicExhibit = db.insertRow("persona_encounter_public_exhibits", {
    slug: "public-exhibit-12345678",
    public_title: "Public encounter card",
    public_summary: "Public owner-authored metadata.",
    public_tags: ["safe", "metadata"],
    initiator_name_snapshot: "Harbor",
    responder_name_snapshot: "Lantern",
    owner_user_id: "encounter-owner-private-id",
    private_session_id: "raw-private-session-id",
    owner_setup: "Private setup body that must stay out.",
    responder_reply: "Generated reply words that must stay out.",
    owner_summary: "Private curation that must stay out.",
    provider_payload: "test-deepseek-key",
  });
  const threadReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "thread",
    target_id: "thread-1",
    reason: "spam",
    status: "open",
  });
  const commentReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "comment",
    target_id: "comment-1",
    reason: "harassment",
    status: "open",
  });
  const unsupportedCommentReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "comment",
    target_id: "comment-doc-1",
    reason: "off-topic",
    status: "open",
  });
  const documentReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "document",
    target_id: "doc-1",
    reason: "private document concern",
    status: "open",
  });
  const orphanDocumentReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "document",
    target_id: "doc-orphan",
    reason: "orphan document concern",
    status: "open",
  });
  const spaceReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "space",
    target_id: "space-1",
    reason: "space concern",
    status: "open",
  });
  const personaReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "persona",
    target_id: "persona-1",
    reason: "impersonation",
    status: "open",
  });
  const privatePersonaReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "persona",
    target_id: "persona-private",
    reason: "private persona concern",
    status: "open",
  });
  const userReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "user",
    target_id: "other-user",
    reason: "user concern",
    status: "open",
  });
  const missingUserReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "user",
    target_id: "missing-user",
    reason: "missing user concern",
    status: "open",
  });
  const publicExhibitReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "persona_encounter_public_exhibit",
    target_id: publicExhibit.id,
    reason: "public exhibit concern",
    notes: "Admin-only report note for the public exhibit.",
    status: "open",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const adminQueue = await requestJson(app, "GET", "/reports?limit=20", {
      token: "admin-token",
    });
    assert.equal(adminQueue.status, 200);

    const byId = new Map<string, Row>(adminQueue.body.reports.map((report: Row) => [report.id, report]));
    assert.deepEqual(byId.get(threadReport.id)?.targetContext, {
      targetType: "thread",
      targetId: "thread-1",
      title: "Thread needing review",
      status: "active",
      visibility: "public",
      moderationState: "needs_review",
      isHidden: false,
      routeHref: "/forums/general/thread-1",
      routeLabel: "General / Thread needing review",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: ["hide", "remove"],
    });
    assert.deepEqual(byId.get(commentReport.id)?.targetContext, {
      targetType: "comment",
      targetId: "comment-1",
      title: "Comment parent",
      parentType: "thread",
      parentId: "thread-parent",
      status: "active",
      moderationState: "hidden",
      isHidden: true,
      routeHref: "/forums/general/thread-parent#comment-comment-1",
      routeLabel: "General / Comment parent",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: ["unhide", "remove"],
    });
    assert.equal(byId.get(unsupportedCommentReport.id)?.targetContext.canOpenRoute, false);
    assert.equal(
      byId.get(unsupportedCommentReport.id)?.targetContext.unavailableReason,
      "Comment parent type document has no safe forum route hint yet."
    );
    assert.deepEqual(byId.get(documentReport.id)?.targetContext, {
      targetType: "document",
      targetId: "doc-1",
      title: "Private Document",
      status: "published",
      visibility: "private",
      routeHref: "/space/private-space/documents/doc-1",
      routeLabel: "Private Space / Private Document",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: [],
    });
    assert.deepEqual(byId.get(orphanDocumentReport.id)?.targetContext, {
      targetType: "document",
      targetId: "doc-orphan",
      title: "Document Without Space",
      status: "draft",
      visibility: "private",
      routeHref: null,
      routeLabel: null,
      canOpenRoute: false,
      unavailableReason: "Document has no safe Space route hint.",
      supportedActions: [],
    });
    assert.deepEqual(byId.get(spaceReport.id)?.targetContext, {
      targetType: "space",
      targetId: "space-1",
      title: "Private Space",
      visibility: "private",
      routeHref: "/space/private-space",
      routeLabel: "Private Space",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: [],
    });
    assert.deepEqual(byId.get(personaReport.id)?.targetContext, {
      targetType: "persona",
      targetId: "persona-1",
      title: "Public Persona",
      visibility: "public",
      routeHref: "/personas/public-persona",
      routeLabel: "Public Persona",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: [],
    });
    assert.deepEqual(byId.get(privatePersonaReport.id)?.targetContext, {
      targetType: "persona",
      targetId: "persona-private",
      title: "Private Persona",
      visibility: "private",
      routeHref: null,
      routeLabel: null,
      canOpenRoute: false,
      unavailableReason: "Private persona target has no safe moderator route hint.",
      supportedActions: [],
    });
    const personaQueue = await requestJson(app, "GET", "/reports?targetType=persona&limit=20", {
      token: "admin-token",
    });
    assert.equal(personaQueue.status, 200);
    assert.deepEqual(
      personaQueue.body.reports.map((report: Row) => report.id),
      [privatePersonaReport.id, personaReport.id]
    );
    assert.deepEqual(
      personaQueue.body.reports.map((report: Row) => report.targetContext.routeLabel),
      [null, "Public Persona"]
    );
    assert.deepEqual(
      personaQueue.body.reports.map((report: Row) => report.targetContext.supportedActions),
      [[], []]
    );
    assert.deepEqual(byId.get(userReport.id)?.targetContext, {
      targetType: "user",
      targetId: "other-user",
      title: "Other User",
      canOpenRoute: false,
      unavailableReason: "User reports have no safe moderator route hint yet.",
      supportedActions: [],
    });
    assert.deepEqual(byId.get(missingUserReport.id)?.targetContext, {
      targetType: "user",
      targetId: "missing-user",
      canOpenRoute: false,
      unavailableReason: "User target not found.",
      supportedActions: [],
    });
    assert.deepEqual(byId.get(publicExhibitReport.id)?.targetContext, {
      targetType: "persona_encounter_public_exhibit",
      targetId: publicExhibit.id,
      title: "Public encounter card",
      status: "published",
      visibility: "public",
      routeHref: "/encounters/public-exhibit-12345678",
      routeLabel: "Public encounter card",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: ["remove"],
    });
    const publicExhibitQueue = await requestJson(
      app,
      "GET",
      "/reports?targetType=persona_encounter_public_exhibit&limit=20",
      { token: "admin-token" }
    );
    assert.equal(publicExhibitQueue.status, 200);
    assert.deepEqual(
      publicExhibitQueue.body.reports.map((report: Row) => report.id),
      [publicExhibitReport.id]
    );
    const queueJson = JSON.stringify(adminQueue.body);
    assert.equal(queueJson.includes("Thread body that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Parent body that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Comment body that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Document comment body that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Document body that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Orphan document body that must stay out."), false);
    assert.equal(queueJson.includes("Space body that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Persona long private context that must stay out."), false);
    assert.equal(queueJson.includes("Prompt text that must stay out of admin report context."), false);
    assert.equal(queueJson.includes("Private prompt that must stay out."), false);
    assert.equal(queueJson.includes("Style notes that must stay out."), false);
    assert.equal(queueJson.includes("Private setup body that must stay out."), false);
    assert.equal(queueJson.includes("Generated reply words that must stay out."), false);
    assert.equal(queueJson.includes("Private curation that must stay out."), false);
    assert.equal(queueJson.includes("test-deepseek-key"), false);
    assert.equal(queueJson.includes("Archive source label that must stay out."), false);
    assert.equal(queueJson.includes("raw-source-id-private"), false);
    assert.equal(queueJson.includes("raw-private-session-id"), false);
    assert.equal(queueJson.includes("thread-author-private-id"), false);
    assert.equal(queueJson.includes("thread-parent-author-private-id"), false);
    assert.equal(queueJson.includes("comment-author-private-id"), false);
    assert.equal(queueJson.includes("document-comment-author-private-id"), false);
    assert.equal(queueJson.includes("document-owner-private-id"), false);
    assert.equal(queueJson.includes("space-owner-private-id"), false);
    assert.equal(queueJson.includes("persona-owner-private-id"), false);
    assert.equal(queueJson.includes("encounter-owner-private-id"), false);
    assert.equal(queueJson.includes("other@example.test"), false);
    assert.equal(queueJson.includes("tier"), false);
    assert.equal(queueJson.includes("is_admin"), false);
    assert.equal(queueJson.includes("thread-private-marker"), false);

    const reporterReadback = await requestJson(app, "GET", "/reports/mine?targetType=thread", {
      token: "owner-token",
    });
    assert.equal(reporterReadback.status, 200);
    assert.equal(reporterReadback.body.reports[0].id, threadReport.id);
    assert.equal(reporterReadback.body.reports[0].targetContext, undefined);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("admin report status updates can remove and restore public encounter exhibits", async () => {
  const db = new ReportsSupabase();
  const publicExhibit = db.insertRow("persona_encounter_public_exhibits", {
    slug: "public-exhibit-12345678",
    public_title: "Public encounter card",
    public_summary: "Safe metadata only.",
    public_tags: ["safe"],
    initiator_name_snapshot: "Harbor",
    responder_name_snapshot: "Lantern",
    owner_user_id: "encounter-owner-private-id",
    private_session_id: "raw-private-session-id",
  });
  const report = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "persona_encounter_public_exhibit",
    target_id: publicExhibit.id,
    reason: "unsafe public exhibit metadata",
    notes: "Admin-only notes.",
    status: "open",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const blockedTargetAction = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "owner-token",
      body: { status: "resolved", targetAction: "remove" },
    });
    assert.equal(blockedTargetAction.status, 403);

    const removed = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "resolved", targetAction: "remove" },
    });
    assert.equal(removed.status, 200);
    assert.equal(removed.body.report.status, "resolved");
    assert.deepEqual(removed.body.report.targetContext, {
      targetType: "persona_encounter_public_exhibit",
      targetId: publicExhibit.id,
      title: "Public encounter card",
      status: "removed",
      visibility: "not_public",
      routeHref: null,
      routeLabel: null,
      canOpenRoute: false,
      unavailableReason: "Public encounter exhibit is not currently public.",
      supportedActions: ["restore"],
    });
    assert.equal(db.tables.persona_encounter_public_exhibits[0].status, "removed");
    assert.equal(db.tables.persona_encounter_public_exhibits[0].removed_by, "admin-user");
    assert.equal(typeof db.tables.persona_encounter_public_exhibits[0].removed_at, "string");

    const restored = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(restored.status, 200);
    assert.deepEqual(restored.body.report.targetContext, {
      targetType: "persona_encounter_public_exhibit",
      targetId: publicExhibit.id,
      title: "Public encounter card",
      status: "published",
      visibility: "public",
      routeHref: "/encounters/public-exhibit-12345678",
      routeLabel: "Public encounter card",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: ["remove"],
    });
    assert.equal(db.tables.persona_encounter_public_exhibits[0].status, "published");
    assert.equal(db.tables.persona_encounter_public_exhibits[0].removed_by, null);
    assert.equal(db.tables.persona_encounter_public_exhibits[0].removed_at, null);

    db.tables.persona_encounter_public_exhibits[0].status = "retracted";
    db.tables.persona_encounter_public_exhibits[0].retracted_at = "2026-07-11T10:00:00.000Z";
    const retractedQueue = await requestJson(app, "GET", "/reports?targetType=persona_encounter_public_exhibit", {
      token: "admin-token",
    });
    assert.equal(retractedQueue.status, 200);
    assert.deepEqual(retractedQueue.body.reports[0].targetContext.supportedActions, []);
    const blockedRetractedRemove = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "resolved", targetAction: "remove" },
    });
    assert.equal(blockedRetractedRemove.status, 400);
    assert.equal(db.tables.persona_encounter_public_exhibits[0].status, "retracted");
    assert.equal(db.tables.moderation_reports[0].status, "reviewing");

    db.tables.persona_encounter_public_exhibits[0].status = "removed";
    db.tables.persona_encounter_public_exhibits[0].removed_at = "2026-07-11T11:00:00.000Z";
    db.tables.persona_encounter_public_exhibits[0].removed_by = "admin-user";
    const restoreOwnerRetracted = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(restoreOwnerRetracted.status, 200);
    assert.deepEqual(restoreOwnerRetracted.body.report.targetContext, {
      targetType: "persona_encounter_public_exhibit",
      targetId: publicExhibit.id,
      title: "Public encounter card",
      status: "retracted",
      visibility: "not_public",
      routeHref: null,
      routeLabel: null,
      canOpenRoute: false,
      unavailableReason: "Public encounter exhibit is not currently public.",
      supportedActions: [],
    });
    assert.equal(db.tables.persona_encounter_public_exhibits[0].status, "retracted");
    assert.equal(db.tables.persona_encounter_public_exhibits[0].retracted_at, "2026-07-11T10:00:00.000Z");
    assert.equal(db.tables.persona_encounter_public_exhibits[0].removed_by, null);
    assert.equal(db.tables.persona_encounter_public_exhibits[0].removed_at, null);

    const invalidThreadActionReport = db.insertRow("moderation_reports", {
      reporter_id: "owner-user",
      target_type: "thread",
      target_id: "thread-1",
      reason: "spam",
      status: "open",
    });
    const invalidThreadAction = await requestJson(app, "PATCH", `/reports/${invalidThreadActionReport.id}`, {
      token: "admin-token",
      body: { status: "resolved", targetAction: "remove" },
    });
    assert.equal(invalidThreadAction.status, 400);

    const updateJson = JSON.stringify({ removed: removed.body, restored: restored.body });
    assert.equal(updateJson.includes("raw-private-session-id"), false);
    assert.equal(updateJson.includes("encounter-owner-private-id"), false);
    assert.equal(updateJson.includes("Safe metadata only."), false);
    assert.equal(updateJson.includes("Harbor"), false);
    assert.equal(updateJson.includes("Lantern"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("admin report status updates can remove and conditionally restore cross-owner public exhibits", async () => {
  const db = new ReportsSupabase();
  const consent = db.insertRow("persona_encounter_cross_owner_consents", {
    id: "cross-owner-consent-1",
    requester_owner_user_id: "owner-user",
    requester_persona_id: "requester-persona-private-id",
    requester_persona_name_snapshot: "Harbor",
    counterparty_owner_user_id: "other-user",
    counterparty_persona_id: "counterparty-persona-private-id",
    counterparty_persona_name_snapshot: "Lantern",
    requested_scopes: ["publish_metadata_only_public_exhibit"],
    requested_scope_version: 1,
  });
  const publicExhibit = db.insertRow("persona_encounter_cross_owner_public_exhibits", {
    consent_id: consent.id,
    slug: "cross-owner-exhibit-12345678",
    public_title: "Cross-owner public card",
    public_summary: "Safe metadata only.",
    public_tags: ["safe"],
    requester_owner_user_id: "owner-user",
    requester_persona_id: "requester-persona-private-id",
    requester_persona_name_snapshot: "Harbor",
    counterparty_owner_user_id: "other-user",
    counterparty_persona_id: "counterparty-persona-private-id",
    counterparty_persona_name_snapshot: "Lantern",
    created_by: "owner-user",
    updated_by: "owner-user",
  });
  const report = db.insertRow("moderation_reports", {
    reporter_id: "visitor-user",
    target_type: "persona_encounter_cross_owner_public_exhibit",
    target_id: publicExhibit.id,
    reason: "unsafe public exhibit metadata",
    notes: "Admin-only notes.",
    status: "open",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const queue = await requestJson(app, "GET", "/reports?targetType=persona_encounter_cross_owner_public_exhibit", {
      token: "admin-token",
    });
    assert.equal(queue.status, 200);
    assert.deepEqual(queue.body.reports[0].targetContext, {
      targetType: "persona_encounter_cross_owner_public_exhibit",
      targetId: publicExhibit.id,
      title: "Cross-owner public card",
      status: "published",
      visibility: "public_api_detail",
      routeHref: null,
      routeLabel: null,
      canOpenRoute: false,
      unavailableReason: "Cross-owner public exhibit currently has API-only public detail readback.",
      supportedActions: ["remove"],
    });

    const removed = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "resolved", targetAction: "remove" },
    });
    assert.equal(removed.status, 200);
    assert.equal(removed.body.report.targetContext.status, "removed");
    assert.deepEqual(removed.body.report.targetContext.supportedActions, ["restore"]);
    assert.equal(db.tables.persona_encounter_cross_owner_public_exhibits[0].status, "removed");
    assert.equal(db.tables.persona_encounter_cross_owner_public_exhibits[0].removed_by, "admin-user");
    assert.equal(typeof db.tables.persona_encounter_cross_owner_public_exhibits[0].removed_at, "string");

    db.tables.persona_encounter_cross_owner_consents[0].status = "revoked";
    const blockedRestore = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(blockedRestore.status, 400);
    assert.equal(db.tables.persona_encounter_cross_owner_public_exhibits[0].status, "removed");

    db.tables.persona_encounter_cross_owner_consents[0].status = "approved";
    const restored = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(restored.status, 200);
    assert.equal(restored.body.report.targetContext.status, "published");
    assert.equal(restored.body.report.targetContext.visibility, "public_api_detail");
    assert.deepEqual(restored.body.report.targetContext.supportedActions, ["remove"]);
    assert.equal(db.tables.persona_encounter_cross_owner_public_exhibits[0].status, "published");
    assert.equal(db.tables.persona_encounter_cross_owner_public_exhibits[0].removed_by, null);
    assert.equal(db.tables.persona_encounter_cross_owner_public_exhibits[0].removed_at, null);

    const updateJson = JSON.stringify({ queue: queue.body, removed: removed.body, restored: restored.body });
    assert.equal(updateJson.includes("requester-persona-private-id"), false);
    assert.equal(updateJson.includes("counterparty-persona-private-id"), false);
    assert.equal(updateJson.includes("cross-owner-consent-1"), false);
    assert.equal(updateJson.includes("consent_id"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("admin report status updates can remove and conditionally restore generated publications", async () => {
  const db = new ReportsSupabase();
  const requesterOwnerId = "requester-owner-user";
  const counterpartyOwnerId = "counterparty-owner-user";
  const requesterPersonaId = "requester-persona-private-id";
  const counterpartyPersonaId = "counterparty-persona-private-id";
  const requesterPersonaName = "Requester Persona";
  const counterpartyPersonaName = "Counterparty Persona";
  const consent = db.insertRow("persona_encounter_cross_owner_consents", {
    id: "cross-owner-generated-consent-1",
    requester_owner_user_id: requesterOwnerId,
    requester_persona_id: requesterPersonaId,
    requester_persona_name_snapshot: requesterPersonaName,
    counterparty_owner_user_id: counterpartyOwnerId,
    counterparty_persona_id: counterpartyPersonaId,
    counterparty_persona_name_snapshot: counterpartyPersonaName,
    requested_scopes: ["save_private_cross_owner_artifact", "publish_exact_generated_revision"],
    requested_scope_version: 1,
  });
  const artifact = db.insertRow("persona_encounter_cross_owner_generated_artifacts", {
    id: "cross-owner-generated-artifact-1",
    consent_id: consent.id,
    requester_owner_user_id: requesterOwnerId,
    requester_persona_id: requesterPersonaId,
    requester_persona_name_snapshot: requesterPersonaName,
    counterparty_owner_user_id: counterpartyOwnerId,
    counterparty_persona_id: counterpartyPersonaId,
    counterparty_persona_name_snapshot: counterpartyPersonaName,
    lifecycle_status: "active",
    generated_content_digest: "a".repeat(64),
  });
  const revision = db.insertRow("persona_encounter_cross_owner_generated_revisions", {
    id: "cross-owner-generated-revision-1",
    consent_id: consent.id,
    artifact_id: artifact.id,
    requester_persona_name_snapshot: requesterPersonaName,
    counterparty_persona_name_snapshot: counterpartyPersonaName,
    consent_requested_scopes: ["save_private_cross_owner_artifact", "publish_exact_generated_revision"],
    consent_requested_scope_version: 1,
    final_title: "Exact generated public detail",
    final_body: "Exact generated body must not appear in admin target context.",
    final_excerpt: null,
    text_digest: "b".repeat(64),
    source_artifact_digest: artifact.generated_content_digest,
    status: "approved",
  });
  db.insertRow("persona_encounter_cross_owner_generated_revision_approvals", {
    revision_id: revision.id,
    artifact_id: artifact.id,
    consent_id: consent.id,
    participant_role: "requester",
    approver_owner_user_id: requesterOwnerId,
    revision_digest: revision.text_digest,
  });
  db.insertRow("persona_encounter_cross_owner_generated_revision_approvals", {
    revision_id: revision.id,
    artifact_id: artifact.id,
    consent_id: consent.id,
    participant_role: "counterparty",
    approver_owner_user_id: counterpartyOwnerId,
    revision_digest: revision.text_digest,
  });
  const publication = db.insertRow("persona_encounter_cross_owner_generated_publications", {
    consent_id: consent.id,
    artifact_id: artifact.id,
    revision_id: revision.id,
    requester_owner_user_id: requesterOwnerId,
    requester_persona_id: requesterPersonaId,
    requester_persona_name_snapshot: requesterPersonaName,
    counterparty_owner_user_id: counterpartyOwnerId,
    counterparty_persona_id: counterpartyPersonaId,
    counterparty_persona_name_snapshot: counterpartyPersonaName,
    public_slug: "generated-publication-12345678",
    public_title: "Exact generated public detail",
    public_body: "Exact generated body must not appear in admin target context.",
    revision_digest: revision.text_digest,
    source_artifact_digest: artifact.generated_content_digest,
    created_by: "owner-user",
    updated_by: "owner-user",
  });
  const report = db.insertRow("moderation_reports", {
    reporter_id: "visitor-user",
    target_type: "persona_encounter_cross_owner_generated_publication",
    target_id: publication.id,
    reason: "unsafe generated publication",
    notes: "Admin-only generated-publication note.",
    status: "open",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const queue = await requestJson(app, "GET", "/reports?targetType=persona_encounter_cross_owner_generated_publication", {
      token: "admin-token",
    });
    assert.equal(queue.status, 200);
    assert.deepEqual(queue.body.reports[0].targetContext, {
      targetType: "persona_encounter_cross_owner_generated_publication",
      targetId: publication.id,
      title: "Exact generated public detail",
      status: "published",
      visibility: "public_detail",
      routeHref: "/encounters/cross-owner/generated/generated-publication-12345678",
      routeLabel: "Exact generated public detail",
      canOpenRoute: true,
      unavailableReason: null,
      supportedActions: ["remove"],
    });

    const removed = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "resolved", targetAction: "remove" },
    });
    assert.equal(removed.status, 200);
    assert.equal(removed.body.report.targetContext.status, "removed");
    assert.equal(removed.body.report.targetContext.visibility, "not_public");
    assert.deepEqual(removed.body.report.targetContext.supportedActions, ["restore"]);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].status, "removed");
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].removed_by, "admin-user");
    assert.equal(typeof db.tables.persona_encounter_cross_owner_generated_publications[0].removed_at, "string");
    assert.equal(
      db.tables.persona_encounter_cross_owner_generated_publication_audit_events[0].event_type,
      "moderation_removed",
    );

    db.tables.persona_encounter_cross_owner_consents[0].status = "revoked";
    const blockedRestore = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(blockedRestore.status, 400);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].status, "removed");

    db.tables.persona_encounter_cross_owner_consents[0].status = "approved";
    db.tables.persona_encounter_cross_owner_generated_revision_approvals.pop();
    const blockedMissingApprovalRestore = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(blockedMissingApprovalRestore.status, 400);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].status, "removed");
    db.insertRow("persona_encounter_cross_owner_generated_revision_approvals", {
      revision_id: revision.id,
      artifact_id: artifact.id,
      consent_id: consent.id,
      participant_role: "counterparty",
      approver_owner_user_id: counterpartyOwnerId,
      revision_digest: revision.text_digest,
    });
    db.tables.persona_encounter_cross_owner_generated_revisions[0].final_body = "Edited body cannot restore old publication.";
    const blockedEditedRevisionRestore = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(blockedEditedRevisionRestore.status, 400);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].status, "removed");
    db.tables.persona_encounter_cross_owner_generated_revisions[0].final_body =
      "Exact generated body must not appear in admin target context.";
    db.tables.persona_encounter_cross_owner_generated_artifacts[0].requester_persona_name_snapshot = "Changed requester snapshot";
    const blockedSnapshotDriftRestore = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(blockedSnapshotDriftRestore.status, 400);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].status, "removed");
    db.tables.persona_encounter_cross_owner_generated_artifacts[0].requester_persona_name_snapshot =
      requesterPersonaName;

    const restored = await requestJson(app, "PATCH", `/reports/${report.id}`, {
      token: "admin-token",
      body: { status: "reviewing", targetAction: "restore" },
    });
    assert.equal(restored.status, 200);
    assert.equal(restored.body.report.targetContext.status, "published");
    assert.equal(restored.body.report.targetContext.visibility, "public_detail");
    assert.deepEqual(restored.body.report.targetContext.supportedActions, ["remove"]);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].status, "published");
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].removed_by, null);
    assert.equal(db.tables.persona_encounter_cross_owner_generated_publications[0].removed_at, null);
    assert.equal(
      db.tables.persona_encounter_cross_owner_generated_publication_audit_events[1].event_type,
      "moderation_restored",
    );

    const updateJson = JSON.stringify({ queue: queue.body, removed: removed.body, restored: restored.body });
    assert.equal(updateJson.includes("Exact generated body must not appear"), false);
    assert.equal(updateJson.includes(requesterOwnerId), false);
    assert.equal(updateJson.includes(counterpartyOwnerId), false);
    assert.equal(updateJson.includes(requesterPersonaId), false);
    assert.equal(updateJson.includes(counterpartyPersonaId), false);
    assert.equal(updateJson.includes("cross-owner-generated-consent-1"), false);
    assert.equal(updateJson.includes("cross-owner-generated-artifact-1"), false);
    assert.equal(updateJson.includes("cross-owner-generated-revision-1"), false);
    assert.equal(updateJson.includes("consent_id"), false);
    assert.equal(updateJson.includes("artifact_id"), false);
    assert.equal(updateJson.includes("revision_id"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("moderation review requests enforce standing, safe participant serialization, and duplicate active requests", async () => {
  const db = new ReportsSupabase();
  db.insertRow("threads", {
    id: "thread-1",
    author_user_id: "other-user",
    status: "active",
  });
  db.insertRow("comments", {
    id: "comment-1",
    author_user_id: "owner-user",
    parent_type: "thread",
    parent_id: "thread-1",
    status: "active",
  });
  const ownerReport = db.insertRow("moderation_reports", {
    reporter_id: "owner-user",
    target_type: "thread",
    target_id: "thread-1",
    reason: "spam",
    status: "resolved",
    notes: "Admin-only report notes.",
    reviewed_by: "admin-user",
  });
  const otherReport = db.insertRow("moderation_reports", {
    reporter_id: "other-user",
    target_type: "comment",
    target_id: "comment-1",
    reason: "harassment",
    status: "resolved",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const anonymousCreate = await requestJson(app, "POST", "/reports/review-requests", {
      body: { reportId: ownerReport.id, reason: "Please review this decision." },
    });
    assert.equal(anonymousCreate.status, 401);

    const visitorCreate = await requestJson(app, "POST", "/reports/review-requests", {
      token: "visitor-token",
      body: { reportId: ownerReport.id, reason: "Please review this decision." },
    });
    assert.equal(visitorCreate.status, 403);

    const created = await requestJson(app, "POST", "/reports/review-requests", {
      token: "owner-token",
      body: {
        reportId: ownerReport.id,
        reason: "Please review this decision.",
        status: "upheld",
        adminNotes: "spoofed admin note",
        reviewedBy: "spoofed-user",
      },
    });
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.reviewRequest, {
      id: "moderation_review_requests-1",
      requesterRole: "reporter",
      targetType: "thread",
      targetId: "thread-1",
      reportId: ownerReport.id,
      reason: "Please review this decision.",
      status: "open",
      createdAt: "2026-05-25T09:00:04.000Z",
      updatedAt: "2026-05-25T09:00:04.000Z",
    });
    assert.deepEqual(db.tables.moderation_review_requests[0], {
      id: "moderation_review_requests-1",
      requester_id: "owner-user",
      requester_role: "reporter",
      target_type: "thread",
      target_id: "thread-1",
      report_id: ownerReport.id,
      moderation_action_id: null,
      reason: "Please review this decision.",
      status: "open",
      resolution_summary: null,
      admin_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: "2026-05-25T09:00:04.000Z",
      updated_at: "2026-05-25T09:00:04.000Z",
    });

    const duplicate = await requestJson(app, "POST", "/reports/review-requests", {
      token: "owner-token",
      body: { reportId: ownerReport.id, reason: "Please review this decision." },
    });
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(duplicate.body.reviewRequest.id, "moderation_review_requests-1");
    assert.equal(db.tables.moderation_review_requests.length, 1);

    const blockedOtherReport = await requestJson(app, "POST", "/reports/review-requests", {
      token: "visitor-token",
      body: { reportId: otherReport.id, reason: "No standing." },
    });
    assert.equal(blockedOtherReport.status, 403);

    const targetAuthorRequest = await requestJson(app, "POST", "/reports/review-requests", {
      token: "owner-token",
      body: { targetType: "comment", targetId: "comment-1", reason: "Please review the comment moderation." },
    });
    assert.equal(targetAuthorRequest.status, 201);
    assert.equal(targetAuthorRequest.body.reviewRequest.requesterRole, "target_author");
    assert.equal(targetAuthorRequest.body.reviewRequest.reportId, undefined);

    const targetAuthorReportRequest = await requestJson(app, "POST", "/reports/review-requests", {
      token: "owner-token",
      body: { reportId: otherReport.id, reason: "Please review the report about my comment." },
    });
    assert.equal(targetAuthorReportRequest.status, 201);
    assert.equal(targetAuthorReportRequest.body.reviewRequest.requesterRole, "target_author");
    assert.equal(targetAuthorReportRequest.body.reviewRequest.reportId, undefined);

    const mine = await requestJson(app, "GET", "/reports/review-requests/mine", {
      token: "owner-token",
    });
    assert.equal(mine.status, 200);
    assert.deepEqual(
      mine.body.reviewRequests.map((request: Row) => request.id),
      ["moderation_review_requests-3", "moderation_review_requests-2", "moderation_review_requests-1"]
    );
    const mineJson = JSON.stringify(mine.body);
    assert.equal(mineJson.includes("admin_notes"), false);
    assert.equal(mineJson.includes("reviewed_by"), false);
    assert.equal(mineJson.includes("requester_id"), false);
    assert.equal(mineJson.includes("Admin-only report notes."), false);
    assert.equal(mineJson.includes(otherReport.id), false);

    const adminReadback = await requestJson(app, "GET", "/reports/review-requests?limit=10", {
      token: "admin-token",
    });
    assert.equal(adminReadback.status, 200);
    const adminTargetAuthorRequest = adminReadback.body.reviewRequests.find(
      (request: Row) => request.id === targetAuthorReportRequest.body.reviewRequest.id
    );
    assert.equal(adminTargetAuthorRequest.reportId, otherReport.id);

    const otherMine = await requestJson(app, "GET", "/reports/review-requests/mine", {
      token: "other-token",
    });
    assert.equal(otherMine.status, 200);
    assert.equal(otherMine.body.reviewRequests.length, 0);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("moderation review request queue and updates are admin-only", async () => {
  const db = new ReportsSupabase();
  const openRequest = db.insertRow("moderation_review_requests", {
    requester_id: "owner-user",
    requester_role: "reporter",
    target_type: "thread",
    target_id: "thread-1",
    report_id: "report-1",
    reason: "Please review.",
    status: "open",
  });
  const reviewingRequest = db.insertRow("moderation_review_requests", {
    requester_id: "other-user",
    requester_role: "target_author",
    target_type: "comment",
    target_id: "comment-1",
    report_id: null,
    reason: "Please review the comment action.",
    status: "reviewing",
    admin_notes: "Internal handling note.",
  });
  const deniedRequest = db.insertRow("moderation_review_requests", {
    requester_id: "owner-user",
    requester_role: "reporter",
    target_type: "comment",
    target_id: "comment-2",
    report_id: "report-2",
    reason: "Already reviewed.",
    status: "denied",
    resolution_summary: "The original decision stands.",
    admin_notes: "Private admin note.",
    reviewed_by: "admin-user",
    reviewed_at: "2026-05-25T08:00:00.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createReportsApp();

  try {
    const anonymousQueue = await requestJson(app, "GET", "/reports/review-requests");
    assert.equal(anonymousQueue.status, 401);

    const memberQueue = await requestJson(app, "GET", "/reports/review-requests", {
      token: "owner-token",
    });
    assert.equal(memberQueue.status, 403);

    const adminQueue = await requestJson(app, "GET", "/reports/review-requests", {
      token: "admin-token",
    });
    assert.equal(adminQueue.status, 200);
    assert.deepEqual(
      adminQueue.body.reviewRequests.map((request: Row) => request.id),
      [reviewingRequest.id, openRequest.id]
    );
    assert.equal(adminQueue.body.reviewRequests[0].requesterUserId, "other-user");
    assert.equal(adminQueue.body.reviewRequests[0].adminNotes, "Internal handling note.");

    const deniedQueue = await requestJson(app, "GET", "/reports/review-requests?status=denied", {
      token: "admin-token",
    });
    assert.equal(deniedQueue.status, 200);
    assert.deepEqual(deniedQueue.body.reviewRequests.map((request: Row) => request.id), [deniedRequest.id]);

    const memberUpdate = await requestJson(app, "PATCH", `/reports/review-requests/${openRequest.id}`, {
      token: "owner-token",
      body: { status: "upheld" },
    });
    assert.equal(memberUpdate.status, 403);

    const invalidUpdate = await requestJson(app, "PATCH", `/reports/review-requests/${openRequest.id}`, {
      token: "admin-token",
      body: { status: "open" },
    });
    assert.equal(invalidUpdate.status, 400);

    const adminUpdate = await requestJson(app, "PATCH", `/reports/review-requests/${openRequest.id}`, {
      token: "admin-token",
      body: {
        status: "upheld",
        resolutionSummary: "We restored the reported item.",
        adminNotes: "Private admin context.",
        reviewedBy: "spoofed-user",
        reviewedAt: "2000-01-01T00:00:00.000Z",
      },
    });
    assert.equal(adminUpdate.status, 200);
    assert.equal(adminUpdate.body.reviewRequest.status, "upheld");
    assert.equal(adminUpdate.body.reviewRequest.resolutionSummary, "We restored the reported item.");
    assert.equal(adminUpdate.body.reviewRequest.adminNotes, "Private admin context.");
    assert.equal(adminUpdate.body.reviewRequest.reviewedBy, "admin-user");
    assert.notEqual(adminUpdate.body.reviewRequest.reviewedAt, "2000-01-01T00:00:00.000Z");

    const ownerMine = await requestJson(app, "GET", "/reports/review-requests/mine", {
      token: "owner-token",
    });
    assert.equal(ownerMine.status, 200);
    const updatedMine = ownerMine.body.reviewRequests.find((request: Row) => request.id === openRequest.id);
    assert.equal(updatedMine.status, "upheld");
    assert.equal(updatedMine.resolutionSummary, "We restored the reported item.");
    assert.equal(updatedMine.adminNotes, undefined);
    assert.equal(updatedMine.reviewedBy, undefined);
    assert.equal(JSON.stringify(updatedMine).includes("Private admin context."), false);

    assert.equal(db.tables.community_notifications.length, 1);
    assert.equal(db.tables.community_notifications[0].recipient_user_id, "owner-user");
    assert.equal(db.tables.community_notifications[0].actor_user_id, null);
    assert.equal(db.tables.community_notifications[0].notification_type, "review_request_status");
    assert.equal(db.tables.community_notifications[0].target_type, "moderation_review_request");
    assert.equal(db.tables.community_notifications[0].target_id, openRequest.id);
    assert.equal(
      db.tables.community_notifications[0].summary,
      "Your review request is now upheld: We restored the reported item."
    );
    assert.deepEqual(db.tables.community_notifications[0].metadata, {
      reviewRequestId: openRequest.id,
      status: "upheld",
      resolutionSummary: "We restored the reported item.",
    });
    const notificationJson = JSON.stringify(db.tables.community_notifications[0]);
    assert.equal(notificationJson.includes("Private admin context."), false);
    assert.equal(notificationJson.includes("admin-user"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
