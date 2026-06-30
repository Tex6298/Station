# PR484J-A - Archive Connector Source Scope And Account Contract Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_A_SOURCE_SCOPE_ACCOUNT_CONTRACT
```

DAEDALUS may implement a contract/helper/test/docs lane for archive connector
source scopes, owner consent copy, provider account metadata policy, safe source
metadata, and no-import boundaries.

PR484J-A must not add live source inventory routes, token decrypt, provider
source API calls, import writes, jobs, UI, packages, or provider SDKs.

## Accepted Scope

Allowed implementation surface:

- provider source scope definitions for Reddit and Discord;
- source-scope consent copy/readback helpers;
- provider account safe metadata rules;
- reconnect and `scope_missing` state rules for existing connect-proof
  credentials;
- source inventory safe-field matrix;
- no-import boundary helpers or contract readback;
- focused tests and roadmap/testing docs.

Recommended code placement:

- prefer a new archive connector contract module if the existing credential
  contract would become too crowded;
- keep any helpers pure and deterministic;
- do not read env, credentials, tokens, provider config, network, storage, or
  request state in PR484J-A helpers.

## Provider Scope Matrix

Accepted first-pass contract decisions:

- Reddit current `identity` remains account/connect proof only.
- Reddit `mysubreddits` may be the future first inventory scope for subreddit
  membership/source availability.
- Reddit `history` may be the future source scope for saved/upvoted/downvoted,
  comments, submitted, hidden, and related user history categories.
- Reddit `read` remains separate and must not be bundled silently with history
  or mysubreddits.
- Discord current `identify` remains account/connect proof only.
- Discord `guilds` may be the future first Discord inventory scope for basic
  guild availability.
- Discord channels, messages, DMs, webhooks, bots, member reads, and partner or
  local-RPC scopes are deferred.

Existing credentials minted with only Reddit `identity` or Discord `identify`
must be classified as `scope_missing` for source inventory and require a fresh
owner OAuth reconnect after MIMIR accepts expanded scope consent.

## Consent And Account Policy

Consent copy must be explicit per provider and per source family. Do not use
generic copy like "read your data" without naming the bounded source family.

Allowed account metadata in contract/readback:

- provider id;
- purpose `archive_connector`;
- safe account label text;
- external account fingerprint presence boolean;
- connection/scope state;
- required reconnect state.

Forbidden account metadata:

- raw external account ids;
- provider usernames or display names before an account lookup policy is
  accepted;
- email, avatar URL, discriminator, global name, locale, premium flags,
  provider payloads, or raw OAuth scope strings from token payloads;
- tokens, refresh tokens, OAuth codes, cookies, state handles, encrypted
  credential blobs, or secret-shaped values.

PR484J-A may define how a future account lookup would store a fingerprint and
sanitized label, but it must not implement account lookup or token decrypt.

## Safe Source Matrix

Contract helpers may describe future inventory rows, but must keep them safe:

- provider;
- source family/type;
- required OAuth scopes;
- state: `available`, `scope_missing`, `unsupported`, `deferred`, or
  `blocked`;
- owner-only purpose;
- safe label copy controlled by Station, not provider payload text;
- optional coarse capability flags.

Forbidden inventory fields:

- post, comment, message, DM, private channel, or thread body text;
- source snippets, previews, titles from private/private-ish source payloads;
- raw provider ids, channel ids, guild ids, subreddit ids, message ids, user
  ids, account ids, or snowflakes;
- raw permalinks or URLs carrying private ids;
- provider payloads, token payload scopes, request ids, headers, rate-limit
  headers, stack traces, SQL/table details, storage paths, prompts, signed
  URLs, cookies, or secret-shaped values;
- counts derived from live provider source bodies unless a later provider-read
  lane accepts them.

## Token Decrypt And Provider Client Policy

PR484J-A may define a future token decrypt policy, but must not implement token
decrypt. No `createDecipheriv`, decrypt helper, decrypted token type, provider
fetch, provider SDK, or live provider client should be added.

PR484J-A may define pure TypeScript interfaces for a future mocked provider
client boundary only if they do not contain token material and do not perform
network work.

## Import Boundary

PR484J-A must prove that source-scope/account contract work creates no:

- archive source rows;
- import jobs;
- Memory, Canon, or Continuity records;
- documents, public copies, review candidates, or published artifacts;
- queues, workers, recurring pulls, Redis, Cloudflare, billing, marketplace,
  broad UI, or social posting behavior.

## Required Tests

DAEDALUS must add focused tests for:

- current Reddit `identity` and Discord `identify` credentials map to account
  proof only and `scope_missing` for source inventory;
- accepted future Reddit source families and required scopes are explicit;
- accepted future Discord source family is limited to basic `guilds` readback;
- deferred Discord channel/message/DM/bot/partner scopes cannot appear as
  accepted source inventory;
- reconnect copy is present for connect-proof-only credentials;
- account metadata readback excludes raw external ids, provider usernames,
  email, avatar, discriminator, token payload, encrypted credential, OAuth
  state, or secret-shaped values;
- safe source matrix excludes source bodies, titles/snippets, raw ids,
  provider payloads, raw URLs/permalinks, counts from live provider data, and
  import/write details;
- source guards prove no token decrypt, provider fetch/client execution,
  provider SDK, route, import write, archive source write, queue, worker,
  Redis, Cloudflare, billing, package, broad UI, marketplace, or social
  behavior.

Validation command set for DAEDALUS:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 84 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, web readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for existing markdown files. |
| Path/scope scan | Pass | PR484J-A preflight handoff is docs-only; no app, package, lockfile, or Supabase schema paths changed. |

## Hosted Proof

No hosted proof is required for PR484J-A because it is a local contract/helper
lane with no routes, provider calls, token decrypt, import writes, or UI.

Hosted proof should wait until MIMIR accepts a visible owner connector surface
or a live provider source inventory route with deployed provider config.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-A Archive Connector Source Scope And Account Contract.
Task:
- Implement only pure contract/helper/test/docs surface for source scopes, consent copy, account metadata policy, safe source matrix, reconnect/scope-missing states, and no-import boundaries.
- Keep live provider source calls, token decrypt, provider SDKs, source inventory routes, import writes, UI, Redis, Cloudflare, billing, packages, marketplace, and social behavior out of scope.
```
