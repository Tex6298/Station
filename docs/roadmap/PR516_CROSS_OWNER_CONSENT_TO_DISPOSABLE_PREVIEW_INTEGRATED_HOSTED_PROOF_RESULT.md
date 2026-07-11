# PR516 - Cross-Owner Consent-to-Disposable Preview Integrated Hosted Proof Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
PASS_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF
```

## Summary

ARIADNE rehearsed the full hosted customer path from public-slug invitation to
one approved cross-owner disposable preview on Railway staging.

Hosted web and API were ready at commit prefix `1d76eb00a3e9`, matching the
PR515B invitation/inbox implementation floor and including the PR514F preview
panel behavior.

Passed:

- requester created a cross-owner invitation from the Studio UI using a safe
  `/personas/:slug` target href;
- invitation creation posted to
  `POST /persona-encounters/cross-owner-consents/from-public-persona`, not the
  legacy raw counterparty id route;
- the pending requester row had no preview run control;
- the counterparty approved the pending row in the hosted Studio UI;
- requester selected the newly approved row and ran exactly one consent-scoped
  disposable preview request;
- preview request posted to
  `POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview`
  with a setup-only payload and no initiator/responder/requester/counterparty/
  owner id body fields;
- success showed one private disposable reply without recording generated text
  in this result document;
- visible labels included private/disposable, not saved, not public, not
  canonical, not transcript/summary/excerpt/shareable, no Memory/Archive/Canon/
  Continuity/Integrity/private retrieval/transcript sources, counterparty-hidden
  generated reply, and runtime attempt audit recorded;
- same-owner preview and private artifact controls remained visually separate;
- pending, cancelled, rejected, and revoked rows had no cross-owner preview run
  control when inspected;
- public routes `/discover`, `/forums`, `/writing`, `/encounters`, and the
  temporary target persona route did not expose the private setup marker,
  generated reply, consent rows, or raw UUID text;
- no private sessions, public exhibits, moderation reports, memory, canon,
  archived chat transcripts, continuity records, export packages, storage
  usage, or storage objects were created;
- the only expected runtime drift was the bounded two-row runtime attempt audit
  pair already established in PR514B: `blocked_before_provider` and
  `provider_succeeded`, both `ready`;
- cleanup left the proof consent rows inactive and no temporary public target
  remained public;
- final cleanup recheck showed `activeConsentRows 0` and
  `remainingPublicTargets 0`;
- privacy scan passed.

## Proof Output

```text
tooling playwright true pgClient true
health webStatus 200 webReady true webCommitPrefix 1d76eb00a3e9 webIncludesImplementationFloor true apiStatus 200 apiReady true apiCommitPrefix 1d76eb00a3e9 apiIncludesImplementationFloor true
auth ownerSignInStatus 200 ownerTier canon candidateSignIns 2 candidateTiers private,canon
fixtures requesterPersonaPresent true requesterTempCreated false targetCreated true targetSlugPresent true targetOwnerDifferent true proofStart 2026-07-11T20:52:35.705Z ready true
invite invitationMessage true createPosts 1 usedPublicSlugCreatePath true noLegacyCounterpartyId true targetHrefUsed true noHorizontalOverflow true passed true
pending requesterPendingVisible true pendingNoPreviewControl true passed true
approve counterpartyApproved true approvedRowVisible true noHorizontalOverflow true passed true
preview previewRequests 1 consentScopedRoute true setupOnlyPayload true replyVisible true replyLength 26 onePrivateDisposableReply 1 labelsPresent true sameOwnerControlVisible true savePrivateArtifactVisible true previewControlsSeparated true noHorizontalOverflow true passed true
inactive pendingNoPreviewControl true cancelledNoPreviewControl true rejectedNoPreviewControl true revokedNoPreviewControl true passed true
publicRoutes sampleCount 5 routes /discover,/forums,/writing,/encounters,/personas/pr516-public-target-20260711205222 markerAbsent true generatedReplyAbsent true consentRowsAbsent true noUuidText true passed true
noDrift privateSessionsCreated 0 publicExhibitsCreated 0 moderationReportsCreated 0 memoryItemsCreated 0 canonItemsCreated 0 archiveTranscriptsCreated 0 continuityRecordsCreated 0 exportPackagesCreated 0 storageUsageTouched 0 storageObjectsCreated 0 runtimeAttemptsForConsent 2 runtimeLifecycle blocked_before_provider,provider_succeeded runtimeReadiness ready,ready runtimeActorRoles requester,requester expectedRuntimeAttemptsOnly true
cleanup trackedProofConsents 3 revokedRows 1 rejectedRows 1 cancelledRows 1 pendingRows 0 approvedRows 0 noActiveProofConsents true tempPublicTargetsRemaining 0
privacy pass true
verdict PASS_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF
```

Final cleanup recheck:

```text
actionedRows 0 privatizedPublicTargets 0 activeConsentRows 0 remainingPublicTargets 0 statuses cancelled:3,rejected:3,revoked:3
```

## Validation

```text
node .tmp\pr516-hosted-proof.mjs
node .tmp\pr516-cleanup.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR should close PR516 if accepted and decide whether the cross-owner consent
surface needs another hosted proof or can move to the next bounded lane.
