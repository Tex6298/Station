import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { PROJECT_EVIDENCE_LIMIT, projectsRouter } from "./projects";

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
    developer_space_usage: [],
    developer_space_documents: [],
    documents: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-06-19T09:00:00.000Z");
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
    return `00000000-0000-4000-8000-${String(this.idCounters[table]).padStart(12, "0")}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

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
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, Set<unknown>]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private operation: "select" | "insert" = "select";
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

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
    return this;
  }

  insert(payload: Row | Row[]) {
    this.operation = "insert";
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
    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    return rows;
  }

  private async execute(mode?: "single" | "maybeSingle") {
    const rows = this.operation === "insert"
      ? (Array.isArray(this.payload) ? this.payload : [this.payload as Row]).map((payload) => this.db.insertRow(this.table, payload))
      : this.matchingRows();

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
  assert.equal(created.body.project.ownerUserId, "owner-user");
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
  assert.deepEqual(list.body.projects.map((project) => project.slug), ["owner-project"]);

  const bySlug = await requestJson<{ project: Row }>(app, "GET", "/projects/owner-project", { token: "owner-token" });
  assert.equal(bySlug.status, 200);
  assert.equal(bySlug.body.project.id, ownerProject.id);

  const byId = await requestJson<{ project: Row }>(app, "GET", `/projects/${ownerProject.id}`, { token: "owner-token" });
  assert.equal(byId.status, 200);
  assert.equal(byId.body.project.slug, "owner-project");

  const blocked = await requestJson(app, "GET", "/projects/other-project", { token: "owner-token" });
  assert.equal(blocked.status, 404);

  setSupabaseAdminForTests(null);
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
