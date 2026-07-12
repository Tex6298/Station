# PR522 Cross-Owner Private Generated Artifact and Exact-Text Approval Ledger Result

Date: 2026-07-12

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Review target: ARGUS / A3

Status: READY_FOR_ARGUS_REVIEW

## Source

- `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_DAEDALUS.md`
- PR521 blocker:
  `CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_AND_EXACT_TEXT_APPROVAL_LEDGER_MISSING`

## Result

DAEDALUS implemented the private participant-only foundation that PR521 required
before any future generated-material public lane can be considered.

This patch adds:

- Supabase migration `081_persona_encounter_cross_owner_generated_artifacts.sql`
  with private generated artifacts, exact final-text revisions, and an
  append-only bilateral approval ledger;
- API routes for participant-only artifact save/readback, revision proposal,
  exact digest approval, retraction, delete, and lifecycle-hidden readback;
- DB type surfaces for the new tables;
- minimal Studio controls for explicitly saving a private disposable preview,
  proposing exact final text, approving the shown digest, retracting, and
  deleting;
- focused API/runtime/Studio tests for participant scope, public lockout,
  exact-text approval reset, stale snapshot blocking, moderation/revoke/delete
  lifecycle hiding, strict payload rejection, and public no-drift surfaces.

## Boundary

This result does not publish generated words.

Still blocked by default:

- public generated-material route;
- public generated body text, transcript, summary, excerpt, or source body;
- automatic reuse of PR516 disposable preview output;
- provider/model routing, retrieval, vector/embedding, Redis, Cloudflare,
  billing, Stripe, storage/export, package, deployment, or worker changes;
- public Space, forum, writing, feed, homepage, chat, or context-preview
  placement;
- broad UI/product redesign.

The Studio affordance is private and explicit: a participant must click to save
a preview into the private artifact ledger. Nothing is automatically promoted
from disposable preview to publication.

## ARGUS Review Focus

ARGUS should review:

- owner and participant scoping in all new API routes;
- consent status, scope, version, participant snapshot, and lifecycle drift
  invalidation;
- exact text digest behavior and bilateral approval reset semantics;
- append-only approval ledger behavior;
- RLS/table shape and raw id exposure boundaries;
- Studio readback/control copy and action gating;
- no generated body text on public cross-owner, persona, Discover, writing, or
  Studio helper surfaces.

## Validation

Environment note: commands used the pinned runner:
`npm exec --yes pnpm@10.32.1 -- ...`.

| Command / check | Result | Notes |
| --- | --- | --- |
| `pnpm install` | Pass | Lockfile up to date; npm printed existing project-config warnings and pnpm ignored-build-script warning. |
| `pnpm build` | Fail - environment | Web compiled, lint/type checks ran, and 40 static pages generated; Next standalone trace copy then failed on Windows with `EPERM: operation not permitted, symlink '...node_modules\\.pnpm\\@next+env@14.2.35\\node_modules\\@next\\env' -> '...apps\\web\\.next\\standalone\\node_modules\\.pnpm\\next@14.2.35_...\\node_modules\\@next\\env'`. |
| `pnpm lint` | Pass | `@station/web` lint passed with no warnings or errors. |
| `pnpm typecheck` | Pass | Turbo API/web typecheck passed. |
| `pnpm test:auth` | Pass | 21 tests passed. |
| `pnpm test:reports` | Pass | 8 tests passed. |
| `pnpm test:community` | Pass | 47 tests passed. |
| `pnpm test:spaces` | Pass | 2 tests passed. |
| `pnpm test:continuity` | Pass | 12 tests passed. |
| `pnpm test:persona-context` | Pass | 12 tests passed. |
| `pnpm test:conversation-archive` | Pass | 43 tests passed. |
| `pnpm test:continuity-publication` | Pass | 1 test passed. |
| `pnpm test:document-discussions` | Pass | 4 tests passed. |
| `pnpm test:exports` | Pass | 15 tests passed. |
| `pnpm test:developer-spaces` | Pass | 61 tests passed. |
| `pnpm test:personas` | Pass | 18 tests passed. |
| `pnpm test:persona-encounters` | Pass | 80 tests passed. |
| `pnpm test:writing` | Pass | 32 tests passed. |
| `pnpm test:studio-ui` | Pass | 241 tests passed. |
| `git diff --check` | Pass | No whitespace errors; Git printed existing LF-to-CRLF working-copy warnings. |
| Changed-path forbidden-scope scan | Pass | Changed code paths only showed intentional private excerpt/body fields and explicit no-public-generated-route guardrails. |

## Handoff

ARGUS should review PR522 next.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR522 private participant-only generated artifacts.
- The patch adds migration 081, API routes, DB types, Studio private controls,
  and focused tests for exact-text bilateral approval.
- Public generated routes/body text remain blocked; no public generated words
  were added.
Validation:
- install, lint, typecheck, all named baseline tests, test:personas,
  test:persona-encounters, test:writing, test:studio-ui, and git diff --check
  passed.
- build reaches successful Next compile/page generation, then fails on Windows
  Next standalone symlink copy with EPERM.
Task:
- Hostile review owner/participant scoping, lifecycle invalidation, exact digest
  approvals, RLS/table shape, Studio private controls, and public no-drift.
- Wake MIMIR with WAKEUP A1 if accepted; wake DAEDALUS with WAKEUP A2 if fixes
  are needed.
```
