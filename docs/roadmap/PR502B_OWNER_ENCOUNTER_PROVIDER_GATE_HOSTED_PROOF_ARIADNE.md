# PR502B - Owner Encounter Provider Gate Hosted Proof

Owner: ARIADNE / A4

Date: 2026-07-07

## Source

PR502A was accepted locally:

`docs/roadmap/PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_REVIEW_RESULT.md`

MIMIR closed local implementation:

`docs/roadmap/PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE_CLOSEOUT.md`

## Task

Run the hosted owner-route proof for the PR502A encounter provider gate.

This proof is allowed to claim hosted generation only if hosted `@station/api`
has:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

and existing platform NVIDIA config is present.

Do not print or record provider keys, env values, raw base URLs, raw model
config, owner ids, raw persona ids, prompt bodies, stack traces, SQL details,
or secret-shaped values.

## Required Order

1. Confirm hosted web/API deployment health is ready and fresh enough for
   PR502A. MIMIR observed API commit `30b146d2`; use the current hosted truth.
2. Sign in as the staging owner account already used for replay/owner proofs.
3. Navigate to the private Studio persona surface with at least two same-owner
   personas.
4. Use the owner encounter readiness behavior before any generation click.
5. If readiness is blocked with provider-policy/provider-config copy, stop and
   return:

```text
HOSTED_PR502B_PROVIDER_GATE_CONFIG_BLOCKED
```

Name the exact visible/API blocker. Do not run generation while blocked.

6. If readiness is ready, generate exactly one disposable responder reply.
7. Prove desktop and 390px mobile fit for the owner panel.
8. Confirm leaving/cancelling does not leave a transcript, draft, conversation,
   public page, or shareable output.
9. Sample signed-out public persona and public Space routes. They must show no
   encounter controls, generated encounter output, shareable pages, cross-owner
   controls, anonymous encounter controls, or availability claims.

## Pass Criteria

Return:

```text
PASS_PR502B_HOSTED_OWNER_ENCOUNTER_PROVIDER_GATE
```

only if all are true:

- hosted web/API are fresh enough for PR502A;
- authenticated same-owner readiness returns ready;
- generation returns exactly one disposable responder reply;
- the UI labels the preview as owner-only/disposable/non-persistent;
- no prompt/output transcript is persisted;
- no Memory, Archive, Canon, Continuity, Integrity, source retrieval, vector,
  embedding, public/shareable, social, queue, worker, Redis, Cloudflare,
  billing, Stripe, schema, migration, or broad UI behavior appears;
- sampled public routes remain free of encounter controls and availability
  claims;
- desktop and 390px mobile fit without clipping or overlapping controls;
- no provider key, env value, raw base URL, raw model config, owner id, raw
  persona id, prompt body, stack trace, SQL detail, or secret-shaped value is
  visible or recorded.

## Block Criteria

Return:

```text
HOSTED_PR502B_PROVIDER_GATE_CONFIG_BLOCKED
```

if hosted readiness is still paused because the exact route-specific flag or
provider config is missing.

Return:

```text
BLOCK_PR502B_WITH_CONCRETE_REASON
```

for any other defect. Include the smallest DAEDALUS repair if code is at fault.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR502A owner encounter explicit provider route gate is locally accepted.
- Hosted API is ready at implementation commit `30b146d2`, but health does not
  expose the route-specific encounter gate.
- Use the authenticated owner readiness route as hosted truth.
Task:
- Run PR502B hosted proof.
- If readiness is provider-policy/config blocked, stop and wake MIMIR with the
  exact blocker.
- If ready, prove one disposable owner encounter reply and public no-drift.
```

