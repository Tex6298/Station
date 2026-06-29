# Live Archive Connector Credential Contract

Date: 2026-06-29

Status: PR484A provider-neutral contract

## Purpose

Live archive connectors are separate from social publishing and AI provider
BYOK. This contract covers future owner-authorized archive intake for Reddit
and Discord only. It does not authorize live provider API calls, OAuth
redirects, token exchange, source inventory pulls, recurring pulls, or import
writes in PR484A.

## Providers

Accepted archive connector provider ids:

- `reddit`
- `discord`

No other provider id is accepted by this contract.

## Credential States

Owner-only credential readback may use these states:

- `not_configured`: no owner setup has started.
- `oauth_app_missing`: archive connector OAuth app configuration is missing.
- `ready_for_oauth`: a future owner-bound OAuth handshake may be started once a
  route contract exists.
- `connected_redacted`: a credential may exist, but token material and raw
  external account ids are never returned.
- `revoked`: the owner or system revoked the connector credential.
- `blocked`: policy, configuration, or unsafe credential state blocks use.

## OAuth State Expectations

A future OAuth lane must bind callback state to:

- owner id;
- active owner session;
- provider id;
- archive connector purpose;
- one-time nonce;
- short expiry;
- csrf protection.

Callback codes must never be logged, returned in readback, or stored as visible
state. PR484A performs no provider redirect, callback handling, token exchange,
refresh, or revocation.

## Secret Handling

The following values must never appear in readback, logs, docs, tests, UI, or
API responses:

- access tokens;
- refresh tokens;
- OAuth codes;
- cookies;
- credentials;
- secret-shaped values;
- raw external account ids.

Future readback may expose only safe provider labels, owner-local state, and
aggregate readiness facts.

## Future Storage Expectation

External archive connector secrets require a dedicated encrypted connector
credential schema and environment key before storage. Existing social publishing
readiness config and AI provider BYOK storage are not accepted archive connector
credential stores.

## Source Inventory Boundary

Future provider inventory may return safe metadata and counts only. It must not
return private source bodies, private messages, archive snippets, unsafe
permalinks, provider payloads, raw external ids, storage paths, signed URLs,
SQL/table details, hosted logs, stack traces, prompts, or secret-shaped values.

## Import Permission Boundary

No archive source, import job, Memory, Canon, Continuity, public document, or
review candidate may be created before explicit owner confirmation. Existing
manual import preview remains the no-write model until a separate live
connector lane is accepted.

## Non-Goals

PR484A does not add live Reddit API calls, Discord API calls, OAuth redirects,
OAuth callback routes, token exchange, token refresh, token revocation,
provider SDKs, configured test-credential execution, recurring pulls,
background jobs, workers, queues, scheduled jobs, Redis, Cloudflare, runtime
provisioning, broad connector marketplace behavior, public connector pages,
cross-owner connector access, admin impersonation, provider/model calls,
billing, Stripe, schema changes, migrations, package dependencies, new external
config, or route/UI behavior.
