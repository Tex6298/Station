# PR13 Cloudflare / NESTstack Decision Packet

Date: 2026-06-17
Status: draft for MIMIR
Owner: MIMIR / A1
Reference repo: `cindiekinzz-coder/NESTstack`

## Why This Exists

Marty asked whether the Cloudflare-native idea borrowed from NESTstack is
actually covered by Station's current deferred Cloudflare posture.

Answer: Station's current plan is enough if NESTstack is only conceptual
influence. It is not enough if Station expects NESTstack-style semantic
emotional recall, heat/decay, or Cloudflare-native memory behavior to work as
intended.

This packet does not open implementation by itself. MIMIR should decide when,
or whether, Station is ready to make Cloudflare live.

## What NESTstack Actually Depends On

NESTstack is not merely deployable on Cloudflare. Its intended runtime uses
Cloudflare primitives as part of the design:

- Workers as the public/gateway and memory runtime.
- D1 as the durable operational memory store.
- Vectorize as semantic recall/search.
- Workers AI for embeddings.
- Durable Objects / alarms / cron-style loops for heartbeat and decay.
- Optional R2 for vault/journal-style storage.

Concrete files inspected:

- `docs/ARCHITECTURE.md`
- `NESTeq/workers/ai-mind/src/memory.ts`
- `NESTeq/workers/ai-mind/src/shared/embedding.ts`
- `NESTeq/workers/ai-mind/wrangler.toml.example`
- `NESTknow/README.md`

The memory code writes durable rows to D1 and then best-effort embeds into
Vectorize. D1 writes can survive Vectorize failure, but semantic recall,
EQ search, NESTknow reranking, and heat-style knowledge retrieval depend on a
real embedding/index path.

## Station's Current Position

Station currently has a safer Supabase-first path:

- Supabase remains canonical for private archive, memory, visibility,
  lifecycle, deletion, export, and owner authorization.
- `station_free_1536` / Gemini-backed embeddings are the selected near-term
  product-testing profile.
- PR12 private archive search proves owner-scoped backend search on Station API
  and Supabase before adding external retrieval infrastructure.
- `packages/ai/src/retrieval/cloudflare-adapter.ts` is a disabled-safe adapter
  boundary only.
- Even complete Cloudflare env config still reports `remote_adapter_pending`
  today.
- There is no live Worker, D1 binding, Vectorize binding, Wrangler config, SDK,
  runtime route, or Cloudflare network call in current Station runtime.

This is sensible for launch-core safety, but it means Station has not yet
implemented NESTstack-style Cloudflare memory.

## Decision

MIMIR may keep Cloudflare deferred until Station has a concrete retrieval,
latency, cost, public/edge, or NESTstyle-memory reason to open it.

When Station is ready, MIMIR should open a dedicated Cloudflare lane rather than
slipping Cloudflare into an unrelated PR.

Recommended initial architecture:

- Keep Supabase as canonical truth.
- Use a Cloudflare Worker as an adapter only.
- Use Vectorize as an ID-only or minimal-metadata candidate index first.
- Return candidate IDs from Cloudflare.
- Re-fetch records through Station API / Supabase.
- Apply owner, persona, visibility, lifecycle, deletion, and export checks in
  Station before any private record returns.
- Do not mirror private snippets until ARGUS accepts the query/privacy,
  deletion/export, stale-index, audit, and reindex contracts.

## What To Ask Marty For Later

Do not ask Marty for Cloudflare configuration until MIMIR has decided this lane
is ready to become live or prototype-live.

When ready, ask Marty for:

- Cloudflare account/project choice and owner.
- Whether the first target is public/Discover retrieval, private Studio
  retrieval, or prototype-only.
- Whether private user queries may be sent to Cloudflare at all.
- Worker name and deployment target.
- Worker URL after deployment, or permission to use the default `workers.dev`
  URL for prototype.
- Worker auth-token approach and rotation expectations.
- Vectorize index name, dimensions, metric, and metadata-filter plan.
- Whether the index stores IDs/minimal metadata only, or whether ARGUS should
  review a private-snippet mirror proposal.

A custom website/domain is not required for the prototype. Cloudflare Workers
can run on a default `workers.dev` URL. Railway public URLs can remain the
Station web/API origins, and the Worker can call back to the Railway API.

## ARGUS Gates Before Enabling

- No private snippets, prompts, raw archive text, source names, secrets, tokens,
  or provider keys in Vectorize metadata unless explicitly approved later.
- Candidate IDs are always reauthorized through Station/Supabase before private
  records return.
- Owner/persona/visibility/lifecycle filters are structural and tested.
- Deleted, expired, rejected, quarantined, superseded, or owner-deleted records
  cannot return through stale Cloudflare candidates.
- Export semantics disclose any external mirrored index contents.
- Reindex/backfill behavior is defined for provider/model/dimension changes.
- Query logging and audit logs store IDs/status only, not private text.
- Cloudflare failure degrades safely to Station/Supabase behavior.

## DAEDALUS Scope If Opened

First implementation slice should be deliberately small:

- Add Worker project scaffold and Wrangler config.
- Create Vectorize binding and typed candidate response shape.
- Add Station-side client that calls the Worker only when explicitly enabled.
- Keep adapter disabled by default.
- Add tests for disabled mode, missing config, candidate reauthorization,
  stale/deleted/lifecycle-filtered candidates, and safe fallback.
- Do not replace PR12 private archive search or Supabase pgvector retrieval in
  the same slice.

## Explicit Non-Goals

- Do not turn Station into NESTstack.
- Do not replace Supabase as canonical private memory truth by accident.
- Do not add D1 as a second private archive source of truth without a separate
  architecture decision.
- Do not enable Gemini/Workers AI/Vectorize mixed-dimension storage without a
  reindex and provider-dimension lane.
- Do not make Cloudflare a launch blocker unless MIMIR names a specific
  Cloudflare replay objective.

## Suggested Wakeup When MIMIR Is Ready

Use this only after the current active PR12 handoff is closed or MIMIR chooses
to interrupt it intentionally.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- Marty asked for the Cloudflare/NESTstack decision packet.
- docs/roadmap/PR13_CLOUDFLARE_NESTSTACK_DECISION.md records that Station's
  current Supabase-first path is enough for launch-core safety, but not enough
  to claim NESTstack-style Cloudflare memory/runtime behavior.
- Cloudflare should remain deferred until you decide Station has a concrete
  retrieval, latency, cost, public/edge, or NESTstyle-memory reason to open it.
Task:
- Decide when, or whether, to open PR13 as a real Cloudflare adapter/prototype
  lane.
- If opening it, ask Marty for Cloudflare account/project, Worker URL or
  workers.dev prototype permission, Worker auth-token approach, Vectorize index
  name/dimension/metric, target retrieval surface, and private-query policy.
- Keep Supabase canonical and require ARGUS gates before enabling private
  Cloudflare retrieval.
```
