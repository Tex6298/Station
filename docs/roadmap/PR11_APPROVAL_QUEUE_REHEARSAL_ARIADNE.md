# PR11 Approval Queue Rehearsal - ARIADNE

Status: ready for ARIADNE human rehearsal
Owner: ARIADNE / A4
Sequencer: MIMIR / A1
Code owner if blocked: DAEDALUS / A2

## Purpose

PR11 is accepted by ARGUS at the code-review layer. Before MIMIR closes the
lane, run a narrow human-eye rehearsal of the publishing approval queue surfaces.

This is not a broad visual redesign pass and not a Creator-account setup task.
It should answer whether the new queue states and controls feel real,
understandable, and safe in the current live staging product.

## Runtime Gate

Use live Railway staging:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Before testing, confirm both health endpoints are `ok:true` and
`ready:true`. Confirm the served runtime includes PR11 code commit `2797520` or
newer. If Railway has not deployed that code yet, wait/retry rather than testing
old UI.

## Required Human Routes

Run desktop and phone-width checks where practical:

1. `/studio/publishing`
2. `/studio/publish`
3. `/studio/publish?documentId=<owned draft id>` only if the UI exposes an owned
   draft to edit without leaking private IDs into the report.

Do not record tokens, cookies, raw private archive text, raw document IDs,
private source IDs, customer IDs, API keys, or secrets.

## What To Check

### Publishing Dashboard

- Approval queue state is visible for drafts affected by PR11.
- Queue controls do not pretend to work when a draft is missing a public Space.
- No-Space drafts show clear `Space required` or equivalent copy.
- Queue actions are disabled or unavailable when they should be.
- Existing document rows still provide the expected safe actions such as Edit
  and View.
- Tapping queue buttons produces a visible result: state change, disabled state,
  useful message, or clear unavailable state. Silent no-ops are defects.
- Desktop and phone widths do not create document-level horizontal overflow.
- Long titles/state labels wrap without clipping buttons or neighboring text.

### Publish Flow

- Private/basic tier still shows the Creator-or-above preflight instead of
  letting Save/Publish hit an API 403.
- Deferred controls remain visibly deferred/disabled.
- If a usable Creator-or-above staging session exists, try the positive path:
  save or edit a Space-backed draft, submit it to review, and confirm the
  dashboard shows the resulting approval state.
- If no Creator-or-above session exists, do not fail PR11 for missing positive
  publish proof. Record it as still blocked by staging account setup.

### Safety And Product Readability

- Public publication still reads as an explicit owner action.
- The UI does not imply private archive/canon/memory source text will be exposed.
- Provenance/review wording is understandable to a human tester.
- Any error states explain what the user can do next.

## Pass Criteria

Pass this rehearsal if:

- PR11 runtime is deployed.
- No-Space queue actions are safely disabled or rejected with clear copy.
- Queue state is visible and comprehensible.
- No silent button failures appear in the scoped routes.
- Mobile and desktop layouts stay within viewport width.
- Missing Creator-positive proof is the only untested path.

## Fail Criteria

Fail and wake DAEDALUS if you find:

- A live queue action silently does nothing.
- A no-Space draft can be enqueued, scheduled, or published through the UI.
- The dashboard implies publication succeeded when the API rejected it.
- Mobile layout overflows or clips the approval controls.
- The UI exposes private source text, raw IDs, or unsafe provenance details.

Wake MIMIR instead if the issue is a product sequencing question rather than a
concrete code defect.

## Required Handoff

When done, wake either DAEDALUS or MIMIR. Include:

- runtime commit checked;
- account tier labels only, not secrets;
- routes and viewport widths tested;
- pass/fail verdict;
- exact button/control defects if any;
- whether the Creator-positive path was tested or remained blocked by account
  setup;
- sanitized screenshot/evidence location if captured.
