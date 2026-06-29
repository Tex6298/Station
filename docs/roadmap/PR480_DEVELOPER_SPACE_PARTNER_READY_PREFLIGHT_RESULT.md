# PR480 - Developer Space Partner-Ready Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_PR480A_CONNECTION_TIER_STATE_READBACK`

## Decision

ARGUS accepts the smallest honest next slice as:

```text
PR480A - Developer Space Connection Tier State Readback
```

This is a readback-only tier/capability state slice for existing Developer Space
public and owner surfaces. It should make the Tier 1 / Tier 2 / Tier 3
relationship explicit without claiming that Station hosts developer apps,
provisions runtime infrastructure, pushes repos, runs jobs, creates keys,
changes billing, or exposes private Developer Space material.

It is not hosted runtime provisioning, repo push/deploy, developer-agent
execution, key/signing-secret generation, billing/Stripe work, export depth,
rate-limit authority, Redis/Cloudflare runtime work, provider calls, schema/API
expansion, or entitlement mutation.

## Existing Surface Findings

Repo inspection found enough existing surface for a narrow helper/UI/test slice:

- Tier 1 protected-alpha was closed by PR255-PR260 as a public/private
  readback, observatory, evidence, onboarding, and owner console surface for
  self-hosted external runtimes.
- `developerSpaceTierOneFramingCopy()` already explains Tier 1 as Station-hosted
  showcase/readback while the runtime remains external and self-hosted.
- Public `/developer-spaces/[slug]` already renders Tier 1 public readback,
  observatory story, evidence path, project updates, widgets, and public-safe
  signal/snapshot summaries.
- Owner `/developer-spaces/[slug]/manage` already renders private operating
  console copy, ingestion key controls, current state, usage/quota readback,
  bounded Developer Agent readbacks, visual framing, exports, and evidence
  management.
- `developerSpaceUsageReadback(...)` already covers owner usage/quota caveats.
- `developerSpaceCommercialPackagingReadback(...)` and PR474A already cover
  Canon / Developer billing handoff without opening Stripe mechanics.
- Developer Space owner-only exports and PR430 already cover export readback
  boundaries.
- Rate-limit responses are already cache-backed, structured, machine-readable,
  and tested.
- The Tier 1 closeout audit explicitly names connection-tier product state as a
  partial/caveat rather than a closed product surface.

That makes connection-tier state the smallest real partner-readiness gap beyond
Tier 1 closeout.

## Candidate Rejections

Rejected for PR480A:

- `ACCEPT_PR480A_PARTNER_USAGE_QUOTA_READBACK`: usage/quota readback already
  exists in the owner console and tests. It can be deepened later if a partner
  pilot names a concrete quota/readability problem, but it is not the cleanest
  next gap.
- `ACCEPT_PR480A_DEVSPACE_EXPORT_DEPTH`: owner-only export/readback already has
  accepted boundaries, and deeper export work risks raw data/download/background
  scope. It should wait for a named export need.
- `ACCEPT_PR480A_RATE_LIMIT_RECEIPT`: rate-limit errors are already structured
  and tested. More receipt depth risks durable-quota/Redis confusion unless a
  partner integration produces a concrete blocker.

Accepted instead:

- `ACCEPT_PR480A_CONNECTION_TIER_STATE_READBACK`: closes the explicit Tier
  1/Tier 2/Tier 3 product-state caveat with static, readback-only copy and
  helper coverage, without infra, billing, API, schema, or mutation changes.

## Accepted PR480A Scope

DAEDALUS may implement a narrow connection-tier readback:

- Add a helper in `apps/web/lib/developer-space-observatory.ts`, for example
  `developerSpaceConnectionTierReadback(...)`, that returns bounded cards/rows
  for:
  - Tier 1: available/current Station-hosted showcase, observatory, evidence,
    ingestion, and owner readback for a self-hosted external runtime;
  - Tier 2: unavailable/future Station-hosted runtime, database, deploy,
    repo-push, job execution, queues/workers, Redis, Cloudflare runtime/index,
    production realtime, and operational hosting;
  - Tier 3: unavailable/future lab/interconnected experimental composition.
- Wire that helper into the existing public Developer Space route and owner
  manage route as readback/orientation only.
- Keep copy clear that Tier 1 is current and Tier 2/Tier 3 are future/blocked
  states, not hidden available capabilities.
- Reuse existing Developer Space data only for safe counts/labels if needed.
  No new API route, serializer field, schema, migration, auth path, entitlement
  check, provider call, billing action, worker, queue, or deploy behavior is
  required.
- Keep public copy free of ingestion keys, signing secrets, raw event payloads,
  owner-only nodes/events/snapshots, private evidence/drafts, raw Developer
  Space IDs, owner IDs, customer IDs, SQL/table details, stack traces, provider
  payloads, and secret-shaped values.
- Owner copy may point to existing private controls, but must not create,
  rotate, reveal, or request keys/secrets.

Suggested touched files:

- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- PR480A result/docs and validation baseline

Do not touch API routes, database schema, Supabase migrations, billing routes,
Stripe helpers, export package payloads, Redis/Cloudflare/runtime code,
developer-space-client request behavior, provider/model code, or deployment
configuration unless DAEDALUS stops and wakes MIMIR with the exact blocker.

## Required Tests

DAEDALUS should add focused coverage proving:

- Tier 1 is labeled as the current available state and explicitly describes
  self-hosted external runtime readback.
- Tier 2 and Tier 3 are labeled as future/blocked states and do not claim hidden
  availability.
- The readback copy does not include hosted runtime, repo push/deploy, real
  job execution, key/signing-secret generation, billing/Stripe mutation,
  provider calls, public raw export/download, Redis durable truth, Cloudflare
  runtime/index, worker/queue, production realtime, or entitlement mutation
  claims.
- Public route source uses the helper without exposing owner-only raw data,
  keys, secrets, raw IDs, private evidence/drafts, raw event payloads, provider
  payloads, SQL/table details, or stack traces.
- Owner manage route source can show the tier readback beside private controls
  without creating/rotating/revealing secrets or executing future actions.
- Any route/source assertion confirms no new API endpoint, schema, billing,
  Stripe, export download, provider, Redis, Cloudflare, worker, queue, deploy,
  or developer-agent execution wiring was added.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:billing
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff-only sensitive/scope scan covering ingestion keys, signing
secrets, raw payloads, owner-only nodes/events/snapshots, private
evidence/drafts, raw Developer Space IDs, owner IDs, customer IDs, SQL/table
details, stack traces, provider payloads, secrets, hosted runtime/deploy/repo
claims, developer-agent execution, key/signing-secret mutation, billing/Stripe
mutation, public raw export/download, schema/API/auth changes, Redis,
Cloudflare, workers, queues, production realtime, provider/model calls, and
deployment behavior.

## ARIADNE Rehearsal Requirement

After DAEDALUS implements PR480A and ARGUS accepts it, MIMIR should route
ARIADNE for a read-only hosted human-eye proof because the slice changes visible
public/owner Developer Space route copy.

Suggested proof:

- signed-out public `/developer-spaces/:slug` desktop and 390px mobile shows
  Tier 1 current state plus Tier 2/Tier 3 future/blocked states without hosted
  runtime, repo/deploy, job execution, billing/Stripe, provider, Redis,
  Cloudflare, worker/queue, or secret claims;
- signed-in owner `/developer-spaces/:slug/manage` desktop and 390px mobile
  shows the same connection-tier boundary beside existing private controls
  without exposing keys/secrets/raw IDs/raw payloads/private evidence;
- no mutation, key generation/rotation, Checkout/Portal, export creation,
  provider call, deploy, repo, worker, queue, or agent execution is performed.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR480 handoff, PR479A closeout, Tier 1 closeout audit, partner readiness map, Tier 1 onboarding docs, Developer Space public/manage routes, observatory helpers/tests, commercial packaging helpers/tests, API route/type evidence, builds, prep lane audit, and future lanes inspected. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 56 tests passed, including usage/quota, rate-limit, commercial packaging, owner/private, observed-runtime, field visibility, and Developer Agent boundary coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed, including structured quota/rate-limit errors and no-secret webhook/client behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 7 tests passed, preserving owner-only export boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:billing` | Pass | 16 tests passed, preserving Billing-owned Checkout/Portal/webhook/entitlement behavior. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from turbo cache. |
| `git diff --check` | Pass | No whitespace errors before the roadmap edit. |
| `git diff --cached --check` | Pass | No staged whitespace errors before the roadmap edit. |

## Handoff

Wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR480A - Developer Space Connection Tier State Readback`
exactly as readback-only helper/UI/test work on existing Developer Space
public and owner routes. Do not open hosted runtime provisioning, repo
push/deploy, developer-agent job execution, key/signing-secret generation,
billing/Stripe mutation, public raw export/download, rate-limit authority,
schema/API/auth expansion, provider/model calls, Redis, Cloudflare,
workers/queues, production realtime, entitlement mutation, or deployment
behavior.
