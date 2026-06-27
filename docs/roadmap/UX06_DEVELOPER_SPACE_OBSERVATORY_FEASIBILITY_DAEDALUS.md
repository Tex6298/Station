# UX-06 Developer Space Observatory Clarity Feasibility

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Status: COMPLETE - WAKE MIMIR
Opened: 2026-06-27
Completed: 2026-06-27
Result: `docs/roadmap/UX06_DEVELOPER_SPACE_OBSERVATORY_FEASIBILITY_RESULT.md`

## Why This Opens

UX-05 Discover/community feasibility found no default implementation blocker and
recommended moving to the next roadmap lane.

UX-06 is Developer Space observatory clarity. The repo already has substantial
Developer Space Tier 1 evidence from PR255 through PR260, so this is not an
instruction to rebuild Developer Spaces. It is a current-state reconciliation:
confirm what is already protected-alpha complete, what is stale, and whether
there is one small clarity slice worth opening now.

## Product Question

Can a non-technical visitor understand what a public Developer Space is showing,
while an owner/researcher can understand the private console, ingestion state,
usage/quota, evidence documents, and safe agent/readback boundaries?

Answer this from current main and current docs. Do not rely on memory of older
Developer Space work.

## Inputs

Read and reconcile:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md`
- `docs/integration/developer-space-tier1-partner-onboarding.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- current `docs/testing/VALIDATION_BASELINE.md`
- current Developer Space routes, API routes, tests, and client package

Treat the CTO brief and Discern direction as product context only. Do not open
Tier 2 hosted infrastructure, pricing/tipping, repo push/deploy, or real
developer-agent execution by implication.

## Likely Surfaces

- `/developer-spaces`
- `/developer-spaces/[slug]`
- `/developer-spaces/[slug]/manage`

Likely files:

- `apps/web/app/developer-spaces/page.tsx`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `packages/developer-space-client/src/index.ts`
- `packages/developer-space-client/src/index.test.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `docs/integration/developer-space-tier1-partner-onboarding.md`

Inspect more files only if current imports require it.

## What To Classify

Classify each area as solved, stale, fragile, deferred, or recommended next
slice:

- public observatory header and live-state explanation;
- visualization mode clarity and non-technical readback;
- node/event/snapshot/status readback;
- methodology/finding/field-log/note evidence document path;
- owner manage console private/public split;
- ingestion key and observed-runtime signing-secret copy;
- usage/quota/rate-limit readback;
- export/readback boundaries;
- agent controls and blocked action copy;
- project updates/changelog/feed caveat;
- Developer Space community/forum entry caveat;
- connection tier/pricing/tipping caveat;
- Tier 2 hosted infrastructure, queues, deploy pipeline, per-project data, and
  repo execution deferrals.

## Hard Boundaries

Do not change:

- schema, migrations, queues, workers, Redis, Cloudflare, Railway, Supabase,
  Stripe, provider/model, deploy, key, package, or config behavior;
- public/private serializers;
- ingestion API behavior;
- usage/quota/rate-limit behavior;
- export assembly;
- developer-agent execution boundaries;
- repo push/deploy behavior;
- signing-secret/key mutation behavior;
- public/community/forum/billing behavior;
- broad visualization framework or canvas/3D work.

No implementation should happen in this feasibility pass.

## Output Required

Create:

```text
docs/roadmap/UX06_DEVELOPER_SPACE_OBSERVATORY_FEASIBILITY_RESULT.md
```

Include:

- current route/API/component map;
- current evidence to keep from PR255 through PR260;
- stale assumptions;
- exact caveats that remain acceptable for protected alpha;
- any real gaps that deserve a new named lane;
- recommendation: no implementation, evidence-only rehearsal, or one narrow
  implementation slice;
- ARGUS gates for any recommended slice;
- ARIADNE human rehearsal points.

If the recommendation is no implementation, say that plainly and name the next
roadmap lane. If a slice is recommended, keep it narrow enough that ARGUS can
review key safety, public/private split, public-safe serializers, SSE/detail
visibility, usage counters, `test:developer-spaces`, and `test:exports`.

## Validation For This Feasibility Pass

Run:

```bash
git diff --check
```

Also run an added-line sensitive-pattern scan for the docs-only patch before
committing.

Do not run product tests unless code changes land. If a read-only local probe is
needed to answer the current-state question, record the exact probe and keep it
non-mutating.

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed UX-06 Developer Space observatory clarity feasibility.
- Current public/owner Developer Space observatory and console evidence is
  classified against protected-alpha Tier 1 boundaries.
Task:
- Decide whether to close UX-06, open the recommended slice, request evidence,
  or move to the next roadmap lane.
```
