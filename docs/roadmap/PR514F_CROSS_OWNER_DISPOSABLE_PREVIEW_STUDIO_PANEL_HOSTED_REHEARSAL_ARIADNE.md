# PR514F - Cross-Owner Disposable Preview Studio Panel Hosted Rehearsal

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARIADNE_HOSTED_REHEARSAL
```

## Goal

Run a hosted human-eye rehearsal of the PR514E owner-only Studio panel for
cross-owner disposable preview.

This is a rehearsal, not a new implementation lane. Verify the visible product
flow, the privacy boundary, and the absence of public/persistence drift.

## Hosted Scope

Rehearse the current hosted Station deployment against the private persona
Studio workspace.

Required checks:

- private persona Studio page loads without exposing raw owner ids or raw
  participant persona ids;
- signed-out state has no usable cross-owner preview surface;
- owner with no cross-owner consent sees a quiet empty state and no run button;
- pending/ineligible consent states show bounded state copy and no run button;
- approved eligible consent can run through the consent-scoped helper with a
  setup-only payload;
- provider unavailable/config-blocked, quota/rate, audit failure, provider
  failed, and empty reply states show bounded copy if safely forceable;
- success shows exactly one private disposable response;
- success shows all required private/disposable/not-saved/not-public/
  not-canonical/no-retrieval/counterparty-hidden/audit-recorded labels;
- pre-run copy says counterparty will not see a generated reply here and runtime
  attempt audit is required;
- same-owner saved private artifact and public exhibit controls remain visually
  separate;
- desktop and 390px mobile show no horizontal overflow or label overlap;
- public routes `/discover`, `/forums`, `/writing`, and `/encounters` do not
  surface proof markers or generated cross-owner text.

## Required Labels

Confirm the human can see the intended meaning:

- "Cross-owner disposable preview";
- "Actor-authored setup";
- "Consent display snapshots";
- "Model-generated responder reply";
- "Private disposable preview";
- "Not saved";
- "Not public";
- "Not canonical";
- "Not a transcript";
- "Not a summary";
- "Not an excerpt";
- "Not shareable";
- "No Memory, Archive, Canon, Continuity, Integrity, private retrieval, or transcript sources used";
- "Counterparty will not see a generated reply here" before generation;
- "Counterparty does not see this generated reply here" after success;
- "Runtime attempt audit required" before generation;
- "Runtime attempt audit recorded" after success.

## Guardrails

- Do not add code.
- Do not change data except bounded hosted rehearsal fixtures needed to prove
  the flow.
- Do not print secrets.
- Do not claim provider-error states passed unless they were actually forced.
- Do not claim hosted success if the deployment is not fresh enough to include
  PR514E.
- Do not treat public route no-drift as passed unless the listed public routes
  were checked.

## Result Shape

Wake MIMIR with one of:

```text
PASS_PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL
```

or:

```text
FAIL_PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL
```

If failed, name the exact defect and the smallest next lane.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
```
