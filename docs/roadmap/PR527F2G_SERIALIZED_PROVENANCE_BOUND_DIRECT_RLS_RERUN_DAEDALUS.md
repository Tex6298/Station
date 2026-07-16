# PR527F2G - Serialized Provenance-Bound Direct RLS Rerun

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - sole-owner bounded repair

## Authority And Boundary

Use:

- `docs/roadmap/PR527F2F_COMBINED_EVIDENCE_AND_HOSTED_BASELINE_AUDIT_ARGUS_RESULT.md`
- `docs/roadmap/PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_RERUN_ARIADNE_RESULT.md`
- `docs/roadmap/PR527F2E_DIRECT_RLS_DURABLE_EVIDENCE_RERUN_ARIADNE.md`

ARGUS independently proved current hosted source, catalog, owner boundary, and
cleanup state clean. PR527F2D remains authority for the complete product,
fanout, persistence, refresh, keyboard, theme, viewport, human-eye, and exact
cleanup lifecycle. PR527F2G repairs only the missing durable provenance binding
for the local browser object and five direct-RLS requests.

DAEDALUS is the sole execution owner. ARIADNE is not participating in this
rerun. Do not rerun comments, notifications, Watches, the hosted Settings UI,
or any complete product lifecycle. Do not patch product source.

## Serialization Gate

Before creating local evidence or loading hosted mutation credentials:

1. Prove no PR527F2D/E/G runner process, recovery journal, credential file,
   screenshot directory, or `.tmp` evidence artifact is active or retained.
2. Acquire one exclusive owner-only OS-temp lock for the whole lane. Refuse to
   proceed if it already exists or cannot be locked.
3. Generate one public-safe non-secret run receipt and persist/fsync it in the
   lock record. The receipt must identify this run without encoding a user id,
   row id, credential, token, timestamp, hostname, or secret-derived value.
4. Record in the final result that A2 and A4 watchers were idle before the
   execution wakeup and that no competing runner was found. Do not wake A4.

Release the lock only after temporary-state deletion and the final committed
result object have both been prepared.

## Fresh Local Gate

Rerun the fully intercepted zero-hosted-write failure and browser gate from the
PR527F2E contract. Do not reuse the deleted or ambiguous prior artifact.

Canonicalize the non-secret evidence object, calculate its SHA-256 digest, and
persist/fsync both the digest and public-safe run receipt before hosted
configuration is loaded. The object must include:

- five forced-stop positions, parent cleanup after each, and two independent
  zero-residue recoveries per position;
- individually fsynced loading, saving, On, Off, unavailable-fact, focus,
  pointer, Space, Enter, theme, viewport, geometry, request, page-error, and
  console-error checkpoints;
- the final consolidated browser object; and
- explicit zero hosted reachability and zero hosted writes.

Publish only the receipt, digest, non-secret counts, and pass/fail facts in the
result. Do not commit the evidence object itself.

## Bound Hosted Proof

Before signup, persist/fsync one owner-only recovery journal containing the
public-safe receipt, local-gate digest, accepted clean baseline, empty artifact
journal, and planned disposable identity. Every subsequent status,
cardinality, exact created artifact, and authoritative readback must append and
fsync before the next action.

Execute only:

1. one ordinary tagged disposable Visitor signup;
2. one authenticated Station preference PATCH to false;
3. owner direct SELECT: require `200`, one own row, false;
4. one ordinary retained replay-owner sign-in, immediately journaling the exact
   new session and linked refresh rows without selecting token values;
5. replay-owner cross-owner SELECT: require `200`, zero returned rows, false
   authoritative value unchanged;
6. replay-owner cross-owner PATCH: accept `200` or `204`, require zero returned
   or updated rows, false authoritative value unchanged;
7. anonymous SELECT: require `401` or `403`, zero disclosed rows, false
   authoritative value unchanged; and
8. anonymous PATCH: require `401` or `403`, zero mutation, false authoritative
   value unchanged.

The durable journal must bind the same receipt and digest to all five ordered
direct-RLS statuses and the final live readback. Network exceptions, missing
requests, in-memory-only evidence, or ambiguous denials do not pass.

## Cleanup And Proof

Parent `finally` must delete the exact disposable Auth user and exact replay
session/refresh artifacts created by this run, restore retained Auth audit
fields from the durable pre-snapshot, and prove exact accepted baseline.

Then run:

- one independent idempotent recovery from the same bound journal;
- first fresh separate read-only restoration proof; and
- second fresh separate read-only restoration proof.

All three must prove exact deployment, migration, ledger, catalog, aggregates,
retained owner, out-of-scope session/refresh metadata, zero preferences,
Watches, notifications, tag residue, disposable residue, and checked orphans.
Only after those pass may the runner remove credentials, recovery journals,
screenshots, harnesses, OS-temp state, and the exclusive lock.

Never print or commit secrets, tokens, token-derived hashes, private ids, row
bodies, credentials, or timestamps. No schema, deployment, configuration,
billing, provider, moderation, community, publication, external-delivery, or
retained product write is authorized.

## Result And Handoff

Create exactly one result:

`docs/roadmap/PR527F2G_SERIALIZED_PROVENANCE_BOUND_DIRECT_RLS_RERUN_DAEDALUS_RESULT.md`

It must include the public-safe receipt, local-gate SHA-256 digest, sanitized
gate counts, five ordered statuses/cardinalities, exact cleanup, independent
recovery, two separate fresh proofs, lock release, and temporary-state deletion.
State explicitly that this result supersedes both ambiguous PR527F2E result
artifacts as the sole direct-RLS closeout authority.

A pass verdict is:

```text
PASS_PR527F2G_SERIALIZED_PROVENANCE_BOUND_DIRECT_RLS_RERUN
```

Change only the result, operational status/index/baseline docs if required, and
`.station-agents/state/DAEDALUS.json`. Do not stage `.tmp/` or another agent's
state file.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the sole-owner PR527F2G provenance-bound direct-RLS rerun with one durable receipt/digest, exact cleanup, independent recovery, and two fresh restoration proofs.
Verdict:
- PASS_PR527F2G_SERIALIZED_PROVENANCE_BOUND_DIRECT_RLS_RERUN (or exact blocker)
Task:
- Close PR527F truthfully, then open the globally numbered Important Routes Partner Pass from sequencing commit 7c14c1b9.
```
