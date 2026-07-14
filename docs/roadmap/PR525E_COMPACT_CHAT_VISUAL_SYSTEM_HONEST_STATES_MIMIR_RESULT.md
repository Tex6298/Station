# PR525E - Compact Chat Visual System And Honest States Result

Owner chain: MIMIR / A1 -> DAEDALUS / A2 (two unconsumed wakes) -> MIMIR / A1

Review owner: ARGUS / A3

Date completed: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

PR525E translates the measured Discern chat language into the accepted Tex
Station PR525D companion shell. The owner-private chat now has a `46px`
desktop header, compact return row, `13px` warm user and assistant bubbles, a
stable `66px` composer, and one native assistant-action disclosure containing
the two existing live mutations only.

DAEDALUS did not consume implementation wakes `90ec7887` or `e98db95b`.
MIMIR completed the bounded slice rather than leave the active baton idle.
ARGUS remains the independent reviewer.

## Changed Files

```text
apps/web/app/globals.css
apps/web/components/studio/persona-chat.tsx
apps/web/components/studio/persona-chat.test.ts
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_DAEDALUS.md
docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_MIMIR_RESULT.md
```

No page composition, companion sidebar, public persona chat, Forums, API,
schema, auth, provider routing, retrieval, storage, billing, Redis,
Cloudflare, queue, deployment, package, or lockfile changed.

## Presentation And Interaction

- Desktop chat header is exactly `46px`; long titles use an accessible full
  `title` readback and ellipsis without changing workspace height.
- Mobile chat header is `54px` so the full-name text can wrap to two lines
  without colliding with honest state and Archive/New chat controls.
- User bubbles compute to `#d8e8fb` / `#225d9c`, `13px / 700`, `19px` line
  height, `10px 14px` padding, `7px` radius, and `64%` desktop max width.
- Assistant bubbles compute to `#f0eee9` / `#1f2529`, `13px / 19px`,
  `12px 14px` padding, `7px` radius, and `430px` desktop max width.
- The return row keeps Continue primary and recap/Start fresh secondary.
  Recap still only fills and focuses the existing owner-editable composer.
- The composer is exactly `66px`; its input is `12px / 18px`, `48px` high,
  and remains anchored at the accepted chat bottom.
- Each assistant message has one native `details/summary` disclosure. Fine
  pointers reveal the summary on row hover or focus; touch exposes it directly.
  Opening it reveals the existing Save to memory and Promote to canon buttons,
  preserves summary focus, and scrolls only the bounded log when the controls
  would otherwise fall below its visible edge.
- A focused quiet-action hover rule prevents mobile sticky hover from applying
  the inherited dark control background to warm dark text.

## Rendered Geometry

Owner-safe Chromium proof used synthetic browser API responses and no hosted or
private user data.

| Viewport | Header | Return | Message log | Composer | Return + log / chat | Primary / Advanced |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `1440x900` | `46px` | `52px` | `572.8px` | `66px` | `84.6%` | primary bottom `900`; Advanced top `912` |
| `390x844` | `54px` | `66px` | `435px` | `66px` | `80.4%` | primary bottom `841`; Advanced top `853` |
| `375x812` | `54px` | `66px` | `403px` | `66px` | `79.4%` | primary bottom `809`; Advanced top `821` |

All three viewports had zero document horizontal overflow, a genuinely
scrolling message log, the opened action controls wholly inside that log, and
zero browser page errors. Desktop proved hidden -> hover -> focus -> Enter
reveal. Both touch viewports proved an initially visible disclosure, tap-open,
two operable controls, retained summary focus, and identical readable control
styles.

## Honest State Matrix

| State or action | Result |
| --- | --- |
| New / active | Existing URL ownership, return row, message count, and live composer retained |
| Sending / provider setup | Existing stream/fallback path retained; accepted-provider failure shows the current Settings link |
| Selected read failure | `Unavailable` state, explicit error, disabled composer; no silent new-chat fallback |
| Archive pending / failure | `Archiving...` then explicit bounded failure; live Archive action returns |
| Archived read-only | `Archived`, disabled composer, New chat escape, transcript count, editable candidate review retained |
| Assistant mutations | Exactly Save to memory and Promote to canon; no copied or placeholder controls |
| Long content | Unbreakable assistant content wraps inside `430px` desktop / `94%` mobile bounds |
| Advanced Studio | Remains after the accepted first workspace and unchanged |

## Validation

| Check | Result |
| --- | --- |
| Focused PersonaChat tests | Pass, `11/11` |
| `test:studio-ui` | Pass, `253/253` |
| `test:auth` | Pass, `21/21` |
| `test:conversation-archive` | Pass, `43/43` |
| `test:developer-spaces` | Pass, `61/61` |
| `typecheck` | Pass, `2/2` Turbo tasks |
| `lint` | Pass, no warnings or errors |
| Chromium desktop / `390px` / `375px` proof | Pass |
| Active/unavailable/archived/provider/archive state proof | Pass |
| Horizontal overflow / browser page errors | `0 / 0` |
| `git diff --check` | Pass; line-ending warnings only |
| Changed-path boundary / high-risk secret scan | Pass |

## Visible Deviation Ledger

| Discern source behavior | Tex behavior / PR525 treatment | Why exact visible match is unsafe or impossible | Closest faithful treatment retained |
| --- | --- | --- | --- |
| Hover-hidden inline message actions | One native action disclosure is hover/focus quiet on fine pointers and explicit on touch | Hover-only controls are undiscoverable and inoperable on touch and can lose keyboard reach | Same two mutations, same local placement, compact reveal, no invented actions |
| `46px` chat header and narrow bubble ratios at every width | `46px` desktop header; `54px` mobile header; user/assistant maxima widen to `84%` / `94%` on narrow screens | Long owner titles and compact honest state controls collide at `375px`; `64%` / `430px` constraints waste scarce mobile width | Same compact hierarchy, warm colors, type, padding, radii, and fixed first-workspace fit |

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR completed PR525E after DAEDALUS did not consume either implementation
  wake.
- Measured chat geometry, native message-action disclosure, contained reveal,
  touch hover correction, honest states, tests, and desktop/mobile proof pass.
Task:
- Review measured bubbles/header/composer/return geometry, accessible message
  actions, send/archive/candidate/provider/error preservation, mobile fit,
  tests, and forbidden shell/backend/PR525F/PR526 scope.
- Patch only a narrow defect; otherwise wake MIMIR with acceptance or the exact
  blocker.
```
