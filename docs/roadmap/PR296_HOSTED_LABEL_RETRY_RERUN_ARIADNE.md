# PR296 - Hosted Runtime Rerun After Selected-Label Retry Gate

Owner: ARIADNE
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Rerun the hosted replay runtime answer probe after PR295 deploys.

PR295 made `missed_selected_labels` retryable under the existing private,
direct/factual, selected-context, one-shot answer-contract gate. PR296 proves
whether that repair closes the hosted label recall failure seen in PR294.

## Freshness gate

Before testing, verify hosted web/API freshness without printing secrets,
cookies, raw ids, SQL, logs, prompts, completions, provider payloads, or private
source bodies.

Required:

- `/health` returns healthy for the hosted API.
- `/health/deployment` reports ready on `main`.
- The hosted deployment includes accepted PR295 runtime/review commit
  `f81cd7a2` or later.

If freshness is not proven, stop and wake MIMIR with `BLOCKED`.

## Scope

Use the hosted Railway app/API and local-only replay owner credentials.

Use the same intended private replay persona and synthetic staging prompt shape
from PR286, PR288, PR290, PR292, and PR294.

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

Send one hosted private chat request. The server may internally retry once if
the first answer misses selected labels or misses all selected focus.

Pass requires:

- both accepted concept labels are recalled,
- both matching invented retrieval phrases are recalled,
- the rejected control remains absent,
- the answer stays short enough for the requested shape,
- no raw private source body markers are copied into the answer.

If it fails, classify labels and phrases separately.

### 5. Answer-contract observability

Record only sanitized answer-contract/retry metadata exposed to the owner:

- `applicable`,
- `directFactual`,
- selected and matched counts,
- sanitized reason code,
- retry recommended,
- retry attempted,
- retry failed,
- max attempts,
- retry reason code if exposed.

Do not print raw selected terms, prompts, completions, provider payloads,
private source bodies, raw ids, cookies, tokens, credentials, SQL, or logs.

### 6. Diagnosis

Use this decision rule:

- If recall passes, recommend closing the hosted recall bar.
- If recall fails with `missed_selected_labels` and retry was not recommended
  or attempted, recommend a narrow DAEDALUS gate repair.
- If recall fails after retry was attempted, recommend MIMIR classify whether
  the next lane is provider/model behavior, stronger answer construction, or a
  different product acceptance bar.
- If context labels or phrases are missing, recommend DAEDALUS context
  selection/assembly repair instead.

## Result file

Write:

`docs/roadmap/PR296_HOSTED_LABEL_RETRY_RERUN_RESULT.md`

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
- sanitized answer-contract/retry readback,
- exact next-owner recommendation.

## Wakeup

Wake MIMIR with the verdict and next-owner recommendation.
