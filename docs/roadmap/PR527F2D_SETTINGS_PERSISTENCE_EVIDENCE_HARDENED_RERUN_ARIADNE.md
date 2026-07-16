# PR527F2D - Settings Persistence Evidence-Hardened Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - complete hosted lifecycle rerun

## Entry Gate And Authority

Use all of:

- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md`
- `docs/roadmap/PR527F_SETTINGS_PERSISTENCE_TRUTH_ARGUS_RESULT.md`
- `docs/roadmap/PR527F1_SETTINGS_PERSISTENCE_HOSTED_SCHEMA_DEPLOYMENT_DAEDALUS_RESULT.md`
- `docs/roadmap/PR527F2_SETTINGS_PERSISTENCE_HOSTED_LIFECYCLE_ARIADNE_RESULT.md`
- `docs/roadmap/PR527F2B_RETAINED_REPLAY_SESSION_CLEANUP_DAEDALUS_RESULT.md`
- `docs/roadmap/PR527F2C_RETAINED_BASELINE_READ_ONLY_DISPOSITION_ARGUS_RESULT.md`

Required entry verdict:

```text
ACCEPT_PR527F2C_RETAINED_BASELINE_WITH_TRUTHFUL_IRREVERSIBLE_AUDIT_TIMESTAMPS
```

Current hosted state, including its Auth `last_sign_in_at` and community
profile `updated_at`, is the accepted honest baseline. The failed rehearsal is
not accepted and none of its partial product evidence may be reused.

This lane permits one complete disposable lifecycle and exact cleanup. It does
not permit a product patch, schema/config change, retained-account capability
change, or broad cleanup.

## Harness Gate Before Hosted Writes

Build the temporary harness outside the repo or under untracked `.tmp`, then
prove all of this with every API/Auth/database route intercepted locally:

1. The Playwright loading release callback is awaited before `unroute` and can
   run twice without `Route is already handled`, unhandled rejection, or
   process termination.
2. A parent watchdog owns cleanup independently of the browser/lifecycle child.
   Child success, assertion failure, unhandled rejection, forced nonzero exit,
   and interrupted browser all enter parent cleanup.
3. An independent recovery command can consume the same journal after a
   simulated parent interruption and idempotently reach zero synthetic residue.
4. Journal writes use atomic replace plus flush/fsync before the next hosted
   action. No hosted mutation is allowed until this local failure matrix passes.

Do not accept a source assertion in place of executing these failure modes.

## Durable Recovery State

Before the first hosted mutation, create one owner-readable OS-temp recovery
directory outside Git. Persist and fsync:

- unique public-safe PR527F2D tag and disposable signup identity;
- complete aggregate/tag/orphan baseline;
- exact retained replay Auth user, identity, ordinary Profile, community
  profile, all replay sessions/refresh metadata except token values, and every
  mutable timestamp/semantic field that the run can touch;
- exact migration/deployment/catalog baseline;
- fixture category identity; and
- an initially empty created-artifact/write journal.

Append/fsync exact returned ids and status after every successful signup,
sign-in, direct fixture insert, API write, preference write, notification, and
session/refresh creation before taking the next action. Store credentials,
tokens, and private ids only when recovery requires them, with owner-only file
permissions. Never print, screenshot, commit, or expose the recovery state.

The parent `finally` and independent recovery entry point must both be able to
clean from this file without browser memory. Delete it only after a separate
fresh zero-residue and exact-restoration proof.

## Complete Hosted Lifecycle

Rerun every gate from the original PR527F2 contract:

1. Re-prove healthy/ready accepted deployment, exact migration hash/ledger/
   catalog, zero preferences/Watches/notifications, zero tag/orphan residue,
   and the PR527F2C retained baseline before writes.
2. Prove signed-out GET/PATCH `401` with no preference row.
3. Create one tagged disposable Visitor through ordinary Station signup. Keep
   it Visitor; do not alter tier, billing, or retained Profile state.
4. With the disposable session, prove malformed PATCH `400`, missing
   preference row, and authoritative GET enabled.
5. Directly insert one exact tagged readable fixture thread under an existing
   safe public category because Visitor thread creation is not entitled. Make
   no Visitor thread-creation claim.
6. Have the retained replay owner sign in normally and create one safe tagged
   comment through the deployed API. Journal the exact created replay session
   and linked refresh rows. Require `201`, exactly one disposable-recipient
   `thread_comment`, owner-safe notification readback, and unchanged Watches,
   report-status, and review-request-status counts.
7. Through the live Settings UI, pointer-toggle Forum replies false. Require
   the old authoritative checked state while saving, exactly one strict PATCH,
   reconciliation, authoritative false GET, exactly one owner preference row,
   and Off after fresh load/refresh.
8. Repeat PATCH false once through the API. Require false and exactly one row.
9. Have replay owner create a second safe tagged comment. Require comment
   `201`, zero notification for that event, first notification unchanged,
   Watches unchanged, and moderation notification counts unchanged.
10. Use focused Space to toggle false to true through Settings. Require exactly
    one PATCH/reconciliation, authoritative true/On after refresh, and no
    suppressed historical notification backfill.
11. Use focused Enter to toggle true to false and Enter again to true. Each
    activation must send exactly one PATCH/reconciliation, preserve prior
    truth while saving, and finish at authoritative true with one row.
12. Prove direct RLS: disposable token reads only its preference row; replay
    owner cannot read/update it; anon reads zero and cannot write. Retain only
    aggregate/status evidence.
13. Human-eye rehearsal covers loading, saving, Off, On, unavailable facts,
    focus, pointer/Space/Enter, System/Light/Dark, `1440x900`, `390x844`,
    geometry, overflow, failed responses, page errors, console errors, and
    exact API/database agreement. Theme/viewport variation may not create
    extra product writes.

## Mandatory External Cleanup

Parent cleanup runs regardless of child/browser outcome:

1. Delete only journaled/tagged notification, comment, and fixture-thread rows
   in dependency-safe order.
2. Delete the exact disposable Auth user so Profile/preference rows cascade.
3. Remove only replay-owner session/refresh rows created by this rerun. Prove
   every pre-existing out-of-scope session/refresh row is byte-for-byte
   unchanged without selecting token values.
4. Restore the exact captured replay community semantic fields and
   `updated_at` without advancing its trigger timestamp.
5. Restore exact captured replay Auth audit fields touched by ordinary rerun
   sign-in, including `last_sign_in_at`, only from the durable pre-snapshot.
   Never guess or use an earlier historical value.
6. Require Auth user/identity/Profile and all other retained rows equal the
   durable pre-snapshot; account explicitly for any Auth audit row.
7. Prove exact restored aggregate baselines, zero tagged Auth/profile/
   preference/thread/comment/notification/Watch/storage/token residue, zero
   session/token orphans, unchanged moderation counts, and no external
   delivery attempt.
8. Run the same proof again in a fresh read-only process. Only then remove the
   recovery journal, temporary credentials, browser artifacts, and harness.

If restoration cannot be proved exactly, stop further writes, retain the
owner-protected recovery file, commit a sanitized blocker, and wake MIMIR.
Never issue a broad delete, global sign-out, guessed timestamp update, or
retained-account tier/profile/preference change.

## Result And Handoff

Create:

`docs/roadmap/PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_RERUN_ARIADNE_RESULT.md`

Record local harness failure-mode counts, every hosted lifecycle assertion,
browser matrix, exact request/write cardinalities, RLS, diagnostics, cleanup,
fresh restoration proof, and temporary-state removal. A pass verdict is:

```text
PASS_PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_HOSTED_RERUN
```

ARIADNE may change only that result, operational status/index/baseline docs,
and `.station-agents/state/ARIADNE.json`. Product edits are forbidden.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the full evidence-hardened PR527F2D preference/fanout/RLS/browser lifecycle and external cleanup from the accepted retained baseline.
Verdict:
- PASS_PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_HOSTED_RERUN (or exact blocker)
Task:
- Close or repair PR527F from the committed evidence and keep the next ranked product lane moving.
```
