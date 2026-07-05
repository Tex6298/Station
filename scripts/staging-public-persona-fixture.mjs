#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG = "station-replay-alpha-persona";
export const ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG = "station-replay-signed-in-alpha-persona";
export const ORDINARY_PUBLIC_PERSONA_FIXTURE_NAME = "Station Replay Signed-In Alpha Persona";
export const ORDINARY_PUBLIC_PERSONA_FIXTURE_DESCRIPTION =
  "Public-safe staging persona for signed-in alpha chat boundary proof.";

const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OWNER_ELIGIBLE_TIERS = new Set(["creator", "canon", "institutional"]);
const WRITE_FLAG = "STATION_PUBLIC_PERSONA_FIXTURE_WRITE";

if (isCliEntry()) {
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : "Public persona fixture proof failed.");
    process.exitCode = 1;
  });
}

export async function runCli(args, env = process.env) {
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  loadDotEnv(".env", env);

  if (args.includes("--dry-run")) {
    const plan = publicPersonaFixturePlan(env);
    validatePublicPersonaFixturePlan(plan);
    printSummary(safeFixtureSummary({ mode: "dry-run", plan }));
    return;
  }

  const summary = await seedPublicPersonaFixture({ env });
  printSummary(summary);
}

export function publicPersonaFixturePlan(env = process.env) {
  const explicitOwnerId = value(env, "STATION_PUBLIC_PERSONA_FIXTURE_OWNER_ID") || value(env, "STATION_REPLAY_OWNER_ID");
  const ownerUsername = value(env, "STATION_PUBLIC_PERSONA_FIXTURE_OWNER_USERNAME") ||
    value(env, "STATION_REPLAY_OWNER_USERNAME") ||
    "station-replay-owner";

  return {
    fixture: {
      name: ORDINARY_PUBLIC_PERSONA_FIXTURE_NAME,
      shortDescription: ORDINARY_PUBLIC_PERSONA_FIXTURE_DESCRIPTION,
      publicSlug: ORDINARY_PUBLIC_PERSONA_FIXTURE_SLUG,
      visibility: "public",
      provider: "platform",
      publicChatEnabled: true,
    },
    ownerSelector: explicitOwnerId
      ? { kind: "configured_owner_id", value: explicitOwnerId }
      : { kind: "username", value: ownerUsername },
    expected: {
      publicPersonaChatMode: "signed_in_alpha",
      signedOutAnonymousChatCode: "public_persona_auth_required",
      replayAnonymousSlug: REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG,
    },
  };
}

export function validatePublicPersonaFixturePlan(plan) {
  requireObject(plan, "plan");
  requireObject(plan.fixture, "plan.fixture");
  requireString(plan.fixture.name, "plan.fixture.name");
  requireString(plan.fixture.shortDescription, "plan.fixture.shortDescription");
  requireString(plan.fixture.publicSlug, "plan.fixture.publicSlug");

  if (!isSafePublicPersonaSlug(plan.fixture.publicSlug)) {
    throw new Error("Fixture public slug must be a safe non-UUID public slug.");
  }
  if (plan.fixture.publicSlug === REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG) {
    throw new Error("Fixture public slug must not be the replay anonymous alpha slug.");
  }
  if (plan.fixture.visibility !== "public") {
    throw new Error("Fixture visibility must be public.");
  }
  if (plan.fixture.provider !== "platform") {
    throw new Error("Fixture provider must be platform.");
  }
  if (plan.fixture.publicChatEnabled !== true) {
    throw new Error("Fixture public chat must be enabled to prove signed-in alpha behavior.");
  }
  if (publicPersonaFixtureChatMode(plan.fixture.publicSlug) !== "signed_in_alpha") {
    throw new Error("Fixture must resolve to signed_in_alpha.");
  }
  if (publicPersonaFixtureChatMode(REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG) !== "anonymous_alpha") {
    throw new Error("Replay alpha slug must remain anonymous_alpha.");
  }

  requireObject(plan.ownerSelector, "plan.ownerSelector");
  if (!["configured_owner_id", "username"].includes(plan.ownerSelector.kind)) {
    throw new Error("Fixture owner selector must be configured_owner_id or username.");
  }
  requireString(plan.ownerSelector.value, "plan.ownerSelector.value");

  return true;
}

export function publicPersonaFixtureChatMode(publicSlug) {
  return publicSlug === REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG
    ? "anonymous_alpha"
    : "signed_in_alpha";
}

export function safeFixtureSummary({ mode, plan, counts = {}, persisted = null }) {
  validatePublicPersonaFixturePlan(plan);
  const fixture = plan.fixture;
  const seeded = mode === "seeded";

  return {
    ok: true,
    mode,
    fixture: {
      name: fixture.name,
      shortDescription: fixture.shortDescription,
      publicSlug: fixture.publicSlug,
      visibility: fixture.visibility,
      provider: fixture.provider,
      publicChatEnabled: fixture.publicChatEnabled,
    },
    expected: {
      publicPersonaChatMode: publicPersonaFixtureChatMode(fixture.publicSlug),
      signedOutAnonymousChatCode: plan.expected.signedOutAnonymousChatCode,
      replayAnonymousSlug: plan.expected.replayAnonymousSlug,
      replayAnonymousMode: publicPersonaFixtureChatMode(plan.expected.replayAnonymousSlug),
    },
    safeguards: {
      safePublicSlug: isSafePublicPersonaSlug(fixture.publicSlug),
      nonReplaySlug: fixture.publicSlug !== REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG,
      publicSafeFieldsOnly: true,
      ownerSelectorConfigured: Boolean(plan.ownerSelector.value),
      hostedWriteRequiresExplicitFlag: true,
      hostedWriteUsed: seeded,
      slugConflictPolicy: "same_owner_only",
    },
    counts: {
      plannedPublicPersonas: 1,
      publicPersonas: counts.publicPersonas ?? (seeded ? 1 : undefined),
    },
    persisted: persisted
      ? {
          fixtureUpserted: Boolean(persisted.fixtureUpserted),
          ownerEligible: Boolean(persisted.ownerEligible),
        }
      : undefined,
  };
}

export async function seedPublicPersonaFixture({ env = process.env, api = null } = {}) {
  const plan = publicPersonaFixturePlan(env);
  validatePublicPersonaFixturePlan(plan);

  if (value(env, WRITE_FLAG) !== "1") {
    throw new Error(`Set ${WRITE_FLAG}=1 to write the staging public persona fixture.`);
  }

  const client = api ?? createSupabaseRest(
    requiredEnv(env, "SUPABASE_URL"),
    requiredEnv(env, "SUPABASE_SERVICE_ROLE_KEY")
  );
  const owner = await findFixtureOwner(client, plan.ownerSelector);
  if (!owner) {
    throw new Error("Fixture owner profile was not found. Seed or configure the non-production proof owner first.");
  }
  if (!ownerEligibleForPublicPersona(owner)) {
    throw new Error("Fixture owner profile is not eligible for public persona exposure.");
  }

  const existingBySlug = await first(await client.select("personas", [
    eq("public_slug", plan.fixture.publicSlug),
    limit(1),
  ]));
  if (existingBySlug && existingBySlug.owner_user_id !== owner.id) {
    throw new Error("Fixture public slug is already owned by a different profile.");
  }

  const existingByName = await first(await client.select("personas", [
    eq("owner_user_id", owner.id),
    eq("name", plan.fixture.name),
    limit(1),
  ]));
  const existing = existingBySlug ?? existingByName;
  const payload = {
    owner_user_id: owner.id,
    name: plan.fixture.name,
    short_description: plan.fixture.shortDescription,
    long_description: null,
    visibility: "public",
    public_slug: plan.fixture.publicSlug,
    public_chat_enabled: true,
    provider: "platform",
    awakening_prompt: null,
    style_notes: null,
    sort_order: 2,
  };

  const row = existing
    ? await client.patch("personas", [eq("id", existing.id), eq("owner_user_id", owner.id)], payload)
    : await client.insert("personas", payload);
  verifyFixtureRow(row, plan);

  return safeFixtureSummary({
    mode: "seeded",
    plan,
    counts: { publicPersonas: 1 },
    persisted: {
      fixtureUpserted: true,
      ownerEligible: true,
    },
  });
}

export function verifyFixtureRow(row, plan = publicPersonaFixturePlan()) {
  requireObject(row, "fixture row");
  if (row.public_slug !== plan.fixture.publicSlug) {
    throw new Error("Fixture row did not keep the expected public slug.");
  }
  if (row.public_slug === REPLAY_ANONYMOUS_PUBLIC_PERSONA_SLUG) {
    throw new Error("Fixture row must not use the replay anonymous alpha slug.");
  }
  if (row.visibility !== "public") {
    throw new Error("Fixture row must remain public.");
  }
  if (row.public_chat_enabled !== true) {
    throw new Error("Fixture row must keep public chat enabled for signed-in alpha proof.");
  }
  if (publicPersonaFixtureChatMode(row.public_slug) !== "signed_in_alpha") {
    throw new Error("Fixture row must resolve to signed_in_alpha.");
  }
  if (row.long_description != null || row.awakening_prompt != null || row.style_notes != null) {
    throw new Error("Fixture row must not persist private profile, prompt, or style fields.");
  }

  return true;
}

export function assertSafeFixtureSummary(summary) {
  const text = JSON.stringify(summary);
  const unsafePatterns = [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    /sk-|Bearer|eyJ|ghp_|x-amz-|auth[_ -]?header|cookie|user agent|IP address|provider payload|prompt body|completion|raw row|raw config|model:/i,
  ];
  const unsafe = unsafePatterns.find((pattern) => pattern.test(text));
  if (unsafe) {
    throw new Error("Fixture summary printed unsafe proof output.");
  }
  return true;
}

function printHelp() {
  console.log([
    "Usage:",
    "  node scripts/staging-public-persona-fixture.mjs --dry-run",
    "  STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1 node scripts/staging-public-persona-fixture.mjs",
    "",
    "Required for hosted writes:",
    "  SUPABASE_URL",
    "  SUPABASE_SERVICE_ROLE_KEY",
    "  STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1",
    "",
    "Optional owner selector for hosted writes:",
    "  STATION_PUBLIC_PERSONA_FIXTURE_OWNER_USERNAME",
    "  STATION_PUBLIC_PERSONA_FIXTURE_OWNER_ID",
    "  STATION_REPLAY_OWNER_USERNAME",
    "  STATION_REPLAY_OWNER_ID",
    "",
    "The script prints only safe public fixture labels, public slugs, booleans, counts, and pass/fail states.",
  ].join("\n"));
}

function printSummary(summary) {
  assertSafeFixtureSummary(summary);
  console.log(JSON.stringify(summary, null, 2));
}

function loadDotEnv(path, env) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    if (env[key] != null) continue;
    env[key] = stripEnvQuotes(match[2].trim());
  }
}

function stripEnvQuotes(current) {
  if (
    (current.startsWith('"') && current.endsWith('"')) ||
    (current.startsWith("'") && current.endsWith("'"))
  ) {
    return current.slice(1, -1);
  }
  return current;
}

function createSupabaseRest(supabaseUrl, serviceRoleKey) {
  const baseUrl = supabaseUrl.replace(/\/+$/g, "");
  const headers = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
  };

  return {
    async select(table, filters = [], select = "*") {
      const query = [`select=${encodeURIComponent(select)}`, ...filters].join("&");
      return request(`${baseUrl}/rest/v1/${table}?${query}`, {
        method: "GET",
        headers,
      });
    },
    async insert(table, body) {
      const response = await request(`${baseUrl}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json", prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      return Array.isArray(response) ? response[0] : response;
    },
    async patch(table, filters, body) {
      const response = await request(`${baseUrl}/rest/v1/${table}?${filters.join("&")}`, {
        method: "PATCH",
        headers: { ...headers, "content-type": "application/json", prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      return Array.isArray(response) ? response[0] : response;
    },
  };
}

async function request(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = typeof body?.message === "string" ? body.message : `HTTP ${response.status}`;
    throw new Error(`Supabase request failed: ${message}`);
  }
  return body;
}

async function findFixtureOwner(api, ownerSelector) {
  const filter = ownerSelector.kind === "configured_owner_id"
    ? eq("id", ownerSelector.value)
    : eq("username", ownerSelector.value);
  return first(await api.select("profiles", [filter, limit(1)], "id, username, tier, is_admin"));
}

function ownerEligibleForPublicPersona(owner) {
  return owner?.is_admin === true || OWNER_ELIGIBLE_TIERS.has(owner?.tier);
}

function requiredEnv(env, name) {
  const current = value(env, name);
  if (!current) throw new Error(`Missing required env: ${name}`);
  return current;
}

function value(env, name) {
  const current = env[name];
  return typeof current === "string" && current.trim().length > 0 ? current.trim() : "";
}

function eq(column, current) {
  return `${encodeURIComponent(column)}=eq.${encodeURIComponent(current)}`;
}

function limit(count) {
  return `limit=${count}`;
}

function first(rows) {
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function isSafePublicPersonaSlug(value) {
  return Boolean(
    value &&
    PUBLIC_PERSONA_SLUG_PATTERN.test(value) &&
    !UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(value)
  );
}

function requireObject(current, label) {
  if (!current || typeof current !== "object" || Array.isArray(current)) {
    throw new Error(`${label} must be an object.`);
  }
}

function requireString(current, label) {
  if (typeof current !== "string" || current.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function isCliEntry() {
  return import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
}
