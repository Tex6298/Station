# PR494A - Companion Home Context Rail Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for MIMIR hosted rehearsal routing

## Verdict

```text
ACCEPT_PR494A_COMPANION_HOME_CONTEXT_RAIL_IMPLEMENTATION
```

ARGUS accepts the PR494A implementation without a code patch. The implementation
matches the accepted web-only Companion Home Context Rail scope.

## Review

DAEDALUS added a deterministic `companionHomeContextRail` helper and refined the
existing side panel on `/studio/personas/[personaId]` into a compact owner-only
rail beside `PersonaChat`.

Accepted behavior:

- uses already-loaded persona fields and `persona.continuity` aggregate counts;
- links only to real owner routes for Memory, Inbox, Timeline, Canon,
  Archive/files, Profile, and Integrity;
- keeps Memory Inbox on `/studio/personas/[personaId]/memory-inbox`;
- labels candidate counts as aggregate candidates, not pending-only truth;
- keeps Runtime Context Preview as the selected-source and prompt review
  surface;
- leaves `PersonaChat` source and behavior unchanged;
- keeps APIs, prompts, retrieval, provider routing, public chat, Studio shell,
  sidebar, topbar, and broad CSS unchanged.

## Scope Check

Changed files stayed inside the accepted boundary:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/companion-home-context.ts`
- `apps/web/lib/companion-home-context.test.ts`
- roadmap and validation docs

ARGUS found no stale `/conversations/candidates/inbox`, no `source=all`, no
Discern `StudioRightPanel`, no query-selected conversation behavior, no
`PersonaChat` drift, no API/migration/runtime drift, and no shell/sidebar/topbar
replacement.

The rail does not expose private source bodies, raw ids, prompts, compiled
prompts, provider payloads, tokens, cookies, auth headers, IP addresses,
user-agent values, secret-shaped values, durable presence, mood, intimacy,
autonomy claims, or unwired controls.

## Validation

ARGUS reran the requested validation on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Exact owner links, aggregate labels, Memory Inbox route, scoped CSS, Runtime Context Preview separation, and no `PersonaChat`/API/prompt/runtime drift passed review. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts` | Pass | 37 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only for `.station-agents/state/ARGUS.json`; no whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are documented as non-failures in the validation baseline.

## Required MIMIR / ARIADNE Next Step

MIMIR should route ARIADNE hosted rehearsal before PR494A closeout.

ARIADNE should verify desktop plus `375px` and `390px` mobile:

- hosted web/API freshness at `7d02d887` or later;
- owner persona home loads;
- companion context rail is visible, readable, and does not overlap chat;
- Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity links
  target accepted owner routes;
- Memory and Inbox remain separate;
- return-card, private chat send path, archive/candidate panel, and provider
  setup/error copy have no drift;
- Runtime Context Preview remains the only selected-source/prompt preview;
- no private source body, raw id, provider payload, token, cookie, header,
  IP/user-agent, prompt, compiled prompt, secret-shaped value, hidden autonomy
  claim, placeholder control, public chat change, or broad shell/topbar/sidebar
  drift appears.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted the PR494A Companion Home Context Rail implementation without a code patch.
- The rail uses already-loaded persona fields and aggregate continuity counts, with real owner links for Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity.
- Memory Inbox stays on /studio/personas/[personaId]/memory-inbox; stale /conversations/candidates/inbox and source=all paths remain absent.
- PersonaChat source/behavior, APIs, prompts, retrieval, provider routing, public chat, Studio shell/sidebar/topbar, broad CSS, and Runtime Context Preview boundaries passed review.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
Task:
- Route ARIADNE hosted desktop/375px/390px rehearsal for PR494A before closeout.
- Verify owner persona home rail fit/readability, exact route targets, Memory/Inbox separation, private chat no-drift, Runtime Context Preview separation, privacy/no-leak boundaries, and no forbidden shell/topbar/sidebar/broad CSS or runtime claims.
```
