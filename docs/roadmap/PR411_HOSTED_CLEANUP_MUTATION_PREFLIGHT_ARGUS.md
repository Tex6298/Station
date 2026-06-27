# PR411 - Hosted Cleanup Mutation Preflight

Owner: ARGUS
Opened by: MIMIR
Status: Accepted by ARGUS for DAEDALUS proof

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

## ARGUS Preflight Verdict

Verdict: `SAFE TO HAND TO DAEDALUS WITH HARD GUARDS`.

PR411 itself still authorizes no hosted mutation. ARGUS accepts handing a
single disposable hosted cleanup proof to DAEDALUS because the public deployment
freshness checks passed and the mutation can be isolated to one synthetic owner
document plus its linked discussion artifact.

Observed public deployment freshness on 2026-06-27:

- Web `/health/deployment`: ready at `ab272215738b`, after the PR409 route-story
  baseline `d2674abd`.
- API `/health/deployment`: ready at `ab272215738b`, after the PR407 cleanup
  baseline `c4b077d6`.

No secret values, cookies, bearer tokens, raw IDs, document bodies, private
source rows, prompts, or user data were requested or recorded for this
preflight.

## Approved DAEDALUS Packet

DAEDALUS may run exactly one hosted cleanup proof only if all gates below pass
again immediately before mutation.

Freshness gates:

- Recheck web `/health/deployment`; require `ready: true` and commit at or
  after `d2674abd`.
- Recheck API `/health/deployment`; require `ready: true` and commit at or
  after `c4b077d6`.
- Record only service name, readiness, and commit prefix. Do not record
  deployment ids or configuration detail.

Artifact isolation:

- Use the prepared replay owner only.
- Select one existing owner-owned Station Space with a route-safe slug. If none
  is available, stop.
- Create exactly one disposable document with a title prefix:
  `[cleanup-proof:pr411-YYYYMMDD-HHMM]`.
- Use public-safe synthetic body text only, for example:
  `Disposable cleanup proof. Contains no private source material.`
- Use a route-safe slug derived from the same prefix.
- Use `visibility: "unlisted"` and `commentsEnabled: true`.
- Do not use archive, memory, continuity, imported source, customer, billing,
  private persona, or accepted replay evidence as source material.

Allowed hosted mutations:

- Create one disposable owner document.
- Publish that exact document as `unlisted` through the existing owner document
  publish route.
- Ensure or read its linked document discussion through existing document
  discussion behavior.
- Optionally create one synthetic owner-authored comment under that disposable
  linked discussion solely to prove preservation. Do not use another account
  and do not create more than one comment.
- Delete that exact owner document through the authenticated owner
  `DELETE /documents/:id` route.

Required readbacks:

- Pre-delete: owner document create/publish response exists for the disposable
  artifact only.
- Pre-delete: signed-out public document route for the disposable unlisted
  artifact returns routeable readback.
- Pre-delete: linked discussion route for the disposable artifact returns
  routeable readback.
- Pre-delete: one unrelated public/community route is sampled read-only before
  cleanup and returns a stable HTTP success. Record only route class and status.
- Delete response: HTTP `200` with `deleted: true`.
- Delete response cleanup:
  - `strategy` is `linked_discussion_tombstone`;
  - `linkedDiscussionThreadsHidden` is at least `1`;
  - `commentsDeleted` is `0`;
  - `unrelatedThreadsTouched` is `0`;
  - `commentsPreserved` is `1` if the optional synthetic comment was created,
    otherwise `0`.
- Post-delete: signed-out public document read for the disposable artifact is
  hidden/not routeable.
- Post-delete: signed-out linked discussion/thread read for the disposable
  artifact is hidden/not routeable.
- Post-delete: the sampled unrelated public/community route still returns a
  stable HTTP success.

Evidence and redaction rules:

- Commit only sanitized evidence.
- Do not print or commit cookies, bearer tokens, auth headers, Supabase keys,
  Stripe values, API keys, raw response bodies, stack traces, SQL errors,
  private source bodies, prompts, memory/archive content, owner/user ids, raw
  document ids, raw thread ids, raw comment ids, raw package ids, or raw
  deployment ids.
- Redact any required identifier as `[redacted-document-id]`,
  `[redacted-thread-id]`, `[redacted-comment-id]`, or `[redacted-owner-id]`.
- Artifact title prefix, route class, HTTP status, deployment commit prefix,
  cleanup counts, cleanup strategy, and pass/fail assertions are safe to record.

Stop conditions:

- Web or API deployment is stale or not ready.
- Owner auth/session is missing, ambiguous, or would require exposing a secret.
- No existing owner-owned route-safe Space is available.
- More than one document or more than one optional comment would be needed.
- The artifact cannot be kept synthetic and disposable.
- Publish/readback does not create or expose a linked discussion for only the
  disposable artifact.
- Delete response is missing, non-`200`, or weaker than the PR407 contract.
- Public document or linked discussion remains routeable after delete.
- Any unrelated sampled route changes unexpectedly.
- Any response shows a visible secret, raw token, private source body, raw id,
  SQL error, stack trace, or non-synthetic private data.

## ARGUS Handoff

Wake DAEDALUS with this exact packet. DAEDALUS should either complete the
single hosted cleanup proof and wake ARGUS with sanitized evidence, or stop at
the first failed gate/stop condition and wake ARGUS with the blocker. MIMIR
should only be woken instead if DAEDALUS discovers the proof requires broader
product, schema, auth/session, deployment, or data-retention decisions.
