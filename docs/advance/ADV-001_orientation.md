# ADV-001 - Advance Team Orientation And First Packet

Date: 2026-06-25

Owner: A5 / KVASIR

Status: complete for MIMIR review

## Advance Rules Confirmed

KVASIR treats the advance team as a subordinate prep lane, not a second
mainline. ADV packets can prepare maps, audits, fixture plans, adapter sketches,
test sketches, and isolated prototypes that MIMIR may later promote. They do
not assign PR numbers, change acceptance bars, mutate deployed behavior, touch
active PR files, apply migrations, alter package scripts, or wake A1-A4 agents
without MIMIR direction.

ADV code is allowed only when isolated and unwired. The default safe output is
docs, inventories, dry-run-only fixtures, or proof files that do not affect
runtime behavior.

## Bootstrap And Collision Check

Bootstrap is complete enough to proceed:

- A5-A8 state files exist under `.station-agents/state`.
- A5-A8 inboxes exist under `.station-agents/inbox`.
- `advance:watch:kvasir`, `advance:watch:seshat`,
  `advance:watch:janus`, `advance:watch:cassandra`, and `advance:status`
  exist in `package.json`.
- `docs/ops/triad/ADVANCE_TEAM.md` records the live advisory boundary.

Current mainline truth inspected:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/PR310_MEMORY_READBACK_RERUN_AFTER_NAV_REPAIR_ARIADNE.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/STATION_PR_PLAN_V3.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`

Active collision boundary:

- ARIADNE owns active PR310, a hosted/browser Memory readback rerun after the
  persona workspace navigation repair.
- ADV-001 must not edit PR310, active Memory route code, active Studio route
  behavior, acceptance bars, deployment checks, or ARIADNE result docs.
- The working tree already had `.station-agents/state/MIMIR.json` modified.
  ADV-001 did not edit it.

## Candidate Lane A - Tier 1 Developer Space Partner Pack

Purpose:

- Prepare a clean partner-readiness packet for self-hosted Developer Space
  Tier 1 integrations: ingestion docs, fixture expectations, no-secret
  troubleshooting shapes, and owner-console readiness checks.

Why it is safe now:

- It is separate from active PR310 Memory/browser rehearsal work.
- Existing integration docs and client examples already exist, so prep can stay
  docs-only or fixture-plan-only.
- No route, migration, package script, runtime ingestion behavior, billing,
  queue, deploy, provider, or public visibility behavior needs to change.

Possible ADV outputs:

- Partner pack inventory and gap map.
- Sanitized smoke transcript template using placeholders only.
- Fixture checklist for node, event, snapshot, batch import, observed-runtime
  webhook, quota, rate-limit, validation, and auth-error cases.
- Draft promotion packet for a later mainline docs or visible-readback lane.

Advance agents to help if MIMIR approves:

- SESHAT: inventory current docs, examples, API shapes, and test coverage.
- JANUS: preflight public/private, key, signing, quota, and field visibility
  boundaries.
- CASSANDRA: forecast partner confusion around Tier 1 versus Tier 2 claims.

Files and docs to inspect:

- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/integration/developer-space-tier1-partner-onboarding.md`
- `docs/integration/intelhub-to-station-developer-spaces.md`
- `packages/developer-space-client/README.md`
- `packages/developer-space-client/examples/node-ingest.ts`
- `packages/developer-space-client/examples/observed-runtime-webhook.ts`
- `packages/developer-space-client/examples/agents-observe-offline-dry-run.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `packages/developer-space-client/src/index.test.ts`

Risks and conflicts:

- Partner docs can overclaim Tier 2 hosting, background jobs, repo push,
  destructive developer-agent tools, billing, or tipping if not gated.
- Examples can accidentally encourage raw key, signature, payload, log, prompt,
  provider, source-body, or private id sharing.
- Public page language could imply private observatory fields are public.

Promotion criteria for MIMIR:

- MIMIR sees a bounded docs/test-fixture lane that improves partner onboarding
  without changing runtime behavior.
- JANUS has a checklist for key/signing/privacy boundaries.
- The packet states exact touched files and validation commands before any
  mainline PR opens.
- If visible pages change later, ARIADNE receives a separate rehearsal packet.

## Candidate Lane B - Background Job Status Readback Plan

Purpose:

- Prepare a future owner-visible status/readback plan for the job kinds already
  named by the background jobs foundation, without enabling workers.

Why it is safe now:

- The current foundation explicitly has no broad worker execution platform.
- ADV work can stay as a status contract and fixture matrix.
- It does not overlap active PR310 route rehearsal.

Possible ADV outputs:

- Job-kind status matrix for archive extraction, export assembly, embedding
  backfill, memory consolidation, replay seed setup, and Developer Space import
  batch.
- Owner-visible failure metadata fixture plan.
- Idempotency and retry caveat checklist.

Advance agents to help if MIMIR approves:

- SESHAT: map current durable status stores and owner readback routes.
- JANUS: preflight idempotency, ownership, retries, and payload minimization.
- CASSANDRA: forecast worker/queue failure modes before a live execution lane.

Files and docs to inspect:

- `docs/architecture/background-jobs-foundation.md`
- `apps/api/src/services/background-jobs.service.ts`
- `apps/api/src/routes/background-jobs.test.ts`
- `apps/api/src/routes/exports.test.ts`
- `apps/api/src/services/file-import-jobs.service.ts`

Risks and conflicts:

- A plan could accidentally sound like approval to add workers, queues,
  Redis-backed execution, Cloudflare queues, or background mutation.
- Memory consolidation and replay setup are adjacent to Memory work; keep any
  implementation promotion away from PR310 until MIMIR sequences it.

Promotion criteria for MIMIR:

- The packet proves which job kinds have current owner readback and which need
  status routes before execution.
- No worker, queue, Redis, Cloudflare, migration, or runtime activation is
  required by the first promoted lane.
- Validation can be scoped to existing focused tests.

## Candidate Lane C - Cloudflare Retrieval Adapter Gate Packet

Purpose:

- Prepare a future privacy and reauthorization gate for a Cloudflare/Vectorize
  retrieval adapter or index mirror before any live remote retrieval opens.

Why it is safe now:

- Current architecture says the Cloudflare adapter is disabled and pending.
- ADV work can stay as a decision packet and test-sketch inventory.
- It can avoid active PR310 by not touching Memory selection, retrieval code,
  provider config, or runtime context behavior.

Possible ADV outputs:

- Remote-candidate response sketch with ID/minimal metadata only.
- Reauthorization test checklist.
- Delete/export/reindex/stale-index risk matrix.

Advance agents to help if MIMIR approves:

- JANUS: primary owner for authorization, deletion, export, and privacy gates.
- SESHAT: inventory adapter code, architecture docs, and retrieval tests.
- CASSANDRA: forecast stale-index and cross-provider failure cases.

Files and docs to inspect:

- `docs/architecture/cloudflare-retrieval-adapter.md`
- `packages/ai/src/retrieval/cloudflare-adapter.ts`
- `packages/ai/test/cloudflare-adapter.test.ts`
- `docs/architecture/retrieval-provider-metadata.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`

Risks and conflicts:

- Retrieval/Memory language is close to the active Memory evidence lane.
- Any live adapter, provider, embedding, index, package script, env, or deploy
  change would exceed ADV scope.
- Mirrored metadata can become a privacy leak if not minimized.

Promotion criteria for MIMIR:

- MIMIR explicitly chooses a live adapter or test-only mainline lane.
- ARGUS/JANUS gates define owner reauthorization, deletion, export, reindex,
  and stale-index behavior before code is wired.
- The first implementation remains disabled-safe unless separately promoted.

## Recommended First ADV Focus

Recommend exactly one first focus: Candidate Lane A, the Tier 1 Developer Space
Partner Pack.

Reason:

- It is the farthest from active PR310 Memory rehearsal.
- It can produce useful artifacts without touching product behavior.
- It supports a known protected-alpha future lane with clear public/private
  safety gates.
- Existing docs and examples make the work immediately checkable.

## Concrete Artifact - Partner Pack Mini-Inventory

Current useful pieces:

- `docs/integration/developer-space-tier1-partner-onboarding.md` already
  explains Tier 1 scope, curl examples, TypeScript examples, field
  classifications, owner-console checks, troubleshooting, and deferred Tier 2
  claims.
- `packages/developer-space-client/README.md` documents the workspace client,
  signed observed-runtime webhooks, offline Agents Observe dry run, guarded
  live-send bridge, and structured error categories.
- Example files exist for node ingestion, observed-runtime webhooks, and
  offline Agents Observe dry-run.
- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md` records the product
  boundary and ARGUS gates for partner readiness.

Gaps safe for ADV follow-up:

- A one-page partner smoke checklist that says what to run, what not to paste,
  and what sanitized outputs are safe for a handoff.
- A fixture coverage table connecting docs examples to focused tests:
  node state, event, snapshot, batch import, signed webhook, quota/rate-limit
  error, validation error, auth error, replay conflict, and in-progress retry.
- A Tier 1 claim checklist separating public showcase claims from deferred Tier
  2 infrastructure claims.
- A promotion packet that names the smallest mainline docs/test lane, touched
  files, and validation commands before any PR is opened.

Do not produce in ADV without promotion:

- new package scripts;
- live-send defaults;
- API route changes;
- public page copy changes;
- migrations;
- credential, key, signature, request-body, hosted-log, provider, prompt,
  completion, private source body, or raw id examples.

Suggested next helper if MIMIR approves:

- Wake SESHAT first for a docs/examples/test inventory.
- JANUS should follow only after SESHAT maps the exact surfaces.
- CASSANDRA can wait until a promotion candidate exists and product claims need
  caveat review.

## MIMIR Promotion Packet Shape

Candidate main lane:

- Proposed owner: DAEDALUS for docs/test-fixture implementation, with ARGUS
  review before any visible-route claim.
- Reason to promote now: partner-readiness docs already exist; a small
  smoke-checklist and fixture map would reduce onboarding risk without changing
  behavior.
- Files likely touched: `docs/integration/*`,
  `packages/developer-space-client/README.md`, and possibly focused docs under
  `docs/advance/results` if kept advisory.
- Acceptance bar: placeholders only, no raw operational material, no Tier 2
  overclaim, public/private field boundaries explicit, validation commands
  named.
- Validation: `git diff --check`; add `pnpm test:developer-space-client` and
  `pnpm test:developer-spaces` only if client/docs-linked behavior or examples
  are changed in a promoted lane.
- Config needed: none for docs-only promotion.
- Privacy/security review needed: yes, for key/signing, public/private fields,
  and sanitized troubleshooting examples.
- Conflict with active mainline lane: none if docs-only; defer visible page or
  runtime changes until PR310 closes or MIMIR explicitly sequences them.
