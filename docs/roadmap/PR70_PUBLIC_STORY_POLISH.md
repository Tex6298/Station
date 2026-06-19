# PR70 - Public Story Polish

Date: 2026-06-19
Status: opened by MIMIR; ready for DAEDALUS implementation
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses public story if
code changes land, MIMIR sequences next.

## Purpose

Improve the config-free public story path proved by PR68.

PR68 passed the anonymous route chain from `/` to `/discover` to public Space,
public document, and linked forum discussion. It also named two caveats:

- the public Space story is thin when authored pages/personas are empty, even
  though Featured Works and Public Library carry the route;
- the linked document discussion is reachable through the document and search,
  but not legible enough from the latest Discover feed.

PR70 should make those caveats feel deliberate and protected-alpha ready without
opening Stripe, Redis, Cloudflare, provider, parser/OAuth, worker, hosted
runtime, Project, billing, DexOS, or broad UI scope.

## Existing Surfaces

Start with:

- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `apps/web/components/discover/feed-shared.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/spaces.test.ts`

## Scope

Implement a bounded public-story polish slice:

- Public Space:
  - make empty authored pages and empty public personas read as optional public
    story modules, not as missing/broken setup;
  - foreground existing published works, public library, provenance, discussion
    status, and public/private boundary when those are the real story;
  - avoid showing `0 pages` / `0 personas` in a way that makes a working Space
    feel unfinished if documents exist.
- Discover feed:
  - keep linked document discussion threads privacy-safe;
  - make document cards with an open discussion clearly route to both the public
    document and the linked discussion, or otherwise make the discussion path
    unmistakable without duplicating/overcounting private threads;
  - if API feed behavior changes, keep public/community/unlisted/private thread
    boundaries covered by tests.
- Public document/thread chain:
  - ensure `Open discussion` and `Read source document` controls remain visible,
    routeable, and not owner-only;
  - ensure anonymous visitors do not see reply/vote/report/owner controls unless
    the current auth policy allows them.
- Mobile:
  - preserve `390px` fit with no document-level horizontal overflow or offscreen
    controls on Discover, public Space, public document, and linked forum thread.

Prefer presentation and route-link clarity over seed-data dependency. If
DAEDALUS finds an existing safe replay seed mechanism that can add authored
public pages or public personas without new config, it may propose that as a
small optional step, but the primary fix should not depend on live manual data
entry.

## Non-Scope

- No Stripe, billing, checkout, webhook, entitlement, or price work.
- No Redis/Upstash implementation or cache/queue/idempotency behavior.
- No Cloudflare retrieval, Vectorize, Worker, or edge adapter work.
- No provider migration, model routing, prompt, embedding, parser/OAuth, worker,
  hosted runtime, Project, DexOS, or developer-agent work.
- No broad redesign of Discover, Spaces, forums, or the whole public shell.
- No new private/public data policy.
- No public exposure of private Studio, Memory, Continuity, Integrity, Archive
  import, Settings AI Activity, Developer Space manage, provider trace, raw
  payload, credential, token, or owner-only data.
- No asking Marty for config.

## Acceptance

ARGUS can accept PR70 if:

- The PR68 public route still passes anonymously from `/` to `/discover` to
  public Space, document, and linked forum discussion.
- Public Space copy and counts make a document-led Space feel intentional even
  when authored pages/personas are empty.
- Discover makes open document discussions visibly reachable without leaking or
  duplicating non-public threads.
- Public/community/unlisted/private visibility boundaries are unchanged or
  strengthened.
- Desktop and `390px` public route fit is safe enough for ARIADNE rehearsal.
- No config-heavy or infrastructure scope is added.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If only web presentation helpers change and no API route behavior changes,
DAEDALUS may justify a narrower test set, but ARGUS should require the
discussion visibility tests if Discover/thread behavior changes.

If a web build is run, record the known Windows standalone symlink `EPERM`
separately from compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- files changed;
- public Space empty-module behavior;
- Discover discussion routing behavior;
- any API feed/search behavior change;
- privacy/visibility boundary proof;
- desktop/mobile fit notes if checked;
- validation results;
- confirmation that no Stripe, Redis, Cloudflare, provider, parser/OAuth,
  worker, hosted runtime, Project, billing, DexOS, broad UI, or config work was
  added.

If ARGUS accepts code changes, wake ARIADNE for an anonymous public story
rehearsal across `/`, `/discover`, public Space, public document, linked forum
discussion, and `390px` mobile. If blocked, wake MIMIR with the exact blocker.
Do not leave the lane silent.
