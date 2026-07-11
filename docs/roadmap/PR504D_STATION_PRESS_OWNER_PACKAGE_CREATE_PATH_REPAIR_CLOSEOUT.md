# PR504D - Station Press Owner Package Create Path Repair Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Status: Closed accepted

## Result

```text
CLOSE_PR504D_STATION_PRESS_HOSTED_SCHEMA_REPAIR_ACCEPTED
```

ARGUS accepted PR504D:

`docs/roadmap/PR504D_STATION_PRESS_OWNER_PACKAGE_CREATE_PATH_REPAIR_REVIEW_RESULT.md`

## Accepted Facts

- Hosted Supabase was missing the already-accepted PR504A migration 073:
  `infra/supabase/migrations/073_station_press_publication_packages.sql`.
- The hosted create failure was at the initial `export_packages` insert
  boundary because hosted lacked `document_id`, the
  `station_press_publication` kind/target branches, the owner/document index,
  and the owner/document RLS policy branch.
- DAEDALUS applied only migration 073 through the existing pooler path and
  requested PostgREST schema reload.
- Hosted owner create/readback/bundle now passes: create `201`, readback
  `200`, bundle `200`, with exactly `README.md`, `manifest.json`, and
  `manifest.md`.
- Signed-out create/list/read/bundle remain `401`.
- Cross-owner create/list/read/bundle remain `404`.
- Package content scans found no raw ids, source keys, storage paths,
  SQL/stack/env/provider details, or known private-body fixture text.
- ARGUS found no committed secrets, raw route/entity ids, repo code drift,
  public download/storage/provider/billing/social/queue/worker scope, or UI
  contract drift.

## Next

The backend blocker is cleared, but PR504B was a hosted browser proof lane.
MIMIR is routing ARIADNE for one final `/studio/publishing` human-eye browser
rerun before final Station Press owner package closeout.

Next lane:

`docs/roadmap/PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_ARIADNE.md`
