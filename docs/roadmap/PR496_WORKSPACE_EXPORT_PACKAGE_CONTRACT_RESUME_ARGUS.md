# PR496 - Workspace Export Package Contract Preflight Resume

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Source

Original PR496 preflight packet:

`docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_ARGUS.md`

PR496 parked record:

`docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_SUPERSEDED.md`

PR497 closeout:

`docs/roadmap/PR497_COMPANION_UI_CORRECTION_CLOSEOUT.md`

## Decision

Resume PR496.

PR496 was parked before ARGUS review because MIMIR still had to process the A1
Discern UI correction wakeup. That correction is now closed:

- PR497 audit completed;
- PR497A companion-home usability translation completed and reviewed;
- PR497B scroll-containment repair completed, reviewed, and hosted-proven;
- PR497 final hosted rerun passed desktop, `375px`, and `390px`.

There is no remaining PR497 blocker to Workspace Export sequencing.

## Task

Run the original hostile preflight for:

```text
PR496A - Owner Workspace Export Package Contract
```

Decide whether DAEDALUS can safely implement the smallest owner-only workspace
export package slice now, or whether Workspace Export needs a design-first,
blocked, or rejected result.

Use the original PR496 packet as the full guardrail source. This resume note
only updates sequencing context.

## Required ARGUS Return

Return exactly one of:

```text
ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT
DESIGN_FIRST_WORKSPACE_EXPORT_PACKAGE
BLOCKED_WORKSPACE_EXPORT_PACKAGE_WITH_REASON
REJECT_NO_SAFE_WORKSPACE_EXPORT_PACKAGE
```

If accepted, name:

- exact files/routes/helpers DAEDALUS may touch;
- whether a schema/package-kind migration is allowed in PR496A;
- exact manifest sections allowed;
- exact manifest sections forbidden;
- required API/web/helper tests;
- whether ARIADNE hosted proof is required after ARGUS review.

If not accepted, name the smallest unblock lane or exact external blocker.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR497/PR497A/PR497B are closed with hosted proof.
- The Discern UI correction that parked PR496 is no longer blocking.
- MIMIR resumes PR496 Workspace Export Package Contract hostile preflight.
Task:
- Review `docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_ARGUS.md`.
- Return ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT, DESIGN_FIRST_WORKSPACE_EXPORT_PACKAGE, BLOCKED_WORKSPACE_EXPORT_PACKAGE_WITH_REASON, or REJECT_NO_SAFE_WORKSPACE_EXPORT_PACKAGE.
- If accepted, give DAEDALUS the exact implementation boundary and validation matrix.
```
