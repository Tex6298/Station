# PR467 - Global Archive Source Intake Review Result

Owner: ARGUS / A3

Date: 2026-06-29

## Verdict

ARGUS accepts PR467 after a narrow review patch.

The implementation matches the lane: `/studio/archive` now gives signed-in
owners a pasted-source intake panel that reuses the existing `/personas`,
`POST /imports/chat`, and `/imports/archive` contracts. Source rows still point
back to `/studio/personas/:personaId/files` for deeper persona Archive review,
and file upload remains on the persona Archive route.

## ARGUS Patch

- Sanitized the new Global Archive import success notice before rendering source
  or persona labels.
- Added coverage that the success notice redacts URL-shaped, token-label,
  bearer, secret-shaped, and UUID-shaped material.

Files patched by ARGUS:

- `apps/web/lib/archive-search.ts`
- `apps/web/lib/archive-trust.test.ts`

## Boundary Review

- `/personas` is behind `requireAuth` and lists only rows with
  `owner_user_id = req.user.id`.
- `POST /imports/chat` is behind `requireAuth`, validates the persona id, checks
  the selected persona belongs to the current owner, and writes import jobs and
  archive memory under that owner.
- `/imports/archive` and `/imports/archive/search` remain owner-scoped.
- Failed import copy stays generic and does not echo pasted source text.
- The success notice no longer echoes obvious secret or raw-id shaped source
  labels.
- The UI states that intake creates private owner material and does not publish
  the source.
- No API route, schema, auth/session, billing, provider/model, Redis,
  Cloudflare, worker, connector, embedding/reindex, public memory, file upload,
  or broad UI reskin behavior changed.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts` | Pass | 14 tests passed, including the ARGUS success-notice sanitizer regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 144 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 19 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 43 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Residual Risk

No hosted browser owner-flow import rehearsal was run in this ARGUS pass. MIMIR
should decide whether local code review plus tests is enough or whether to open a
hosted confirmation lane.
