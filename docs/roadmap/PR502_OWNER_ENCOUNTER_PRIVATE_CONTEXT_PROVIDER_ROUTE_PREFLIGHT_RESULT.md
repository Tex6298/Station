# PR502 - Owner Encounter Private-Context Provider Route Preflight Result

Owner: ARGUS / A3

Date: 2026-07-07

Status: Accepted

## Decision

ARGUS accepts the next implementation lane as:

```text
ACCEPT_PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE
```

DAEDALUS may implement PR502A as the smallest explicit owner-encounter
provider-route gate. This is not acceptance for broad private-context provider
policy, public encounters, durable encounter storage, source retrieval, social
publishing, billing, queues, workers, Redis, Cloudflare, schema, migrations, or
UI redesign.

## Accepted Product Shape

PR502A may let the existing private owner-only disposable encounter preview use
the platform NVIDIA chat route only when all of these are true:

- the request is for the authenticated owner-only encounter preview route;
- both selected personas belong to `req.user!.id`;
- the responder provider route resolves through the existing
  `resolveChatProviderRuntimeRoute(...)` contract;
- `PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT` is explicitly set
  to `true`;
- existing platform NVIDIA config is present;
- existing token budget and encounter preview rate-limit guards pass.

The flag must be parsed fail-closed. Absent, empty, `false`, malformed, or any
value other than `true` must behave as not accepted.

The opt-in is route-specific:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT
```

Do not change the default behavior of `resolveChatProviderRuntimeRoute(...)`.
Do not make NVIDIA private context broadly accepted for other private provider
surfaces.

## Accepted Implementation Scope

Allowed code scope:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts` only if response typing/copy needs
  a bounded optional readiness field;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- `apps/web/components/studio/persona-workspace.tsx` only if needed to preserve
  the existing owner panel behavior when readiness becomes true;
- roadmap/testing docs.

No package, lockfile, schema, migration, storage, queue, worker, billing,
Cloudflare, Redis, social, public route, or broad UI changes are accepted.

`packages/ai/src/providers/router.ts` should not need behavior changes. If a
test-only helper/export is proposed, DAEDALUS must justify it and prove the
router default still does not broaden private-context NVIDIA usage.

## Route Behavior

For `GET /persona-encounters/preview/readiness`:

- validate query shape before work;
- load both personas as owner-scoped rows before provider resolution;
- cross-owner or missing personas return `persona_encounter_persona_not_owned`
  before provider resolution, token rows, rate-limit increments, or provider
  calls;
- env flag absent/false plus only NVIDIA configured returns `ready: false`,
  `code: persona_encounter_provider_unavailable`, and classification
  `provider_data_policy`;
- env flag true plus NVIDIA configured may return `ready: true`;
- accepted BYOK and non-NVIDIA platform routes continue to behave as before;
- readiness performs no provider call, token accounting, quota deduction,
  rate-limit increment, or durable write;
- response must not expose provider keys, base URLs, model internals, owner ids,
  raw persona ids, env values, or secret-shaped material.

For `POST /persona-encounters/preview`:

- validate body shape and bounds before work;
- load both personas as owner-scoped rows before provider resolution;
- cross-owner or missing personas fail before provider resolution, provider
  calls, token rows, rate-limit increments, or durable writes;
- use the explicit env gate only for this encounter preview provider resolution;
- preserve existing quota, fail-closed rate-limit, no-retry, and bounded
  provider-failure behavior;
- return at most one disposable model-generated responder reply;
- record token usage only as already accepted, with `chatId: null` and no prompt
  or generated text;
- persist no prompt text, output text, transcript, draft, conversation, message,
  archive, memory, canon, continuity, integrity, public/shareable row, or
  observability payload containing owner setup or generated output.

## Non-Goals

PR502A must not add:

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
  storage, or broad UI redesign.

Gemini embeddings are irrelevant to this lane and must not be used as an
encounter-generation unblock.

## Required DAEDALUS Tests

DAEDALUS should prove at minimum:

- env flag absent plus NVIDIA configured returns paused readiness with
  `provider_data_policy` and no provider call;
- env flag false/malformed plus NVIDIA configured behaves the same as absent;
- env flag true plus NVIDIA configured returns ready through the readiness
  resolver without exposing keys, raw base URLs, model internals, or secrets;
- generation with env flag true plus NVIDIA configured can return one
  disposable responder reply for same-owner personas;
- generation still verifies both personas are same-owner before provider
  resolution or provider calls;
- cross-owner ids fail before provider calls, token rows, rate-limit increments,
  or durable writes;
- existing BYOK accepted routes still behave as before;
- existing accepted non-NVIDIA platform routes still behave as before;
- no prompt/output text is persisted;
- no conversations, messages, archive, memory, canon, continuity, integrity, or
  public/shareable rows are inserted;
- public persona/public Space samples remain free of encounter controls,
  generated encounter output, shareable encounter pages, cross-owner controls,
  anonymous controls, and availability claims.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS review must also include diff-only scans for:

- provider-policy drift;
- public encounter drift;
- durable persistence;
- source retrieval/vector/embedding drift;
- secret-shaped values and env value leakage.

## Hosted Proof Requirement

After ARGUS accepts a PR502A implementation, MIMIR should wake ARIADNE for a
narrow hosted owner-route proof before claiming hosted encounter generation is
live.

The hosted proof may use the explicit flag only if Railway `@station/api` has:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

and existing platform NVIDIA config is present. Do not print or record any
provider key, env value, raw base URL, raw model config, owner id, raw persona
id, prompt body, generated output beyond sampled UI proof, stack trace, SQL
detail, or secret-shaped value.

Hosted proof should verify:

- signed-in owner readiness returns ready for a same-owner pair;
- signed-in owner can generate exactly one disposable responder reply on desktop
  and 390px mobile;
- leaving/cancelling does not leave a transcript, draft, conversation, public
  page, or shareable output;
- sampled signed-out public routes show no encounter controls, generated
  encounter output, shareable pages, cross-owner controls, anonymous encounter
  controls, or availability claims;
- sampled UI exposes no private Memory, Archive, Canon, Continuity, Integrity,
  transcript/source text, provider settings, credentials, storage paths, raw
  ids, visitor identity, or secret-shaped material.

## ARGUS Baseline Validation

ARGUS reran the current PR473/PR502 baseline before this verdict:

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

- 9 current API encounter tests passed;
- 6 current web encounter runtime tests passed;
- `test:persona-encounters` passed 15 tests after package builds;
- `test:studio-ui` passed 190 tests;
- typecheck passed;
- diff checks passed;
- changed-path and preflight-doc scans found no implementation drift, no
  package/lockfile changes, no secret values, and only expected negative-scope
  guardrail text.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR502A as an explicit owner-encounter provider route gate.
- Scope is a default-false
  `PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT` gate used only by
  `/persona-encounters/preview` and `/persona-encounters/preview/readiness`.
- The lane must preserve owner scope, disposable one-reply behavior, no source
  retrieval, no persistence, no public encounter controls, and no broad provider
  policy changes.
Task:
- Close PR502 preflight and decide whether to wake DAEDALUS for PR502A.
```
