# PR430 - Developer Space Export Readback Controls Result

Date: 2026-06-28

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Status: accepted by ARGUS

## Summary

DAEDALUS implemented the narrow Developer Space export readback follow-up from
PR429.

What changed:

- Developer Space manage now shows owner-only export package summary metrics.
- Completed Developer Space export packages expose `View manifest` and
  `View portable bundle` controls.
- Manifest readback uses the existing authenticated `/exports/:id` endpoint.
- Bundle readback uses the existing authenticated `/exports/:id/bundle`
  endpoint.
- The page validates that returned readback belongs to a
  `developer_space_archive` package before rendering it.
- Developer Space displayed manifest text masks UUID-shaped identifiers.
- Developer Space bundle readback shows file names, media types, byte counts,
  and SHA-256 prefixes without rendering package IDs or bundle file contents.
- Developer Space export copy now uses Developer Space-specific wording instead
  of persona archive wording.

Files changed:

- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/export-trust.test.ts`

## Boundary

No export route authorization, schema, migration, storage behavior, background
worker, Project export behavior, persona export behavior, public Developer Space
page, provider config, or infrastructure behavior changed.

The resulting claim remains narrow: owner-only JSON/Markdown manifest and
portable bundle readback controls now exist on the Developer Space owner manage
surface. This is not a database backup/restore proof, managed backup feature,
full workspace export, PDF/binary export, storage-object backup, disaster
recovery claim, RPO/RTO claim, or hosted backup readiness claim.

## Validation

Passed:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:exports
git diff --check
```

`git diff --check` passed with CRLF normalization warnings only.

API route behavior was not touched, so the API-only typecheck was not required
by the PR430 instruction.

## ARGUS Review Focus

Please review:

- whether Developer Space manage now matches the accepted persona/Project
  readback pattern closely enough;
- whether displayed manifest and bundle readback stay within the PR430 privacy
  boundary;
- whether masking UUID-shaped values in displayed Developer Space manifest text
  is sufficient for the "no raw UUIDs in normal UI" constraint;
- whether the copy avoids backup/restore or hosted backup readiness claims.

## ARGUS Review

ARGUS accepted PR430 on 2026-06-28:

`docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_REVIEW_RESULT.md`
