# PR514C - Consented Cross-Owner Disposable Preview Client/UX Preflight

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARIADNE_CLIENT_UX_PREFLIGHT
```

## Why This Lane Exists

PR514B proved the hosted API route for one private disposable cross-owner
preview:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

Before DAEDALUS wires a customer-facing control, Station needs a human-eye
preflight for where this belongs, what the user should understand, and which
states must be visible.

The risk is not whether the backend can produce a disposable reply. The risk is
that the client flow could make the preview look saved, public, canonical,
retrieval-backed, shareable, or counterparty-visible when it is none of those.

## Known Client Surfaces To Inspect

Use these as starting points, not as a required patch list:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/lib/persona-encounter-contract.ts`
- `apps/web/lib/persona-encounter-readiness.ts`

Current same-owner encounter preview UI already lives in the persona workspace.
PR514C should decide whether cross-owner disposable preview belongs beside that
surface, behind a consent-specific route, or in another narrow existing Studio
surface.

## Required Human Flow

Describe the intended initiating-owner route end to end:

1. The owner can find an approved eligible cross-owner consent.
2. The owner can understand which persona is initiating and which consented
   external persona is responding.
3. The owner can enter bounded setup text and run exactly one disposable
   preview request.
4. The generated response is labeled as private, disposable, model-generated,
   non-canonical, non-public, not saved, not a transcript, not a summary, not
   an excerpt, and not shareable.
5. The UI makes clear that no Memory, Archive, Canon, Continuity, Integrity, or
   private retrieval sources were used.
6. The counterparty does not see the generated words through this flow.
7. The user gets bounded audit/provenance readback without raw owner ids,
   persona ids, prompts, provider payloads, token facts, SQL details, or secret
   shaped strings.
8. Signed-out users and nonparticipants have no usable surface.

## States To Specify

ARIADNE should define the visible copy and interaction states for:

- no eligible cross-owner consent;
- pending, rejected, cancelled, revoked, wrong-scope, wrong-version, wrong-role,
  and wrong-pair consent;
- provider unavailable or config-blocked;
- quota/rate-limit/token failure;
- generation success;
- generation failure after provider attempt;
- runtime-attempt audit rows present;
- cleanup/no active proof rows;
- desktop and mobile.

## Guardrails

- Do not import Discern global CSS or reskin unrelated pages.
- Do not create a broad Studio redesign lane.
- Do not add inert buttons. Controls either work, are disabled with honest
  state, or are absent.
- Do not introduce public exhibit, publication, share, transcript, private
  session, Memory, Canon, Archive, Continuity, Integrity, retrieval, export,
  billing, Redis, Cloudflare, provider config, worker, package, migration, or
  deployment work.
- Do not expose generated words to the counterparty.
- Do not render raw ids, provider payloads, prompt internals, tokens, bearer
  values, SQL details, or secret-shaped strings.

## Deliverables

Return a short preflight result that includes:

- recommended exact implementation lane id and owner;
- target UI route or component surface;
- target client helper/test files;
- exact copy/provenance labels that must appear;
- exact disabled/error/loading/success states;
- human rehearsal route list;
- whether DAEDALUS can implement immediately, or the smallest blocker lane if
  not.

## Expected Next Step

If accepted, wake MIMIR with:

```text
ACCEPT_PR514D_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_WIRING
```

and enough detail for MIMIR to wake DAEDALUS without another planning loop.

If blocked, wake MIMIR with:

```text
BLOCK_PR514C_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_UX_PREFLIGHT
```

and name the concrete blocker plus the smallest numbered unblock lane.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
```
