# PR485D - Companion Presence And Capability Context Review Result

Owner: ARGUS / A3

Date: 2026-07-05

Status: Accepted - wake MIMIR

Validation result:

```text
ACCEPT_PR485D_PRIVATE_PROMPT_CONTEXT_IMPLEMENTATION
```

Implementation label:

```text
PR485D_NO_MIGRATION_PRIVATE_PROMPT_CONTEXT
```

## Verdict

ARGUS accepts DAEDALUS' PR485D implementation without a review patch.

The implementation matches the accepted patched boundary:

- capability helpers are deterministic and default to `conversation_first`;
- assisted capability modes require explicit typed helper input and are not
  inferred from provider, tier, archive volume, source material, persona name,
  or private corpus content;
- capability prompt copy preserves Station's no-hidden-autonomy and no-tool
  boundaries;
- presence helpers use soft same-thread states only: `first_contact`,
  `active_thread`, `returning`, and `long_gap`;
- presence excludes system messages, clamps future timestamps to active-thread
  behavior, and avoids mood/intimacy/durable-emotional-state claims;
- `buildPersonaChatPrompt` renders capability/presence context only for private
  prompts when the optional strings are supplied;
- `assemblePersonaRuntimeContext` passes optional preformatted prompt context
  without changing retrieval counts, topology, selected sources, answer focus,
  or trace shape;
- private chat computes capability and same-thread presence from already-loaded
  `conversation_messages` rows before inserting the new owner message;
- owner context-preview includes capability context only and omits presence;
- public persona chat and public context-preview remain unchanged.

No migration, schema field, route/query behavior, automatic LLM call, durable
presence storage, provider routing change, token-accounting rule change,
retrieval ordering change, Archive connector behavior, Memory inbox behavior,
Redis, Cloudflare, billing, public write, web UI, broad shell, or Discern CSS
change entered scope.

## Review Notes

The new `@station/ai/companion-capabilities` and
`@station/ai/companion-presence` package subpath exports are scoped to the new
AI helpers. The API test path correctly rebuilds `@station/ai` first so runtime
package-export imports resolve through generated `dist` output. That output is
ignored and remains untracked.

The private chat route derives presence from `rawHistoryRows` after conversation
ownership/archive checks and before the owner message insert. That preserves
the accepted first-contact and return-thread semantics without another DB query.

Runtime budget, AI trace events, API responses, and stream responses do not
surface the new prompt text. Provider payload inspection is limited to tests.

No ARIADNE hosted browser rehearsal is required by default because PR485D has
no web UI change. MIMIR may close directly or sequence the next lane.

## ARGUS Validation

Passed locally on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Reviewed helper copy, presence thresholds, private-only prompt injection, context builder pass-through, private chat route wiring, context-preview behavior, public no-drift tests, package exports, docs, and wakeup commit. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/ai build` | Pass | Rebuilt local AI package output for package-export runtime imports; generated `dist` output remains ignored/untracked. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test packages/ai/test/companion-context.test.ts packages/ai/test/retrieval-metadata.test.ts apps/api/src/routes/conversation-archive.test.ts apps/api/src/routes/persona-context.test.ts apps/api/src/routes/personas.test.ts` | Pass | 58 helper, prompt, private chat, runtime context, public persona, and no-drift tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR485D Companion Presence And Capability Context implementation without a review patch.
Verdict:
- ACCEPT_PR485D_PRIVATE_PROMPT_CONTEXT_IMPLEMENTATION
Implementation label:
- PR485D_NO_MIGRATION_PRIVATE_PROMPT_CONTEXT
Task:
- Close or sequence PR485D. ARGUS does not require ARIADNE hosted browser rehearsal by default because the accepted slice has no web UI change.
Guardrails:
- Keep PR485D closed as no-migration private prompt context only. Public persona chat/preview, schema, route/query behavior, automatic LLM calls, durable presence storage, provider routing, token-accounting rules, retrieval ordering, queues/workers, Archive connector, Memory inbox, Redis, Cloudflare, billing, public writes, web UI, broad shell, and Discern CSS remain out of scope.
Validation:
- ARGUS replayed the AI package build, focused AI/API suite, typecheck, lint, and git diff whitespace checks; all passed.
```
