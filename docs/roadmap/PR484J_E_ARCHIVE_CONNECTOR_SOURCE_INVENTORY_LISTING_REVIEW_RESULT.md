# PR484J-E - Archive Connector Source Inventory Listing Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_E_SOURCE_INVENTORY_LISTING
```

ARGUS accepts the PR484J-E implementation without a review patch.

Accepted boundary:

- authenticated owner-only route:
  `GET /archive-connectors/:provider/source-inventory`;
- exact source-ready credential metadata and decrypted token proof required;
- completed account lookup metadata required before any provider source fetch;
- Reddit provider source read limited to
  `/subreddits/mine/subscriber?limit=100&raw_json=1`;
- Reddit history availability derived from Station-controlled category rows
  only, with no Reddit history content/listing endpoint calls;
- Discord provider source read limited to
  `/users/@me/guilds?limit=200&with_counts=false`;
- safe source rows return bounded labels, opaque Station source keys, coarse
  availability, truncation booleans, and row-level safety booleans only;
- route-level safety booleans honestly report token decrypt and provider source
  read activity while keeping token exchange, refresh, revoke, account lookup,
  metadata update, imports, jobs, queues, public writes, UI, raw id readback,
  provider payload readback, and provider header readback disabled.

## Review Checks

ARGUS reviewed the DAEDALUS handoff, implementation diff, route/storage/provider
helpers, source guards, and focused tests.

Findings:

- source credential/account-proof gating matches the accepted lane: unsupported
  providers fail before storage, connect-proof credentials fail before provider
  fetch, and missing account proof fails before provider fetch;
- provider endpoint containment matches the preflight exactly for Reddit and
  Discord;
- Reddit history rows are local category metadata only and do not call history
  content/listing endpoints;
- source rows do not expose raw provider ids, Reddit fullnames, Discord
  snowflakes, provider payloads, provider headers, raw cursors, counts, URLs,
  icons, permissions, tokens, encrypted blobs, storage details, stack traces,
  source bodies, or secret-shaped values;
- the implementation stayed in archive connector route/service/storage/tests
  and roadmap/validation docs;
- no UI, hosted/runtime, package, billing, Redis, Cloudflare, marketplace,
  partner adapter, social, import, queue, worker, archive source write, Memory,
  Canon, Continuity, public document, or review candidate behavior entered the
  lane.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts` | Pass | 64 focused connector storage/route tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 112 tests passed across connector storage/contract/routes, import preview/parsers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck executed and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| Scope/path scan | Pass | DAEDALUS touched only archive connector route/service/storage/tests and roadmap/validation docs. ARGUS added only this review verdict and status docs. |
| Forbidden behavior scan | Pass | Source guards and review scans found only the accepted Reddit subreddit-membership endpoint and Discord current-user-guild endpoint; no Reddit history content calls, Reddit `read`/discovery calls, Discord channel/message/member/connection/bot/webhook/install calls, imports, jobs, queues, UI, package, billing, Redis, Cloudflare, marketplace, partner adapter, or social behavior entered the lane. |

## Residual Risk

This is source inventory metadata only. It does not read source bodies, import
content, create archive sources, schedule jobs, crawl pagination, expose UI, or
prove hosted runtime behavior.

Future lanes must separately preflight and review any owner confirmation UI,
source body reads, import writes, pagination crawl, Reddit `read` scope, Reddit
history content endpoints, Discord channels/messages/members, hosted runtime,
or recurring pull behavior.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-E Archive Connector Source Inventory Listing without a review patch.
Task:
- Close PR484J-E or choose the next archive connector move.
- Source body reads, import writes/jobs, owner confirmation UI, pagination crawl, Reddit read/history content endpoints, Discord channel/message/member reads, hosted/runtime work, packages, billing, Redis, Cloudflare, marketplace, partner adapters, and social behavior remain separate lanes unless explicitly opened.
```
