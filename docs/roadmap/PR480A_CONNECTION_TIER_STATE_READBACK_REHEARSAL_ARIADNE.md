# PR480A - Developer Space Connection Tier State Readback Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted read-only proof

## Why This Rehearsal

ARGUS accepted PR480A:

`docs/roadmap/PR480A_CONNECTION_TIER_STATE_READBACK_REVIEW_RESULT.md`

The remaining risk is hosted product truth. PR480A changed visible public and
owner Developer Space route copy, so ARIADNE should verify the live Railway app
shows the connection-tier boundary clearly without implying hidden runtime,
deploy, billing, key, provider, Redis, Cloudflare, worker, or queue capability.

This is a human-eye hosted proof. It is not a runtime provisioning test.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `ea47cd9f` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - the public Developer Space route and owner manage route visibly include
     PR480A connection-tier readback.
2. Signed-out public `/developer-spaces/:slug` desktop:
   - Tier 1 is shown as the current available state for a Station-hosted
     showcase, observatory, evidence, ingestion, and owner readback around a
     developer-operated self-hosted external runtime;
   - Tier 2 and Tier 3 are shown as future, blocked, or unavailable states, not
     hidden available capabilities;
   - no hosted runtime provisioning, repo push/deploy, real job execution,
     billing/Stripe mutation, provider/model call, Redis durable truth,
     Cloudflare runtime/index, worker/queue, public raw export/download,
     production realtime, key creation, signing-secret creation, or secret
     availability claim appears;
   - no ingestion key, signing secret, raw event payload, owner-only node/event
     snapshot, private evidence, draft material, raw Developer Space id, owner
     id, customer id, SQL/table detail, stack trace, provider payload, token,
     cookie, or secret-shaped value is visible.
3. Signed-out public `/developer-spaces/:slug` at 390px mobile:
   - the Tier 1/Tier 2/Tier 3 readback remains readable;
   - no horizontal overflow, clipped controls, overlapping text, or broken
     tier-card layout appears;
   - the same public safety boundary holds.
4. Signed-in owner `/developer-spaces/:slug/manage` desktop:
   - the owner console shows the same connection-tier boundary beside existing
     private controls;
   - private controls still read as existing controls, not new Tier 2 or Tier 3
     runtime provisioning;
   - no keys, signing secrets, raw ids, raw payloads, private evidence, draft
     material, customer ids, provider payloads, hosted logs, SQL/table details,
     or stack traces are exposed.
5. Signed-in owner `/developer-spaces/:slug/manage` at 390px mobile:
   - the tier readback and existing private controls remain readable;
   - no horizontal overflow, clipped controls, overlapping text, or broken
     manage-layout state appears;
   - no private data or secret-like value is exposed.
6. Safety:
   - do not generate, rotate, reveal, revoke, or copy ingestion keys or signing
     secrets;
   - do not trigger Checkout, Portal, export creation, provider calls, repo
     actions, deploy actions, worker/queue actions, agent execution, billing
     mutation, entitlement mutation, or schema/API/auth behavior;
   - do not capture hosted logs, SQL output, raw response bodies, raw route
     ids, cookies, auth headers, tokens, provider payloads, stack traces,
     private evidence, private draft bodies, raw node events, or raw snapshots.

## Out Of Scope

Do not try to provision hosted runtime, connect a repo, push/deploy code,
execute a developer-agent job, run worker/queue behavior, configure Redis,
configure Cloudflare, call a provider/model, change billing, open Stripe,
create exports, mutate entitlements, or expand Developer Space API/schema/auth.

Do not judge whether Tier 2 or Tier 3 should be built next. This proof only
checks that PR480A honestly describes what is current and what remains future.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_PARTNER_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` if hosted desktop/mobile public and owner routes show
the PR480A connection-tier state clearly and safely.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing PR480A
copy after fresh deploy, Tier 2/Tier 3 reading as secretly available, broken
mobile layout, or misleading hosted-runtime/deploy/provider/billing claims.

Use `PRIVACY_OR_PARTNER_BOUNDARY_FAIL` if any key, signing secret, raw payload,
raw id, owner-only node/event/snapshot, private evidence, draft material,
customer id, hosted log, SQL/table output, stack trace, provider payload,
cookie, token, or secret-like value appears.

Use `SEED_OR_ROUTE_BLOCKER` only if hosted staging has no routeable public
Developer Space or owner manage route to inspect and the issue cannot be
distinguished from missing seed/account data.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR480A hosted read-only Developer Space connection-tier rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_PARTNER_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR480A, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```
