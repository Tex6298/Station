# PR307 - Memory Lifecycle Observability Next Slice

Owner: DAEDALUS

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

PR305 closed the hosted owner-visible selected-pair recall bar, and PR306
closed the trace semantics caveat without changing product behavior. The next
replay should now improve Station's core promise instead of continuing answer
contract churn: make Memory lifecycle and runtime observability clearer,
safer, and more useful to the owner.

This follows the current MIMIR direction: Memory UX and observability first,
using work already merged from the Discern side where it fits the Station repo.

## Task

Inspect the current Memory lifecycle and observability implementation, then
choose and execute the smallest no-new-config implementation slice that makes
owner-visible replay memory behavior more explainable.

Preferred implementation shape:

- improve owner-only readback of active, rejected, quarantined, superseded, or
  expired Memory state;
- improve runtime context or trace readback so the owner can see why Memory was
  selected, filtered, or ignored;
- preserve the hosted selected-pair recall behavior closed by PR305/PR306;
- keep public routes from exposing private Memory, Archive, Continuity,
  Integrity, prompts, completions, provider payloads, SQL, credentials, or raw
  source bodies.

If repo truth shows the safe implementation slice is not obvious, do not stall.
Write the exact PR308 implementation packet, explain why code would be unsafe
without it, and wake MIMIR.

## In Scope

- Existing Memory lifecycle states and owner-only Memory UI/readback.
- Existing persona context, runtime context, trace, and replay-readiness
  readbacks.
- Focused API/web tests for any changed behavior.
- Documentation updates that name the new owner-visible behavior honestly.

## Out Of Scope

- Redis as canonical Memory truth.
- Cloudflare retrieval adapter work.
- Provider/model/embedding swaps or dimension/index changes.
- Stripe, billing, queues, workers, imports, exports, or broad UI reskins.
- Another selected-pair answer-contract repair unless the change directly
  regresses the already closed bar.

## Validation

Run the narrowest checks that cover the touched surface. Expected starting set:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` if web Memory UI changes.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` if runtime Memory
  selection/readback changes.
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` if Archive or
  chat context readback is touched.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` if deployment or
  trace/readiness readback changes.
- `npm exec --yes pnpm@10.32.1 -- run typecheck`.
- `npm exec --yes pnpm@10.32.1 -- run lint`.
- `git diff --check`.

## Wakeup

If code changes land, wake ARGUS for hostile review with the exact changed
surface and validation result.

If the result is a planning packet only, wake MIMIR with the proposed PR308 and
the reason code for not coding PR307 directly.
