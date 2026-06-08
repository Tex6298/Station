# Prep lane audit

Audited against the prepared Station product documents and the current repo state. This document exists to prevent prep-lane summaries from overstating what has actually landed.

## Rule of interpretation

- **Protected alpha** means schema/routes/UI/test coverage exists for a narrow loop.
- **Beta candidate** means the loop is visible to users and mostly coherent, but not fully polished.
- **Reopened** means the lane exists only partially or prior wording could be read as more complete than the implementation proves.
- **Future/open** means no meaningful product slice is proven in this repo yet.

## What must not be overstated

The current repo should not be described as any of the following without qualification:

- finished Station MVP
- finished Community Beta
- finished onboarding system
- finished archive system
- partner-ready Developer tier
- production-ready export/backup system
- remote deployment green, unless external status confirms it

## Audited lane table

| Lane | Conservative status | What is proven | What remains open |
| --- | --- | --- | --- |
| Repo validation | Protected, remote status separate | Install, typecheck, protected smoke tests, API build, and full build are represented in scripts/CI. | Remote deployment status must be verified independently. |
| Developer Spaces | Protected alpha | Developer Space schema, hashed ingestion key flow, node/event/snapshot ingest, public observatory, owner-only management/raw visibility protection. | Realtime subscriptions, scheduled jobs, project abstraction, quotas/rate limits, partner docs, raw export tools, and hardened visualisation config. |
| Public Spaces | Beta candidate | Authored microsite-style public Space surface, bounded presentation config, owner controls, Discover surfacing, and smoke coverage. | Richer pages/media/gallery handling, public persona cards/interactions, stronger template editing, and mobile visual polish. |
| Studio continuity store | Protected alpha | Memory, Canon, Archive, and Integrity use real APIs and appear in the persona workspace. | Station Assistant, global private library, stronger Integrity workflows, and mobile-first Studio polish. |
| Persona runtime context | Protected alpha | Canon, Integrity, Memory, archive references, and recent chat history are connected to runtime context and owner preview. | Topology-aware weighting, production embedding/indexing, context budgets, token/provider quotas, and provider hardening. |
| Conversation archive flow | Protected alpha | Active chats archive into transcript records and Memory/Canon candidates; archived chats are read-only; owner accept/edit/reject exists. | Soft-limit prompts, transcript-as-library/document presentation, better LLM-assisted candidate extraction, and review UX polish. |
| Continuity publication | Protected alpha | Canon, Integrity, archive file, and archive import sources can create separate published copies with provenance; source rows stay private. | Rich editorial workflow, codex/version semantics, field-log series, and drafting/review tools. |
| Document discussions | Protected alpha | Published documents can attach discussion threads with public/community/unlisted visibility enforcement. | Full forum/community beta, subcommunities, moderation queue, appeals, notifications, and recognition/witness mechanics. |
| Export trust | Protected alpha | Owner-only export package records and JSON/Markdown manifest preview include persona, continuity, archive metadata, published refs, provenance, and discussion refs. | Downloadable bundles, original file packaging, background jobs, expiry policy, backup/redundancy, and Station Press. |
| Imports / external archive intake | Partial / reopened | Pasted text/chat import into archive exists. | Four onboarding paths, Reddit import, ChatGPT/Claude/Discord parsers, recurring pulls, import review, and extraction-to-candidates. |
| Native documents | Partial / reopened | Document CRUD and publish-from-continuity routes exist. | Rich editor, full document type model, codex versioning, field logs, research docs, archive notes, SEO/OpenGraph, and authored drafting UI. |
| Community forums | Partial / reopened | Forum category/thread/comment primitives exist and document discussions use them. | Full launch category UX, tiered participation, subcommunities, moderation tools, appeals, notifications, and forum smoke coverage. |
| Search/retrieval | Partial / reopened | Runtime memory search has embedding and keyword fallback paths. | User-facing private search, public/community search, Developer Space search, archive search, and visibility-safe result pages. |
| Station Assistant | Not started / reopened | No dedicated non-persona operational assistant loop is proven. | Guided archive, publish, Space editing, analytics, export, and onboarding workflows. |
| Platform operations | Partial / reopened | CI/build/test enforcement exists. | Background jobs, Redis/WebSocket/SSE realtime, usage tracking, limits, job failure recovery, notifications, backup/restore drills. |
| Project/institutional ownership | Future / open | Developer Spaces and Spaces are still user-owned. | Projects, collaborators, roles, institutional Spaces, and project-level usage/quotas. |
| Station Press | Future / open | No print/PDF/physical archive workflow is proven. | PDF assembly, print preview, print-on-demand integration, order handling, physical archive workflow. |

## Future lane integration

`docs/roadmap/STATION_FUTURE_LANES.md` is the planning bridge for the next
sequence after staging setup:

- Merge the upstream memory/observability work into the active Railway fork
  without regressing deployment.
- Clear Supabase migrations, the private `persona-files` bucket, and Supabase
  Auth redirects before claiming staged replay readiness.
- Keep OpenAI 1536-dimensional embeddings as the current retrieval path.
- Treat NVIDIA chat as dev/staging provider work first.
- Treat Redis as cache/queue infrastructure only.
- Treat Cloudflare as an adapter or index mirror unless a separate privacy
  review accepts a deeper role.

## Corrected summary

Closed/protected alpha loops:

1. External project data -> Developer Space observatory.
2. Space config -> authored microsite surface.
3. Memory/Canon/Archive/Integrity -> continuity store.
4. Continuity store -> persona runtime context.
5. Active chat -> archived transcript -> continuity candidates.
6. Continuity artifact -> separate published document with provenance.
7. Published document -> discussion thread.
8. Persona archive -> owner-only export manifest.

Reopened loops:

1. Remote deployment truth.
2. Four onboarding paths.
3. Native authoring/versioning.
4. Full forum/community beta.
5. Search and archive retrieval.
6. Station Assistant workflows.
7. External archive intake.
8. Jobs, realtime, usage tracking, limits, and backup posture.
9. Partner-ready Developer Spaces.
10. Portable export bundles and archive redundancy.
