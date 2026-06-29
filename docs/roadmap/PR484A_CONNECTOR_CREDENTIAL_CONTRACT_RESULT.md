# PR484A Connector Credential Contract Result

Date: 2026-06-29

Owner: DAEDALUS / A2

Status: READY_FOR_ARGUS_REVIEW

## Summary

DAEDALUS implemented the accepted PR484A provider-neutral archive connector
credential contract in helper/test/docs scope only.

The contract defines:

- provider ids limited to `reddit` and `discord`;
- archive connector purpose as distinct from social publishing and AI provider
  BYOK;
- owner-only credential states: `not_configured`, `oauth_app_missing`,
  `ready_for_oauth`, `connected_redacted`, `revoked`, and `blocked`;
- OAuth state expectations for owner/session/provider/purpose binding,
  one-time nonce, expiry, csrf protection, and callback code redaction;
- secret handling rules for access tokens, refresh tokens, OAuth codes,
  cookies, credentials, secret-shaped values, and raw external account ids;
- future storage expectation for a dedicated encrypted connector credential
  schema and environment key before storage;
- source inventory boundaries for safe metadata/counts only;
- import permission boundaries requiring explicit owner confirmation before
  archive/import/Memory/Canon/Continuity/document/review writes.

## Files Changed

- `apps/api/src/services/archive-connectors/credential-contract.ts`
- `apps/api/src/services/archive-connectors/credential-contract.test.ts`
- `docs/architecture/live-archive-connector-credential-contract.md`
- `docs/roadmap/PR484A_CONNECTOR_CREDENTIAL_CONTRACT_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 33 tests passed across the new contract, no-write import preview, Reddit/Discord parsers, social route fail-closed behavior, and web social readiness source guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran successfully; web typecheck replayed from cache. |

## Boundaries

PR484A does not add live Reddit API calls, Discord API calls, OAuth redirects,
OAuth callback routes, token exchange, token refresh, token revocation,
provider SDKs, configured test-credential execution, recurring pulls,
background jobs, workers, queues, scheduled jobs, Redis, Cloudflare, runtime
provisioning, automatic import into Memory/Canon/Continuity/public documents/
archive sources/import jobs/import review, broad connector marketplace, public
connector pages, cross-owner connector access, admin impersonation,
provider/model calls, billing, Stripe, schema changes, migrations, package
dependencies, new external config, or route/UI behavior.

The contract readback does not return access tokens, refresh tokens, OAuth
codes, cookies, credentials, secret-shaped values, raw external account ids,
private source bodies, private messages, archive snippets, unsafe permalinks,
provider payloads, storage paths, signed URLs, hosted logs, SQL/table details,
stack traces, or prompts.

## ARGUS Task

Review the contract helper, source-level no-live-connector tests, architecture
note, and validation evidence. If accepted, wake MIMIR with `WAKEUP A1:` for
closeout. If fixes are needed, wake DAEDALUS with `WAKEUP A2:` and the exact
contract state, redaction rule, boundary, source guard, or doc expectation that
failed.
