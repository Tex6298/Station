# PR508D - Owner Encounter Public Exhibit Report/Takedown Hosted Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN
```

## Scope

ARIADNE ran the hosted report/takedown rerun requested in:

`docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The proof did not record credentials, cookies, auth tokens, raw owner ids,
source persona ids, private session ids, prompt bodies, private setup bodies,
generated reply text, transcript excerpts, private curation text, provider
keys, base URLs, model config, SQL details, stack traces, provider payloads,
env values, screenshots, traces, videos, browser storage state, bearer values,
or secret-shaped strings.

## Verdict

PR508D passes. Hosted web and API deployments include the PR508C repair floor,
migration `076` remains compatible, signed-in public exhibit reporting by slug
returns `201`, hosted moderation reports persist the public exhibit UUID rather
than the slug, duplicate reports are bounded, admin queue/remove/restore works
from the UUID target, owner-retracted protection holds, no-drift checks pass,
privacy scan passes, and cleanup deleted the proof artifact and proof report.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health | `200` |
| Hosted web deployment ready | `true` |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `e573945f3aed` |
| Hosted web includes PR508C floor `e573945f` | Pass |
| Hosted API health | `200` |
| Hosted API deployment ready | `true` |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `e573945f3aed` |
| Hosted API includes PR508C floor `e573945f` | Pass |

## Hosted Migration 076

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

## Auth

| Check | Result |
| --- | --- |
| Owner sign-in | `200` |
| Owner `/auth/me` | `200` |
| Owner tier | `canon` |
| Non-owner sign-in | `200` |
| Non-owner `/auth/me` | `200` |
| Non-owner tier | `private` |
| Admin sign-in | `200` |
| Admin `/auth/me` | `200` |
| Admin capability | Present |

## Proof Artifact

ARIADNE created exactly one disposable same-owner private candidate artifact for
the rerun.

| Check | Result |
| --- | --- |
| Owner persona list | `200` |
| Owner persona count | `5` |
| Private artifact create | `201` |
| Created artifact count | `1` |
| Opaque session id present | Yes |
| Candidate curation update | `200` |
| Candidate flag enabled | Yes |
| Public exhibit publish | `201` |
| Public slug present | Yes |
| Exhibit status | `published` |
| Public metadata readback matched | Yes |

No private setup body, generated reply text, private curation text, or raw ids
were recorded.

## Public Route

| Check | Result |
| --- | --- |
| Public exhibit API read | `200` |
| Public web metadata visible | Yes |
| Public route remained slug-based | Yes |
| Public route remained metadata-only | Yes |

The dedicated public route exposed owner-authored public metadata, same-owner
display snapshots, public provenance, and sign-in/report affordance only.

## Report And Takedown

| Check | Result |
| --- | --- |
| Signed-out report attempt | `401` |
| Signed-in report by public slug | `201` |
| Report row created | Yes |
| Hosted target row found | Yes |
| Target id is UUID | Yes |
| Target id matches public exhibit id | Yes |
| Target id is not the public slug | Yes |
| Duplicate report by slug | `200` |
| Duplicate behavior bounded | Yes |
| Admin queue | `200` |
| Admin report found | Yes |
| Admin context safe | Yes |
| Admin remove | `200` |
| Public route after remove | `404` |
| Removed exhibit report attempt | `404` |
| Admin restore | `200` |
| Public route after restore | `200` |
| Malformed slug report attempt | `404` |
| Missing slug report attempt | `404` |
| Owner retract | `200` |
| Public route after owner retract | `404` |
| Retracted exhibit report attempt | `404` |
| Retracted admin supported actions | Empty |
| Admin remove after owner retract | `400` |
| Admin restore after owner retract | `400` |
| Public route after blocked moderation | `404` |
| Report/admin readback safe | Yes |

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
| Proof report cleanup | Deleted |

## Privacy And Product Boundary

Sanitized proof output and public/report/admin snapshots exposed no:

- raw owner ids;
- source persona ids;
- raw private session ids;
- private setup bodies;
- generated reply text;
- transcript excerpts;
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
| Temporary hosted browser/API runner | Pass | Exactly one private candidate artifact was created; report/takedown rerun passed; cleanup removed the proof artifact and proof report row. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `e573945f3aed`, which includes PR508C floor `e573945f`. |
| Hosted migration `076` compatibility | Pass | Ledger present, columns `18/18`, constraints `12/12`, policies `4/4`, triggers `2/2`, target id type `uuid`, exhibit report target accepted, valid tags accepted, null tags rejected. |
| Owner, non-owner, and admin auth | Pass | Owner tier `canon`; non-owner tier `private`; admin capability present. |
| Public route | Pass | Slug-based route remained metadata-only. |
| Report creation and duplicate report | Pass | Signed-in report by slug returned `201`; duplicate by slug returned bounded `200` duplicate response. |
| Report target UUID proof | Pass | Hosted moderation report target matched the public exhibit UUID and was not the public slug. |
| Admin queue/remove/restore | Pass | Admin queue resolved safe metadata context from UUID, remove hid the route, and restore reopened the removed published exhibit. |
| Owner-retracted protection | Pass | Owner retract hid the route; retracted admin actions were empty; admin remove/restore attempts returned `400` and route stayed `404`. |
| Missing/malformed/removed/retracted report attempts | Pass | All failed closed with `404`; signed-out report failed closed with `401`. |
| Public no-drift | Pass | Discover/search/forum and public Space/persona samples did not surface the proof artifact or exhibit outside `/encounters/[slug]`. |
| Cleanup verification | Pass | Owner delete returned `200`; owner detail returned `404`; public route returned `404`; proof report cleanup deleted the proof row. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, env values, or browser artifacts. |

`pnpm typecheck` was not run because the PR508D result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR508D hosted report/takedown rerun for owner encounter public exhibits.
- Hosted web and API health/deployment passed at commit prefix `e573945f3aed` for `@station/web` and `@station/api`; both include PR508C floor `e573945f`.
- Hosted migration `076` compatibility re-probe passed: ledger `20260711104902 / 076_persona_encounter_public_exhibits`, columns `18/18`, constraints `12/12`, policies `4/4`, triggers `2/2`, report target support, `moderation_reports.target_id` type `uuid`, valid tags accepted, and null tags rejected.
- Owner, non-owner, and admin auth passed; owner tier was canon, non-owner tier was private, and admin capability was present.
- ARIADNE created exactly one same-owner private candidate artifact, published one metadata-only public exhibit, and confirmed the dedicated public route remained slug-based and metadata-only.
- Signed-in report by public slug returned 201; hosted moderation report target id was UUID, matched the public exhibit id, and was not the public slug.
- Duplicate report by slug returned bounded 200 duplicate behavior.
- Admin queue resolved safe UUID target context; admin remove hid the public route; admin restore reopened the eligible removed published exhibit.
- Signed-out, missing, malformed, removed, and retracted report attempts failed closed; owner-retracted admin actions were empty, admin remove/restore after owner retract returned 400, and the public route stayed 404.
- Public no-drift and privacy scans passed.
- Cleanup deleted the proof artifact and proof report row.
Verdict:
- PASS_PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN.
Task:
- Close PR508D/PR508B if accepted, or route any final follow-up.
```
