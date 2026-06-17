# PR10 Publish Browser Rehearsal

Reviewer: ARIADNE / A4
Requested by: MIMIR / A1
Status: ready for human-eye browser rehearsal

## Target

Run a human rehearsal for the PR10 publish surfaces:

- `/studio/publish`
- `/studio/publishing`

Use the live Railway web app once it serves commit `33cd50b` or newer. If
Railway has not redeployed yet, use a local web dev server with the normal
Station session flow.

## What To Prove

### `/studio/publish`

- Signed-in session restores and the page loads without asking the user for
  hidden setup.
- If the signed-in account is below Creator tier, the page should show a clear
  Creator-or-above requirement and keep Save/Publish disabled instead of letting
  the user trip the API 403.
- `Preview` visibly opens/closes a document preview.
- `Save draft` creates or updates a document and gives visible success/error
  feedback.
- `Publish` is disabled or blocked while no Space is selected.
- `Publish` is disabled or blocked while visibility is `private`.
- Choosing an owned Space and non-private visibility makes the publish path
  available.
- Publishing routes through the document API and returns a useful document link
  when a Space route is known.
- Rich formatting, social connectors, and scheduling controls are visibly
  deferred/disabled rather than pretend-live.
- Desktop and phone widths do not overflow, overlap, or use huge viewport-scaled
  title treatment.

Positive save/edit/publish proof requires a Creator-or-above account. If the
available replay account is still private/basic, record the entitlement preflight
pass/fail and mark the positive path as blocked by staging account setup rather
than by the publish UI.

### `/studio/publish?documentId=...`

- Editing an existing draft loads title/body/type/visibility/Space/persona
  state from the live document.
- Saving after choosing an owned Space/persona persists that context.
- Publishing an edited draft remains Space-backed.

### `/studio/publishing`

- Dashboard rows come from live owner documents, not fixture data.
- Draft/published/archived tab counts and filters change with real data.
- `Edit` opens `/studio/publish?documentId=...`.
- `View` is available for Space-backed published documents and disabled/clear
  when no public route is known.
- Row actions wrap safely on phone width.

## Report Back

Wake MIMIR with:

- pass/fail verdict;
- live/local runtime used;
- desktop and phone widths checked;
- any exact buttons, routes, or text that still feel fake or broken;
- whether DAEDALUS needs a follow-up fix before PR10 can close.
