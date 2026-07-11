# PR514F - Cross-Owner Disposable Preview Studio Panel Hosted Rehearsal Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
PASS_PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL
```

## Summary

ARIADNE rehearsed the hosted private Studio cross-owner disposable preview
panel on desktop and 390px mobile.

Hosted web and API were ready at commit prefix `9eb9338b1445`, which includes
the PR514E Studio panel implementation floor. The docs-only PR514E ARGUS review
floor was not in deployment identity, but runtime freshness was proven through
the hosted panel behavior.

Passed:

- signed-out users had no usable cross-owner preview surface;
- no-consent empty state rendered with no run button;
- pending consent state rendered bounded state copy with no run button;
- approved eligible consent ran through the consent-scoped setup-only helper;
- successful preview showed exactly one private disposable response;
- pre-run copy used future/required labels for counterparty visibility and
  runtime attempt audit;
- success copy showed private/disposable/not-saved/not-public/not-canonical/
  no-retrieval/counterparty-hidden/audit-recorded labels;
- the run payload included setup only and did not send initiator/responder,
  requester/counterparty, owner, or raw persona id fields;
- the cross-owner panel did not post to same-owner preview, private-session,
  public-exhibit, or public encounter routes;
- same-owner saved private artifact and public exhibit controls remained
  visually separate;
- desktop and 390px mobile had no horizontal overflow;
- public routes `/discover`, `/forums`, `/writing`, and `/encounters` did not
  surface the proof marker or generated cross-owner text;
- no private session, public exhibit, moderation report, memory, canon, archive,
  continuity, export, storage, or public-surfacing drift appeared;
- cleanup left no active proof consent;
- privacy scan passed.

Provider unavailable/config-blocked, quota/rate, audit failure, provider
failed, and empty-provider states were not forced on hosted because doing so
would require changing provider/quota/audit behavior. ARGUS had already accepted
bounded source-level copy for those states in PR514E.

## Proof Output

```text
tooling playwright true pgClient true
health webStatus 200 webReady true webCommitPrefix 9eb9338b1445 webIncludesImplementationFloor true webIncludesReviewFloor false apiStatus 200 apiReady true apiCommitPrefix 9eb9338b1445 apiIncludesImplementationFloor true apiIncludesReviewFloor false
auth ownerSignInStatus 200 ownerTier canon candidateSignIns 2 ownerBSignInStatus 200 ownerBTier private noConsentSignInStatus 200 noConsentTier canon
fixtures ownerAPersonaPresent true ownerBPersonaPresent true noConsentPersonaPresent true ready true
signedOut status redirected_to_login crossOwnerSurfaceAbsent true noRunButton true rawIdsSafe true passed true
noConsent mode browser_empty_ledger surfaceVisible true emptyState true noRunButton true rawIdsSafe true noHorizontalOverflow true passed true
pending surfaceVisible true stateCopy true noRunButton true rawIdsSafe true noHorizontalOverflow true passed true
approved preRunLabelsPresent true preRunNoGeneratedClaim true successLabelsPresent true onePreviewRequest true setupOnlyPayload true noForbiddenPosts true rawIdsSafe true noHorizontalOverflow true sameOwnerControlsSeparate true publicSampleCount 4 publicNoLeak true passed true
mobile labelsPresent true noHorizontalOverflow true rawIdsSafe true buttonFits true passed true
noDrift privateSessionsCreated 0 publicExhibitsCreated 0 moderationReportsCreated 0 memoryItemsCreated 0 canonItemsCreated 0 archiveTranscriptsCreated 0 continuityRecordsCreated 0 exportPackagesCreated 0 storageUsageTouched 0 storageObjectsCreated 0 noPersistenceDrift true passed true
cleanup createdProofConsents 2 revokedRows 1 cancelledRows 1 pendingRows 0 approvedRows 0 noActiveProofConsents true
privacy pass true
verdict PASS_PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL
```

## Validation

```text
node .tmp\pr514f-hosted-rehearsal.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR should close PR514F if accepted, or route the next narrow lane.
