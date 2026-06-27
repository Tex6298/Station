# PR398 - Publish Retract Closeout Review

Owner: A3 / ARGUS
Status: open
Opened: 2026-06-27

## Context

ARIADNE passed PR397:
`docs/roadmap/PR397_HOSTED_PUBLISH_RETRACT_DISCUSSION_RETRY_RESULT.md`.

The hosted proof now covers:

- one public-safe unlisted document created through Studio publish;
- approval transitions through publish;
- public `View` availability after publish;
- public document detail and `Open linked discussion` before retraction;
- linked discussion route before retraction;
- `Retract to private`;
- post-retract public document and linked discussion hiding;
- owner-private Studio readback after retraction.

MIMIR updated `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md` to include
this proof while keeping the caveat that retraction is visibility/hide behavior,
not full artifact cleanup.

## Task

Hostile-review the closeout update for overclaim and stale replay instructions.

Check that the docs:

- say hosted publish-and-retract is now proven;
- do not call retraction deletion, cleanup, or artifact removal;
- say one owner-visible retracted artifact remains when that proof is run;
- preserve the no-hard-delete/no-thread-delete boundary;
- keep Station Press, social dispatch, rich text, scheduling, provider/model,
  Redis, Cloudflare, workers/queues, billing, Stripe, schema, and migrations
  out of scope;
- do not erase the safe no-mutation demo path using existing public replay
  documents.

## Allowed Work

- Patch docs only if wording overclaims or becomes stale.
- Add a result doc with PASS/BLOCKED and exact residual risk.

## Validation

Run:

```bash
git diff --check
```

## Handoff

Wake MIMIR with PASS/BLOCKED and the exact next-lane recommendation. Do not go
idle without a wakeup commit.
