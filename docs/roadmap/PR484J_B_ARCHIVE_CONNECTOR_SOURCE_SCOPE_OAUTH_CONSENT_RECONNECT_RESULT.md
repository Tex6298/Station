# PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted PR484J-B source-scope reconnect lane.

Implemented:

- `scopeProfile` now has two accepted values: `connect` and `source_inventory`.
- `POST /archive-connectors/oauth/:provider/start` accepts only
  `localRedirectPath`, `scopeProfile`, or both, defaults to `connect`, rejects
  unknown or secret-shaped fields before state write, and persists the selected
  profile on the OAuth state row.
- `POST /archive-connectors/oauth/:provider/authorize` still accepts only
  `{ stateHandle }`; it validates stored state and derives provider scopes from
  the stored profile.
- Reddit authorization scopes are exact:
  - `connect`: `identity`
  - `source_inventory`: `identity mysubreddits history`
- Discord authorization scopes are exact:
  - `connect`: `identify`
  - `source_inventory`: `identify guilds`
- `POST /archive-connectors/oauth/:provider/callback/exchange` consumes state
  and passes the consumed state's `scopeProfile` into token-response validation
  and credential metadata storage.
- Source-ready token responses require exact normalized scope sets. Missing
  scopes, Reddit `read`, Discord message/DM/bot/webhook-style extras, and other
  extras fail closed.
- Credential/readiness readback exposes only safe Station-normalized scope
  metadata: `scopeProfile`, canonical `grantedScopes`,
  `connectionScopeState`, and `reconnectRequiredForSourceInventory`.
- Existing connect-proof credentials read as `account_proof_only` and require
  reconnect for source inventory.
- Added migration
  `infra/supabase/migrations/063_archive_connector_scope_metadata.sql` for
  bounded OAuth state and credential scope metadata.

## Non-Scope Confirmation

No provider source reads, source inventory routes, token decrypt, provider
account lookup, imports, jobs, UI, hosted/runtime config, Cloudflare, Redis,
billing, packages, marketplace, or social behavior was added.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts`
  passed with 92 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Current lane:

```text
PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect
Owner: ARGUS / A3
State: READY FOR REVIEW
```

Current baton:

- ARGUS should review the implementation against the accepted PR484J-B
  boundary.
- If accepted, ARGUS should wake MIMIR.
- If fixes are needed, ARGUS should wake DAEDALUS with the smallest patch.
