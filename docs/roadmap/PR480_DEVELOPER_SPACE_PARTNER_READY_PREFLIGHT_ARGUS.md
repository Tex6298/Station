# PR480 - Developer Space Partner-Ready Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR479A is closed. The next feature-expansion choice should move to a different
named customer-facing roadmap capability.

The reopened product map names:

```text
Partner-ready Developer Spaces.
```

This must not repeat Developer Space Tier 1 protected-alpha closeout. PR255
through PR260 already accepted Tier 1 as a public/private readback and
observatory/evidence surface for external self-hosted runtimes.

ARGUS should decide the smallest honest next partner-readiness slice beyond
Tier 1, or name the concrete blocker and smallest unblock.

## Required ARGUS Output

Return exactly one of:

- `ACCEPT_PR480A_PARTNER_USAGE_QUOTA_READBACK`
- `ACCEPT_PR480A_CONNECTION_TIER_STATE_READBACK`
- `ACCEPT_PR480A_DEVSPACE_EXPORT_DEPTH`
- `ACCEPT_PR480A_RATE_LIMIT_RECEIPT`
- `BLOCKED_UNBLOCK_FIRST`
- `REJECT_DEFER`
- `NEEDS_MIMIR_DECISION`

## Candidate Slices

### 1. Partner Usage / Quota Readback

Make Developer Space usage, quota, and limit state clearer for owners without
changing billing or entitlement behavior.

Allowed shape:

- owner-only usage/quota readback from existing Developer Space usage data;
- safe public capability caveat if applicable;
- no paid-plan mutation, Checkout, billing, or pricing changes.

### 2. Connection Tier State Readback

Clarify Tier 1/Tier 2/Tier 3 relationship in product UI without claiming hosted
runtime, repo push/deploy, or developer-agent execution.

Allowed shape:

- readback-only tier/capability state;
- clear blocked/future states for Tier 2/Tier 3;
- no new runtime, key, signing secret, or repo integration.

### 3. Developer Space Export Depth

Improve owner-only Developer Space export/readback using existing export
patterns.

Allowed shape:

- owner-only export manifest/readback depth;
- public route remains free of private export links and raw data;
- no public downloads, background jobs, or archive-wide export redesign.

### 4. Rate-Limit Receipt

Make ingestion/rate-limit behavior more understandable without changing durable
quota authority.

Allowed shape:

- bounded owner readback or receipt copy;
- fail-closed rate-limit messaging;
- no new Redis role, durable queue, worker, or external client package.

## Questions For ARGUS

- Which current Developer Space routes/helpers should be reused?
- Which candidate slice is the smallest real partner-readiness improvement
  beyond PR255-PR260?
- Does existing data support the slice without schema/API expansion?
- Which boundaries from Tier 1 closeout must remain explicit?
- What should DAEDALUS touch?
- What validation should DAEDALUS run?
- Does the accepted slice require ARIADNE hosted human-eye proof?

## Inputs

- `docs/roadmap/PR479A_OWNER_VERSION_COMPARE_READBACK_CLOSEOUT.md`
- `docs/roadmap/DEVELOPER_SPACE_TIER1_CLOSEOUT_AUDIT.md`
- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `apps/web/app/developer-spaces`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `apps/web/lib/developer-space-commercial-packaging.ts`
- `apps/web/lib/developer-space-commercial-packaging.test.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `docs/integration/developer-space-tier1-partner-onboarding.md`

## Guardrails

Do not open:

- hosted app/runtime provisioning;
- repo push/deploy;
- developer-agent job execution;
- key/signing-secret generation or rotation;
- direct layout mutation;
- background jobs/workers/queues;
- realtime production subscriptions;
- Redis as durable truth;
- Cloudflare runtime/index behavior;
- billing, Checkout, pricing, tipping, Stripe, or entitlement mutation;
- provider/model calls;
- public raw export/download links;
- schema/API/auth expansion unless ARGUS names it as the smallest unblock.

Do not expose:

- ingestion keys;
- signing secrets;
- raw event payloads;
- owner-only nodes/events/snapshots;
- private evidence/draft rows;
- raw Developer Space IDs;
- owner IDs;
- customer IDs;
- SQL/table details;
- stack traces;
- provider payloads;
- secrets.

## Wakeup Path

If accepted, wake DAEDALUS with the chosen PR480A slice, exact scope, touched
areas, validation commands, and guardrails.

If blocked or ambiguous, wake MIMIR with the concrete blocker or decision point.
