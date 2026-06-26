# PR348 - UX-08 Onboarding Assistant State Map Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS review

## Summary

PR348 mapped the current onboarding and Station Assistant surfaces against the
UX-08 lane, then landed one narrow product-depth patch: onboarding cards now use
path-specific Assistant handoff labels instead of the generic `Ask Assistant`
button text.

The Assistant links still only prefill `/studio/assistant?prompt=...`. They do
not auto-send messages, execute tools, import archives, create API Bridge
credentials, mutate backend state, or make provider/model calls.

## Current Surface Map

`/studio/onboarding`

- Requires a signed-in Studio session for the real onboarding cards.
- Signed-out users see a sign-in/join boundary before private setup material.
- Uses `onboardingPathCards` from `apps/web/lib/onboarding-paths.ts`.
- Exposes the four accepted alpha paths: Fresh Start, Awakening, Document
  Migrator, and API Bridge.
- Each card shows status, first step, privacy boundary, current truth,
  supporting routes, a primary route, and an Assistant prompt-prefill link.

`/studio/new?path=...` and `AwakeningFlow`

- Handles the first persona creation step.
- Reads the `path` query for `fresh-start`, `awakening`, and
  `document-migrator` copy.
- Creates a private persona through the existing owner API path.
- Redirects Document Migrator setup to the persona files route after creation.

`/studio/personas/[personaId]/files`

- Current first archive/import step.
- Requires an owner session and owner-scoped persona access.
- Supports paste/import job creation, import review, storage usage readback,
  candidate material, and export status.
- This is an alpha archive/import route, not a live Reddit, Discord, OAuth, or
  recurring connector pipeline.

`/studio/personas/[personaId]/calibration`

- Current first Integrity Session entry point.
- Requires an owner session and loads owner-scoped persona/history context.
- Starts and runs integrity sessions through the existing API routes.

First Space/public publishing entry points

- `/space` lists the signed-in user's Spaces and links to `/space/new`.
- `/space/new` creates a Space after session restore and API submission.
- `/studio/publish` renders the existing publish flow.
- PR348 did not change Space creation, publication semantics, visibility, or
  publishing backend behavior.

`/studio/assistant`

- Requires a signed-in Studio session for the Assistant panel.
- Signed-out users see a sign-in boundary.
- Restores a search-param prompt through `assistantPromptFromSearch`, filling
  the text area only.
- Sends a message only after an explicit user click.
- Fetches owner-scoped workspace signals and next actions from the existing
  Station Assistant API.
- Presents Station Assistant as an operational helper, not a persona,
  autonomous agent, companion, therapist, or authority.

## PR73 Baseline Already Covered

Earlier accepted PR73 work already made the four alpha onboarding paths
routeable through real Station routes:

- Fresh Start routes to private persona creation.
- Awakening routes to guided private persona creation plus follow-on integrity
  and memory routes.
- Document Migrator routes either to persona creation or the selected persona's
  private archive/files route.
- API Bridge routes to Developer Spaces.

`apps/web/lib/onboarding-paths.test.ts` already covered the routeability and
truth-boundary shape for those paths. PR348 did not rebuild that work.

## UX-08 Gaps Still Present

- First Space/public publishing is present through `/space`, `/space/new`, and
  `/studio/publish`, but it is not yet as explicitly connected from onboarding
  or Assistant next actions as archive/import, integrity, and API Bridge are.
- Onboarding does not yet persist a cross-route onboarding progress state.
- Document Migrator remains an alpha owner archive/import surface, not a full
  file-upload, OAuth, connector, or recurring sync pipeline.
- API Bridge remains Developer Spaces alpha ingestion, not production
  credential provisioning, external secret handling, workers, or provider
  routing.
- Station Assistant can guide through prefilled prompts and explicit messages,
  but it does not execute setup actions or tool calls.

## Code Changes

- Added `assistantActionLabel` to `OnboardingPathCard` in
  `apps/web/lib/onboarding-paths.ts`.
- Updated `/studio/onboarding` to render each card's path-specific Assistant
  handoff label.
- Added helper tests proving the labels are present and path-specific:
  - Fresh Start: `Ask Assistant to plan first setup`
  - Awakening: `Ask Assistant to prepare notes`
  - Document Migrator before persona creation:
    `Ask Assistant to plan archive prep`
  - Document Migrator after persona selection:
    `Ask Assistant about archive import`
  - API Bridge: `Ask Assistant about bridge setup`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:assistant` | Pass | 9 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass | 20 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 112 tests passed, including updated onboarding helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | No ESLint warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Next Packet Recommendation

If ARGUS accepts PR348, MIMIR should consider opening a narrow PR349 for
UX-08 first Space/publishing entrypoint clarity:

- connect onboarding or Assistant next-action copy to the existing first Space
  route;
- keep it route/copy/helper-level unless a deeper map proves backend changes
  are needed;
- do not change publication semantics, visibility, schema, auth, billing, file
  import, API Bridge credentials, provider/model calls, workers, or Assistant
  execution.

## Review Request

ARGUS should review that the new labels do not imply archive transfer, API
Bridge credential creation, Assistant autonomy, backend execution, provider
calls, or any behavior beyond prompt-prefill handoff clarity.
