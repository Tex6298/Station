# PR527F2G - Serialized Provenance-Bound Direct RLS Rerun DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Passed - ready for MIMIR closeout

```text
PASS_PR527F2G_SERIALIZED_PROVENANCE_BOUND_DIRECT_RLS_RERUN
```

## Receipt And Digest

Public-safe run receipt:

```text
PR527F2G-D466966F7730038D
```

Fresh local-gate SHA-256 digest:

```text
06F892526AD48DE60158AA1745B8A43954B68A9108D167B0F7F773C1FA9B4349
```

The receipt and digest were persisted in the owner-only OS-temp lock record
before hosted configuration was loaded. They contain no user id, row id,
credential, token, timestamp, hostname, or secret-derived value.

## Serialization Gate

Before hosted mutation, DAEDALUS proved:

| Check | Result |
| --- | --- |
| Competing PR527F2D/E/G runner processes | `0` |
| Repo `.tmp` PR527F2D/E/G artifacts | `0` |
| Retained OS-temp PR527F2D/E/G artifacts | `0` |
| Exclusive owner-only lock | acquired |
| A2 watcher before execution wakeup | idle |
| A4 watcher before execution wakeup | idle |

ARIADNE did not participate in this rerun and was not woken.

## Fresh Local Gate

DAEDALUS reran the zero-hosted-write local gate and bound its digest to the
hosted recovery journal:

| Local gate item | Result |
| --- | --- |
| Forced stop positions | `5` |
| Parent cleanup runs | `5` |
| Independent zero-residue recoveries | `10` |
| Browser checkpoints | `20` |
| Browser journal writes | `22` |
| Browser matrix cases | `6` |
| Browser PATCH bodies | `false`, `true`, `false`, `true` |
| Hosted reachability | `0` |
| Hosted writes | `0` |

The local evidence object itself remains uncommitted.

## Hosted Direct-RLS Proof

The hosted proof used one ordinary tagged disposable Visitor signup, one
authenticated Station preference PATCH to false, and one ordinary replay-owner
sign-in for cross-owner checks only.

| Setup item | Result |
| --- | --- |
| Disposable signup | `201` |
| Preference PATCH statuses | `200` |
| Replay-owner sign-in | `200` |
| Disposable sessions / refresh rows | `1` / `1` |
| Replay sessions / refresh rows | `1` / `1` |

Five ordered direct-RLS statuses and authoritative readbacks were journaled
before the next request:

| Ordered check | Status | Returned rows | Authoritative rows | Authoritative value |
| --- | --- | --- | --- | --- |
| owner read | `200` | `1` | `1` | `false` |
| cross-owner read | `200` | `0` | `1` | `false` |
| cross-owner write | `200` | `0` | `1` | `false` |
| anonymous read | `401` | `0` | `1` | `false` |
| anonymous write | `401` | `0` | `1` | `false` |

Final live state before cleanup was exactly one disposable preference row,
still false, with all five direct-RLS statuses durably bound to the receipt and
local-gate digest.

## Cleanup And Proof

Parent cleanup removed the exact artifacts created by this run:

| Cleanup item | Result |
| --- | --- |
| Disposable Auth user deleted | `1` |
| Replay sessions deleted | `1` |
| Replay refresh rows deleted | `1` |
| Auth audit restored | `true` |

Parent proof, independent recovery, fresh proof 1, and fresh proof 2 all
proved:

| Restoration proof | Result |
| --- | --- |
| Deployment | exact |
| Migration | exact |
| Ledger | exact |
| Catalog | exact |
| Aggregates | exact |
| Retained owner | exact |
| Out-of-scope session/refresh metadata | exact |
| Tag residue | `0` |
| Orphans | `0` |
| Exact disposable residue | `0` |
| Preferences / Watches / notifications | `0` / `0` / `0` |

No comments, notifications, Watches, hosted Settings UI, complete product
lifecycle, schema, deployment, configuration, billing, provider, moderation,
community, publication, external-delivery, or retained product write was
performed.

## Supersession

This result supersedes both ambiguous PR527F2E artifacts as the sole
direct-RLS closeout authority:

- `docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_DAEDALUS_TAKEOVER_RESULT.md`
- `docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN_ARIADNE_RESULT.md`

PR527F2D remains the authority for the complete product, fanout, persistence,
refresh, keyboard, theme, viewport, human-eye, and exact-cleanup lifecycle.
PR527F2G supplies only the missing provenance-bound direct-RLS proof.

## Temporary State

The hosted runner released the exclusive lock and deleted the temporary hosted
recovery state after the two fresh proofs. DAEDALUS removed the neutral
OS-temp runner and public-result file after recording this sanitized result.
No credentials, tokens, token-derived hashes, private ids, row bodies,
timestamps, screenshots, journals, or secret-derived artifacts are committed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the sole-owner PR527F2G provenance-bound direct-RLS rerun with one durable receipt/digest, exact cleanup, independent recovery, and two fresh restoration proofs.
Verdict:
- PASS_PR527F2G_SERIALIZED_PROVENANCE_BOUND_DIRECT_RLS_RERUN
Task:
- Close PR527F truthfully, then open the globally numbered Important Routes Partner Pass from sequencing commit 7c14c1b9.
```
