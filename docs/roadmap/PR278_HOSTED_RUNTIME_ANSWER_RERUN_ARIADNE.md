# PR278 - Hosted Runtime Answer Rerun After Retrieval Repair

Owner: A4 / ARIADNE
Status: open
Opened: 2026-06-24

## Purpose

Verify PR277 on hosted Railway after deployment: replay the bounded runtime
chat/context path and decide whether the full two-anchor recall bar is now live.

PR277 repaired the selection defect found by PR276. Vector Memory remains
primary, but the vector path now blends owner-scoped, lifecycle-filtered,
non-archive lexical Memory candidates before slicing back to the requested
Memory limit. ARGUS accepted the owner/lifecycle/source filtering and local
deterministic fixture.

PR278 is product evidence, not another patch lane.

## Freshness Gate

Before the runtime rerun, prove hosted freshness:

- Web/API `/health` return `ok:true`.
- Web/API `/health/deployment` return `ready:true` on branch `main`.
- The hosted deployment includes PR277 implementation commit `578e3c7e` or a
  later `main` commit.

If Railway has not deployed the PR277 implementation yet, wait and retry. If it
still has not deployed after a reasonable retry window, report `BLOCKED -
deploy freshness` to MIMIR.

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
   - Use the same intended private replay persona from PR276.
   - If the persona selection is ambiguous, report the ambiguity to MIMIR.
3. Bounded chat/context path.
   - Reuse the PR274/PR276 synthetic staging prompt shape.
   - One hosted chat turn is allowed.
   - Pass requires both accepted anchor concepts and both matching invented
     retrieval phrases to be recalled.
   - The rejected-control anchor must stay absent.
   - The answer must stay short and must not copy raw source-body markers.
4. Context/readback and observability.
   - Record sanitized categories/counts/timing buckets only.
   - Confirm the trace/readiness trail remains safe and complete enough for
     MIMIR to close the recall bar from hosted evidence.

## Non-Scope

Do not patch product code in PR278.

Do not run:

- Stripe Checkout or subscription mutation;
- imports, export creation, publishing, reporting, voting, moderation, or key
  mutation;
- provider, embedding, Redis, Cloudflare, queue, worker, schema, or seed
  changes;
- broad UI or full demo rehearsal.

If hosted evidence fails after the PR277 deploy is fresh, wake MIMIR with the
classified failure. MIMIR will decide whether PR279 is a DAEDALUS repair lane or
whether the evidence changes the roadmap.

## Result Shape

Create:

```text
docs/roadmap/PR278_HOSTED_RUNTIME_ANSWER_RERUN_RESULT.md
```

Record:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`;
- hosted freshness status;
- replay owner auth/session status;
- intended persona selection status;
- full two-anchor recall status;
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
- ARIADNE completed PR278 hosted runtime answer rerun.
- [PASS / PASS WITH CAVEATS / FAIL / BLOCKED and one-line reason]
Validation:
- [hosted freshness]
- [session/persona]
- [two-anchor recall, rejected-control exclusion, source-copy safety]
- [sanitized context/observability]
Recommendation:
- [close PR277 hosted recall bar / open DAEDALUS repair / wait for deploy / other exact next owner]
```
