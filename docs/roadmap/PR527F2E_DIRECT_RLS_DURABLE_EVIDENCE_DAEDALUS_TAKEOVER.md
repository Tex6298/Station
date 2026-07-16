# PR527F2E - Direct RLS Durable Evidence Takeover

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - hosted-only takeover

## Authority And Transfer

Use the complete contract in:

- `docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN_ARIADNE.md`
- `docs/roadmap/PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_RERUN_ARIADNE_RESULT.md`
- `docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS_RESULT.md`

ARIADNE completed and durably recorded the zero-hosted-write local failure and
intercepted-browser gate in `.tmp/pr527f2e-local-gate.json`, then stopped before
the hosted phase. No PR527F2E hosted runner is active and two A4 wakeups were
not consumed. Ownership of the remaining bounded proof is therefore
transferred to DAEDALUS. Do not rerun or weaken the passed local gate.

## Authorized Work

Inspect the existing temporary runner and local-gate artifact, then execute
only the original task's hosted RLS sequence:

1. Prove the accepted baseline and zero PR527F2E residue.
2. Create one tagged disposable Visitor and one false preference row.
3. Durably fsync, in order, owner SELECT `200`/one row; replay-owner SELECT
   `200`/zero rows; replay-owner cross-owner PATCH `200` or `204`/zero rows;
   anonymous SELECT `401` or `403`; and anonymous PATCH `401` or `403`.
4. Prove the disposable preference remains false after every hostile request.
5. Run exact parent cleanup, independent idempotent recovery, and two fresh
   read-only restoration proofs against the accepted baseline.
6. Delete all temporary credentials, journals, screenshots, and harness state.

The complete durability, token-handling, cleanup, and restoration requirements
in the original PR527F2E task remain mandatory. Do not print or commit secrets,
tokens, ids, rows, credentials, or timestamps. Do not patch product source,
rerun comments or notifications, or touch retained community rows.

## Result And Handoff

Create:

`docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_DAEDALUS_TAKEOVER_RESULT.md`

Record the accepted local-gate digest, five ordered durable hosted statuses and
cardinalities, exact cleanup, independent recovery, two fresh restoration
proofs, and temporary-state deletion. The pass verdict remains:

```text
PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN
```

Change only the result, operational status/index/baseline docs if required,
and `.station-agents/state/DAEDALUS.json`. Do not stage `.tmp/` or another
agent's state file.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the transferred PR527F2E hosted direct-RLS proof using ARIADNE's passed local gate and exact external cleanup/restoration.
Verdict:
- PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN (or exact blocker)
Task:
- Combine PR527F2D and PR527F2E evidence and keep the next product lane moving.
```
