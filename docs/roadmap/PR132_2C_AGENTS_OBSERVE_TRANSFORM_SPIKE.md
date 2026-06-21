# PR132 - 2C Agents Observe Transform Spike

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews privacy classification, transform
shape, signed-request construction, and overclaim risk. ARIADNE is not
required unless visible routes change.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

ARGUS accepted PR131 and recommended a concrete docs/test-only
`simple10/agents-observe` transform spike before any Cloudflare boundary design.

`simple10/agents-observe` is the closest fit to Station's PR128 operator packet:
the public docs describe local hook/CLI/server event flow without a hard
Cloudflare dependency. This lane should prove the adapter pattern using a tiny
local fixture and transform contract, without importing external repo code or
sending a live request.

## Scope

- Add a tiny local fixture representing an Agents Observe-style hook/session
  event based on PR131 public-doc evidence.
- Add a transform helper that maps the fixture into
  `DeveloperSpaceBatchImportPayload`.
- Add a request-construction proof using the PR128 client helper for
  `station.observed_runtime.webhook.v1` signed webhook delivery. This should
  prove shape/signature construction without sending a live request or requiring
  `STATION_DEVELOPER_KEY`.
- Privacy defaults:
  - raw prompts, command bodies, file paths, tokens, tool payloads, and
    terminal/stdout-like material are private or secret by default;
  - public output should be limited to safe event labels, coarse tool/session
    state, node summaries, counts, and non-secret provenance;
  - secret-shaped keys must not appear in public/member payloads.
- Keep the adapter docs clear that Station observes/imports external runtime
  state; it does not execute, host, schedule, or control Agents Observe or any
  external runtime.

## Non-Scope

- No external repo code vendoring, package install, or dependency import from
  `simple10/agents-observe`.
- No live webhook send, staging smoke, Developer Space key generation, key
  rotation, or request for secret values.
- No Cloudflare Worker, Vectorize, D1, Queue, Durable Object, account/config,
  or deployment work.
- No hosted runtime, worker/queue runtime, partner onboarding wizard, visible
  secret-management UI, billing/Stripe, Redis memory truth, provider routing,
  chat-native developer agent, broad UI, production partner claim, or committed
  secret values.

## Acceptance

- A local Agents Observe-style sample maps deterministically to
  `DeveloperSpaceBatchImportPayload`.
- Tests prove raw/private/secret-like fields are excluded from public-safe
  values and classified private/secret where retained.
- Tests prove the transformed payload can be wrapped into the PR128
  observed-runtime webhook request/signature shape without sending a request.
- Docs identify the transform as a spike and do not claim live adapter support.

## DAEDALUS Implementation

DAEDALUS implemented PR132 on 2026-06-21.

Files touched:

- `packages/developer-space-client/src/agents-observe.ts`
- `packages/developer-space-client/src/index.ts`
- `packages/developer-space-client/src/index.test.ts`
- `packages/developer-space-client/README.md`
- `docs/roadmap/PR132_2C_AGENTS_OBSERVE_TRANSFORM_SPIKE.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Source evidence:

- PR131 local review identified `simple10/agents-observe` as the closest first
  bridge target.
- Public Agents Observe docs describe hook stdin JSON, a CLI posting events to
  a local API server, Hono + SQLite storage, and WebSocket live updates.

Transform shape:

- Added `agentsObserveHookEventFixture`, a tiny local fixture with session,
  event, agent, hook/tool status, coarse token counts, touched-file count, and
  fake raw sensitive fields.
- Added `transformAgentsObserveHookEvent`, which maps that fixture to
  `DeveloperSpaceBatchImportPayload`:
  - session and agent nodes;
  - one public event with coarse labels/counts;
  - one public snapshot with counts and policy;
  - one provenance supporting-context record with redacted sensitive fields and
    private/secret classifications.

Privacy proof:

- Raw prompt, command body, file paths, tool payload token/path,
  terminal-output-like material, and token value are not copied into public
  event data.
- Retained redacted supporting-context fields are classified `private` or
  `secret`; token value is classified `secret`.
- Tests assert raw fixture sentinel values do not appear in serialized payload
  or signed request body.

Signed request proof:

- Tests build a `station.observed_runtime.webhook.v1` request with
  `createObservedRuntimeWebhookRequest` from the transformed payload.
- The proof uses a fixed fake signing secret and timestamp, checks the
  HMAC-SHA256 signature header, checks the external observer source shape, and
  sends no network request.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

DAEDALUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 10 tests passed, including transform mapping, privacy redaction/classification, and signed request construction. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass | Client package build completed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

If API or web behavior changes unexpectedly, run the relevant focused gate and
explain why the lane broadened.

## Handoff

Wake ARGUS with:

- files touched;
- fixture shape and source evidence;
- transform output shape;
- privacy classification proof;
- signed webhook request construction proof;
- validation results;
- non-claims and no-secret proof.

Wake MIMIR only if the public Agents Observe evidence is too thin to make a
truthful local fixture.
