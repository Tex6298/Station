# PR275 - Runtime Answer Quality Triage

Owner: A2 / DAEDALUS
Status: open
Opened: 2026-06-24

## Purpose

Resolve the PR274 answer-quality caveat: the hosted runtime had the expected
context categories available, but the single chat answer only partially recalled
the accepted seeded anchor set.

For this seeded replay probe, full two-anchor recall is the acceptance bar. The
point is not to make every future answer deterministic; the point is to prove
that Station can use the prepared Memory, Archive, Continuity, Integrity, and
Canon context when the prompt asks for a bounded staging fact that should be
available.

## Starting Evidence

PR274 passed:

- hosted freshness;
- replay-owner auth/session persistence;
- context/readback category availability;
- safe observability/readiness evidence;
- chat route HTTP 200;
- provider/config health;
- no raw source-body copying;
- rejected-control exclusion.

PR274 caveat:

- accepted anchor recall was partial: one of two accepted anchor concepts and
  one of two matching invented retrieval phrases were detected.

## Triage Questions

Answer these before patching:

1. Did PR274 select the correct replay persona?
   - It selected the first private platform replay persona from three owned
     personas. Verify whether the intended seeded persona is uniquely selected.
   - If the probe selected the wrong persona, fix the probe/selection route or
     result discipline, not product runtime behavior.
2. Did context-preview/runtime context actually include both accepted anchors
   in selected source bodies before prompt assembly?
   - Inspect locally/ephemerally only. Do not commit private bodies, raw ids, or
     compiled prompts.
   - Committed evidence should record booleans/counts only.
3. If both anchors were present in selected sources, were they lost through
   truncation, source ordering, source caps, prompt assembly, or system/user
   instruction conflict?
4. If both anchors reached the provider prompt, is the issue model-answer
   behavior that should be handled by tighter runtime instructions for bounded
   fact recall?
5. If only one anchor was selected, is the issue retrieval ranking/candidate
   selection, duplicate source grouping, lifecycle filtering, or category caps?

## Patch Rule

Patch only a narrow, evidenced defect.

Acceptable patch shapes:

- deterministic replay persona selection for hosted probes if the probe was
  ambiguous;
- source-selection/cap/ranking adjustment when a selected category consistently
  drops the second seeded anchor despite available evidence;
- prompt assembly or bounded-answer instruction tightening when both anchors
  are present in prompt context but the model is not guided to answer from all
  relevant selected staging sources;
- focused tests/fixtures that prove both accepted anchors are selected and the
  rejected-control anchor stays out.

Do not patch:

- provider swaps;
- embedding provider/dimension changes;
- schema or migrations;
- Redis/Cloudflare/queue/worker changes;
- imports, seeds, or data resets;
- public UI or broad Studio redesign;
- billing or Stripe state.

## Required Validation

If product code changes, run the narrowest relevant checks, starting with:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If no product patch is needed, create a result doc with the triage outcome and
run:

```bash
git diff --check
git diff --cached --check
```

## Result Shape

Create:

```text
docs/roadmap/PR275_RUNTIME_ANSWER_QUALITY_TRIAGE_RESULT.md
```

Record:

- verdict: `PASS`, `PASS WITH CAVEATS`, `FAIL`, or `BLOCKED`;
- whether PR274 selected the intended persona;
- whether both accepted anchors were selected into context;
- whether both accepted anchors reached prompt assembly, if inspected;
- whether a patch was made;
- validation commands/results;
- exact next-owner recommendation.

Use only sanitized booleans, counts, and categories. Do not commit raw source
bodies, raw ids, compiled prompts, provider payloads, hosted logs, or the raw
completion.

## Handoff

If patched, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR275 Runtime Answer Quality Triage with a narrow patch.
- [state cause and fix]
Validation:
- [commands/results]
Task:
- Review owner/context/prompt safety and wake MIMIR with verdict.
```

If no patch is needed, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR275 Runtime Answer Quality Triage.
- [PASS / PASS WITH CAVEATS / FAIL / BLOCKED and one-line reason]
Validation:
- [sanitized triage outcome and checks]
Recommendation:
- [exact next lane and owner]
```
