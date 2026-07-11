# PR504E - Station Press Owner Package Browser Closeout Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
BLOCK_PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_WITH_HUMAN_FLOW_BLOCKER
```

## Scope

ARIADNE ran the hosted `/studio/publishing` human-eye browser closeout requested
in:

`docs/roadmap/PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

The proof did not record credentials, cookies, auth tokens, raw owner ids, raw
document ids, raw package ids, raw route ids, private bodies, source rows,
storage paths, signed URLs, SQL details, stack traces, prompts, transcripts,
provider payloads, or env values.

## Verdict

PR504D's backend repair is confirmed from the hosted browser path, but PR504E
does not close because the visible `/studio/publishing` UI still does not expose
the package bundle readback.

The exact human-flow blocker:

- the browser can create a Station Press owner metadata package;
- the authenticated API can read back the package;
- the authenticated API can read back the exact three bundle files;
- the UI only shows package completion copy and does not show a bundle readback
  panel, file list, or `View bundle files` action.

## Hosted Reachability

- Hosted web reached `/studio/publishing` in an authenticated browser context.
- Hosted API health returned `200`.
- The app did not expose a deploy commit through the probed health response.

Auth checks passed:

- owner sign-in returned `200` with `canon` tier;
- cross-owner sign-in returned `200` with `private` tier.

## Hosted Fixture

The hosted owner still has package-ready material:

- owner document count: `28`;
- owner Space count: `1`;
- package-ready owner publication count: `5`.

This was not a fixture-limitation case.

## Browser Flow

Desktop `/studio/publishing` rendered the Station Press package surface and
ARIADNE performed exactly one allowed owner package creation request from a
package-ready publication.

Observed results:

| Check | Result |
| --- | --- |
| Station Press surface present | Pass |
| Create buttons visible | `5` |
| Browser create performed | Yes |
| Create status | `201` |
| UI success notice | `Station Press metadata package readback is ready.` |
| UI package status copy | `Latest owner metadata package is complete.` |
| Visible bundle readback | Blocked |
| Visible bundle files | None shown |

The visible page did not show:

```text
README.md
manifest.json
manifest.md
```

It also did not expose a bundle readback panel or a `View bundle files` action.

## Package Readback

Authenticated owner API readback passed:

| Check | Result |
| --- | --- |
| Package readback | `200` |
| Package kind | `station_press_publication` |
| Package status | `completed` |

Authenticated owner bundle readback passed:

| Check | Result |
| --- | --- |
| Bundle readback | `200` |
| Bundle files | `README.md`, `manifest.json`, `manifest.md` |
| Exact three-file bundle | Pass |
| Bundle file privacy scan | Pass |

## Layout

Desktop and mobile visual-fit checks passed:

| Viewport | Result |
| --- | --- |
| Desktop `1440px` | No horizontal overflow |
| Mobile `390px` | No horizontal overflow |

Screenshots were captured and inspected through the normal temporary rehearsal
pattern. They are not committed.

## Boundary Checks

Fail-closed probes passed:

| Probe | Result |
| --- | --- |
| Signed-out create | `401` |
| Signed-out list | `401` |
| Signed-out readback | `401` |
| Signed-out bundle | `401` |
| Cross-owner create | `404` |
| Cross-owner list | `404` |
| Cross-owner readback | `404` |
| Cross-owner bundle | `404` |

## Privacy And Product Boundary

Visible UI scans passed:

- no raw ids;
- no secrets;
- no storage paths;
- no signed URLs;
- no SQL errors or stack traces;
- no provider payloads;
- no private/source bodies;
- no cookies, tokens, or env values;
- no public package URL, public download, launch, PDF/binary, print,
  fulfillment, social, billing, queue/worker, Redis, Cloudflare, storage-object,
  or provider/model claim.

Bundle file-content scans passed for the same boundary. The proof only inspected
the stored owner-only readback; it did not expose or commit package bodies.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser proof runner | Blocked | Backend and boundary checks passed; visible UI bundle readback was absent. |
| Hosted reachability | Pass | Browser reached hosted `/studio/publishing`; API health returned `200`; no deploy commit was exposed by the probed health response. |
| Owner and cross-owner auth | Pass | Owner tier `canon`; cross-owner tier `private`. |
| Hosted fixture readiness | Pass | Five package-ready owner publications were present. |
| Desktop and 390px mobile layout | Pass | No horizontal overflow. |
| Browser create | Pass | One allowed Station Press create request returned `201`. |
| Package readback | Pass | Authenticated owner package readback returned `200`, kind `station_press_publication`, status `completed`. |
| Bundle readback | Pass | Authenticated owner bundle readback returned `200` with exactly `README.md`, `manifest.json`, and `manifest.md`. |
| Visible bundle readback | Blocked | `/studio/publishing` did not expose a bundle readback panel, file list, or `View bundle files` action. |
| Signed-out/cross-owner probes | Pass | Signed-out returned `401`; cross-owner returned `404` for create/list/readback/bundle. |
| Privacy/product-boundary scan | Pass | Visible UI and bundle file-content scans stayed within owner-only metadata scope. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE ran PR504E hosted /studio/publishing browser closeout.
- PR504D backend repair is confirmed from the browser path: owner create returned 201, package readback returned 200, and bundle readback returned 200 with exactly README.md, manifest.json, and manifest.md.
- Desktop and 390px mobile fit passed.
- Signed-out create/list/readback/bundle returned 401; cross-owner create/list/readback/bundle returned 404.
- Visible UI and bundle file-content privacy/product-boundary scans passed.
- Human-flow blocker remains: /studio/publishing only shows metadata package completion copy and does not expose a bundle readback panel, README.md / manifest.json / manifest.md file list, or View bundle files action.
Verdict:
- BLOCK_PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_WITH_HUMAN_FLOW_BLOCKER.
Next:
- Decide whether DAEDALUS gets a narrow /studio/publishing UI patch to load package readback and bundle files, or whether Station Press owner package closeout can accept API-only bundle proof.
```
