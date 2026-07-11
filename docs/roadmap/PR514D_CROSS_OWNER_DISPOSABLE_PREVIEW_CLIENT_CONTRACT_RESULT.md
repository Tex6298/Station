# PR514D - Cross-Owner Disposable Preview Client Contract Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-11

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the participant-safe client contract that unblocks visible
UI rehearsal without exposing raw participant persona ids.

The cross-owner disposable preview route remains:

- auth-required;
- participant-scoped by consent id;
- approved-consent only;
- limited to `run_cross_owner_encounter` scope version `1`;
- PR512 runtime-context gated;
- PR513 runtime-attempt audited before provider execution;
- platform-provider routed from the authenticated actor;
- actor-only token-accounted;
- private, disposable, noncanonical, nonpublic, not saved, not a transcript, not
  a summary, not an excerpt, not shareable, and not backed by private retrieval.

## Implementation

Changed API request contract:

- `POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview`
  now accepts only:
  - `setup`;
  - optional bounded `maxOutputTokens`.
- The route infers `initiatorPersonaId` and `responderPersonaId` from the
  authenticated participant and consent row.
- Explicit or stale `initiatorPersonaId` / `responderPersonaId` body fields are
  rejected by the strict schema before provider, audit, or token writes.

Changed API response readback:

- adds bounded readiness facts;
- adds `Counterparty does not see this generated reply here`;
- adds `Runtime attempt audit recorded`;
- continues to return only display snapshots and disposable provenance labels.

Changed web helper contract:

- added consent-scoped path and payload builders;
- added typed response/readiness/readback helpers;
- added bounded cross-owner disposable preview error copy;
- payload helper never includes participant persona ids, owner ids, provider
  payloads, prompt internals, token facts, SQL details, or secret-shaped values.

Updated stale owner-only contract copy:

- same-owner runtime remains the general rule;
- the only cross-owner exception named here is the approved private
  consent-scoped disposable preview path;
- saved sessions, publication, transcripts, summaries, excerpts, share links,
  retrieval, and generated-word public readback remain blocked.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
```

Focused coverage now proves:

- approved requester can run without body persona ids;
- approved counterparty can run without body persona ids and server-inferred
  direction is reversed correctly;
- explicit or stale body persona ids are rejected with `400`;
- signed-out and nonparticipant requests remain `401` / `404`;
- inactive, wrong-scope, and wrong-version consents fail closed before token
  writes;
- audit insertion failure fails closed before provider or token writes;
- provider unavailable, quota, rate limit, provider failure, and empty reply
  states remain bounded and audited;
- response and provider payloads do not expose raw owner ids, raw persona ids,
  private persona material, provider secrets, bearer values, or SQL/env details;
- web helper payloads contain only setup/options;
- web readback labels include private/disposable/not-saved/not-public/
  not-canonical/no-retrieval/counterparty-hidden/audit-recorded boundaries;
- web error copy is bounded for provider unavailable, quota/rate, wrong state,
  audit failure, provider failure, and generic failure.

## Non-Scope Preserved

No visible customer-facing UI was added.

No saved cross-owner private sessions, public cross-owner exhibits, generated
word excerpts, transcripts, summaries, share links, publication, counterparty
generated-word readback, Memory, Canon, Archive, Continuity, Integrity,
retrieval, export, storage, billing, Redis, Cloudflare, workers, migrations,
provider config, broad Studio redesign, public routes, or deployment work was
added.

## Handoff

ARGUS should review the API/browser contract boundary before ARIADNE rehearses
visible UI or DAEDALUS wires customer-facing controls.

Review focus:

- strict body rejection of raw/stale participant persona ids;
- server-side participant inference for requester and counterparty actors;
- response/readback labels do not leak ids or imply saved/shared output;
- audit/token/provider behavior is unchanged except for consent-scoped request
  inference;
- no visible UI, persistence, public surface, or retrieval drift.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
