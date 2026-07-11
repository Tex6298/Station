# PR515C - Cross-Owner Consent Invitation and Inbox UI Hosted Rehearsal Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL_ACCEPTED
```

## Decision

PR515C is accepted and closed. ARIADNE passed hosted browser rehearsal for the
owner-only cross-owner consent invitation and inbox UI.

## Proved

- hosted web/API included the PR515B implementation floor at commit prefix
  `1d76eb00a3e9`;
- signed-out users had no usable consent controls;
- unsafe UUID-shaped public persona input stayed blocked;
- safe public target lookup worked by bare slug and `/personas/:slug` href;
- target lookup did not read back raw target persona ids or owner ids;
- invitation creation used the public-slug create path, not the legacy raw-id
  create path;
- requester cancel, counterparty approve, counterparty reject, and approved-row
  revoke all passed in the hosted browser;
- approved eligible rows showed the cross-owner disposable preview control
  while same-owner encounter controls stayed visually separate;
- revoked, rejected, and cancelled rows showed no cross-owner preview run
  control;
- desktop and 390px mobile had no horizontal overflow and visible action
  controls;
- public routes did not surface the private requester proof marker, consent
  rows, generated text, or raw UUID text;
- no private sessions, public exhibits, moderation reports, memory, canon,
  archived chat transcripts, continuity records, export packages, storage
  usage, storage objects, or cross-owner runtime attempts were created;
- cleanup left no active PR515C proof consent rows and no remaining PR515C
  public targets.

## Remaining Integrated Proof

PR515C deliberately did not run provider generation. The next bounded proof is
the full consent-to-disposable-preview customer path:

1. requester creates invitation by public slug/href;
2. counterparty approves;
3. requester runs exactly one consent-scoped disposable preview from the newly
   approved row;
4. generated text remains private/disposable/not-saved/not-public and cleanup
   removes proof consent state.

## Next Lane

```text
PR516 - Cross-Owner Consent-to-Disposable Preview Integrated Hosted Proof
Owner: ARIADNE / A4
```
