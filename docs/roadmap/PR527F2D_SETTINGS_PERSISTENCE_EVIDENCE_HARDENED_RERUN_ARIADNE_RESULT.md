# PR527F2D - Settings Persistence Evidence-Hardened Rerun ARIADNE Result

Owner: ARIADNE / A4

Reviewed hosted runtime: `e542423bc07a9be77e7ad82f2b5ac6b65af087da`

Date completed: 2026-07-16

Status:

```text
BLOCK_PR527F2D_RLS_EXPECTATION_AND_DURABLE_JOURNAL_GATE
```

## Verdict

PR527F2D cannot receive the pass marker. The local failure-mode harness passed
before any hosted write, the accepted retained-baseline entry gate passed, and
the authorized hosted run completed the product, fanout, persistence, refresh,
keyboard, theme, and viewport lifecycle. The run then stopped inside the
direct-RLS evidence step because the harness expected an anonymous table read
to return `200` with zero rows. Hosted PostgREST returned `401`, which is the
secure result for migration `084`'s intentional absence of an anonymous grant.

The anonymous write check consequently did not run. In addition, the completed
direct-RLS statuses and consolidated browser result were still held in child
memory rather than being atomically appended to the recovery journal before the
next route. The child failure therefore left process-path evidence but not the
complete durable evidence required by this lane. ARIADNE does not reinterpret
that partial record as a pass and did not run a second hosted lifecycle.

Parent cleanup, an independent idempotent recovery pass, and a separate fresh
read-only proof all reached exact restoration and zero residue. No product
defect or retained-state drift was established. The blocker is confined to the
RLS expectation and evidence-journaling harness.

## Entry And Local Harness Gates

The required entry verdict was present:

```text
ACCEPT_PR527F2C_RETAINED_BASELINE_WITH_TRUTHFUL_IRREVERSIBLE_AUDIT_TIMESTAMPS
```

The final local harness execution intercepted every API, Auth, and database
route and made no hosted mutation.

| Local proof | Result |
| --- | --- |
| Playwright loading release cycles | `2`; callback awaited before `unroute` |
| Route-handling errors | `0` |
| Unhandled rejections | `0` |
| Parent cleanup scenarios | `5/5`: success, assertion failure, unhandled rejection, forced nonzero exit, interrupted child |
| Parent cleanup runs | `5`; zero synthetic residue after each |
| Parent atomic journal writes | `10` |
| Independent recovery runs | `2`; idempotent zero synthetic residue |
| Independent recovery atomic writes | `3` |
| Hosted mutations during local gate | `0` |

The durable hosted recovery directory and journal were created outside Git in
the owner-only OS temporary area before the first mutation. Journal replacement
used a same-directory temporary file, flush/fsync, atomic rename, and fsync of
the committed file. Credentials, tokens, private identifiers, row bodies, and
the journal were never printed, screenshotted, or committed.

## Hosted Preflight

| Check | Result |
| --- | --- |
| Web and API deployment | `200`, healthy/ready, `main`, exact accepted SHA |
| Migration `084` SHA-256 | `BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263` |
| Migration ledger | Exactly `20260716010501 / 084_community_notification_preferences` |
| Locked runtime-path drift | `0` |
| Initial preference rows | `0` |
| Initial Watches | `0` |
| Initial notifications | `0` |
| Initial tagged residue | `0` |
| Initial Auth/storage/token orphans | `0` |
| Retained replay baseline | Exact PR527F2C accepted snapshot |

Two preflight-only harness assertions were corrected before the accepted
preflight: one table-comment matcher and one Auth refresh-metadata UUID/text
join. These attempts were read-only and occurred before the single authorized
hosted lifecycle.

## Hosted Lifecycle Record

| Step | Result |
| --- | --- |
| Signed-out preference GET/PATCH | `401` / `401`; no preference row |
| Ordinary Station signup | `201`; one tagged Visitor, non-admin disposable owner |
| Malformed authenticated PATCH | `400`; no preference row created |
| Missing-row preference truth | Authenticated GET `200`, enabled `true` |
| Fixture boundary | One exact tagged readable thread inserted under an existing safe public category; no Visitor thread-creation claim |
| Replay-owner sign-in | Normal sign-in; one exact new session and two linked refresh rows journaled |
| First replay-owner comment | `201`; exactly one disposable-recipient `thread_comment` notification |
| Notification readback | Owner-safe API read `200`; exactly one matching notification |
| Unrelated fanout/moderation state | Watches, report-status notifications, and review-request notifications unchanged |
| Pointer false | One strict browser PATCH; prior checked truth retained while saving; authoritative false and fresh Off |
| Repeat API false | `200`; still false; exactly one owner preference row |
| Second replay-owner comment | `201`; zero new notification; first notification unchanged |
| Space true | One browser PATCH; authoritative true and fresh On; no historical backfill |
| Enter false | One browser PATCH; prior truth retained while saving; authoritative false |
| Enter true | One browser PATCH; prior truth retained while saving; final authoritative true |
| Final preference cardinality | Exactly one disposable-owner row, enabled `true` |

The browser emitted exactly four Settings PATCH bodies in order:

```text
false, true, false, true
```

All four returned `200`. With the one direct repeat-false API write, the run
made five successful preference writes while preserving one-row cardinality.
The hosted product-write cardinalities before cleanup were:

```text
ordinary disposable signups=1
ordinary replay sign-ins=1
fixture threads=1
comments=2
in-product notifications=1
successful preference writes=5
browser preference PATCHes=4
```

No external delivery credential, fixture, provider, or delivery path was used.

## RLS Blocker

The direct-RLS step reached these results in the lifecycle child:

| Principal/action | Observed result |
| --- | --- |
| Disposable owner SELECT | `200`; exactly its own preference row |
| Retained replay owner SELECT | `200`; zero rows |
| Retained replay owner cross-owner PATCH | Accepted HTTP status with zero returned/updated rows |
| Anonymous SELECT | `401`; harness incorrectly required `200` with zero rows |
| Anonymous write | Not run because the preceding assertion stopped the child |

The `401` is consistent with the catalog-proven no-anonymous-grant boundary and
does not show a product authorization failure. It still prevents acceptance:
the contract required both anonymous read and write evidence, and the harness
must accept secure denial statuses such as `401`/`403` rather than requiring a
row-filtered `200`.

The direct-RLS statuses were assigned to the consolidated result only after the
whole function returned. They were not fsynced one step at a time before the
next request. The same late assignment applied to the final browser evidence
object. Although the child had completed all browser assertions and journaled
the individual preference writes, its later RLS assertion prevented those two
aggregate evidence objects from becoming durable. This violates PR527F2D's
evidence-hardening requirement independently of the missing anonymous write.

## Browser And Human-Eye Review

The completed browser phase covered loading, saving, Off, On, exact unavailable
facts, focus, pointer/Space/Enter, and the System/Light/Dark matrix at
`1440x900` and `390x844`. Browser assertions found:

- no unexpected non-GET request;
- no failed product API response;
- no page error, console error, or request failure;
- no geometry overlap or horizontal overflow; and
- no extra product write from theme or viewport changes.

Human-eye review found the Settings panel clear and readable in Light and Dark
desktop/mobile captures. The mobile layouts did not overlap or overflow. The
saving capture visibly retained the prior checked state while disabled and
showed `Saving...`; the refreshed false capture visibly showed `Paused` and an
unchecked control. The loading locator assertion passed in process, but the
loading screenshot framed the heading at the viewport edge and did not visibly
capture the loading status. That image is not claimed as human-eye proof of the
loading copy.

All screenshots were temporary disposable-Visitor artifacts and are absent
from the repository.

## Cleanup And Fresh Restoration Proof

The parent entered cleanup after the child assertion failure. The same durable
journal was then consumed by an independent recovery command, which repeated
cleanup idempotently. A separate fresh process performed the final read-only
proof.

| Cleanup/restoration proof | Result |
| --- | --- |
| Exact notifications targeted | `1` |
| Exact comments targeted | `2` |
| Exact fixture threads targeted | `1` |
| Exact disposable Auth user deleted | Yes; dependent Profile/preference rows cascaded |
| Exact rerun replay sessions targeted | `1` |
| Exact linked replay refresh rows targeted | `2` |
| Replay community snapshot | Exactly restored, including accepted baseline `updated_at` |
| Replay Auth audit snapshot | Exactly restored, including accepted baseline `last_sign_in_at` |
| Owner-linked Auth audit rows | `0` |
| Exact deployment/migration/catalog baseline | Exact |
| Exact aggregate baseline | Exact |
| Retained owner rows | Exact |
| Pre-existing session/refresh metadata | Byte-for-byte exact without selecting token values |
| Tagged and exact run residue | `0` |
| Auth/storage/token orphans | `0` |
| Final preference rows | `0` |
| Final Watches | `0` |
| Final notifications | `0` |

The fresh process independently repeated the deployment, aggregate, catalog,
retained-owner, out-of-scope session/refresh metadata, tag-residue,
exact-residue, orphan, preference, Watch, and notification checks. Every check
passed. Recovery state, temporary credentials, and browser artifacts were
eligible for removal only after that fresh proof; none is committed.

## Scope And Validation

No product source, test, migration, package, lockfile, hosted schema,
configuration, Railway variable, or deployment was changed. No second hosted
lifecycle was attempted. After the separate fresh proof passed, the owner-only
recovery directory, screenshots, temporary credentials, and untracked `.tmp`
harness were removed.

| Check | Result |
| --- | --- |
| Local failure-mode harness | Pass before hosted writes |
| Hosted parent cleanup | Pass |
| Independent idempotent recovery | Pass |
| Separate fresh exact-restoration proof | Pass |
| `git diff --check` | Pass |
| Typecheck | Not required; result is documentation-only and touches no import or script |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR527F2D's product/browser lifecycle and exact external restoration, but stopped before acceptance when the RLS harness treated the correct anonymous 401 as a failure.
- Anonymous write was not exercised and the direct-RLS statuses were not durably journaled step-by-step, so the lane cannot pass.
Verdict:
- BLOCK_PR527F2D_RLS_EXPECTATION_AND_DURABLE_JOURNAL_GATE
Task:
- Decide the smallest authorized RLS/evidence rerun with 401/403 anonymous read/write accepted and every direct-RLS status fsynced before the next route. Current hosted state is exactly restored; do not close PR527F from this partial evidence.
```
