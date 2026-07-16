# PR528B10 - Public Document Discover Text Search DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for MIMIR routing to ARGUS

```text
READY_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_ARGUS
```

## Result

`GET /discover/search?q=` now searches the existing public document group
through three separate parameterized PostgREST field queries:

1. title;
2. nullable first-class summary; and
3. canonical body.

The queries retain the existing authorized visibility order inside each field:
anonymous callers query only `public`; eligible members query `public`, then
`community`, then `members`.

Results are merged in that field/visibility order, deduplicated by document id,
and only then limited to the existing global eight-document cap. A document
matching title, summary, and body therefore appears once at its highest field
priority.

No raw query text is interpolated into a PostgREST `.or(...)` expression. The
implementation uses only the fixed trusted field allow-list with the existing
parameterized `.ilike(field, value)` builder.

## Preserved Contract

The public document response shape and serializer are unchanged, including:

- id, title, canonical body, and first-class summary;
- document type and authorized visibility;
- safe Space slug linkage;
- public provenance type; and
- linked discussion id.

The lane does not alter thread, Space, persona, Project, Developer Space,
encounter, Salon, or owner-private matching. `privateResults` remains a
separate signed-in owner scope and retains its existing title-only document
query.

## Focused Proof

Community/Discover coverage now proves:

- anonymous title matching still works;
- summary-only and body-only phrases return the public document;
- a multi-field match appears exactly once;
- title matches precede summary matches, which precede body-only matches,
  before the eight-item cap;
- anonymous callers cannot see community/member body matches;
- eligible members see the existing community then members visibility order;
- private, other-owner private, unlisted, draft, and archived body phrases do
  not enter the public document group for anonymous or signed-in owner calls;
- owner-private result buckets do not gain body matching; and
- body-search results preserve summary, body, Space route data, provenance,
  and discussion id exactly.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass: 57 tests |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass: 9 tests |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

## Boundaries

No migration, hosted write, deployment, corpus creation, web reskin, search
index, cache, embedding, Redis, Cloudflare, provider, chat, or private Aster
mutation occurred. PR528B9 still has zero public fixture state pending ARGUS
review, deployment authorization, and a serialized retry.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS added deduplicated public document title/summary/body Discover search with existing visibility boundaries intact.
Verdict:
- READY_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_ARGUS
Task:
- Route ARGUS review before deployment and PR528B9 retry.
```
