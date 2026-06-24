# PR279 - Hosted Partial Context Selection Repair

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-24

## Purpose

Repair the remaining hosted runtime answer-quality failure after PR277.

MIMIR keeps full two-anchor recall as the seeded replay acceptance bar. PR278
proved that the hosted deployment is fresh and healthy, but generic hosted
context still selected only one of two accepted anchor concepts and one of two
matching invented retrieval phrases before the provider answer.

This is still a runtime context selection problem unless new evidence proves
otherwise.

## Starting Evidence

PR278 hosted proof:

- Web/API `/health/deployment` were ready on `main` at PR277 implementation
  commit `578e3c7e6802`.
- Replay-owner API auth, protected Studio session, and intended private platform
  replay persona selection passed.
- Sanitized context counts were Canon 3, Memory 3, Integrity 1, Archive 4, and
  Continuity 4.
- Retrieval modes reported as Memory `vector` and Archive `vector`.
- Sanitized context inspection found only one of two accepted concepts and one
  of two matching invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The single hosted chat turn returned HTTP 200, stayed short, avoided raw
  source-body copying, excluded the rejected control, and mirrored the partial
  evidence.

PR277 local proof:

- `packages/ai/src/retrieval/semantic-search.ts` now blends owner-scoped,
  lifecycle-filtered, non-archive lexical Memory candidates with vector Memory
  results before slicing to the requested limit.
- The deterministic runtime context fixture selected both accepted concepts and
  both matching invented retrieval phrases.
- ARGUS accepted the owner/lifecycle/source filters.

The mismatch is now between local deterministic proof and hosted/DB-shaped
generic context selection.

## Questions To Answer

1. Does the hosted-shaped data path actually contain owner-safe active evidence
   for the missing accepted concept and phrase?
2. Does PR277's lexical Memory blend find that missing evidence in a DB-shaped
   fixture, or only in the synthetic deterministic fixture?
3. If the missing candidate is found, where is it dropped: vector/lexical blend,
   dedupe, Memory bucket slicing, owner memory ordering, topology assembly,
   category caps, or prompt assembly?
4. If the missing candidate is not found, why: query tokenization, searched
   fields, candidate pool ordering, score threshold, source/lifecycle filter,
   or missing content in the searchable row shape?
5. Does the fix select both accepted concepts and both matching invented
   retrieval phrases before provider answer while still excluding rejected,
   quarantined, expired, superseded, other-owner, and archive-source Memory?

Use sanitized booleans, counts, categories, and timing buckets. Do not commit
raw ids, source bodies, prompts, provider payloads, hosted logs, SQL, raw
completions, credential values, cookies, or tokens.

## Patch Rule

Patch the narrowest context-selection defect that explains PR278.

Likely files:

- `packages/ai/src/retrieval/semantic-search.ts`
- `packages/ai/src/retrieval/context-builder.ts`
- `packages/ai/test/retrieval-metadata.test.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/api/src/routes/personas.ts`, only if the route-level context-preview
  shape is the missing layer

Acceptable patch shapes include:

- a DB-shaped fixture that reproduces the PR278 hosted partial-context failure;
- lexical candidate search over the right searchable fields if hosted rows store
  the missing evidence outside the current lexical text path;
- coverage-aware reranking or dedupe inside the existing Memory/context
  selection path;
- topology/prompt assembly fixes if selected evidence is present before
  assembly but absent from the prompt.

Do not hardcode the seeded anchor strings, the replay persona, or any hosted
ids. The repair must generalize to owner-safe active evidence selection.

If the investigation proves the missing evidence is not present in owner-safe
active data, do not reseed or mutate hosted data in this PR. Wake MIMIR with
that classification and the exact missing-data evidence shape.

## Non-Scope

Do not change:

- provider routing, embedding model, embedding profile, or vector dimensions;
- database schema, migrations, seeds, imports, Redis, Cloudflare, queues, or
  workers;
- billing, Stripe, public UI, Studio UI, or human-demo flows;
- replay acceptance bar.

Do not run hosted mutation flows except the same bounded chat/context proof
needed for investigation.

## Required Validation

Run the smallest relevant set, and broaden if the patch touches more layers:

```bash
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If route-level API context preview changes, include the focused API route test
that exercises `/personas/:id/context-preview`.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR279_HOSTED_PARTIAL_CONTEXT_SELECTION_REPAIR_RESULT.md
```

Record:

- root cause;
- whether missing evidence was present in owner-safe active data;
- whether PR277 lexical blend found or missed it;
- exact layer where it was dropped, if found;
- patch summary;
- whether generic context now selects both accepted concepts and phrases before
  provider answer in local/DB-shaped proof;
- rejected-control and owner/lifecycle/source-filter status;
- validation commands and results;
- whether MIMIR should open ARIADNE PR280 hosted rerun.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR279 Hosted Partial Context Selection Repair.
- [root cause and patch summary]
Validation:
- [commands and results]
Risk:
- Review owner/lifecycle/source filtering, no hardcoded replay anchors, no scope creep, and no secret/raw-data leakage.
Task:
- Review the patch.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR280 rerun.
```
