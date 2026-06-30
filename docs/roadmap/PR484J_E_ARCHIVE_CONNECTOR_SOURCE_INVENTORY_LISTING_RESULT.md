# PR484J-E - Archive Connector Source Inventory Listing Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted owner-only, read-only source inventory
listing lane for archive connectors.

Implemented surface:

- `GET /archive-connectors/:provider/source-inventory`;
- source-ready credential helper requiring completed account proof before
  decrypt/provider fetch;
- provider source inventory client with a test-injected fetch seam;
- safe Reddit subscribed-subreddit rows;
- Station-derived Reddit history category availability rows with no history
  content/listing calls;
- safe Discord current-user guild rows;
- bounded route/provider/storage failure mapping;
- focused storage, route, provider-call, redaction, and source-guard tests.

## Preconditions

Source inventory is eligible only when all of these are true:

- exactly one active owner/provider `archive_connector` credential exists;
- stored metadata proves `scope_profile = source_inventory`;
- stored granted scopes exactly match the accepted provider source scope set;
- decrypted token material independently proves `source_inventory` and exact
  canonical granted scopes;
- completed provider account lookup is present on the active credential row via
  `external_account_fingerprint`.

Missing account proof returns an account-lookup-required response before any
provider source fetch. The route does not run account lookup, repair metadata,
or accept connect-proof credentials.

## Provider Reads

Accepted live provider reads are limited to:

- Reddit:
  `GET https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1`
- Discord:
  `GET https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false`

Both use `Accept: application/json` and an internal Bearer token. Reddit also
uses a bounded static Station archive connector User-Agent. The fetch seam uses
an abort signal and no retry, pagination loop, queue, refresh, revoke, or
recurring pull.

## Safe Response

Successful responses return:

- `status: "archive_connector_source_inventory_read"`;
- provider, purpose, owner boundary, account label, and account-proof presence;
- safe source rows with source family, source kind, bounded label, opaque
  Station source key, coarse availability, row-level safety booleans, and a
  bounded truncation boolean;
- route-level safety booleans proving source body reads, imports, jobs, queues,
  public writes, raw id readback, provider payload readback, token refresh,
  token revoke, credential writes, metadata updates, and UI changes are
  disabled.

The route does not return source bodies, post/comment/message text, titles,
descriptions, counts, URLs, icons, permissions, raw provider ids, Reddit
fullnames, Discord snowflakes, raw cursors, provider payloads, provider
headers, tokens, encrypted credential blobs, OAuth state/codes, SQL/storage
details, stack traces, env values, source content, or secret-shaped values.

## Non-Scope

PR484J-E did not add:

- Reddit history content/listing endpoint calls;
- Reddit `read`, broad discovery, search/popular/new listing, or pagination
  crawl;
- Discord channels, messages, DMs, members, connections, bots, webhooks,
  installs, invites, local RPC, or permission expansion;
- token refresh/revoke, provider-side revoke, OAuth scope expansion, account
  lookup side effects, or metadata repair;
- archive source writes, import jobs, Memory, Canon, Continuity, public
  documents, review candidates, queues, workers, recurring pulls, UI, hosted
  proof, Redis, Cloudflare, billing, packages, marketplace, partner adapters,
  or social behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts` | Pass | 64 focused connector storage/route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 112 tests passed across connector storage/contract/routes, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

## ARGUS Review Request

Please review for:

- owner scoping and cross-owner resistance;
- source-ready credential and account-proof preconditions;
- accepted provider endpoint containment;
- Reddit history category derivation without history content calls;
- safe source row serialization and opaque key behavior;
- failure response redaction;
- absence of source writes, imports, jobs, queue, UI, package, billing, Redis,
  Cloudflare, marketplace, partner adapter, and social drift.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-E Archive Connector Source Inventory Listing.
- The lane adds only owner-only read-only source inventory: source-ready credential and account-proof preconditions, bounded Reddit subscribed-subreddit listing, Station-derived Reddit history categories, bounded Discord guild listing, safe serializers, route, tests, and docs.
Validation:
- Focused connector storage/route tests pass: 64 tests.
- Accepted broader validation set passes: 112 tests.
- Typecheck passes.
Task:
- Review PR484J-E for source credential/account-proof gating, provider endpoint containment, safe source metadata, redaction, and non-scope drift.
```
