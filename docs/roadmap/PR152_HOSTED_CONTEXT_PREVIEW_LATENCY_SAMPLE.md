# PR152 - Hosted Context Preview Latency Sample

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE measures hosted runtime first; MIMIR decides whether DAEDALUS
gets an optimization lane.
Status: closed by MIMIR on 2026-06-21; PR153 opened for DAEDALUS

## Why This Lane

PR149 hosted replay measurement found a single context-preview request at
4611ms. MIMIR intentionally did not open optimization from one hosted sample.

PR150 and PR151 closed the clearer Memory graph issue: explicit supersession
now creates real graph edges, and the owner Memory page can exercise that path.
The remaining hosted replay signal worth checking is whether context-preview
latency is persistently high or whether the 4611ms request was an isolated
sample.

This lane is measurement only. It should decide whether an optimization lane is
evidence-backed.

## Goal

Collect a small sanitized hosted latency sample for owner context-preview on the
current Railway runtime and report whether the result justifies a narrow
DAEDALUS optimization lane.

## Scope

ARIADNE should:

- verify API and web `/health/deployment` before measurement and record the
  served commit prefixes;
- sign in as the replay owner without printing tokens, cookies, or credentials;
- select a replay persona with Memory/Archive/Continuity data;
- run one warm-up context-preview request that is not counted;
- run 7 counted authenticated context-preview requests using the same generic
  safe query;
- record only HTTP status, latency, retrieval mode, provider/profile/model name,
  source bucket counts, searched counts, skipped counts, fallback flags, and
  failure state;
- collect a bounded observability summary/list check after the sample to confirm
  whether trace failures increased, without printing prompt bodies, completions,
  provider payloads, raw private text, or raw ids;
- wake MIMIR with the median, min, max, rough p95/max, failure count, and a
  recommendation.

Use the existing hosted API routes only. Do not mutate replay data.

## Decision Guide

Recommend a DAEDALUS optimization lane only if the repeated hosted sample shows
a concrete signal such as:

- median context-preview latency above 3000ms;
- two or more counted requests above 4000ms;
- repeated failures/timeouts;
- trace/readiness evidence pointing at a specific bottleneck such as vector
  retrieval, archive candidate depth, continuity source expansion, or provider
  call overhead.

If the sample is mostly stable below those thresholds, recommend no immediate
latency optimization and return to MIMIR for sequencing.

## Privacy Requirements

Do not record or print:

- bearer tokens, cookies, passwords, API keys, webhook secrets, DB URLs, service
  role keys, or other secret-shaped values;
- raw private replay text;
- context prompt bodies;
- completions;
- provider request/response payloads;
- raw source ids, trace ids, memory ids, archive ids, or persona ids;
- raw secret-bearing URLs.

Record only statuses, counts, modes, provider/profile/model names, timing
summaries, and high-level pass/fail/recommendation notes.

## Non-Scope

Do not add:

- code changes;
- provider swaps;
- embedding or reindex changes;
- Redis/Cloudflare graph or retrieval infrastructure;
- import retry repair;
- worker queues;
- billing/auth/session changes;
- UI redesign.

## Validation

ARIADNE should record the command/script used for the hosted sample and run:

```bash
git diff --check
git diff --cached --check
```

No `pnpm typecheck` is required if the result commit is docs-only.

## ARIADNE Hosted Measurement

Measured on 2026-06-21.

Runtime:

- API `/health/deployment`: `ready:true`, `@station/api`, `main`, commit
  `2cd925fa2a93`.
- Web `/health/deployment`: `ready:true`, `@station/web`, `main`, commit
  `2cd925fa2a93`.

Replay owner and persona:

- Replay sign-in succeeded; replay owner was `canon`, non-admin.
- Selected the first replay persona matching the required data shape:
  private visibility, platform provider, 16 Memory items, 3 Canon items, 3
  archive files, 3 archived chats, 10 continuity candidates, 5 continuity
  records, and 5 integrity sessions.

Warm-up:

- HTTP 200 in 4761ms.
- Retrieval modes: Memory vector, Archive vector, Memory fallback none.
- Embedding profile: `station_free_1536`, provider `gemini`, model
  `gemini-embedding-2`, dimension 1536.
- Source counts: 3 canon, 3 memory, 1 integrity, 4 archive, 4 continuity.
- Searched counts: Memory 3, Archive 12, Continuity 4.
- Skipped counts: Memory all zero; Archive quarantined 5.

Counted sample:

| Sample | Status | Latency |
| --- | --- | --- |
| 1 | HTTP 200 | 4651ms |
| 2 | HTTP 200 | 4617ms |
| 3 | HTTP 200 | 4703ms |
| 4 | HTTP 200 | 4870ms |
| 5 | HTTP 200 | 4606ms |
| 6 | HTTP 200 | 4622ms |
| 7 | HTTP 200 | 4541ms |

Latency summary:

- Counted requests: 7.
- Successes: 7.
- Failures/timeouts: 0.
- Minimum: 4541ms.
- Median: 4622ms.
- Maximum / rough p95: 4870ms.
- Requests above 3000ms: 7.
- Requests above 4000ms: 7.

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

Observability summary/list check:

- Before sample: summary/list HTTP 200, 9 traces, 0 failed traces, 21,538 total
  tokens, 10,220ms average trace latency, 6 recent completed conversation
  traces.
- After sample: summary/list HTTP 200, 9 traces, 0 failed traces, 21,538 total
  tokens, 10,220ms average trace latency, 6 recent completed conversation
  traces.
- The context-preview sample did not increase trace failures or token totals.

Recommendation:

- Open a narrow DAEDALUS measurement/optimization lane for hosted
  context-preview latency.
- Evidence: median 4622ms exceeds the 3000ms threshold, all 7 counted requests
  exceeded 4000ms, and Archive searched count was repeatedly 12 with stable
  vector Memory/Archive retrieval and no failures.
- Candidate focus should be measurement-first and bounded: context-preview
  timing breakdown, Archive candidate depth/query cost, embedding/search
  latency, continuity expansion cost, and whether preview can reuse cached
  owner-safe readback without weakening privacy.

Validation:

- `node tmp-pr152-context-preview-sample.mjs`
- `git diff --check`
- `git diff --cached --check`

## MIMIR Closeout

MIMIR closes PR152 on 2026-06-21.

Decision:

- The repeated hosted sample justifies a narrow DAEDALUS lane.
- PR153 should be measurement-first: add sanitized per-stage timing for
  context-preview/runtime-context assembly and make one bounded optimization
  only if the timing evidence identifies a safe repo-local fix.
- The repeated 4s-plus latency does not justify provider swaps, embedding
  profile/dimension changes, Redis Memory truth, Redis vector storage,
  Cloudflare, workers, import retry repair, billing/auth/session work, or broad
  UI changes.

Next lane:

- `docs/roadmap/PR153_CONTEXT_PREVIEW_LATENCY_BREAKDOWN.md`
