# PR217 Public Persona Roulette Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: open

## Frame

PR216 added Public Persona Roulette as discovery/readback only:

- `GET /personas/public/roulette`;
- routeable public persona search results;
- a small Discover `Persona roulette` panel;
- no provider calls;
- no anonymous chat expansion;
- no event feeds or analytics expansion.

ARGUS accepted the boundary. This lane checks whether the deployed human
experience works and stays safe.

## Target

Primary deployed URL:

```text
https://stationweb-production.up.railway.app
```

Primary routes:

```text
/discover
/personas/:publicSlug
/personas/public/roulette
/discover/search
```

Expected public persona:

```text
station-replay-alpha-persona
```

## Required Rehearsal

1. Deployment freshness
   - Confirm web and API `/health/deployment` are fresh enough to include PR216
     / ARGUS patch `53ac0da` or later.
   - If stale, stop and wake MIMIR with the exact web/API commits.

2. Roulette API
   - Call the public roulette endpoint.
   - Confirm it returns a bounded set of routeable public persona cards.
   - Confirm the expected replay public persona can appear when deterministic
     seed/limit make it reachable, if the endpoint supports that.

3. Discover human path
   - Start at `/discover`.
   - Find the `Persona roulette` panel or equivalent affordance.
   - Use it to open a public persona page.
   - The page should be the existing public persona page, not a new chat or
     encounter surface.

4. Search routeability
   - Use public search for a replay/persona query.
   - Confirm public persona results appear as `Public personas` or equivalent
     grouping if data is available.
   - Click/open the result and confirm it routes through the safe public persona
     URL.

5. Boundary checks
   - Roulette/search/public page must not show raw persona ids, owner ids,
     unsafe UUID-shaped slugs, provider/setup fields, owner aggregate counters,
     report counts/statuses, private memory/archive/canon/continuity/integrity,
     private context buckets, or private source ids.
   - It must not imply Roulette itself calls a model or starts anonymous chat.

6. Desktop and mobile
   - Rehearse desktop.
   - Rehearse a narrow mobile viewport around 375px.
   - Confirm the Roulette panel/search results fit without overlap or
     document-level horizontal overflow.

## Defects To Name Exactly

Wake DAEDALUS if:

- deployed code is fresh but Roulette panel is missing or broken;
- roulette endpoint returns no routeable public personas when staging data has
  an eligible public persona;
- search results do not route public personas safely;
- mobile/desktop layout overlaps or controls are inaccessible;
- copy implies Roulette is a provider-call encounter or anonymous chat.

Wake ARGUS if:

- private/ineligible personas appear;
- raw ids, owner/private fields, unsafe UUID-shaped slugs, report/aggregate
  activity, provider traces, or private context appears;
- public search trusts an unsafe `href`.

Wake MIMIR if:

- the result is `PASS`;
- deployment is stale;
- the next step is a sequencing decision rather than a direct patch.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
FAIL: product/code defect
FAIL: privacy/boundary defect
```

Include:

- routes tested;
- deployment commits;
- roulette API result;
- Discover panel result;
- search routeability result;
- desktop/mobile notes;
- privacy verdict;
- exact next wakeup target.

## Wakeup

For a pass, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR217 Public Persona Roulette on deployed Railway.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR217 or route the smallest concrete follow-up.
```

## ARIADNE Result - 2026-06-24

Verdict:

```text
PASS
```

Routes tested:

- `/discover`
- `/personas/station-replay-alpha-persona`
- Web `/health/deployment`
- API `/health/deployment`
- API `GET /personas/public/roulette?limit=5&seed=station-replay-alpha-persona`
- API `GET /discover/search?q=Station%20Replay%20Alpha%20Persona`

Deployment commits:

- Web: `53ac0da`, branch `main`, ready `true`.
- API: `53ac0da`, branch `main`, ready `true`.

Roulette API result:

- Passed. The public roulette endpoint returned a bounded persona array and
  included the expected `Station Replay Alpha Persona` card.
- The card was routeable through `/personas/station-replay-alpha-persona`.
- The payload stayed in the public-card field set: name, short description,
  avatar URL, safe public slug, href, and public chat policy.

Discover panel result:

- Passed. The deployed `/discover` page showed `Persona roulette`.
- The roulette card opened the existing public persona page, not a new chat,
  encounter, provider-call, or event-feed surface.

Search routeability result:

- Passed. Public search for `Station Replay Alpha Persona` rendered a
  `Public personas` group.
- The search result routed to `/personas/station-replay-alpha-persona`.

Desktop/mobile notes:

- Desktop Discover, roulette, search results, and the public persona route fit
  without document-level horizontal overflow.
- At 375px mobile width, the roulette panel and public persona search result
  remained visible and usable with no document-level horizontal overflow.

Privacy verdict:

- Passed. No raw persona ids, owner ids, unsafe UUID-shaped slugs,
  provider/setup fields, owner aggregate counters, report status/count
  internals, private runtime context, private source ids, raw counters, or
  `publicInteraction` were exposed in the roulette/search/public-page
  rehearsal.
- Roulette stayed discovery/readback only; ARIADNE did not start anonymous chat,
  call a provider, create event feeds, or mutate data.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr217-public-persona-roulette-rehearsal.spec.js --reporter=line --workers=1`
  passed with 2 hosted browser/API checks.

Next wakeup target:

- Wake MIMIR to close PR217 or route the smallest concrete follow-up. No
  DAEDALUS or ARGUS patch is requested from this pass.
