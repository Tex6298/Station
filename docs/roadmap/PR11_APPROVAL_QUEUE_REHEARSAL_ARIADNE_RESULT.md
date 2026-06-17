# PR11 Approval Queue Rehearsal - ARIADNE Result

Date: 2026-06-17
Reviewer: A4 / ARIADNE
Request: `docs/roadmap/PR11_APPROVAL_QUEUE_REHEARSAL_ARIADNE.md`

## Verdict

Fail for PR11 closeout. Wake DAEDALUS.

The PR11 runtime is deployed and the visible layouts are mostly coherent, but
the live approval queue API is not healthy. The dashboard currently falls back
to empty approval data and shows `Not queued`, which makes the queue state
untrustworthy.

## Runtime

- Runtime used: live Railway web and API
- Web/API health: `ok:true`
- Web/API deployment readiness: `ready:true`
- Runtime commit checked: `2797520`
- Account state checked through non-secret labels:
  - auth tier: `private`
  - billing tier: `private`
  - `canPublishDocuments:false`

## Blocking Finding

Endpoint:

`GET /publishing/approvals`

Observed live response:

`Could not find the table 'public.publishing_approval_items' in the schema cache`

Impact:

- The approval queue cannot be trusted on live Railway.
- `/studio/publishing` catches the approval fetch failure and renders the
  existing published owner row as `Not queued`.
- That is a silent fallback from broken queue truth to empty queue truth.
- ARIADNE cannot verify real approval state, queued drafts, no-Space queue
  rejection, or queue transitions while the approval table is missing from the
  live API schema.

Likely follow-up:

- Apply or repair the PR11 approval queue table/migration on the live Supabase
  target, then re-probe `GET /publishing/approvals`.
- Consider surfacing approval-fetch failure in `/studio/publishing` rather than
  silently treating it as an empty approval queue.

## Live Data Available

The private-tier replay owner currently has:

- documents total: `1`
- drafts: `0`
- published documents: `1`
- no-Space documents: `0`

Because there are no drafts or no-Space documents in this account, the no-Space
queue button could not be exercised through the visible dashboard. That would
already be an account/data limitation, but the approval API failure is the
stronger blocker.

## What Passed Visually

### `/studio/publish`

Checked at desktop `1440 x 1200` and phone `390 x 844`.

- The private-tier Creator-or-above preflight is visible.
- `Save draft` is disabled.
- `Send for review` is disabled.
- Formatting controls remain disabled/deferred.
- External connector controls remain disabled/deferred.
- Scheduling remains disabled/deferred.
- The page stays within width on desktop and phone.

### `/studio/publishing`

Checked at desktop `1440 x 1200` and phone `390 x 844`.

- The dashboard loads the existing live owner document row after data load.
- The existing published row has Edit and View controls.
- The published row wraps safely on phone width.
- The page stays within width on desktop and phone.

These visual passes do not override the approval API blocker.

## Evidence

Local screenshot and metric evidence was captured at:

- `C:\Users\marty\AppData\Local\Temp\station-a4-pr11-approval-vFoh4c`
- `C:\Users\marty\AppData\Local\Temp\station-a4-pr11-dash-nSpDDK`

## Sanitization

This result does not record private archive text, prompts, raw manifests,
tokens, cookies, IDs, credentials, API keys, checkout/portal URLs, Stripe
identifiers, raw deployment IDs, raw document IDs, or private source IDs.
