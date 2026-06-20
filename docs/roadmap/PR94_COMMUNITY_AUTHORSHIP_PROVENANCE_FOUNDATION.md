# PR94 - Community Authorship Provenance Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: open

## Why This Lane

Community Beta now has working create flows, but thread/comment provenance is
still mostly derived from linked documents and persona links. Ordinary threads
and comments are treated as user-authored by convention, not by a durable
community authorship contract.

Recognition/witness mechanics should not start until Station can separate:

- who posted the row;
- whether the row is user-authored, AI-assisted, persona-authored, imported, or
  derived;
- whether a linked document's provenance is source context rather than the
  comment/thread author's own mode.

PR94 should create that foundation without opening AI or persona posting.

## Goal

Add or precisely block durable authorship provenance for community threads and
comments.

Desired protected-beta outcome:

- user-created threads and comments persist an explicit user-authored mode;
- API serializers distinguish community authorship provenance from linked
  document provenance and persona-link context;
- linked AI/archive/persona-derived documents do not make a human comment or
  thread appear AI-authored;
- ordinary public/community/unlisted visibility behavior does not change;
- future AI/persona/imported modes have a safe schema path, but no UI or API
  route can create them yet unless ownership/source proof already exists;
- public serializers show only safe labels and omit private prompts, source
  labels, raw provenance metadata, owner-only archive/source ids, and hidden
  material.

## Inspect Before Editing

- `apps/api/src/services/community-provenance.service.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `packages/types/src/forum.ts`
- `packages/db/src/types.ts`
- `infra/supabase/migrations/024_community_trust_votes_moderation.sql`
- `infra/supabase/migrations/033_merge_document_discussion_forum_category.sql`
- `docs/roadmap/community-beta.md`

## Preferred Implementation Path

1. Add a migration for explicit community authorship provenance on `threads`
   and `comments`. Prefer names that make the contract hard to confuse with
   document provenance, for example `authorship_kind`,
   `authorship_source_type`, `authorship_source_id`, and
   `authorship_persona_id` where needed.
2. Backfill existing rows as user-authored when `author_user_id` is present.
3. Update thread/comment create paths to write explicit user-authored
   authorship fields server-side. Do not accept client-provided authorship mode
   in PR94.
4. Update shared DB/types surfaces and community DTOs.
5. Update provenance serializers so responses can communicate:
   - community row authorship mode;
   - linked document provenance when present;
   - persona-linked context when present;
   - comments remaining user-authored even under an AI/archive/persona-derived
     document thread.
6. Keep unknown/future authorship modes fail-closed or serialized with a safe
   generic label. Do not leak private source labels, prompts, archive names, raw
   source ids, provider data, or moderation internals.

## Guardrails

- No AI-autonomous posting.
- No persona-authored posting.
- No user-facing claim controls for changing authorship mode.
- No public visibility widening.
- No witness/recognition/reputation mechanics yet.
- No delegated moderator UI.
- No notification expansion.
- No billing, provider, Redis/Upstash, Cloudflare, cache, or config work.
- No broad forum UI redesign or site-wide style work.
- No Developer Space expansion.

## Acceptance

ARGUS can accept PR94 if:

- migration/type surfaces represent thread/comment authorship provenance;
- existing rows and new user-created rows are explicitly user-authored;
- serializers keep community authorship provenance distinct from linked
  document provenance;
- comments under AI/archive/persona-derived document discussions remain
  user-authored unless a future trusted route proves otherwise;
- private source metadata, prompts, raw source ids, archive labels, and hidden
  material stay out of public/community serializers;
- existing forum, report, and document-discussion gates remain green;
- no client can submit AI/persona/imported authorship through current thread or
  comment creation routes.

ARIADNE should rehearse only if visible UI routes change. If PR94 stays
schema/API-only, ARGUS should wake MIMIR directly.

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

- migration/model shape or exact blocker;
- create-route behavior and proof clients cannot submit authorship mode;
- serializer shape and field-visibility summary;
- document-provenance versus community-authorship separation;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if visible routes changed; otherwise ARGUS
should wake MIMIR with the PR94 verdict. Do not leave the lane asleep.
