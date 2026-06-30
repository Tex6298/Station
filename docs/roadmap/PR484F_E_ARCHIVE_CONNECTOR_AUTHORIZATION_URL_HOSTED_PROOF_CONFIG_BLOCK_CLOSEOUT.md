# PR484F-E - Archive Connector Authorization URL Hosted Proof Config Block Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Config-blocked - parked

## Decision

MIMIR accepts ARIADNE's PR484F-E hosted proof verdict:

```text
CONFIG_BLOCKER_PROVIDER_APP
```

ARIADNE result:

`docs/roadmap/PR484F_E_ARCHIVE_CONNECTOR_AUTHORIZATION_URL_HOSTED_PROOF_RESULT.md`

Hosted freshness, replay-owner auth, readiness readback, and setup-required
route samples passed at app commit `6e81319`. The blocker is hosted config,
not an implementation defect in PR484F-D.

## Hosted Blocker

Both Reddit and Discord returned:

- readiness status: `credential_encryption_required`;
- OAuth app status: `missing`;
- credential encryption: `false`.

Because no provider was configured enough for URL readback, ARIADNE did not
create a hosted OAuth state handle and did not request a hosted provider
authorization URL.

## Config Needed To Unblock Hosted Proof

Do not commit or print these values. They belong in hosted Railway service
variables for `@station/api`.

Credential encryption:

```text
ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY
```

At least one archive-specific provider app pair:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
```

or:

```text
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

The provider app must register the matching hosted web callback redirect URI:

```text
https://stationweb-production.up.railway.app/archive-connectors/oauth/callback/reddit
https://stationweb-production.up.railway.app/archive-connectors/oauth/callback/discord
```

If the hosted Station web URL changes, use the current deployed web origin plus
the same callback path.

## Safety Result

ARIADNE confirmed the setup-required samples failed closed:

- no state handles returned;
- no authorization URLs returned;
- no forbidden OAuth, credential, provider, source, import, SQL, hosted log,
  token, cookie, or secret-shaped readback detected;
- no token exchange, credential write, provider call, source inventory, import,
  queue, worker, Redis, Cloudflare, billing, package, broad UI, marketplace, or
  social behavior was exercised.

## Next Lane

Marty previously instructed MIMIR to skirt config/API blockers where possible
so backend work can finish E2E, with config supplied when the build genuinely
needs it.

PR484F-E therefore remains parked until hosted config is available. MIMIR opens
the next backend-contract lane with explicit fail-closed config behavior:

```text
PR484G - Archive Connector OAuth Token Exchange / Credential Write Preflight
```

Next preflight:

`docs/roadmap/PR484G_ARCHIVE_CONNECTOR_OAUTH_TOKEN_EXCHANGE_PREFLIGHT_ARGUS.md`
