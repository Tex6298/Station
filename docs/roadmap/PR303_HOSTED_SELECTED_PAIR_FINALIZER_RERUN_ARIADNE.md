# PR303 - Hosted Selected Pair Finalizer Rerun

Owner: ARIADNE
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Rerun the hosted replay runtime answer probe after PR302 deploys.

PR302 added a bounded selected-pair finalizer: after the existing one-shot
retry is exhausted and the post-retry answer contract still reports
`missed_selected_labels`, private direct/factual persona chat can construct the
final owner-visible answer from selected label/name/title plus supporting fact
pairs.

PR303 proves whether that local repair closes the hosted exact selected-pair
recall bar.

## Freshness gate

Before testing, verify hosted web/API freshness without printing secrets,
cookies, raw ids, SQL, logs, prompts, completions, provider payloads, or private
source bodies.

Required:

- `/health` returns healthy for the hosted API.
- `/health/deployment` reports ready on `main`.
- The hosted deployment includes PR302 runtime commit `9172e380` or later.

If freshness is not proven, stop and wake MIMIR with `BLOCKED`.

## Scope

Use the hosted Railway app/API and local-only replay owner credentials.

Use the same intended private replay persona and synthetic staging prompt shape
from PR286, PR288, PR290, PR292, PR294, PR296, PR298, PR299, and PR301.

Do not mutate product state beyond the one bounded private chat request needed
for the runtime probe. Do not change product code, schema, seeds, provider
configuration, embeddings, retrieval ranking, context assembly, Redis,
Cloudflare, queues, workers, Stripe, billing, imports, exports, publishing,
reporting, voting, moderation, public UI, Studio UI, or demo data.

## Checks

### 1. Replay owner auth/session

Verify the replay owner can access the protected hosted Studio/runtime surface.
Report only pass/fail and sanitized route names.

### 2. Intended replay persona

Verify the test uses the intended private platform replay persona. If the
persona is ambiguous, stop and wake MIMIR with `BLOCKED`.

### 3. Context evidence

Confirm selected context still contains:

- both accepted concept labels,
- both matching invented retrieval phrases,
- no rejected-control evidence.

Report labels and phrases separately. Do not print raw private source bodies or
raw ids.

### 4. Runtime answer

Send one hosted private chat request. The server may internally retry once. If
the retry still misses selected labels, PR302 may construct the final answer
from selected context pairs without a third provider call.

Pass requires:

- both accepted concept labels are visibly recalled,
- both matching invented retrieval phrases are visibly recalled,
- each recalled phrase is paired with its own accepted label/name/title,
- the rejected control remains absent,
- the answer stays short enough for the requested shape,
- no raw private source body markers are copied into the answer.

If it fails, classify labels and phrases separately.

### 5. Finalizer observability

Record only sanitized answer-contract/retry/finalizer metadata exposed to the
owner:

- `applicable`,
- `directFactual`,
- selected and matched counts,
- sanitized reason code,
- retry recommended,
- retry attempted,
- retry failed,
- max attempts,
- finalizer applied,
- finalizer selected-pair count,
- finalizer pre-finalizer reason code.

Do not print raw selected terms, prompts, completions, provider payloads,
private source bodies, raw ids, cookies, tokens, credentials, SQL, or logs.

### 6. Diagnosis

Use this decision rule:

- If recall passes and finalizer metadata is sanitized, recommend closing the
  hosted selected-pair recall bar.
- If context labels or phrases are missing, recommend DAEDALUS context
  selection/assembly repair.
- If retry is not attempted when selected labels are missed, recommend
  DAEDALUS retry-gate repair.
- If finalizer is not applied after the post-retry reason remains
  `missed_selected_labels`, recommend DAEDALUS finalizer routing repair.
- If finalizer applies but the final visible answer still misses selected
  labels or phrases, recommend DAEDALUS finalizer construction repair.
- If finalizer trace/readiness exposes raw selected strings, prompts,
  completions, raw ids, or private source bodies, wake ARGUS.

## Result file

Write:

`docs/roadmap/PR303_HOSTED_SELECTED_PAIR_FINALIZER_RERUN_RESULT.md`

Include:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`,
- hosted freshness result,
- auth/session result,
- intended persona result,
- context labels result,
- context phrases result,
- answer labels result,
- answer phrases result,
- rejected-control exclusion result,
- source-copy safety result,
- sanitized answer-contract/retry/finalizer readback,
- exact next-owner recommendation.

## Wakeup

Wake MIMIR with the verdict and next-owner recommendation.
