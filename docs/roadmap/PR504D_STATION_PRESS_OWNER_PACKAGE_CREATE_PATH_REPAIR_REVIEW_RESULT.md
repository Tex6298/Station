# PR504D - Station Press Owner Package Create Path Repair Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Decision

ARGUS accepts PR504D as:

```text
ACCEPT_PR504D_STATION_PRESS_HOSTED_SCHEMA_REPAIR
```

The hosted blocker is resolved at the backend package-create/readback/bundle
boundary. Hosted Supabase was missing the already-accepted PR504A migration 073,
and DAEDALUS applied only that migration through the existing pooler path.

No ARGUS patch was required.

## Review

Accepted evidence:

- pre-repair hosted schema lacked `export_packages.document_id`;
- pre-repair hosted constraints/policy/indexes lacked the
  `station_press_publication` document-target shape;
- the failing create path was the initial `export_packages` insert boundary,
  before manifest assembly or bundle work;
- DAEDALUS applied only
  `infra/supabase/migrations/073_station_press_publication_packages.sql`;
- PostgREST schema reload was requested;
- post-repair hosted schema/cache probes showed the column, constraints, owner
  policy branch, index, RLS, and REST cache were present;
- hosted owner create returned `201`, owner readback returned `200`, and owner
  bundle returned `200`;
- bundle files were exactly `README.md`, `manifest.json`, and `manifest.md`;
- signed-out create/list/read/bundle stayed `401`;
- cross-owner create/list/read/bundle stayed `404`;
- manifest, markdown, and bundle content scans found no raw ids, source keys,
  storage paths, SQL/stack/env/provider details, or known private-body fixture
  text.

Secret/privacy review:

- the result records only the env var name `SUPABASE_POOLER_URL`, not its value;
- no connection string, service key, credential, cookie, bearer token, raw
  owner/document/export/package id, private body, SQL stack trace, provider
  payload, or row data was committed.

Preserved non-scope:

- no repo code, API contract, UI behavior, package files, lockfiles, env files,
  public package URL, public download, signed URL, storage object, PDF/binary
  output, original-file packaging, print/fulfillment, provider/model call,
  billing/Stripe, social dispatch, queue/worker, Redis, Cloudflare, public
  route, broad Studio publishing redesign, launch claim, raw-id readback, or
  private body/source exposure was added.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted schema repair evidence | Pass | Pre/post probes in the PR504D result prove migration 073 was missing and then present. |
| Hosted owner create/readback/bundle evidence | Pass | Owner create `201`, readback `200`, bundle `200`, exact three files. |
| Hosted auth boundary evidence | Pass | Signed-out remained `401`; cross-owner remained `404` for create/list/read/bundle. |
| Hosted content privacy scan evidence | Pass | Package content scan found no raw ids, source keys, storage paths, SQL/stack/env/provider details, or known private-body fixture text. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 15 export API tests passed in ARGUS review. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 25 publishing API/UI tests passed in ARGUS review. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 195 Studio UI/helper tests passed in ARGUS review. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Proof-doc secret scan | Pass | Matches were env-var names and negative no-leak language only; no secret values or raw route/entity ids were found. |

## Remaining Decision

PR504D directly proves the backend hosted create/readback/bundle blocker is
cleared. MIMIR should decide whether to close from this backend proof or route
ARIADNE for one more browser `/studio/publishing` human-eye rerun before final
PR504B closeout.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR504D.
- Hosted migration 073 was missing and is now applied; hosted
  `station_press_publication` create/readback/bundle works.
- Signed-out `401`, cross-owner `404`, exact three-file bundle, and package
  content privacy scans passed.
- No repo code, public download/storage/provider/billing/social/queue/worker
  scope, secrets, or raw ids were added.
Task:
- Close PR504D and decide whether PR504B can close from the backend hosted
  proof or whether ARIADNE should run one more browser rerun.
```
