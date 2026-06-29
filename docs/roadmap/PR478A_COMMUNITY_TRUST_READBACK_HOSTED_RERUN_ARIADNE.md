# PR478A - Community Trust Readback Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted rerun after PR478B repair

## Why This Rerun

ARIADNE's first PR478A hosted rehearsal found a product defect:

`docs/roadmap/PR478A_COMMUNITY_TRUST_READBACK_REHEARSAL_RESULT.md`

ARGUS accepted DAEDALUS' PR478B repair:

`docs/roadmap/PR478B_PUBLIC_FORUM_SCORE_COPY_REPAIR_REVIEW_RESULT.md`

This rerun should prove the original hosted blocker is gone at app commit
`1fc9b184` or later, while rechecking the PR478A trust/privacy boundaries.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `1fc9b184` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - the public forum thread/detail surface includes PR478A witness/trust
     readback.
2. Signed-out public forum thread detail on desktop:
   - PR478A readback still frames `Helpful`, `Grounded`, and `Careful` as
     contribution-level marks or aggregate acknowledgments;
   - no visible `Score N`, `N votes`, `Up`, `Down`, `trust N`, public score,
     user score, ranking, leaderboard, badge, clout, or reputation-profile copy
     appears on the public thread surface;
   - current-viewer witness state, witnesser identity, reporter identity,
     private recognition, moderation notes, hidden bodies, provider payloads,
     stack traces, and raw internal rows are not visible.
3. Signed-out public forum thread detail at 390px mobile:
   - PR478A trust readback and PR478B neutral participation feedback remain
     readable;
   - no horizontal overflow, clipped controls, overlapping text, or broken
     witness/readback layout;
   - no forbidden score/vote/reputation copy appears.
4. Signed-in eligible viewer:
   - current-viewer witness state is framed as visible only to the signed-in
     viewer;
   - signed-in participation controls, if present, use neutral labels such as
     `Useful` and `Needs work`;
   - no reputation, ranking, badge, clout, leaderboard, public author score, or
     public trust score language appears;
   - do not create, remove, or change a witness mark.
5. Existing forum feedback mechanics:
   - local review already accepted that vote endpoints/state updates stayed
     intact;
   - do not exercise a hosted vote mutation unless the visible route cannot be
     judged without it;
   - if a bounded hosted feedback click is necessary, restore the starting
     state and do not capture raw IDs, auth headers, cookies, or response
     bodies.
6. Private `/forums/witnesses`:
   - remains signed-in-author/private-tier scoped;
   - recognition readback is aggregate-only;
   - no witnesser identity, reporter identity, report row, moderation note,
     hidden body, raw internal row, or private comment leaks.
7. Signed-out or below-tier `/forums/witnesses`:
   - remains gated, redirected, or otherwise unavailable as private author
     recognition;
   - no private recognition data leaks.
8. Safety:
   - do not open or exercise report queues, moderation action forms,
     delegated-moderator mutation paths, admin-only consoles, provider calls,
     Redis/Cloudflare/workers/queues behavior, billing behavior, or schema
     behavior;
   - do not capture hosted logs, SQL output, raw response bodies, raw route IDs,
     cookies, tokens, provider payloads, stack traces, private comments,
     hidden/deleted bodies, reporter identities, witnesser identities, or
     moderation notes.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_TRUST_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` if the hosted rerun proves the PR478B score/vote-copy
blocker is gone and the original PR478A aggregate/current-viewer/private trust
boundaries still hold.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` if any visible `Score N`, `N votes`, `Up`,
`Down`, `trust N`, public score, ranking, leaderboard, badge, clout, reputation
profile, or broken mobile layout remains after a fresh deploy.

Use `PRIVACY_OR_TRUST_BOUNDARY_FAIL` if any witnesser identity, reporter
identity, raw witness/report row, private comment, hidden/deleted body,
moderation note, SQL/table output, stack trace, provider payload, raw response
body, cookie, token, public moderator directory, or new moderation power
appears.

Use `SEED_OR_ROUTE_BLOCKER` only if hosted staging has no routeable public forum
thread or no reachable `/forums/witnesses` state and the issue cannot be
distinguished from missing seed/account data.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR478A hosted rerun after PR478B forum score copy repair.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_TRUST_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR478A/PR478B, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```
