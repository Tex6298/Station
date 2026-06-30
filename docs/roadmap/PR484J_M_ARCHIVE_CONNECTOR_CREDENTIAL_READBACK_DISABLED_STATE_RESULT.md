# PR484J-M - Archive Connector Credential Readback Disabled State Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the narrow web-layer repair for the ARIADNE-hosted
PR484J-L product defect.

When archive connector readiness reports credential encryption or provider app
setup blockers, the owner connector panel now preserves that readiness readback
even if `GET /archive-connectors/credentials` fails. The visible state fails
closed to the accepted disabled setup/config copy instead of showing a generic
retryable connector-error state.

When readiness does not identify a setup/config blocker, credential readback
failure still renders bounded retryable copy and does not treat unknown
credential state as missing, source-ready, or import-safe.

## Changed Files

- `apps/web/components/studio/archive-connector-owner-panel.tsx`
- `apps/web/lib/archive-connector-owner-flow.ts`
- `apps/web/lib/archive-connector-owner-flow.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/roadmap/PR484J_M_ARCHIVE_CONNECTOR_CREDENTIAL_READBACK_DISABLED_STATE_RESULT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Scope Boundary

This is web owner-flow state handling only.

No API route, credential setup, provider config, OAuth completion, source
expansion, source inventory behavior, staging/import behavior, queues/workers,
billing, Redis, Cloudflare, marketplace, social behavior, public writes, Canon,
Continuity, or review-candidate behavior was added.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts`
  passed with 11 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Build was not rerun for this web-state repair. The existing local Windows Next
standalone symlink `EPERM` caveat remains the build truth if build is rerun.

## ARGUS Review Focus

- The owner panel uses `Promise.allSettled` so a credential readback failure no
  longer discards successful readiness setup-blocker truth.
- `archiveConnectorReadinessHasSetupBlocker` is the only new helper and is
  limited to Reddit readiness setup/config state.
- `archiveConnectorOwnerStep` lets readiness setup blockers win over credential
  readback errors, while preserving retryable errors when readiness is healthy.
- Disabled setup states render no primary connect/import/account/source/intent/
  staging/import actions; only safe refresh remains available.
- Regression tests cover setup-blocker precedence, retryable-error preservation,
  no secret-shaped copy, and static no-drift boundaries.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
```
