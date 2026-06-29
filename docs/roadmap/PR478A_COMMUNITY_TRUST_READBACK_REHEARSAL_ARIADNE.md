# PR478A - Community Trust Readback Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted read-only proof

## Why This Rehearsal

ARGUS accepted PR478A:

`docs/roadmap/PR478A_COMMUNITY_TRUST_READBACK_REVIEW_RESULT.md`

The remaining risk is hosted product truth: the live staging site must show
community trust readback as aggregate/current-viewer/private explanatory copy,
not public scoring, ranking, badge, clout, reputation profile, public moderator
directory, or a new moderation/reporting power.

This is a human-eye hosted proof. It is read-only.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `d27be936` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - a routeable public forum thread detail visibly includes the PR478A trust
     readback copy.
2. Signed-out public forum thread detail on desktop:
   - witness/trust readback appears around readable thread/comment material;
   - `Helpful`, `Grounded`, and `Careful` are framed as contribution-level
     marks or aggregate acknowledgments;
   - aggregate counts may be visible;
   - current-viewer witness state, witnesser identity, reporter identity, and
     private recognition are not visible.
3. Signed-out public forum thread detail at 390px mobile:
   - trust readback remains readable;
   - no horizontal overflow, clipped controls, overlapping text, or broken
     witness/readback layout;
   - no score/ranking/badge/clout/reputation-profile language appears.
4. Signed-in eligible viewer on a routeable public forum thread detail:
   - current-viewer witness state is framed as visible only to the signed-in
     viewer;
   - aggregate witness copy remains aggregate-only;
   - no witnesser identity, public score, ranking, badge, leaderboard, clout,
     or reputation profile claim appears;
   - do not create, remove, or change a witness mark during this rehearsal
     unless MIMIR separately opens a mutation proof.
5. Signed-in author/private recognition:
   - open `/forums/witnesses`;
   - page remains signed-in-author/private-tier scoped;
   - recognition readback is aggregate-only and does not reveal witnesser
     identities, reporter identities, report rows, moderation notes, hidden
     bodies, raw internal rows, or private comments.
6. Signed-out or below-tier `/forums/witnesses`:
   - remains gated, redirected, or otherwise unavailable as a private author
     recognition page;
   - does not leak private author recognition data.
7. Optional direct API samples, only if already available without exposing
   secrets:
   - public thread/comment readback returns aggregate witness counts only;
   - private `/forums/witnesses/mine` remains current-user scoped;
   - do not capture raw IDs, cookies, auth headers, SQL rows, private comments,
     report rows, or moderation notes.
8. Safety:
   - do not open or exercise report queues, moderation action forms,
     delegated-moderator mutation paths, or admin-only consoles except as needed
     to prove they are not publicly exposed;
   - do not capture hosted logs, SQL output, raw response bodies, raw route IDs,
     cookies, tokens, provider payloads, stack traces, private comments,
     hidden/deleted bodies, reporter identities, witnesser identities, or
     moderation notes.

## Out Of Scope

Do not submit witness marks, create reports, change report statuses, perform
moderation actions, appoint moderators, inspect admin-only report details, or
create/delete forum content.

Do not broaden into public reputation, points, badges, leaderboards, rankings,
scores, clout, public moderator directories, automated moderation, AI judgment,
new moderation powers, broad forum redesign, notifications rewrite, schema
changes, billing, Redis, Cloudflare, workers, or queues.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_TRUST_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` if hosted desktop/mobile public thread detail,
signed-in viewer readback, private `/forums/witnesses`, and signed-out/below
tier gates prove aggregate/current-viewer/private trust readback without
forbidden public scoring, identity exposure, or moderation/report leakage.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for concrete visible defects such as missing
PR478A readback after fresh deploy, misleading public-score language, broken
mobile layout, or missing private recognition boundary copy.

Use `PRIVACY_OR_TRUST_BOUNDARY_FAIL` if any witnesser identity, reporter
identity, raw witness/report row, private comment, hidden/deleted body,
moderation note, SQL/table output, stack trace, provider payload, raw response
body, cookie, token, public reputation profile, public moderator directory, or
new moderation power appears.

Use `SEED_OR_ROUTE_BLOCKER` only if hosted staging has no routeable public forum
thread or no reachable `/forums/witnesses` state and the issue cannot be
distinguished from missing seed/account data.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR478A hosted read-only Community Trust Readback rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_TRUST_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR478A, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```
