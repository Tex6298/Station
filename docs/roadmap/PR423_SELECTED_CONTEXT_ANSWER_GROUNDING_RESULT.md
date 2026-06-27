# PR423 Selected Context Answer Grounding Result

Date: 2026-06-27
Owner: DAEDALUS
Status: LOCAL PASS - WAKE ARGUS

## Summary

PR423 made selected reviewed-import Memory and Canon labels first-class in the
private chat answer contract and selected-pair finalizer.

This was local-only work. DAEDALUS did not run hosted chat/model calls, live
provider calls, `.env` credential reads, provider config changes, public or
community mutations, import or candidate actions, cleanup, schema, migration,
worker, queue, billing, or UI work.

## What Changed

- Canon retrieval now carries `source_type` through selected runtime context so
  the chat answer contract can distinguish import-backed Canon from normal
  Canon.
- Private chat selected-context focus text marks import-backed Memory and Canon
  with the safe owner-visible classification phrase `owner-reviewed import`.
- The selected-context answer contract now tracks source bucket and whether a
  selected item is an owner-reviewed import.
- When the user prompt asks for reviewed/import context and selected
  import-backed Memory/Canon items exist, the contract requires each reviewed
  import item to have:
  - its selected safe label,
  - at least one paired supporting fact,
  - safe owner-reviewed import provenance wording.
- The selected-pair finalizer now prioritizes required reviewed-import
  Memory/Canon items and emits safe `owner-reviewed import -` pair lines.
- Finalizer telemetry is now truthful: `finalizerSatisfied` is derived from the
  post-finalizer contract verdict and remains false if the post-finalizer
  contract still reports `missed_selected_labels`.

## Local Proof

Added a synthetic mocked-provider route test for accepted import-backed Memory
and Canon. The test proves:

- the provider focus receives safe owner-reviewed import classification and both
  selected labels;
- an insufficient provider answer triggers the selected-context retry/finalizer
  lane;
- the final owner-visible assistant answer includes both selected labels, one
  supporting fact paired with each, and safe owner-reviewed import provenance;
- the raw retry answer is not persisted;
- the owner-visible final answer is persisted exactly once;
- synthetic private source names and source ids used by the fixture do not
  appear in persisted answers or AI trace readbacks.

Replay-readiness fixtures were updated so sanitized finalizer metadata reflects
the corrected `finalizerSatisfied` semantics.

## Validation

- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (42 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed
  (2 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed with local CRLF normalization warnings only.
- Added-line sensitive-pattern scan was reviewed. Matches were the intentional
  synthetic redaction fixture and negative assertions in the new test, not real
  credentials or hosted evidence.

## Handoff

ARGUS should review PR423. If accepted, wake MIMIR with a recommendation for the
next hosted rerun decision. If fixes are needed, wake DAEDALUS with the exact
local issue to repair.
