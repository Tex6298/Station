# PR485 - Discern Companion UX Translation Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - wake ARGUS

## Why This Lane

PR484J-N is externally blocked on hosted archive connector config and hosted
migration proof. MIMIR therefore parks that live connector proof and opens the
next numbered product lane requested by Marty:

```text
Discern companion/UI upgrade translation
```

This is not a cherry-pick lane. The Discern commits are reference
implementations for product behavior and interaction patterns. Tex Station must
translate only the useful pieces into the current Tex architecture, streaming
chat/runtime behavior, and visual language.

## Reference Commits

MIMIR inspected:

- `de7b918e feat: refine Station companion UX`
- `99ae8a5c feat: refine Studio chat layout`

Relevant reference ideas found:

- companion chat becomes more of a companion home rather than a single embedded
  message box;
- a dedicated Memory inbox / continuity candidate inbox route appears under the
  persona workspace;
- a companion shortcut strip links Memory inbox, Timeline, Profile, and
  Integrity-style work;
- return-to-thread behavior supports continuing an existing thread, summarizing
  where things were left, or starting fresh;
- companion capability and presence context are injected into runtime prompts;
- local chat layout has better thread orientation, archived/new chat states,
  and side context affordances.

Important Tex differences:

- Tex currently has newer streaming chat behavior via `sendPersonaChatWithStream`
  and private provider setup/error metadata that Discern does not have.
- Tex persona pages already include public interaction readback, voice/avatar
  readiness, encounter readiness/preview, runtime context preview, export
  status, and published continuity history.
- Tex already has separate persona routes for Memory, Canon, Continuity,
  Archive/files, Integrity/calibration, and Edit/Profile-like behavior.
- Tex's current global styling and hosted product direction must stay in force;
  Discern's global CSS/layout skin is not accepted as a wholesale import.

## ARGUS Task

Hostile-preflight PR485 and decide the smallest safe first implementation slice.

Return exactly one of:

```text
ACCEPT_PR485A_COMPANION_HOME_SHORTCUTS
ACCEPT_PR485A_MEMORY_INBOX_CANDIDATES
ACCEPT_PR485A_RETURN_TO_THREAD_READBACK
ACCEPT_PR485A_COMPANION_PRESENCE_PROMPT_CONTEXT
PATCH_SCOPE
BLOCKED_NEEDS_UNBLOCK_LANE
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify:

- exact product slice;
- exact touched files or acceptable local equivalents;
- whether API changes are allowed or the first slice must be web-only;
- validation commands;
- whether ARIADNE hosted desktop/mobile human rehearsal is required after
  ARGUS accepts DAEDALUS implementation.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables the companion UX translation.

## Candidate PR485A Slices

ARGUS may accept, combine narrowly, patch, or reject these candidates.

### Candidate 1: Companion Home Shortcuts

Owner-visible persona home/chat surface gains a compact shortcut strip pointing
to existing Tex routes:

- Memory inbox or Memory review target;
- Timeline / Continuity route;
- Profile / edit route;
- Integrity / calibration route.

Allowed shape:

- reuse current Tex persona routes and auth boundaries;
- keep current streaming chat component and provider setup behavior intact;
- make the chat area feel like a companion home without moving unrelated
  product surfaces into a new global shell;
- use Tex design tokens/classes or small scoped CSS only.

### Candidate 2: Memory Inbox / Continuity Candidate Inbox

Translate Discern's `memory-inbox` idea into Tex as a reviewable owner route for
pending continuity candidates.

Allowed shape:

- use existing `/conversations/candidates/inbox` and
  `/conversations/candidates/:candidateId` behavior if already safe;
- list pending memory/canon continuity candidates for the selected persona;
- allow owner accept/reject with editable title/content if existing API
  supports it;
- link back to companion chat and Integrity;
- keep raw source bodies, SQL/table details, stack traces, prompt text, provider
  payloads, tokens, cookies, and secret-shaped values out of readback.

### Candidate 3: Return-To-Thread Readback

Improve chat orientation around existing and archived conversations:

- continue current thread;
- start fresh;
- summarize or review archived thread state if already supported;
- make archived conversations read-only and obviously resumable via new chat.

Allowed shape:

- preserve `sendPersonaChatWithStream`;
- preserve provider setup notices and runtime debug privacy boundaries;
- do not add LLM summarization unless ARGUS explicitly accepts a no-new-provider
  or existing-provider-safe boundary;
- prefer readback/copy/route behavior before new durable summary storage.

### Candidate 4: Companion Capability / Presence Prompt Context

Translate Discern's capability/presence prompt context into Tex runtime only if
it fits the current provider/retrieval architecture.

Allowed shape:

- small helper(s) in `packages/ai` describing current companion capability and
  return-state behavior;
- use existing persona fields only unless ARGUS names a schema-safe unblock;
- inject safe prompt context without exposing it in public UI or compiled prompt
  readback beyond existing owner-only runtime preview boundaries;
- do not weaken answer-contract, selected-context, embedding/profile, token
  accounting, or provider-routing behavior.

## Questions ARGUS Should Answer

1. Which candidate is the smallest real product improvement that carries the
   Discern companion direction into Tex?
2. Can the first slice be web-only, or does the Memory inbox require API/test
   hardening first?
3. Does Tex's existing `candidateListSchema` and candidate review route already
   support a persona-scoped pending inbox safely?
4. How should "Timeline" map in Tex: existing Continuity route, conversation
   archive, or a later separate timeline lane?
5. What is the right Tex "Profile" target: persona edit route, public persona
   readback, or a later profile route?
6. Should companion presence prompt context wait until visible companion home
   and inbox routing are accepted?
7. What Discern ideas are explicitly rejected for PR485A because they are skin,
   global layout churn, stale API assumptions, or outside Tex's product truth?
8. What must DAEDALUS validate locally?
9. What must ARIADNE rehearse on hosted desktop and mobile if the visible
   surface changes?

## Guardrails

Do not:

- wholesale import Discern global CSS;
- broad-reskin unrelated pages;
- replace Tex's current navigation, public pages, billing pages, Developer
  Spaces, Archive connector UI, or global theme;
- remove or regress Tex streaming chat, private provider setup notices, runtime
  debug/privacy guards, token-credit accounting, retrieval answer-contract
  behavior, or existing persona workspace panels;
- introduce Discern-only assumptions about companion type, onboarding path,
  provider config, CSS framework, global layout, or session shape;
- add migrations, external config, Redis/Cloudflare, provider/model calls,
  billing, social connectors, archive connector behavior, public writes,
  workers/queues, or live external API calls;
- expose compiled prompts, private source bodies, raw candidate/source ids,
  owner ids, SQL/table details, stack traces, cookies, tokens, provider
  payloads, hosted logs, or secret-shaped values.

## Inputs

- `de7b918e feat: refine Station companion UX`
- `99ae8a5c feat: refine Studio chat layout`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `apps/web/app/studio/personas/[personaId]/continuity/page.tsx`
- `apps/web/app/studio/personas/[personaId]/calibration/page.tsx`
- `apps/web/app/studio/personas/[personaId]/edit/page.tsx`
- `apps/web/components/studio/runtime-context-preview.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/api/src/routes/conversations.ts`
- `packages/ai/src/retrieval/context-builder.ts`
- `packages/ai/src/prompts/persona-chat.ts`
- Current persona/conversation/archive/continuity tests.

## Wakeup Template

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485 Discern companion UX translation preflight.
Verdict:
- ACCEPT_PR485A_COMPANION_HOME_SHORTCUTS | ACCEPT_PR485A_MEMORY_INBOX_CANDIDATES | ACCEPT_PR485A_RETURN_TO_THREAD_READBACK | ACCEPT_PR485A_COMPANION_PRESENCE_PROMPT_CONTEXT | PATCH_SCOPE
Task:
- Implement the exact PR485A slice ARGUS names, translating Discern behavior into Tex Station without wholesale CSS/global layout import.
Guardrails:
- Preserve Tex streaming chat, provider setup/error behavior, token accounting, retrieval/runtime privacy, existing persona workspace panels, and scoped visual language.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR485 Discern companion UX translation preflight.
Verdict:
- BLOCKED_NEEDS_UNBLOCK_LANE | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Choose the smallest numbered unblock lane, make the product decision, or choose a different numbered product lane.
```
