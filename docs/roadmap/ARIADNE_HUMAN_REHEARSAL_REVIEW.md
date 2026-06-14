# ARIADNE Human Rehearsal Review

Date: 2026-06-14

Reviewer: A4 / ARIADNE

Reviewed wakeup: `4818378` assigning the human-eye staging rehearsal.

Verdict: Implementation defects found. Wake DAEDALUS for a narrow `/settings`
placeholder-control repair.

## Targets

- Live web: `https://stationweb-production.up.railway.app`
- Live API observed from the browser client:
  `https://stationapi-production.up.railway.app`
- Rehearsal brief: `docs/roadmap/ARIADNE_HUMAN_REHEARSAL.md`

## Public Run

Accepted:

- `/` top navigation routed to Station, Discover, Writing, Forums, Sign in, and
  Sign up.
- `/discover` hero controls routed or changed state: `Read the public feed`,
  `Watch live projects`, and `Read forums`.
- `/discover` search for `replay` produced routeable public results for the
  seeded Developer Space and public document. The private Studio exclusion copy
  remained explanatory copy, not a private result bucket.
- The public chain completed by normal links:
  `/discover` to public Space, public Space to public document, public document
  `Open discussion`, and linked forum discussion back to the source document.
- `/writing` search, tabs, filter chips, document cards, and empty states were
  visible and stateful.
- `/forums` category cards routed, and the signed-out thread page hid live
  `Up`, `Down`, `Report`, and reply controls while showing a sign-in prompt.
- `/developer-spaces/station-replay-dev-alpha` rendered the public observer for
  anonymous visitors without owner-only manage/key controls.
- Mobile checks for `/`, `/discover`, `/writing`, `/forums`, and the public
  Developer Space observer found no document-level overflow or app error.

Product note for MIMIR later: the rehearsal brief lists `Latest`, `Featured`,
`Staff picks`, and writing-type chips under `/discover`. Live `/discover` now
uses `New`, `Rising`, and `Featured`; the writing-type chips live on
`/writing`. This is a brief/product-language mismatch, not a DAEDALUS defect
unless MIMIR wants Discover to adopt those exact controls.

## Signed-In Run

Accepted:

- Real browser keystrokes on `/login?redirect=/studio` created session/cookie
  state and redirected to `/studio` within the auth wait.
- A sanitized injected replay session was then used for the broader protected
  route/control pass to avoid recording credentials or tokens.
- `/studio`, persona Home, Timeline/Continuity, Memory, Canon, Archive,
  Integrity, `/developer-spaces`, Developer Space manage, and `/billing` all
  rendered with signed-in state and no route-level overflow.
- Studio shell links such as New Persona, Public Space, and Global Archive
  routed to their expected destinations.
- Archive import and persona export controls produced visible owner-only state:
  import job/card, manifest readback, and portable bundle path.
- Developer Space manage rendered owner controls; `Save visual mode`, widget
  reorder/save, and `Create export` did not show visible failure. Key rotation
  was intentionally not clicked because it exposes a one-time secret.
- Billing rendered current plan and available plans. `Manage / cancel
  subscription` opened `billing.stripe.com`; `Upgrade - GBP 100/mo` opened
  `checkout.stripe.com`. No Stripe URLs or customer identifiers were recorded.
- Mobile checks for Studio, Memory, Continuity, Archive, Developer manage,
  Settings, and Billing found no document-level overflow or app error.

Not counted as defects: CDP text insertion failed to land in the Memory and
Continuity text fields during form-submit probing. Screenshots showed empty
fields after the attempt, so ARIADNE did not treat those submits as product
failures. The routes and controls are visible; a later Playwright/manual fill
pass can retest them if DAEDALUS opens form-specific work.

## Defects

### `/settings` placeholder controls

Route and state: `/settings`, signed in.

Severity: implementation defect.

Recommended owner: DAEDALUS.

Observed:

- `Profile`, `Privacy`, and `Notifications` cards are clickable cards, but route
  to `/settings` itself and do not reveal a section, form, anchor, disabled
  state, or coming-soon label.
- `Edit profile` is an enabled button in the Profile Snapshot panel, but it
  opens no route, modal, inline form, validation, or unavailable state.
- `Delete account` is an enabled danger button, but it opens no confirmation,
  route, disabled state, or unavailable explanation.
- Notification preference checkboxes toggle visually, but there is no save
  state, unsaved state, persistence indication, or visible backend action.

Expected:

Every visible settings control should either route to implemented settings,
change visible state with persistence/unsaved feedback, or be disabled/clearly
labelled as unavailable for this staging slice.

Implementation clue:

`apps/web/app/settings/page.tsx` renders the no-op buttons and local-only
checkboxes. It also points Profile, Privacy, and Notifications cards back to
`/settings`.

## Validation

- Hosted Chrome/CDP anonymous public run against the live Railway web app.
- Hosted Chrome/CDP real-keystroke login probe.
- Hosted Chrome/CDP signed-in protected route/control smoke using sanitized
  injected session state after direct API sign-in.
- Direct screenshots saved only to local temp directories; no secrets, package
  payloads, raw private archive text, Stripe session URLs, or tokens recorded in
  repo docs.
