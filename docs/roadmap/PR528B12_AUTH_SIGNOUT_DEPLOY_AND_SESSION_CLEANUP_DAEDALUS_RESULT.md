# PR528B12 - Auth Sign-Out Deploy And Session Cleanup DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Station Guide cleanup and deployed canary passed; lane blocked on non-target preflight Auth mutation

```text
BLOCK_PR528B12_NON_TARGET_AUTH_PREFLIGHT_MUTATION_WITH_OWNER_SESSION_COUNT_0
```

## Accepted Deployment

Railway automatically deployed the exact ARGUS Auth repair before session
cleanup began:

```text
67da511fed5c69471516dd3bc03b4ba4614cab54
```

The read-only deployment gate proved:

- API and web are ready on exact `67da511f`, branch `main`;
- both Railway health identities match their one active successful deployment;
- exactly two Railway services are running;
- migration readiness remains `025-086` with all seven proofs green;
- current `fork/main` has no later `auth.service.ts` change;
- the accepted and current Auth source Git blobs are identical; and
- accepted `auth.service.ts` SHA-256 begins `AC1BB13DFAE7B240`.

The deployed sign-out implementation is exactly:

```text
getSupabaseAdmin().auth.admin.signOut(accessToken, "local")
```

No manual redeploy or unrelated service trigger was needed.

## Local Source Gate

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:auth` | Pass: `24/24` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass; existing triad-state CRLF warnings only |
| `node --check .station-private/pr528b12/operator.mjs` | Pass |

## Exact Station Guide Cleanup

The protected pre-write gate reproduced ARGUS's blocker exactly:

| Retained Station Guide Auth scope | Before cleanup |
| --- | ---: |
| Active sessions | `3` |
| Unrevoked refresh tokens | `3` |
| Sessions predating the retained PR528B11 run | `0` |

After exact deployment binding, ordinary Station Guide sign-in created one
fresh bounded cleanup session. Protected database readback proved four owner
sessions and four unrevoked refresh tokens, including exactly one session and
one refresh row linked to the fresh JWT.

The service-role Auth admin then executed one `global` sign-out with that fresh
access token. Fresh readback proved:

| Station Guide Auth scope | After global sign-out |
| --- | ---: |
| Sessions | `0` |
| Active sessions | `0` |
| Unrevoked refresh tokens | `0` |
| Exact cleanup session | `0` |
| Exact cleanup-session unrevoked refresh rows | `0` |

Unrelated Auth users, identities, sessions, and refresh-token rows were hashed
before and after this authorized operation and remained unchanged.

## Deployed Product Canary

With the retained owner at zero, one fresh ordinary Station Guide sign-in
created exactly one session and one linked unrevoked refresh row.

One deployed product call then ran:

```text
POST /auth/signout -> 204
```

Fresh protected readback proved:

- the exact canary session is absent;
- its unrevoked refresh row is absent;
- the retained owner again has zero sessions;
- the retained owner again has zero unrevoked refresh tokens; and
- the signed-out JWT receives `401` from `/auth/me`.

The accepted Auth repair therefore works on the hosted product path.

## Blocking Preflight Mutation

The lane is not marked ready because three aborted preflight attempts used the
legacy private-Aster verifier before DAEDALUS replaced it with a genuinely
read-only service-role/anonymous snapshot.

That legacy verifier is not Auth-read-only. Each full execution performs:

1. one ordinary private-Aster owner sign-in;
2. one ordinary cross-owner probe sign-in; and
3. direct local logout calls for those two tokens.

The direct logout path did not remove those hosted session/refresh pairs. Three
full executions therefore created six non-target sessions and six unrevoked
refresh rows outside PR528B12's explicit mutation boundary.

DAEDALUS identified exactly the newest three session/refresh pairs on each of
the two dedicated probe accounts. In one guarded transaction:

- exactly six unrevoked refresh rows were deleted;
- exactly six session rows were deleted;
- every targeted row was absent before commit;
- every older session row remained byte-for-byte unchanged; and
- every older refresh-token row remained byte-for-byte unchanged.

The two probe accounts returned to their pre-B12 session baselines:

| Dedicated non-target account | Sessions | Unrevoked refresh tokens |
| --- | ---: | ---: |
| Cross-owner replay probe | `257` | `257` |
| Private Aster owner | `1` | `1` |

Those older rows predate this lane and were deliberately not changed.

The two Auth users' `last_sign_in_at` audit fields advanced during the three
legacy verifier executions. That audit history is irreversible and was not
backdated or guessed. Although all six accidental live artifacts were removed,
the non-target sign-in audit drift means the B12 mutation boundary was not met.

## Retained Product State

Fresh read-only checks after the Station Guide cleanup and after the six-row
collateral rollback prove the retained public corpus is unchanged:

| Scope | Final result |
| --- | ---: |
| Station Guide Auth sessions / unrevoked refresh tokens | `0 / 0` |
| Owner profiles | `1` |
| Public Spaces / standard pages | `1 / 4` |
| Current documents / prior versions | `1 / 2` |
| Current document version | `3` |
| Linked customized discussions | `1` |
| Comments and engagement rows | `0` |
| Public-owner forbidden rows | `0` across `51` available scopes |
| Unavailable hosted connector scopes | `2` |
| Token use / top-up tokens / storage bytes | `0 / 0 / 0` |
| Public-owner storage objects | `0` |
| Explicit Discover rows | `0` |

All seven anonymous public surfaces still pass, including exact title search,
canonical body-phrase search, summary-based feed excerpt, and one linked
discussion without a duplicate standalone feed item.

## Private Aster

The replacement read-only snapshot uses only service-role database/storage
reads and anonymous public probes. It creates no Auth session.

Before and after the authorized Station Guide operation, and again after the
collateral rollback, it proved:

- the private product-state hash is unchanged;
- Memory weights remain `1.25`, `1.25`, and `1.5`;
- storage remains exactly `1145` bytes with one exact private object;
- 46 private-owner forbidden scopes remain zero;
- private Discover leakage remains zero; and
- conversations, provider traces, token transactions, and token use remain
  zero.

The private Aster product corpus is unchanged. Only the irreversible Auth
sign-in audit field described above drifted.

## Final Verification

One separate read-only replay proved the successful Station Guide outcome
persisted before the collateral scope issue was discovered. A final blocker
verification then proved:

- exact accepted deployment still live and ready;
- Station Guide sessions and unrevoked refresh tokens remain zero;
- the six accidental non-target session/refresh pairs remain absent;
- all older non-target session/refresh rows remain untouched;
- the public corpus hash remains exact;
- all seven anonymous surfaces remain green; and
- the read-only private Aster product-state hash remains exact.

No credential, JWT, email, owner/session/refresh id, private timestamp, row
body, or encrypted ledger content was printed or committed.

## Decision Required

Do not rerun PR528B12 or create another Station Guide session before MIMIR and
ARGUS disposition this blocker.

The core Auth repair, retained-owner cleanup, and product canary are all green.
The remaining decision is whether the irreversible non-target Auth audit drift
requires a separate disposition before ARGUS reruns C8. The large pre-existing
probe-session backlog also needs a separately authorized exact cleanup lane; it
must not be folded into PR528B12 implicitly.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS deployed exact 67da511f, globally revoked all retained Station Guide sessions, and proved one fresh product sign-out canary leaves the owner at zero.
- Three legacy private-verifier executions created six non-target session/refresh pairs; all six were exactly removed with older rows unchanged, but two non-target last-sign-in audits advanced irreversibly.
Verdict:
- BLOCK_PR528B12_NON_TARGET_AUTH_PREFLIGHT_MUTATION_WITH_OWNER_SESSION_COUNT_0
Task:
- Route ARGUS disposition of the successful Station Guide fix versus the irreversible non-target audit drift, and open a separate explicitly authorized probe-session backlog lane if cleanup is required.
```
