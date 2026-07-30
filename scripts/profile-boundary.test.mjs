import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const MIGRATION_PATH = resolve(
  "infra/supabase/migrations/091_profiles_private_column_authority_boundary.sql"
);
const migration = readFileSync(MIGRATION_PATH, "utf8");
const sql = migration.replace(/--[^\r\n]*/g, "");

const DEPENDENT_POLICY_HASH_COUNTS = {
  "5ee3592bf3116019f1b4f530f3c5a7c1": 2,
  "6763043a8f0689c0b710209ad8ef6981": 4,
  "bacc12d3c4c1bb04c9a1062d355b1d3c": 4,
  "3769ea7fdc4ce5008d3d4d24f16d77a4": 4,
  "41e21f83d7b4f0f8b3ce6a62dd9d3a1a": 2,
  "479e5e2d5fbc919a1748abdc7267d637": 2,
  "bddb9c585a8b23739adc6bf3be95e45e": 2,
  "24c3461ab95960459b87740f77d3ec57": 2,
};

const DEPENDENT_POLICY_NAMES = [
  "comments_select_community_threads",
  "community_moderation_actions_admin_insert",
  "community_moderation_actions_select_admin",
  "community_subcommunities_admin_all",
  "community_subcommunity_moderators_owner_admin_select",
  "community_subcommunity_moderators_owner_admin_write",
  "community_profiles_admin_insert",
  "community_profiles_admin_update",
  "documents_select_community",
  "reports_all_admin",
  "threads_select_community",
];

const PROFILE_COLUMNS = [
  "id",
  "username",
  "display_name",
  "bio",
  "avatar_url",
  "tier",
  "stripe_customer_id",
  "stripe_subscription_id",
  "subscription_status",
  "byok_openai_key",
  "byok_anthropic_key",
  "byok_deepseek_key",
  "ai_mode",
  "is_admin",
  "created_at",
  "updated_at",
];

test("migration 091 fails closed on the inherited profile contract", () => {
  assert.match(sql, /^\s*begin;/i);
  assert.match(
    sql,
    /pg_advisory_xact_lock\(\s*hashtextextended\('station\.pr535a\.profiles_private_column_authority_boundary\.091', 0\)\s*\)/i
  );
  assert.match(sql, /lock table public\.profiles in share row exclusive mode;/i);
  assert.match(sql, /expected_columns[\s\S]*\(16, 'updated_at', 'timestamptz'::regtype::oid, true\)/i);
  assert.match(sql, /relation\.relrowsecurity[\s\S]*not relation\.relforcerowsecurity/i);
  assert.match(sql, /policy_row\.policyname = 'profiles_select_public'[\s\S]*eb28d87532d6edd9b635727493ef89f7/i);
  assert.match(sql, /policy_row\.policyname = 'profiles_update_own'[\s\S]*cc00666ac5d81806b4129769e28761f3/i);
  assert.match(sql, /actual_table_grants is distinct from expected_table_grants/i);
  assert.match(sql, /actual_column_grants is distinct from expected_column_grants/i);

  for (const [hash, count] of Object.entries(DEPENDENT_POLICY_HASH_COUNTS)) {
    assert.equal(countOccurrences(sql, hash), count, `expected complete pre/post assertions for ${hash}`);
  }
  for (const policyName of DEPENDENT_POLICY_NAMES) {
    assert.equal(countOccurrences(sql, `\"${policyName}\"`), 2, `expected pre/post assertion for ${policyName}`);
  }
});

test("migration 091 leaves browser roles only own-row authority projection", () => {
  assert.match(sql, /drop policy profiles_select_public on public\.profiles;/i);
  assert.match(sql, /drop policy profiles_update_own on public\.profiles;/i);
  assert.match(
    sql,
    /revoke all privileges on table public\.profiles from public, anon, authenticated;/i
  );
  assert.match(
    sql,
    /revoke all privileges \([\s\S]*byok_openai_key[\s\S]*is_admin[\s\S]*\) on table public\.profiles from public, anon, authenticated;/i
  );
  const revokeColumns = sql.match(
    /revoke all privileges \(([\s\S]*?)\) on table public\.profiles from public, anon, authenticated;/i
  )?.[1] ?? "";
  assert.deepEqual(
    revokeColumns.split(",").map((column) => column.trim()),
    PROFILE_COLUMNS
  );
  assert.match(
    sql,
    /create policy profiles_select_own_authority[\s\S]*for select[\s\S]*to anon, authenticated[\s\S]*using \(auth\.uid\(\) = id\);/i
  );
  assert.match(
    sql,
    /grant select \(id, tier, is_admin\)[\s\S]*on table public\.profiles[\s\S]*to anon, authenticated;/i
  );
  assert.equal((sql.match(/create policy\s+/gi) ?? []).length, 1);
  assert.doesNotMatch(sql, /grant\s+(?:insert|update|delete)[\s\S]*to\s+(?:anon|authenticated)/i);
  assert.match(sql, /expected exactly one profiles policy after repair/i);
  assert.match(sql, /browser profile projection or mutation boundary is not exact/i);
});

test("migration 091 preserves trusted service access and rewrites no profile data", () => {
  assert.match(
    sql,
    /grant select, insert, update, delete[\s\S]*on table public\.profiles[\s\S]*to service_role;/i
  );
  assert.doesNotMatch(sql, /insert\s+into\s+public\.profiles/i);
  assert.doesNotMatch(sql, /update\s+public\.profiles\s+set/i);
  assert.doesNotMatch(sql, /delete\s+from\s+public\.profiles/i);
  assert.doesNotMatch(sql, /alter\s+table\s+public\.profiles\s+(?:add|drop|alter)\s+column/i);
  assert.doesNotMatch(sql, /insert\s+into\s+.*schema_migrations/i);
  assert.match(sql, /notify pgrst, 'reload schema';\s*commit;\s*$/i);
});

test("profile-facing product paths remain service-owned", () => {
  const supabaseSource = readFileSync(resolve("apps/api/src/lib/supabase.ts"), "utf8");
  assert.match(supabaseSource, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(supabaseSource, /export function getSupabaseAdmin\(\)/);

  for (const path of [
    "apps/api/src/services/auth.service.ts",
    "apps/api/src/services/billing.service.ts",
    "apps/api/src/routes/settings.ts",
    "apps/api/src/routes/projects.ts",
    "apps/api/src/routes/discover.ts",
    "apps/api/src/routes/forums.ts",
  ]) {
    const source = readFileSync(resolve(path), "utf8");
    assert.match(source, /getSupabaseAdmin/, `${path} must keep service-owned database access`);
  }

  const webSource = sourceFiles(resolve("apps/web"))
    .filter((path) => !/\.test\.[cm]?[jt]sx?$/.test(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  assert.doesNotMatch(webSource, /\.from\(\s*["']profiles["']\s*\)/);
});

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    if (name === "node_modules" || name === ".next") return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(name) ? [path] : [];
  });
}
