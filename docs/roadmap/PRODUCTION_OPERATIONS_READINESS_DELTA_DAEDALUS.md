# Production Operations Readiness Delta

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-27

Status: complete - see `docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md`

## Why This Lane Exists

ARGUS accepted the narrow document delete receipt/readback hardening lane in
`docs/roadmap/DOCUMENT_DELETE_RECEIPT_READBACK_RESULT.md`.

That closes the safe follow-up from the artifact retention/deletion design. Do
not reopen document cleanup, Memory observability, Developer Spaces,
onboarding, search/retrieval explainability, billing readback, or broad UI by
inertia.

The remaining roadmap pressure is now operational truth:

- `docs/roadmap/builds.md` still says launch-core is sufficient for
  protected-alpha replay, not a finished Station MVP.
- The reopened loops include remote deployment truth and durable deployed
  workers, realtime, usage tracking, limits, and backup posture.
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md` records accepted
  Railway/Supabase staging evidence, but explicitly keeps production readiness
  out of scope.

MIMIR needs a current production/operations delta before choosing the next
implementation lane.

## Task

Reconcile the latest repo/docs/code truth and produce a decision packet at:

```text
docs/roadmap/PRODUCTION_OPERATIONS_READINESS_DELTA_RESULT.md
```

Classify each area as one of:

```text
PROTECTED-ALPHA READY
FRAGILE / PARTIAL
DEFERRED
CONFIG-DEPENDENT
UNKNOWN / NEEDS PROOF
```

Cover these areas:

1. Railway web/API deployment truth, watched-file deploy behavior, health and
   `/health/deployment` evidence, and what counts as fresh enough after
   docs-only commits.
2. Supabase database, migrations, private `persona-files` bucket, auth
   redirects, service role/JWT boundaries, and any database URL/pooler caveats
   that are documented in repo.
3. Upstash/Redis current role: cache, idempotency, rate-limit, queue-state, or
   other operational support only; do not promote Redis to Memory truth.
4. Embedding/provider posture: Gemini `station_free_1536`, OpenAI/native
   rollback profile, NVIDIA chat/dev profile, and the re-embed/backfill limits
   that keep provider changes from being casual.
5. Stripe/billing posture: accepted test-mode subscription proof, price/env
   naming expectations, top-up/payment-mode gaps, and live-money boundary.
6. Background jobs and workers: current inline/protected-alpha fallback versus
   durable queue/worker readiness.
7. Realtime and Developer Space observability: accepted protected-alpha
   surfaces versus durable realtime guarantees, partner readiness, and export
   gaps.
8. Usage tracking, quotas, limits, storage accounting, and billing entitlement
   enforcement evidence.
9. Backup/restore and migration discipline, including whether any restore
   rehearsal exists.
10. Monitoring, logging, redaction, AI Activity trace, and safe operator
    readback.
11. Secrets/config inventory by variable name only. Do not print values.
12. Cloudflare: adapter/index-mirror status only. Do not imply Station has
    accepted Cloudflare authorization or private archive duplication.
13. Known local/Windows validation caveats versus Railway/Linux behavior.

## Required Output Shape

Use this structure:

```text
# Production Operations Readiness Delta Result

Verdict:
- one of NO IMMEDIATE OPS SLICE, ARGUS PREFLIGHT, DAEDALUS IMPLEMENTATION,
  ARIADNE HOSTED PROOF, or NEEDS MIMIR DECISION

Executive Summary:
- 5 to 10 bullets

Readiness Matrix:
- table covering the areas above

Next Safe Lane:
- exactly one recommended lane
- explain why it is next
- name the owner: DAEDALUS, ARGUS, or ARIADNE

Do Not Open Yet:
- lanes that are tempting but not justified by current evidence

Validation / Evidence:
- files inspected
- commands run
- no secrets printed
```

## Boundaries

This is a no-code, no-config lane.

Do not:

- change product code;
- change package manifests or lockfiles;
- change schema, migrations, generated types, storage config, or Railway/
  Supabase config;
- run hosted mutations;
- print secret values;
- add or change providers, models, embeddings, Redis, Cloudflare, Stripe,
  workers, queues, realtime, billing, auth, or UI behavior;
- claim production readiness unless the repo already proves it.

## Handoff

Wake MIMIR with the result packet unless you find an immediate hostile-review
risk. If you find a hostile-review risk, wake ARGUS and say exactly what must be
reviewed.
