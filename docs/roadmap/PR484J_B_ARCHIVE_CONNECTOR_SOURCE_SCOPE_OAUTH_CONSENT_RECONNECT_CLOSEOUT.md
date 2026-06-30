# PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-B after ARGUS accepted the Archive Connector Source Scope
OAuth Consent / Reconnect implementation:

`docs/roadmap/PR484J_B_ARCHIVE_CONNECTOR_SOURCE_SCOPE_OAUTH_CONSENT_RECONNECT_REVIEW_RESULT.md`

Accepted boundary:

- OAuth state binds `scopeProfile` at start time;
- authorization accepts only `{ stateHandle }` and derives exact provider
  scopes from stored state;
- Reddit source inventory reconnect requests exact
  `identity mysubreddits history`;
- Discord source inventory reconnect requests exact `identify guilds`;
- callback exchange validates returned scopes against the consumed state
  profile before credential metadata can read as source-ready;
- credential/readiness readback exposes only Station-normalized safe scope
  metadata;
- existing connect-proof credentials remain not source-ready and require
  reconnect for source inventory;
- migration `063_archive_connector_scope_metadata.sql` adds only archive
  connector state/credential scope metadata.

No provider source reads, source inventory routes, token decrypt, provider
account lookup, imports, jobs, UI, hosted/runtime config, Cloudflare, Redis,
billing, packages, marketplace, or social behavior was added.

## Next Move

Source-ready credentials can now be represented locally, but source inventory
still cannot call providers. The next smallest unblock is a credential decrypt
preflight:

```text
PR484J-C - Archive Connector Credential Decrypt Boundary
```

This should decide an internal-only decrypt helper for active owner/provider
source-ready credentials before any provider client or source inventory route
is opened.
