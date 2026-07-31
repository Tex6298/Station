# PR539 Public Route Correction - DAEDALUS Result

Owner: DAEDALUS / A2 -> MIMIR / A1

Date completed: 2026-07-31

Status:

```text
READY_PR539_PUBLIC_ROUTE_CORRECTION_FOR_MIMIR
```

## Decision

Both MIMIR findings are corrected at executable source
`34c91e078faccc93b36316e03e382a3cfb74d14e`, now live on both Railway
services.

The publication router scopes authentication and private cache headers to
`/institutions/:institutionSlug/publications`. It no longer intercepts public
routes registered later in the application. The exact signed-out publication
route remains ahead of that bounded private gate.

Private publication serialization now derives `publicHref` from all three
public conditions: published work, verified/public Institution, and public
attached Project. The signed-out route remains fail-closed on the same Project
visibility condition.

## Regression And Hosted Proof

The focused route composition test mounts an unrelated public route after the
publication router and proves signed-out `200`, while anonymous private
publication read remains `401`. The Project visibility regression proves a
private Project removes `publicHref` and returns public publication `404`, then
restoration returns both the href and signed-out `200`.

Fresh hosted statuses on exact corrected source:

| Route or state | Status/result |
| --- | --- |
| `/institutions/public/station-institutional-alpha` | `200` |
| `/developer-spaces/public` | `200` |
| `/developer-spaces/station-replay-dev-alpha` | `200` |
| Retained public Institution publication | `200` |
| Anonymous private Institution publication | `401` |
| Attached Project temporarily private | private href `null`; public read `404` |
| Attached Project restored public | private href restored; public read `200` |

Fresh restarted verification still finds migration `094` ledgered exactly
once, one retained published work at version `7`, seven paired publication
audit events, three service RPCs, zero browser table/RPC authority, zero tagged
Auth users, zero tagged memberships, and anonymous/service table status
`401/200`. The retained Project was restored to public.

## Validation

| Command | Result |
| --- | --- |
| `test:institution-publications` | Pass, `4/4` including route composition and Project visibility |
| `test:institutions` | Pass, `16/16` |
| `test:projects` | Pass, `33/33` |
| `lint` / `typecheck` | Pass; zero warnings/errors |
| Corrected Railway source | API/web ready at `34c91e07` |
| Hosted public/private correction probe | Pass |
| Fresh hosted schema/retained verifier | Pass |

No schema, migration, authority, UI layout, retained publication content,
personal document, Discover, Developer Space, or unrelated route behavior was
changed.

## Baton

MIMIR should review only the correction from `caab6f06` through `34c91e07`,
the focused regressions, and the fresh hosted statuses above. If accepted,
wake ARIADNE for the bounded PR539 owner/member/public human rehearsal. If a
correction remains, wake DAEDALUS with the exact finding.
