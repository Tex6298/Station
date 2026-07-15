# PR527B Space Entitlement And Visibility Repair - ARGUS Review Result

Date: 2026-07-15

Owner: ARGUS / A3

Implementation reviewed: `d3113c1057f93f090d6513ea367ae983e1925b90`

State:

```text
ACCEPT_PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts PR527B after a narrow policy, stale-state, presentation, and
accessibility patch. The accepted local implementation now makes the intended
boundary structural:

- `/space/new` restores current session truth and reads current billing status
  plus owner-scoped Spaces before exposing any editable builder or Create
  command;
- malformed, conflicting, below-Creator, and exhausted-count states fail
  closed with bounded copy and only the accepted destinations;
- the client applies the same canonical tier-before-count policy as the API,
  including admin order and exact tier Space limits;
- entitled web creation and omitted API visibility default Private, while
  Public requires an explicit owner choice and PATCH omission preserves the
  current value;
- a create `403` removes the live form, preserves entries, performs a fresh
  preflight, exposes no response details, and never replays POST automatically;
- no tier, price, quota policy, auth, billing, API-client, schema, migration,
  manage/detail route, dependency, hosted-runtime, provider, queue, cleanup,
  or broader J07 work entered the lane.

This is local implementation acceptance only. It does not claim that the
replay owner can create a Space, that a hosted write occurred, or that J07's
create/edit/public/cleanup lifecycle works.

## ARGUS Patch

ARGUS changed only four already accepted implementation paths:

```text
apps/web/app/globals.css
apps/web/app/space/new/page.tsx
apps/web/lib/space-create-entitlement.test.ts
apps/web/lib/space-create-entitlement.ts
```

The patch:

- rejects empty restored-user identity, non-integer limits, and billing Space
  limits that disagree with `TIER_LIMITS` instead of opening a form that the
  API's `canCreateSpace` policy would reject;
- calls shared `canCreateSpace` only after the explicit Creator-tier gate, so
  count handling, admin bypass, and any future canonical unlimited value stay
  aligned with server permission code;
- treats only literal boolean `true` as admin truth and removes the test that
  incorrectly accepted a fictional `institutional: -1` Space limit while the
  canonical current limit is `5`;
- gives stale rechecks their own loading reason, shows the locked stale copy
  while the read is actually running, and replaces it with completed recheck
  copy only if the allowed form reopens;
- replaces inherited fixed-dark create panels, choices, visibility controls,
  errors, and focus treatment with `/space/new`-scoped semantic theme rules;
- replaces the invalid `<label>` around multiple buttons with named fields and
  named Theme/Visibility groups, restoring exact Private/Public accessible
  button names and pressed state;
- removes inherited "public identity page" and "public surface" theme copy
  from the Private-default form without changing shared theme configuration;
- extends the focused test to lock these policy, stale-state, semantic-theme,
  and control-label boundaries.

The API implementation itself required no ARGUS change.

## Trust Review

### Fresh Preflight And Owner Scope

- `getSession()` restores the browser session against `/auth/me`; the stored
  tier alone cannot grant builder access.
- Billing and owner-Space reads use the restored access token. `GET /spaces`
  remains owner scoped, and the browser does not author tier, limit, or count.
- Session and billing tiers must both be recognized and equal. The restored
  owner id must be non-empty, the Space response must contain an array, and
  the billing limit must be an integer equal to the canonical tier limit.
- Missing session follows `/login?redirect=%2Fspace%2Fnew`. Read failure or
  malformed/conflicting truth renders `Could not check Space access`, Retry,
  and My Spaces, with no form and no Billing claim.
- The Creator gate runs before shared count policy. A below-Creator admin is
  denied; an admin who passes the tier guard may bypass count exactly as the
  API does.

### No-Entitlement Truth

- Loading renders only `Checking Space access` and its locked verification
  copy.
- Below-tier renders `Creator tier required`; exhausted finite count renders
  `Space limit reached` with singular/plural labels from verified values.
- Both unavailable states contain only `Review plan details` to `/billing` and
  `View My Spaces` to `/space`.
- No unavailable or failed state contains a form, Create command, disabled
  builder lookalike, provider checkout link, response detail, or write.

### Private And API Defaults

- The entitled form starts `isPublic: false`; Private is first and
  `aria-pressed="true"`.
- The exact visibility copy distinguishes Private readback exclusion from the
  immediate external readability of an explicitly selected Public Space.
- Theme descriptions and the miniature preview do not call the Private state
  public. The preview changes only after explicit Public selection.
- Intercepted browser payloads independently proved `isPublic: false` by
  default and `isPublic: true` after the Public button was selected.
- API route tests prove omitted create visibility inserts Private, explicit
  `true`/`false` remain exact, and omitted PATCH visibility leaves a Public
  Space Public.
- Below-tier, below-tier admin, and at-limit route tests prove no Space or page
  insert. A Creator admin test proves count bypass only after the route tier
  guard.

### Stale Race

- A synthetic create `403` displayed the locked stale copy while delayed fresh
  billing and owner-Space reads were in flight; the form and Create command
  were absent during that interval.
- Title, generated slug, tagline, theme, layout, and Private selection stayed
  in React state and reappeared after an allowed recheck.
- The reopened form said the check had completed rather than claiming it was
  still running.
- The server's synthetic internal error body was absent from visible output.
- POST count remained one after the recheck and a settling interval. A second
  POST occurred only after a new explicit owner click and retained the Private
  payload.

### Theme, Layout, And Accessibility

- Create-specific CSS uses semantic frame/page variables under
  `.space-create-page` or unique `.space-create-*` selectors. Shared
  `.space-builder-*` rules and the Space manage route remain unchanged.
- The miniature theme swatches/preview keep their deliberate product colors;
  page chrome, panels, text, choices, visibility controls, errors, and focus
  adapt to System, Light, and Dark.
- The complete unavailable and entitled matrices passed System, Light, and
  Dark at `1440x900`, `390x844`, and `375x812`: 18 primary cases.
- Computed panel colors matched the semantic panel token, key text and active
  visibility contrast met at least `4.5:1`, and every case had no document
  horizontal overflow or clipped command/control.
- Private/Public and every real input/select/textarea now have exact accessible
  names; Theme and Visibility expose named groups and pressed state.
- Representative desktop Light unavailable and `375px` Dark entitled captures
  were inspected after layout settle and were coherent. Temporary captures and
  synthetic owner data were removed.

## Changed-Path Review

DAEDALUS changed exactly eleven accepted implementation/result paths:

```text
apps/api/src/routes/spaces.test.ts
apps/api/src/routes/spaces.ts
apps/web/app/globals.css
apps/web/app/space/new/page.tsx
apps/web/lib/space-create-entitlement.test.ts
apps/web/lib/space-create-entitlement.ts
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_DAEDALUS_RESULT.md
docs/testing/VALIDATION_BASELINE.md
package.json
```

There is no lockfile or dependency change. ARGUS's production patch stays
inside four already accepted paths. This result, active roadmap records,
validation baseline, and generated agent receipts are the only review
bookkeeping added afterward.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Focused entitlement test | Pass, `5/5` | Response validation, canonical policy agreement, tier/admin/count order, bounded copy, stale-state source, semantic CSS, and accessible controls pass. |
| `npx --yes pnpm@10.32.1 test:spaces` | Pass, `11/11` | Six API route tests and five web entitlement tests pass, including Private defaults, PATCH omission, denial no-write, and admin order. |
| `npx --yes pnpm@10.32.1 test:billing` | Pass, `16/16` | Existing billing read, mutation, stable-error, and display contracts pass. |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `22/22` | Session restoration, normalized owner truth, route protection, middleware, and auth contracts pass. |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `262/262` | Full accepted Studio/theme regression suite passes. |
| Web typecheck | Pass | `tsc --noEmit` completed without error. |
| API typecheck | Pass | `tsc -p tsconfig.typecheck.json` completed without error. |
| Web lint | Pass | No ESLint warning or error. |
| Independent local Playwright proof | Pass, `26/26` groups | Signed-out redirect; 18 primary theme/viewport cases; loading, failure/Retry, limit, canonical mismatch, both payloads, and stale `403` behavior passed. Synthetic expected `503`/`403` browser resource messages were classified; all other console/page errors were zero. |
| Mutation boundary | Pass | All local API calls were intercepted; only owner-triggered synthetic POST cases wrote to the harness, no real Space/database write occurred, and stale behavior sent no automatic retry. |
| Allow-list comparison | Pass | `11/11` implementation paths are accepted, with zero unexpected product path. |
| Scope and secret scan | Pass | No secret-shaped value or auth/billing/schema/provider/queue/hosted-runtime/broader-J07 expansion entered the patch. |
| `git diff --check` | Pass | No whitespace error in the implementation or review diff. |

The local Next development server emitted the existing autoprefixer warning
for `align-items: end` at unrelated `globals.css` line 740. PR527B did not
change that selector; web lint and browser proof pass.

## Required Hosted Handoff

ARIADNE must rehearse the exact accepted review SHA without mutation:

1. confirm ready hosted web/API deployment identity at that SHA;
2. prove signed-out `/space/new` redirects through the existing login return
   path without exposing builder or entitlement state;
3. as the replay owner, prove the truthful Private-tier unavailable state,
   exact two destinations, and absence of form/Create controls;
4. follow Billing and My Spaces and confirm both are real owner-safe routes;
5. run System, Light, and Dark at `1440x900`, `390x844`, and `375x812` with no
   fixed-dark residue, overlap, clipping, horizontal overflow, focus failure,
   page error, or unclassified console error;
6. assert no `POST /spaces`, product/data write, Space creation, or cleanup;
7. commit no screenshot, cookie, token, private owner content, or secret-bearing
   evidence.

The replay-owner rehearsal is negative proof only. It cannot claim entitled
create, edit, public readback, or cleanup. After it passes, J07 remains
`BLOCKED_HOSTED_DEPENDENCY` until a separately authorized disposable entitled
fixture proves the full lifecycle and cleanup.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR527B Space entitlement and visibility repair with a narrow policy, stale-state, theme, and accessibility patch.
- Private web/API defaults, canonical tier-before-count gating, denial no-write behavior, full command validation, and independent 26-group browser proof pass.
- No hosted Space or J07 lifecycle is claimed; exact-SHA replay-owner proof remains no-write and negative only.
Verdict:
- ACCEPT_PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_WITH_ARGUS_PATCH
Task:
- Close the local implementation review and wake ARIADNE for the locked exact-SHA no-write hosted rehearsal.
- Keep the wider PR527 correction programme moving.
```
