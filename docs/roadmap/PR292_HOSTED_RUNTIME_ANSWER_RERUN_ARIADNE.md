# PR292 - Hosted Runtime Answer Rerun After Answer Contract Retry

Owner: A4 / ARIADNE
Status: open
Opened: 2026-06-25

## Purpose

Verify PR291 on hosted Railway after deployment: replay the bounded runtime
chat/context path and decide whether the private-only selected-context answer
contract plus one-shot retry clears the hosted recall failure.

PR291 adds a selected-context answer verifier for private persona chat. When
the owner prompt is direct/factual, selected context exists, and the first
answer misses all selected label/fact focus, the route may retry once with a
provider-facing answer-contract marker. Trace/readiness metadata must remain
sanitized.

PR292 is product evidence, not another patch lane.

## Freshness Gate

Before the runtime rerun, prove hosted freshness:

- Web/API `/health` return `ok:true`.
- Web/API `/health/deployment` return `ready:true` on branch `main`.
- The hosted deployment includes accepted PR291 runtime/review commit
  `9531d22b` or a later `main` commit.

If Railway has not deployed the PR291 implementation and ARGUS review patch
yet, wait and retry. If it still has not deployed after a reasonable retry
window, report `BLOCKED - deploy freshness` to MIMIR.

## Scope

Use the hosted app/API and the replay owner credentials from local-only env.
Do not print, commit, or summarize credential values, bearer tokens, cookies,
raw ids, private source bodies, compiled prompts, provider payloads, hosted
logs, SQL, raw completions, or database rows.

Check:

1. Replay owner auth/session.
   - Sign in as the replay owner.
   - Confirm the session reaches protected Studio and remains valid for the
     rerun.
2. Intended replay persona.
   - Use the same intended private replay persona from PR286/PR288/PR290.
   - If persona selection is ambiguous, report the ambiguity to MIMIR.
3. Bounded chat/context path.
   - Reuse the PR274/PR282/PR284/PR286/PR288/PR290 synthetic staging prompt
     shape.
   - One hosted chat request is allowed; the server may perform the PR291
     one-shot retry internally if the answer-contract gate applies.
   - Pass requires both accepted anchor concept labels and both matching
     invented retrieval phrases to be recalled.
   - Report labels and phrases separately.
   - The rejected-control anchor must stay absent.
   - The answer must stay short and must not copy raw source-body markers.
4. Answer-contract observability.
   - Record only sanitized answer-contract verdicts, reason codes, retry
     attempted/failed status, counts, and timing buckets if exposed.
   - Do not record raw selected terms, prompts, completions, payloads, private
     source bodies, ids, cookies, or tokens.
5. Context/readback and observability.
   - Record sanitized categories/counts/timing buckets only.
   - Confirm the trace/readiness trail is complete enough for MIMIR to decide
     whether route contract delivery is fixed.

## Non-Scope

Do not patch product code in PR292.

Do not run:

- Stripe Checkout or subscription mutation;
- imports, export creation, publishing, reporting, voting, moderation, or key
  mutation;
- provider, embedding, Redis, Cloudflare, queue, worker, schema, or seed
  changes;
- broad UI or full demo rehearsal.

If hosted evidence fails after the PR291 deploy is fresh, wake MIMIR with the
classified failure. Specifically classify whether the route contract/retry
fired safely and whether the remaining issue appears to belong to
provider/model behavior rather than selected-context delivery.

## Result Shape

Create:

```text
docs/roadmap/PR292_HOSTED_RUNTIME_ANSWER_RERUN_RESULT.md
```

Record:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`;
- hosted freshness status;
- replay owner auth/session status;
- intended persona selection status;
- full two-anchor recall status, with labels and phrases reported separately;
- answer-contract/retry sanitized status;
- rejected-control exclusion status;
- source-copy safety status;
- sanitized context/observability status;
- exact next-owner recommendation.

## Handoff

Wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR292 hosted runtime answer rerun.
- [PASS / PASS WITH CAVEATS / FAIL / BLOCKED and one-line reason]
Validation:
- [hosted freshness]
- [session/persona]
- [two-anchor labels and phrases recall, rejected-control exclusion, source-copy safety]
- [answer-contract/retry sanitized status]
- [sanitized context/observability]
Recommendation:
- [close hosted recall bar / classify provider-model issue / open repair lane / wait for deploy / other exact next owner]
```
