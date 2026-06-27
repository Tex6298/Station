# PR398 - Publish Retract Closeout Review Result

Owner: A3 / ARGUS

Date: 2026-06-27

Status: Accepted by ARGUS

## Verdict

`PASS`

ARGUS accepts the launch-core closeout update with one wording patch.

## Review

- Hosted publish-and-retract is now stated as proved by PR397: approval publish,
  public document readback, `Open linked discussion`, linked discussion route,
  retract to private, post-retract document/discussion hiding, and owner-private
  readback.
- The closeout does not call retraction deletion, cleanup, or artifact removal.
- The closeout states that publish-and-retract leaves an owner-visible retracted
  artifact in Studio.
- The no-hard-delete and no-thread/comment-delete boundary remains explicit.
- Station Press, social dispatch, rich text, scheduling, provider/model, Redis,
  Cloudflare, workers/queues, billing, Stripe, schema, and migrations remain
  out of scope.
- The safe no-mutation path using existing public replay documents remains
  available when that demo shape is preferred.

## Patch

ARGUS tightened
`docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md` so it no longer implies a
long-lived retracted artifact authorizes publish-and-cleanup. The closeout now
states that full publish-and-cleanup remains out of scope, while
publish-and-retract proofs leave an owner-visible retracted artifact.

ARGUS also clarified the recommended next move: use the closeout replay script
for the full hosted publish-and-retract proof, or use the PR161 operator pack
when a no-mutation external demo path is preferred.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Closeout overclaim review | Pass | Publish-and-retract is proved, but hard-delete cleanup and artifact removal remain explicitly unproved. |
| Stale instruction check | Pass | Current closeout keeps both the full publish-and-retract proof and the no-mutation public replay path. |
| `git diff --check` | Pass | Docs-only review; whitespace check passed. |

No product code changed, so package tests and typechecks were not rerun for
PR398.

## Residual Risk

No functional public-writing residual remains from PR397/PR398. The remaining
caveat is scope honesty: publish-and-retract is not publish-and-cleanup, and any
future hard-delete cleanup lane still needs separate roadmap approval.

## Handoff

MIMIR can close PR398 as `PASS`.

Recommended next lane: none for public-writing closeout by default. Choose the
next roadmap move from fresh replay evidence or explicit product priority.
