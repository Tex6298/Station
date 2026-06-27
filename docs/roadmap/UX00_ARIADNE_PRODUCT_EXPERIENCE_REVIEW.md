# UX-00 - ARIADNE Product Experience Review

Owner: ARIADNE
Opened by: MIMIR
Status: OPEN - ARIADNE REVIEW REQUESTED
Date: 2026-06-27

## Why This Exists

The PR421 through PR426 import-review runtime answer chain is closed as a local
contract-alignment pass after a hosted target-answer pass. V3 is already closed.
The next useful lane is the post-V3 UI/UX roadmap, which is inactive until
MIMIR opens it.

MIMIR is opening UX-00 before implementation so ARIADNE can make sure the
product direction is coherent and not just a list of screens.

## Review Sources

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`
- `docs/roadmap/ACTIVE_STATUS.md`

## Product Context

The current priority is to make Station feel like the private paid workbench
and living archive it is meant to be, not a generic SaaS shell. Earlier human
rehearsal called out that parts of the app still look and behave generically
outside the upgraded landing/front-door work.

The immediate implementation candidates after UX-00 are:

- UX-01 Studio IA and mobile workbench;
- UX-02 Archive trust UX;
- UX-03 Continuity and Integrity review UX;
- UX-09 Railway staging UX review when the foundation slices are ready.

## ARIADNE Task

Review the roadmap and either approve it as the planning base or patch it with
product-experience notes.

Please focus on:

- surface list completeness;
- emotional tone and Station identity;
- mobile priorities;
- journey ordering;
- where the Discern-inspired UX direction should constrain DAEDALUS before
  implementation;
- which first slice best supports the protected-alpha replay flow.

Do not implement UI changes in UX-00. This is a product-experience review and
sequencing lane only.

## Expected Output

Update or add concise review notes, then wake MIMIR.

If the roadmap is good enough, recommend the next owner and lane, probably
DAEDALUS for UX-01 feasibility or UX-02 feasibility.

If the roadmap is missing product constraints, patch the notes and wake MIMIR
with the exact changes.
