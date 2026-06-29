# PR478A - Community Trust Readback Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

## Summary

The hosted PR478A read-only Community Trust Readback rehearsal found a product
defect.

The new witness/trust readback itself rendered correctly. Hosted API health was
ready at app commit `d27be936`, and the hosted web root returned HTTP 200. A
routeable public forum thread showed `Helpful`, `Grounded`, and `Careful` as
contribution-level witness marks with aggregate-only readback. Signed-out
desktop and 390px mobile did not expose current-viewer witness state,
witnesser identity, reporter identity, private recognition, moderation notes,
hidden bodies, provider payloads, stack traces, or raw internal rows.

Signed-in eligible viewer state also rendered without mutation: the non-owner
private-tier replay account saw witness controls and current-viewer framing
without public witnesser identity or new moderation power. No witness mark was
created, changed, or removed.

The private `/forums/witnesses` page remained signed-in and private-tier scoped.
The owner account saw private author-recognition boundary copy and aggregate
readback; signed-out access showed only the sign-in gate and did not leak
recognition rows.

The blocking defect is that the hosted public thread detail still includes
legacy positive score/vote language on the same public forum surface. The
PR478A rehearsal packet requires no score/ranking/badge/clout/reputation
profile language in the public trust readback proof. Because the thread page
still presents public forum `Score N` / vote-count copy next to the community
discussion surface, the result is not ready to close.

No report queue, moderation action, witness mutation, forum content mutation,
schema behavior, provider call, Redis/Cloudflare/worker/queue behavior, billing
behavior, hosted logs, SQL output, cookies, auth headers, raw IDs, private
comments, reporter identities, witnesser identities, or moderation notes were
captured.

## Result

| Check | Result | Notes |
| --- | --- | --- |
| Hosted API `/health/deployment` | Pass | Ready at app commit `d27be936`. |
| Hosted web root | Pass | Returned HTTP 200. |
| Public thread routeability | Pass | A public forum thread detail was routeable. |
| Signed-out public thread desktop | Pass | Witness readback rendered with Helpful/Grounded/Careful, aggregate-only copy, and no current-viewer witness state. |
| Signed-out public thread 390px mobile | Fail | Trust readback was readable with no horizontal overflow, but legacy public score/vote language remained visible on the thread surface. |
| Signed-in eligible viewer | Pass | Non-owner private-tier viewer saw current-viewer witness framing and controls; no witness mutation was performed. |
| Private `/forums/witnesses` owner page | Pass | Page remained private-tier/current-user scoped and showed aggregate author-recognition boundary copy only. |
| Signed-out `/forums/witnesses` | Pass | Sign-in gate rendered; recognition rows did not leak. |
| Optional direct API samples | Pass | Public thread readback returned witness counts without signed-out viewer witness state; private recognition API remained auth-gated/current-user scoped. |
| Temporary Chrome DevTools hosted harness | Fail | Completed read-only desktop/mobile and signed-in checks, finding the positive score/vote copy defect. |
| `git diff --check` | Pass | No whitespace errors. |

No `pnpm typecheck` was run because this result changes docs and agent state
only.

## Handoff

DAEDALUS should repair the public forum thread detail so PR478A trust readback
does not coexist with positive public score/vote language in the hosted proof,
or MIMIR should explicitly narrow/clarify the rehearsal acceptance language if
legacy forum votes are intentionally outside PR478A.
