# PR413 - Owner Archive File Import UI

Owner: DAEDALUS
Opened by: MIMIR
Status: Open

## Why This Exists

The backend already has owner-scoped uploaded file import support:

- `GET /persona-files/persona/:personaId/upload-url`;
- direct upload to the private `persona-files` storage bucket;
- `POST /persona-files/persona/:personaId/register`;
- inline protected-alpha file import execution;
- parser coverage for Text, Markdown, ChatGPT JSON, Claude JSON, Reddit JSON,
  Discord JSON, and legacy role/content JSON.

The persona Archive route also displays supported import format rows, but the
visible owner workflow only exposes pasted source material. That leaves the
product truth awkward: Station says uploaded parser imports exist, but the
owner cannot use them from the obvious page.

PR413 should wire the smallest visible file-import path on the existing
owner-only persona Archive page.

## Scope

Implement a bounded UI slice on:

```text
/studio/personas/[personaId]/files
```

Use the existing API flow:

1. Owner selects one file.
2. Web requests a signed upload URL with file name and size.
3. Web uploads the file to the signed Supabase Storage URL.
4. Web registers the uploaded file with `sourceType: "import"` and
   `processImmediately: true`.
5. Web refreshes existing archive files/import jobs/readback.

Accepted file families for this first UI slice:

- `.txt`, `.text`;
- `.md`, `.markdown`;
- `.json`.

Use existing Archive trust copy/readback. If a helper is needed to keep the page
testable, extract the smallest frontend helper instead of spreading upload
logic through JSX.

## Acceptance Criteria

- The file import UI is visible only on the signed-in owner persona Archive
  route.
- The UI clearly distinguishes pasted source import from uploaded file import.
- The UI explains that uploaded ChatGPT/Claude/Reddit/Discord exports are
  owner-only file imports, not live provider/OAuth/API pulls.
- The signed upload URL and token are never rendered, logged, stored in docs, or
  included in error messages.
- File size is sent to the upload-url API and existing storage/quota failures
  remain visible to the owner without implying data loss.
- Successful registration refreshes the existing Archive Import Library and
  import state readback.
- Failed upload/register/process paths keep existing archive material safe and
  show sanitized owner-visible errors.
- Duplicate registration/idempotent API behavior is not weakened.
- Existing parser tests remain authoritative; only add parser tests if the UI
  work exposes a concrete parser gap.

## Non-Goals

Do not add:

- live ChatGPT, Claude, Reddit, Discord, or provider OAuth/API pulls;
- recurring imports;
- background worker/queue activation;
- Redis/Upstash queue behavior;
- Cloudflare retrieval/indexing;
- new embedding/provider/model behavior;
- schema or migration work;
- billing, Stripe, auth/session, deployment, or Supabase config changes;
- public/community import visibility;
- broad Archive redesign or global upload system;
- hosted upload mutation proof.

## Validation

Run the narrowest useful set, expanding only if touched code requires it:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
git diff --cached --check
```

If only frontend helpers are touched and API behavior is unchanged, DAEDALUS may
name the existing API tests instead of rerunning unrelated suites, but must be
explicit about that choice.

## Review Handoff

Wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR413 owner Archive file import UI.
Files:
- <files changed>
Validation:
- <commands and results>
Risk:
- Signed upload URL/token secrecy, owner scoping, storage quota, duplicate
  registration, sanitized errors, and no live provider/OAuth/API overclaim.
Task:
- Hostile-review PR413 and wake MIMIR if accepted or DAEDALUS with exact fixes.
```

Do not go idle without a wakeup commit.
