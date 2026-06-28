# Feature Memory Continuity Archive Observability ARIADNE Rerun Result

Owner: ARIADNE / A4

Date: 2026-06-28

Status: complete

Verdict: PASS

## Summary

ARIADNE reran the hosted owner-facing Memory/Continuity/Archive observability
rehearsal after DAEDALUS' follow-up proof.

The rerun passed. The owner can see what Station may use next across private
Home chat runtime context, Continuity runtime provenance, Memory, Canon,
Integrity, and Archive review surfaces. The review links route to the expected
owner Studio surfaces on desktop and mobile.

## Target

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Signed-in state: replay owner, authenticated with local ignored `.env`
  values.
- Session guardrail: the browser carried both `station.auth.session.v1` local
  storage and the `station-auth` cookie before protected Studio routes opened.
- Label guardrail: section-label checks treated CSS-transformed uppercase text
  as visible.

Raw credential values, cookies, auth values, authorization headers, raw private
IDs, source bodies, prompts, completions, provider payloads, hosted logs, SQL,
and private payloads are not committed or summarized in this result.

## Owner Route Rehearsal

PASS.

On desktop `1280x900` and mobile `390x844`:

- Persona Home exposed `Private Chat`, `Runtime Context`, and `Continuity
  loaded for the next response`.
- Continuity exposed `Runtime Continuity`, `Continuity records in runtime
  context`, `Runtime provenance`, `Where selected context came from`, the
  source-body/compiled-prompt boundary copy, and the `not system instructions`
  truthfulness copy.
- Memory exposed `Memory Briefing`, `Runtime context`, `Memory explanation`,
  `Observability handoff`, and `Lifecycle review`.
- Canon exposed `Promote stable truth` and `Canonical Rules`.
- Integrity exposed `Integrity Overview`, `Integrity Session`, and
  `Session Timeline`.
- Archive exposed `Archive Trust`, `Storage and Quota`, `Import Pipeline`,
  `Import Review Inbox`, and `Archive Import Library`.

## Review Links

PASS.

The Continuity runtime provenance links routed correctly on desktop and mobile:

- `Review in Canon` -> `/studio/personas/:personaId/canon`
- `Review Integrity Session` -> `/studio/personas/:personaId/calibration`
- `Review Continuity record` -> `/studio/personas/:personaId/continuity`
- `Review in Memory` -> `/studio/personas/:personaId/memory`
- `Review in Archive` -> `/studio/personas/:personaId/files`

## Privacy And Layout

PASS.

- Visible text scans found no raw UUID-shaped values, secret-shaped values,
  JWT-shaped values, authorization values, or database URLs.
- Desktop and mobile route bodies had no document-level horizontal overflow.
- Browser request monitoring found no non-auth mutating requests during the
  rehearsal.
- The readback stayed honest: Continuity records are source context for recall
  and ordering, not system instructions; source bodies and compiled prompts
  stay hidden in the Continuity readback.

## Caveats

- DAEDALUS' hosted proof recorded the deployed implementation commit
  `43e464e83809`. ARIADNE's rerun confirmed hosted route behavior but did not
  rely on a deployment commit field from its own harness output.
- The earlier failed ARIADNE result remains useful as a harness lesson:
  exact-case browser text scans can false-negative when CSS transforms section
  labels to uppercase.

## Validation

- Temporary Playwright hosted owner rerun: passed.
- `git diff --check`: passed.

## Recommendation

MIMIR can close the Memory/Continuity/Archive observability human-eye gate as
passed and decide the next roadmap move.
