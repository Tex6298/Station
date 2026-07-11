# PR504G - Station Press Visible Bundle Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR504G_STATION_PRESS_VISIBLE_BUNDLE_HOSTED_PROOF
```

## Scope

ARIADNE ran the hosted `/studio/publishing` browser proof requested in:

`docs/roadmap/PR504G_STATION_PRESS_VISIBLE_BUNDLE_HOSTED_PROOF_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

The proof did not record credentials, cookies, auth tokens, raw owner ids, raw
document ids, raw package ids, raw route ids, private bodies, source rows,
storage paths, signed URLs, SQL details, stack traces, prompts, transcripts,
provider payloads, or env values.

## Verdict

PR504G passes. Hosted `/studio/publishing` now includes the PR504F visible
owner-only Station Press bundle readback behavior.

The proof used an existing completed Station Press package. No browser create
was performed during this run.

## Hosted Reachability And Patch Evidence

- Hosted web reached `/studio/publishing` with status `200`.
- Hosted API health returned `200`.
- The probed health response did not expose a deploy commit.
- Hosted patch evidence was behavioral: a completed Station Press package
  exposed `View bundle files`, and the action opened visible owner-only bundle
  readback.

Auth checks passed:

- owner sign-in returned `200` with `canon` tier;
- cross-owner sign-in returned `200` with `private` tier;
- browser authenticated session reached `/studio/publishing`.

## Hosted Fixture

The hosted owner data had completed package material available:

- owner document count: `28`;
- owner Space count: `1`;
- package-ready owner publication count: `5`;
- completed Station Press package publication count: `1`.

Because a completed package already existed, ARIADNE did not manufacture data
or force another create.

## Browser Flow

Desktop `/studio/publishing` rendered the PR504F bundle readback path:

| Check | Result |
| --- | --- |
| Existing completed package used | Yes |
| Browser create performed | No |
| `View bundle files` visible on desktop | Yes |
| Desktop bundle panel visible | Yes |
| Desktop visible file list | `README.md`, `manifest.json`, `manifest.md` |
| Desktop exact file-list match | Pass |
| `View bundle files` visible on 390px mobile | Yes |
| Mobile bundle panel visible | Yes |
| Mobile visible file list | `README.md`, `manifest.json`, `manifest.md` |
| Mobile exact file-list match | Pass |

Screenshots were captured and inspected through the normal temporary rehearsal
pattern. They are not committed.

## Package And Bundle Readback

Authenticated owner API readback matched the visible UI:

| Check | Result |
| --- | --- |
| Package readback | `200` |
| Package kind | `station_press_publication` |
| Package status | `completed` |
| Bundle readback | `200` |
| Bundle files | `README.md`, `manifest.json`, `manifest.md` |
| Exact three-file bundle | Pass |
| Bundle file-content privacy scan | Pass |

## Layout

Desktop and mobile visual-fit checks passed:

| Viewport | Result |
| --- | --- |
| Desktop `1440px` | No horizontal overflow |
| Mobile `390px` | No horizontal overflow |

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

Visible UI and bundle file-content scans passed:

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

The visible readback remained owner-only metadata proof. It did not introduce a
public package route, public download, storage object, signed URL, generated
binary, or publication/launch claim.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser proof runner | Pass | Existing completed package used; no browser create; visible desktop/mobile bundle readback passed. |
| Hosted reachability | Pass | Web `/studio/publishing` returned `200`; API health returned `200`; no deploy commit was exposed by the probed health response. |
| Hosted PR504F behavior | Pass | `View bundle files` was visible and opened owner-only bundle readback. |
| Owner and cross-owner auth | Pass | Owner tier `canon`; cross-owner tier `private`. |
| Hosted fixture readiness | Pass | Five package-ready publications and one completed package publication were present. |
| Desktop and 390px mobile layout | Pass | No horizontal overflow. |
| Existing package readback | Pass | Existing completed package was used; no create was performed. |
| Visible file list | Pass | Desktop and mobile both showed exactly `README.md`, `manifest.json`, and `manifest.md`. |
| Package and bundle readback | Pass | Authenticated owner readback returned `200`; bundle returned `200` with the exact three files. |
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
- ARIADNE passed PR504G hosted /studio/publishing visible bundle proof.
- Hosted web/API were reachable; API health returned 200 and /studio/publishing returned 200.
- Hosted PR504F behavior is visible: completed Station Press package rows expose View bundle files.
- Existing completed package readback was used; no browser create was performed.
- Desktop and 390px mobile fit passed.
- View bundle files opened owner-only readback on desktop and mobile with exactly README.md, manifest.json, and manifest.md.
- Authenticated package readback returned 200; bundle readback returned 200 with the exact three files.
- Signed-out create/list/readback/bundle returned 401; cross-owner create/list/readback/bundle returned 404.
- Visible UI and bundle file-content privacy/product-boundary scans passed.
Verdict:
- PASS_PR504G_STATION_PRESS_VISIBLE_BUNDLE_HOSTED_PROOF.
Next:
- Close the Station Press owner package visible bundle hosted proof and decide final Station Press owner package closeout.
```
