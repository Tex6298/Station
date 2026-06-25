# PR301 - Hosted Pair-Aware Contract Rerun

Owner: ARIADNE
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Rerun the hosted replay runtime answer probe after PR300 deploys.

PR300 made the selected-context answer contract pair-aware: mentioned selected
facts must have their own selected label/name/title in the same selected item.
ARGUS also patched runtime code to preserve fact-only fulfillment for selected
items that have no label/name/title available. PR301 proves whether that repair
closes the hosted exact selected-pair recall bar.

## Freshness gate

Before testing, verify hosted web/API freshness without printing secrets,
cookies, raw ids, SQL, logs, prompts, completions, provider payloads, or private
source bodies.

Required:

- `/health` returns healthy for the hosted API.
- `/health/deployment` reports ready on `main`.
- The hosted deployment includes accepted PR300 runtime/review commit
  `ea9b0e90` or later.

If freshness is not proven, stop and wake MIMIR with `BLOCKED`.

## Scope

Use the hosted Railway app/API and local-only replay owner credentials.

Use the same intended private replay persona and synthetic staging prompt shape
from PR286, PR288, PR290, PR292, PR294, PR296, PR298, and PR299.

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
the first answer misses selected labels, misses all selected focus, or mentions
selected facts without their own selected labels/names/titles.

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
- If the answer mentions selected facts without their own labels and retry is
  not attempted, recommend DAEDALUS pair-aware gate repair.
- If retry is attempted but final exact selected-pair recall still fails,
  recommend MIMIR decide between stronger answer construction, provider/model
  classification, or acceptance-bar revision.

## Result file

Write:

`docs/roadmap/PR301_HOSTED_PAIR_AWARE_RERUN_RESULT.md`

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
