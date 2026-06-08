# Open repo upgrade review

This note captures the reusable ideas reviewed from the user-provided open repositories and the Station upgrades they informed.

## Reviewed sources

- `coollabsio/coolify`: deployment dashboard, self-hosting posture, health checks, Docker/git-push operational clarity.
- `cogniolab/agent-monitor`: LLM traces, token/cost analytics, latency/error monitoring, provider-aware observability.
- `simple10/agents-observe`: session/event replay model, local-first debugging posture, tool-call timelines.
- `builderz-labs/mission-control`: operational dashboards, quality gates, RBAC/trust/security-event vocabulary.
- `BlazeUp-AI/Observal`: agent registry/session analytics concepts. Its AGPL license means Station should borrow architecture ideas only, not code.
- `tobilg/ai-observer`: WebSocket live updates, event ingestion, OTLP-style observability vocabulary, and customizable dashboard widgets.
- `acnlabs/OpenPersona`: Soul/Body/Faculty/Skill persona layering, persona-switch handoff packets, lifecycle protocol, forking, cross-session memory, and MCP integration patterns.
- `Ate329/PersonaFlow`: lightweight per-character memory settings, persona switching, and simple memory retrieval boundaries.
- `marc-shade/ai-persona-lab`: persistent embeddings memory, confidence scoring, learning pipelines, and NetworkX-style knowledge graph concepts.
- `agentic-box/memora`: memory graph edges, relation vocabulary, RAG chat panel, memory creation/update tools, and graph visualization UX.
- `huss-mo/GroundMemory`: MCP-native local memory tiers, daily logs, relation triples, bootstrap injection, and hybrid search posture.
- `marisombra-dev/identity-continuity`: identity layer split across soul/current/thread/pending files, restart continuity metrics, and autonomous thought-loop framing.
- `mrjessek/shang-tsung`: second-brain startup/shutdown ritual, proof-of-life logs, soul lineage numbering, and multi-agent identity lineage.
- `AILIFE1/Cathedral`: identity anchors, wake protocol, drift detection through corpus snapshots, peer verification, and memory category taxonomy.
- `cindiekinzz-coder/NESTstack`: Cloudflare-native emotional continuity, three-layer memory, daemon heartbeat, and identity portrait concepts.
- `letta-ai/characterai-memory`: shared user profile memory blocks across otherwise private character agents, plus active/new character state vocabulary.
- `Sakushi-Dev/PersonaUI`: Cortex memory split, autonomous threshold-based updates, afterthoughts, slash commands, and local privacy model. AGPL license means Station should borrow architecture ideas only.
- `carsteneu/yesmem`: project continuity model, trust hierarchy, supersession, contradiction handling, decay, briefings, and continuity search. Apache-2.0.
- `wangjiake/JKRiver`: sleep consolidation pipeline, suspected/confirmed/established progression, fact expiry, evidence chains, and owner-isolated memory. AGPL/commercial license means Station should borrow architecture ideas only.
- `msalsas/amanuensis`: human-veto publishing workflow, source grounding, deterministic cleanup before LLM judgment, approval queue, and dry-run publishing.
- `discourse/discourse`: mature community forum model with trust levels, moderation actions, topic controls, chat/plugin ecosystem, and self-hosted posture. GPL license means Station should borrow architecture ideas only.
- `flarum/framework`: lightweight, responsive, extensible discussion platform with a small frontend footprint and simpler self-hosting model. MIT.
- `LemmyNet/lemmy`: federated Reddit-style communities, voting, public moderation logs, sticky/lock/remove/restore actions, and mobile-friendly discussion flows. AGPL license means Station should borrow architecture ideas only.
- `forem/forem`: community publishing/discussion stack, profiles, semantic recommendations, and high contribution/testing standards. AGPL license means Station should borrow architecture ideas only.
- `elkarte/Elkarte`: traditional forum lineage emphasizing permissions, moderation, and mature category/thread hygiene.
- `mbeps/next_discussion_platform`: Next.js discussion app with communities, voting, saved posts, admin controls, search, threaded comments, and responsive UI.

## Ported into Station

- Per-user `ai_trace_sessions` and `ai_trace_events` tables with RLS.
- Non-blocking trace writes around chat and integrity-session LLM calls.
- Read-only `/observability` API for summaries, recent traces, and trace detail.
- Settings-page AI activity panel showing 7-day traces, errors, token totals, estimated cost, and recent operations.
- Deployment readiness endpoint exposing environment/config health without secret values.
- Developer Space WebSocket live-ingestion notifications at `/developer-spaces/:slug/live`, with the existing SSE stream kept as fallback.
- Developer Space widget layout metadata inside `visualisation_config.widgets`, plus owner controls for visibility and ordering.
- Persona layer profiles via `persona_layer_profiles`, adapting OpenPersona's Soul/Body/Faculty/Skill model plus Station-specific evolution guardrails.
- Persona lifecycle events and context handoff records for wake/switch/fork/integrity/memory-graph transitions.
- Memory graph edges through `memory_item_edges` with relation types for related/supports/contradicts/supersedes/extends/references.
- Owner-only API routes for persona architecture, handoff creation, memory graph reads, and memory graph edge writes.
- Persona Management UI backed by live architecture, lifecycle, handoff, archive summary, and memory graph data instead of placeholder rows.
- Shared owner memory blocks through `owner_memory_blocks`, adapting Letta's shared human profile concept for Station personas.
- Per-memory lifecycle metadata through `memory_item_lifecycle`, adding trust levels, active/superseded/rejected/expired/quarantined statuses, confidence, decay, expiry, reinforcement counts, evidence, and supersession links.
- Persona memory cycle state through `persona_memory_cycle_states`, creating the foundation for PersonaUI/Riverse-style threshold consolidation.
- Memory briefing API and memory-page UI that expose shared profile blocks, trust/status counts, reinforcement, and quarantine controls.
- Community trust profiles through `community_user_profiles`, adding Discourse-style trust levels, reputation, activity counts, helpful votes, report counts, and mute state.
- Normalized voting through `community_votes`, plus thread/comment vote APIs and score recalculation.
- Public moderation action log through `community_moderation_actions`, plus admin thread actions for lock/unlock, pin/unpin, hide/unhide, remove/restore.
- Forum category search and sort controls for active, hot, and newest discussions.
- Forum UI voting/reporting controls and visible moderation logs on thread pages.

## Deferred

- Full session replay with request/response payload expansion.
- WebSocket/SSE live traces.
- OTLP-compatible ingestion.
- Agent registry/package-manager workflows.
- External telemetry backends such as ClickHouse, OpenTelemetry exporters, or Prometheus.
- Coolify-style PaaS features. Station benefits more from deploy-readiness checks than from becoming a PaaS.
- Direct MCP runtime adoption from OpenPersona or GroundMemory.
- Cloudflare Worker/D1/Vectorize architecture from NESTstack.
- Autonomous daemon heartbeat and emotional self-modification loops.
- Cryptographic corpus drift detection and peer verification from Cathedral.
- Python/Ollama/NetworkX runtime code from ai-persona-lab.
- Direct import of Memora's graph UI; Station now has the data contract first, with richer visualization still available as a future UI pass.
- Full YesMem-style proxy, prompt-cache management, multi-agent scheduler, or code-index daemon.
- Riverse-style 14-step LLM sleep transaction and automated contradiction arbitration.
- PersonaUI afterthought/autonomous follow-up loop.
- Amanuensis Telegram approval queue and social publishing dispatcher.
- ActivityPub federation from Lemmy.
- Full Discourse/Flarum plugin systems, SSO/email ingestion, live chat, and notification engines.
- Forem-style semantic feed generation and complete publishing profile system.
- Next discussion platform saved-posts modal, community membership/admin hierarchy, and image upload pipeline.
