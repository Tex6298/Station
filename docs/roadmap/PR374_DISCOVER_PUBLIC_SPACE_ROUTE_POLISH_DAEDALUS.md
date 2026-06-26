# PR374 - Discover Public Space Route Polish

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: DAEDALUS. ARGUS reviews the route/visibility boundary if code changes.
ARIADNE reruns the hosted public route after acceptance.
Status: ready for ARGUS review.

## Why This Lane

PR373 passed the hosted publishing-trust rehearsal with one route caveat:
Discover could reach the public Space path only through feed data, not through a
clean visible public Space card/link on the Discover page.

That matters because the intended public chain is:

```text
/ -> /discover -> public Space -> public document -> linked discussion
```

The document trust and owner publishing dashboard are safe. This lane is only
about making the public Space step visible and routeable from Discover.

## Goal

Patch the smallest user-facing Discover gap so a public reader can see and use a
plain public Space entrypoint before opening a document.

Good outcomes include:

- a visible public Space card/section on `/discover` sourced from existing
  public feed/search data;
- an existing feed `space` item rendered with clearer Space affordance and
  link text;
- a stable `Open public Space` link where Discover already has public Space
  data but hides the route inside a generic card.

Keep the route honest: do not fake a Space card if the backend returns no
public Space data. In that case, show a clear empty/caveat state and wake
MIMIR with the data gap.

## Likely Files

Inspect first:

- `apps/web/components/discover/discover-front-door.tsx`;
- `apps/web/components/discover/public-home.tsx`;
- `apps/web/lib/discover-feed-controls.ts`;
- current Discover tests around feed/search controls.

Use the existing Discover style and data model. Avoid broad UI reskins.

## Acceptance

The patch should make this route visible on desktop and mobile:

```text
/discover -> public Space -> public document -> linked discussion if present
```

Acceptance checks:

- public Space entrypoint is visible and keyboard/click routeable;
- labels distinguish Space, document, discussion, Developer Space, and forum
  entries;
- no private Spaces, private archive data, owner IDs, document IDs, thread IDs,
  raw JSON, raw URLs, or secret-shaped values are rendered;
- existing public feed/document/discussion visibility rules are unchanged;
- no publishing, approval, document, discussion, schema, worker, queue, Redis,
  Cloudflare, provider, billing, or auth semantics change.

## Validation

If code changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web lint
git diff --check
```

If a narrower Discover test exists, run it too.

## Handoff

If DAEDALUS patches code, wake ARGUS with:

- changed files;
- exact route caveat closed;
- proof public Space data remains visibility-safe;
- validation results;
- whether ARIADNE should rerun PR373 as a hosted route proof.

If no code patch is needed because hosted data or API shape is the blocker,
wake MIMIR with:

- the exact data/API gap;
- whether the public Space entrypoint can be seeded or exposed without code.

## DAEDALUS Result

DAEDALUS implemented the narrow Discover route/readback patch on 2026-06-26:
`docs/roadmap/PR374_DISCOVER_PUBLIC_SPACE_ROUTE_POLISH_RESULT.md`.

Summary:

- `GET /discover/feed?tab=new` now includes standalone public Space items from
  existing `spaces.is_public` rows.
- Space feed links are route-safe and reject unsafe or UUID-shaped slugs.
- `/discover` renders Space feed cards with an explicit `Open public Space`
  cue and a `Spaces` filter.
- Public/private Space visibility and existing Developer Space discover/search
  behavior are covered by focused tests.

Current baton: ARGUS should review PR374. If accepted, ARIADNE should rerun the
hosted public route proof after deploy.
