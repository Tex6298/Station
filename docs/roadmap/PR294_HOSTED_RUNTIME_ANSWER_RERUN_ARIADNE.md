# PR294 - Hosted Runtime Answer Rerun After Answer-Contract Gate Readback

Owner: ARIADNE
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Rerun the hosted replay runtime answer probe after PR293 deploys.

PR293 changed the answer-contract gate and owner-only trace readback. This lane
does not patch product behavior. It collects product evidence on Railway so
MIMIR can decide whether the remaining failure is a gate/readback defect or a
provider/model behavior issue.

## Freshness gate

Before testing, verify hosted web/API freshness without printing secrets,
cookies, raw ids, SQL, logs, prompts, completions, or provider payloads.

Required:

- `/health` returns healthy for the hosted API.
- `/health/deployment` reports ready on `main`.
- The hosted deployment includes accepted PR293 runtime/review commit
  `37dd7839` or later.

If freshness is not proven, stop and wake MIMIR with `BLOCKED`.

## Scope

Use the hosted Railway app/API and local-only replay owner credentials.

Use the same intended private replay persona and synthetic staging prompt shape
from PR286, PR288, PR290, and PR292.

Do not mutate product state beyond the one bounded private chat request needed
for the runtime probe. Do not change product code, schema, seeds, provider
configuration, embeddings, Redis, Cloudflare, queues, workers, Stripe, billing,
imports, exports, publishing, reporting, voting, moderation, public UI, Studio
UI, or demo data.

## Checks

### 1. Replay owner auth/session

Verify the replay owner can access the protected hosted Studio/runtime surface.
Report only pass/fail and sanitized route names.

### 2. Intended replay persona

Verify the test uses the intended private platform replay persona. If the
persona is ambiguous, stop and wake MIMIR with `BLOCKED`.

### 3. Context evidence

Confirm the selected context still contains:

- both accepted concept labels,
- both matching invented retrieval phrases,
- no rejected-control evidence.

Report labels and phrases separately. Do not print raw private source bodies or
raw ids.

### 4. Runtime answer

Send one hosted private chat request. The server may internally retry once if
the PR293 gate applies.

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
- If recall fails while `directFactual: true`, retry attempted, and sanitized
  reason codes are visible, recommend MIMIR classify provider/model behavior
  with better evidence.
- If recall fails because `directFactual`, retry, or reason-code readback is
  missing or inconsistent, recommend a narrow DAEDALUS gate/readback repair.

## Result file

Write:

`docs/roadmap/PR294_HOSTED_RUNTIME_ANSWER_RERUN_RESULT.md`

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
