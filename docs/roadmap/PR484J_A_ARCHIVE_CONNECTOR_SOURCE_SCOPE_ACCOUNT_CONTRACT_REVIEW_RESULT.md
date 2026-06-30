# PR484J-A - Archive Connector Source Scope And Account Contract Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_A_SOURCE_SCOPE_ACCOUNT_CONTRACT
```

ARGUS reviewed DAEDALUS's PR484J-A implementation and accepts it with a narrow
claim-honesty patch.

## Review Result

Accepted implementation:

- pure helper/test/docs surface only;
- new source scope contract helper at
  `apps/api/src/services/archive-connectors/source-scope-contract.ts`;
- existing Reddit `identity` and Discord `identify` credentials remain
  connect-proof only and `scope_missing` for source inventory;
- Reddit `mysubreddits`, `history`, and separate deferred `read` decisions are
  explicit;
- Discord future source inventory is limited to `guilds` basic readback while
  channel, message, DM, bot, webhook, and install-style access remains deferred
  or unsupported;
- account metadata policy excludes raw external ids, provider usernames/display
  names, email, avatar, discriminator, global name, locale, premium flags,
  provider payloads, token payload scopes, encrypted credentials, OAuth state,
  tokens, cookies, and secret-shaped values;
- safe source matrix excludes source bodies, private titles/snippets, raw ids,
  raw URLs/permalinks, provider payloads, live counts, import/write details,
  SQL/storage details, prompts, and secret-shaped values;
- no-import boundary remains false for archive source writes, import jobs,
  Memory, Canon, Continuity, public documents, and review candidates.

No live provider calls, token decrypt, provider SDK, source inventory route,
import write, archive source write, queue, worker, Redis, Cloudflare, billing,
package, marketplace, broad UI, or social behavior was added.

## ARGUS Patch

ARGUS made a narrow contract-accuracy patch:

- deferred or unsupported source families with no OAuth scopes no longer claim
  `accountProofOnly: true`;
- account metadata policy now names the actual safe readback field
  `accountLabel` instead of `safeAccountLabel`;
- tests now guard those claims.

No route behavior, provider behavior, token decrypt, storage, imports, schema,
package, UI, hosted runtime, queue, billing, Cloudflare, Redis, marketplace, or
social behavior changed in the ARGUS patch.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts` | Pass | 9 contract tests passed after the ARGUS patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 88 tests passed across connector route/storage/contract, callback bridge, import preview/parsers, social fail-closed routes, web readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed successfully. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched source files. |
| Scope/path scan | Pass | No package, lockfile, Supabase schema, or web path changed. |
| Forbidden-source scan | Pass | Source scope helper contains no fetch, route, token decrypt, provider SDK/client execution, import, queue, Redis, Cloudflare, billing, package, marketplace, social, env, or provider-secret access. |

## Remaining Truth

PR484J-A is a local/backend contract only. Source inventory implementation is
still not accepted. A future lane must separately accept token decrypt, provider
clients, expanded OAuth consent, provider account lookup, hosted/runtime config,
owner UI or API route shape, provider read redaction, and import confirmation
boundaries before any live provider source calls.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-A Archive Connector Source Scope And Account Contract with a narrow claim-honesty patch.
Validation:
- source scope/credential contract tests pass with 9 tests.
- combined connector/callback/storage/import/social/web readiness plus error-handler set passes with 88 tests.
- typecheck passes.
- diff check, scope/path scan, and forbidden-source scan pass.
Task:
- Close PR484J-A or decide the next archive connector move.
- Keep live provider source calls, token decrypt, inventory routes, imports, UI, hosted proof, packages, billing, Redis, Cloudflare, marketplace, and social behavior in separate lanes unless explicitly opened.
```
