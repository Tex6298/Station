# PR484J-N - Archive Connector Hosted Setup Config Blocker

Owner: MIMIR / A1

Date: 2026-06-30

Status: Config-blocked

## Verdict

```text
CONFIG_BLOCKER_ARCHIVE_CONNECTOR_HOSTED_SETUP
```

MIMIR accepts ARGUS's PR484J-N preflight boundary, but the lane cannot be
honestly routed to ARIADNE yet. The next proof requires live hosted Reddit
OAuth and saved-items source inventory, and current local/hosted tooling did
not prove the required config or hosted migration state.

## What Is Proven

- Local `.env` has `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`,
  `SUPABASE_POOLER_URL`, and `RAILWAY_TOKEN` present by name.
- Local `.env` does not have
  `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`,
  `ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID`,
  `ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET`, or
  `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY` present by name.
- Local migration files exist for hosted setup:
  `062_archive_connector_credentials.sql`,
  `063_archive_connector_scope_metadata.sql`,
  `064_archive_connector_import_intents.sql`,
  `065_archive_connector_import_intent_activation.sql`,
  `066_archive_connector_source_staging_runs.sql`, and
  `067_archive_connector_import_jobs.sql`.
- The hosted API health endpoint is reachable and ready, but the selected
  deployment/migration readback does not prove migrations `062` through `067`;
  it still exposes only the older public schema proof sample.
- Railway CLI is callable through `npm exec`, but `railway status` with the
  current local `RAILWAY_TOKEN` returns `Invalid RAILWAY_TOKEN`, so MIMIR could
  not safely confirm or set hosted Railway variables.
- Railway CLI help explicitly warns that JSON/KV variable list output includes
  raw values, so MIMIR did not dump hosted variables.
- `psql` is not installed, `pg` is not installed/resolvable in the repo, and no
  Supabase MCP tool is callable in this session; direct hosted schema proof was
  not completed from current tools.

## Required Before ARIADNE Proof

Set these on hosted Railway `@station/api`, not on the web service and not on
the unused/plain `api` service:

```text
ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
NEXT_PUBLIC_APP_URL=https://stationweb-production.up.railway.app
```

The credential encryption key must be at least 32 characters and stable across
deploys. The Reddit values must be archive-specific connector app credentials,
not paused social publishing `REDDIT_CLIENT_ID` /
`REDDIT_CLIENT_SECRET`.

Register this callback in the Reddit app:

```text
https://stationweb-production.up.railway.app/archive-connectors/oauth/callback/reddit
```

Confirm hosted Supabase has migrations `062` through `067` applied. At minimum,
`062` and `063` must be present before OAuth state and credential storage can
work.

This later staging/import-only key is not required for the PR484J-N
source-inventory proof, but it will be needed before source staging/import
proof:

```text
ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY
```

## Resume Rule

After the hosted config is set and migrations are confirmed, MIMIR should wake
ARIADNE for the narrow hosted owner proof defined by ARGUS:

- readiness shows credential encryption and Reddit provider app configured;
- credential readback returns safe provider rows with `200`;
- owner completes real Reddit OAuth without exposing state handle, authorization
  URL, client secret, callback code, or tokens in docs/logs/UI;
- callback exchange stores a source-inventory credential and returns safe
  metadata only;
- owner account lookup completes without raw account id readback;
- persona Archive UI shows generic `Reddit saved items` source availability;
- stop before import intent, activation, source preview, source staging, import
  preview, and final import.

No DAEDALUS code lane is opened from this blocker. The repo-side owner UI and
API paths are already accepted up to the live OAuth boundary; this is an
external config and hosted schema proof gate.
