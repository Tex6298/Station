# PR469 - Live Events / Seminars Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - boundary preflight

## Why This Lane

PR468 Anonymous Public Persona Chat is closed. Marty clarified that the next
feature choice should move toward a named Phase 3, customer-facing expansion
lane unless there is a concrete blocker.

MIMIR selects Live Events / Seminars as the next named Phase 3 feature to
preflight. This is not another anonymous-chat extension, public persona
hardening pass, or general UI polish lane.

## Preflight Question

Can Station safely open a first Live Events / Seminars product slice using the
public-safe surfaces already proven by Public Spaces, public persona readback,
published documents, forums, and Developer Spaces?

ARGUS should answer with one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the smallest implementation shape. If blocked
or decision-dependent, wake MIMIR with the concrete blocker and the smallest
numbered unblock lane that directly enables Live Events / Seminars.

## Starting Interpretation

Treat the first slice as scheduled or curated public readback, not realtime
infrastructure.

The likely safe shape is a seminar/event card or page that points to existing
public material:

- a public published document, public Space, public persona, public Project, or
  Developer Space;
- an already-routeable public forum discussion for questions or follow-up;
- optional host/owner labeling and schedule/status copy if the existing schema
  can support it safely.

ARGUS may accept, narrow, reject, or replace this shape.

## Repo Evidence To Inspect

- Public persona readback/chat/events:
  `apps/api/src/routes/personas.ts`,
  `apps/web/app/personas/[publicSlug]/page.tsx`,
  `packages/types/src/persona.ts`.
- Forums, public discussions, reports, and community moderation:
  `apps/api/src/routes/forums.ts`,
  `apps/api/src/routes/threads.ts`,
  `apps/api/src/routes/comments.ts`,
  `apps/api/src/routes/reports.ts`,
  `packages/types/src/forum.ts`.
- Published documents, Writing, public Space pages, and discussion links:
  `apps/api/src/routes/documents.ts`,
  `apps/web/app/writing`,
  `apps/web/app/space/[slug]/page.tsx`,
  `packages/types/src/document.ts`.
- Developer Spaces observatory/events:
  `apps/api/src/routes/developer-spaces.ts`,
  `apps/api/src/services/developer-space.service.ts`,
  `packages/types/src/developer-space.ts`,
  `packages/developer-space-client/src/index.ts`.
- Tier and permission boundaries only if needed:
  `packages/config/src/tiers.ts`,
  `packages/auth/src/permissions.ts`.

## Questions ARGUS Must Answer

1. What is the first Station-native Live Events / Seminars slice: derived
   readback, scheduled metadata, public document/forum bundle, Developer Space
   field session, or something narrower?
2. Can the first slice be schema-free, or does it require a migration?
3. Who can host or own the first slice: persona owner, Space owner, Project
   owner, Developer Space owner, or account owner only?
4. What visibility is allowed first: public-only readback, owner draft/private
   staging, or both?
5. Should attendance, RSVP, registration, or reminders be deferred?
6. Should discussion use existing public forum threads instead of live chat?
7. Should recording, transcript, archive import, continuity promotion, or memory
   writeback be deferred?
8. Should payments, tickets, Stripe, billing entitlements, or plan limits be
   deferred?
9. What moderation/reporting path is required for public readback?
10. What focused tests and hosted rehearsal would prove the first slice?

## Hard Boundaries

Do not open or claim:

- realtime rooms, WebSockets, SSE live-room behavior, video, audio, voice,
  avatar media, livestreaming, recording, or transcript generation;
- provider calls, persona-to-persona behavior, private chat, or memory writeback;
- tickets, payments, Stripe, invoices, attendance, RSVP, reminders, or calendar
  integrations unless ARGUS names them as a future gated lane;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, private
  documents, provider settings, raw ids, credentials, storage paths, source
  bodies, or visitor identity in public readback;
- Developer Agent runtime, Redis, Cloudflare, workers, queues, or new external
  config;
- broad UI reskin, global Discover rebuild, or public persona chat expansion.

## Expected Output

ARGUS should produce a review result doc that includes:

- verdict;
- exact first DAEDALUS lane name if accepted;
- concrete blocker and smallest unblock lane if blocked;
- accepted product shape and explicit non-goals;
- files/routes/tests DAEDALUS must touch;
- required validation commands;
- hosted rehearsal requirement for ARIADNE if implementation proceeds.

## Validation For This Preflight

This is a docs-only preflight handoff. MIMIR validation for opening it is:

```bash
git diff --check
git diff --cached --check
```

## Wakeup Template

If accepted, ARGUS should wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR469 Live Events / Seminars preflight.
Task:
- Implement the smallest accepted Live Events / Seminars slice.
```

If blocked or decision-dependent, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR469 Live Events / Seminars preflight.
Blocker:
- ...
Task:
- Choose the smallest numbered unblock lane or make the named product decision.
```
