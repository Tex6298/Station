# PR508B - Owner Encounter Public Exhibit Metadata Hosted Proof Blocker

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
BLOCK_PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_REPORT_CREATE
```

## Summary

ARIADNE completed PR508B hosted proof:

`docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_RESULT.md`

Hosted proof passed the required non-report portions:

- hosted web and API health/deployment passed at commit prefix
  `acb63c4fe4f8`, including PR508A floor `acb63c4f`;
- hosted migration `076` re-probe passed with ledger row
  `20260711104902 / 076_persona_encounter_public_exhibits`, columns `18/18`,
  constraints `12/12`, policies `4/4`, triggers `2/2`, exhibit report target
  support, valid tags accepted, and null tags rejected;
- owner, non-owner, and admin auth passed;
- ARIADNE created exactly one same-owner private candidate artifact and proved
  signed-out, cross-owner, non-candidate, malformed-body, forbidden-field, and
  cross-owner source attempts fail closed;
- desktop and `390px` owner Studio publish controls fit without horizontal
  overflow or clipping;
- signed-out public `/encounters/[slug]` showed metadata only, same-owner
  display snapshots, provenance, and sign-in-to-report copy;
- owner retract hid the public route;
- Discover/search/forum/public Space/public persona no-drift samples passed;
- cleanup deleted the proof artifact and the public route stayed `404`;
- privacy/secret scan passed.

The hosted proof blocked only because signed-in public exhibit report creation
returned `500`. Hosted schema confirms `moderation_reports.target_id` is still
typed as `uuid`, while the public exhibit report path writes the public exhibit
slug into `target_id`.

No report row exists, so admin queue/remove/restore could not be proven.

## Diagnosis

The root cause is a target identity mismatch, not a public exhibit schema,
publish, retract, auth, route freshness, or browser layout failure.

Observed local code points:

- `apps/api/src/routes/persona-encounters.ts` report creation writes
  `target_id: parsedSlug.data`;
- public exhibit report target context also compares
  `moderation_reports.target_id` to the public slug;
- hosted `moderation_reports.target_id` remains `uuid`.

The safest repair is to keep public browser/API routes slug-based, resolve the
slug server-side to the public exhibit UUID, and persist/report/admin against
that UUID.

## Decision

Open PR508C for DAEDALUS as a narrow code repair:

- no broad schema redesign;
- no widening of public exposure;
- no public transcript/excerpt/raw-reply/private-curation drift;
- no Discover/search/forum/feed surfacing;
- no migration unless DAEDALUS proves it is strictly necessary.

After DAEDALUS implements and ARGUS accepts PR508C, MIMIR should route PR508B
back to ARIADNE for the hosted report/takedown rerun.
