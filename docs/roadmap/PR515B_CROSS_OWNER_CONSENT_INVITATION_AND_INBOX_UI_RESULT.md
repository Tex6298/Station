# PR515B - Cross-Owner Consent Invitation and Inbox UI Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-11

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the owner-only cross-owner consent invitation and
participant inbox/actions UI on top of the accepted PR515A contract.

The visible UI uses the public-slug target/create path for invitation creation
and the existing participant-scoped consent list/action routes for ledger
readback, approve, reject, cancel, and revoke controls.

## Implementation

Updated the existing Studio cross-owner panel in:

- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`

The panel now supports:

- entering a public persona slug or `/personas/:slug` href;
- loading public-safe target readback through
  `GET /persona-encounters/cross-owner-consent-targets/:publicSlug`;
- creating invitations through
  `POST /persona-encounters/cross-owner-consents/from-public-persona`;
- listing participant-visible consent rows through
  `GET /persona-encounters/cross-owner-consents`;
- showing requester/counterparty display snapshots, status, role, scope labels,
  scope version, timestamps, provenance, recent audit metadata, and bounded
  state copy;
- approving, rejecting, cancelling, and revoking participant-visible rows
  through the existing action routes;
- refreshing the ledger after create and action success;
- keeping the existing disposable preview controls visible only for approved
  eligible consent rows.

Updated helper coverage in:

- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`

New helper coverage includes:

- consent detail path builder;
- approve/reject/cancel/revoke action path builder;
- bounded reason-code payload helper;
- ledger boundary readback copy;
- participant-role/status action availability;
- bounded action error copy;
- source guard proving the Studio panel uses public-slug invitation helpers and
  participant-scoped action helpers.

## Boundary

The visible copy includes:

- `Consent ledger only`;
- `Not a saved session`;
- `Not public`;
- `Does not share generated words`;
- `No transcript, summary, excerpt, share link, or publication`;
- `No Memory, Archive, Canon, Continuity, Integrity, or private retrieval`;
- `Approval can be revoked`;
- `Counterparty sees consent state and audit metadata, not generated preview
  text here.`

The panel does not post to the legacy raw-id browser-facing create route:

```text
POST /persona-encounters/cross-owner-consents
```

The source guard rejects raw counterparty persona ids, raw owner ids,
`owner_user_id`, raw DB owner fields, same-owner preview payload ids, private
session/public exhibit helpers, and direct `/persona-encounters/preview` calls
from the cross-owner panel source.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

`test:persona-encounters` was not rerun because PR515B did not change API route
behavior.

## Non-Scope Preserved

No API route behavior changed.

No generated-word preview execution expansion, saved cross-owner sessions,
public cross-owner exhibits, generated-word sharing, retrieval, Memory, Canon,
Archive, Continuity, Integrity, export, storage, billing, Redis, Cloudflare,
workers, migrations, provider config, public surfacing, partner adapters,
webhooks, hosted-runtime scope, broad Studio redesign, or deployment work was
added.

## Handoff

ARGUS should hostile-review PR515B against:

- use of PR515A public-slug target/create helpers;
- no legacy raw-id create path for browser invitation creation;
- participant-scoped list/action routes only;
- required ledger-only copy;
- approve/reject/cancel/revoke availability by role/status;
- no raw counterparty persona id or owner id visible payload/readback;
- preview controls still visible only for approved eligible consent rows;
- no saved/public/generated/retrieval/runtime expansion beyond the accepted
  disposable preview panel.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
