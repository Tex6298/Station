# PR156 - Hosted Archive Retrieval Remeasurement

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE measures hosted runtime; MIMIR decides the next lane.
Status: measured by ARIADNE on 2026-06-21; waking MIMIR for decision

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

## ARIADNE Hosted Remeasurement

Measured on 2026-06-21.

Runtime:

- API `/health/deployment`: HTTP 200, `ready:true`, `@station/api`, `main`,
  commit `508b4acc2dbe`.
- Web `/health/deployment`: HTTP 200, `ready:true`, `@station/web`, `main`,
  commit `508b4acc2dbe`.
- The hosted runtime includes the PR155 batch-validation line. No
  deployment-lag block.

Replay owner and persona:

- Replay sign-in and `/auth/me` succeeded; replay owner was `canon`, non-admin.
- Selected the same replay persona shape used for PR154: first private,
  platform-provider replay persona with 16 Memory items, 3 Canon items, 3
  archive files, 3 archived chats, 10 continuity candidates, 5 continuity
  records, and 5 integrity sessions.

Warm-up:

- HTTP 200 in 2267ms outer request latency.
- Trace timing: schema `station.runtime_context_timing.v1`, cache status
  `not_used`, trace `total` 1275ms.
- Stage durations: `query_embedding` 437ms, `canon` 227ms, `owner_memory`
  157ms, `memory_vector_search` 523ms, `integrity` 188ms,
  `preference_profile` 483ms, `archive_retrieval` 837ms, `continuity` 192ms,
  and `topology_prompt_assembly` 1ms.

Counted sample:

| Sample | Status | Outer latency | Trace total | Archive retrieval |
| --- | --- | ---: | ---: | ---: |
| 1 | HTTP 200 | 2150ms | 937ms | 514ms |
| 2 | HTTP 200 | 2123ms | 1160ms | 845ms |
| 3 | HTTP 200 | 1864ms | 892ms | 530ms |
| 4 | HTTP 200 | 1771ms | 811ms | 531ms |
| 5 | HTTP 200 | 1797ms | 837ms | 547ms |
| 6 | HTTP 200 | 2106ms | 1163ms | 793ms |
| 7 | HTTP 200 | 1779ms | 834ms | 524ms |

Latency summary:

- Counted requests: 7.
- Successes: 7.
- Failures/timeouts: 0.
- Missing timing metadata: 0.
- Outer request minimum: 1771ms.
- Outer request median: 1864ms.
- Outer request maximum / rough p95: 2150ms.
- Requests above 3000ms: 0.
- Requests above 4000ms: 0.

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
| `total` | 811ms | 892ms | 1163ms |
| `query_embedding` | 280ms | 315ms | 414ms |
| `canon` | 163ms | 170ms | 184ms |
| `owner_memory` | 156ms | 171ms | 181ms |
| `memory_vector_search` | 490ms | 513ms | 529ms |
| `integrity` | 162ms | 165ms | 186ms |
| `preference_profile` | 166ms | 174ms | 183ms |
| `archive_retrieval` | 514ms | 531ms | 845ms |
| `continuity` | 157ms | 176ms | 457ms |
| `topology_prompt_assembly` | 0ms | 0ms | 1ms |

PR154 comparison:

| Metric | PR154 baseline | PR156 result | Delta |
| --- | ---: | ---: | ---: |
| Outer median | 4571ms | 1864ms | -2707ms / -59.2% |
| Outer max / rough p95 | 4993ms | 2150ms | -2843ms / -56.9% |
| Trace `total` median | 3549ms | 892ms | -2657ms / -74.9% |
| `archive_retrieval` median | 3207ms | 531ms | -2676ms / -83.4% |
| `archive_retrieval` max / rough p95 | 3259ms | 845ms | -2414ms / -74.1% |
| `query_embedding` median | 372ms | 315ms | -57ms / -15.3% |
| `memory_vector_search` median | 747ms | 513ms | -234ms / -31.3% |
| `continuity` median | 188ms | 176ms | -12ms / -6.4% |
| `topology_prompt_assembly` median | 0ms | 0ms | 0ms |

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

- Close the PR154/PR155 archive-retrieval latency loop for now.
- PR155 materially improved the targeted bottleneck: `archive_retrieval` median
  dropped 83.4%, trace `total` median dropped 74.9%, and no counted request
  remained above 3000ms or 4000ms.
- `archive_retrieval` is still the largest non-total stage, but its median is
  now 531ms and does not justify another immediate optimization lane from this
  hosted sample.
- If MIMIR wants a future sub-2s or sub-1.5s context-preview target, the next
  lane should be framed as a new performance objective rather than a blocker
  left by PR155.

Validation:

- `node tmp-pr156-archive-remeasurement.mjs` with hosted Railway API/web URLs
  set through process environment variables.
- `git diff --check`
- `git diff --cached --check`
