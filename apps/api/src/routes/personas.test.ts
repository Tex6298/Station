import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { personasRouter } from "./personas";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      { id: "private-owner", email: "private@example.test", tier: "private", is_admin: false },
      { id: "creator-owner", email: "creator@example.test", tier: "creator", is_admin: false },
      { id: "canon-owner", email: "canon@example.test", tier: "canon", is_admin: false },
      { id: "institution-owner", email: "institution@example.test", tier: "institutional", is_admin: false },
      { id: "admin-private", email: "admin@example.test", tier: "private", is_admin: true },
      { id: "other-user", email: "other@example.test", tier: "private", is_admin: false },
    ],
    personas: [],
    persona_layer_profiles: [],
    persona_lifecycle_events: [],
    memory_items: [],
    canon_items: [],
    persona_files: [],
    integrity_sessions: [],
    calibration_sessions: [],
    archived_chat_transcripts: [],
    continuity_candidates: [],
    continuity_records: [],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-06-23T10:00:00.000Z");
  private usersByToken = new Map([
    ["private-token", { id: "private-owner", email: "private@example.test" }],
    ["creator-token", { id: "creator-owner", email: "creator@example.test" }],
    ["canon-token", { id: "canon-owner", email: "canon@example.test" }],
    ["institution-token", { id: "institution-owner", email: "institution@example.test" }],
    ["admin-token", { id: "admin-private", email: "admin@example.test" }],
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

    if (table === "personas") {
      row.short_description ??= null;
      row.long_description ??= null;
      row.public_slug ??= null;
      row.visibility ??= "private";
      row.provider ??= "platform";
      row.avatar_url ??= null;
      row.awakening_prompt ??= null;
      row.style_notes ??= null;
      row.sort_order ??= 0;
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_layer_profiles") {
      row.soul ??= {};
      row.body ??= {};
      row.faculty ??= {};
      row.skill ??= {};
      row.evolution ??= {};
      row.created_at ??= now;
      row.updated_at ??= now;
    }

    if (table === "persona_lifecycle_events") {
      row.event_label ??= null;
      row.event_data ??= {};
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
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row | Row[] | null = null;
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
    let rows: Row[];

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.insertRow(this.table, payload));
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

    const data = clone(rows);
    const count = this.countRequested ? rows.length : null;

    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null, count }
        : { data: null, error: { message: `Expected one ${this.table} row.` }, count };
    }

    if (mode === "maybeSingle") {
      return data.length > 0
        ? { data: data[0], error: null, count }
        : { data: null, error: null, count };
    }

    return { data: this.head ? null : data, error: null, count };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createPersonasApp() {
  const app = express();
  app.use(express.json());
  app.use("/personas", personasRouter);
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

test("public persona eligibility blocks private-tier create and transition even with skip", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const createPublic = await requestJson(app, "POST", "/personas", {
      token: "private-token",
      body: {
        name: "Private Tier Persona",
        visibility: "public",
      },
    });

    assert.equal(createPublic.status, 403);
    assert.equal(createPublic.body.publicPersonaEligibility.eligible, false);
    assert.deepEqual(
      createPublic.body.publicPersonaEligibility.blockers,
      ["public_personas_not_available_for_tier"]
    );
    assert.equal(db.rows("personas").length, 0);

    const privatePersona = db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Owner Workspace Persona",
      short_description: "Private setup",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      visibility: "private",
    });

    const transitionPublic = await requestJson(app, "PATCH", `/personas/${privatePersona.id}`, {
      token: "private-token",
      body: { visibility: "public" },
    });
    assert.equal(transitionPublic.status, 403);
    assert.equal(db.rows("personas")[0].visibility, "private");

    const transitionPublicWithSkip = await requestJson(app, "PATCH", `/personas/${privatePersona.id}`, {
      token: "private-token",
      body: { visibility: "public", skipIntegrityPreflight: true },
    });
    assert.equal(transitionPublicWithSkip.status, 403);
    assert.equal(db.rows("personas")[0].visibility, "private");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("owner readback reports public eligibility and exact public fields without mutating visibility", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const persona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Studio Persona",
      short_description: "Owner-visible short card.",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "openai",
      avatar_url: "https://example.test/avatar.png",
      visibility: "private",
    });

    const ownerReadback = await requestJson(app, "GET", `/personas/${persona.id}`, {
      token: "creator-token",
    });

    assert.equal(ownerReadback.status, 200);
    assert.equal(ownerReadback.body.persona.ownerUserId, "creator-owner");
    assert.equal(ownerReadback.body.persona.longDescription, "Owner-only setup material.");
    assert.deepEqual(ownerReadback.body.persona.publicReadback.eligibility, {
      eligible: true,
      limit: -1,
      used: 0,
      remaining: null,
      blockers: [],
    });
    assert.deepEqual(Object.keys(ownerReadback.body.persona.publicReadback.publicFields).sort(), [
      "avatarUrl",
      "name",
      "publicSlug",
      "shortDescription",
      "visibility",
    ]);
    assert.deepEqual(ownerReadback.body.persona.publicReadback.publicFields, {
      name: "Studio Persona",
      shortDescription: "Owner-visible short card.",
      visibility: "private",
      avatarUrl: "https://example.test/avatar.png",
      publicSlug: null,
    });
    assert.equal(db.rows("personas")[0].visibility, "private");
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("creator, canon, institutional, and admin-private users can create public personas when eligible", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    for (const [token, name] of [
      ["creator-token", "Creator Public Persona"],
      ["canon-token", "Canon Public Persona"],
      ["institution-token", "Institution Public Persona"],
      ["admin-token", "Admin Public Persona"],
    ] as const) {
      const created = await requestJson(app, "POST", "/personas", {
        token,
        body: {
          name,
          shortDescription: "Public-safe profile card.",
          visibility: "public",
        },
      });

      assert.equal(created.status, 201);
      assert.equal(created.body.persona.visibility, "public");
      assert.match(created.body.persona.publicReadback.publicFields.publicSlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(created.body.persona.publicReadback.eligibility.eligible, true);
      assert.deepEqual(created.body.persona.publicReadback.eligibility.blockers, []);
    }
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("generated public persona slugs never expose UUID-shaped route ids", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const uuidLikeName = "550e8400-e29b-41d4-a716-446655440000";
    const created = await requestJson(app, "POST", "/personas", {
      token: "creator-token",
      body: {
        name: uuidLikeName,
        shortDescription: "Public-safe UUID-shaped name.",
        visibility: "public",
      },
    });

    assert.equal(created.status, 201);
    assert.equal(
      created.body.persona.publicReadback.publicFields.publicSlug,
      `persona-${uuidLikeName}`
    );

    const rawUuidReadback = await requestJson(app, "GET", `/personas/public/${uuidLikeName}`);
    assert.equal(rawUuidReadback.status, 404);

    const safeReadback = await requestJson(app, "GET", `/personas/public/persona-${uuidLikeName}`);
    assert.equal(safeReadback.status, 200);
    assert.equal(safeReadback.body.persona.publicSlug, `persona-${uuidLikeName}`);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("non-owner public persona readback uses the public serializer only", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    const persona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Public Persona",
      short_description: "Public-safe card.",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "anthropic",
      avatar_url: "https://example.test/public-avatar.png",
      visibility: "public",
    });

    const readback = await requestJson(app, "GET", `/personas/${persona.id}`, {
      token: "other-token",
    });

    assert.equal(readback.status, 200);
    assert.deepEqual(readback.body.persona, {
      name: "Public Persona",
      shortDescription: "Public-safe card.",
      visibility: "public",
      avatarUrl: "https://example.test/public-avatar.png",
      publicSlug: null,
    });

    const serialized = JSON.stringify(readback.body);
    assert.equal(serialized.includes("creator-owner"), false);
    assert.equal(serialized.includes("ownerUserId"), false);
    assert.equal(serialized.includes("longDescription"), false);
    assert.equal(serialized.includes("awakeningPrompt"), false);
    assert.equal(serialized.includes("styleNotes"), false);
    assert.equal(serialized.includes("provider"), false);

    const privatePersona = db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Persona",
      visibility: "private",
    });
    const privateReadback = await requestJson(app, "GET", `/personas/${privatePersona.id}`, {
      token: "other-token",
    });
    assert.equal(privateReadback.status, 403);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

test("public persona slug readback is anonymous, public-only, and owner-tier eligible", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createPersonasApp();

  try {
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Public Slug Persona",
      short_description: "Public-safe slug card.",
      long_description: "Owner-only setup material.",
      awakening_prompt: "Owner-only awakening prompt.",
      style_notes: "Owner-only style notes.",
      provider: "anthropic",
      avatar_url: "https://example.test/public-slug-avatar.png",
      visibility: "public",
      public_slug: "public-slug-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "Private Slug Persona",
      visibility: "private",
      public_slug: "private-slug-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "private-owner",
      name: "Legacy Ineligible Persona",
      visibility: "public",
      public_slug: "legacy-ineligible-persona",
    });
    db.insertRow("personas", {
      owner_user_id: "creator-owner",
      name: "UUID Shaped Legacy Persona",
      visibility: "public",
      public_slug: "550e8400-e29b-41d4-a716-446655440000",
    });

    const publicReadback = await requestJson(app, "GET", "/personas/public/public-slug-persona");
    assert.equal(publicReadback.status, 200);
    assert.deepEqual(publicReadback.body.persona, {
      name: "Public Slug Persona",
      shortDescription: "Public-safe slug card.",
      visibility: "public",
      avatarUrl: "https://example.test/public-slug-avatar.png",
      publicSlug: "public-slug-persona",
    });
    const publicJson = JSON.stringify(publicReadback.body);
    assert.equal(publicJson.includes("creator-owner"), false);
    assert.equal(publicJson.includes("provider"), false);
    assert.equal(publicJson.includes("longDescription"), false);
    assert.equal(publicJson.includes("awakeningPrompt"), false);
    assert.equal(publicJson.includes("styleNotes"), false);

    const privateReadback = await requestJson(app, "GET", "/personas/public/private-slug-persona");
    assert.equal(privateReadback.status, 404);

    const ineligibleReadback = await requestJson(app, "GET", "/personas/public/legacy-ineligible-persona");
    assert.equal(ineligibleReadback.status, 404);

    const rawUuidReadback = await requestJson(app, "GET", "/personas/public/550e8400-e29b-41d4-a716-446655440000");
    assert.equal(rawUuidReadback.status, 404);
  } finally {
    setSupabaseAdminForTests(null);
  }
});
