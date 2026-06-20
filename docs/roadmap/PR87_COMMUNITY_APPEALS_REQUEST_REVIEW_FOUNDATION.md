# PR87 - Community Appeals Request Review Foundation

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS implements if current schema/API can support the foundation,
ARGUS reviews. ARIADNE rehearses only if a visible participant/admin route is
added.
Status: implemented by DAEDALUS; awaiting ARGUS review

## Why This Lane

PR85 proved reporter-owned status readback and explicitly deferred true appeals
because the schema had no appeal/request-review table, appeal states,
moderation-action linkage, or target-owner visibility semantics. PR86 then made
the admin queue more actionable for thread/comment targets, but still did not
create a way for participants or target owners to ask for a moderation decision
to be reviewed.

PR87 should create the durable foundation for that workflow. It should not ship
pretend appeal UI, public moderation logs, or broad community platform scope.

## Goal

Add or precisely block the smallest appeal/request-review contract that current
Community Beta can safely support.

Desired protected-beta outcome:

- a durable table or equivalent repository contract exists for moderation
  review requests;
- eligible requesters can create one request tied to a report, moderation
  action, or target where current data can prove standing;
- request state is explicit and limited, such as `open`, `reviewing`,
  `upheld`, `denied`, `dismissed`, or `withdrawn`;
- participants can read only their own request status and safe resolution
  summary;
- admins can read the queue and update request status without exposing admin
  notes to participants;
- duplicate active requests for the same requester/target/reason are prevented
  or idempotent;
- reporter-owned `/reports/mine`, admin `/reports`, and PR86 target actions
  keep their existing privacy boundaries.

## DAEDALUS Implementation

Implemented the durable moderation review request foundation as schema/API only.
No visible participant or admin route was added.

Schema:

- added migration `039_moderation_review_requests.sql`;
- added `public.moderation_review_requests` with requester, requester role,
  thread/comment target, nullable report link, nullable future moderation action
  link, participant-safe reason/status/resolution summary, admin-only notes,
  reviewer/time, and timestamps;
- statuses are `open`, `reviewing`, `upheld`, `denied`, `dismissed`, and
  `withdrawn`;
- duplicate active requests are prevented by a partial unique index on
  requester, target type/id, and reason where status is `open` or `reviewing`;
- RLS intent allows requester-owned insert/select and admin-all access.

API:

```text
POST  /reports/review-requests
GET   /reports/review-requests/mine
GET   /reports/review-requests
PATCH /reports/review-requests/:id
```

Requester standing:

- reporters can request review for their own report when the report target is a
  thread or comment;
- thread/comment authors can request review for their own target directly or
  through a report about their target;
- unsupported target types return a bounded error instead of a fake appeal;
- visitor-tier users are blocked from creating requests.

Serializers:

- participant serializer returns id, requester role, target type/id, owned
  report id when present, reason, status, resolution summary when present,
  reviewedAt when present, and created/updated timestamps;
- participant serializer excludes requester id, admin notes, reviewed_by,
  moderator identity, hidden target bodies, private material, and other users'
  requests;
- admin serializer adds requester id, moderation action id when present, admin
  notes, and reviewedBy.

Admin behavior:

- admin queue is admin-only and defaults to active `open`/`reviewing` requests;
- admin updates set server-controlled `reviewed_by` and `reviewed_at`;
- participant-supplied status, admin notes, reviewer, and reviewedAt are ignored
  on create.

Deferred blocker:

- moderation-action-linked review requests remain deferred. The current action
  log is admin-facing and does not yet provide a participant-safe action
  reference or visibility rule that proves a requester can address a specific
  action id without exposing admin-only reasons or internals.

No visible appeal UI, public moderation log, public visibility widening,
subcommunity platform, delegated moderator model, notifications,
reputation/witness mechanics, AI posting, target mutation, billing/provider
cache, Developer Space, auth/session refactor, or broad UI scope was added.

## Product Semantics To Decide In Code

Use the current schema to decide the narrowest safe shape. Prefer a
`moderation_review_requests` or `moderation_appeals` table with fields close to:

- `id`;
- `requester_id`;
- `requester_role` or a computed equivalent, such as reporter, target author,
  content owner, or admin;
- `target_type` and `target_id`;
- nullable `report_id` when the request is about a submitted report;
- nullable `moderation_action_id` when the request is about an admin action and
  the current action table can prove the link;
- `reason`;
- participant-safe `status`;
- participant-safe `resolution_summary`;
- admin-only `admin_notes`;
- `reviewed_by`, `reviewed_at`, `created_at`, and `updated_at`.

If the current moderation action log cannot safely link to a request, implement
report/target review requests first and document the exact action-link blocker.

## Inspect Before Editing

- `infra/supabase/migrations/024_community_trust_votes_moderation.sql`
- `infra/supabase/migrations/031_moderation_report_idempotency.sql`
- `packages/db/src/types.ts`
- `packages/types/src/forum.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/services/community.service.ts`
- `apps/web/app/forums/reports/page.tsx`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/moderation-console.test.ts`
- `docs/roadmap/PR85_COMMUNITY_REPORT_RESOLUTION_READBACK.md`
- `docs/roadmap/PR86_COMMUNITY_MODERATION_TARGET_CONTEXT_ACTIONS.md`
- `docs/roadmap/community-beta.md`

## Preferred Implementation Path

1. Start schema-first with a new migration after the current highest migration
   number. Do not patch runtime-only mocks without a durable database shape.
2. Add hand-maintained DB/types surfaces that match the migration.
3. Add API routes under an unambiguous path such as `/reports/review-requests`
   or `/moderation/review-requests`, keeping participant and admin serializers
   separate.
4. Create route:
   - require auth and eligible community tier;
   - validate requester standing against report ownership, target authorship,
     or another current proof;
   - prevent or idempotently return duplicate active requests;
   - never accept `admin_notes`, `reviewed_by`, or final status from a
     participant body.
5. Participant readback route:
   - returns only the requester's own rows;
   - includes safe status, target type/id, report id if requester already owns
     it, created/updated/reviewed timestamps, and participant-safe resolution
     summary;
   - excludes admin notes, moderator identity, hidden target bodies, private
     material, and other users' requests.
6. Admin queue/update route:
   - require admin;
   - may include admin notes and queue filters;
   - status updates must record reviewer/time;
   - if a request changes target/report state, use existing moderation routes or
     document that target mutation remains deferred.
7. Add visible UI only if the API contract is stable and narrow. A small
   `/forums/reports` request-review action is acceptable only when it is backed
   by the durable route. Otherwise keep PR87 API-only and wake MIMIR with the
   next UI lane recommendation.

## Guardrails

- No fake appeal buttons or copy before a durable request row exists.
- No public moderation log.
- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No participant access to admin notes, moderator identities, private target
  bodies, moderation internals, or other users' requests.
- No subcommunity platform, delegated moderator model, notifications,
  reputation, witness mechanics, or AI-autonomous posting.
- No Stripe, Redis/Upstash, provider/model, Cloudflare, worker, parser/OAuth,
  Project/DexOS, hosted runtime, billing, or broad UI redesign.
- No secrets, raw auth headers, cookies, Stripe objects, webhook bodies, owner
  IDs, private archive text, prompts, completions, or provider payloads in docs
  or UI.

## Acceptance

ARGUS can accept PR87 if:

- the durable schema/API contract is implemented or the exact blocker is named;
- requester standing is enforced and tested;
- anonymous users cannot create or read review requests;
- authenticated users cannot read or mutate other users' requests;
- participant serializers exclude admin notes, moderator identity, hidden target
  bodies, private material, and other-user rows;
- admin queue/update behavior is admin-only;
- duplicate active requests are prevented or returned idempotently;
- no visible UI implies an appeal exists unless backed by the new API.

ARIADNE should rehearse only if a visible participant or admin route changes.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
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

- implementation or blocker summary;
- schema/table shape and migration number if implemented;
- create/read/update route summary;
- requester-standing rules;
- participant/admin serializer fields;
- duplicate/idempotency behavior;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if visible routes change, or wake MIMIR directly if
PR87 closes as API/schema-only or blocker documentation. Do not leave the lane
asleep.
