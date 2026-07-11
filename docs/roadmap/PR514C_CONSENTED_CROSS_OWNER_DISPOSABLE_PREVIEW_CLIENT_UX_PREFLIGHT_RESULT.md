# PR514C - Consented Cross-Owner Disposable Preview Client/UX Preflight Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
BLOCK_PR514C_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_UX_PREFLIGHT
```

## Decision

Do not send DAEDALUS directly to customer-facing client wiring yet.

The hosted API route is proven, but the current web client cannot safely
construct its request without a small participant-safe client contract unblock.

Concrete blocker:

```text
CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_MISSING
```

The route requires both `initiatorPersonaId` and `responderPersonaId`:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

Existing participant consent readback intentionally does not expose raw persona
ids. The persona workspace knows the current owner's persona id, but it does
not have a safe client field for the counterparty persona id, and there is no
web helper or UI surface for cross-owner consents. Rendering raw participant
persona ids to solve this would weaken the privacy boundary PR512 through
PR514B protected.

## Evidence

Files inspected:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/lib/persona-encounter-contract.ts`
- `apps/web/lib/persona-encounter-readiness.ts`
- `apps/api/src/routes/persona-encounters.ts`
- `docs/roadmap/PR514A_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_ROUTE_REVIEW_RESULT.md`
- `docs/roadmap/PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROOF_RESULT.md`
- `docs/roadmap/PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROOF_CLOSEOUT.md`

Findings:

- same-owner encounter preview is already visible in the persona workspace as
  "One disposable responder reply";
- the same-owner panel is adjacent to saved private artifacts and public
  metadata controls, so a cross-owner preview must stay visually separate from
  save/publication affordances;
- `apps/web/lib/persona-encounter-runtime.ts` has same-owner helper types,
  paths, labels, and bounded error copy, but no cross-owner consent or
  disposable-preview helper;
- `apps/web` has no existing `cross-owner-consents`, runtime-attempts,
  runtime-context-contract, or disposable-preview client surface;
- `serializeCrossOwnerConsent` exposes participant display snapshots, status,
  scopes, audit metadata, and executable:false ledger facts, but not raw
  participant persona ids;
- the hosted preview response includes strong labels for private, disposable,
  non-canonical, non-public, not saved, not transcript/summary/excerpt, not
  shareable, and no source retrieval;
- `persona-encounter-contract.ts` still says cross-owner encounters remain
  blocked, which is now stale for the single hosted-proven disposable preview
  case and should be tightened in the unblock lane.

## Smallest Unblock Lane

Recommended lane:

```text
PR514D - Cross-Owner Disposable Preview Client Contract
Owner: DAEDALUS / A2
```

Goal:

Give the web client a participant-safe way to discover and run an approved
eligible cross-owner disposable preview without exposing raw owner ids, raw
persona ids, provider payloads, prompt internals, token facts, SQL details, or
secret-shaped values.

Required scope:

- add or adjust API/client contract so the actor can run a consent-scoped
  disposable preview without the browser needing the counterparty persona id;
- keep server-side inference tied to the authenticated participant, approved
  consent, scope version `1`, `run_cross_owner_encounter`, and actor-initiates
  role rule;
- provide a bounded readiness/readback shape for the client using display
  snapshots and readiness codes only;
- add web helper types and tests for the client-safe contract;
- update stale owner-only contract copy so it says cross-owner runtime is
  limited to this approved disposable-preview case, not generally enabled;
- do not add the visible customer-facing UI yet unless MIMIR explicitly folds
  it into the same lane after ARGUS accepts the client contract.

Out of scope for PR514D:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, share links, publication, or
  counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations unrelated to the contract,
  provider config, broad Studio redesign, or public surfacing.

## Future UI Recommendation

After PR514D unblocks the client contract, the visible wiring should be a
separate owner-only Studio panel, not an extra button inside the saved-artifact
block.

Preferred surface:

- target route: `apps/web/app/studio/personas/[personaId]/page.tsx`;
- target component: a new cross-owner disposable preview panel in
  `apps/web/components/studio/persona-workspace.tsx`;
- target helpers/tests: a new or extended helper in
  `apps/web/lib/persona-encounter-runtime.ts` plus
  `apps/web/lib/persona-encounter-runtime.test.ts`;
- placement: near the encounter contract/readiness area, separated from
  same-owner saved private artifacts and public exhibit controls.

Visible labels that must appear:

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
- "No Memory, Archive, Canon, Continuity, Integrity, private retrieval, or
  transcript sources used";
- "Counterparty does not see this generated reply here";
- "Runtime attempt audit recorded".

Required states:

- signed out: no usable surface;
- no eligible approved consent: show an empty state, not a disabled teaser;
- pending, rejected, cancelled, revoked: show consent-state copy and no run
  button;
- wrong scope or wrong version: show contract mismatch copy and no run button;
- wrong role or wrong pair: show actor-must-initiate copy and no run button;
- loading readiness: "Checking cross-owner consent readiness.";
- provider unavailable/config-blocked: "Preview is paused because Station
  provider setup is unavailable.";
- quota or rate limit failure: show bounded budget/rate copy;
- provider failed or empty reply: show bounded retry copy without provider
  payload details;
- success: show exactly one private disposable response with the labels above;
- audit rows present: show metadata-only audit lifecycle labels, not token facts
  or generated words for the counterparty.

Human rehearsal path after visible UI exists:

- owner with no eligible cross-owner consent;
- owner with pending consent;
- owner with approved eligible consent and provider success;
- owner with provider unavailable/config-blocked;
- owner with quota/rate failure if safely forceable;
- signed-out user;
- nonparticipant direct route attempt;
- desktop and 390px mobile;
- public routes `/discover`, `/forums`, `/writing`, and `/encounters` checked
  for no leaked generated words or proof markers.

## Validation

```text
rg -n "cross-owner-consents|CrossOwner|crossOwner|runtime-context-contract|runtime-attempts|disposable-preview" apps\web
rg -n "consentId: result\.row\.id|id: row\.id|requester_persona_id|counterparty_persona_id|participants:|disposable-preview" apps\api\src\routes\persona-encounters.ts
```

`pnpm typecheck` was not run because PR514C is a docs-only UX preflight and does
not touch imports or scripts.

## Next

MIMIR should route PR514D as the client-contract unblock, then send the accepted
contract to ARGUS before ARIADNE rehearses any visible UI.
