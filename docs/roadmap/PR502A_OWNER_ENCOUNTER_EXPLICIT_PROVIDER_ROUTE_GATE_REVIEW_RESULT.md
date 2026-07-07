# PR502A - Owner Encounter Explicit Provider Route Gate Review Result

Owner: ARGUS / A3

Date: 2026-07-07

Status: Accepted

## Decision

ARGUS accepts PR502A as:

```text
ACCEPT_PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_IMPLEMENTATION
```

No ARGUS code patch was required.

## Review Scope

Reviewed:

- `docs/roadmap/PR502_OWNER_ENCOUNTER_PRIVATE_CONTEXT_PROVIDER_ROUTE_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_DAEDALUS.md`
- `docs/roadmap/PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_RESULT.md`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`

## Findings

The implementation matches the accepted PR502A lane:

- the only runtime gate is
  `PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT`;
- the flag is accepted only when its value is exactly `true`;
- absent, empty, `false`, uppercase, whitespace-padded, and other non-`true`
  values remain blocked with `provider_data_policy` when only NVIDIA is
  configured;
- the gate is used only by the existing authenticated owner encounter preview
  readiness and generation routes;
- same-owner persona loading still happens before provider resolution;
- `packages/ai/src/providers/router.ts` was not changed;
- readiness performs no provider call, token accounting, rate-limit increment,
  or durable write;
- generation remains one disposable responder reply with no prompt/output
  persistence and token usage recorded only with `chatId: null`;
- BYOK OpenAI and existing non-NVIDIA platform DeepSeek routes remain accepted.

Owner and privacy boundaries are intact:

- cross-owner responders fail before provider calls, token rows, rate-limit
  increments, or durable encounter writes;
- responses do not expose provider keys, raw NVIDIA base URLs, model labels,
  owner ids, raw persona ids, env values, setup text in metadata, SQL details,
  stack traces, or secret-shaped material;
- provider URL/model assertions are confined to tests and are not returned to
  callers.

Scope did not widen:

- no public encounter, anonymous encounter, shareable page, public route control,
  or availability claim;
- no conversations, messages, archive, memory, canon, continuity, integrity,
  document, thread, comment, moderation, vector, embedding, source retrieval,
  queue, worker, Redis, Cloudflare, billing, Stripe, schema, migration,
  package, lockfile, social publishing, social credential, Railway, Supabase,
  or broad UI change.

## Validation

ARGUS reran the requested validation:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Result:

- 13 API encounter tests passed;
- 6 web runtime tests passed;
- `test:persona-encounters` passed 19 tests after package builds;
- `test:studio-ui` passed 190 tests;
- typecheck passed;
- `git diff --check` passed;
- `git diff --cached --check` passed;
- changed-path scan found no package/lockfile, shared provider router, web UI,
  migration, schema, social, queue, worker, Redis, Cloudflare, billing, Stripe,
  public route, conversation, document, thread, comment, or moderation changes;
- provider-policy scan found only the route-local env gate and expected NVIDIA
  test fixtures;
- public encounter scan found no implementation drift;
- durable/source retrieval scan found only no-durable-write assertions and test
  copy;
- secret-shaped scan found only env/test fixture names and non-leak assertions,
  not real secret values.

## Residual Requirement

This acceptance does not itself prove hosted encounter generation. MIMIR should
wake ARIADNE for the hosted owner-route proof before claiming the hosted preview
is live, and only after hosted `@station/api` has:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

plus existing platform NVIDIA config. The proof must not print or record any
provider key, env value, raw base URL, raw model config, owner id, raw persona
id, prompt body, stack trace, SQL detail, or secret-shaped value.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR502A as `ACCEPT_PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_IMPLEMENTATION`.
- The implementation is route-local, default-false, exact-`true`, same-owner
  gated, non-persistent, and leaves the shared provider router unchanged.
- Validation passed: 13 API encounter tests, 6 web runtime tests, 19 combined
  encounter tests, 190 studio UI tests, typecheck, diff checks, and drift/secret
  scans.
Task:
- Close PR502A and decide whether to wake ARIADNE for hosted owner encounter
  proof.
```
