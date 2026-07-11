# PR514B - Consented Cross-Owner Disposable Preview Hosted Proof Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
PASS_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROOF
```

## Summary

ARIADNE completed the hosted proof for the PR514A cross-owner disposable
preview route:

```text
POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview
```

Hosted web and API were ready at commit prefix `02e706eb8e3e`, which includes
the PR514A implementation floor `02e706eb`. The docs-only ARGUS review floor
`bac411b7` was not in the deployment identity, but runtime freshness was proven
by the hosted route behavior, provider-backed success path, audit rows, token
accounting, and no-drift checks.

The hosted proof passed:

- signed-out access returned `401`;
- nonparticipant access returned `404` without row inference;
- wrong role, wrong pair, pending consent, wrong scope, and wrong scope version
  all failed closed before token write;
- approved eligible consent reached the hosted platform-provider path;
- the successful response returned one private disposable responder reply to the
  initiating actor;
- runtime attempt rows recorded `blocked_before_provider` and
  `provider_succeeded`;
- token accounting created exactly one actor-owned transaction with
  `chatId: null` and no counterparty token transaction;
- generic consent readback stayed `executable: false`;
- public samples did not expose the proof consent, attempt, marker, or
  disposable-preview internals;
- no private session, public exhibit, moderation report, memory, canon, archive,
  continuity, export, storage, background job, or public-surfacing drift
  appeared;
- cleanup left no pending or approved proof consent;
- privacy scan passed.

## Proof Output

```text
tooling pgClient true
health webStatus 200 webReady true webCommitPrefix 02e706eb8e3e webIncludesImplementationFloor true webIncludesReviewFloor false webService @station/web apiStatus 200 apiReady true apiCommitPrefix 02e706eb8e3e apiIncludesImplementationFloor true apiIncludesReviewFloor false apiService @station/api
auth ownerSignInStatus 200 ownerMeStatus 200 ownerTier canon candidateSignIns 5 ownerBSignInStatus 200 ownerBMeStatus 200 ownerBTier private nonParticipantSignInStatus 200 nonParticipantMeStatus 200 nonParticipantTier canon
fixtures ownerAPersonaPresent true ownerASecondPersonaPresent true ownerASecondPersonaCreateStatus undefined ownerBPersonaPresent true ownerBPersonaCreated false ownerBPersonaReused true ownerBPersonaCreateStatus null nonParticipantReady true ready true
boundaries signedOutStatus 401 nonParticipantStatus 404 wrongRoleStatus 409 wrongRoleCode wrong_role wrongPairStatus 409 wrongPairCode wrong_pair pendingCreateStatus 201 pendingStatus 409 pendingCode pending wrongScopeStatus 409 wrongScopeCode wrong_scope wrongVersionStatus 409 wrongVersionCode wrong_version tokenTransactionsBeforeEligible 0 responsesSafe true passed true
eligible status 200 code null success true providerConfigBlocked false classification undefined attemptCount 2 attemptLifecycles blocked_before_provider,provider_succeeded replyPresent true replyPrivate true provenanceSafe true responseSafe true actorTokenTransactions 1 counterpartyTokenTransactions 0 chatNullTokenTransactions 1 blockerEvidencePassed undefined passed true
genericReadback status 200 ledgerExecutableFalse true scopesExecutableFalse true rawIdSafe true passed true
noDrift privateSessionsCreated 0 publicExhibitsCreated 0 moderationReportsCreated 0 tokenTransactionsCreated 1 actorTokenTransactionsCreated 1 counterpartyTokenTransactionsCreated 0 chatNullTokenTransactionsCreated 1 tokenUsageTouched 1 memoryItemsCreated 0 canonItemsCreated 0 archiveTranscriptsCreated 0 continuityRecordsCreated 0 exportPackagesCreated 0 storageUsageTouched 0 storageObjectsCreated 0 backgroundJobsCreated not_present noForbiddenSideEffects true publicSampleCount 10 publicNoDrift true
cleanup createdProofConsents 5 revokedRows 4 cancelledRows 1 rejectedRows 0 pendingRows 0 approvedRows 0 noActiveProofConsents true
privacy pass true
verdict PASS_PR514B_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_HOSTED_PROOF
```

## Validation

```text
node .tmp\pr514b-hosted-proof.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR should close PR514B if accepted, or route the next narrow lane before any
UI/client expansion.
