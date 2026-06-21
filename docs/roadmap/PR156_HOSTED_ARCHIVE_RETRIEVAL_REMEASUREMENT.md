# PR156 - Hosted Archive Retrieval Remeasurement

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE measures hosted runtime; MIMIR decides the next lane.
Status: open for ARIADNE

## Why This Lane

PR154 measured hosted context-preview timing and identified
`archive_retrieval` as the dominant stage: median 3207ms versus trace `total`
median 3549ms.

PR155 then batched Archive candidate lifecycle and source citation validation
while preserving owner/persona scope, lifecycle skip reasons, source readiness,
candidate order, scoring, source caps, max chunks, max characters, and citation
reasons. ARGUS accepted the hostile owner/privacy review.

The next move is hosted remeasurement. Do not open a second optimization lane
until the deployed runtime proves whether PR155 improved the stage that PR154
identified.

## Baseline To Compare

PR154 hosted baseline:

- outer request median: 4571ms
- outer request max / rough p95: 4993ms
- trace `total` median: 3549ms
- `archive_retrieval` median: 3207ms
- `archive_retrieval` max / rough p95: 3259ms
- `query_embedding` median: 372ms
- `memory_vector_search` median: 747ms
- `continuity` median: 188ms
- `topology_prompt_assembly` median: 0ms
- retrieval shape: Memory vector, Archive vector, no Memory fallback,
  Gemini `station_free_1536`, 3 Memory searched, 12 Archive searched,
  4 Continuity searched, 5 quarantined Archive skips

## Scope

ARIADNE should:

- verify API and web `/health/deployment` before measurement and record served
  commit prefixes;
- confirm the served API includes PR155 batch-validation code, or record a
  deployment-lag result and wake MIMIR without inventing optimization work;
- sign in as the replay owner without printing tokens, cookies, credentials, or
  raw IDs;
- select the same replay persona shape used in PR154 where possible;
- run one warm-up context-preview request that is not counted;
- run seven counted authenticated context-preview requests using the same
  generic safe query shape as PR154;
- record only HTTP status, total request latency, retrieval modes/counts,
  source bucket counts, searched/skipped counts, failure state, and sanitized
  `context.trace.timing` stage durations;
- compare the new per-stage medians against the PR154 baseline;
- wake MIMIR with whether PR155 improved `archive_retrieval`, whether another
  optimization lane is justified, and which stage should be targeted next.

## Decision Guide

Recommend closing the latency loop for now if:

- `archive_retrieval` median drops materially and total latency is no longer a
  staging demo concern; or
- timings no longer identify a clear repo-local bottleneck.

Recommend a new DAEDALUS lane only if:

- `archive_retrieval` still dominates after PR155, which likely means the
  vector RPC/query itself or archive candidate depth needs deeper analysis;
- another stage clearly becomes dominant; or
- total hosted latency remains above 4s and the stage timings identify a safe
  bounded target.

Do not recommend provider swaps, Redis Memory truth, Cloudflare, workers,
operational cache, import repair, billing/auth/session, broad UI, or candidate
depth reduction unless the hosted stage data specifically justifies a bounded
MIMIR lane.

## Privacy Requirements

Do not record or print:

- bearer tokens, cookies, passwords, API keys, webhook secrets, DB URLs, service
  role keys, or other secret-shaped values;
- raw private replay text;
- context prompt bodies;
- completions;
- provider request/response payloads;
- raw owner IDs, persona IDs, trace IDs, memory IDs, archive IDs, or source IDs;
- raw secret-bearing URLs;
- cache keys.

Record only statuses, timing summaries, stage names, cache status, counts,
modes, provider/profile/model names, commit prefixes, and high-level
pass/fail/recommendation notes.

## Non-Scope

Do not add:

- code changes;
- provider swaps;
- embedding profile/dimension changes;
- Redis/Upstash Memory truth, vector storage, or ranking changes;
- Cloudflare, Workers, Vectorize, or queue work;
- operational cache implementation changes;
- import retry repair;
- worker/background-job implementation;
- billing/auth/session changes;
- UI redesign.

## Validation

ARIADNE should record the command/script used for the hosted sample and run:

```bash
git diff --check
git diff --cached --check
```

No `pnpm typecheck` is required if the result commit is docs-only.
