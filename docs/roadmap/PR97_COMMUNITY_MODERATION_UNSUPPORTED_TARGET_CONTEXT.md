# PR97 - Community Moderation Unsupported Target Context

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or documents exact blockers, ARGUS reviews. ARIADNE
rehearses visible routes only if the moderator console changes.
Status: implemented by DAEDALUS; ready for ARGUS technical review

## Why This Lane

PR86 made the moderator console useful for thread/comment reports: admins get
safe route context and target actions where existing routes support them, while
reporter-owned readback stays separate.

The remaining moderation-console gap is the set of report targets that still
degrade to "unsupported" or generic unavailable states:

- document;
- space;
- persona;
- user.

Those targets should not get guessed links, fake-live buttons, public
visibility widening, or raw private metadata. They do need a clear admin-only
readback policy so moderators can tell what a report points at when the current
schema can prove safe context.

## Goal

Add the smallest safe admin-only target context for currently unsupported
moderation report targets.

Desired protected-beta outcome:

- admin `GET /reports` can include bounded `targetContext` for document,
  space, persona, and user reports where the target exists and safe display
  fields can be proven;
- unsupported, missing, private, or ambiguous targets return explicit
  unavailable reasons instead of guessed links or blank UI;
- `/forums/moderation` remains honest about what can be opened or acted on;
- reporter-owned `/reports/mine` and `/forums/reports` remain participant-safe
  and do not receive admin target context;
- no target mutation buttons are added unless there is an already-existing,
  admin-only, target-specific route that ARGUS can validate.

## Inspect Before Editing

- `docs/roadmap/PR86_COMMUNITY_MODERATION_TARGET_CONTEXT_ACTIONS.md`
- `docs/roadmap/PR88_COMMUNITY_REVIEW_REQUEST_UI_FIRST_SLICE.md`
- `docs/roadmap/community-beta.md`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/moderation-console.test.ts`
- `packages/types/src/forum.ts`
- any current document, Space, persona, profile, or public-user serializers that
  already define safe public/admin fields.

## Preferred Implementation Path

1. Start with the type contract. Expand `ModerationReportTargetContext` only as
   far as needed to describe supported and unavailable admin contexts for
   `document`, `space`, `persona`, and `user` reports.
2. Keep the admin and participant serializers separate. `serializeReport` may
   include admin context; `serializeReporterReport` must remain target-id/status
   readback only unless a later PR explicitly opens a participant-safe subset.
3. For each target type, inspect existing tables/routes/serializers before
   adding fields:
   - use names/titles/slugs/status/visibility only where already safe for the
     route being hinted;
   - include route hints only when the route can be opened without leaking
     private, hidden, removed, owner-only, archive, prompt, or provider data;
   - prefer `unavailableReason` over any guessed route.
4. For user targets, avoid email addresses, provider ids, auth ids, raw profile
   internals, private preferences, or owner-only counters. Use a safe community
   profile/public identity label only if the repo already has one.
5. For persona targets, do not expose private persona prompt/config/archive
   material. Use only a safe display label and route hint if the route is
   already visible to the admin context and does not imply public visibility.
6. For Space/document targets, respect current public/community/unlisted/private
   visibility logic. If no safe admin route mapping exists, return an explicit
   blocker rather than adding a dead link.
7. Update `/forums/moderation` only if the current component cannot display the
   new context shape honestly.
8. Add focused tests for:
   - admin context serialization per supported target type;
   - missing/private/ambiguous unavailable reasons;
   - anonymous and non-admin queue denial;
   - reporter-owned readback not receiving target context;
   - absence of private bodies, emails, owner ids, prompt/config/archive text,
     hidden material, moderation action reasons, and raw source ids.

## Guardrails

- No public visibility widening for hidden, removed, private, unlisted,
  community-only, archive, prompt, provider, credential, or owner-only material.
- No public moderation log.
- No delegated moderation, subcommunity owner/moderator roles, or moderator
  assignment workflow.
- No review-request/appeal expansion.
- No recognition/witness, notification, billing, provider/model, Redis/Upstash,
  Cloudflare, Developer Space, auth/session, styling, or broad UI work.
- No target mutation actions for document, space, persona, or user targets
  unless an already-existing admin-only route proves the action safe.
- No secrets, auth headers, cookies, Stripe objects, webhook payloads, raw owner
  ids, emails, private archive text, prompts, completions, provider payloads, or
  private notes in docs, tests, API responses, or UI.

## Acceptance

ARGUS can accept PR97 if:

- admin `/reports` target context is safely implemented or precisely blocked
  for document, space, persona, and user target types;
- unavailable reasons are explicit and not fake-live;
- reporter-owned `/reports/mine` remains unchanged and does not include admin
  target context;
- anonymous and non-admin users still cannot fetch moderation queue material;
- route hints do not create broken public navigation or leak hidden/private
  material;
- no private target bodies, emails, owner ids, prompts, archive/source labels,
  provider payloads, moderation internals, or raw source ids are serialized;
- tests cover supported, unsupported, and privacy-negative cases.

ARIADNE should rehearse `/forums/moderation` only if visible route behavior or
layout changes. If the lane is API/type/test-only, ARGUS should wake MIMIR
directly with the verdict.

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

If visible web routes change, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known local Windows standalone symlink `EPERM` remains acceptable only
after the web build compiles, lints/typechecks, collects page data, and
generates pages.

## Handoff

DAEDALUS must wake ARGUS with:

- implementation or blocker summary by target type;
- exact target context fields returned and why each is safe;
- route hints added or exact unavailable reasons;
- target actions added or explicitly deferred;
- reporter/admin/anonymous behavior;
- validation results;
- explicit non-scope confirmation.

ARGUS should wake ARIADNE only if `/forums/moderation` changes visibly. If
accepted without visible-route changes, ARGUS should wake MIMIR with the PR97
verdict. Do not leave the lane asleep.
