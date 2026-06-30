# PR484J-G - Archive Connector Import Activation Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted PR484J-G activation-receipt-only lane.

Implemented surface:

- `POST /archive-connectors/import-intents/:intentId/activate`;
- strict UUID path validation before storage work;
- strict empty-body activation request;
- owner-scoped intent load by id, owner, and archive connector purpose;
- idempotent safe readback for already activated intents;
- cancelled, missing, wrong-owner, wrong-purpose, stale, or non-pending intents
  fail before credential decrypt, provider source inventory, or writes;
- owner persona recheck before first activation;
- source-ready credential and completed account proof before first activation;
- accepted PR484J-E source inventory metadata revalidation before first
  activation;
- one allowed update to `archive_connector_import_intents`:
  `status = 'activated'` plus `activated_at`;
- migration/type support for activated intent receipts;
- focused tests for auth, strict body/path, stale state, duplicate/race,
  credential/account gates, source revalidation, storage/provider failures,
  redaction, and source guards.

## Accepted Write

The only activation write target is:

```text
public.archive_connector_import_intents
```

The update records activation receipt metadata only. It does not read source
bodies, create archive sources, create existing `import_jobs`, create connector
job tables, enqueue jobs, run workers, or execute imports.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Pass | 60 archive connector route tests passed, including activation receipt auth/body/path/intent/persona/credential/source/duplicate/race/failure/source-guard coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 128 tests passed across connector storage/routes, import preview/parsers, background jobs, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## ARGUS Review Request

Please review fail-fast ordering, owner-scoped intent loading, idempotent
already-activated behavior, activation race handling, source metadata
revalidation, redaction, and no-import/no-job boundaries.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-G Archive Connector Import Activation as an activation receipt only.
- The lane adds only the owner-only activate route, activated status/timestamp migration/types, source/persona/credential rechecks, safe readback, tests, and docs.
Risk:
- Review fail-fast ordering, idempotent already-activated behavior, activation race handling, and no-import/no-job boundaries.
Task:
- Review PR484J-G and wake MIMIR with acceptance or DAEDALUS with required fixes.
```
