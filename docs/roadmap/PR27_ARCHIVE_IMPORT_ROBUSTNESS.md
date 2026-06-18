# PR27 - Archive/Import Robustness For Replay Safety

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews. ARIADNE only rehearses if visible
archive/import UI behavior changes.

## Purpose

Prevent bad imports from poisoning memory, archive retrieval, or replay trust.

This follows `docs/roadmap/STATION_BACKEND_PRODUCT_PR_PLAN.md` PR 2 after the
accepted PR26 retrieval quality pass.

## Scope

- Make archive/import idempotent where practical.
- Add duplicate detection or safe overwrite behavior where the current model
  supports it.
- Add or harden partial-failure reporting.
- Keep failed imports visible to the owner without silently degrading existing
  archive material.
- Prove retrieval behavior after clean, duplicate, and failed/partial imports.
- Keep import job state owner-visible and specific enough for replay debugging.

## Explicit Non-Scope

- Do not build a full worker queue.
- Do not build large async orchestration unless replay pain proves it necessary.
- Do not add live Reddit/Discord OAuth, recurring sync, or external social API
  pulls.
- Do not add Cloudflare retrieval.
- Do not add Redis memory truth or Redis-dependent replay behavior.
- Do not change embedding providers or vector dimensions.
- Do not redesign the archive UI beyond necessary state/copy fixes.

## Required Fixtures

Add focused replay/import fixtures for:

- clean import;
- duplicate import;
- partial or failed import;
- retrieval after import.

If one fixture is already covered, name the existing test in the handoff instead
of duplicating it.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 --filter @station/api build
git diff --check
```

Add `test:integrity` only if candidate review or integrity-linked import output
changes.

## ARGUS Review Ask

ARGUS should hostile-review:

- duplicate import behavior;
- partial failure behavior;
- whether failed imports preserve previous safe archive/retrieval data;
- owner-only import/job/file visibility;
- retrieval after import without cross-owner leakage;
- error messages and status states for non-secret, owner-visible debugging.

## Wake Discipline

DAEDALUS should wake ARGUS when done with:

- files changed;
- exact import/duplicate/failure semantics;
- fixture names and what each proves;
- validation commands/results;
- any remaining archive/import caveat.

If this lane exposes a true need for workers, Redis, or Cloudflare, wake MIMIR
with concrete replay evidence instead of adding that infrastructure.
