# PR413 - Owner Archive File Import UI Result

Owner: DAEDALUS
Opened by: MIMIR
Status: Accepted by ARGUS with review patch

## Result

DAEDALUS added the smallest visible owner-only uploaded file import UI to:

```text
/studio/personas/[personaId]/files
```

The existing persona Archive page now distinguishes:

- pasted source import, which still writes through `/imports/chat`;
- uploaded file import, which uses the existing signed upload URL and register
  API flow.

The uploaded file form:

- accepts `.txt`, `.text`, `.md`, `.markdown`, and `.json`;
- requests `GET /persona-files/persona/:personaId/upload-url` with file name
  and file size;
- uploads the selected file through Supabase `uploadToSignedUrl` using the
  returned storage path/token without rendering or storing signed upload
  material;
- registers the upload with `sourceType: "import"` and
  `processImmediately: true`;
- refreshes the existing Archive Import Library and import state readback after
  success or sanitized failure;
- explains that ChatGPT, Claude, Reddit, and Discord exports are uploaded
  owner-only file imports, not live provider, OAuth, bot, or API pulls.

The helper coverage in `apps/web/lib/archive-trust.ts` now covers accepted
extensions and owner-safe error messages, including signed URL/token-shaped
redaction.

## Files Changed

- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Scope Control

- No parser family was added.
- No live ChatGPT, Claude, Reddit, Discord, provider OAuth/API pull, recurring
  import, worker/queue activation, Redis, Cloudflare, provider/embedding,
  schema/migration, billing/auth/deploy, hosted upload proof, public/community
  import visibility, or broad Archive redesign was added.
- Existing API owner scoping, storage quota, duplicate registration/idempotency,
  and parser behavior remain authoritative and unchanged.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts` | Pass | 10 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 133 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed, including upload preflight/register/idempotency/quota/parser coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 41 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |

## Review Focus

ARGUS should hostile-review owner scope, quota/error surfacing, duplicate
registration/idempotency preservation, signed upload URL/token secrecy,
sanitized owner-visible errors, and absence of live provider/OAuth/API overclaim.

## ARGUS Review Verdict

Verdict: `PASS WITH ARGUS PATCH`.

ARGUS accepts PR413 after one narrow safety patch:

- File cards no longer fall back to rendering `storage_path` when file MIME type
  is absent. The owner UI now shows a generic private-file label instead of a
  raw storage path that can contain owner/persona path segments.
- File import error sanitization now catches camelCase `storagePath`,
  `uploadUrl`, and `signedUrl` shapes in addition to snake-case or spaced
  variants, so upload/register failures cannot echo signed-upload-shaped values.
- Helper coverage now proves safe MIME readback, raw path fallback suppression,
  camelCase storage/upload error fallback, accepted extension bounds, and
  signed URL/token-shaped redaction.

ARGUS review findings:

- Owner scope stays on the existing authenticated persona file APIs. The page
  loads the owner persona before upload/register and reuses the existing
  owner-scoped listing/readback.
- Storage quota, duplicate registration/idempotency, parser behavior, and
  process execution remain API-owned and covered by existing storage/import
  tests.
- Signed upload URL/token material is used only in the submit handler and is
  not rendered in the page or included in owner-visible sanitized errors.
- The page remains honest about provider imports: ChatGPT, Claude, Reddit, and
  Discord are uploaded file imports, not live OAuth/API/bot/provider pulls.
- No parser family, live provider connector, recurring import, worker/queue,
  Redis, Cloudflare, provider/embedding, schema/migration, billing/auth/deploy,
  hosted upload proof, public/community visibility, or broad Archive redesign
  was added.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts`
  passed (10 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed (133 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:storage` passed (16 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (41 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff HEAD^ HEAD --check` passed.
- `git diff --check` passed with CRLF normalization warning only.
- Cached diff checks and sensitive-pattern review passed after classifying
  redaction-policy test fixtures as non-secret.

ARGUS wakes MIMIR to close PR413 as `PASS WITH ARGUS PATCH`.
