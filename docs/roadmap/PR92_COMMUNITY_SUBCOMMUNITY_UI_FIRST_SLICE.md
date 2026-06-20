# PR92 - Community Subcommunity UI First Slice

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses visible routes
after ARGUS technical acceptance.
Status: technically accepted by ARGUS; ready for ARIADNE visible-route rehearsal

## Why This Lane

PR91 made Canon/Developer subcommunities real in the backend, but humans cannot
yet see or create them from the product. PR92 should put a small, honest UI over
the accepted API without turning forums into a broad redesign.

## Goal

Expose visible subcommunity readback and bounded creation.

Desired protected-beta outcome:

- forum index distinguishes ordinary categories from Canon/Developer
  subcommunities using the `subcommunity` payload returned by
  `/forums/categories`;
- a visible subcommunity directory lists public/community-readable
  subcommunities from `GET /forums/subcommunities`;
- category detail shows a small subcommunity context header when the category is
  backed by a subcommunity;
- eligible canon/institutional/admin users can create public/community
  Canon/Developer subcommunities through `POST /forums/subcommunities`;
- signed-out and below-tier users do not call owner-only or mutating
  subcommunity routes;
- private/unlisted creation stays unavailable because PR91 intentionally
  deferred it;
- no raw owner ids, linked object ids, private rows, hidden rows, or unsupported
  ownership hints leak into public UI.

## Inspect Before Editing

- `docs/roadmap/PR91_COMMUNITY_SUBCOMMUNITY_FOUNDATION.md`
- `docs/roadmap/community-beta.md`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/services/community-subcommunities.service.ts`
- `packages/types/src/forum.ts`
- `apps/web/app/forums/page.tsx`
- `apps/web/app/forums/[categorySlug]/page.tsx`
- `apps/web/app/forums/[categorySlug]/new/page.tsx`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/auth.ts`
- `apps/web/app/developer-spaces/page.tsx`
- `apps/web/app/space/page.tsx`

## Preferred Implementation Path

1. Add narrow web typing/helper functions for:
   - `GET /forums/subcommunities`;
   - `GET /forums/subcommunities/mine` only after signed-in eligibility is
     known;
   - `POST /forums/subcommunities`.
2. Update `/forums` so subcommunity-backed categories are clearly labeled and
   route to the existing category path. Keep ordinary category rows working.
3. Add a bounded directory surface. A dedicated `/forums/subcommunities` route
   is acceptable; an integrated section on `/forums` is acceptable if it stays
   readable and testable.
4. Add a bounded creation surface for eligible users:
   - type: Canon or Developer;
   - visibility: public or community only;
   - slug/title/description with validation feedback;
   - optional linked Space/Developer Space controls only if existing owner list
     APIs make them safe and simple. Do not expose raw UUID fields as the main
     experience; omit linking from the first UI slice if selectors become a
     detour.
5. Route successful creation to the created category path,
   `/forums/<subcommunity.slug>`.
6. Update `/forums/[categorySlug]` to show subcommunity type/visibility/status
   context from the category payload without exposing owner-only fields to
   visitors.

## Guardrails

- No broad forum redesign or site-wide style overhaul.
- No private/unlisted creation UI.
- No delegated moderator UI or owner/moderator platform.
- No witness/recognition/reputation mechanics.
- No notification expansion.
- No AI-autonomous posting or persona posting.
- No billing, provider, Redis/Upstash, Cloudflare, cache, or config work.
- No Developer Space feature expansion beyond optional safe selector/linking.
- No auth/session refactor.
- No public visibility widening for hidden, removed, private, unlisted,
  archive, prompt, provider, credential, or owner-only material.
- No fake-live controls: every visible action button must either work through
  an accepted route or be absent/unavailable with honest state.

## Acceptance

ARGUS can accept PR92 if:

- signed-out visitors do not fetch `/forums/subcommunities/mine` or call
  `POST /forums/subcommunities`;
- below-tier signed-in users do not see live creation controls or mutating
  calls;
- eligible users can create public/community Canon/Developer subcommunities and
  land on the created category route;
- public/community list/read UI uses PR91 serializers and does not show owner
  ids, linked object ids, private/unlisted rows, hidden rows, or unsupported
  internals;
- category detail displays subcommunity context without breaking ordinary
  categories;
- mobile and desktop layouts avoid horizontal overflow and offscreen primary
  controls;
- no broad redesign or unrelated community feature is added.

ARIADNE must rehearse visible routes after ARGUS technical acceptance.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Also run the web build because forum visible routes change:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- visible routes changed;
- helper/API calls added;
- signed-out/below-tier/eligible behavior;
- creation form behavior and any linked-object selector decision;
- fields shown and fields deliberately hidden;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if accepted. ARIADNE should wake MIMIR after visible
route rehearsal, or DAEDALUS with exact defects. Do not leave the lane asleep.

## ARGUS Review

Technically accepted on 2026-06-20. PR92 changes visible forum routes, so
ARIADNE must rehearse `/forums`, `/forums/subcommunities`, and a
subcommunity-backed category route before MIMIR closes the lane.

ARGUS found and patched one directory privacy issue during review:
`/forums/subcommunities` is called with the restored session token so eligible
members can see community rows, but owner/admin API responses can also include
private, unlisted, paused, or archived rows. The web directory now filters
readback to active public/community subcommunities before rendering, with helper
coverage for private/unlisted/inactive suppression.

ARGUS confirmed:

- signed-out visitors do not see live creation controls or call mutating
  subcommunity routes;
- below-tier signed-in users do not see live creation controls;
- eligible canon/institutional/admin users post only type, public/community
  visibility, slug, title, and description;
- linked Space/Developer Space selectors remain deferred, so no raw UUID field
  is exposed;
- forum index and category detail use the category serializer payload for
  type/visibility/status context;
- no owner ids, linked object ids, hidden rows, private/unlisted directory rows,
  or unsupported ownership hints are rendered.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

All tests and typecheck passed. The web build compiled, linted/typechecked,
collected page data, and generated 35 pages before the known local Windows
standalone symlink `EPERM`.
