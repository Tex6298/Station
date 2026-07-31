import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { developerSpacesRouter } from "./developer-spaces";
import { exportsRouter } from "./exports";
import {
  PROJECT_EVIDENCE_LIMIT,
  PUBLIC_PROJECT_DEVELOPER_SPACE_LIMIT,
  PUBLIC_PROJECT_EVIDENCE_LIMIT,
  projectsRouter,
} from "./projects";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "owner-user", username: "Owner_One", display_name: "Owner One", tier: "canon", is_admin: false },
      { id: "other-user", username: "Other_One", display_name: "Other One", tier: "canon", is_admin: false },
      { id: "viewer-user", username: "Exact_Viewer", display_name: "Exact Viewer", tier: "private", is_admin: false },
    ],
    projects: [],
    project_members: [],
    developer_spaces: [],
    developer_space_usage: [],
    developer_space_documents: [],
    documents: [],
    institutions: [],
    institution_members: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-07-30T09:00:00.000Z");
  insertErrors = new Map<string, { code?: string; message: string; details?: string }>();
  operationErrors = new Map<string, { code?: string; message: string; details?: string }>();
  rpcErrors = new Map<string, { code?: string; message: string; details?: string }>();
  rpcCalls: Array<{ name: string; args: Row }> = [];
  failAtomicOwnerMembership = false;
  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
    ["other-token", { id: "other-user", email: "other@example.test" }],
    ["viewer-token", { id: "viewer-user", email: "viewer@example.test" }],
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
    rpc: (name: string, args: Row) => this.rpc(name, args),
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

  currentTimeMs() {
    return this.clock;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `00000000-0000-4000-8000-${String(this.idCounters[table]).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "projects") {
      row.institution_id ??= null;
      row.description ??= null;
      row.visibility ??= "private";
      row.connection_tier ??= "tier_1_showcase";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "institutions") {
      row.summary ??= null;
      row.verification_status ??= "unverified";
      row.public_status ??= "private";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "institution_members") {
      row.role ??= "member";
      row.status ??= "active";
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "project_members") {
      row.role ??= "owner";
      row.status ??= "active";
      row.invite_expires_at ??= null;
      row.responded_at ??= null;
      row.removed_at ??= null;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "developer_spaces") {
      row.project_id ??= null;
      row.description ??= null;
      row.visibility ??= "private";
      row.provider_policy ??= "public_synthetic_only";
      row.visualisation_type ??= "node_field";
      row.visualisation_config ??= {};
      row.api_key_hash ??= null;
      row.api_key_last_four ??= null;
      row.api_key_created_at ??= null;
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
      row.body ??= null;
      row.document_type ??= "research";
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
      row.version ??= 1;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    return row;
  }

  private async rpc(name: string, args: Row) {
    this.rpcCalls.push({ name, args: clone(args) });
    const forcedError = this.rpcErrors.get(name);
    if (forcedError) {
      this.rpcErrors.delete(name);
      return { data: null, error: forcedError };
    }

    if (name === "create_project_with_owner_v1") {
      if (this.rows("projects").some((project) => project.slug === args.p_slug)) {
        return { data: null, error: { code: "23505", message: "duplicate project slug" } };
      }
      if (this.failAtomicOwnerMembership) {
        this.failAtomicOwnerMembership = false;
        return { data: null, error: { message: "atomic owner membership failed" } };
      }

      const project = this.prepareRow("projects", {
        owner_user_id: args.p_actor_user_id,
        name: args.p_name,
        slug: args.p_slug,
        description: args.p_description,
        visibility: args.p_visibility,
        connection_tier: args.p_connection_tier,
      });
      const membership = this.prepareRow("project_members", {
        project_id: project.id,
        user_id: args.p_actor_user_id,
        role: "owner",
        status: "active",
      });
      this.rows("projects").push(project);
      this.rows("project_members").push(membership);
      return { data: clone(project), error: null };
    }

    if (name === "invite_project_viewer_v1") {
      const project = this.rows("projects").find((row) => row.id === args.p_project_id);
      const ownerMembership = this.rows("project_members").find((row) => (
        row.project_id === args.p_project_id
        && row.user_id === args.p_actor_user_id
        && row.role === "owner"
        && row.status === "active"
      ));
      const target = this.rows("profiles").find((row) => row.id === args.p_target_user_id);
      if (!project || project.owner_user_id !== args.p_actor_user_id || !ownerMembership || !target
        || args.p_target_user_id === args.p_actor_user_id) {
        return { data: [{ outcome: "unavailable", invited_at: null, expires_at: null }], error: null };
      }

      const now = this.timestamp();
      const current = this.rows("project_members").find((row) => (
        row.project_id === project.id && row.user_id === target.id && row.status !== "removed"
      ));
      if (current?.role === "viewer" && current.status === "invited") {
        if (Date.parse(current.invite_expires_at) > Date.parse(now)) {
          return { data: [{ outcome: "already_invited", invited_at: null, expires_at: null }], error: null };
        }
        current.status = "removed";
        current.removed_at = now;
        current.updated_at = now;
      } else if (current?.role === "viewer" && current.status === "active") {
        return { data: [{ outcome: "already_active", invited_at: null, expires_at: null }], error: null };
      } else if (current) {
        return { data: [{ outcome: "unavailable", invited_at: null, expires_at: null }], error: null };
      }

      const expiresAt = new Date(Date.parse(now) + 14 * 24 * 60 * 60 * 1000).toISOString();
      const membership = this.prepareRow("project_members", {
        project_id: project.id,
        user_id: target.id,
        role: "viewer",
        status: "invited",
        invite_expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      });
      this.rows("project_members").push(membership);
      return { data: [{ outcome: "invited", invited_at: now, expires_at: expiresAt }], error: null };
    }

    if (name === "respond_project_viewer_invitation_v1") {
      const membership = this.rows("project_members").find((row) => (
        row.project_id === args.p_project_id
        && row.user_id === args.p_actor_user_id
        && row.role === "viewer"
        && row.status === "invited"
      ));
      if (!membership) {
        return { data: [{ outcome: "unavailable", responded_at: null }], error: null };
      }

      const now = this.timestamp();
      if (Date.parse(membership.invite_expires_at) <= Date.parse(now)) {
        membership.status = "removed";
        membership.removed_at = now;
        membership.updated_at = now;
        return { data: [{ outcome: "stale", responded_at: null }], error: null };
      }
      if (args.p_action === "accept") {
        membership.status = "active";
        membership.responded_at = now;
        membership.updated_at = now;
        return { data: [{ outcome: "accepted", responded_at: now }], error: null };
      }

      membership.status = "removed";
      membership.removed_at = now;
      membership.updated_at = now;
      return { data: [{ outcome: "declined", responded_at: now }], error: null };
    }

    if (name === "revoke_project_viewer_v1") {
      const project = this.rows("projects").find((row) => row.id === args.p_project_id);
      const ownerMembership = this.rows("project_members").find((row) => (
        row.project_id === args.p_project_id
        && row.user_id === args.p_actor_user_id
        && row.role === "owner"
        && row.status === "active"
      ));
      const membership = this.rows("project_members").find((row) => (
        row.project_id === args.p_project_id
        && row.user_id === args.p_target_user_id
        && row.role === "viewer"
        && ["invited", "active"].includes(row.status)
      ));
      if (!project || project.owner_user_id !== args.p_actor_user_id || !ownerMembership || !membership) {
        return { data: [{ outcome: "unavailable", removed_at: null }], error: null };
      }

      const now = this.timestamp();
      membership.status = "removed";
      membership.removed_at = now;
      membership.updated_at = now;
      return { data: [{ outcome: "revoked", removed_at: now }], error: null };
    }

    return { data: null, error: { message: `Unexpected RPC: ${name}` } };
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, Set<unknown>]> = [];
  private greaterThanFilters: Array<[string, unknown]> = [];
  private orFilters: Array<Array<[string, "eq" | "gt", string]>> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | Row[] | null = null;

  constructor(private db: InMemorySupabase, private table: string) {}

  select(_columns = "*") {
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

  or(expression: string) {
    const clauses = expression.split(",").map((clause): [string, "eq" | "gt", string] => {
      const [field, operator, ...valueParts] = clause.split(".");
      if (!field || (operator !== "eq" && operator !== "gt") || valueParts.length === 0) {
        throw new Error(`Unsupported test OR filter: ${expression}`);
      }
      return [field, operator, valueParts.join(".")];
    });
    this.orFilters.push(clauses);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
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
      rows = rows.filter((row) => values.has(row[field]));
    }
    for (const [field, value] of this.greaterThanFilters) {
      rows = rows.filter((row) => this.isGreaterThan(row[field], value));
    }
    for (const clauses of this.orFilters) {
      rows = rows.filter((row) => clauses.some(([field, operator, value]) => (
        operator === "eq" ? row[field] === value : this.isGreaterThan(row[field], value)
      )));
    }
    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    return rows;
  }

  private isGreaterThan(rowValue: unknown, filterValue: unknown) {
    const rowTimestamp = Date.parse(String(rowValue ?? ""));
    const filterTimestamp = filterValue === "now"
      ? this.db.currentTimeMs()
      : Date.parse(String(filterValue ?? ""));
    return Number.isFinite(rowTimestamp) && Number.isFinite(filterTimestamp) && rowTimestamp > filterTimestamp;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    const operationErrorKey = `${this.operation}:${this.table}`;
    const operationError = this.db.operationErrors.get(operationErrorKey);
    if (operationError) {
      this.db.operationErrors.delete(operationErrorKey);
      return { data: null, error: operationError };
    }

    if (this.operation === "insert") {
      const insertError = this.db.insertErrors.get(this.table);
      if (insertError) {
        this.db.insertErrors.delete(this.table);
        return { data: null, error: insertError };
      }
    }

    let rows: Row[];
    if (this.operation === "insert") {
      rows = (Array.isArray(this.payload) ? this.payload : [this.payload as Row])
        .map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) Object.assign(row, this.payload, { updated_at: this.db.timestamp() });
    } else {
      rows = this.matchingRows();
    }

    const data = clone(rows);
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }
    if (mode === "maybeSingle") return { data: data[0] ?? null, error: null };
    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createProjectsApp() {
  const app = express();
  app.use(express.json());
  app.use("/projects", projectsRouter);
  return app;
}

function createProjectBoundaryApp() {
  const app = createProjectsApp();
  app.use("/developer-spaces", developerSpacesRouter);
  app.use("/exports", exportsRouter);
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
      cacheControl: response.headers.get("cache-control"),
    };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function listen(app: Express) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function assertNoProjectOwnerIds(value: unknown) {
  const json = JSON.stringify(value);
  assert.doesNotMatch(json, /"ownerUserId"|"owner_user_id"|"authorUserId"|"author_user_id"/);
  assert.doesNotMatch(json, /owner-user|other-user|viewer-user/);
}

function assertNoSharedProjectInternals(value: unknown) {
  const json = JSON.stringify(value);
  assertNoProjectOwnerIds(value);
  assert.doesNotMatch(json, /"id"|"projectId"|"project_id"|"userId"|"user_id"|"memberId"|"member_id"/);
  assert.doesNotMatch(json, /connectionTier|connection_tier|activity|storageBytes|publicReads|exports|billing/i);
  assert.doesNotMatch(json, /apiKey|api_key|secret|provider|runtime|visualisationConfig|visualisation_config/i);
  assert.doesNotMatch(json, /documentId|document_id|sourceLabel|source_label|sourceType|source_type|provenance|"body"/i);
  assert.doesNotMatch(json, /email|isAdmin|is_admin|"tier"|auth_metadata|avatar/i);
}

function assertNoPublicProjectInternals(value: unknown) {
  const json = JSON.stringify(value);
  assertNoProjectOwnerIds(value);
  assert.doesNotMatch(json, /"id"|"projectId"|"project_id"|"connectionTier"|"connection_tier"/);
  assert.doesNotMatch(json, /"activity"|"evidence"|"documents"|"documentCount"|"members"|"memberCount"/);
  assert.doesNotMatch(json, /nodes|events|snapshots|storageBytes|publicReads|exports/);
  assert.doesNotMatch(json, /provider|apiKey|api_key|visualisationConfig|visualisation_config/);
  assert.doesNotMatch(json, /raw_event|runtime|ingestion|secret|report|source_id|body|SQL|stack/i);
}

function assertNoPublicEvidenceInternals(value: unknown) {
  const json = JSON.stringify(value);
  assertNoProjectOwnerIds(value);
  assert.doesNotMatch(json, /"id"|"projectId"|"project_id"|"developerSpaceId"|"developer_space_id"|"documentId"|"document_id"/);
  assert.doesNotMatch(json, /"author_user_id"|"authorUserId"|"link_visibility"|"linkVisibility"|"sort_order"|"sortOrder"/);
  assert.doesNotMatch(json, /body|excerpt|summary|source_id|source_type|source_label|raw|SQL|stack/i);
  assert.doesNotMatch(json, /activity|member|role|invite|report|export|billing|runtime|provider|Redis|Cloudflare|queue|worker|secret/i);
}

const projectHiddenMarker = "private-" + "project-route-marker";
const projectDatabaseScheme = "postgres" + "ql://";
const projectBearerLabel = "Bear" + "er";

function hostileProjectError(operation: string) {
  return {
    code: "XX999",
    message: [
      `${operation} failed at public.projects`,
      "public.project_members",
      "public.developer_spaces",
      "public.developer_space_usage",
      "public.developer_space_documents",
      "public.documents",
      "owner_user_id=owner-user project_id=10000000-0000-4000-8000-000000000001",
      `${projectBearerLabel} abc.${projectHiddenMarker}.token`,
      `database url: ${projectDatabaseScheme}station:${projectHiddenMarker}@db.example.test/station`,
      `raw project payload: private snippet ${projectHiddenMarker}`,
      "at projectRoute (/station/private/projects.ts:1:2)",
    ].join("; "),
    details: `private project detail ${projectHiddenMarker}`,
  };
}

function assertSafeProjectError(body: unknown) {
  const text = JSON.stringify(body);
  assert.equal(text.includes(projectHiddenMarker), false);
  assert.equal(text.includes(projectBearerLabel), false);
  assert.equal(text.includes(projectDatabaseScheme), false);
  assert.equal(text.includes("db.example.test"), false);
  assert.equal(text.includes("public.projects"), false);
  assert.equal(text.includes("public.project_members"), false);
  assert.equal(text.includes("public.developer_spaces"), false);
  assert.equal(text.includes("public.developer_space_usage"), false);
  assert.equal(text.includes("public.developer_space_documents"), false);
  assert.equal(text.includes("public.documents"), false);
  assert.equal(text.includes("owner_user_id"), false);
  assert.equal(text.includes("project_id"), false);
  assert.equal(text.includes("raw project payload"), false);
  assert.equal(text.includes("private snippet"), false);
  assert.equal(text.includes("projectRoute"), false);
}

function assertStableProjectError(
  body: unknown,
  expected: { error: string; code: string }
) {
  assert.deepEqual(body, expected);
  assertSafeProjectError(body);
}

test("anonymous public Project profile returns only safe public metadata and same-owner public Developer Spaces", async () => {
  const db = new InMemorySupabase();
  const publicProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000100",
    owner_user_id: "owner-user",
    name: "Public Research Project",
    slug: "public-research-project",
    description: "Public project metadata only.",
    visibility: "public",
    connection_tier: "tier_3_lab",
    created_at: "2026-06-20T09:00:00.000Z",
    updated_at: "2026-06-20T10:00:00.000Z",
  });
  for (const visibility of ["private", "unlisted", "community"] as const) {
    db.insertRow("projects", {
      owner_user_id: "owner-user",
      name: `${visibility} Project`,
      slug: `${visibility}-project`,
      visibility,
    });
  }

  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Latest Public Space",
    slug: "latest-public-space",
    description: "Public observatory.",
    visibility: "public",
    visualisation_type: "timeline",
    updated_at: "2026-06-20T12:00:00.000Z",
    provider_policy: "private_archive_allowed",
    api_key_last_four: "1234",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Alpha Public Space",
    slug: "alpha-public-space",
    visibility: "public",
    visualisation_type: "node_field",
    updated_at: "2026-06-20T11:00:00.000Z",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Beta Public Space",
    slug: "beta-public-space",
    visibility: "public",
    visualisation_type: "world_map",
    updated_at: "2026-06-20T11:00:00.000Z",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Private Attached Space",
    slug: "private-attached-space",
    visibility: "private",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Unlisted Attached Space",
    slug: "unlisted-attached-space",
    visibility: "unlisted",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Community Attached Space",
    slug: "community-attached-space",
    visibility: "community",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: null,
    project_name: "Loose Public Space",
    slug: "loose-public-space",
    visibility: "public",
  });
  db.insertRow("developer_spaces", {
    owner_user_id: "other-user",
    project_id: publicProject.id,
    project_name: "Foreign Public Space",
    slug: "foreign-public-space",
    visibility: "public",
  });

  for (let index = 0; index < PUBLIC_PROJECT_DEVELOPER_SPACE_LIMIT + 2; index += 1) {
    db.insertRow("developer_spaces", {
      owner_user_id: "owner-user",
      project_id: publicProject.id,
      project_name: `Older Public Space ${index}`,
      slug: `older-public-space-${index}`,
      visibility: "public",
      visualisation_type: "constellation",
      updated_at: `2026-06-19T${String(index % 10).padStart(2, "0")}:00:00.000Z`,
    });
  }

  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const response = await requestJson<{ project: Row; developerSpaces: Row[]; publicEvidence: Row[] }>(
      app,
      "GET",
      "/projects/public/public-research-project"
    );
    assert.equal(response.status, 200);
    assertNoPublicProjectInternals(response.body);
    assert.deepEqual(Object.keys(response.body).sort(), ["developerSpaces", "project", "publicEvidence"]);
    assert.deepEqual(response.body.publicEvidence, []);
    assert.deepEqual(Object.keys(response.body.project).sort(), [
      "createdAt",
      "description",
      "name",
      "publicDeveloperSpaceCount",
      "slug",
      "updatedAt",
      "visibility",
    ]);
    assert.equal(response.body.project.name, "Public Research Project");
    assert.equal(response.body.project.slug, "public-research-project");
    assert.equal(response.body.project.visibility, "public");
    assert.equal(response.body.project.publicDeveloperSpaceCount, PUBLIC_PROJECT_DEVELOPER_SPACE_LIMIT + 5);
    assert.equal(response.body.developerSpaces.length, PUBLIC_PROJECT_DEVELOPER_SPACE_LIMIT);
    assert.deepEqual(response.body.developerSpaces.slice(0, 3).map((space) => space.slug), [
      "latest-public-space",
      "alpha-public-space",
      "beta-public-space",
    ]);
    assert.deepEqual(Object.keys(response.body.developerSpaces[0]).sort(), [
      "description",
      "href",
      "projectName",
      "slug",
      "updatedAt",
      "visibility",
      "visualisationType",
    ]);
    assert.equal(response.body.developerSpaces[0].href, "/developer-spaces/latest-public-space");
    assert.equal(response.body.developerSpaces[0].visibility, "public");
    assert.equal(response.body.developerSpaces.some((space) => space.slug === "private-attached-space"), false);
    assert.equal(response.body.developerSpaces.some((space) => space.slug === "unlisted-attached-space"), false);
    assert.equal(response.body.developerSpaces.some((space) => space.slug === "community-attached-space"), false);
    assert.equal(response.body.developerSpaces.some((space) => space.slug === "loose-public-space"), false);
    assert.equal(response.body.developerSpaces.some((space) => space.slug === "foreign-public-space"), false);

    for (const slug of ["private-project", "unlisted-project", "community-project"]) {
      const hidden = await requestJson(app, "GET", `/projects/public/${slug}`);
      assert.equal(hidden.status, 404);
    }

    const invalid = await requestJson(app, "GET", "/projects/public/Bad Slug");
    assert.equal(invalid.status, 404);

    const uuidShaped = await requestJson(app, "GET", "/projects/public/10000000-0000-4000-8000-000000000100");
    assert.equal(uuidShaped.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("anonymous public Project profile returns minimal publicEvidence from public same-owner attachments only", async () => {
  const db = new InMemorySupabase();
  const publicProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000120",
    owner_user_id: "owner-user",
    name: "Public Evidence Project",
    slug: "public-evidence-project",
    description: "Public project metadata.",
    visibility: "public",
  });
  const otherProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000121",
    owner_user_id: "owner-user",
    name: "Other Project",
    slug: "other-project",
    visibility: "public",
  });
  const publicSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000120",
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Public Observatory",
    slug: "public-observatory",
    visibility: "public",
  });
  const privateSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000121",
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Private Observatory",
    slug: "private-observatory",
    visibility: "private",
  });
  const unlistedSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000122",
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Unlisted Observatory",
    slug: "unlisted-observatory",
    visibility: "unlisted",
  });
  const communitySpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000123",
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Community Observatory",
    slug: "community-observatory",
    visibility: "community",
  });
  const foreignSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000124",
    owner_user_id: "other-user",
    project_id: publicProject.id,
    project_name: "Foreign Observatory",
    slug: "foreign-observatory",
    visibility: "public",
  });
  const unattachedSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000125",
    owner_user_id: "owner-user",
    project_id: null,
    project_name: "Unattached Observatory",
    slug: "unattached-observatory",
    visibility: "public",
  });
  const otherProjectSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000126",
    owner_user_id: "owner-user",
    project_id: otherProject.id,
    project_name: "Other Project Observatory",
    slug: "other-project-observatory",
    visibility: "public",
  });

  const primaryDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000120",
    author_user_id: "owner-user",
    title: "Public Method Note",
    slug: "public-method-note",
    body: "Sensitive public body should never appear in public evidence.",
    document_type: "research",
    status: "published",
    visibility: "public",
    published_at: "2026-06-20T12:00:00.000Z",
    updated_at: "2026-06-20T12:05:00.000Z",
    source_id: "private-source-id",
    source_type: "archive_file",
    source_label: "Raw private source label",
  });
  db.insertRow("developer_space_documents", {
    id: "40000000-0000-4000-8000-000000000120",
    developer_space_id: publicSpace.id,
    document_id: primaryDocument.id,
    owner_user_id: "owner-user",
    document_role: "methodology",
    link_visibility: "public",
    sort_order: 1,
    updated_at: "2026-06-20T12:10:00.000Z",
  });

  for (let index = 0; index < PUBLIC_PROJECT_EVIDENCE_LIMIT + 2; index += 1) {
    const document = db.insertRow("documents", {
      id: `30000000-0000-4000-8000-${String(220 + index).padStart(12, "0")}`,
      author_user_id: "owner-user",
      title: `Older public reference ${index}`,
      slug: `older-public-reference-${index}`,
      document_type: index % 2 === 0 ? "field_log" : "research",
      status: "published",
      visibility: "public",
      published_at: `2026-06-19T${String(index % 10).padStart(2, "0")}:00:00.000Z`,
      updated_at: `2026-06-19T${String(index % 10).padStart(2, "0")}:05:00.000Z`,
    });
    db.insertRow("developer_space_documents", {
      developer_space_id: publicSpace.id,
      document_id: document.id,
      owner_user_id: "owner-user",
      document_role: "finding",
      link_visibility: "public",
    });
  }

  for (const row of [
    {
      title: "Private Document Evidence",
      status: "published",
      visibility: "private",
      space: publicSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Unlisted Document Evidence",
      status: "published",
      visibility: "unlisted",
      space: publicSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Community Document Evidence",
      status: "published",
      visibility: "community",
      space: publicSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Draft Document Evidence",
      status: "draft",
      visibility: "public",
      space: publicSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Removed Document Evidence",
      status: "removed",
      visibility: "public",
      space: publicSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Private Link Evidence",
      status: "published",
      visibility: "public",
      space: publicSpace,
      owner: "owner-user",
      linkVisibility: "owner",
    },
    {
      title: "Wrong Link Owner Evidence",
      status: "published",
      visibility: "public",
      space: publicSpace,
      owner: "other-user",
      linkVisibility: "public",
    },
    {
      title: "Wrong Document Owner Evidence",
      status: "published",
      visibility: "public",
      space: publicSpace,
      owner: "owner-user",
      documentOwner: "other-user",
      linkVisibility: "public",
    },
    {
      title: "Private Space Evidence",
      status: "published",
      visibility: "public",
      space: privateSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Unlisted Space Evidence",
      status: "published",
      visibility: "public",
      space: unlistedSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Community Space Evidence",
      status: "published",
      visibility: "public",
      space: communitySpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Foreign Space Evidence",
      status: "published",
      visibility: "public",
      space: foreignSpace,
      owner: "other-user",
      linkVisibility: "public",
    },
    {
      title: "Unattached Space Evidence",
      status: "published",
      visibility: "public",
      space: unattachedSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
    {
      title: "Other Project Space Evidence",
      status: "published",
      visibility: "public",
      space: otherProjectSpace,
      owner: "owner-user",
      linkVisibility: "public",
    },
  ]) {
    const document = db.insertRow("documents", {
      author_user_id: row.documentOwner ?? (row.title === "Foreign Space Evidence" || row.owner === "other-user" ? "other-user" : "owner-user"),
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      body: `${row.title} private body.`,
      status: row.status,
      visibility: row.visibility,
      published_at: row.status === "published" ? "2026-06-20T10:00:00.000Z" : null,
      source_id: `${row.title}-source-id`,
      source_label: `${row.title} raw source label`,
    });
    db.insertRow("developer_space_documents", {
      developer_space_id: row.space.id,
      document_id: document.id,
      owner_user_id: row.owner,
      document_role: "note",
      link_visibility: row.linkVisibility,
    });
  }

  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const response = await requestJson<{ publicEvidence: Row[] }>(
      app,
      "GET",
      "/projects/public/public-evidence-project"
    );
    assert.equal(response.status, 200);
    assertNoPublicProjectInternals(response.body);
    assertNoPublicEvidenceInternals(response.body.publicEvidence);
    assert.equal(response.body.publicEvidence.length, PUBLIC_PROJECT_EVIDENCE_LIMIT);
    assert.deepEqual(Object.keys(response.body.publicEvidence[0]).sort(), [
      "href",
      "kind",
      "publishedAt",
      "sourceLabel",
      "title",
      "updatedAt",
    ]);
    assert.deepEqual(response.body.publicEvidence[0], {
      title: "Public Method Note",
      kind: "methodology",
      href: "/developer-spaces/public-observatory",
      sourceLabel: "Public Developer Space",
      publishedAt: "2026-06-20T12:00:00.000Z",
      updatedAt: "2026-06-20T12:05:00.000Z",
    });
    assert.equal(
      response.body.publicEvidence.every((item) => item.href === "/developer-spaces/public-observatory"),
      true
    );

    const evidenceText = JSON.stringify(response.body.publicEvidence);
    for (const forbidden of [
      publicProject.id,
      publicSpace.id,
      primaryDocument.id,
      "40000000-0000-4000-8000-000000000120",
      "Sensitive public body",
      "private-source-id",
      "Raw private source label",
      "Private Document Evidence",
      "Unlisted Document Evidence",
      "Community Document Evidence",
      "Draft Document Evidence",
      "Removed Document Evidence",
      "Private Link Evidence",
      "Wrong Link Owner Evidence",
      "Wrong Document Owner Evidence",
      "Private Space Evidence",
      "Unlisted Space Evidence",
      "Community Space Evidence",
      "Foreign Space Evidence",
      "Unattached Space Evidence",
      "Other Project Space Evidence",
    ]) {
      assert.equal(evidenceText.includes(forbidden), false, `${forbidden} leaked into public evidence`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public Project private-only evidence and no-evidence states remain neutral", async () => {
  const db = new InMemorySupabase();
  const privateOnlyProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000130",
    owner_user_id: "owner-user",
    name: "Private Only Evidence Project",
    slug: "private-only-evidence-project",
    visibility: "public",
  });
  db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000131",
    owner_user_id: "owner-user",
    name: "No Evidence Project",
    slug: "no-evidence-project",
    visibility: "public",
  });
  const publicSpace = db.insertRow("developer_spaces", {
    owner_user_id: "owner-user",
    project_id: privateOnlyProject.id,
    project_name: "Public Observatory",
    slug: "private-only-public-observatory",
    visibility: "public",
  });
  const privateDraft = db.insertRow("documents", {
    author_user_id: "owner-user",
    title: "Private Draft Evidence",
    slug: "private-draft-evidence",
    body: "Private draft body should stay hidden.",
    status: "draft",
    visibility: "private",
    source_id: "private-draft-source-id",
    source_label: "Private raw source label",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: publicSpace.id,
    document_id: privateDraft.id,
    owner_user_id: "owner-user",
    document_role: "finding",
    link_visibility: "owner",
  });

  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const privateOnly = await requestJson<{ publicEvidence: Row[] }>(
      app,
      "GET",
      "/projects/public/private-only-evidence-project"
    );
    assert.equal(privateOnly.status, 200);
    assert.deepEqual(privateOnly.body.publicEvidence, []);
    assertNoPublicEvidenceInternals(privateOnly.body.publicEvidence);
    assert.equal(JSON.stringify(privateOnly.body).includes("Private Draft Evidence"), false);
    assert.equal(JSON.stringify(privateOnly.body).includes("Private raw source label"), false);

    const none = await requestJson<{ publicEvidence: Row[] }>(
      app,
      "GET",
      "/projects/public/no-evidence-project"
    );
    assert.equal(none.status, 200);
    assert.deepEqual(none.body.publicEvidence, []);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("Project route errors return stable public copy", async () => {
  const db = new InMemorySupabase();
  const publicProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000300",
    owner_user_id: "owner-user",
    name: "Public Error Surface",
    slug: "public-error-surface",
    visibility: "public",
  });
  const ownerProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000301",
    owner_user_id: "owner-user",
    name: "Owner Error Surface",
    slug: "owner-error-surface",
    visibility: "private",
  });
  const publicSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000300",
    owner_user_id: "owner-user",
    project_id: publicProject.id,
    project_name: "Public Error Observatory",
    slug: "public-error-observatory",
    visibility: "public",
  });
  const ownerSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000301",
    owner_user_id: "owner-user",
    project_id: ownerProject.id,
    project_name: "Owner Error Observatory",
    slug: "owner-error-observatory",
    visibility: "private",
  });
  const publicDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000300",
    author_user_id: "owner-user",
    title: "Public Error Evidence",
    slug: "public-error-evidence",
    status: "published",
    visibility: "public",
    body: "public evidence body should never be in error responses",
  });
  const ownerDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000301",
    author_user_id: "owner-user",
    title: "Owner Error Evidence",
    slug: "owner-error-evidence",
    status: "draft",
    visibility: "private",
    body: "owner draft body should never be in error responses",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: publicSpace.id,
    document_id: publicDocument.id,
    owner_user_id: "owner-user",
    document_role: "finding",
    link_visibility: "public",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: ownerSpace.id,
    document_id: ownerDocument.id,
    owner_user_id: "owner-user",
    document_role: "note",
    link_visibility: "owner",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const expected = {
    publicRead: {
      error: "Could not load public Project.",
      code: "project_public_load_failed",
    },
    publicDeveloperSpaces: {
      error: "Could not load public Project Developer Spaces.",
      code: "project_public_developer_spaces_load_failed",
    },
    publicEvidence: {
      error: "Could not load public Project evidence.",
      code: "project_public_evidence_load_failed",
    },
    ownerList: {
      error: "Could not load your Projects.",
      code: "project_owner_list_failed",
    },
    create: {
      error: "Could not create Project.",
      code: "project_create_failed",
    },
    ownerRead: {
      error: "Could not load Project.",
      code: "project_owner_load_failed",
    },
    ownerDeveloperSpaces: {
      error: "Could not load attached Developer Spaces.",
      code: "project_attached_developer_spaces_load_failed",
    },
    ownerActivity: {
      error: "Could not load Project activity.",
      code: "project_activity_load_failed",
    },
    ownerEvidence: {
      error: "Could not load Project evidence.",
      code: "project_evidence_load_failed",
    },
  };

  try {
    db.operationErrors.set("select:projects", hostileProjectError("public project read"));
    const publicRead = await requestJson(app, "GET", "/projects/public/public-error-surface");
    assert.equal(publicRead.status, 500);
    assertStableProjectError(publicRead.body, expected.publicRead);

    db.operationErrors.set("select:developer_spaces", hostileProjectError("public attached spaces"));
    const publicDeveloperSpaces = await requestJson(app, "GET", "/projects/public/public-error-surface");
    assert.equal(publicDeveloperSpaces.status, 500);
    assertStableProjectError(publicDeveloperSpaces.body, expected.publicDeveloperSpaces);

    db.operationErrors.set("select:developer_space_documents", hostileProjectError("public evidence links"));
    const publicEvidenceLinks = await requestJson(app, "GET", "/projects/public/public-error-surface");
    assert.equal(publicEvidenceLinks.status, 500);
    assertStableProjectError(publicEvidenceLinks.body, expected.publicEvidence);

    db.operationErrors.set("select:documents", hostileProjectError("public evidence documents"));
    const publicEvidenceDocuments = await requestJson(app, "GET", "/projects/public/public-error-surface");
    assert.equal(publicEvidenceDocuments.status, 500);
    assertStableProjectError(publicEvidenceDocuments.body, expected.publicEvidence);

    db.operationErrors.set("select:projects", hostileProjectError("owner list"));
    const ownerList = await requestJson(app, "GET", "/projects", { token: "owner-token" });
    assert.equal(ownerList.status, 500);
    assertStableProjectError(ownerList.body, expected.ownerList);

    db.rpcErrors.set("create_project_with_owner_v1", hostileProjectError("project create"));
    const create = await requestJson(app, "POST", "/projects", {
      token: "owner-token",
      body: {
        name: "Create Failure",
        slug: "create-failure",
      },
    });
    assert.equal(create.status, 500);
    assertStableProjectError(create.body, expected.create);

    db.operationErrors.set("select:projects", hostileProjectError("owner read"));
    const ownerRead = await requestJson(app, "GET", "/projects/owner-error-surface", { token: "owner-token" });
    assert.equal(ownerRead.status, 500);
    assertStableProjectError(ownerRead.body, expected.ownerRead);

    db.operationErrors.set("select:developer_spaces", hostileProjectError("owner attached spaces"));
    const ownerDeveloperSpaces = await requestJson(app, "GET", "/projects/owner-error-surface", { token: "owner-token" });
    assert.equal(ownerDeveloperSpaces.status, 500);
    assertStableProjectError(ownerDeveloperSpaces.body, expected.ownerDeveloperSpaces);

    db.operationErrors.set("select:developer_space_usage", hostileProjectError("owner activity"));
    const ownerActivity = await requestJson(app, "GET", "/projects/owner-error-surface", { token: "owner-token" });
    assert.equal(ownerActivity.status, 500);
    assertStableProjectError(ownerActivity.body, expected.ownerActivity);

    db.operationErrors.set("select:developer_space_documents", hostileProjectError("owner evidence links"));
    const ownerEvidenceLinks = await requestJson(app, "GET", "/projects/owner-error-surface", { token: "owner-token" });
    assert.equal(ownerEvidenceLinks.status, 500);
    assertStableProjectError(ownerEvidenceLinks.body, expected.ownerEvidence);

    db.operationErrors.set("select:documents", hostileProjectError("owner evidence documents"));
    const ownerEvidenceDocuments = await requestJson(app, "GET", "/projects/owner-error-surface", { token: "owner-token" });
    assert.equal(ownerEvidenceDocuments.status, 500);
    assertStableProjectError(ownerEvidenceDocuments.body, expected.ownerEvidence);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("projects routes require auth and validate create payloads", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const unauthenticated = await requestJson(app, "GET", "/projects");
  assert.equal(unauthenticated.status, 401);

  const invalid = await requestJson(app, "POST", "/projects", {
    token: "owner-token",
    body: {
      name: "",
      slug: "Bad Slug",
      visibility: "open",
      connectionTier: "creator",
    },
  });
  assert.equal(invalid.status, 400);

  setSupabaseAdminForTests(null);
});

test("project create writes owner project and deterministic owner member row", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const created = await requestJson<{ project: Row }>(app, "POST", "/projects", {
    token: "owner-token",
    body: {
      name: "Animus Field Lab",
      slug: "animus-field-lab",
      description: "Synthetic public-safe project shell.",
      visibility: "unlisted",
      connectionTier: "tier_1_showcase",
    },
  });

  assert.equal(created.status, 201);
  assertNoProjectOwnerIds(created.body);
  assert.equal(created.body.project.name, "Animus Field Lab");
  assert.equal(created.body.project.slug, "animus-field-lab");
  assert.equal(created.body.project.visibility, "unlisted");
  assert.equal(created.body.project.connectionTier, "tier_1_showcase");
  assert.equal(db.tables.projects.length, 1);
  assert.deepEqual(
    db.tables.project_members.map((row) => ({
      project_id: row.project_id,
      user_id: row.user_id,
      role: row.role,
      status: row.status,
    })),
    [{ project_id: created.body.project.id, user_id: "owner-user", role: "owner", status: "active" }]
  );

  setSupabaseAdminForTests(null);
});

test("project create RPC is atomic when owner membership creation fails", async () => {
  const db = new InMemorySupabase();
  db.failAtomicOwnerMembership = true;
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const response = await requestJson(app, "POST", "/projects", {
      token: "owner-token",
      body: { name: "Atomic Project", slug: "atomic-project" },
    });

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, {
      error: "Could not create Project.",
      code: "project_create_failed",
    });
    assert.equal(db.tables.projects.length, 0);
    assert.equal(db.tables.project_members.length, 0);
    assert.deepEqual(db.rpcCalls.map((call) => call.name), ["create_project_with_owner_v1"]);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("project list and read are scoped to the authenticated owner", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    owner_user_id: "owner-user",
    name: "Owner Project",
    slug: "owner-project",
    visibility: "private",
    connection_tier: "tier_1_showcase",
  });
  db.insertRow("projects", {
    owner_user_id: "other-user",
    name: "Other Project",
    slug: "other-project",
    visibility: "private",
    connection_tier: "tier_1_showcase",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  const list = await requestJson<{ projects: Row[] }>(app, "GET", "/projects", { token: "owner-token" });
  assert.equal(list.status, 200);
  assertNoProjectOwnerIds(list.body);
  assert.deepEqual(list.body.projects.map((project) => project.slug), ["owner-project"]);

  const bySlug = await requestJson<{ project: Row }>(app, "GET", "/projects/owner-project", { token: "owner-token" });
  assert.equal(bySlug.status, 200);
  assertNoProjectOwnerIds(bySlug.body);
  assert.equal(bySlug.body.project.id, ownerProject.id);

  const byId = await requestJson<{ project: Row }>(app, "GET", `/projects/${ownerProject.id}`, { token: "owner-token" });
  assert.equal(byId.status, 200);
  assertNoProjectOwnerIds(byId.body);
  assert.equal(byId.body.project.slug, "owner-project");

  const blocked = await requestJson(app, "GET", "/projects/other-project", { token: "owner-token" });
  assert.equal(blocked.status, 404);

  setSupabaseAdminForTests(null);
});

test("Institution Project list, detail, visibility, and public attribution follow Institution authority", async () => {
  const db = new InMemorySupabase();
  const institution = db.insertRow("institutions", {
    owner_user_id: "owner-user",
    name: "Station Institutional Alpha",
    slug: "station-institutional-alpha",
    verification_status: "verified",
    public_status: "public",
  });
  db.insertRow("institution_members", {
    institution_id: institution.id,
    user_id: "viewer-user",
    role: "member",
    status: "active",
  });
  const project = db.insertRow("projects", {
    owner_user_id: null,
    institution_id: institution.id,
    name: "Institution Project",
    slug: "institution-project",
    visibility: "private",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const ownerList = await requestJson(app, "GET", "/projects", { token: "owner-token" });
    assert.equal(ownerList.status, 200);
    assert.equal(ownerList.body.institutionProjects.length, 1);
    assert.deepEqual(ownerList.body.institutionProjects[0].access, { role: "institution_owner", readOnly: false });
    assert.deepEqual(Object.keys(ownerList.body.institutionProjects[0]).sort(), [
      "access", "connectionTier", "createdAt", "description", "institution", "name",
      "publicHref", "slug", "updatedAt", "visibility",
    ].sort());

    const memberList = await requestJson(app, "GET", "/projects", { token: "viewer-token" });
    assert.equal(memberList.body.institutionProjects.length, 1);
    assert.deepEqual(memberList.body.institutionProjects[0].access, { role: "institution_member", readOnly: true });

    const ownerDetail = await requestJson(app, "GET", `/projects/${project.id}`, { token: "owner-token" });
    assert.equal(ownerDetail.status, 200);
    assert.deepEqual(ownerDetail.body.access, { role: "institution_owner", readOnly: false });
    assert.deepEqual(Object.keys(ownerDetail.body).sort(), ["access", "developerSpaces", "evidence", "institution", "project"]);
    assert.deepEqual(Object.keys(ownerDetail.body.project).sort(), [
      "connectionTier", "createdAt", "description", "name", "publicHref", "slug", "updatedAt", "visibility",
    ].sort());
    assert.equal(JSON.stringify(ownerDetail.body).includes(institution.id), false);

    const memberDetail = await requestJson(app, "GET", "/projects/institution-project", { token: "viewer-token" });
    assert.equal(memberDetail.status, 200);
    assert.deepEqual(memberDetail.body.access, { role: "institution_member", readOnly: true });
    assert.equal((await requestJson(app, "GET", "/projects/institution-project", { token: "other-token" })).status, 404);

    const memberPatch = await requestJson(app, "PATCH", "/projects/institution-project", {
      token: "viewer-token",
      body: { visibility: "public" },
    });
    assert.equal(memberPatch.status, 404);
    assert.equal(db.tables.projects[0].visibility, "private");

    const anonymousPrivate = await requestJson(app, "GET", "/projects/public/institution-project");
    assert.equal(anonymousPrivate.status, 404);

    const ownerPatch = await requestJson(app, "PATCH", "/projects/institution-project", {
      token: "owner-token",
      body: { visibility: "public" },
    });
    assert.equal(ownerPatch.status, 200);
    assert.deepEqual(ownerPatch.body.project.access, { role: "institution_owner", readOnly: false });

    const publicRead = await requestJson(app, "GET", "/projects/public/institution-project");
    assert.equal(publicRead.status, 200);
    assert.deepEqual(publicRead.body.project.institution, {
      name: "Station Institutional Alpha",
      slug: "station-institutional-alpha",
      href: "/institutions/station-institutional-alpha",
    });
    assert.equal(JSON.stringify(publicRead.body).includes(institution.id), false);

    institution.verification_status = "revoked";
    institution.public_status = "private";
    assert.equal((await requestJson(app, "GET", "/projects/public/institution-project")).status, 404);
    const revokedPrivateDetail = await requestJson(app, "GET", "/projects/institution-project", { token: "viewer-token" });
    assert.equal(revokedPrivateDetail.status, 200);
    assert.equal(revokedPrivateDetail.body.project.publicHref, null);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("project read includes only owner attached Developer Space summaries", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000001",
    owner_user_id: "owner-user",
    name: "Owner Project",
    slug: "owner-project",
    visibility: "private",
    connection_tier: "tier_1_showcase",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000001",
    owner_user_id: "owner-user",
    project_id: ownerProject.id,
    project_name: "Attached Space",
    slug: "attached-space",
    description: "Owner attached Developer Space.",
    visibility: "public",
    visualisation_type: "node_field",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000002",
    owner_user_id: "owner-user",
    project_id: null,
    project_name: "Unattached Space",
    slug: "unattached-space",
    visibility: "public",
    visualisation_type: "timeline",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000003",
    owner_user_id: "other-user",
    project_id: ownerProject.id,
    project_name: "Foreign Space",
    slug: "foreign-space",
    visibility: "public",
    visualisation_type: "world_map",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const bySlug = await requestJson<{ project: Row; developerSpaces: Row[] }>(app, "GET", "/projects/owner-project", {
      token: "owner-token",
    });
    assert.equal(bySlug.status, 200);
    assertNoProjectOwnerIds(bySlug.body);
    assert.equal(bySlug.body.project.id, ownerProject.id);
    assert.deepEqual(bySlug.body.developerSpaces.map((space) => space.slug), ["attached-space"]);
    assert.deepEqual(Object.keys(bySlug.body.developerSpaces[0]).sort(), [
      "createdAt",
      "description",
      "id",
      "projectName",
      "slug",
      "updatedAt",
      "visibility",
      "visualisationType",
    ]);
    assert.equal(bySlug.body.developerSpaces[0].projectName, "Attached Space");
    assert.equal(bySlug.body.developerSpaces[0].description, "Owner attached Developer Space.");
    assert.equal(bySlug.body.developerSpaces[0].visibility, "public");
    assert.equal(bySlug.body.developerSpaces[0].visualisationType, "node_field");

    const byId = await requestJson<{ project: Row; developerSpaces: Row[] }>(
      app,
      "GET",
      `/projects/${ownerProject.id}`,
      { token: "owner-token" }
    );
    assert.equal(byId.status, 200);
    assertNoProjectOwnerIds(byId.body);
    assert.deepEqual(byId.body.developerSpaces.map((space) => space.slug), ["attached-space"]);

    const blocked = await requestJson(app, "GET", "/projects/owner-project", { token: "other-token" });
    assert.equal(blocked.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("project read includes bounded owner-only evidence metadata from attached Developer Spaces", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000020",
    owner_user_id: "owner-user",
    name: "Research Project",
    slug: "research-project",
  });
  const attachedSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000020",
    owner_user_id: "owner-user",
    project_id: ownerProject.id,
    project_name: "Attached Lab",
    slug: "attached-lab",
    visibility: "private",
  });
  const unattachedSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000021",
    owner_user_id: "owner-user",
    project_id: null,
    project_name: "Loose Lab",
    slug: "loose-lab",
  });
  const foreignSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000022",
    owner_user_id: "other-user",
    project_id: ownerProject.id,
    project_name: "Foreign Lab",
    slug: "foreign-lab",
  });
  const publishedProof = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000020",
    author_user_id: "owner-user",
    title: "Published proof",
    slug: "published-proof",
    body: "Sensitive body text should not leave the evidence serializer.",
    document_type: "research",
    status: "published",
    visibility: "public",
    published_at: "2026-06-19T12:00:00.000Z",
    created_at: "2026-06-19T10:00:00.000Z",
    updated_at: "2026-06-19T12:00:00.000Z",
    provenance_type: "user_authored",
    source_id: "private-source-id",
    source_label: "Developer Space: Attached Lab",
  });
  const privateDraft = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000021",
    author_user_id: "owner-user",
    title: "Private draft",
    slug: "private-draft",
    body: "Private draft body.",
    document_type: "field_log",
    status: "draft",
    visibility: "private",
    created_at: "2026-06-19T09:00:00.000Z",
    updated_at: "2026-06-19T11:00:00.000Z",
    provenance_type: "ai_assisted",
    source_id: "private-draft-source",
    source_label: "Private archive source",
  });
  const unattachedDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000022",
    author_user_id: "owner-user",
    title: "Unattached evidence",
    slug: "unattached-evidence",
    status: "published",
    visibility: "public",
    published_at: "2026-06-19T13:00:00.000Z",
  });
  const otherOwnerDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000023",
    author_user_id: "other-user",
    title: "Other owner evidence",
    slug: "other-owner-evidence",
    status: "published",
    visibility: "public",
    published_at: "2026-06-19T14:00:00.000Z",
  });

  db.insertRow("developer_space_documents", {
    id: "40000000-0000-4000-8000-000000000020",
    developer_space_id: attachedSpace.id,
    document_id: publishedProof.id,
    owner_user_id: "owner-user",
    document_role: "finding",
    link_visibility: "public",
    sort_order: 2,
    created_at: "2026-06-19T12:05:00.000Z",
    updated_at: "2026-06-19T12:05:00.000Z",
  });
  db.insertRow("developer_space_documents", {
    id: "40000000-0000-4000-8000-000000000021",
    developer_space_id: attachedSpace.id,
    document_id: privateDraft.id,
    owner_user_id: "owner-user",
    document_role: "field_log",
    link_visibility: "owner",
    sort_order: 1,
    created_at: "2026-06-19T11:05:00.000Z",
    updated_at: "2026-06-19T11:05:00.000Z",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: unattachedSpace.id,
    document_id: unattachedDocument.id,
    owner_user_id: "owner-user",
    document_role: "methodology",
    link_visibility: "public",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: foreignSpace.id,
    document_id: otherOwnerDocument.id,
    owner_user_id: "other-user",
    document_role: "finding",
    link_visibility: "public",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: attachedSpace.id,
    document_id: otherOwnerDocument.id,
    owner_user_id: "owner-user",
    document_role: "note",
    link_visibility: "public",
  });

  for (let index = 0; index < PROJECT_EVIDENCE_LIMIT + 4; index += 1) {
    const document = db.insertRow("documents", {
      id: `30000000-0000-4000-8000-${String(100 + index).padStart(12, "0")}`,
      author_user_id: "owner-user",
      title: `Older note ${index}`,
      slug: `older-note-${index}`,
      status: "published",
      visibility: "public",
      published_at: `2026-06-18T${String(index % 10).padStart(2, "0")}:00:00.000Z`,
      updated_at: `2026-06-18T${String(index % 10).padStart(2, "0")}:00:00.000Z`,
    });
    db.insertRow("developer_space_documents", {
      developer_space_id: attachedSpace.id,
      document_id: document.id,
      owner_user_id: "owner-user",
      document_role: "note",
      link_visibility: "public",
      sort_order: index + 10,
    });
  }

  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const response = await requestJson<{ evidence: Row[] }>(app, "GET", "/projects/research-project", {
      token: "owner-token",
    });
    assert.equal(response.status, 200);
    assertNoProjectOwnerIds(response.body);
    assert.equal(response.body.evidence.length, PROJECT_EVIDENCE_LIMIT);
    assert.deepEqual(
      response.body.evidence.slice(0, 2).map((item) => item.document.slug),
      ["published-proof", "private-draft"]
    );
    assert.deepEqual(response.body.evidence[0].developerSpace, {
      id: attachedSpace.id,
      projectName: "Attached Lab",
      slug: "attached-lab",
    });
    assert.equal(response.body.evidence[0].role, "finding");
    assert.equal(response.body.evidence[0].linkVisibility, "public");
    assert.equal(response.body.evidence[0].document.documentType, "research");
    assert.equal(response.body.evidence[0].document.status, "published");
    assert.equal(response.body.evidence[0].document.visibility, "public");
    assert.equal(response.body.evidence[0].document.provenanceType, "user_authored");
    assert.equal(response.body.evidence[0].document.sourceLabel, "Developer Space: Attached Lab");
    assert.equal(response.body.evidence[0].routeHref, "/developer-spaces/attached-lab");
    assert.equal(response.body.evidence[0].routeLabel, "Open observatory");
    assert.equal(response.body.evidence[1].role, "field_log");
    assert.equal(response.body.evidence[1].document.sourceLabel, null);
    assert.equal(response.body.evidence[1].routeHref, `/studio/publish?documentId=${privateDraft.id}`);
    assert.equal(response.body.evidence[1].routeLabel, "Review draft");

    const evidenceJson = JSON.stringify(response.body.evidence);
    assert.equal(
      response.body.evidence.every((item) => !Object.prototype.hasOwnProperty.call(item, "id")),
      true
    );
    assert.doesNotMatch(evidenceJson, /40000000-0000-4000-8000-00000000002[01]/);
    assert.doesNotMatch(evidenceJson, /Sensitive body text|Private draft body/);
    assert.doesNotMatch(evidenceJson, /private-source-id|private-draft-source/);
    assert.doesNotMatch(evidenceJson, /owner_user_id|ownerUserId|author_user_id|authorUserId/);
    assert.doesNotMatch(evidenceJson, /raw_event|snapshot|provider|ingestion|secret|report|export/);
    assert.equal(response.body.evidence.some((item) => item.document.slug === "unattached-evidence"), false);
    assert.equal(response.body.evidence.some((item) => item.document.slug === "other-owner-evidence"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("project read returns zero-state and owner-scoped activity aggregation", async () => {
  const db = new InMemorySupabase();
  const ownerProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000010",
    owner_user_id: "owner-user",
    name: "Owner Activity Project",
    slug: "owner-activity-project",
  });
  const otherProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000011",
    owner_user_id: "owner-user",
    name: "Other Owner Project",
    slug: "other-owner-project",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const zero = await requestJson<{ activity: Row }>(app, "GET", "/projects/owner-activity-project", {
      token: "owner-token",
    });
    assert.equal(zero.status, 200);
    assertNoProjectOwnerIds(zero.body);
    assert.deepEqual(zero.body.activity, {
      developerSpaces: 0,
      nodes: 0,
      events: 0,
      snapshots: 0,
      storageBytes: 0,
      publicReads: 0,
      exports: 0,
    });

    db.insertRow("developer_spaces", {
      id: "20000000-0000-4000-8000-000000000010",
      owner_user_id: "owner-user",
      project_id: ownerProject.id,
      project_name: "Attached Activity One",
      slug: "attached-activity-one",
    });
    db.insertRow("developer_spaces", {
      id: "20000000-0000-4000-8000-000000000011",
      owner_user_id: "owner-user",
      project_id: ownerProject.id,
      project_name: "Attached Activity Two",
      slug: "attached-activity-two",
    });
    db.insertRow("developer_space_usage", {
      developer_space_id: "20000000-0000-4000-8000-000000000010",
      owner_user_id: "owner-user",
      project_id: ownerProject.id,
      ingested_nodes_count: 4,
      ingested_events_count: 28,
      ingested_snapshots_count: 3,
      storage_bytes: 12000,
      public_detail_reads_count: 8,
      export_count: 1,
    });
    db.insertRow("developer_space_usage", {
      developer_space_id: "20000000-0000-4000-8000-000000000012",
      owner_user_id: "other-user",
      project_id: ownerProject.id,
      ingested_nodes_count: 999,
      ingested_events_count: 999,
      ingested_snapshots_count: 999,
      storage_bytes: 999,
      public_detail_reads_count: 999,
      export_count: 999,
    });
    db.insertRow("developer_space_usage", {
      developer_space_id: "20000000-0000-4000-8000-000000000013",
      owner_user_id: "owner-user",
      project_id: otherProject.id,
      ingested_nodes_count: 50,
      ingested_events_count: 50,
      ingested_snapshots_count: 50,
      storage_bytes: 50,
      public_detail_reads_count: 50,
      export_count: 50,
    });

    const aggregated = await requestJson<{ activity: Row; developerSpaces: Row[] }>(
      app,
      "GET",
      `/projects/${ownerProject.id}`,
      { token: "owner-token" }
    );
    assert.equal(aggregated.status, 200);
    assert.deepEqual(aggregated.body.developerSpaces.map((space) => space.slug), [
      "attached-activity-two",
      "attached-activity-one",
    ]);
    assert.deepEqual(aggregated.body.activity, {
      developerSpaces: 2,
      nodes: 4,
      events: 28,
      snapshots: 3,
      storageBytes: 12000,
      publicReads: 8,
      exports: 1,
    });
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner invitation uses exact case-sensitive usernames and sanitized current-member readback", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000700",
    owner_user_id: "owner-user",
    name: "Shared Field Lab",
    slug: "shared-field-lab",
    visibility: "private",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    for (const body of [
      { username: "bad handle" },
      { username: "ab" },
      { username: "Exact_Viewer", actorUserId: "viewer-user" },
    ]) {
      const invalid = await requestJson(app, "POST", "/projects/shared-field-lab/invitations", {
        token: "owner-token",
        body,
      });
      assert.equal(invalid.status, 400);
      assert.equal(JSON.stringify(invalid.body).includes(JSON.stringify(body.username)), false);
    }

    const wrongCase = await requestJson(app, "POST", "/projects/shared-field-lab/invitations", {
      token: "owner-token",
      body: { username: "exact_Viewer" },
    });
    assert.equal(wrongCase.status, 404);
    assert.equal(JSON.stringify(wrongCase.body).includes("exact_Viewer"), false);

    const self = await requestJson(app, "POST", "/projects/shared-field-lab/invitations", {
      token: "owner-token",
      body: { username: "Owner_One" },
    });
    assert.equal(self.status, 404);
    assert.equal(JSON.stringify(self.body).includes("Owner_One"), false);

    const invited = await requestJson<{ member: Row }>(app, "POST", "/projects/shared-field-lab/invitations", {
      token: "owner-token",
      body: { username: "  Exact_Viewer  " },
    });
    assert.equal(invited.status, 201);
    assert.equal(invited.cacheControl, "private, no-store");
    assert.deepEqual(Object.keys(invited.body.member).sort(), [
      "displayName",
      "expiresAt",
      "invitedAt",
      "role",
      "status",
      "username",
    ]);
    assert.equal(invited.body.member.username, "Exact_Viewer");
    assert.equal(invited.body.member.status, "invited");
    assertNoSharedProjectInternals(invited.body);

    const duplicate = await requestJson(app, "POST", "/projects/shared-field-lab/invitations", {
      token: "owner-token",
      body: { username: "Exact_Viewer" },
    });
    assert.equal(duplicate.status, 409);
    assert.equal(db.tables.project_members.filter((row) => row.user_id === "viewer-user").length, 1);

    const ownerMembers = await requestJson<{ members: Row[] }>(app, "GET", "/projects/shared-field-lab/members", {
      token: "owner-token",
    });
    assert.equal(ownerMembers.status, 200);
    assert.deepEqual(ownerMembers.body.members, [invited.body.member]);
    assertNoSharedProjectInternals(ownerMembers.body);

    const pendingMembership = db.tables.project_members.find((row) => (
      row.user_id === "viewer-user" && row.status === "invited"
    ));
    assert.ok(pendingMembership);
    pendingMembership.invite_expires_at = "2026-07-01T00:00:00.000Z";
    const ownerMembersAfterExpiry = await requestJson<{ members: Row[] }>(
      app,
      "GET",
      "/projects/shared-field-lab/members",
      { token: "owner-token" }
    );
    assert.deepEqual(ownerMembersAfterExpiry.body.members, []);

    const crossOwner = await requestJson(app, "GET", "/projects/shared-field-lab/members", {
      token: "other-token",
    });
    assert.equal(crossOwner.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("only the target sees an unexpired invitation and invited viewers cannot open Project detail", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000710",
    owner_user_id: "owner-user",
    name: "Invitation Project",
    slug: "invitation-project",
    description: "Bounded invitation metadata.",
    visibility: "unlisted",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "viewer-user",
    role: "viewer",
    status: "invited",
    invite_expires_at: "2026-08-13T09:00:00.000Z",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "other-user",
    role: "viewer",
    status: "removed",
    invite_expires_at: "2026-07-01T09:00:00.000Z",
    removed_at: "2026-07-02T09:00:00.000Z",
  });
  const staleProject = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000711",
    owner_user_id: "owner-user",
    name: "Expired Invitation Project",
    slug: "expired-invitation-project",
    visibility: "private",
  });
  db.insertRow("project_members", {
    project_id: staleProject.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  db.insertRow("project_members", {
    project_id: staleProject.id,
    user_id: "viewer-user",
    role: "viewer",
    status: "invited",
    invite_expires_at: "2026-07-01T09:00:00.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const target = await requestJson<{ invitations: Row[] }>(app, "GET", "/projects/invitations", {
      token: "viewer-token",
    });
    assert.equal(target.status, 200);
    assert.equal(target.cacheControl, "private, no-store");
    assert.equal(target.body.invitations.length, 1);
    assert.deepEqual(Object.keys(target.body.invitations[0]).sort(), [
      "expiresAt",
      "invitedAt",
      "owner",
      "project",
      "role",
      "status",
    ]);
    assert.deepEqual(Object.keys(target.body.invitations[0].project).sort(), [
      "description",
      "name",
      "slug",
      "visibility",
    ]);
    assert.deepEqual(Object.keys(target.body.invitations[0].owner).sort(), ["displayName", "username"]);
    assertNoSharedProjectInternals(target.body);

    const unrelated = await requestJson<{ invitations: Row[] }>(app, "GET", "/projects/invitations", {
      token: "other-token",
    });
    assert.deepEqual(unrelated.body.invitations, []);

    const invitedDetail = await requestJson(app, "GET", "/projects/invitation-project", {
      token: "viewer-token",
    });
    assert.equal(invitedDetail.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("active viewer receives only the shared Project allowlist and eligible public hrefs", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000720",
    owner_user_id: "owner-user",
    name: "Collaborative Project",
    slug: "collaborative-project",
    description: "A bounded viewer Project.",
    visibility: "public",
    connection_tier: "tier_3_lab",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "viewer-user",
    role: "viewer",
    status: "active",
    invite_expires_at: "2026-08-13T09:00:00.000Z",
    responded_at: "2026-07-30T10:00:00.000Z",
  });
  const publicSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000720",
    owner_user_id: "owner-user",
    project_id: project.id,
    project_name: "Public Viewer Space",
    slug: "public-viewer-space",
    description: "Public metadata.",
    visibility: "public",
    visualisation_type: "timeline",
  });
  const privateSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000721",
    owner_user_id: "owner-user",
    project_id: project.id,
    project_name: "Private Viewer Space",
    slug: "private-viewer-space",
    description: "Private bounded metadata.",
    visibility: "private",
    visualisation_type: "node_field",
    api_key_hash: "must-not-leak",
    provider_policy: "must-not-leak",
  });
  db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000722",
    owner_user_id: "other-user",
    project_id: project.id,
    project_name: "Foreign Space",
    slug: "foreign-space",
    visibility: "public",
  });
  const publicDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000720",
    author_user_id: "owner-user",
    title: "Public finding",
    slug: "private-document-slug",
    document_type: "research",
    status: "published",
    visibility: "public",
    published_at: "2026-07-29T12:00:00.000Z",
    body: "must-not-leak",
    source_label: "must-not-leak",
  });
  const privateDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000721",
    author_user_id: "owner-user",
    title: "Private method",
    slug: "private-method-slug",
    document_type: "field_log",
    status: "draft",
    visibility: "private",
    body: "must-not-leak",
  });
  const foreignDocument = db.insertRow("documents", {
    id: "30000000-0000-4000-8000-000000000722",
    author_user_id: "other-user",
    title: "Foreign evidence",
    status: "published",
    visibility: "public",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: publicSpace.id,
    document_id: publicDocument.id,
    owner_user_id: "owner-user",
    document_role: "finding",
    link_visibility: "public",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: privateSpace.id,
    document_id: privateDocument.id,
    owner_user_id: "owner-user",
    document_role: "methodology",
    link_visibility: "owner",
  });
  db.insertRow("developer_space_documents", {
    developer_space_id: publicSpace.id,
    document_id: foreignDocument.id,
    owner_user_id: "owner-user",
    document_role: "note",
    link_visibility: "public",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const list = await requestJson<{ projects: Row[]; sharedProjects: Row[] }>(app, "GET", "/projects", {
      token: "viewer-token",
    });
    assert.equal(list.status, 200);
    assert.deepEqual(list.body.projects, []);
    assert.equal(list.body.sharedProjects.length, 1);
    assert.deepEqual(Object.keys(list.body.sharedProjects[0]).sort(), [
      "access",
      "createdAt",
      "description",
      "name",
      "owner",
      "publicHref",
      "slug",
      "updatedAt",
      "visibility",
    ]);
    assert.equal(list.body.sharedProjects[0].publicHref, "/projects/public/collaborative-project");
    assertNoSharedProjectInternals(list.body);

    const detail = await requestJson<Row>(app, "GET", "/projects/collaborative-project", {
      token: "viewer-token",
    });
    assert.equal(detail.status, 200);
    assert.equal(detail.cacheControl, "private, no-store");
    assert.deepEqual(Object.keys(detail.body).sort(), ["access", "developerSpaces", "evidence", "owner", "project"]);
    assert.deepEqual(detail.body.access, { role: "viewer", readOnly: true });
    assert.deepEqual(detail.body.developerSpaces.map((space: Row) => ({
      name: space.projectName,
      publicHref: space.publicHref,
    })), [
      { name: "Private Viewer Space", publicHref: null },
      { name: "Public Viewer Space", publicHref: "/developer-spaces/public-viewer-space" },
    ]);
    assert.equal(detail.body.evidence.length, 2);
    const evidenceByTitle = new Map<string, Row>(
      detail.body.evidence.map((item: Row) => [item.document.title, item])
    );
    assert.equal(evidenceByTitle.get("Public finding").publicHref, "/developer-spaces/public-viewer-space");
    assert.equal(evidenceByTitle.get("Private method").publicHref, null);
    assert.equal(evidenceByTitle.has("Foreign evidence"), false);
    assertNoSharedProjectInternals(detail.body);
    assert.equal(JSON.stringify(detail.body).includes("must-not-leak"), false);
    assert.equal(JSON.stringify(detail.body).includes("private-document-slug"), false);

    const ownerDetail = await requestJson<Row>(app, "GET", "/projects/collaborative-project", {
      token: "owner-token",
    });
    assert.equal(ownerDetail.status, 200);
    assert.deepEqual(ownerDetail.body.access, { role: "owner", readOnly: false });
    assert.equal(ownerDetail.body.project.connectionTier, "tier_3_lab");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("active Project viewer gains no Developer Space owner, usage, key, document, or export route", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000725",
    owner_user_id: "owner-user",
    name: "Boundary Project",
    slug: "boundary-project",
    visibility: "private",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "viewer-user",
    role: "viewer",
    status: "active",
    invite_expires_at: "2026-08-13T09:00:00.000Z",
    responded_at: "2026-07-30T10:00:00.000Z",
  });
  const privateSpace = db.insertRow("developer_spaces", {
    id: "20000000-0000-4000-8000-000000000725",
    owner_user_id: "owner-user",
    project_id: project.id,
    project_name: "Boundary Space",
    slug: "boundary-space",
    visibility: "private",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectBoundaryApp();

  try {
    const sharedDetail = await requestJson(app, "GET", "/projects/boundary-project", { token: "viewer-token" });
    assert.equal(sharedDetail.status, 200);

    const probes: Array<[string, string, unknown?]> = [
      ["GET", "/developer-spaces/boundary-space"],
      ["GET", `/developer-spaces/${privateSpace.id}/usage`],
      ["GET", `/developer-spaces/${privateSpace.id}/agent/actions`],
      ["POST", `/developer-spaces/${privateSpace.id}/api-key`, {}],
      ["POST", `/developer-spaces/${privateSpace.id}/documents`, { documentId: "30000000-0000-4000-8000-000000000725" }],
      ["GET", "/exports/projects/boundary-project"],
      ["POST", "/exports/projects/boundary-project", {}],
      ["GET", `/exports/developer-spaces/${privateSpace.id}`],
      ["POST", `/exports/developer-spaces/${privateSpace.id}`, {}],
    ];

    for (const [method, path, body] of probes) {
      const response = await requestJson(app, method, path, {
        token: "viewer-token",
        ...(body === undefined ? {} : { body }),
      });
      assert.equal([403, 404].includes(response.status), true, `${method} ${path} must stay owner-only`);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("revoke removes fresh shared reads and stale invitations can only start a fresh lifecycle", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000730",
    owner_user_id: "owner-user",
    name: "Lifecycle Project",
    slug: "lifecycle-project",
    visibility: "private",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "viewer-user",
    role: "viewer",
    status: "active",
    invite_expires_at: "2026-08-13T09:00:00.000Z",
    responded_at: "2026-07-30T09:30:00.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const membersBefore = await requestJson<{ members: Row[] }>(app, "GET", "/projects/lifecycle-project/members", {
      token: "owner-token",
    });
    assert.equal(membersBefore.body.members[0].status, "active");
    assert.equal(Object.prototype.hasOwnProperty.call(membersBefore.body.members[0], "expiresAt"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(membersBefore.body.members[0], "respondedAt"), true);

    const revoked = await requestJson(app, "POST", "/projects/lifecycle-project/members/revoke", {
      token: "owner-token",
      body: { username: "Exact_Viewer" },
    });
    assert.equal(revoked.status, 200);
    assert.deepEqual(revoked.body, { status: "removed" });

    const freshDetail = await requestJson(app, "GET", "/projects/lifecycle-project", { token: "viewer-token" });
    assert.equal(freshDetail.status, 404);
    const freshList = await requestJson<{ sharedProjects: Row[] }>(app, "GET", "/projects", {
      token: "viewer-token",
    });
    assert.deepEqual(freshList.body.sharedProjects, []);

    const reinvited = await requestJson(app, "POST", "/projects/lifecycle-project/invitations", {
      token: "owner-token",
      body: { username: "Exact_Viewer" },
    });
    assert.equal(reinvited.status, 201);
    assert.equal(db.tables.project_members.filter((row) => row.user_id === "viewer-user").length, 2);

    const currentInvitation = db.tables.project_members.find((row) => (
      row.user_id === "viewer-user" && row.status === "invited"
    ));
    currentInvitation.invite_expires_at = "2026-07-01T00:00:00.000Z";
    const stale = await requestJson(app, "POST", "/projects/lifecycle-project/invitation/accept", {
      token: "viewer-token",
      body: {},
    });
    assert.equal(stale.status, 410);
    assert.equal(currentInvitation.status, "removed");

    const freshInvitation = await requestJson(app, "POST", "/projects/lifecycle-project/invitations", {
      token: "owner-token",
      body: { username: "Exact_Viewer" },
    });
    assert.equal(freshInvitation.status, 201);
    const declined = await requestJson(app, "POST", "/projects/lifecycle-project/invitation/decline", {
      token: "viewer-token",
      body: {},
    });
    assert.equal(declined.status, 200);
    assert.deepEqual(declined.body, { status: "removed" });
    assert.equal((await requestJson(app, "GET", "/projects/lifecycle-project", { token: "viewer-token" })).status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("accept grants only exact active viewer status while dormant and stray roles stay denied", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000740",
    owner_user_id: "owner-user",
    name: "Role Project",
    slug: "role-project",
    visibility: "private",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  const invitation = db.insertRow("project_members", {
    project_id: project.id,
    user_id: "viewer-user",
    role: "viewer",
    status: "invited",
    invite_expires_at: "2026-08-13T09:00:00.000Z",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    const accepted = await requestJson(app, "POST", "/projects/role-project/invitation/accept", {
      token: "viewer-token",
      body: {},
    });
    assert.equal(accepted.status, 200);
    assert.deepEqual(accepted.body, { status: "active" });
    assert.equal((await requestJson(app, "GET", "/projects/role-project", { token: "viewer-token" })).status, 200);

    invitation.status = "removed";
    invitation.removed_at = "2026-07-30T11:00:00.000Z";
    for (const role of ["admin", "editor", "billing", "owner"]) {
      const dormant = db.insertRow("project_members", {
        project_id: project.id,
        user_id: "viewer-user",
        role,
        status: "active",
      });
      const denied = await requestJson(app, "GET", "/projects/role-project", { token: "viewer-token" });
      assert.equal(denied.status, 404, `${role} must not grant shared Project access`);
      dormant.status = "removed";
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("collaboration failures return stable copy without submitted usernames or service details", async () => {
  const db = new InMemorySupabase();
  const project = db.insertRow("projects", {
    id: "10000000-0000-4000-8000-000000000750",
    owner_user_id: "owner-user",
    name: "Error Project",
    slug: "collaboration-error-project",
  });
  db.insertRow("project_members", {
    project_id: project.id,
    user_id: "owner-user",
    role: "owner",
    status: "active",
  });
  setSupabaseAdminForTests(db.client as any);
  const app = createProjectsApp();

  try {
    db.rpcErrors.set("invite_project_viewer_v1", hostileProjectError("viewer invite"));
    const response = await requestJson(app, "POST", "/projects/collaboration-error-project/invitations", {
      token: "owner-token",
      body: { username: "Exact_Viewer" },
    });
    assert.equal(response.status, 500);
    assert.deepEqual(response.body, {
      error: "Could not update Project collaboration.",
      code: "project_collaboration_update_failed",
    });
    assertStableProjectError(response.body, response.body);
    assert.equal(JSON.stringify(response.body).includes("Exact_Viewer"), false);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("migration 090 locks viewer lifecycle, owner invariants, raw access, and service-only RPCs", () => {
  const migration = readFileSync(
    resolve("infra/supabase/migrations/090_project_collaboration_viewer_membership.sql"),
    "utf8"
  );
  const projectRouteSource = readFileSync(resolve("apps/api/src/routes/projects.ts"), "utf8");
  const lifecycleCheck = migration.match(/add constraint project_members_viewer_lifecycle_check[\s\S]*?not valid;/i)?.[0] ?? "";
  const invariantFunction = migration.match(
    /create or replace function public\.assert_project_owner_membership_v1\(\)[\s\S]*?\$\$;/i
  )?.[0] ?? "";
  const responseFunction = migration.match(
    /create or replace function public\.respond_project_viewer_invitation_v1\([\s\S]*?\$\$;/i
  )?.[0] ?? "";

  assert.match(migration, /add column if not exists invite_expires_at timestamptz/i);
  assert.match(migration, /begin;[\s\S]*pg_advisory_xact_lock[\s\S]*station\.pr534\.project_collaboration_viewer_membership\.090/i);
  assert.match(migration, /lock table public\.projects in share row exclusive mode;[\s\S]*lock table public\.project_members in share row exclusive mode;/i);
  assert.match(migration, /add column if not exists responded_at timestamptz/i);
  assert.match(migration, /add column if not exists removed_at timestamptz/i);
  assert.match(lifecycleCheck, /status = 'invited'[\s\S]*invite_expires_at is not null/i);
  assert.match(lifecycleCheck, /status = 'active'[\s\S]*responded_at is not null/i);
  assert.match(lifecycleCheck, /status = 'removed'[\s\S]*removed_at is not null/i);
  assert.doesNotMatch(lifecycleCheck, /now\s*\(/i);
  assert.match(migration, /validate constraint project_members_viewer_lifecycle_check/i);
  assert.match(migration, /project_members_active_owner_project_idx[\s\S]*where role = 'owner' and status = 'active'/i);
  assert.match(migration, /project_members_pending_viewer_user_idx[\s\S]*user_id, role, status, invite_expires_at/i);
  assert.match(migration, /create constraint trigger trg_projects_owner_membership_invariant[\s\S]*deferrable initially deferred/i);
  assert.match(migration, /create constraint trigger trg_project_members_owner_membership_invariant[\s\S]*deferrable initially deferred/i);
  assert.match(invariantFunction, /security definer/i);
  assert.match(migration, /revoke all on function public\.assert_project_owner_membership_v1\(\)[\s\S]*from public, anon, authenticated/i);
  assert.match(responseFunction, /if p_action is null[\s\S]*p_action not in \('accept', 'decline'\)/i);
  assert.match(migration, /drop policy if exists "project_members_all_project_owner"/i);
  assert.match(migration, /revoke all on table public\.project_members from public, anon, authenticated/i);
  assert.match(projectRouteSource, /\.gt\("invite_expires_at", "now"\)/);
  assert.match(projectRouteSource, /\.or\("status\.eq\.active,invite_expires_at\.gt\.now"\)/);
  assert.doesNotMatch(projectRouteSource, /Date\.now\(\)/);
  assert.match(migration, /notify pgrst, 'reload schema';[\s\S]*commit;/i);

  for (const functionName of [
    "create_project_with_owner_v1",
    "invite_project_viewer_v1",
    "respond_project_viewer_invitation_v1",
    "revoke_project_viewer_v1",
  ]) {
    const functionBlock = migration.match(new RegExp(
      `create or replace function public\\.${functionName}\\([\\s\\S]*?\\$\\$;`,
      "i"
    ))?.[0] ?? "";
    assert.match(functionBlock, /security definer/i, `${functionName} must be SECURITY DEFINER`);
    assert.match(functionBlock, /set search_path = pg_catalog, public/i, `${functionName} needs a fixed search path`);
    assert.match(migration, new RegExp(`alter function public\\.${functionName}\\([\\s\\S]*?owner to postgres`, "i"));
    assert.match(migration, new RegExp(`revoke all on function public\\.${functionName}\\([\\s\\S]*?from public, anon, authenticated`, "i"));
    assert.match(migration, new RegExp(`grant execute on function public\\.${functionName}\\([\\s\\S]*?to service_role`, "i"));
  }
});
