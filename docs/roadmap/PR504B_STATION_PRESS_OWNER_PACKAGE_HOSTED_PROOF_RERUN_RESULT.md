# PR504B - Station Press Owner Package Hosted Proof Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF
```

## Scope

ARIADNE reran the hosted Station Press owner package proof requested in:

`docs/roadmap/PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF_RERUN_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

The rerun did not record credentials, cookies, auth tokens, raw owner ids, raw
document ids, raw package ids, raw route ids, private bodies, source rows,
storage paths, signed URLs, SQL details, stack traces, prompts, transcripts, or
provider payloads.

## Hosted Freshness

Hosted web and API were reachable, ready, and fresh at:

```text
0e72d438c9ac5cb1c7ddf2330d42e617ae6c08d7
```

That commit contains the PR504C repair.

Auth checks passed:

- owner sign-in returned `200` with `canon` tier;
- cross-owner sign-in returned `200` with `private` tier.

## Hosted Fixture

The hosted owner data still contained package-ready material:

- owner document count: `28`;
- public Space count: `1`;
- package-ready owner publication count: `5`.

This was not a fixture-limitation case.

## Blocker

Desktop `/studio/publishing` rendered the Station Press package surface and
ARIADNE sent exactly one allowed owner package creation request.

The request still failed after PR504C:

```text
POST /exports/station-press/publications/:documentId
status: 500
code: station_press_publication_create_failed
```

Because no completed package was returned, ARIADNE could not prove
authenticated readback or the required bundle files:

```text
README.md
manifest.json
manifest.md
```

Smallest next repair:

- inspect hosted `@station/api` logs for the remaining bounded create failure;
- treat PR504C as insufficient for the hosted create path;
- verify the package source path beyond optional seminar schedule handling,
  including hosted schema/cache behavior, migration `073`, source reads, and
  package row update completion;
- do not add a fallback that weakens owner-only package scope, raw-id omission,
  storage omission, package-file privacy, or public-download boundaries.

## Boundaries That Passed

Before package readback existed, access probes failed closed:

| Probe | Result |
| --- | --- |
| Signed-out create | `401` |
| Signed-out list | `401` |
| Cross-owner create | `404` |
| Cross-owner list | `404` |

Package read and bundle boundary probes were not meaningful because package
creation did not return a package id.

## Desktop And Mobile

Desktop and 390px mobile `/studio/publishing` both rendered without horizontal
overflow.

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

Visible UI and bounded probe responses exposed no raw ids, secrets, storage
paths, signed URLs, SQL errors, stack traces, provider payloads, private
bodies, source rows, transcripts, prompts, cookies, env values, or
secret-shaped values.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser proof runner | Blocked | 12 checks passed; 1 check failed because create returned bounded `500 station_press_publication_create_failed`. |
| Hosted freshness | Pass | Web/API ready at `0e72d438c9ac5cb1c7ddf2330d42e617ae6c08d7`. |
| Owner and cross-owner auth | Pass | Owner tier `canon`; cross-owner tier `private`. |
| Hosted fixture readiness | Pass | Five package-ready owner publications were present. |
| Desktop and 390px mobile layout | Pass | No horizontal overflow; package action/readback copy rendered. |
| Allowed mutation scan | Pass | Desktop sent one allowed Station Press create POST; mobile sent none. |
| Package create/readback/bundle | Blocked | Create returned bounded `500`; no package id or package files were available. |
| Signed-out/cross-owner create/list probes | Pass | Signed-out `401`; cross-owner `404`. |
| Privacy/product-boundary scan | Pass | No raw ids, secrets, storage paths, SQL errors, stack traces, provider payloads, or launch/download claims were exposed. |
| `git diff --check` | Pass | No whitespace errors. |

`pnpm typecheck` was not run because this rerun result updates documentation
only and does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE reran PR504B hosted proof after PR504C.
- Hosted web/API were fresh at 0e72d438c9ac5cb1c7ddf2330d42e617ae6c08d7.
- Owner and cross-owner auth passed.
- Hosted fixtures still include package-ready owner publications.
- Desktop and 390px mobile layout fit, and privacy/product-boundary scans passed.
- Desktop sent exactly one allowed Station Press create POST.
- Package creation still returned bounded 500 station_press_publication_create_failed, so authenticated readback and README.md/manifest.json/manifest.md bundle files could not be proven.
- Signed-out create/list returned 401; cross-owner create/list returned 404.
Verdict:
- BLOCK_PR504B_STATION_PRESS_OWNER_PACKAGE_HOSTED_PROOF.
Next:
- PR504C did not clear the hosted create failure; inspect hosted @station/api logs and the remaining package source/write path before rerunning PR504B.
```
