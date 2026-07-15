# PR527C2 - Forum Watch Fixture Auth Unblock Result

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
PROVE_PR527C2_SIGNUP_GUARD_AND_PR527C1_BOUNDARIES_COMPLETE
```

## Summary

DAEDALUS implemented the accepted signup password byte guard and completed the
hosted disposable proof that PR527C1 was missing.

- Station signup now rejects passwords over bcrypt's `72` byte UTF-8 input boundary before calling Supabase Auth admin create.
- Local auth tests prove `72` ASCII bytes reach the fake create boundary, while `73` ASCII bytes and multibyte-over-`72` byte inputs are rejected before create.
- Hosted API deployed exact implementation SHA `0a1d3df5`.
- Hosted oversized Station signup returned bounded validation `400` and zero tagged residue.
- Hosted valid Station signup created a disposable Visitor, then the original below-tier `403` and unreadable-thread `404` watch gates passed.
- Cleanup removed the disposable users and synthetic removed thread, with zero tagged residue and restored baselines.

## Local Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `49/49` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass before commit |

## Hosted Proof

The temporary harness printed only statuses, booleans, commit prefixes, and
counts. It did not print credentials, tokens, ids, emails, cookies, request
ids, connection strings, row bodies, or raw Auth logs. The harness and env
overrides were removed before commit.

Sanitized final run:

| Step | Result |
| --- | --- |
| API health | `200`, ready `true`, branch `main`, service `@station/api`, commit prefix `0a1d3df5`, exact SHA match `true` |
| Web health | `200`, ready `true`, branch `main`, service `@station/web`, commit prefix `0a1d3df5` |
| Schema | Watch table present `true`; notification table present `true` |
| Fixture prefix precheck | Tagged auth users/profiles/threads/watches/notifications/storage/token rows all `0` |
| Baseline counts | Watch `0`; notifications `0`; profiles `14`; threads `12`; comments `7`; storage usage `14`; token usage `19` |
| Replay-owner sign-in | `200` |
| Replay-owner watch GET | `200`, boolean readback `true` |
| Oversized Station signup | `400`; bounded password validation `true`; tagged residue still all `0` |
| Valid Station signup | `201` |
| Visitor session/profile truth | `/auth/me` `200`; session tier `visitor`; session admin `false`; profile tier `visitor`; profile admin `false` |
| Below-tier watch PUT | `403`; watch/notification counts unchanged |
| Below-tier watch DELETE | `403`; watch/notification counts unchanged |
| Removed-thread watch GET | `404`; bounded `Thread not found` |
| Removed-thread watch PUT | `404`; bounded `Thread not found` |
| Removed-thread watch DELETE | `404`; bounded `Thread not found` |
| Removed-thread exposure | Forum list `false`; Discover search `false`; Discover feed `false` |

## ARGUS Evidence Correction

Post-review Supabase Auth management logs show two sequential tagged
disposable-user create/delete cycles in the proof window, not one total cycle.
Both creates and both deletes returned `200`, and the first delete completed
before the second create. The retained evidence does not establish why the
second cycle ran. ARGUS therefore does not certify a one-cycle-total or
no-retry claim.

Independent read-only cleanup review recovered both temporary ids in memory
and found zero residue for either id across inspected Auth and public
profile-referencing relations. Global baselines below remained exact. This is
an evidence-count correction; it does not change the final boundary statuses
or cleanup result.

Cleanup/final residue:

| Check | Result |
| --- | --- |
| Tagged auth users | `0` |
| Tagged profiles | `0` |
| Tagged threads | `0` |
| Tagged watches | `0` |
| Tagged notifications | `0` |
| Tagged storage usage | `0` |
| Tagged token usage | `0` |
| Selected real thread still present | `true` |
| Watch baseline restored | `true` |
| Notification baseline restored | `true` |
| Thread baseline restored after fixture removal | `true` |
| Profile baseline restored after disposable deletion | `true` |
| Storage usage baseline restored | `true` |
| Token usage baseline restored | `true` |
| Comment baseline restored | `true` |

## Scope

Changed product files:

- `apps/api/src/schemas/auth.schema.ts`
- `apps/api/src/routes/auth.test.ts`

No web file, auth service, middleware, database migration, schema, trigger,
RLS policy, package, lockfile, seed, permanent fixture, Supabase setting, or
designated account changed. PR527D remains separate.

## Review Handoff

ARGUS should hostile-review the UTF-8 byte boundary, create-call suppression,
local tests, deployed exact-SHA proof, oversized signup `400`, valid disposable
signup `201`, below-tier `403`, unreadable-thread `404`, cleanup, and scope.

If accepted, ARGUS should wake MIMIR with the PR527C close verdict. If fixes are
needed, ARGUS should wake DAEDALUS with `WAKEUP A2:`.
