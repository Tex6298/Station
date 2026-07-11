# PR510B - Public Encounter Exhibit Discover Search Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF
```

## Scope

ARIADNE ran the hosted Discover search proof requested in:

`docs/roadmap/PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_ARIADNE.md`

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

PR510B passes. Hosted web and API deployments include PR510A, `/discover/search`
returns the dedicated `publicEncounterExhibits` group, public title/summary/tag
and same-owner display snapshot searches find the proof row, payloads remain
metadata-only, result routes point only to `/encounters/[slug]`, unsafe rows
stay absent or are blocked by hosted constraints before surfacing, Discover
search renders cleanly on desktop and `390px` mobile, no-drift public surfaces
remain clean, latency is acceptable for protected alpha, cleanup removed the
proof artifact, and the privacy scan passed.

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health/deployment | `200`, ready |
| Hosted web service | `@station/web` |
| Hosted web commit prefix | `ad12809cddb4` |
| Hosted web includes PR510A floor `ad12809c` | Pass |
| Hosted API health/deployment | `200`, ready |
| Hosted API service | `@station/api` |
| Hosted API commit prefix | `ad12809cddb4` |
| Hosted API includes PR510A floor `ad12809c` | Pass |

## Auth

| Check | Result |
| --- | --- |
| Owner sign-in | `200` |
| Owner `/auth/me` | `200` |
| Owner tier | `canon` |
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
| Owner had at least two personas for source backing | Pass |
| Private artifact created | Yes |
| Public exhibit created | Yes |
| Created public exhibit count | `1` |

No private setup body, generated reply text, private curation text, raw ids, or
provider material was recorded.

## Discover Search API

| Check | Result |
| --- | --- |
| Empty search | `200`, `publicEncounterExhibits: []` |
| Title token search | `200`, found proof row |
| Title search latency | `757ms` |
| Summary token search | `200`, found proof row |
| Summary search latency | `712ms` |
| Tag token search | `200`, found proof row |
| Tag search latency | `872ms` |
| Initiator display snapshot search | `200`, found proof row |
| Initiator search latency | `642ms` |
| Responder display snapshot search | `200`, found proof row |
| Responder search latency | `797ms` |
| Search group count during proof | `1` |
| Search group bounded | Pass |
| Row label | `Public encounter exhibit` |
| Row type | `encounter_exhibit` |
| Provenance label | `Metadata-only public encounter exhibit` |
| Payload metadata-only | Pass |
| Route href | `/encounters/[slug]` only |
| Maximum measured search latency | `872ms` |
| Latency acceptable for protected alpha | Pass |

The public web group label rendered as `Encounter Exhibits`.

## Unsafe Row Absence

| Check | Result |
| --- | --- |
| Removed exhibit absent from search | Pass |
| Retracted exhibit absent from search | Pass |
| Wrong-schema mutation | Blocked by hosted constraint before surfacing |
| Malformed-slug mutation | Blocked by hosted constraint before surfacing |
| Missing-source mutation | Blocked by hosted constraint before surfacing |
| Deleted exhibit absent from search | Pass |

## Browser Layout

| Viewport | Status | Group visible | Exact slug link | Title token visible | Horizontal overflow | Result fit | Links | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | `200` | Pass | Pass | Pass | None | Pass | Detail-only | Pass |
| `390px` mobile | `200` | Pass | Pass | Pass | None | Pass | Detail-only | Pass |

The Discover search result did not expose private proof markers.

## Public No-Drift

While the proof exhibit existed, ARIADNE sampled public surfaces outside the
accepted search group and `/encounters`.

| Check | Result |
| --- | --- |
| Discover feed `new` API | `200`, no exhibit/private artifact surfacing |
| Discover feed `rising` API | `200`, no exhibit/private artifact surfacing |
| Discover feed `featured` API | `200`, no exhibit/private artifact surfacing |
| Forum categories API | `200`, no exhibit/private artifact surfacing |
| Forum subcommunities API | `200`, no exhibit/private artifact surfacing |
| Public Space API sample | `200`, no exhibit/private artifact surfacing |
| Public persona API sample | `200`, no exhibit/private artifact surfacing |
| Discover page without query | `200`, no exhibit/private artifact surfacing |
| Forums page | `200`, no exhibit/private artifact surfacing |
| Salon/subcommunity page | `200`, no exhibit/private artifact surfacing |
| Writing page | `200`, no exhibit/private artifact surfacing |
| Station Press owner page signed out | `200`, no exhibit/private artifact surfacing |
| Public Space page sample | `200`, no exhibit/private artifact surfacing |
| Public persona page sample | `200`, no exhibit/private artifact surfacing |
| Public document page sample | `200`, no exhibit/private artifact surfacing |

## Cleanup

| Check | Result |
| --- | --- |
| Public detail after delete | `404` |
| Search after delete | Absent |
| Proof report cleanup | None created |
| Hosted proof DB rows removed | Yes |

## Privacy And Product Boundary

Sanitized proof output and sampled public readbacks exposed no:

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
| Temporary hosted API/browser proof runner | Pass | Exactly one disposable source-backed public exhibit was created; Discover search, unsafe-row absence, no-drift, desktop/mobile rendering, latency, privacy, and cleanup checks passed. |
| Hosted reachability | Pass | Web/API health and deployment checks returned `200`; both services were ready at commit prefix `ad12809cddb4`, which includes PR510A floor `ad12809c`. |
| Discover search API | Pass | Empty search returned a bounded empty group; public title, summary, tag, initiator, and responder display snapshot searches found the metadata-only proof row. |
| Search routing | Pass | Search result hrefs route only to `/encounters/[slug]`. |
| Unsafe-row absence | Pass | Removed, retracted, and deleted rows were absent; wrong-schema, malformed-slug, and missing-source mutations were blocked by hosted constraints before surfacing. |
| Desktop and `390px` Discover search layout | Pass | The `Encounter Exhibits` group rendered, exact slug links were present, title tokens were visible, results fit, and no horizontal overflow was detected. |
| Public no-drift | Pass | Discover feed/rising/featured, public persona, public Space, forum/Salon, Station Press owner page signed out, writing, and public document samples did not surface the proof exhibit outside accepted search/detail scope. |
| Cleanup verification | Pass | Proof artifact rows were deleted; public detail returned `404`; search no longer included the proof exhibit. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, env values, or browser artifacts. |

`pnpm typecheck` was not run because the PR510B result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR510B hosted public encounter exhibit Discover search proof.
- Hosted web and API health/deployment passed at commit prefix `ad12809cddb4` for `@station/web` and `@station/api`; both include PR510A floor `ad12809c`.
- Owner and admin auth passed; owner tier was canon and admin capability was present.
- Hosted began with zero public encounter exhibits, so ARIADNE created exactly one disposable source-backed private artifact and one metadata-only public exhibit, then cleaned both up.
- Empty search returned a bounded empty `publicEncounterExhibits` group.
- Public title, summary, tag, initiator display snapshot, and responder display snapshot searches all returned the proof row.
- Search rows stayed metadata-only and routed only to `/encounters/[slug]`.
- The public search group label rendered as `Encounter Exhibits`.
- Removed, retracted, and deleted exhibits stayed absent; wrong-schema, malformed-slug, and missing-source mutations were blocked by hosted constraints before surfacing.
- Desktop and 390px Discover search rendering passed with exact slug links, visible title token, no horizontal overflow, and detail-only links.
- Discover feed/rising/featured, public persona, public Space, forum/Salon, Station Press owner page signed out, writing, and public document samples did not surface the proof exhibit outside accepted search/detail scope.
- Maximum measured hosted search latency was 872ms, acceptable for protected alpha.
- Cleanup deleted the proof artifact rows and privacy scan passed.
Verdict:
- PASS_PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF.
Task:
- Close PR510B if accepted, or route any narrow follow-up.
```
