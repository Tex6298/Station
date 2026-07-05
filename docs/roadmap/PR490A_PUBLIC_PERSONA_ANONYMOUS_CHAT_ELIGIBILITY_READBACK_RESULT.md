# PR490A - Public Persona Anonymous Chat Eligibility Readback Result

Owner: DAEDALUS / A2

Date implemented: 2026-07-05

Status: Ready for ARGUS review

## Verdict

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the accepted PR490A owner/admin readback slice. This is
readback only; anonymous public persona chat runtime behavior was not expanded.

## Implementation

- Owner/admin `publicInteraction.publicChat.mode` now uses the same
  `publicPersonaChatMode` resolver as public runtime/readback, so the accepted
  replay slug reads as `anonymous_alpha` and ordinary public personas read as
  `signed_in_alpha`.
- Added `publicInteraction.publicChat.anonymousEligibility` with the current
  replay-only policy, availability, blocker code/copy, owner rollback,
  public-source-only scope, fail-closed rate-limit posture, provider
  readiness, no visitor transcript/identity/raw event storage, and aggregate
  counters-only guarantees.
- Derived provider readiness only from the existing local public-chat route
  configuration helper. No provider call is made and no provider key, model
  payload, owner BYOK setting, private provider policy, or raw config value is
  serialized.
- Derived rate-limit readiness only from operational-cache status. Runtime
  rate-limit keys and fail-closed behavior were not changed.
- The existing Studio persona public-interaction card now names signed-in alpha
  vs anonymous alpha and explains replay-only eligibility, public-source-only
  scope, no transcript/identity/raw event storage, aggregate counters, and owner
  rollback without adding controls.

## Blocker Readback

Focused tests now prove owner/admin readback for:

- replay alpha available when public, enabled, owner-eligible, provider-ready,
  and rate-limit-ready;
- ordinary public personas staying signed-in alpha only, while anonymous visitors
  remain denied with `public_persona_auth_required`;
- owner disable as rollback;
- private visibility;
- owner-tier ineligibility;
- unsafe public slug;
- fail-closed rate-limit unavailable;
- provider unavailable.

## Scope Confirmation

No migration, schema, seed, config gate, provider/model routing, prompt or
retrieval architecture, private persona chat, private runtime context, billing,
Stripe, worker, queue, Redis Memory truth, Cloudflare, connector, OAuth, social
dispatch, public reporting behavior, moderation action, public roulette
behavior, or broad public persona UI redesign changed.

The runtime remains one anonymous alpha slug only:
`station-replay-alpha-persona`. `POST /personas/public/:publicSlug/chat`
allow/deny behavior is unchanged.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 personas tests passed, including new owner/admin eligibility readback, replay anonymous readback, signed-in-only non-replay default, fail-closed rate-limit blocker, provider blocker, owner rollback, public-source-only provider payloads, no transcript/identity persistence, and no runtime expansion. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reporting remains signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 11 public persona route/interaction helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files. |

The npm fallback runner emitted the already-documented pnpm `.npmrc` warning
noise. It was not a validation failure.

## ARGUS Review Focus

- Confirm owner/admin readback uses the accepted chat-mode resolver but does not
  widen runtime eligibility beyond `station-replay-alpha-persona`.
- Confirm ordinary public personas remain signed-in alpha and anonymous visitors
  still receive `public_persona_auth_required`.
- Confirm blocker copy does not expose raw ids, provider keys, raw config,
  storage paths, signed URLs, prompts, completions, provider payloads, tokens,
  cookies, auth headers, user agents, IPs, or secret-shaped values.
- Confirm public reporting remains signed-in only and anonymous chat still
  creates no conversations, messages, reports, durable visitor identity rows,
  raw event rows, or visitor transcript rows.
- If accepted, route ARIADNE hosted desktop/375px/390px rehearsal for the owner
  Studio persona public-interaction readback and public persona no-drift checks.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR490A as owner/admin anonymous chat eligibility readback only.
- Owner/admin publicInteraction.publicChat.mode now uses the existing publicPersonaChatMode resolver, so station-replay-alpha-persona reads anonymous_alpha and ordinary public personas stay signed_in_alpha.
- publicInteraction.publicChat.anonymousEligibility now reports replay-only policy, availability, blocker code/copy, owner rollback, public-source-only scope, fail-closed rate-limit posture, provider readiness, no transcript/identity/raw event storage, and aggregate counters-only guarantees.
- Studio public-interaction copy now surfaces that readback without adding controls or public runtime claims.
Validation:
- test:personas passed with 15 tests.
- test:reports passed with 6 tests.
- public persona route/interaction helper tests passed with 11 tests.
- typecheck, lint, and git diff --check passed.
Task:
- Review PR490A against the accepted readback-only boundary.
- If accepted, wake MIMIR for ARIADNE hosted desktop/375px/390px rehearsal routing.
- If fixes are needed, wake DAEDALUS with the narrow repair.
```
