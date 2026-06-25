# PR318 - Public Persona Report Moderation Pointer and Admin Readback Hardening

Owner: DAEDALUS

Opened by: MIMIR

Date: 2026-06-25

Status: Accepted by ARGUS - awaiting MIMIR closeout

## Trigger

ARGUS completed PR317 with:

```text
NEXT BOUNDED LANE
```

Recommended lane:

```text
PR318 - Public Persona Report Moderation Pointer and Admin Readback Hardening
Owner: DAEDALUS
```

MIMIR accepts the classification. Marty input is not needed because this stays
inside the internal public persona pilot boundary proved by PR315 and PR316.

## Problem

PR315 and PR316 proved signed-in non-owner public persona chat/report creation
plus owner aggregate/status readback.

ARGUS found the next narrow boundary gap:

- owner/admin persona readback can serialize an admin queue pointer as
  `/reports?targetType=persona`;
- the human-visible moderation console lives at `/forums/moderation`;
- persona report rows need safe target context in the human admin surface so the
  UI does not fall back to raw ids or unsafe report/private details.

## Scope

Make the smallest product-code change needed so public persona reports have a
real, human-visible admin moderation path after report creation.

Required:

- route any owner/admin persona-report pointer to a valid human web surface,
  preferably `/forums/moderation` with a persona target filter or equivalent
  in-page state;
- keep `/reports` as the authenticated admin data route, not the human web
  destination shown to users;
- ensure non-admin owners do not see an admin moderation pointer;
- ensure admin-visible persona report rows show safe persona target context,
  public route/name/status, and status controls without human-visible raw
  persona ids, reporter ids, report ids, visitor ids, private source ids,
  transcripts, provider traces, billing identifiers, credentials, SQL, or raw
  report bodies;
- keep persona report target actions unavailable unless a separate explicit
  moderation action lane is opened;
- keep owner persona readback aggregate/status-only for non-admin owners.

## Non-Goals

Do not open:

- anonymous public chat;
- external public persona pilot or public launch;
- commercial packaging, pricing, billing, entitlement, or partner claims;
- provider/model/embedding changes;
- Redis, Cloudflare, workers, queues, scheduled jobs, analytics storage, or
  durable visitor transcripts;
- broad moderation redesign, broad Studio redesign, or new report target action
  semantics;
- private Memory, Archive, Continuity, Canon, Integrity, owner setup, private
  search, import/export, or Developer Space surfaces.

## Acceptance Bar

PR318 passes only if:

- an admin user can reach the human moderation queue for persona reports from
  the relevant visible route/control;
- filtering to persona reports is real and does not require a hidden API call
  as the only proof;
- a public persona report created through the public persona report path is
  readable in the admin moderation surface with safe target context and no
  human-visible raw identifiers or private/report-body leakage;
- non-admin owner readback still hides the admin pointer and remains
  aggregate/status-only;
- signed-out and ordinary signed-in users cannot access the admin queue;
- existing report creation, duplicate handling, report status update
  authorization, and owner aggregate/status counters remain unchanged.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Add or update focused tests where the implementation boundary changes.

## Handoff

After implementation, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR318 public persona report moderation pointer/admin readback hardening.
Risk:
- Admin human route, safe persona target context, non-admin owner readback, and raw-id/report-body leakage need hostile review.
Task:
- Review PR318, run validation, and wake MIMIR with accept/fail verdict.
```

## DAEDALUS Result

Implemented in
`docs/roadmap/PR318_PUBLIC_PERSONA_REPORT_MODERATION_POINTER_RESULT.md`.

Summary:

- Admin owner public-persona readback now points to
  `/forums/moderation?targetType=persona`, not the raw `/reports` data route.
- Non-admin owner readback still keeps `adminQueueHref` null.
- `/forums/moderation` reads the `targetType=persona` URL filter and loads the
  authenticated admin report queue with that real filter.
- Human moderation row helpers use safe persona names/route labels/status
  readback and suppress raw persona report note bodies.
- Persona report target actions remain unavailable.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed with 12 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with 6 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 112 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings only.
