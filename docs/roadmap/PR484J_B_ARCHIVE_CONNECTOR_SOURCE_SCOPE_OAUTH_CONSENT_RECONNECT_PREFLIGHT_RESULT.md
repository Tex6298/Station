# PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_B_SOURCE_SCOPE_OAUTH_CONSENT_RECONNECT
```

DAEDALUS may implement the narrow owner OAuth consent/reconnect lane needed to
mint source-ready archive connector credentials.

This lane may change OAuth scope selection, state binding, token-response scope
validation, safe credential/readiness readback, and the minimal credential/state
metadata migration needed to avoid token decrypt for source-scope readback.

It must not add provider source reads, source inventory routes, token decrypt,
provider account lookup, imports, jobs, UI, Cloudflare, Redis, packages,
billing, marketplace, or social behavior.

## Accepted Scope Profiles

Use an explicit `scopeProfile` contract:

- `connect` remains the default and preserves the existing account/connect
  proof behavior.
- `source_inventory` is the only expanded source-scope reconnect profile.

Accepted provider scope sets:

- Reddit `connect`: exact `identity`.
- Reddit `source_inventory`: exact set `identity mysubreddits history`.
- Discord `connect`: exact `identify`.
- Discord `source_inventory`: exact set `identify guilds`.

Do not request Reddit `read` in PR484J-B. Do not request Discord channel,
message, DM, bot, webhook, install, local-RPC, partner, or server-member access.

Normalize scope comparison as unordered sets, but emit authorization URL scopes
in a stable canonical order.

## Route And State Contract

Allowed route changes:

- `POST /archive-connectors/oauth/:provider/start`;
- `POST /archive-connectors/oauth/:provider/authorize`;
- `POST /archive-connectors/oauth/:provider/callback/exchange`;
- `GET /archive-connectors/readiness`;
- `GET /archive-connectors/credentials`;
- archive connector OAuth/token/storage helpers and focused tests.

`start` request body may contain only:

- `localRedirectPath`;
- `scopeProfile`;
- both of those keys.

Absent `scopeProfile` means `connect`. Unknown keys, arrays, scalars, callback
fields, client ids, client secrets, scopes, provider payloads, codes, tokens, or
secret-shaped values must be rejected before state write.

The selected `scopeProfile` must be persisted on the OAuth state row before
authorization URL generation. `authorize` must accept only `{ stateHandle }`
and derive requested scopes from the validated stored state. The client must
not be able to pass or override scopes at authorization time.

The callback exchange path must consume state and pass the consumed state's
`scopeProfile` to token-response validation and credential metadata storage.
Do not infer source readiness from request body fields, provider payloads,
local redirect paths, or decrypted credentials.

## Token Exchange Validation

Token-response scope validation must fail closed:

- `source_inventory` requires a returned provider `scope` value whose normalized
  set exactly equals the requested source inventory set.
- returned extra scopes are rejected, including Reddit `read` and any Discord
  channel/message/DM/bot/webhook/install-style scope.
- missing source scopes are rejected.
- duplicate or reordered scopes may normalize to the same exact set.
- token exchange errors remain the existing bounded Station envelope without
  provider payload, token, code, client-secret, URL, state, row id, or stack
  readback.

For the `connect` profile, PR484J-B may preserve current behavior when the
provider omits `scope`, but the credential must be stored and read only as
connect/account proof. A missing `scope` response must never classify a
credential as `source_scope_ready`.

## Metadata And Migration

DAEDALUS may add one Supabase migration limited to archive connector OAuth
scope metadata:

- add `scope_profile` to `archive_connector_oauth_states`;
- add `scope_profile` to `archive_connector_credentials`;
- add canonical normalized `granted_scopes` metadata to
  `archive_connector_credentials`.

Existing credential rows may be backfilled as `connect` with only the provider
connect-proof scope. They must continue to read as not source-ready and must
set `reconnectRequiredForSourceInventory: true`.

Persist only Station-normalized scope metadata, not raw token payload strings.
The encrypted credential may continue to contain the accepted token material,
but owner/source readiness readback must not require decrypting it.

Allowed safe readback fields:

- provider;
- purpose `archive_connector`;
- `scopeProfile`;
- canonical `grantedScopes`;
- `connectionScopeState`;
- `reconnectRequiredForSourceInventory`;
- existing PR484H safe credential metadata;
- Station-controlled source inventory consent copy and requested scope labels.

Forbidden readback:

- raw provider token payload scope strings;
- tokens, refresh tokens, OAuth codes, state handles, nonce/csrf/session values
  or hashes;
- client secrets, encrypted credential blobs, row ids, owner ids, raw external
  account ids, provider usernames, email, avatar, Discord discriminator/global
  name, provider payloads, source bodies, raw provider ids, SQL/storage detail,
  hosted logs, prompts, cookies, signed URLs, or secret-shaped values.

## Consent Copy Placement

Authorization URL responses should include safe scope-profile readback beside
the URL, such as `scopeProfile`, canonical `requestedScopes`, and
Station-controlled consent/reconnect copy. The URL remains the only place where
client id and state handle appear.

Credential/readiness readback may expose the same safe scope profile and
reconnect state so an owner can understand why reconnect is required. Do not add
a broad UI lane in PR484J-B.

## Required Tests

DAEDALUS must add focused coverage for:

- `start` defaults to `connect`, accepts only exact `scopeProfile` and
  `localRedirectPath` inputs, and stores scope profile on the state row;
- invalid scope profile/body keys are rejected before state write;
- `authorize` derives scopes from stored state only and rejects any body-level
  scope override;
- Reddit authorization URL scopes are exactly `identity` for `connect` and
  `identity mysubreddits history` for `source_inventory`;
- Discord authorization URL scopes are exactly `identify` for `connect` and
  `identify guilds` for `source_inventory`;
- callback exchange binds token validation and credential metadata to the
  consumed state profile;
- token response validation accepts unordered exact configured sets and rejects
  missing scopes, extra scopes, Reddit `read`, Discord channel/message/DM/bot/
  webhook/install scopes, provider payload leakage, and malformed scope strings;
- source-ready credentials persist canonical `scopeProfile` and `grantedScopes`
  without token decrypt;
- legacy/current `connect` credentials keep `account_proof_only` or
  non-source-ready readback and always require reconnect for source inventory;
- readiness/credential/authorization readbacks include only safe scope copy and
  no raw token payload, state, credential, provider source, storage, or secret
  material;
- route/source guards prove no provider source API calls, source inventory
  route, account lookup, token decrypt, imports, jobs, UI, Redis, Cloudflare,
  billing, packages, marketplace, or social behavior entered the lane.

Validation command set for DAEDALUS:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Provider-doc verification | Pass | Checked current Reddit and Discord OAuth scope documentation before accepting the exact source-scope sets. |
| Current code scope check | Pass | Current authorization URL code still requests only Reddit `identity` and Discord `identify`; PR484J-B explicitly changes this only behind `scopeProfile` state binding. |
| Current schema check | Pass | Existing credential/state schema lacks safe granted-scope metadata, so ARGUS accepts one bounded metadata migration. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 88 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, web readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully from cache. |

## Non-Scope

PR484J-B must not add or change:

- provider source inventory routes or provider source API reads;
- token decrypt, token refresh, provider account lookup, raw external account
  lookup, or provider profile fetch;
- Reddit listing/comment/message/body reads, Reddit `read`, or Reddit source
  content import;
- Discord channel, message, DM, member, bot, webhook, install, local-RPC, or
  partner access;
- source inventory writes, archive source writes, import jobs, Memory, Canon,
  Continuity, public documents, review candidates, queues, recurring pulls,
  workers, Redis, Cloudflare, Railway/runtime config, billing/Stripe, provider
  model calls, package dependencies, broad connector UI, marketplace, or social
  posting;
- committed credentials, OAuth codes, access tokens, refresh tokens, client
  secrets, env values, encrypted credential blobs, provider payloads, hosted
  logs, private source bodies, SQL/table details, cookies, prompts, signed URLs,
  storage paths, or secret-shaped values.

## Hosted Proof

No ARIADNE hosted proof is required for the PR484J-B preflight. DAEDALUS should
produce local route/storage tests only. Hosted proof remains blocked until
MIMIR opens a visible owner connector or deployed provider-config rehearsal.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-B Archive Connector Source Scope OAuth Consent / Reconnect.
Task:
- Implement only the bounded source-scope OAuth reconnect lane: scopeProfile-bound state, exact Reddit/Discord source scope authorization URLs, exact token response validation, safe granted-scope metadata/readback, and focused tests.
- Keep provider source reads, source inventory routes, token decrypt, account lookup, imports, jobs, UI, Cloudflare, Redis, billing, packages, marketplace, and social behavior out of scope.
```
