# PR527F2 - Settings Persistence Hosted Lifecycle

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Queued after PR527F1 schema acceptance

## Authority And Entry Gate

Use:

- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`
- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_ARGUS_RESULT.md`
- `docs/roadmap/PR527F1_SETTINGS_PERSISTENCE_HOSTED_SCHEMA_DEPLOYMENT_DAEDALUS_RESULT.md`

Do not begin unless PR527F1 proves exact migration `084`, one honest ledger
row, zero initial preference rows, healthy/ready deployed source descending
from accepted product floor `e542423bc07a...` with zero locked-path drift, and
zero unrelated product drift.

This is a bounded hosted product lifecycle and human-eye Settings rehearsal,
not permission to patch code. If any gate fails, clean up what was created,
commit a sanitized block result, and wake MIMIR.

## Exact Disposable Lifecycle

Use one unique public-safe PR527F tag. Keep generated credentials, access
tokens, user ids, and fixture ids in memory only. The disposable preference
owner/recipient must be created through ordinary Station signup at the Visitor
tier. The retained replay owner may act only as the eligible commenter.

1. Snapshot aggregate counts by notification type, Watches, threads, comments,
   preferences, profiles, Auth users, and exact tag residue. Require no tag
   match and retain no row contents.
2. Re-prove signed-out GET/PATCH `401` and authenticated malformed PATCH `400`,
   with zero preference-row change.
3. Create one tagged disposable Visitor through ordinary Station signup. Do
   not alter its tier, billing state, or Profile beyond ordinary signup.
4. Prove the disposable owner has no preference row and authenticated GET
   returns Forum replies enabled.
5. Insert one exact tagged readable fixture thread under an existing safe
   public category, authored by the disposable profile. Direct insertion is
   allowed only because Visitor entitlement does not permit product thread
   creation; do not claim that capability.
6. Have the retained replay owner create one safe tagged comment through the
   deployed comment API. Require `201`, exactly one disposable-recipient
   `thread_comment` notification, owner-safe notification API readback, and no
   Watch/report-status/review-request-status change.
7. PATCH the disposable preference false. Require authoritative false response,
   GET false, exactly one owner row, and the same false/Off state after a fresh
   Settings browser load and refresh.
8. Repeat PATCH false once. Require false and still exactly one owner row.
9. Have the replay owner create a second safe tagged comment through the API.
   Require `201`, zero notification for that event, the first notification
   unchanged, Watches unchanged, and moderation notification counts unchanged.
10. PATCH true. Require authoritative true, GET true, and refreshed Settings
    UI `On`. The suppressed historical event must not be backfilled.
11. Prove direct authenticated RLS using aggregate/status evidence only: the
    disposable token can read only its row; replay owner cannot read or update
    it; anon reads zero and cannot write.
12. Human-eye Settings rehearsal must cover fresh load, save-in-progress,
    authoritative Off after refresh, authoritative On after refresh, keyboard
    focus/Space/Enter, System/Light/Dark at desktop and `390x844`, exact four
    unavailable facts, geometry/overflow, failed responses, page errors, and
    unclassified console errors. Each action must agree with API/database
    truth; do not perform additional product writes for visual variation.

## Mandatory Cleanup

Cleanup runs in `finally`, including on a failed assertion:

1. Delete only exact in-memory/tagged notification rows, comments, and fixture
   thread rows in dependency-safe order.
2. Delete the exact disposable Auth user so its Profile and preference row
   cascade.
3. Resolve ambiguity only from in-memory ids plus the exact generated tag.
   Never issue a broad delete or touch a retained account.
4. Prove zero tagged Auth/profile/preference/thread/comment/notification residue,
   exact restored aggregate baselines, unchanged Watches, unchanged
   report/review notification counts, and no external delivery attempt.

Do not mutate retained tiers, billing, profiles, preferences, Watches,
notifications, reports, reviews, existing thread/comment state, Railway
variables, or configuration. Never print secrets, credentials, tokens, ids,
row bodies, or private data.

## Result And Handoff

Create:

`docs/roadmap/PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE_ARIADNE_RESULT.md`

Record pass/fail for every step, sanitized counts/statuses, browser matrix,
diagnostics, and mandatory cleanup/restoration. A pass verdict is:

```text
PASS_PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE
```

Commit and push the result, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR527F2's disposable hosted preference, fanout, RLS, refresh, keyboard, theme, and cleanup lifecycle.
Verdict:
- PASS_PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE (or exact bounded blocker)
Task:
- Close or repair PR527F from the committed hosted evidence and keep the next ranked product lane moving.
```

ARIADNE may change only its result, operational status/index/baseline docs, and
`.station-agents/state/ARIADNE.json`. Product patches are forbidden in this
lane.
