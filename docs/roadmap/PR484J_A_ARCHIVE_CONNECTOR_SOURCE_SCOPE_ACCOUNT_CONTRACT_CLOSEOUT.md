# PR484J-A - Archive Connector Source Scope And Account Contract Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-A after ARGUS accepted the Archive Connector Source Scope
And Account Contract implementation:

`docs/roadmap/PR484J_A_ARCHIVE_CONNECTOR_SOURCE_SCOPE_ACCOUNT_CONTRACT_REVIEW_RESULT.md`

Accepted boundary:

- pure helper/test/docs surface only;
- source scope contract helper at
  `apps/api/src/services/archive-connectors/source-scope-contract.ts`;
- existing Reddit `identity` and Discord `identify` credentials remain
  connect-proof only and `scope_missing` for source inventory;
- Reddit `mysubreddits`, `history`, and separate deferred `read` decisions are
  explicit;
- Discord future source inventory is limited to `guilds` basic readback;
- Discord channel, message, DM, bot, webhook, and install-style access remains
  deferred or unsupported;
- safe account metadata excludes raw external ids, usernames, display names,
  email, avatar, discriminator, global name, locale, premium flags, provider
  payloads, token payload scopes, encrypted credentials, OAuth state, tokens,
  cookies, and secret-shaped values;
- safe source matrix excludes source bodies, private titles/snippets, raw ids,
  raw URLs/permalinks, provider payloads, live counts, import/write details,
  SQL/storage details, prompts, and secret-shaped values;
- no-import boundary remains false for archive source writes, import jobs,
  Memory, Canon, Continuity, public documents, and review candidates.

No live provider calls, token decrypt, provider SDK, source inventory route,
import write, archive source write, queue, worker, Redis, Cloudflare, billing,
package, marketplace, broad UI, or social behavior was added.

## Next Move

Source inventory still cannot proceed directly. The smallest next unlock is an
OAuth consent/reconnect lane for source-ready credentials:

```text
PR484J-B - Archive Connector Source Scope OAuth Consent / Reconnect
```

This should decide how source scopes enter authorization URLs and token
exchange validation without adding provider source reads.
