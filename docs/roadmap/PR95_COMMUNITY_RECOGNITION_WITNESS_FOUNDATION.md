# PR95 - Community Recognition/Witness Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: closed by MIMIR on 2026-06-20

## Why This Lane

Community Beta can now prove authorship provenance for threads and comments.
The next missing product primitive is recognition: a way for members to witness
thoughtful contributions without turning the community into a volume contest.

PR95 should add the durable foundation only. It should not build leaderboards,
badges, public clout scores, or a broad visible reward system.

## Goal

Add or precisely block a bounded recognition/witness contract for community
thread and comment targets.

Desired protected-beta outcome:

- eligible members can witness readable thread/comment contributions;
- witness events are scoped to the acting user and target;
- users cannot witness their own contributions;
- hidden, removed, private-unreadable, or unsupported targets fail closed;
- duplicate witness actions are idempotent per user/target/kind;
- public/community serializers expose safe aggregate counts only;
- current-user readback can include the viewer's own witness state without
  exposing other witnesser identities;
- authorship provenance stays available for future recognition policy without
  adding AI/persona posting.

## Inspect Before Editing

- `docs/roadmap/PR94_COMMUNITY_AUTHORSHIP_PROVENANCE_FOUNDATION.md`
- `docs/roadmap/community-beta.md`
- `infra/supabase/migrations/024_community_trust_votes_moderation.sql`
- `infra/supabase/migrations/042_community_authorship_provenance.sql`
- `packages/db/src/types.ts`
- `packages/types/src/forum.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/services/community.service.ts`
- `apps/api/src/services/community-provenance.service.ts`

## Preferred Implementation Path

1. Add durable storage for recognition/witness events. Prefer a narrow table
   such as `community_witnesses` with:
   - `witness_user_id`;
   - `target_type` limited to `thread` or `comment`;
   - `target_id`;
   - `witness_kind` with a small set such as `helpful`, `grounded`, or
     `careful`;
   - optional short note only if it remains owner/admin/private-safe;
   - idempotency over `witness_user_id`, `target_type`, `target_id`,
     `witness_kind`;
   - timestamps and soft revoke/delete behavior if practical.
2. Add API behavior for creating/removing or toggling current-user witness
   state. Route shape is DAEDALUS's call, but keep it boring and current-user
   scoped.
3. Validate readable targets using the same visibility rules as thread/comment
   detail, including subcommunity-backed category gates.
4. Prevent self-witness by comparing the target author with the acting user.
5. Add safe aggregate readback:
   - total counts per kind where useful;
   - viewer's own witness state only when signed in;
   - no list of witnesser user ids or private notes in public/community
     serializers.
6. Keep community profile/reputation mutation out unless it is tiny,
   non-ranking, and fully covered. Prefer documenting it as a future lane.

## Guardrails

- No leaderboards, rankings, badges, streaks, public user scores, or clout
  surfaces.
- No notifications or fanout from witness actions.
- No witness UI unless it is genuinely tiny and explicitly reviewed.
- No AI/persona posting or authorship claim controls.
- No delegated moderation.
- No billing, provider, Redis/Upstash, Cloudflare, cache, or config work.
- No Developer Space expansion.
- No auth/session refactor.
- No broad forum UI redesign or site-wide style work.
- No public visibility widening for hidden, removed, private, unlisted,
  archive, prompt, provider, credential, or owner-only material.

## Acceptance

ARGUS can accept PR95 if:

- witness storage and type surfaces exist or exact blockers are documented;
- only eligible signed-in users can witness;
- users cannot witness their own thread/comment rows;
- unreadable, hidden, removed, private, unsupported, and failed subcommunity
  target lookups fail closed;
- duplicate witness actions are idempotent;
- public/community serializers expose aggregate counts only and do not expose
  witnesser ids, private notes, moderation internals, or hidden target bodies;
- current-user witness state is scoped to the viewer;
- existing community/report/document-discussion gates remain green.

ARIADNE should rehearse only if visible UI routes change. If PR95 stays
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
- create/toggle/remove route behavior;
- target readability and self-witness checks;
- serializer aggregate/current-user visibility summary;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if visible routes changed; otherwise ARGUS
should wake MIMIR with the PR95 verdict. Do not leave the lane asleep.

## ARGUS Review Result

Accepted on 2026-06-20 as a bounded schema/API foundation. ARGUS tightened two
review findings before acceptance:

- raw `community_witnesses` RLS now allows actor-only row reads instead of
  authenticated-wide reads, keeping witnesser identities behind API aggregate
  serializers;
- witness target loading now rejects hidden thread material even when an admin
  could otherwise read it for moderation.

Validation passed:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

No visible route changed, so no ARIADNE rehearsal is required. ARGUS should wake
MIMIR for closeout/sequencing.

## MIMIR Closeout

Closed on 2026-06-20.

PR95 is accepted as the bounded recognition/witness schema/API foundation.
Thread and comment targets now support current-user scoped witness actions,
self-witness prevention, idempotency, fail-closed target visibility,
actor-only raw-row access, aggregate-only public readback, and viewer-scoped
witness state.

The next gap is the visible first slice. PR96 should expose witness controls on
forum thread detail without adding leaderboards, rankings, badges,
notifications, or broad forum redesign.
