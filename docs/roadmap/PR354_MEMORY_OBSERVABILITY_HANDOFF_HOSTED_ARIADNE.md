# PR354 - Memory Observability Handoff Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR353 Memory observability handoff.
- Persona Memory now has owner-only route-only handoff rows to Continuity, Archive/files, and Settings AI Activity.
- MIMIR needs hosted Railway desktop/mobile proof before treating the slice as deployed product truth.
Task:
- Rehearse the new Memory observability handoff on hosted Railway.
- Use replay-owner local .env credential key names only.
- Verify visibility, route-only behavior, privacy copy, and mobile readability.
- Create docs/roadmap/PR354_MEMORY_OBSERVABILITY_HANDOFF_HOSTED_RESULT.md.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Optional health readiness checks:

```text
https://stationweb-production.up.railway.app/health
https://stationweb-production.up.railway.app/health/deployment
```

Use local ignored `.env` key names only:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, screenshot, commit, summarize, or persist credential values,
cookies, bearer tokens, raw owner IDs, private payloads, hosted logs, SQL,
provider payloads, prompts, completions, Stripe IDs, raw trace bodies, or
secret-shaped values.

## Required Checks

Authentication:

- Sign in as the replay owner without printing credential values.
- Discover the first visible private persona from `/studio` or use the visible
  replay persona route if already available in the browser session.

Desktop Memory handoff:

- Open the persona Memory route.
- Confirm the Memory page loads authenticated owner content.
- Confirm the existing Runtime context / Memory explanation remains visible.
- Confirm the new `Observability handoff` section appears after the runtime
  explanation.
- Confirm it has three route-only handoff rows:
  - runtime provenance / Continuity;
  - archive source state / Archive/files;
  - sanitized AI activity / Settings AI Activity.
- Confirm copy does not imply observability changes memory truth.
- Confirm copy does not expose or promise raw prompts, completions, provider
  payloads, trace bodies, source bodies, raw IDs, or secret-shaped values.

Route-only behavior:

- Open the Continuity handoff and confirm it routes to the same persona's
  Continuity page without mutation.
- Open the Archive/files handoff and confirm it routes to the same persona's
  Archive/files page without mutation.
- Open the Settings AI Activity handoff and confirm it routes to Settings
  without mutation. It is enough if the AI Activity panel is visible on the
  Settings page; do not open trace detail unless needed for safe route proof.

Mobile:

- Repeat the Memory page check at a `375px` or `390px` viewport.
- Confirm the handoff section is readable, links are tappable, and there is no
  document-level horizontal overflow, clipped primary content, overlapping
  text, or trapped control.

## Non-Scope

Do not:

- mutate Memory lifecycle state;
- create memory, shared memory, Continuity records, imports, uploads, Spaces,
  public posts, forum posts, reports, subscriptions, Checkout sessions, Billing
  Portal sessions, or Assistant messages;
- change visibility, source readiness, lifecycle state, retrieval ranking,
  providers, Redis, Cloudflare, queues, workers, schema, migrations, Railway
  config, Supabase admin settings, or billing state;
- inspect raw trace detail, source bodies, compiled prompts, provider payloads,
  raw IDs, hosted logs, SQL, or secret-shaped values.

## Result Doc

Create:

```text
docs/roadmap/PR354_MEMORY_OBSERVABILITY_HANDOFF_HOSTED_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

If hosted proof passes or passes with caveat, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR354 Memory observability handoff hosted rehearsal.
Verdict:
- PASS or PASS WITH CAVEAT
Task:
- Close the hosted proof or choose the next roadmap move.
```

If product repair is needed, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE found a hosted Memory observability handoff defect.
Risk:
- Include route, viewport, visible symptom, and smallest repair scope.
Task:
- Patch only the named defect, validate, and wake ARGUS.
```
