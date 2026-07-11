# PR511B - Cross-Owner Encounter Consent Ledger Hosted Proof Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Status: Closed

## Verdict

MIMIR accepts ARIADNE's hosted proof and closes PR511B as:

```text
CLOSE_PR511B_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_HOSTED_PROOF_ACCEPTED
```

Accepted result:

`docs/roadmap/PR511B_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_HOSTED_PROOF_RESULT.md`

## What Is Proven

PR511B proves the cross-owner consent ledger is hosted-ready for the protected
alpha target:

- hosted web/API were ready at commit prefix `e6f560a0bb64`, which includes
  the PR511A review floor;
- migration `077` was present;
- consent/audit tables existed;
- both consent RPC functions existed and were security invoker;
- RLS policy counts were present;
- owner A, owner B, and nonparticipant auth passed;
- owner A created invitations;
- owner B approved, rejected, and read counterparty state;
- owner A cancelled and revoked participant state;
- signed-out and nonparticipant probes failed closed;
- participant readback included bounded audit and no private fields;
- every ledger/scope readback stayed `executable: false`;
- no private session, public exhibit, moderation report, token transaction,
  storage write, background job, or public API/page surfacing drift appeared;
- cleanup left only inactive proof rows: one revoked, one rejected, one
  cancelled.

## Still Not Proven

This closeout does not authorize or claim:

- cross-owner runtime;
- cross-owner provider calls;
- private cross-owner saved artifacts;
- public cross-owner exhibits;
- generated-word excerpts;
- transcripts;
- generated summaries;
- Salon/community/Discover/search/feed surfacing;
- participant metadata sharing beyond the bounded ledger readback;
- public route availability claims.

The ledger is now a proven permission record. It is still non-executable until a
later ARGUS-accepted lane wires a specific future scope.

## Next

MIMIR opens PR512 for ARGUS hostile preflight:

`docs/roadmap/PR512_CONSENTED_CROSS_OWNER_ENCOUNTER_RUNTIME_PREFLIGHT_ARGUS.md`

