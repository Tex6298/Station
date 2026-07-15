# PR527F - Settings Persistence Truth Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - ranked correction boundary preflight

## Product Problem

The PR527 inventory ranks Settings persistence truth sixth:

```text
Notification controls visibly do not persist; Profile/Privacy are destinations
without settings behavior.
```

Current source has improved part of that truth since the inventory was framed:

- Profile and Privacy cards are visibly `Coming soon` and are not links;
- account deletion is visibly unavailable;
- notification rows are disabled and explicitly say they are not persisted;
- AI provider settings, Billing, Social, Export, Notifications, storage, usage,
  and AI observability are separate current destinations/readbacks.

That means this lane must not blindly implement the stale inventory wording or
turn all five disabled notification labels into fake saved checkboxes. Decide
the smallest real correction against current source and hosted truth.

## Candidate Bounded Capability

Hostile-preflight one real in-app preference first:

```text
Forum reply notifications
```

The current backend creates `thread_comment` notifications for thread authors
and unmuted watchers, while report/review status notifications are separate.
Determine whether a single owner preference can safely:

1. default enabled for existing/new users;
2. persist through an owner-only GET/PATCH contract;
3. suppress only future `thread_comment` notification creation when disabled;
4. leave thread watches, existing notification rows, report/review status,
   moderation, email/external delivery, and every unsupported notification
   category unchanged;
5. return authoritative saved state and survive refresh; and
6. fail closed in the UI without showing a changed state before authoritative
   readback.

If this cannot be done as one coherent bounded slice, reject it with the exact
blocker and choose the smallest truthful removal/copy correction. Do not accept
a preference that merely persists a checkbox but is ignored by notification
creation.

## Required Inspection

Read current implementation, tests, migrations, generated database types, and
safe hosted schema/read truth for:

- `apps/web/app/settings/page.tsx` and Settings components/styles/tests;
- `apps/api/src/routes/settings.ts` and its tests;
- `apps/api/src/routes/notifications.ts`;
- `apps/api/src/services/community-notifications.service.ts`;
- `community_notifications`, `community_thread_watches`, profile/default
  contracts, and migration conventions; and
- every call site that creates `thread_comment`, `report_status`, or
  `review_request_status` notifications.

Map exactly which visible Settings controls are live, linked, unavailable, or
decorative. Check current System/Light/Dark and narrow presentation, but do not
turn this preflight into a broad Settings reskin.

## Required Boundary Decisions

Return an implementation-ready contract covering:

1. whether PR527F implements one real forum-reply preference or removes the
   remaining false control presentation;
2. exact schema/table/column/default/RLS/owner and migration boundary, if any;
3. exact authenticated API routes, request/response shapes, validation,
   idempotency, stale-response, and bounded-error behavior;
4. exact notification-generation gate and which types/callers it may affect;
5. exact initial loading, ready-enabled, ready-disabled, saving, saved,
   failed, reconciliation, and refresh states;
6. exact visible copy for the live preference and unavailable Archive
   completions, Integrity reminders, follower, and event categories;
7. existing-notification and thread-watch non-destruction guarantees;
8. exact code/test/migration file allow-list;
9. local unit/integration/rendered validation; and
10. a reversible hosted lifecycle with an accepted disposable second actor,
    authoritative row/readback proof, cleanup, and unrelated-notification
    no-drift checks.

Explicitly decide whether the preference belongs in `profiles`, a dedicated
owner preference table, or an existing accepted settings structure. Prefer the
smallest ownership model that gives correct defaults, RLS, future extension,
and atomic authoritative readback; do not add abstraction for hypothetical
categories.

## Guardrails

Do not change AI provider keys/routing, Gemini/NVIDIA policy, Profile or Privacy
account behavior, account deletion, social publishing, billing/prices/Stripe,
storage/usage, notification read/unread semantics, thread watch semantics,
report/review status delivery, email/external delivery, packages, Cloudflare,
Redis, Railway variables, or Archive connector configuration.

Do not mutate hosted product data during preflight. Read-only hosted schema and
rendered orientation are allowed, with no credentials, ids, raw bodies, or
private evidence retained.

## Result

Create:

`docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`

End with one exact verdict and next owner:

```text
ACCEPT_PR527F_<EXACT_BOUNDARY>
```

or

```text
BLOCK_PR527F_<EXACT_BLOCKER>
```

On acceptance, specify the smallest DAEDALUS implementation task in full. On a
blocker, identify the smallest numbered unblock lane rather than widening into
general Settings work.

Allowed committed paths:

```text
docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARGUS.json
```

Commit and push the result, then wake MIMIR explicitly with `WAKEUP A1:`. Do
not stop at an uncommitted report.
