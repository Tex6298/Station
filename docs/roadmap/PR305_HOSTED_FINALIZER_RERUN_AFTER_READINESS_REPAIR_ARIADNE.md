# PR305 - Hosted Finalizer Rerun After Readiness Repair

Owner: ARIADNE
Opened by: MIMIR
Date: 2026-06-25
Status: Open

## Purpose

Resume the hosted selected-pair finalizer product proof that PR303 could not
run because API deployment readiness was temporarily blocked.

PR304 repaired the readiness blocker. Hosted web and API now both report
`ready:true` on `main` at runtime commit `73cf8e9c`, with API migration proof
entries green for:

- `memory_columns`,
- `developer_space_policy`,
- `documents_version`,
- `document_versions`,
- `memory_rpc`,
- `archive_rpc`.

PR305 should run the same product evidence target as PR303: prove whether PR302
closes the hosted exact selected-pair recall bar.

## Freshness Gate

Before testing, verify hosted web/API freshness without printing secrets,
cookies, raw ids, SQL, logs, prompts, completions, provider payloads, or private
source bodies.

Required:

- Web `/health/deployment` returns `ready:true`, branch `main`, commit
  `73cf8e9c` or later.
- API `/health/deployment` returns `ready:true`, branch `main`, commit
  `73cf8e9c` or later.
- API `readiness.migrations.ok` is `true`.

If freshness/readiness is not proven, stop and wake MIMIR with `BLOCKED`.

## Scope

Use the hosted Railway app/API and local-only replay owner credentials.

Use the same intended private replay persona and synthetic staging prompt shape
from PR286, PR288, PR290, PR292, PR294, PR296, PR298, PR299, PR301, and PR303.

Do not mutate product state beyond the one bounded private chat request needed
for the runtime probe. Do not change product code, schema, seeds, provider
configuration, embeddings, retrieval ranking, context assembly, Redis,
Cloudflare, queues, workers, Stripe, billing, imports, exports, publishing,
reporting, voting, moderation, public UI, Studio UI, or demo data.

## Checks

Run the PR303 product checks now that readiness is green:

1. Replay owner auth/session.
2. Intended private platform replay persona.
3. Selected context contains both accepted concept labels.
4. Selected context contains both matching invented retrieval phrases.
5. Rejected-control evidence is absent.
6. One hosted private chat request.
7. Final answer visibly recalls both accepted labels.
8. Final answer visibly recalls both matching phrases.
9. Each recalled phrase is paired with its own accepted label/name/title.
10. No raw private source body marker is copied into the answer.
11. Sanitized answer-contract/retry/finalizer readback is present and does not
    expose raw selected terms, prompts, completions, provider payloads, private
    source bodies, raw ids, cookies, tokens, credentials, SQL, or logs.

## Diagnosis

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

## Result File

Write:

`docs/roadmap/PR305_HOSTED_FINALIZER_RERUN_AFTER_READINESS_REPAIR_RESULT.md`

Include:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`,
- hosted freshness/readiness result,
- auth/session result,
- intended persona result,
- context labels result,
- context phrases result,
- answer labels result,
- answer phrases result,
- selected-pairing result,
- rejected-control exclusion result,
- source-copy safety result,
- sanitized answer-contract/retry/finalizer readback,
- exact next-owner recommendation.

## Wakeup

Wake MIMIR with the verdict and next-owner recommendation.
