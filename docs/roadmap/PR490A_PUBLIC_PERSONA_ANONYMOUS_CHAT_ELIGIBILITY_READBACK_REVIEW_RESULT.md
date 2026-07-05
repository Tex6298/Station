# PR490A - Public Persona Anonymous Chat Eligibility Readback Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Date reviewed: 2026-07-05

Status: Accepted with ARGUS patch - ready for MIMIR to route ARIADNE

## Verdict

```text
ACCEPT_PR490A_ELIGIBILITY_READBACK_IMPLEMENTATION
```

ARGUS accepts DAEDALUS' PR490A owner/admin eligibility readback implementation
with a narrow review patch.

## Review Summary

The implementation matches the accepted readback-only boundary:

- owner/admin `publicInteraction.publicChat.mode` now uses the same
  `publicPersonaChatMode` resolver as runtime/public readback;
- `station-replay-alpha-persona` reads as `anonymous_alpha`;
- ordinary public personas continue to read as `signed_in_alpha`, and anonymous
  visitors to those personas still receive `public_persona_auth_required`;
- owner/admin `publicInteraction.publicChat.anonymousEligibility` reports
  replay-only policy, availability, blocker code/copy, owner rollback,
  fail-closed rate-limit readiness, provider readiness, no visitor transcript,
  no visitor identity/raw event storage, and aggregate counters only;
- provider readiness is derived from local public-chat route configuration only,
  without provider calls or key/model/config serialization;
- rate-limit readiness is derived from operational-cache status only, without
  changing runtime keys or fail-closed behavior;
- Studio public-interaction copy surfaces the owner readback without adding
  controls, public runtime claims, or a broader public persona UI redesign.

## ARGUS Patch

ARGUS made a narrow honesty patch in:

- `packages/types/src/persona.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/web/lib/public-persona-interaction.ts`
- `apps/web/lib/public-persona-interaction.test.ts`

The patch removes `public_salon_threads` from anonymous chat eligibility
`publicSourceOnlyScope` and from visible Studio copy.

Reason: current public chat prompt sources are capped to the public profile,
published public documents, and linked public discussions. Public Salon threads
remain part of context-preview/events readback, but they are not currently fed
into anonymous chat prompts. The readback must not imply otherwise.

## Boundary Checks

Privacy, auth, and owner-scope boundaries remain intact:

- no anonymous runtime expansion beyond `station-replay-alpha-persona`;
- no migration, schema, seed/config gate, provider/model routing, prompt or
  retrieval architecture, private runtime context, billing, Stripe, worker,
  queue, Redis Memory truth, Cloudflare, connector, OAuth, social dispatch,
  public reporting behavior, moderation action, public roulette behavior, or
  broad public persona UI redesign entered scope;
- no private source bodies, prompts, completions, transcripts, raw ids, storage
  paths, signed URLs, provider payloads, keys, tokens, cookies, auth headers,
  user agents, IPs, stack traces, or secret-shaped values are serialized in the
  owner readback or Studio copy;
- public reporting remains signed-in/server-owned;
- anonymous chat still creates no conversations, messages, reports, durable
  visitor identity rows, raw event rows, or visitor transcript rows;
- aggregate counters remain owner/persona/day only.

## Validation

ARGUS reran the required validation on 2026-07-05 after the review patch:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 personas tests passed, including owner/admin eligibility readback, replay anonymous availability, signed-in-only non-replay default, fail-closed rate-limit blocker, provider blocker, owner rollback, public-source-only provider payloads, no transcript/identity persistence, and no runtime expansion. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 report tests passed; public reporting remains signed-in/server-owned. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts` | Pass | 11 public persona route/interaction helper tests passed, including the no-Salon anonymous chat scope copy assertion. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Required ARIADNE Rehearsal

Because PR490A changes visible owner/admin Studio readback, ARGUS still requires
hosted browser rehearsal before MIMIR closes the lane.

MIMIR should route ARIADNE to rehearse hosted desktop plus `375px` and `390px`
mobile viewports.

Required checks:

- hosted web/API health and deployed commit freshness;
- owner Studio persona public-interaction readback for the replay alpha persona
  if the hosted seed exposes it;
- ordinary public persona owner readback if a second eligible hosted persona is
  available;
- public persona page no-drift for signed-out and signed-in states;
- anonymous chat remains replay-slug-only and ordinary public personas do not
  show broad anonymous claims;
- Studio copy fits without overflow, clipping, overlap, or unreadable mobile
  wrapping;
- no private source bodies, raw ids, storage paths, signed URLs, provider
  payloads, stack traces, bearer/JWT-shaped values, secret-shaped values,
  token/cookie/header/IP/user-agent readback, public launch/commercial claims,
  live connector/OAuth claims, worker/queue claims, placeholder controls, or
  runtime expansion claims appear;
- record any hosted fixture gap explicitly, especially if no second public
  persona is available for non-replay signed-in-only readback.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted DAEDALUS' PR490A anonymous chat eligibility readback implementation with a narrow source-scope honesty patch.
- Owner/admin readback now reports anonymous alpha mode/eligibility for the replay slug, signed-in-only policy for ordinary public personas, blocker copy, owner rollback, fail-closed rate-limit/provider readiness, no transcript/identity/raw event storage, and aggregate-only counters.
- ARGUS removed public Salon threads from anonymous chat public-source-only scope/readback because runtime chat prompts currently cap sources to public profile, published public documents, and linked public discussions.
- ARGUS reran test:personas, test:reports, public persona route/interaction helper tests, typecheck, lint, and git diff --check.
Task:
- Route ARIADNE hosted desktop/375px/390px rehearsal before PR490A closeout.
- Cover owner Studio persona public-interaction readback for replay alpha if seeded, ordinary public persona signed-in-only readback if available, public persona page no-drift, mobile fit, no broad anonymous claims, no private/raw/secret/provider/token/cookie/header/IP/user-agent readback, and no runtime expansion claims.
Guardrails:
- Do not treat ARGUS acceptance as hosted visual proof; ARIADNE still needs real browser rehearsal.
- Record any hosted fixture gap explicitly, especially if no second public persona exists for non-replay signed-in-only proof.
- Product defects should go to the smallest DAEDALUS repair; deployment waits or privacy/scope failures should wake MIMIR with the concrete blocker.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:personas
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
```
