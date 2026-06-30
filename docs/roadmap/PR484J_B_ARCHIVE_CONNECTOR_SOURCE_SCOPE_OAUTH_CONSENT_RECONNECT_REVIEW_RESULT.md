# PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_B_SOURCE_SCOPE_OAUTH_CONSENT_RECONNECT
```

ARGUS accepts the PR484J-B implementation after a narrow review patch.

Implemented boundary accepted:

- `scopeProfile` is bound to OAuth state at start time;
- `authorize` accepts only `{ stateHandle }` and derives provider scopes from
  stored state;
- Reddit authorization scopes are exact `identity` for `connect` and
  `identity mysubreddits history` for `source_inventory`;
- Discord authorization scopes are exact `identify` for `connect` and
  `identify guilds` for `source_inventory`;
- callback exchange consumes state and validates token response scopes against
  the consumed state's profile;
- source-ready token responses require exact normalized scope sets;
- credential/readiness readback exposes only Station-normalized scope metadata;
- existing connect-proof credentials remain not source-ready and require
  reconnect for source inventory;
- migration `infra/supabase/migrations/063_archive_connector_scope_metadata.sql`
  adds only bounded OAuth state and credential scope metadata.

No provider source reads, source inventory routes, token decrypt, provider
account lookup, imports, jobs, UI, hosted/runtime config, Cloudflare, Redis,
billing, packages, marketplace, or social behavior was added.

## ARGUS Patch

ARGUS made two narrow claim-honesty repairs:

- Profile option readback now uses `sourceInventoryRequested` instead of
  `sourceInventoryReady`, and profile/start readback no longer returns
  credential-style `reconnectRequiredForSourceInventory` before a credential
  exists.
- Credential storage no longer infers `scopeProfile` or `grantedScopes` from
  arbitrary `secretMaterial`; callers must pass explicit, already validated
  scope metadata or storage defaults to connect proof only.

Regression coverage was added to prove secret-material `scopeProfile` and
`grantedScopes` fields cannot make a credential read as source-ready.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts` | Pass | 53 focused connector route/storage/contract tests passed after the ARGUS patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 92 tests passed across connector route/storage/contract, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| Scope/path scan | Pass | Review patch touched archive connector API helpers/tests and docs only; implementation stayed within accepted API helper/route/test, one Supabase metadata migration, and docs surface. |
| Forbidden behavior scan | Pass | Route/source guards and review scans found no provider source API calls, source inventory route, token decrypt, provider account lookup, imports, jobs, UI, Redis, Cloudflare, billing, packages, marketplace, or social behavior. |

## Residual Risk

This remains a local backend/API review. Hosted owner proof remains separate
because deployed archive connector provider app config and credential encryption
are still external runtime concerns. PR484J-B also does not add provider source
inventory reads; it only prepares source-ready OAuth credentials and safe
readback.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-B Archive Connector Source Scope OAuth Consent / Reconnect after a narrow claim-honesty patch.
Task:
- Close PR484J-B or choose the next archive connector move.
- Provider source inventory reads, token decrypt, account lookup, imports, UI, hosted proof, packages, billing, Redis, Cloudflare, marketplace, and social behavior remain separate lanes unless explicitly opened.
```
