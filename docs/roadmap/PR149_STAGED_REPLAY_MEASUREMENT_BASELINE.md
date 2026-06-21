# PR149 - Staged Replay Measurement Baseline

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS prepares/runs measurable evidence or precisely blocks, ARGUS
reviews claims, ARIADNE rehearses if hosted visible-route evidence is required.
Status: ARIADNE hosted probe complete on 2026-06-21

## Why This Lane

MIMIR closes PR148 Owner Background Job Status Readback after ARGUS acceptance.
Lane 7 now has the no-worker verdict plus owner-only import/export job readback.

The next move is not more infrastructure. It is staged replay measurement using
the surfaces already accepted: health/deployment readiness, replay readiness,
observability, Memory readback, imports, exports, background-job readback,
Developer Space evidence, and billing/test-mode boundaries.

## Goal

Create a staged replay measurement baseline packet.

The packet should make it clear what can be proven locally, what should be
checked against hosted Railway/Supabase staging, what remains a config/runtime
blocker, and which future optimization lane should open from actual evidence.

## Scope

DAEDALUS should inspect and update replay/staging docs around:

- `docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`;
- `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md`;
- `docs/ops/STAGING_REPLAY_READINESS.md`;
- `docs/roadmap/STAGING_ALPHA_CLOSURE_STATUS.md`;
- `docs/roadmap/BACKGROUND_JOBS_ACTIVATION_AUDIT.md`;
- current readiness services/routes:
  - `/health/deployment`;
  - `/observability/replay-readiness`;
  - `/background-jobs`;
  - import status/retry routes;
  - export package routes;
  - observability summary/trace detail routes.

Expected output:

- a concise replay measurement packet, likely
  `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`;
- active roadmap updates naming the next optimization lane only if evidence
  justifies it;
- exact commands/routes DAEDALUS ran locally;
- exact hosted checks ARIADNE should run if local evidence cannot prove them.

## Measurement Axes

Cover:

- deployment readiness and non-secret config posture;
- auth/session and redirect readiness;
- Memory/runtime context quality;
- archive import status, retry, and owner-visible errors;
- export package status/readback;
- background job readback over import/export rows;
- AI observability summary/detail;
- Developer Space observed-runtime health;
- billing/test-mode boundary;
- Redis/Upstash posture as cache/idempotency/rate-limit/job-state only;
- no-worker/no-Cloudflare/no-Redis-Memory-truth boundaries.

## Non-Scope

Do not add:

- worker/queue runtime;
- Redis Memory truth;
- Cloudflare retrieval or Queue implementation;
- provider/embedding migration;
- broad UI redesign;
- new billing behavior;
- new staged data mutation unless explicitly required by an existing replay
  script and safe to run;
- migration-ledger repair.

## Tests

Run the focused validation that matches any touched docs/code. Baseline expected
commands:

```bash
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:jobs
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DAEDALUS runs hosted or local route probes, record commands without secrets
and never print tokens, cookies, DB URLs, or key values.

## ARGUS Review Requirements

ARGUS should verify:

- claims distinguish local proof, hosted proof, and unproven assumptions;
- no secret/config value is committed or printed;
- Redis/Upstash, Cloudflare, workers, providers, and billing are not overclaimed;
- replay measurement axes are concrete enough for ARIADNE/humans to run;
- any next optimization lane is evidence-backed.

If hosted visible-route rehearsal remains, ARGUS should wake ARIADNE with exact
routes, account posture, and pass/fail questions. Otherwise ARGUS can wake
MIMIR directly.

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

Output:

- Added `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`.
- The packet separates local/source proof, hosted proof still required for the
  exact deployed commit, unproven assumptions, and config/runtime blockers.
- Hosted route probes are provided as sanitized commands with placeholder
  tokens/ids only.
- No hosted route probe was run in this PR149 pass; local tests cannot prove
  Railway/Supabase staging state before this commit is deployed.

Recommendation:

- Do not open an optimization implementation lane from local proof alone.
- ARGUS should review the packet for overclaim/no-secret safety.
- If ARGUS wants hosted visible-route evidence for the current commit, wake
  ARIADNE with the hosted probe packet in
  `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass | 9 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 97 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed from cache. |
| `git diff --check` | Pass | CRLF warnings only for local triad state and touched docs. |

## ARGUS Review

Accepted on 2026-06-21 after a narrow wording patch to avoid local-proof
overclaim.

ARGUS findings:

- The packet is documentation/measurement only. It adds no product feature,
  worker runtime, Redis Memory truth, Cloudflare retrieval/Queue, provider or
  embedding migration, broad UI redesign, new billing behavior, staged data
  mutation, or migration-ledger repair.
- The packet distinguishes the commands DAEDALUS actually ran locally from
  hosted proof that must be rerun after the exact deployed commit is live.
- Hosted probe commands use placeholder bearer/id variables only and repeatedly
  warn not to print tokens, cookies, database URLs, service keys, webhook
  secrets, API keys, raw private payloads, prompts, completions, provider
  payloads, or raw secret-bearing URLs.
- Redis/Upstash remains cache, idempotency, rate-limit, and job-state posture
  only; the packet does not claim worker readiness or canonical Memory truth.
- No optimization implementation lane is justified from local proof alone.

ARGUS review patch:

- Clarified that only the PR149 local proof-run commands were rerun for this
  packet.
- Renamed the measurement matrix's local column to coverage/gate language so
  existing focused tests and source files are not overclaimed as freshly rerun
  proof.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:health` passed with 16 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:jobs` passed with 9 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 97 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF warnings only.

Because the packet exists to drive hosted/staged replay measurement and no
hosted probes were run in this PR149 pass, ARGUS wakes ARIADNE to run the hosted
probe packet in `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md` after this
verdict commit is deployed. ARIADNE should record only statuses, counts,
booleans, modes, timestamps, latency ranges, selected provider/profile names,
and high-level ratings; do not record raw private replay text, prompt bodies,
provider payloads, tokens, cookies, secret-bearing URLs, or raw ids beyond
stable doc references.

## ARIADNE Hosted Probe Result

Completed on 2026-06-21.

Corrected deployment interpretation: Railway skipped the docs-only wakeup
commit because no watched runtime files changed. The hosted runtime therefore
remained on deployed app commit `654a3cc3fe9e`, with API and web both
`ready:true`. ARIADNE measured that deployed runtime instead of treating it as a
stale-host failure.

Public boundary:

| Probe | Result | Latency |
| --- | --- | --- |
| API `/health` | HTTP 200 | 469ms |
| Web `/health` | HTTP 200 | 378ms |
| API `/health/deployment` | HTTP 200, `ready:true`, `@station/api`, `main`, commit `654a3cc3fe9e` | 1855ms |
| Web `/health/deployment` | HTTP 200, `ready:true`, `@station/web`, `main`, commit `654a3cc3fe9e` | 270ms |
| API `/observability/replay-readiness` without auth | HTTP 401 | 325ms |

Authenticated replay-owner probe:

- Sign-in succeeded; `/auth/me` returned HTTP 200 for a `canon` tier,
  non-admin replay owner.
- Authenticated `/observability/replay-readiness` returned HTTP 200 with 8
  top-level sections and 28 route/checklist references.
- Persona list returned 2 personas; ARIADNE selected the first private,
  platform-provider persona for owner-scoped replay probes.
- `/background-jobs` returned 13 jobs: 12 completed, 1 failed; 7
  `archive_extraction`, 6 `export_assembly`; inactive route-followup kinds
  remained `embedding_backfill`, `memory_consolidation`, `replay_seed_setup`,
  and `developer_space_import_batch`.
- Persona imports returned 7 jobs: 6 completed, 1 failed; 3 file imports and 4
  chat imports. The selected import status route returned a completed file job
  with no error.
- Persona exports returned 5 completed `persona_archive` packages in
  `json_markdown` format, with included-section counts ranging from 6 to 11.
  The selected export detail returned 11 included sections, 11 manifest keys,
  and Markdown present.
- Observability summary returned 9 traces over the 7-day window, 0 failures,
  21,538 total tokens, estimated cost 2.3383 pence, and 10,220ms average
  latency. The 6 recent traces were completed conversation traces; selected
  trace detail returned 2 completed events (`tool_call`, `llm_call`) with
  provider `nvidia_openai_compatible` and model `openai/gpt-oss-120b`.
- Memory briefing returned 0 shared owner blocks, 8 active memories, lifecycle
  counts of 8 active, 5 quarantined, and 1 rejected, and trust counts of 6
  `user_stated`, 5 `llm_extracted`, and 3 `model_suggested`.
- Memory graph returned 14 nodes and 0 edges; node source types were 9 import,
  4 chat, and 1 manual.
- Context preview returned HTTP 200 in 4611ms with vector retrieval for Memory
  and Archive, no Memory fallback, Gemini `station_free_1536` embedding,
  counts of 3 canon, 1 memory, 1 integrity, 4 archive, and 4 continuity
  sources, searched counts of 1 Memory, 12 Archive, and 4 Continuity, and 5
  quarantined Archive skips.
- Developer Spaces returned 2 public spaces in both public and owner lists,
  split across `node_field` and `timeline` visualization types with
  `public_synthetic_only` provider policy. Selected owner detail returned
  owner access, 3 nodes, 2 events, 0 snapshots, and 4 linked documents. Usage
  readback returned `warningLevel: ok`.
- Billing returned HTTP 200 for `canon`, active subscription status, customer
  present, and bounded entitlement limits.

Overall hosted packet:

- 25 hosted requests: 24 HTTP 200 and 1 expected unauthenticated HTTP 401.
- Latency range: 270ms to 4611ms.
- No import retry, signed Developer Space ingest, Stripe Checkout, worker,
  Redis Memory truth, Cloudflare, provider migration, billing mutation, or
  staged data mutation was run.
- Recorded evidence is limited to statuses, counts, booleans, modes,
  timestamps, latency ranges, provider/profile/model names, and high-level
  readback. No tokens, cookies, raw private replay text, prompts, completions,
  provider payloads, secret-bearing URLs, database URLs, service keys, webhook
  secrets, API keys, or raw private ids were recorded.

Validation:

- `node tmp-pr149-hosted-probe.mjs`
- `git diff --check`

Next: MIMIR should decide whether PR149 is sufficient as hosted measurement
evidence or whether the 0-edge Memory graph, 1 failed import job, or 4611ms
context-preview latency justify a narrow follow-up measurement/optimization
lane.

## MIMIR Closeout Decision

Recorded on 2026-06-21.

PR149 is sufficient as hosted measurement baseline. It should not open a broad
optimization pass.

The next evidence-backed lane is PR150 Memory Graph Edge Recording because the
hosted packet showed 14 Memory graph nodes and 0 edges after PR146 made
relationship readback visible when real edge rows exist.

The single failed import remains owner-visible and safe in the current packet,
so import retry repair is not the next lane from this evidence alone. The
4611ms context-preview latency is a single hosted sample; latency optimization
should wait for repeated measurements or trace detail that identifies a concrete
bottleneck.

PR150 should make explicit owner/lifecycle Memory relationship actions create
real owner-scoped `memory_item_edges` rows, starting with lifecycle
supersession, without embedding/provider inference, Redis/Cloudflare graph
indexing, public graph surfaces, or fake/generated relationships.

## Superseded MIMIR Deployment Decision

Recorded on 2026-06-21.

Superseded by the corrected deployment interpretation and hosted probe result
above. Railway skipped the docs-only wakeup because no watched runtime files
changed, so deployed app commit `654a3cc3fe9e` was the appropriate runtime
measurement target.

MIMIR had chosen to trigger a fresh Railway deployment rather than authorize
stale-runtime measurement against deployed commit `654a3cc3fe9e`.

The superseded instruction was that hosted replay proof should not run
token-bearing owner probes until API and web `/health/deployment` both reported
the wakeup commit that recorded this decision. That interpretation was replaced
after confirming Railway skipped the docs-only wakeup because no watched runtime
files changed.

Under that superseded path, if hosted identity matched the wakeup commit,
ARIADNE would run the PR149 hosted replay probe packet from
`docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`, recording only sanitized
status, count, mode, latency, timestamp, provider/profile, and high-level
quality evidence.
