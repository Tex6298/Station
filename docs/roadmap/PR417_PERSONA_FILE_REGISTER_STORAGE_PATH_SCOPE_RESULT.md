# PR417 - Persona File Register Storage Path Scope Result

Owner: DAEDALUS
Reviewer: ARGUS
Status: READY FOR ARGUS REVIEW
Date: 2026-06-27

## Scope

PR417 hardens the direct API boundary for:

```text
POST /persona-files/persona/:personaId/register
```

No hosted upload/register/import proof was retried. No signed upload URL was
requested against staging, no file was uploaded, no import was registered in
hosted data, and no cleanup/deletion/public/community mutation was run.

## Repair

`apps/api/src/routes/persona-files.ts` now validates caller-provided
`storagePath` before duplicate lookup, quota checks, file insert, or import job
creation.

Accepted register paths must be normal object paths under the authenticated
owner and requested persona:

```text
<ownerUserId>/<personaId>/<object-basename>
```

The validator rejects:

- paths outside the current owner prefix;
- paths outside the requested persona prefix;
- leading slash;
- backslash;
- URL-like values;
- query or hash fragments;
- empty basename;
- `..` or traversal-shaped input;
- encoded slash/traversal/control-shape fragments;
- extra path segments beyond owner/persona/basename.

The rejection response is sanitized:

```json
{ "error": "Invalid storage path." }
```

It does not echo the rejected raw path.

## Preserved Behavior

- Valid paths returned by the current upload-url route still register
  successfully.
- Original owner-visible filenames remain preserved in file registration and
  Archive readback.
- Duplicate/idempotent registration for the same valid returned `storagePath`
  is unchanged.
- Quota accounting remains balanced on rejected paths and failed registration.
- Best-effort cleanup behavior after failed registration is unchanged.

## Validation

Passed:

- `npm exec --yes pnpm@10.32.1 -- run test:storage`
  - 18 tests passed.
  - New coverage proves valid sanitized upload-url paths register, PR416-style
    proof filenames register, duplicate/idempotent valid paths remain stable,
    wrong owner/persona prefixes reject, traversal/URL/backslash/query/hash
    and empty basename shapes reject, raw rejected paths are not echoed, and
    rejected attempts create no file rows/import jobs and reserve no storage.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`
  - Passed.
- `git diff --check`
  - Passed with CRLF normalization warnings only.

Not run:

- Web helper tests, web typecheck, hosted upload proof.
  - Reason: PR417 changed only the API register route and API storage tests.
    No web code or hosted data path was touched.

## Residual Risk

PR417 closes the direct register prefix-validation caveat ARGUS raised after
PR416. Hosted upload/register/import success remains unproven until MIMIR/ARGUS
opens a separate hosted proof retry packet.

## ARGUS Review Focus

- Register path prefix validation before inserts/jobs/quota movement.
- Sanitized rejection without raw path echo.
- Valid upload-url returned paths.
- Duplicate/idempotency by valid `storagePath`.
- Quota balance and best-effort cleanup.
- No hosted mutation.
