# Current main reconciliation

Date: 2026-06-05

Status: historical checkpoint. This file records the post-PR-06 audit before
the 2026-06-06 validation repair and PR-07 through PR-17 sequence. Its failing
validation table is not the current repo status; use
`docs/roadmap/ACTIVE_STATUS.md` and `docs/testing/VALIDATION_BASELINE.md` for
current validation truth.

Base inspected: `0d06823 api: harden community permissions`

Current HEAD inspected: `63d975499544d8f81aa444b4d39f396017c74bb8 feat: close remaining integrity credit gaps`

This audit reconciles the work that landed after PR-06 with the roadmap before
PR-07 starts. It does not approve new product scope, revert anything, or mark the
later stack as roadmap-complete.

## Commit classification

| Commit | Summary | Classification | Notes |
| --- | --- | --- | --- |
| `65a8328` | `feat: expand Station UX surfaces` | Keep but document under existing roadmap PRs; split/narrow in follow-up | Adds broad Studio, writing, settings, archive, export, notes, publish, publishing, persona management, and Discover surfaces. This overlaps PR-08 and PR-09 UI/product work, but landed before the PR-07 data-model checkpoint and does not have a focused validation script. |
| `d77f346` | `feat: add storage integrity foundation` | Keep but split/narrow in follow-up | Adds storage quota schema, RPCs, service, `/storage/me`, and quota calls in archive/import/persona-file paths. This is cross-cutting persistence/entitlement infrastructure and needs focused tests before being treated as stable roadmap foundation. |
| `9025620` | `feat: add integrity and token credit foundations` | Mixed: integrity pieces belong near PR-07; token-credit pieces need human decision | Adds `/integrity`, `/token-credits`, integrity sessions/questions/preferences, token usage/transactions/topups, Anthropic provider plumbing, and context-builder integrity inputs. Integrity overlaps continuity/data-model work; token-credit accounting is PR-17-adjacent and arrived early. |
| `06a0158` | `feat: complete integrity and credit flows` | Questionable; needs human decision before treating as accepted roadmap scope | Adds Stripe token top-up handling, LLM queue, token spending paths, token usage UI, calibration flow updates, and top-up grants. This is useful scaffolding if kept, but it is ahead of the paid-entitlement roadmap and lacks focused coverage. |
| `63d9754` | `feat: close remaining integrity credit gaps` | Keep but split/narrow in follow-up | Adds monthly token reset migration, persona integrity preflight before public publishing, `integrity_session` provenance source types, and more credit enforcement. Some changes make the prior stack coherent, but the validation gate is no longer green. |

## Surfaces landed after PR-06

- Storage: `storage_usage`, tier storage limits, reserve/release RPCs,
  `/storage/me`, and storage checks in archive/import/persona-file flows.
- Integrity: integrity session tables/routes, question bank support, generated
  summaries and outputs, persona preference records, and public-publishing
  preflight.
- Token-credit/accounting: token usage rows, token transactions, top-up purchase
  grants, monthly reset, `/token-credits`, Anthropic model selection, LLM queue,
  and Stripe top-up webhook handling.
- UX: new Studio dashboard/sidebar, archive library, export workspace, notes,
  publish/publishing surfaces, writing entry point, settings storage/token panels,
  persona management/edit, and Discover home.
- Schema/auth/persistence effects: migrations `012` through `016` add
  cross-cutting tables/functions; new API routes are auth-gated where expected,
  but several new behaviors are not covered by focused tests.

No new IntelHub CTI/exposure/recon/finance/browser-worker/PM/model-gateway code
was found in the inspected stack.

## Validation result

Commands were run from the repository root using
`npx --yes pnpm@10.32.1 ...` where applicable.

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm install` | Pass | Lockfile was current. Warnings only: ignored `unrs-resolver` build scripts and npm warnings about pnpm-only config keys when using the npx fallback. |
| `pnpm build` | Pass | Next build completed with the known React hook dependency and `<img>` warnings. |
| `pnpm lint` | Pass | Warning-only output matched the known inventory. |
| `pnpm typecheck` | Pass | Workspace typecheck completed. |
| `pnpm test:auth` | Pass | 10 tests passed. |
| `pnpm test:reports` | Pass | 1 test passed. |
| `pnpm test:community` | Pass | 4 tests passed. |
| `pnpm test:spaces` | Pass | 1 test passed. |
| `pnpm test:continuity` | Fail | `apps/api/src/routes/continuity.test.ts:330` expected the owner memory write to return `201`; current main returned `500`. This is likely related to the new storage/archive persistence path and needs a targeted debug pass. |
| `pnpm test:persona-context` | Timeout | No completed test output after 184 seconds; leftover worker processes were stopped. |
| `pnpm test:conversation-archive` | Timeout | No completed test output after 184 seconds; leftover worker processes were stopped. |
| `pnpm test:continuity-publication` | Pass | 1 test passed. |
| `pnpm test:document-discussions` | Pass | 1 test passed. |
| `pnpm test:exports` | Pass | 1 test passed. |
| `pnpm test:developer-spaces` | Pass | 2 tests passed. |

At this checkpoint, current main was therefore not a clean green base for PR-07.

## Untested or under-tested behavior

- Storage quota reserve/release success, rollback, delete release, and
  limit-exceeded behavior.
- `/storage/me` response shape and tier limit behavior.
- Integrity session lifecycle, output review, summary generation fallback, and
  persona public-publishing preflight.
- Token-credit spend accounting, unlimited/admin tier behavior, monthly reset,
  and insufficient-credit failures.
- Stripe token top-up checkout/webhook metadata validation and duplicate grant
  handling.
- New UX surfaces beyond build/lint/typecheck.

## Historical recommended next instruction

At this checkpoint, the recommendation was not to start PR-07 implementation
yet. That recommendation was superseded by the targeted validation repair and
the accepted PR-07 through PR-17 sequence recorded in the active status and
validation baseline docs.

First choose one of these paths:

1. Keep the stacked work and run a targeted validation repair pass for
   `test:continuity`, `test:persona-context`, and `test:conversation-archive`,
   then add focused coverage such as `test:storage`, `test:integrity`, and
   `test:token-credits`.
2. Keep only the integrity pieces as early PR-07 work, then explicitly split
   storage, token-credit, Stripe, and broad UX stabilization into later roadmap
   chunks.
3. Treat token-credit/Stripe and broad UX work as revert candidates, but only
   after an explicit human decision.

If the stack is kept, roadmap ownership should be documented as:

- Integrity/data-model pieces: PR-07/PR-08.
- Studio/archive/export/publish UX surfaces: PR-08/PR-09.
- Storage quota foundation: persistence/entitlement hardening follow-up.
- Token-credit, Stripe top-ups, and monthly reset: PR-17-adjacent work that
  landed early and must not be considered product-ready yet.
