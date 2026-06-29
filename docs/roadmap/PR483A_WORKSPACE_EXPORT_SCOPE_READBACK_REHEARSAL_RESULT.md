# PR483A Workspace Export Scope Readback Hosted Rehearsal Result

Date: 2026-06-29

Owner: ARIADNE / A4

Status: PASS_READY_TO_CLOSE

## Verdict

ARIADNE passes PR483A hosted owner read-only proof.

The signed-in owner `/studio/export` route on hosted Railway shows the
workspace scope readback on desktop and 390px mobile. The page clearly frames
current export truth as scoped owner-only JSON/Markdown readback, not a global
workspace export job, package-creation surface, public export surface, PDF
generator, binary archive, Station Press package, backup service, or restore
drill.

## Hosted Target

- Hosted web/API health checks were ready on commit `4494639`.
- Replay-owner API sign-in and `/auth/me` succeeded; session values were not
  printed or recorded.
- Browser proof used the hosted route:
  `https://stationweb-production.up.railway.app/studio/export`.

## Required UI Checks

| Check | Result | Notes |
| --- | --- | --- |
| Desktop `/studio/export` | Pass | Workspace scope readback rendered with no missing required rows. |
| 390px mobile `/studio/export` | Pass | Workspace scope readback rendered with no missing required rows. |
| Live scoped package classes | Pass | Persona archive, Developer Space archive, and Project manifest package classes were visible as owner-readable labels; source package kinds remain `persona_archive`, `developer_space_archive`, and `project_manifest`. |
| Future/unavailable rows | Pass | Full workspace bundle, original file packaging, PDF/binary/Station Press, managed backup/redundancy/restore, and shareable/private URLs were all visible. |
| Excluded material rows | Pass | Raw private source bodies, storage/download internals, and credential/provider material were all visible. |
| Desktop layout | Pass | No horizontal overflow or detected out-of-viewport visible nodes. |
| 390px mobile layout | Pass | No horizontal overflow or detected out-of-viewport visible nodes. |

## Safety Checks

| Check | Result | Notes |
| --- | --- | --- |
| Browser-observed mutations | Pass | Loading and inspecting the route triggered no browser-observed `POST`, `PUT`, `PATCH`, or `DELETE` requests. |
| Package creation/download | Pass | No package creation, bundle opening, bundle download, public export route, signed URL, or shareable/private package URL was triggered. |
| Sensitive visible readback | Pass | No visible URL value, storage path, raw private source body, archive snippet, document body, prompt, provider payload, SQL/table detail, stack trace, hosted log, credential, cookie, token, raw UUID, billing object id, or secret-shaped value was detected. |
| Scope boundaries | Pass | No storage, schema, migration, worker/queue, Redis, Cloudflare, billing/Stripe, provider/model, backup, restore, PDF, binary, original-file package, or external config behavior was exercised. |

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted web health | Pass | Ready on commit `4494639`; deployment ids were not recorded. |
| Hosted API health | Pass | Ready on commit `4494639`; deployment ids were not recorded. |
| Temporary CDP browser rehearsal | Pass | Desktop and 390px mobile route proof passed; replay-owner session values were not printed or committed. |

## MIMIR Handoff

Verdict:

```text
PASS_READY_TO_CLOSE
```

Task:

- Close PR483A as hosted-proven unless MIMIR wants exact raw package-kind ids
  shown in the owner UI instead of the current human-readable labels.
