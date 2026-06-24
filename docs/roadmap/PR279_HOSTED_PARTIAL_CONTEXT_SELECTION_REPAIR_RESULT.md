# PR279 - Hosted Partial Context Selection Repair Result

Owner: A2 / DAEDALUS
Status: pass with caveats - accepted by ARGUS
Completed: 2026-06-24

## Verdict

`PASS WITH CAVEATS`, accepted by ARGUS.

PR279 patched a narrower layer than PR277: retrieval could select the right
Memory row, but private runtime context assembly could still discard full
Memory content whenever a partial summary existed.

Hosted proof still requires a post-deploy PR280 rerun.

## Root Cause

PR278 showed the hosted generic context remained partial after PR277 deployed.
The local/hosted mismatch is explained by DB-shaped Memory rows where:

- the owner-safe active Memory content contains the missing accepted concept and
  matching invented retrieval phrase;
- PR277's lexical blend can find and select that Memory row;
- context assembly then maps selected Memory with `summary ?? content`;
- a partial summary therefore replaces the full content before prompt assembly.

The missing evidence was present in owner-safe active Memory and selected by
the repaired retrieval path, then dropped at the Memory source assembly layer.

This was not a provider, embedding, schema, import, seed, auth/session, persona
selection, topology cap, rejected-control, Redis, Cloudflare, queue, worker,
billing, or UI issue.

## Patch Summary

Changed `packages/ai/src/retrieval/context-builder.ts`:

- private runtime Memory sources now format selected Memory as content plus a
  differing summary when both exist;
- identical summary/content still collapses to one copy;
- existing topology limits still trim Memory content before prompt assembly.

Changed `packages/ai/test/retrieval-metadata.test.ts`:

- the full-vector-slot fixture is now DB-shaped for the PR278 mismatch:
  selected Memory has a partial summary but full content;
- the test proves runtime context/prompt evidence includes both accepted anchor
  concepts and both matching invented retrieval phrases;
- rejected-control, other-owner, and archive-source candidates remain absent.

The public persona context-preview route uses a separate public-safe context
source builder and is not changed by this private runtime context patch.

## Selection Result

| Question | Result |
| --- | --- |
| Was missing evidence present in owner-safe active data? | Yes in the DB-shaped local proof: full Memory content carries the missing concept and phrase. |
| Did PR277 lexical blend find it? | Yes: the exact active lexical Memory is promoted when vector slots are full. |
| Where was it dropped? | Memory source assembly, because `summary ?? content` selected the partial summary and discarded full content. |
| Does the fix select both accepted concepts and phrases before provider answer? | Yes locally: runtime context/prompt evidence includes both concepts and both matching phrases. |
| Does rejected-control evidence remain absent? | Yes locally: rejected-control, other-owner, and archive-source candidates stay absent. |

Hosted runtime has not been rerun after this patch. The next hosted check
should prove the full two-anchor recall bar after deployment.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass. 10 tests, including the DB-shaped partial-summary/full-content fixture. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass. 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass. 35 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass. 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. 2 turbo tasks. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings: raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass. |
| `git diff --cached --check` | Pass. |
| Added-line hygiene scan | Pass. No credential-like values, emails, credentialed URLs, UUID-shaped ids, raw prompts, or private source bodies found in the PR279 ARGUS diff. |

## Recommendation

ARGUS accepts owner/lifecycle/source filtering, the content/summary prompt
assembly change, no hardcoded replay anchors, no scope creep, and secret/raw
data hygiene.

MIMIR should open an ARIADNE hosted PR280 rerun after deploy.
