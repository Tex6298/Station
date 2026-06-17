# Station Launch-Core Patch Checks

This patch is intentionally narrow. It finishes launch-core correctness where the current alpha was already close, instead of pulling in more upstream systems.

## What this patch changes

1. Persona chat runtime history now has one shared helper:
   - query newest-first from Supabase;
   - keep only the bounded latest window;
   - send the retained turns to the LLM oldest-to-newest;
   - drop system/blank rows before provider calls.
2. Chat `_debug` payloads are now production-gated diagnostics:
   - available in dev/test for operator debugging;
   - blocked in production by default;
   - never emitted in production by this patch, even if `STATION_EXPOSE_AI_DEBUG=true`.
     A future admin/operator path must add and test a real privileged gate before
     production `_debug` can exist.
3. Station document types now match the product spec:
   - `essay`, `codex`, `manifesto`, `field_log`, `research`, `archive_note`, `transcript`.
   - legacy alpha values are normalised: `post -> essay`, `constitution -> codex`, `update -> field_log`, `other -> archive_note`.
4. Developer Space generated documents now use Station document types:
   - methodology/finding -> `research`;
   - field log -> `field_log`;
   - note -> `archive_note`.
5. Space/public writing UI labels now render Station document types and keep legacy labels readable until the migration has run.

6. Station Assistant MVP is now mounted at `/assistant` and surfaced at `/studio/assistant`:
   - owner-scoped summary/context endpoints;
   - operational replies for archive, publishing, continuity, export, quota, Space, and Developer Space work;
   - explicit guardrail that the Assistant is not a persona and owns no Canon/Memory.
7. Global Archive is now a live owner-scoped surface at `/imports/archive` and `/studio/archive`:
   - combines memory, files, imports, archived chats, Integrity Sessions, and documents;
   - replaces the static preview cards with signed-in data, filters, and source links.

## Apply

```bash
git apply station-launch-core.patch
pnpm install --frozen-lockfile
pnpm --filter @station/types --filter @station/config --filter @station/db --filter @station/auth --filter @station/ai build
```

Run the new migration after it is applied to your Supabase project:

```bash
supabase migration up
```

## Checks

Run these first:

```bash
pnpm typecheck
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:developer-spaces
pnpm test:writing
pnpm test:studio-ui
```

Then manually verify:

1. Open `/studio/assistant`; confirm the Assistant summary loads, does not present itself as a persona, and returns next actions.
2. Open `/studio/archive`; confirm the page uses live owner data rather than static preview cards.
3. Open a persona with more than 20 prior turns. Send a new message and confirm the provider receives only the latest 20 prior turns, in chronological order.
4. In local/dev, hit persona chat and confirm `_debug` contains only counts/provider metadata.
5. Repeat with `NODE_ENV=production` and `STATION_EXPOSE_AI_DEBUG=false`; confirm `_debug` is absent.
6. Repeat in production mode with `STATION_EXPOSE_AI_DEBUG=true`; confirm `_debug` is still absent.
7. Create a new Space document and confirm the type picker shows Essay, Codex, Manifesto, Field Log, Research Document, Archive Note, Transcript.
8. Generate a Developer Space template document for methodology, finding, field_log, and note; confirm the stored `document_type` values are `research`, `research`, `field_log`, and `archive_note`.
9. Run the migration against a database containing legacy alpha document types and confirm no `post`, `constitution`, `update`, or `other` values remain.

## Finish next

Do these immediately after this patch lands:

1. Wire `/studio/publish` to the real document API instead of leaving it as a mostly local drafting surface.
2. Add the publishing approval queue: draft -> grounding check -> human review -> approved/regenerate/cancel -> publish/archive.
3. Move imports onto a real BullMQ/Redis worker: ChatGPT/Claude/Discord parsers, Reddit import, export package generation, memory candidate extraction.
4. Add private archive search across documents, archive items, memory, canon, persona files, imports, and archived chats.
5. Add hard quota checks around import jobs, embedding calls, export generation, and Developer Space ingestion.

## Polish before beta

1. Replace remaining “post” copy in marketing/settings with “document” where it refers to Station publishing, not forum posts.
2. Add a visible provenance label to every published document page.
3. Add a small “source remains private” note to continuity-derived publications.
4. Add an owner-facing document-type filter to `/studio/publishing`.
5. Add a migration smoke test that runs the legacy document-type map against fixture rows.
