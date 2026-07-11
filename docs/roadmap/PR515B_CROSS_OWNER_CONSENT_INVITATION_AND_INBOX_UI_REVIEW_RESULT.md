# PR515B - Cross-Owner Consent Invitation and Inbox UI ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Reviewed implementation:

- `docs/roadmap/PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_DAEDALUS.md`
- `docs/roadmap/PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_RESULT.md`
- `docs/roadmap/PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_REVIEW_RESULT.md`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `docs/testing/VALIDATION_BASELINE.md`

Result:

```text
ACCEPT_PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI
```

## Verdict

ARGUS accepts PR515B without a review patch.

DAEDALUS added a narrow owner-only Studio UI for cross-owner consent invitation,
participant inbox readback, and approve/reject/cancel/revoke actions. The UI
uses the PR515A public-slug target/create contract and existing
participant-scoped ledger/action routes. It does not use the legacy raw-id
create route from browser-facing invitation UI.

## Boundary Findings

Accepted:

- the panel remains behind the owner-only Studio persona gate;
- invitation target lookup accepts a safe public persona slug or
  `/personas/:slug` href and calls
  `personaEncounterCrossOwnerConsentTargetPath(targetInput)`;
- target lookup fetches only
  `GET /persona-encounters/cross-owner-consent-targets/:publicSlug`;
- invitation creation posts only to
  `/persona-encounters/cross-owner-consents/from-public-persona`;
- invitation create payload uses `requesterPersonaId: persona.id` for the
  current owner persona and `counterpartyPublicSlug: target.publicSlug`;
- the panel source guard proves it does not post to the legacy raw-id
  `POST /persona-encounters/cross-owner-consents` route;
- participant rows load from `GET /persona-encounters/cross-owner-consents`;
- approve, reject, cancel, and revoke use consent id plus the accepted
  participant-scoped action routes;
- available actions are role/status-derived: counterparty can approve/reject
  pending, requester can cancel pending, either participant can revoke approved;
- action reason-code payloads are bounded to accepted enum values and drop
  untrusted text;
- visible row readback shows display snapshots, status, participant role, scope
  labels, scope version, timestamps, provenance, recent audit event metadata,
  and bounded state copy;
- required visible ledger copy is present: consent ledger only, not saved, not
  public, no generated-word sharing, no transcript/summary/excerpt/share
  link/publication, no Memory/Archive/Canon/Continuity/Integrity/private
  retrieval, approval revocable, and counterparty sees consent/audit metadata
  rather than generated preview text;
- existing cross-owner disposable preview controls still render only for
  approved eligible consent rows and still use consent-scoped setup-only
  preview helpers;
- same-owner saved private artifact and public exhibit controls remain in their
  existing separate panel flow.

Still blocked:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word sharing, excerpts, transcripts, summaries, share links,
  publication, and counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, public
  surfacing, partner adapters, webhooks, hosted-runtime scope, and broad Studio
  redesign.

## Next Routing

Because PR515B changes visible owner UI, ARGUS recommends MIMIR route a hosted
browser rehearsal before closing the visible consent surface:

```text
PR515C - Cross-Owner Consent Invitation and Inbox UI Hosted Rehearsal
Owner: ARIADNE / A4
```

Suggested hosted rehearsal scope:

- signed-out user sees no usable consent controls;
- owner can load a safe public target by slug/href without raw id readback;
- unsafe or UUID-shaped slug is blocked with bounded copy;
- owner can create an invitation through the public-slug path and see the row;
- requester pending row can cancel;
- counterparty pending row can approve and reject;
- approved row can revoke;
- approved eligible row keeps the existing disposable preview control separate;
- pending/rejected/cancelled/revoked rows have no preview run control;
- desktop and 390px mobile have no horizontal overflow or action overlap;
- public routes do not surface consent rows, proof markers, or generated text;
- no saved session, public exhibit, retrieval, storage, billing, provider,
  worker, queue, migration, or public-surfacing drift appears.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile implementation review | Pass | Reviewed PR515B handoff/result, PR515A accepted contract, owner page gate, Studio panel source, helper additions, focused tests, and validation docs. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 212 tests passed, including public-slug invitation helpers, action path/payload helpers, role/status action availability, bounded errors, required ledger copy, and the Studio source guard. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 67 tests passed; ARGUS reran the API/web contract suite even though PR515B changed no API route behavior. |
| `git diff --check` | Pass | No whitespace errors. |
| Implementation path scan | Pass | PR515B touched web UI/helper/tests/status docs and agent state only; no API route, package/lockfile, infra, migration, billing, queue, worker, storage, Cloudflare, Railway, Stripe, or deployment paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, JWT-shaped, provider-key env, Railway token, or private-key block values found in the implementation diff. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
