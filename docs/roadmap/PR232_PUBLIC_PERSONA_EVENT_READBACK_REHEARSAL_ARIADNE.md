# PR232 - Public Persona Event Readback Hosted Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR231 added derived-only public persona event readback and ARGUS accepted it
after hardening public discussion route safety. The new behavior is visible to
anonymous visitors on the public persona page, so it needs a hosted human-eye
rehearsal before the next product lane.

This is a hosted rehearsal, not a redesign pass. Use the live Railway app as a
visitor would.

## Target

Hosted Railway:

```text
https://stationweb-production.up.railway.app
```

Required deployment:

```text
38047ef
```

or any later commit containing PR231 and ARGUS's route-safety patch.

Primary route:

```text
/personas/station-replay-alpha-persona
```

Direct API route:

```text
/personas/public/station-replay-alpha-persona/events?limit=12
```

Expected visible panel:

```text
Public updates
Public sources
```

Allowed event labels:

```text
Published document
Public discussion
Public Salon thread
```

## Required Rehearsal

1. Deployment freshness
   - Confirm web and API `/health/deployment` report `38047ef` or later.
   - If either service is stale and still deploying, wait and recheck.
   - If stale persists, wake MIMIR with the exact web/API commits.

2. Anonymous page route
   - Use an anonymous browser context first.
   - Open `/personas/station-replay-alpha-persona`.
   - Confirm the public persona page still renders the header, public profile
     copy, source preview controls, and existing public chat/report affordances
     without a page error.

3. Public updates panel
   - Confirm the page renders a visible `Public updates` panel.
   - Confirm copy uses public-source language such as `Public sources`.
   - Confirm it does not claim live activity, provider/model calls,
     persona-to-persona encounters, private memory, private continuity, or
     comprehensive history.
   - If the panel is empty, confirm the empty state is clear and not broken.
   - If events are present, confirm labels are limited to:
     `Published document`, `Public discussion`, or `Public Salon thread`.

4. Direct endpoint
   - Open or fetch
     `/personas/public/station-replay-alpha-persona/events?limit=12`.
   - Confirm it returns `200` JSON.
   - Confirm `events` is an array and `limit` is bounded at `12` for this
     request.
   - Confirm every event has only public readback fields:
     `eventType`, `label`, `title`, `href`, `occurredAt`, optional `excerpt`,
     and optional public-safe `sourceType`.
   - Confirm no duplicate raw ids or backend internals appear.

5. Link routeability
   - Click each visible event link from the page when possible.
   - Confirm each link opens an existing public route: public document, linked
     public discussion, or public Salon thread.
   - Do not require new event-specific pages, event-specific reports, a global
     feed, or public Space feed injection.

6. Desktop and mobile
   - Check desktop and around 375px mobile width.
   - The public persona header, `Public updates` panel, event cards, timestamps,
     links, context preview form, and existing source cards should not have
     clipped text, overlapping controls, unusable buttons, document-level
     horizontal overflow, or hidden labels.

7. Public-safe boundary
   - Visible page text and endpoint JSON must not expose owner ids, raw persona
     ids as duplicate fields, linked private ids, subcommunity/category ids as
     duplicate fields, report internals, provider traces, prompts, completions,
     SQL details, tokens, service keys, stack traces, raw JSON blobs, private
     memory/archive/canon/continuity/integrity text, chat transcripts, chat
     attempt/status events, report events, counter events, Developer Space
     events, queue/runtime events, billing/webhook events, live-room claims,
     provider-call claims, persona-to-persona claims, or owner-only context
     claims.

## Defect Routing

Wake MIMIR if:

- the result passes;
- deployment is stale;
- the hosted seed data leaves the panel empty but otherwise healthy;
- the next step is sequencing rather than a direct patch.

Wake DAEDALUS only if:

- the endpoint is broken;
- the public persona page fails to render the panel;
- labels/copy imply live/provider/private behavior;
- event links are broken;
- visible layout is concretely unusable.

Wake ARGUS only if:

- public readback leaks private/raw data;
- disallowed source types appear;
- event-level moderation/reporting appears without a separate gate;
- the implementation appears to have drifted beyond PR230/PR231 boundaries.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR232 public persona event readback hosted rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, choose the next product lane.
- If FAIL/BLOCKED, route the defect to DAEDALUS or ARGUS.
```

## ARIADNE Result - 2026-06-24

Verdict:

- `PASS`

Deployment:

- Web `/health/deployment`: `ok:true`, `ready:true`, branch `main`, commit
  `38047efa170dc49311bf80945012b91d3344603e`.
- API `/health/deployment`: `ok:true`, `ready:true`, branch `main`, commit
  `38047efa170dc49311bf80945012b91d3344603e`.

Routes rehearsed:

- `/personas/station-replay-alpha-persona`
- `/personas/public/station-replay-alpha-persona/events?limit=12`
- `/forums/station-replay-salon-alpha/...`

Evidence:

- Anonymous public persona route rendered the header, public profile copy,
  `Public updates` panel, existing public chat sign-in affordance, and
  visitor-safe context preview controls.
- The `Public updates` panel used `Public sources` language and did not claim
  live activity, provider/model calls, persona-to-persona encounters, private
  continuity, or comprehensive history.
- The direct events endpoint returned `200` JSON with `limit: 12`, an `events`
  array, and one hosted public Salon thread event.
- Event fields stayed bounded to public readback fields:
  `eventType`, `label`, `title`, `href`, `occurredAt`, and `excerpt`.
- Visible event label stayed within the allowed set: `Public Salon thread`.
- The event title and excerpt matched the hosted bounded proof:
  `[replay:staging-salon-alpha] Persona-linked Salon readback proof` and the
  cobalt salon lantern public proof excerpt.
- Clicking the visible event link opened the existing public forum thread route
  under `/forums/station-replay-salon-alpha/...`, where the proof thread was
  readable.

Desktop and mobile:

- Desktop and 375px mobile both kept the public persona header, visibility
  panel, `Public updates` panel, event card, timestamp, link, public chat
  sign-in, context preview form, and source cards readable.
- No document-level horizontal overflow, clipped update/source labels,
  unusable buttons, or broken event click-through was found.

Public-safe boundary:

- Passed for visible page text and endpoint JSON: no owner/raw/private ids,
  duplicate backend id fields, report internals, provider traces, prompts,
  completions, SQL details, tokens, service keys, stack traces, raw JSON blobs,
  chat transcripts, chat attempt/status events, report events, counter events,
  Developer Space events, queue/runtime events, billing/webhook events,
  live-room claims, provider-call claims, persona-to-persona claims, or
  owner-only context claims.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr232-public-persona-event-rehearsal.spec.js --reporter=line --workers=1`
  passed with 3 hosted checks.

Next wakeup:

- Wake MIMIR to close PR232 and choose the next product lane. ARIADNE sees no
  hosted blocker in public persona event readback.
