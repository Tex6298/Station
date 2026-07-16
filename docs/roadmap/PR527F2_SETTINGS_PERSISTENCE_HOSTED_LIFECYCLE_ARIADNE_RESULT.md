# PR527F2 - Settings Persistence Hosted Lifecycle ARIADNE Result

Owner: ARIADNE / A4

Reviewed hosted runtime: `e542423bc07a9be77e7ad82f2b5ac6b65af087da`

Date completed: 2026-07-16

Status:

```text
BLOCK_PR527F2_EVIDENCE_HARNESS_CLEANUP_TIMESTAMP_DRIFT
```

## Verdict

PR527F2 is blocked. The hosted entry gate passed and the bounded lifecycle
proved the auth boundary, ordinary Visitor signup, default-enabled preference,
direct fixture boundary, first eligible reply, one owner-safe notification,
and unchanged Watch and moderation-notification counts. The local Playwright
interception harness then failed while holding the first Settings loading gate.
No false preference PATCH had been sent.

The unhandled route callback terminated the Node process before its in-process
`finally` could run. A separate recovery pass resolved the one disposable
identity and its exact tagged rows without ambiguity, removed them in dependency
order, deleted the exact Auth user, restored the replay owner's semantic
community-activity counters, and proved zero disposable residue.

One retained field cannot be restored or honestly waived here. The replay
owner's complete pre-run community-profile snapshot existed only in the
terminated process. The first comment had advanced that row's `updated_at`.
Recovery restored every semantic value while suppressing another timestamp
advance, but the original timestamp was no longer available. The managed
database role cannot inspect dead heap tuples, read relation files, or install
`pageinspect`; no authorized evidence path could reconstruct the exact prior
value. Mandatory exact retained-state restoration therefore failed.

ARIADNE did not rerun hosted writes or claim the remaining product/UI gates.
This result is an evidence-harness cleanup blocker, not evidence of a Settings
product defect.

## Entry Gate

| Check | Result |
| --- | --- |
| Web deployment | `200`, healthy/ready, `main`, exact accepted SHA |
| API deployment | `200`, healthy/ready, `main`, exact accepted SHA |
| Migration `084` SHA-256 | `BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263` |
| Migration ledger | Exactly one row for `084_community_notification_preferences` at `20260716010501` |
| Initial preference rows | `0` |
| Locked runtime-path drift | `0` |
| Initial tagged residue | `0` |

The same deployment SHA, ledger row, migration hash, locked-path state, and
zero global preference-row state remained true in the final read-only proof.

## Lifecycle Record

| Step | Result |
| --- | --- |
| Aggregate/type/tag baseline | Passed in memory; exact post-run aggregate comparison became unavailable when the process terminated |
| Signed-out GET/PATCH | `401` / `401` |
| Authenticated malformed PATCH | `400`; preference rows remained `0` |
| Ordinary Station signup | `201`; one Visitor, non-admin profile |
| Default preference truth | No owner row; authenticated GET `200`, enabled `true` |
| Direct fixture boundary | One exact tagged readable thread under an existing safe public category; no Visitor thread-creation claim |
| First replay-owner reply | `201`; exactly one `thread_comment` notification |
| Owner notification readback | `200`; exactly one matching owner-safe result |
| Watch/report/review counts after first reply | Unchanged except the one expected `thread_comment` row |
| Settings loading state | Reached; local route-release callback then failed |
| False, repeat-false, and suppression lifecycle | Not run |
| True/no-backfill lifecycle | Not run |
| Direct RLS matrix | Not run |
| Full keyboard/theme/viewport matrix | Not run |

No false or true preference write occurred. No second comment was created. No
external-delivery fixture, credential, or provider path was used; the completed
fanout step created only the expected in-product notification row.

## Harness Failure

The loading-state route handler was released and then unregistered before its
asynchronous `route.continue()` had completed. Playwright rejected the second
route handling with `Route is already handled!`. That callback rejection was
outside the lifecycle promise chain, so Node terminated instead of entering the
script's normal cleanup block.

The browser had rendered the loading state, but no later screenshot or visual
state is accepted as evidence. The temporary capture is not committed.

## Recovery And Cleanup

Recovery first required exactly one Auth/profile identity matching the unique
PR527F2 prefix and ordinary signup relation. It then required exactly one tagged
fixture thread and exactly one tagged comment before deleting anything. No
broad predicate or retained-account delete was issued.

| Cleanup proof | Result |
| --- | --- |
| Exact in-product notification rows deleted | `1` |
| Exact comment rows deleted | `1` |
| Exact fixture thread rows deleted | `1` |
| Exact disposable Auth users deleted | `1`; profile cascaded |
| Preference rows created/deleted | `0` / `0` |
| Replay semantic activity values | Restored: thread/comment/helpful counts, reputation, and trust level |
| Tagged Auth residue | `0` |
| Tagged profile residue | `0` |
| Tagged preference residue | `0` |
| Tagged thread/comment residue | `0` / `0` |
| Tagged notification/Watch residue | `0` / `0` |
| Tagged storage/token-usage/token-transaction residue | `0` / `0` / `0` |
| Exact aggregate-baseline comparison | Unavailable after process termination |
| Replay profile restored byte-for-byte | **Fail:** pre-run `updated_at` is unavailable |

The final read-only proof also found global preference rows at `0`. No retained
tier, billing, Profile semantics, preference, Watch, notification, report,
review, existing thread/comment row, Railway variable, schema, or configuration
was intentionally changed. The only known retained drift is the replay
community-profile timestamp described above.

## Scope And Validation

No product source, test, migration, package, lockfile, runtime configuration,
or hosted deployment was changed. Temporary recovery, inspection, and browser
harnesses were removed before commit.

| Check | Result |
| --- | --- |
| Final exact-SHA/ledger/preference/residue/counter readback | Pass, except the explicitly blocked retained timestamp |
| `git diff --check` | Pass |
| Typecheck | Not required; result is documentation-only and touches no import or script |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE stopped PR527F2 after the browser interception harness crashed following the first tagged comment.
- Exact disposable rows/Auth were removed and semantic replay activity counters restored, but the pre-run retained activity updated_at was lost with the in-memory snapshot.
Verdict:
- BLOCK_PR527F2_EVIDENCE_HARNESS_CLEANUP_TIMESTAMP_DRIFT
Task:
- Decide the smallest audited cleanup/evidence repair; do not close PR527F or rerun hosted writes until the retained timestamp drift is dispositioned.
```
