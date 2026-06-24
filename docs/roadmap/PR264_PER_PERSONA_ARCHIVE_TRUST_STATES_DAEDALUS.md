# PR264 - Per-Persona Archive Trust States

Owner: A2 / DAEDALUS
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

PR262 Owner Runtime Provenance Stitching Readback is accepted by ARGUS, and
PR263 Runtime Provenance Rehearsal passed on hosted desktop and mobile. MIMIR
closes that Memory/observability slice and returns to the queued UI/UX sequence.

The next narrow lane from the accepted Studio/Archive feasibility work is
UX-02A: make the per-persona Archive tab explain archive/import trust states
clearly without pretending the global Archive or Export workspaces are live
products.

## Route

Start with the owner-only route:

- `/studio/personas/:personaId/files`

Use the replay persona route for local/hosted manual checks if needed, but do
not hard-code replay-specific ids or text into product code.

## Goal

Make the owner understand:

- what archive material exists for this persona;
- what import jobs exist and whether each is pending, processing, completed,
  failed, or empty;
- what failed and why, without hiding the error message;
- which material is private/owner-only;
- how storage/quota relates to archive/import actions;
- what remains safe when an import fails;
- what the next safe action is.

## Required Work

Before editing, inspect the current route, components, helpers, and tests.

Implementation should stay narrow:

- Use existing authenticated owner APIs and route data.
- Reuse existing storage/quota usage data or panel near paste/import actions.
- Surface import job status, source name, failure message, privacy state,
  storage/quota context, completed state, and safe next actions where current
  data already supports it.
- Keep failed imports visible and specific; do not collapse failed jobs into
  generic empty state.
- Keep empty/thin states honest. Do not invent archive counts, mock activity,
  fake files, or authoritative frontend-only limits.
- Make every visible control either wired, disabled, or clearly preview-only.
- Add or update focused web helper tests for archive status formatting, quota
  display, import state grouping, or other touched pure helpers.

If an implementation need clearly requires a new backend API, schema change, or
worker behavior, stop and wake MIMIR with the exact gap and smallest proposed
next lane. Do not silently broaden this PR.

## Non-Scope

Do not include:

- global `/studio/archive` implementation;
- global `/studio/export` implementation;
- downloadable bundle changes;
- retryable workers or background job infrastructure;
- external imports, API Bridge, Document Migrator, connector imports, or upload
  processing;
- private search UI unless MIMIR opens UX-02C;
- Redis, Cloudflare, provider, embedding, billing, auth/session, deployment, or
  public route changes;
- storage/quota limits invented in frontend constants;
- copy that implies failed imports destroyed existing user material.

## Validation

Run the narrowest useful checks, and include exact results in the wakeup:

```bash
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
git diff --check
git diff --cached --check
```

If build is cheap after the touched files are known, run:

```bash
npm exec --yes pnpm@10.32.1 -- run build
```

Document any unchanged pre-existing lint/build warnings separately from new
warnings. New warnings on touched Studio/archive files are blockers unless
ARGUS accepts a narrow reason.

## Wake ARGUS

When done, wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR264 Per-Persona Archive Trust States.
- Scope stayed on /studio/personas/:personaId/files and existing owner APIs.
- Runtime/provider/Redis/Cloudflare/billing/auth/deployment/global Archive scope did not change.
Risk:
- Review owner-only archive/import/export/storage boundaries.
- Review failed-state visibility, server-authoritative quota copy, and no fake live data.
Validation:
- ...
Task:
- Review PR264, run or inspect validation, and wake MIMIR with accept/fix/block verdict.
```

If blocked before implementation, wake MIMIR instead with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS blocked PR264 before implementation.
Blocker:
- ...
Task:
- Decide the smallest backend/API/schema/planning lane or reroute UX-02A.
```

## DAEDALUS Implementation Result

Implemented on 2026-06-24.

Files changed:

- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- roadmap/status/validation docs

Implementation summary:

- Added `archiveTrustStateRows`, a pure helper that turns the existing
  per-persona file/import state into four owner-facing trust rows:
  owner-only sources, ready for Continuity, needs review, and queued/processing.
- Added focused helper tests for populated and empty states, including failed
  imports, processing imports, ready sources, honest empty copy, and no invented
  frontend quota/limit language.
- Rendered the helper output inside the existing
  `/studio/personas/[personaId]/files` Archive Trust panel.
- Kept the existing Storage and Quota panel beside the Archive Trust panel so
  quota remains server-reported through `/storage/me`.
- Kept existing failed import cards visible with exact error message readback
  and safe next-action copy.
- Kept existing Publish Continuity actions only on completed/processed source
  cards.

Explicit non-scope preserved:

- No global `/studio/archive` implementation, global `/studio/export`
  implementation, downloadable bundle change, worker/background-job change,
  external import/connector/upload-processing expansion, private search UI,
  Redis, Cloudflare, provider, embedding, billing, auth/session, deployment,
  public route, backend API, schema, storage-quota constant, or fake archive
  activity changed.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 109 tests passed, including new archive trust state rows. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 6 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Partial / known Windows failure | Web compiled, linted/typechecked, collected page data, generated 36 static pages, finalized optimization, and collected traces before local Windows standalone trace-copy failed on symlink `EPERM`. Existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF warnings only. |
| `git diff --cached --check` | Pass | Staged whitespace check passed. |

ARGUS should review owner-only archive/import/export/storage boundaries, failed
state visibility, server-authoritative quota copy, no fake live data, and no
scope drift into global Archive/Export or infrastructure.
