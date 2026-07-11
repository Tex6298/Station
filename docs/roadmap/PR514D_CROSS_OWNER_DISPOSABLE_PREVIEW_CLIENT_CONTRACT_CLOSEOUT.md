# PR514D - Cross-Owner Disposable Preview Client Contract Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR514D_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_ACCEPTED
```

## Decision

PR514D is accepted and closed.

ARGUS accepted the consent-scoped client contract after a narrow helper-label
patch. The browser no longer needs participant persona ids to call the
cross-owner disposable preview route.

Accepted route:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

Accepted client payload:

```text
setup
maxOutputTokens? bounded optional
```

The server infers the actor-owned initiator and consented responder from the
authenticated participant and consent row.

## Preserved Boundary

Still out of scope:

- visible UI until PR514E;
- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, share links, publication, or
  counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, broad Studio
  redesign, public routes, or deployment work.

## Next Lane

Open:

```text
PR514E - Cross-Owner Disposable Preview Studio Panel
Owner: DAEDALUS / A2
```

PR514E may wire a narrow owner-only Studio panel using the accepted
consent-scoped contract. It must then go to ARGUS for boundary review and
ARIADNE for a human-eye rehearsal before hosted/demo confidence is claimed.
