# PR506B - Owner Encounter Private Session Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
BLOCK_PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_BROWSER_TOOLING
```

## Scope

ARIADNE ran the hosted owner-only private encounter session proof requested in:

`docs/roadmap/PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The proof did not record credentials, cookies, auth tokens, raw owner ids, raw
persona ids, raw session ids, prompt bodies, private context bodies, provider
keys, base URLs, model config, SQL details, stack traces, provider payloads,
generated reply text, token values, or env values.

## Verdict

PR506B is blocked because the required desktop and `390px` owner Studio UI proof
did not complete. The local browser runner could not import the Playwright
package in this install, and ARIADNE did not create a second saved artifact just
to retry the UI portion.

The hosted API and private-session contract did pass:

- hosted deployment floor was met before generation;
- exactly one saved private same-owner session create request was sent;
- create returned `201`;
- owner list/detail readback passed;
- signed-out and cross-owner API boundaries passed;
- cleanup deleted the created artifact;
- owner list after cleanup returned count `0`.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health | `200` |
| Hosted API health | `200` |
| Hosted API deployment health | `200` |
| Hosted API deployment ready | `true` |
| Hosted API service | `@station/api` |
| Hosted API branch | `main` |
| Hosted API commit prefix | `0a0373c561fc` |
| Deployment floor met | Pass |

The private-session table/migration behaved as present through hosted create,
list, detail, and delete routes.

## Auth And Persona Availability

Auth checks passed:

- owner sign-in returned `200`;
- owner `/auth/me` returned `200` with `canon` tier;
- non-owner sign-in returned `200`;
- non-owner `/auth/me` returned `200` with `private` tier.

The hosted owner account had `5` personas available. ARIADNE selected two
same-owner personas and did not record raw persona ids.

## Readiness

| Check | Result |
| --- | --- |
| Owner readiness route | `200` |
| Owner readiness state | `ready:true` |
| Owner readiness message | `Encounter preview provider is ready.` |

## Saved Private Session Create

ARIADNE sent exactly one saved private same-owner session create request.

| Check | Result |
| --- | --- |
| Saved create requests sent | `1` |
| Create status | `201` |
| Opaque session id present | Yes |
| Setup label | `Owner-authored setup` |
| Setup stored | Yes |
| Reply label | `Model-generated responder reply` |
| Reply role | `responder` |
| Reply character count | `61` |
| Reply generated flag | Yes |
| Artifact private | Yes |
| Artifact owner-only | Yes |
| Artifact server-created | Yes |
| Saved | Yes |
| Transcript stored | No |
| Public | No |
| Shareable | No |
| Source retrieval | No |
| Source bucket count | `0` |

No generated reply text was recorded.

## Owner Readback And Delete

| Check | Result |
| --- | --- |
| Owner list after create | `200` |
| Owner list contained created artifact | Yes |
| Owner detail after create | `200` |
| Owner detail matched created artifact | Yes |
| Owner detail reply character count | `61` |
| Cleanup delete | `200` |
| Cleanup delete confirmed | Yes |
| Owner list after cleanup | `200`, count `0` |

Because the browser runner failed before the planned owner delete/readback phase
inside the main proof runner, cleanup deleted the created artifact and a
follow-up owner list confirmed no private sessions remained.

## Boundary Checks

Fail-closed API probes passed:

| Probe | Result |
| --- | --- |
| Signed-out create | `401` |
| Signed-out list | `401` |
| Signed-out detail | `401` |
| Signed-out delete | `401` |
| Cross-owner create | `403` |
| Cross-owner create code | `persona_encounter_persona_not_owned` |
| Cross-owner list | `200`, did not contain created artifact |
| Cross-owner detail | `404` |
| Cross-owner delete | `404` |

## UI And Public Checks

Desktop and `390px` Studio UI proof:

```text
blocked: browser runner package unavailable
```

Public no-drift was checked only after cleanup, because the artifact had already
been deleted by the cleanup guard:

| Route | Result |
| --- | --- |
| Public Space route after cleanup | `200`, no owner-encounter controls or claims found |
| Public persona route after cleanup | `200`, no owner-encounter controls or claims found |

This is useful cleanup evidence, but it is not a substitute for the required
public no-drift proof while the saved artifact exists.

## Privacy And Product Boundary

The sanitized proof output exposed no:

- raw owner ids;
- raw persona ids;
- raw session ids;
- prompt bodies;
- private context bodies;
- generated reply text;
- provider keys;
- base URLs;
- model config;
- SQL details;
- stack traces;
- provider payloads;
- env values;
- bearer/JWT tokens;
- cookies.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API runner | Blocked | API create/list/detail/boundaries passed, but browser UI proof failed because the local browser package was unavailable. Cleanup deleted the created artifact. |
| Hosted reachability | Pass | Web health `200`; API health `200`; API deployment health `200`; API ready at `@station/api` commit prefix `0a0373c561fc`. |
| Owner and non-owner auth | Pass | Owner tier `canon`; non-owner tier `private`. |
| Same-owner persona availability | Pass | Owner persona count was `5`; selected raw persona ids were not recorded. |
| Owner readiness route | Pass | `ready:true`; provider route was ready before saved create. |
| Exactly one saved private create | Pass | One authenticated owner create POST was sent and returned `201`. |
| Saved session contract | Pass | Owner-authored setup stored, model-generated responder reply nonblank, private owner-only server-created artifact, saved/no transcript/not public/not shareable/no source retrieval/source buckets `0`. |
| Owner list/detail | Pass | Owner list and detail returned the created artifact before cleanup. |
| Signed-out/cross-owner API probes | Pass | Signed-out routes returned `401`; cross-owner create returned `403` with `persona_encounter_persona_not_owned`; cross-owner detail/delete returned `404`. |
| Owner cleanup verification | Pass | Cleanup delete returned `200`; follow-up owner list returned count `0`. |
| Desktop/390px Studio UI proof | Blocked | Browser runner package unavailable; no second saved artifact was created for retry. |
| Public no-drift while artifact exists | Blocked | Not completed because cleanup ran after the browser-tooling failure. |
| Public no-drift after cleanup | Pass | Public Space and public persona samples returned `200` with no owner-encounter controls or claims found. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private context bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, or env values. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE ran PR506B hosted proof for owner-only private encounter session artifacts.
- Hosted API deployment floor was checked before generation: `@station/api`, branch `main`, commit prefix `0a0373c561fc`, ready:true.
- Owner and non-owner auth passed; owner tier was canon and non-owner tier was private.
- Same-owner persona availability passed with 5 owner personas.
- Owner readiness returned ready:true.
- ARIADNE sent exactly one saved private same-owner encounter artifact create request.
- Create returned 201 with opaque session id present, owner-authored setup stored, nonblank model-generated responder reply, private owner-only server-created provenance, saved:true, transcriptStored:false, public:false, shareable:false, sourceRetrieval:false, sourceBuckets:0.
- Owner list/detail readback returned the created artifact before cleanup.
- Signed-out create/list/detail/delete returned 401.
- Cross-owner create returned 403 with persona_encounter_persona_not_owned; cross-owner list did not include the artifact; cross-owner detail/delete returned 404.
- Cleanup deleted the created artifact and follow-up owner list returned count 0.
- Public Space/persona samples after cleanup showed no owner-encounter controls or claims.
- Privacy/secret scan passed.
Verdict:
- BLOCK_PR506B_OWNER_ENCOUNTER_PRIVATE_SESSION_HOSTED_PROOF_BROWSER_TOOLING.
Blocker:
- Required desktop and 390px Studio UI proof was not completed because the local browser runner package is unavailable; ARIADNE did not create a second saved artifact without a new MIMIR lane.
Next:
- Decide whether to provide browser tooling for an ARIADNE rerun or route a narrower no-new-generation UI proof that uses a prepared artifact.
```
