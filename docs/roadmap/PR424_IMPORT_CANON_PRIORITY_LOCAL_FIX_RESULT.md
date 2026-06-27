# PR424 - Import Canon Priority Local Fix Result

Owner: DAEDALUS
Reviewer: ARGUS
Status: LOCAL PASS - WAKE ARGUS
Date: 2026-06-27

## Scope

DAEDALUS completed the ARGUS-requested local-only fix after the PR424 hosted
answer rerun missed the accepted import-backed Canon label/fact.

No hosted chat, hosted retry, `.env` credential read, provider/model/config
change, import/candidate mutation, hosted cleanup, public/community mutation,
Redis, Cloudflare, schema, migration, worker, queue, billing, UI, or broad
runtime behavior change occurred.

## Root Cause

PR423 made reviewed-import Memory/Canon answer pairs first-class, but the local
fixture had only one Canon item. Hosted PR424 had multiple Canon items.

Both the provider selected-context focus and selected-context answer contract
were taking only the first Canon item before checking whether reviewed-import
Memory/Canon pairs were required. That meant the accepted import-backed Canon
could be present in runtime context but dropped from the provider focus,
answer contract, and selected-pair finalizer lane.

## Fix

- Reviewed/import prompts now compute a shared
  `asksForReviewedImportPairs(...)` gate.
- For those prompts only, Memory and Canon buckets prioritize
  owner-reviewed import sources before per-bucket slicing.
- Non-import sources and non-reviewed/import prompts keep their existing bucket
  order.
- The same prioritization is applied to:
  - provider selected-context focus;
  - selected-context answer-contract item collection.
- `finalizerSatisfied` remains tied to post-finalizer fulfillment.

## Local Proof

The focused route fixture now reproduces the hosted shape:

- it adds an ordinary higher-priority Canon before the accepted import-backed
  Canon;
- the owner prompt asks for reviewed import labels and facts;
- the provider focus still includes the owner-reviewed import Canon label;
- the ordinary higher-priority Canon is not allowed to displace that import
  Canon in the provider focus;
- the finalizer still emits both required owner-reviewed import Memory and
  Canon label/fact pairs;
- raw retry output is not persisted, and trace/persisted-message leak checks
  remain covered by the existing fixture.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (42 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed
  (2 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed
  (8 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed with local CRLF normalization warnings only.
- Added-line sensitive-pattern scan found no matches in the local patch or
  result doc.

## Handoff

ARGUS should review the local patch. If accepted, decide whether to wake MIMIR
for a guarded hosted rerun decision or wake DAEDALUS with exact local fixes.
