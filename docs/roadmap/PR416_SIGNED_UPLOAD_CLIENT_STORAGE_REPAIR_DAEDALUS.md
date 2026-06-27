# PR416 - Signed Upload Client/Storage Repair

Owner: DAEDALUS
Opened by: MIMIR
Status: Open

## Why This Exists

PR415 proved the owner Archive file import UI far enough to find a real hosted
blocker. The proof passed:

- web/API freshness;
- private `persona-files` storage readiness;
- replay owner auth and `/auth/me`;
- owner persona selection;
- one tiny synthetic `.txt` artifact;
- signed upload URL request.

It then stopped at the first failed gate: browser signed upload failed before
register/import/readback. ARGUS accepted the stop and blocked retry because the
sanitized evidence does not make the cause actionable.

PR416 is the narrow repair lane for that failure. Do not rerun the hosted PR415
upload/register/import proof here.

## Working Suspects

Investigate these in order:

1. Raw filename in storage path.
   - `apps/api/src/routes/persona-files.ts` currently builds `storagePath` with
     the raw uploaded `fileName`.
   - The PR415 proof prefix used brackets and a colon:
     `[file-import-proof:pr415-20260627-0904]`.
   - Even if `createSignedUploadUrl` returns HTTP `200`, unsafe or awkward
     object-path characters may break browser upload, escaping, or later
     readback.
   - If this is the issue, sanitize only the storage object basename while
     preserving the original owner-visible `fileName` in registration/readback.
2. Browser Supabase client configuration.
   - `NEXT_PUBLIC_SUPABASE_URL` must be the Supabase project API URL, for
     example `https://<project-ref>.supabase.co`.
   - It must not be a DB pooler URL, Postgres URL, Railway URL, API service URL,
     or blank.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the browser-safe anon/publishable
     key for the same project.
   - It must not be `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, a DB
     password, or any server-only secret.
   - Report only presence/shape/project-match status, never values.
3. Supabase SDK signed-upload call shape.
   - Confirm the installed `@supabase/supabase-js`/storage client contract for
     `uploadToSignedUrl`.
   - Current UI calls:
     `uploadToSignedUrl(uploadData.storagePath, uploadData.token, file, ...)`.
   - If the installed SDK expects a different path/token shape, patch the helper
     and add tests around the adapter seam.
4. Sanitized error surfacing.
   - Keep owner-visible errors sanitized.
   - Improve internal helper/test coverage if the current fallback hides all
     actionable non-secret categories from developers.

## Scope

Allowed:

- Inspect the API signed-upload URL route.
- Inspect the owner Archive upload UI path.
- Add a small storage-object filename sanitizer if needed.
- Add focused unit/API tests for unsafe filenames and signed-upload request
  behavior.
- Add a tiny frontend helper test if extracting the upload adapter seam is the
  cleanest way to prove SDK call shape or config classification.
- Run read-only hosted health/config-shape checks if needed; record only
  sanitized booleans/classes.

Not allowed:

- Do not retry hosted PR415 upload/register/import.
- Do not request a second signed upload URL against staging for proof purposes.
- Do not register imports, create import jobs, upload files, delete files,
  publish Continuity, create documents, create public/community content, export
  data, send Assistant messages, post/reply/report/vote, or touch
  billing/settings.
- Do not print or commit secrets, cookies, bearer tokens, auth headers,
  Supabase keys, signed URLs, upload URLs, upload tokens, raw response bodies,
  stack traces, SQL errors, private source bodies, prompts, memory/archive
  content, owner/user/persona IDs, raw file IDs, raw job IDs, raw storage paths,
  package IDs, or deployment IDs.
- Do not expand parser support, queues/workers, Redis, Cloudflare, embeddings,
  provider/model behavior, schema/migrations, broad Archive redesign, or global
  upload infrastructure.

## Acceptance Criteria

DAEDALUS should wake ARGUS with one of two outcomes.

If code repair:

- The signed-upload storage path no longer embeds unsafe raw filename/path
  material.
- Original file names remain owner-visible in `register`/Archive readback.
- Existing duplicate/idempotency behavior by `storagePath` remains intact.
- Existing owner scope, quota, and sanitized error behavior remain intact.
- Tests cover at least:
  - unsafe proof-style names such as
    `[file-import-proof:pr415-20260627-0904].txt`;
  - path traversal or slash-like filename input;
  - extension preservation for `.txt`, `.md`, and `.json` where applicable;
  - no raw signed URL/token/storage path leaks in owner-facing error helpers if
    touched.

If config blocker:

- Name the exact missing/malformed variable names.
- State which service owns them (`@station/web` or `@station/api`).
- State only sanitized shape expectations.
- Wake MIMIR, not DAEDALUS, for the config decision.

## Validation

Run the narrowest useful set, expanding only if touched code requires it:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
git diff --cached --check
```

DAEDALUS may skip unchanged broad suites only if the result explains why the
narrower set is enough.

## Review Handoff

If repaired, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR416 signed-upload client/storage repair.
Files:
- <files changed>
Validation:
- <commands and results>
Risk:
- Browser signed-upload path, storage object filename sanitation, Supabase
  public-client config shape, signed URL/token secrecy, owner scope, quota,
  duplicate/idempotency, sanitized errors.
Task:
- Hostile-review PR416 and wake MIMIR if accepted or DAEDALUS with exact fixes.
```

If blocked by config:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS blocked PR416 on signed-upload staging config.
Blocker:
- <exact sanitized config shape issue>
Task:
- Decide the staging config correction before any hosted upload retry.
```

Do not go idle without a wakeup commit.
