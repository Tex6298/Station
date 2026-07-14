# PR525A - Discern Rendered Visual Parity Specification Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date completed: 2026-07-14

Status:

```text
COMPLETE_PR525A_RENDERED_VISUAL_PARITY_SPECIFICATION
```

## Verdict

Current Tex Station is not visually recognisable as the final Discern
composition at `de7b918e`.

The gap is compositional, not cosmetic:

- Tex uses a `52px` dark global bar; Discern uses a `46px` warm-light bar;
- Tex uses a `232px` dark companion rail and a `292px` Studio dashboard rail;
  Discern uses one restrained `156px` warm rail;
- Tex gives the rendered conversation thread `47.5%` of the desktop first
  viewport; Discern gives it `78.6%`;
- Tex wraps the conversation in a padded card below a persona header and five
  administrative shortcut cards; Discern makes the conversation the
  full-height workspace;
- Tex keeps thread directories and administrative state visibly dominant;
  Discern keeps personas and conversation controls compact;
- Tex renders Forums as one wide category list; Discern uses a restrained
  `210px / 720px / 260px` community/feed/context composition.

PR525 implementation is required. This result locks how it should be done
without deleting newer safe Tex capability or importing Discern backend
assumptions.

## Render Evidence

ARIADNE rendered both trees locally against the same hosted API and the same
read-only replay-owner fixture:

```text
Discern reference: de7b918e
Tex comparison:    current main at 3591df63
Viewports:         1440x900, 390x844, 375x812
Persona fixture:   13 owned personas
Thread fixture:    32 threads for the selected persona
Captures:          42
Browser page errors: 0
```

The seven equivalent capture states per tree and viewport were:

1. signed-out public navigation;
2. signed-in public navigation;
3. active Studio dashboard;
4. companion new chat;
5. populated active thread with user and assistant messages;
6. read-only simulated conversation-read failure;
7. Forums index with normal category data.

The simulated failure intercepted one browser GET with HTTP `503`; it did not
mutate hosted data. Screenshots, credentials, tokens, cookies, private IDs, and
private conversation content were kept temporary and are not committed.

Commit `99ae8a5c` was inspected only as lineage. Its removed persona topbar and
Memory/Canon/Archive right panel are not in this specification.

## Side-By-Side Summary

| Surface | Final Discern `de7b918e` | Current Tex | Locked PR525 treatment |
| --- | --- | --- | --- |
| Global navigation | Compact warm-light bar with little visual weight | Dark, taller, and route-dense | Match the `46px` warm frame; keep newer routes in a compact primary set and accessible disclosures/account menu. |
| Studio dashboard | Warm canvas, `156px` persona rail, dashboard content primary | `292px` rail with wayfinding, public presence, quota, and Assistant controls competing with a long dark dashboard | Use the Discern rail and warm hierarchy; keep owner boundary and primary actions visible; move quota and secondary operations to existing destinations/disclosures. |
| Companion shell | Full-height workspace with minimal persona rail | Padded page with a dark thread directory and administrative header stack | Rebuild around the Discern shell; move the full URL-backed thread directory behind a named disclosure. |
| Chat | Tight `13px` messages, soft blue user bubbles, warm assistant bubbles, small composer, hidden-until-needed actions | Wider dark user bubbles, bordered white assistant bubbles, visible actions, card chrome | Match Discern geometry and colors while preserving working return, archive, provider, error, and accessibility behavior. |
| Mobile Studio | Source attempts the same composition but its full-height mobile rail clips the workspace | Tex fits document width but puts the composer below the first viewport | Use Tex's working full-width collapse with Discern's compact visual language and a first-viewport composer. |
| Forums | Three-column desktop frame and compact feed cards; one-column mobile feed | One wide category list on desktop and mobile | Match Discern columns and density with real Tex category/navigation data only. |

## Shared Visual Tokens

These values come from rendered computed styles, not class-name inspection.

| Use | Discern target | Current Tex observation | PR525 lock |
| --- | --- | --- | --- |
| Global/nav canvas | `#f6f4ee` | dark `rgba(8, 11, 19, 0.94)` nav | `#f6f4ee` |
| Studio rail/canvas | `#f3f1ea` | companion rail `#171a1f`; dashboard rail `#eceae4` | `#f3f1ea` |
| Conversation/panel | `#ffffff` | mostly `#ffffff`, but inside dark/card framing | `#ffffff` |
| Soft assistant surface | `#f0eee9` | `#ffffff` with border | `#f0eee9` |
| User message | background `#d8e8fb`, text `#225d9c` | background `#24272b`, light text | `#d8e8fb` / `#225d9c` |
| Primary text | `#1a1a18` / rendered `#111` in assistant bubble | `#1f2529` on light surfaces | `#1a1a18` |
| Muted text | `#6b6b67` and forum `#6f695f` | mostly `#687078` / light-on-dark rail | `#6b6b67` |
| Structural border | Studio `#d7d2c8`; Forums `#d8d2c7` | mostly `#d8d3c8` plus dark rail borders | `1px` warm-neutral border; no heavy shadows |
| Active blue | `#1f5fa8` | purple/dark active pills and bright blue actions | `#1f5fa8` for active state, not broad decoration |
| Grounding/status strip | background `#d9e7f8`, text `#1d5fa7` | large white return panel | use only for honest current state |
| Corners | chat `7-8px`; forum cards `9px`; compact controls mostly `7-8px` | mostly `8px`, with pill-heavy controls | preserve the measured restrained radii |

Typography remains compact:

- global links: `13px`, weight `500`;
- message text: `13px` with `18.85-19.5px` line height;
- forum heading: `24px / 700` rather than current `32px / 700`;
- forum meta: `11px`;
- composer input: `12px / 18px` in the target;
- no negative letter spacing and no viewport-width font scaling.

## Global Navigation Ledger

| Measure | Discern | Tex | Required result |
| --- | --- | --- | --- |
| Height | `46px` | `52px` | `46px` on desktop, `390px`, and `375px` |
| Horizontal padding | `16px` | `20px` | `16px` |
| Background | `#f6f4ee` | dark translucent | warm light, `1px #d7d2c8` lower border |
| Active treatment | blue text plus `1px` inset underline | dark rounded active tab | target underline, no filled nav pill |
| Signed-in desktop anchors | 3 plus account in rendered Discern | 8 plus account in Tex | brand + public layer links + active private section; Projects, My Space, Developer Spaces, Billing, and Settings remain in the account/work menu |
| Signed-out anchors | 5 including auth actions in Discern | 6 including auth actions in Tex | keep Discover, Writing, Forums, Sign in, and Sign up reachable without duplicating the Station brand |
| Mobile | compact bar fits | bar fits but remains dark and `52px` | brand + current section + account/auth; remaining destinations in a named, keyboard-safe menu |

The exact Discern link count is not a deletion instruction. Current Tex routes
remain reachable, but they must no longer make the global bar visually heavier
than the product surface.

## Studio And Rail Ledger

| Measure | Discern | Tex | Required result |
| --- | --- | --- | --- |
| Dashboard desktop rail | `156px` | `292px` | `156px` |
| Companion desktop rail | `156px` | `232px` | `156px` |
| Desktop companion workspace | `1284px` after rail at 1440 | `1208px` after rail | consume all width after the `156px` rail |
| Rail surface | `#f3f1ea`, dark text, thin right border | dark companion rail; mixed dashboard rail | one warm-light rail system |
| Rail density in active fixture | 22 total links; personas, actions, Settings; no thread directory | 56 links, including 32 thread records and duplicate care/navigation links | personas remain visible; full thread list moves behind `Threads` disclosure with filter and archived state intact |
| Dashboard document height at 1440x900 | fixed first-viewport shell (`854px` below nav) | `1828px` | first viewport carries heading, primary actions, recent companions, and truthful due state; secondary panels may continue below/disclose |
| Dashboard mobile length | source shell clips behind bad mobile rail | Tex fits but reaches `3649-3789px` | full-width stack; compact first viewport; no capability deletion |

The rail should contain, in order:

1. `New chat` and `New persona`;
2. the owned persona list with selected treatment;
3. one compact `Threads` control for the selected persona;
4. a small secondary-destinations disclosure;
5. Settings at the bottom.

Do not keep the current always-visible filter plus full thread directory in the
`156px` rail. Open the directory as a keyboard-safe drawer/popover and preserve
URL-backed selection, race protection, archived labels, filtering, and native
links.

## Companion And Chat Ledger

Measured at `1440x900` with the same active populated thread:

| Measure | Discern | Tex | Required result |
| --- | --- | --- | --- |
| Chat header | `46px`, `0 16px` | `58.9px`, `10px 13px` | `46px`, compact title/privacy/state/actions |
| Shortcut strip | `34px` | `49px` | one compact horizontal strip; scroll only inside the strip on narrow screens |
| Thread height | `707px` | `427.2px` | flex to available height; conversation owns the viewport |
| First-viewport thread occupancy | `78.6%` | `47.5%` | target at least `70%` on desktop after honest conditional status rows |
| Composer | `67px`, anchored at workspace bottom | `70px`, desktop bottom but mobile below fold | `64-68px`, always reachable in the first mobile workspace viewport |
| User bubble | max `64%`, `#d8e8fb`, `#225d9c`, `13px / 700`, `10px 14px` | max `min(86%, 720px)`, dark, `14.4px / 400`, larger padding | Discern values; cap mobile width only as needed to fit |
| Assistant bubble | parent max `430px`, `#f0eee9`, `13px / 18.85px`, `12px 14px`, `7px` radius | up to `720px`, white bordered, `14.4px / 23.04px` | Discern values; permit wider only for unbreakable accessible content |
| Message actions | opacity `0`, reveal on hover | opacity `1` | target hover treatment plus `:focus-within` and an explicit touch/keyboard action menu |
| Return-to-thread | did not appear in the final reference render for the live fixture | working `67.9px` panel with three actions | retain in first viewport as a compact continuity row; one primary action, recap and fresh-start secondary |
| Integrity nudge | always-rendered `28px` source strip | no equivalent hardcoded strip | render in the same compact slot only when real due data says it is due |
| Read failure | silently became an empty/new-chat-looking surface | visible error and disabled/unavailable composer | retain Tex error truth inside the target shell |

The companion route must keep its existing owner-only label and route boundary.
The header may not expose private IDs, provider keys, prompts, archive source
text, or runtime internals.

## Mobile Fit Ledger

The final Discern source contains a real responsive defect that must not be
reproduced:

| Viewport | Discern mobile rail | Remaining workspace | Tex mobile nav | Tex composer |
| --- | --- | --- | --- | --- |
| `390x844` | `183.1px x 798px` full-height block | starts at `x=183.1`, width `206.9px` | full-width `390px x 53px` | bottom `880.4px`, below first viewport |
| `375x812` | `181.9px x 766px` full-height block | starts at `x=181.9`, width `193.1px` | full-width `375px x 53px` | bottom `880.4px`, below first viewport |

Discern hides document overflow, so a simple `scrollWidth === clientWidth`
check falsely passes while half the workspace is clipped. PR525 acceptance must
assert bounding rectangles as well as document overflow.

Locked mobile behavior:

- no desktop rail below `960px`;
- one full-width compact companion navigation summary;
- no permanent blank left column;
- full-width conversation workspace;
- compact header/shortcut/status rows;
- thread flexes inside the remaining `100dvh - 46px` workspace;
- composer remains visible and does not overlap the final message;
- inner shortcut/thread navigation may scroll; the document may not scroll
  horizontally;
- `390px` and `375px` use the same composition, with fitting only.

## Forums Ledger

| Measure | Discern | Tex | Required result |
| --- | --- | --- | --- |
| Desktop columns | `210px 720px 260px` | one `1108px` column | target columns, centered within available width |
| Desktop gap/padding | `18px / 18px` | `12px / 0` inside `1108px` container | `18px / 18px` |
| Desktop category card | `720px`, about `128px` high, `12px` padding, `9px` radius | `1108px`, about `80px`, `16px`, `8px` | target density and visual hierarchy |
| Mobile feed width | `354px` at 390; `339px` at 375 | `358px` and `343px` | target `18px` page inset |
| Mobile card height | about `172px` | about `133px` | target hierarchy, but only honest labels/actions |
| Heading | `24px` | `32px` | `24px` |
| Mobile order | feed first, context stacked later, left rail removed | header controls then category list | target order; real owner controls remain reachable |

### Honest Forum Content

| Discern visual slot | Unsafe/unsupported source behavior | Honest Tex placement |
| --- | --- | --- |
| Left `Feeds` rail | `Popular` and `Following` are no-op buttons | use real links: Forums home, Subcommunities, My recognition, and My reports when available; categories remain real links under Communities |
| `Best / Hot / New / Top` chips | no query or sorting behavior | omit until backed by a real query; do not render decorative controls |
| Vote strip | fabricated count from category sort order | use the current category marker; no arrows or number |
| Meta line | fabricated `human-led / active now` | show only category/subcommunity facts returned by the API |
| Action row | generic `Threads`, `Codex links`, and provenance claim | use category description plus a real `Open forum` action; show provenance only on records that carry it |
| Active salon widget | hardcoded replay salon | render only from a real public event/seminar source; otherwise use a truthful community navigation widget |
| Posting modes widget | broad capability claim | describe only modes currently accepted by the category create route |
| Create post | falls back to first category | keep a real category-backed create link; if no categories exist, show the existing honest empty state |

No forum API, vote model, ranking endpoint, feed endpoint, or fabricated fallback
is part of PR525.

## Capability Placement Ledger

Nothing in this table may disappear silently.

| Capability | Placement class | Locked placement |
| --- | --- | --- |
| Memory | Retain in first viewport | compact companion shortcut to the existing Memory route |
| Inbox | Retain in first viewport | compact companion shortcut with honest pending state only |
| Timeline | Retain in first viewport | compact companion shortcut |
| Profile | Retain in first viewport | compact companion shortcut/header action |
| Integrity | Retain in first viewport | compact shortcut; due strip only from real due data |
| Canon | Retain behind disclosure | `Companion care`/More disclosure leading to the existing Canon route |
| Archive | Retain behind disclosure | `Companion care`/More disclosure leading to the existing files/archive route |
| Provider setup | Retain in first viewport | conditional inline chat notice only when setup is required |
| Runtime Context | Retain below the conversation workspace | existing Advanced Studio content; never in the primary thread viewport |
| Encounters | Retain below the conversation workspace | existing readiness, contract, preview, and runtime panels under Advanced Studio |
| Publishing | Retain on existing secondary route | `/studio/publish`, reachable from Studio secondary navigation/account menu |
| Export | Retain behind disclosure | Advanced Studio summary plus existing archive/files route |
| Moderation | Retain on existing secondary route | existing role-gated forum moderation/report routes; never public primary chrome |
| Advanced Studio | Retain below the conversation workspace | compact closed summary after the full-height conversation; may be linked from a More menu |
| URL-backed thread selection | Retain behind disclosure | compact `Threads` drawer using existing native links and `c=` route contract |
| Thread filtering and archived labels | Retain behind disclosure | inside the `Threads` drawer, not the permanent rail |
| Return-to-thread flow | Retain in first viewport | compact continuity row with continue primary; recap/fresh secondary |
| Archive conversation | Retain in first viewport | named compact header icon/button with disabled truth preserved |
| Save to Memory / promote to Canon | Retain behind disclosure | hover/focus/touch message action treatment |
| Owner-only/privacy cue | Retain in first viewport | small persistent private/owner label; no ambiguous public styling |
| Station Assistant | Retain in first viewport | operational action on the Studio dashboard, not a persona in the companion rail |
| New Persona | Retain in first viewport | Studio and rail action |
| Choose Path/onboarding | Retain in first viewport | Studio dashboard primary action; no persona-route burden |
| Open Public Space | Retain in first viewport | Studio dashboard action that remains visibly distinct from private companion work |
| Projects / My Space / Developer Spaces | Retain on existing secondary route | compact global work/account menu; active route still named in local surface chrome |
| Billing/quota | Retain on existing secondary route | Billing/account menu; compact truthful limit notice only when action is blocked |
| Public interaction readback | Retain below the conversation workspace | Advanced Studio only |
| Voice/avatar readiness | Retain below the conversation workspace | Advanced Studio only |
| Published continuity history | Retain below the conversation workspace | Advanced Studio and publishing route |
| Forum recognition / subcommunities / reports | Retain in first viewport | desktop context rail; compact mobile action row/menu |

## Visible Deviation Ledger

| Discern source behavior | Tex behavior / PR525 treatment | Why exact visible match is unsafe or impossible | Closest faithful treatment retained |
| --- | --- | --- | --- |
| `181.9-183.1px` full-height mobile Studio rail clips the workspace | full-width compact mobile navigation | source is unusable at both required mobile widths | same desktop composition collapsed into one warm, compact summary |
| Discern public page scroll width reaches `566-575px` at required mobile widths | current public pages remain width-safe | horizontal overflow fails mobile accessibility; public page composition is outside this rectification | apply the target `46px` nav without importing the overflowing public layout |
| Three signed-in nav anchors in source | retain current route access through a compact primary set and account/work menu | deleting Projects, My Space, Developer Spaces, Billing, or Settings loses product capability | target height, palette, spacing, and active underline with accessible disclosure |
| Always-visible `Integrity session due` strip | condition on real due state | hardcoded due status is false product data | same `28px` visual slot only when due; shortcut always remains |
| Hover-only message actions | hover plus `:focus-within` and touch/keyboard menu | hover alone is inaccessible | actions remain visually quiet until interaction |
| Conversation read failure looks like a blank new chat | preserve visible error and unavailable composer | silent fallback misstates thread state and can invite unintended action | target shell/colors with the current explicit error contract |
| Fabricated forum votes, activity, provenance, sorting, and salon | real categories, links, subcommunity/provenance facts, and current owner controls only | fabricated/no-op behavior violates data truth | preserve the three-column frame and card density |
| Source return ritual did not render for the live active fixture | keep Tex's working return flow, compressed | continuity is core paid value and cannot disappear because the reference state failed to trigger | compact first-viewport continuity row |
| Source email/account control and minimal privacy copy | keep explicit owner/private boundaries | visibility/privacy is structural in Tex | visually quiet account control plus persistent private label |

These are the complete permitted visible deviations discovered in the rendered
matrix. `Tex-native translation`, familiarity with the current dark shell, or
broad regression risk is not an additional waiver.

## Current Tex File And Component Map

| Surface / contract | Current file | PR525 responsibility |
| --- | --- | --- |
| Shared colors, geometry, responsive rules | `apps/web/app/globals.css` | shared light tokens, `46px` offsets, rail/workspace/chat/forum geometry |
| Global placement/loading shell | `apps/web/app/layout.tsx` | keep nav loading placeholder at the same locked height |
| Global route/account navigation | `apps/web/components/nav/top-nav.tsx` | compact primary routes and accessible work/account disclosure |
| Studio shell selection | `apps/web/app/studio/layout.tsx` | keep exact persona route separate while sharing the corrected frame |
| Studio dashboard composition | `apps/web/app/studio/page.tsx` | warm first-viewport hierarchy and primary actions |
| General Studio rail/mobile nav | `apps/web/components/studio/studio-sidebar.tsx` | `156px` desktop rail and full-width mobile summary |
| Companion page and Advanced Studio | `apps/web/app/studio/personas/[personaId]/page.tsx` | conversation-first hierarchy and below-workspace disclosure |
| Companion persona/thread navigation | `apps/web/components/studio/persona-companion-sidebar.tsx` | minimal persona rail plus thread drawer |
| Chat state and controls | `apps/web/components/studio/persona-chat.tsx` | compact header, return/error/provider states, bubbles, actions, composer |
| Route/query/shortcut contracts | `apps/web/lib/studio-navigation.ts` | preserve native route helpers and define compact visible destinations |
| Conversation selection/filtering | `apps/web/lib/persona-conversations.ts` | preserve ownership-safe URL selection and thread drawer filtering |
| Forums index | `apps/web/app/forums/page.tsx` | real-data three-column composition and mobile order |
| Forum wording/subcommunity truth | `apps/web/lib/forum-copy.ts`, `apps/web/lib/community-subcommunities.ts` | retain safe labels; no fabricated status/provenance |
| Focused Studio validation | `apps/web/lib/studio-navigation.test.ts`, `apps/web/lib/persona-conversations.test.ts`, `apps/web/components/studio/persona-chat.test.ts`, `apps/web/components/studio/studio-dashboard.test.ts` | preserve route/race/state and add composition contract assertions where useful |
| Focused community validation | `apps/web/lib/forum-copy.test.ts`, `apps/web/lib/community-forum-create.test.ts`, `apps/web/lib/community-subcommunities.test.ts` | prove only real actions and labels appear |

No API, schema, auth, storage, provider, retrieval, billing, moderation, or
visibility contract needs to change for visual rectification.

## Implementation Dependency Map

1. **PR525B - Shared Warm-Light Frame And 46px Global Navigation**
   establishes tokens and the page-height dependency used by every later slice.
2. **PR525C - Studio Dashboard And Minimal Rail Composition** applies the
   `156px` rail, warm dashboard, mobile collapse, and capability relocation.
3. **PR525D - Full-Height Companion Shell And Thread Disclosure** establishes
   the conversation-dominant geometry while preserving URL-backed threads.
4. **PR525E - Compact Chat Visual System And Honest States** locks bubbles,
   composer, return flow, provider/error behavior, archive state, and accessible
   action reveal.
5. **PR525F - Forums Three-Column Honest Composition** binds the Discern frame
   to real categories, subcommunities, recognition, reports, and provenance.
6. **PR525G - Hosted Light-Parity Rehearsal** compares desktop, `390px`, and
   `375px` against this ledger and checks bounding boxes, not screenshots alone.
7. Dark mode follows only after PR525G accepts light parity. It changes theme
   tokens, not composition.

## Exact First DAEDALUS Slice

Recommend MIMIR open:

```text
PR525B - Shared Warm-Light Frame And 46px Global Navigation
```

Allowed implementation files:

```text
apps/web/app/globals.css
apps/web/app/layout.tsx
apps/web/components/nav/top-nav.tsx
apps/web/lib/studio-navigation.ts              only if route grouping needs a pure helper
apps/web/lib/studio-navigation.test.ts         focused route-preservation assertions
```

Required patch:

- add shared light tokens for the measured nav/Studio/forum palette without
  deleting the existing Developer Space dark surface tokens;
- set `.top-nav`, `.top-nav-loading`, and all downstream viewport offsets to
  `46px`;
- use `#f6f4ee`, `1px #d7d2c8`, `16px` horizontal padding, `13px` links, and
  blue underline active treatment;
- keep Discover, Writing, Forums, and the active private section legible;
- keep Projects, My Space, Developer Spaces, Billing, and Settings reachable
  through the existing account/work menu;
- keep Sign in and Sign up visible when signed out;
- at `390px` and `375px`, show a compact brand/current-section/account frame
  and place remaining routes in a named accessible menu;
- do not change any route, auth, API, data, visibility, or backend behavior;
- do not recolor Developer Space observatory interiors in this slice.

PR525B acceptance gates:

- rendered `46px` height at desktop, `390px`, and `375px` in signed-out,
  signed-in public, and active Studio states;
- no document overflow or clipped account/auth control;
- every current destination remains keyboard reachable with an accessible
  name and correct active state;
- reduced-motion/focus behavior remains intact;
- focused navigation tests, `pnpm test:studio-ui`, `pnpm typecheck`, and
  `pnpm lint` pass;
- ARGUS verifies route/auth/privacy scope before PR525C;
- ARIADNE verifies the rendered bar against the measured target.

This is small enough to review independently and large enough to establish the
shared composition. Starting with a persona-page patch before the height and
token dependency is locked would make later slices rework their offsets.

## Viewport Result Matrix

| Tree / viewport | Global navigation | Studio / companion | Forums | Result |
| --- | --- | --- | --- | --- |
| Discern desktop | target passes | target composition passes; source error and fake due behavior need deviations | target composition passes; fake controls/data need reconciliation | visual source locked |
| Tex desktop | fails height, color, density | fails rail, hierarchy, chat density, and occupancy | fails three-column composition and density | `FAIL_CURRENT_TEX_VISUAL_PARITY` |
| Discern `390px` | nav fits; public page itself overflows to `566-575px` | fails because `183.1px` blank rail clips workspace | feed fits and context stacks | source mobile defect recorded |
| Tex `390px` | fits but wrong visual frame | width-safe; composer ends `36.4px` below first viewport | width-safe but wrong hierarchy | functional fit, visual fail |
| Discern `375px` | nav fits; public page itself overflows to `566-575px` | fails because `181.9px` blank rail clips workspace | feed fits and context stacks | source mobile defect recorded |
| Tex `375px` | fits but wrong visual frame | width-safe; composer ends `68.4px` below first viewport | width-safe but wrong hierarchy | functional fit, visual fail |

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Render source identity | Pass | Detached reference worktree was exactly `de7b918e`; `99ae8a5c` was lineage only. |
| Render matrix | Pass | 42 captures covered both trees, seven states, and all three required viewports. |
| Representative state | Pass | Same 13-persona account and 32-thread persona were used; active thread included user and assistant messages. |
| Browser runtime | Pass | Zero page errors in all captures. |
| Data mutation boundary | Pass | Fixture reads only; error state used browser interception; no hosted record was created, edited, or deleted. |
| Privacy boundary | Pass | Result contains no credentials, tokens, cookies, private IDs, or private conversation text. |
| Mobile overflow inspection | Pass with source defects | Four Discern public-page overflow states and two clipped Studio workspace geometries are recorded precisely. |
| `git diff --check` | Pass | No whitespace errors; Git printed only existing LF-to-CRLF working-copy warnings. |
| Typecheck/lint | Not run | PR525A changes planning/validation Markdown only and touches no imports or scripts. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR525A rendered visual parity specification.
Task:
- Lock the implementation slices from the measured result and wake DAEDALUS
  with the first exact patch.
```
