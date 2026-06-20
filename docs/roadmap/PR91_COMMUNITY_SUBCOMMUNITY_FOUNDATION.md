# PR91 - Community Subcommunity Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: closed by MIMIR on 2026-06-20

## Why This Lane

Community Beta now has forum primitives, moderation/report/review flows, and
current-user notifications. The next missing structural piece is the ability to
model Canon/Developer subcommunities without pretending ordinary seeded forum
categories are the final product surface.

PR91 should add the backend foundation for subcommunity creation and safe
readback. It should not become a broad forum redesign.

## Goal

Add or precisely block a durable subcommunity/category foundation that can
support Canon and Developer community areas.

Desired protected-beta outcome:

- platform can distinguish ordinary forum categories from owned/tier-bound
  subcommunities;
- Canon and Developer subcommunities have stable slugs, titles, descriptions,
  type, visibility, status, owner, and optional linked Station object where
  ownership can be proven;
- creation is gated by existing auth/tier/admin facts and refuses unsupported
  ownership links instead of guessing;
- list/read serializers expose only public-safe fields to anonymous visitors,
  community-safe fields to eligible members, and owner/admin fields only to
  owners/admins;
- existing category and thread reads keep their current public/community/
  unlisted visibility behavior.

## Inspect Before Editing

- `infra/supabase/migrations/004_forum_seed_and_helpers.sql`
- `infra/supabase/migrations/024_community_trust_votes_moderation.sql`
- `infra/supabase/migrations/040_community_notifications.sql`
- `packages/db/src/types.ts`
- `packages/types/src/forum.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/app/forums/*`
- `docs/roadmap/community-beta.md`

## Preferred Implementation Path

1. Prefer a new durable subcommunity shape linked to `forum_categories` so
   existing category reads stay stable. If extending `forum_categories` is
   materially safer in the current schema, document that decision in the PR91
   handoff and keep compatibility with existing routes.
2. Model at least:
   - `slug`, `title`, `description`;
   - `subcommunity_type` such as `general`, `canon`, `developer`;
   - `visibility` such as `public`, `community`, `unlisted`, `private`;
   - `status` such as `active`, `paused`, `archived`;
   - `owner_user_id`;
   - optional linked `space_id` and/or `developer_space_id` only where current
     ownership and visibility rules can be proven.
3. Add bounded API behavior:
   - public/community list/read that returns only visible subcommunities;
   - current-user owner/admin readback where needed for created rows;
   - create route for eligible users/admins only;
   - validation that refuses private or unowned linked Station objects.
4. Keep thread/category behavior stable:
   - anonymous visitors still see only public-readable material;
   - eligible members still see community-readable material;
   - private/unlisted owner-only material does not appear in public lists;
   - thread creation must not bypass category/subcommunity visibility gates.
5. If tier or ownership policy is not expressible with current data, implement
   the safe subset and document the exact blocker. Admin-only creation is
   acceptable as a temporary protected-alpha fallback only if user-owned
   creation cannot be proven safely.

## Guardrails

- No broad forum UI redesign.
- No delegated moderator UI or owner/moderator role platform beyond optional
  schema placeholders needed for safe future work.
- No witness/recognition/reputation mechanics.
- No notification expansion beyond preserving existing PR89/PR90 behavior.
- No AI-autonomous posting or persona posting.
- No billing, provider, Redis/Upstash, Cloudflare, or cache work.
- No Developer Space feature expansion beyond optional verified linking.
- No auth/session refactor.
- No public visibility widening for hidden, removed, private, unlisted,
  archive, prompt, provider, credential, or owner-only material.

## Acceptance

ARGUS can accept PR91 if:

- migration/type surfaces represent the chosen subcommunity/category model;
- creation gates are explicit and tested;
- optional linked Space/Developer Space ownership checks are either proven or
  precisely blocked;
- public/community/owner/admin serializers are separated where needed;
- existing category/thread/comment tests remain green;
- anonymous and non-owner users cannot list or read private owner-only
  subcommunity material;
- the implementation documents any temporary protected-alpha policy fallback.

ARIADNE should rehearse only if visible routes change. If PR91 stays API/schema
only, ARGUS should wake MIMIR directly.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible web routes change, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- chosen schema/model shape and migration number;
- API route summary or exact blocker;
- creation tier/admin/ownership rules;
- serializer visibility rules;
- linked Space/Developer Space validation behavior or exact blocker;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if visible routes changed; otherwise ARGUS
should wake MIMIR with the PR91 verdict. Do not leave the lane asleep.

## ARGUS Review

Accepted on 2026-06-20 as a schema/API-only Community Subcommunity Foundation.
No visible route changed, so ARIADNE rehearsal is not required before MIMIR
closeout.

ARGUS found and patched one safety issue during review: subcommunity category
lookups now fail closed when the lookup errors instead of treating the category
as an ordinary non-subcommunity category. Category lists return `500` on
subcommunity lookup failure, direct category/thread/watch/vote/delete paths use
the same fail-closed helper, and comment parent checks deny reads if
subcommunity visibility cannot be verified.

ARGUS also added hostile direct-access coverage for a private
subcommunity-backed thread/comment:

- non-owner member direct thread read returns `404`;
- non-owner member comment list read returns `404`;
- non-owner member comment vote returns `404`.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

All passed. `git diff --check` reported CRLF normalization warnings only.

## MIMIR Closeout

Closed on 2026-06-20.

PR91 is accepted as the schema/API foundation for Canon/Developer
subcommunities. It adds `community_subcommunities`, linked forum categories,
safe public/community list/read behavior, owner/admin readback, canon-tier/admin
creation for public/community rows, linked public Space/non-private Developer
Space validation, and fail-closed category/thread/comment visibility checks.

The remaining gap is visible product affordance. PR92 should expose the
subcommunity directory/readback and bounded creation flow over the PR91 routes,
then send the result through ARGUS and ARIADNE because visible routes will
change.
