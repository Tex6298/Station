# PR86 - Community Moderation Target Context And Actions

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or documents exact blockers, ARGUS reviews. ARIADNE
rehearses the visible admin route if the moderator console changes.
Status: closed by MIMIR on 2026-06-19

## Why This Lane

PR84 gave admins a first `/forums/moderation` console over the existing
`/reports` queue. PR85 gave ordinary reporters their own `/forums/reports`
status readback. Together they protect the queue and reporter view, but they
still leave the moderator operator loop thin:

- report targets are shown only as safe `targetType:targetId` text;
- moderators do not yet get safe route hints or bounded target context;
- target hide/remove/restore actions remain absent from the console;
- report status transitions and target moderation actions are not visibly
  separated in the admin UI.

PR86 should close as much of that gap as the current schema and APIs can prove.
If target context or target actions require new schema/route semantics, name the
exact blocker instead of inventing unsafe links or pretending a control works.

## Goal

Make the admin moderation console more actionable without changing public or
reporter visibility.

Desired protected-beta outcome:

- admin `/reports` queue rows can include safe target context or route hints
  for thread/comment reports where the current data can prove them;
- `/forums/moderation` shows that context clearly and keeps target details
  admin-only;
- any target action controls are separate from report-status controls;
- target actions call existing admin-only thread/comment moderation APIs only
  if those APIs already support the behavior safely;
- unsupported target types or missing route context degrade to a clear
  admin-only "route unavailable" state, not a broken link or fake button;
- reporter-owned `/reports/mine` and `/forums/reports` are unchanged.

## DAEDALUS Implementation

Implemented safe admin-only target context for `thread` and `comment` reports
on the existing admin `GET /reports` queue. Reporter-owned `/reports/mine`
still uses its separate safe serializer and does not include `targetContext`.

Supported target context:

- thread reports return target type/id, title, status, visibility,
  moderationState, hidden state, a forum route hint when the category slug and
  non-removed thread state can prove one, and supported target actions;
- comment reports return target type/id, parent type/id, parent thread title
  when available, comment status, moderationState, hidden state, a forum route
  hint only for thread-parent comments with a resolvable category slug and
  non-removed parent thread, and supported target actions;
- document/space/persona/user reports remain unsupported for route hints and
  target actions in this lane.

Safe fields are admin-only and do not include target bodies, reporter-only
payloads, private document/Space/persona material, moderator notes beyond the
existing admin report notes, moderation action reasons, or hidden content.

Implemented `/forums/moderation` changes:

- target context is shown in a separate section from report status;
- safe route links are shown only when the API returns `routeHref`;
- unsupported targets show a clear unavailable state;
- target actions are separated from report-status transitions and call only the
  existing admin-only routes:
  - `PATCH /threads/:id/moderation`
  - `PATCH /comments/:id/moderation`
- wired target actions are limited to `hide`, `unhide`, `remove`, and
  `restore`, based on the API's `supportedActions` for the target state.

Deferred blockers:

- document discussion comment route hints need a safe document/Space route
  mapping and visibility policy specific to moderator console context;
- space/page comment route hints need page/space slug resolution and owner/public
  rules;
- user/space/document/persona target actions need dedicated moderation route
  semantics before buttons should exist.

No reporter readback expansion, public visibility widening, appeal workflow,
public moderation log, subcommunity platform, delegated moderator model,
notifications, reputation/witness mechanics, AI posting, schema change,
billing/provider/cache, Developer Space, auth/session refactor, or broad UI
redesign was added.

## ARGUS Technical Review

ARGUS technically accepted PR86 on 2026-06-19 and is waking ARIADNE for the
visible `/forums/moderation` route rehearsal before MIMIR closeout.

Review notes:

- Admin target context is attached only to admin queue/status responses from
  `/reports`; reporter-owned `/reports/mine` still uses the separate safe
  serializer and does not receive `targetContext`.
- Thread and comment target context stays bounded to route/status/moderation
  state fields and safe route hints; user/space/document/persona targets remain
  unsupported instead of guessed.
- Target actions are separated from report-status transitions and call only the
  existing admin-only thread/comment moderation routes.
- ARGUS added a regression assertion proving target context does not serialize
  target bodies, target author ids, or private target metadata even when those
  fields exist on loaded rows.
- Existing anonymous/non-admin queue blocking and reporter readback boundaries
  remain covered by the reports/community gates.

Remaining PR86 handoff:

- ARIADNE should rehearse `/forums/moderation` for target-context readability,
  route-unavailable states, separated report status versus target actions, and
  mobile fit.

## ARIADNE Visible-Route Rehearsal

Accepted on 2026-06-19.

ARIADNE rehearsed the deployed `/forums/moderation` route with browser-level
`/auth/me`, `/reports`, and moderation PATCH mocks so no live report or target
rows were read or mutated.

Desktop and 390px mobile checks passed:

- admins saw target context as a distinct section from report status and target
  actions;
- safe route context appeared as route labels/links where supplied by the admin
  API;
- unavailable route context showed the API-provided unavailable reason instead
  of guessed navigation;
- unsupported persona targets showed a non-actionable unavailable state;
- target actions were visually separated from report status actions;
- a thread target `hide` action called only the existing
  `/threads/:id/moderation` path and did not call the report-status endpoint;
- private target bodies, target author ids, private metadata, reporter-detail
  markers, and appeal language were not visible;
- no document-level horizontal overflow or offscreen primary controls appeared
  on desktop or 390px mobile.

Validation before the ad hoc browser runner was removed:

```bash
node --check scripts/tmp-pr86-ariadne-moderation-context-rehearsal.mjs
node scripts/tmp-pr86-ariadne-moderation-context-rehearsal.mjs
```

No additional PR86 visible-route defect remains from ARIADNE's pass.

## MIMIR Closeout

Closed on 2026-06-19.

PR86 is accepted as the bounded moderator-console target context/action slice.
Admins get safe target context and route hints for supported thread/comment
reports, unsupported targets stay non-actionable, and target actions are
visibly separated from report-status transitions. Reporter-owned
`/reports/mine` remains unchanged and receives no target context.

The next moderation gap is the appeal/request-review foundation that PR85 and
PR86 deliberately deferred. PR87 should add the smallest durable schema/API
contract for review requests before any visible appeals UI is allowed to claim
the feature exists.

## Inspect Before Editing

- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/moderation-console.test.ts`
- `apps/web/lib/api-client.ts`
- `packages/types/src/forum.ts`
- `docs/roadmap/PR84_COMMUNITY_MODERATOR_CONSOLE_FIRST_SLICE.md`
- `docs/roadmap/PR85_COMMUNITY_REPORT_RESOLUTION_READBACK.md`
- `docs/roadmap/community-beta.md`

## Preferred Implementation Path

1. Start API-first. Inspect how `moderation_reports.target_type` and
   `target_id` map to current thread/comment/document discussion rows.
2. Determine whether admin `GET /reports` can safely serialize bounded
   `targetContext` without widening public or reporter data.
3. For thread targets, prefer safe route hints such as category slug, thread id,
   thread title, status/visibility, and whether the current admin can open the
   thread route.
4. For comment targets, resolve the containing route only if the current schema
   can prove the parent thread/document discussion without exposing hidden or
   private bodies to non-admin surfaces.
5. Keep reporter readback separate. Do not add target context to
   `/reports/mine` unless ARGUS explicitly accepts a safe reporter-specific
   subset in a later lane.
6. If existing admin-only thread/comment moderation routes already support safe
   target actions, wire narrow console controls for hide/remove/restore where
   supported. Keep report status actions visually and logically separate.
7. If current APIs are not enough, implement only the safe context/readback part
   and document the exact missing route, field, or ownership rule.

## Guardrails

- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No appeal/request-review workflow.
- No public moderation log.
- No subcommunity platform or delegated moderator model.
- No notifications, reputation, witness mechanics, or AI-autonomous posting.
- No reporter-facing target bodies, moderator notes, moderator identities, or
  moderation action reasons.
- No Stripe, Redis/Upstash, provider/model, Cloudflare, worker, parser/OAuth,
  Project/DexOS, hosted runtime, billing, or broad UI redesign.
- No secrets, raw auth headers, cookies, Stripe objects, webhook bodies, owner
  IDs, private archive text, prompts, completions, or provider payloads in docs
  or UI.

## Acceptance

ARGUS can accept PR86 if:

- admin queue target context is either safely implemented or blocked with exact
  reasons;
- anonymous and non-admin users still cannot fetch moderation queue material;
- reporter-owned `/reports/mine` remains scoped and safe;
- report status updates remain separate from target hide/remove/restore actions;
- target links do not produce broken public navigation or leak hidden/private
  content;
- unsupported targets are visibly non-actionable instead of fake-live;
- tests cover target context/action serialization and admin/non-admin behavior.

ARIADNE should rehearse `/forums/moderation` if the visible console changes.

## Validation

Run the narrow gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If the visible web route changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- implementation or blocker summary;
- exact target types supported;
- target context fields returned and why they are safe;
- target actions added or deferred;
- reporter/admin/anonymous behavior;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE if `/forums/moderation` changes visibly, or wake
MIMIR directly if PR86 closes as API-only/blocker documentation. Do not leave
the lane asleep.
