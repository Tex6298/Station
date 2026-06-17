# PR10 - Studio Publish API Wiring

Status: accepted by ARGUS for ARIADNE rehearsal
Owner: MIMIR / A1 implementation after DAEDALUS did not respond
Reviewer: ARGUS / A3
Human rehearsal: ARIADNE / A4 after ARGUS accepts the code slice

## Why This Is Next

ARGUS accepted the launch-core deploy proof on 2026-06-17. The launch-core
patch's immediate next step is to wire `/studio/publish` to the real document
API instead of leaving it as a local drafting surface.

This is the narrow first slice of the larger publishing approval workflow. Do
not implement the approval queue, worker system, or external social connectors
in this PR.

## Current Problem

- `apps/web/components/studio/publish-flow.tsx` stores title, body, format,
  destination, connector, and schedule state locally.
- The visible `Preview`, `Save draft`, and `Publish` actions do not currently
  create or update Station documents.
- `apps/web/components/studio/publishing-dashboard.tsx` renders fixture rows
  instead of owner-scoped documents from `GET /documents`.
- The API already has the basic document contract:
  - `GET /documents`
  - `GET /documents/:id`
  - `POST /documents`
  - `PATCH /documents/:id`
  - `POST /documents/:id/publish`

## Scope

1. Make `/studio/publish` session-aware and live-backed.
2. Support creating a new draft with `POST /documents`.
3. Support saving an existing draft with `PATCH /documents/:id`.
4. Support publishing through `POST /documents/:id/publish`.
5. Use Station document types:
   - `essay`
   - `codex`
   - `manifesto`
   - `field_log`
   - `research`
   - `archive_note`
   - `transcript`
6. Generate or collect a valid lowercase slug for new documents.
7. Show owner-visible success and failure states.
8. Refresh `/studio/publishing` from live `GET /documents` data.
9. Keep publish visibility explicit; public publish must remain an intentional
   owner action.

## Out Of Scope

- Publishing approval queue state machine.
- BullMQ/Redis worker execution.
- Reddit/social connector dispatch.
- Scheduled publishing execution.
- Site-wide UI reskin or Discern-style surface pass.
- New migration unless DAEDALUS finds a concrete schema gap.

## Implementation Notes

- Prefer existing `apiGet`, `apiPost`, and `apiPatch` helpers from
  `apps/web/lib/api-client.ts`.
- Match current auth/session usage patterns from nearby Studio components.
- Keep `/studio/publish` useful when no Space is selected; the current API
  allows draft documents without `spaceId`.
- If publishing requires a Space for a public destination, make that requirement
  visible and blocked in the UI rather than silently failing.
- Rename user-facing Station publishing copy from "post" to "document" where it
  does not mean a forum post.

## Acceptance Checks

Run the narrow gate first:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:community
```

Also add or update focused tests for the changed publish/dashboard behavior.
If a full web build is attempted from Windows, keep the known Next standalone
symlink caveat separate from real route/type failures.

## Handoff

When DAEDALUS completes the implementation, wake ARGUS with:

- changed files;
- exact validation commands and results;
- any intentionally disabled publish controls;
- any owner/visibility risks needing hostile review.

## ARGUS Review - 2026-06-17

Result: blocked before ARIADNE rehearsal.

Mechanically green validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication`
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `git diff HEAD~1..HEAD --check`
- `git diff --check`

Blocker:

- `apps/web/components/studio/publish-flow.tsx` lets an owner select a Space
  and persona while editing an existing document.
- `apps/api/src/routes/documents.ts` currently ignores `spaceId` and
  `personaId` in `PATCH /documents/:id`.
- Result: an existing draft can look Space-backed in the UI, pass the publish
  button gate, then save/publish while the persisted row still has no
  `space_id`. That breaks the PR10 acceptance requirement that Space-backed
  publishing be explicit and reliable.

Required follow-up:

- Add owner-validated `spaceId` and `personaId` handling to
  `PATCH /documents/:id`, or change the web flow so existing-draft publish
  gates use only the persisted saved document state.
- Add focused API or UI helper coverage for editing an existing draft from no
  Space to an owned Space before publish.
- Preserve hostile checks for other-owner Space/persona IDs.
- Remove the newly touched viewport-scaled publish-flow title type and make the
  publishing-dashboard row actions phone-safe before ARIADNE rehearsal.

## ARGUS Repair Review - 2026-06-17

Result: accepted for ARIADNE rehearsal.

The blocker from ARGUS's first review is cleared:

- `PATCH /documents/:id` now validates and persists owned `spaceId` updates.
- `PATCH /documents/:id` now validates and persists owned `personaId` updates,
  including `source_persona_id` alignment and explicit persona clearing.
- Other-owner Space and persona IDs are rejected.
- The community route test proves a no-Space draft can be attached to an owned
  Space/persona before publish, then remains Space-backed after publish.
- The touched publish-flow heading no longer uses viewport-scaled type.
- The publishing dashboard row/actions use a wrapping, phone-safe layout.

ARGUS reran:

- `npm exec --yes pnpm@10.32.1 -- run test:community`
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication`
- `git diff 0b7359f..33cd50b --check`
- `git diff 0b7359f..HEAD --check`
- `git diff --check`

Remaining caveat: direct API calls to `POST /documents/:id/publish` can still
publish an owner document with no Space. That latitude predates the PR10 UI
blocker and should be handled as a later document API policy decision unless
MIMIR wants Space-backed publishing enforced at the route level now.
