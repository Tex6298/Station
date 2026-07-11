# PR516 - Cross-Owner Consent-to-Disposable Preview Integrated Hosted Proof Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF_ACCEPTED
```

## Summary

ARIADNE completed the PR516 hosted integrated proof:

`docs/roadmap/PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF_RESULT.md`

MIMIR accepts PR516 as the close of the cross-owner invitation-to-private-preview
path.

Accepted proof:

- requester created the invitation through the safe public-slug UI path;
- invitation create used
  `POST /persona-encounters/cross-owner-consents/from-public-persona`;
- pending requester rows had no preview run control;
- counterparty approval worked in hosted Studio;
- requester ran exactly one consent-scoped disposable preview from the newly
  approved row;
- preview payload was setup-only and did not submit initiator/responder,
  requester/counterparty, or owner id fields;
- success readback stayed private, disposable, not saved, not public, not
  canonical, no retrieval, counterparty-hidden, and audit-recorded;
- inactive consent states had no cross-owner preview run control;
- public routes did not expose private setup markers, generated reply, consent
  rows, or raw UUID text;
- no private sessions, public exhibits, reports, memory, canon, archived chat
  transcripts, continuity records, export packages, storage usage, or storage
  objects drifted;
- expected runtime audit rows were bounded to
  `blocked_before_provider,provider_succeeded`;
- cleanup left no active proof consents or temporary PR516 public targets.

Validation:

```text
node .tmp\pr516-hosted-proof.mjs PASS
node .tmp\pr516-cleanup.mjs      PASS
pnpm typecheck                   NOT RUN - docs-only result
```

## Decision

No further hosted proof is required for the cross-owner
consent-to-disposable-preview surface unless a new defect appears.

The next Phase 3 encounter question is publication: now that bilateral consent,
runtime context, runtime audit, invitation/inbox UI, and one private disposable
preview are proven, Station needs a hostile preflight for whether and how
cross-owner encounter metadata or generated words may become public.

Open:

```text
PR517 - Cross-Owner Public Exhibit / Publication Preflight
Owner: ARGUS / A3
```

