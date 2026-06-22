# PR168 - Staging Confirmation Store Proof

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS verifies or repairs hosted Supabase schema readiness.
Reviewer: ARGUS reviews owner scope, migration safety, and no-secret handling.
Rehearsal: ARIADNE runs hosted owner proof after ARGUS accepts the store.
Status: open for DAEDALUS

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

## Blocker Handling

If DAEDALUS cannot apply or verify the migration with available local/Supabase
MCP/database access, wake MIMIR with:

- the exact missing permission or tool;
- whether the Supabase MCP is connected but insufficient;
- whether the database URL is absent, refused, or lacks privileges;
- the safest manual dashboard steps needed;
- what validation should run immediately after MIMIR or the user fixes config.
