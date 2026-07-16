# PR528C7 - Public Document Discover Text Search Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted with narrow ARGUS validation patch

```text
ACCEPT_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_DEPLOYMENT
```

## Verdict

DAEDALUS commit `da520604a7ee1e4b6e09f1149c562c4f83213d8b`
implements the requested public-document Discover lane without widening another
search group or owner-private scope. No production-source blocker was found.

ARGUS added test-only query logging and hostile assertions because the submitted
behavioral test did not directly prove the exact anonymous/member query count,
field/visibility order, or every owner-private bucket's retained search field.
The strengthened proof passes and no production repair was required.

## Public Query Contract

The implementation uses a fixed trusted field list in this order:

1. `title`;
2. nullable `summary`; and
3. canonical `body`.

Each field uses a separate parameterized `.ilike(field, value)` builder query.
There is no raw `.or(...)` interpolation and the field name cannot come from the
request.

The focused harness now records the actual builder chain executed by the route.
It proves:

- anonymous search executes exactly three document text queries, all
  `status = published` and `visibility = public`;
- an eligible signed-in member executes exactly nine public-group document
  queries in `title`, `summary`, `body` order, with `public`, `community`,
  `members` order inside each field;
- every public query retains the existing eight-row per-query limit and exact
  public response select; and
- the signed-in owner-private document query remains a separate tenth query,
  owner-scoped by `author_user_id`, title-only, updated-time ordered, and capped
  at eight.

## Merge And Cap

Rows are flattened in query order, deduplicated by document id, and then stopped
at eight unique documents. A document matching all three fields therefore
appears once at its highest field/visibility priority.

The hostile fixture contains ten eligible rows spanning title, summary, and body
matches, including one row matching all fields. It proves title rows precede
summary-only rows, summary-only rows precede body-only rows, duplicate matches do
not consume the global cap, and the final result contains eight unique rows.
This would fail if the global cap were applied before deduplication or if the
field queries were prematurely starved.

## Visibility And Private Separation

All public-group queries require `status = published` and one of the caller's
existing discoverable visibilities. Focused proof excludes private,
cross-owner private, unlisted, draft, and archived documents. Anonymous callers
cannot receive community or members rows; eligible members retain public,
community, then members priority.

`privateResults` remains signed-in, owner-scoped, and structurally separate.
ARGUS placed the same punctuation-bearing phrase in a public document body and
in non-title/non-name content across the owner's private document, continuity,
memory, canon, file, import, and archived-chat rows. The public document matched
through body search while all seven private buckets remained empty.

Recorded private queries prove the retained fields are exactly:

- document, continuity, memory, canon, and archived chat: `title`;
- archive file: `file_name`; and
- import job: `source_name`.

Every private query retains the exact owner predicate and eight-row cap. Public
body search therefore does not bridge into private documents, memory, archive,
continuity, imports, files, or archived chats.

## Response And Builder Behavior

The public result serializer is unchanged: id, title, body, nullable summary,
document type, visibility, provenance type, linked discussion id, and safe Space
slug are preserved. No thread, Space, persona, Project, Developer Space,
encounter, Salon, or other non-document matching was broadened.

ARGUS also exercised the installed `@supabase/supabase-js` PostgREST builder
against a local capture fetch. An ordinary phrase containing an apostrophe,
comma, parentheses, plus sign, and period remained one encoded `summary=ilike`
parameter alongside exact status, visibility, and limit parameters. A nullable
summary value decoded as `null` without error. PostgreSQL `NULL ILIKE pattern`
does not match, so nullable summary rows do not create false positives. No
wildcard escaping or full-text-search behavior was added to this bounded lane.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass: `57/57` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass: `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `node .station-private/pr528c7/postgrest-check.cjs` | Pass: exact parameter capture and nullable decode |
| `git diff --check` | Pass |

The npm launcher repeated only its existing warnings for pnpm-specific npm
configuration keys.

## Scope

The ARGUS patch changes only the community test harness and this result. No
migration, deployment, hosted runtime, public-corpus write, provider call,
cache, queue, billing, Cloudflare, UI, secret, or private Aster mutation was
performed. PR528B9 remains at its existing zero-state until MIMIR serializes
deployment and explicitly resumes that operation.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed public document title/summary/body Discover search and its visibility/dedupe boundaries.
Verdict:
- ACCEPT_PR528B10_PUBLIC_DOCUMENT_DISCOVER_TEXT_SEARCH_FOR_DEPLOYMENT
Task:
- If accepted, serialize deployment and resume the still-zero-state PR528B9 corpus operation.
```
