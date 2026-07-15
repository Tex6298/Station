# PR527E2 - Persona Profile Hosted Blocker Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - rerun only the two failed PR527E hosted gates

## Purpose

ARGUS accepts both bounded repairs:

```text
ACCEPT_PR527E1_PERSONA_PROFILE_PLACEHOLDER_CONTRAST_REPAIR
ACCEPT_PR484J_N1_ARCHIVE_CREDENTIAL_READ_HOSTED_SCHEMA_UNBLOCK_WITH_EVIDENCE_CORRECTION
```

ARIADNE already passed PR527E's signed-out protection, owner truth, three live
capability presentations, independent readbacks, all six keyboard
destinations, focus, hover, disabled state, wrapping, responsive geometry, and
zero-product-write boundary. Do not replay those accepted gates.

Rerun only:

1. the two empty Persona Profile placeholders across the locked nine-case
   appearance/viewport matrix; and
2. the correct persona Archive route's credential metadata read.

## Deployment Gate

Accepted implementation/review SHA:

```text
c8bceb1df006da3a29d248d0fe7a742e7227c627
```

Confirm Railway web and API are `200`, ready, on `main`, and report the same
full SHA containing that accepted code. A later docs/agent-receipt-only
descendant is acceptable only with zero runtime-path drift. Wait through a
rolling deployment and stop on service mismatch or runtime drift.

Hosted Supabase must retain exactly one ledger row for each accepted migration
name `062_archive_connector_credentials` and
`063_archive_connector_scope_metadata`, with credential and OAuth row counts
still zero. This is read-only confirmation, not another migration lane.

## Placeholder Rerun

Use the existing replay owner and existing Station replay persona. Open the
owner Profile through visible Studio navigation. Leave Avatar URL and Context
handoff empty; do not type into, toggle, or submit either field.

Measure both rendered placeholders in every case:

| Appearance | Desktop | Mobile A | Mobile B |
| --- | --- | --- | --- |
| System | `1440x900` | `390x844` | `375x812` |
| Light | `1440x900` | `390x844` | `375x812` |
| Dark | `1440x900` | `390x844` | `375x812` |

All `18` samples must have computed opacity `1` and meet the `4.5:1`
normal-text contrast floor. At all nine cases confirm the fields retain stable
height, visible keyboard focus, unclipped text, and zero horizontal overflow.
Do not trigger pending/saved/error states or repeat the wider Profile matrix.

## Archive Read Rerun

From Profile, use the visible `Open Archive` command and reach the correct
persona route `/studio/personas/:id/files`; do not substitute the global
`/studio/archive` route.

At System desktop confirm:

- exactly one `GET /archive-connectors/credentials` is sent and returns `200`;
- the safe Reddit and Discord disconnected/missing metadata shape renders;
- the owner panel remains truthfully setup/config disabled;
- no secret, owner id, raw storage error, or implementation detail appears;
- there is no failed product response, page error, unclassified console error,
  unknown API call, or classified credentials-read failure; and
- returning to Profile works through visible navigation.

The API read and UI state are the gate. Do not configure Reddit, connect,
revoke, look up an account, start OAuth, inspect source inventory, create an
intent, stage/import material, or apply another migration.

## Strict No-Write Boundary

Require zero non-GET hosted product requests. In particular, send no avatar or
anonymous-chat `PATCH`, handoff `POST`, Integrity start, architecture `PATCH`,
persona `DELETE`, connector/OAuth/revoke request, direct database write, RPC
mutation, migration, seed, cleanup, auth mutation, tier, billing, or config
change.

Do not edit source, tests, package metadata, configuration, migration files,
or hosted data. Remove transient browser/session/capture artifacts and never
commit private ids, credentials, cookies, tokens, headers, raw bodies, or
private screenshots.

## Result

Create:

`docs/roadmap/PR527E2_PERSONA_PROFILE_HOSTED_BLOCKER_RERUN_RESULT.md`

Record exact pass/fail for deployment identity, migration ledger/zero-row
retention, all 18 placeholder measurements, opacity, focus/geometry/overflow,
the correct persona Archive route, the one safe `200` credentials read,
diagnostics, zero-write scope, and artifact cleanup.

Allowed committed paths:

```text
docs/roadmap/PR527E2_PERSONA_PROFILE_HOSTED_BLOCKER_RERUN_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARIADNE.json
```

Commit and push the result, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE reran only PR527E's repaired placeholder and Archive credentials-read hosted gates.
Verdict:
- PASS_PR527E2_PERSONA_PROFILE_HOSTED_BLOCKER_RERUN or BLOCK with the exact remaining failed gate.
Task:
- Close PR527E on a complete pass and open the next ranked PR527 correction, Settings persistence truth; otherwise route only the smallest evidenced defect.
```
