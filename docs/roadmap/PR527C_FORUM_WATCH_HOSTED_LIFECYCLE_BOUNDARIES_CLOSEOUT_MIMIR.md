# PR527C - Forum Watch Hosted Lifecycle And Boundaries Closeout

Owner: MIMIR / A1

Date closed: 2026-07-15

Status:

```text
CLOSE_PR527C_FORUM_WATCH_HOSTED_LIFECYCLE_AND_BOUNDARIES_ACCEPTED
```

## Closeout

PR527C is closed accepted. The hosted Forum Watch capability now has all of
the required product, boundary, restoration, and human-eye evidence:

- hosted migration `040` is applied once with the accepted schema, RLS,
  policies, triggers, ledger, and PostgREST visibility;
- the thread page fails closed while Watch state is loading, unavailable, or
  ambiguous and never replays a write from Retry;
- replay-owner Watch, refresh, duplicate Watch, Unwatch, repeated Unwatch, and
  exact `false/0` restoration pass;
- signed-out Watch GET returns `401` and the human UI exposes no live command;
- disposable Visitor Watch PUT and DELETE return `403` with no watch or
  notification mutation;
- replay-owner Watch GET, PUT, and DELETE against one removed synthetic thread
  return `404`, and that thread is absent from Forum lists and Discover;
- all accepted desktop, `390px`, and `375px` human states pass; and
- final hosted Auth, profile, storage, token, session, thread, watch, and
  notification cleanup is independently zero-residue.

PR527C2 also closes a real Station signup boundary. The API now rejects signup
passwords above bcrypt's `72` UTF-8 byte limit before Supabase Auth create,
while retaining the existing eight-character minimum. Auth tests pass `24/24`,
community tests pass `49/49`, and API typecheck passes.

## Evidence Correction

The final handoff initially described one disposable create/delete cycle.
ARGUS's independent management-log review found two sequential tagged cycles:
both creates and both deletes succeeded, and the first delete completed before
the second create. The retained evidence does not establish why the second
cycle ran, so this closeout does not invent a retry explanation.

Both temporary user ids are absent from the inspected Auth and public
profile-referencing relations. Auth users/profiles remain `14/14`,
threads/comments `12/7`, storage/token rows `14/19`, watches/notifications
`0/0`, orphan sessions/identities/storage/token rows are zero, and all tagged
fixture prefixes are zero. The correction is retained as evidence-process
truth and does not weaken the accepted product result.

## Accepted Sources

- `docs/roadmap/PR527C_FORUM_WATCH_HOSTED_READINESS_REPAIR_ARGUS_RESULT.md`
- `docs/roadmap/PR527C_FORUM_WATCH_HOSTED_REHEARSAL_ARIADNE_RESULT.md`
- `docs/roadmap/PR527C2_FORUM_WATCH_FIXTURE_AUTH_UNBLOCK_PREFLIGHT_ARGUS_RESULT.md`
- `docs/roadmap/PR527C2_FORUM_WATCH_FIXTURE_AUTH_UNBLOCK_DAEDALUS_RESULT.md`
- `docs/roadmap/PR527C2_FORUM_WATCH_FIXTURE_AUTH_UNBLOCK_ARGUS_RESULT.md`

## Claims Not Made

This closeout does not claim a reason for the second disposable cycle, a
password-policy change outside Station API signup, a direct Supabase Auth
binary repair, or any change to Forum posting, voting, reporting, witness,
moderation, notification, or thread-read semantics. It does not accept the
Dark thread presentation defect reserved for PR527D.

## Next Lane

Open PR527D, the next ranked PR527 correction: Forum Thread Semantic Theme
Repair. It is a web-only presentation lane and must retain all PR527C behavior.
