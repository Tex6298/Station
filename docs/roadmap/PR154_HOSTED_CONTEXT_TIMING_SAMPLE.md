# PR154 - Hosted Context Preview Timing Sample

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE measures hosted runtime first; MIMIR decides whether DAEDALUS
gets an optimization lane.
Status: measured by ARIADNE on 2026-06-21; waking MIMIR for decision

## Why This Lane

PR152 proved hosted owner context-preview latency is repeatedly above 4s. PR153
added sanitized `context.trace.timing` metadata so Station can now see which
runtime-context stages are expensive.

The next move is not optimization yet. The next move is hosted measurement of
the new timing fields. DAEDALUS should not optimize from local reasoning while
the hosted system has not reported stage timings.

## Goal

Collect a small sanitized hosted sample of `context.trace.timing` for owner
context-preview on the current Railway runtime, then recommend whether a narrow
DAEDALUS optimization lane is justified and which stage it should target.

## Scope

ARIADNE should:

- verify API and web `/health/deployment` before measurement and record served
  commit prefixes;
- confirm the served API commit includes PR153 timing metadata, or record a
  deployment-lag result and wake MIMIR without inventing optimization work;
- sign in as the replay owner without printing tokens, cookies, credentials, or
  raw IDs;
- select a replay persona with Memory, Archive, Continuity, Canon, and
  Integrity data;
- run one warm-up context-preview request that is not counted;
- run seven counted authenticated context-preview requests using the same
  generic safe query;
- record only HTTP status, total request latency, retrieval modes/counts,
  source bucket counts, searched/skipped counts, failure state, and
  `context.trace.timing` metadata;
- summarize per-stage minimum, median, maximum / rough p95, and obvious
  outliers for every timing stage present;
- wake MIMIR with a concrete recommendation.

Expected timing shape:

- `context.trace.timing.schema`
- `context.trace.timing.cache.status`
- `context.trace.timing.stages[]`
- each stage has only `stage` and integer `durationMs`

Expected stages from PR153:

- `total`
- `query_embedding`
- `canon`
- `owner_memory`
- `memory_vector_search`
- `integrity`
- `preference_profile`
- `archive_retrieval`
- `continuity`
- `topology_prompt_assembly`

Stage durations are wall-clock measurements around concurrent async work, so
they are diagnostic shape evidence and are not expected to add up to `total`.

## Decision Guide

Recommend a DAEDALUS optimization lane only if the hosted sample points to a
specific safe target, for example:

- repeated high `query_embedding` duration that suggests provider-call latency
  is dominating;
- repeated high `archive_retrieval` duration that suggests archive candidate
  depth/query cost needs a bounded review;
- repeated high `memory_vector_search` duration that suggests Memory vector
  search or owner re-read cost needs review;
- repeated high `continuity` duration that suggests continuity source expansion
  needs bounded review;
- high total latency with a clear repo-local repeated readback stage that could
  safely use existing short-lived operational `runtime_context` cache.

If total latency remains high but no stage dominates, recommend deeper
instrumentation rather than guessing at provider, cache, Redis, Cloudflare, or
worker changes.

If stage timings show the hosted path is already materially lower than PR152,
recommend no immediate optimization and return to MIMIR for sequencing.

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
modes, provider/profile/model names, and high-level pass/fail/recommendation
notes.

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

## ARIADNE Hosted Timing Measurement

Measured on 2026-06-21.

Runtime:

- API `/health/deployment`: HTTP 200, `ready:true`, `@station/api`, `main`,
  commit `d274d4a302e9`.
- Web `/health/deployment`: HTTP 200, `ready:true`, `@station/web`, `main`,
  commit `d274d4a302e9`.
- The served API included `context.trace.timing` on warm-up and all seven
  counted context-preview responses. No deployment-lag block.

Replay owner and persona:

- Replay sign-in and `/auth/me` succeeded; replay owner was `canon`, non-admin.
- Selected the first replay persona matching the required data shape:
  private visibility, platform provider, 16 Memory items, 3 Canon items, 3
  archive files, 3 archived chats, 10 continuity candidates, 5 continuity
  records, and 5 integrity sessions.

Warm-up:

- HTTP 200 in 5796ms outer request latency.
- Trace timing: schema `station.runtime_context_timing.v1`, cache status
  `not_used`, trace `total` 4262ms.
- Stage durations: `query_embedding` 422ms, `canon` 178ms, `owner_memory`
  174ms, `memory_vector_search` 541ms, `integrity` 198ms,
  `preference_profile` 191ms, `archive_retrieval` 3839ms, `continuity` 198ms,
  and `topology_prompt_assembly` 1ms.

Counted sample:

| Sample | Status | Outer latency | Trace total | Archive retrieval |
| --- | --- | ---: | ---: | ---: |
| 1 | HTTP 200 | 4580ms | 3537ms | 3222ms |
| 2 | HTTP 200 | 4535ms | 3549ms | 3173ms |
| 3 | HTTP 200 | 4993ms | 3680ms | 3259ms |
| 4 | HTTP 200 | 4581ms | 3563ms | 3191ms |
| 5 | HTTP 200 | 4571ms | 3615ms | 3230ms |
| 6 | HTTP 200 | 4466ms | 3476ms | 3164ms |
| 7 | HTTP 200 | 4511ms | 3547ms | 3207ms |

Latency summary:

- Counted requests: 7.
- Successes: 7.
- Failures/timeouts: 0.
- Missing timing metadata: 0.
- Outer request minimum: 4466ms.
- Outer request median: 4571ms.
- Outer request maximum / rough p95: 4993ms.
- Requests above 3000ms: 7.
- Requests above 4000ms: 7.

Timing contract:

- All counted samples returned schema `station.runtime_context_timing.v1`.
- All counted samples returned cache status `not_used`.
- Stage order was stable: `total`, `query_embedding`, `canon`,
  `owner_memory`, `memory_vector_search`, `integrity`,
  `preference_profile`, `archive_retrieval`, `continuity`, and
  `topology_prompt_assembly`.
- Stage durations are wall-clock measurements around concurrent async work and
  are not expected to add up to `total`.

Stage timing summary:

| Stage | Min | Median | Max / rough p95 |
| --- | ---: | ---: | ---: |
| `total` | 3476ms | 3549ms | 3680ms |
| `query_embedding` | 312ms | 372ms | 421ms |
| `canon` | 176ms | 188ms | 510ms |
| `owner_memory` | 152ms | 162ms | 236ms |
| `memory_vector_search` | 488ms | 747ms | 838ms |
| `integrity` | 176ms | 187ms | 491ms |
| `preference_profile` | 176ms | 199ms | 484ms |
| `archive_retrieval` | 3164ms | 3207ms | 3259ms |
| `continuity` | 173ms | 188ms | 519ms |
| `topology_prompt_assembly` | 0ms | 0ms | 1ms |

Repeated response shape:

- Retrieval modes were stable across all counted requests: Memory vector,
  Archive vector, Memory fallback none.
- Embedding profile stayed `station_free_1536`, provider `gemini`, model
  `gemini-embedding-2`, dimension 1536.
- Source counts were stable across all counted requests: 3 canon, 3 memory,
  1 integrity, 4 archive, 4 continuity.
- Searched counts were stable across all counted requests: Memory 3,
  Archive 12, Continuity 4.
- Memory skipped counts stayed zero across all counted requests.
- Archive skipped counts stayed at quarantined 5 and zero for other skip
  buckets across all counted requests.

Recommendation:

- Open a narrow DAEDALUS measurement/optimization lane targeting
  `archive_retrieval` first.
- Evidence: hosted outer latency remains above 4s for every counted request,
  trace `total` median is 3549ms, and `archive_retrieval` has the highest
  repeated non-total median at 3207ms.
- Non-targets from this sample: `query_embedding` median 372ms,
  `memory_vector_search` median 747ms, `continuity` median 188ms, and
  `topology_prompt_assembly` median 0ms do not justify first optimization.
- Candidate focus should stay bounded to Archive candidate depth/query cost,
  Archive vector retrieval timing breakdown, and safe owner-scoped runtime
  readback reuse only if DAEDALUS can prove it does not weaken privacy.

Validation:

- `node tmp-pr154-context-timing-sample.mjs` with hosted Railway API/web URLs
  set through process environment variables.
- `git diff --check`
- `git diff --cached --check`
