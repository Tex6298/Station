# PR267 - Staging Readiness Truth Check

Owner: A3 / ARGUS
Status: failed by ARGUS on 2026-06-24
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

## ARGUS Result

Verdict: `FAIL`.

Evidence gathered on 2026-06-24:

- Hosted web `/health` returned HTTP 200 with `{ ok: true }`.
- Hosted API `/health` returned HTTP 200 with `{ ok: true }`.
- Hosted web `/health/deployment` returned HTTP 200 with `ok:true`,
  `ready:true`, service `@station/web`, branch `main`, and runtime commit
  `38ad00e6f56823a302737139b4e7453294b9ea30`.
- Hosted API `/health/deployment` returned HTTP 200 with `ok:true`,
  `ready:true`, service `@station/api`, branch `main`, and runtime commit
  `38ad00e6f56823a302737139b4e7453294b9ea30`.
- Current repo commits after `38ad00e6f56823a302737139b4e7453294b9ea30` are
  docs/state only, so the deployed runtime is fresh for product-code purposes.
- Public web route probes:
  - `/`: HTTP 200.
  - `/discover`: HTTP 200.
  - `/forums`: HTTP 200.
  - `/developer`: HTTP 404.
  - `/developer-spaces`: HTTP 200.
  - `/developer-spaces/station-replay-dev-alpha`: HTTP 200.
- Public API replay Developer Space probe
  `/developer-spaces/station-replay-dev-alpha` returned HTTP 200 and exposed
  public-safe readback keys including `space`, `nodes`, `events`,
  `latestSnapshot`, `supportingContext`, `linkedDocuments`, and `access`.
- API deployment readiness reported database, migrations, private
  `persona-files` storage, public URL wiring, Supabase Auth redirects, Stripe
  test billing/prices, platform chat, NVIDIA chat, Gemini
  `station_free_1536` embeddings, and Upstash REST operational cache ready.
- Redis/Upstash readiness remains cache-only: Upstash REST cache is configured,
  worker queue is not ready, and inline fallback is true.
- Cloudflare remains docs-deferred; no live Cloudflare readiness claim was made
  or probed.
- Owner replay routes were not rechecked because no existing safe owner harness
  was available in the working tree without credentials/tokens.

Risk:

- The specific `/developer` route named by PR267 is missing on staged web. This
  is a concrete public replay-route mismatch even though the canonical
  `/developer-spaces` and replay Developer Space observatory routes are live.
- Hosted readiness is otherwise strong, but a route named in the staging truth
  check should not be silently substituted.

Recommendation:

- Open one narrow DAEDALUS repair lane to add and verify a public `/developer`
  redirect or alias to `/developer-spaces`, then rerun the PR267 public route
  probes. Do not open broader UX or product work until that staged route truth
  mismatch is resolved.

Validation:

- `git diff --check` passed with CRLF warnings only.
- `git diff --cached --check` passed.
