# PR192 - Memory Continuity Observability UX First Slice

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS; implemented narrowly by MIMIR after A2 no-response
Reviewer: ARGUS
Rehearsal: ARIADNE after visible route changes
Status: implemented by MIMIR; awaiting ARGUS review

## Why This Lane

Phase 2E Developer Agent boundary work is bounded enough for now. The next
product priority returns to Station's core promise: memory, continuity, and
observable project evidence should feel legible to a human using the product,
not only visible as counts or internal readbacks.

Current source truth points to the same gap repeatedly:

- Memory, Canon, Archive, Integrity, and Continuity already feed runtime
  context.
- The human route checks called out Continuity as needing its own stop, not just
  runtime-context counts.
- The upstream/Discern review says to finish Station-native memory lifecycle,
  evidence, and observability structures rather than importing another memory
  system.
- Developer Space public observatories have live state, but methodology and
  field-log storytelling are still thin.

## Goal

Make the existing memory/continuity/observability work easier to inspect without
adding new backend policy or provider dependencies.

The owner or visitor should be able to answer:

- what continuity material exists for a persona;
- which memory/archive/canon/integrity source shaped the visible context;
- which items are active, rejected, quarantined, expired, or otherwise bounded;
- what evidence is public, owner-only, synthetic, or imported;
- why a Developer Space is showing live state and where its field/method notes
  live.

## Scope

DAEDALUS should inspect the current Studio persona route, Memory tab,
Continuity/runtime-context UI, Archive tab, Developer Space public route,
Developer Space manage route, and existing web/API tests before changing code.

Expected first slice:

- Add or restore Continuity as a first-class persona stop if the route currently
  only exposes it as runtime-context counts.
- Render existing continuity records/candidates with provenance/source labels
  and safe empty states.
- Improve memory readback from existing lifecycle/status/evidence fields without
  changing memory truth or retrieval semantics.
- Add a small Developer Space observability storytelling improvement using
  existing public-safe fields: methodology, field-log/public-note linkage, or a
  clearer empty/thin-state explanation.
- Keep all copy concrete and product-facing; avoid generic dashboard filler.
- Add focused tests for the changed route/data helpers.

## Boundaries

Do not:

- add schema, migrations, provider calls, embedding changes, Redis/Upstash,
  Cloudflare, workers, queues, billing, auth/session rewrites, or deployment
  config;
- widen owner/private visibility;
- change retrieval ranking, memory truth, lifecycle semantics, or archive
  authorization;
- import Discern UI code wholesale;
- make broad site-wide restyles in this lane.

Allowed:

- web/API helper changes needed to expose already-authorized existing fields;
- route UI changes on persona Memory/Continuity and Developer Space public or
  manage surfaces;
- focused tests and docs updates;
- ARIADNE human-eye rehearsal after visible changes.

## Validation

Required:

- route/helper tests touched by the implementation;
- `git diff --check`.

If web route/client helpers change:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-client`
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client`

If API serializers change:

- run the focused API suite covering the changed endpoints.

ARGUS should review owner/public visibility boundaries, lifecycle/status truth,
no retrieval/provider/config drift, public cleanliness, and whether ARIADNE
needs a human rehearsal before MIMIR accepts the lane.

## MIMIR Implementation Result

Completed on 2026-06-23 after no downstream commit landed from DAEDALUS after
the initial PR192 wakeup and one restart wakeup.

Implemented:

- Moved persona workspace tab definitions into the tested Studio navigation
  helper.
- Changed the persona workspace tab label from `Timeline` to `Continuity` while
  keeping the existing `/studio/personas/:id/continuity` route.
- Changed the home summary card from `Timeline` to `Continuity`.
- Changed continuity route section/form language from timeline-first copy to
  Continuity/Continuity Marker copy.
- Changed the `timeline` continuity record display label to
  `Continuity marker`.
- Added focused tests proving the persona workspace exposes Continuity as its
  own stop and no `Timeline` tab label remains.

Observed existing scope already present:

- Memory lifecycle/evidence readback is already backed by
  `memory-lifecycle-ui` helpers and the Memory page runtime/lifecycle review.
- Developer Space methodology, field-log, evidence ordering, and thin-state copy
  are already present through `developerSpaceMethodologyCopy`,
  `EvidenceReadingPath`, and the public observatory reading guide.

Validation:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/continuity-ui.test.ts`
  passed, 7 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:continuity` passed, 5 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed, 103 tests.
- `git diff --check` passed with CRLF normalization warnings only.

Remaining review:

- ARGUS should verify the narrow MIMIR implementation did not overclaim the
  broader PR192 lane, that the continuity route is now discoverable as
  Continuity, and that existing memory/Developer Space observability coverage is
  correctly described.
