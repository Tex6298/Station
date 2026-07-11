# PR514E - Cross-Owner Disposable Preview Studio Panel Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-11

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS added a narrow owner-only Studio panel for the accepted
cross-owner disposable preview contract.

The panel is visible from the private persona Studio workspace, but it is
explicitly account-level participant consent. It does not treat the current
persona page as proof of the participant persona and does not browser-filter by
raw persona ids.

## Implementation

Added `CrossOwnerDisposablePreviewPanel` in:

- `apps/web/components/studio/persona-workspace.tsx`

Rendered it from:

- `apps/web/app/studio/personas/[personaId]/page.tsx`

The panel:

- loads the participant-safe consent ledger through
  `GET /persona-encounters/cross-owner-consents`;
- uses only consent display snapshots, status, participant role, requested
  scopes, scope version, timestamps/provenance labels, and bounded state copy;
- selects approved eligible consent rows without inspecting requester or
  counterparty persona ids in the browser;
- posts through
  `personaEncounterCrossOwnerDisposablePreviewPath(selectedConsent.id)`;
- sends only `personaEncounterCrossOwnerDisposablePreviewPayload({ setup })`;
- shows pre-run private/disposable/not-saved/not-public/not-canonical/
  no-retrieval/counterparty-future/audit-required labels;
- shows successful generated responder reply with
  counterparty-hidden/audit-recorded readback labels;
- uses bounded error copy for provider unavailable, quota/rate, wrong state,
  audit failure, provider failure, empty reply, and generic failure.

Added helper types/state logic in:

- `apps/web/lib/persona-encounter-runtime.ts`

New helper coverage includes:

- `PersonaEncounterCrossOwnerConsentListResponse`;
- participant-safe consent row typing;
- consent display labels;
- approved/scope/version eligibility;
- bounded copy for pending, rejected, cancelled, revoked, expired, superseded,
  blocked-by-deletion, moderation-locked, wrong-scope, and wrong-version states.

## Boundary

The cross-owner panel is separate from same-owner private saved artifacts and
public exhibit controls.

It does not call:

- `POST /persona-encounters/preview`;
- private-session create/list/delete routes;
- private curation routes;
- public exhibit publish/retract/report routes;
- public `/encounters` routes.

It does not send or render raw owner ids, raw requester/counterparty persona
ids, prompt internals, provider payloads, token facts, bearer values, SQL
details, env values, or secret-shaped strings.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
```

`test:persona-encounters` was not rerun because no API route behavior changed in
PR514E.

## Non-Scope Preserved

No saved cross-owner private sessions, public cross-owner exhibits,
generated-word sharing, retrieval, Memory, Canon, Archive, Continuity,
Integrity, billing, Redis, Cloudflare, provider config, broad redesign, public
routes, migrations, workers, storage, or deployment work was added.

## Handoff

ARGUS should review the visible UI boundary and source-level no-leak/no-
persistence proof before ARIADNE rehearses the hosted desktop/mobile flow.

Review focus:

- the ledger fetch requires `token`;
- the run payload is setup/options only;
- the panel never sends or infers raw participant persona ids;
- no same-owner saved artifact or public exhibit path is called by the
  cross-owner panel;
- all required private/disposable/not-saved/not-public/not-canonical/
  no-retrieval/counterparty-hidden/audit labels are visible in the right state;
- ineligible/pending/rejected/cancelled/revoked/expired/superseded/blocked/
  moderation-locked/wrong-scope/wrong-version states have no run button.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
