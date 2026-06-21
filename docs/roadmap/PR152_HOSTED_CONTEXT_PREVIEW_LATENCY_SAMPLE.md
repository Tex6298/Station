# PR152 - Hosted Context Preview Latency Sample

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE measures hosted runtime first; MIMIR decides whether DAEDALUS
gets an optimization lane.
Status: open

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
