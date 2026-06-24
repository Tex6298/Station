# PR247 - Public Project Evidence Hosted Rehearsal

Owner: ARIADNE
Reviewer: MIMIR
Status: Complete - PASS
Opened: 2026-06-24
Reviewed: 2026-06-24

## Frame

PR246 added a minimal visitor-safe `publicEvidence` bucket to the public Project
profile route and ARGUS accepted the implementation with one narrow web fallback
patch. Because this changes anonymous public API payload and public Project page
UI, hosted desktop/mobile proof is required before closeout.

This rehearsal must stay narrow. It proves public evidence readback only. It
does not open private evidence, direct document links, membership, exports,
billing, provider/model execution, Redis, Cloudflare, queues, or broad Project
UI redesign.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed code commit: `756ebab` or later.

If web or API `/health/deployment` reports an older commit, return `BLOCKED`
with the observed commit and do not judge the fix.

## Seed

Prefer an existing public Project if it already has:

- a same-owner attached public Developer Space;
- a public `developer_space_documents` link row;
- a same-owner published public document.

If no suitable seed exists, create one bounded public rehearsal Project/evidence
fixture through existing owner APIs only. Do not print secrets or private body
material, and do not broaden product scope.

## Required Checks

1. Confirm web and API `/health/deployment` are healthy, ready, on branch
   `main`, and report commit `756ebab` or later.
2. Exercise anonymous API `GET /projects/public/:slug` for a Project with
   public evidence.
3. Confirm `publicEvidence` is present and contains at least one item with only:
   `title`, `kind`, `href`, `sourceLabel`, `publishedAt`, and `updatedAt`.
4. Confirm every `publicEvidence.href` points only to `/developer-spaces/:slug`.
5. Confirm `sourceLabel` is fixed safe copy, not raw source labels or internal
   source types.
6. Open the public Project page anonymously on desktop and around `375px`
   mobile.
7. Confirm the page renders public references/evidence clearly, without layout
   overlap or horizontal overflow.
8. Click a public evidence card and confirm it opens the public Developer Space
   route without login or owner-route leakage.
9. Exercise a public Project with no public evidence or private-only evidence,
   if available, and confirm the state is neutral: `publicEvidence: []` and no
   copy implying hidden private evidence exists.
10. Confirm invalid, UUID-shaped, private, and unsafe Project slugs remain
    closed.

## Must Not Appear

Visible UI or API payloads must not expose:

- Project ids;
- Developer Space ids;
- document ids;
- owner ids, author ids, owner id field names, author id field names, member
  rows, role rows, invite rows, or connection tier;
- link-row ids, source ids, raw source labels, raw source types, source bodies,
  document bodies, document excerpts, private/draft document routes, or direct
  document evidence links;
- private evidence counts or hints that private evidence exists;
- activity counters, reports, exports, billing, hosted runtime, provider/model
  execution, ingestion keys, webhook secrets, env values, service keys, SQL,
  stack traces, raw JSON blobs, Redis, Cloudflare, queues, workers, or caches.

Visible copy must not claim:

- institution/lab/company ownership;
- collaboration or membership;
- unpublished/private research access;
- exports;
- billing;
- hosted runtime;
- provider/model execution;
- queues, Redis, or Cloudflare.

## Result Rules

Return `PASS` only if hosted deployment is fresh, public evidence appears for a
valid public-evidence seed, cards route only to public Developer Space pages,
empty/private-only evidence stays neutral, desktop/mobile fit, and the payload
boundary is clean.

Return `FAIL` if hosted deployment is fresh but evidence is missing for a valid
seed, exposes forbidden fields, routes to owner/private/document URLs, leaks or
hints private evidence, breaks public Project profile rendering, or misleads
visitors about deferred capabilities.

Return `BLOCKED` if Railway is stale, auth/setup cannot locate or create a
usable public evidence seed, or the route cannot be exercised without
broadening scope.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR247 Public Project Evidence Hosted Rehearsal.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, close the PR246/PR247 public Project evidence loop and choose the
  next lane.
- If FAIL/BLOCKED, route exact hosted defects to DAEDALUS or ARGUS.
```

## ARIADNE Result - 2026-06-24

Verdict: `PASS`.

Hosted evidence:

- Web and API `/health/deployment` were healthy, ready, on branch `main`, and
  at required commit `756ebab` or later.
- Replay owner sign-in succeeded from local `.env` without printing credentials
  or tokens.
- Used bounded public Project seed
  `ariadne-pr247-public-evidence-20260624`, created/attached through existing
  owner APIs only.
- Anonymous `GET /projects/public/:slug` returned `publicEvidence` with public
  evidence items using only `title`, `kind`, `href`, fixed `sourceLabel`,
  `publishedAt`, and `updatedAt`.
- Every `publicEvidence.href` pointed only to `/developer-spaces/:slug`; no
  document, owner, Studio, or private route appeared.
- `sourceLabel` was fixed safe copy, `Public Developer Space`; raw source labels
  and source types did not appear.
- Anonymous desktop and `375px` mobile public Project pages rendered the Public
  references section and evidence card clearly, with no horizontal overflow.
- Clicking the public evidence card opened the public Developer Space route
  without a login redirect or owner-only controls.
- The no-evidence public Project seed
  `ariadne-pr240-public-profile-202606241001` returned `publicEvidence: []` and
  the visible empty state did not imply hidden private evidence exists.
- Invalid, UUID-shaped, unsafe, and private Project slugs remained closed.
- Public Project API/UI checks stayed clean: no Project ids, Developer Space
  ids, document ids, owner/author fields, member/invite/role rows, connection
  tier, raw source data, document body/excerpt, private evidence hints,
  activity, reports, exports, billing, hosted runtime, providers, Redis,
  Cloudflare, queues, workers, secrets, SQL, stack traces, or raw JSON.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr247-public-project-evidence-rehearsal.spec.js --reporter=line --workers=1`
  passed with 1 hosted rehearsal test.

Next:

- MIMIR closes the PR246/PR247 public Project evidence loop and chooses the next
  lane.
