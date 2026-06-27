# Prep lane audit

Audited against the prepared Station product documents and the current repo state. This document exists to prevent prep-lane summaries from overstating what has actually landed.

## Rule of interpretation

- **Protected alpha** means schema/routes/UI/test coverage exists for a narrow loop.
- **Beta candidate** means the loop is visible to users and mostly coherent, but not fully polished.
- **Reopened** means the lane exists only partially or prior wording could be read as more complete than the implementation proves.
- **Future/open** means no meaningful product slice is proven in this repo yet.

2026-06-27 reconciliation: this audit remains conservative, but it must not
override `STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md` or `ACTIVE_STATUS.md`.
PR397-PR399 close the publish-and-retract public-writing loop and Station
Assistant action-map loop for protected-alpha replay. They do not close
production readiness, hard-delete cleanup, or full MVP scope.

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
| Studio continuity store | Protected alpha | Memory, Canon, Archive, Integrity, owner-only Global Archive search, and Station Assistant route-through use real APIs and appear in the Studio/persona workspace. | Stronger Integrity workflows, richer private library/archive UX, and mobile-first Studio polish. |
| Persona runtime context | Protected alpha | Canon, Integrity, Memory, archive references, and recent chat history are connected to runtime context and owner preview. | Topology-aware weighting, production embedding/indexing, context budgets, token/provider quotas, and provider hardening. |
| Conversation archive flow | Protected alpha | Active chats archive into transcript records and Memory/Canon candidates; archived chats are read-only; owner accept/edit/reject exists. | Soft-limit prompts, transcript-as-library/document presentation, better LLM-assisted candidate extraction, and review UX polish. |
| Continuity publication | Protected alpha | Canon, Integrity, archive file, and archive import sources can create separate published copies with provenance; source rows stay private. | Rich editorial workflow, codex/version semantics, field-log series, and drafting/review tools. |
| Document discussions | Protected alpha | Published documents can attach discussion threads with public/community/unlisted visibility enforcement. | Richer discussion UX and community/reputation/moderator expansion beyond protected-beta closure. |
| Export trust | Protected alpha | Owner-only export package records, JSON/Markdown manifest preview, and portable bundle readback include persona, continuity, archive metadata, published refs, provenance, and discussion refs. | Full workspace/PDF/binary exports, original file packaging, background jobs, expiry policy, backup/redundancy, and Station Press. |
| Imports / external archive intake | Protected alpha for manual intake; live connectors future | Four onboarding route paths, pasted/uploaded archive import, Reddit and Discord uploaded/pasted intake, fail-closed parser behavior, Import Review Inbox, and extraction-to-candidates are proven for replay. | Live Reddit/Discord OAuth/API intake, recurring pulls, broader ChatGPT/Claude parser polish, and mature onboarding wizard depth. |
| Native documents | Protected alpha | Private draft authoring/readback, approval queue, public Space document readback, linked discussion readback, and retract-to-private hiding are proven for replay. | Rich editor, full document type model, codex versioning, field logs, research docs, archive notes, SEO/OpenGraph, scheduling, and broader authored drafting UX. |
| Community forums | Protected beta | PR108 found no protected-beta closure blockers across forum/community visibility, creation, document discussions, moderation/reporting, review requests, notifications, subcommunities, delegated moderation, witness controls, and private recognition readback. | Richer community/reputation/moderator surfaces, broader launch polish, and any production-scale community operations. |
| Search/retrieval | Protected alpha for private archive/runtime retrieval; production/public search reopened | Runtime memory search has embedding and keyword fallback paths, owner-only Global Archive/private archive search is routeable, and public document/Space readback uses visibility-safe route surfaces. | Production vector hardening, public/community full search, Developer Space search depth, ranking explainability, and broader visibility-safe result pages. |
| Station Assistant | Protected alpha | Owner-scoped non-persona operational action map points to real archive, import review, publishing, continuity/integrity, export, quota, and setup surfaces, with PR399 publish-and-retract guidance. | Autonomous execution is not accepted; richer analytics, Space editing depth, and future workflow automation need separate lanes. |
| Platform operations | Partial / reopened | CI/build/test enforcement and cache/idempotency/rate-limit style operational support exist at accepted proof levels. | Durable deployed workers, queue execution, WebSocket/SSE production realtime, usage tracking, limits, job failure recovery, notifications, backup/restore drills. |
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
8. Persona archive -> owner-only export manifest/bundle readback.
9. Four alpha onboarding route paths -> real route targets.
10. Manual Reddit/Discord/archive intake -> private archive -> import review.
11. Private archive search -> owner-only Global Archive readback.
12. Creator-capable draft -> approval publish -> public document/linked discussion -> retract-to-private.
13. Station Assistant -> owner-safe operational action map.

Reopened loops:

1. Remote deployment truth.
2. Mature onboarding wizards, Document Migrator, and API Bridge product depth.
3. Rich native authoring/versioning beyond protected-alpha publish/retract.
4. Richer community/reputation/moderator expansion beyond protected beta.
5. Production vector retrieval plus public/community/Developer Space search depth.
6. Autonomous Assistant workflows, if ever desired.
7. Live Reddit/Discord OAuth/API intake and recurring pulls.
8. Durable workers, realtime, usage tracking, limits, and backup posture.
9. Partner-ready Developer Spaces.
10. Full workspace/PDF/binary export and archive redundancy.
