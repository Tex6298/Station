# Cloudflare Retrieval Adapter Boundary

Date: 2026-06-09

Status: BE-07 adapter contract only. No live Cloudflare Worker, Vectorize index,
or private snippet mirror is enabled.

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
