# PR395 - Hosted Publish And Retract Rehearsal Result

Date: 2026-06-27
Owner: ARIADNE
Verdict: BLOCKED

## Scope

Ran the hosted publish-and-retract rehearsal against the replay owner account
using one public-safe synthetic document.

Title used:

```text
[replay:pr395] publish retract rehearsal 20260627-032414
```

No hard delete, thread/comment deletion, social dispatch, Station Press, rich
text expansion, scheduling, billing, provider/model config, Redis, Cloudflare,
worker/queue, schema, or migration action was attempted.

One owner-visible retracted artifact remains in Studio, as allowed by the PR395
packet.

## Freshness

Hosted deployment target:

```text
a0627335
```

Observed hosted deployment:

- Web: ready at `a0627335`
- API: ready at `a0627335`

The freshness gate passed.

## Completed Flow

PASS:

- Replay owner credentials were available from ignored local environment.
- An existing owned Space was selectable.
- `/studio/publish` created one synthetic unlisted document draft.
- `/studio/publishing` exposed the approval flow.
- Approval transitions completed:
  - `Review`
  - `Human review`
  - `Approve`
  - `Publish`
- A public `View` route became available after publishing.
- `Retract to private` was available for the published public-readable item.
- Retraction completed and surfaced the owner-facing notice that public readers
  and linked discussion routes can no longer open the document while the
  owner-visible record remains in Studio.
- After retraction, the public document route was hidden from public readers.
- After retraction, `/studio/publishing` kept the artifact owner-visible,
  marked `private`, and replaced public `View` with `View unavailable`.
- The owner could still open the document privately from Studio after
  retraction.

## Blocker

The pre-retract public document trust/readback check did not complete before the
single allowed artifact was retracted.

Observed:

- The post-publish `View` route appeared in `/studio/publishing`.
- The rehearsal opened the public route before retraction.
- The probe did not confirm the expected public document trust/readback labels
  before the document was retracted.
- The document was then retracted to private, so ARIADNE did not create a second
  public artifact to retry the public readback step.

This blocks a full PASS because PR395 explicitly asked for published
public/unlisted readback before retraction.

## Linked Discussion

No `Open linked discussion` route appeared on the published document detail
surface before retraction.

Because no linked discussion route appeared:

- no public linked forum route was opened before retraction;
- post-retract linked discussion hiding is not applicable for this artifact;
- thread hiding remains unexercised in this hosted rehearsal.

## Safety

PASS:

- Exactly one publish mutation was attempted.
- Exactly one retract-to-private mutation was attempted.
- No hard delete cleanup was attempted.
- No public thread/comment deletion was attempted.
- No social dispatch was attempted.
- No raw identifiers, private source material, owner-only Studio/archive/memory/
  canon/continuity/import material, provider payloads, SQL, stack traces, or
  secret-shaped values were recorded in this result.

## Residual Risk

- Published public/unlisted trust readback remains unproven for PR395 because
  the check did not confirm the expected labels before retraction.
- Linked discussion hiding remains unproven because this approval-published
  artifact did not expose a linked discussion route before retraction.
- The one retracted artifact is intentionally left owner-visible in Studio; this
  is visibility/hide behavior, not cleanup or deletion.

## Recommended Next Owner

MIMIR should decide whether to:

1. accept the proven publish/retract contract with the stated residual risk;
2. explicitly authorize one additional ARIADNE artifact to retry only the
   pre-retract public readback step with a longer public-route wait; or
3. send DAEDALUS to inspect why the approval-published document did not expose
   a linked discussion route during the hosted rehearsal.
