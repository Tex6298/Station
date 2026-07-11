# PR514E - Cross-Owner Disposable Preview Studio Panel ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Reviewed implementation:

- `docs/roadmap/PR514E_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_DAEDALUS.md`
- `docs/roadmap/PR514E_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_RESULT.md`
- `docs/roadmap/PR514D_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_REVIEW_RESULT.md`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`

Result:

```text
ACCEPT_PR514E_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL
```

## Verdict

ARGUS accepts PR514E without a review patch.

DAEDALUS added a narrow owner-only Studio panel using the accepted
consent-scoped PR514D contract. The panel is account-level participant consent,
not proof that the current persona tab is itself the cross-owner participant
persona.

## Boundary Findings

Accepted:

- the panel fetches `GET /persona-encounters/cross-owner-consents` only when an
  auth token exists;
- the panel displays only participant-safe consent facts: opaque consent id,
  status, participant role, scope labels, scope version, display snapshots,
  timestamps/provenance, and bounded state copy;
- approved eligible consent rows post through
  `personaEncounterCrossOwnerDisposablePreviewPath(selectedConsent.id)`;
- run payloads are built only with
  `personaEncounterCrossOwnerDisposablePreviewPayload({ setup })`;
- source-level tests prove the panel does not send requester, counterparty,
  initiator, responder, owner, or raw persona id fields;
- pending, rejected, cancelled, revoked, expired, superseded,
  blocked-by-deletion, moderation-locked, wrong-scope, and wrong-version states
  have no run button;
- setup missing/blank disables generation;
- pre-run readback uses future/required labels for counterparty visibility and
  runtime attempt audit;
- success readback uses generated-reply-hidden and audit-recorded labels;
- successful output is shown as one private disposable reply;
- bounded error copy is used for provider unavailable, quota/rate, wrong state,
  audit failure, provider failure, empty reply, and generic failures;
- same-owner saved private artifact and public exhibit controls remain separate;
- source-level tests prove the cross-owner panel does not call same-owner
  preview, private-session, public-exhibit, or public encounter routes.

Still blocked:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word sharing, excerpts, transcripts, summaries, share links,
  publication, and counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, public
  routes, deployment, broad Studio redesign, partner adapters, and webhook
  scope.

## Next Routing

ARGUS recommends MIMIR close PR514E locally and route:

```text
PR514F - Cross-Owner Disposable Preview Studio Panel Hosted Rehearsal
Owner: ARIADNE / A4
```

Hosted rehearsal scope:

- private persona Studio page loads without exposing raw owner ids or raw
  participant persona ids;
- signed-out state has no usable cross-owner preview surface;
- owner with no cross-owner consent sees a quiet empty state and no run button;
- pending/ineligible consent states show bounded state copy and no run button;
- approved eligible consent can run through the consent-scoped helper with a
  setup-only payload;
- provider unavailable/config-blocked, quota/rate, audit failure, provider
  failed, and empty reply states show bounded copy if safely forceable;
- success shows exactly one private disposable response and all required
  private/disposable/not-saved/not-public/not-canonical/no-retrieval/
  counterparty-hidden/audit-recorded labels;
- same-owner saved private artifact and public exhibit controls remain visually
  separate;
- desktop and 390px mobile show no horizontal overflow or label overlap;
- public routes `/discover`, `/forums`, `/writing`, and `/encounters` do not
  surface proof markers or generated cross-owner text.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Implementation review | Pass | Reviewed PR514E handoff/result, PR514D contract floor, panel source, page placement, helper additions, focused tests, and no-scope docs. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 207 tests passed, including consent eligibility/state copy, account-level Studio panel source wiring, auth-token ledger fetch, setup-only run payload, required labels, bounded errors, and separation from saved artifacts/public exhibits. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Not run | PR514E changed no API route behavior. |
| Staged path scan | Pass | Staged review changes are limited to PR514E review/status/testing docs. |
| Forbidden-path scan | Pass | No API route, package/lockfile, provider service, token service, operational cache, Supabase migration, Railway, Cloudflare, worker, queue, billing, Stripe, storage, public route, or deploy-script paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the staged diff. |
| `git diff --check` | Pass | No unstaged whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
