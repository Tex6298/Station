# PR485D - Companion Presence And Capability Context Preflight Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted with patched boundary - wake DAEDALUS

Validation result:

```text
ACCEPT_WITH_PATCHED_BOUNDARY
```

Implementation label:

```text
PR485D_NO_MIGRATION_PRIVATE_PROMPT_CONTEXT
```

## Verdict

ARGUS accepts PR485D as a no-migration, private-owner-chat prompt-context
slice, with a tightened boundary.

DAEDALUS may add deterministic companion capability and presence helpers, plus
optional prompt sections, but only as additive private prompt metadata. This is
not a Discern port and must not change schema, public persona behavior,
provider routing, token-accounting rules, retrieval ordering, UI, or runtime
execution claims.

## Accepted Product Slice

Allowed:

- add `packages/ai` helpers for capability profile construction/formatting;
- add `packages/ai` helpers for presence profile construction/formatting;
- extend `buildPersonaChatPrompt` with optional private-only capability and
  presence context sections;
- extend `assemblePersonaRuntimeContext` with optional preformatted capability
  and presence prompt strings;
- in private `/conversations/persona/:personaId/chat` and `/chat/stream`,
  compute capability/presence context and pass it into runtime context assembly;
- allow the owner-only `/conversations/persona/:personaId/context-preview`
  route to include capability context only.

Not allowed:

- migrations or persona schema fields;
- public persona chat or public persona context-preview changes;
- route-selected conversation loading or query-param behavior;
- automatic summary or LLM calls;
- durable presence, mood, intimacy, emotional-state, or capability storage;
- tool execution, browsing, file access, MCP, external service, or autonomy
  claims;
- provider routing, token-accounting algorithm, queue behavior, embedding,
  retrieval ordering, Archive connector, Memory inbox, Redis, Cloudflare,
  billing, social connector, public write, web UI, broad shell, or Discern CSS
  changes.

## ARGUS Decisions

1. The default capability profile is safe only as `conversation-first`.
   DAEDALUS must not infer workflow-aware or extension-aware behavior from
   provider, tier, archive volume, imported source material, persona name, or
   any private corpus content.
2. Capability and presence helper construction/formatting should live in
   `packages/ai`. The private API chat route may import those helpers and pass
   formatted strings into `assemblePersonaRuntimeContext`.
3. `assemblePersonaRuntimeContext` should not compute presence itself. Presence
   is route-local, because it depends on the already-authorized
   same-conversation history for the current chat turn.
4. Presence must be computed from the existing `conversation_messages` rows
   already loaded before inserting the new owner message. Do not add another
   conversation-history query for PR485D.
5. Owner context-preview may include capability context only. It must omit
   presence context because preview has no selected conversation thread.
6. Public persona chat and public context-preview are out of scope and must not
   receive capability or presence context in this slice.

## Prompt Contract

Capability copy must preserve Station boundaries:

- companions may help clarify, plan, draft, reflect, decide, and preserve
  continuity;
- companions may suggest owner-confirmed plans or checklists for work outside
  chat;
- companions must not claim to read files, edit systems, browse, call tools,
  use MCP, access external services, or execute workflows unless Station
  explicitly provides that capability in the current turn;
- capability copy must not say a companion has hidden autonomy or access to
  private sources beyond the selected runtime context.

Presence copy must be soft thread context only. It may describe:

- `first_contact`: no prior same-thread messages;
- `active_thread`: latest prior same-thread message is recent;
- `returning`: latest prior same-thread message is at least 12 hours old;
- `long_gap`: latest prior same-thread message is at least 7 days old.

Presence copy must not imply mood detection, intimacy scoring, hidden
relationship state, surveillance, guilt, neediness, or durable emotional memory.

`buildPersonaChatPrompt` must include capability/presence sections only when:

- the prompt visibility is private; and
- the relevant optional string is provided.

If a public prompt receives either optional string accidentally, it should not
render those sections.

## Implementation Boundary

Acceptable touched files or local equivalents:

- `packages/ai/src/companion-capabilities.ts`
- `packages/ai/src/companion-presence.ts`
- `packages/ai/src/prompts/persona-chat.ts`
- `packages/ai/src/retrieval/context-builder.ts`
- `packages/ai/src/index.ts`, only if helper exports are needed
- `packages/ai/test/companion-context.test.ts`, or equivalent focused AI tests
- `packages/ai/test/retrieval-metadata.test.ts`, only for prompt/runtime
  compatibility tests if DAEDALUS keeps the existing file
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/routes/conversation-archive.test.ts`
- `apps/api/src/routes/persona-context.test.ts`, only if the existing private
  owner context test is the best guard
- roadmap/testing docs for the implementation result

Do not touch:

- migrations, DB types, persona schema, storage, billing, token-credit service,
  provider router/provider implementations, queue service, embedding service,
  Archive connector routes, Memory inbox web/API, public persona routes, web UI,
  global CSS, or Discern shell/layout files.

## Required Tests

DAEDALUS must add focused tests proving:

- capability helper output is deterministic and boundary-safe;
- default capability is `conversation-first`;
- future workflow/extension profiles can only appear from explicit typed helper
  input, not from provider/tier/archive/source inference;
- presence thresholds produce `first_contact`, `active_thread`, `returning`,
  and `long_gap`;
- `buildPersonaChatPrompt` includes capability/presence only for private prompts
  when provided and omits them from public prompts even if passed;
- `assemblePersonaRuntimeContext` preserves retrieval counts, topology, selected
  sources, selected-context answer focus, and trace shape while passing optional
  private prompt context;
- private chat passes capability and same-thread presence context into the
  system prompt before the new owner message is inserted;
- existing provider routing, selected-context answer focus, retry/finalizer
  behavior, runtime budget reporting, token quota checks, and token usage
  recording stay on their current paths;
- public persona chat and public context-preview do not receive PR485D
  capability or presence context;
- no raw ids, source bodies, provider payloads, tokens, cookies, stack traces,
  compiled prompts, or secret-shaped values enter visible API/web readback.

Static no-drift coverage should also reject route/query, migration, UI, public
persona, provider router, token service, queue/worker, Redis, Cloudflare,
billing, Archive connector, Memory inbox, social connector, and Discern CSS
scope creep.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code and reference inspection | Pass | Reviewed PR485D handoff, current `buildPersonaChatPrompt`, `assemblePersonaRuntimeContext`, private chat route, context-preview route, public persona test coverage, and Discern reference helpers as reference-only material. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/retrieval-metadata.test.ts apps/api/src/routes/conversation-archive.test.ts apps/api/src/routes/persona-context.test.ts apps/api/src/routes/personas.test.ts` | Pass | 52 current AI/API tests passed across private chat, public persona chat/preview, runtime context, and retrieval. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors before ARGUS preflight docs. |

DAEDALUS implementation validation must include:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/companion-context.test.ts packages/ai/test/retrieval-metadata.test.ts apps/api/src/routes/conversation-archive.test.ts apps/api/src/routes/persona-context.test.ts apps/api/src/routes/personas.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If DAEDALUS folds the new helper tests into an existing file instead of
`packages/ai/test/companion-context.test.ts`, the focused suite must still cover
the required helper, prompt, private-chat, public no-drift, typecheck, lint, and
whitespace checks.

## ARIADNE

No ARIADNE hosted browser rehearsal is required by default for PR485D after
ARGUS implementation acceptance, because the accepted slice has no web UI
change. MIMIR may still route ARIADNE later if a hosted provider-behavior proof
is desired, but that should not expand PR485D into UI or public-route work.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR485D with a patched no-migration private prompt-context boundary.
Verdict:
- ACCEPT_WITH_PATCHED_BOUNDARY
Implementation label:
- PR485D_NO_MIGRATION_PRIVATE_PROMPT_CONTEXT
Task:
- Add deterministic companion capability/presence helpers, optional private-only prompt sections, and private chat route wiring using already-loaded same-conversation history.
Guardrails:
- Default capability is conversation-first only. Presence is soft same-thread context only. Owner context-preview may include capability only, not presence. Public persona chat/preview, schema, routes/query params, automatic LLM calls, durable presence storage, provider routing, token-accounting rules, retrieval ordering, queues/workers, Archive connector, Memory inbox, Redis, Cloudflare, billing, public writes, web UI, broad shell, and Discern CSS remain out of scope.
Validation:
- Add the focused helper/prompt/private-chat/public-no-drift tests and run the AI/API focused suite, typecheck, lint, and git diff whitespace checks listed in the ARGUS preflight result.
```
