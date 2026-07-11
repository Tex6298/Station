# PR514E - Cross-Owner Disposable Preview Studio Panel

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_DAEDALUS_IMPLEMENTATION
```

## Goal

Add a narrow owner-only Studio UI for the accepted cross-owner disposable
preview contract.

The panel should let a signed-in participant owner:

- load their cross-owner consent ledger;
- see bounded display snapshots and consent state;
- choose an approved eligible consent;
- enter actor-authored setup text;
- run one private disposable preview through the consent-scoped helper;
- read the generated response with explicit private/disposable/not-saved/
  not-public/not-canonical/no-retrieval/counterparty-hidden/audit labels.

## Placement

Use the existing Studio persona workspace without broad redesign.

Expected starting files:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`

Preferred shape:

- add a dedicated `CrossOwnerDisposablePreviewPanel` or similarly narrow
  component;
- place it near the encounter contract/readiness area;
- keep it visually separate from the same-owner saved private artifact and
  public exhibit controls;
- label it as account-level participant consent if the current client readback
  cannot safely prove the current persona page is the exact participant persona;
- do not filter by raw persona id in the browser.

## Data Contract

Use only participant-safe routes and helpers:

- `GET /persona-encounters/cross-owner-consents`
- `POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview`
- `personaEncounterCrossOwnerDisposablePreviewPath`
- `personaEncounterCrossOwnerDisposablePreviewPayload`
- `personaEncounterCrossOwnerDisposablePreviewReady`
- `personaEncounterCrossOwnerDisposablePreviewReadback`
- `personaEncounterCrossOwnerDisposablePreviewErrorCopy`

The browser must not send or infer raw requester/counterparty persona ids.

Consent list display may use only:

- consent id as an opaque route identifier;
- status;
- participant role;
- requested scopes and scope version;
- requester/counterparty persona display names;
- bounded provenance/timestamps/audit labels.

## Required States

Implement visible states for:

- signed-out/no token: no usable surface;
- loading consent ledger;
- consent ledger load failure with bounded copy;
- no cross-owner consents;
- no approved eligible consent;
- pending, rejected, cancelled, revoked, expired/superseded/blocked/moderation
  locked states with no run button;
- wrong scope or wrong scope version with no run button;
- approved eligible consent with setup input and run button;
- setup missing/blank;
- generating;
- provider unavailable or config-blocked;
- quota/rate-limit failure;
- audit failure;
- provider failed or empty reply;
- successful private disposable response;
- desktop and mobile.

## Required Labels

The UI must show or preserve these meanings:

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
- "Counterparty will not see a generated reply here" before generation;
- "Counterparty does not see this generated reply here" after success;
- "Runtime attempt audit required" before generation;
- "Runtime attempt audit recorded" after success.

## Guardrails

- Do not add saved cross-owner private sessions.
- Do not add public cross-owner exhibits.
- Do not add generated-word excerpts, transcripts, summaries, share links,
  publication, or counterparty generated-word readback.
- Do not add Memory, Canon, Archive, Continuity, Integrity, retrieval, export,
  storage, billing, Redis, Cloudflare, workers, migrations, provider config,
  broad Studio redesign, public routes, or deployment work.
- Do not add inert buttons. Controls must work, be honestly disabled, or be
  absent.
- Do not leak raw owner ids, raw persona ids, prompt internals, provider
  payloads, token facts, bearer values, SQL details, env values, or
  secret-shaped strings.

## Focused Test Expectations

Add or update tests to prove:

- consent ledger fetch path is used only with auth token;
- run payload contains setup/options only, never participant persona ids;
- no approved consent renders a quiet empty state and no run button;
- pending/ineligible consents render state copy and no run button;
- approved eligible consent can run through the consent-scoped helper;
- successful response renders exactly one private disposable reply and required
  labels;
- pre-run fallback says audit required and future-tense counterparty boundary;
- success readback says audit recorded and generated-reply counterparty
  boundary;
- error states use bounded copy;
- same-owner saved private artifact and public exhibit controls remain separate;
- no public route or saved-session path is called by the cross-owner panel.

## Validation

Run the focused gates needed for the touched files. Expected minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If API route behavior changes unexpectedly, also run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
```

## Handoff

When implementation is ready, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should review the visible UI boundary and no-leak/no-persistence
behavior. If accepted, ARGUS should send ARIADNE a human-eye rehearsal lane for
desktop/mobile hosted/client flow.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
