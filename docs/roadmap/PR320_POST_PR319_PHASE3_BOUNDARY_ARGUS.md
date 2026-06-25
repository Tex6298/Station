# PR320 - Post-PR319 Phase 3 Boundary Classification

Owner: ARGUS

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Trigger

PR319 passed the hosted public persona report moderation rehearsal after the
web/API refresh and dedicated admin replay alias restore.

Current accepted Phase 3 public persona evidence:

- PR315 proved signed-in non-owner public persona chat on the hosted replay
  seed, with owner readback staying aggregate/safe.
- PR316 proved signed-in public persona report creation and owner
  aggregate/status-only report readback.
- PR318 hardened the admin persona-report moderation pointer and safe human row
  context.
- PR319 proved the hosted human admin moderation route
  `/forums/moderation?targetType=persona`, persona-filtered admin queue,
  safe persona report row context, non-admin boundary, non-admin owner
  aggregate/status readback, and desktop/mobile fit.

## Task

Classify the next Phase 3 boundary from current repo truth and committed result
docs.

Return exactly one of:

```text
PUBLIC PERSONA INTERNAL PILOT CLOSED
NEXT BOUNDED LANE
MARTY DECISION REQUIRED
BLOCKED ON UNSAFE CONDITION
```

If `PUBLIC PERSONA INTERNAL PILOT CLOSED`, name what is now proven, what remains
explicitly unclaimed, and the safest next owner for a closeout/status update if
one is needed.

If `NEXT BOUNDED LANE`, name exactly one lane, owner, scope, non-goals,
acceptance bar, and validation. It must be smaller than a launch claim and must
not require new Marty config or product policy.

If `MARTY DECISION REQUIRED`, ask exactly one concrete decision question and
state why no safe internal lane should start first.

If `BLOCKED ON UNSAFE CONDITION`, name the exact blocker and the smallest
evidence needed to unblock.

## Do Not Open

Do not implement code or wake DAEDALUS/ARIADNE directly.

Do not open or imply:

- anonymous public chat;
- external public persona pilot;
- public launch claim;
- commercial packaging, pricing, billing, entitlement, or partner claim;
- provider/model/embedding changes;
- Redis, Cloudflare, queues, workers, durable visitor transcripts, visitor
  identity analytics, or broad analytics storage;
- broad moderation redesign;
- broad UI redesign;
- private Memory, Archive, Continuity, Canon, Integrity, import/export, or
  Developer Space work unless it is only named as out-of-scope context.

## Required Inputs

Read:

- `docs/roadmap/PR315_PUBLIC_PERSONA_PILOT_TESTER_ACCESS_RERUN_RESULT.md`
- `docs/roadmap/PR316_PUBLIC_PERSONA_REPORT_PATH_REHEARSAL_RESULT.md`
- `docs/roadmap/PR318_PUBLIC_PERSONA_REPORT_MODERATION_POINTER_RESULT.md`
- `docs/roadmap/PR319_PUBLIC_PERSONA_REPORT_MODERATION_HOSTED_REHEARSAL_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- any directly relevant current code only if needed to avoid a false claim

## Output

Write:

```text
docs/roadmap/PR320_POST_PR319_PHASE3_BOUNDARY_RESULT.md
```

Then wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS classified the post-PR319 Phase 3 boundary.
Verdict:
- PUBLIC PERSONA INTERNAL PILOT CLOSED / NEXT BOUNDED LANE / MARTY DECISION REQUIRED / BLOCKED ON UNSAFE CONDITION.
Task:
- Close Phase 3 public persona internal pilot, open the named next lane, ask Marty the exact question, or resolve the blocker.
```
