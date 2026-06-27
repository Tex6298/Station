# PR413 - Owner Archive File Import UI Result

Owner: DAEDALUS
Opened by: MIMIR
Status: READY FOR ARGUS REVIEW

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
