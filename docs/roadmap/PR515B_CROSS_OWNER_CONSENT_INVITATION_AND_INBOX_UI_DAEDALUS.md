# PR515B - Cross-Owner Consent Invitation and Inbox UI

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_DAEDALUS_IMPLEMENTATION
```

## Goal

Make the cross-owner consent ledger usable from the web UI without expanding
runtime behavior.

This lane should add the first visible owner-only invitation and participant
inbox/actions surface using the PR515A safe public-slug contract and the
existing participant-scoped consent routes.

## Source

Accepted contract:

`docs/roadmap/PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_REVIEW_RESULT.md`

Closeout:

`docs/roadmap/PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_CLOSEOUT.md`

## Required Scope

Implement a narrow owner-only UI surface, preferably near the existing Studio
cross-owner disposable preview panel or a small dedicated Studio consent panel.

The UI should support:

- entering or pasting a safe public persona slug or `/personas/:slug` href;
- loading public-safe target readback through
  `GET /persona-encounters/cross-owner-consent-targets/:publicSlug`;
- creating an invitation through
  `POST /persona-encounters/cross-owner-consents/from-public-persona`;
- listing participant-visible consent rows from
  `GET /persona-encounters/cross-owner-consents`;
- showing role, status, scope/version, requester/counterparty display
  snapshots, provenance labels, timestamps, and bounded state copy;
- approving, rejecting, cancelling, and revoking already-visible rows through
  the existing participant-scoped action routes;
- refreshing the ledger after successful create/action;
- keeping the existing cross-owner disposable preview run panel available only
  for approved eligible consent rows.

If web helper action-path functions are missing, add them in
`apps/web/lib/persona-encounter-runtime.ts` rather than hardcoding paths inside
the component.

## Required Copy

Visible copy must make the consent boundary plain:

- "Consent ledger only";
- "Not a saved session";
- "Not public";
- "Does not share generated words";
- "No transcript, summary, excerpt, share link, or publication";
- "No Memory, Archive, Canon, Continuity, Integrity, or private retrieval";
- "Approval can be revoked";
- "Counterparty sees consent state and audit metadata, not generated preview
  text here."

## Safety Boundaries

Do not use the legacy raw-id browser-facing create route:

```text
POST /persona-encounters/cross-owner-consents
```

Do not expose or submit:

- raw counterparty persona ids;
- raw owner ids;
- `owner_user_id`;
- private persona profile fields;
- provider payloads or token facts;
- prompts, setup text, generated preview text, transcripts, summaries,
  excerpts, SQL details, bearer values, env values, or secret-shaped strings.

Do not add:

- generated-word preview execution;
- saved cross-owner sessions;
- public cross-owner exhibits;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, public
  surfacing, partner adapters, webhooks, hosted-runtime scope, broad Studio
  redesign, or deployment work.

## Expected Files

Likely files:

- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`

Touch API files only if the UI reveals a concrete missing readback/action
contract; otherwise keep PR515B web-only.

## Validation

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Run `test:persona-encounters` too if API route behavior changes or if helper
changes need the API contract rechecked.

## Review Handoff

Wake ARGUS when implementation is ready.

Expected wakeup:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS implemented PR515B, the owner-only cross-owner consent invitation and inbox UI.
- The UI uses PR515A public-slug target/create helpers and existing participant-scoped list/action routes.
- No legacy raw-id browser-facing create route, generated preview execution, saved sessions, public exhibits, or private/public drift was added.

Task:
- Hostile-review PR515B.
- Verify invitation creation, participant inbox, approve/reject/cancel/revoke controls, bounded copy, no raw id exposure, and no runtime/persistence/public drift.
- Wake MIMIR with ACCEPT_PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI or required fixes.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS accepted PR515A, so the safe public-slug counterparty selection/create contract is ready.
- MIMIR closed PR515A and opened PR515B for the visible owner-only consent invitation and inbox UI.
- Keep the lane ledger-only; do not expand runtime or saved/public artifact behavior.

Task:
- Implement PR515B: owner-only cross-owner consent invitation and inbox/actions UI.
- Use the PR515A target/create contract, not the legacy raw-id create route.
- Add or reuse web helpers for target lookup, invitation create, list/detail/action paths, state copy, and bounded errors.
- Show safe target readback, create invitation, participant consent rows, and approve/reject/cancel/revoke controls with the required ledger-only copy.
- Add focused web tests proving no raw counterparty persona ids or owner ids enter visible UI payload/readback and no generated/saved/public/retrieval surfaces are implied.
- Run test:studio-ui, typecheck, git diff --check, and test:persona-encounters if API behavior changes.
- Wake ARGUS with the implementation result.
```
