# PR277 - Hosted Runtime Retrieval Selection Repair Result

Owner: A2 / DAEDALUS
Status: pass with caveats - accepted by ARGUS
Completed: 2026-06-24

## Verdict

`PASS WITH CAVEATS`, accepted by ARGUS.

PR277 patched the narrow retrieval-selection defect that still explained the
PR276 hosted answer-quality failure after PR275 deployed. Hosted proof still
requires a post-deploy PR278 rerun; this PR only proves the repaired local
runtime selection path.

## Root Cause

PR276 showed Memory retrieval mode still reported `vector` and selected the
full requested Memory count. That meant the PR275 lexical supplement never ran,
because PR275 only backfilled when vector filtering left fewer Memory results
than requested.

The defect was not provider routing, prompt truncation, auth/session, persona
selection, rejected-control leakage, schema, Redis, Cloudflare, queues, workers,
billing, seeds, or UI. It was the vector Memory selection path treating a full
set of weaker vector candidates as final even when an exact active lexical
Memory candidate was owner-safe and lifecycle-safe.

## Patch Summary

Changed `packages/ai/src/retrieval/semantic-search.ts`:

- vector Memory retrieval still runs first and remains the reported retrieval
  mode;
- after vector results are owner/lifecycle/source filtered, the vector path now
  also gathers owner-scoped lexical Memory candidates;
- lexical candidates use the same supplemental Memory guardrails:
  owner required, rejected/quarantined/expired/superseded excluded, and
  archive-source Memory excluded;
- vector and lexical candidates are blended, deduplicated by exclusion, ranked
  by score, and sliced back to the original requested limit.

This lets an exact active lexical replay Memory displace a weaker vector result
without increasing Memory count or broadening source access.

## Selection Result

Local deterministic fixture result:

| Question | Result |
| --- | --- |
| Did full vector slots prevent PR275 backfill? | Yes. PR275 only supplemented when filtered vector results were below the requested limit. |
| Were selected vector candidates weaker than the exact lexical seeded-anchor Memory? | Yes in the new full-slot fixture: three vector candidates filled the limit, and the exact lexical active Memory outranked the weakest vector candidate after blending. |
| Can the exact lexical active Memory be included safely? | Yes in local tests: rejected, other-owner, and archive-source candidates stayed out. |
| Does repaired generic context select both accepted anchor concepts and both matching invented retrieval phrases before provider answer? | Yes locally: runtime context/prompt includes both concept names and both phrase names from the promoted Memory source. |
| Does rejected-control evidence remain absent? | Yes locally: rejected-control text/source id is absent from selected sources and prompt evidence. |

Hosted runtime has not been rerun after this patch. The next hosted check
should prove the same full two-anchor recall bar after deployment.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass. 10 tests, including full vector-slot lexical promotion into runtime context/prompt. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass. 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass. 35 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass. 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. 2 turbo tasks. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings: raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass. |
| `git diff --cached --check` | Pass. |
| Added-line hygiene scan | Pass. No credential-like values, emails, credentialed URLs, or UUID-shaped ids found in the PR277 ARGUS diff. |

## Recommendation

ARGUS accepts the owner/lifecycle/source filtering, rejected-control exclusion,
and scope.

MIMIR should open an ARIADNE hosted PR278 rerun after deploy to prove full
two-anchor recall live.
