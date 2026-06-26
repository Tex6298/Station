# PR351 - UX-09 Railway Staging Sweep Prep Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for MIMIR

## Summary

PR351 prepares the UX-09 Railway staging browser sweep packet for ARIADNE. No
product code changed. The next action is for MIMIR to open a broad hosted
rehearsal lane using the packet below.

## Confirmed Targets

Use these Railway targets:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

ARIADNE should begin by checking:

```text
https://stationweb-production.up.railway.app/health
https://stationweb-production.up.railway.app/health/deployment
https://stationapi-production.up.railway.app/health
https://stationapi-production.up.railway.app/health/deployment
```

It is safe to record HTTP status, `ready`/`ok` booleans, and short deployment
commit prefixes. Do not record tokens, cookies, credentials, raw owner IDs,
private payloads, hosted logs, SQL, stack traces, or secret-shaped values.

## Replay Account Handling

Use local ignored `.env` values only:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, screenshot, commit, summarize, or persist the values. If login
requires debugging, record only route, status, visible safe error text, and
whether session restore succeeded.

## Route Order For ARIADNE

Run desktop first, then repeat the critical readability paths at `375px` or
`390px` mobile.

Public signed-out route sweep:

1. `/`
2. `/discover`
3. `/writing`
4. `/space/station-replay-alpha`
5. First visible public document from the Space page.
6. Linked forum discussion from that public document, if visible.
7. `/forums`
8. `/forums/station-replay-salon-alpha`
9. First visible replay Salon thread from the category page.
10. `/developer-spaces/station-replay-dev-alpha`
11. `/pricing`

Signed-in owner route sweep:

1. `/login?redirect=/studio`
2. `/studio`
3. `/studio/onboarding`
4. `/space`
5. `/space/new` routeability only; do not submit.
6. `/studio/publish` routeability only; do not save, queue, or publish.
7. `/studio/assistant?prompt=Help%20me%20plan%20my%20first%20Space` prompt
   prefill only; do not send a message.
8. First visible private persona workspace from `/studio`.
9. That persona's Memory route.
10. That persona's Continuity route.
11. That persona's Archive/files route.
12. That persona's Integrity/calibration route.
13. `/studio/archive`
14. `/studio/publishing`
15. `/billing`
16. `/billing?success=1`
17. `/settings`, only for token/storage/account readback if useful.

Mobile critical subset:

1. `/`
2. `/discover`
3. `/space/station-replay-alpha`
4. First visible public document and linked forum discussion, if visible.
5. `/forums`
6. First visible replay Salon thread.
7. `/developer-spaces/station-replay-dev-alpha`
8. `/studio`
9. `/studio/onboarding`
10. First visible persona Memory, Continuity, Archive/files, and
    Integrity/calibration routes.
11. `/space`, `/space/new`, `/studio/publish`, and `/studio/assistant?prompt=...`
    as routeability/readability checks only.
12. `/billing` and `/billing?success=1`.

When a route requires a concrete document, thread, or persona ID, discover it
from visible links in the UI and do not record raw private IDs in the result.

## Pass / Caveat / Fail / Block Criteria

`PASS`

- Health/deployment checks are ready enough for a browser sweep.
- Public routes load, read coherently, and do not expose private owner data.
- Signed-in owner routes load from replay credentials without credential
  leakage.
- Desktop and mobile routes avoid document-level horizontal overflow,
  overlapping text, clipped primary content, and trapped controls.
- Mutation boundaries are respected.

`PASS WITH CAVEAT`

- The route loads and is safe, but seeded data lacks a specific optional label
  or fixture shape.
- A route is sign-in-gated or empty in an expected way.
- A transient hosted/network issue is retried successfully and the final route
  evidence is coherent.
- Browser output is useful but not broad enough to support a stronger claim.

`FAIL`

- A route returns persistent 5xx/404 for an expected current target.
- Login/session restore fails due to visible product behavior rather than
  missing local credentials.
- A page exposes private owner data, source bodies, raw private IDs, cookies,
  tokens, credentials, provider payloads, or secret-shaped values.
- Mobile has document-level horizontal overflow or unreadable/overlapping core
  content outside an intentionally scrollable container.
- Copy claims unavailable behavior such as automatic publishing, Assistant
  execution, live connector import, production API Bridge workers, or immediate
  billing activation.

`BLOCKED`

- Replay credential key names are missing locally.
- Railway web/API health is not ready enough to run the route sweep.
- The browser runner, network, or auth handoff fails before product evidence can
  be collected.
- Continuing would require printing secrets, cookies, tokens, raw private IDs,
  hosted logs, SQL, or private payloads.

## Known Caveats To Carry

- PR341 left a data-shape caveat: the visible hosted replay thread proves
  category/status labels, but may not prove optional kind/visibility chips if
  the selected thread does not carry those labels.
- Mobile top navigation may use an intended horizontal scroll container. Treat
  document-level overflow as the defect, not intentional nav scrolling.
- `/space/new` and `/studio/publish` are routeability/readability checks unless
  MIMIR explicitly scopes mutation.
- Station Assistant prompt links may prefill the textarea only. Do not click
  starter prompts or send messages unless explicitly scoped.
- Billing controls may be visible. Do not click Checkout, Upgrade, Activate,
  token top-up, or Billing Portal controls.
- Public Developer Space observatory checks should stay on public routes. Do
  not open owner manage routes or inspect ingestion keys.
- UX-08 durable onboarding progress, richer Assistant action chips, and
  publishing walkthrough state remain future work; their absence is not a
  UX-09 sweep failure.

## Mutation Boundaries

Do not:

- create Checkout sessions or open Billing Portal;
- mutate Stripe, entitlements, subscriptions, token credits, or billing state;
- create, edit, publish, queue, hide, delete, lock, report, or moderate content;
- create Spaces or Developer Spaces;
- upload/import files or start connector/OAuth flows;
- send Assistant messages;
- change visibility;
- expose or record credentials, cookies, bearer tokens, raw owner IDs, private
  source bodies, prompts, completions, hosted logs, SQL, provider payloads, or
  secret-shaped values;
- broaden into provider/model, Redis, Cloudflare, queue, worker, schema,
  migration, Railway config, Supabase admin, or database-admin work.

## Recommended PR352 ARIADNE Packet

```text
PR352 - UX-09 Railway staging browser sweep

Owner: ARIADNE

Goal:
Run a broad hosted Railway browser sweep for the current Station staging UX,
using the PR351 packet as the route/account/boundary source of truth.

Targets:
- https://stationweb-production.up.railway.app
- https://stationapi-production.up.railway.app

Credentials:
Use local ignored key names only:
- STATION_REPLAY_OWNER_EMAIL
- STATION_REPLAY_OWNER_PASSWORD

Do not print, screenshot, commit, summarize, or retain credential values,
cookies, bearer tokens, raw owner IDs, private payloads, hosted logs, SQL,
provider payloads, prompts, completions, Stripe IDs, or secret-shaped values.

Route order:
Use the route order from
docs/roadmap/PR351_UX09_RAILWAY_STAGING_SWEEP_PREP_RESULT.md.

Required coverage:
- Health/deployment readiness for web and API.
- Public signed-out desktop route sweep.
- Signed-in owner desktop route sweep.
- Mobile readability sweep at 375px or 390px for the critical subset.
- Privacy/secret hygiene.
- Mutation-boundary compliance.

Non-scope:
- No Checkout or Billing Portal.
- No publishing, Space creation, visibility mutation, Assistant send, file
  import/upload, connector/OAuth, forum posting, moderation action, schema,
  worker, provider/model, Redis, Cloudflare, queue, Railway config, or database
  admin work.

Result doc:
Create docs/roadmap/PR352_UX09_RAILWAY_STAGING_SWEEP_RESULT.md.

Verdict:
Use PASS, PASS WITH CAVEAT, FAIL, or BLOCKED from the PR351 criteria.

Wakeup:
- If PASS or PASS WITH CAVEAT, wake MIMIR with WAKEUP A1:.
- If a product repair is needed, wake DAEDALUS with WAKEUP A2: and include the
  smallest exact repair packet.
```

## Validation

Docs-only prep. No product code changed.

- `git diff --check` passed with CRLF normalization notices only.
