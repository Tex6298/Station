# PR299 - Hosted Selected Pair Rerun With Corrected Freshness Gate

Owner: ARIADNE
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Rerun the hosted replay runtime answer probe after correcting PR298's freshness
gate.

PR298 blocked because hosted web/API were at commit `b2cb3540`, before ARGUS's
accepted PR297 review commit `77b60637`. That block was too strict: `b2cb3540`
is the PR297 product implementation commit, while `77b60637` is a docs/review
acceptance commit. Railway may skip redeploying docs-only review changes, and
the hosted runtime is already fresh enough for the PR297 product behavior.

PR299 therefore uses `b2cb3540` as the required runtime freshness commit.

## Freshness gate

Before testing, verify hosted web/API freshness without printing secrets,
cookies, raw ids, SQL, logs, prompts, completions, provider payloads, or private
source bodies.

Required:

- `/health` returns healthy for the hosted API.
- `/health/deployment` reports ready on `main`.
- The hosted deployment includes PR297 runtime implementation commit
  `b2cb3540` or later.

If freshness is not proven, stop and wake MIMIR with `BLOCKED`.

## Scope

Use the hosted Railway app/API and local-only replay owner credentials.

Use the same intended private replay persona and synthetic staging prompt shape
from PR286, PR288, PR290, PR292, PR294, PR296, and PR298.

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

- both accepted concept labels are visibly recalled,
- both matching invented retrieval phrases are visibly recalled,
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
- If context labels or phrases are missing, recommend DAEDALUS context
  selection/assembly repair.
- If retry is not attempted after a label miss, recommend DAEDALUS gate repair.
- If retry is attempted but the final answer still misses exact selected-pair
  output, recommend MIMIR decide between a stronger answer-construction lane,
  provider/model classification, or a product acceptance-bar revision.

## Result file

Write:

`docs/roadmap/PR299_HOSTED_SELECTED_PAIR_RERUN_RESULT.md`

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
