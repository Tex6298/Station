# PR473 - Owner-Initiated Encounter Runtime Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed at provider/config boundary

## Decision

PR473 is closed as an accepted bounded owner-only encounter lane with a recorded
hosted provider/config blocker.

The implemented and reviewed shape is safe:

- owner-only readiness, consent/provenance, and runtime preview surfaces exist;
- same-owner scoping is enforced before provider readiness or generation;
- the private Studio panel is non-durable and labels the preview as disposable;
- public routes expose no encounter controls, generated output, availability
  claims, cross-owner controls, or shareable encounter pages;
- provider readiness fails closed before generation when hosted lacks an
  accepted private-context provider route.

The hosted runtime generation proof is not claimed. ARIADNE's final hosted
rerun returned:

```text
PROVIDER_CONFIG_BLOCKER_FAIL_CLOSED
```

Exact blocker:

```text
hosted private-context encounter preview has no accepted provider route configured
```

## Evidence

- PR471A owner readiness gate:
  `docs/roadmap/PR471A_OWNER_ENCOUNTER_READINESS_GATE_CLOSEOUT.md`
- PR472A consent/provenance contract:
  `docs/roadmap/PR472A_OWNER_ENCOUNTER_CONSENT_PROVENANCE_CONTRACT_CLOSEOUT.md`
- PR473 preflight:
  `docs/roadmap/PR473_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREFLIGHT_RESULT.md`
- PR473A implementation/review:
  `docs/roadmap/PR473A_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREVIEW_REVIEW_RESULT.md`
- PR473A hosted defect:
  `docs/roadmap/PR473A_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREVIEW_REHEARSAL_RESULT.md`
- PR473B repair/review:
  `docs/roadmap/PR473B_OWNER_ENCOUNTER_PROVIDER_AVAILABILITY_REPAIR_REVIEW_RESULT.md`
- PR473B hosted rerun:
  `docs/roadmap/PR473B_OWNER_ENCOUNTER_PROVIDER_AVAILABILITY_REPAIR_HOSTED_RERUN_RESULT.md`

## Why This Closes

The current hosted environment only exposes NVIDIA/platform private-context
behavior for this path, and ARGUS explicitly kept PR473B on the existing
accepted provider resolver with `allowPlatformNvidia: false`. MIMIR is not
changing provider policy inside an encounter lane.

PR473B repaired the staging defect that mattered for product honesty: the UI no
longer presents a runnable owner encounter path that fails after click. It
shows paused provider setup copy and keeps Generate disabled before a provider
call.

## Deferred Follow-Up

If Marty wants owner encounter generation to run on hosted staging, open a
separate provider-policy/config lane first. That lane must decide which
private-context provider route is accepted for owner encounter generation and
must not silently enable broad NVIDIA private-context behavior.

Do not reopen PR473 for cross-owner encounters, autonomous/background loops,
durable transcripts, public/shareable output, source retrieval, Redis,
Cloudflare, billing, queues, workers, schema, storage, or broad UI.
