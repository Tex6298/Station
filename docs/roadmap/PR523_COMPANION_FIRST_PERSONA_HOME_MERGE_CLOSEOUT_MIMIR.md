# PR523 - Companion-First Persona Home Merge Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR523_COMPANION_FIRST_PERSONA_HOME_MERGED
```

## Decision

MIMIR accepted draft PR #1 as the companion-first persona-home source of truth
and merged it into `main` locally:

```text
merge: companion-first persona home
Merge commit: 4ba3e489
PR branch: fork/agent/companion-shell-translation
PR head: 2d4a23835e5aa0928488041168d48b4cb489e8bb
```

Sources:

- `docs/roadmap/PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_ARGUS_RESULT.md`;
- `docs/roadmap/PR523B_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_HUMAN_REHEARSAL_RESULT.md`.

## Accepted Truth

- ARGUS accepted the draft PR technically with no DAEDALUS blocker first.
- ARIADNE accepted the human rehearsal with no pre-merge DAEDALUS fix required.
- The companion-first persona home is now the merged Station direction.
- Residual polish is post-merge, not merge-blocking:
  - decide later whether mobile `New chat` deserves first-tap visibility;
  - keep mobile first-viewport owner-only/private wording under review;
  - rerun archive creation and return-to-thread card when an accepted provider
    or active non-empty thread fixture exists.

## Merged Validation

Validation run on merged `main`:

```text
git diff --check HEAD^1..HEAD                         PASS
npm exec --yes pnpm@10.32.1 -- install --frozen-lockfile --force PASS
npm exec --yes pnpm@10.32.1 -- --filter @station/types --filter @station/config --filter @station/db --filter @station/auth --filter @station/ai build PASS
npm exec --yes pnpm@10.32.1 -- run test:studio-ui     PASS - 238 tests
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive PASS - 43 tests
npm exec --yes pnpm@10.32.1 -- run test:personas      PASS - 18 tests
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters PASS - 74 tests
npm exec --yes pnpm@10.32.1 -- run typecheck          PASS
```

Install note:

- the first local test attempt failed before execution because the local
  `node_modules` tree was incomplete/corrupt (`tsx` and package `dist` outputs
  missing);
- `pnpm install --frozen-lockfile --force` repaired local dependencies without
  changing package files;
- shared package builds were then run and all acceptance gates passed.

## Next

Resume the backend unblock that PR521 created:

```text
PR522 - Cross-Owner Private Generated Artifact and Exact-Text Approval Ledger
Owner: DAEDALUS / A2
Source: docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_DAEDALUS.md
```
