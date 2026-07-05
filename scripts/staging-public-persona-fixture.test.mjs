import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import {
  ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG,
  REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG,
  assertSafeFixtureSummary,
  publicPersonaFixtureChatMode,
  publicPersonaFixturePlan,
  safeFixtureSummary,
  seedPublicPersonaFixture,
  validatePublicPersonaFixturePlan,
  verifyFixtureRow,
} from "./staging-public-persona-fixture.mjs";

test("dry-run summary proves the ordinary fixture stays signed-in alpha", () => {
  const plan = publicPersonaFixturePlan({});
  const summary = safeFixtureSummary({ mode: "dry-run", plan });

  assert.equal(plan.fixture.publicSlug, ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG);
  assert.equal(plan.fixture.publicChatEnabled, true);
  assert.equal(publicPersonaFixtureChatMode(plan.fixture.publicSlug), "signed_in_alpha");
  assert.equal(publicPersonaFixtureChatMode(REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG), "anonymous_alpha");
  assert.equal(summary.expected.signedOutAnonymousChatCode, "public_persona_auth_required");
  assert.equal(summary.safeguards.nonReplaySlug, true);
  assert.equal(summary.safeguards.hostedWriteUsed, false);
  assertSafeFixtureSummary(summary);
});

test("CLI dry-run prints only safe fixture proof output", () => {
  const output = execFileSync("node", ["scripts/staging-public-persona-fixture.mjs", "--dry-run"], {
    encoding: "utf8",
  });
  const summary = JSON.parse(output);

  assert.equal(summary.ok, true);
  assert.equal(summary.mode, "dry-run");
  assert.equal(summary.fixture.publicSlug, ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG);
  assert.equal(summary.expected.publicPersonaChatMode, "signed_in_alpha");
  assert.equal(summary.expected.signedOutAnonymousChatCode, "public_persona_auth_required");
  assertSafeFixtureSummary(summary);
});

test("fixture validation rejects replay and raw-id-shaped slugs", () => {
  const plan = publicPersonaFixturePlan({});

  assert.throws(
    () => validatePublicPersonaFixturePlan({
      ...plan,
      fixture: { ...plan.fixture, publicSlug: REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG },
    }),
    /must not be the replay anonymous alpha slug/
  );
  assert.throws(
    () => validatePublicPersonaFixturePlan({
      ...plan,
      fixture: { ...plan.fixture, publicSlug: "550e8400-e29b-41d4-a716-446655440000" },
    }),
    /safe non-UUID public slug/
  );
});

test("hosted seed path is write-flagged, idempotent, and summary-safe", async () => {
  const api = new FakeFixtureApi({
    profiles: [
      {
        id: "owner-raw-id",
        username: "station-replay-owner",
        tier: "canon",
        is_admin: false,
      },
    ],
  });
  const env = { STATION_PUBLIC_PERSONA_FIXTURE_WRITE: "1" };

  const first = await seedPublicPersonaFixture({ env, api });
  const second = await seedPublicPersonaFixture({ env, api });
  const personas = api.rows("personas");

  assert.equal(personas.length, 1);
  assert.equal(personas[0].owner_user_id, "owner-raw-id");
  assert.equal(personas[0].public_slug, ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG);
  assert.equal(personas[0].public_chat_enabled, true);
  assert.equal(personas[0].long_description, null);
  assert.equal(personas[0].awakening_prompt, null);
  assert.equal(personas[0].style_notes, null);
  verifyFixtureRow(personas[0]);

  for (const summary of [first, second]) {
    assert.equal(summary.mode, "seeded");
    assert.equal(summary.persisted.fixtureUpserted, true);
    assertSafeFixtureSummary(summary);
    assert.equal(JSON.stringify(summary).includes("owner-raw-id"), false);
  }
});

test("hosted seed path refuses missing write flag and cross-owner slug reuse", async () => {
  await assert.rejects(
    () => seedPublicPersonaFixture({ env: {}, api: new FakeFixtureApi() }),
    /STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1/
  );

  const api = new FakeFixtureApi({
    profiles: [
      {
        id: "owner-raw-id",
        username: "station-replay-owner",
        tier: "canon",
        is_admin: false,
      },
    ],
    personas: [
      {
        id: "existing-persona",
        owner_user_id: "other-owner-raw-id",
        name: "Existing Fixture",
        public_slug: ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG,
        visibility: "public",
        public_chat_enabled: true,
      },
    ],
  });

  await assert.rejects(
    () => seedPublicPersonaFixture({ env: { STATION_PUBLIC_PERSONA_FIXTURE_WRITE: "1" }, api }),
    (error) =>
      error instanceof Error &&
      /already owned by a different profile/.test(error.message) &&
      !error.message.includes("other-owner-raw-id")
  );
});

class FakeFixtureApi {
  constructor(seed = {}) {
    this.tables = {
      profiles: seed.profiles ?? [],
      personas: seed.personas ?? [],
    };
    this.nextPersonaId = 1;
  }

  rows(table) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  async select(table, filters = []) {
    return this.applyLimit(this.matchingRows(table, filters), filters).map((row) => ({ ...row }));
  }

  async insert(table, body) {
    const row = {
      id: body.id ?? `${table}-${this.nextPersonaId++}`,
      ...body,
    };
    this.rows(table).push(row);
    return { ...row };
  }

  async patch(table, filters, body) {
    const row = this.matchingRows(table, filters)[0];
    if (!row) throw new Error(`No ${table} row matched patch filters.`);
    Object.assign(row, body);
    return { ...row };
  }

  matchingRows(table, filters) {
    return this.rows(table).filter((row) =>
      filters.every((filter) => {
        if (filter.startsWith("limit=")) return true;
        const match = filter.match(/^([^=]+)=eq\.(.*)$/);
        if (!match) return true;
        return row[decodeURIComponent(match[1])] === decodeURIComponent(match[2]);
      })
    );
  }

  applyLimit(rows, filters) {
    const limitFilter = filters.find((filter) => filter.startsWith("limit="));
    if (!limitFilter) return rows;
    return rows.slice(0, Number(limitFilter.slice("limit=".length)));
  }
}
