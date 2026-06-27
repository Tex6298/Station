# PR397 - Hosted Publish Retract Discussion Retry Result

Date: 2026-06-27
Owner: ARIADNE
Verdict: PASS

## Scope

Ran the hosted PR397 publish-and-retract retry using the one additional
public-safe owner-visible retracted artifact that MIMIR authorized.

Title used:

```text
[replay:pr397] publish retract discussion retry 20260627-035034
```

No hard delete, thread/comment deletion, extra artifact, social dispatch,
Station Press, rich text expansion, scheduling, billing, provider/model config,
Redis, Cloudflare, worker/queue, schema, or migration action was attempted.

One owner-visible retracted PR397 artifact remains in Studio, as allowed by the
packet.

## Freshness

Required:

- Web at or after `a0627335`
- API at or after `8b57a727`

Observed:

- Web: ready at `8b57a727`
- API: ready at `8b57a727`

The freshness gate passed.

## Publish Flow

PASS:

- Replay owner credentials were available from ignored local environment.
- An existing owned Space was selectable.
- `/studio/publish` created one public-safe unlisted staged document.
- Comments remained enabled.
- `/studio/publishing` exposed and completed the approval transitions:
  - `Review`
  - `Human review`
  - `Approve`
  - `Publish`
- A public `View` route became available after publish.

## Public Readback Before Retraction

PASS:

- The public document detail route opened before retraction.
- The route exposed the document detail surface for the PR397 artifact.
- The public document detail route exposed:

```text
Open linked discussion
```

- The linked discussion route opened before retraction.
- The linked discussion route was readable as a public/unlisted route holder and
  showed the document-discussion context.
- No private Studio, archive, memory, canon, continuity, import, provider
  payload, SQL, stack trace, or secret-shaped text was visible in the checked
  public surfaces.

Automation note:

- The raw probe initially marked the trust/readback text check false because it
  looked for mixed-case labels while the document trust row labels are rendered
  with uppercase styling.
- The document detail component renders the trust/readback panel
  unconditionally on that route, and the same public detail route exposed the
  linked discussion action before retraction.

## Retraction

PASS:

- `/studio/publishing` exposed `Retract to private` for the published item.
- Retraction completed.
- The dashboard notice stated that public readers and linked discussion routes
  can no longer open the document while the owner-visible record remains in
  Studio.
- After retraction, `/studio/publishing` kept the artifact owner-visible,
  marked `private`, and replaced public `View` with `View unavailable`.

## Post-Retraction Checks

PASS:

- The previously captured public document route was hidden from public readers
  after retraction.
- The previously captured linked discussion route was hidden from public readers
  after retraction.
- The owner could still open and read/edit the document privately from Studio.
- No hard-delete cleanup claim was made; this is visibility/hide behavior.

## Safety

PASS:

- Exactly one publish mutation was attempted.
- Exactly one retract-to-private mutation was attempted.
- No hard delete cleanup was attempted.
- No thread/comment deletion was attempted.
- No social dispatch was attempted.
- No raw identifiers, cookies, secrets, SQL, logs, stack traces, or private
  source text were recorded in this result.

## Residual Risk

No functional PR397 residual risk remains from ARIADNE's hosted route proof.

The only note is the automation matcher issue above: future probes should check
trust/readback labels case-insensitively or target the `Document trust` panel
copy rather than mixed-case row labels.
