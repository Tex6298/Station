# PR527C1 - Forum Watch Boundary Fixture Proof

Owner: MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527C1_FORUM_WATCH_BOUNDARY_FIXTURE_PROOF
```

## Why This Unblock Is Required

ARIADNE completed every safe PR527C hosted check at exact accepted SHA
`f50a15fe15c08f960f7980f692bf68a2a6557780`. The real replay-owner Watch,
refresh, duplicate Watch, Unwatch, repeated Unwatch, three-viewport human-eye
states, and exact restoration all passed.

The only remaining gates are unavailable fixtures:

- every configured safe account now resolves to Private tier, so no account
  can prove Watch PUT/DELETE deny below Private with `403`;
- no hosted thread is currently unreadable to the replay owner, so no real
  target can prove Watch GET/PUT/DELETE fail closed with `404`.

Source:

- `docs/roadmap/PR527C_FORUM_WATCH_HOSTED_REHEARSAL_ARIADNE_RESULT.md`

Marty does not need to supply credentials or create data. PR527C1 authorizes
the smallest disposable staging proof needed to remove both blockers.

## Retained Evidence

Do not repeat or invalidate the accepted human rehearsal unless deployed
product code or hosted behavior changes. Retain:

- exact review SHA and readiness before/after;
- migration `040` schema, ledger, RLS, policy, trigger, and PostgREST proof;
- signed-out `401` and owner `200/false` readback;
- real Watch lifecycle and exact `false/0` restoration;
- all `21/21` hosted human-eye state/viewport cases;
- zero page/console errors and unchanged unrelated domains.

PR527C1 adds only the missing `403` and `404` boundary proof plus a fresh
deployment, owner-watch baseline, and cleanup sanity check.

## Authorized Disposable Fixtures

DAEDALUS may create exactly:

1. one temporary Supabase Auth user with a corresponding profile explicitly
   verified as non-admin Visitor tier; and
2. one temporary thread under that disposable profile and an existing public
   category, with `status = removed`, synthetic non-private title/body, and no
   linked Space, persona, or document.

Use generated credentials in memory only. Do not write credentials, tokens,
cookies, ids, passwords, or connection values to the repo, shell transcript,
result, inbox, `.env`, or a persistent temp file.

Use recognizable non-secret prefixes such as `pr527c-boundary-` for the
temporary email/username and `[PR527C boundary fixture]` for the synthetic
thread so cleanup can be independently counted without recording an exact
identity. Abort before creation if any matching tagged fixture already exists.

No configured account may be downgraded or repurposed. No existing thread may
be hidden, removed, relabelled, or otherwise changed.

## Required Proof Sequence

### Preflight

1. Confirm web/API `ready:true`, branch `main`, exact service names, and exact
   deployed SHA `f50a15fe15c08f960f7980f692bf68a2a6557780`.
2. Confirm migration `040` and current owner watch GET remain healthy.
3. Record sanitized zero counts for the fixture prefixes and exact baseline
   watch/notification counts.
4. Select one existing public readable thread and one existing public category
   without recording their ids or content.

### Below-Tier `403`

1. Create the disposable auth user/profile and require authoritative profile
   readback of `tier = visitor`, `is_admin = false`.
2. Sign in through the deployed Station auth path and require restored session
   truth to agree that the user is Visitor.
3. Send Watch PUT and DELETE for the selected readable public thread.
4. Require exact `403` for both operations and prove no watch row was created,
   removed, or changed for any owner.

### Unreadable-Thread `404`

1. Create the single synthetic removed thread under the disposable profile.
2. With the normal replay-owner session, send Watch GET, PUT, and DELETE.
3. Require exact `404` for all three operations with bounded `Thread not found`
   behavior and prove no watch or notification row changed.
4. Do not expose the fixture thread through Forum lists, Discover, search,
   feeds, or committed evidence.

### Cleanup

Cleanup runs in `finally` even when an assertion fails:

1. delete only the synthetic thread by its in-memory id;
2. delete only the disposable auth user through the admin boundary;
3. verify the corresponding profile is absent and no cascade-dependent row
   remains;
4. verify auth users, profiles, threads, watches, and notifications matching
   the fixture prefixes/ids are zero;
5. verify the selected real thread, replay owner, total watch count,
   notification count, and unrelated product-domain counts equal baseline;
6. remove all temporary scripts, modules, captures, and credential material.

Cleanup failure is a blocker even if the `403` and `404` assertions pass.

## Tooling Boundary

Use a temporary Node harness under the OS temp directory or a temporary
tracked-worktree file that is deleted before commit. It may reuse established
Supabase admin/PostgREST and Station API patterns. It must:

- require an explicit mutation flag;
- generate all disposable identity material in memory;
- emit sanitized statuses, tiers, booleans, and counts only;
- wrap the whole fixture lifecycle in reliable `try/finally` cleanup;
- refuse broad deletes and target only generated in-memory ids/prefixes;
- avoid package/lockfile changes and remove temporary `pg` or browser tooling.

No permanent script is requested. This avoids adding another operational
helper for developers to trip over after the one-off blocker is gone.

## Repo Allow-List

The committed result may change only:

```text
docs/roadmap/PR527C1_FORUM_WATCH_BOUNDARY_FIXTURE_PROOF_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

No product code, route, test, migration, schema, package, lockfile, config,
seed, permanent fixture, or tracked script may remain changed. PR527D remains
separate.

## Required Result And Review Handoff

Create:

```text
docs/roadmap/PR527C1_FORUM_WATCH_BOUNDARY_FIXTURE_PROOF_DAEDALUS_RESULT.md
```

Return exactly one result:

```text
PROVE_PR527C1_403_404_BOUNDARIES_AND_CLEANUP_COMPLETE
BLOCK_PR527C1_<EXACT_FIXTURE_AUTH_BOUNDARY_CLEANUP_OR_EVIDENCE_BLOCKER>
```

Record exact status sequences and sanitized before/after counts, including
fixture-prefix zeroes after cleanup. Commit the result and wake ARGUS for
independent review. Do not wake MIMIR directly and do not go idle without a
committed response.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed the disposable PR527C1 boundary-fixture proof.
Result:
- <proof complete or exact blocker>
Cleanup:
- <all tagged fixture/auth/profile/thread/watch/notification residue is zero, or exact blocker>
Task:
- Hostile-review the 403/404 proof, cleanup, retained ARIADNE evidence, and current exact-SHA sanity.
- Wake MIMIR with a PR527C close/block verdict.
```
