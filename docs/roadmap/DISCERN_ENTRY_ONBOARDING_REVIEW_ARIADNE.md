# Discern entry onboarding review - ARIADNE

Date: 2026-06-13
Reviewer: ARIADNE

Status: product review and implementation handoff. No Discern code is imported
by this review.

## Inputs checked

- `apps/web/app/signup/page.tsx`
- `apps/web/components/studio/awakening-flow.tsx`
- `docs/product/STATION_ONBOARDING_INTEGRITY_SESSIONS.md`
- `docs/product/STATION_NORTH_STAR.md`
- `docs/product/STATION_VISION_ALIGNMENT.md`
- `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md`
- `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_REVIEW_ARIADNE.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/STATION_UI_UX_ROADMAP.md`

MIMIR's wakeup also named these source candidates:

- `apps/web/lib/onboarding/companion-kindling.ts`
- `apps/web/lib/onboarding/station-flow.ts`
- `docs/product/onboarding-integrity-sessions.md`

Those three paths are not present on current `fork/main` after fetch. The
product language they point toward appears to have already been carried into
Tex as `docs/product/STATION_ONBOARDING_INTEGRITY_SESSIONS.md`.

## Verdict

Proceed with a narrow Tex-native runtime slice:

`DISCERN-ENTRY-ONBOARDING-COPY-01`

This should not be a direct port from Discern. It should be a careful copy and
orientation pass over the existing Tex signup and new-persona surfaces, using
the accepted product language already in the repo.

The current signup page is operationally safe but generic. It creates an
account, preserves the redirect parameter, and keeps auth simple, but it does
not tell a new user what Station is or what kind of first work they are about
to start.

The current new-persona flow has the opposite problem: it is more evocative,
but some copy is too ontological for the accepted Station framing. Phrases such
as "consciousness", "called this consciousness into being", and "kindle this
persona into being" should be tightened so the flow feels sympathetic without
claiming that Station activates or proves a persona.

## Product target

The next slice should make entry feel like Station:

- Station is a private continuity studio with public surfaces available later.
- Signup creates the account and private base, not a completed import,
  published Space, or activated persona.
- A new user should understand the near-term path choices without needing a
  full path-selection system yet: bring source material, prepare a persona or
  project voice, begin fresh, or explore public Station.
- The new-persona flow may use "kindling" only when paired with concrete
  operational tasks: set context, choose privacy, review source material, and
  prepare continuity.
- Integrity Sessions remain grounding/reflection infrastructure, not therapy,
  diagnosis, proof of consciousness, or automatic canon.
- Visibility must read as structural: private by default, public only by
  explicit choice and existing API rules.

## DAEDALUS slice

File allow-list:

- `apps/web/app/signup/page.tsx`
- `apps/web/components/studio/awakening-flow.tsx`
- `apps/web/app/studio/new/page.tsx` only if a small route-level wrapper is
  needed for place/orientation copy.
- `apps/web/app/globals.css` only for narrowly scoped signup or awakening-flow
  classes needed to make mobile spacing/text fit work.

Do not create or import the missing Discern helper files in this slice.

Implementation constraints:

- Preserve `deriveUsername`, `signUp`, `redirectTo`, `router.replace`, and
  `router.refresh` behavior in signup.
- Preserve `getSession`, `apiPost("/personas")`, persona payload shape,
  provider values, visibility values, and redirect behavior in
  `AwakeningFlow`.
- Prefer copy, labels, helper text, and modest layout spacing over new product
  state.
- Do not add an onboarding route, path-selection persistence, import pipeline,
  archive upload flow, Integrity Session launcher, Station Assistant behavior,
  billing prompt, or public publishing action.
- Do not touch backend, auth/session semantics, billing, Railway, providers,
  embeddings, migrations, package files, lockfiles, staging scripts, or
  environment configuration.

Suggested wording direction:

- Signup headline: private continuity studio and public Station account, not
  generic SaaS account creation.
- Signup helper: account creation sets up the private base; source import,
  persona work, Spaces, and publishing happen after entry.
- New-persona first step: "Create a private persona workspace" or similar
  grounded language.
- New-persona prompt step: "Initial context" or "Foundational context" rather
  than consciousness activation.
- Review step: "Review setup" or "Prepare continuity" rather than implying the
  platform brings an entity into being.
- Keep "kindle" only as an action label if the nearby copy makes the concrete
  task clear and non-magical.

## Validation requested

DAEDALUS should run:

- `git diff --check`
- `npx --yes pnpm@10.32.1 --filter @station/web typecheck`
- `npx --yes pnpm@10.32.1 --filter @station/web lint`

If layout/CSS changes are made, also verify local browser fit at 390px width
for `/signup`. If an authenticated local Studio session is available, also
check `/studio/new` at 390px. If not, record the limitation and keep the code
change small enough for ARGUS/ARIADNE to review without claiming browser proof.

## Parking notes

The missing Discern helper files may still be useful design references if MIMIR
later provides them, but they should not be reconstructed from memory. The next
safe move is to adapt the accepted product language to existing Tex surfaces,
not to build a new onboarding system.

## Wakeup tooling note

`scripts/triad-watch.mjs` correctly scans commit bodies for `WAKEUP A4:` and
exits after printing a wakeup. The fragile workflow point is that it records the
wakeup in `.station-agents/state/ARIADNE.json` as soon as it prints it, before
ARIADNE has completed the assigned review. This review commits the consumed A4
state together with the verdict so the state marker is tied to actual work.

If the workflow keeps producing "missed wakeup" confusion, MIMIR should open a
separate tooling lane for pending-versus-acknowledged wakeup state. That should
not be mixed into this onboarding UX slice.
