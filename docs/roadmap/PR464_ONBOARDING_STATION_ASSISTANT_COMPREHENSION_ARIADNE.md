# PR464 - Onboarding and Station Assistant Comprehension Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR463 passed Discover/public/community polish:

`docs/roadmap/PR463_DISCOVER_PUBLIC_COMMUNITY_POLISH_CLOSEOUT.md`

Discern-to-Tex priority:

`docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_PLAN.md`

This is a hosted human-eye rehearsal. Use the product like a new user trying to
understand how to start and like a returning owner trying to use Station
Assistant without confusing it for a persona.

## Goal

Audit onboarding and Station Assistant comprehension on hosted Station and
return one concrete next lane.

This is not a broad onboarding redesign. The useful output is either
`PASS_WITH_NEXT_LANE` or one bounded DAEDALUS patch target.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR461 product/review commit `187996cd` or later for web/API
before judging product behavior. If Railway is still serving an older commit,
return `DEPLOYMENT_WAITING`.

## Route Set

Sample signed-out and replay-owner signed-in states where relevant. Keep the run
read-only.

Routes and stops:

1. `/`
2. sign-in/sign-up affordances, without submitting credentials
3. `/studio`
4. Studio dashboard entry points for New Persona, New Chat, Publish, and Public
   Space
5. Station Assistant surface or widget if visible
6. Fresh Start, Awakening, Document Migrator, or API Bridge onboarding paths if
   visible/naturally reachable
7. Settings or help surfaces linked from Station Assistant
8. persona Home only if onboarding routes point there

Check desktop plus one narrow mobile viewport around 390px.

Do not create accounts, submit credentials, create personas, start chats, run
imports, publish, upload, export, run provider setup, open billing checkout, or
call private model flows.

## Acceptance Gates

- New-user entry points explain how to start without pretending advanced backend
  capability is already configured.
- Returning-owner Studio entry points make it clear what action happens next.
- Station Assistant reads as an operational/help guide, not as one of the
  user's personas.
- Fresh Start, Awakening, Document Migrator, and API Bridge, if visible, explain
  their purpose and boundaries without overpromising.
- Private/public/archive/provider boundaries remain explicit.
- Empty/loading/error states encountered in onboarding routes explain what is
  absent without implying broken backend behavior.
- Desktop and mobile layouts remain readable without horizontal overflow,
  clipped controls, overlapping labels, or hidden primary actions.
- Visible text does not expose raw ids, prompts, private source bodies, provider
  payloads, credentials, storage paths, stack traces, payment secrets, or
  secret-shaped material.

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: onboarding and Station Assistant comprehension is good
  enough; recommend the next product-operation lane by name.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete onboarding/Assistant defect
  should be fixed next.
- `DEPLOYMENT_WAITING`: hosted runtime is stale.

If reporting a defect, include:

- route;
- viewport;
- action or state;
- expected behavior;
- actual behavior;
- smallest recommended DAEDALUS patch lane.

Do not commit screenshots, cookies, session values, raw owner ids, customer ids,
subscription ids, private source bodies, prompts, completions, provider keys,
stack traces, or raw network payloads.
