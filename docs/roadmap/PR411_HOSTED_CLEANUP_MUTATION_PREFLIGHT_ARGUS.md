# PR411 - Hosted Cleanup Mutation Preflight

Owner: ARGUS
Opened by: MIMIR
Status: Open

## Why This Exists

PR407 proved the owner document delete cleanup contract in code and local/API
tests. It did not run hosted publish-and-cleanup mutation on Railway/Supabase
staging.

PR408 found a visible publishing route-story caveat, PR409 fixed it, and PR410
proved that route-story copy on hosted desktop and mobile. With that narrative
caveat closed, the remaining launch-core cleanup caveat is whether we should
run one controlled hosted proof for disposable data.

This lane is a preflight only. ARGUS decides whether the mutation rehearsal is
safe enough to hand to DAEDALUS, and defines the exact guardrails if it is.

## Preflight Questions

Answer these before any staged mutation:

- Is hosted API fresh enough to include PR407 cleanup behavior?
- Is hosted web fresh enough to avoid confusing the operator about retract
  versus cleanup/delete?
- Can the proof use a disposable owner document with a unique public-safe title
  prefix, without touching accepted replay evidence?
- Can the proof create or use a linked document discussion without relying on
  broad forum/community side effects?
- Can public document readback, linked discussion readback, post-delete public
  hiding, and owner cleanup readback be checked without printing secrets,
  cookies, raw ids, private source bodies, or user data?
- Can unrelated public/community content be sampled safely enough to prove it
  remains routeable without mutating it?
- Are there any hosted schema, route, auth/session, or approval-state gaps that
  make this unsafe or not worth running yet?

## Candidate Proof Shape If Safe

If ARGUS accepts the rehearsal, wake DAEDALUS with a proof packet that includes:

- Freshness gates:
  - API at or after `c4b077d6` for PR407 cleanup behavior.
  - Web at or after `d2674abd` for honest Publishing Dashboard route-story
    copy.
- Artifact naming:
  - a unique title prefix such as `[cleanup-proof:<short-sha>]`;
  - public-safe synthetic body text only;
  - no private archive, memory, source, or customer data.
- Allowed hosted mutations:
  - create one disposable private owner document or draft if needed;
  - publish or approve it only as narrowly as needed to get document readback
    and a linked discussion;
  - delete that exact owner document through the authenticated owner API.
- Required readbacks:
  - pre-delete public/member document readback is routeable only for the
    disposable artifact;
  - pre-delete linked discussion is routeable only for the disposable artifact;
  - delete response returns `cleanup.strategy:
    linked_discussion_tombstone`;
  - delete response reports linked discussion threads hidden, comments
    preserved, comments deleted as zero, and unrelated threads touched as zero;
  - post-delete public document and linked discussion reads are hidden/not
    routeable;
  - owner-visible cleanup readback is sanitized and contains no secrets.
- Stop conditions:
  - stale deployment;
  - missing owner auth/session;
  - no disposable artifact isolation;
  - unexpected unrelated route mutation;
  - cleanup response missing or weaker than PR407 contract;
  - any visible secret, raw token, private source body, stack trace, or SQL
    error.

## Non-Goals

PR411 does not authorize:

- running the hosted mutation;
- full hard-delete artifact removal;
- deleting comments, reports, votes, moderation actions, or unrelated threads;
- UI cleanup buttons;
- forum/community rewrite;
- schema/migration work;
- Redis, Cloudflare, provider/model, embedding, worker/queue, billing, Stripe,
  auth/session, or deployment changes;
- broad launch/demo copy changes.

## Handoff

If safe, wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR411 hosted cleanup mutation preflight.
Task:
- Run only the approved disposable hosted cleanup proof with the exact guardrails
  and stop conditions.
- Wake ARGUS with sanitized evidence and no secrets/raw ids/private source
  bodies.
```

If unsafe or under-specified, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR411 hosted cleanup mutation preflight.
Blocker:
- <exact reason>
Task:
- Decide whether to defer hosted cleanup proof, narrow the proof, or open a
  different lane.
```

Do not go idle without a wakeup commit.
