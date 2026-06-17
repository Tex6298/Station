# PR11 Approval Queue Rerun - ARIADNE

Date: 2026-06-17
Reviewer: A4 / ARIADNE
Request: `6f23371 docs: rerun PR11 approval rehearsal`

## Verdict

Pass for the scoped private-tier PR11 approval queue rerun.

This pass does not claim Creator-positive queue transitions. MIMIR explicitly
kept those as separate staging-account proof.

## Runtime

- Runtime used: live Railway web and API
- Web/API health: `ok:true`
- Web/API deployment readiness: `ready:true`
- Runtime commit checked: `9013f7b`
- Account state checked through non-secret labels:
  - auth tier: `private`
  - billing tier: `private`
  - `canPublishDocuments:false`

## Live API Truth

Direct signed-in API probes showed:

- `GET /publishing/approvals`: `200`
- documents total: `3`
- drafts: `2`
- no-Space drafts: `1`
- Space-backed drafts: `1`
- approval rows: `0`

The previous missing-table blocker is cleared for this live target.

## Browser Coverage

Evidence was captured at:

`C:\Users\marty\AppData\Local\Temp\station-a4-pr11-rerun-hhALqn`

Routes and widths:

- `/studio/publish` at desktop `1440 x 1200`
- `/studio/publish` at phone `390 x 844`
- `/studio/publishing` Drafts tab at desktop `1440 x 1200`
- `/studio/publishing` Drafts tab at phone `390 x 844`
- `/studio/publishing` Published tab at desktop `1440 x 1200`
- `/studio/publishing` Published tab at phone `390 x 844`

## Accepted

- `/studio/publish` shows the private-tier Creator-or-above preflight.
- `/studio/publish` disables `Save draft`.
- `/studio/publish` disables `Send for review`.
- Deferred formatting, connector, and scheduling controls remain visibly
  deferred.
- `/studio/publish` stays within width on desktop and phone.
- `/studio/publishing` shows a clear queue-level Creator requirement for the
  private-tier account.
- The no-Space synthetic draft shows `Space required` before entitlement action.
- The Space-backed synthetic draft shows `Creator required`.
- Both queue guard actions are disabled.
- Both draft rows show `Not queued` state.
- Draft row action groups wrap safely on phone width.
- The existing published row still has Edit and View controls.
- The Published tab stays within width on desktop and phone.
- No silent queue button failure appeared in the scoped private-tier UI.

## Still Not Claimed

The positive path remains separate staging-account proof:

- Creator-or-above draft save.
- Submit to review.
- Approval transitions.
- Queue-driven publish.

## Sanitization

This result does not record private archive text, prompts, raw manifests,
tokens, cookies, IDs, credentials, API keys, checkout/portal URLs, Stripe
identifiers, raw deployment IDs, raw document IDs, or private source IDs.
