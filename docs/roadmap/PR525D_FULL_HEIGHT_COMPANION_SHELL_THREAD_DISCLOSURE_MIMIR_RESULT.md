# PR525D - Full-Height Companion Shell And Thread Disclosure Result

Owner: MIMIR / A1 after an unconsumed DAEDALUS wakeup

Review owner: ARGUS / A3

Date completed: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

PR525D translates the accepted exact-persona companion composition into Tex
Station without changing the conversation contract. The route now has an
exact `156px` warm desktop rail, a complete URL-backed thread directory behind
one native disclosure, a conversation-dominant `854px` first workspace at
`1440x900`, a full-width mobile collapse below `960px`, and the complete
Advanced Studio surface after the primary workspace.

DAEDALUS did not consume the implementation wake at `6a3614d6` or the explicit
retry at `9d20bb82`. MIMIR completed the bounded slice rather than leave the
active baton idle. ARGUS remains the independent reviewer.

## Changed Files

```text
apps/web/app/globals.css
apps/web/app/studio/personas/[personaId]/page.tsx
apps/web/components/studio/persona-companion-sidebar.tsx
apps/web/lib/companion-home-context.test.ts
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_DAEDALUS.md
docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_MIMIR_RESULT.md
docs/roadmap/PR526B_DISCERN_GUIDED_TASK_BOUNDARY_PREFLIGHT_ARGUS.md
```

No `persona-chat.tsx`, API, schema, auth implementation, provider, retrieval,
storage, billing, Redis, Cloudflare, queue, deployment, Forums, Developer Space
interior, package, or lockfile changed.

## Companion Rail And Thread Placement

- The permanent desktop rail is exactly `156px` at `960px` and above and no
  longer repeats the Station brand or displays the complete thread directory.
- Permanent order is New chat/New persona, complete owned companions, one
  `Threads` disclosure, one `Companion care` disclosure, then Settings fixed
  at the bottom.
- `Threads` contains a labelled filter, New conversation, every current
  URL-backed thread, selected state, archived labels, and distinct empty and
  no-match truth. No `.slice()` or other display cap remains.
- Desktop long names use an accessible `title`; mobile companion and thread
  names remain available in the complete internally scrollable disclosure.
- `Companion care` retains Memory, Inbox, Timeline, Profile, Integrity, Canon,
  Archive, Studio home, and Publish without turning the permanent rail into a
  destination wall.

## Workspace And Responsive Geometry

- The owner/private header, five-item shortcut strip, and existing
  `PersonaChat` are grouped as one primary workspace.
- At `1440x900`, the rail spans `(0,46)-(156,900)` and the primary workspace
  spans `(170,46)-(1426,900)`: exactly `854px` high after the `46px` global
  navigation. The conversation fills the remaining primary grid track.
- In the 32-thread desktop proof, the inner message thread was `508px` high
  after the honest chat heading, return card, and composer. The composer ended
  at `883px`; Advanced Studio began at `912px`.
- Advanced Studio remains a closed named disclosure after the full-height
  primary workspace. Existing lazy loading and every secondary panel remain
  in place.
- Below `960px`, the desktop rail computes to `display:none`; the page starts
  at `x=0`, uses the full viewport width, and has no blank rail column.
- The mobile disclosure is native details/summary, height-bounded, internally
  scrollable, keyboard-operable, and closes after a destination selection,
  including an active same-route link.
- A narrow inherited flex-basis defect in the existing return card was scoped
  away on the focused mobile companion page so it cannot consume most of the
  thread height. No chat behavior or visual-system work entered PR525E.

## State And Route Proof

| State | Result |
| --- | --- |
| Desktop, 32 threads | `33` disclosure links including New conversation; final long thread present; filter/no-match pass |
| Mobile `390x844`, 32 threads | no rail; `33` thread links; keyboard selection closes disclosure and updates `?c=thread-2` |
| Mobile `375x812`, zero threads | no rail or blank column; truthful New conversation and no-saved-threads state |
| Desktop, one archived thread | selected archived label remains visible and the existing chat read-only contract is preserved |
| URL contract | native `c=` selection, New chat, selected state, and stale-request protection remain owned by existing helpers |
| Capability inventory | Memory, Inbox, Timeline, Profile, Integrity, Canon, Archive, Studio home, Publish, Settings, and persona switching remain reachable |
| Advanced Studio | begins after the primary viewport and remains lazy until opened |

Measured mobile proof at `390x844` placed the primary workspace from `y=99`
to `841`, the composer bottom at `824`, and Advanced Studio at `853`. Both
desktop and mobile matrices reported zero document horizontal overflow and
zero browser page errors.

## Validation

| Check | Result |
| --- | --- |
| Focused navigation/conversation/chat-preservation tests | Pass, `36/36` |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass, `251/251` |
| `npx --yes pnpm@10.32.1 run test:auth` | Pass, `21/21` |
| `npx --yes pnpm@10.32.1 run test:conversation-archive` | Pass, `43/43` |
| `npx --yes pnpm@10.32.1 run test:developer-spaces` | Pass, `61/61` |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass, `2/2` Turbo tasks |
| `npx --yes pnpm@10.32.1 run lint` | Pass, no errors |
| Desktop `1440x900` exact geometry rerun | Pass, `156px` rail and `854px` primary workspace |
| Mobile `390x844` inventory/keyboard/URL rerun | Pass |
| Mobile `375x812` zero-thread proof | Pass |
| Document horizontal overflow / page errors | `0 / 0` |
| `git diff --check` | Pass; line-ending warnings only |

The final MIMIR geometry correction moved the primary workspace boundary, not
any conversation implementation. ARGUS then removed an inherited generic
`.card` inset, restored mobile long-name wrapping and summary focus, and
reserved the extra mobile summary-line height. In ARGUS's post-patch long-name
desktop stress case, the retained return row plus inner log occupied `71.2%`
of the `854px` primary workspace, the composer ended at `899px`, and Advanced
Studio still began at `912px`. At `375x812`, the wrapped-summary primary ended
at `809px`, the composer at `808px`, and long thread rows expanded inside the
internally scrollable list without document overflow.

Focused `36/36` tests, full requested suites, and desktop/mobile browser
assertions passed after the ARGUS correction. Final review truth is recorded
in:

`docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_ARGUS_RESULT.md`

## Scope And Deviations

No PR525A four-line visible deviation is required. PR525D intentionally does
not change message bubbles, composer appearance, provider/error treatment,
archive behavior, return actions, or message actions; those remain PR525E.
It also does not import Discern global CSS or any `ff93308b` action engine,
provider endpoint, localStorage persistence, replacement flow, or route alias.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR completed PR525D after DAEDALUS did not consume the implementation
  wakeup.
- Exact 156px/960px geometry, complete URL-backed disclosures, full-height
  conversation workspace, mobile closure, tests, and rendered proof pass.
Task:
- Review exact geometry, URL/thread behavior, owner/auth/privacy boundaries,
  mobile disclosure closure, Advanced Studio preservation, and scope.
- Patch only a narrow defect; otherwise continue into the queued docs-only
  PR526B preflight and wake MIMIR with both verdicts or the exact blocker.
```
