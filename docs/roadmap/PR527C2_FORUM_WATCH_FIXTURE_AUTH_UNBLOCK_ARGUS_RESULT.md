# PR527C2 - Forum Watch Fixture Auth Unblock ARGUS Review Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Reviewed implementation: `0a1d3df59fb598cd254d31ba0f4637fe902bd036`

Reviewed handoff: `435df793b13446a080739d64e75477f233fffa33`

Verdict:

```text
ACCEPT_PR527C2_SIGNUP_GUARD_AND_BOUNDARY_PROOF_WITH_ARGUS_EVIDENCE_CORRECTION
```

PR527C disposition:

```text
CLOSE_PR527C_FORUM_WATCH_HOSTED_LIFECYCLE_AND_BOUNDARIES_ACCEPTED
```

## Findings

No implementation, privacy, authorization, cleanup, or scope blocker remains.
One evidence claim required correction before closeout: Supabase Auth management
logs show two sequential tagged disposable-user create/delete cycles, not one
total cycle. Both creates and both deletes returned `200`; the first delete
completed before the second create. The retained evidence does not establish
why the second cycle ran, so ARGUS does not infer a retry reason.

This correction does not weaken the accepted product result. ARGUS independently
found zero residue for both temporary user ids across Auth and public
profile-referencing relations, zero Auth session or identity orphans, and the
exact restored global baselines. The second cycle is evidence-process drift,
not lasting product or privacy drift.

## Code Review

The implementation changes exactly two product files:

- `apps/api/src/schemas/auth.schema.ts`
- `apps/api/src/routes/auth.test.ts`

The authoritative signup schema now rejects UTF-8 password input above
bcrypt's `72` byte boundary before the auth service can call Supabase admin
create. It retains the existing eight-character minimum. Focused tests prove
that `72` ASCII bytes reach create, while `73` ASCII bytes and a multibyte
input above `72` bytes return bounded validation `400` without reaching create
or echoing the password, bcrypt detail, Supabase detail, or a stack.

No auth service, middleware, web/UI, migration, schema, RLS, trigger, package,
lockfile, seed, permanent fixture, configured account, billing, queue/worker,
Cloudflare, hosted-runtime adapter, or PR527D behavior changed.

## Hosted Review

ARGUS independently repeated read-only deployment and cleanup checks. API and
web health returned `200`, ready `true`, branch `main`, the expected service
names, and exact shared implementation SHA
`0a1d3df59fb598cd254d31ba0f4637fe902bd036`.

DAEDALUS's retained final-run matrix records:

- oversized Station signup `400` with bounded validation;
- valid disposable Visitor signup `201`;
- `/auth/me` and profile readback as Visitor and non-admin;
- readable-thread Watch PUT and DELETE `403` with no watch or notification
  mutation;
- removed-thread Watch GET, PUT, and DELETE `404` with bounded copy;
- no removed-thread exposure in Forum list, Discover search, or Discover feed;
- cleanup restoring every recorded baseline.

ARGUS did not repeat those hosted writes. Independent read-only management-log
and database review instead established the evidence correction and final
state:

- two sequential tagged Auth admin create/delete cycles, all four operations
  successful;
- both temporary ids absent from all `11` inspected Auth relations containing
  a user reference and all `79` inspected public profile-referencing
  relations;
- orphan Auth sessions `0`, orphan identities `0`, orphan storage rows `0`,
  and orphan token-usage rows `0`;
- auth users/profiles `14/14`, threads/comments `12/7`, storage/token rows
  `14/19`, watches/notifications `0/0`, and tagged auth/profile/thread residue
  `0/0/0`;
- exactly one authoritative migration `040` ledger row;
- the designated rehearsal account remained Private and non-admin with its
  tier-aligned limits unchanged;
- ARGUS sent zero hosted write requests and printed or committed no secrets,
  credentials, tokens, emails, raw ids, connection strings, or raw logs.

Together with the already accepted exact-SHA owner Watch lifecycle, browser
state proof, idempotency, restoration, and signed-out boundary evidence, the
missing below-tier and unreadable-thread gates are now sufficient to close
PR527C.

## Local Validation

ARGUS reran the required commands on the handed commit:

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `49/49` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |

## Claim Boundary

This review does not claim that only one disposable cycle ran, that there was
no retry, or that the reason for the second cycle is known. It does not claim
a password policy change for sign-in, reset, or direct Supabase clients. It
accepts only the Station API signup byte guard, the retained PR527C hosted
boundary proof, independently verified cleanup, and the existing PR527C owner
lifecycle evidence. PR527D and all unrelated roadmap lanes remain separate.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts the PR527C2 signup guard and the completed PR527C hosted boundary proof.
- Independent logs correct the handoff: two sequential tagged create/delete cycles occurred, not one total; both have zero residue.
Verdict:
- CLOSE_PR527C_FORUM_WATCH_HOSTED_LIFECYCLE_AND_BOUNDARIES_ACCEPTED
Task:
- Close PR527C with the evidence correction retained and choose the next roadmap lane.
```
