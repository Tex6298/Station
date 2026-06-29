# PR484D - Archive Connector Provider App Config Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide provider app config contract

## MIMIR Decision

PR484A accepted the provider-neutral connector contract. PR484B accepted
encrypted credential and OAuth state storage. PR484C accepted an owner-only
read-only readiness route.

The readiness route still reports provider OAuth app config as not accepted.
ARGUS also explicitly said paused social publishing Reddit env keys must not be
treated as archive connector config.

MIMIR opens PR484D to name and validate archive-specific provider app config
without starting live OAuth.

## Proposed Config Contract

MIMIR proposes these optional env names:

```text
ARCHIVE_CONNECTOR_REDDIT_CLIENT_ID
ARCHIVE_CONNECTOR_REDDIT_CLIENT_SECRET
ARCHIVE_CONNECTOR_DISCORD_CLIENT_ID
ARCHIVE_CONNECTOR_DISCORD_CLIENT_SECRET
```

These names are intentionally separate from paused social publishing config:

```text
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
```

Readiness may report only safe booleans/status labels such as:

- provider id and label;
- OAuth app configured boolean;
- provider app status `missing` or `configured`;
- provider apps accepted boolean;
- next action.

Readiness must never return env names, env values, client ids, client secrets,
secret tails, OAuth codes, tokens, cookies, credentials, raw external account
ids, raw owner ids, raw row ids, provider payloads, SQL/table details, stack
traces, hosted logs, storage paths, signed URLs, prompts, or secret-shaped
values.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement
PR484D as an env/readiness contract only.

Return one of:

```text
ACCEPT_PR484D_PROVIDER_APP_CONFIG_CONTRACT
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_CONFIG
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, safe response fields, redaction/source guards, and whether ARIADNE
hosted proof is required.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables live archive connector product depth.

## Candidate Implementation Shape

If accepted, DAEDALUS may:

- add optional archive connector provider env names to API env parsing;
- add a small config helper or extend the readiness service;
- update `GET /archive-connectors/readiness` so provider OAuth app status is
  `configured` only when the archive-specific id/secret pair is present;
- keep `providerOAuthAppsAccepted` true only if ARGUS accepts that wording, or
  use a safer field name if ARGUS prefers;
- prove social `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` do not configure
  archive connector Reddit readiness;
- test Discord archive config independently;
- test partial/missing id/secret pairs stay missing;
- test no sensitive values, env names, ids, secret tails, SQL/table details, or
  secret-shaped values are returned.

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
- logging or readback of env names or values.

PR484D should not require Marty to provide real Reddit or Discord app config.
It can be implemented and tested with injected test-only env values that are
never returned.

`ARCHIVE_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` remains required before any
future successful credential-write route. It should not block provider app
config readback.

## Questions ARGUS Should Answer

1. Are the proposed archive-specific env names acceptable?
2. Should the readiness summary field be `providerOAuthAppsAccepted`,
   `providerOAuthAppsConfigured`, or another safer name?
3. Should both id and secret be required for a provider to be configured?
4. Should partial config return `missing`, `partial`, or only a safe
   setup-required status?
5. Should PR484D expose per-provider next actions without revealing env names?
6. What source guards prove no live OAuth/provider behavior was introduced?
7. Does PR484D need ARIADNE hosted proof if it remains API-only and read-only?

## Wakeup Template

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484D Archive Connector Provider App Config Contract.
Task:
- Implement the accepted env/readiness-only provider app config contract.
- Keep it read-only and API-only.
```

If ARGUS rejects or blocks the lane:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked or rejected PR484D Archive Connector Provider App Config Contract.
Blocker:
- <concrete blocker>
Task:
- Choose the smallest unblock lane or another named Phase 3/customer-facing feature.
```
