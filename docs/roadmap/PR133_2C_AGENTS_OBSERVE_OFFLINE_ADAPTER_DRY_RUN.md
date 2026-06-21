# PR133 2C Agents Observe Offline Adapter Dry Run

Status: Implemented by DAEDALUS on 2026-06-21; ready for ARGUS review.

## Why This Lane

PR132 proved the core privacy shape: a tiny Agents Observe-style event can be
transformed into `DeveloperSpaceBatchImportPayload` and wrapped for PR128 signed
observed-runtime webhook request construction without leaking raw prompt,
command, path, tool, terminal, token, session, event, or agent source ids.

The next step should make that proof usable by a developer/operator without
requiring live Station credentials. We need a repeatable offline dry run that
can read a fixture, transform it, validate the redaction contract, and show what
would be sent before any live adapter, Cloudflare boundary, or key-bearing smoke
run is opened.

## Scope

- Add a small offline dry-run entry point in the developer-space client package
  or examples area.
- It should accept a local Agents Observe-style fixture path or use the PR132
  fixture by default.
- It should transform the fixture through the PR132 helper into
  `DeveloperSpaceBatchImportPayload`.
- It should optionally build the PR128 observed-runtime webhook request envelope
  using a clearly marked fake/demo signing secret only.
- It should print or return a safe dry-run summary:
  - event/node/snapshot/supporting-context counts;
  - public/private/secret classification counts;
  - coarse labels and provenance names;
  - whether the no-raw-source-id/no-secret assertions passed;
  - a clear `not sent` status.
- Add focused tests proving the dry run does not require
  `STATION_DEVELOPER_KEY`, `STATION_API_URL`, a live webhook id, Railway,
  Supabase, Cloudflare, or network access.
- Document how to run the dry run locally and what output is safe to paste into
  a review handoff.

## Privacy Contract

The dry-run output must not serialize or print:

- raw prompts;
- command bodies;
- file paths;
- token values;
- raw tool payloads;
- terminal/stdout/stderr-like output;
- fixture `sessionId`;
- fixture `eventId`;
- fixture `agent.id`;
- live API keys;
- live signing secrets;
- webhook ids unless they are synthetic demo ids.

Opaque/demo structural ids are acceptable only if they cannot be traced back to
raw source ids.

## Acceptance

- A developer can run the dry run locally with no secrets and get a safe,
  reviewable summary.
- The implementation reuses PR132 transform/request-construction helpers instead
  of duplicating mapping logic.
- Tests fail if raw fixture ids or secret-shaped values appear in serialized
  dry-run output.
- README/docs clearly distinguish:
  - offline dry run;
  - request construction proof;
  - live signed send, which remains PR130/config-gated.

## DAEDALUS Implementation

DAEDALUS implemented PR133 on 2026-06-21.

Files touched:

- `packages/developer-space-client/src/index.ts`
- `packages/developer-space-client/src/index.test.ts`
- `packages/developer-space-client/examples/agents-observe-offline-dry-run.ts`
- `packages/developer-space-client/README.md`
- `docs/roadmap/PR133_2C_AGENTS_OBSERVE_OFFLINE_ADAPTER_DRY_RUN.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Dry-run API:

- `createAgentsObserveOfflineDryRunSummary(options)`
- Defaults to the PR132 `agentsObserveHookEventFixture`.
- Accepts an already parsed fixture object and fixture source label.
- Optionally builds a PR128 signed request proof with demo signing material and
  demo webhook id only.
- Returns a safe `status:"not_sent"` summary; it does not send a request.

Dry-run command:

```bash
npx tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --signed-demo
```

Optional fixture path:

```bash
npx tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --fixture=./agents-observe-fixture.json --signed-demo
```

Sample safe output shape:

```json
{
  "status": "not_sent",
  "source": "agents-observe",
  "fixtureSource": "default-fixture",
  "liveConfigRequired": false,
  "networkAccessRequired": false,
  "payloadSummary": {
    "nodes": 2,
    "events": 1,
    "snapshots": 1,
    "supportingContext": 1,
    "eventTypes": ["agents_observe.tool_call"],
    "publicEventDataKeys": ["source", "hookName", "toolName", "status"],
    "provenanceRefs": ["simple10/agents-observe public docs"]
  },
  "classificationCounts": {
    "public": 28,
    "member": 0,
    "owner": 1,
    "private": 5,
    "secret": 1
  },
  "privacyAssertions": {
    "noRawPrompt": true,
    "noCommandBody": true,
    "noFilePaths": true,
    "noToolPayload": true,
    "noTerminalOutput": true,
    "noTokenValue": true,
    "noRawSourceIds": true,
    "noLiveSecrets": true
  },
  "signedRequest": {
    "built": true,
    "status": "not_sent",
    "schema": "station.observed_runtime.webhook.v1",
    "demoWebhookId": "demo-agents-observe-dry-run",
    "signatureHeader": "t=1771452800,v1=<redacted>"
  }
}
```

No-live-config/no-network proof:

- The dry-run summary reports `liveConfigRequired:false` and
  `networkAccessRequired:false`.
- Focused tests delete `STATION_DEVELOPER_KEY`, `STATION_API_URL`, and
  `STATION_OBSERVED_RUNTIME_WEBHOOK_ID`, replace `globalThis.fetch` with a
  failing stub, and prove the dry run completes without calling fetch.
- The example command was run with `--signed-demo`; it printed safe output and
  sent no request.

Privacy proof:

- Tests fail if dry-run output includes raw prompts, command bodies, file paths,
  token values, raw tool payload values, terminal-output-like material, fixture
  `sessionId`, fixture `eventId`, fixture `agent.id`, or demo signing material.
- Output includes only counts, coarse labels, provenance names, boolean privacy
  assertions, redacted signature header, and a synthetic demo webhook id.

## Validation

Run the narrow relevant gates:

```bash
pnpm test:developer-space-client
pnpm --filter @station/developer-space-client build
pnpm --filter @station/developer-space-client typecheck
git diff --check
```

If the package has no standalone typecheck script, use the closest repo-local
typecheck that covers touched files and report that choice.

DAEDALUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 11 tests passed, including no-live-config/no-network dry-run proof. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass | Client package build completed and serves as the package-local typecheck because no standalone typecheck script exists. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --signed-demo` | Pass | Printed safe `not_sent` summary with redacted demo signature and no raw ids/secrets. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## Non-Scope

- No live webhook send.
- No `STATION_DEVELOPER_KEY` requirement.
- No Developer Space key generation or rotation.
- No Railway/Supabase/Cloudflare config request.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No external repo code vendoring.
- No hosted runtime, task scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.
- No committed secrets.

## Handoff

Wake ARGUS with:

- dry-run command/API shape;
- sample safe output shape;
- fixture/source evidence;
- proof that no live config or network access is required;
- privacy/no-raw-id/no-secret test evidence;
- validation results;
- explicit non-claims.

Wake MIMIR instead if PR132 helpers are too narrow to reuse cleanly without
widening scope.
