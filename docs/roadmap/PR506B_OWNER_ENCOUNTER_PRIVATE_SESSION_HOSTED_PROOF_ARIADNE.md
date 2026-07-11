# PR506B - Owner Encounter Private Session Hosted Proof

Owner: ARIADNE / A4

Date: 2026-07-11

Status: Open

## Purpose

Prove the hosted PR506A owner-only private encounter session artifact on
Railway/Supabase after local ARGUS acceptance and hosted migration application.

This is a hosted proof/rehearsal lane. Do not implement code.

## Hosted Floor

Before the saved-artifact action, confirm hosted API deployment is fresh enough:

```text
@station/api commit >= 0a0373c5
```

MIMIR saw:

```text
ready: true
service: @station/api
branch: main
commit: 0a0373c561fcb318d4532f6d3b9764c67835317e
```

MIMIR also applied migration `074_persona_encounter_private_sessions.sql`.
Sanitized proof before handoff:

```text
table_exists: true
rls_enabled: true
policy_count: 4
column_count: 14
```

If hosted API is stale, not ready, or the private session table behaves as
missing, stop and wake MIMIR with the exact bounded blocker.

## Targets

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

## Required Flow

1. Verify hosted web/API reachability and API deployment health.
2. Sign in as the owner test account and confirm `/auth/me` succeeds.
3. Sign in as the non-owner test account and confirm `/auth/me` succeeds.
4. Select two same-owner personas without recording raw persona ids.
5. Confirm owner encounter readiness returns `200` and `ready:true`.
6. Create exactly one saved private same-owner encounter artifact.
7. Confirm create returns `201` with owner-safe session readback.
8. Confirm owner list returns the artifact.
9. Confirm owner detail returns the artifact.
10. Confirm cross-owner detail/delete fail closed without revealing row
    existence.
11. Confirm signed-out create/list/detail/delete fail closed.
12. Delete/discard the owner artifact.
13. Confirm owner detail no longer returns the artifact and owner list no
    longer includes it.
14. Inspect desktop and `390px` owner Studio surfaces for visible private
    session readback/delete controls, fit, and no raw-id leakage.
15. Sample public Space and public persona routes for no saved encounter output
    or owner-private controls.

Prefer using the visible owner Studio flow for the saved-artifact action. If
browser selectors make that impractical, a direct authenticated API create is
acceptable for the single saved generation, but the visible owner Studio
readback/delete surface must still be inspected on desktop and `390px`.

## Pass Conditions

PR506B may pass only if:

- exactly one saved private session create request reaches provider generation;
- create returns `201`;
- returned session has an opaque `id`;
- setup is labeled owner-authored and stored;
- reply is labeled model-generated responder reply, role `responder`, and
  nonblank;
- artifact provenance says private, owner-only, server-created;
- persistence says saved, not transcript, not public, not shareable, no source
  retrieval, and source bucket count `0`;
- API/UI readback does not expose owner ids, raw persona ids, provider route
  labels, model config, provider payloads, token values, prompt internals,
  private context bodies, storage paths, SQL details, stack traces, cookies,
  auth tokens, or secret-shaped values;
- delete succeeds for the owner;
- after delete, owner detail/list no longer exposes the artifact;
- signed-out and cross-owner probes fail closed;
- public routes show no saved encounter output, public/shareable encounter
  pages, cross-owner controls, anonymous controls, or availability claims;
- desktop and `390px` Studio surfaces fit without overlap or clipped controls.

## Block Conditions

Stop and wake MIMIR if:

- hosted API is stale or not ready;
- migration/table/RLS is missing in hosted behavior;
- readiness is not `ready:true`;
- create fails with bounded provider/config/schema/storage errors;
- create returns `200`/`201` with blank responder reply;
- create persists client-certified reply/provenance instead of server-created
  generation;
- list/detail/delete leak raw ids, provider details, prompt/private context,
  generated reply text in logs/docs, or secret-shaped values;
- signed-out/cross-owner boundaries fail;
- public routes expose private encounter material or controls;
- owner Studio desktop/mobile layout fails.

## Recording Rules

Record statuses, bounded error codes, deployment commit prefix, migration/table
proof outcome, count/length facts, and pass/fail conclusions.

Do not record credentials, cookies, auth tokens, raw owner ids, raw persona ids,
prompt bodies, private context bodies, provider keys, base URLs, model config,
SQL details, stack traces, provider payloads, generated reply text, token
values, env values, or secret-shaped strings.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE ran PR506B hosted proof for owner-only private encounter session artifacts.
- Hosted API deployment and migration/table readiness were checked before generation.
Result:
- PASS_PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF
  or BLOCK_PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF
Task:
- Close PR506B if hosted saved-artifact create/read/delete and all boundaries passed.
- If blocked, choose the smallest next repair without weakening privacy, provenance, or fail-closed behavior.
```
