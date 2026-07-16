# PR527F2E - Direct RLS Durable Evidence Rerun ARIADNE Result

Owner: ARIADNE / A4

Reviewed hosted runtime: `e542423bc07a9be77e7ad82f2b5ac6b65af087da`

Date completed: 2026-07-16

Status: Passed - missing PR527F2D direct-RLS evidence closed

```text
PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN
```

## Verdict

PR527F2E passes. One bounded hosted run proved owner, cross-owner, and
anonymous access against the deployed preference table with all five statuses,
returned-row cardinalities, and authoritative database readbacks atomically
written and fsynced before the next request. The ordered statuses were:

```text
owner SELECT=200
cross-owner SELECT=200
cross-owner PATCH=200
anonymous SELECT=401
anonymous PATCH=401
```

The owner read returned exactly its own false row. Both cross-owner requests
returned zero rows and changed nothing. Both anonymous requests were securely
denied, disclosed no row, and changed nothing. The final live state remained
exactly one disposable-owner row with Forum replies false.

Parent cleanup then deleted the exact disposable identity and exact rerun
replay session/refresh artifacts, restored retained Auth audit fields from the
durable pre-snapshot, and proved the accepted baseline exact. An independent
idempotent recovery from the same journal and a separate fresh read-only process
repeated the exact-restoration proof. No product defect, authorization leak,
retained drift, or residue remains.

PR527F2D remains the authority for the complete product, fanout, persistence,
refresh, hosted browser, theme, viewport, and human-eye lifecycle. PR527F2E
adds only the missing durable browser object and direct-RLS evidence.

## Pre-Write Harness Gate

Every local API, Auth, and database route was intercepted. Hosted configuration
was not loaded by the local gate, hosted reachability was zero, and no hosted
mutation occurred.

| Local failure proof | Result |
| --- | --- |
| Forced stop after owner read | Parent cleanup `1`; independent recoveries `2`; zero synthetic residue |
| Forced stop after cross-owner read | Parent cleanup `1`; independent recoveries `2`; zero synthetic residue |
| Forced stop after cross-owner write | Parent cleanup `1`; independent recoveries `2`; zero synthetic residue |
| Forced stop after anonymous read | Parent cleanup `1`; independent recoveries `2`; zero synthetic residue |
| Forced stop after anonymous write | Parent cleanup `1`; independent recoveries `2`; zero synthetic residue |
| Total forced-stop cases | `5` |
| Total parent cleanup runs | `5` |
| Total independent recovery runs | `10` |

Each synthetic RLS result was atomically replaced and fsynced before its next
step. Every forced child exit left exactly the expected prefix of the ordered
status journal, entered parent cleanup, and allowed two zero-residue independent
recoveries from that journal.

## Intercepted Browser Evidence

The real local Settings component ran through a localhost-only Next instance
with every owner/API route intercepted. Twenty state checkpoints were written
individually before continuation, followed by the consolidated browser object.
The browser journal made `22` fsynced writes including initialization and the
final object.

| Browser gate | Result |
| --- | --- |
| Loading | Visible, disabled control, checkpointed before releasing GET |
| Initial On | Authoritative checked state |
| Unavailable facts | Exact four facts and four `Unavailable` labels |
| Focus | Checkbox held DOM focus |
| Pointer false | Prior checked truth retained during `Saving...`; final false |
| Fresh Off | Reload returned unchecked `Paused` state |
| Space true | Prior false truth retained while saving; final true |
| Enter false / true | One PATCH each; prior truth retained while saving |
| PATCH bodies | Exactly `false, true, false, true` |
| Theme/viewport matrix | System, Light, Dark at `1440x900` and `390x844`; six cases |
| Geometry | No panel/row viewport escape or document overflow |
| Diagnostics | Zero external requests, failed responses, failed requests, page errors, or console errors |
| Hosted reachability/writes | `0` / `0` |

The final consolidated browser object was fsynced in the local owner-only
journal and copied into the hosted recovery journal before signup began. Six
temporary screenshots supported the matrix and were removed after fresh proof.

## Durable Hosted Baseline

Before signup, the owner-only OS-temp journal durably captured:

- healthy/ready Web and API deployment identity at the accepted `main` SHA;
- migration `084` SHA-256
  `BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263`;
- exactly one ledger row
  `20260716010501 / 084_community_notification_preferences`;
- exact preference catalog, RLS, policy, trigger, constraint, grant, and comment
  state;
- global aggregate counts, zero PR527F2E tag residue, and zero checked orphans;
- the retained replay Auth user, identity, ordinary Profile, community profile,
  every session and refresh row's non-token metadata, and restorable Auth audit
  timestamps;
- an empty artifact/status journal and the unique planned disposable identity;
  and
- the fsynced consolidated local browser object.

Initial global state was preferences `0`, Watches `0`, and notifications `0`.
The recovery file used owner-only ACLs plus same-directory temporary write,
flush/fsync, atomic replace, and committed-file fsync. Credentials, tokens,
private ids, timestamps, and row bodies were never printed, screenshotted, or
committed.

## Hosted Sequence

| Hosted action | Result |
| --- | --- |
| Ordinary disposable signup | `201`; one Visitor, non-admin owner |
| Disposable Auth artifacts | Exactly one session and one linked refresh row journaled |
| Station preference PATCH false | `200`; exactly one authoritative false row |
| Owner direct SELECT | `200`; returned rows `1`; authoritative rows `1`, false |
| Ordinary retained replay sign-in | `200`; one new session and one linked refresh row journaled |
| Cross-owner direct SELECT | `200`; returned rows `0`; authoritative row unchanged false |
| Cross-owner direct PATCH true | `200`; returned/updated rows `0`; authoritative row unchanged false |
| Anonymous direct SELECT | `401`; disclosed rows `0`; authoritative row unchanged false |
| Anonymous direct PATCH true | `401`; returned/updated rows `0`; authoritative row unchanged false |
| Final direct readback | Exactly one disposable row, false |

Each direct-RLS checkpoint included its status, returned/updated cardinality,
and service-side authoritative row count/value in the durable journal before
the next route. A network exception, missing request, in-memory-only status, or
ambiguous denial was not accepted.

Hosted write/request cardinalities were deliberately narrow:

```text
disposable signups=1
preference writes=1
retained replay sign-ins=1
direct RLS requests=5
comments=0
notifications=0
watches=0
community-profile writes=0
```

No comment, notification, Watch, report, review, external-delivery, schema,
configuration, deployment, tier, billing, or retained community mutation ran.

## Cleanup And Restoration

The lifecycle child completed successfully. Parent `finally` then used only the
durable journal:

| Parent cleanup | Result |
| --- | --- |
| Exact disposable Auth users targeted/deleted | `1` / `1`; dependent Profile, preference, session, refresh, and storage-usage rows cascaded |
| Exact replay sessions targeted/deleted | `1` / `1` |
| Exact replay refresh rows targeted/deleted | `1` / `1` |
| Replay Auth user audit fields | Restored from the exact pre-snapshot |
| Replay identity audit fields | Restored from the exact pre-snapshot |
| Run-linked Auth audit-log rows | `0` |
| Deployment/migration/ledger/catalog | Exact |
| Aggregate baseline | Exact |
| Retained owner rows | Exact |
| Pre-existing session/refresh non-token metadata | Exact |
| Exact disposable residue | `0` |
| PR527F2E tag residue | `0` across all 14 checked tables |
| Auth/storage/token/preference orphans | `0` |
| Preferences / Watches / notifications | `0 / 0 / 0` |

The first post-cleanup independent invocation exposed one temporary-harness
idempotency assertion: it required the already-deleted journaled replay session
to remain in the current delta, even though parent proof had already established
exact restoration. It made no hosted write. The assertion was narrowed to
validate journal membership only when a live delta exists. No product or
repository source changed and the hosted lifecycle was not rerun.

The repaired independent process consumed the same durable journal, targeted
zero already-absent artifacts, restored the same captured audit fields
idempotently, and passed every exact proof. A separate fresh process then
independently returned:

```text
deploymentExact=true
migrationExact=true
ledgerExact=true
catalogExact=true
aggregateExact=true
retainedOwnerExact=true
tagResidueZero=true
orphansZero=true
exactDisposableResidueZero=true
preferences=0
watches=0
notifications=0
```

Only after that fresh proof were the recovery journal, temporary credentials,
browser screenshots, and OS-temp directories removed.

## Scope And Validation

No product source, test, migration, package, lockfile, hosted schema,
configuration, Railway variable, or deployment changed. The untracked evidence
harness is not part of the commit.

| Check | Result |
| --- | --- |
| Local five-position failure table | Pass before hosted writes |
| Local intercepted browser evidence | Pass; final object durably recorded |
| Hosted owner/cross-owner/anonymous RLS sequence | Pass |
| Parent exact cleanup/restoration | Pass |
| Independent idempotent recovery | Pass from the same journal after harness assertion repair |
| Separate fresh restoration proof | Pass |
| `git diff --check` | Pass |
| Typecheck | Not required; committed change is documentation-only and touches no import or script |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR527F2E owner/cross-owner/anonymous direct-RLS proof with every status durably journaled and exact external cleanup/restoration.
Verdict:
- PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN
Task:
- Combine PR527F2D and PR527F2E evidence to close or repair PR527F, then keep the next ranked product lane moving.
```
