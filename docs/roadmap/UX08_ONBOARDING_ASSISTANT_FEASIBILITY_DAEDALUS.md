# UX-08 Onboarding And Station Assistant Feasibility

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for any implementation slice
Status: COMPLETE - WAKE MIMIR
Opened: 2026-06-27
Completed: 2026-06-27

## Why This Opens

UX-07A Settings Tier Snapshot Readback is accepted after DAEDALUS
implementation, ARGUS technical review, ARIADNE visible rehearsal, and ARGUS
visible-pass review.

The next unresolved roadmap lane is UX-08: Onboarding and Station Assistant.
This lane already has substantial accepted history. Start with current-state
reconciliation so Station does not rebuild solved onboarding work or let older
notes drag the product backward.

## Product Question

Can a new or returning signed-in user understand which first path fits them,
where that path safely goes, what Station Assistant can explain, and what
Station Assistant cannot do automatically?

Answer from current `main` and current docs before recommending any patch.

## Inputs

Read and reconcile:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/PR25_FOUR_ONBOARDING_PATHS_ALPHA.md`
- `docs/roadmap/PR73_ONBOARDING_ASSISTANT_DEPTH.md`
- `docs/roadmap/PR73_ONBOARDING_ASSISTANT_DEPTH_ARIADNE.md`
- `docs/roadmap/PR348_UX08_ONBOARDING_ASSISTANT_STATE_MAP_RESULT.md`
- `docs/roadmap/PR349_UX08_FIRST_SPACE_PUBLISHING_ENTRYPOINT_RESULT.md`
- `docs/roadmap/PR350_UX08_ONBOARDING_PUBLIC_STEP_HOSTED_REHEARSAL_RESULT.md`
- `docs/roadmap/PR399_STATION_ASSISTANT_ACTION_MAP_REFRESH_RESULT.md`
- `docs/roadmap/PR403_ONBOARDING_MIGRATOR_API_BRIDGE_DEPTH_RESULT.md`
- `docs/roadmap/PR404_ONBOARDING_MIGRATOR_API_BRIDGE_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`
- current `docs/testing/VALIDATION_BASELINE.md`
- current onboarding, Assistant, Studio, import/review, Developer Space, Space,
  and publishing code touched by those docs

## Likely Surfaces

- `/studio/onboarding`
- `/studio/assistant`
- `/studio/new?path=...`
- `/studio/personas/[personaId]/files`
- `/studio/personas/[personaId]/calibration`
- `/developer-spaces`
- `/developer-spaces/[slug]/manage`
- `/space`
- `/space/new`
- `/studio/publish`

Likely files:

- `apps/web/app/studio/onboarding/page.tsx`
- `apps/web/app/studio/assistant/page.tsx`
- `apps/web/lib/onboarding-paths.ts`
- `apps/web/lib/onboarding-paths.test.ts`
- `apps/web/lib/station-assistant-ui.test.ts`
- `apps/api/src/services/station-assistant.service.ts`
- `apps/api/src/services/station-assistant.service.test.ts`

Inspect more only if imports/current route shape require it.

## What To Classify

Classify each area as solved, stale, fragile, deferred, or recommended next
slice:

- Fresh Start route, first step, and Assistant handoff;
- Awakening route, first step, and Assistant handoff;
- Document Migrator state-aware routing and Import Review handoff;
- API Bridge state-aware routing and Developer Space manage handoff;
- first Space/public publishing onboarding step;
- Station Assistant prompt-prefill behavior;
- Station Assistant operational action map and next actions;
- signed-out boundaries for onboarding and Assistant;
- mobile 375px/390px fit and copy density;
- empty/loading/error states;
- no-autonomy/no-persona/no-transfer/no-connector/no-secret claims;
- hosted evidence freshness from PR350/PR404 versus local-only evidence;
- remaining gap between alpha route map and mature onboarding wizard.

## Hard Boundaries

Do not change in this feasibility pass:

- auth/session semantics;
- archive import/parser behavior, live connector OAuth/API pulls, recurring
  imports, upload behavior, or candidate mutation;
- Developer Space ingestion-key generation or secret handling;
- Space creation, publication, visibility, approval, publish/retract, or public
  route behavior;
- Station Assistant backend execution, provider/model calls, autonomous actions,
  tool calling, or persisted setup state;
- schema, migrations, billing, Stripe, token credits, storage quota, Redis,
  Cloudflare, Railway, Supabase, workers, queues, package files, or deploy
  behavior;
- broad Studio redesign or generic Discern parity.

No implementation should happen in this feasibility pass.

## Output Required

Create:

```text
docs/roadmap/UX08_ONBOARDING_ASSISTANT_FEASIBILITY_RESULT.md
```

Include:

- current route/component/API map;
- accepted evidence to keep from PR25, PR73, PR348, PR349, PR350, PR399,
  PR403, and PR404;
- stale assumptions or docs to stop following;
- current visible state matrix for signed-out, signed-in no-persona,
  signed-in with persona/archive state, signed-in with Developer Space, and
  first Space/public publishing;
- exact caveats that remain acceptable for protected alpha;
- recommendation: no implementation, evidence-only rehearsal, or one narrow
  implementation slice;
- ARGUS gates for any recommended slice;
- ARIADNE human rehearsal points.

If no implementation is needed, say so plainly and name the next roadmap lane.
If a slice is recommended, keep it small enough for hostile review and visible
rehearsal.

## Validation For This Feasibility Pass

Run:

```bash
git diff --check
```

Also run an added-line sensitive-pattern scan for the docs-only patch before
committing.

Do not run live imports, create Developer Space keys, publish/retract, click
Stripe/payment controls, trigger provider calls, or mutate hosted data in this
feasibility pass.

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed UX-08 Onboarding and Station Assistant feasibility.
- Current onboarding, Assistant, Document Migrator, API Bridge, first Space,
  and publishing evidence is classified.
Task:
- Decide whether to close UX-08, open the recommended slice, request evidence,
  or move to the next roadmap lane.
```

## Result

DAEDALUS completed the reconciliation in
`docs/roadmap/UX08_ONBOARDING_ASSISTANT_FEASIBILITY_RESULT.md`.

Recommendation: do not rebuild onboarding or Station Assistant. Open only the
tiny `UX-08A Persona Creation Provider Copy` slice if MIMIR agrees that the
persona creation channel step should be fixed before UX-09 staging review.
