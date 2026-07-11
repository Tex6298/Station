# PR504A - Station Press Owner Package Contract Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted after narrow ARGUS patch

## Decision

ARGUS accepts PR504A as:

```text
ACCEPT_PR504A_STATION_PRESS_OWNER_PACKAGE_CONTRACT_IMPLEMENTATION
```

The implementation matches the PR504A lane: Station now has an owner-only,
metadata-only, synchronous, authenticated Station Press publication package
contract backed by the existing export package pattern plus an explicit
document target.

Because visible `/studio/publishing` behavior changed, MIMIR should route
ARIADNE for hosted desktop and 390px mobile proof before closing PR504A.

## Accepted Scope

Accepted implementation facts:

- migration `073_station_press_publication_packages.sql` adds
  `station_press_publication`, nullable `document_id`, target constraints, an
  owner/document index, and owner-document RLS checks;
- existing package kinds keep `document_id` null;
- authenticated owner create/list routes live under
  `/exports/station-press/publications/:documentId`;
- existing authenticated package read/bundle routes support
  `station_press_publication`;
- package files are exactly `README.md`, `manifest.json`, and `manifest.md`;
- manifest files contain safe publication metadata, Space destination labels,
  PR503A manifest contract reference, discussion status, existing seminar
  status/schedule metadata, trust flags, and excluded-material notes;
- `/studio/publishing` adds only a small owner readiness/action/readback
  control.

Preserved non-scope:

- no public package URL, public package page, public download, signed URL,
  storage object, PDF output, binary archive, original-file package, print or
  fulfillment output, provider/model call, billing/Stripe, social dispatch,
  queue/worker job, Redis, Cloudflare, public route, broad Studio publishing
  redesign, or launch claim;
- no document body, private source body, archive chunk, transcript, prompt,
  model output, provider payload, raw approval event, prior-version body,
  private seminar note, raw export manifest, original file, storage path, SQL
  detail, stack trace, token, cookie, env value, secret-shaped value, or raw id
  is exposed through Station Press package files or visible package copy.

## ARGUS Patch

ARGUS made a narrow review patch before acceptance:

- `GET /exports/:id` now returns a bounded `409` for incomplete or malformed
  `station_press_publication` stored readback instead of echoing stored
  malformed manifest content.
- Station Press readback validation now requires the package row to be
  `completed`, `json_markdown`, and internally marked completed/json_markdown.
- Export tests now prove malformed Station Press readback is bounded for both
  read and bundle routes.
- `/studio/publishing` empty package copy now says no owner metadata package is
  loaded, avoiding the false claim that no package has ever been created.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 14 export API tests passed after the ARGUS patch. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 25 publishing API/UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 4 document discussion tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 195 Studio UI/helper tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Changed-path/source scan | Pass | Changed paths stayed inside the accepted migration/API/types/web/docs boundary. Matches for public package, storage, PDF, provider, billing, social, queues/workers, Redis, Cloudflare, SQL, stack traces, tokens, and raw ids were guardrail copy, negative tests, schema/RLS fields, or bounded internal route handles. |

## ARIADNE Requirement

MIMIR should wake ARIADNE for hosted proof before closeout.

Suggested proof:

- hosted web/API are fresh at the PR504A accepted commit;
- signed-in owner `/studio/publishing` renders the Station Press metadata
  package readiness/action/readback on desktop and 390px mobile;
- creating a package calls only the authenticated owner export route and shows
  bounded owner copy;
- signed-out and cross-owner API create/list/read/bundle attempts are blocked;
- visible UI and package files show no raw ids, package ids, private bodies,
  source rows, prompts, provider payloads, storage paths, signed URLs, tokens,
  cookies, env values, SQL details, stack traces, or secret-shaped values;
- the page does not claim public Station Press launch, public package URLs,
  public downloads, PDF/binary/original-file packaging, print/fulfillment,
  social dispatch, billing, provider calls, queues/workers, Redis, Cloudflare,
  or storage objects;
- desktop and 390px mobile have no horizontal overflow, clipped controls, or
  incoherent overlap.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR504A after a narrow review patch.
- The implementation adds the explicit `station_press_publication` kind,
  `document_id` target/RLS, owner API create/list/read/bundle, and small
  `/studio/publishing` control without forbidden public/storage/provider/
  billing/social/queue/worker drift.
- ARGUS patched malformed Station Press readback to fail closed on `GET
  /exports/:id` and made the Studio empty package copy honest.
- Visible owner UI changed, so ARIADNE hosted desktop and 390px mobile proof is
  required before closeout.
Task:
- Close or route PR504A; recommended next step is ARIADNE hosted proof.
```
