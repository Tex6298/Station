# PR416 - Signed Upload Client/Storage Repair Result

Owner: DAEDALUS
Reviewer: ARGUS
Status: READY FOR ARGUS REVIEW
Date: 2026-06-27

## Scope

PR416 investigated the PR415 hosted signed-upload blocker without retrying the
hosted upload/register/import proof.

No hosted upload URL was requested, no file was uploaded, no import was
registered, and no staging data was mutated in this repair lane.

## Repair

The code repair is in `apps/api/src/routes/persona-files.ts`.

Before PR416, `/persona-files/persona/:personaId/upload-url` built the storage
object path by appending the raw owner filename:

```text
<owner>/<persona>/<timestamp>_<raw fileName>
```

PR416 now sanitizes only the storage object basename before asking Supabase for
a signed upload URL. The owner-visible filename is still preserved in
`/register` and Archive readback.

The sanitizer:

- treats backslashes as path separators and keeps only the final segment;
- removes non-ASCII/control characters from the storage basename;
- preserves the final extension in lowercase;
- replaces unsafe stem characters with hyphens;
- strips leading dots and repeated hyphens;
- falls back to `archive-import` if the stem sanitizes to empty;
- keeps duplicate/idempotency behavior keyed to the returned `storagePath`.

Examples now covered in tests:

| Original filename | Storage object basename shape |
| --- | --- |
| `[file-import-proof:pr415-20260627-0904].txt` | `<timestamp>_file-import-proof-pr415-20260627-0904.txt` |
| `../private\source notes.md` | `<timestamp>_source-notes.md` |
| `exports/ChatGPT Export.JSON` | `<timestamp>_ChatGPT-Export.json` |

## SDK/Config Shape

DAEDALUS did not change the frontend Supabase upload call.

Read-only local SDK probe confirmed the installed web workspace client exposes
`uploadToSignedUrl` with the expected path/token/file/options call shape.

The existing UI call remains:

```text
uploadToSignedUrl(storagePath, token, file, { contentType })
```

No Supabase URL, key, signed URL, upload token, raw storage path, or hosted
response body was recorded.

## Validation

Passed:

- `npm exec --yes pnpm@10.32.1 -- run test:storage`
  - 17 tests passed.
  - New coverage proves PR415-style names, slash/path-traversal-style input,
    `.txt`/`.md`/`.json` extension preservation, sanitized storage basenames,
    and original filename preservation during register/readback.
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts`
  - 10 tests passed.
- `npx -y pnpm@10.32.1 --filter @station/api typecheck`
  - Passed.
- `git diff --check`
  - Passed with CRLF normalization warnings only.

Not run:

- `test:studio-ui`, web typecheck.
  - Reason: PR416 changed only the API signed-upload URL route and its API
    storage tests. The frontend upload call shape was inspected but not edited.

## Residual Risk

PR416 fixes the leading code-path suspect from PR415, but it does not prove the
hosted upload now succeeds. A hosted retry remains a separate ARGUS/MIMIR
decision because PR416 was explicitly prohibited from retrying PR415's staged
upload/register/import proof.

## ARGUS Review Focus

- Storage object basename sanitation.
- Original filename preservation in owner-visible register/readback.
- Owner scope and quota behavior around upload preflight.
- Duplicate/idempotency behavior by returned `storagePath`.
- Signed URL/token/raw path secrecy.
- Whether this repair is enough to authorize a new narrow hosted proof packet.
