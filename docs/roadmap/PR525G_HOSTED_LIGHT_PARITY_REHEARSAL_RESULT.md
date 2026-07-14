# PR525G - Hosted Light-Parity Rehearsal Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date completed: 2026-07-14

Verdict:

```text
PASS_PR525G_HOSTED_LIGHT_PARITY_REHEARSAL
```

## Result

The accepted PR525B-F light composition passes its hosted human-eye and
measured rehearsal. The public frame, private Studio, private companion/chat,
and real Forums index read as one restrained warm Station product at desktop,
`390px`, and `375px`. No PR525 correction or DAEDALUS patch is required before
MIMIR closes PR525G and decides the locked PR525H theme move.

This was a read-only hosted rehearsal. ARIADNE did not send a provider message,
archive a conversation, activate Memory or Canon actions, create community
data, or change account data. The unavailable state used a browser-only
intercept and changed no hosted state. Screenshots, credentials, session data,
raw identifiers, and private message text remain local temporary evidence and
are not committed.

## Deployment Gate

| Surface | Hosted result | Branch | Sanitized served SHA |
| --- | --- | --- | --- |
| Web | HTTP `200`, `ok: true`, `ready: true`, service `@station/web` | `main` | `0e090a0c46a9f46d49b350e562481d14c44ba439` |
| API | HTTP `200`, `ok: true`, `ready: true`, service `@station/api` | `main` | `0e090a0c46a9f46d49b350e562481d14c44ba439` |

The web service is on the exact required accepted commit. One preliminary API
sample briefly returned unready while retaining HTTP/deployment identity;
immediate repetition and the clean rehearsal both returned ready, and the
condition did not recur.

## Session And Safety

| Check | Result |
| --- | --- |
| Fresh signed-out context | Pass; `/discover` and `/forums` remained public and displayed Sign in / Sign up. |
| Fresh replay-owner sign-in | Pass through the normal login UI using ignored local credentials. |
| Browser session storage and auth cookie | Present without printing either value. |
| `/studio` refresh | Pass; owner session and private account control persisted. |
| Selected companion refresh | Pass; owner session and URL-backed selected thread persisted. |
| Hosted mutation boundary | Pass; no provider, archive, Memory, Canon, forum, or account mutation was activated. |

## Exact Route Matrix

| Session | Route | Viewport | Human-eye and measured result |
| --- | --- | --- | --- |
| Signed out | `/discover` | `1440x900` | Pass |
| Signed out | `/forums` | `1440x900` | Pass |
| Signed out | `/discover` | `390x844` | Pass |
| Signed out | `/forums` | `390x844` | Pass |
| Signed out | `/discover` | `375x812` | Pass |
| Signed out | `/forums` | `375x812` | Pass |
| Replay owner | `/studio` | `1440x900` | Pass |
| Replay owner | owner-private companion and selected thread | `1440x900` | Pass |
| Replay owner | `/studio` | `390x844` | Pass |
| Replay owner | owner-private companion and selected thread | `390x844` | Pass |
| Replay owner | `/studio` | `375x812` | Pass |
| Replay owner | owner-private companion and selected thread | `375x812` | Pass |

All 12 primary cases had zero document-level horizontal overflow and zero
browser `pageerror` events.

## Global Frame

- The top navigation measured exactly `46px` in all 12 cases.
- The frame background computed to `rgb(246, 244, 238)` and the active route to
  `rgb(31, 95, 168)` with the same blue inset underline in every case.
- Every case had one active route and zero measured top-navigation overlaps.
- Signed-out desktop exposed all three public routes plus truthful Sign in and
  Sign up controls. Narrow layouts retained the current route and a named menu
  containing all three public routes.
- Signed-in desktop exposed four public/work routes and a six-destination
  private account menu. Narrow layouts exposed nine routes through the named
  route menu and all six private destinations through the account menu.
- Keyboard and touch opening, Escape closing, route selection, and focus return
  passed for the route, account, Studio, Forum, and thread disclosures.

## Studio Dashboard

| Viewport | Desktop rail | Compact Studio navigation | Required first-viewport truth |
| --- | --- | --- | --- |
| `1440x900` | `156px`, visible | Hidden | Pass |
| `390x844` | `0px`, hidden | `390px`, full width | Pass |
| `375x812` | `0px`, hidden | `375px`, full width | Pass |

The owner/private heading, Open Companion, New Persona, Choose Path, Open
Public Space, Station Assistant, owned companion data, and truthful Integrity
state were all present and fully readable in the first viewport. The compact
mobile Studio disclosure retained Dashboard, chat/persona creation,
publishing/onboarding, Assistant, Archive, notes, export, settings, writing,
public Space, and persona links without a blank rail or hidden capability.

## Companion Shell And Chat

The selected measurement thread was an existing read-only archived replay
thread so both message roles, the assistant action disclosure, archived truth,
and the disabled composer could be proved without mutation. Active-thread
continuation controls and New chat were exercised separately without sending.

| Viewport | Shell / rail | Primary workspace | Chat header | Composer | Return + log occupancy |
| --- | --- | --- | --- | --- | --- |
| `1440x900` | `1440x854` / `156px` | `1256x854` | `46px` | `66px`, bottom `899px` | `84.6%` |
| `390x844` | `390px` wide / rail hidden | `374x730` | `54px` | `66px`, bottom `828px` | `80.4%` |
| `375x812` | `375px` wide / rail hidden | `359x698` | `54px` | `66px`, bottom `796px` | `79.4%` |

- The desktop companion workspace occupied the exact `854px` below the global
  bar. Advanced Studio began below that workspace rather than inside it.
- The thread disclosure listed all `32` existing replay threads; all had
  messages, the filter was labelled, the selected route was URL-backed, and
  selection left meaningful focus on the selected thread link.
- Long thread rows had no measured unlabelled truncation.
- User bubbles computed to `rgb(216, 232, 251)` / `rgb(34, 93, 156)`
  (`#d8e8fb` / `#225d9c`). Assistant bubbles computed to
  `rgb(240, 238, 233)` (`#f0eee9`). Message text was `13px`.
- Composer text computed to `12px / 18px`; the composer remained visible at
  both narrow viewport bottoms and did not cover the final message.
- The native assistant action disclosure opened by keyboard/touch and exposed
  exactly Save to memory and Promote to canon. Neither action was activated.
- The populated active thread exposed the return card, Continue, Ask for
  recap, Start fresh, and Archive. Continue focused the composer and recap
  produced an editable draft that was cleared without sending.
- New chat displayed the distinct `New` state, enabled composer, and honest
  empty state. The archived fixture displayed `Archived`, disabled its
  composer, used the archived send label, and exposed New chat.
- The browser-only unavailable probe displayed `Unavailable`, an owner-visible
  read failure, a disabled composer, and an unavailable send control with zero
  page errors.

The hosted replay did not naturally enter the provider/setup state, so its
accepted local PR525E proof remains the evidence for that optional state.

## Forums

| Viewport | Layout / feed | Card target | Navigation and context |
| --- | --- | --- | --- |
| `1440x900` | `210px / 720px / 260px`, two `18px` gaps | `720x128` normal card | Full Navigate and Communities rails; `24px` heading |
| `390x844` | feed x `18`, width `354px`; desktop rail absent | `354x172` normal card | Four-link disclosure; complete context after feed |
| `375x812` | feed x `18`, width `339px`; desktop rail absent | `339x172` normal card | Four-link disclosure; complete context after feed |

The hosted response supplied nine real categories, nine matching community
links, and one returned subcommunity label. Response order was retained. The
complete mobile feed preceded context, and no fake sort, vote, score, activity,
provenance, live-Salon, posting-mode, or fallback claim appeared.

The live response remained in its normal state. Loading, error, and empty
Forums states therefore retain accepted local PR525F proof rather than a
manufactured hosted failure.

## Browser Diagnostics

- Public navigation accrued zero console errors and zero page errors.
- Authenticated forced route transitions accrued caught Next.js RSC-payload
  fallback diagnostics. A separate sanitized classification reproduced five
  fallback messages on one companion transition, found no HTTP `>=400`
  response, and loaded the destination normally.
- The final authenticated cumulative console count was `33` after fixture
  enumeration and repeated full-page transitions. This is recorded explicitly
  as a caught framework fallback during scripted navigation; the rehearsal
  does not claim a zero-console run.
- Every primary case and the simulated unavailable state retained zero browser
  page errors, intact route state, and usable rendered content.

## Current-Discern Reconciliation

The hosted result is current-head reconciled through the accepted PR526A audit
and PR526B preflight, not through a claim of source feature parity:

- deterministic one-question guidance and typed previews remain adaptable
  future direction;
- the generic action engine, provider endpoint, private/durable localStorage
  drafts, replacement flows, duplicate routes, auth sweep, and global CSS are
  deliberately absent;
- PR526C-F remain parked and create no PR525G defect.

## Human-Eye Answers

1. **Yes.** Discover, Studio, companion/chat, and Forums now read as one
   restrained warm Station product rather than a dark generic dashboard beside
   a separate public page.
2. **Yes.** Conversation dominates the companion first viewport while
   owner-only truth, thread choice, continuity candidates, and the deferred
   Advanced Studio region remain legible.
3. **Yes.** The `156px` Studio rail is quiet and useful on desktop; the mobile
   disclosure preserves the same capabilities without a blank column.
4. **Yes.** Forums reads as a real community index with real category data,
   useful navigation, and restrained context rather than decorative controls.
5. **Yes.** Both narrow widths fit without horizontal overflow or incoherent
   overlap. Focus, disclosure behavior, state labels, and warm contrast are
   credible for protected alpha.
6. **No PR525 correction remains.** Developer Space observatory interiors are
   the accepted preserved dark deviation; provider/setup and live Forums
   loading/error/empty remain explicitly local-only fixture proof; PR526C-F are
   parked product decisions; shared theme treatment belongs to PR525H.

## Accepted Deviations And Unproven Fixtures

- Developer Space observatory interiors remain intentionally dark and outside
  this light-composition rehearsal.
- Provider/setup truth was not naturally triggered in the read-only replay.
- Forums loading, error, and empty states were not manufactured against the
  real hosted response.
- The hosted result does not claim current Discern guided-flow implementation
  or feature parity.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Web and API `/health/deployment` | Pass | Both ready on `main` at the exact accepted SHA. |
| Hosted Playwright matrix | Pass | 12 primary route/viewport cases, zero blockers, zero page errors, and zero horizontal overflow. |
| Session refresh proof | Pass | Studio and selected owner-private companion route persisted. |
| Keyboard/touch and route proof | Pass | Named menus, focus return, complete links, and URL-backed thread selection passed. |
| Read-only state proof | Pass with one optional state unproven | Active, New, archived, assistant actions, and simulated unavailable passed; provider/setup retains local proof. |
| Human-eye review | Pass | Desktop, `390px`, and `375px` captures were inspected; no clipping, overlap, hierarchy, or contrast blocker found. |
| `git diff --check` | Pass | Documentation result has no whitespace errors. |
| `pnpm typecheck` | Not required | PR525G changes documentation only and touches no imports or scripts. |

## Handoff

MIMIR should close PR525G as accepted, then decide and place the locked PR525H
shared light/dark theme treatment without reopening the accepted composition or
the parked PR526 implementation proposals.
