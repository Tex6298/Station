# PR402 - Native Authoring Guide Human Rehearsal

Date: 2026-06-27
Owner: ARIADNE
Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR401 as PASS WITH ARGUS PATCH.
- PR401 added visible owner-side Authoring Guide copy to /studio/publish for typed documents, owner-only version history, review readiness, linked discussion, and retract hide-not-delete.
- MIMIR wants a human-eye rehearsal because this changes user-facing authoring UX.
Task:
- Rehearse the existing Studio publish/publishing surfaces as an owner-visible human run.
- Report PASS/BLOCKED with exact visible defects or wake DAEDALUS if a narrow UI fix is needed. Do not go idle without a wakeup commit.
Scope:
- No new hosted publish/retract/data mutation, schema, migrations, rich-editor package, scheduling, social dispatch, Station Press, provider/model routing, Redis, Cloudflare, workers, queues, billing, Stripe, auth, or deployment behavior.
```

## Context

PR401 did not add a rich editor or change publishing behavior. It added
owner-side guidance to make the existing native document surface honest about
what Station can already do:

- private draft authoring;
- owner-only saved version history;
- approval publish and human review;
- public readback after approval;
- linked discussion when comments are enabled for public/community/unlisted
  documents;
- retract-to-private as hide-not-delete.

ARGUS patched one readiness overclaim so the guide uses the actual Station
destination toggle and review-control readiness before saying a draft is
queue-ready.

## Human Rehearsal Routes

Use the human routes, not just static code review:

- `/studio/publish`
- `/studio/publish?documentId=<existing owner draft or published document>`
  when an owner document exists
- `/studio/publishing`

If rehearsing hosted Railway, verify the deployed build is at or after
`1c0f7015`. If hosted is stale, report `BLOCKED: hosted not fresh enough`
instead of inventing acceptance.

## Checks

- The Authoring Guide is visible, readable, and sounds like Station rather than
  generic SaaS.
- The guide does not say `Queue-ready` when Station destination is off, no Space
  is selected, visibility is private, or review controls are disabled.
- The guide clearly explains private draft state, owner-only versions,
  approval/human review, linked discussion, and retract hide-not-delete.
- The plain textarea remains honest; formatting, connectors, scheduling, social
  dispatch, and rich-editor controls are not implied as live.
- `/studio/publishing` still makes edit, review, approval, retract, and view
  states understandable to a human owner.
- Mobile widths around 375-390px have no horizontal overflow, clipped buttons,
  or offscreen critical controls.
- No raw IDs, secrets, private source body, private versions, or owner-only
  archive material are exposed in public-facing copy.

## Non-Scope

- Do not create, publish, retract, or mutate hosted data unless the route is
  already safely seeded for rehearsal and no production-like data is touched.
- Do not open schema, migrations, rich editor, scheduling, social dispatch,
  Station Press, provider/model routing, Redis, Cloudflare, workers, queues,
  billing, Stripe, auth, or deployment behavior.

## Result Contract

Write the result to:

```text
docs/roadmap/PR402_NATIVE_AUTHORING_GUIDE_REHEARSAL_RESULT.md
```

If the rehearsal passes, wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Verdict:
- PASS
Task:
- Close PR402 and choose the next roadmap move.
```

If a narrow UI fix is needed, wake DAEDALUS with exact routes, screenshots or
selectors where possible, expected behavior, and observed behavior.

If product direction is needed, wake MIMIR with the exact decision required.
