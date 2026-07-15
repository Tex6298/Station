# PR484J-N1 - Archive Credential Read Hosted Schema Unblock

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - exact accepted migration apply and metadata-read proof

## Purpose

ARIADNE's PR527E navigation rehearsal reached the correct owner Archive route,
but its existing `GET /archive-connectors/credentials` returned one bounded
hosted `500`. MIMIR's sanitized service-role read now pins the cause:

```text
public.archive_connector_credentials -> PGRST205 / absent from schema cache
public.archive_connector_oauth_states -> PGRST205 / absent from schema cache
```

The same normal read probe also found the later archive intent, source staging,
and import job tables absent. This lane does not activate that wider chain.

Apply only the two already accepted migrations required for safe empty
credential metadata readback:

```text
infra/supabase/migrations/062_archive_connector_credentials.sql
SHA-256 B5547424906F78FD6B24499900020851B100F9E304A202A9F6FEB9711427DAF5

infra/supabase/migrations/063_archive_connector_scope_metadata.sql
SHA-256 92727C29AC21B3F6847131F7EE3A895428DFA7087008B7FB9A9F5F3D73330A60
```

No Reddit app, encryption key, OAuth exchange, provider call, credential row,
source inventory, import, or product-data mutation is needed for the empty
owner metadata read to return safely.

## Read-Only Preflight

Before any hosted write, prove without exposing values:

- Railway web/API are healthy, ready, on the same `main` SHA containing the
  accepted Archive route and storage implementation;
- both checked-in files match the hashes above and have zero drift;
- the migration ledger has zero rows for names
  `062_archive_connector_credentials` and
  `063_archive_connector_scope_metadata`;
- the two target tables are absent, not merely inaccessible to the owner;
- `public.profiles`, `public.handle_updated_at()`, UUID generation, the
  migration owner context, and the transaction connection are ready; and
- no existing Archive credential or OAuth row can be overwritten because the
  target relations do not yet exist.

Stop and wake MIMIR on any contradictory schema, ledger, hash, target, or
ownership evidence. Do not improvise a repair SQL statement.

## Hosted Apply

Using the configured hosted database connection, apply the exact checked-in
bytes in numeric order inside one atomic transaction. Record one honest,
collision-free row per migration in
`supabase_migrations.schema_migrations`, using the exact migration names above.
Request a PostgREST schema reload inside the same controlled operation.

If any statement, catalog postcheck, or ledger insertion fails, roll back the
whole operation. Do not leave one migration applied without the other.

Do not edit either migration file. Do not apply migrations `064` through
`067`, set config, create credentials, start OAuth, or invoke a connector.

## Post-Apply Proof

Prove, without recording secrets or private ids:

1. Each exact migration ledger name has one row.
2. Both tables, all accepted columns, checks, indexes, updated-at triggers,
   foreign keys, RLS enablement, and owner policies match migrations `062` and
   `063`.
3. A normal service-role metadata query no longer returns `PGRST205`.
4. Signed-out `GET /archive-connectors/credentials` remains `401`.
5. The existing replay owner receives `200` from the same GET with only the
   accepted provider-safe disconnected metadata shape and no secret material.
6. Loading the existing owner Archive page produces no credentials-read `500`
   and retains its truthful setup/config-disabled state.
7. Credential/OAuth row counts remain zero before and after this lane.
8. No provider request, OAuth state, encrypted credential, source intent,
   staging run, import job, or other hosted product write occurs.

Run the relevant local route/storage/owner-flow tests plus API and web
typecheck. The hosted proof may authenticate the existing replay owner only;
it must not mutate that account or Archive data.

## Result And Handoff

Create:

`docs/roadmap/PR484J_N1_ARCHIVE_CREDENTIAL_READ_HOSTED_SCHEMA_UNBLOCK_DAEDALUS_RESULT.md`

Record deployment ancestry, preflight truth, both hashes, atomic apply/ledger
truth, catalog/RLS/policy proof, signed-out and owner GET outcomes, Archive UI
read outcome, zero row/product/provider mutation, local validation, and
artifact cleanup. Never record URLs, connection strings, tokens, cookies,
credentials, private ids, raw bodies, or environment values.

Allowed committed paths for the two-task handoff:

```text
apps/web/app/globals.css
apps/web/lib/public-persona-route.test.ts
docs/roadmap/PR527E1_PERSONA_PROFILE_PLACEHOLDER_CONTRAST_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/PR484J_N1_ARCHIVE_CREDENTIAL_READ_HOSTED_SCHEMA_UNBLOCK_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

After both assigned tasks pass, commit and push, then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR527E1's route-scoped placeholder contrast repair and PR484J-N1's exact hosted 062/063 schema/read unblock.
Task:
- Hostile-review both bounded results, rerun the local/rendered gates, independently verify hosted ledger/catalog/read truth without product writes, and wake MIMIR with the verdict.
- Do not widen into OAuth, connector configuration, imports, broader Profile work, or Settings.
```

