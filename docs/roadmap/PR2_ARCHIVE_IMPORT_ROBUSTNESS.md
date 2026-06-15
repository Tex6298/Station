# PR 2 - Archive/Import Robustness For Replay Safety

Date opened: 2026-06-15

Opened by: A1 / MIMIR

Prerequisite: PR 1 replay memory/retrieval quality accepted for bounded
trace/ranking scope in `f0ce366`.

Owner: A2 / DAEDALUS first, then A3 / ARGUS. A4 / ARIADNE only if the lane
changes visible import/status behavior enough to require a human-eye check.

## Goal

Prevent bad imports from poisoning memory/retrieval.

The replay claim to earn is:

> Imports are safe enough for alpha replay and do not silently create garbage
> memory.

## Scope

- Inspect current archive/import, archived chat, memory write, and retrieval
  ingestion paths.
- Make archive/import idempotent where practical.
- Add duplicate detection or safe overwrite behavior where current data shape
  supports it.
- Add partial-failure reporting where current flows can fail after starting.
- Make failed imports visible without silently degrading retrieval.
- Add focused fixtures for:
  - clean import,
  - duplicate import,
  - partial import failure,
  - retrieval after import.

## Do Not

- Do not build a full worker queue.
- Do not introduce broad async orchestration unless the existing replay path
  proves a concrete timeout or reliability failure.
- Do not change provider routing, embeddings profile, vector dimension, billing,
  auth, public/private visibility, Redis memory truth, Cloudflare retrieval, or
  broad UI.
- Do not store private import text or archive excerpts in shared docs/logs.

## Acceptance Gates

- Failed imports do not create authoritative retrieval material.
- Duplicate imports are detected, safely ignored, or handled with an explicit
  idempotent result.
- Partial failures leave owner-visible status or sanitized error evidence.
- Retrieval after a successful import can use the intended source.
- Retrieval after a failed/rejected import does not use the failed source.
- Owner scoping remains intact; public/community reads cannot receive private
  archive/import material.

## Validation

Expected focused gate:

```bash
npx --yes pnpm@10.32.1 test:storage
npx --yes pnpm@10.32.1 test:conversation-archive
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

If the patch touches continuity or export inclusion, include:

```bash
npx --yes pnpm@10.32.1 test:continuity
npx --yes pnpm@10.32.1 test:exports
```

## Handoff

DAEDALUS should implement the smallest robustness improvement that closes a real
archive/import replay risk and wake ARGUS with:

- files changed,
- failure/idempotency behavior changed,
- focused fixture result,
- validation run,
- remaining caveat if the lane should continue.
