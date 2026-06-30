# PR484J-N - Archive Connector Hosted Setup Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_N_ARCHIVE_CONNECTOR_HOSTED_SETUP_PREFLIGHT
```

ARGUS accepts a config-plus-hosted-proof lane. No DAEDALUS code lane is needed
before hosted setup, but the candidate config list was incomplete: hosted setup
also depends on the public web origin used to build the Reddit callback URL and
on the archive connector migrations being present in hosted Supabase.

## Required Hosted State

Required before live Reddit OAuth/source-inventory proof:

- `ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`: secret archive connector
  credential encryption key, at least 32 characters, stable across deploys;
- `ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID`: archive-specific Reddit app client id;
- `ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET`: archive-specific Reddit app client
  secret;
- `NEXT_PUBLIC_APP_URL`: public hosted web origin, HTTPS, non-local, with no
  username/password/query/hash; the API derives the callback origin from this
  value;
- hosted Supabase migrations `062` through `067` applied, with at least `062`
  and `063` required before OAuth state and credential storage can work.

Required only for staging/import proof, not for the PR484J-N source-inventory
setup proof:

- `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY`: secret source staging
  encryption key, at least 32 characters, stable while staged batches may need
  decrypting.

Explicit non-config:

- do not use paused social publishing `REDDIT_CLIENT_ID` /
  `REDDIT_CLIENT_SECRET` for archive connectors;
- do not add Discord config for this Reddit saved-items lane;
- `API_URL` is not the archive connector OAuth callback origin in current code.

## Callback

Register this Reddit callback URL for hosted:

```text
https://<hosted-web-origin>/archive-connectors/oauth/callback/reddit
```

`<hosted-web-origin>` must match the origin derived from `NEXT_PUBLIC_APP_URL`.
If `NEXT_PUBLIC_APP_URL` contains a path, current code still uses only the
origin. The callback must be HTTPS on hosted and must not point at the API
service URL unless that is also the public web origin serving the callback page.

## Proof Boundary

MIMIR should treat this as a config/proof route, not as a builder lane:

1. Configure the hosted values without printing or committing secret values.
2. Confirm hosted Supabase has the archive connector migrations required for
   credentials, OAuth state, scope metadata, import intents, source staging, and
   connector import jobs.
3. Wake ARIADNE for a narrow hosted owner proof after config exists.

ARIADNE proof should stop after saved-items source availability:

- signed-in owner `GET /archive-connectors/readiness` shows credential
  encryption configured and Reddit provider app configured;
- signed-in owner `GET /archive-connectors/credentials` returns safe provider
  rows with `200`, not the previous bounded `500`;
- Reddit OAuth start and authorize work for the owner flow without exposing the
  state handle, authorization URL, client secret, callback code, or tokens in
  docs/logs/UI;
- owner completes real Reddit OAuth only with real Reddit app credentials;
- callback exchange stores a source-inventory credential and returns safe
  metadata only;
- owner account lookup completes without raw account id readback;
- source inventory succeeds and the persona Archive UI shows only generic
  `Reddit saved items` availability;
- stop before import intent, activation, source preview, source staging,
  import preview, and final import.

First proof not to attempt without real Reddit app credentials:

- do not run owner OAuth/authorize/callback proof with placeholder
  `ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID` or
  `ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET`. Placeholder config can make
  readiness look configured while producing a broken live OAuth path.

## Scope Guard

Still forbidden:

- printing, requesting, committing, logging, or rendering secret values;
- Discord content reads or Discord source inventory UI proof;
- broader Reddit categories beyond the accepted saved-items owner UI path;
- source preview, source staging, import preview, or final import in this setup
  proof;
- pagination, recurring pulls, queues/workers, billing, Redis, Cloudflare,
  marketplace, partner adapters, social behavior, public writes, Canon,
  Continuity, review candidates, or new import execution behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code inventory | Pass | Verified env names and callback behavior in `apps/api/src/lib/env.ts`, `readiness.ts`, `credential-storage.ts`, `source-staging.ts`, `archive-connectors.ts`, and migrations `062`-`067`. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts` | Pass | 93 archive connector API/web owner-flow tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors after doc updates; CRLF normalization warnings only. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-N as a config-plus-hosted-proof lane, not a DAEDALUS code lane.
- Required hosted state is the archive connector credential key, archive-specific Reddit client id/secret, HTTPS `NEXT_PUBLIC_APP_URL` matching the registered Reddit callback origin, and hosted Supabase migrations 062-067.
- `ARCHIVE_CONNECTOR_SOURCE_STAGING_ENCRYPTION_KEY` is required only for later source staging/import proof, not for the PR484J-N source-inventory setup proof.
- The hosted proof should stop after real owner Reddit OAuth, account lookup, and generic saved-items source availability; do not enter source preview, staging, import preview, or final import.
Validation:
- Archive connector API/web focused suite: 93 pass.
- Typecheck: pass.
- Diff check: pass.
Task:
- Coordinate secret-safe hosted config and migration confirmation, then wake ARIADNE for the narrow Reddit saved-items source-inventory hosted proof, or document any concrete config/schema blocker.
```
