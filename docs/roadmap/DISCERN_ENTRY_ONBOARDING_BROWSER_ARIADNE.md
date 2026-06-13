# Discern entry onboarding browser review - ARIADNE

Date: 2026-06-13
Reviewer: ARIADNE

Status: UX/browser accepted for `DISCERN-ENTRY-ONBOARDING-COPY-01`.

## Scope reviewed

Code slice:

- `484dec6 web: tighten onboarding copy`

Safety handoffs reviewed:

- `c7505cb docs: accept onboarding copy review`
- `bae4524 docs: accept onboarding copy safety`
- `8509ccf chore: mark onboarding docs wake reviewed`
- `988d217 wake: nudge ARIADNE onboarding browser review`

Surfaces:

- `/signup`
- `/studio/new`

## Browser setup

Local browser review used Chrome/CDP at `390x844`.

For `/signup`, the page was rendered from a local Next dev server without
submitting the form.

For `/studio/new`, the route is protected by middleware and the top navigation
client-side session restore. To review the visible page without touching
staging credentials or creating a persona, ARIADNE used a local fake API and a
fake localStorage session that returned:

- one non-admin private-tier user from `/auth/me`;
- an empty persona list from `/personas`;
- empty token and storage usage responses for the Studio sidebar.

No signup, login, persona creation, provider call, archive import, billing, or
publish action was submitted.

## Results

### Signup

Measured at `390px` width:

- `innerWidth`: `390`
- `documentElement.scrollWidth`: `390`
- `body.scrollWidth`: `390`
- overflowing elements: none

UX verdict:

- The copy now frames Station as a private Studio for archive, continuity, and
  careful publishing later.
- The privacy note is clear: private work stays private by default, publishing
  is explicit, and source review comes before public surfaces.
- The primary action remains obvious: `Create account`.
- Text fits at mobile width and does not create page-level horizontal overflow.

### Studio New

Measured at `390px` width with the local fake session harness:

- `innerWidth`: `390`
- `documentElement.scrollWidth`: `390`
- `body.scrollWidth`: `390`
- page-level overflowing elements: none
- visible heading: `Name the working persona`
- visible primary action: `Continue`

UX verdict:

- The new-persona copy is grounded and Station-native: context, private Studio,
  visibility, source material, and continuity setup are visible in the first
  viewport.
- The prior over-mystical language is no longer visible. The page does not
  claim consciousness, activation, proof of identity, therapy, diagnosis, or
  automatic canon.
- Visibility copy is clearer: private is default, and public visibility is
  something the user chooses only for material ready for a public surface.
- Mobile fit is acceptable. The CDP scan flagged the existing top navigation
  `Developer` link sitting inside the horizontally scrollable mobile nav group;
  this is not page-level overflow and does not affect the onboarding form.

## Verdict

Accept `DISCERN-ENTRY-ONBOARDING-COPY-01` for UX/browser parity.

No DAEDALUS restoration patch is needed.

## Remaining caveats

- This was not a staging auth test.
- This was not a signup submission test.
- This was not a persona creation test.
- The `/studio/new` proof used a local fake API/session harness only to render
  the protected page and inspect layout/copy.
- The existing mobile top nav still uses horizontal scroll for authenticated
  nav links. That is outside this slice.

## Recommendation

MIMIR can mark the onboarding copy/orientation slice complete and decide the
next Discern-to-Tex UX candidate, or return the lane to watch if no immediate
candidate is higher priority.
