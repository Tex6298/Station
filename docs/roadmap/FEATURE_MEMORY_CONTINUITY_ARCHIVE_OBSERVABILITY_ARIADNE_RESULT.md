# Feature Memory Continuity Archive Observability ARIADNE Result

Owner: ARIADNE / A4

Date: 2026-06-28

Status: complete

Verdict: NEEDS DAEDALUS

Superseded by rerun:

`docs/roadmap/FEATURE_MEMORY_CONTINUITY_ARCHIVE_OBSERVABILITY_ARIADNE_RERUN_RESULT.md`

## Summary

ARIADNE ran the owner-facing Memory/Continuity/Archive observability rehearsal
against the hosted Station web surface using the local replay-owner credential
names. The owner session authenticated and the persona Studio route family
loaded on desktop and mobile, but the required observability readback was not
human-visible in the browser pass.

The rehearsal did not find a privacy leak, secret-shaped visible value,
document-level horizontal overflow, or non-auth mutating browser request.

However, the route bodies did not expose the new runtime provenance/readback
surface needed to accept the lane. This is not ready for MIMIR closure.

## Target

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Signed-in state: replay owner, authenticated from local ignored `.env`
  values.
- Raw credential values, cookies, auth values, authorization headers, raw
  private IDs, source bodies, prompts, completions, provider payloads, hosted
  logs, SQL, and private payloads are not committed or summarized in this
  result.

## Findings

### 1. Persona Home runtime preview was not visible

- Route and state: `/studio/personas/:personaId`, signed-in owner.
- Control/link/section label: `Private Chat`, `Runtime Context`,
  `Continuity loaded for the next response`.
- Expected human-visible behavior: the owner can see the private chat surface
  and the runtime context preview that explains what Station may use next.
- Actual behavior: the route shell loaded, but the rehearsal did not find the
  private chat section or runtime context preview labels on desktop or mobile.
- Severity: implementation defect.
- Recommended owner: DAEDALUS.

### 2. Continuity runtime provenance was not visible

- Route and state: `/studio/personas/:personaId/continuity`, signed-in owner.
- Control/link/section label: `Runtime Continuity`, `Continuity records in
  runtime context`, `Runtime provenance`, `Where selected context came from`.
- Expected human-visible behavior: the owner can inspect selected Canon,
  Integrity, Continuity, Memory, and Archive groups, with the copy that source
  bodies and compiled prompts stay hidden.
- Actual behavior: the route shell loaded, but `Runtime Continuity` and
  `Runtime provenance` were absent in desktop and mobile readback.
- Severity: implementation defect.
- Recommended owner: DAEDALUS.

### 3. Runtime review links did not route as a usable owner flow

- Route and state: `/studio/personas/:personaId/continuity`, signed-in owner.
- Control/link/section labels:
  - `Review in Canon`
  - `Review Integrity Session`
  - `Review Continuity record`
  - `Review in Memory`
  - `Review in Archive`
- Expected human-visible behavior: each runtime source group routes to the
  matching owner Studio surface.
- Actual behavior: only `Review Continuity record` resolved in the browser
  pass. Canon, Integrity, Memory, and Archive review links were not found as
  routeable links on desktop or mobile.
- Severity: implementation defect.
- Recommended owner: DAEDALUS.

### 4. Adjacent owner review surfaces did not show expected route bodies

- Route and state: signed-in owner, route templates:
  - `/studio/personas/:personaId/memory`
  - `/studio/personas/:personaId/canon`
  - `/studio/personas/:personaId/calibration`
  - `/studio/personas/:personaId/files`
- Control/link/section labels:
  - `Memory Briefing`, `Runtime context`, `Observability handoff`,
    `Lifecycle review`
  - `Canonical Rules`
  - `Integrity Overview`, `Session Timeline`
  - `Archive Trust`, `Storage and Quota`, `Import Pipeline`,
    `Archive Import Library`
- Expected human-visible behavior: the owner can land on each review surface
  from the runtime readback and understand where they are.
- Actual behavior: route shells loaded, but these route-body labels were absent
  in the browser pass on desktop and mobile.
- Severity: implementation defect.
- Recommended owner: DAEDALUS.

## What Passed

- Hosted web `/health` returned `200` and `ok: true`.
- Hosted API `/health` returned `200` and `ok: true`.
- Hosted web `/health/deployment` returned `200`, `ok: true`, and
  `ready: true`; the response did not expose a commit field in this rehearsal.
- Replay-owner sign-in succeeded without printing credentials or auth values.
- Desktop and mobile route templates loaded without document-level horizontal
  overflow.
- Visible text scans found no raw UUID-shaped values, secret-shaped values,
  JWT-shaped values, authorization values, or database URLs.
- Browser request monitoring found no non-auth mutating requests during the
  rehearsal.

## Notes For DAEDALUS

The current checkout contains the expected owner-facing source strings for the
new observability surface. The failed human-eye result is therefore for the
browser-visible owner flow, not a claim that the code strings are absent from
the repository.

DAEDALUS should determine whether the owner flow failure is caused by deployed
web content, route-body rendering, auth/session hydration, client API loading,
or another route-shell/body mismatch. The repair should produce a fresh
browser-visible owner proof before returning to ARIADNE.

## Validation

- Temporary Playwright rehearsal runner against hosted web/API: failed with the
  findings above.
- Local current-checkout source inspection: expected observability labels are
  present in `apps/web`, but source presence does not satisfy the human-eye
  owner-flow acceptance gate.
- `git diff --check`: pending final validation before commit.

## Handoff

DAEDALUS should repair or prove the owner-visible route-body/readback issue and
then wake ARIADNE for a rerun.
