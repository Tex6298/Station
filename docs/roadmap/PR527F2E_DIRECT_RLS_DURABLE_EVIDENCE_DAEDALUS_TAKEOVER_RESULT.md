# PR527F2E - Direct RLS Durable Evidence DAEDALUS Takeover Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Passed - ready for MIMIR closeout routing

```text
PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN
```

## Authority

Executed the hosted-only takeover from:

- `docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_DAEDALUS_TAKEOVER.md`
- `docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN_ARIADNE.md`
- `docs/roadmap/PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_RERUN_ARIADNE_RESULT.md`
- `docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS_RESULT.md`

ARIADNE's intercepted local gate was reused as passed evidence. DAEDALUS did
not rerun the hosted product lifecycle, comments, notifications, keyboard,
theme, or viewport journey.

## Local Gate Reused

The existing `.tmp/pr527f2e-local-gate.json` record was validated before hosted
execution:

| Check | Result |
| --- | --- |
| Forced failure cases | `5` |
| Parent cleanup runs | `5` |
| Independent recovery runs | `10` |
| Browser checkpoints | `20` |
| Browser journal writes | `22` |
| Browser matrix cases | `6` |
| Browser PATCH bodies | `false`, `true`, `false`, `true` |
| Hosted reachability | `0` |

## Hosted Direct-RLS Proof

Read-only preflight proved the accepted runtime and zero residue before the
bounded hosted write:

| Check | Result |
| --- | --- |
| Hosted web/API/Supabase origins | resolved to hosted services |
| Runtime SHA | exact accepted `e542423bc07a9be77e7ad82f2b5ac6b65af087da` |
| Migration `084` hash | exact |
| Ledger rows | `1` |
| Global preferences | `0` |
| Watches | `0` |
| Notifications | `0` |
| Tag residue | `0` |
| Orphans | `0` |

The hosted sequence then created one tagged disposable Visitor and one owner
preference row set to false. One temporary replay-owner sign-in was used only
for cross-owner RLS checks. Statuses and cardinalities were durably journaled
in order before the next request.

| Ordered check | Status | Returned rows | Authoritative rows | Authoritative value |
| --- | --- | --- | --- | --- |
| owner read | `200` | `1` | `1` | `false` |
| replay-owner cross-owner read | `200` | `0` | `1` | `false` |
| replay-owner cross-owner write | `200` | `0` | `1` | `false` |
| anonymous read | `401` | `0` | `1` | `false` |
| anonymous write | `401` | `0` | `1` | `false` |

The final live state before cleanup was exactly one disposable preference row,
still false, with all five direct-RLS statuses present in the durable journal.
The hosted journal write count was `13`.

## Cleanup And Restoration

Parent cleanup, independent recovery, and a separate fresh proof all passed.

| Cleanup / proof | Result |
| --- | --- |
| Disposable Auth users targeted/deleted | `1` / `1` |
| Disposable sessions journaled | `1` |
| Disposable refresh rows journaled | `1` |
| Replay sessions targeted/deleted | `1` / `1` |
| Replay refresh rows targeted/deleted | `1` / `1` |
| Auth audit restored | `true` |
| Auth audit rows targeted/deleted | `0` / `0` |
| Parent restoration proof | exact deployment, migration, ledger, catalog, aggregates, retained owner, tag residue, orphans, and disposable residue |
| Independent recovery | passed with the same proof shape |
| Fresh proof | passed with the same proof shape |
| Final preferences / Watches / notifications | `0` / `0` / `0` |

No retained community row, product source, migration, schema, deployment,
Railway variable, comment, notification, Watch, report, review, external
delivery, or full product lifecycle path was touched.

## Temporary State

The hosted runner reported temporary local and hosted recovery state deleted
after restoration proof. DAEDALUS then removed the remaining untracked `.tmp`
PR527F2E runner/result/local-gate files from the worktree after recording this
sanitized result. No credentials, tokens, ids, row bodies, timestamps,
screenshots, journals, or secret-derived artifacts are committed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the transferred PR527F2E hosted direct-RLS proof using ARIADNE's passed local gate and exact external cleanup/restoration.
Verdict:
- PASS_PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN
Task:
- Combine PR527F2D and PR527F2E evidence and keep the next product lane moving.
```
