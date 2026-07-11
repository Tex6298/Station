# PR515C - Cross-Owner Consent Invitation and Inbox UI Hosted Rehearsal Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
PASS_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL
```

## Summary

ARIADNE rehearsed the hosted PR515B owner-only cross-owner consent invitation
and participant inbox UI on Railway staging.

Hosted web and API were ready at commit prefix `1d76eb00a3e9`, matching the
PR515B implementation floor.

Passed:

- signed-out users were redirected away from the private Studio route and had no
  usable consent controls;
- unsafe UUID-shaped public persona input kept the target check disabled and did
  not expose target ids;
- safe public target lookup worked by bare slug and by `/personas/:slug` href;
- target lookup used the public-slug target route and did not read back raw
  target persona ids or owner ids;
- invitation creation used
  `POST /persona-encounters/cross-owner-consents/from-public-persona`, not the
  legacy raw counterparty persona id create path;
- requester pending rows could cancel;
- counterparty pending rows could approve and reject;
- approved rows showed the existing cross-owner disposable preview control while
  same-owner encounter controls remained visually separate;
- revoked, rejected, and cancelled rows showed no cross-owner preview run
  control when inspected;
- desktop and 390px mobile had no horizontal overflow and visible action
  controls;
- public routes `/discover`, `/forums`, `/writing`, `/encounters`, and the
  target public persona route did not surface the private requester proof
  marker, consent rows, generated text, or raw UUID text;
- no private sessions, public exhibits, moderation reports, memory, canon,
  archived chat transcripts, continuity records, export packages, storage usage,
  storage objects, or cross-owner runtime attempts were created;
- cleanup left no active PR515C proof consent rows;
- privacy scan passed.

No provider generation was run. This rehearsal covered invitation, participant
inbox, row actions, inactive-state UI, preview-control separation, mobile fit,
public-route leak checks, and no-drift accounting only.

After the proof, ARIADNE also cleaned earlier PR515C temporary public target
state from failed harness attempts by making the temp public target private and
revoking the remaining active PR515C consent through the participant API. Final
cleanup recheck showed `activeConsentRows 0` and `remainingPublicTargets 0`.

## Proof Output

```text
tooling playwright true pgClient true screenshots .tmp\pr515c-screenshots
health webStatus 200 webReady true webCommitPrefix 1d76eb00a3e9 webIncludesImplementationFloor true apiStatus 200 apiReady true apiCommitPrefix 1d76eb00a3e9 apiIncludesImplementationFloor true
auth ownerSignInStatus 200 ownerTier canon candidateSignIns 2 candidateTiers private,canon
fixtures requesterCreated true requesterPrivate true requesterMarkerPresent true targetSource existing_public_persona targetCreated false targetSlugPresent true targetOwnerDifferent true ready true
signedOut status redirected_to_login crossOwnerSurfaceAbsent true noRunButton true rawIdsSafe true passed true
unsafeSlug checkDisabled true targetAbsent true rawIdsSafe true passed true
targetLookup bareSlugResolved true hrefResolved true targetRequests 2 publicSlugPathOnly true noRawIdReadback true passed true
createCancel invitationMessage true createdConsentListed true createPosts 1 usedPublicSlugCreatePath true noLegacyRawCounterpartyCreate true requesterPendingCancelVisible true cancelledNoPreviewControl true rawIdsSafe true noHorizontalOverflow true passed true
approve consentIdTracked true counterpartyPendingApproveVisible true approvedStatusVisible true approvedPreviewControlVisible true sameOwnerControlVisible true previewControlsSeparated true noGeneratedPreviewText true noHorizontalOverflow true passed true
mobile width 390 labelsPresent true actionVisible true buttonFits true noHorizontalOverflow true rawIdsSafe true passed true
revoke revokeVisible true revokedStatusVisible true revokedNoPreviewControl true noGeneratedPreviewText true noHorizontalOverflow true passed true
reject consentIdTracked true counterpartyPendingRejectVisible true rejectedStatusVisible true rejectedNoPreviewControl true noGeneratedPreviewText true noHorizontalOverflow true passed true
publicRoutes sampleCount 5 routes /discover,/forums,/writing,/encounters,/personas/pr515c-public-target-20260711202936 markerAbsent true consentRowsAbsent true generatedTextAbsent true noUuidText true passed true
noDrift privateSessionsCreated 0 publicExhibitsCreated 0 moderationReportsCreated 0 memoryItemsCreated 0 canonItemsCreated 0 archiveTranscriptsCreated 0 continuityRecordsCreated 0 exportPackagesCreated 0 storageUsageTouched 0 storageObjectsCreated 0 runtimeAttemptsCreated 0 noPersistenceDrift true
cleanup createdProofConsents 3 cancelledRows 1 rejectedRows 1 revokedRows 1 pendingRows 0 approvedRows 0 noActiveProofConsents true
privacy pass true
verdict PASS_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL
```

## Validation

```text
node .tmp\pr515c-hosted-rehearsal.mjs
node .tmp\pr515c-cleanup.mjs
```

Result: pass.

Desktop and 390px mobile screenshots were inspected locally for the approved
eligible row and preview-control separation.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR should close PR515C if accepted, then decide the next bounded lane for the
cross-owner consent surface.
