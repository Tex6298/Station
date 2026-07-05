# PR485D - Companion Presence And Capability Context Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hostile preflight

## Why This Lane

PR485A, PR485B, and PR485C translated the visible companion-home shortcuts,
Memory inbox, and return-to-thread pieces from the recent Discern companion UX
work.

The remaining useful Discern idea is prompt-level companion presence and
capability context:

- the companion should know whether a thread is first contact, active,
  returning, or long-gap;
- the companion should carry a clear capability boundary: conversation-first by
  default, workflow-aware when explicitly supported later, and never claiming
  tools or autonomy Station did not provide.

This should improve Station's core companion feel without importing Discern's
skin, global CSS, stale endpoints, route-query behavior, or unreviewed
execution claims.

## Reference Material

Treat these as references, not patches to merge wholesale:

- `de7b918e feat: refine Station companion UX`
  - `docs/product/goose-inspired-companion-capabilities.md`
  - `packages/ai/src/companion-capabilities.ts`
  - `packages/ai/src/companion-presence.ts`
  - `packages/ai/src/prompts/persona-chat.ts`
  - `packages/ai/src/retrieval/context-builder.ts`
  - `apps/api/src/routes/conversations.ts`
- `99ae8a5c feat: refine Studio chat layout`
  - supporting context only; do not import its shell/layout wholesale.

Tex Station already has a denser runtime context builder, selected-context answer
focus, provider routing, token budgeting, queueing, observability, and private
archive retrieval. PR485D must fit into those current contracts rather than
replacing them.

## Candidate Slice For ARGUS To Review

MIMIR recommends a no-migration, private-owner-chat first slice:

1. Add translated AI helpers:
   - `buildCompanionCapabilityProfile`
   - `formatCapabilityProfileForPrompt`
   - `buildCompanionPresenceProfile`
   - `formatPresenceProfileForPrompt`
2. Extend `buildPersonaChatPrompt` with optional capability and presence
   sections.
3. Extend `assemblePersonaRuntimeContext` to accept optional prompt-ready
   capability/presence strings, or to accept small structured inputs that it
   formats internally.
4. In the private `/conversations/persona/:personaId/chat` flow, compute
   presence from the existing same-conversation history already loaded before
   inserting the new owner message:
   - no prior message or zero count -> `first_contact`;
   - recent prior messages -> `active_thread`;
   - old prior messages -> `returning` or `long_gap`.
5. Add capability context with safe default behavior:
   - no new DB fields in this slice;
   - default current personas to `conversation-first`;
   - preserve future typed inputs for later explicit companion configuration;
   - do not infer "extension-aware" from provider, tier, archive volume, or
     private source material.

Recommended first-slice boundaries:

- private owner persona chat only;
- context-preview can either omit presence or show a neutral first-contact
  profile; ARGUS should decide;
- public persona anonymous chat is out of scope unless ARGUS explicitly accepts
  a safe public variant;
- no UI surface change is required for this slice.

## Guardrails

Do not add:

- migrations or persona schema fields;
- route-selected conversation loading or query-param behavior;
- automatic summary/LLM calls;
- durable presence, mood, intimacy, or emotional-state storage;
- tool execution, browsing, file access, MCP, external services, or autonomy
  claims;
- prompt/retrieval source ordering rewrites beyond inserting the reviewed
  optional context sections;
- provider routing, token accounting, queue behavior, embedding, Redis,
  Cloudflare, Archive connector, billing, social connector, public write, or
  broad UI changes;
- Discern global CSS, Studio shell replacement, or visible reskin.

Prompt copy must explicitly preserve Station boundaries:

- companions may help clarify, plan, draft, reflect, and preserve continuity;
- companions must not claim to read files, edit systems, browse, call tools, or
  execute workflows unless Station explicitly provides that capability in the
  current turn;
- requests outside chat should become a plan/checklist/draft workflow with owner
  confirmation, not hidden action.

## ARGUS Questions

ARGUS should decide:

- Is the no-migration default `conversation-first` capability profile safe and
  useful enough for this first slice?
- Should capability formatting live in `packages/ai` helpers and be passed into
  `buildPersonaChatPrompt`, or should `assemblePersonaRuntimeContext` own all
  formatting?
- Should presence be computed in the API chat route from already-loaded history,
  or in the runtime context builder?
- Should owner context-preview include presence context, capability context,
  both, or neither?
- What tests must prove the feature without relying on provider output?

## Expected Validation If Accepted

DAEDALUS should be required to add focused tests proving:

- capability helper outputs are deterministic and boundary-safe;
- presence helper thresholds produce `first_contact`, `active_thread`,
  `returning`, and `long_gap`;
- `buildPersonaChatPrompt` includes capability/presence only when provided;
- private chat passes the accepted presence/capability context without changing
  provider routing, token accounting, selected-context answer focus, or archive
  retrieval;
- public persona chat and public context-preview do not accidentally receive
  private owner prompt context;
- no raw ids, source bodies, provider payloads, tokens, cookies, stack traces, or
  secret-shaped values enter visible readback.

## Verdicts

Return one of:

```text
ACCEPT_PR485D_NO_MIGRATION_PROMPT_CONTEXT
ACCEPT_WITH_PATCHED_BOUNDARY
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_SCOPE_TOO_RISKY
```

If accepted, wake DAEDALUS with the exact implementation boundary. If blocked,
wake MIMIR with the smallest concrete decision needed.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR485C after ARIADNE passed hosted rehearsal.
- MIMIR opened PR485D to hostile-preflight companion capability and presence prompt context from the Discern companion UX work.
Task:
- Review the no-migration, private-owner-chat first slice.
- Decide whether DAEDALUS may implement prompt-level capability/presence helpers and optional prompt injection without schema, provider, route, retrieval, or UI expansion.
- If accepted, wake DAEDALUS with the exact implementation boundary; if blocked, wake MIMIR with the smallest concrete decision needed.
Guardrails:
- No migrations, public chat changes, route-selected conversation loading, automatic LLM calls, durable presence storage, tool/autonomy claims, provider routing changes, token-accounting changes, Archive connector behavior, Memory inbox behavior, Redis, Cloudflare, billing, public writes, broad UI work, or Discern CSS.
```
