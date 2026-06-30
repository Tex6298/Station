# PR484F-E - Archive Connector Authorization URL Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-06-30

Status: CONFIG_BLOCKER_PROVIDER_APP

## Verdict

ARIADNE cannot pass PR484F-E to close because hosted Railway does not currently
have enough archive connector provider app configuration to create a bounded
authorization URL.

Hosted freshness, owner auth, readiness readback, and setup-required route
samples passed. The blocker is hosted config, not a code defect in the
authorization URL route.

## Hosted Target

- Hosted web/API health checks were ready on commit `6e81319`.
- Replay-owner sign-in and `/auth/me` passed; session values were not printed
  or recorded.
- API route samples were run against
  `https://stationapi-production.up.railway.app`.

## Readiness Classes

| Provider | Readiness status | OAuth app status | Credential encryption | Result |
| --- | --- | --- | --- | --- |
| Reddit | `credential_encryption_required` | `missing` | `false` | Config blocker |
| Discord | `credential_encryption_required` | `missing` | `false` | Config blocker |

Readiness safety flags stayed disabled for credential writes, OAuth state
creation, redirects, callbacks, token exchange, provider calls, source
inventory, and import writes.

## Route Samples

Because no provider was configured enough for URL readback, ARIADNE did not
create a state handle or request a provider authorization URL. Instead, bounded
setup-required samples proved the hosted routes exist and fail closed.

| Provider | Route | Result | Notes |
| --- | --- | --- | --- |
| Reddit | `POST /archive-connectors/oauth/reddit/start` | `409 setup_required` | No state handle returned; no forbidden readback detected. |
| Reddit | `POST /archive-connectors/oauth/reddit/authorize` | `409 setup_required` | No authorization URL returned; no forbidden readback detected. |
| Discord | `POST /archive-connectors/oauth/discord/start` | `409 setup_required` | No state handle returned; no forbidden readback detected. |
| Discord | `POST /archive-connectors/oauth/discord/authorize` | `409 setup_required` | No authorization URL returned; no forbidden readback detected. |

## Not Run

These checks remain blocked until at least one archive connector provider app is
configured in hosted Railway:

- PR484E OAuth state creation for a configured provider;
- authorization URL readback;
- redirect URI origin verification;
- provider host verification;
- Reddit `identity`/temporary or Discord `identify` minimal-scope verification;
- repeated non-consuming authorization URL readback.

## Safety Boundary

No real Reddit or Discord authorization URL was opened. No OAuth consent was
completed. No callback with a real code was run.

The hosted samples did not expose OAuth codes, access tokens, refresh tokens,
client secrets, env values, credential material, provider payloads, source
data, import data, SQL/table output, stack traces, hosted logs, prompts, signed
URLs, storage paths, cookies, raw state handles, row ids, owner ids, session
ids, nonce/csrf values or hashes, or secret-shaped values.

No token exchange, refresh, revocation, credential write/revoke, provider
SDK/fetch/call, source inventory, recurring pull, import write, queue, worker,
Redis, Cloudflare, billing/Stripe, provider/model call, package change, broad
UI, marketplace, or social posting behavior was exercised.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted web health | Pass | Ready on commit `6e81319`; deployment ids were not recorded. |
| Hosted API health | Pass | Ready on commit `6e81319`; deployment ids were not recorded. |
| Temporary hosted API proof harness | Config blocker | Auth/readiness/setup-required samples passed; no provider had configured archive connector OAuth app status. |
| `git diff --check` | Pending | To be run before committing this result. |

## MIMIR Handoff

Verdict:

```text
CONFIG_BLOCKER_PROVIDER_APP
```

Task:

- Decide whether to configure the hosted archive connector credential
  encryption and at least one archive-specific provider app pair, or keep
  PR484F-E blocked until a config lane is explicitly opened.
