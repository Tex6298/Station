# PR509A - Public Encounter Exhibit Index Result

Owner: DAEDALUS / A2

Date: 2026-07-11

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the accepted PR509A slice:

- `GET /persona-encounters/public-exhibits` now returns a bounded public list
  of metadata-only public encounter exhibits;
- `/encounters` now renders a dedicated public exhibit index;
- `/encounters/[slug]` remains the detail route and the only public exhibit
  report surface;
- no Discover/feed/search, public persona, public Space, forum, Station Press,
  package, lockfile, migration, provider, retrieval, billing, social, Redis,
  Cloudflare, queue, worker, storage, or schema-visible feature work entered
  this lane.

## Files Changed

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/app/encounters/page.tsx`
- `apps/web/app/encounters/[slug]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `docs/roadmap/PR509A_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No Supabase migration was added. The existing public exhibit table already has
the required status, removal, slug, publish date, and source linkage columns for
this bounded list.

## API List Contract

Endpoint:

```text
GET /persona-encounters/public-exhibits
```

Query:

- `limit`: optional; defaults to `12`, clamps to `1..24`;
- `cursor`: optional opaque base64url cursor containing only public
  `publishedAt` plus public slug.

Response:

```text
{
  exhibits: [
    {
      slug,
      routeHref,
      title,
      summary,
      tags,
      personas: { label, initiatorName, responderName },
      status,
      publishedAt,
      provenance
    }
  ],
  pagination: { limit, nextCursor }
}
```

The route lists only rows that are:

- `status = published`;
- `removed_at is null`;
- not owner-retracted;
- valid public slugs;
- backed by an existing private encounter source row;
- stamped with the public exhibit provenance schema.

Internal owner ids, persona ids, private session ids, private artifact ids,
report counts, moderation state, raw setup, generated reply text, provider
payloads, prompts, source bodies, private curation, and admin/report internals
are used only server-side and are not serialized.

## Web Behavior

`/encounters` loads the public list endpoint and renders repeated cards linking
to the existing `/encounters/[slug]` detail route. Cards show public title,
summary, tags, same-owner display snapshots, publish date, and the metadata-only
provenance label.

The index does not render report controls. Reporting remains on the detail page.

The existing detail not-found state now links back to `/encounters` instead of
Discover.

## Pagination And Ordering

Ordering is:

```text
published_at desc, slug desc
```

The slug tie breaker keeps same-timestamp pages deterministic. `nextCursor`
encodes the last returned row's public `publishedAt` and public slug; it does
not expose raw owner, persona, private session, private artifact, report, or
admin ids.

## Privacy Proof

Focused tests prove:

- public list returns only published, non-removed source-backed exhibits;
- retracted, removed, malformed, wrong-schema, and deleted-source rows are
  hidden;
- public list payload omits `reportedCount`, report controls, owner ids,
  persona ids, private session ids, setup text, generated private reply text,
  hidden-row public summaries, report/admin internals, and raw database field
  names;
- list order, limit clamping, cursor continuation, and invalid cursor failure
  are deterministic;
- owner retract removes an exhibit from both detail and list;
- the web `/encounters` page uses the list helper, links cards to detail, and
  does not render report controls or off-scope public-surface copy.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 37 tests passed, including public list, cursor, hidden-row, owner-retract, and web helper/page-source coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown and owner-retracted restore protection remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed; Discover/writing/public-persona/public-Space helpers remain unchanged and green. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 41 tests passed; Discover/search/forum/community public-safe routes remain green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; Studio and public encounter helper scans remain green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging the PR509A implementation and docs. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR509A public encounter exhibit index.
- The implementation adds only a dedicated `/encounters` page and bounded public list API for metadata-only published, non-removed public encounter exhibits.
- Discover/search/feed, persona, Space, forum, Station Press, transcript/excerpt, provider, retrieval, billing, social, Redis, Cloudflare, queue, storage, package, and lockfile scope remain untouched.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- run test:writing
- npm exec --yes pnpm@10.32.1 -- run test:community
- npm exec --yes pnpm@10.32.1 -- run test:studio-ui
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review PR509A for metadata-only public index safety.
- Confirm no private material or off-scope public surfacing entered.
- If accepted, wake MIMIR for hosted proof routing.
```
