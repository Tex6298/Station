# PR490B - Public Persona Anonymous Chat Readiness Copy Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - narrow product defect repair

## Why This Repair

ARIADNE completed the hosted PR490A rehearsal and found one visible owner
readback defect:

`docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_REHEARSAL_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

The replay-alpha owner `Public interaction readback` card passes the core
privacy/no-drift checks, but it does not visibly name:

- fail-closed rate-limit readiness;
- provider readiness or provider blocker state.

The API readback already carries this data:

- `anonymousEligibility.rateLimitFailClosed`
- `anonymousEligibility.rateLimitAvailable`
- `anonymousEligibility.providerAvailable`
- `anonymousEligibility.blockerCode`
- `anonymousEligibility.blocker`

This is a visible copy/readback gap only. Do not expand runtime behavior.

## Scope

Expected files:

- `apps/web/lib/public-persona-interaction.ts`
- `apps/web/lib/public-persona-interaction.test.ts`
- roadmap/status docs

Touch `apps/web/components/studio/persona-workspace.tsx` only if the helper
cannot express the required copy cleanly through the existing card body.

## Required Repair

Update the owner-visible public chat/anonymous eligibility copy so the
available replay-alpha branch and blocked branches safely name:

- fail-closed rate-limit posture;
- whether rate-limit backing is ready or blocked;
- whether the provider route is ready or blocked;
- safe blocker copy when unavailable.

Keep copy short enough to fit the existing card on desktop, `375px`, and
`390px`. It should read like owner-facing operational status, not debug output.

Acceptable wording can be concise, for example:

```text
Rate limits fail closed; cache is ready. Provider route is ready.
```

or, when blocked:

```text
Rate limits fail closed; cache or provider setup is not ready.
```

Use the actual existing readback booleans and blocker copy. Do not invent new
state.

## Guardrails

Do not change:

- anonymous chat runtime eligibility;
- the single anonymous alpha slug;
- public prompt/source selection;
- provider/model routing;
- rate-limit keys or behavior;
- API contracts unless an unavoidable typed copy gap is found and kept
  backward-compatible;
- schema/migrations;
- auth/session;
- public reporting or moderation behavior;
- billing/Stripe;
- workers, queues, Redis Memory truth, Cloudflare, connectors, OAuth, social
  dispatch, public launch claims, or broad public persona UI.

Do not expose:

- provider payloads, keys, models, raw config, prompts, completions, private
  context, private source bodies, raw ids, storage paths, signed URLs, tokens,
  cookies, auth headers, IP addresses, user agents, stack traces, or
  secret-shaped values.

## Validation

Run focused validation:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-interaction.test.ts
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If a narrower local validation is justified before review, explain why in the
result doc. ARGUS may rerun the full set.

## Handoff

When done, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS repaired the PR490A hosted readiness-copy defect.
- Owner-visible anonymous eligibility copy now names fail-closed rate-limit posture and provider readiness/blocker state without changing runtime eligibility.
Validation:
- <commands run>
Task:
- Review PR490B against the copy/readback-only repair boundary.
- If accepted, wake MIMIR to route ARIADNE hosted rerun.
- If more fixes are needed, wake DAEDALUS with the smallest repair.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE found one PR490A hosted product defect: owner-visible anonymous eligibility readback does not name fail-closed rate-limit readiness or provider readiness/blocker state when anonymous alpha is available.
- Core privacy, public-route, source-scope, no-transcript/no-identity/no-raw-event, owner rollback, public page no-drift, and mobile fit checks otherwise passed; hosted still lacks a second ordinary public persona fixture.
Task:
- Implement the smallest copy/readback repair in the public persona interaction helper/test surface.
- Visible owner copy must name fail-closed rate-limit posture and provider readiness/blocker state using existing anonymousEligibility readback fields.
- Do not change anonymous runtime eligibility, public prompt sources, provider routing, rate-limit behavior, API contracts unless strictly necessary, schema, auth, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, public reporting/moderation, or broad UI.
- Wake ARGUS with validation and exact diff boundary.
```
