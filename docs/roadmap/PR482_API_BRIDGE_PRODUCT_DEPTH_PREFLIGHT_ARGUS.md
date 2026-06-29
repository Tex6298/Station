# PR482 - API Bridge Product Depth Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide smallest safe API Bridge depth slice

## MIMIR Decision

After closing PR481A, MIMIR chooses a different named Phase 3/customer-facing
feature:

```text
API Bridge Product Depth
```

Do not extend the Voice / Avatar surface again by inertia.

API Bridge is already routeable in alpha as the Developer Space ingestion path,
but the product still reads more like a route pointer than a mature bridge
setup experience. The next useful question is not "build workers" or "connect
external accounts"; it is whether Station can make the existing bridge safer
and clearer for an owner who wants to send data into a Developer Space.

## Current Repo Evidence

Useful existing pieces:

- PR25 accepted API Bridge as one of the four alpha onboarding paths.
- PR403/PR404 made `/studio/onboarding` route-aware for API Bridge and proved
  hosted onboarding behavior.
- API Bridge currently points owners to Developer Spaces and owner manage
  surfaces.
- Developer Spaces already have owner management, ingestion-key readback,
  signed ingestion, public observatories, field controls, evidence/readback,
  export/readback, Tier 1 partner onboarding docs, and connection-tier
  readback.
- `packages/developer-space-client` and observed-runtime bridge helpers already
  contain client/fixture patterns that may be useful as evidence, but ARGUS
  should not assume they are product-safe without inspection.

Risk to review:

- API Bridge setup can accidentally become credential generation, live external
  connector setup, worker/runtime provisioning, Cloudflare/Redis architecture,
  or raw ingestion-key exposure if the slice is not tightly bounded.
- Developer Space details are the backing surface, but PR482 should be about
  the customer-facing API Bridge setup/readback promise, not another generic
  Developer Space polish pass.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement a
small PR482A slice that deepens API Bridge without new config, external
accounts, or production infrastructure.

Return one of:

```text
ACCEPT_PR482A_API_BRIDGE_SETUP_PACKET_READBACK
ACCEPT_PR482A_API_BRIDGE_SIGNED_DRY_RUN
PATCH_SCOPE
BLOCKED_NEEDS_UNBLOCK_LANE
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, public/private boundary rules, and whether ARIADNE must run hosted
desktop/mobile rehearsal.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables API Bridge product depth.

## Candidate PR482A Shapes

ARGUS may accept, patch, or reject these candidates.

Preferred no-new-config candidate:

1. API Bridge setup packet/readback:
   - add owner-only setup/readback that explains the current bridge state for a
     selected Developer Space;
   - show route, required header names, payload family, connection-tier state,
     key status, and safe next action without revealing full keys or secrets;
   - use placeholders and last-four/key-present readback only;
   - keep setup pointed at existing Developer Space manage/ingestion routes;
   - no external calls, no key rotation, no credential creation beyond existing
     owner controls, no worker/runtime provisioning.

Optional if existing code already supports it safely:

2. Signed dry-run validation:
   - let an owner validate a sample bridge packet shape against existing
     signing/ingestion constraints without creating public events or durable
     observed-runtime rows;
   - return bounded validation readback only;
   - do not store raw payloads, prompts, secrets, private source bodies, or
     connector credentials.

If neither is safe, name the direct unblock. Examples: redacted setup-packet
contract, no-write dry-run contract, key-readback contract, route-safe
Developer Space selection contract, or ingestion payload redaction contract.

## Questions ARGUS Should Answer

1. Which existing API Bridge surfaces are product truth: `/studio/onboarding`,
   `/developer-spaces`, owner manage, developer-space client docs, or all of
   them?
2. Can PR482A be implemented as owner-only readback/setup guidance with no new
   API route?
3. If a dry-run route is useful, can it be no-write and owner-scoped, or would
   that require a separate unblock lane?
4. What key/status detail is safe to show: key present, last four, created
   state, route target, header names, example placeholders?
5. What must remain hidden: full ingestion keys, signing secrets, raw payloads,
   private evidence, prompts, source material, SQL/table details, stack traces,
   hosted logs, cookies, tokens, provider payloads, or secret-shaped values?
6. Which route should own the visible product slice: onboarding API Bridge
   card, Developer Space manage, a small API Bridge panel, or a route-only
   helper?
7. Which tests must DAEDALUS run if accepted?
8. What would ARIADNE need to prove on hosted desktop and 390px mobile?

## Guardrails

Do not add or claim:

- live external API pulls, OAuth, social/cloud connectors, bot tokens, external
  credentials, provider account linking, recurring sync, or scheduled jobs;
- production workers, queues, Cloudflare Workers, Cloudflare retrieval,
  Vectorize, Redis/Valkey memory truth, runtime provisioning, repo deploys, or
  hosted execution;
- Developer Agent action execution, task dispatch, terminal sessions, raw
  replay, or orchestration control plane behavior;
- billing/Stripe mutation, entitlement mutation, provider/model calls, schema
  expansion, migrations, public launch claims, or broad UI redesign;
- public exposure of owner-only bridge setup, keys, private events, private
  evidence, prompts, payload bodies, raw ids, SQL/table output, stack traces, or
  hosted logs.

## Inputs

- `docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_CLOSEOUT.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/PR25_FOUR_ONBOARDING_PATHS_ALPHA.md`
- `docs/roadmap/PR403_ONBOARDING_MIGRATOR_API_BRIDGE_DEPTH_RESULT.md`
- `docs/roadmap/PR404_ONBOARDING_MIGRATOR_API_BRIDGE_REHEARSAL_RESULT.md`
- `docs/roadmap/PR480A_CONNECTION_TIER_STATE_READBACK_CLOSEOUT.md`
- `docs/integration/developer-space-tier1-partner-onboarding.md`
- `apps/web/app/studio/onboarding/page.tsx`
- `apps/web/lib/onboarding-paths.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/developer-space-client/README.md`
- Current Developer Space API/client tests.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR482 API Bridge Product Depth preflight.
Verdict:
- ACCEPT_PR482A_API_BRIDGE_SETUP_PACKET_READBACK | ACCEPT_PR482A_API_BRIDGE_SIGNED_DRY_RUN | PATCH_SCOPE | BLOCKED_NEEDS_UNBLOCK_LANE | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Wake DAEDALUS with accepted scope, revise scope, route the smallest unblock lane, make the product decision, or choose another named Phase 3/customer-facing feature.
```
