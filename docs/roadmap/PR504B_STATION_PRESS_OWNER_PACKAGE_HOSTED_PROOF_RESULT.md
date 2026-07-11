# PR504B - Station Press Owner Package Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

## Scope

ARIADNE ran the hosted proof requested in:

`docs/roadmap/PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

The proof used the hosted replay owner account, the hosted web/API runtime, and
one non-owner replay account for boundary probes. Credentials, cookies, auth
tokens, raw owner ids, raw document ids, raw package ids, and raw route ids were
not recorded.

## Hosted Freshness

Hosted web and API health were reachable, ready, and fresh at:

```text
af5e31457bedfc34d501450d49b42ad3e74d3f74
```

That commit is the ARGUS acceptance commit for PR504A, including the narrow
fail-closed readback patch.

Auth checks passed:

- owner sign-in returned `200` with `canon` tier;
- cross-owner sign-in returned `200` with `private` tier.

## Hosted Fixture

The hosted owner data contained package-ready material:

- owner document count: `28`;
- public Space count: `1`;
- package-ready owner publication count: `5`.

This was not a fixture-limitation case.

## Blocker

Desktop `/studio/publishing` rendered Station Press package controls and
ARIADNE clicked exactly one allowed owner package creation action.

The create request failed:

```text
POST /exports/station-press/publications/:documentId
status: 500
code: station_press_publication_create_failed
```

The UI showed bounded error copy:

```text
Station Press metadata package readback is unavailable.
```

No completed `station_press_publication` package was returned, so ARIADNE could
not prove authenticated readback or bundle files. The required files
`README.md`, `manifest.json`, and `manifest.md` were not available to inspect.

Smallest repair:

- inspect hosted `@station/api` logs for the bounded create failure;
- confirm migration `073_station_press_publication_packages.sql` is applied to
  hosted schema, especially `export_packages.document_id`,
  `station_press_publication`, target constraints, and owner-document RLS;
- if schema drift is confirmed, apply only the accepted PR504A migration and
  rerun PR504B;
- do not add a fallback that weakens owner-only package scope, raw-id omission,
  storage omission, or public-download boundaries.

## Boundaries That Passed

Before package readback existed, access probes failed closed:

| Probe | Result |
| --- | --- |
| Signed-out create | `401` |
| Signed-out list | `401` |
| Cross-owner create | `404` |
| Cross-owner list | `404` |

Package read and bundle boundary probes were not meaningful because the create
request did not return a package id.

## Desktop And Mobile

Desktop and 390px mobile `/studio/publishing` both rendered the Station Press
manifest/package surface without horizontal overflow.

Observed UI:

- Station Press package action/readback copy was present;
- desktop performed only the single allowed Station Press create mutation;
- mobile performed no mutation;
- no public package URL, public download, share link, PDF/binary/original-file
  packaging, print/fulfillment, social dispatch, billing, provider call,
  queue/worker, Redis, Cloudflare, storage-object, or launch claim appeared;
- visible SQL-detail and stack-trace wording appeared only as explicit
  excluded-field copy.

## Privacy Scan

Visible UI and bounded package/error responses exposed no raw ids, secrets,
storage paths, signed URLs, SQL errors, stack traces, provider payloads,
private bodies, source rows, transcripts, prompts, cookies, env values, or
secret-shaped values.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser proof runner | Blocked | 11 checks passed; 4 checks failed because package create returned bounded `500 station_press_publication_create_failed`. |
| Hosted freshness | Pass | Web/API ready at `af5e31457bedfc34d501450d49b42ad3e74d3f74`. |
| Owner auth | Pass | Owner sign-in returned `200`, tier `canon`. |
| Cross-owner auth | Pass | Non-owner sign-in returned `200`, tier `private`. |
| Desktop layout | Pass | `/studio/publishing` rendered package controls without horizontal overflow. |
| 390px mobile layout | Pass | `/studio/publishing` rendered package controls without horizontal overflow. |
| Allowed mutation scan | Pass | Desktop sent exactly one Station Press create POST; mobile sent none. |
| Package create | Blocked | `500 station_press_publication_create_failed`; no package id or files returned. |
| Signed-out/cross-owner create/list probes | Pass | Signed-out returned `401`; cross-owner returned `404`. |
| Privacy/product-boundary scan | Pass | No raw ids, secrets, storage paths, SQL errors, stack traces, provider payloads, or launch/download claims were exposed. |
| `git diff --check` | Pass | No whitespace errors. |

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE ran PR504B hosted proof on /studio/publishing.
- Hosted web/API were fresh at af5e31457bedfc34d501450d49b42ad3e74d3f74, including the PR504A ARGUS patch.
- Owner and cross-owner auth passed.
- Hosted fixtures include package-ready owner publications, so this is not a fixture-limitation case.
- Desktop and 390px mobile layout fit, and privacy/product-boundary scans passed.
- Desktop sent exactly one allowed Station Press create POST.
- Package creation returned bounded 500 station_press_publication_create_failed, so no package id, readback, or README.md/manifest.json/manifest.md bundle could be proven.
- Signed-out create/list returned 401; cross-owner create/list returned 404.
Verdict:
- BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF.
Next:
- Inspect hosted @station/api logs and hosted schema/migration 073 application; repair the create path without weakening owner-only/raw-id/storage/public-download boundaries, then rerun PR504B.
```
