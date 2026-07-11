# PR509B - Public Encounter Exhibit Index Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF
```

## Scope

ARIADNE ran the hosted public encounter exhibit index proof requested in:

`docs/roadmap/PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF_ARIADNE.md`

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

PR509B passes. Hosted web and API deployments include PR509A, the public list
API returns bounded metadata-only rows, `/encounters` renders cleanly on desktop
and `390px` mobile, cards link only to detail routes, report controls remain
detail-only, removed/retracted rows stay absent, owner-retracted moderation
restore protection still holds, Discover/search/feed/public persona/public
Space/forum/public document surfaces do not pick up encounter exhibits, latency
is acceptable for protected alpha, and cleanup removed the proof artifact and
proof report.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health/deployment | `200`, ready |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `b0a116bdc192` |
| Hosted web includes PR509A floor `b0a116bd` | Pass |
| Hosted API health/deployment | `200`, ready |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `b0a116bdc192` |
| Hosted API includes PR509A floor `b0a116bd` | Pass |

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

Hosted started with zero public encounter exhibits. ARIADNE created exactly one
disposable source-backed private artifact and one metadata-only public exhibit
for the proof, then deleted both during cleanup.

| Check | Result |
| --- | --- |
| Pre-existing public exhibit count | `0` |
| Pre-existing next cursor | Absent |
| Owner had at least two personas for source backing | Pass |
| Private artifact created | Yes |
| Private-only artifact hidden from public list | Pass |
| Public exhibit created | Yes |
| Created public exhibit count | `1` |

No private setup body, generated reply text, private curation text, raw ids, or
provider material was recorded.

## Public List API

| Check | Result |
| --- | --- |
| `GET /persona-encounters/public-exhibits` | `200` |
| Default list latency | `883ms` |
| Default limit | `12` |
| Default item count during proof | `1` |
| Proof exhibit present | Yes |
| Payload metadata-only | Pass |
| List route href points only to `/encounters/[slug]` | Pass |
| `limit=0` | `200`, clamped to `1` |
| `limit=99` | `200`, clamped to `24` |
| `limit=99` response bounded | Pass |
| `limit=1` | `200`, one item |
| Invalid cursor | `400` |
| First-page cursor present | No, because hosted had only the proof row |
| Public-only cursor continuation | `200`, empty page |
| Cursor payload public-only | Pass, decoded to `publishedAt` plus public slug only |

Latency is acceptable for protected alpha. No separate partial-index repair is
recommended from this run.

## Browser Layout

| Viewport | Status | Cards | Horizontal overflow | Card fit | Card links | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop | `200` | `1` | None | Pass | Detail-only | Pass |
| `390px` mobile | `200` | `1` | None | Pass | Detail-only | Pass |

Index cards did not expose report controls and did not show private proof
markers.

## Report Detail Only

| Check | Result |
| --- | --- |
| Public detail API | `200` |
| Detail API exposes report path | Yes |
| List payload omits report object | Yes |
| Detail payload metadata-only | Pass |
| Index report controls absent | Pass |
| Detail report control present | Pass |
| Detail private markers absent | Pass |

## Removal, Retract, And Restore Protection

| Check | Result |
| --- | --- |
| Signed-out report attempt | `401` |
| Signed-in report by public slug | `201` |
| Report row found | Yes |
| Report target id is UUID | Yes |
| Admin queue | `200` |
| Admin report found | Yes |
| Admin target context safe | Yes |
| Admin remove | `200` |
| List after remove | Absent |
| Detail API after remove | `404` |
| Admin restore | `200` |
| List after restore | Present |
| Detail API after restore | `200` |
| Owner retract | `200` |
| List after owner retract | Absent |
| Detail API after owner retract | `404` |
| Retracted admin supported actions | Empty |
| Admin remove after owner retract | `400` |
| Admin restore after owner retract | `400` |
| Detail API after blocked moderation | `404` |
| Report/admin readback safe | Pass |

## Public No-Drift

While the proof exhibit existed, ARIADNE sampled public surfaces outside
`/encounters` and `/encounters/[slug]`.

| Check | Result |
| --- | --- |
| Discover search API | `200`, no exhibit/private artifact surfacing |
| Discover feed API | `200`, no exhibit/private artifact surfacing |
| Forum categories API | `200`, no exhibit/private artifact surfacing |
| Public Space API sample | `200`, no exhibit/private artifact surfacing |
| Public persona API sample | `200`, no exhibit/private artifact surfacing |
| Discover page | `200`, no exhibit/private artifact surfacing |
| Forums page | `200`, no exhibit/private artifact surfacing |
| Public Space page | `200`, no exhibit/private artifact surfacing |
| Public persona page | `200`, no exhibit/private artifact surfacing |
| Public document page | `200`, no exhibit/private artifact surfacing |

## Cleanup

| Check | Result |
| --- | --- |
| Owner delete | `200` |
| Public detail after delete | `404` |
| Public list after delete | Absent |
| Proof report cleanup | Deleted |
| Hosted proof DB rows removed | Yes |

## Privacy And Product Boundary

Sanitized proof output and sampled public/report/admin readbacks exposed no:

- raw owner ids;
- source persona ids;
- private session ids;
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
| Temporary hosted API/browser proof runner | Pass | Exactly one disposable source-backed public exhibit was created; index, report-detail-only, moderation, no-drift, latency, privacy, and cleanup checks passed. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `b0a116bdc192`, which includes PR509A floor `b0a116bd`. |
| Public list API | Pass | Bounded metadata-only list returned `200`; default latency was `883ms`; `limit` clamped to `1..24`; invalid cursor returned `400`; public-only cursor continuation returned `200`. |
| Desktop and `390px` `/encounters` layout | Pass | Cards fit without horizontal overflow and linked only to detail routes. |
| Report-detail-only behavior | Pass | Index omitted report controls; detail retained report control/path. |
| Hidden/retracted/removed absence | Pass | Private-only artifact, removed exhibit, and owner-retracted exhibit were absent from list/detail. |
| Owner-retracted restore protection | Pass | Retracted target exposed no supported admin actions; admin remove/restore returned `400` and detail stayed `404`. |
| Public no-drift | Pass | Discover/search/feed, public persona, public Space, forum, and public document samples did not surface the proof exhibit outside `/encounters`. |
| Cleanup verification | Pass | Proof artifact and proof report were deleted; public detail returned `404`; public list no longer included the proof exhibit. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, env values, or browser artifacts. |

`pnpm typecheck` was not run because the PR509B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR509B hosted public encounter exhibit index proof.
- Hosted web and API health/deployment passed at commit prefix `b0a116bdc192` for `@station/web` and `@station/api`; both include PR509A floor `b0a116bd`.
- Owner, non-owner, and admin auth passed; owner tier was canon, non-owner tier was private, and admin capability was present.
- Hosted began with zero public encounter exhibits, so ARIADNE created exactly one disposable source-backed private artifact and one metadata-only public exhibit, then cleaned both up.
- Public list API returned 200 with bounded metadata-only payloads; default list latency was 883ms, acceptable for protected alpha.
- Limit clamped to 1..24, invalid cursor returned 400, and public-only cursor continuation returned 200 with an empty page because only the proof row existed.
- Desktop and 390px `/encounters` rendered one card without horizontal overflow; card links were detail-only.
- Report controls remained absent from the index and present only on detail.
- Private-only, moderation-removed, and owner-retracted exhibits stayed absent from list/detail.
- Owner-retracted restore protection held: retracted admin actions were empty, admin remove/restore returned 400, and detail stayed 404.
- Discover/search/feed, public persona, public Space, forum, and public document samples did not surface encounter exhibits outside `/encounters`.
- Cleanup deleted the proof artifact and proof report row.
Verdict:
- PASS_PR509B_PUBLIC_ENCOUNTER_EXHIBIT_INDEX_HOSTED_PROOF.
Task:
- Close PR509B if accepted, or route any narrow follow-up.
```
