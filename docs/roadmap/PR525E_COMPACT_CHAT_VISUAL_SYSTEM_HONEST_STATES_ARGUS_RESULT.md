# PR525E - Compact Chat Visual System And Honest States ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-14

Status:

```text
ACCEPT_PR525E_COMPACT_CHAT_VISUAL_SYSTEM_HONEST_STATES_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts PR525E with a narrow honest-state and focused-style patch. No
DAEDALUS repair lane is required before MIMIR closes PR525E and decides the
next locked move.

The accepted private companion chat retains the measured `46px` desktop
header, `54px` narrow header, compact return row, `13px` warm bubbles, `66px`
composer, native assistant-action disclosure, bounded message scrolling, and
the PR525D first-workspace geometry. The patch changes no route, request,
payload, owner check, provider path, stream parser, archive mutation, candidate
mutation, or conversation-selection behavior.

## ARGUS Patch

Independent failure and pointer-state rendering found three bounded defects:

1. Save to memory and Promote to canon still swallowed rejected writes. The
   control returned from `Saving...` to its idle label with no owner-visible
   failure, contrary to the lane's explicit honest-state gate.
2. Archive errors were added below the current scroll position without making
   the new content visible inside the bounded log. A failed archive therefore
   looked like an idle Archive button unless the owner manually scrolled.
3. The inherited dark chat-button hover background still overrode warm
   secondary and danger controls. After pointer or sticky-touch activation,
   Archive and recap could compute as dark text on a dark background.

ARGUS routes both assistant-mutation failures through the existing
`chatErrorMetadata` and in-log error callout, guarded by the existing selection
generation. Archive/error content now participates in contained log
auto-scroll, and the error follows archive content so failed candidate review
also remains reachable. Focused companion selectors preserve warm secondary,
primary, send, danger, and quiet hover colors without changing commands.

## Contract Review

Accepted:

- `getSession`, bearer placement, encoded persona/conversation reads, API-side
  ownership validation, and stale-selection generation guards remain intact;
- `sendPersonaChatWithStream`, optimistic input restoration, stream status,
  Enter/Shift+Enter behavior, creation callback, provider routing, token and
  credit policy, and provider errors are unchanged;
- Save to memory and Promote to canon remain the only assistant actions and
  retain their exact endpoint paths and `{ messageId }` payloads;
- native `details`/`summary` keeps the disclosure keyboard reachable, reveals
  on fine-pointer hover/focus, remains explicit on touch, retains summary
  focus on open, and scrolls only the chat log when controls extend below it;
- archive pending/success/failure, archived read-only mode, New chat escape,
  transcript count, editable continuity candidates, and Accept/Reject remain
  the existing live behaviors;
- unavailable selected threads remain errors with a disabled composer, and an
  accepted provider-configuration failure retains the exact AI Provider
  settings callout rather than silently becoming New chat;
- the return actions remain owner-triggered: Continue only focuses, recap only
  prefills and focuses, and Start fresh uses the existing route callback;
- PR525D shell/sidebar geometry and Advanced Studio placement remain intact;
- no public persona chat, Forums, PR526 flow, API, schema, auth implementation,
  provider, retrieval, storage, billing, Redis, Cloudflare, queue/worker,
  deployment, Developer Space, package, or lockfile path changed;
- no high-risk secret-shaped literal was added.

## Rendered Verification

ARGUS used local Chromium, a synthetic owner session, and intercepted
owner-scoped responses. No real credential, cookie, private identifier,
private content, hosted write, or provider call was used or retained.

| Viewport / state | Independent result |
| --- | --- |
| `1440x900`, populated active thread | Chat is `738.766px`; header `46px`; return row `52px`; message log `572.766px`; composer `66px`. Return plus log occupy `84.6%`, the composer ends at the chat bottom, and the PR525D primary remains `854px`. |
| Desktop bubbles | User computes to `rgb(216,232,251)` / `rgb(34,93,156)`, `13px / 700 / 19px`, `10px 14px`, `7px`, and within `64%`. Assistant computes to `rgb(240,238,233)` / `rgb(31,37,41)`, `13px / 19px`, `12px 14px`, `7px`, and exactly `430px` under long-content stress. |
| Desktop action disclosure | Summary is quiet initially, reveals on row hover and focus, opens with Enter, retains summary focus, exposes exactly two live buttons, and keeps the opened `60px` controls wholly inside the message log. |
| Failure matrix | Memory-save rejection becomes a visible in-log error. Archive shows `Archiving...`, restores the action, and keeps rejection visible. Candidate-review rejection remains visible. Canon uses the same tested guarded error path. |
| Button pointer states | Archive/recap compute to warm `rgb(248,247,244)` with `rgb(31,37,41)` text; primary remains dark/white; danger computes to `rgb(248,232,229)` / `rgb(157,60,53)`. All tested states meet at least `4.5:1` text contrast. |
| `390x844` | Header `54px`; log `435px`; composer `66px`; primary `730px`. Touch disclosure is visible and operable, opened actions remain inside the log, and horizontal overflow is zero. |
| `375x812` | Header `54px`; log `403px`; composer `66px`; primary `698px`. Long unbreakable content wraps, opened actions remain inside the log, and horizontal overflow is zero. |
| Provider setup | Accepted `provider_config` failure shows `Open AI Provider settings` at `/settings#ai-provider`, marks the thread Unavailable, disables the composer, and reports zero page errors. |

All browser scenarios reported zero page errors. Advanced document/export
requests remained at zero before opening Advanced Studio.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/persona-conversations.test.ts apps/web/lib/companion-home-context.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | `39/39` focused navigation/conversation/chat tests. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | `254/254` tests. |
| `npx --yes pnpm@10.32.1 run test:auth` | Pass | `21/21` tests. |
| `npx --yes pnpm@10.32.1 run test:conversation-archive` | Pass | `43/43` tests. |
| `npx --yes pnpm@10.32.1 run test:developer-spaces` | Pass | `61/61` tests. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npx --yes pnpm@10.32.1 run lint` | Pass | Web lint passed with no warnings or errors. |
| Local Playwright review | Pass after patch | Geometry, computed styles, disclosure hover/focus/touch, contained reveal, memory/archive/candidate/provider failures, archived read-only state, mobile fit, overflow, and page errors passed. |
| `git diff --check d8e4a0be^ --` | Pass | No whitespace errors. |
| Changed-path forbidden-scope scan | Pass | Production changes remain in focused private-chat TSX, CSS, and test paths. |
| High-risk secret pattern scan | Pass | No secret-shaped added literal was found. |

`build` was not rerun by ARGUS; it was not an acceptance gate. The local Next
render compiled and exercised the reviewed route, and typecheck/lint passed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR525E with a narrow honest-failure and hover-state patch.
- Exact chat geometry/styles, owner/auth/privacy, live mutations, provider and
  archive truth, keyboard/touch disclosure, mobile fit, tests, and independent
  rendered checks pass.
Task:
- Close PR525E and decide the next locked move under the terminal UI pause.
```
