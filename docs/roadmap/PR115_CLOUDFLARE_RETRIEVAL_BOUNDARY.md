# PR115 - Cloudflare Retrieval Boundary

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS inventories or implements only safe local boundaries, ARGUS
reviews authorization/index-content risk. ARIADNE rehearses only if visible
route behavior changes.
Status: closed by MIMIR on 2026-06-20

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

## DAEDALUS Result - 2026-06-20

Implemented as an inventory and boundary-tightening lane. No Cloudflare runtime,
credential, Worker, Queue, Vectorize call, deployment script, route behavior, UI,
retrieval provider/ranking, embedding backend, Redis vector storage, background
execution, or visibility behavior changed.

Files changed:

- `packages/ai/test/cloudflare-adapter.test.ts`
- `docs/architecture/cloudflare-retrieval-adapter.md`
- `docs/roadmap/PR115_CLOUDFLARE_RETRIEVAL_BOUNDARY.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `package.json`

Dependency inventory:

- Carried over: the existing disabled-safe `@station/ai` Cloudflare retrieval
  adapter contract, minimal mirror payload helper, and Station/Supabase
  candidate reauthorization helper.
- Replaced by current Station foundations: D1/canonical memory storage is
  replaced by Supabase canonical tables; Cloudflare semantic recall is replaced
  for now by Supabase pgvector plus `station_free_1536`; Redis/Upstash vector
  ideas are replaced by PR113 operational cache roles only; execution jobs are
  replaced by PR114 status/idempotency foundations until future lanes.
- Future-only: Worker runtime, Vectorize live search, Workers AI embeddings,
  Durable Objects/alarms/heartbeat decay, private snippet mirrors, Cloudflare
  query privacy policy, delete/export/reindex propagation, and deployment
  configuration.

Safe boundary proof:

- `docs/architecture/cloudflare-retrieval-adapter.md` now documents pros, cons,
  and hybrid options for Station/Supabase-only retrieval, Worker adapter,
  Vectorize ID/minimal-metadata mirror, Redis/Upstash cache around Station
  retrieval, and mixed Station canonical plus edge mirror.
- The safe boundary keeps Station/Supabase canonical for records, owner/persona
  authorization, visibility, lifecycle, deletion, export, and reindex.
- Future Cloudflare candidates remain hints only and must be re-fetched and
  reauthorized through Station/Supabase before private records return.
- Future index metadata may contain IDs and minimal visibility-safe routing and
  embedding metadata only; private snippets, titles, content, summaries, source
  names, prompts, provider payloads, provider keys, tokens, and secrets remain
  barred until a later ARGUS-reviewed lane accepts delete/export/reindex
  semantics.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:cloudflare-retrieval` | Pass | 4 tests passed, including disabled mode, complete-config pending/non-secret status, mirror minimization, and Station/Supabase reauthorization. |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass | 8 tests passed; active retrieval metadata and fallback boundaries stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:cache` | Pass | 5 tests passed; PR113 operational-cache supplement boundaries stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:jobs` | Pass | 5 tests passed; PR114 job foundation boundaries stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

ARGUS review ask:

- Verify Cloudflare remains non-authoritative.
- Verify complete local config still stays `remote_adapter_pending` and does not
  expose worker URL or API token in status.
- Verify the inventory classification is clear enough for MIMIR to decide
  whether and when a live Cloudflare lane is worth opening.
- Verify non-scope stayed intact.

## ARGUS Review

Accepted by ARGUS on 2026-06-20 for MIMIR closeout.

ARGUS confirmed that PR115 stays inventory/boundary-only: no Cloudflare runtime,
credentials, Worker/Vectorize calls, deployment scripts, or canonical record
migration. Complete local Cloudflare config still reports
`remote_adapter_pending`, returns no candidates, and does not expose Worker URL
or API token.

ARGUS validation passed:

- `npm exec --yes pnpm@10.32.1 -- run test:cloudflare-retrieval`
- `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata`
- `npm exec --yes pnpm@10.32.1 -- run test:cache`
- `npm exec --yes pnpm@10.32.1 -- run test:jobs`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `git diff --check`

ARGUS confirmed Cloudflare remains non-authoritative; Station/Supabase remains
canonical for records, owner/persona authorization, visibility, lifecycle,
deletion, export, and reindex. Future Vectorize contents are limited to IDs and
minimal visibility-safe routing/embedding metadata until a later lane accepts
private snippet, delete, export, and reindex semantics.

## MIMIR Closeout

MIMIR closes PR115 on 2026-06-20 as the Cloudflare retrieval boundary.

The next lane is BE-08 replay-driven optimization. Start with ARIADNE human
rehearsal on staging, because optimization must be based on actual online
behavior and concrete journey evidence.
