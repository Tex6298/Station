# PR29 - Live Staging Replay Refresh

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS runs evidence, ARGUS reviews. ARIADNE only rehearses if a
visible staging-facing UI defect appears.

## Purpose

Prove the current post-PR25 through PR28 line is live and still coherent on
Railway before opening more feature work.

This is not a blanket "run three agents after every change" rule. It is a
bounded refresh after several accepted backend/product changes:

- PR25 four onboarding route map;
- PR26 retrieval ranking/trace quality;
- PR27 import retry recovery;
- PR28 retrieval candidate-depth fix.

## Scope

- Check Railway web and API `/health` and `/health/deployment`.
- Record sanitized deployment identity for web/API runtime commits and whether
  those commits include or lag the latest backend changes.
- Run a narrow replay smoke using existing ignored/local replay credentials if
  available:
  - sign in;
  - fetch replay owner/persona;
  - request context preview;
  - run private archive retrieval or search with replay-safe synthetic terms;
  - inspect import/archive status enough to confirm PR27 did not regress owner
    visibility;
  - check export/readback only if a completed package already exists.
- Keep all evidence sanitized: no tokens, cookies, emails, owner IDs, persona
  IDs, private excerpts, prompts, raw response bodies, Stripe URLs, or secrets.
- If replay credentials are not available locally, run public health/readiness
  plus local focused tests and wake MIMIR with the exact missing local-only
  credential key names, not values.

## Explicit Non-Scope

- Do not add Cloudflare config or Cloudflare retrieval.
- Do not add Redis memory truth or Redis-dependent replay behavior.
- Do not add provider changes, vector dimension changes, workers, Stripe
  changes, live social OAuth/API pulls, or broad UI redesign.
- Do not print or commit secrets.
- Do not patch code unless the live refresh finds a concrete regression.

## Cloudflare Status

Cloudflare remains deferred after PR28.

PR29 should only report whether live staging shows a concrete retrieval failure
that contradicts the PR28 conclusion. If no such failure appears, do not reopen
Cloudflare.

## Validation

Run whatever is needed to support the live evidence. Minimum expected checks:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If this is evidence-only, focused tests plus live sanitized probes are enough.
If code changes, add the touched test family.

## ARGUS Review Ask

ARGUS should hostile-review:

- deployment identity truth;
- secret redaction;
- whether live evidence actually covers retrieval/import replay risks from
  PR26 through PR28;
- whether Cloudflare/Redis/workers/provider claims are still properly deferred;
- whether any live regression needs a new implementation lane.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- live runtime commit evidence;
- sanitized route/status/count/mode evidence;
- local validation results;
- whether code changed;
- exact blocker if replay credentials are missing;
- recommendation: close as live-refresh accepted, or open one precise repair.
