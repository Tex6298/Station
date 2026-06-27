# PR399 - Station Assistant Action Map Refresh

Owner: DAEDALUS

Date: 2026-06-27

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR398; public writing/publish-and-retract is closed with honest caveats.
- Station Assistant is the next operational guide surface likely to drift after the publish/retract work.
- Current code already has /assistant/summary, /assistant/message, and Studio action cards; this lane is a refresh, not a rebuild.
Task:
- Inspect the Station Assistant summary/message/action map and patch the smallest stale guidance gaps.
- Wake ARGUS if code changes; wake MIMIR if map-only. Do not go idle without a wakeup commit.
```

## Context

PR397/PR398 closed the public-writing protected-alpha proof:

- owner creates a public-safe draft through Studio publish;
- approval publish makes public document and linked discussion readback work;
- `Retract to private` hides the document and linked discussion from public
  reads;
- owner-private readback remains;
- hard-delete cleanup and artifact removal remain unproved and out of scope.

Station Assistant should now reflect that reality. It is allowed to guide
owners through archive, publishing, continuity, export, onboarding, billing, and
Space setup, but it must not act like a persona or an autonomous executor.

## Product Goal

Keep the operational assistant useful and current:

- route owners to real live surfaces;
- explain what is proved and owner-controlled;
- avoid stale claims about cleanup, automatic publishing, autonomous action, or
  future-only workflows;
- keep public/private and provenance boundaries clear.

## Primary Surfaces

Inspect and patch only where the current implementation proves a stale or weak
action map:

- `apps/api/src/services/station-assistant.service.ts`
- `apps/api/src/services/station-assistant.service.test.ts`
- `apps/api/src/routes/assistant.ts`
- `apps/web/components/studio/station-assistant-panel.tsx`
- `apps/web/lib/station-assistant-ui.ts`
- `apps/web/lib/station-assistant-ui.test.ts`
- any route-local copy needed only to make an action card land somewhere real

## Required Checks

Confirm whether the Assistant currently:

- routes draft review and publish work to `/studio/publishing` or
  `/studio/publish` as appropriate;
- describes publishing as private draft, provenance, owner review, approval
  publish, public readback, linked discussion readback, and retract-to-private;
- avoids saying retract is deletion, cleanup, or artifact removal;
- offers export guidance through a real owner export surface;
- points archive/import work to real private archive or persona-file surfaces;
- points continuity/integrity work to real persona continuity surfaces;
- points quota/billing guidance to real settings or billing surfaces;
- marks future-only or unavailable work honestly instead of presenting it as
  live;
- keeps Assistant operational, not persona-like, roleplay-like, or autonomous.

## Allowed Work

DAEDALUS may implement a small code/test patch if inspection finds stale
Assistant guidance or broken action cards.

Good fixes include:

- action copy that reflects publish-and-retract truth;
- action routes that land on existing pages;
- tested helper labels/status copy;
- intent replies that distinguish draft review, public readback, linked
  discussion, and retract-to-private;
- honest deferred/preview wording for unavailable actions.

## Non-Scope

Do not add or change:

- provider/model calls;
- autonomous Assistant execution or tool execution;
- hosted public mutation;
- hard-delete cleanup;
- Station Press, social dispatch, scheduling, or rich text editing;
- billing/Stripe mutation;
- Redis, Cloudflare, workers, queues, or cache behavior;
- schema or migrations;
- broad visual redesign.

Do not claim Station Assistant publishes, retracts, deletes, creates Spaces,
changes visibility, runs imports, or changes billing automatically.

## Validation

Run focused checks for touched files:

```text
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If the result is docs/map-only, `git diff --check` is enough; explain why no
runtime validation was needed.

## Required Result

Create:

```text
docs/roadmap/PR399_STATION_ASSISTANT_ACTION_MAP_REFRESH_RESULT.md
```

Include:

- what was stale or already current;
- changed files;
- exact action-map behavior after the patch;
- preserved boundaries;
- validation results;
- whether ARGUS should review code or MIMIR should choose the next lane.
