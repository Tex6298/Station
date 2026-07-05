# PR487A - Global Archive Result Provenance Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR487A implementation with a narrow review patch:

`docs/roadmap/PR487A_GLOBAL_ARCHIVE_RESULT_PROVENANCE_REVIEW_RESULT.md`

PR487A is a visible owner Global Archive change. It adds compact provenance
readback and owner-safe evidence-route labels to existing `/studio/archive`
result cards without changing backend search contracts.

Because it changes hosted owner-visible UI, MIMIR routes ARIADNE for desktop
and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner. Prefer the existing replay owner if available.

Freshness target:

```text
c2d0a61e web: add archive result provenance readback
```

Hosted web/API should be at `c2d0a61e` or later, or at a deploy-equivalent app
commit if later commits are docs/state/review-only. If freshness is not
deployed, return `DEPLOYMENT_WAITING` with the concrete served commit and stop.

## Required Checks

ARIADNE should verify only the accepted PR487A visible boundary.

1. Hosted health and freshness:
   - web health is ready;
   - API health is ready;
   - served web/app commit is `c2d0a61e`, `30163b2f`, or later, or a clearly
     deploy-equivalent app-code commit.
2. Global Archive overview:
   - signed-in owner can open `/studio/archive`;
   - overview/private-library results render if hosted data has results;
   - result cards show compact provenance readback: source class, owner/private
     visibility, status, persona association when available, match/readback
     reason when available, and evidence-route label when a safe route exists;
   - desktop, `375px`, and `390px` show no horizontal overflow, clipping,
     overlap, unreadable wrapping, or broken touch targets.
3. Private search and filters:
   - owner private search/filter interaction still works if hosted data can
     safely exercise it;
   - search result provenance labels remain present and readable after query or
     filter changes;
   - no public Discover/search route behavior appears inside the private owner
     search flow.
4. No-match, empty, and degraded states:
   - no-match/empty search state is honest and fitted;
   - partial/degraded warning state is checked only if safely available through
     hosted data or no-write test-only interception;
   - no-match/degraded copy does not imply new provider, embedding, Redis,
     Cloudflare, connector, parser, or live import behavior.
5. Evidence links:
   - links route only to existing owner surfaces such as Studio persona routes,
     Import Review, publishing, export/readback, or settings/storage;
   - public/Discover-looking evidence routes are not linked;
   - links do not expose raw ids or secret-shaped values in visible text.
6. Existing surfaces and scope:
   - Global Archive intake remains owner-only and does not change import
     semantics;
   - Import Review remains separate from Global Archive search readback;
   - persona Archive/files, Memory inbox, public Discover/search, public chat,
     billing, Developer Space, and global shell behavior do not drift.
7. Privacy:
   - no private source bodies, full transcripts, document bodies, memory
     content, raw source payloads, raw owner/persona/source/file/import-job/
     candidate/thread/document/memory ids, storage paths, signed URLs, parser
     internals, SQL/table details, stack traces, provider payloads, tokens,
     cookies, keys, hosted logs, bearer/JWT-shaped values, or secret-shaped
     values render.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if hosted desktop/mobile Global Archive overview,
private search/filter behavior, no-match/empty handling, safe degraded-state
handling if available, provenance labels, owner-safe evidence links, existing
surface separation, and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing
provenance labels, broken private search/filter behavior, evidence links to
public routes, mobile layout breakage, misleading degraded copy, Import Review
or intake drift, unwired/placeholder controls, or broken owner evidence links.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR487A visibly
drifts into forbidden backend/API, parser, storage, connector, provider/model,
embedding/retrieval, auth/session, deploy/config, Redis/Cloudflare, billing,
public behavior, broad redesign, or placeholder-control behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR487A Global Archive result provenance hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR487A, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR487A Global Archive result provenance after DAEDALUS added compact owner-private provenance readback and ARGUS patched evidence-route gating.
- This visible owner Global Archive change needs hosted desktop plus 375px/390px mobile human-eye rehearsal before MIMIR closes it.
Task:
- Rehearse hosted /studio/archive at app commit c2d0a61e or later.
- Verify hosted web/API health, overview results, private search/filter results if available, no-match/empty state, partial/degraded warning if safely available, provenance labels, owner-only/private visibility, owner-safe evidence links, Global Archive intake no-drift, Import Review separation, mobile fit, and no private/raw/secret/public/live-connector/placeholder-control drift.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not widen into backend/API routes, migrations, schemas, imports, parsers, storage behavior, archive connectors, OAuth/provider reads, embeddings, retrieval ranking, prompts, models, auth/session, deployment/config, queues/workers, Redis, Cloudflare, billing, public search, Discover, public chat behavior, broad Studio redesign, private readback, or placeholder controls.
```
