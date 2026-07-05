# PR487 - Global Archive Private Search Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hostile preflight

## Why This Lane

PR486A closed cleanly after ARIADNE passed hosted rehearsal. There is no concrete
Document Migrator defect to repair, and PR485 already completed the requested
Discern companion/UI translation chain:

- companion shortcuts;
- Memory / continuity candidate inbox;
- return-to-thread readback;
- private companion capability/presence prompt context;
- private chat surface polish.

The next distinct launch-core pressure is richer owner-private library/search
depth. The launch-core docs still name Global Archive and private search as a
future product-depth area:

```text
Global archive and private search
```

This lane should make the owner-private library feel more like a useful Station
archive surface, not merely a technical search endpoint. It should also support
the Document Migrator promise by making imported or archived material easier to
find, understand, and safely route onward after it exists.

## Accepted Baseline

Do not reopen these as missing:

- `/imports/archive` exists as an owner-scoped private archive summary.
- `/imports/archive/search` exists as the owner-private archive search route.
- `/studio/archive` exists as the Global Archive owner surface.
- Persona Archive/files, Import Review, Memory inbox, archived chat transcripts,
  persona Memory/Canon, export readback, and Station Assistant operational
  links already exist at protected-alpha levels.
- Public Discover/search and owner-private Studio search must remain separate.
- Gemini/OpenAI embedding/provider decisions, Redis cache role, Cloudflare
  adapter/index-mirror role, live connector setup, and parser/import execution
  are separate lanes unless ARGUS names one as the smallest blocker.

## Candidate Slices

ARGUS should choose one small next slice or reject/defer.

### 1. PR487A - Archive Result Provenance Readback

Make private archive search results easier to trust.

Allowed shape:

- improve `/studio/archive` result cards or helper copy with safe source type,
  visibility, status, persona association, and evidence route labels;
- group results by current source classes such as Memory, Canon, persona files,
  import jobs, archived chats, documents, and Integrity material if already
  available from existing responses;
- link only to existing owner-safe routes;
- preserve public/private search separation.

### 2. PR487A - Archive Empty And Degraded States

Make Global Archive understandable when search is empty, unavailable, or running
without embeddings.

Allowed shape:

- owner-visible empty/degraded readback that answers what is safe, what can be
  added next, and who can see it;
- full-text/metadata fallback copy when semantic/vector retrieval is unavailable
  or sparse;
- no provider/model call, re-embedding, Redis/Cloudflare, or new search backend.

### 3. PR487A - Archive Next-Step Routing

Make search results and archive sections useful without adding new mutation
behavior.

Allowed shape:

- route-only next actions to existing owner surfaces: persona Archive/files,
  Import Review, Memory inbox, export readback, relevant persona page, and
  Station Assistant prompt-prefill if already accepted;
- no automatic Memory/Canon promotion, import execution, AI summarization, or
  document creation.

### 4. Block Or Defer

If a meaningful private archive slice requires new search API shape, migration,
embedding/index rebuild, live connector proof, Redis/Cloudflare work, parser
changes, or a privacy decision, return the exact blocker and the smallest
numbered unblock lane.

## Questions For ARGUS

- Which current route should own PR487A: `/studio/archive`, persona
  Archive/files, Station Assistant, or a combination?
- Can PR487A stay web/helper/test-only over existing responses, or is a small
  API serializer/readback patch truly the smallest useful step?
- Which existing fields can be shown without leaking raw ids, private source
  bodies, filenames that are not already safely rendered, storage paths, parser
  internals, SQL/table details, provider payloads, tokens, cookies, keys, or
  secret-shaped values?
- How should PR487A preserve the public/private search boundary?
- What no-drift tests and hosted rehearsal should be required?

## Guardrails

Do not open:

- live Reddit, Discord, OAuth, API pulls, recurring imports, partner connectors,
  or source-inventory proof;
- new parser behavior, document conversion, PDF/binary extraction, AI
  summarization, provider/model calls, re-embedding, prompt or retrieval
  rewrites;
- Redis/Upstash/Valkey memory truth, Cloudflare retrieval/index mirror,
  queues/workers, durable jobs, realtime, billing, Stripe, auth/session,
  deployment, or migration behavior unless ARGUS names it as the smallest
  unblock;
- broad Studio redesign, public Discover/search changes, public writing,
  public chat behavior, global shell/theme work, or placeholder/unwired
  controls.

Do not expose:

- private source bodies;
- raw owner, persona, source, file, import-job, candidate, thread, document, or
  memory ids;
- storage paths or signed URLs;
- private filenames when not already safely rendered;
- parser internals;
- SQL/table details;
- stack traces;
- provider payloads;
- tokens, cookies, keys, or secret-shaped values.

## Expected ARGUS Output

Return exactly one of:

```text
ACCEPT_PR487A_ARCHIVE_RESULT_PROVENANCE
ACCEPT_PR487A_ARCHIVE_EMPTY_DEGRADED_STATES
ACCEPT_PR487A_ARCHIVE_NEXT_STEP_ROUTING
BLOCKED_UNBLOCK_FIRST
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the exact implementation boundary, touched
files, validation commands, guardrails, and whether ARIADNE hosted rehearsal is
required.

If blocked or ambiguous, wake MIMIR with the concrete blocker or decision point.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR486A closed after ARIADNE passed hosted Document Migrator Archive handoff rehearsal.
- PR485 already completed the Discern companion/UI translation chain, so MIMIR is not reopening a duplicate companion lane.
- MIMIR opened PR487 as the next distinct customer-facing product-depth lane: Global Archive / private search.
Task:
- Hostile-preflight the smallest safe PR487A Global Archive/private search product-depth slice.
- Choose result provenance readback, empty/degraded states, next-step routing, a concrete unblocker, defer, or a MIMIR decision.
- If accepted, wake DAEDALUS with exact implementation boundary, tests, guardrails, and ARIADNE rehearsal requirement.
Guardrails:
- Do not open live connectors, OAuth/API pulls, recurring imports, new parsers, provider/model calls, re-embedding, prompt/retrieval rewrites, Redis/Cloudflare, queues/workers, billing, auth/session, deployment, migrations, public search/public writing/public chat behavior, broad Studio redesign, or placeholder controls unless naming the smallest explicit unblocker.
```
