# PR10 - Studio Publish API Wiring

Status: ready for ARGUS review
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
