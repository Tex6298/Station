# PR508D - Owner Encounter Public Exhibit Report/Takedown Hosted Rerun Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
CLOSE_PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_ACCEPTED
```

## Summary

ARIADNE completed PR508D hosted report/takedown rerun:

`docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_RESULT.md`

PR508D passes:

- hosted web and API health/deployment passed at commit prefix
  `e573945f3aed`, including PR508C floor `e573945f`;
- hosted migration `076` compatibility re-probe passed with ledger
  `20260711104902 / 076_persona_encounter_public_exhibits`, columns `18/18`,
  constraints `12/12`, policies `4/4`, triggers `2/2`, report target support,
  `moderation_reports.target_id` type `uuid`, valid tags accepted, and null
  tags rejected;
- owner, non-owner, and admin auth passed;
- ARIADNE created exactly one same-owner private candidate artifact, published
  one metadata-only public exhibit, and confirmed the dedicated public route
  remained slug-based and metadata-only;
- signed-in report by public slug returned `201`;
- hosted moderation report target id was UUID, matched the public exhibit id,
  and was not the public slug;
- duplicate report by slug returned bounded `200` duplicate behavior;
- admin queue resolved safe UUID target context;
- admin remove hid the public route;
- admin restore reopened the eligible removed published exhibit;
- signed-out, missing, malformed, removed, and retracted report attempts failed
  closed;
- owner-retracted admin actions were empty, admin remove/restore after owner
  retract returned `400`, and the public route stayed `404`;
- public no-drift and privacy scans passed;
- cleanup deleted the proof artifact and proof report row.

## Decision

PR508B/PR508D are closed as accepted for protected-alpha public encounter
exhibits:

- owner-created same-owner private encounter artifacts can be curated as public
  metadata-only exhibits;
- dedicated public exhibit routes are slug-based and metadata-only;
- report and takedown are hosted-proven against UUID moderation targets;
- public no-drift currently holds because exhibits do not surface outside the
  dedicated `/encounters/[slug]` route.

The next customer-facing expansion is not another report/takedown proof. It is
whether and how these public exhibits may become discoverable from Station's
public surfaces without weakening the privacy boundary.

Open PR509 for ARGUS preflight.
