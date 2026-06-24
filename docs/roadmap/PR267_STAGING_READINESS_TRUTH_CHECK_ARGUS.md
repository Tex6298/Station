# PR267 - Staging Readiness Truth Check

Owner: A3 / ARGUS
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

PR266 closed the post-Archive UX lane selection audit. DAEDALUS found PR264 and
PR265 accepted enough to close UX-02A, confirmed UX-02B Persona Export Status
and UX-DEBT-01 mobile top-nav debt are still current, and recommended exactly
one next lane: a staging readiness truth check.

The reason is simple: the repo has moved through several visible owner-route
and UI trust slices. Before opening another product or UX implementation lane,
MIMIR wants fresh staged truth rather than stale confidence.

## Task

Run a docs/evidence-only truth check against current repo and hosted staging.

Check:

- Railway web health and deployment freshness.
- Railway API health and deployment freshness.
- Public web route availability for `/`, `/discover`, `/forums`, `/developer`,
  and the known replay Developer Space/public observatory if still seeded.
- Owner route freshness for the replay account only if an existing safe test
  harness is available without printing credentials, cookies, tokens, or env
  values.
- Supabase/readiness facts only through existing non-secret health/readiness
  endpoints or existing docs. Do not connect directly to databases or print
  connection strings.
- Stripe test-mode readiness only through existing non-secret health/readiness
  endpoints or existing docs. Do not create live Checkout sessions unless a
  separate MIMIR lane explicitly opens that proof.
- Redis/Upstash, Gemini, NVIDIA, Cloudflare, and provider claims only as
  non-secret configured/unconfigured or deferred facts already exposed by
  health/readiness endpoints or docs.
- Whether any visible, staged, replay-facing blocker exists that should become
  the next implementation lane.

## Non-Scope

Do not:

- mutate Railway, Supabase, Stripe, Redis/Upstash, auth, seeds, storage,
  database schema, or environment variables;
- print secrets, credentials, cookies, bearer tokens, database URLs, service
  role keys, webhook secrets, API keys, raw user ids, private route bodies, or
  hosted logs;
- implement product code;
- reopen UI/UX work just because the route is not perfect;
- use local-only proof to claim hosted readiness.

## Output

Patch docs with a short result section, preferably in:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`

The result should say one of:

- `PASS`: staging truth is fresh enough and no implementation blocker is found.
- `FAIL`: a concrete staged product/replay blocker exists and should go to
  DAEDALUS.
- `BLOCKED`: hosted evidence cannot be checked because staging is deploying,
  unreachable, or requires credentials/tools not available without user input.

If `FAIL`, include the smallest recommended repair lane.

If `PASS`, recommend one of:

- a specific next product lane;
- a specific next UX lane;
- or a deliberate pause/no-lane verdict.

## Validation

Run:

```bash
git diff --check
git diff --cached --check
```

If you create temporary scripts for hosted checks, do not commit them unless
they are reusable and scrubbed. Delete temporary scripts before commit.

## Wake MIMIR

When done, wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR267 Staging Readiness Truth Check.
- Verdict: PASS/FAIL/BLOCKED.
Evidence:
- ...
Risk:
- ...
Recommendation:
- ...
Validation:
- ...
Task:
- Open the recommended next lane, pause deliberately, or route a repair to DAEDALUS.
```
