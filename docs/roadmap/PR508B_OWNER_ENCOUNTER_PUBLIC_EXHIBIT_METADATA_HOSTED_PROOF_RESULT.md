# PR508B - Owner Encounter Public Exhibit Metadata Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
BLOCK_PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_REPORT_CREATE
```

## Scope

ARIADNE ran the focused hosted proof requested in:

`docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_ARIADNE.md`

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

PR508B is blocked on hosted signed-in report creation for metadata-only public
encounter exhibits.

The hosted deployment and migration are fresh, owner publish/retract works,
desktop and `390px` Studio controls fit, the signed-out public route is
metadata-only, boundary probes fail closed, no-drift checks pass, privacy scan
passes, and cleanup succeeds.

The required report/takedown proof cannot pass because signed-in report creation
for the public exhibit returned `500`. The hosted schema probe shows the
`moderation_reports` target constraint accepts
`persona_encounter_public_exhibit`, but `moderation_reports.target_id` is still
`uuid` while the public exhibit report route writes the public exhibit slug as
the report target. That blocks report creation before an admin report row exists.

Because no report row is created, ARIADNE could not prove admin remove/restore
for the hosted public exhibit. Do not close PR508B as passed.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health | `200` |
| Hosted web deployment ready | `true` |
| Hosted web service | `@station/web` |
| Hosted web branch | `main` |
| Hosted web commit prefix | `acb63c4fe4f8` |
| Hosted web includes PR508A floor `acb63c4f` | Pass |
| Hosted API health | `200` |
| Hosted API deployment ready | `true` |
| Hosted API service | `@station/api` |
| Hosted API branch | `main` |
| Hosted API commit prefix | `acb63c4fe4f8` |
| Hosted API includes PR508A floor `acb63c4f` | Pass |

## Hosted Migration 076

ARIADNE re-probed the hosted schema before browser/API product proof:

| Check | Result |
| --- | --- |
| Migration ledger row | Present |
| Ledger version | `20260711104902` |
| Ledger name | `076_persona_encounter_public_exhibits` |
| Public exhibit columns | `18/18` |
| Public exhibit constraints | `12/12` |
| Public exhibit policies | `4/4` |
| Public exhibit triggers | `2/2` |
| Moderation report target accepts exhibit type | Pass |
| Moderation report target id column type | `uuid` |
| Valid tag array accepted | Pass |
| Null tag array rejected | Pass |

## Auth And Persona Availability

Auth checks passed:

- owner sign-in returned `200`;
- owner `/auth/me` returned `200` with `canon` tier;
- non-owner sign-in returned `200`;
- non-owner `/auth/me` returned `200` with `private` tier;
- admin sign-in returned `200`;
- admin `/auth/me` returned `200` with admin capability.

The hosted owner account had `5` personas available. ARIADNE selected two
same-owner personas and did not record raw persona ids.

## Private Candidate Artifact

ARIADNE created exactly one saved private same-owner artifact for proof.

| Check | Result |
| --- | --- |
| Cross-owner persona source create attempt | `403` |
| Saved artifact create | `201` |
| Opaque session id present | Yes |
| Setup stored | Yes |
| Reply generated | Yes |
| Artifact private | Yes |
| Artifact owner-only | Yes |
| Saved | Yes |
| Public | No |
| Shareable | No |
| Source retrieval | No |
| Signed-out publish attempt | `401` |
| Cross-owner publish attempt | `404` |
| Non-candidate publish attempt | `400` |
| Malformed publish body | `400` |
| Forbidden-field publish body | `400` |
| Private candidate curation update | `200` |
| Candidate flag enabled | Yes |
| Readiness route | `200`, `ready:true` |

No private setup body or generated reply text was recorded.

## Owner Studio Publish

Desktop owner Studio published the metadata-only public exhibit from the private
candidate artifact.

| Check | Result |
| --- | --- |
| Desktop publish response | `201` |
| Owner detail after publish | `200` |
| Public slug present | Yes |
| Owner readback status | `published` |
| Public title readback matched | Yes |
| Public summary readback matched | Yes |
| Public tags readback matched | Yes |
| Desktop public form present | Yes |
| Desktop horizontal overflow | No |
| Desktop controls clipped | No |
| `390px` horizontal overflow | No |
| `390px` controls clipped | No |
| `390px` open-public-exhibit control visible | Yes |
| `390px` retract control visible | Yes |

## Signed-Out Public Route

The dedicated public route passed before owner retract:

| Check | Result |
| --- | --- |
| Public exhibit API read | `200` |
| Public web route showed owner-authored public metadata | Yes |
| Public API shape excluded private material and raw private ids | Yes |
| Public page excluded private material | Yes |
| Sign-in-to-report copy visible | Yes |

The route showed only owner-authored public title, public summary, public tags,
safe same-owner display-name snapshots, public provenance, and sign-in-to-report
copy.

## Report And Moderation Blocker

| Check | Result |
| --- | --- |
| Signed-out report attempt | `401` |
| Signed-in report attempt | `500` |
| Report row created | No |
| Admin queue checked | Not applicable; no report row existed |
| Admin remove | Not applicable; no report row existed |
| Admin restore | Not applicable; no report row existed |
| Owner retract | `200` |
| Public route after owner retract | `404` |

Blocker:

- the public exhibit report route attempts to persist the public exhibit slug as
  `moderation_reports.target_id`;
- hosted `moderation_reports.target_id` is still typed as `uuid`;
- report creation returns `500`, so admin takedown cannot be proven.

## Public No-Drift

While the exhibit existed, ARIADNE sampled public Discover/search/forum and
public Space/persona surfaces outside the dedicated `/encounters/[slug]` route.

| Check | Result |
| --- | --- |
| Discover search API | `200`, no exhibit/private artifact surfacing |
| Discover feed API | `200`, no exhibit/private artifact surfacing |
| Forum categories API | `200`, no exhibit/private artifact surfacing |
| Public Space sample | `200`, no exhibit/private artifact surfacing |
| Public persona sample | `200`, no exhibit/private artifact surfacing |
| Discover page | `200`, no exhibit/private artifact surfacing |
| Forums page | `200`, no exhibit/private artifact surfacing |

## Cleanup

| Check | Result |
| --- | --- |
| Owner delete | `200` |
| Owner detail after delete | `404` |
| Public route after delete | `404` |
| Proof report cleanup | No report row existed |

## Privacy And Product Boundary

Sanitized proof output and public/report snapshots exposed no:

- raw owner ids;
- raw persona ids;
- raw private session ids;
- private setup bodies;
- generated reply text;
- private curation text;
- provider keys;
- model config;
- prompt bodies;
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
| Temporary hosted browser/API runner | Blocked | Hosted report creation returned `500`; cleanup passed. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `acb63c4fe4f8`, which includes PR508A floor `acb63c4f`. |
| Hosted migration `076` re-probe | Pass | Ledger present, columns `18/18`, constraints `12/12`, policies `4/4`, triggers `2/2`, exhibit report target accepted, valid tags accepted, null tags rejected. |
| Owner, non-owner, and admin auth | Pass | Owner tier `canon`; non-owner tier `private`; admin capability present. |
| Same-owner persona availability | Pass | Owner persona count was `5`; selected raw persona ids were not recorded. |
| Negative publish probes | Pass | Signed-out, cross-owner, non-candidate, malformed body, forbidden-field, and cross-owner persona source attempts failed closed. |
| Desktop/390px Studio publish controls | Pass | Owner published metadata-only public exhibit; desktop and `390px` controls fit without horizontal overflow or clipping. |
| Signed-out public route | Pass | Dedicated route showed only metadata, same-owner display snapshots, provenance, and sign-in-to-report copy. |
| Report/takedown | Blocked | Signed-in report returned `500`; no admin report row existed, so admin remove/restore could not be proven. |
| Owner retract | Pass | Owner retract returned `200`; public route returned `404` afterward. |
| Public no-drift | Pass | Discover/search/forum and public Space/persona samples did not surface the proof artifact or exhibit outside `/encounters/[slug]`. |
| Cleanup verification | Pass | Owner delete returned `200`; follow-up owner detail returned `404`; public route returned `404`. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, env values, or browser artifacts. |

`pnpm typecheck` was not run because the PR508B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR508B hosted proof for owner encounter public exhibit metadata.
- Hosted web and API health/deployment passed at commit prefix `acb63c4fe4f8` for `@station/web` and `@station/api` on `main`; both include PR508A floor `acb63c4f`.
- Hosted migration `076` re-probe passed for ledger `20260711104902 / 076_persona_encounter_public_exhibits`, columns `18/18`, constraints `12/12`, policies `4/4`, triggers `2/2`, exhibit report target support, valid tags accepted, and null tags rejected.
- Owner, non-owner, and admin auth passed; owner tier was canon, non-owner tier was private, and admin capability was present.
- ARIADNE created exactly one saved same-owner private candidate artifact, proved signed-out/cross-owner/non-candidate/malformed/forbidden-field/cross-owner-persona attempts fail closed, and published metadata-only public exhibit from desktop Studio.
- Desktop and 390px Studio public exhibit controls fit without horizontal overflow or clipped controls.
- Signed-out public `/encounters/[slug]` showed metadata only, same-owner display snapshots, provenance, and sign-in-to-report copy; public route privacy scan passed.
- Blocker: signed-in report creation for the public exhibit returned 500. Hosted `moderation_reports.target_id` remains `uuid` while the public exhibit report route writes the public exhibit slug, so no report row exists and admin remove/restore cannot be proven.
- Owner retract returned 200 and hid the public route; no-drift samples for Discover/search/forum/public Space/public persona passed; cleanup deleted the proof artifact and public route stayed 404.
Verdict:
- BLOCK_PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_REPORT_CREATE.
Task:
- Route a narrow repair for public exhibit moderation report target persistence, then return PR508B to ARIADNE for hosted report/takedown rerun.
```
