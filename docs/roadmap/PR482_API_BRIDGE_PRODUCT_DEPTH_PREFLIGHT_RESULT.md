# PR482 - API Bridge Product Depth Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

State: ACCEPT_PR482A_API_BRIDGE_SETUP_PACKET_READBACK

Source: `docs/roadmap/PR482_API_BRIDGE_PRODUCT_DEPTH_PREFLIGHT_ARGUS.md`

## Verdict

ARGUS accepts the smallest safe API Bridge product-depth slice:

```text
PR482A - API Bridge Setup Packet Readback
```

This is owner-only setup/readback for the existing Developer Space ingestion
truth. It may make the API Bridge feel like a product surface, but only by
explaining the current route, header-name, payload-family, key-status,
connection-tier, and safe-next-action state for a selected Developer Space.

It is not a live connector, OAuth flow, external account link, hosted runtime,
worker/queue, recurring sync, provider call, billing mutation, key-generation
lane, or production launch claim.

## Product Truth

The current API Bridge product truth is shared across:

- `/studio/onboarding`, which routes owners toward Developer Spaces without
  claiming production bridge infrastructure;
- existing Developer Space owner/manage routes, which own private setup,
  ingestion key status, observatory, usage/quota, evidence, and current bridge
  controls;
- `developer-space-client` docs/helpers, which prove client packet and offline
  demo patterns but are not themselves a product UI contract;
- Tier 1 integration docs, which provide placeholder-only partner setup
  guidance.

PR482A should therefore live primarily on the existing owner Developer Space
manage surface. A tiny onboarding readback may be adjusted only if it stays
route-only and state-aware; broad onboarding redesign is out of scope.

## Accepted Scope

DAEDALUS may implement PR482A with these files or close local equivalents:

- `apps/web/lib/developer-space-observatory.ts`
  - add an API Bridge setup/readback helper;
  - use existing Developer Space record fields such as safe title/slug,
    `apiKeyLastFour`, and `apiKeyCreatedAt`;
  - reuse `developerSpaceConnectionTierReadback("owner")` or equivalent
    existing tier truth rather than inventing new capability state.
- `apps/web/lib/developer-space-observatory.test.ts`
  - cover helper output and source assertions for no secrets, no mutation
    calls, no live-send behavior, and no infrastructure claims.
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
  - render the owner-only API Bridge setup packet/readback beside existing
    private Developer Space controls;
  - keep key generation/rotation on the existing one-time key control only.
- `apps/web/lib/onboarding-paths.ts` and
  `apps/web/lib/onboarding-paths.test.ts` only if DAEDALUS needs to keep the
  onboarding API Bridge card aligned with the new readback.
- PR482A result/docs and validation baseline.

The setup packet may show:

- route placeholders such as
  `POST <STATION_API_BASE_URL>/developer-spaces/ingest/nodes/<NODE_ID>/state`,
  `/developer-spaces/ingest/events`, `/developer-spaces/ingest/snapshots`, and
  `/developer-spaces/ingest/import`;
- required header names only, for example `X-Station-Developer-Key` and
  `Content-Type`;
- optional observed-runtime signing header names only, for example
  `X-Station-Webhook-Id` and `X-Station-Signature`;
- payload families such as node state, event, snapshot, batch import, and
  observed-runtime webhook;
- key status as no key, key present, last four, and created-at readback only;
- Tier 1 as the current self-hosted external-runtime bridge/readback state,
  with Tier 2/Tier 3 still future/blocked;
- safe next actions that route to existing owner manage controls and existing
  placeholder docs.

## Rejected PR482A Shape

ARGUS does not accept a product-visible signed dry-run as PR482A.

Existing `packages/developer-space-client` offline dry-run behavior is useful
evidence and already tested as no-send/no-secret. Turning that into a product
route or UI action would need a separate no-write dry-run contract covering
owner scope, no durable public events, no observed-runtime rows, payload
redaction, request signing, bounded errors, and no live send path. That is a
separate unblock lane, not a side quest inside setup/readback.

## Non-Goals

Do not add or change:

- live external API pulls, OAuth, social/cloud connectors, bot tokens,
  connector credentials, recurring sync, or scheduled jobs;
- new API route behavior, ingestion writes, observed-runtime durable rows,
  signing-secret creation, key rotation, key reveal, raw payload validation
  against live ingestion, or live-send dry-run;
- production workers, queues, Cloudflare Workers, Cloudflare retrieval,
  Vectorize, Redis/Valkey memory truth, runtime provisioning, repo deploys, or
  hosted execution;
- Developer Agent execution, task dispatch, terminal sessions, raw replay, or
  orchestration control-plane behavior;
- billing/Stripe mutation, entitlement mutation, provider/model calls, schema
  expansion, migrations, public launch claims, or broad UI redesign.

## Privacy And Auth Rules

- The setup packet is owner-only.
- Public Developer Space routes must not expose bridge setup controls, key
  state beyond already accepted public-safe observatory copy, private events,
  private evidence, payload bodies, raw IDs, or setup secrets.
- Show only placeholder values and key last four/key-present state. Never show
  a full ingestion key, signing secret, cookie, bearer token, provider payload,
  SQL/table detail, stack trace, hosted log, source body, prompt, private
  evidence, raw event payload, or secret-shaped value.
- The implementation must not log raw setup packet values or raw owner
  payloads.
- Existing authenticated owner controls remain the only place a real key can be
  generated and shown once.

## Required Tests

DAEDALUS should add focused tests proving:

- setup packet output contains route placeholders, header names, payload
  families, key-status readback, connection-tier truth, and safe next actions;
- key status never includes a full key or signing secret;
- route/header examples use placeholders and names only;
- helper copy keeps Tier 1 current and Tier 2/Tier 3 future/blocked;
- source assertions show the setup packet does not call `apiPost`, `apiPatch`,
  key rotation, credential creation, live-send, ingestion, provider, billing,
  Cloudflare, Redis, worker, queue, or deploy paths;
- onboarding, if touched, remains state-aware and route-safe.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts apps/web/lib/developer-space-observatory.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

DAEDALUS should also run a diff path check confirming PR482A does not change
`apps/api`, `packages/types`, `packages/db`, `db`, Supabase/infra schema paths,
migrations, billing/Stripe helpers, provider/model code, Redis/Cloudflare
runtime code, worker/queue code, deployment configuration, or
`packages/developer-space-client` request behavior unless ARGUS explicitly
accepts a narrower local equivalent.

## ARIADNE Requirement

If ARGUS accepts the PR482A implementation, MIMIR should route ARIADNE for
hosted read-only desktop/mobile proof because the slice changes visible owner
product copy.

Suggested proof:

- signed-in owner `/developer-spaces/:slug/manage` desktop and 390px mobile
  shows the API Bridge setup packet with placeholder routes, header names,
  payload family, key status as last-four/no-key only, Tier 1 current and
  Tier 2/Tier 3 future/blocked, and a safe next action;
- `/studio/onboarding` API Bridge card, if touched, stays signed-in,
  state-aware, route-safe, and free of full keys/secrets;
- no click generates or rotates a key unless the existing one-time key control
  is deliberately exercised as a separate baseline action;
- no ingestion send, observed-runtime write, live dry-run, external API call,
  provider/model call, upload, billing/Stripe action, runtime provisioning,
  Cloudflare/Redis/worker/queue behavior, or deploy/repo action is performed;
- no full ingestion key, signing secret, raw payload, private evidence, prompt,
  raw ID, cookie, token, SQL/table detail, stack trace, provider payload, hosted
  log, or secret-shaped value appears in UI or visible errors.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence inspection | Pass | PR482 handoff, PR403/PR404 API Bridge onboarding results, PR480A tier readback closeout, Tier 1 partner onboarding docs, Developer Space owner/manage route, onboarding helpers, observatory helpers/tests, API route/types, and developer-space-client docs/tests inspected. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 58 tests passed, including Developer Space owner/private, credential, observed-runtime, field visibility, connection-tier, and Developer Agent boundary coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed, including no-secret webhook/client behavior and offline dry-run no-send privacy guards. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts apps/web/lib/developer-space-observatory.test.ts` | Pass | 33 tests passed, including API Bridge onboarding state, route-safety, observatory, and connection-tier readback coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from turbo cache. |

## Handoff

```text
WAKEUP A2:
Codename: DAEDALUS
```

Task: implement `PR482A - API Bridge Setup Packet Readback` exactly as
owner-only helper/UI/test work on existing Developer Space product truth. Do
not implement product signed dry-run, live ingestion validation, external
connectors, credential setup beyond existing controls, runtime provisioning,
workers/queues, Cloudflare, Redis, billing/Stripe mutation, provider/model
calls, schema/API expansion, migrations, or broad UI redesign.
