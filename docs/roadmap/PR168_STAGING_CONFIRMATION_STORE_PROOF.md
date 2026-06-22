# PR168 - Staging Confirmation Store Proof

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS verifies or repairs hosted Supabase schema readiness.
Reviewer: ARGUS reviews owner scope, migration safety, and no-secret handling.
Rehearsal: ARIADNE runs hosted owner proof after ARGUS accepts the store.
Status: accepted by ARGUS; awaiting ARIADNE hosted browser proof

## Why This Lane

PR167 proved the hosted Developer Agent panel can survive a missing confirmation
store by showing an honest setup-unavailable state. That fallback is accepted,
but Phase 2D still needs durable owner confirmation records on hosted staging.

This lane proves the hosted Supabase database has the PR165 confirmation table,
RLS, indexes, and schema cache required by the app.

## Scope

DAEDALUS should:

- inspect hosted/staging Supabase safely without printing secrets;
- verify whether `infra/supabase/migrations/049_developer_space_agent_confirmations.sql`
  has actually been applied to the target database;
- if the migration is missing and available credentials/tools permit it, apply
  only that required schema change through the normal migration path or a
  clearly recorded equivalent SQL deployment;
- reload PostgREST schema cache after schema repair, if direct SQL is used;
- prove the hosted API no longer reports
  `developer_space_agent_confirmation_store_unavailable`;
- rerun the focused route tests that cover confirmation list/create/approve/
  cancel and owner scoping;
- wake ARGUS with the exact migration truth, commands used, and validation.

ARGUS should review:

- owner/admin authorization before any confirmation-store information is
  returned;
- RLS policies for `developer_space_agent_confirmations`;
- that direct SQL, if used, did not fake migration history or broaden schema
  beyond PR165;
- that no secrets, raw cookies, tokens, provider payloads, preview hashes, raw
  prompt bodies, or private owner content were printed or committed.

After ARGUS acceptance, ARIADNE should rehearse hosted staging as replay owner:

- load `/developer-spaces/:slug/manage`;
- confirm the Developer Agent panel no longer shows setup-unavailable state;
- create one synthetic future-action confirmation;
- approve one pending confirmation and verify `executionAvailable: false`;
- cancel one pending confirmation if practical;
- verify approved/cancelled/expired records are not actionable;
- verify no execution/mutating agent action occurs;
- scan visible UI for raw IDs and secret-shaped strings;
- check desktop and 390px mobile.

## Non-Scope

- No model chat loop, autonomous execution, freeform parser, or live agent tool
  execution.
- No broad migration sweep.
- No public page, document, layout, billing, provider, Redis, Cloudflare,
  archive import, export, webhook, observed-runtime, deployment architecture,
  or unrelated Supabase work.
- No credential rotation, secret printing, or environment inventory dumping.
- No noisy hosted data batches; use bounded synthetic confirmation records only.

## Acceptance

PR168 is accepted when:

- hosted Supabase exposes the confirmation store to the deployed API;
- confirmation list/create/approve/cancel work on hosted staging for the owner;
- non-owner access remains denied before setup metadata or records leak;
- approval remains non-executing;
- the hosted UI shows durable confirmation records rather than setup-unavailable
  fallback copy;
- ARIADNE records desktop/mobile proof with no secret or raw-ID exposure.

## DAEDALUS Proof - 2026-06-22

DAEDALUS verified the hosted Supabase staging target and applied only the PR165
confirmation-store migration.

Pre-apply truth:

- Tool discovery exposed no callable Supabase MCP query tool in this shell.
- Local `.env` contained the needed Supabase REST/service-role and pooler paths;
  values were not printed.
- Service-role PostgREST returned HTTP `404` / `PGRST205` for
  `developer_space_agent_confirmations`.
- The pooler confirmed the relation was missing.

Apply path:

- Installed `pg@8.13.1` under the OS temp directory, outside the repo.
- Applied only
  `infra/supabase/migrations/049_developer_space_agent_confirmations.sql`
  through `SUPABASE_POOLER_URL`.
- Recorded migration history row
  `20260622074200 / 049_developer_space_agent_confirmations`.
- Requested PostgREST schema reload with `NOTIFY pgrst, 'reload schema'`.

Post-apply proof:

- Table exists: true.
- `developer_space_agent_confirmations_space_status_idx`: true.
- `developer_space_agent_confirmations_owner_idx`: true.
- RLS enabled: true.
- Owner policy count: `1`.
- Column count: `14`.
- Service-role PostgREST returned HTTP `200` for
  `/rest/v1/developer_space_agent_confirmations?select=id,status&limit=1`.

Hosted API smoke:

- Target host: `stationapi-production.up.railway.app`.
- Run label: `c7ba671c89`.
- Created synthetic owner and non-owner beta users; printed only hashed
  identifiers.
- Temporarily set the synthetic owner profile to `canon`.
- Created one private Developer Space: HTTP `201`.
- Owner confirmation list: HTTP `200`, setup available, count `0`.
- Non-owner confirmation list: HTTP `403`.
- Created one `publish_to_page` confirmation: HTTP `201`,
  `executionAvailable: false`.
- Approved it: HTTP `200`, `executionAvailable: false`.
- Created and cancelled one `rotate_ingestion_key` confirmation: HTTP `201`
  then `200`, `executionAvailable: false`.
- Final owner list: HTTP `200`, setup available, count `2`, statuses
  `approved` and `cancelled`.
- The hosted API did not return
  `developer_space_agent_confirmation_store_unavailable`.
- Synthetic auth-user cleanup was attempted for both users; follow-up
  service-role readback for the synthetic Space slug returned `0` rows.

Local validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 34
  tests.

Next baton:

- ARGUS should review migration safety, RLS/owner scope, ledger handling,
  no-secret handling, and the hosted API smoke.
- If accepted, ARGUS should wake ARIADNE for the desktop/mobile browser proof.

## ARGUS Review - 2026-06-22

ARGUS accepts the staging confirmation-store proof and wakes ARIADNE for hosted
browser rehearsal.

Findings:

- Accepted: before repair, hosted Supabase was missing
  `developer_space_agent_confirmations`; both service-role PostgREST and the
  pooler proved the missing relation without printing credential values.
- Accepted: DAEDALUS applied only migration `049` through the pooler and
  recorded migration history row
  `20260622074200 / 049_developer_space_agent_confirmations`.
- Accepted: PostgREST schema reload was requested after the direct SQL repair.
- Accepted: post-apply proof matches the PR165 schema/RLS contract: table
  exists, both expected indexes exist, RLS is enabled, owner policy count is
  `1`, and column count is `14`.
- Accepted: hosted API smoke proved owner create/list/approve/cancel with
  `executionAvailable: false`, non-owner list denial with HTTP `403`, final
  approved/cancelled records, and no unavailable-store fallback code.
- Accepted: the smoke used bounded synthetic users and confirmation records.
  Cleanup was attempted, and the synthetic Space slug readback returned `0`
  rows afterward.
- Accepted: no Supabase URL, service-role key, pooler URL, auth token, cookie,
  password, raw user id, raw Space id, confirmation id, preview hash, raw prompt
  body, provider payload, or private owner content was printed or committed.
- No non-scope work was added: no model chat, autonomous execution, freeform
  parser, live agent tool execution, broad migration sweep, public page,
  document, layout, billing, provider, Redis, Cloudflare, archive import,
  export, webhook, observed-runtime, deployment architecture, or unrelated
  Supabase work.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 34
  tests.
- `git diff --check` passed with CRLF normalization warnings only.
- Added proof text secret/raw-id scan found no secret-shaped values or raw
  UUID-shaped ids.

Recommendation: ARIADNE should run the hosted desktop/mobile owner proof,
including one bounded synthetic create, approve, and cancel flow, plus visible
raw-ID/secret-shaped string scanning.

## Blocker Handling

If DAEDALUS cannot apply or verify the migration with available local/Supabase
MCP/database access, wake MIMIR with:

- the exact missing permission or tool;
- whether the Supabase MCP is connected but insufficient;
- whether the database URL is absent, refused, or lacks privileges;
- the safest manual dashboard steps needed;
- what validation should run immediately after MIMIR or the user fixes config.
