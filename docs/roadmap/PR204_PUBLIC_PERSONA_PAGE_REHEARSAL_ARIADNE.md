# PR204 Public Persona Page Rehearsal - ARIADNE

Date opened: 2026-06-23
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: blocked by deployment mismatch

## Frame

ARGUS-style review accepted the PR203 public persona page/readback safety
repair at `c898f82`. This rehearsal is a human-eye route check, not a new
implementation lane.

Use the public persona page as a public readback surface only. It must not feel
like visitor chat, a private Studio preview, provider/model debugging, or a
generic marketing page.

## Target

Railway staging:

```text
https://stationweb-production.up.railway.app
```

First confirm deployment freshness:

- Web `/health/deployment` should report `c898f82` or a later accepted app-code
  commit.
- API `/health/deployment` should report `c898f82` or a later accepted app-code
  commit.

If staging has not deployed the PR203 repair yet, wake MIMIR with the exact
deployment mismatch. Do not rehearse an older runtime and do not ask Marty to
check it manually.

## Route Order

Use an anonymous browser context first:

1. `/`
2. `/discover`
3. A public Space with a public persona card, if present.
4. The linked `/personas/:publicSlug` page.

If Discover/Space data has no public persona card, try to locate the public
persona page through public API/readback evidence. If staging has no usable
public persona seed, wake MIMIR with a seed/deploy gap. Do not mark the
rehearsal accepted without exercising a real public persona page.

Repeat the public persona page at desktop and mobile width.

## Pass Conditions

The visible public persona page must:

- open through a non-UUID-looking `/personas/:publicSlug` route;
- show only public profile/readback material: name, public short description,
  avatar/initials if present, public status, and private-boundary copy;
- not show owner ids, raw persona ids, provider/model/BYOK settings, private
  setup fields, prompts, memory, canon, archive, continuity, lifecycle data,
  traces, billing IDs, storage paths, cookies, tokens, or secret-shaped text;
- not show a chat composer, send button, visitor prompt box, analytics panel,
  owner controls, or private Studio actions;
- have clear navigation back to public Station surfaces without dead obvious
  controls;
- render without document-level horizontal overflow or text collision on mobile.

Also check the source public Space card:

- public persona card links should work when a safe slug is present;
- unsafe or missing persona routes should not create broken public buttons;
- no Space card JSON/readback should surface UUID-shaped public slugs or owner
  fields.

## Failure Handoff

If the page passes, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR204 public persona page readback.
Verdict:
- Accepted for current Phase 3 bridge.
Next:
- MIMIR should choose the next Phase 3 bridge slice.
```

If there is a visible/product blocker, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE found a PR204 public persona page rehearsal blocker.
Route:
- <exact URL and viewport/account role>
Expected:
- <expected visible behavior>
Actual:
- <actual visible behavior>
Task:
- Patch the narrowest public persona page/readback issue and wake ARGUS.
```

If the blocker is deployment freshness or missing staging seed, wake MIMIR
instead of DAEDALUS. That is orchestration, not implementation.

## Non-Scope

Do not open:

- visitor chat;
- visitor-safe model context assembly;
- provider calls;
- embeddings, Redis, Cloudflare, worker, queue, or cache architecture;
- billing/Stripe;
- analytics;
- broad public-site redesign;
- Archive trust UX;
- Roulette, Salons, voice/avatar, or persona-to-persona interaction.

## ARIADNE Result - 2026-06-24

Verdict: blocked by deployment freshness mismatch.

PR204 requires Railway web and API `/health/deployment` to report `c898f82` or
a later accepted app-code commit before the public persona page rehearsal runs.
Both services reported deployment commit `e333acac49de00612397a0aa73798fd7e5dcdd5b`.
Local git comparison showed `c898f82` is not an ancestor of that deployment
commit, and the deployment commit resolves locally as an older notifications UI
review commit.

Because staging is not on the PR203 repair lineage, ARIADNE did not rehearse
the anonymous public persona page. Rehearsing the older runtime would produce a
false product verdict.

Deployment evidence:

- Web `/health/deployment`: `ok:true`, `ready:true`, branch `main`, service
  `@station/web`, commit `e333acac49de00612397a0aa73798fd7e5dcdd5b`.
- API `/health/deployment`: `ok:true`, `ready:true`, branch `main`, service
  `@station/api`, commit `e333acac49de00612397a0aa73798fd7e5dcdd5b`.
- Expected: `c898f82` or later accepted app-code commit.
- Local ancestry check: `c898f82` is not an ancestor of the reported deployment
  commit.

Next:

- MIMIR should resolve the Railway deployment mismatch or explicitly identify a
  later accepted app-code deployment that contains the PR203 repair, then wake
  ARIADNE to rerun PR204.
- DAEDALUS is not needed from this result because no visible route/product
  blocker was exercised.
