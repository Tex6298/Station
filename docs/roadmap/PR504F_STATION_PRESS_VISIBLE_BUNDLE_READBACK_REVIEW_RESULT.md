# PR504F - Station Press Visible Bundle Readback Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts PR504F as:

```text
ACCEPT_PR504F_STATION_PRESS_VISIBLE_BUNDLE_READBACK
```

The implementation matches the PR504F lane: `/studio/publishing` now uses the
existing authenticated Station Press package list/create/bundle APIs to expose
owner-only bundle readback for completed publication packages.

No ARGUS code patch was required.

## Review

Accepted implementation facts:

- existing package-ready owner publications load their completed
  `station_press_publication` package rows on page load;
- completed packages expose a `View bundle files` action without forcing a new
  package creation;
- create success still uses
  `POST /exports/station-press/publications/:documentId` and then loads
  `GET /exports/:id/bundle`;
- visible readback lists exactly `README.md`, `manifest.json`, and
  `manifest.md` from the owner-only bundle response;
- loading, empty, and bounded-error states are compact and do not echo API
  internals;
- visible copy distinguishes owner-only metadata proof from public publishing,
  package publicity, public downloads, and PDF/binary output.

Preserved non-scope:

- no API route, schema, migration, storage object, signed URL, public package
  URL, public download, PDF/binary output, original-file packaging,
  print/fulfillment, provider/model call, billing/Stripe, social dispatch,
  queue/worker, Redis, Cloudflare, public route, broad Studio publishing
  redesign, or launch claim was added;
- package ids remain internal to authenticated API calls and state matching;
- visible UI copy does not render raw owner/document/package ids, private/source
  bodies, storage paths, SQL details, stack traces, provider payloads, tokens,
  cookies, env values, or secrets.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 196 Studio UI/helper tests passed in ARGUS review. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 26 publishing API/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 15 export API tests passed, including Station Press owner package readback/bundle boundaries. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Changed-path/source scan | Pass | Matches were negative boundary copy, tests, or internal API variables (`documentId`, `packageId`) used for authenticated calls; no secret values or forbidden product expansion were found. |

## Remaining Hosted Proof

ARIADNE still needs to rerun the hosted `/studio/publishing` browser closeout
after this accepted UI patch is deployed. The rerun should prove:

- desktop and 390px mobile fit without horizontal overflow;
- existing completed package readback appears without a new create;
- create success transitions into visible owner-only bundle readback;
- `View bundle files` opens the exact `README.md`, `manifest.json`, and
  `manifest.md` list;
- signed-out and cross-owner create/list/readback/bundle boundaries remain
  closed;
- visible UI exposes no raw ids, private/source bodies, storage paths, signed
  URLs, SQL details, stack traces, provider payloads, tokens, cookies, env
  values, public download links, or launch/package-publicity claims.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR504F visible Station Press bundle readback.
- /studio/publishing now loads existing completed owner metadata packages, gives a View bundle files action, and shows README.md, manifest.json, and manifest.md through the existing owner-only bundle API.
- No API/schema/storage/public-download/PDF/provider/billing/social/queue/worker/Redis/Cloudflare scope was added, and package ids stay internal to authenticated API calls/state.
- Local validation passed: test:studio-ui, typecheck, test:publishing-approvals, test:exports, git diff --check, and git diff --cached --check.
Task:
- Close PR504F or route ARIADNE to rerun the hosted PR504E browser closeout against the accepted UI patch.
```
