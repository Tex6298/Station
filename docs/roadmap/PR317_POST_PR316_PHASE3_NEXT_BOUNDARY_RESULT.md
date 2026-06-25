# PR317 - Post-PR316 Phase 3 Next Boundary Result

Owner: ARGUS

Date: 2026-06-25

Status: Complete

## Verdict

Classification:

```text
NEXT BOUNDED LANE
```

Recommended next lane:

```text
PR318 - Public Persona Report Moderation Pointer and Admin Readback Hardening
Owner: DAEDALUS
```

Marty input is not required for this lane. The lane stays inside the current
internal hosted public persona pilot boundary because PR315 and PR316 already
proved signed-in non-owner public persona chat/report creation plus owner
aggregate/status readback. The remaining useful boundary is the human admin
moderation path for those persona reports, not anonymous chat, external launch,
commercial packaging, partner claims, provider/model work, Redis, Cloudflare,
workers, durable transcripts, visitor identity analytics, or broad UI.

## Boundary Finding

ARGUS static review found a concrete narrow gap before ARIADNE should rehearse
persona-report moderation readback:

- the owner persona readback can serialize an admin queue pointer for admin
  viewers as `/reports?targetType=persona`;
- the human-visible moderation console is `/forums/moderation`;
- the generic moderation console can display target labels through fallback
  target ids if a safer target context label is not used.

That does not invalidate PR315 or PR316, because those passes did not rely on an
admin owner clicking the moderation pointer and did not claim admin queue
browser proof after report creation. It does mean the next lane should be a
small DAEDALUS hardening lane before any hosted admin readback rehearsal or
stronger moderation-loop claim.

## PR318 Scope

DAEDALUS should make the smallest product-code change needed so public persona
reports have a real, human-visible admin moderation path after report creation.

Required scope:

- route any owner/admin persona-report pointer to a valid human web surface,
  preferably `/forums/moderation` with a persona target filter or equivalent
  in-page state;
- preserve the API `/reports` queue as the authenticated admin data route, not
  as the web destination shown to humans;
- ensure non-admin owners do not see an admin moderation pointer;
- ensure admin-visible persona report rows show safe persona target context,
  public route/name/status, and status controls without human-visible raw
  persona ids, reporter ids, report ids, visitor ids, private source ids,
  transcripts, provider traces, billing identifiers, credentials, or SQL;
- keep persona report target actions unavailable unless a separate explicit
  moderation action lane is opened;
- keep owner persona readback aggregate/status-only for non-admin owners and
  avoid exposing reporter identity, report notes/bodies, or visitor chat bodies
  there.

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

PR318 should pass only if:

- an admin user can reach the human moderation queue for persona reports from
  the relevant visible route or control;
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

Expected DAEDALUS validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

After ARGUS accepts PR318, MIMIR may open a separate ARIADNE hosted/browser
rehearsal for the human admin moderation path if the visible route changed or
if hosted evidence is needed before a stronger moderation-loop claim.

## Rejected Classifications

`MARTY DECISION REQUIRED` is not the right result because a bounded internal
hardening lane exists without asking Marty to choose an external product,
commercial, or partner promise.

`BLOCKED ON UNSAFE CONDITION` is not the right result because the unsafe
condition is narrow and actionable: repair the human moderation pointer/admin
readback boundary before rehearsing it.

Anonymous public chat, external public pilot, public launch, commercial
packaging, and partner claims still require explicit Marty/MIMIR product
decisions before any implementation or claim.

## PR317 Validation

PR317 is docs/preflight only. ARGUS validation:

- read PR315, PR316, PR313, `ACTIVE_STATUS`, and the relevant persona/report
  moderation code paths;
- inspected the public persona owner readback, report route, admin report API,
  and `/forums/moderation` web route;
- ran docs whitespace and staged-diff validation before commit.

## Wakeup

Wake MIMIR with `NEXT BOUNDED LANE`.
