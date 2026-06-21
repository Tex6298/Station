# Observed Runtime Adapter Discovery

Date: 2026-06-21

Status: PR131 discovery map. No adapter implementation, Cloudflare setup,
runtime hosting, deployment work, visible UI, or secrets were added.

## Sources Reviewed

Local Station sources:

- `docs/ops/open-repo-upgrade-review.md`
- `docs/integration/intelhub-to-station-developer-spaces.md`
- `docs/architecture/observed-runtime-fixture-preflight.md`
- `docs/ops/CLOUDFLARE_DEPENDENCY_CHECK.md`
- `docs/roadmap/PR129_2C_OBSERVED_RUNTIME_READINESS_CLOSEOUT.md`
- `packages/developer-space-client/README.md`

Public repo sources:

- `https://github.com/simple10/agents-observe`
- `https://github.com/simple10/agents-observe/blob/main/docs/DEVELOPMENT.md`
- `https://github.com/builderz-labs/mission-control/blob/main/docs/quickstart.md`
- `https://github.com/builderz-labs/mission-control/blob/main/package.json`
- `https://github.com/tobilg/ai-observer/blob/main/README.md`
- `https://github.com/cindiekinzz-coder/NESTstack`

## Station Baseline

Station currently supports the PR120-PR128 observed-runtime foundation:

- `station.observed_runtime.webhook.v1` signed webhook envelope;
- `X-Station-Developer-Key`, `X-Station-Signature`, and stable webhook id;
- node, event, snapshot, and supporting-context persistence;
- field classification and secret stripping;
- public/member/owner/private/secret readback filtering;
- dedicated signing-secret lifecycle with ingestion-key fallback;
- idempotent replay, conflict, in-progress, and failed receipt readback;
- TypeScript client helper plus local smoke example.

This is enough for a narrow adapter to push observed state into Station. It is
not runtime execution, hosting, scheduling, orchestration, or control.

## Discovery Map

| Candidate | Emits / expects | PR128 packet fit | Cloudflare classification | Station overlap | Smallest adapter / bridge | Deferred work |
| --- | --- | --- | --- | --- | --- | --- |
| `simple10/agents-observe` | Claude Code/Codex hook events, tool timelines, file touches, subagent/session replay, token/cost stats. Public docs describe hooks reading stdin JSON, a CLI posting events to an API server, Hono + SQLite storage, and WebSocket live updates. | Not direct today, but a local bridge can transform hook/CLI events into Station `events[]`, session/tool nodes, snapshots, and supporting context, then call `sendObservedRuntimeWebhook`. | No Cloudflare hard dependency found. The repo uses local plugin/Docker/SQLite/WebSocket patterns. Cloudflare is unnecessary for the adapter. | Station already has Developer Space events, nodes, snapshots, supporting context, SSE/readback, field controls, and signed webhook delivery. | Add a small local forwarder beside `observe_cli.mjs` or server export path: classify raw prompt/tool payloads as private/secret, summarize public-safe event labels, batch by session/delivery id, sign with PR128 helper. | Raw replay privacy policy, prompt/body classification, session replay UI, plugin packaging, and any attempt to replace Agents Observe's dashboard. |
| `tobilg/ai-observer` | OpenTelemetry-compatible telemetry, local session file watcher/import for Claude/Codex/Gemini, token/cost/API latency/error/session analytics, DuckDB storage, REST API + WebSocket hub. | Not direct today. It can feed Station through an OTLP/export/file-watch adapter that maps sessions to nodes, telemetry spans/events to events, aggregate costs/errors to snapshots, and source metadata to supporting context. | No Cloudflare hard dependency found. Public docs emphasize a self-hosted single binary, local DuckDB, Docker/binary/Homebrew modes, and zero external dependencies. | Station overlaps on public observatory readback, events/snapshots, export packages, and owner/private/public visibility. Station should not duplicate DuckDB analytics internals. | Adapter option A: sidecar consumes AI Observer export or API and posts signed Station packets. Option B: OTLP receiver shim maps selected spans to Station events. Start with export/API sidecar to avoid OTLP surface expansion. | Full OTLP ingestion, raw trace retention, Parquet import/export UX, pricing model sync, and private prompt/trace exposure review. |
| `builderz-labs/mission-control` | Agent registration, task creation/queue claiming, heartbeat, cost/workflow/orchestration events, CLI/MCP surfaces. Public quickstart exposes bearer API key calls and heartbeat/task APIs; package uses Next/SQLite-style dependencies such as `better-sqlite3`, `ws`, and `node-pty`. | Not direct today. A bridge can poll/watch Mission Control task/agent events and forward status transitions as Station events plus agent/task nodes and periodic snapshots. | No Cloudflare hard dependency found. Public quickstart says the first agent loop works with Mission Control and `curl`, no gateway/OpenClaw/extra dependencies. | Station overlaps on observability/readback, not orchestration. Developer Spaces can observe agent/task state but should not dispatch tasks or become Mission Control. | A read-only bridge using `MC_URL`/`MC_API_KEY`: register no new control plane, watch/poll events, classify operational details, send signed observed-runtime packets. | Task dispatch, agent control, terminal sessions, OpenClaw gateway behavior, pty streaming, and any Station-side orchestration UI. |
| `cindiekinzz-coder/NESTstack` | Companion memory, emotional continuity, identity/daemon/dream/dashboard signals. Public README describes Cloudflare Workers + D1 + Vectorize, plus local Path A and Cloudflare Path B. | Direct only through a small emitter. NEST local or Cloudflare components would need to call the PR128 signed webhook on memory, daemon, identity, or session events. | Mixed. Local Path A has no Cloudflare requirement. Full continuity/daemon/mobile PWA path is Cloudflare-native: Workers, D1, Vectorize, and Durable Objects appear as core architecture pieces. For Station integration, Cloudflare is a hard dependency only if the chosen NEST source is the full Cloudflare deployment; otherwise it is a hybrid/deployment default. | Station overlaps on continuity, memory, identity/readback, and Supabase persistence. Station should remain the observed archive/community/readback surface, not adopt NEST's runtime truth store. | If NEST local: Node/local emitter posts signed Station packets. If NEST Cloudflare: Worker-side webhook emitter signs and posts non-secret summaries to Station while Cloudflare keeps runtime collection. | D1/Vectorize migration, Durable Object daemon adoption, emotional memory truth, scheduling/control, companion UX, user secret flow, and Cloudflare account/deploy setup. |

## Cloudflare Classification

Hard dependency:

- Only the full NESTstack Cloudflare path appears to require Cloudflare
  primitives for its own architecture: Workers, D1, Vectorize, and Durable
  Objects.

Convenient deployment default:

- NESTstack local Path A is explicitly no-Cloudflare, so Cloudflare is not a
  hard dependency for a local proof emitter.

No Cloudflare dependency found:

- `simple10/agents-observe`
- `tobilg/ai-observer`
- `builderz-labs/mission-control`

Overlapping capability:

- Station already has Supabase-backed Developer Space persistence/readback for
  nodes, events, snapshots, supporting context, public/member/owner filtering,
  signed webhooks, and receipt-backed replay behavior.
- Station already treats Cloudflare retrieval as disabled-safe adapter
  inventory, not current runtime truth.

Hybrid possibility:

- A Cloudflare Worker can be a future edge/runtime collector that signs and
  forwards observed summaries to Station.
- Station should remain the Supabase-backed persistence, authorization,
  public-readback, and export system unless a later privacy/deployment lane
  explicitly changes that.

## Recommendation

Next lane: open one concrete adapter spike for `simple10/agents-observe`.

Reason:

- It is the closest fit to the current PR128 packet: events already pass
  through a local CLI/server boundary before storage/readback.
- It does not require Cloudflare or a staging secret rotation.
- It can prove the adapter pattern with synthetic/local hook events and no
  runtime-control scope.

Proposed lane shape:

- Build a docs/test-only transform first: Agents Observe hook/session sample to
  `DeveloperSpaceBatchImportPayload`.
- Classify raw prompts, command bodies, paths, tokens, and tool payloads as
  private/secret by default.
- Emit public-safe event labels, node summaries, and snapshot counts only.
- Reuse PR128 `createObservedRuntimeWebhookRequest` for signed delivery.
- Do not install or vendor Agents Observe code; use a tiny local fixture based
  on public docs and a transform contract.

Second choice: `tobilg/ai-observer` export/API sidecar, if MIMIR prefers a
tool-agnostic observability adapter over a Claude/Codex hook-shaped adapter.

Do not open Cloudflare boundary design yet. The current evidence says
Cloudflare is only mandatory for a full NESTstack-style Cloudflare runtime, not
for the first Station observed-runtime adapter proof.

## Non-Claims

- No external repo code was imported.
- No live GitHub, Cloudflare, Railway, Supabase, or staging credentials were
  requested or used.
- No `.env` values, API keys, tokens, webhook secrets, private payloads,
  cookies, bearer tokens, or credentials were printed or committed.
- No adapter, Worker, queue, Durable Object, Vectorize index, D1 database,
  partner onboarding wizard, visible secret-management UI, billing/Stripe,
  Redis memory truth, provider routing, chat-native developer agent, broad UI,
  production partner claim, or hosted runtime behavior was added.
