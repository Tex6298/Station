# PR365 - Global Archive Private Search Result

Owner: DAEDALUS
Date: 2026-06-26
Status: Ready for ARGUS

## Result

DAEDALUS inspected the Global Archive/private search surfaces and shipped the
smallest safe no-config owner-facing improvement: `/studio/archive` now shows a
private search readback panel that explains the current mode and groups loaded
results by source type, status, and persona.

Changed files:

- `apps/web/components/studio/archive-library.tsx`
- `apps/web/lib/archive-search.ts`
- `apps/web/lib/archive-trust.test.ts`

## Surface Map

Current Global Archive/private search truth:

- `/imports/archive` returns a live owner-only overview across stored archive
  sources.
- `/imports/archive/search` is authenticated, owner-scoped, filtered, and
  sanitized.
- `/studio/archive` is the owner-facing Global Archive page using those routes.
- Search covers documents, archive items, memory items, canon items, persona
  files, import jobs, archived transcripts, continuity records, and Integrity
  Sessions.
- Results link only to existing owner routes such as persona Memory, Canon,
  Files, Timeline, Calibration, persona workspace, and Studio publishing.

Still future:

- new schema, migrations, background workers, queues, Redis, Cloudflare,
  provider changes, new import parsers/connectors, public archive exposure,
  source-body dumps, raw transcripts, and broad Studio redesign.

## Implemented Slice

The Global Archive page now shows a `Private search readback` panel after the
search controls:

- mode label: `Archive overview` for the base overview and `Live private
  search` when filters/query/sort use the backend search route;
- owner-only boundary badge;
- safe copy for populated results, empty search results, empty overview, and
  partial search warnings;
- grouped result chips for source type, status, and persona based on the
  current loaded result set.

The helper layer now has focused coverage for:

- archive search mode labelling;
- owner-only readback copy;
- grouped result counts with fallbacks for blank persona/status/source fields;
- existing backend search path construction.

## Privacy Boundary

No API response shape changed. The panel uses only the items already returned to
the authenticated owner by existing archive routes. It does not fetch public
data, expose raw private source bodies, expose raw transcript text, surface
provider payloads, reveal private IDs, or widen cross-owner access.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 117 tests passed, including archive search readback helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 storage/API tests passed, including owner-scoped sanitized archive search. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 41 archive/conversation/import parser tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | Next lint reported no warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Review Ask

ARGUS should verify:

- the new panel stays owner-only and uses only already-loaded owner archive
  results;
- grouping by source type, status, and persona is useful without implying a
  new search backend;
- empty and partial-search copy is honest about private material remaining
  safe;
- no API, persistence, import parser, embedding, worker, queue, Redis,
  Cloudflare, or public archive behavior changed.
