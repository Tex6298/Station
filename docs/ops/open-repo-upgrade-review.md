# Open repo upgrade review

This note captures the reusable ideas reviewed from the user-provided open repositories and the Station upgrades they informed.

## Reviewed sources

- `coollabsio/coolify`: deployment dashboard, self-hosting posture, health checks, Docker/git-push operational clarity.
- `cogniolab/agent-monitor`: LLM traces, token/cost analytics, latency/error monitoring, provider-aware observability.
- `simple10/agents-observe`: session/event replay model, local-first debugging posture, tool-call timelines.
- `builderz-labs/mission-control`: operational dashboards, quality gates, RBAC/trust/security-event vocabulary.
- `BlazeUp-AI/Observal`: agent registry/session analytics concepts. Its AGPL license means Station should borrow architecture ideas only, not code.
- `tobilg/ai-observer`: WebSocket live updates, event ingestion, OTLP-style observability vocabulary, and customizable dashboard widgets.

## Ported into Station

- Per-user `ai_trace_sessions` and `ai_trace_events` tables with RLS.
- Non-blocking trace writes around chat and integrity-session LLM calls.
- Read-only `/observability` API for summaries, recent traces, and trace detail.
- Settings-page AI activity panel showing 7-day traces, errors, token totals, estimated cost, and recent operations.
- Deployment readiness endpoint exposing environment/config health without secret values.
- Developer Space WebSocket live-ingestion notifications at `/developer-spaces/:slug/live`, with the existing SSE stream kept as fallback.
- Developer Space widget layout metadata inside `visualisation_config.widgets`, plus owner controls for visibility and ordering.

## Deferred

- Full session replay with request/response payload expansion.
- WebSocket/SSE live traces.
- OTLP-compatible ingestion.
- Agent registry/package-manager workflows.
- External telemetry backends such as ClickHouse, OpenTelemetry exporters, or Prometheus.
- Coolify-style PaaS features. Station benefits more from deploy-readiness checks than from becoming a PaaS.
