# Discern-to-Tex UI import audit

Date: 2026-06-11
Auditor: MIMIR

Status: read-only audit. No code was imported.

## Audit header

```text
Tex base: fork/main @ 81c9aefd100a7794a92b9821eb725f430398418a
Local MIMIR head: main @ 6aa395874f2b35b9e75f9724bdc392085a618d12
Discern source: origin/main @ 037d491d58f87170b6eb82dfef085215da9ac355
Fetch time: 2026-06-11T12:13:09+01:00
Stale-source note: earlier chat/checklist candidates are non-authoritative
unless confirmed in this diff.
```

Discern moved during this lane:

```text
origin/main 269ad48..037d491
```

This audit therefore supersedes the initial chat checklist as the source of
truth for what can be considered.

## MIMIR verdict

Discern's current `origin/main` is not a UI-only improvement branch. It mixes
usable product ideas with large protected-area drift:

- web surface redesign and onboarding ideas;
- notes/global-archive backend work;
- rich-editor dependency additions;
- Railway deployment simplification away from the current service-aware setup;
- deletion of web health and password-reset update routes;
- deletion of readiness/replay-health services and tests;
- deletion of retrieval/cache/provider proof work, including migration `029`;
- migration-number conflicts with the current Tex staging lane.

Do not merge or patch wholesale from Discern.

The safe path is:

1. ARIADNE reviews this audit for product value.
2. MIMIR opens one bounded slice.
3. DAEDALUS ports only that slice into current Tex patterns.
4. ARGUS validates protected boundaries, tests, privacy language, and staging
   assumptions.

## Protected rejects

These Discern changes must not be imported through the UI lane.

| Change | Classification | Reason |
| --- | --- | --- |
| `railway.json`, `scripts/railway-build.mjs`, `scripts/railway-start.mjs` | Backend/config/payment/model/embedding: reject | Discern removes the service-aware Railway web/API deployment shape and reverts to API-only commands. Tex needs the current Railway split. |
| `apps/web/app/health/route.ts` deletion | Backend/config/payment/model/embedding: reject | Railway web health is part of current staging proof. |
| `apps/web/app/reset-password/update/page.tsx` deletion | Backend/config/payment/model/embedding: reject | Tex explicitly needs the reset-password target allowed in Supabase redirects. |
| `apps/web/lib/password-reset.ts` and `apps/web/lib/password-reset.test.ts` deletion | Backend/config/payment/model/embedding: reject | Auth reset behavior is protected and already tested in Tex. |
| `apps/api/src/services/readiness.service.ts`, `apps/api/src/services/replay-readiness.service.ts`, related tests deletion | Backend/config/payment/model/embedding: reject | These are the current staging/replay proof surfaces. Removing them would hide blockers. |
| `apps/api/src/services/operational-cache.service.ts` deletion | Backend/config/payment/model/embedding: reject | Upstash/Redis cache readiness is now active staging support. |
| `packages/ai/src/retrieval/cloudflare-adapter.ts` deletion | Backend/config/payment/model/embedding: reject | Cloudflare retrieval remains a future/optional adapter decision, not something to erase via UI import. |
| `packages/ai/src/retrieval/archive-retrieval.ts` deletion | Backend/config/payment/model/embedding: reject | Private archive retrieval is an active backend concern. |
| `infra/supabase/migrations/025-029` deletion/replacement | Backend/config/payment/model/embedding: reject | Direct conflict with current Tex migration timeline and migration `029` proof lane. |
| `package.json` test script deletions | Backend/config/payment/model/embedding: reject | Removes health/replay/archive test coverage used by the current staging lane. |
| `pnpm-lock.yaml` broad drift | Needs human decision | Only acceptable inside a specific dependency lane, not a UI import. |
| `apps/api/src/routes/threads.ts` exposing moderation actions to all readers | Backend/config/payment/model/embedding: reject | Discern removes the admin-only guard in the diff. That is a privacy/moderation leak. |

## Candidate slices

| File / Change | Area | Classification | Reason | Proposed Action |
| --- | --- | --- | --- | --- |
| `docs/product/onboarding-integrity-sessions.md` | Product/onboarding | Docs-only alignment | Strong product framing: onboarding as first integrity session, kindling, import/fresh-start paths. No runtime dependency if copied as docs. | Send to ARIADNE first. Good first low-risk slice if accepted. |
| `apps/web/lib/onboarding/companion-kindling.ts`, `apps/web/lib/onboarding/station-flow.ts` | Onboarding UX model | UI/UX but needs Tex adaptation | Useful flow vocabulary, but ties to persona metadata/migrations not present in Tex staging. | Defer until ARIADNE accepts product shape and MIMIR opens onboarding/backend slice. |
| `apps/web/components/studio/awakening-flow.tsx` | Onboarding UX | UI/UX but needs Tex adaptation | Likely contains improved kindling flow, but too large and mixed with new metadata assumptions. | ARIADNE review only; DAEDALUS should not direct-port. |
| `apps/web/components/discover/discover-page.tsx`, `public-home.tsx`, `feed-shared.ts`, `search-dropdown.tsx`, `apps/web/lib/use-station-search.ts` | Discover/public front door | UI/UX but needs Tex adaptation | Stronger public discovery direction, search dropdown, Developer Space emphasis. Depends on broad `globals.css`, icon classes, fallback content, and existing API shapes. | Candidate after ARIADNE review. Must be rebuilt in Tex style and tested. |
| `apps/web/components/nav/left-rail.tsx`, `top-nav.tsx` | Navigation | UI/UX but needs Tex adaptation | Left rail could improve wayfinding on public surfaces. Current links include routes Tex may not have or may protect differently. | Candidate only as design pattern; no direct copy until route audit. |
| `apps/web/components/studio/archive-library.tsx` | Archive UX | UI/UX but needs Tex adaptation | Moves archive from static placeholder to live `/notes/archive/global`; useful concept but backend route/schema are new and conflict with active migration numbering. | Defer to notes/archive backend lane. |
| `apps/api/src/routes/notes.ts`, `infra/supabase/migrations/025_notes_and_archive.sql` | Notes/global archive | Needs human decision | Product-useful scratchpad/global archive idea, but it is backend/schema work, not UI import. Migration number conflicts with Tex. | Future backend lane after migration `029` is resolved. |
| `apps/web/components/studio/notes-scratchpad.tsx`, Yoopta packages | Notes editor | Needs human decision | Rich note editor may be valuable but adds dependencies and requires notes API/schema. | Future dependency/backend/UI lane, not first import. |
| `apps/web/components/studio/persona-chat.tsx` | Chat UX | UI/UX but needs Tex adaptation | May include per-message save/pin affordances that could align with notes/memory. Needs privacy and backend review. | Defer until notes/memory target is accepted. |
| `apps/web/app/signup/page.tsx`, `apps/web/app/page.tsx` | Entry/onboarding | UI/UX but needs Tex adaptation | May better connect signup to kindling and public Station identity. Needs auth/onboarding guardrail. | ARIADNE review; likely later than docs/product slice. |

## Recommended order

Current staging priority still comes first:

1. Finish Railway env visibility and remote readiness proof.
2. Apply/prove migration `029` or explicitly waive that proof.
3. Re-run public readiness.
4. Then start UI import with a fresh ARIADNE product review of this audit.

First UI/product slices if staging is unblocked or explicitly parked:

```text
Slice UI-01: copy/adapt onboarding-integrity product spec only.
Slice UI-02: ARIADNE review of Discover/public-home direction.
Slice UI-03: rebuilt Tex-native Discover/search slice, no backend/config drift.
Slice UI-04: onboarding/kindling UX plan tied to current persona schema.
Slice UI-05: notes/global archive backend lane, only after migration numbering is reconciled.
```

## ARIADNE review questions

ARIADNE should answer:

1. Is the onboarding/kindling language product-correct for Station?
2. Which Discern Discover concepts improve Station without making it feel like a
   generic social feed?
3. Should left-rail navigation exist on public surfaces, private Studio
   surfaces, both, or neither?
4. Is notes/global archive a near-term user journey or a future layer after
   replay/staging?
5. Which fallback/demo content should be replaced with real Station data before
   any import?

## DAEDALUS constraints

If MIMIR later wakes DAEDALUS for any slice:

- Do not run `git checkout -p origin/main -- apps/web` without a file-level
  allow-list.
- Do not touch `package.json`, `pnpm-lock.yaml`, `railway.json`, `.env.example`,
  `apps/api/**`, `packages/ai/**`, `packages/db/**`, or `infra/supabase/**`
  unless MIMIR explicitly opens that backend/config lane.
- Preserve web `/health` and reset-password update route.
- Preserve current readiness/replay-health tests.
- Preserve migration `029` and embedding-profile proof posture.

## Suggested ARIADNE wake

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- MIMIR freshly fetched Tex and Discern.
- Discern current main is mixed UI/backend/config drift, not a safe import source.
- Audit classifies usable product ideas and protected rejects.
Task:
- Review docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md for product value.
- Recommend the first UI/product slice, or reject the lane until staging is unblocked.
- Do not ask DAEDALUS to port code until MIMIR opens a bounded slice.
```
