# PR211 Public Persona Interaction Readback - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: implemented; awaiting ARGUS review

## Frame

PR209 and PR210 are accepted. Station now has a bounded public persona chat
alpha on hosted staging:

- signed-in visitors only;
- owner opt-in through `public_chat_enabled`;
- platform provider only;
- PR206 public profile/document/discussion sources only;
- owner-paid token usage;
- no durable visitor transcript.

The next gap is not more public chat behavior. The next gap is owner/admin
readback: after a public persona is live, the owner should be able to understand
that public interaction is enabled and whether moderation/report signals exist,
without Station storing visitor chat transcripts or exposing reporter identity.

## Goal

Map and implement the smallest safe owner/admin readback slice for public
persona interaction.

Use existing data first. If the slice stays inside current tables and existing
authorization boundaries, implement it. If useful analytics require new event
retention, a `public_chat_events` table, per-message storage, or a new
analytics stream, stop and wake MIMIR with options.

## Required Repo Map

Before coding, confirm the current surfaces:

- Public chat route:
  `apps/api/src/routes/personas.ts`
  `POST /personas/public/:publicSlug/chat`
- Public persona report route:
  `apps/api/src/routes/personas.ts`
  `POST /personas/public/:publicSlug/report`
- Owner persona readback:
  `apps/api/src/routes/personas.ts`
  `GET /personas/:id`
- Admin/report readback:
  `apps/api/src/routes/reports.ts`
  `GET /reports` and `GET /reports/mine`
- Public persona types:
  `packages/types/src/persona.ts`
- Owner Studio persona surface:
  `apps/web/components/studio/persona-workspace.tsx`

Record what exists before implementing, especially:

- whether `moderation_reports` can count persona-targeted reports safely;
- whether owners can see public chat enabled status and public route;
- whether owner token usage can be summarized without inventing a transcript;
- whether admin moderation already has safe persona target context.

## Implementation Target

Implement the narrow no-new-storage slice if it is feasible:

1. Add an owner-only public interaction readback for a persona.
   - It may be part of the existing owner persona payload or a focused owner
     route.
   - It should include public chat enabled/disabled state, public route/slug,
     and safe moderation/report summary for that persona.
   - Prefer counts by report status (`open`, `reviewing`, `resolved`,
     `dismissed`) over detailed report bodies unless the existing owner policy
     clearly permits more.

2. Add a small owner UI readback.
   - Place it in the existing Studio persona workspace where the owner already
     manages public persona state.
   - Keep it compact and operational: status, route, public chat state, report
     counts, and a clear pointer to admin/moderation only when authorized.
   - Do not redesign the Studio surface in this lane.

3. Preserve admin/report behavior.
   - If admin moderation already has safe persona target context, leave it
     alone.
   - If persona report context is missing a safe route/name needed for review,
     patch only that minimized context.

4. Keep reporter-facing behavior safe.
   - Reporter readback may show the reporter their own report status.
   - Do not expose owner-only moderation notes or target-owner internals to the
     reporter.

## Hard Boundaries

Do not add:

- anonymous public chat;
- durable visitor chat transcripts;
- visitor message/content storage;
- reporter identity to persona owners;
- public moderation logs;
- raw persona ids, owner ids, reporter ids, provider traces, or private source
  ids in public UI;
- private memory, archive, canon, continuity, integrity, owner setup, BYOK, or
  provider settings to public persona chat;
- Redis/Cloudflare analytics, queues, workers, or cache dependency in this
  lane;
- broad UI restyling.

If any product value seems to require a new storage/retention policy, wake
MIMIR instead of quietly choosing one.

## Validation

Run the narrow checks for the touched surfaces:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If web-only code changes have a more focused local test in the repo, run that
too. If `typecheck` or `lint` has a known unrelated failure, document the exact
failure and prove the narrower tests passed.

## Output

Return one of:

```text
IMPLEMENTED
BLOCKED: needs MIMIR storage/retention decision
BLOCKED: missing config or hosted permission
```

Include:

- mapped existing data surfaces;
- implementation summary or decision options;
- safety/privacy notes;
- validation results;
- exact next wakeup target.

## DAEDALUS Result

IMPLEMENTED on 2026-06-24.

Mapped existing data surfaces:

- Public chat route remains
  `POST /personas/public/:publicSlug/chat`. It already records owner-paid token
  usage through `recordLlmTokenUsage`, with `chatId: null`, and stores no
  visitor transcript.
- Public persona report route remains
  `POST /personas/public/:publicSlug/report`. It resolves public slug
  server-side, stores a normal `moderation_reports` persona target, and returns
  only `{ report: { status }, duplicate }` to the reporter.
- Owner persona readback is `GET /personas/:id`. It already returns public
  eligibility/readback for owned personas and feeds the Studio persona home.
- Admin report readback already loads safe persona target context through
  `loadPersonaTargetContext`, including safe public route/name when available.
  No admin report queue behavior changed.
- Existing token tables do not store persona/public-chat attribution. A useful
  per-persona usage chart would require a storage/retention decision, so this
  lane did not add analytics or infer usage from unrelated transactions.

Implementation summary:

- Added `PublicPersonaInteractionReadback` to `packages/types/src/persona.ts`.
- Added `persona.publicInteraction` to owner-only persona readback.
- The readback includes:
  - public chat enabled/disabled state;
  - public route slug/href/can-open state;
  - persona-targeted moderation report counts by status;
  - active report count;
  - explicit privacy flags that owners cannot see reporter identity or report
    bodies;
  - admin queue href only when the owner is also an admin.
- Added Studio persona home readback cards for public route, public chat, and
  persona report count.
- Added web helper coverage for the bounded labels/copy.

Safety notes:

- No visitor chat transcripts, visitor message content, reporter identity,
  report notes, raw persona ids, owner ids, reporter ids, provider traces, token
  transaction rows, private memory/archive/canon/continuity/integrity data, or
  public moderation log were exposed.
- The report summary counts `moderation_reports` rows for the owned persona by
  status only.
- Token usage is represented only as policy text: owner-paid, transcript not
  stored, per-persona token attribution unavailable without event retention.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 11 tests passed, including owner-only public interaction summary and no reporter/note/raw-id/token-row leakage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; existing admin/reporter report behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 13 tests passed, including public interaction helper labels. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

Next wakeup target:

- Wake ARGUS for privacy/moderation review.

## Wakeup

If implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR211 owner/admin public persona interaction readback.
- The slice should use existing safe data only and must not store visitor chat
  transcripts or expose reporter identity.
Risk:
- Owner-facing moderation summaries can accidentally reveal reporter/private
  context if serialization is too broad.
Task:
- Review PR211 for authorization, public/private separation, report-status
  leakage, raw ids, transcript retention, and missing tests.
```

If implementation requires a storage/retention decision, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS mapped PR211 but found useful analytics need new public interaction
  storage or retention policy.
Options:
- Present the smallest viable storage choices and privacy tradeoffs.
Task:
- Choose the next lane before implementation.
```
