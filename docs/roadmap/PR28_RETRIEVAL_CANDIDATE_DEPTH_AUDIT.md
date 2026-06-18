# PR28 - Retrieval Candidate Depth Audit

Date: 2026-06-18
Status: implemented by A2 / DAEDALUS; ready for ARGUS review
Owner: DAEDALUS audits/implements if needed, ARGUS reviews. ARIADNE is not
needed unless a visible context-preview or Studio search surface changes.

## Purpose

Resolve the PR26 recall-depth caveat before considering Cloudflare, Redis
vectors, or a broader search architecture.

PR26 improved ranking inside the widened fetched candidate pool. It did not
prove corpus-wide lexical recall when exact evidence is buried beyond the
fetched candidate count. PR28 should determine whether that is a real replay
problem and, if it is, patch the smallest Station-native retrieval depth fix.

## Scope

- Audit current archive, memory, and context-preview candidate fetch limits.
- Add a focused fixture where exact replay evidence is present but buried behind
  enough noisy candidates to test the current candidate-depth boundary.
- If the fixture fails, prefer a Station/Supabase-native fix:
  - adaptive lexical fallback;
  - safer candidate pool expansion;
  - source-type or token-aware prefiltering;
  - deterministic two-pass query;
  - or a bounded SQL/RPC change if already supported by the repo.
- Keep trace metadata excerpt-free and owner/operator safe.
- Preserve current Gemini `1536` vector behavior and keyword fallback.

## Explicit Non-Scope

- Do not add Cloudflare retrieval or request Cloudflare config.
- Do not add Redis vector search or Redis memory truth.
- Do not change embedding provider, vector dimensions, or reindex profile.
- Do not add workers or queue infrastructure.
- Do not broaden UI/UX.
- Do not make private snippets public in trace or test docs.

## Cloudflare Decision Boundary

This lane is the evidence step before Cloudflare.

If DAEDALUS can resolve the candidate-depth caveat with Station/Supabase
retrieval, Cloudflare stays deferred.

If DAEDALUS proves Station/Supabase cannot meet the replay need without an
index-mirror/edge adapter, wake MIMIR with:

- the failing fixture name;
- why Station/Supabase cannot solve it narrowly;
- whether an ID-only Cloudflare Vectorize mirror would solve it;
- the privacy review surface ARGUS would need.

Do not implement Cloudflare in PR28.

## Validation

Run the narrow gate touched by the audit/fix:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npx tsx --test packages/ai/test/retrieval-metadata.test.ts
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If no code change is justified, document the fixture/audit result and run the
closest existing retrieval tests plus `git diff --check`.

## ARGUS Review Ask

ARGUS should hostile-review:

- whether the fixture really exercises candidate-depth rather than ranking;
- owner/persona scoping under the deeper candidate path;
- trace privacy;
- performance/limit risk from any expanded candidate pool;
- whether any Cloudflare/Redis/provider claims are overreach.

## Wake Discipline

DAEDALUS should wake ARGUS with:

- audit result;
- fixture name and what it proves;
- behavior changed, if any;
- validation commands/results;
- whether Cloudflare remains deferred or MIMIR needs a concrete decision.

## DAEDALUS Audit Result

Implemented on 2026-06-18.

Finding:

- The PR26 caveat was real for keyword fallback: archive retrieval and memory
  fallback fetched only a minimum `50` relevance-ordered rows before lexical
  scoring. Exact low-weight replay evidence past that boundary could be missed
  even though lexical ranking would have selected it if fetched.
- Station/Supabase can narrow this protected-alpha replay problem without
  Cloudflare, Redis, provider changes, vector-dimension changes, or new workers.

Behavior change:

- `packages/ai/src/retrieval/archive-retrieval.ts` now fetches a bounded `200`
  keyword archive candidate pool before scoring and truncation.
- `packages/ai/src/retrieval/semantic-search.ts` now fetches a bounded `200`
  keyword memory candidate pool before scoring and truncation.
- Vector retrieval, Gemini `1536` profile behavior, trace shape, owner/persona
  filters, lifecycle filters, source authority checks, and excerpt-free trace
  metadata are unchanged.

Fixture proof:

- `archive keyword search finds exact replay evidence buried beyond the old
  candidate pool` creates 70 high-relevance archive distractors and a low-weight
  exact `violet astrolabe` import chunk. The archive route returns the buried
  exact chunk and keeps trace metadata excerpt-free.
- `keyword memory fallback finds exact replay anchor buried beyond the old
  candidate pool` creates 70 high-relevance memory distractors and a low-weight
  exact `golden astrolabe` memory. Package-level keyword fallback searches more
  than 50 rows and returns the buried exact anchor without exposing private
  content in trace metadata.

Cloudflare decision:

- Cloudflare remains deferred. PR28 did not produce evidence that an
  index-mirror/edge adapter is required for the protected-alpha replay need.
- Remaining caveat: this is a bounded Supabase-native candidate-depth expansion,
  not corpus-wide lexical search. Evidence buried beyond the `200` candidate
  pool remains future search/index design work.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 6 tests passed; runtime context stayed owner-scoped. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 29 tests passed, including the new buried archive exact-evidence fixture. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 4 tests passed. |
| `npx tsx --test packages/ai/test/retrieval-metadata.test.ts` | Pass | 8 tests passed, including the new buried memory fallback fixture. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass | API package build and dependent package builds passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## ARGUS Review - 2026-06-18

Verdict: accepted for MIMIR closeout.

ARGUS reviewed candidate-depth proof, owner/persona scoping under the wider
pool, trace privacy, performance/limit risk, and the Cloudflare-deferred claim.

Accepted behavior:

- The new archive fixture places the `violet astrolabe` exact chunk behind 70
  higher-relevance archive distractors, so the old `50` candidate minimum would
  not have fetched it for lexical scoring.
- The new memory fixture places the `golden astrolabe` exact memory behind 70
  higher-relevance memory distractors and asserts `trace.searched > 50`, so it
  proves candidate depth rather than only lexical tie-breaking.
- Owner/persona filters still run in the Supabase query before the 200-row pool
  is fetched.
- Trace metadata remains excerpt-free; the new tests assert private anchor text
  is not copied into trace output.
- The performance risk is bounded for protected alpha: keyword fallback may now
  fetch up to 200 rows of scoped memory/archive text, but it remains finite and
  does not alter vector retrieval, provider routing, dimensions, workers, Redis,
  or Cloudflare.

Caveat:

- PR28 resolves the observed protected-alpha miss inside a wider 200-row
  relevance-ordered pool. Evidence buried beyond that pool still belongs to a
  future lexical/search/index design lane.

Validation rerun by ARGUS:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 6 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 29 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass, 4 tests. |
| `npx tsx --test packages/ai/test/retrieval-metadata.test.ts` | Pass, 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` | Pass. |
| `git diff --check` | Pass, CRLF warnings only. |
| `git diff --cached --check` | Pass. |

No DAEDALUS blocker remains. Cloudflare remains deferred because PR28 does not
show a concrete need for an edge index mirror. ARIADNE rehearsal is not required
because this is backend retrieval behavior, not a visible UI workflow.
