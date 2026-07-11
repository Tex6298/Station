# PR515A - Cross-Owner Consent Counterparty Selection Contract

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_DAEDALUS_IMPLEMENTATION
```

## Goal

Add the smallest API and web-helper contract that lets an authenticated owner
select and invite an eligible public counterparty persona without submitting or
receiving raw counterparty persona UUIDs or owner ids in browser-visible shapes.

This unblocks the later PR515 UI lane for real consent invitation, approval,
rejection, cancellation, and revocation controls.

## Source

ARGUS blocker:

`docs/roadmap/PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT_RESULT.md`

Concrete blocker:

```text
CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_MISSING
```

## Current Floor

- `apps/api/src/routes/persona-encounters.ts` currently accepts
  `requesterPersonaId` and `counterpartyPersonaId` for
  `POST /persona-encounters/cross-owner-consents`.
- `apps/api/src/routes/discover.ts`, `apps/api/src/routes/personas.ts`, and
  `apps/api/src/lib/persona-serialization.ts` already expose public-safe
  persona slugs/hrefs and filter UUID-shaped slugs.
- `apps/web/lib/public-persona-route.ts` and
  `apps/web/components/discover/search-dropdown.tsx` already treat public
  persona slugs as route-safe browser values.
- Existing participant readback/action routes remain valid for already-visible
  consent rows.

## Required Scope

Implement the smallest contract that satisfies the blocker. The exact shape is
DAEDALUS's call, but it should follow one of these patterns:

- a create body that accepts a safe `counterpartyPublicSlug` or public href and
  resolves it server-side; or
- a dedicated authenticated selector/resolver endpoint that returns a
  server-minted opaque invitation target handle, then create consumes that
  handle.

The contract must:

- return only public-safe candidate fields such as display name, sanitized
  avatar, public slug or href, short public summary, and explicit eligibility
  state;
- reject unsafe or UUID-shaped slugs;
- reject private personas, ineligible owner tiers, stale or forged target
  handles, same-owner targets, self-persona targets, malformed requests, and
  missing requester ownership before consent writes;
- preserve requester ownership, different-owner, bounded scope, audit, and
  participant readback rules;
- add web helpers for the new selector/create contract;
- ensure no web helper submits `counterpartyPersonaId`, `ownerUserId`,
  `owner_user_id`, raw SQL details, bearer values, env values, provider
  payloads, token facts, prompts, or private persona fields;
- keep existing list/detail/approve/reject/cancel/revoke behavior
  participant-scoped and ledger-only.

## Out Of Scope

Do not add:

- visible invitation UI;
- saved cross-owner sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, share links, publication,
  or counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, provider config, broad Studio redesign,
  public surfacing, partner adapters, webhooks, or hosted-runtime scope.

Avoid migrations unless the chosen implementation genuinely needs a persisted
selector artifact. Prefer the smallest server-side resolution contract if it
can preserve the privacy boundary.

## Expected Files

Likely files:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`

Possibly relevant public selector/readback files:

- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/lib/persona-serialization.ts`
- `apps/web/lib/public-persona-route.ts`
- `apps/web/components/discover/search-dropdown.tsx`

## Validation

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
```

## Review Handoff

Wake ARGUS when implementation is ready.

Expected wakeup:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR515A, the cross-owner consent counterparty selection/create contract.
- The browser no longer needs to submit a raw counterparty persona UUID for consent invitation creation.
- Tests cover unsafe slugs/handles, ineligible/private/same-owner targets, missing requester ownership, and no raw owner/persona/provider/private/token/secret readback.

Task:
- Hostile-review PR515A.
- Confirm the contract safely unblocks visible PR515 invitation UI.
- Wake MIMIR with ACCEPT_PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT or required fixes.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS blocked full PR515 invitation UI on CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_MISSING.
- Existing participant consent list/detail/action routes are safe for already-visible rows.
- Invitation creation still needs a safe selector/create contract so browser code does not submit raw counterparty persona UUIDs.

Task:
- Implement PR515A: smallest API/web-helper contract for safe counterparty selection and consent creation.
- Prefer resolving a safe public slug/href server-side unless an opaque handle is clearly safer and still small.
- Preserve the existing consent ledger boundaries and participant readback.
- Add focused API/web-helper tests proving unsafe slugs, private/ineligible/same-owner targets, forged or stale handles, raw ids, private fields, provider payloads, token facts, SQL details, bearer/env/secret-shaped values, and generated-word surfaces do not leak.
- Run test:persona-encounters, test:studio-ui, and typecheck.
- Wake ARGUS with the implementation result.
```
