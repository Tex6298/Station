# PR525G - Hosted Light-Parity Rehearsal

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
OPEN_HOSTED_LIGHT_PARITY_REHEARSAL
```

## Why This Runs Now

The full local light-composition sequence is accepted:

- PR525B: shared warm-light frame and exact global navigation;
- PR525C: Studio dashboard and minimal rail;
- PR525D: full-height companion shell and thread disclosure;
- PR525E: compact chat visual system and honest states;
- PR525F: three-column honest Forums index;
- PR526A/PR526B: current Discern head audited, safe presentation direction
  placed, unsafe flow engine rejected, implementation parked.

PR525G is the required hosted human-eye and measured proof before any shared
dark-theme work begins. Local source presence and local screenshots are not a
substitute.

Locked evidence:

- `docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`
- `docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525C_STUDIO_DASHBOARD_MINIMAL_RAIL_COMPOSITION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525F_FORUMS_THREE_COLUMN_HONEST_COMPOSITION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR526B_DISCERN_GUIDED_TASK_BOUNDARY_PREFLIGHT_CLOSEOUT_MIMIR.md`

## Deployment Gate

Targets:

```text
Web: https://stationweb-production.up.railway.app
API: https://stationapi-production.up.railway.app
```

1. Check both public `/health/deployment` routes without printing secrets.
2. Hosted web must report ready on `0e090a0c` or a later main descendant that
   contains it. Record the sanitized served SHA, branch, and service.
3. API must report ready. PR525B-F contain no API production change, so API SHA
   equality is not a visual acceptance requirement; record it and fail only on
   stale/incompatible or unready runtime evidence.
4. Poll a stale web deployment at sensible quiet intervals for up to twenty
   minutes. If the accepted code is still not served, commit the exact stale-
   deployment blocker and wake MIMIR without issuing a product verdict.
5. Use a fresh browser context after deployment freshness is proven so stale
   assets or an old service worker cannot masquerade as current UI.

## Sessions And Safety

- Use one fresh signed-out context and one replay-owner context authenticated
  with local-only `STATION_REPLAY_OWNER_EMAIL` and
  `STATION_REPLAY_OWNER_PASSWORD`. Never print or commit either value, tokens,
  cookies, raw persona/conversation identifiers, or private message text.
- Confirm sign-in persists after refresh on `/studio` and the selected
  companion route. A lost session is a blocker, not an automatic-logout pass.
- Use existing hosted replay data. This rehearsal is read-only: do not send a
  provider message, archive a conversation, mutate Memory/Canon/candidates,
  create a forum record, or change account data.
- A browser-only intercepted conversation-read failure is allowed to prove the
  unavailable visual state if it changes no hosted data. Label it simulated.

## Required Human Routes

Exercise every route as a human would at `1440x900`, `390x844`, and
`375x812`. Record bounding rectangles, computed styles, focus/touch behavior,
scroll width, page errors, and a human-eye verdict; screenshots alone are not
enough.

### Global Frame

- Signed out: `/discover` and `/forums`.
- Signed in: `/studio` and the owner-private companion route.
- Confirm the global navigation is exactly `46px`, uses the warm frame and
  blue underline active treatment, fits all viewports, and keeps every current
  destination reachable through the visible links or named menus.
- Exercise keyboard opening/closing and route focus in the mobile navigation
  and signed-in work/account menu. Check sign-in/sign-up and private/public
  labels for truthful session state.

### Studio Dashboard

- Enter `/studio` through the ordinary signed-in route, not a raw fixture URL.
- Desktop rail must be exactly `156px`; the first viewport must visibly contain
  the owner/private heading, Open Companion, New Persona, Choose Path, Open
  Public Space, Station Assistant, owned companions, and truthful Integrity
  state without the old dark dashboard/rail block.
- At both narrow viewports no desktop rail or blank left column may remain.
  Open the compact Studio disclosure by keyboard/touch and prove the relocated
  destinations still work as links.
- Do not fail accepted secondary content merely because it continues below the
  first viewport; do fail missing capability, nested-card clutter in the first
  hierarchy, clipped controls, or document-level horizontal overflow.

### Companion Shell And Chat

- Reach the replay persona through `/studio` and select an existing populated
  thread through the visible `Threads` disclosure. Also check New chat without
  sending.
- Desktop rail must be `156px`; the primary companion workspace must consume
  the remaining width and the first workspace must be `854px` below the global
  bar. Advanced Studio must begin after, not inside, that workspace.
- Confirm the thread directory is complete and URL-backed behind its named
  disclosure, selection returns focus, long names remain readable, and refresh
  preserves both session and selected route.
- In the active thread, measure the compact chat header (`46px` desktop,
  `54px` narrow), return row, bounded message log, and exact `66px` composer.
  Return plus log must retain at least `70%` desktop occupancy.
- Confirm user bubbles use `#d8e8fb / #225d9c`, assistant bubbles use
  `#f0eee9`, message text is `13px`, and composer text is `12px / 18px`.
- Hover and focus one assistant response; open the native action disclosure by
  keyboard/touch and confirm exactly Save to memory and Promote to canon are
  reachable without activating either mutation.
- Confirm Continue, recap, Start fresh, Archive/New chat, provider/setup truth,
  read-only archived state when available, and a simulated unavailable state
  remain visibly distinct. Do not turn a missing optional fixture into a pass;
  name it as unproven when local accepted proof remains the only evidence.
- At `390px` and `375px`, assert primary bounding rectangles as well as
  `scrollWidth`: no clipped half-workspace, blank rail, hidden composer,
  overlapped final message, or document-level horizontal overflow.

### Forums

- Use the public `/forums` route with its real hosted category response.
- At desktop, assert exact `210px / 720px / 260px` tracks, `18px` gaps, `24px`
  heading, and normal `720px x 128px` category-card target while allowing real
  long content to grow.
- Verify `Navigate`, Communities, real category links, returned subcommunity
  labels, and context wording contain no fake sort, vote, score, activity,
  provenance, live-Salon, posting-mode, or fallback claim.
- At `390px` and `375px`, assert exact `354px` and `339px` feeds at x `18`,
  feed-first order, context after the complete feed, absent desktop rail,
  keyboard/touch-operable Forum routes disclosure, and no overflow.
- Record loading/error/empty as accepted local state proof if the live response
  cannot honestly enter them without interception; do not mutate or sabotage
  hosted data to manufacture those states.

## Current-Discern Reconciliation

The comparison target remains the measured `de7b918e` composition. Cite the
accepted PR526A/PR526B audit when calling the hosted result current-head
reconciled:

- one-question guidance and typed previews remain adaptable future direction;
- the generic action engine, provider endpoint, localStorage private/durable
  draft persistence, replacement flows, duplicate routes, auth sweep, and
  global CSS are deliberately not implemented;
- PR526C-F remain parked and are not a PR525G defect.

Do not claim current Discern feature parity or guided-flow implementation.

## Human-Eye Questions

Answer directly:

1. Does the accepted public/Studio/companion/Forums path now read as one
   restrained warm Station product rather than a dark generic dashboard around
   a separate landing page?
2. Is conversation visibly dominant in the companion first viewport while
   owner/privacy, thread choice, continuity, and Advanced Studio remain clear?
3. Is the Studio rail useful but quiet, with no lost capability?
4. Does Forums feel like a real community index rather than a stretched list
   or a set of decorative controls?
5. Are mobile fitting, keyboard focus, disclosure behavior, state labels, and
   contrast credible for protected alpha?
6. Is any remaining mismatch a concrete PR525 correction, an accepted visible
   deviation, a future PR526 product decision, or PR525H theme work?

Developer Space observatory interiors are an accepted preserved dark surface
and are outside this composition rehearsal. Do not fail PR525G merely because
they were deliberately not recolored.

## Verdict And Handoff

Create:

```text
docs/roadmap/PR525G_HOSTED_LIGHT_PARITY_REHEARSAL_RESULT.md
```

Wake MIMIR with exactly one of:

```text
PASS_PR525G_HOSTED_LIGHT_PARITY_REHEARSAL
BLOCK_PR525G_HOSTED_LIGHT_PARITY_REHEARSAL
```

The result must include deployment identity, session persistence, exact route
and viewport matrix, measured rectangles/styles, real-link/capability
inventory, page errors, human-eye answers, accepted deviations, and any
unproven fixture state. If blocked, give a DAEDALUS-ready defect list with
route, viewport, action, expected, actual, evidence, and smallest likely file
owner.

Do not patch production UI in this lane. Do not return to wait without a
committed result or concrete blocker and `WAKEUP A1:`.
