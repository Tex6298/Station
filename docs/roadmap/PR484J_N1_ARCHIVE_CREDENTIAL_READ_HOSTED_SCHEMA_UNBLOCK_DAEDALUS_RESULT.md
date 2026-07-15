# PR484J-N1 - Archive Credential Read Hosted Schema Unblock Result

Owner: DAEDALUS / A2

Date: 2026-07-15

Status: Ready for ARGUS hostile review

```text
READY_PR484J_N1_ARCHIVE_CREDENTIAL_READ_SCHEMA_UNBLOCK_FOR_ARGUS
```

## Scope

Applied only the two accepted hosted Supabase migrations:

```text
infra/supabase/migrations/062_archive_connector_credentials.sql
infra/supabase/migrations/063_archive_connector_scope_metadata.sql
```

No migration file was edited. No migrations `064` through `067` were applied.
No Reddit app, encryption key, OAuth exchange, provider call, credential row,
OAuth state row, source inventory, import, or product-data mutation was
created.

## Hashes

| Migration | SHA-256 |
| --- | --- |
| `062_archive_connector_credentials.sql` | `B5547424906F78FD6B24499900020851B100F9E304A202A9F6FEB9711427DAF5` |
| `063_archive_connector_scope_metadata.sql` | `92727C29AC21B3F6847131F7EE3A895428DFA7087008B7FB9A9F5F3D73330A60` |

## Preflight

Sanitized read-only preflight through existing local `SUPABASE_POOLER_URL`:

| Check | Result |
| --- | --- |
| Pooler connection | Pass |
| Database user | `postgres` |
| Ledger rows for `062`/`063` names | `0` |
| `public.archive_connector_credentials` | Absent |
| `public.archive_connector_oauth_states` | Absent |
| `public.profiles` | Present |
| `public.handle_updated_at()` | Present |
| `gen_random_uuid()` | Present |
| Existing target rows | Impossible pre-apply because both target relations were absent |

## Hosted Apply

Used a temporary `pg@8.13.1` client installed under the OS temp directory,
outside the repo. Applied both checked-in migration files in numeric order
inside one transaction, inserted one honest ledger row per migration, and sent
`NOTIFY pgrst, 'reload schema'`.

Ledger result:

| Name | Count |
| --- | --- |
| `062_archive_connector_credentials` | `1` |
| `063_archive_connector_scope_metadata` | `1` |

## Post-Apply Proof

Sanitized catalog proof:

| Check | Result |
| --- | --- |
| `archive_connector_credentials` columns | `15/15` expected |
| `archive_connector_oauth_states` columns | `13/13` expected |
| Constraints | credentials `6`, OAuth states `7` |
| Indexes | credentials primary, active partial unique, owner/provider/status; OAuth states primary, nonce unique, owner/provider, nonce/status |
| Updated-at triggers | Both present |
| RLS | Enabled on both tables |
| Owner policies | Both `auth.uid() = owner_user_id` for `ALL` plus matching `with check` |
| Row counts | credentials `0`, OAuth states `0` |
| PostgREST service-role table visibility | Both REST metadata probes returned `200` |
| Signed-out `GET /archive-connectors/credentials` | `401` |
| Replay-owner `GET /archive-connectors/credentials` | `200` |
| Replay-owner metadata shape | Top-level `providers`, two provider rows, safe status/feature booleans, no token material values |
| DAEDALUS global Archive probe | `/studio/archive` loaded with no page errors, but this route does not mount the persona Archive connector panel and therefore did not exercise the credentials request |

The submitted browser probe used the global Archive route and did not issue a
credentials request. The direct deployed API credential metadata read was the
authoritative DAEDALUS `200` route proof. ARGUS later exercised the correct
persona Archive route, `/studio/personas/:id/files`, and records that independent
UI proof in the review result rather than attributing it to this run.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:storage` | Pass, `19/19` |
| `npx --yes pnpm@10.32.1 test:conversation-archive` | Pass, `43/43` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

Temporary `pg` tooling, proof scripts, and browser harnesses were removed.
No connection string, key, password, token, cookie, raw response body, private
id, credential value, SQL row, provider payload, hosted log, screenshot, trace,
or video was committed or recorded.
