# PR484D - Archive Connector Provider App Config Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ACCEPT_PR484D_PROVIDER_APP_CONFIG_CONTRACT

## Verdict

ARGUS accepts an env/readiness-only archive connector provider app config
contract for PR484D.

DAEDALUS may add archive-specific optional env names and update the existing
read-only readiness route so it can report safe provider app status for Reddit
and Discord. PR484D must not start OAuth, create OAuth state, write credentials,
call providers, pull source inventory, or import anything.

## Accepted Config Names

The archive connector provider app config names are accepted:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

These names are intentionally separate from paused social publishing config.
`REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` must not configure archive
connector readiness.

## Accepted Readiness Semantics

Both client id and client secret are required for a provider to count as
configured.

Per-provider status may be:

- `missing` when neither accepted archive-specific value is present;
- `partial` when only one side of the accepted pair is present;
- `configured` when both accepted archive-specific values are present.

Partial config must not reveal which side is present. It must not return env
names, client ids, client secrets, secret tails, or secret-shaped values.

Use safe readiness fields:

- `providerOAuthAppConfigAccepted: true` for the contract itself;
- `providerOAuthAppsConfigured` as an aggregate boolean if useful;
- per-provider `oauthAppConfigured`;
- per-provider `oauthAppStatus`;
- bounded provider status and next action.

Do not keep using `providerOAuthAppsAccepted` as the only summary field; it is
too easy to confuse accepted contract semantics with configured runtime values.

## Accepted PR484D Scope

Preferred touched files:

- `apps/api/src/lib/env.ts`
- `apps/api/src/services/archive-connectors/readiness.ts`
- `apps/api/src/routes/archive-connectors.test.ts`
- roadmap/status/validation docs

Acceptable local equivalents are fine if the repo structure requires them, but
PR484D must not add another route or UI.

The readiness route may continue to be:

```text
GET /archive-connectors/readiness
```

Required behavior:

- use only archive-specific provider app env names for archive readiness;
- keep social publishing env names ignored;
- expose only booleans/status labels and bounded next actions;
- keep credential writes, OAuth state creation, redirects, callbacks, token
  exchange, provider calls, source inventory, and import writes disabled;
- do not require real local or hosted provider config to pass tests.

## Explicit Non-Scope

PR484D must not add or change:

- OAuth state create routes;
- OAuth redirect routes;
- OAuth callback routes;
- credential write, credential revoke, token exchange, token refresh, or token
  revocation routes;
- provider SDKs, live Reddit/Discord API calls, configured test credentials,
  source inventory pulls, recurring pulls, import writes, jobs, queues,
  workers, Redis, Cloudflare, billing/Stripe, provider/model calls, package
  dependencies, hosted runtime behavior, public connector pages, web UI, broad
  connector marketplace, or social posting behavior;
- archive source, import job, Memory, Canon, Continuity, public document, or
  review candidate writes;
- logging or API readback of env names, env values, client ids, client secrets,
  secret tails, tokens, cookies, credentials, SQL/table details, stack traces,
  hosted logs, storage paths, signed URLs, prompts, or secret-shaped values.

`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` remains required before any
future successful credential-write route. Provider app config must not by
itself enable credential writes.

## Required Tests

DAEDALUS should update or add focused tests proving:

- no archive provider app env values returns `missing`;
- id-only and secret-only config return `partial`, not configured;
- both id and secret return `configured`;
- Reddit and Discord archive provider config are independent;
- paused social publishing `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` do not
  configure archive Reddit readiness;
- provider app config does not enable credential writes, OAuth state creation,
  redirects, callbacks, token exchange, provider calls, source inventory, or
  import writes;
- response bodies contain no env names, env values, client ids, client secrets,
  secret tails, OAuth codes, access tokens, refresh tokens, cookies,
  credentials, raw owner/row ids, provider payloads, SQL/table details, stack
  traces, hosted logs, storage paths, signed URLs, prompts, or secret-shaped
  values;
- source guards show no social env coupling, provider SDK/call, fetch,
  credential write/revoke, OAuth state create, redirect/callback, token
  exchange, queue/worker, Redis, Cloudflare, Stripe/billing, provider/model, or
  import/archive write path.

Required validation before waking ARGUS:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a path/scope scan confirming no new route/UI, OAuth state creation,
credential writes, redirects/callbacks, token exchange, live provider call,
provider SDK, configured real test credentials, source inventory pull, import
write, jobs/queues/workers, Redis, Cloudflare, billing/Stripe,
provider/model call, package dependency, hosted runtime behavior, env value, or
secret-shaped value was introduced.

## ARIADNE Requirement

ARIADNE hosted rehearsal is not required if PR484D remains API-only,
read-only, local-test covered, and mutation-free.

If DAEDALUS adds UI, OAuth state creation, credential writes, redirects,
callbacks, token exchange, provider calls, source inventory, import writes, or
hosted runtime behavior, ARGUS should reject the scope or require a separate
hosted proof lane.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Presence-only provider app config check | Pass | Local `.env` and process env had zero accepted archive provider app config names present; no values were printed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 44 tests passed across readiness route, storage, contract, no-write import preview, Reddit/Discord parsers, social fail-closed routes, and web readiness guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| Scope scan | Pass | Current archive connector matches are accepted readiness/storage helpers, docs, tests, and guardrails; no provider app config contract exists yet. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
