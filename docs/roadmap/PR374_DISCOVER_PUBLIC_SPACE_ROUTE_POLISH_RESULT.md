# PR374 - Discover Public Space Route Polish Result

Date: 2026-06-26
Implemented by: A2 / DAEDALUS
Status: accepted by ARGUS.

## Result

DAEDALUS patched the smallest Discover route gap from PR373: normal
`GET /discover/feed?tab=new` now includes standalone public Space feed cards
from existing `spaces.is_public` rows, so `/discover` can visibly route to a
public Space before the reader opens a document or linked discussion.

The Discover card now distinguishes public Spaces from document-in-Space rows
and renders an explicit `Open public Space` cue. The feed controls also include
a `Spaces` filter for already-loaded public-safe feed items.

## Changed Files

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/components/discover/feed-shared.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/discover/search-dropdown.test.ts`
- `apps/web/lib/discover-feed-controls.ts`
- `apps/web/lib/writing-feed.test.ts`
- `docs/roadmap/PR374_DISCOVER_PUBLIC_SPACE_ROUTE_POLISH_RESULT.md`
- `docs/roadmap/PR374_DISCOVER_PUBLIC_SPACE_ROUTE_POLISH_DAEDALUS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Route Caveat Closed

Before PR374, Discover could surface public Space routes indirectly through
document parent data or curated staff-pick rows, but the normal Discover feed
did not return standalone public Space cards.

After PR374:

- public `spaces.is_public = true` rows become feed items with `type: "space"`;
- Space feed items route to `/space/:slug`;
- Discover renders the item as `Space` with `Open public Space`;
- the card does not render confusing `in <same Space>` copy;
- public home still derives public Space cards from feed data.

## Visibility And Privacy Proof

The API feed query selects only bounded public Space fields:

- `id`
- `slug`
- `title`
- `short_description`
- `theme`
- `created_at`
- `updated_at`

The feed includes only `spaces.is_public = true` rows. It rejects unsafe or
UUID-shaped Space slugs before producing `/space/:slug` links. The web search
Space href helper now applies the same slug guard.

Regression coverage proves:

- the public Space appears in `/discover/feed?tab=new`;
- private Spaces do not appear;
- unsafe public Space slugs do not produce public feed links;
- the API response does not leak private Space ids, private Space slugs, unsafe
  UUID-shaped slugs, or the unsafe public Space title;
- Developer Space public/community visibility behavior remains green.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 34 tests passed, including the new public-safe Space feed proof and existing Developer Space discover/search coverage. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/discover/search-dropdown.test.ts apps/web/lib/writing-feed.test.ts` | Pass | 12 focused Discover/search/writing helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 122 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 20 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass | No ESLint warnings or errors. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

## ARGUS Review

Verdict: `PASS`.

ARGUS accepted the public Space feed boundary: standalone Space cards are
sourced only from existing `spaces.is_public = true` rows, expose bounded
public fields, and route through safe slug guards.

ARGUS added one narrow route-safety hardening before acceptance:
document-in-Space Discover feed/search/sidebar links now reuse the same safe
Space slug checks and do not generate `/space/:uuid-or-unsafe/documents/:id`
routes. Unsafe public-space document feed items are dropped instead of
publishing unsafe Space routes.

No private Spaces, owner ids, unsafe public Space titles/slugs, private archive
data, raw JSON/URLs, or secret-shaped values are rendered. No publishing,
approval, document, discussion, schema, worker, queue, Redis, Cloudflare,
provider, billing, auth, hosted runtime, or broad UI semantics changed.

If MIMIR wants hosted route proof after deploy, ARIADNE should rerun the PR373
public route proof.

## Scope Control

No publishing, approval, document, discussion, auth, provider, Redis,
Cloudflare, worker, queue, schema, migration, billing, Station Press, social,
or broad UI behavior changed.

## Review Ask

ARGUS should review the `/discover` Space card route and visibility boundary.
If accepted, ARIADNE should rerun the PR373 hosted route proof after deploy:

```text
/ -> /discover -> public Space -> public document -> linked discussion if present
```
