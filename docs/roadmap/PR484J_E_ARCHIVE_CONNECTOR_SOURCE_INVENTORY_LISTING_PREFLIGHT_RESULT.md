# PR484J-E - Archive Connector Source Inventory Listing Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_E_SOURCE_INVENTORY_LISTING_PREFLIGHT
```

ARGUS accepts a narrow owner-only, read-only source inventory listing lane.
DAEDALUS may implement source metadata readback only. Imports, source bodies,
UI, jobs, hosted/runtime work, queues, partner adapters, billing, Redis,
Cloudflare, packages, marketplace, and social behavior remain out of scope.

## Accepted Route Shape

Add one authenticated empty-body route:

```text
GET /archive-connectors/:provider/source-inventory
```

The route must:

- require `requireAuth` and use only `req.user.id` as the owner boundary;
- accept only existing archive connector providers;
- reject non-empty request bodies if Express exposes one;
- perform no storage writes, metadata updates, import writes, job writes, queue
  writes, or UI side effects;
- return only safe source-selection metadata and explicit safety booleans.

Unsupported providers must fail before credential loading, provider fetches, or
storage writes.

## Credential And Account Preconditions

Source inventory is eligible only when all of these are true:

- exactly one active owner/provider archive connector credential exists;
- stored credential metadata proves `scope_profile = source_inventory`;
- stored granted scopes exactly equal the accepted provider source scope set:
  - Reddit: `identity mysubreddits history`;
  - Discord: `identify guilds`;
- decrypted token material also proves `scopeProfile = source_inventory`, exact
  canonical granted scopes, and bounded token material;
- prior provider account lookup has completed for the same active credential,
  proven only by `external_account_fingerprint` being present on the active
  owner/provider row.

The source inventory route must not silently run account lookup, repair account
metadata, update credential rows, or accept connect-proof credentials. Missing
account proof returns a fail-closed account-lookup-required response before any
provider source fetch.

DAEDALUS may add a read-only helper to load source-ready credential metadata
with account-proof presence, or extend the existing source credential helper to
return safe metadata. That helper must keep token material internal and must not
return `encrypted_credential`, raw provider ids, raw OAuth scope payloads, or
storage details.

## Accepted Provider Reads

Use a provider-client helper with a test-controlled fetch seam, timeout, abort
signal, and no logging of request headers, response headers, payloads, tokens,
or raw provider ids.

Accepted live reads:

| Provider | Endpoint | Purpose |
| --- | --- | --- |
| Reddit | `GET https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1` | List subscribed subreddit source labels from the accepted `mysubreddits` scope. |
| Discord | `GET https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false` | List current-user guild source labels from the accepted `guilds` scope. |

Headers:

- both providers require `Accept: application/json` and
  `Authorization: Bearer <internal access token>`;
- Reddit also requires a Station archive connector User-Agent;
- the token must never be surfaced in errors, logs, docs, UI, tests, or
  response bodies.

Request budget:

- one provider request per source family in this lane;
- no pagination loop;
- if Reddit returns an `after` cursor, return only a bounded boolean such as
  `truncated: true`; never return the raw cursor;
- Discord pagination cursors, if present or needed later, remain out of scope.

## Reddit History Boundary

Reddit history source availability is Station-derived from the accepted
`history` scope only. PR484J-E may return Station-controlled category rows for:

- saved items;
- upvoted items;
- downvoted items;
- submitted posts;
- comments;
- hidden items.

These rows do not require a Reddit history provider request. They must be
marked as source-selection metadata only, with source body reads and imports
disabled.

Forbidden Reddit history/content calls in this lane:

- `/user/{username}/saved`;
- `/user/{username}/upvoted`;
- `/user/{username}/downvoted`;
- `/user/{username}/submitted`;
- `/user/{username}/comments`;
- `/user/{username}/hidden`;
- `/user/{username}/overview`;
- `/user/{username}/gilded`.

Reddit `read`, broad discovery, and subreddit search/popular/new listing are
also out of scope.

## Discord Boundary

Discord inventory is limited to current-user guild availability from
`/users/@me/guilds`.

Forbidden Discord reads in this lane:

- channels;
- messages;
- direct messages;
- guild members;
- user connections;
- bots;
- webhooks;
- installs;
- invites;
- local RPC;
- permission expansion beyond the accepted `identify guilds` scope set.

## Safe Response Contract

The route response may include:

- `status: "archive_connector_source_inventory_read"`;
- `provider`;
- `purpose: "archive_connector"`;
- `ownerOnly: true`;
- `sourceInventoryEnabled: true`;
- safe account label, if already sanitized by account lookup;
- `externalAccountFingerprintPresent: true`;
- source rows containing only:
  - provider;
  - source family;
  - source kind or category;
  - bounded label;
  - opaque Station source key;
  - coarse availability state such as `available`, `deferred`, or
    `unsupported`;
  - booleans proving source body reads, imports, jobs, queues, public writes,
    and raw id readback are disabled;
  - bounded truncation boolean.

Labels must be bounded, whitespace-normalized, control-character-free, and
secret-shaped-value-safe. Reddit labels may come only from
`display_name_prefixed` or `display_name`. Discord labels may come only from
guild `name`. Reddit history labels must be Station-controlled strings.

Opaque source keys must be Station hashes derived from provider, source family,
and raw provider id or Station category id. Do not return raw subreddit names as
keys, subreddit fullnames, Discord snowflakes, provider URLs, or provider
payload fields.

## Forbidden Response Data

Do not return:

- source bodies, post text, comment text, message text, private snippets,
  titles, descriptions, sidebars, topics, channel names, or content previews;
- subscriber counts, member counts, presence counts, message counts, karma,
  permissions, owner/admin flags, feature flags, icons, avatars, URLs, or
  permalinks;
- raw provider ids, Reddit fullnames, subreddit thing ids, Discord snowflakes,
  provider payloads, provider headers, request ids, rate-limit headers, raw
  pagination cursors, or provider usernames;
- tokens, refresh tokens, encrypted credential blobs, OAuth codes, client
  secrets, cookies, signed URLs, storage paths, SQL/storage details, stack
  traces, environment values, prompts, or secret-shaped values;
- raw OAuth scopes copied from token payloads.

## Failure Modes

| Condition | Expected response |
| --- | --- |
| Unsupported provider | `400`, `archive_connector_provider_not_supported`, before credential/storage/fetch work. |
| Missing, revoked, connect-proof, malformed, or source-scope-missing credential | `409`, credential-required/reconnect-required style status, no provider fetch. |
| Credential encryption key missing or malformed | `409`, encryption-required style status, no provider fetch. |
| Decrypted token material invalid | `409`, credential-invalid style status, no provider fetch. |
| Source-ready credential lacks completed account lookup metadata | `409`, account-lookup-required style status, no provider fetch or metadata update. |
| Provider `401` or `403` | `409`, reconnect-required style status. |
| Provider `429` | `429`, rate-limited status with no provider headers returned. |
| Provider timeout, abort, network error, or `5xx` | `502`, provider-failed status. |
| Provider payload shape invalid or unsafe labels/ids unavailable | `502`, provider-response-invalid status. |

All failures must preserve `provider`, `purpose`, `ownerOnly`, and safety
booleans. They must not include raw provider payloads, provider headers, stack
traces, tokens, storage row details, or secret-shaped values.

## Required Tests

DAEDALUS must add focused tests proving:

- unauthenticated requests are rejected and cross-owner credentials are not
  visible;
- unsupported providers do not load storage or call provider fetch;
- connect-proof credentials do not call provider fetch;
- source-ready credentials without `external_account_fingerprint` do not call
  provider fetch and return account lookup required;
- Reddit source-ready credentials with account proof call only
  `/subreddits/mine/subscriber?limit=100&raw_json=1`;
- Reddit returns safe subreddit rows and Station-derived history category rows
  without calling history content endpoints;
- Discord source-ready credentials with account proof call only
  `/users/@me/guilds?limit=200&with_counts=false`;
- request headers include only accepted headers and an abort signal;
- provider `401`, `403`, `429`, timeout/network/`5xx`, invalid JSON, and
  invalid payloads map to safe failure responses;
- Reddit pagination exposes only a boolean truncation indicator;
- response rows never expose raw provider ids, cursors, counts, URLs, icons,
  permissions, provider payloads, provider headers, tokens, encrypted
  credentials, SQL/storage details, stack traces, or source bodies;
- the route performs no credential metadata updates, archive source writes,
  import job writes, Memory, Canon, Continuity, public document, review
  candidate, queue, worker, UI, hosted/runtime, Redis, Cloudflare, package,
  marketplace, billing, or social side effects.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Current code review | Pass | Current archive connector code has source-ready decrypt and completed account lookup metadata, but no source inventory route/provider client yet. |
| Provider docs check | Pass | Reddit documents subscribed-subreddit listing under `/subreddits/mine/{where}` with `mysubreddits`; Reddit user history endpoints are listing/content endpoints and must not be called in this lane; Discord documents current-user guild listing under `/users/@me/guilds` with the `guilds` OAuth2 scope. |
| Prior boundary check | Pass | PR484J-A/B/C/D provide source-scope contract, source-ready credential storage/decrypt, safe account metadata, and account proof prerequisite needed for this read-only lane. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 106 tests passed across connector storage/contract/routes, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |

Provider references checked:

- Reddit API docs: `https://www.reddit.com/dev/api/`
- Discord Get Current User Guilds:
  `https://discord.com/developers/docs/resources/user#get-current-user-guilds`
- Discord OAuth2 scopes:
  `https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes`

## Out Of Scope

- source body reads and source content previews;
- archive source rows, import jobs, Memory, Canon, Continuity, public
  documents, review candidates, queues, workers, or recurring pulls;
- Reddit `read`, broad subreddit discovery, Reddit history content/listing
  calls, or pagination crawl;
- Discord channels, messages, DMs, members, connections, bots, webhooks,
  installs, invites, local RPC, or permission expansion;
- token refresh/revoke, provider-side revoke, OAuth scope expansion, or account
  lookup side effects;
- hosted proof, broad UI, Redis, Cloudflare, billing, packages, marketplace,
  partner adapters, or social behavior.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-E Archive Connector Source Inventory Listing preflight.
Task:
- Implement only the owner-only read-only source inventory lane: source-ready credential requirement, completed account lookup requirement, bounded Reddit subscribed-subreddit listing, Station-derived Reddit history category availability, bounded Discord guild listing, safe source serializers, authenticated GET route, and focused tests.
- Do not call Reddit history content endpoints, Reddit read/broad discovery endpoints, Discord channel/message/DM/member/connection/bot/webhook endpoints, or any import/source-write/job/UI/hosted/package/billing/Redis/Cloudflare/marketplace/social surface.
```
