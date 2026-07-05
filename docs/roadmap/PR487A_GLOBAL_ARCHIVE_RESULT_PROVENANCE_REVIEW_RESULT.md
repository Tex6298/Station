# PR487A - Global Archive Result Provenance Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Date reviewed: 2026-07-05

Status: Accepted with ARGUS patch - ready for MIMIR to route ARIADNE

## Verdict

```text
ACCEPT_PR487A_ARCHIVE_RESULT_PROVENANCE_IMPLEMENTATION
```

ARGUS accepts DAEDALUS' PR487A implementation with a narrow review patch.

## Review Summary

The implementation matches the accepted PR487A boundary:

- touched only the existing Global Archive component, archive-search helper,
  focused archive trust tests, roadmap docs, and validation docs;
- added `archiveResultProvenanceReadback` for source class, owner/private
  visibility, status, persona association, match reason, and evidence-route
  label;
- added `archiveResultEvidenceHref` so only owner-safe Studio/settings evidence
  routes get links and public/Discover-looking routes are not linked;
- rendered compact provenance readback on existing `/studio/archive` result
  cards;
- preserved empty/no-match copy, partial/degraded search warning copy, Global
  Archive intake, Import Review separation, private search boundaries, and
  existing Archive fetches;
- added focused tests for provenance labels, owner-private visibility,
  evidence-route labels, no public search drift, redaction, and no-drift
  component boundaries.

## ARGUS Patch

ARGUS made a narrow review patch in `apps/web/lib/archive-search.ts` and
`apps/web/lib/archive-trust.test.ts`.

The patch:

- normalizes the legacy `/studio/personas/[personaId]/timeline` evidence href to
  the existing owner route `/studio/personas/[personaId]/continuity`;
- labels the actual `/studio/publishing` route as `Open publishing`;
- rejects scheme-relative hrefs, encoded-dot hrefs, and normalized
  public/Discover route escapes such as `/studio/../discover/private-result`;
- extends focused tests for those route-normalization and public-route gate
  cases.

No backend/API contract was changed.

## Boundary Checks

Privacy, auth, and owner-scope boundaries remain intact:

- no API route, migration, schema, import execution, parser, storage behavior,
  archive connector, OAuth/live provider, embedding, retrieval ranking,
  prompt/model/provider, auth/session, deployment/config, package,
  queue/worker, Redis, Cloudflare, billing, public search, Discover, public chat
  behavior, broad Studio shell design, CSS, or placeholder control entered
  scope;
- provenance copy derives from already-returned archive item fields only and
  does not read private source bodies, full transcripts, document bodies, memory
  content, raw source payloads, or raw ids;
- `ownerVisibleText` and route-local redaction protect owner-visible source,
  status, persona, and match metadata;
- evidence links are limited to owner-safe `/studio` and `/settings` routes
  after normalization;
- public/Discover-looking routes do not receive evidence links;
- Global Archive intake remains unchanged and Import Review remains separate;
- no live connector, OAuth/API pull, recurring sync, provider call, parser
  behavior, embedding/re-embedding, search ranking change, automatic import,
  automatic Memory/Canon promotion, automatic continuity linking, public write,
  or public-search claim was introduced.

## Validation

ARGUS reran the requested validation on 2026-07-05 after the review patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Reviewed helper redaction, evidence-link gating, component wiring, docs, tests, and wakeup commit. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 41 focused Archive/search/navigation/import-review tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck ran fresh and passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint ran fresh with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Required ARIADNE Rehearsal

Because PR487A is visible owner UI, ARGUS still requires hosted browser
rehearsal before MIMIR closes the lane.

MIMIR should route ARIADNE to verify hosted web/API health and rehearse desktop
plus `375px` and `390px` mobile viewports.

Required route and states:

- `/studio/archive` overview with owner-private results, if replay data has
  results;
- `/studio/archive` private search with query/filter results, if replay data has
  results;
- no-match/empty state;
- partial/degraded warning state if safely available through hosted data or
  test-only interception without backend changes;
- result cards show source class, owner-only/private visibility, status, persona
  association, match readback, and evidence-route labels without overflow,
  clipping, or overlap;
- evidence links route only to existing owner surfaces and do not expose public
  Discover/search behavior;
- Global Archive intake remains owner-only and does not change import semantics;
- Import Review remains separate from Global Archive search readback;
- no private source bodies, raw ids, storage paths, signed URLs, provider
  payloads, parser internals, stack traces, bearer/JWT-shaped values,
  secret-shaped values, public-write claims, live connector/OAuth claims,
  automatic import claims, or placeholder controls appear.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted DAEDALUS' PR487A Global Archive result provenance implementation with a narrow review patch.
- The patch normalized owner evidence routes for continuity/publishing and hardened evidence-link gating against public-route escapes.
- Provenance labels, owner-safe evidence links, redaction, empty/degraded copy, Global Archive intake, Import Review separation, and validation all passed.
Task:
- Route ARIADNE hosted rehearsal for PR487A before lane closeout.
- Require hosted web/API health plus /studio/archive on desktop, 375px, and 390px.
- Cover overview results, private search/filter results, no-match/empty state, partial/degraded warning if safely available, provenance labels, owner-only/private visibility, owner evidence links, Global Archive intake no-drift, Import Review separation, mobile fit, and no private/raw/secret/public/live-connector/placeholder-control drift.
Guardrails:
- Do not treat ARGUS acceptance as hosted visual proof; ARIADNE still needs real browser rehearsal.
- Do not route new DAEDALUS feature work unless ARIADNE finds a concrete product defect.
- Keep backend/API routes, migrations, schemas, imports, parsers, storage behavior, archive connectors, OAuth/provider reads, embeddings, retrieval ranking, prompts, models, auth/session, deployment/config, queues/workers, Redis, Cloudflare, billing, public search, Discover, public chat behavior, broad Studio redesign, private readback, and placeholder controls out of scope.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-trust.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
```
