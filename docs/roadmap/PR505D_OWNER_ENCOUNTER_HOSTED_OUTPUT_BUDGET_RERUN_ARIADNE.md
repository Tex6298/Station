# PR505D - Owner Encounter Hosted Output Budget Rerun

Owner: ARIADNE / A4

Date: 2026-07-11

Status: Open

## Purpose

Rerun the hosted PR505 owner encounter proof after PR505C raised the
NVIDIA/OpenAI-compatible owner encounter preview output budget.

This is a hosted proof, not a local implementation lane.

## Deployment Floor

Before testing, confirm the hosted API is fresh enough:

```text
@station/api commit >= 03d39f8e
```

The deployment health MIMIR saw before opening this lane was:

```text
ready: true
branch: main
commit: 03d39f8e93ab01da4fd3a8ba73dbce79a52a9f80
```

If the hosted API has rolled back or is not ready, stop and wake MIMIR with the
deployment state. Do not run generation against stale code.

## Targets

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

## Required Flow

1. Verify hosted web/API reachability and deployment health.
2. Sign in as the owner test account and confirm `/auth/me` succeeds.
3. Sign in as the non-owner test account and confirm `/auth/me` succeeds.
4. Select two same-owner personas without recording raw persona ids.
5. Confirm owner readiness returns `200` and `ready:true`.
6. Send exactly one same-owner disposable preview request.
7. Run signed-out and cross-owner readiness/preview boundary probes.
8. Sample public routes for no owner-encounter controls, generated content, or
   private context leakage.

## Pass Conditions

PR505D may pass only if the required same-owner preview returns:

- status `200`;
- nonblank responder content;
- disposable provenance, with no durable transcript or shareable artifact;
- `saved:false`;
- `transcriptStored:false`;
- `shareable:false`;
- `sourceRetrieval:false`;
- empty `sourceBuckets`.

Boundary checks must also pass:

- signed-out readiness and preview return `401`;
- cross-owner readiness and preview return `403`;
- cross-owner code is `persona_encounter_persona_not_owned`;
- public routes do not expose owner encounter controls, generated replies,
  private persona context, or private prompt material.

## Block Conditions

Stop and wake MIMIR if any of these occur:

- hosted API is stale or not ready;
- owner readiness is not `ready:true`;
- the same-owner preview returns `502` /
  `persona_encounter_provider_empty_reply`;
- the same-owner preview returns `200` with blank or whitespace-only responder
  content;
- the preview creates durable transcript, shareable, retrieval, public, or
  source-bucket provenance;
- signed-out/cross-owner boundaries fail;
- public routes show owner encounter drift.

## Recording Rules

Record statuses, bounded error codes, route names, deployment commit prefix, and
pass/fail conclusions.

Do not record credentials, cookies, auth tokens, raw owner ids, raw persona ids,
prompt bodies, private context bodies, provider keys, base URLs, model config,
SQL details, stack traces, provider payloads, generated reply text, token
values, or env values.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE reran hosted PR505D against the PR505C output-budget deployment.
- Deployment floor was checked before generation.
Result:
- PASS_PR505D_OWNER_ENCOUNTER_HOSTED_OUTPUT_BUDGET_RERUN
  or BLOCK_PR505D_OWNER_ENCOUNTER_HOSTED_OUTPUT_BUDGET_RERUN
Task:
- Close PR505D if hosted responder content is nonblank with disposable/no-durable provenance.
- If blocked, choose the smallest next repair without weakening privacy, provenance, or fail-closed behavior.
```
