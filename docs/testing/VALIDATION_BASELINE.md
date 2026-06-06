# Validation baseline

This is the PR-01 local validation gate for Station. It exists to make future
work measurable: failures after this point should be attributable to the current
change, not to unknown repo hygiene.

## Tooling

- Package manager: `pnpm@10.32.1`, from the root `packageManager` field.
- Preferred bootstrap: install pnpm normally, then run the commands below.
- If a shell does not have global `pnpm`, use the pinned runner:

```bash
npx --yes pnpm@10.32.1 install
npx --yes pnpm@10.32.1 build
```

When using the `npx` fallback, npm may warn about pnpm-only `.npmrc` keys such
as `shamefully-hoist`, `strict-peer-dependencies`, and `auto-install-peers`.
Those warnings are from npm reading pnpm config during the fallback bootstrap;
they are not Station validation failures.

## Baseline commands

Run from the repository root:

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test:auth
pnpm test:reports
pnpm test:community
pnpm test:spaces
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:exports
pnpm test:developer-spaces
```

## PR-01 result

Validated on 2026-05-30 from base
`4dc73ff11f2f26dc2d863b9eda82fe4406e1ee4e`.

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm install` | Pass | Run through `npx --yes pnpm@10.32.1 install` in this shell. Lockfile was already current. pnpm warned that `unrs-resolver` build scripts were ignored. |
| `pnpm build` | Pass | Next build completed. Warning-only lint output is listed below. |
| `pnpm lint` | Pass | Warning-only lint output is listed below. |
| `pnpm typecheck` | Pass | API and web typecheck tasks completed. |
| `pnpm test:spaces` | Pass | 1 test passed. |
| `pnpm test:continuity` | Pass | 1 test passed. |
| `pnpm test:persona-context` | Pass | 1 test passed. |
| `pnpm test:conversation-archive` | Pass | 1 test passed. |
| `pnpm test:continuity-publication` | Pass | 1 test passed. |
| `pnpm test:document-discussions` | Pass | 1 test passed. |
| `pnpm test:exports` | Pass | 1 test passed. |
| `pnpm test:developer-spaces` | Pass | 2 tests passed. Also passed after clearing generated package `dist` output, so it does not depend on stale local build artifacts. |

## PR-02 result

Revalidated on 2026-05-30 after the Supabase schema/type baseline. All commands
above passed with the pinned runner (`npx --yes pnpm@10.32.1 ...`). The same
warning-only output listed below remains.

## PR-03 result

Revalidated on 2026-05-30 after auth/session hardening. `pnpm test:auth` was
added to the named gate and passed along with the PR-01/PR-02 commands using the
pinned runner. The same warning-only output listed below remains.

## PR-04 result

Revalidated on 2026-05-30 after frontend auth/protected route wiring.
`pnpm test:auth` now also covers web auth route/session helpers. All baseline
commands passed with the pinned runner. The warning-only output below is the
current inventory.

## PR-05 result

Revalidated on 2026-05-30 after persistent repository replacement.
`pnpm test:reports` was added to prove moderation report writes through the
Supabase persistence boundary, auth scoping, and stable response serialization.
Core API route modules no longer import local in-memory mock data. All baseline
commands passed with the pinned runner. The warning-only output below remains
the current inventory.

## PR-06 result

Revalidated on 2026-05-31 after Community Beta persistence and permission
hardening. `pnpm test:community` was added to prove forum link validation,
comment parent visibility, document persona ownership, owner-only document
updates, and featured Discover visibility filtering. All baseline commands
passed with the pinned runner. The warning-only output below remains the
current inventory.

## Current main reconciliation result

Revalidated on 2026-06-05 after auditing the post-PR-06 stack from
`0d06823 api: harden community permissions` through
`63d975499544d8f81aa444b4d39f396017c74bb8 feat: close remaining integrity credit gaps`.

Current main is not green. Most commands pass, but continuity/context/archive
validation regressed after the storage, integrity, token-credit, and UX stack
landed.

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm install` | Pass | Run through `npx --yes pnpm@10.32.1 install`. Lockfile was current. Warnings only: ignored `unrs-resolver` build scripts and npm warnings about pnpm-only config keys. |
| `pnpm build` | Pass | Next build completed. Warning-only lint output is listed below. |
| `pnpm lint` | Pass | Warning-only output matched the current inventory. |
| `pnpm typecheck` | Pass | Workspace typecheck completed. |
| `pnpm test:auth` | Pass | 10 tests passed. |
| `pnpm test:reports` | Pass | 1 test passed. |
| `pnpm test:community` | Pass | 4 tests passed. |
| `pnpm test:spaces` | Pass | 1 test passed. |
| `pnpm test:continuity` | Fail | `apps/api/src/routes/continuity.test.ts:330` expected the owner memory write to return `201`; current main returned `500`. The likely owner is the new storage/archive persistence path, but this still needs targeted debugging. |
| `pnpm test:persona-context` | Timeout | No completed test output after 184 seconds; leftover worker processes were stopped. |
| `pnpm test:conversation-archive` | Timeout | No completed test output after 184 seconds; leftover worker processes were stopped. |
| `pnpm test:continuity-publication` | Pass | 1 test passed. |
| `pnpm test:document-discussions` | Pass | 1 test passed. |
| `pnpm test:exports` | Pass | 1 test passed. |
| `pnpm test:developer-spaces` | Pass | 2 tests passed. |

## Known warning-only output

These warnings do not currently fail the baseline:

- `pnpm install` warns that `unrs-resolver@1.12.2` build scripts were ignored.
- `pnpm lint` and `pnpm build` report React hook dependency warnings in:
  - `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
  - `apps/web/app/studio/personas/[personaId]/page.tsx`
- `pnpm lint` and `pnpm build` report Next image optimization warnings for
  `<img>` usage in:
  - `apps/web/app/space/[slug]/page.tsx`
  - `apps/web/components/discover/discover-front-door.tsx`

## Package script notes

- Root validation scripts are the source of truth for non-interactive checks.
- Package `build`, `lint`, and `typecheck` scripts are covered by the root Turbo
  scripts where present.
- `dev` and `start` scripts are runtime commands, not part of the non-interactive
  validation baseline.

## Remaining failures

Current main was not measurable enough to serve as the base for PR-07 continuity
alpha data model work at the 2026-06-05 reconciliation checkpoint.

- `pnpm test:continuity` fails at
  `apps/api/src/routes/continuity.test.ts:330`: expected `201`, got `500` for
  owner memory creation.
- `pnpm test:persona-context` timed out after 184 seconds with no completed test
  output.
- `pnpm test:conversation-archive` timed out after 184 seconds with no completed
  test output.

## Targeted validation repair result

Repaired on 2026-06-06 before starting PR-07 product work. The repair kept scope
to current-main validation:

- Supabase route test fakes now model storage quota RPCs used by archive memory
  writes.
- Empty `.single()` test-fake reads now return a Supabase-shaped `PGRST116`
  no-row error so optional persona preference reads fall back deterministically.
- Persona runtime context tests expect the default preference profile integrity
  source now included by current runtime context.
- Persona continuity summaries count both newer integrity sessions and existing
  calibration sessions.

Targeted commands run with the pinned runner:

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 test:continuity` | Pass | 1 test passed. |
| `npx --yes pnpm@10.32.1 test:persona-context` | Pass | 1 test passed. |
| `npx --yes pnpm@10.32.1 test:conversation-archive` | Pass | 1 test passed. |
| `npx --yes pnpm@10.32.1 typecheck` | Pass | API typecheck ran; web typecheck replayed from cache. |

The full baseline should still be re-run or reviewed before PR-07 product work
starts.
