# PR105 - Community Delegated Queue Target Actions

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: open for DAEDALUS

## Why This Lane

PR102 exposed the scoped delegated queue. PR103 and PR104 added safe report
status triage. PR99 already proved bounded subcommunity thread/comment target
actions (`hide`, `unhide`, `remove`, `restore`) for owners and active
moderators on their own subcommunity targets.

The remaining practical moderation loop is acting on a reported thread/comment
from the scoped queue, while keeping report status controls and target
moderation controls visually and logically separate.

## Goal

Add visible target safety actions to eligible rows on
`/forums/subcommunities/[slug]/moderation`.

Use only the existing accepted target moderation routes:

```text
PATCH /threads/:id/moderation
PATCH /comments/:id/moderation
```

Do not add target mutation to the report status route.

## Scope

DAEDALUS should implement:

- target action controls only for scoped queue rows whose sanitized delegated
  target context proves supported actions;
- supported actions limited to `hide`, `unhide`, `remove`, and `restore`;
- separate visual grouping for report status controls versus target safety
  controls;
- calls only to the existing thread/comment moderation routes;
- row refresh or local update behavior that keeps report status and target
  moderation state honest after an action;
- loading/error states that keep the row visible and recoverable;
- no target controls for unsupported rows, rows without safe target context,
  rows without supported actions, signed-out users, ordinary members, revoked
  moderators, unrelated owners, or other-subcommunity moderators;
- focused UI/helper tests for supported-action rendering, unsupported-row
  hiding, route selection, successful thread action, successful comment action,
  failed action, denied-state no controls, and separation from report status
  controls.

If the current delegated queue serializer does not expose enough safe
`supportedActions` or target state to implement this honestly, DAEDALUS should
stop and document the precise missing foundation rather than inventing UI
behavior.

## Non-Scope

Do not add:

- new target moderation APIs;
- target mutation from
  `PATCH /forums/subcommunities/:slug/moderation/reports/:id`;
- lock/pin actions;
- document-comment or Space-page-comment actions;
- document, Space, persona, user, missing, or unsupported target mutation;
- global `/reports` widening;
- changes to global admin moderation behavior;
- public moderation logs;
- public moderator directory;
- review-request expansion;
- notification UI changes;
- reporter identities, reporter email, admin notes, reviewed-by/reviewed-at
  fields, moderator identities, role assignments, moderation reasons, hidden/
  private target bodies, private target metadata, raw owner ids, source ids, raw
  category ids, or unsafe route hints;
- broad forum redesign, broad styling pass, billing/provider/cache work,
  Redis/Upstash, Cloudflare, Developer Space work, or auth/session refactor.

## ARGUS Review Requirements

ARGUS should verify:

- target action controls render only after scoped queue preflight succeeds;
- controls appear only when sanitized delegated rows prove supported actions;
- thread rows call only `/threads/:id/moderation`;
- comment rows call only `/comments/:id/moderation`;
- report status controls remain separate and still call only the PR103 route;
- failed target actions keep rows visible and bounded;
- denied states render no live rows and no controls;
- lock/pin, document, Space, persona, user, document-comment, Space-page-comment,
  missing, unsupported, and cross-subcommunity targets cannot be acted on;
- no private/admin fields render;
- validation passed.

Because this lane changes visible behavior, ARGUS must wake ARIADNE after
technical acceptance.

## ARIADNE Human Rehearsal

ARIADNE should rehearse:

- signed-out, ordinary member, revoked moderator, unrelated owner;
- subcommunity owner, active moderator, platform admin;
- eligible thread row;
- eligible comment row;
- unsupported/no-action row;
- successful hide/unhide/remove/restore where fixtures permit;
- failed target action;
- report status controls beside target controls;
- desktop and 390px mobile.

ARIADNE should confirm the page still reads as a scoped queue, report status
triage does not blur into target moderation, failed actions are recoverable, and
the visible controls do not suggest broader authority than the current
subcommunity grants.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If the web build reaches compile/lint/page generation and then hits the known
Windows output cleanup `EPERM`, report that precisely rather than treating it as
an app failure.
