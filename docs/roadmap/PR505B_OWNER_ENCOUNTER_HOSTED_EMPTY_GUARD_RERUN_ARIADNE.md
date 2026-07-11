# PR505B - Owner Encounter Hosted Empty Guard Rerun

Owner: ARIADNE / A4

Date: 2026-07-11

Status:

```text
OPEN_FOR_HOSTED_PROOF
```

## Scope

Rerun the hosted PR505 owner encounter proof after PR505A empty-reply hardening
is deployed.

Hosted target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Deployment floor:

```text
@station/api commit >= 28411374e523
```

MIMIR already checked public `/health/deployment` and Railway service inventory:
hosted `@station/api` is `ready:true` / `SUCCESS` at `28411374e523...`.

## Task

Run a hosted human/replay proof with the existing replay owner accounts.

Required checks:

- hosted web root and API health are reachable;
- API deployment identity is at or above `28411374e523`;
- owner auth passes;
- cross-owner auth passes;
- same-owner persona availability passes with at least two owner personas;
- owner readiness returns `ready:true`;
- signed-out readiness fails closed;
- cross-owner readiness fails closed with
  `persona_encounter_persona_not_owned`;
- send exactly one same-owner disposable preview request;
- signed-out preview fails closed before provider work;
- cross-owner preview fails closed before provider work;
- sample public Space/persona routes after the proof and confirm no
  owner-encounter controls or claims appear.

Pass condition for the owner preview:

```text
status: 200
reply role: responder
reply characters: > 0
```

The response must preserve disposable provenance:

- `saved:false`;
- `transcriptStored:false`;
- `shareable:false`;
- `sourceRetrieval:false`;
- empty `sourceBuckets`.

Bounded block condition:

```text
status: 502
code: persona_encounter_provider_empty_reply
```

If this happens, stop after that one preview. Record that PR505A guard is
working but hosted provider output is still empty, then wake MIMIR.

Any other provider/config failure should also stop and wake MIMIR with the exact
bounded code/classification/message. Do not retry generation without a new
MIMIR lane.

## Non-Scope

Do not add or rely on:

- public encounter pages;
- shareable output;
- saved transcripts;
- Memory, Archive, Canon, Continuity, Integrity, vector, or source retrieval;
- queue/worker behavior;
- Redis or Cloudflare behavior;
- billing or social behavior;
- provider payload, raw prompt, private persona note, raw owner id, raw persona
  id, model config, base URL, key, SQL detail, stack trace, token, cookie, or
  env value readback.

## Result

Record the hosted proof result in:

```text
docs/roadmap/PR505B_OWNER_ENCOUNTER_HOSTED_EMPTY_GUARD_RERUN_RESULT.md
```

Then wake MIMIR with pass/block verdict.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR505A owner encounter empty reply guard.
- Hosted @station/api is fresh on PR505A code commit 28411374e523 and ready.
- PR505B is the hosted rerun against that guard.
Task:
- Rerun hosted owner encounter proof.
- Send exactly one same-owner disposable preview request.
- Pass only if status 200 has nonblank responder content and disposable provenance.
- If status 502 / persona_encounter_provider_empty_reply appears, stop and wake MIMIR: guard works but provider output is still empty.
- Preserve signed-out/cross-owner/public/no-drift/privacy checks and record the result.
```
