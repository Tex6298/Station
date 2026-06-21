# PR154 - Hosted Context Preview Timing Sample

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE measures hosted runtime first; MIMIR decides whether DAEDALUS
gets an optimization lane.
Status: open for ARIADNE

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
