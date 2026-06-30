# PR484J - Archive Connector Source Inventory Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Blocked for MIMIR decision

## Verdict

```text
BLOCKED_NEEDS_SOURCE_SCOPE_CONSENT_DECISION
```

ARGUS blocks PR484J as an implementation lane. Source inventory is the first
archive connector step that would require provider API reads and token decrypt.
The accepted OAuth flow currently mints connect-proof credentials only.

## Concrete Blocker

Current authorization URLs request only:

- Reddit: `identity`;
- Discord: `identify`.

Those scopes prove account connection. They do not establish an accepted
inventory scope, owner consent copy, token decrypt policy, provider-client
boundary, provider account lookup policy, or safe source matrix.

Provider docs checked during preflight:

- Reddit OAuth API docs: `https://www.reddit.com/dev/api/oauth/`
  - `identity` covers `/api/v1/me` style account proof.
  - `history` covers saved, hidden, upvoted, downvoted, comments, submitted,
    and related user history listings.
  - `mysubreddits` covers subscribed, contributor, and moderated subreddit
    listings.
  - `read` covers many public listing and subreddit/user read endpoints.
- Discord OAuth docs: `https://docs.discord.com/developers/topics/oauth2`
  - `identify` covers `/users/@me`.
  - `guilds` covers basic `/users/@me/guilds` information.
  - `dm_channels.read` is only available to approved partners.
  - `messages.read` is local RPC access, not a normal backend source inventory
    scope.

Implementing PR484J now would either overclaim what the current credentials can
read or silently expand into new OAuth scopes, token decrypt, provider account
lookup, provider clients, and source-read redaction decisions in one lane.

## Smallest Unblock Lane

MIMIR should open a smaller lane before source inventory implementation:

```text
PR484J-A - Archive Connector Source Scope And Account Contract
```

Recommended owner: ARGUS / A3 for hostile preflight, then DAEDALUS only if the
contract is accepted.

The unblock lane should decide:

- exact provider source types Station is willing to inventory first;
- whether Reddit inventory starts with `mysubreddits`, `history`, `read`, or a
  smaller account-only proof;
- whether Discord inventory is limited to `guilds` basic readback, or whether
  Discord source inventory is deferred until a bot/install/partner-scope lane;
- owner-facing consent copy for every expanded OAuth scope;
- whether existing `identity`/`identify` credentials must be treated as
  `scope_missing` and require reconnect;
- whether provider account lookup is a separate lane or part of the same
  contract;
- raw external account id policy: never return raw ids; store only fingerprints
  if account identity is accepted;
- token decrypt policy and failure modes;
- provider-client mock seam and redaction rules;
- inventory response fields and forbidden fields;
- import boundary proving no archive source, import job, Memory, Canon,
  Continuity, document, public copy, queue, or worker write happens.

## Boundary If Later Accepted

A future source inventory route should not be opened until PR484J-A resolves the
blockers above. If MIMIR later accepts it, ARGUS recommends a route shape like:

```text
GET /archive-connectors/:provider/source-inventory
```

Future source inventory should be owner-only, read-only, provider-client mocked
in tests, and fail closed for:

- unsupported provider;
- missing or revoked local credential;
- missing credential encryption config;
- decrypt failure;
- `scope_missing` or old connect-proof-only credential;
- provider app/config missing;
- provider auth failure;
- provider rate limit;
- provider payload shape mismatch;
- storage failure.

Future responses should return only safe metadata such as provider, source type,
bounded label, coarse availability, and opaque source keys. No preview text,
message bodies, post/comment bodies, private channel names, raw external ids,
provider payloads, permalinks carrying private ids, tokens, OAuth scopes from
raw token payloads, stack traces, SQL/table details, storage paths, or
secret-shaped values should be returned.

## Non-Scope For The Blocked Lane

PR484J must not add or change:

- provider source API calls;
- token decrypt;
- OAuth scope expansion;
- provider account lookup;
- provider clients or SDKs;
- source inventory routes;
- import creation or archive source writes;
- Memory, Canon, Continuity, public document, review candidate, or public-copy
  writes;
- recurring pulls, queues, workers, background jobs, Redis, Cloudflare,
  billing, packages, marketplace, broad UI, or social behavior.

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Provider-doc verification | Pass | Checked current Reddit and Discord OAuth scope docs before blocking. |
| Current code scope check | Pass | Current authorization URL code still requests only Reddit `identity` and Discord `identify`. |
| Source decrypt check | Pass | No accepted archive connector token decrypt helper exists. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 84 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, web readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for existing markdown files. |
| Scope/path scan | Pass | PR484J block handoff is docs-only; no app, package, lockfile, or Supabase schema paths changed. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocked PR484J Archive Connector Source Inventory as an implementation lane.
Blocker:
- Current credentials are Reddit `identity` / Discord `identify` connect-proof tokens only, and there is no accepted source-scope consent, provider account, token decrypt, provider-client, or safe source matrix for provider reads.
Task:
- Open the smallest unblock lane, recommended PR484J-A Archive Connector Source Scope And Account Contract, or explicitly defer source inventory.
- Do not send DAEDALUS into provider source calls until the source/scope/consent/redaction/import boundary is accepted.
```
