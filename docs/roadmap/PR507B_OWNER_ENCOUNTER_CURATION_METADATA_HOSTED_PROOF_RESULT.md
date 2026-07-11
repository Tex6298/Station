# PR507B - Owner Encounter Curation Metadata Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR507B_OWNER_ENCOUNTER_CURATION_METADATA_HOSTED_PROOF
```

## Scope

ARIADNE ran the focused hosted proof requested in:

`docs/roadmap/PR507B_OWNER_ENCOUNTER_CURATION_METADATA_HOSTED_PROOF_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The proof did not record credentials, cookies, auth tokens, raw owner ids, raw
persona ids, raw session ids, prompt bodies, private setup bodies, generated
reply text, private curation text, provider keys, base URLs, model config, SQL
details, stack traces, provider payloads, env values, screenshots, traces,
videos, or browser storage state.

## Verdict

PR507B passes. Hosted web and API deployments were fresh enough for PR507A,
hosted migration `075` was re-probed successfully, the owner could create one
private same-owner encounter artifact, desktop and `390px` Studio could add,
edit, and clear owner-authored private curation metadata, public routes did not
expose the private artifact or metadata while it existed, auth boundaries failed
closed, and cleanup removed the test artifact.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health | `200` |
| Hosted web deployment health | `200` |
| Hosted web deployment ready | `true` |
| Hosted web service | `@station/web` |
| Hosted web branch | `main` |
| Hosted web commit prefix | `a23633f9d402` |
| Hosted web includes PR507A floor `a23633f9` | Pass |
| Hosted API health | `200` |
| Hosted API deployment health | `200` |
| Hosted API deployment ready | `true` |
| Hosted API service | `@station/api` |
| Hosted API branch | `main` |
| Hosted API commit prefix | `a23633f9d402` |
| Hosted API includes PR507A floor `a23633f9` | Pass |

## Hosted Migration 075

ARIADNE re-probed the hosted schema before browser/API product proof:

| Check | Result |
| --- | --- |
| Migration ledger row | Present |
| Ledger version | `20260711094206` |
| Ledger name | `075_persona_encounter_private_session_curation` |
| Curation columns | `5/5` |
| Curation constraints | `4/4` |
| Valid tag array accepted | Pass |
| Null tag array rejected | Pass |

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

## Saved Private Session Create

ARIADNE sent exactly one saved private same-owner session create request for
this proof.

| Check | Result |
| --- | --- |
| Saved create requests sent | `1` |
| Create status | `201` |
| Opaque session id present | Yes |
| Setup stored | Yes |
| Reply character count | `47` |
| Artifact private | Yes |
| Artifact owner-only | Yes |
| Artifact server-created | Yes |
| Saved | Yes |
| Transcript stored | No |
| Public | No |
| Shareable | No |
| Source retrieval | No |
| Source bucket count | `0` |
| Curation schema | `station.persona_encounter.private_session_curation.v1` |
| Initial curation fields empty | Yes |

No setup body or generated reply text was recorded.

## Owner Studio Curation Flow

Desktop owner Studio:

| Check | Result |
| --- | --- |
| Created artifact visible to owner | Pass |
| Add private title, note, tags, and candidate marker | Pass |
| Edit private title, note, tags, and candidate marker | Pass |
| Clear private title, note, tags, and candidate marker | Pass |
| No raw ids in visible text | Pass |
| No horizontal overflow | Pass |
| Curation controls stayed inside viewport | Pass |

`390px` owner Studio:

| Check | Result |
| --- | --- |
| Created artifact visible to owner | Pass |
| Add private title, note, tags, and candidate marker | Pass |
| Edit private title, note, tags, and candidate marker | Pass |
| Clear private title, note, tags, and candidate marker | Pass |
| No raw ids in visible text | Pass |
| No horizontal overflow | Pass |
| Curation controls stayed inside viewport | Pass |

The visible marker language remained private planning/candidate language only.
The proof did not add or observe public exhibit, share, publish, moderation, or
cross-owner consent controls.

## Owner Readback

| Check | Result |
| --- | --- |
| Owner list after curation flow | `200` |
| Owner detail after curation flow | `200` |
| Owner list contained created artifact | Yes |
| Owner detail matched created artifact | Yes |
| Readback avoided raw owner/persona ids and provider/prompt/SQL/share-control fields | Pass |
| Final curation state cleared | Pass |

## Boundary Checks

Fail-closed API probes passed:

| Probe | Result |
| --- | --- |
| Signed-out detail read | `401` |
| Signed-out curation update | `401` |
| Cross-owner list | `200`, did not contain created artifact |
| Cross-owner detail read | `404` |
| Cross-owner curation update | `404` |

## Public No-Drift While Metadata Existed

ARIADNE sampled public routes while private curation metadata existed on the
test artifact:

| Route | Result |
| --- | --- |
| Public Space route | `200`, no private setup/reply/curation material or encounter controls found |
| Public persona route | `200`, no private setup/reply/curation material or encounter controls found |

## Cleanup

| Check | Result |
| --- | --- |
| Owner delete | `200` |
| Owner delete confirmed | Yes |
| Owner detail after delete | `404` |
| Owner list after delete | `200` |
| Owner list after delete contained created artifact | No |

## Privacy And Product Boundary

The sanitized proof output exposed no:

- raw owner ids;
- raw persona ids;
- raw session ids;
- prompt bodies;
- private setup bodies;
- generated reply text;
- private curation text;
- provider keys;
- base URLs;
- model config;
- SQL details;
- stack traces;
- provider payloads;
- env values;
- bearer/JWT tokens;
- cookies;
- screenshots, traces, videos, or browser storage state.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted browser/API runner | Pass | Chromium launched; exactly one saved private artifact was created; desktop/390px curation add/edit/clear, public no-drift while metadata existed, auth boundaries, cleanup, and privacy scan passed. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `a23633f9d402`, which includes PR507A floor `a23633f9`. |
| Hosted migration `075` re-probe | Pass | Ledger present, columns `5/5`, constraints `4/4`, valid tags accepted, null tags rejected. |
| Owner and non-owner auth | Pass | Owner tier `canon`; non-owner tier `private`. |
| Same-owner persona availability | Pass | Owner persona count was `5`; selected raw persona ids were not recorded. |
| Owner readiness route | Pass | `ready:true`; provider route was ready before saved create. |
| Exactly one saved private create | Pass | One authenticated owner create POST was sent and returned `201`. |
| Saved session curation contract | Pass | Initial curation schema was present and private curation fields were empty before owner edits. |
| Desktop/390px Studio curation flow | Pass | Add/edit/clear worked for title, note, tags, and private candidate/planning marker; no raw ids, overflow, or clipped controls were observed. |
| Owner list/detail | Pass | Owner list and detail returned the created artifact after curation flow and final curation state was cleared. |
| Signed-out/cross-owner API probes | Pass | Signed-out detail/update returned `401`; cross-owner list omitted the artifact; cross-owner detail/update returned `404`. |
| Public no-drift while metadata existed | Pass | Public Space/persona samples showed no private artifact/setup/reply/curation material or owner-encounter controls. |
| Cleanup verification | Pass | Owner delete returned `200`; follow-up owner detail returned `404`; owner list omitted the artifact. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, env values, or browser artifacts. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |

`pnpm typecheck` was not run because the PR507B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR507B hosted proof for owner encounter curation metadata.
- Hosted web and API health/deployment passed at commit prefix `a23633f9d402` for `@station/web` and `@station/api` on `main`; both include PR507A floor `a23633f9`.
- Re-probed migration `075`: ledger present `20260711094206 / 075_persona_encounter_private_session_curation`, columns `5/5`, constraints `4/4`, valid tags accepted, and null tags rejected.
- Owner and non-owner auth passed; owner tier was canon and non-owner tier was private.
- Same-owner persona availability passed with 5 owner personas; readiness returned ready:true.
- ARIADNE created exactly one saved private same-owner artifact for proof, verified empty curation shape, then used desktop and 390px Studio to add, edit, and clear private title, private note, private tags, and the private candidate/planning marker.
- Owner list/detail readback passed without raw owner/persona ids, provider detail, prompt detail, SQL detail, or share-control fields; final curation state was cleared.
- Signed-out curation read/update returned 401; cross-owner list omitted the artifact, and cross-owner detail/update returned 404.
- Public Space/persona samples while curation metadata existed showed no private artifact/setup/reply/curation material or encounter controls.
- Cleanup deleted the artifact; follow-up owner detail returned 404 and owner list omitted it.
- Sanitized proof output and privacy scan passed.
Verdict:
- PASS_PR507B_OWNER_ENCOUNTER_CURATION_METADATA_HOSTED_PROOF.
Task:
- Close PR507B if accepted, or route any follow-up wording.
```
