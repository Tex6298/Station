# PR525D - Full-Height Companion Shell And Thread Disclosure ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-14

Status:

```text
ACCEPT_PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts PR525D with a narrow shell and accessibility patch. No DAEDALUS
repair lane is required before MIMIR closes PR525D and decides the next move.

The exact-persona route now has the accepted warm `156px` desktop rail, no
permanent rail below `960px`, complete URL-backed thread disclosure, a
conversation-dominant `854px` primary workspace, and closed lazy Advanced
Studio content beneath it. `PersonaChat`, API, auth, provider, archive,
conversation, and backend behavior remain unchanged.

## ARGUS Patch

Independent rendering found three bounded defects:

1. `.studio-persona-chat` still inherited generic `.card` padding. The wasted
   inset kept the retained return row plus message log below the locked `70%`
   primary-workspace occupancy and left the composer `17px` above the workspace
   bottom.
2. Mobile summary, companion, and thread names used `nowrap` ellipsis despite
   the explicit PR525D requirement that mobile names wrap.
3. Closing the mobile disclosure from an active same-route keyboard link moved
   focus to `BODY` instead of a visible control.

ARGUS removed only the inherited chat-card padding, made mobile summary/list
rows wrap in max-content scroll tracks, allowed for the extra summary line in
the mobile workspace height, and restored focus to the visible summary after
selection. No message, composer, return-action, URL, fetch, or mutation logic
changed.

## Contract Review

Accepted:

- persona, persona-list, and conversation-list reads still begin only after
  session restore and use the existing access token;
- the signed-out exact persona URL redirects to the login route with the full
  path and `c=` query preserved;
- the selected conversation remains native `c=` route state, arbitrary or
  unavailable IDs fail visibly, and API ownership validation remains inside
  `PersonaChat`;
- stale async completions, thread refresh after create/archive, archived
  read-only behavior, provider/setup errors, and contained auto-scroll are
  unchanged;
- all 32 fixture threads plus New conversation render through native links;
  filtering, no-match, zero-thread, archived, and selected states remain
  truthful;
- all owned companions, Memory, Inbox, Timeline, Profile, Integrity, Canon,
  Archive, Studio home, Publish, Settings, New chat, and New persona remain
  reachable;
- Advanced Studio starts after the primary workspace, remains closed initially,
  and does not request document/export history before opening;
- switching personas remounts the dynamic page boundary: the review observed no
  stale document history and fetched the newly selected persona only after its
  Advanced Studio disclosure opened;
- exact persona layout remains separate from the general Studio rail, and no
  PR525E message/composer visual or PR525F Forums work entered the patch;
- no API, schema, auth implementation, provider, retrieval, storage, billing,
  Redis, Cloudflare, queue/worker, deployment, Developer Space interior,
  package, or lockfile path changed;
- no high-risk secret-shaped literal appears in the implementation or ARGUS
  patch.

## Rendered Verification

ARGUS used a local Next render, synthetic owner session, and intercepted
owner-safe persona/conversation responses. No real credential, token, cookie,
private identifier, private content, or hosted write was used or retained.

| Viewport / state | Independent result |
| --- | --- |
| `1440x900`, 32 threads | Rail is `(0,46)-(156,900)`; primary workspace is `(170,46)-(1426,900)` and exactly `854px` high; warm rail computes to `rgb(243, 241, 234)`; all `33` thread links and all care destinations are present. |
| Desktop long-name active thread | Chat occupies `86.5%` of the primary workspace. The retained `86.625px` return row plus `521.266px` message log occupy `71.2%`; the inner log alone is recorded separately at `61.0%`. Composer ends at `899px`; Advanced Studio begins at `912px`. |
| `390x844`, 32 threads | Desktop rail is absent; disclosure spans `390px`; URL selection changes to `?c=thread-2`; route and same-route selection both close the disclosure; complete inventory, filtering, contained scroll, composer fit, and zero overflow pass. |
| `375x812`, long names | Summary and list names wrap; the long thread row expands to `76px` inside a `252px / 700px` internally scrollable list; focus returns to `SUMMARY`; primary ends at `809px` and composer at `808px`; width is `375 / 375`. |
| Zero threads | New conversation and `No saved threads yet.` remain visible and truthful. |
| Advanced/persona switch | No document/export request occurs before opening. Persona A history disappears on switch; Persona B history loads only after opening its disclosure. |
| Signed out | `/studio/personas/persona-a?c=thread-1` redirects to `/login?redirect=%2Fstudio%2Fpersonas%2Fpersona-a%3Fc%3Dthread-1`. |

The matrix reported zero browser page errors and zero document horizontal
overflow. Auto-scroll ended at the bottom of the bounded message log.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/lib/persona-conversations.test.ts apps/web/lib/companion-home-context.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 36 focused tests passed after the ARGUS patch. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | 251 tests passed. |
| `npx --yes pnpm@10.32.1 run test:conversation-archive` | Pass | 43 tests passed. |
| `npx --yes pnpm@10.32.1 run test:auth` | Pass | 21 tests passed. |
| `npx --yes pnpm@10.32.1 run test:developer-spaces` | Pass | 61 tests passed. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npx --yes pnpm@10.32.1 run lint` | Pass | Web lint passed with no warnings or errors. |
| Local Playwright review | Pass after patch | Exact desktop/mobile geometry, complete inventories, URL/keyboard selection, wrapping, focus, lazy loading, persona isolation, signed-out redirect, overflow, and page-error checks passed. |
| `git diff --check a52e88eb^ --` | Pass | No whitespace errors. |
| Changed-path forbidden-scope scan | Pass | Production changes remain in the allowed exact-persona page/sidebar, focused CSS, and test paths. |
| High-risk secret pattern scan | Pass | No secret-shaped literals were found. |

`build` was not rerun by ARGUS; it was not an acceptance gate. The local Next
render compiled and exercised the reviewed route, and typecheck/lint passed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR525D with a narrow occupancy, mobile-wrap, and focus patch.
- Exact rail/workspace geometry, URL/thread behavior, owner/auth/privacy,
  Advanced Studio lazy loading, persona isolation, mobile fit, scope, secrets,
  full tests, and independent rendered checks pass.
Task:
- Close PR525D and use the paired PR526B verdict to decide the next move.
```
