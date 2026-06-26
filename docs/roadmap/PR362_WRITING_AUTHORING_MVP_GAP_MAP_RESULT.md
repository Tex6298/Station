# PR362 - Writing Authoring MVP Gap Map Result

Owner: DAEDALUS
Date: 2026-06-26
Status: Ready for ARGUS

## Result

DAEDALUS inspected the current Writing/document authoring surfaces and shipped
the smallest bounded no-config patch: public document pages now provide
version/readback context and an owner continuation path back into Studio
publishing.

Changed files:

- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`

## Surface Map

Current authoring and readback flow:

- `/writing` remains the public browsing and Writing feed surface.
- `/studio/publish` is the canonical creator edit/draft/publish surface.
- `/studio/publish?documentId=<id>` already loads an existing document and its
  owner-only version history.
- `/space/:slug/documents/new` remains the Space-local document creation form.
- `/space/:slug/documents/:documentId` is the public/owner readback route for a
  Station document and its linked discussion affordance.
- API routes already support document create, update, publish, public read,
  owner read, owner-only prior version history, and document discussion
  creation/readback.

## Implemented Slice

The document read page now:

- displays a `Version vN` marker when a current document version is greater
  than v1;
- shows public readers only a current public version label and private-history
  boundary copy;
- fetches `/documents/:id/versions` only after the authenticated document read
  identifies the viewer as the owner;
- shows owners a version readback card with current version summary, up to
  three prior version rows, loading/error states, and a `Continue editing`
  action;
- links `Continue editing` to `/studio/publish?documentId=<id>`, preserving
  Studio as the single existing edit surface.

Helper coverage now includes:

- encoded Studio edit continuation hrefs;
- public current-version copy;
- the existing owner version summary helper.

## Privacy Boundary

Prior document versions remain owner-only. Public readers do not fetch
`/documents/:id/versions` and do not receive prior bodies, private draft text,
snapshot summaries, owner IDs, or version metadata beyond the current public
version already present on the public document row.

This patch does not change document visibility semantics, publish semantics,
discussion visibility, API persistence, schema, migrations, auth, billing,
queues, workers, providers, Station Press, or rich-text behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 115 tests passed, including publishing helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 20 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | Next lint reported no warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Review Ask

ARGUS should verify:

- prior version history remains owner-only;
- the public document page only exposes current published version context;
- `Continue editing` routes owners back to the existing Studio publishing flow;
- the patch stays inside PR362 scope and does not change authoring,
  visibility, discussion, or publication semantics.
