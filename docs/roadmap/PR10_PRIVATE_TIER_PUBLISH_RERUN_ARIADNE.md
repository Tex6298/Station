# PR10 Private-Tier Publish Rerun - ARIADNE

Date: 2026-06-17
Reviewer: A4 / ARIADNE
Request: `02861c5 docs: rerun PR10 private-tier rehearsal`

## Verdict

Pass for the scoped private-tier rerun.

This pass does not claim the positive save/edit/publish path. MIMIR explicitly
left that path blocked until a Creator-or-above staging account is available.

## Runtime

- Runtime used: live Railway web and API
- Web/API health: `ok:true`
- Web/API deployment readiness: `ready:true`
- Runtime commit checked: `abc3b3d`
- Account state checked through non-secret labels:
  - auth tier: `private`
  - billing tier: `private`
  - `canPublishDocuments:false`

## Evidence

Local screenshot and metric evidence was captured at:

`C:\Users\marty\AppData\Local\Temp\station-a4-pr10-rerun-KyNTgI`

Routes and widths:

- `/studio/publish` at desktop `1440 x 1200`
- `/studio/publish` at phone `390 x 844`
- `/studio/publishing` at desktop `1440 x 1200`
- `/studio/publishing` at phone `390 x 844`

## Accepted

- `/studio/publish` restores the signed-in private-tier session.
- The Creator-or-above preflight appears before save/publish:
  `Creator tier or above is required to save and publish Station documents.
  Current tier: private.`
- `Save draft` is disabled for the private-tier account.
- `Publish` is disabled for the private-tier account.
- The rerun does not trip the previous API `403` save path and does not create a
  draft.
- Header and lede contrast are repaired on the light Studio shell:
  - heading contrast measured `13.85:1`
  - lede contrast measured `5.81:1`
- The phone title input no longer clips the default title:
  - value: `Untitled Station draft`
  - measured phone input `scrollWidth` and `clientWidth`: `324px`
- `Preview` opens and closes on desktop and phone.
- Formatting controls remain visibly disabled/deferred.
- External connector controls remain visibly disabled/deferred.
- Scheduling remains visibly disabled/deferred.
- `/studio/publishing` renders live owner document rows from the API.
- The existing published row has Edit and View controls.
- `/studio/publishing` stays within width on desktop and `390 x 844`.
- The published row wraps safely on phone width.

## Still Not Claimed

The following PR10 checks still require a Creator-or-above staging account:

- `Save draft` creates or updates a document.
- `/studio/publish?documentId=...` loads a newly created draft from this
  rehearsal.
- Saving after choosing an owned Space/persona persists that context.
- Publishing an edited draft remains Space-backed.
- Publishing returns a useful document link created during this rehearsal.

Those are not failures in this rerun because MIMIR narrowed the task to
private-tier preflight and visual/layout validation.

## Sanitization

This result does not record private archive text, prompts, raw manifests,
tokens, cookies, IDs, credentials, API keys, checkout/portal URLs, Stripe
identifiers, raw deployment IDs, or raw document IDs.
