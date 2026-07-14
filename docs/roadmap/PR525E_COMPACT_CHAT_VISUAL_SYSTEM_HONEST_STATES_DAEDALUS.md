# PR525E - Compact Chat Visual System And Honest States

Owner chain: MIMIR / A1 -> DAEDALUS / A2 (two unconsumed wakes) -> MIMIR / A1

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

Implementation result:

`docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_MIMIR_RESULT.md`

## Locked Sources

Rendered visual measurements and required deviations:

`docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`

Accepted shell and current-head boundaries:

- `docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR526B_DISCERN_GUIDED_TASK_BOUNDARY_PREFLIGHT_CLOSEOUT_MIMIR.md`

The visual target remains Discern `de7b918e`. PR526C-F are parked and supply no
engine, endpoint, provider, storage, or flow implementation to this lane.

## Exact Slice

PR525E changes only the existing owner-private `PersonaChat` presentation and
the smallest interaction structure needed for accessible message-action
reveal. It applies the measured compact chat language inside the accepted
PR525D shell while preserving every current send, return, archive, candidate,
provider, error, and route behavior.

### Header And State

- Target a stable `46px` desktop chat header with compact private label, title,
  honest New/Active/Archived/Unavailable state, message count, and current
  Archive/New chat action.
- Preserve long-title wrapping or accessible full-name readback without
  resizing the first workspace incoherently.
- Loading must remain visibly busy. An unavailable selected thread must remain
  an error, not silently become new chat.

### Messages And Actions

- Use `13px` message text with compact line height and restrained `7-8px`
  corners.
- User bubbles target max `64%`, `#d8e8fb` background, `#225d9c` text,
  `13px / 700`, and `10px 14px` padding. Narrow viewports may widen only enough
  to keep content legible and contained.
- Assistant bubbles target max `430px`, `#f0eee9`, primary warm text,
  `13px / 18.85-19.5px`, `12px 14px`, and a `7px` radius. Long unbreakable
  content must wrap without widening the document.
- Keep Save to memory and Promote to canon as the only assistant-message
  actions. Reveal them on hover and `:focus-within` without removing them from
  keyboard access, and provide an explicit native touch/keyboard action
  disclosure. Restructure the existing buttons rather than duplicating
  mutation controls. Do not invent Copy, Regenerate, Notes, Tools, or feedback
  controls.
- Pending stream text, error callouts, provider setup guidance, and saved/review
  failures remain visible inside the bounded log.

### Return, Archive, And Provider Truth

- Retain the working return-to-thread row in compact form inside the first
  viewport: Continue is primary; recap and Start fresh are secondary. Recap
  must only prefill the existing owner-editable prompt and focus the composer;
  it must not auto-send or call a provider.
- Preserve archived read-only state, New chat escape, archive pending/error
  truth, archived transcript counts, editable continuity candidates, and
  Accept/Reject behavior.
- Preserve the current private-provider setup callout and Settings link. Do not
  add provider names, model selectors, generated setup guidance, endpoint
  calls, or local flow persistence.

### Composer And Responsive Fit

- Target a stable `64-68px` composer with `12px / 18px` input text, compact
  warm input surface, and a clear Send command.
- Preserve Enter to send, Shift+Enter for newline, input trimming, disabled
  sending/archived/unavailable states, streaming status, and conversation
  creation callback exactly.
- Keep the composer at the bottom of the accepted first workspace on desktop,
  `390x844`, and `375x812`; it may not overlap the final message or force a
  document-level horizontal scrollbar.
- The message log, not the document, owns message scrolling. Preserve contained
  auto-scroll and the PR525D desktop occupancy/mobile-fit acceptance.

## Preserved Contracts

- Preserve `getSession`, bearer-token placement, owner/persona validation,
  encoded conversation/persona query, stale-selection generation guards, and
  `c=` route ownership outside `PersonaChat`.
- Preserve `sendPersonaChatWithStream`, callbacks, request body, stream event
  parsing, token/credit/provider policy, errors, and optimistic message logic.
- Preserve Save to memory, Promote to canon, archive, candidate review, and
  exact API paths/payloads. No action may become a visual placeholder.
- Preserve signed-out handling, selected-thread unavailable truth, archived
  read-only state, no-message state, and all Advanced Studio boundaries.
- Do not touch sidebar/shell composition, Forums, public persona chat,
  Developer Spaces, API, schema, auth implementation, provider routing,
  retrieval, storage, billing, Redis, Cloudflare, queue/worker, deployment,
  secrets, package metadata, or lockfiles.

## Allowed Files

```text
apps/web/components/studio/persona-chat.tsx
apps/web/components/studio/persona-chat.test.ts
apps/web/app/globals.css                              focused chat selectors only
apps/web/lib/companion-home-context.test.ts          preservation assertion only if needed
docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_DAEDALUS.md
docs/roadmap/PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_DAEDALUS_RESULT.md
```

Do not alter `page.tsx`, `persona-companion-sidebar.tsx`, navigation helpers,
package files, or the PR525D shell geometry without committing the exact
blocker for MIMIR.

## Acceptance Gates

- At `1440x900`, header is `46px`, composer is `64-68px`, return/message-log
  occupancy remains at least `70%` in the populated return-row state, and the
  composer remains anchored at the primary-workspace bottom.
- Computed user/assistant bubble colors, widths, typography, padding, and radii
  match the locked ledger within normal browser rounding.
- Message actions are hidden until needed for fine-pointer users, reveal on
  hover and focus, and remain operable through an explicit native disclosure
  on touch and keyboard without focus loss or overlap.
- New chat, populated active, sending, selected-read failure, provider setup,
  archive pending, archived read-only, candidate review, save/review failure,
  and long-content states remain visibly distinct and truthful.
- At `390x844` and `375x812`, header, return state, message log, action
  disclosure, and composer fit the accepted full-width shell with no clipped
  final message, blank rail, overlap, or horizontal overflow.
- No public-persona chat selector or route changes, no PR525F Forums drift, no
  PR526 flow mechanism, and no backend/provider/auth/storage drift.
- Focused chat/navigation tests, `pnpm test:studio-ui`, `pnpm test:auth`,
  `pnpm test:conversation-archive`, `pnpm test:developer-spaces`,
  `pnpm typecheck`, and `pnpm lint` pass.
- Playwright desktop/`390px`/`375px` proof records header/composer/message-log/
  return/action rectangles, computed bubble styles, keyboard/touch action
  behavior, state truth, overflow, page errors, and Advanced Studio placement.
- `git diff --check`, changed-path scope scan, and secret scan pass.

## Result And Handoff

Commit a PR525E result with changed-file inventory, measured styles and
geometry, state/action matrix, validation, and every visible deviation in
PR525A's required four-line format.

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR implemented PR525E after DAEDALUS did not consume either implementation
  wake. Compact chat visuals and honest states remain inside the accepted
  PR525D shell.
Task:
- Review measured bubbles/header/composer/return geometry, accessible message
  actions, send/archive/candidate/provider/error preservation, mobile fit,
  tests, and forbidden shell/backend/PR525F/PR526 scope.
- Patch only a narrow defect; otherwise wake MIMIR with acceptance or the exact
  blocker.
```

Do not return to foreground wait without a committed result and handoff or a
committed concrete blocker for MIMIR.
