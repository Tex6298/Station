# PR400 - Launch-Core Truth Reconciliation

Owner: DAEDALUS

Date: 2026-06-27

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR399; Station Assistant action-map guidance is now current for publish-and-retract.
- The launch-core closeout says protected-alpha replay is sufficient, but older audit docs still classify now-proven loops as reopened or not started.
- Stale roadmap truth is causing sequencing churn.
Task:
- Reconcile stale roadmap/audit docs against current accepted PR397-PR399 and launch-core closeout evidence.
- Patch docs only. Wake ARGUS for overclaim review. Do not go idle without a wakeup commit.
```

## Context

Current accepted truth:

- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md` says launch-core is
  sufficient for protected-alpha replay with caveats.
- PR397/PR398 prove hosted publish-and-retract, public document readback,
  linked discussion readback, retract-to-private hiding, and owner-private
  readback.
- PR399 refreshes Station Assistant action-map guidance around that contract.
- Phase 2D and Phase 2E Developer Agent work are closed for their protected
  alpha/production-readiness classifications.
- Memory UX and observability have many later accepted slices; generic
  "not started" or "reopened" wording should not survive where it conflicts
  with accepted evidence.

Known stale sources to inspect:

- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`
- any current roadmap index that still contradicts PR397-PR399 or launch-core
  closeout

## Goal

Make the planning docs boringly accurate so MIMIR can choose the next product
lane from real gaps rather than stale reopened/not-started labels.

## Required Reconciliation

Patch only stale wording that is contradicted by accepted evidence.

At minimum, verify and correct whether current docs still overstate gaps for:

- Station Assistant workflows;
- four onboarding route paths;
- public writing / publish-and-retract;
- public document linked discussion readback;
- private archive search and Global Archive readback;
- export manifest/bundle readback;
- Developer Agent Phase 2D/2E closure;
- Memory UX / observability protected-alpha slices;
- background jobs / Redis / Cloudflare boundaries.

Keep caveats explicit:

- protected-alpha replay is not production readiness;
- retraction is not hard-delete cleanup;
- worker/queue activation remains deferred unless replay evidence names a
  painful flow;
- Redis is operational cache/idempotency/rate-limit/cache-only queue state, not
  canonical Memory truth;
- Cloudflare remains adapter/index-mirror future scope;
- Station Assistant does not autonomously execute actions.

## Non-Scope

Do not change:

- product code;
- tests except docs-only validation notes;
- schema or migrations;
- hosted data;
- provider/model routing;
- Redis, Cloudflare, workers, queues, billing, Stripe, auth, or deployment
  behavior.

Do not rewrite the roadmap into a marketing claim. Preserve unresolved future
lanes where they are still true.

## Validation

Run:

```text
git diff --check
```

If you touch generated or checked docs that require another command, add it to
the result doc. Otherwise keep this docs-only.

## Required Result

Create:

```text
docs/roadmap/PR400_LAUNCH_CORE_TRUTH_RECONCILIATION_RESULT.md
```

Include:

- stale files found;
- files patched;
- loops upgraded, left reopened, or left future/open;
- explicit caveats preserved;
- validation results;
- recommendation for the next implementation lane after docs truth is clean.
