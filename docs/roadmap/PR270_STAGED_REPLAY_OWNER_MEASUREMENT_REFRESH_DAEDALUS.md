# PR270 - Staged Replay Owner Measurement Refresh

Owner: A2 / DAEDALUS
Reviewer: A3 / ARGUS
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

PR267/PR268/PR269 closed the public route-truth blocker. Hosted web/API
readiness and public Developer Space routes are now fresh and green.

The remaining staging-readiness gap is owner-side replay evidence. PR267 did
not recheck owner routes because it had no safe owner harness. The local
environment now has the replay-owner variables needed for a careful hosted
measurement pass:

- `STATION_REPLAY_OWNER_EMAIL`
- `STATION_REPLAY_OWNER_PASSWORD`
- `STATION_REPLAY_OWNER_ID`
- `STATION_REPLAY_OWNER_USERNAME`
- `STATION_REPLAY_STRIPE_TEST_CARD*`

Use those values only from local env. Do not print, commit, echo, or paste
credentials, bearer tokens, cookies, raw private payloads, database URLs,
service-role keys, Stripe secrets, or raw UUID-shaped ids.

## Goal

Refresh the staged replay measurement baseline against the live Railway web/API
using the existing replay owner.

This is evidence collection, not a new implementation lane. The output should
tell MIMIR what the next product/backend lane should be based on actual hosted
owner-route behavior.

## Scope

Use `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md` as the source packet
and run a sanitized hosted owner measurement pass.

Required checks:

- Hosted web/API `/health` and `/health/deployment`.
- Replay owner sign-in and `/auth/me`.
- Authenticated `/observability/replay-readiness`.
- Authenticated `/background-jobs`.
- Authenticated import list/status routes for replay-safe rows if available.
- Authenticated export list/package readback for replay-safe rows if available.
- Authenticated `/observability/summary` and `/observability/traces?limit=6`.
- Authenticated Memory briefing, graph, and context-preview for the replay
  persona if available.
- Hosted public `/developer`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha`.
- Hosted API `/developer-spaces/station-replay-dev-alpha`.
- Authenticated `/billing/me`; do not start Checkout unless a separate lane
  explicitly asks for a Stripe browser/test-card pass.

Record only:

- HTTP status;
- ready/pass/fail booleans;
- counts;
- route availability;
- provider/profile names from sanctioned readiness fields;
- sanitized timing ranges if easy to collect;
- whether data is present, thin, absent, or blocked.

Do not record:

- bearer tokens, cookies, passwords, API keys, webhook secrets, DB URLs, or
  service-role keys;
- raw ids;
- raw archive/memory/conversation text;
- prompts, completions, provider payloads, trace payload bodies, SQL, stack
  traces, or hosted logs.

## Output

Create a concise result doc, suggested path:

```text
docs/roadmap/PR270_STAGED_REPLAY_OWNER_MEASUREMENT_RESULT.md
```

The result should include:

- deployment identity for web/API, sanitized;
- owner auth/session pass/fail;
- route matrix;
- data-presence matrix for Memory, Archive/import, Export, Continuity/context,
  Observability, Developer Space, Billing;
- one recommendation:
  - open a bounded DAEDALUS implementation lane if hosted evidence names a
    concrete code/product blocker;
  - open ARIADNE human-eye rehearsal if the surfaces are technically green but
    need human judgement;
  - open ARGUS risk review if the issue is privacy/authorization/overclaim;
  - close with no new lane if the pass is genuinely clean.

## Validation

Run at least:

```bash
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run test:jobs
git diff --check
git diff --cached --check
```

Run `test:studio-ui`, `typecheck`, or focused API tests if the measurement pass
touches helpers, scripts, or product code. If this remains docs/evidence only,
record that no product code changed.

## Wake ARGUS

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR270 Staged Replay Owner Measurement Refresh.
- Hosted owner-route measurement result is in docs/roadmap/PR270_STAGED_REPLAY_OWNER_MEASUREMENT_RESULT.md.
- No secrets/raw ids/private payloads were committed or printed.
Validation:
- ...
Task:
- Review the evidence quality, secret hygiene, owner-scope claims, and next-lane recommendation.
- Wake MIMIR with accept/block and one recommended next move.
```

If credentials fail, routes are missing, or the replay owner lacks required data,
wake MIMIR with a sanitized blocker and the smallest setup or repair needed.
