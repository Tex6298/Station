# PR487A - Global Archive Result Provenance Preflight Result

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date reviewed: 2026-07-05

Status: Accepted for DAEDALUS implementation

## Verdict

```text
ACCEPT_PR487A_ARCHIVE_RESULT_PROVENANCE
```

ARGUS accepts PR487A as a web/helper/test-only Global Archive result provenance
readback slice on the existing owner-private archive surface.

## Decision

Do not open a backend search, connector, import, parser, embedding, provider, or
public-search lane for PR487A. The current backend already exposes owner-scoped
`/imports/archive` and `/imports/archive/search` responses with sanitized
summary, source, type, persona, status, match, privacy, and owner-route fields,
and the existing tests cover owner scope, cross-owner exclusion, structured
source redaction, failed-import secret redaction, and no transcript/body leakage.

The smallest useful product-depth slice is therefore the result card/readback
layer on:

```text
/studio/archive
```

Current `/studio/archive` already has honest empty/no-match copy, partial-search
warning copy, owner-only readback, source/status/persona groups, Global Archive
intake, and links to existing owner surfaces. What remains thin is per-result
provenance: owners can see title, source, type, persona, status, match reason,
and "Open source", but the card does not yet clearly explain what kind of owner
record the match came from, whether it is owner-only/private, which existing
owner route the evidence opens, and what persona association is safe to trust.

## Accepted Implementation Boundary

Allowed files:

- `apps/web/components/studio/archive-library.tsx`
- `apps/web/lib/archive-search.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/web/lib/studio-navigation.test.ts`, only to preserve route/no-drift
  assertions if needed
- `apps/web/lib/import-review.test.ts`, only to preserve import-review
  separation/no-drift assertions if needed
- `apps/web/app/globals.css`, only if narrowly scoped Archive provenance styles
  are truly needed instead of existing inline/local styles
- roadmap and validation docs

Do not touch backend/API routes, migrations, schema, import execution, parser
code, storage behavior, archive connector providers, OAuth, live connector
setup, embeddings, retrieval ranking, prompt/model/provider code, auth/session
code, deployment/config, package files, queues/workers, Redis, Cloudflare,
billing, public search, Discover, public chat behavior, or broad Studio shell
design.

## Allowed Product Work

DAEDALUS may add a compact provenance/readback helper and render it on existing
`/studio/archive` result cards or immediately adjacent result readback.

The helper may use only existing archive item fields already returned to the web
surface:

- `kind`;
- `type`;
- `source` / `sourceLabel`;
- `persona` / `personaId`;
- `status`;
- `visibility`;
- `privacy`;
- `href`;
- `match.field` / `match.reason`;
- `date` / `occurredAt`;
- already sanitized `title` and `summary`, through existing owner-visible
  redaction.

The UI may explain:

- safe source class, such as Memory, Canon, file, import job, archived chat,
  continuity, integrity, document, archive, or unknown archive source;
- owner-only/private visibility using existing `privacy` or `visibility`;
- status/readiness from existing `status`;
- persona association, including `Shared/global` and unknown-persona states;
- why a result matched, using sanitized existing match metadata;
- the existing owner evidence destination behind `item.href`, with labels such
  as "Open persona Memory", "Open persona Canon", "Open persona Archive files",
  "Open continuity timeline", "Open Integrity", "Open publishing", or "Open
  Global Archive".

The work may include grouping or count readback by existing source classes if it
uses `archiveSearchGroupCounts` or a similarly narrow helper over already-loaded
items. It may rename "Open source" to a more specific evidence-route label when
that label is derived from the existing `href`/source class.

## Forbidden Claims And Data Exposure

PR487A must not claim or introduce:

- live connectors, OAuth, Reddit/Discord/API pulls, recurring sync, external
  provider reads, partner adapters, or source inventory changes;
- new parser behavior, document conversion, AI summarization, provider/model
  calls, prompt changes, retrieval rewrites, embeddings, re-embedding, or search
  ranking changes;
- new imports, automatic Memory/Canon promotion, automatic continuity linking,
  public writes, public search, public Discover changes, public chat behavior,
  durable route state, schema fields, or migrations;
- new backend endpoints or changed `/imports/archive` or
  `/imports/archive/search` response contracts;
- Redis, Cloudflare, queues/workers, billing, auth/session, deployment/config,
  broad Studio redesign, or placeholder controls.

New provenance copy must not render:

- private source bodies, full transcripts, document bodies, memory content, or
  raw source payloads;
- raw owner, persona, source, file, import-job, candidate, thread, document,
  storage, staging, or database ids;
- storage paths, signed URLs, connector staging keys, OAuth/provider payloads,
  parser internals, SQL/table details, stack traces, tokens, cookies, keys,
  bearer/JWT-shaped values, or secret-shaped values;
- public/Discover routes or labels that imply private archive results are public
  artifacts.

Use `ownerVisibleText` or an equally narrow existing redaction helper for any
owner-visible free text. Do not add ad hoc display of raw `id`, `personaId`, or
private source fields.

## Required No-Drift Tests

DAEDALUS must add or preserve focused tests proving:

- the provenance helper maps memory, canon, persona file, import job, archived
  chat, continuity, integrity, document, archive, shared/global, and unknown
  source classes to honest owner-visible labels;
- visibility/privacy labels stay owner-only/private and never imply public
  Discover/search publication;
- evidence action labels resolve only from existing owner-safe `href` values or
  already-existing owner routes;
- raw UUID-shaped ids, raw persona ids, storage paths, URLs, tokens, cookies,
  keys, bearer/JWT-shaped values, source bodies, JSON source payloads, transcripts,
  and secret-shaped values are not rendered by provenance readback;
- empty/no-match copy and partial/degraded search warning copy remain honest and
  are not replaced by fake result claims;
- `/studio/archive` keeps private search separate from public Discover/search;
- Global Archive intake and Import Review separation remain unchanged.

If DAEDALUS changes route labels or link text in the component, add static
source assertions that the component still uses `ownerVisibleText`, does not add
`/discover` or public search links, and does not introduce route mutation,
placeholder controls, or broad shell styling.

## Required Validation

DAEDALUS must run:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

ARGUS should review the implementation diff against this accepted boundary
before routing ARIADNE.

## Required ARIADNE Rehearsal

Because PR487A is visible owner UI, ARGUS requires ARIADNE hosted rehearsal
after ARGUS accepts the implementation.

ARIADNE should verify hosted web/API health and rehearse desktop plus `375px`
and `390px` mobile viewports.

Required route and states:

- `/studio/archive` overview with owner-private results, if replay data has
  results;
- `/studio/archive` private search with query/filter results, if replay data has
  results;
- no-match/empty state;
- partial/degraded warning state if safely available through hosted data or
  test-only interception without backend changes;
- result cards show source class, owner-only/private visibility, status, persona
  association, match readback, and evidence-route labels without overflow or
  overlap;
- evidence links route only to existing owner surfaces and do not expose public
  Discover/search behavior;
- Global Archive intake remains owner-only and does not change preview/import
  semantics;
- no private source bodies, raw ids, storage paths, signed URLs, provider
  payloads, parser internals, stack traces, bearer/JWT-shaped values,
  secret-shaped values, public-write claims, live connector/OAuth claims,
  automatic import claims, or placeholder controls appear.

## Preflight Validation Performed

ARGUS reviewed the PR487 handoff, PR486A closeout, active status, lane index,
Global Archive web surface, archive search helpers/tests, owner-visible
redaction, backend archive/search mappers, and backend owner-scope/sanitization
tests.

Validation run on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Current empty/degraded readback is already present; result provenance is the narrowest useful PR487A slice and can stay web/helper/test-only. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 38 focused Archive/search/navigation/import-review tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint replayed from cache with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR487A as Global Archive Result Provenance Readback on the existing owner-private /studio/archive surface.
- The lane is web/helper/test-only; backend archive/search routes, imports, connectors, parsers, embeddings, provider calls, public search, and infra are out of scope.
Task:
- Add compact provenance/readback for existing archive results so each card or adjacent readback explains safe source class, owner-only/private visibility, status, persona association, match reason, and the existing owner evidence route.
- Use only already-returned archive item fields: kind, type, source/sourceLabel, persona/personaId, status, visibility, privacy, href, match metadata, date/occurredAt, and already sanitized title/summary through owner-visible redaction.
- Add focused no-drift tests for source-class labels, owner-only/private visibility, safe evidence-route labels, no public Discover/search drift, no raw ids/source bodies/storage paths/secrets, and preservation of empty/degraded search copy, Global Archive intake, and Import Review separation.
Guardrails:
- Touch only apps/web/components/studio/archive-library.tsx, apps/web/lib/archive-search.ts, focused existing web tests, optional narrowly scoped CSS if unavoidable, and docs.
- Do not change APIs, migrations, schemas, import execution, parsers, storage behavior, archive connectors, OAuth, live provider reads, embeddings, retrieval ranking, prompts, models, auth/session, deployment/config, package files, queues/workers, Redis, Cloudflare, billing, public search, Discover, public chat behavior, or broad Studio shell design.
- Do not render private source bodies, full transcripts, document bodies, memory content, raw source payloads, raw ids, storage paths, signed URLs, connector staging keys, provider payloads, parser internals, SQL/table details, stack traces, tokens, cookies, keys, bearer/JWT-shaped values, or secret-shaped values.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
ARIADNE:
- After ARGUS accepts implementation, route hosted desktop/375px/390px rehearsal for /studio/archive, covering overview results, private search results, empty/no-match state, partial/degraded warning if safely available, provenance labels, evidence links to existing owner surfaces only, Global Archive intake no-drift, mobile fit, and no private/raw/secret/public/live-connector/placeholder-control drift.
```
