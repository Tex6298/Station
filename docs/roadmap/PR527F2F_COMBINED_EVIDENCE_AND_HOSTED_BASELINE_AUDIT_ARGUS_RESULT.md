# PR527F2F - Combined Evidence And Hosted Baseline Audit ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Blocked - hosted state is clean, but execution provenance is not durable

```text
BLOCK_PR527F2F_UNRESOLVED_PR527F2E_RUN_PROVENANCE_AND_DURABLE_GATE_BINDING
```

## Verdict

PR527F cannot close from the current combined evidence. PR527F2D remains valid
authority for the complete hosted product, fanout, persistence, refresh,
keyboard, theme, viewport, human-eye, and exact-cleanup lifecycle. The two
PR527F2E result artifacts also agree on the exact missing direct-RLS sequence
and do not contradict PR527F2D's product observations.

The blocker is narrower: the PR527F2E hosted execution cannot be assigned an
honest durable provenance. DAEDALUS's explicitly transferred takeover result
was committed first. ARIADNE's result file was then created and committed as a
separate claimed hosted run. Available evidence cannot establish whether the
artifacts describe the same run, two serialized runs, two overlapping runs, or
one result reconstructed from shared process output.

That is not an ownership-label mismatch. It leaves the number and ownership of
hosted writes unexplained, and neither result contains the local-gate digest or
a non-secret run receipt that could bind its browser object, hosted journal,
five RLS statuses, and cleanup proof together. The temporary evidence has been
deleted, so ARGUS will not guess.

## Evidence Composition

### PR527F2D authority

PR527F2D remains sufficient for the full hosted behavior it actually completed:

- signed-out and malformed-request boundaries;
- missing-row enabled truth;
- first eligible comment and one safe in-product notification;
- authoritative false persistence and refresh;
- future-fanout suppression without historical deletion;
- re-enable without backfill;
- pointer, Space, and Enter persistence;
- System/Light/Dark desktop/mobile geometry and diagnostics; and
- parent cleanup, independent recovery, and fresh exact-restoration proof.

Its blocker was honest and bounded. Anonymous read returned the secure `401`,
anonymous write did not run, and the direct-RLS/browser aggregate evidence was
not durably checkpointed. PR527F2D itself is not promoted to a pass.

### PR527F2E scope

Both PR527F2E results report the same ordered direct-RLS facts:

```text
owner SELECT=200 / one own row
cross-owner SELECT=200 / zero rows
cross-owner PATCH=200 / zero rows
anonymous SELECT=401 / zero disclosed rows
anonymous PATCH=401 / zero mutation
```

Both report one authoritative disposable row remaining false, exact targeted
cleanup, no comments/notifications/Watches, and restoration to zero global
preference/Watch/notification rows. This evidence closes only PR527F2D's
missing browser-object and direct-RLS boundary; it does not replace or
contradict the full PR527F2D product lifecycle.

## Provenance Disposition

The disposition is:

```text
UNRESOLVED_OVERLAP_NOT_INDEPENDENT_CORROBORATION
```

The durable facts are:

- commit `c2382a8800f47c33a0c071a8c324a4b0ff808d18` transferred the hosted-only
  phase to DAEDALUS after recording ARIADNE's local gate as complete;
- commit `c4fc3fd316f59c8820762a62ceff4b2e3fc1c462` first committed DAEDALUS's
  takeover result;
- ARIADNE's result file appeared after that takeover result and was committed
  by `bcc848c5ad40a06976291ba36fc801b8586429ee`;
- the two files were created less than one minute apart and contain the same
  five statuses, setup cardinalities, and cleanup cardinalities;
- ARIADNE records an independent-recovery assertion repair that DAEDALUS does
  not mention;
- DAEDALUS's takeover contract required the accepted local-gate digest, but
  neither result records one;
- DAEDALUS's takeover result records one separate fresh proof, while its
  takeover contract required two fresh read-only restoration proofs; and
- no PR527F2D/PR527F2E repo or OS-temp evidence artifact remains from which a
  run identity, digest, or execution order can be recovered.

The first committed DAEDALUS result is the canonical candidate, but calling it
proven canonical would still require ignoring ARIADNE's separate hosted-run
claim. The ARIADNE result therefore cannot be counted as independent
corroboration, and it cannot be silently relabeled as a copy.

## Fresh Hosted Read-Only Audit

ARGUS independently proved that the current hosted state is safe and clean.
Every database pass used repeatable-read `READ ONLY` and rollback. Two separate
fresh snapshots agreed.

| Check | Result |
| --- | --- |
| Railway web/API | Both `200`, `ok:true`, `ready:true`, branch `main`, exact runtime `e542423bc07a9be77e7ad82f2b5ac6b65af087da` |
| Locked product paths | Drift from the accepted runtime `0` |
| Migration `084` | Exact SHA-256 `BB23AB2222AD5F159000F93931842497CE6830BC10C19E676516D13820671263` |
| Ledger/catalog | One exact ledger row; columns, PK/FK cascade, trigger, RLS, three owner policies, grants, and comments exact |
| Global product rows | Preferences `0`, Watches `0`, notifications `0` |
| Tagged residue | `0` across all `14` Auth/product/storage/token tables |
| Orphans | `0` across `9` Auth/Profile/preference/storage/token checks |
| Retained owner | One Auth user, identity, Profile, and community profile; keys and creation boundary exact |
| Retained semantics | Nonnegative fields, reputation, trust, helpful/report targets, mute, and moderation boundary exact |
| D/E Auth artifacts | Run-window sessions `0`; both run-window refresh rows revoked and linked to a session predating PR527F2D; active run-window pair `0` |
| Auth audit rows | Owner-linked run-window audit rows `0` |
| Moderation | Owner-linked D/E report/review/action touches `0`; aggregate shape stable |
| Second snapshot | Tags, owner checks, session/refresh metadata, moderation aggregates, and zero global rows stable |

The retained Auth account is live rather than frozen. After PR527F2F opened,
one refresh occurred on a session that predates PR527F2D; no new session was
created. The later Auth user `updated_at` movement coincides with that refresh
without changing `last_sign_in_at`, and it is outside the D/E execution window.
No token value, token-derived hash, private id, private row, or timestamp value
was selected for output or committed.

The hosted `moderation_review_requests` relation remains absent as pre-existing
catalog truth. PR527F did not add, modify, or claim to deploy that frozen
surface; report/review notification rows remain zero. This audit does not widen
PR527F into unrelated moderation-schema work.

## Local Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `54/54` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/notification-preferences.test.ts` | Pass, `5/5` |
| `npx --yes pnpm@10.32.1 --filter @station/db build` | Pass |
| API/web typecheck | Pass |
| Web lint | Pass, zero warnings/errors |

No product source, migration, schema, ledger, configuration, deployment,
preference, Watch, notification, Auth, session, refresh, Profile, community,
moderation, billing, provider, queue, Cloudflare, or external-delivery write was
performed. The temporary read-only audit script and isolated PostgreSQL package
were removed.

## Smallest Repair

MIMIR should route one serialized PR527F2E-only evidence rerun under one named
owner. Do not rerun PR527F2D's comments, notification, keyboard, theme,
viewport, or complete product lifecycle.

The rerun must:

1. establish that no competing PR527F2E runner is active before the local gate
   or hosted write;
2. rerun the intercepted zero-hosted-write failure/browser gate and publish a
   sanitized SHA-256 digest of its non-secret evidence object;
3. bind that digest, one public-safe run receipt, the hosted recovery journal,
   and the final committed result before signup;
4. execute only the five ordered direct-RLS requests and authoritative
   readbacks;
5. clean exact disposable and replay-session artifacts, preserving
   pre-existing session/refresh rows;
6. run independent recovery plus two fresh read-only restoration proofs; and
7. commit exactly one owner result, explicitly superseding both ambiguous
   PR527F2E artifacts for closeout authority.

Current hosted state requires no cleanup before that bounded rerun.

After the serialized repair and truthful PR527F closeout, MIMIR must follow
Marty's sequencing commit `7c14c1b9030c6f2910a368ef1679285e1776f7de` and
open the globally numbered Important Routes Partner Pass. Do not route another
forensic or ranked micro-fix between PR527F and that partner-review pass.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the read-only PR527F combined-evidence and hosted-baseline audit.
- Current hosted state, source, catalog, owner boundary, and cleanup state pass; PR527F2D remains valid full-lifecycle authority.
Verdict:
- BLOCK_PR527F2F_UNRESOLVED_PR527F2E_RUN_PROVENANCE_AND_DURABLE_GATE_BINDING
Task:
- Route one serialized single-owner PR527F2E-only proof with a durable local-gate digest and one bound run receipt; do not rerun the complete PR527F2D product lifecycle.
- After truthful PR527F closeout, open the Important Routes Partner Pass required by sequencing commit 7c14c1b9 rather than another forensic or micro-fix lane.
```
