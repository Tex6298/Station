# PR527F2E - Direct RLS Durable Evidence Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - smallest missing hosted gate

## Authority And Claim Boundary

Use:

- `docs/roadmap/PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_RERUN_ARIADNE_RESULT.md`
- `docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS_RESULT.md`
- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`

PR527F2D passed the complete hosted product, fanout, persistence, refresh,
keyboard, theme, viewport, external-cleanup, independent-recovery, and exact
restoration lifecycle. It remains blocked because anonymous SELECT correctly
returned `401`, the harness expected `200`, anonymous write never ran, and the
direct-RLS statuses were not fsynced one by one.

This lane repairs only that missing evidence. Do not rerun hosted comments,
notifications, preference toggle sequences, or the complete product lifecycle.
Do not patch product source. PR527F2D remains the authority for every
already-passed hosted gate. A zero-hosted-write intercepted browser pass is
required only to close the late consolidated-browser journal defect below.

## Harness Gate

Before any hosted mutation, execute an intercepted local table proving:

- owner read status/result is fsynced before cross-owner read;
- cross-owner read is fsynced before cross-owner write;
- cross-owner write is fsynced before anonymous read;
- anonymous read accepts secure denial `401` or `403` and is fsynced before
  anonymous write;
- anonymous write accepts secure denial `401` or `403` and is fsynced before
  final database readback; and
- forced failure after every one of those steps still reaches parent cleanup
  and independent idempotent recovery from the durable journal.

Also rerun the PR527F2D browser evidence against a fully intercepted local
owner/API boundary with zero hosted reachability. Fsync loading, saving, Off,
On, exact unavailable facts, focus, pointer/Space/Enter, System/Light/Dark,
desktop/mobile, geometry/overflow, request, page-error, and console-error
checkpoints individually before moving to the next state. Fsync the final
consolidated browser object before the hosted RLS sequence begins.

Use the already-proven parent-watchdog, atomic replace/fsync, owner-only OS-temp
journal, and independent recovery architecture. Source inspection is not a
substitute for executing the local failure table.

## Durable Baseline

Before the first hosted write, persist/fsync the exact PR527F2C current
baseline, including:

- deployment/migration/ledger/catalog and global zero rows;
- complete aggregate/tag/orphan state;
- retained replay Auth user/identity/Profile and every non-token session/
  refresh metadata row;
- retained replay Auth audit fields that ordinary sign-in can touch; and
- an exact empty artifact/status journal plus one unique PR527F2E tag.

Journal the disposable signup identity before signup. Append/fsync each exact
created id, Auth session/refresh artifact, preference write, request status,
returned-row cardinality, and database readback before the next action. Never
print or commit the journal, ids, credentials, tokens, rows, or timestamps.

## Exact Hosted Sequence

1. Re-prove the accepted baseline and zero PR527F2E residue.
2. Create one tagged disposable Visitor through ordinary Station signup.
   Journal it immediately; do not alter tier, billing, or retained state.
3. Through authenticated Station API PATCH, set Forum replies false to create
   exactly one owner preference row. Require authoritative false and one row.
4. Direct PostgREST owner SELECT with the disposable token: require `200` and
   exactly its own row. Fsync status/cardinality before continuing.
5. Sign in the retained replay owner normally. Immediately resolve and fsync
   the exact newly created replay session and linked refresh rows without
   selecting token values.
6. Direct replay-owner SELECT of the disposable row: require `200` with zero
   rows. Fsync before continuing.
7. Direct replay-owner cross-owner PATCH: accept the secure no-row PostgREST
   status produced by the deployed contract (`200` or `204`), require zero
   returned/updated rows, and prove the disposable value remains false. Fsync
   status/cardinality/readback before continuing.
8. Direct anonymous SELECT using only the configured anonymous API boundary:
   require denial `401` or `403`, no disclosed row, and unchanged preference.
   Fsync before continuing.
9. Direct anonymous PATCH of the disposable row: require denial `401` or
   `403`, zero mutation, and unchanged false value. Fsync before final proof.
10. Require the durable journal contains all five direct-RLS statuses in order
    plus each returned-row and authoritative database cardinality. Final live
    state must still be exactly one disposable false row.

Do not treat a secure `401`/`403` as a harness error. Do not accept a network
exception, missing request, unjournaled in-memory status, or ambiguous write as
denial evidence.

## Exact Cleanup And Restoration

Parent `finally` and independent recovery must:

1. Delete the exact disposable Auth user so its Profile, preference, session,
   and refresh rows cascade; prove all exact/tagged residue zero.
2. Remove only replay-owner session/refresh artifacts created by this rerun,
   preserving every pre-existing out-of-scope row byte-for-byte without
   selecting token values.
3. Restore exact captured replay Auth audit fields touched by sign-in from the
   durable pre-snapshot; do not guess or use pre-PR527F2 historical values.
4. Prove deployment/migration/catalog, Auth/identity/Profile/community rows,
   global preferences/Watches/notifications, aggregates, moderation counts,
   tags, and Auth/storage/token orphans exactly equal the accepted baseline.
5. Repeat the restoration proof in a separate fresh read-only process, then
   remove recovery state, credentials, screenshots, and temporary harnesses.

No retained community row should be touched in this RLS-only lane. No broad
delete, global sign-out, comment, notification, Watch, report, review, external
delivery, schema, configuration, or deployment write is authorized.

## Result And Handoff

Create:

`docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN_ARIADNE_RESULT.md`

Record the local failure table, durable intercepted browser checkpoints/final
object, five ordered durable RLS statuses, row/mutation cardinalities, exact
cleanup, independent recovery, fresh restoration proof, and temporary-state
deletion. A pass verdict is:

```text
PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN
```

ARIADNE may change only that result, operational status/index/baseline docs,
and `.station-agents/state/ARIADNE.json`.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR527F2E owner/cross-owner/anonymous direct-RLS proof with every status durably journaled and exact external cleanup/restoration.
Verdict:
- PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN (or exact blocker)
Task:
- Combine PR527F2D and PR527F2E evidence to close or repair PR527F, then keep the next ranked product lane moving.
```
