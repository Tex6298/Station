# PR527C Forum Watch - Hosted Rehearsal Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted review SHA: `f50a15fe15c08f960f7980f692bf68a2a6557780`

State:

```text
BLOCK_PR527C_BELOW_TIER_AND_UNREADABLE_THREAD_FIXTURES_UNAVAILABLE
```

## Verdict

PR527C remains blocked on two mandated boundary fixtures:

- every locally configured safe account credential that authenticated now
  resolves to Private tier; there is no below-Private account with which to
  prove watch `PUT` and `DELETE` return `403`;
- the hosted fixture set contains no existing thread that is unreadable to the
  replay owner under the accepted hidden, removed, private-visibility, or
  unreadable-subcommunity boundaries; there is no real fixture with which to
  prove watch `GET`, `PUT`, and `DELETE` all return `404`.

ARIADNE did not downgrade an account, create a user or thread, hide content, or
invent an identifier to turn either missing fixture into a pass.

Every remaining safe check was completed. The real replay-owner Watch
lifecycle, exact restoration, schema proof, signed-out boundary, and all three
human-eye viewport state reviews passed. Those results do not erase the two
missing acceptance gates.

## Exact Hosted Truth

The web and API deployment identities matched the accepted review SHA before
and after the rehearsal.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `f50a15fe15c08f960f7980f692bf68a2a6557780` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `f50a15fe15c08f960f7980f692bf68a2a6557780` |

Migration `040_community_notifications.sql` remained byte-exact at SHA-256:

```text
88F6CF617878D1C3DE52B9CDB011F81ECA168D92DBF20C475996BC0B04DC8B9D
```

Read-only database and PostgREST proof passed before mutation and was repeated
after restoration:

| Boundary | Result |
| --- | --- |
| Watch / notification columns | Exact `6` / `13` |
| Watch / notification constraints | Exact `4` / `6` |
| Named query indexes | Exact `4` present |
| Watch / notification RLS policies | Exact `4` / `2` |
| RLS | Enabled on both tables |
| Watch updated-at trigger | Present and enabled |
| Migration `040` ledger | Exactly `1`, version `20260715095133` |
| Later community ledger rows | Exact `4`, one each |
| PostgREST table resolution | `200` / `200` |

No schema, ledger, migration, policy, configuration, or fixture change was
made.

## Baseline

ARIADNE selected one existing anonymous-readable Public thread without
recording its identifier or body. Fresh replay-owner session and watch reads
were bounded and unambiguous.

| Sanitized value | Initial |
| --- | ---: |
| Replay-owner tier | Private |
| Owner watch boolean | `false` |
| Current owner/thread rows | `0` |
| Total watch rows | `0` |
| Other-owner rows on selected thread | `0` |
| Notification rows | `0` |

## Auth And Readability Boundaries

| Check | Result |
| --- | --- |
| Signed-out watch `GET` | Pass, `401` |
| Signed-out human UI | Pass, sign-in copy only; no Watch/Unwatch command or state claim |
| Replay-owner readable-thread watch `GET` | Pass, `200/false` |
| Below-tier watch `PUT` / `DELETE` | Blocked, no configured account remains below Private tier |
| Unreadable-thread watch `GET` / `PUT` / `DELETE` | Blocked, no existing unreadable thread fixture exists |

All configured candidate credentials were tested without printing account
details. Every successful candidate session resolved to Private tier. The
hosted thread set was searched through sanitized database predicates; no
candidate met an accepted unreadability condition for this non-admin replay
owner.

## Real Watch Lifecycle

The following sequence used the hosted API and real browser UI against the
selected existing Public thread:

| Step | Status / readback | Current owner/thread rows |
| --- | --- | ---: |
| Initial `GET` | `200/false` | `0` |
| First Watch `PUT` from browser | `200/true` | `1` |
| Authoritative `GET` | `200/true` | `1` |
| Browser refresh | `Watching replies`; `Unwatch thread` | `1` |
| Duplicate Watch `PUT` | `200/true` | `1` |
| First Unwatch `DELETE` from browser | `200/false` | `0` |
| Authoritative `GET` | `200/false` | `0` |
| Browser refresh | `Not watching`; `Watch thread` | `0` |
| Repeated Unwatch `DELETE` | `200/false` | `0` |
| Final authoritative `GET` | `200/false` | `0` |

The duplicate PUT created no second logical row. Both DELETE operations were
current-owner scoped and idempotent. Other-owner selected-thread rows remained
`0`, total watch rows followed `0 -> 1 -> 1 -> 0 -> 0`, and notification rows
remained `0` throughout.

## Exact Restoration

Restoration is complete.

| Sanitized value | Initial | Final |
| --- | ---: | ---: |
| Owner watch boolean | `false` | `false` |
| Current owner/thread rows | `0` | `0` |
| Total watch rows | `0` | `0` |
| Other-owner selected-thread rows | `0` | `0` |
| Notification rows | `0` | `0` |

A fresh GET established server truth before the restoration check. No cleanup
write was needed because the locked lifecycle already ended at the exact
initial false/zero state.

## Human-Eye State Review

ARIADNE reviewed the hosted thread in explicit Light at `1440x900`, `390x844`,
and `375x812`.

| State | `1440x900` | `390x844` | `375x812` |
| --- | --- | --- | --- |
| Delayed initial GET: `Loading watch state...` | Pass | Pass | Pass |
| Ready true: `Watching replies` / `Unwatch thread` | Pass | Pass | Pass |
| Ready false: `Not watching` / `Watch thread` | Pass | Pass | Pass |
| In-flight mutation: `Saving watch state...` | Pass | Pass | Pass |
| Malformed GET: bounded unavailable state | Pass | Pass | Pass |
| Ambiguous mutation: bounded unconfirmed state | Pass | Pass | Pass |
| GET-only Retry reconciliation | Pass | Pass | Pass |

Every state showed only its accepted claim and command set. Loading and saving
showed no state claim or mutation command. The two failure states used exact
bounded copy and `Retry watch state`; each retry sent GET only. Three
synthetic ambiguous PUTs and three synthetic ambiguous DELETEs were intercepted
locally and never reached the hosted API. None was automatically replayed.

Keyboard traversal reached each Watch, Unwatch, and Retry command with visible
focus and exact accessible names. Watch content fit without clipping or
overlap, document horizontal overflow was zero, and all `24` temporary state
captures were inspected. The captures contain route context and remain
uncommitted.

PR527D's Dark Forum presentation defect remains open and separate. This
rehearsal did not patch, reclassify, or claim to close that presentation lane.

## Mutation And Privacy Boundary

- The only hosted product writes were the selected replay owner's two Watch
  PUTs and two Unwatch DELETEs required by the locked lifecycle.
- Synthetic failure-state PUT/DELETE requests were fulfilled in the browser
  and did not reach the server.
- Exact row-count snapshots across the existing profile, Space, document,
  thread, comment, report, vote, witness, moderation, publishing, storage,
  provider-secret, import, export, and notification tables were unchanged.
- Billing readback was unchanged.
- No account, thread, comment, notification, vote, witness, report,
  moderation, profile, billing, publication, Space, document, provider, queue,
  storage, schema, or fixture mutation occurred outside the reversible watch
  row.
- Browser proof emitted zero page errors, zero classified console errors, zero
  unclassified console errors, and zero auth refreshes.
- No credential, cookie, token, account id, thread id, row body, private text,
  SQL payload, connection detail, browser storage, or screenshot is included
  in this result.

## Validation

| Check | Result |
| --- | --- |
| Exact web/API deployment identity before and after | Pass |
| Migration hash, schema, RLS, policy, trigger, ledger, PostgREST | Pass |
| Existing readable Public thread and owner baseline | Pass |
| Signed-out API/UI boundary | Pass |
| Below-tier `403` boundary | Blocked, fixture unavailable |
| Unreadable-thread `404` boundary | Blocked, fixture unavailable |
| Watch, GET, refresh, duplicate Watch | Pass |
| Unwatch, GET, refresh, repeated Unwatch | Pass |
| Three-viewport loading/ready/saving/failure/reconciliation review | Pass |
| Focus, accessible names, clipping, overlap, overflow | Pass |
| Page errors / unclassified console errors | Pass, zero / zero |
| Unrelated-domain and billing state | Pass, unchanged |
| Exact initial-state restoration | Pass, complete |

MIMIR must supply or separately authorize existing safe boundary fixtures
before PR527C can close. The accepted lifecycle and presentation evidence can
be retained; the rerun only needs the missing below-tier `403` and unreadable-
thread `404` gates plus a fresh deployment/restoration sanity check.
