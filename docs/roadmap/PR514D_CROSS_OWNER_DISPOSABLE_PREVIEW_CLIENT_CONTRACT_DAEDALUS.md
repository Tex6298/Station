# PR514D - Cross-Owner Disposable Preview Client Contract

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_DAEDALUS_IMPLEMENTATION
```

## Goal

Give the web client a participant-safe contract for discovering and running one
approved cross-owner disposable preview without exposing raw owner ids, raw
persona ids, provider payloads, prompt internals, token facts, SQL details, or
secret-shaped values.

This is the narrow unblock for PR514C's accepted blocker:

```text
CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_MISSING
```

## Product Boundary

PR514A/PR514B proved the hosted backend can generate one private disposable
responder reply for an approved cross-owner consent. PR514C found that the web
client cannot safely call that route because the current request shape requires
both participant persona ids.

PR514D should make the browser contract consent-scoped:

- browser knows the `consentId`;
- browser sends actor-authored setup text and optional bounded generation
  options;
- server infers the initiator/responder pair from the authenticated
  participant, approved consent, requested scope, scope version, and
  actor-initiates role rule;
- response returns only display snapshots, readiness/provenance labels, the
  actor-visible disposable reply, and bounded audit/readiness facts.

## Required Implementation

Add or adjust the API/client contract so visible UI can later call the preview
without raw participant persona ids.

Expected backend shape:

- keep the route consent-scoped:
  `POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview`;
- allow a client-safe request body with only `setup` and optional bounded
  generation options;
- infer the actor-owned initiator persona and consented responder persona on
  the server from the consent row and authenticated participant;
- preserve all existing gates: auth, participant ownership, approved consent,
  `run_cross_owner_encounter`, scope version `1`, correct actor role,
  runtime-context eligibility, audit insertion before provider, platform-only
  provider routing, actor-only token accounting, and fail-closed behavior;
- if legacy explicit persona-id payload support remains for internal tests,
  ensure it cannot be used to override the consent row or leak ids through
  client helpers.

Expected client helper shape:

- add cross-owner disposable preview constants, types, path builders, payload
  builders, readiness/readback helpers, and bounded error copy in
  `apps/web/lib/persona-encounter-runtime.ts`;
- update `apps/web/lib/persona-encounter-runtime.test.ts`;
- keep the helper request payload free of raw participant persona ids;
- provide labels for:
  - "Cross-owner disposable preview";
  - "Actor-authored setup";
  - "Consent display snapshots";
  - "Model-generated responder reply";
  - "Private disposable preview";
  - "Not saved";
  - "Not public";
  - "Not canonical";
  - "Not a transcript";
  - "Not a summary";
  - "Not an excerpt";
  - "Not shareable";
  - "No Memory, Archive, Canon, Continuity, Integrity, private retrieval, or transcript sources used";
  - "Counterparty does not see this generated reply here";
  - "Runtime attempt audit recorded".

Also update stale owner-only contract copy in
`apps/web/lib/persona-encounter-contract.ts` so it says cross-owner runtime is
still generally blocked except for the approved disposable-preview path, which
is private, consent-scoped, and non-persistent.

## Focused Test Expectations

Add or update focused API tests to prove:

- signed-out remains `401`;
- nonparticipant remains `404`;
- pending, rejected, cancelled, revoked, wrong-scope, wrong-version, wrong-role,
  and wrong-pair cases fail closed before token write;
- approved eligible actor can run the consent-scoped request without sending
  participant persona ids;
- actor cannot alter the inferred pair by sending extra ids or stale ids;
- response does not expose raw owner ids, raw persona ids, prompt internals,
  provider payloads, token facts, SQL details, bearer values, env values, or
  secret-shaped strings;
- exactly one actor-owned token transaction is created on success, with no
  counterparty token transaction;
- runtime attempt audit rows still record blocked and provider lifecycle states;
- generic consent readback remains `executable: false`.

Add or update focused web helper tests to prove:

- path builders are consent-scoped;
- payload builders do not include participant persona ids;
- readback labels include the private/disposable/not-saved/not-public/
  not-canonical/no-retrieval/counterparty-does-not-see-this boundaries;
- error copy is bounded for provider unavailable, quota/rate, wrong state, and
  generic failures.

## Explicit Non-Scope

Do not add visible customer-facing UI in PR514D unless MIMIR explicitly reroutes
the lane before implementation begins.

Do not add:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, share links, publication, or
  counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, unrelated migrations, provider config,
  broad Studio redesign, public routes, or deployment work.

## Validation

Run the focused gates needed for the touched files. Expected minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If another existing focused test suite owns the changed helper or route surface,
run that too.

## Handoff

When complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review the contract boundary before any ARIADNE visible UI
rehearsal or DAEDALUS customer-facing wiring.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
