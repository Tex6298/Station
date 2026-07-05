# PR487A - Global Archive Result Provenance Result

Date: 2026-07-05

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Result

DAEDALUS implemented the accepted web/helper/test-only Global Archive result
provenance readback slice on the existing owner-private `/studio/archive`
surface.

The work stays inside the accepted boundary:

- `apps/web/components/studio/archive-library.tsx`;
- `apps/web/lib/archive-search.ts`;
- `apps/web/lib/archive-trust.test.ts`;
- roadmap and validation documentation.

No backend/API route, migration, schema, import execution, parser, storage
behavior, archive connector, OAuth/live provider, embedding, retrieval ranking,
prompt/model/provider, auth/session, deployment/config, package, queue/worker,
Redis, Cloudflare, billing, public search, Discover, public chat behavior,
broad Studio shell design, or CSS change was made.

## Implemented Boundary

- Added `archiveResultProvenanceReadback` for source class, owner/private
  visibility, status, persona association, match reason, and evidence-route
  label.
- Added `archiveResultEvidenceHref` so only existing owner-safe `/studio` and
  `/settings` routes get evidence links; public/Discover-looking routes are not
  linked by the provenance readback.
- Rendered compact provenance chips and match copy on existing Global Archive
  result cards.
- Replaced generic `Open source` result action text with owner evidence labels
  such as `Open persona Memory`, `Open persona Canon`,
  `Open persona Archive files`, `Open continuity timeline`, `Open Integrity`,
  `Open publishing`, `Open Global Archive`, or `Open owner Studio`.
- Continued to use `ownerVisibleText` plus route-local redaction for
  owner-visible source, status, persona, and match metadata.
- Preserved empty/no-match copy, partial/degraded search warning copy, Global
  Archive intake, Import Review separation, private search boundaries, and
  existing Archive fetches.

## Explicit Non-Scope

No live connector, OAuth, Reddit/Discord/API pull, recurring sync, external
provider read, partner adapter, source inventory change, parser behavior,
document conversion, AI summarization, provider/model call, prompt change,
retrieval rewrite, embedding/re-embedding, search ranking change, new import,
automatic Memory/Canon promotion, automatic continuity linking, public write,
public search, public Discover change, public chat behavior, durable route
state, schema field, migration, Redis, Cloudflare, queue/worker, billing,
auth/session, deployment/config, broad redesign, or placeholder control was
added.

No private source body, full transcript, document body, memory content, raw
source payload, raw id, storage path, signed URL, connector staging key,
OAuth/provider payload, parser internal, SQL/table detail, stack trace, token,
cookie, key, bearer/JWT-shaped value, secret-shaped value, or public/Discover
label implying private archive publication was introduced.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 41 focused Archive/search/navigation/import-review tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint completed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## ARGUS Review Request

ARGUS should review:

- source-class and owner evidence labels are derived only from already-returned
  owner-private archive item fields;
- public/Discover-looking evidence routes do not receive links;
- owner-visible redaction prevents raw/private/secret-shaped readback;
- empty/degraded copy, Global Archive intake, Import Review separation, and
  private/public search boundaries remain unchanged;
- no backend/API/import/parser/connector/OAuth/embedding/provider/prompt/infra/
  public-search/broad-redesign scope entered the patch.

If accepted, ARGUS should wake MIMIR with `WAKEUP A1:` so MIMIR can route the
required ARIADNE hosted desktop, `375px`, and `390px` rehearsal for
`/studio/archive`.
