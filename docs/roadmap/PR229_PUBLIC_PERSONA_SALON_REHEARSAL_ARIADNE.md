# PR229 - Public Persona Salon Human Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR227 added public persona Salon readback. PR228 proved hosted Railway is fresh
and created one bounded public Salon thread linked to
`station-replay-alpha-persona`.

This lane is a human rehearsal. Use the deployed app the way a visitor would.
Do not redesign, do not broaden scope, and do not ask Marty to click through
what ARIADNE can verify directly.

## Target

Hosted Railway:

```text
https://stationweb-production.up.railway.app
```

Required deployment:

```text
e58a5e4
```

or any later commit containing PR227 and PR228 proof data.

Primary route:

```text
/personas/station-replay-alpha-persona
```

Context-preview query:

```text
cobalt salon lantern
```

Expected public Salon source title:

```text
[replay:staging-salon-alpha] Persona-linked Salon readback proof
```

## Required Rehearsal

1. Deployment freshness
   - Confirm web and API `/health/deployment` report `e58a5e4` or later.
   - If either service is stale and still deploying, wait and recheck.
   - If stale persists, wake MIMIR with the exact web/API commits.

2. Anonymous human route
   - Use an anonymous browser context first.
   - Start from `/discover` if practical, search or navigate to the public
     persona, then open `/personas/station-replay-alpha-persona`.
   - If Discover cannot find the persona, open the primary route directly and
     record the Discover gap without failing the Salon readback if the direct
     route works.

3. Context preview behavior
   - On the public persona page, enter `cobalt salon lantern` in the visitor
     context preview query field.
   - Trigger `Preview sources`.
   - Confirm the source counts include `Salon threads` with count `1`.
   - Confirm the source list includes `Public Salon thread` with the expected
     proof title.
   - Confirm the source excerpt is the bounded public proof phrase and does not
     look like private memory, archive, canon, continuity, integrity, or setup
     material.

4. Click-through
   - Click the public Salon source.
   - Confirm it opens the existing forum thread route under
     `/forums/station-replay-salon-alpha/...`.
   - Confirm the forum route is readable enough to prove the source is public
     Salon discussion.
   - Do not require new Salon tabs, new Salon routes, live rooms, event feeds,
     or provider output.

5. Desktop and mobile
   - Check desktop and around 375px mobile width.
   - The public persona header, context preview form, counts, source cards, and
     clicked forum route should not have clipped text, overlapping controls,
     unusable buttons, document-level horizontal overflow, or hidden source
     labels.

6. Public-safe boundary
   - The visible routes must not expose owner ids, raw persona ids outside the
     expected existing forum thread href shape, linked private ids,
     subcommunity ids, category ids, report internals, provider traces,
     prompts, private memory/archive/canon/continuity/integrity text, SQL
     details, tokens, service keys, stack traces, or raw JSON.
   - The copy must not imply live rooms, provider calls, public event feeds,
     persona-to-persona behavior, private companion memory, or access to
     owner-only context.

## Defect Routing

Wake MIMIR if:

- the result passes;
- deployment is stale;
- the seed/thread is missing despite PR228 proof;
- the next step is sequencing rather than a direct patch.

Wake DAEDALUS if:

- the public persona page fails to render the Salon count/source;
- the query control is broken;
- click-through to the forum thread route is broken;
- mobile/desktop layout has a concrete visible defect;
- source labels/copy make the experience feel broken or misleading.

Wake ARGUS only if:

- the visible route leaks private/raw data;
- community-only/private Salon content appears anonymously;
- the page implies private memory, provider calls, live rooms, event feeds, or
  persona-to-persona behavior.

## Output

Return one of:

```text
PASS
FAIL: product/code defect
FAIL: privacy/boundary defect
BLOCKED: stale deployment
BLOCKED: missing hosted seed
```

Include:

- web/API deployment commits;
- routes tested;
- desktop/mobile notes;
- whether the Salon count/source appeared;
- click-through result;
- public-safe boundary verdict;
- exact next wakeup target and reason.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR229 Public Persona Salon Human Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Evidence:
- <routes, Salon source/count, click-through, desktop/mobile, boundary notes>
Task:
- Decide the next lane and wake the right agent.
```
