# PR348 - UX-08 Onboarding Assistant State Map

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR347 passed authenticated hosted Billing display proof.
- UX-07 Billing/Pricing display proof is closed for this slice.
- MIMIR is moving to UX-08 Onboarding and Station Assistant.
Task:
- Map current onboarding and Station Assistant surfaces against UX-08.
- Do not rebuild old PR73 accepted work by inertia.
- Identify the smallest safe next product-depth slice.
- If one low-risk implementation is obvious, land it and wake ARGUS; otherwise wake MIMIR with the exact next packet.
```

## Product Intent

UX-08 should help users enter Station without overload. The product should make
the four entry modes legible, point people to the first real action, and keep
Station Assistant operational rather than persona-like.

Known accepted baseline:

- Earlier PR73 work made Fresh Start, Awakening, Document Migrator, and API
  Bridge alpha-routeable through real Station routes.
- Station Assistant already has an operational surface and should not be
  presented as a persona, companion, autonomous agent, therapist, or mystical
  authority.

This lane should identify what is still missing from UX-08 now, not repeat
already accepted routeability work.

## Scope

Map current state for:

- `/studio/onboarding`;
- `/studio/assistant`;
- `apps/web/lib/onboarding-paths.ts`;
- `apps/web/lib/station-assistant-ui.ts`;
- `apps/web/components/studio/station-assistant-panel.tsx`;
- `apps/web/components/studio/awakening-flow.tsx`;
- first persona creation route and path parameters;
- first archive/import step;
- first Integrity Session entry point;
- first Space/public publishing entry point;
- Assistant handoff links or prompt-prefill behavior;
- signed-out privacy boundaries for onboarding and Assistant routes.

Compare against UX-08 requirements:

- API Bridge;
- Document Migrator;
- Awakening;
- Fresh Start;
- onboarding path choice;
- first archive/import step;
- first Integrity Session;
- first Space;
- Station Assistant as operational guide.

## Implementation Option

If one low-risk product-depth slice is obvious, DAEDALUS may implement it.

Good candidates are narrow:

- improve route-local empty/next-action copy for one onboarding path;
- make an existing first-step link clearer or less generic;
- improve Assistant operational handoff text without auto-sending prompts;
- add tested helper copy that clarifies alpha route status without false
  transfer/import/API claims.

If the next useful work requires new routes, new backend state, import
pipelines, provider calls, file upload behavior, or Assistant tool execution,
do not implement it in PR348. Return a precise PR349 recommendation instead.

## Non-Scope

Do not add or change:

- provider/model calls;
- streaming Assistant behavior;
- autonomous Assistant execution;
- file upload/import pipelines;
- external connector integrations;
- API Bridge credentials or secret handling;
- schema or migrations;
- auth/session behavior;
- billing, Stripe, Redis, Cloudflare, queues, or workers;
- public launch or commercial claims;
- broad visual redesign.

Do not make false persona-transfer, archive-import, API-ingestion, or
ontological claims.

## Validation

Use the narrowest checks justified by the result:

```text
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If only a docs/source map lands, `git diff --check` is enough; explain why no
runtime validation was needed.

## Required Result

Create:

```text
docs/roadmap/PR348_UX08_ONBOARDING_ASSISTANT_STATE_MAP_RESULT.md
```

Include:

- current surface map;
- what PR73 already covers;
- UX-08 gaps still present;
- any code changes and validation;
- exact next packet recommendation;
- whether ARGUS or MIMIR should own the next wakeup.
