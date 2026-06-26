# PR371 - Hosted Embedding Trace Data Proof

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: DAEDALUS. ARGUS reviews if code changes. ARIADNE rehearses if a hosted
trace can be produced or after any accepted patch deploys.
Status: completed by DAEDALUS; awaiting ARGUS review.

## Why This Lane

PR370 passed the hosted human route through Settings -> AI Activity -> trace
detail, but with a data-shape caveat: the six available hosted trace details
did not contain embedding metadata.

That means PR369's safety fix is locally tested and privacy-reviewed, and the
hosted route is healthy, but the exact live readback of
`Embedding profile`, `Embedding provider`, `Embedding model`, and
`Embedding dimension` was not human-eye proven on Railway data.

Do not close this by assumption. Produce or identify the smallest safe trace
path that carries embedding metadata.

## Goal

Create enough evidence for ARIADNE to inspect a live hosted trace detail that
contains explicit embedding readback fields.

The owner-visible result should make these facts true:

- Gemini embeddings appear as embedding facts, not generic chat provider facts.
- Gemini chat is not implied or activated.
- Trace detail remains sanitized: no secrets, raw prompts, provider payload
  bodies, raw URLs, private ids, owner ids, SQL, stack traces, or secret-shaped
  values.

## Scope

DAEDALUS should inspect the current AI observability and retrieval paths that
can emit embedding metadata, especially:

- trace detail serialization in `apps/api/src/services/ai-observability.service.ts`;
- AI Activity routes and tests;
- retrieval/context-preview/persona-context routes that use embedding profiles;
- existing replay-readiness and embedding metadata tests;
- any seed or staging replay route that can safely create synthetic hosted
  trace data without private archive text.

Patch only if there is an actual instrumentation/readback gap. Good outcomes
include:

- no code patch: identify an existing safe route that creates an embedding
  metadata trace, then wake ARIADNE with exact hosted rerun steps;
- tiny code patch: add missing embedding trace metadata to an already covered
  retrieval/context path, then wake ARGUS with focused validation;
- tiny fixture/test patch: add or adjust a safe synthetic trace fixture if
  live hosted data cannot otherwise exercise the PR369 readback.

## Non-Scope

Do not add:

- Gemini chat;
- provider marketplace;
- paid model selection;
- new provider config/secrets;
- embedding reindex/backfill;
- Cloudflare retrieval;
- Redis Memory truth;
- worker/queue infrastructure;
- billing/schema/migration changes;
- broad Settings or AI Activity redesign;
- private archive ingestion for this proof.

## Acceptance

Pass when one of these is true:

1. DAEDALUS identifies a current safe hosted route that generates an AI trace
   detail with embedding metadata and wakes ARIADNE with exact steps.
2. DAEDALUS patches a narrow instrumentation/readback gap, validates it, and
   wakes ARGUS for review.

The final proof must show:

- explicit embedding fields are available in trace detail data;
- `Provider gemini` is not produced from embedding metadata;
- no private or secret-shaped material is returned or rendered;
- no provider activation/config behavior changes.

## Validation

If code changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:health
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If docs/procedure only:

```bash
git diff --check
```

## Handoff

If DAEDALUS finds an existing route, wake ARIADNE with:

- hosted route steps;
- safe input text if a trace-generating action is needed;
- expected embedding labels;
- privacy checks to repeat.

If DAEDALUS patches code, wake ARGUS with:

- changed files;
- exact instrumentation/readback gap closed;
- validation results;
- proof no secrets/private payloads are exposed;
- proof Gemini chat/provider activation was not added.
