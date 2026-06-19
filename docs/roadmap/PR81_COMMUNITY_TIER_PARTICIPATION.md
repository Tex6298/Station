# PR81 - Community Tier Participation

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible forum
UI changes.
Status: accepted by ARGUS; ready for MIMIR closeout

## Why This Lane

Community Beta now has safer moderation/action logs, report queue readback, and
bounded provenance labels. The next launch-core gap is tiered participation
enforcement across the full forum surface.

Thread creation and comment creation already use `requireTier("private")`, but
the broader participation surface needs an explicit audit: voting, reporting,
community-visible reads, linked document discussions, and any category/thread
helpers should match the intended Station tier model instead of relying on
accidental auth-only behavior.

## Goal

Prove and, where needed, tighten Community Beta participation gates without
changing visibility policy.

The lane should answer:

- anonymous visitors can read public forums but cannot create, vote, comment,
  or report;
- signed-in users below the Basic/private participation floor cannot create,
  vote, comment, or use community-only reads;
- eligible Basic/private and higher users can participate in public/community
  surfaces according to existing visibility rules;
- admins keep moderation powers without widening public/member access.

## DAEDALUS Implementation

Implemented the clear policy gaps with existing tier middleware:

- thread voting now requires `private` tier or higher;
- comment voting now requires `private` tier or higher;
- report creation now requires `private` tier or higher.

Existing gates retained:

- anonymous users can read public forum/category/thread surfaces;
- community thread/category reads require an eligible community tier through the
  existing visibility helpers;
- thread creation already requires `private` tier or higher;
- comment creation already requires `private` tier or higher;
- report queue/readback and report status updates remain admin-only;
- thread/comment moderation actions remain admin-only.

Route-by-route matrix:

| Surface | Anonymous | Visitor tier | Private+ | Admin |
| --- | --- | --- | --- | --- |
| Public category/thread reads | Allowed | Allowed | Allowed | Allowed |
| Community category/thread reads | Hidden/404 | Hidden/404 | Allowed | Allowed |
| Thread creation | 401 | 403 | Allowed | Allowed |
| Comment creation | 401 | 403 | Allowed | Allowed |
| Thread/comment voting | 401 | 403 | Allowed | Allowed |
| Report creation | 401 | 403 | Allowed | Allowed |
| Report queue/status update | 401 | 403 | 403 | Allowed |
| Thread/comment moderation actions | 401 | 403 | 403 | Allowed |

No visibility policy, moderation action semantics, auth/session behavior, UI,
schema, billing/provider/cache, Developer Space, subcommunity, appeal,
notification, reputation, or recognition work was added.

## Inspect Before Editing

- `apps/api/src/routes/forums.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/middleware/require-tier.ts`
- `packages/types/src/forum.ts`
- `docs/roadmap/community-beta.md`
- `docs/roadmap/PR78_COMMUNITY_MODERATION_PROVENANCE_FIRST_SLICE.md`
- `docs/roadmap/PR79_COMMUNITY_MODERATION_QUEUE_READBACK.md`
- `docs/roadmap/PR80_COMMUNITY_PROVENANCE_LABELS.md`

## Preferred Implementation Order

1. Inventory each participation action:
   - category/thread reads;
   - thread creation;
   - comment creation;
   - thread/comment voting;
   - report creation;
   - moderation queue/action readback/write.
2. Add tests first where a gap is suspected.
3. Tighten gates with existing `requireTier("private")` or a small local helper
   only where the intended product rule is clear.
4. Preserve current public/community/unlisted/private visibility semantics.
5. If a policy decision is genuinely missing, wake MIMIR with the exact route,
   current behavior, proposed policy, and risk.

## Guardrails

- No broad forum redesign or UI reskin.
- No new subcommunity, appeal, notification, reputation, or recognition system.
- No billing/provider/Redis/Cloudflare/Developer Space work.
- No auth/session refactor.
- No public/private/community visibility widening.
- No changes to moderation action semantics beyond tier/role access checks.

## Acceptance

- Tests prove anonymous, below-floor authenticated, eligible member, and admin
  behavior for any touched route.
- Thread/comment creation remains gated to Basic/private or higher.
- Thread/comment voting is gated intentionally, not accidentally.
- Report creation policy is explicit and tested.
- Moderation queue/actions remain admin-only.
- PR78, PR79, and PR80 protections remain green.

## ARGUS Review

Accepted on 2026-06-19 as a narrow API/test Community Beta participation lane.

Review confirmed:

- thread voting, comment voting, and report creation now use the existing
  `requireTier("private")` floor after auth;
- public category/thread reads remain open to anonymous and visitor-tier users;
- community category/thread reads remain hidden from anonymous and visitor-tier
  users and available to eligible private-tier users;
- thread/comment creation remains gated to `private` tier or higher;
- report queue/status updates remain admin-only;
- thread/comment moderation actions remain admin-only;
- PR78 moderation, PR79 report queue, and PR80 provenance label protections
  remain green.

ARGUS added test proof for the matrix edges that were only implicit in the
implementation handoff:

- anonymous thread/comment vote attempts return `401`;
- visitor-tier users are blocked from report queue and report status updates;
- admin-tier users can still participate through the tier-ranked vote path.

No visible forum UI changed, so ARIADNE rehearsal is not required.

## Validation

Run the narrow relevant gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If web UI changes, also run the relevant web check and wake ARIADNE after ARGUS.

## Handoff

DAEDALUS wakes ARGUS with:

- implementation or policy-blocker summary;
- route-by-route participation matrix;
- files changed;
- visibility proof;
- validation results;
- explicit non-scope confirmation.

ARGUS wakes MIMIR with the closeout verdict, or wakes ARIADNE first if visible
forum UI changed enough to need a human-eye route rehearsal.
