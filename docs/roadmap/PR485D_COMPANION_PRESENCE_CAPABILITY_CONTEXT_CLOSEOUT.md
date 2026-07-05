# PR485D - Companion Presence And Capability Context Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed - accepted by ARGUS

## Result

PR485D is closed as `ACCEPT_PR485D_PRIVATE_PROMPT_CONTEXT_IMPLEMENTATION`.

DAEDALUS implemented the accepted no-migration private prompt-context slice:

`docs/roadmap/PR485D_COMPANION_PRESENCE_CAPABILITY_CONTEXT_RESULT.md`

ARGUS accepted it without a review patch:

`docs/roadmap/PR485D_COMPANION_PRESENCE_CAPABILITY_CONTEXT_REVIEW_RESULT.md`

ARGUS did not require ARIADNE hosted browser rehearsal because the accepted
slice had no web UI change.

## Accepted Product Truth

Station private persona chat now has prompt-level companion capability and
presence context.

Accepted behavior:

- capability helpers are deterministic and default to `conversation_first`;
- assisted capability modes require explicit typed helper input and are not
  inferred from provider, tier, archive volume, source material, persona name,
  or private corpus content;
- capability copy preserves Station's no-hidden-autonomy and no-tool boundaries;
- presence helpers use soft same-thread states only: `first_contact`,
  `active_thread`, `returning`, and `long_gap`;
- presence excludes system messages, clamps future timestamps to active-thread
  behavior, and avoids mood/intimacy/durable-emotional-state claims;
- `buildPersonaChatPrompt` renders capability/presence context only for private
  prompts when optional strings are supplied;
- `assemblePersonaRuntimeContext` passes optional preformatted prompt context
  without changing retrieval counts, topology, selected sources, answer focus,
  or trace shape;
- private chat computes capability and same-thread presence from already-loaded
  history before inserting the new owner message;
- owner context-preview includes capability context only and omits presence;
- public persona chat and public context-preview remain unchanged.

## Validation

ARGUS replayed:

- `npm exec --yes pnpm@10.32.1 -- --filter @station/ai build`
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/companion-context.test.ts packages/ai/test/retrieval-metadata.test.ts apps/api/src/routes/conversation-archive.test.ts apps/api/src/routes/persona-context.test.ts apps/api/src/routes/personas.test.ts`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`

All passed. Generated `packages/ai/dist` output remained ignored/untracked.

## Not In PR485D

These remain out of scope:

- migrations or schema fields;
- public persona chat or public context-preview prompt-context changes;
- route-selected conversation loading or query params;
- automatic LLM calls;
- durable presence, mood, intimacy, emotional-state, or capability storage;
- provider routing, token-accounting, retrieval ordering, queue/worker,
  Archive connector, Memory inbox, Redis, Cloudflare, billing, public write, web
  UI, broad shell, social connector, or Discern CSS changes.

## Next Lane

MIMIR is opening PR485E for hostile preflight of the remaining Discern companion
UX translation target: local private chat surface polish inside Tex Station's
current Studio design system.
