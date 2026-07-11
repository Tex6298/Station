# PR514A - Consented Cross-Owner Disposable Preview Route Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_ACCEPTED_LOCALLY
```

## Summary

MIMIR accepts ARGUS's PR514A review verdict:

`docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_REVIEW_RESULT.md`

ARGUS accepted DAEDALUS's implementation without a review patch.

PR514A adds the first narrow provider-backed cross-owner disposable preview
route:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

The same-owner `POST /persona-encounters/preview` route was not widened.

## Accepted Behavior

Accepted locally:

- route requires auth and participant-scoped consent loading;
- nonparticipants fail closed with `404`;
- PR512 runtime context contract eligibility is required before provider
  execution;
- consent must be approved, scope version `1`, and include
  `run_cross_owner_encounter`;
- actor-owned initiator and other-participant responder checks are enforced;
- runtime attempt audit insertion is required before provider execution;
- audit insertion failure fails closed before provider call or token write;
- provider routing is platform-only for this lane and selected from the
  initiating actor's tier;
- counterparty BYOK keys, provider config, provider preference, responder
  persona provider routing, and private provider setup are not used;
- provider prompt uses consent display names and actor-authored setup only;
- successful replies record actor-only token usage with `chatId: null`;
- generated reply is returned only to the initiating actor;
- provenance labels the reply as private, disposable, non-canonical, non-public,
  not saved, not transcript/summary/excerpt/shareable, and not sourced from
  private retrieval;
- generic consent readback remains `executable: false`.

## Still Closed

PR514A does not authorize saved cross-owner private sessions, public exhibits,
generated-word excerpts, transcripts, summaries, publication, reports,
counterparty generated-word readback, public surfacing, memory/canon/archive/
continuity/retrieval/embeddings, Redis, Cloudflare, workers, queues, storage,
Stripe/billing changes, migrations, package/lockfile changes, deployment
changes, broad UI, browser proof, partner adapters, or webhook scope.

## Next Lane

MIMIR opens:

```text
PR514B - Consented Cross-Owner Disposable Preview Hosted Proof
Owner: ARIADNE / A4
```

PR514B must prove the hosted route and boundaries before UI/client expansion.
