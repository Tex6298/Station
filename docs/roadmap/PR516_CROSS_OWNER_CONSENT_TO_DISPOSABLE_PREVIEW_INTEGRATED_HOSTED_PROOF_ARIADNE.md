# PR516 - Cross-Owner Consent-to-Disposable Preview Integrated Hosted Proof

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARIADNE_HOSTED_PROOF
```

## Goal

Prove the full hosted customer path from cross-owner consent invitation to one
private disposable preview.

PR514F proved the disposable preview panel for an already-approved consent.
PR515C proved hosted invitation/inbox/actions without provider generation.
PR516 ties them together.

## Source

PR515C closeout:

`docs/roadmap/PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL_CLOSEOUT.md`

PR515C result:

`docs/roadmap/PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL_RESULT.md`

PR514F result:

`docs/roadmap/PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL_RESULT.md`

## Proof Scope

Use hosted Railway staging. Prove:

- hosted web/API are fresh enough to include the PR515B UI and PR514F preview
  behavior;
- requester signs in and creates a cross-owner invitation by safe public slug
  or `/personas/:slug` href;
- create uses
  `POST /persona-encounters/cross-owner-consents/from-public-persona`;
- counterparty signs in and approves the pending invitation;
- requester sees the approved row and can run exactly one cross-owner
  disposable preview from that newly approved consent;
- preview request uses the consent-scoped setup-only disposable preview route;
- success readback shows one private disposable response;
- visible copy still says private/disposable/not-saved/not-public/
  not-canonical/no-retrieval/counterparty-hidden/audit-recorded or
  audit-required as implemented;
- same-owner saved private artifact and public exhibit controls remain
  visually separate;
- pending/rejected/cancelled/revoked rows have no preview run control;
- generated text does not appear on public routes.

## No-Drift Checks

Provider generation may create the expected bounded runtime/audit accounting for
the disposable preview. It must not create:

- private saved sessions;
- public exhibits;
- generated-word excerpts, transcripts, summaries, share links, or
  publication;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export packages,
  storage objects, billing side effects, Redis/Cloudflare/worker side effects,
  provider config changes, public surfacing, partner adapter records, webhooks,
  migrations, or broad Studio redesign changes.

Cleanup should remove or revoke proof consent state and any temporary public
target used for the proof.

## Result Format

Wake MIMIR with one of:

```text
PASS_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF
```

or:

```text
FAIL_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF
```

If failing, name the exact hosted step, observed behavior, likely owner, and
whether the fix belongs to DAEDALUS or needs a smaller preflight.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- PR515C passed hosted invitation/inbox/action rehearsal, but it deliberately did not run provider generation.
- MIMIR accepted PR515C and opened PR516 for the integrated consent-to-disposable-preview hosted proof.
- This should prove invite by public slug, counterparty approval, and one private disposable preview from the newly approved consent.

Task:
- Run PR516 hosted proof on Railway staging.
- Verify public-slug invitation create, counterparty approve, requester run of exactly one consent-scoped disposable preview, private/disposable labels, no public/generated/saved/retrieval drift, and cleanup.
- Wake MIMIR with PASS_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF or FAIL_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF and exact defects.
```
