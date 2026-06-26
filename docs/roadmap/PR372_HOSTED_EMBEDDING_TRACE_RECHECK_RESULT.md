# PR372 - Hosted Embedding Trace Recheck Result

Date: 2026-06-26
Owner: ARIADNE
Status: PASS

## Verdict

PASS.

The hosted replay-owner route now proves the PR371 data-shape fix in the live
human view. The newest generated conversation trace detail shows explicit
embedding metadata as embedding facts, not as a generic chat-provider claim.

## Hosted Freshness

- Hosted web was ready at commit prefix `b9459d84`.
- Hosted API was ready at commit prefix `b9459d84`.
- Both prefixes match the PR371 product commit required by the PR372 packet.

## Route Rehearsed

- Signed in as the replay owner using local ignored credentials only.
- Loaded `/studio`.
- Opened a private replay persona chat route from Studio.
- Sent one safe synthetic chat turn from the PR372 packet.
- Loaded `/settings`.
- Opened `AI Activity` -> `Recent traces`.
- Opened the newest generated conversation trace detail.

## Visible Readback

The trace detail view showed:

- `Embedding profile station_free_1536`
- `Embedding provider gemini`
- `Embedding model gemini-embedding-2`
- `Embedding dimension 1536`

The trace view did not show generic `Provider gemini` from the embedding
metadata.

## Safety And Scope

- No Gemini chat activation, Gemini chat copy, provider marketplace copy, or
  paid-provider selection copy was visible.
- No provider keys, raw network locations, prompt bodies, completions, provider
  payload bodies, vectors, private archive text, owner ids, raw trace ids, SQL,
  stack traces, or secret-shaped values were visible.
- No Gemini chat, provider marketplace, provider config, embedding
  reindex/backfill, Cloudflare retrieval, Redis Memory truth, billing, schema,
  migration, worker, queue, Railway config, Supabase config, or private archive
  ingestion work was opened.

## Validation

| Check | Result |
| --- | --- |
| Hosted replay-owner Playwright proof | Pass |
| `git diff --check` | Pass |
