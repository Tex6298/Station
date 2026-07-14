# PR525D - Full-Height Companion Shell And Thread Disclosure

Owner chain: MIMIR / A1 -> DAEDALUS / A2 (unconsumed) -> MIMIR / A1

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Locked Sources

Rendered measurement and capability/deviation ledger:

`docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`

Accepted shared frame and general Studio dependencies:

- `docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525C_STUDIO_DASHBOARD_MINIMAL_RAIL_COMPOSITION_CLOSEOUT_MIMIR.md`

The visual target remains Discern commit `de7b918e`. Commit `99ae8a5c` is
lineage only. Fresh Discern head `ff93308b` does not modify the main companion
page, `PersonaChat`, or companion rail; PR526A audits its separate
creation/configuration flow system in parallel.

## Exact Slice

PR525D changes only the exact-persona companion shell, permanent companion
rail, URL-backed thread disclosure, and responsive workspace geometry. It
must make the conversation own the first viewport without beginning PR525E's
message-bubble, composer visual, return-flow, provider/error, archive-state, or
message-action treatment.

### Desktop companion rail

- At `960px` and above, use the accepted warm rail system at exactly `156px`
  below the `46px` global navigation.
- Remove the duplicate Station brand and the current permanent filter/full
  thread directory.
- Keep this permanent order:
  1. New chat and New persona;
  2. the complete compact owned-persona list with selected treatment;
  3. one named `Threads` disclosure for the selected persona;
  4. one compact `Companion care`/secondary disclosure;
  5. Settings at the bottom.
- Put thread filtering, New conversation, the complete current thread list,
  archived labels, selected state, and no-match truth inside the `Threads`
  disclosure. Use native links and preserve the existing `c=` URL contract.
- Keep Memory inbox, Timeline/Continuity, Profile, Integrity, Canon, Archive,
  Studio home, and Publish reachable through the compact shortcut/header,
  `Companion care`, or accepted global/Studio navigation placement. Do not
  duplicate all of them permanently merely to fill the rail.
- Long desktop persona/thread names may use ellipsis only when the full text is
  available through an accessible name or `title`; mobile names must wrap.

### Companion workspace

- Consume all width after the `156px` rail and at least the full
  `100dvh - 46px` first workspace viewport.
- Group the compact owner/private companion header, shortcut strip, and chat as
  one primary workspace. Keep `Advanced Studio` after that full-height primary
  workspace as a closed, named disclosure.
- Preserve the existing owner-only label, profile access, companion short
  description, Memory inbox, Timeline/Continuity, Profile, and Integrity
  shortcuts. Use compact labels rather than diagnostic cards.
- Let the existing conversation region flex into remaining height. At
  `1440x900`, target at least `70%` first-viewport thread occupancy after real
  conditional status rows.
- Keep the existing composer reachable at the bottom of the first primary
  workspace on desktop and both required mobile widths. PR525D may correct
  shell sizing/overflow only; PR525E owns composer appearance and behavior.
- Keep Advanced Studio contents, lazy loading, Runtime Context, encounters,
  readiness, public interaction readback, exports, and published continuity
  unchanged beneath the primary workspace.

### Mobile companion shell

- Below `960px`, render no permanent desktop rail or blank left column.
- Use one compact full-width warm companion summary/disclosure below the
  accepted `46px` global navigation, then a full-width conversation workspace.
- Preserve current companion/place/private naming, New chat, New persona,
  persona switching, complete thread inventory and filtering, archived labels,
  care shortcuts, Studio home, Publish, and Settings.
- Bound and internally scroll the open disclosure. Close it after any
  destination selection, including active same-route links, using the accepted
  PR525C interaction pattern.
- At `390x844` and `375x812`, the header, shortcut strip, thread, and composer
  must fit without document-level horizontal overflow, clipped workspace,
  permanent blank rail, incoherent overlap, or hidden final message.

## Preserved Contracts

- Preserve owner/persona scope, session restoration, signed-out redirect,
  private loading/error truth, API calls, visibility, and all backend data.
- Preserve `personaConversationTarget`, `studioPersonaConversationHref`,
  native `c=` selection, exact selected/new-chat state, thread refresh after
  create/archive, archived read-only labels, filtering, stale async protection,
  and no-match truth.
- Preserve `PersonaChat` send/stream/provider/archive/error/return/message
  behavior exactly. Do not alter request bodies, response parsing, chat state,
  prompts, provider routing, memory/canon mutations, or race protection.
- Preserve every Advanced Studio panel and lazy-load boundary.
- Do not touch API, schema, auth implementation, storage, retrieval, provider,
  billing, Redis, Cloudflare, queues/workers, deployment, secrets, Forums, or
  Developer Space interiors.
- Do not import Discern global CSS or copy its mobile clipping defect.

## Allowed Files

```text
apps/web/app/globals.css
apps/web/app/studio/personas/[personaId]/page.tsx
apps/web/components/studio/persona-companion-sidebar.tsx
apps/web/lib/studio-navigation.ts                    pure placement helpers only
apps/web/lib/persona-conversations.ts                pure drawer helpers only
apps/web/lib/studio-navigation.test.ts
apps/web/lib/persona-conversations.test.ts
apps/web/lib/companion-home-context.test.ts          focused shell assertions only
apps/web/components/studio/persona-chat.test.ts      preservation assertions only
```

Do not change `persona-chat.tsx` in PR525D without committing a concrete shell
blocker for MIMIR. Do not alter package metadata or lockfiles.

## Acceptance Gates

- Desktop rail computes to exactly `156px` at `1440x900`; workspace consumes
  the remainder and the primary companion workspace is at least `854px` high.
- Conversation/thread region occupies at least `70%` of the desktop first
  workspace viewport after honest conditional rows.
- Permanent rail contains no full thread directory, always-visible combined
  filter, duplicate Station brand, or duplicated care-route wall.
- `Threads` exposes all threads, filter, New conversation, archived and
  selected states, and no-match truth through keyboard-safe native links.
- At `390x844` and `375x812`, no desktop rail or blank column renders; summary,
  workspace, thread, and composer fit and selection closes the disclosure.
- Signed-out, loading, persona error, zero-thread, one-thread, 32-thread,
  archived-selected, filtered/no-match, new-chat, and active-thread states are
  truthful and route-safe.
- Advanced Studio remains below the primary workspace and every current panel
  remains reachable without eager private-data loading.
- Focused navigation/conversation/chat-preservation tests pass.
- `pnpm test:studio-ui`, `pnpm test:auth`, `pnpm test:conversation-archive`,
  `pnpm test:developer-spaces`, `pnpm typecheck`, and `pnpm lint` pass.
- Playwright desktop/`390px`/`375px` proof records rail/workspace/thread/
  composer rectangles, disclosure inventory and keyboard closure, selected
  URL, overflow, page errors, and Advanced Studio placement.
- `git diff --check`, changed-path scope scan, and secret scan pass.

## Result And Handoff

MIMIR completed the bounded implementation after DAEDALUS did not consume the
implementation wakeup. The measured result is recorded in:

`docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_MIMIR_RESULT.md`

The result includes the changed-file inventory, measurements, thread and
capability placement, state proof, validation, and deviation decision. ARGUS
now owns this review handoff:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR implemented PR525D after DAEDALUS did not consume the wakeup.
- The full-height companion shell and thread disclosure are ready without
  entering PR525E chat visuals.
Task:
- Review exact 156px/960px geometry, URL-backed thread behavior, owner/auth/
  privacy boundaries, mobile disclosure closure, Advanced Studio preservation,
  tests, and forbidden PR525E/backend/Developer Space scope.
- Patch only a narrow defect; otherwise wake MIMIR with acceptance or the exact
  blocker.
```

ARGUS must commit acceptance, a narrow review patch, or the exact blocker and
wake MIMIR before returning to foreground wait.
