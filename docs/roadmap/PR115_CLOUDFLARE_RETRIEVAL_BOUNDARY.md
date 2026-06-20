# PR115 - Cloudflare Retrieval Boundary

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS inventories or implements only safe local boundaries, ARGUS
reviews authorization/index-content risk. ARIADNE rehearses only if visible
route behavior changes.
Status: open for DAEDALUS

## Why This Lane

BE-07 is Cloudflare retrieval adapter, but the roadmap explicitly defers
Cloudflare adapter work unless a concrete replay objective forces a bounded
lane. The concrete need here is not Cloudflare deployment yet. It is preventing
drift: Station needs a precise account of Cloudflare-oriented retrieval patterns
from imported/source repos, whether those patterns were carried into this repo,
and what the safe adapter boundary would be if/when Cloudflare becomes useful.

No Cloudflare account, token, Worker, Queue, or Vectorize config is required for
PR115.

## Goal

Document and, where safe locally, encode the Cloudflare retrieval boundary:
Cloudflare can be an adapter or index mirror, never the source of authority for
private Station records.

Canonical records must remain in Station/Supabase until an explicit later lane
changes that with ARGUS approval.

## Scope

DAEDALUS should implement or precisely block:

- inventory Cloudflare-dependent retrieval patterns referenced by imported or
  source-side work already present in this repo;
- identify whether each dependency/pattern was carried over, replaced by current
  Supabase/pgvector/Gemini/cache/job foundations, or remains future-only;
- document pros, cons, and hybridization options for:
  - Station/Supabase-only retrieval;
  - Cloudflare Worker as adapter;
  - Cloudflare Vectorize as ID/minimal-metadata mirror;
  - Redis/Upstash cache around Station retrieval;
  - mixed Station canonical records plus Cloudflare edge mirror;
- add a small local interface/type/test boundary only if the current code has a
  natural seam for it; otherwise keep this as docs plus precise blockers;
- define what may enter a future Cloudflare index: IDs, visibility-safe minimal
  metadata, provider/index metadata, and no private snippets until delete/export/
  reindex semantics are accepted;
- define delete/export/reindex obligations before Cloudflare stores private or
  user-derived text;
- define auth flow: Station/Supabase owner and visibility checks remain the
  authority before canonical record fetch.

## Non-Scope

Do not add:

- Cloudflare Workers;
- Cloudflare Queues;
- Cloudflare Vectorize runtime calls;
- Cloudflare credentials or environment variables;
- Cloudflare deployment scripts;
- moving canonical records out of Supabase;
- storing private archive snippets in Cloudflare;
- changing active retrieval provider, ranking, embedding generation, or vector
  backend;
- Redis vector storage;
- background job execution;
- public/private visibility changes;
- broad UI work;
- provider key, prompt, payload, archive excerpt, or secret logging.

## ARGUS Review Requirements

ARGUS should verify:

- Cloudflare is not made authoritative for private records;
- any proposed index/mirror contents avoid private snippets unless explicitly
  deferred behind delete/export/reindex acceptance;
- owner/visibility checks remain Station/Supabase-controlled;
- imported/source repo dependencies are identified as carried-over, replaced, or
  future-only;
- pros/cons and hybrid options are clear enough for MIMIR to decide when actual
  Cloudflare config is worth requesting;
- no Cloudflare credentials or deployment behavior are added;
- validation passed.

No ARIADNE rehearsal is required if this remains docs/types/tests only. If any
visible route behavior changes, ARGUS should wake ARIADNE after technical
acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Run focused retrieval/cache/job tests if any local interface or helper touches
those areas.
