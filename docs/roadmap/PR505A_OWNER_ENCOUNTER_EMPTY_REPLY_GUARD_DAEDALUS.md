# PR505A - Owner Encounter Empty Reply Guard

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
OPEN_FOR_IMPLEMENTATION
```

## Why This Lane Exists

ARIADNE reran PR505 after MIMIR applied the hosted Railway `@station/api`
route flag:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

The hosted provider gate is now open:

- owner readiness returned `ready:true`;
- exactly one disposable same-owner preview request was sent;
- signed-out preview returned `401`;
- cross-owner preview returned `403` with
  `persona_encounter_persona_not_owned`;
- no public, durable, retrieval, Memory, Archive, Canon, Continuity,
  Integrity, billing, social, queue, or worker drift was created.

But the preview returned `200` with an empty responder reply:

```text
reply role: responder
reply characters: 0
```

That is not a usable product proof. Treat it as an API/provider-adapter
hardening defect, not as a pass.

Source result:

`docs/roadmap/PR505_OWNER_ENCOUNTER_HOSTED_PROVIDER_GATE_RERUN_RESULT.md`

## Task

Implement the smallest hardening patch so owner encounter preview cannot return
`200` with an empty responder reply.

Primary files to inspect:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `packages/ai/src/providers/openai.ts`
- `packages/ai/test/provider-router.test.ts` or a focused provider test if the
  OpenAI-compatible adapter needs coverage

Expected behavior:

- If the provider returns blank or whitespace-only content after normalization,
  the preview route must fail bounded, not return success.
- Prefer a specific bounded response such as:

```text
status: 502
code: persona_encounter_provider_empty_reply
```

- Do not expose provider payloads, raw prompts, private persona notes, model
  config, base URLs, keys, SQL details, stack traces, raw owner ids, or raw
  persona ids.
- Do not synthesize fake fallback content.
- Do not retry the provider call automatically.
- Do not create durable transcripts, conversations, Memory, Archive, Canon,
  Continuity, Integrity, public pages, social posts, queue jobs, or billing
  side effects.
- Keep rate-limit behavior bounded; a provider call may still consume the
  preview rate-limit window, but empty output must not masquerade as a
  successful preview.
- Token accounting should not record a successful LLM transaction for an empty
  unusable preview unless ARGUS finds an existing accounting contract that
  explicitly requires failed-provider-call accounting.
- If the root cause is OpenAI-compatible response parsing for NVIDIA, harden
  the adapter narrowly and add focused coverage for the observed shape.

Prompt polishing is allowed only if it is route-local and helps prevent empty
encounter output. It must not broaden provider policy or claim retrieval,
persistence, source access, or public sharing.

## Validation

Run focused validation first:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
```

Then run:

```text
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If provider adapter behavior changes, also run the focused provider/router test
that covers the changed adapter behavior.

## Handoff

Record the implementation result in:

```text
docs/roadmap/PR505A_OWNER_ENCOUNTER_EMPTY_REPLY_GUARD_RESULT.md
```

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR505A owner encounter empty reply hardening.
- The hosted PR505 rerun proved readiness and boundaries, but preview returned 200 with empty responder content.
- The route/provider adapter now fails bounded instead of returning success for empty responder output.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review the empty-reply guard and any provider adapter parsing change.
- Confirm no fake fallback content, retry loop, persistence, retrieval, billing, public, cross-owner, or secret/payload leakage drift.
- If accepted, wake MIMIR for hosted ARIADNE rerun routing.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARIADNE reran PR505 after MIMIR unblocked hosted @station/api config.
- Owner encounter readiness is now ready:true and boundaries passed.
- Exactly one disposable same-owner preview returned 200, but responder reply content was empty.
- MIMIR is treating this as an API/provider-adapter hardening defect, not a transient pass.
Task:
- Implement PR505A owner encounter empty reply guard.
- Ensure preview cannot return 200 for blank/whitespace responder output.
- Inspect OpenAI-compatible/NVIDIA response parsing if needed.
- Keep scope narrow and wake ARGUS with validation.
```
