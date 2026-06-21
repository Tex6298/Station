# Staged Replay Measurement Baseline

Date: 2026-06-21
Owner: DAEDALUS implementation packet for PR149. ARGUS reviews claims.

## Boundary

This packet is a measurement baseline, not a new infrastructure lane.

It distinguishes:

- local/source proof that can be validated from this repository;
- hosted proof that must be rerun against Railway/Supabase staging after the
  exact commit is deployed;
- assumptions that remain unproven until hosted replay;
- blockers that should open a later optimization lane only if measurement shows
  real pain.

No worker runtime, Redis Memory truth, Cloudflare retrieval/Queue,
provider/embedding migration, broad UI redesign, new billing behavior, new
staged data mutation, or migration-ledger repair is added or recommended here.

## Local Proof Run

DAEDALUS ran this local validation from the repository root on 2026-06-21:

| Command | Result | What it proves locally |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:health` | Pass, 16 tests | `/health/deployment` keeps non-secret readiness shape, dependency failures are sanitized, Redis/Valkey queue posture and Upstash REST cache-only posture remain explicit. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests | `/observability/replay-readiness` is authenticated and AI trace detail serialization is owner-scoped/sanitized. |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass, 9 tests | Background job registry/readback, owner-only `GET /background-jobs`, inactive route-followup kinds, and sanitizer regressions remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 97 tests | Current Studio helper surfaces for AI observability, Memory runtime explanation, Memory graph relationship readback, Archive trust, Export trust, billing copy, and related protected-alpha UI helpers remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks pass or replay from cache. |
| `git diff --check` | Pass | CRLF warnings only for local triad state/touched docs. |

These commands do not prove the current commit is deployed or that staging data
exists. They prove the current repo surfaces still validate locally.

Only the commands in the table above were rerun for this PR149 packet. The
measurement matrix below also names existing focused gates and source files that
should be run or inspected before claiming a specific axis; treat those entries
as coverage pointers unless their command appears in the local proof run.

## Measurement Matrix

| Axis | Local/source coverage or gate | Hosted proof still required for this commit | Open assumption or blocker |
| --- | --- | --- | --- |
| Deployment readiness and non-secret config | `test:health`; `apps/api/src/routes/health.ts`; `apps/web/app/health/deployment/route.ts` | Public web/API `/health` and `/health/deployment` must return `ok:true`, `ready:true`, and the deployed commit/branch/service expected for this line. | Local tests cannot prove Railway deploy state. If readiness is false, open a config/deployment repair, not a product lane. |
| Auth/session and redirect readiness | `test:auth`; `test:health` auth redirect readiness coverage remains in baseline docs. | Sign in as the replay account and call `/auth/me`; verify web session restore through the deployed web URL. | Replay credentials are external and must not be committed or printed. |
| Replay readiness | `test:replay-readiness`; `GET /observability/replay-readiness` is authenticated and non-secret. | Authenticated hosted call should return route checklist/measurement prep without private payloads. | If route is 401 without a replay token, that is expected. |
| Memory/runtime context quality | `test:persona-context`, `test:conversation-archive`, and `test:studio-ui` cover owner scope, context preview, Memory lifecycle/runtime helper copy, and graph readback helpers. | Authenticated hosted context-preview and Memory briefing/graph calls must be judged with counts/modes/relevance ratings, not copied private excerpts. | Quality remains a replay judgment. Open optimization only from concrete misses, stale recalls, latency, or skipped-source evidence. |
| Archive import status, retry, and errors | `test:storage`, `test:conversation-archive`, and `test:jobs` cover import jobs, status, retry, owner scope, and sanitized errors. | Hosted replay should inspect `/imports/persona/:personaId`, `/imports/:id/status`, and retry only a safe failed replay job. | Do not create new staged data unless MIMIR explicitly opens a seed/data pass. |
| Export package status/readback | `test:exports` and `test:studio-ui` cover export package rows, failed packages, owner readback, and UI trust helpers. | Hosted replay should inspect `/exports/persona/:personaId`, `/exports/:id`, and bundle metadata for the replay owner. | Full downloadable/PDF/binary export remains future work, not a blocker for this measurement packet. |
| Background-job readback | `test:jobs` covers authenticated owner-only `GET /background-jobs` and inactive route-followup copy. | Hosted replay should call `/background-jobs` for the replay owner after import/export rows exist. | Route-followup kinds should remain inactive until an owning route exists. |
| AI observability summary/detail | `test:replay-readiness` and `test:studio-ui` cover summary/detail route boundaries and UI redaction helpers. | Hosted replay should call `/observability/summary`, `/observability/traces?limit=6`, and one trace detail only if a trace exists. | Do not paste prompts, completions, provider payloads, raw URLs, bearer values, or trace ids into docs. |
| Developer Space observed-runtime health | `test:developer-spaces` remains the full route-level gate in the baseline; `test:studio-ui` covers public/owner helper readback. | Hosted replay should verify a replay Developer Space can show public detail, owner usage/readback, and observed-runtime evidence already present. Signed ingest should run only with a known test key and sanitized payload. | Do not add batch workers or new observed-runtime behavior from this packet. |
| Billing/test-mode boundary | `test:billing` and `test:token-credits` remain the focused local gates in the baseline; current docs frame paid activation as Stripe test-mode only. | Hosted replay should inspect `/billing/me`; Checkout/portal should run only in Stripe test mode with a replay account. | Do not claim live commercial activation or fabricate subscription state. |
| Redis/Upstash/no-worker boundary | `test:health`, `test:cache`, and `test:jobs` cover Upstash REST cache-only and TCP Redis/Valkey queue-capable config posture. | Hosted `/health/deployment` should report Redis/cache status as sanitized booleans and preserve the no-worker/no-Memory-truth claim. | Redis/Upstash remains cache/idempotency/rate-limit/job-state support, not canonical memory. |
| Cloudflare/provider boundaries | Current docs and tests keep Cloudflare retrieval, Cloudflare Queue, and provider/embedding migration deferred. | Hosted replay should record provider/profile names from sanctioned readiness/observability fields only. | Open Cloudflare/provider work only from a concrete replay objective or measured provider failure. |

## Hosted Probe Packet

Run these only after this commit is deployed. Do not print bearer tokens,
cookies, database URLs, service keys, webhook secrets, API keys, or raw private
payloads.

Set local shell variables without committing them:

```powershell
$API = "https://stationapi-production.up.railway.app"
$WEB = "https://stationweb-production.up.railway.app"
$TOKEN = "<redacted replay bearer token>"
$PERSONA_ID = "<replay persona id>"
$IMPORT_JOB_ID = "<safe replay import job id>"
$FAILED_IMPORT_JOB_ID = "<safe failed replay import job id, optional>"
$EXPORT_PACKAGE_ID = "<replay export package id>"
$TRACE_ID = "<safe trace id from /observability/traces, optional>"
```

Public non-secret readiness:

```powershell
curl.exe -fsS --max-time 20 "$API/health"
curl.exe -fsS --max-time 20 "$WEB/health"
curl.exe -fsS --max-time 20 "$API/health/deployment"
curl.exe -fsS --max-time 20 "$WEB/health/deployment"
curl.exe -i --max-time 20 "$API/observability/replay-readiness"
```

Authenticated owner replay checks:

```powershell
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/auth/me"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/observability/replay-readiness"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/background-jobs"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/imports/persona/$PERSONA_ID"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/imports/$IMPORT_JOB_ID/status"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/exports/persona/$PERSONA_ID"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/exports/$EXPORT_PACKAGE_ID"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/observability/summary"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/observability/traces?limit=6"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/memory/persona/$PERSONA_ID/briefing"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/memory/persona/$PERSONA_ID/graph"
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/conversations/persona/$PERSONA_ID/context-preview?query=replay%20measurement"
```

Optional checks:

```powershell
# Only if $TRACE_ID came from the replay owner's trace list.
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/observability/traces/$TRACE_ID"

# Only if retrying this failed job is safe for replay data.
curl.exe -fsS --max-time 20 -X POST -H "Authorization: Bearer $TOKEN" "$API/imports/$FAILED_IMPORT_JOB_ID/retry"

# Only in Stripe test mode, with a replay account.
curl.exe -fsS --max-time 20 -H "Authorization: Bearer $TOKEN" "$API/billing/me"
```

For Developer Space observed-runtime, prefer existing replay data first:

- open the public Developer Space detail page for the replay space;
- inspect owner manage usage/readback for the replay space;
- run signed observed-runtime ingest only if a dedicated replay key and
  sanitized fixture are already prepared.

## Evidence To Record

Record counts, statuses, booleans, modes, timestamps, latency ranges, selected
provider/profile names, and high-level human ratings. Do not record private
archive text, context-preview bodies, prompts, completions, provider payloads,
tokens, cookies, URLs containing secrets, raw ids beyond stable doc references,
or raw error bodies.

Useful fields:

- deployment commit/branch/service and `ready` status;
- replay readiness route sections present;
- import job status counts, failed error labels, and retry outcome;
- export package status counts and included-section counts;
- background job summary totals and inactive route-followup kinds;
- observability trace count, failure count, token/cost totals, and sanitized
  operation/status labels;
- Memory/context mode, source counts, skipped-source counts, and human relevance
  rating;
- Developer Space public/owner readback health;
- billing status in test mode only;
- Redis/Upstash status as cache/no-worker/no-Memory-truth.

## Recommendation

DAEDALUS does not recommend opening an optimization implementation lane from
local proof alone. The next useful step is ARGUS review of this packet. If ARGUS
accepts the packet but wants hosted visible-route evidence for the current
commit, wake ARIADNE with the hosted probe packet above. If hosted replay
already exists for this commit and shows no new blocker, wake MIMIR to choose
whether to pause or open a narrowly evidenced optimization lane.
