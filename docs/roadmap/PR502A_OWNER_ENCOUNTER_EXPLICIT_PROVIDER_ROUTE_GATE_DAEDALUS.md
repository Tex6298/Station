# PR502A - Owner Encounter Explicit Provider Route Gate

Owner: DAEDALUS / A2

Date: 2026-07-07

## Accepted Source

ARGUS accepted PR502A in:

`docs/roadmap/PR502_OWNER_ENCOUNTER_PRIVATE_CONTEXT_PROVIDER_ROUTE_PREFLIGHT_RESULT.md`

Implement exactly that scope.

## Task

Add the smallest explicit provider-route gate that lets the existing
owner-only disposable encounter preview use platform NVIDIA private context
only when this env flag is exactly true:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

Default behavior must remain fail-closed. Absent, empty, `false`, malformed, or
any non-`true` value must behave as blocked.

## Allowed Scope

Allowed files:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts` only if a bounded readiness type
  or copy adjustment is required;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/components/studio/persona-workspace.tsx` only if required to
  preserve existing owner panel behavior when readiness becomes true;
- roadmap/testing docs.

Avoid package, lockfile, schema, migration, storage, queue, worker, billing,
Cloudflare, Redis, social, public route, or broad UI changes.

`packages/ai/src/providers/router.ts` should not need behavior changes. If you
touch it, justify why and prove its default private-context NVIDIA behavior did
not broaden.

## Required Behavior

For `GET /persona-encounters/preview/readiness`:

- validate query shape before work;
- load both personas as owner-scoped rows before provider resolution;
- cross-owner or missing personas return
  `persona_encounter_persona_not_owned` before provider resolution, token rows,
  rate-limit increments, or provider calls;
- env flag absent/false/malformed plus only NVIDIA configured returns
  `ready: false`, `code: persona_encounter_provider_unavailable`, and
  classification `provider_data_policy`;
- env flag exactly true plus NVIDIA configured may return `ready: true`;
- accepted BYOK and non-NVIDIA platform routes continue to behave as before;
- readiness performs no provider call, token accounting, quota deduction,
  rate-limit increment, or durable write;
- response must not expose provider keys, raw base URLs, model internals, owner
  ids, raw persona ids, env values, or secret-shaped material.

For `POST /persona-encounters/preview`:

- validate body shape and bounds before work;
- load both personas as owner-scoped rows before provider resolution;
- cross-owner or missing personas fail before provider resolution, provider
  calls, token rows, rate-limit increments, or durable writes;
- use the explicit env gate only for this encounter preview provider
  resolution;
- preserve existing quota, fail-closed rate-limit, no-retry, and bounded
  provider-failure behavior;
- return at most one disposable model-generated responder reply;
- record token usage only as already accepted, with `chatId: null` and no
  prompt or generated text;
- persist no prompt text, output text, transcript, draft, conversation,
  message, archive, memory, canon, continuity, integrity, public/shareable row,
  or observability payload containing owner setup or generated output.

## Non-Goals

Do not add:

- cross-owner encounters;
- autonomous/background encounters;
- scheduled encounters;
- multi-turn loops;
- automatic retries;
- durable encounter transcripts;
- conversations or `conversation_messages` writes;
- archive, memory, canon, continuity, integrity, source retrieval, vector, or
  embedding calls;
- public/shareable encounter pages;
- anonymous encounter controls;
- public route controls or availability claims;
- provider/model picker UI;
- BYOK storage changes;
- social publishing, social credentials, or PR500D work;
- billing, Stripe, Redis, Cloudflare, workers, queues, schema, migrations,
  storage, package, lockfile, or broad UI redesign.

Gemini embeddings are irrelevant to this lane.

## Required Tests

Prove at minimum:

- env flag absent plus NVIDIA configured returns paused readiness with
  `provider_data_policy` and no provider call;
- env flag false/malformed plus NVIDIA configured behaves the same as absent;
- env flag true plus NVIDIA configured returns ready through the readiness
  resolver without exposing keys, raw base URLs, model internals, or secrets;
- generation with env flag true plus NVIDIA configured can return one
  disposable responder reply for same-owner personas;
- generation verifies both personas are same-owner before provider resolution
  or provider calls;
- cross-owner ids fail before provider calls, token rows, rate-limit
  increments, or durable writes;
- existing BYOK accepted routes still behave as before;
- existing accepted non-NVIDIA platform routes still behave as before;
- no prompt/output text is persisted;
- no conversations, messages, archive, memory, canon, continuity, integrity, or
  public/shareable rows are inserted;
- public persona/public Space samples remain free of encounter controls,
  generated encounter output, shareable encounter pages, cross-owner controls,
  anonymous controls, and availability claims.

Minimum validation:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run diff-only scans for provider-policy drift, public encounter drift,
durable persistence, source retrieval/vector/embedding drift, and
secret-shaped values/env leakage.

## Handoff

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR502A as a default-false explicit owner encounter provider
  route gate.
- The only accepted opt-in is
  `PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true`.
- The gate applies only to owner encounter preview/readiness after same-owner
  checks.
Task:
- Implement PR502A exactly within this file and the ARGUS result.
- Keep the route owner-only, one-reply, disposable, no-source-retrieval, and
  non-persistent.
- Wake ARGUS with implementation result and validation.
```

