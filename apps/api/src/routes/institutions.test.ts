import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
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
    ],
    institutions: [],
    institution_members: [],
    institution_audit_events: [],
  };

  queriedTables: string[] = [];
  rpcCalls: Array<{ name: string; args: Row }> = [];
  private clock = Date.parse("2026-07-30T18:00:00.000Z");
  private ids = 0;
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
  private orFilters: Array<Array<[string, "eq" | "gt", string]>> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;

  constructor(private db: InstitutionSupabase, private table: string) {}

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
    this.orderSpec = { field, ascending: options.ascending ?? true };
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

  private async execute(mode?: "single" | "maybeSingle") {
    const rows = clone(this.matchingRows());
    if (mode === "single") {
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }
    if (mode === "maybeSingle") return { data: rows[0] ?? null, error: null };
    return { data: rows, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createInstitutionApp() {
  const app = express();
  app.use(express.json());
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
    assertKeys(memberTeam.body, ["institution", "owner", "members"]);
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
      ["institution_members", "institutions", "profiles"]
    );
    assert.deepEqual(
      db.tables.institution_audit_events.map((row) => row.action),
      [
        "provisioned",
        "verification_granted",
        "member_invited",
        "invitation_accepted",
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
    ["institution_members", "institutions", "profiles"]
  );
  for (const forbidden of [
    "project_members",
    "projects",
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
