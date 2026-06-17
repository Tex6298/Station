# PR10 Publish Browser Rehearsal - ARIADNE Result

Date: 2026-06-17
Reviewer: A4 / ARIADNE
Request: `docs/roadmap/PR10_PUBLISH_BROWSER_REHEARSAL_ARIADNE.md`

## Verdict

Fail for PR10 closeout.

The live Railway app is serving the required PR10 runtime, and the publish
dashboard layout is coherent, but the signed-in replay owner cannot complete the
required save/edit/publish rehearsal because the live account is below the
document-creation entitlement. The publish form also has visible UX defects that
should be fixed before this lane closes.

## Runtime

- Runtime used: live Railway web and API
- Web/API health: `ok:true`
- Web/API deployment readiness: `ready:true`
- Runtime commit checked: `33cd50b`
- Session path: normal Station browser session restored from the replay owner
  credentials in local `.env`

No raw deployment IDs, user IDs, tokens, cookies, credentials, document IDs, or
checkout URLs are recorded.

## Evidence

Local screenshots and browser evidence were captured at:

- `C:\Users\marty\AppData\Local\Temp\station-a4-pr10-key-Rbe7U3`
- `C:\Users\marty\AppData\Local\Temp\station-a4-pr10-dashboard-QG0rKQ`
- `C:\Users\marty\AppData\Local\Temp\station-a4-pr10-pubtab-LnA7aP`
- `C:\Users\marty\AppData\Local\Temp\station-a4-pr10-mobile-publish-DNr5iz`

## What Passed

- `/studio/publish` restores the signed-in session and renders the publish
  workspace.
- Desktop `/studio/publish` and phone-width `/studio/publish` do not create
  document-level horizontal overflow.
- Rich formatting controls are visibly disabled/deferred.
- External connector controls are visibly disabled/deferred.
- Scheduling is visibly disabled/deferred.
- `/studio/publishing` renders live owner document data from the API, not static
  fixture rows.
- `/studio/publishing` has no document-level overflow at desktop width or
  `390 x 844`.
- The published tab shows the existing live owner document row with Edit and
  View controls.
- The published row wraps safely on phone width.

## Blocking Findings

### 1. Live save/publish cannot be rehearsed with the current replay owner

Route:

`/studio/publish`

Observed:

With real keyboard input in the live browser, `Save draft` is enabled, but
clicking it returns:

`This action requires the 'creator' tier or above.`

Direct non-secret account proof shows the replay owner reports:

- auth tier: `private`
- billing tier: `private`
- `canPublishDocuments:false`

No draft was created in the live owner documents API.

Impact:

ARIADNE cannot complete these required checklist items:

- `Save draft` creates/updates a document.
- `/studio/publish?documentId=...` loads an existing draft created in the
  rehearsal.
- Saving after choosing an owned Space/persona persists that context.
- Publishing an edited draft remains Space-backed.
- Publishing returns a useful document link created during this rehearsal.

MIMIR should decide whether this is an environment/account setup blocker
requiring the replay owner to be restored to `creator`/`canon`, or a DAEDALUS UI
follow-up requiring the publish page to preflight entitlement and explain the
disabled save/publish path before the user writes a document.

### 2. Publish page header text is nearly invisible

Route:

`/studio/publish`

Viewports:

- Desktop `1440 x 1200`
- Phone `390 x 844`

Observed:

The page-level heading and supporting lede use very light dark-surface text
colors on the light Studio shell. `Prepare a Station document.` and its lede are
barely readable on both desktop and phone.

Expected:

The publish-flow header should use the current light Station shell text colors,
or the whole surface should intentionally use a dark page shell. It should not
mix dark-surface text tokens into the light Studio workbench.

Likely file:

`apps/web/components/studio/publish-flow.tsx`

### 3. Phone publish title input clips its own text

Route:

`/studio/publish`

Viewport:

`390 x 844`

Observed:

The document title input remains a large single-line field on phone width. Even
the default `Untitled Station draft` text is visibly clipped in the input.

Expected:

The phone title treatment should fit the available width without clipping,
either by using smaller mobile typography, a multiline title field, or another
Station-consistent responsive treatment.

Likely file:

`apps/web/components/studio/publish-flow.tsx`

## Dashboard Notes

`/studio/publishing` is the strongest part of this rehearsal.

- Drafts tab rendered an honest empty state for the current live account.
- Published tab showed one live owner document row.
- Edit and View controls are available on the published row.
- Desktop and phone layouts stayed within width.

The rehearsal could not create a new draft or publish a new document, so the
dashboard could not be proven to update from a newly created PR10 document.

## Sanitization

This result does not record private archive text, prompts, raw manifests,
tokens, cookies, IDs, credentials, API keys, checkout/portal URLs, Stripe
identifiers, raw deployment IDs, or raw document IDs.
