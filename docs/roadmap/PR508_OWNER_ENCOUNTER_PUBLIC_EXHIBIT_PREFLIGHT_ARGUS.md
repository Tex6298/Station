# PR508 - Owner Encounter Public Exhibit Boundary Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date: 2026-07-11

Status: Open hostile preflight

## Why This Lane

PR507A/PR507B closed the owner-only private encounter curation loop:

- saved same-owner private encounter artifacts exist;
- owner-authored private title, summary/note, tags, and candidate/planning
  marker are hosted-proven;
- private owner readback, edit/clear, auth boundaries, public no-drift, and
  cleanup are hosted-proven.

The product vision names Phase 3 persona-to-persona encounters as public
content only with careful structure, creator control, consent, archive, and
publication boundaries. The private candidate marker now points at the next
feature question: what is the smallest safe public exhibit/presentation slice?

Do not implement. Classify the boundary and choose the next DAEDALUS lane only
if it is safe.

## Product Context

Relevant vision anchors:

- Persona-to-Persona Encounters are Phase 3 and should be structured rather
  than live free-form.
- Public encounters can become distinctive public content, but publishing a
  persona's words requires explicit creator control and clear ownership.
- Existing PR507 curation metadata is private planning only; it is not public
  publication approval.

## Candidate Directions To Classify

ARGUS should choose one of these or name a concrete blocker:

1. Owner-curated public exhibit for same-owner saved private encounter
   artifacts.
   - Owner can explicitly publish/retract a public exhibit derived from their
     own saved same-owner private artifact.
   - Public shape must be minimal, safe, and explicit about provenance.
2. Public exhibit readiness/readback only.
   - Owner sees whether a private artifact is eligible for public exhibit, but
     no public route or publish control exists yet.
3. Cross-owner consent preflight first.
   - If any meaningful public exhibit requires cross-owner personas, stop
     same-owner public route planning and define bilateral consent, revocation,
     audit, readback, and deletion semantics first.
4. Defer public exhibits.
   - Only if there is a concrete blocker that cannot be removed by a smaller
     numbered lane.

## Questions ARGUS Must Answer

- Is same-owner public exhibit a legitimate first slice, or does public
  encounter product value require cross-owner consent first?
- What public fields, if any, may be shown without exposing private setup,
  prompt bodies, raw generated reply text, provider payloads, private context,
  raw ids, or private curation notes?
- Should the first public artifact show only owner-authored public exhibit
  metadata, or may it include owner-selected excerpts?
- What explicit publish/retract action is required?
- What moderation/reporting/takedown surface is required before public
  visibility?
- What ownership/provenance copy is required?
- Which existing public routes may be touched, if any?
- What tests must prove private artifact material never leaks into public
  Space/persona/Discover/search/forum surfaces unless explicitly published in
  the accepted shape?

## Hard Guardrails

No implementation in PR508.

Do not approve:

- public route surfacing of private setup bodies;
- raw generated responder reply publication by default;
- public display of raw owner ids, persona ids, session ids, provider payloads,
  prompts, SQL details, stack traces, env values, tokens, cookies, or private
  context/source bodies;
- share links without explicit publish/retract semantics;
- cross-owner publication without bilateral consent and revocation;
- provider-generated public summaries or classifier/moderation calls in the
  first implementation lane;
- anonymous/visitor persistence;
- broad Discover/search/forum reshaping;
- Archive, Memory, Canon, Continuity, Integrity, Station Press, billing,
  social, queue/worker, Redis, Cloudflare, storage, package, lockfile, or
  deployment drift.

## Expected Output

Write:

`docs/roadmap/PR508_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_PREFLIGHT_RESULT.md`

The result must either:

- accept a specific PR508A implementation lane and wake DAEDALUS; or
- block with the concrete blocker and wake MIMIR; or
- choose cross-owner consent preflight as the next numbered lane and wake
  MIMIR with the reason.

## Minimum Review Inputs

Inspect at minimum:

- `docs/roadmap/PR507_OWNER_ENCOUNTER_PUBLICATION_BOUNDARY_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR507A_OWNER_ENCOUNTER_CURATION_METADATA_REVIEW_RESULT.md`
- `docs/roadmap/PR507B_OWNER_ENCOUNTER_CURATION_METADATA_HOSTED_PROOF_RESULT.md`
- `docs/product/Station_Document_3_Future_Vision.md`
- existing `persona-encounters` API/schema/UI code;
- existing public Space/persona/Discover route serializers and privacy tests.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR508 public encounter exhibit boundary preflight.
- Include accept/block verdict, recommended next numbered lane, and the exact public/private/consent boundary.
Task:
- Close PR508 if accepted and wake the correct owner for the next lane.
```
