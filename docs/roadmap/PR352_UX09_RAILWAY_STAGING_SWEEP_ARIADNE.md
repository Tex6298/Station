# PR352 - UX-09 Railway Staging Browser Sweep

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS completed PR351 Railway staging sweep prep.
- MIMIR accepted the packet and is opening the broad hosted UX-09 rehearsal.
- This is a human-eye Railway staging browser sweep, not a mutation lane.
Task:
- Use docs/roadmap/PR351_UX09_RAILWAY_STAGING_SWEEP_PREP_RESULT.md as the source of truth.
- Check web/API health, public signed-out routes, signed-in replay-owner routes, and the mobile critical subset.
- Respect all credential, privacy, and mutation boundaries in the PR351 packet.
- Create docs/roadmap/PR352_UX09_RAILWAY_STAGING_SWEEP_RESULT.md with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
- Wake MIMIR if the verdict is PASS or PASS WITH CAVEAT.
- Wake DAEDALUS with the smallest exact repair packet if product repair is needed.
```

## Targets

Use the Railway targets from PR351:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Begin with:

```text
https://stationweb-production.up.railway.app/health
https://stationweb-production.up.railway.app/health/deployment
https://stationapi-production.up.railway.app/health
https://stationapi-production.up.railway.app/health/deployment
```

Record only safe readiness evidence: HTTP status, `ready`/`ok` booleans, and
short deployment commit prefixes.

## Credentials

Use local ignored `.env` key names only:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, screenshot, commit, summarize, or persist credential values,
cookies, bearer tokens, raw owner IDs, private payloads, hosted logs, SQL,
provider payloads, prompts, completions, Stripe IDs, or secret-shaped values.

## Route Order

Use the exact route order from:

```text
docs/roadmap/PR351_UX09_RAILWAY_STAGING_SWEEP_PREP_RESULT.md
```

Required coverage:

- Health/deployment readiness for web and API.
- Public signed-out desktop route sweep.
- Signed-in replay-owner desktop route sweep.
- Mobile readability sweep at `375px` or `390px` for the critical subset.
- Privacy and secret hygiene.
- Mutation-boundary compliance.

## Human-Rehearsal Focus

Treat this as a human-eye staging run. Look for:

- pages that visually fall back into generic dark-card dashboard styling when
  the Station/Discern direction expects clearer identity, hierarchy, and product
  story;
- buttons, tabs, filters, search boxes, chips, cards, and visible action
  controls that do not navigate, mutate, change state, disable clearly, or
  explain that they are preview-only;
- broken public chains from `/discover` to public Space, public document, and
  linked forum discussion;
- Continuity missing as its own understandable stop rather than only runtime
  context counts;
- Archive import/source surfaces that look empty without explaining the current
  limitation or next action;
- Developer Space pages that show live state but thin methodology, field-log,
  or observatory storytelling;
- mobile overlap, clipping, trapped controls, or document-level horizontal
  overflow.

Do not convert every issue into a broad redesign request. Capture exact route,
viewport, visible symptom, and smallest likely owner for the next wakeup.

## Non-Scope

Do not:

- open Checkout or Billing Portal;
- publish, create Spaces, change visibility, send Assistant messages, upload or
  import files, start connector/OAuth flows, post forum replies, or moderate
  content;
- mutate Stripe, entitlements, subscriptions, token credits, billing state,
  database state, Railway config, Supabase admin settings, Redis, Cloudflare,
  queues, workers, provider/model config, schemas, or migrations;
- inspect owner Developer Space manage routes or ingestion keys;
- record secrets, cookies, tokens, raw private IDs, private source bodies,
  hosted logs, SQL, provider payloads, prompts, completions, or secret-shaped
  values.

## Result Doc

Create:

```text
docs/roadmap/PR352_UX09_RAILWAY_STAGING_SWEEP_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

If `PASS` or `PASS WITH CAVEAT`, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR352 Railway staging browser sweep.
Verdict:
- PASS or PASS WITH CAVEAT
Task:
- Decide the next UX/product lane from the result.
```

If product repair is needed, wake DAEDALUS instead:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE completed PR352 Railway staging browser sweep and found product repair work.
Risk:
- List the smallest exact defects with routes and viewport evidence.
Task:
- Patch only the named defects, validate, and wake ARGUS for review.
```

If blocked by environment or auth rather than product, wake MIMIR with the exact
blocker and no secrets.
