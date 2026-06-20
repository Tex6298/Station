# Cloudflare Retrieval Adapter Boundary

Date: 2026-06-09
PR115 inventory update: 2026-06-20

Status: BE-07 adapter contract only. No live Cloudflare Worker, Vectorize index,
or private snippet mirror is enabled. PR115 keeps that posture and treats this
file as the canonical Cloudflare retrieval boundary inventory.

## Current Boundary

- Cloudflare retrieval is disabled unless a later lane explicitly enables a live
  adapter.
- `packages/ai/src/retrieval/cloudflare-adapter.ts` exposes disabled-safe status,
  mirror-payload helpers, and Station/Supabase reauthorization helpers.
- The current adapter returns no remote candidates. Even complete Cloudflare
  config is treated as `remote_adapter_pending` until a live request/privacy
  contract is reviewed.
- Cloudflare is not an authorization authority. Candidate IDs must be fetched
  from Station/Supabase canonical tables and filtered by owner/persona or
  public visibility before private records are returned.

## PR115 Source Pattern Inventory

| Pattern or dependency | Source-side shape | PR115 classification | Station decision |
| --- | --- | --- | --- |
| NESTstack Worker runtime | Worker handles memory runtime and gateway behavior. | Future-only conceptual influence. | Do not add Worker runtime in PR115; Station API remains the retrieval authority. |
| NESTstack D1 memory store | D1 stores durable operational memory beside Vectorize. | Replaced by current Station/Supabase canonical tables. | Do not add D1 or a second canonical private memory store. |
| NESTstack Vectorize recall | Vectorize performs semantic recall and candidate search. | Future-only optional mirror. | Future Vectorize may return IDs/minimal metadata only, followed by Station/Supabase reauthorization. |
| NESTstack Workers AI embeddings | Worker-side embedding generation feeds Vectorize. | Future-only; conflicts with current 1536 profile unless reindexed. | Keep current `station_free_1536` / Supabase pgvector path until a provider/dimension lane is approved. |
| Daemon heartbeat, decay, Durable Objects, alarms | Autonomous runtime loops mutate memory heat/decay. | Future-only and outside retrieval boundary. | No autonomous memory mutation, decay loop, Durable Object, or alarm behavior in PR115. |
| Current Cloudflare adapter contract | Disabled-safe status, minimal mirror payloads, Station reauthorization. | Carried over. | Keep the local interface and tests; no runtime calls until a later lane. |
| Supabase pgvector retrieval | Canonical memory/archive retrieval with owner/lifecycle filters. | Current primary path. | Station/Supabase remains canonical for records, authorization, visibility, lifecycle, delete, export, and reindex. |
| PR113 operational cache | Runtime cache, idempotency, rate-limit, queue-state helper. | Hybrid supplement only. | Redis/Upstash can cache or coordinate, but must not become vector storage or memory truth. |
| PR114 background job foundation | Registry/status/idempotency/retry helpers without execution. | Future support only. | Any future mirror backfill/reindex job must add owner-visible status before execution. |

## Architecture Options

| Option | Pros | Cons | PR115 recommendation |
| --- | --- | --- | --- |
| Station/Supabase-only retrieval | Simplest authority model; existing owner/persona/lifecycle/delete/export checks stay structural; no private query leaves Station. | Less edge-local; scaling and latency improvements depend on Supabase/index tuning. | Keep as current primary path. |
| Cloudflare Worker adapter | Can isolate remote candidate search, hide Vectorize details, and provide edge latency later. | Requires query privacy, auth token, failure-mode, deploy, and callback contracts. | Future-only adapter; disabled until MIMIR opens a live lane. |
| Vectorize ID/minimal-metadata mirror | Fast semantic candidate IDs without mirroring private text; pairs cleanly with Station reauthorization. | Requires delete propagation, stale-index handling, export disclosure, and reindex/backfill semantics. | Best first Cloudflare shape when opened. |
| Redis/Upstash cache around Station retrieval | Useful for short-lived cache, rate limits, idempotency, and queue-state coordination. | Does not solve vector search; unsafe if treated as canonical or as vector storage. | Keep as PR113 operational supplement, not retrieval truth. |
| Mixed Station canonical plus edge mirror | Keeps Supabase authoritative while allowing edge candidate discovery later. | More moving parts: mirror lag, delete/reindex propagation, audit, privacy, and fallback paths. | Preferred hybrid once a concrete replay/latency/public-edge goal exists. |

## Safe Adapter And Index-Mirror Boundary

- Station/Supabase remains canonical for private records.
- Owner, persona, visibility, lifecycle, deletion, export, and reindex checks
  remain Station/Supabase controlled.
- Future Cloudflare candidates are hints only. They must be re-fetched and
  reauthorized through Station before any private record returns.
- Future Vectorize metadata may contain IDs, record type, owner/persona routing,
  visibility-safe source labels, provider/model/dimension/index metadata, and
  timestamps.
- Future Vectorize metadata must not contain private snippets, memory title,
  content, summary, archive-source names, prompts, provider payloads, provider
  keys, auth tokens, or secrets.
- Complete local Cloudflare config still reports `remote_adapter_pending` until
  a live Worker/query privacy contract is reviewed.

## Mirror Payload Rule

Vectorize-style mirror payloads may contain IDs and minimal routing/index
metadata only:

- record ID and record type
- owner ID and persona ID
- source/archive source type labels
- embedding provider/model/dimension/index metadata
- updated timestamp

Mirror payloads must not contain memory `title`, `content`, `summary`,
archive-source names, prompt text, provider keys, auth tokens, or raw private
archive snippets.

## Before Private Snippets

Private snippets must not enter a Cloudflare index until a later MIMIR-opened
lane and ARGUS review define:

- owner-scoped delete propagation from Station/Supabase to Cloudflare
- export semantics that disclose any mirrored private index contents
- reindex/backfill semantics for embedding model or dimension changes
- stale-index handling after persona visibility, memory lifecycle, archive
  deletion, or owner account deletion changes
- audit logging that records IDs and status only, not private text or secrets
- a staging proof that remote candidates are always reauthorized through Station
  before private records are returned

## E2E Setup Asks

- Cloudflare account/project decision.
- Worker URL and token secret names.
- Vectorize index name and dimension contract.
- Remote candidate response shape.
- Privacy decision for whether search queries may be sent to Cloudflare.
