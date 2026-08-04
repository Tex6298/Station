import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { institutionCommunityRouter } from "./institution-community";
import { institutionsRouter } from "./institutions";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InstitutionSupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "admin-user", username: "Station_Admin", display_name: "Station Admin", tier: "canon", is_admin: true },
      { id: "owner-user", username: "Owner_Exact", display_name: "Owner Exact", tier: "institutional", is_admin: false },
      { id: "member-user", username: "Member_Exact", display_name: "Member Exact", tier: "private", is_admin: false },
      { id: "other-user", username: "Other_Exact", display_name: "Other Exact", tier: "private", is_admin: false },
      { id: "invitee-user", username: "Invitee_Exact", display_name: "Invitee Exact", tier: "private", is_admin: false },
      { id: "past-user", username: "Past_Exact", display_name: "Past Exact", tier: "private", is_admin: false },
      { id: "former-user", username: "Former_Exact", display_name: "Former Exact", tier: "private", is_admin: false },
      { id: "station-user", username: "Station_Exact", display_name: "Station Exact", tier: "private", is_admin: false },
    ],
    institutions: [],
    institution_members: [],
    institution_audit_events: [],
    institution_spaces: [],
    institution_publications: [],
    community_subcommunities: [],
    forum_categories: [],
    projects: [],
  };

  queriedTables: string[] = [];
  rpcCalls: Array<{ name: string; args: Row }> = [];
  private clock = Date.parse("2026-07-30T18:00:00.000Z");
  private ids = 0;
  private failures: Array<{ table: string; operation: string }> = [];
  private usersByToken = new Map([
    ["admin-token", { id: "admin-user", email: "admin@example.test" }],
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["member-token", { id: "member-user", email: "member@example.test" }],
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
    from: (table: string) => {
      this.queriedTables.push(table);
      return new QueryBuilder(this, table);
    },
    rpc: (name: string, args: Row) => this.rpc(name, args),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  failNext(table: string, operation = "select") { this.failures.push({ table, operation }); }
  consumeFailure(table: string, operation: string) {
    const index = this.failures.findIndex((failure) => failure.table === table && failure.operation === operation);
    if (index < 0) return false;
    this.failures.splice(index, 1);
    return true;
  }

  now() {
    return new Date(this.clock).toISOString();
  }

  timestamp() {
    const value = this.now();
    this.clock += 1000;
    return value;
  }

  currentTimeMs() {
    return this.clock;
  }

  advanceDays(days: number) {
    this.clock += days * 24 * 60 * 60 * 1000;
  }

  insertRow(table: string, payload: Row) {
    const row = this.prepareRow(table, payload);
    this.rows(table).push(row);
    return row;
  }

  private nextId() {
    this.ids += 1;
    return `00000000-0000-4000-8000-${String(this.ids).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId();

    if (table === "institutions") {
      row.summary ??= null;
      row.verification_status ??= "unverified";
      row.public_status ??= "private";
      row.verified_at ??= null;
      row.verified_by_user_id ??= null;
      row.verification_revoked_at ??= null;
      row.verification_revoked_by_user_id ??= null;
      row.published_at ??= null;
      row.unpublished_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "institution_members") {
      row.role ??= "member";
      row.status ??= "invited";
      row.responded_at ??= null;
      row.removed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "institution_audit_events") {
      row.created_at ??= now;
    }

    if (table === "projects") {
      row.owner_user_id ??= null;
      row.description ??= null;
      row.visibility ??= "private";
      row.connection_tier ??= "tier_1_showcase";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "community_subcommunities") {
      row.owner_user_id ??= null;
      row.description ??= null;
      row.subcommunity_type ??= "salon";
      row.visibility ??= "public";
      row.status ??= "active";
      row.linked_space_id ??= null;
      row.linked_developer_space_id ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }

  private profile(id: string) {
    return this.rows("profiles").find((row) => row.id === id);
  }

  private institution(id: string) {
    return this.rows("institutions").find((row) => row.id === id);
  }

  private audit(institutionId: string, actorId: string, subjectId: string, action: string, createdAt: string) {
    this.insertRow("institution_audit_events", {
      institution_id: institutionId,
      actor_user_id: actorId,
      subject_user_id: subjectId,
      action,
      created_at: createdAt,
    });
  }

  private async rpc(name: string, args: Row) {
    this.rpcCalls.push({ name, args: clone(args) });

    if (name === "provision_institution_v1") {
      const actor = this.profile(args.p_actor_user_id);
      const owner = this.profile(args.p_owner_user_id);
      if (!actor?.is_admin || !owner) {
        return { data: [{ outcome: "unavailable", institution_id: null }], error: null };
      }
      if (this.rows("institutions").some((row) => row.slug === args.p_slug)) {
        return { data: [{ outcome: "conflict", institution_id: null }], error: null };
      }
      const institution = this.insertRow("institutions", {
        owner_user_id: owner.id,
        name: args.p_name.trim(),
        slug: args.p_slug,
        summary: args.p_summary,
      });
      this.audit(institution.id, actor.id, owner.id, "provisioned", institution.created_at);
      return { data: [{ outcome: "created", institution_id: institution.id }], error: null };
    }

    if (name === "create_institution_project_v1") {
      const institution = this.institution(args.p_institution_id);
      if (!institution || institution.owner_user_id !== args.p_actor_user_id) {
        return { data: null, error: null };
      }
      if (this.rows("projects").some((row) => row.slug === args.p_slug)) {
        return { data: null, error: { code: "23505" } };
      }
      const project = this.insertRow("projects", {
          owner_user_id: null,
          institution_id: institution.id,
          name: args.p_name.trim(),
          slug: args.p_slug,
          description: args.p_description,
          visibility: args.p_visibility,
          connection_tier: args.p_connection_tier,
        });
      this.insertRow("institution_audit_events", {
        institution_id: institution.id,
        actor_user_id: args.p_actor_user_id,
        subject_user_id: args.p_actor_user_id,
        action: "project_created",
        resource_kind: "institution_project",
        resource_id: project.id,
        created_at: project.created_at,
      });
      return { data: project, error: null };
    }

    if (name === "create_institution_subcommunity_v1") {
      const institution = this.institution(args.p_institution_id);
      if (!institution || institution.owner_user_id !== args.p_actor_user_id) {
        return { data: [{ outcome: "unavailable", subcommunity_id: null, category_id: null }], error: null };
      }
      if (this.rows("community_subcommunities").some((row) => row.institution_id === institution.id || row.slug === args.p_slug)) {
        return { data: [{ outcome: "conflict", subcommunity_id: null, category_id: null }], error: null };
      }
      const category = this.insertRow("forum_categories", {
        slug: args.p_slug,
        title: args.p_title,
        description: args.p_description,
        sort_order: 100,
      });
      const subcommunity = this.insertRow("community_subcommunities", {
        category_id: category.id,
        institution_id: institution.id,
        slug: args.p_slug,
        title: args.p_title,
        description: args.p_description,
      });
      this.insertRow("institution_audit_events", {
        institution_id: institution.id,
        actor_user_id: args.p_actor_user_id,
        subject_user_id: args.p_actor_user_id,
        action: "community_created",
        resource_kind: "institution_subcommunity",
        resource_id: subcommunity.id,
      });
      return { data: [{ outcome: "created", subcommunity_id: subcommunity.id, category_id: category.id }], error: null };
    }

    if (name === "transition_institution_verification_v1") {
      const institution = this.institution(args.p_institution_id);
      const actor = this.profile(args.p_actor_user_id);
      if (!institution || !actor?.is_admin) {
        return { data: [{ outcome: "unavailable", verification_status: null, public_status: null }], error: null };
      }
      const now = this.timestamp();
      if (args.p_verified) {
        if (institution.verification_status === "verified") {
          return { data: [{ outcome: "unchanged", verification_status: "verified", public_status: institution.public_status }], error: null };
        }
        institution.verification_status = "verified";
        institution.verified_at = now;
        institution.verified_by_user_id = actor.id;
        institution.verification_revoked_at = null;
        institution.verification_revoked_by_user_id = null;
        institution.updated_at = now;
        this.audit(institution.id, actor.id, institution.owner_user_id, "verification_granted", now);
        return { data: [{ outcome: "verified", verification_status: "verified", public_status: institution.public_status }], error: null };
      }
      if (institution.verification_status !== "verified") {
        return { data: [{ outcome: "unchanged", verification_status: institution.verification_status, public_status: institution.public_status }], error: null };
      }
      const wasPublic = institution.public_status === "public";
      institution.verification_status = "revoked";
      institution.public_status = "private";
      institution.verification_revoked_at = now;
      institution.verification_revoked_by_user_id = actor.id;
      if (wasPublic) institution.unpublished_at = now;
      institution.updated_at = now;
      this.audit(institution.id, actor.id, institution.owner_user_id, "verification_revoked", now);
      return { data: [{ outcome: "revoked", verification_status: "revoked", public_status: "private" }], error: null };
    }

    if (name === "transition_institution_publication_v1") {
      const institution = this.institution(args.p_institution_id);
      if (!institution || institution.owner_user_id !== args.p_actor_user_id || !this.profile(args.p_actor_user_id)) {
        return { data: [{ outcome: "unavailable", public_status: null }], error: null };
      }
      if (args.p_public && institution.verification_status !== "verified") {
        return { data: [{ outcome: "not_verified", public_status: institution.public_status }], error: null };
      }
      if ((args.p_public && institution.public_status === "public")
        || (!args.p_public && institution.public_status === "private")) {
        return { data: [{ outcome: "unchanged", public_status: institution.public_status }], error: null };
      }
      const now = this.timestamp();
      institution.public_status = args.p_public ? "public" : "private";
      if (args.p_public) {
        institution.published_at = now;
        institution.unpublished_at = null;
      } else {
        institution.unpublished_at = now;
      }
      institution.updated_at = now;
      this.audit(
        institution.id,
        args.p_actor_user_id,
        args.p_actor_user_id,
        args.p_public ? "published" : "unpublished",
        now
      );
      return { data: [{ outcome: args.p_public ? "published" : "unpublished", public_status: institution.public_status }], error: null };
    }

    if (name === "invite_institution_member_v1") {
      const institution = this.institution(args.p_institution_id);
      const target = this.profile(args.p_target_user_id);
      if (!institution || institution.owner_user_id !== args.p_actor_user_id || !target
        || target.id === args.p_actor_user_id) {
        return { data: [{ outcome: "unavailable", invited_at: null, expires_at: null }], error: null };
      }
      const now = this.timestamp();
      const current = this.rows("institution_members").find((row) => (
        row.institution_id === institution.id
        && row.user_id === target.id
        && row.status !== "removed"
      ));
      if (current?.status === "invited" && Date.parse(current.invite_expires_at) <= Date.parse(now)) {
        current.status = "removed";
        current.removed_at = now;
        current.updated_at = now;
        this.audit(institution.id, args.p_actor_user_id, target.id, "invitation_expired", now);
      } else if (current?.status === "invited") {
        return { data: [{ outcome: "already_invited", invited_at: null, expires_at: null }], error: null };
      } else if (current?.status === "active") {
        return { data: [{ outcome: "already_active", invited_at: null, expires_at: null }], error: null };
      }

      const expiresAt = new Date(Date.parse(now) + 14 * 24 * 60 * 60 * 1000).toISOString();
      this.insertRow("institution_members", {
        institution_id: institution.id,
        user_id: target.id,
        invite_expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      });
      this.audit(institution.id, args.p_actor_user_id, target.id, "member_invited", now);
      return { data: [{ outcome: "invited", invited_at: now, expires_at: expiresAt }], error: null };
    }

    if (name === "respond_institution_invitation_v1") {
      const institution = this.institution(args.p_institution_id);
      const member = this.rows("institution_members").find((row) => (
        row.institution_id === args.p_institution_id
        && row.user_id === args.p_actor_user_id
        && row.role === "member"
        && row.status === "invited"
      ));
      if (!institution || !member || !["accept", "decline"].includes(args.p_action)) {
        return { data: [{ outcome: "unavailable", responded_at: null }], error: null };
      }
      const now = this.timestamp();
      if (Date.parse(member.invite_expires_at) <= Date.parse(now)) {
        member.status = "removed";
        member.removed_at = now;
        member.updated_at = now;
        this.audit(institution.id, args.p_actor_user_id, args.p_actor_user_id, "invitation_expired", now);
        return { data: [{ outcome: "stale", responded_at: null }], error: null };
      }
      member.responded_at = now;
      member.updated_at = now;
      if (args.p_action === "accept") {
        member.status = "active";
        this.audit(institution.id, args.p_actor_user_id, args.p_actor_user_id, "invitation_accepted", now);
        return { data: [{ outcome: "accepted", responded_at: now }], error: null };
      }
      member.status = "removed";
      member.removed_at = now;
      this.audit(institution.id, args.p_actor_user_id, args.p_actor_user_id, "invitation_declined", now);
      return { data: [{ outcome: "declined", responded_at: now }], error: null };
    }

    if (name === "revoke_institution_member_v1") {
      const institution = this.institution(args.p_institution_id);
      const member = this.rows("institution_members").find((row) => (
        row.institution_id === args.p_institution_id
        && row.user_id === args.p_target_user_id
        && row.role === "member"
        && ["invited", "active"].includes(row.status)
      ));
      if (!institution || institution.owner_user_id !== args.p_actor_user_id || !member) {
        return { data: [{ outcome: "unavailable", removed_at: null }], error: null };
      }
      const now = this.timestamp();
      member.status = "removed";
      member.removed_at = now;
      member.updated_at = now;
      this.audit(institution.id, args.p_actor_user_id, args.p_target_user_id, "member_revoked", now);
      return { data: [{ outcome: "revoked", removed_at: now }], error: null };
    }

    return { data: null, error: { message: `Unexpected RPC: ${name}` } };
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, Set<unknown>]> = [];
  private greaterThanFilters: Array<[string, unknown]> = [];
  private lessThanOrEqualFilters: Array<[string, unknown]> = [];
  private orFilters: Array<Array<[string, "eq" | "gt", string]>> = [];
  private orderSpecs: Array<{ field: string; ascending: boolean }> = [];
  private cursor: { at: string; id: string } | null = null;
  private limitCount: number | null = null;
  private rangeStart = 0;
  private countRequested = false;
  private head = false;
  private columns = "*";

  constructor(private db: InstitutionSupabase, private table: string) {}

  select(columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.columns = columns;
    this.countRequested = options.count === "exact";
    this.head = options.head === true;
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  in(field: string, values: unknown[]) {
    this.inFilters.push([field, new Set(values)]);
    return this;
  }

  gt(field: string, value: unknown) {
    this.greaterThanFilters.push([field, value]);
    return this;
  }

  lte(field: string, value: unknown) {
    this.lessThanOrEqualFilters.push([field, value]);
    return this;
  }

  or(expression: string) {
    const cursor = expression.match(/^created_at\.lt\.(.+),and\(created_at\.eq\.(.+),id\.lt\.(.+)\)$/);
    if (cursor) { this.cursor = { at: cursor[1], id: cursor[3] }; return this; }
    const clauses = expression.split(",").map((clause): [string, "eq" | "gt", string] => {
      const [field, operator, ...parts] = clause.split(".");
      if (!field || (operator !== "eq" && operator !== "gt") || parts.length === 0) {
        throw new Error(`Unsupported OR filter: ${expression}`);
      }
      return [field, operator, parts.join(".")];
    });
    this.orFilters.push(clauses);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpecs.push({ field, ascending: options.ascending ?? true });
    return this;
  }

  limit(value: number) { this.limitCount = value; return this; }
  range(from: number, to: number) { this.rangeStart = from; this.limitCount = to - from + 1; return this; }

  single() {
    return this.execute("single");
  }

  maybeSingle() {
    return this.execute("maybeSingle");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private isGreaterThan(rowValue: unknown, filterValue: unknown) {
    const left = Date.parse(String(rowValue ?? ""));
    const right = filterValue === "now"
      ? this.db.currentTimeMs()
      : Date.parse(String(filterValue ?? ""));
    return Number.isFinite(left) && Number.isFinite(right) && left > right;
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];
    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }
    for (const [field, values] of this.inFilters) {
      rows = rows.filter((row) => values.has(row[field]));
    }
    for (const [field, value] of this.greaterThanFilters) {
      rows = rows.filter((row) => this.isGreaterThan(row[field], value));
    }
    for (const [field, value] of this.lessThanOrEqualFilters) {
      rows = rows.filter((row) => row[field] <= value);
    }
    for (const clauses of this.orFilters) {
      rows = rows.filter((row) => clauses.some(([field, operator, value]) => (
        operator === "eq" ? row[field] === value : this.isGreaterThan(row[field], value)
      )));
    }
    if (this.cursor) {
      rows = rows.filter((row) => row.created_at < this.cursor!.at || (row.created_at === this.cursor!.at && row.id < this.cursor!.id));
    }
    if (this.orderSpecs.length) {
      rows.sort((a, b) => {
        for (const { field, ascending } of this.orderSpecs) {
          if (a[field] !== b[field]) return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
        }
        return 0;
      });
    }
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    if (this.db.consumeFailure(this.table, "select")) return { data: null, error: { message: "Forced query failure." }, count: null };
    const matched = this.matchingRows();
    const count = this.countRequested ? matched.length : null;
    const limited = this.limitCount === null ? matched : matched.slice(this.rangeStart, this.rangeStart + this.limitCount);
    const rows = clone(limited).map((row) => {
      if (this.table === "community_subcommunities" && this.columns.includes("category:forum_categories")) {
        return { ...row, category: this.db.rows("forum_categories").find((category) => category.id === row.category_id) ?? null };
      }
      return row;
    });
    if (mode === "single") {
      return rows.length === 1
        ? { data: rows[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }
    if (mode === "maybeSingle") return { data: rows[0] ?? null, error: null, count };
    return { data: this.head ? null : rows, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createInstitutionApp() {
  const app = express();
  app.use(express.json());
  app.use(institutionCommunityRouter);
  app.use("/institutions", institutionsRouter);
  return app;
}

async function requestJson(
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
    return {
      status: response.status,
      cacheControl: response.headers.get("cache-control"),
      body: await response.json(),
    };
  } finally {
    await close(server);
  }
}

function listen(app: Express): Promise<Server> {
  return new Promise((resolveServer) => {
    const server = app.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
}

function assertKeys(value: object, expected: string[]) {
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort());
}

function seedInstitutionActivity(db: InstitutionSupabase) {
  const institution = db.insertRow("institutions", { owner_user_id: "owner-user", name: "Station Labs", slug: "station-labs" });
  db.insertRow("institution_members", { institution_id: institution.id, user_id: "member-user", role: "member", status: "active" });
  db.insertRow("institution_members", { institution_id: institution.id, user_id: "invitee-user", role: "member", status: "invited" });
  db.insertRow("institution_members", { institution_id: institution.id, user_id: "past-user", role: "member", status: "removed" });
  db.insertRow("institution_members", { institution_id: institution.id, user_id: "former-user", role: "member", status: "removed" });
  const project = db.insertRow("projects", { institution_id: institution.id, name: "Signal Project", slug: "signal-project" });
  const publication = db.insertRow("institution_publications", { institution_id: institution.id, title: "Field Note", slug: "field-note" });
  const space = db.insertRow("institution_spaces", { institution_id: institution.id, headline: "Station Labs home" });
  const community = db.insertRow("community_subcommunities", { institution_id: institution.id, title: "Research Salon", slug: "research-salon" });
  const events = [
    ["provisioned", null, null],
    ["member_invited", null, null],
    ["project_created", "institution_project", project.id],
    ["publication_created", "institution_publication", publication.id],
    ["space_created", "institution_space", space.id],
    ["community_created", "institution_subcommunity", community.id],
  ];
  for (const [action, resourceKind, resourceId] of events) db.insertRow("institution_audit_events", {
    institution_id: institution.id,
    actor_user_id: "owner-user",
    subject_user_id: action === "member_invited" ? "member-user" : "owner-user",
    action,
    resource_kind: resourceKind,
    resource_id: resourceId,
  });
  for (const event of [
    { actor_user_id: "station-user", subject_user_id: "owner-user", action: "verification_granted" },
    { actor_user_id: "owner-user", subject_user_id: "invitee-user", action: "member_invited" },
    { actor_user_id: "past-user", subject_user_id: "past-user", action: "invitation_declined" },
    { actor_user_id: "former-user", subject_user_id: "former-user", action: "invitation_accepted" },
    { actor_user_id: "owner-user", subject_user_id: "former-user", action: "member_revoked" },
  ]) db.insertRow("institution_audit_events", {
    institution_id: institution.id,
    resource_kind: null,
    resource_id: null,
    ...event,
  });
  const sharedTimestamp = "2026-07-30T20:00:00.000Z";
  for (const event of db.tables.institution_audit_events) event.created_at = sharedTimestamp;
  return { institution, project };
}

test("owner activity readback is typed, paginated, private, and fail closed", async () => {
  const db = new InstitutionSupabase();
  const { institution, project } = seedInstitutionActivity(db);
  setSupabaseAdminForTests(db.client as any);
  const app = createInstitutionApp();
  try {
    assert.equal((await requestJson(app, "GET", "/institutions/station-labs/activity")).status, 401);
    for (const token of ["member-token", "other-token", "admin-token"]) {
      assert.equal((await requestJson(app, "GET", "/institutions/station-labs/activity", { token })).status, 404);
    }
    const first = await requestJson(app, "GET", "/institutions/station-labs/activity?limit=2", { token: "owner-token" });
    assert.equal(first.status, 200);
    assert.equal(first.cacheControl, "private, no-store");
    assert.deepEqual(first.body.summary, { team: 1, projects: 1, publications: 1, spaces: 1, communities: 1, totalEvents: 11, latestEventAt: db.tables.institution_audit_events.at(-1).created_at });
    assert.equal(first.body.timeline.length, 2);
    assert.equal(typeof first.body.nextCursor, "string");
    const pages = [first.body];
    while (pages.at(-1).nextCursor) {
      const previous = pages.at(-1);
      const decoded = JSON.parse(Buffer.from(previous.nextCursor, "base64url").toString("utf8"));
      assert.deepEqual(Object.keys(decoded).sort(), ["at", "ordinal"]);
      assert.equal(decoded.at, "2026-07-30T20:00:00.000Z");
      assert.equal(Number.isInteger(decoded.ordinal) && decoded.ordinal > 0, true);
      const next = await requestJson(app, "GET", `/institutions/station-labs/activity?limit=2&cursor=${encodeURIComponent(previous.nextCursor)}`, { token: "owner-token" });
      assert.equal(next.status, 200);
      pages.push(next.body);
    }
    const timeline = pages.flatMap((page) => page.timeline);
    assert.equal(timeline.length, 11);
    assert.equal(new Set(timeline.map((row: Row) => JSON.stringify(row))).size, 11);
    assert.deepEqual(new Set(timeline.flatMap((row: Row) => [row.actor.relationship, row.subject?.relationship].filter(Boolean))), new Set([
      "Institution owner", "Institution member", "Institution invitee", "Former member", "Past Institution contact", "Station user",
    ]));
    const serialized = JSON.stringify(pages);
    for (const forbidden of [institution.id, project.id, ...db.tables.institution_audit_events.map((row) => row.id), "owner-user", "member-user", "invitee-user", "past-user", "former-user", "station-user", "@example.test", "actor_user_id", "resource_id"]) {
      assert.equal(serialized.includes(forbidden), false, `${forbidden} leaked`);
    }
    for (const cursor of pages.map((page) => page.nextCursor).filter(Boolean)) {
      const decoded = Buffer.from(cursor, "base64url").toString("utf8");
      for (const event of db.tables.institution_audit_events) assert.equal(decoded.includes(event.id), false, "audit id leaked through cursor");
    }
    for (const cursor of [
      Buffer.from(JSON.stringify({ at: "2026-07-30T20:00:00.000Z", id: db.tables.institution_audit_events[0].id })).toString("base64url"),
      Buffer.from(JSON.stringify({ at: "2026-07-30T20:00:00.000Z", ordinal: 0 })).toString("base64url"),
      Buffer.from(JSON.stringify({ at: "2026-07-30T20:00:00.000Z", ordinal: 12 })).toString("base64url"),
      "not-a-cursor",
    ]) {
      assert.equal((await requestJson(app, "GET", `/institutions/station-labs/activity?cursor=${encodeURIComponent(cursor)}`, { token: "owner-token" })).status, 400);
    }

    db.tables.projects = [];
    const unavailable = await requestJson(app, "GET", "/institutions/station-labs/activity?limit=10", { token: "owner-token" });
    assert.equal(unavailable.status, 200);
    assert.equal(unavailable.body.timeline.some((row: Row) => row.resource?.label === "Unavailable resource"), true);

    db.insertRow("institution_audit_events", { institution_id: institution.id, actor_user_id: "owner-user", action: "unknown_action", resource_kind: null, resource_id: null });
    const unknown = await requestJson(app, "GET", "/institutions/station-labs/activity?limit=50", { token: "owner-token" });
    assert.equal(unknown.status, 500);
    assert.equal(JSON.stringify(unknown.body).includes("unknown_action"), false);
    db.tables.institution_audit_events.pop();

    db.failNext("projects");
    const failed = await requestJson(app, "GET", "/institutions/station-labs/activity", { token: "owner-token" });
    assert.equal(failed.status, 500);
    assert.deepEqual(failed.body, { error: "Could not load institutions.", code: "institution_load_failed" });
  } finally { setSupabaseAdminForTests(null); }
});

test("migration 098 atomically audits Institution Projects and preserves the ledger boundary", () => {
  const migration = readFileSync(resolve("infra/supabase/migrations/098_institution_activity_audit_readback.sql"), "utf8");
  assert.match(migration, /station\.pr542\.institution_activity\.098/i);
  assert.match(migration, /project_created[\s\S]*institution_project/i);
  assert.match(migration, /create or replace function public\.create_institution_project_v1[\s\S]*insert into public\.projects[\s\S]*insert into public\.institution_audit_events/i);
  assert.match(migration, /where p\.institution_id is not null[\s\S]*not exists/i);
  assert.match(migration, /institution_audit_project_created_unique_idx/i);
  assert.match(migration, /institution_audit_owner_timeline_idx[\s\S]*created_at desc,id desc/i);
  assert.match(migration, /ambiguous Project principal/i);
  assert.match(migration, /prior audit drift/i);
  assert.match(migration, /has_table_privilege\('anon'[\s\S]*has_table_privilege\('authenticated'/i);
  assert.match(migration, /revoke all on function public\.create_institution_project_v1[\s\S]*from public,anon,authenticated/i);
});

async function provision(app: Express, slug: string) {
  return requestJson(app, "POST", "/institutions/admin", {
    token: "admin-token",
    body: {
      ownerUsername: "Owner_Exact",
      name: slug === "station-labs" ? "Station Labs" : "Second Institution",
      slug,
      summary: "A bounded institution identity.",
    },
  });
}

test("admin-owner-member-public loop keeps authority bounded and serializers exact", async () => {
  const db = new InstitutionSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createInstitutionApp();

  try {
    const anonymousPrivate = await requestJson(app, "GET", "/institutions/station-labs/team");
    assert.equal(anonymousPrivate.status, 401);

    const nonAdmin = await requestJson(app, "POST", "/institutions/admin", {
      token: "owner-token",
      body: { ownerUsername: "Owner_Exact", name: "Station Labs", slug: "station-labs", summary: null },
    });
    assert.equal(nonAdmin.status, 404);
    assert.deepEqual(nonAdmin.body, { error: "Institution not found.", code: "institution_not_found" });
    assert.equal(nonAdmin.cacheControl, "private, no-store");

    const wrongCase = await requestJson(app, "POST", "/institutions/admin", {
      token: "admin-token",
      body: { ownerUsername: "owner_exact", name: "Station Labs", slug: "station-labs", summary: null },
    });
    assert.equal(wrongCase.status, 404);
    assert.equal(JSON.stringify(wrongCase.body).includes("owner_exact"), false);

    const created = await provision(app, "station-labs");
    assert.equal(created.status, 201);
    assert.equal(created.cacheControl, "private, no-store");
    assertKeys(created.body, ["institution"]);
    assertKeys(created.body.institution, [
      "name", "slug", "summary", "verificationStatus", "publicStatus", "publicHref",
      "owner", "verifiedAt", "verificationRevokedAt", "publishedAt", "unpublishedAt",
      "createdAt", "updatedAt",
    ]);
    assertKeys(created.body.institution.owner, ["username", "displayName"]);
    assert.equal(JSON.stringify(created.body).includes("owner-user"), false);
    assert.equal(JSON.stringify(created.body).includes("example.test"), false);

    const privatePublicRead = await requestJson(app, "GET", "/institutions/public/station-labs");
    assert.equal(privatePublicRead.status, 404);
    assert.equal(privatePublicRead.cacheControl, "no-store");

    const verified = await requestJson(app, "POST", "/institutions/admin/station-labs/verification", {
      token: "admin-token",
      body: { verified: true },
    });
    assert.equal(verified.status, 200);
    assert.equal(verified.body.institution.verificationStatus, "verified");

    const memberInviteAttempt = await requestJson(app, "POST", "/institutions/station-labs/invitations", {
      token: "other-token",
      body: { username: "Member_Exact" },
    });
    assert.equal(memberInviteAttempt.status, 404);
    assert.deepEqual(memberInviteAttempt.body, nonAdmin.body);

    const wrongMemberCase = await requestJson(app, "POST", "/institutions/station-labs/invitations", {
      token: "owner-token",
      body: { username: "member_exact" },
    });
    assert.equal(wrongMemberCase.status, 404);
    assert.equal(JSON.stringify(wrongMemberCase.body).includes("member_exact"), false);

    const invited = await requestJson(app, "POST", "/institutions/station-labs/invitations", {
      token: "owner-token",
      body: { username: "Member_Exact" },
    });
    assert.equal(invited.status, 201);
    assertKeys(invited.body.member, ["username", "displayName", "role", "status", "invitedAt", "expiresAt"]);

    const invitedPrivateRead = await requestJson(app, "GET", "/institutions/station-labs/team", {
      token: "member-token",
    });
    assert.equal(invitedPrivateRead.status, 404);
    assert.deepEqual(invitedPrivateRead.body, nonAdmin.body);

    const invitationList = await requestJson(app, "GET", "/institutions/invitations", {
      token: "member-token",
    });
    assert.equal(invitationList.status, 200);
    assert.equal(invitationList.body.invitations.length, 1);
    assertKeys(invitationList.body.invitations[0], [
      "institution", "owner", "role", "status", "invitedAt", "expiresAt",
    ]);

    const accepted = await requestJson(app, "POST", "/institutions/station-labs/invitation/accept", {
      token: "member-token",
      body: {},
    });
    assert.deepEqual(accepted.body, { status: "active" });

    const memberTeam = await requestJson(app, "GET", "/institutions/station-labs/team", {
      token: "member-token",
    });
    assert.equal(memberTeam.status, 200);
    assert.equal(memberTeam.cacheControl, "private, no-store");
    assertKeys(memberTeam.body, ["institution", "owner", "members", "projects"]);
    assertKeys(memberTeam.body.institution, [
      "name", "slug", "summary", "verificationStatus", "publicStatus", "publicHref", "access",
    ]);
    assert.deepEqual(memberTeam.body.institution.access, {
      role: "member",
      readOnly: true,
      canManageTeam: false,
      canManagePublication: false,
    });
    assert.equal(memberTeam.body.members.length, 1);
    assert.equal(memberTeam.body.members[0].status, "active");
    assert.equal("expiresAt" in memberTeam.body.members[0], false);
    assert.equal(JSON.stringify(memberTeam.body).includes("admin-user"), false);

    const memberProjectCreate = await requestJson(app, "POST", "/institutions/station-labs/projects", {
      token: "member-token",
      body: { name: "Denied Project", slug: "denied-project", visibility: "private" },
    });
    assert.equal(memberProjectCreate.status, 404);

    const ownerProjectCreate = await requestJson(app, "POST", "/institutions/station-labs/projects", {
      token: "owner-token",
      body: { name: "Institution Alpha", slug: "institution-alpha", visibility: "public" },
    });
    assert.equal(ownerProjectCreate.status, 201);
    assertKeys(ownerProjectCreate.body.project, [
      "name", "slug", "description", "visibility", "connectionTier", "createdAt", "updatedAt",
      "publicHref", "institution", "access",
    ]);
    assert.deepEqual(ownerProjectCreate.body.project.access, { role: "institution_owner", readOnly: false });
    assert.equal(ownerProjectCreate.body.project.institution.name, "Station Labs");
    assert.equal(JSON.stringify(ownerProjectCreate.body).includes("owner-user"), false);
    assert.equal(db.tables.projects[0].owner_user_id, null);

    const memberProjects = await requestJson(app, "GET", "/institutions/station-labs/team", {
      token: "member-token",
    });
    assert.equal(memberProjects.body.projects.length, 1);
    assert.deepEqual(memberProjects.body.projects[0].access, { role: "institution_member", readOnly: true });

    for (const path of [
      "/institutions/station-labs/invitations",
      "/institutions/station-labs/members/revoke",
      "/institutions/station-labs/publication",
    ]) {
      const denied = await requestJson(app, "POST", path, {
        token: "member-token",
        body: path.endsWith("publication") ? { public: true } : { username: "Other_Exact" },
      });
      assert.equal(denied.status, 404, path);
      assert.deepEqual(denied.body, nonAdmin.body);
    }

    const unrelatedTeam = await requestJson(app, "GET", "/institutions/station-labs/team", {
      token: "other-token",
    });
    assert.equal(unrelatedTeam.status, 404);
    assert.deepEqual(unrelatedTeam.body, nonAdmin.body);

    const published = await requestJson(app, "POST", "/institutions/station-labs/publication", {
      token: "owner-token",
      body: { public: true },
    });
    assert.equal(published.status, 200);
    assert.equal(published.body.institution.publicStatus, "public");

    const publicRead = await requestJson(app, "GET", "/institutions/public/station-labs", {
      token: "other-token",
    });
    assert.equal(publicRead.status, 200);
    assert.equal(publicRead.cacheControl, "no-store");
    assertKeys(publicRead.body, ["institution"]);
    assert.deepEqual(publicRead.body.institution, {
      name: "Station Labs",
      slug: "station-labs",
      summary: "A bounded institution identity.",
      verified: true,
    });

    const institutionRow = db.tables.institutions[0];
    const projectRow = db.tables.projects[0];
    db.tables.institution_spaces.push({ id:"space-id",institution_id:institutionRow.id,creator_user_id:"owner-user",creator_label:"Owner Exact",last_editor_user_id:"owner-user",last_editor_label:"Owner Exact",mark_text:"SL",headline:"Research with a public record.",about:"A bounded authored Institution home.",accent_key:"forest",status:"published",version:3,published_at:db.now(),published_by_user_id:"owner-user",unpublished_at:null,unpublished_by_user_id:null,created_at:db.now(),updated_at:db.now() });
    db.tables.institution_publications.push({ id:"publication-id",institution_id:institutionRow.id,project_id:projectRow.id,creator_user_id:"member-user",creator_label:"Member Exact",last_editor_user_id:"owner-user",last_editor_label:"Owner Exact",slug:"field-note",title:"Institution Field Note",summary:"Published work.",body:"Public body.",document_type:"article",status:"published",version:4,published_at:db.now(),published_by_user_id:"owner-user",retracted_at:null,retracted_by_user_id:null,created_at:db.now(),updated_at:db.now() });
    const aggregate = await requestJson(app,"GET","/institutions/public/station-labs");
    assertKeys(aggregate.body,["institution","projects","publications","space"]);
    assert.deepEqual(aggregate.body.space,{markText:"SL",headline:"Research with a public record.",about:"A bounded authored Institution home.",accentKey:"forest",publishedAt:db.now(),creatorLabel:"Owner Exact",lastEditorLabel:"Owner Exact"});
    assert.equal(aggregate.body.projects.length,1);assert.equal(aggregate.body.publications.length,1);assert.equal(JSON.stringify(aggregate.body).includes("owner-user"),false);
    projectRow.visibility="private";const hiddenAggregate=await requestJson(app,"GET","/institutions/public/station-labs");assert.equal(hiddenAggregate.body.projects.length,0);assert.equal(hiddenAggregate.body.publications.length,0);projectRow.visibility="public";
    db.tables.institution_spaces[0].status="draft";db.tables.institution_spaces[0].published_at=null;const minimalAgain=await requestJson(app,"GET","/institutions/public/station-labs");assertKeys(minimalAgain.body,["institution"]);db.tables.institution_spaces[0].status="published";db.tables.institution_spaces[0].published_at=db.now();

    const revoked = await requestJson(app, "POST", "/institutions/station-labs/members/revoke", {
      token: "owner-token",
      body: { username: "Member_Exact" },
    });
    assert.deepEqual(revoked.body, { status: "removed" });
    const removedRead = await requestJson(app, "GET", "/institutions/station-labs/team", {
      token: "member-token",
    });
    assert.equal(removedRead.status, 404);

    const revokedVerification = await requestJson(
      app,
      "POST",
      "/institutions/admin/station-labs/verification",
      { token: "admin-token", body: { verified: false } }
    );
    assert.equal(revokedVerification.status, 200);
    assert.equal(revokedVerification.body.institution.verificationStatus, "revoked");
    assert.equal(revokedVerification.body.institution.publicStatus, "private");
    assert.equal((await requestJson(app, "GET", "/institutions/public/station-labs")).status, 404);

    assert.deepEqual(
      [...new Set(db.queriedTables)].sort(),
      ["community_subcommunities", "institution_members", "institution_publications", "institution_spaces", "institutions", "profiles", "projects"]
    );
    assert.deepEqual(
      db.tables.institution_audit_events.map((row) => row.action),
      [
        "provisioned",
        "verification_granted",
        "member_invited",
        "invitation_accepted",
        "project_created",
        "published",
        "member_revoked",
        "verification_revoked",
      ]
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("database-clock stale invitation becomes removable and supports a fresh invite", async () => {
  const db = new InstitutionSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createInstitutionApp();

  try {
    assert.equal((await provision(app, "second-institution")).status, 201);
    const invite = await requestJson(app, "POST", "/institutions/second-institution/invitations", {
      token: "owner-token",
      body: { username: "Member_Exact" },
    });
    assert.equal(invite.status, 201);

    db.advanceDays(15);
    const stale = await requestJson(app, "POST", "/institutions/second-institution/invitation/accept", {
      token: "member-token",
      body: {},
    });
    assert.equal(stale.status, 410);
    assert.deepEqual(stale.body, {
      error: "This institution invitation has expired.",
      code: "institution_invitation_stale",
    });
    assert.equal(JSON.stringify(stale.body).includes("Member_Exact"), false);

    const fresh = await requestJson(app, "POST", "/institutions/second-institution/invitations", {
      token: "owner-token",
      body: { username: "Member_Exact" },
    });
    assert.equal(fresh.status, 201);
    const declined = await requestJson(app, "POST", "/institutions/second-institution/invitation/decline", {
      token: "member-token",
      body: {},
    });
    assert.deepEqual(declined.body, { status: "removed" });
    assert.equal((await requestJson(app, "GET", "/institutions/second-institution/team", {
      token: "member-token",
    })).status, 404);

    assert.equal(
      db.tables.institution_members.filter((row) => row.user_id === "member-user").length,
      2
    );
    assert.deepEqual(
      db.tables.institution_members
        .filter((row) => row.user_id === "member-user")
        .map((row) => row.status),
      ["removed", "removed"]
    );
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Institution Salon creation keeps owner, member, hostile, and public readback bounded", async () => {
  const db = new InstitutionSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createInstitutionApp();
  try {
    const institution = db.insertRow("institutions", {
      owner_user_id: "owner-user", name: "Station Labs", slug: "station-labs", summary: "Verified research.",
      verification_status: "verified", public_status: "public", published_at: db.now(),
    });
    db.insertRow("institution_members", {
      institution_id: institution.id, user_id: "member-user", role: "member", status: "active",
      invited_by_user_id: "owner-user", invited_at: db.now(), expires_at: "2027-01-01T00:00:00.000Z",
    });
    db.insertRow("institution_spaces", {
      institution_id: institution.id, mark_text: "SL", headline: "Public research.", about: "Institution home.",
      accent_key: "forest", status: "published", version: 8, creator_label: "Owner Exact",
      last_editor_label: "Owner Exact", published_at: db.now(),
    });

    const hidden = { error: "Institution community not found.", code: "institution_community_not_found" };
    assert.deepEqual((await requestJson(app, "GET", "/institutions/station-labs/community")).body, hidden);
    assert.deepEqual((await requestJson(app, "POST", "/institutions/station-labs/community", { token: "member-token", body: {} })).body, hidden);
    assert.deepEqual((await requestJson(app, "GET", "/institutions/station-labs/community", { token: "other-token" })).body, hidden);

    const created = await requestJson(app, "POST", "/institutions/station-labs/community", {
      token: "owner-token",
      body: { slug: "station-research-salon", title: "Station Research Salon", description: "A useful public discussion." },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.community.access.canModerate, true);
    assert.equal(created.body.community.publicHref, "/forums/station-research-salon");
    assert.equal(db.tables.forum_categories.length, 1);
    assert.equal(db.tables.community_subcommunities[0].owner_user_id, null);
    assert.equal(db.tables.community_subcommunities[0].institution_id, institution.id);
    assert.deepEqual(db.tables.institution_audit_events.map((row) => [row.action, row.resource_kind]), [["community_created", "institution_subcommunity"]]);

    const member = await requestJson(app, "GET", "/institutions/station-labs/community", { token: "member-token" });
    assert.equal(member.body.institution.access.role, "institution_member");
    assert.equal(member.body.community.access.canModerate, false);
    assert.equal(member.body.community.access.canParticipateUnderForumPolicy, true);
    assert.equal(member.body.community.moderationHref, null);

    const aggregate = await requestJson(app, "GET", "/institutions/public/station-labs");
    assert.deepEqual(aggregate.body.community, {
      title: "Station Research Salon", slug: "station-research-salon", description: "A useful public discussion.",
      type: "salon", href: "/forums/station-research-salon",
    });
    db.tables.forum_categories[0].slug = "mismatch";
    assert.equal((await requestJson(app, "GET", "/institutions/public/station-labs")).body.community, undefined);
    db.tables.forum_categories[0].slug = "station-research-salon";
    db.tables.institution_spaces[0].status = "draft";
    assert.equal((await requestJson(app, "GET", "/institutions/public/station-labs")).body.community, undefined);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("migration 097 freezes Institution Salon principal, atomic creation, ACL, and audit shape", () => {
  const migration = readFileSync(resolve("infra/supabase/migrations/097_institution_community_presence.sql"), "utf8");
  assert.match(migration, /community_subcommunities_exact_principal_check[\s\S]*=1/i);
  assert.match(migration, /community_subcommunities_institution_salon_check[\s\S]*subcommunity_type='salon'[\s\S]*linked_space_id is null[\s\S]*linked_developer_space_id is null/i);
  assert.match(migration, /create unique index community_subcommunities_one_institution/i);
  assert.match(migration, /new\.owner_user_id is distinct from old\.owner_user_id[\s\S]*new\.institution_id is distinct from old\.institution_id/i);
  assert.match(migration, /create or replace function public\.create_institution_subcommunity_v1[\s\S]*security definer/i);
  assert.match(migration, /select \* into institution_row[\s\S]*for update/i);
  assert.match(migration, /insert into public\.forum_categories[\s\S]*insert into public\.community_subcommunities[\s\S]*insert into public\.institution_audit_events/i);
  assert.match(migration, /'community_created','institution_subcommunity'/i);
  assert.match(migration, /revoke all on function public\.create_institution_subcommunity_v1[\s\S]*from public,anon,authenticated/i);
  assert.match(migration, /grant execute on function public\.create_institution_subcommunity_v1[\s\S]*to service_role/i);
  assert.doesNotMatch(migration, /grant (insert|update|delete).*to (anon|authenticated)/i);
});

test("migration 092 freezes raw access, authority, lifecycle, audit, and zero inheritance", () => {
  const migration = readFileSync(
    resolve("infra/supabase/migrations/092_institution_principal_team_public_identity.sql"),
    "utf8"
  );
  const route = readFileSync(resolve("apps/api/src/routes/institutions.ts"), "utf8");
  const auditTable = migration.match(
    /create table public\.institution_audit_events \([\s\S]*?\n\);/i
  )?.[0] ?? "";

  assert.match(migration, /begin;[\s\S]*pg_advisory_xact_lock[\s\S]*station\.pr535b\.institution_principal_team_public_identity\.092/i);
  assert.equal((migration.match(/create table public\./gi) ?? []).length, 3);
  assert.match(migration, /owner_user_id uuid not null references public\.profiles \(id\) on delete restrict/i);
  assert.match(migration, /check \(role = 'member'\)/i);
  assert.match(migration, /status text not null default 'invited' check \(status in \('invited', 'active', 'removed'\)\)/i);
  assert.match(migration, /clock_time \+ interval '14 days'/i);
  assert.doesNotMatch(auditTable, /jsonb|payload|metadata/i);
  assert.match(migration, /institution audit events are append-only/i);
  assert.match(migration, /not exists \([\s\S]*from public\.institutions institution[\s\S]*institution\.id = old\.institution_id/i);
  assert.match(migration, /verification_status = 'revoked'[\s\S]*public_status = 'private'/i);
  assert.match(migration, /public_status = 'public'[\s\S]*verification_status = 'verified'/i);
  assert.match(migration, /revoke all on table public\.institutions from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.institution_members from public, anon, authenticated/i);
  assert.match(migration, /revoke all on table public\.institution_audit_events from public, anon, authenticated/i);
  assert.match(migration, /left an effective browser institution table privilege/i);
  assert.match(migration, /service institution table privileges are incomplete/i);
  assert.match(migration, /expected six fixed-search-path SECURITY DEFINER transitions/i);
  assert.match(migration, /has_function_privilege\('anon'[\s\S]*has_function_privilege\('authenticated'[\s\S]*has_function_privilege\('service_role'/i);
  assert.match(migration, /column_row\.column_name = 'institution_id'[\s\S]*table_name not in \('institution_members', 'institution_audit_events'\)/i);
  assert.match(migration, /changed an existing relation, policy, or table grant/i);
  assert.match(migration, /notify pgrst, 'reload schema';[\s\S]*commit;/i);

  const transitionNames = [
    "provision_institution_v1",
    "transition_institution_verification_v1",
    "transition_institution_publication_v1",
    "invite_institution_member_v1",
    "respond_institution_invitation_v1",
    "revoke_institution_member_v1",
  ];
  for (const name of transitionNames) {
    const block = migration.match(new RegExp(
      `create or replace function public\\.${name}\\([\\s\\S]*?\\$[a-z_]+\\$;`,
      "i"
    ))?.[0] ?? "";
    assert.match(block, /security definer/i, `${name} must be a definer transition`);
    assert.match(block, /set search_path = pg_catalog, public/i, `${name} must fix search_path`);
    assert.match(migration, new RegExp(`grant execute on function public\\.${name}\\([\\s\\S]*?to service_role`, "i"));
  }

  const queriedTables = [...route.matchAll(/\.from\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.deepEqual(
    [...new Set(queriedTables)].sort(),
    ["community_subcommunities", "institution_audit_events", "institution_members", "institution_publications", "institution_spaces", "institutions", "profiles", "projects"]
  );
  for (const forbidden of [
    "project_members",
    "spaces",
    "developer_spaces",
    "documents",
    "exports",
    "billing",
  ]) {
    assert.equal(queriedTables.includes(forbidden), false);
  }

  for (const tag of [...new Set(migration.match(/\$[a-z0-9_]+\$/gi) ?? [])]) {
    assert.equal((migration.split(tag).length - 1) % 2, 0, `${tag} must be balanced`);
  }
});

test("migration 092 places inherited profile-grant refusal before institution creation", () => {
  const migration = readFileSync(
    resolve("infra/supabase/migrations/092_institution_principal_team_public_identity.sql"),
    "utf8"
  );
  const firstInstitutionObject = migration.indexOf("create table public.institutions");
  const postassertStart = migration.indexOf("do $pr535b_postassert$");
  assert.ok(firstInstitutionObject > 0);
  assert.ok(postassertStart > firstInstitutionObject);

  const preflight = migration.slice(0, firstInstitutionObject);
  const postassert = migration.slice(postassertStart);
  assert.match(preflight, /requires the exact direct migration 091 profile ACL/i);
  assert.match(preflight, /pg_catalog\.has_table_privilege\([\s\S]*?'public\.profiles'/i);
  assert.match(preflight, /pg_catalog\.has_column_privilege\([\s\S]*?'public\.profiles'/i);
  assert.match(preflight, /byok_openai_key[\s\S]*byok_anthropic_key[\s\S]*byok_deepseek_key/i);
  assert.match(preflight, /effective browser profile ACL differs from migration 091/i);
  assert.match(preflight, /effective trusted service profile ACL differs from migration 091/i);

  assert.match(postassert, /postassert direct profile ACL differs from migration 091/i);
  assert.match(postassert, /postassert effective browser profile ACL differs from migration 091/i);
  assert.match(postassert, /postassert trusted service profile ACL differs from migration 091/i);
});

test("migration 093 enforces exact-one Project principal and split owner invariant", () => {
  const migration = readFileSync(
    resolve("infra/supabase/migrations/093_institution_owned_projects.sql"),
    "utf8"
  );

  assert.match(migration, /pg_advisory_xact_lock[\s\S]*station\.pr538\.institution_owned_projects\.093/i);
  assert.match(migration, /alter table public\.projects alter column owner_user_id drop not null/i);
  assert.match(migration, /add column institution_id uuid references public\.institutions\(id\) on delete restrict/i);
  assert.match(migration, /projects_exactly_one_principal_check[\s\S]*owner_user_id is not null[\s\S]*institution_id is not null[\s\S]*= 1/i);
  assert.match(migration, /personal Project must have one matching active owner membership/i);
  assert.match(migration, /Institution Project cannot have a Project owner membership/i);
  assert.match(migration, /new\.owner_user_id is distinct from old\.owner_user_id[\s\S]*new\.institution_id is distinct from old\.institution_id/i);
  assert.match(migration, /create or replace function public\.create_institution_project_v1[\s\S]*security definer[\s\S]*institution_row\.owner_user_id<>p_actor_user_id/i);
  assert.match(migration, /revoke all on function public\.create_institution_project_v1[\s\S]*from public,anon,authenticated/i);
  assert.match(migration, /grant execute on function public\.create_institution_project_v1[\s\S]*to service_role/i);
});
