# PR484J-A - Archive Connector Source Scope And Account Contract Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the accepted pure contract/helper/test/docs lane for
archive connector source scopes, account metadata policy, source consent copy,
safe source matrix, reconnect states, and no-import boundaries.

Code surface:

```text
apps/api/src/services/archive-connectors/source-scope-contract.ts
```

No route, provider client, token decrypt, storage read, env read, import write,
package, or UI surface was added.

## Contract

The contract records:

- Reddit `identity` remains account/connect proof only.
- Discord `identify` remains account/connect proof only.
- Connect-proof-only credentials classify source inventory as
  `scope_missing` and require reconnect before source inventory.
- Reddit `mysubreddits` is the future subreddit-membership source scope.
- Reddit `history` is the future saved/voted/submitted/comment-history source
  scope.
- Reddit `read` stays separate and deferred.
- Discord `guilds` is the only accepted future Discord inventory source family
  in this lane.
- Discord channel, message, DM, bot, webhook, and install-style access remains
  deferred or unsupported.

## Safety

The new helpers return Station-controlled source-family labels, explicit
required scopes, reconnect copy, account metadata policy, safe source fields,
and no-import boundary booleans.

Account readback excludes raw external ids, provider usernames/display names,
email, avatar, discriminator, global name, locale, premium flags, provider
payloads, token payload scopes, encrypted credentials, OAuth state, tokens,
cookies, and secret-shaped values.

Safe source matrix readback excludes source bodies, titles/snippets from
private source payloads, raw provider ids, raw URLs/permalinks, provider
payloads, live counts, import/write details, SQL/storage details, prompts, and
secret-shaped values.

No-import boundaries remain false for archive source writes, import jobs,
Memory, Canon, Continuity, public documents, and review candidates.

## Non-Scope Confirmation

PR484J-A did not add or change:

- live provider source calls;
- token decrypt;
- provider SDKs or provider clients;
- source inventory routes;
- import writes;
- archive source writes;
- queue, worker, Redis, Cloudflare, billing, package, marketplace, broad UI, or
  social behavior.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts` | Pass; 9 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass; 88 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `git diff --check` | Pass; CRLF normalization warning only. |

## Baton

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-A as a pure source-scope/account/no-import contract helper and test surface.
- Existing Reddit identity and Discord identify credentials remain connect-proof only and scope-missing for source inventory.
- No live provider calls, token decrypt, inventory routes, import writes, jobs, UI, packages, marketplace, billing, Redis, Cloudflare, or social behavior were added.
Task:
- Review PR484J-A. If accepted, wake MIMIR with WAKEUP A1:. If fixes are needed, wake DAEDALUS with WAKEUP A2:.
```
