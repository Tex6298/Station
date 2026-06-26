# PR362 - Writing Authoring MVP Gap Map

Owner: DAEDALUS
Date: 2026-06-26
Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- MIMIR closed PR361 as PASS; Developer Space status-note source is proved on hosted Railway.
- The next no-config product slice moves away from Developer Spaces so Phase 2 does not get swallowed by observatory work.
- Product docs still name native document versioning and richer authoring as open MVP gaps.
Task:
- Map current Writing/document authoring/versioning surfaces against the Station publishing promise.
- Inspect /writing, /studio/publish, /space/:slug/documents/new, /space/:slug/documents/:documentId, document version routes, and linked discussion routes.
- If a smallest safe no-config implementation slice is obvious, patch it and wake ARGUS.
- If not, create a result doc with a ranked first implementation recommendation and wake MIMIR.
```

## Product Why

Station's public and creator loop is:

```text
private source material -> authored Station document -> public Space -> public
document -> linked forum discussion -> durable archive/export/readback
```

Recent lanes proved the public routeability pieces:

- Discover/Writing browsing controls are deployed.
- Public Space/document/discussion chains have hosted evidence.
- Developer Space observatory storytelling and project updates are deployed.

The remaining product gap is not another public browsing pass. It is whether
the creator-side writing flow feels durable enough: draft, edit, publish,
version readback, discussion handoff, and clear private/public boundaries.

## Scope

Inspect and map:

- `/writing`
- `/studio/publish`
- `/space/:slug/documents/new`
- `/space/:slug/documents/:documentId`
- document create/update/publish/version APIs
- linked document discussion affordances
- existing tests for writing, documents, discussions, continuity publication,
  and public Space route safety

Allowed patch shape if bounded:

- visible version/readback affordance for an already-versioned document;
- clearer edit/draft/publish continuation for an existing document;
- safer route/action copy that distinguishes private draft, public copy, and
  discussion thread;
- focused helper/test coverage for the selected surface.

## Non-Scope

- Do not add a rich-text editor dependency in this lane unless the current code
  makes it trivial and low-risk.
- Do not open Station Press, print-on-demand, Stripe, fulfilment, shipping,
  billing, Redis, Cloudflare, queues, workers, providers, migrations, public
  launch, anonymous durable visitor chat, or broad site restyling.
- Do not change visibility semantics or publish private source bodies.
- Do not redesign all public Writing, Space, and Studio pages at once.

## Acceptance Shape

If code changes land, wake ARGUS with:

- changed files and exact user-visible behavior;
- visibility/privacy boundary;
- validation commands run;
- known warnings or blockers.

If no code changes land, wake MIMIR with:

- current surface map;
- exact first implementation slice recommendation;
- why the alternatives are deferred.
