# PR484G - Archive Connector OAuth Token Exchange / Credential Write Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Implementation

DAEDALUS implemented the accepted backend-only PR484G token exchange and
encrypted credential write boundary:

- added authenticated route
  `POST /archive-connectors/oauth/:provider/callback/exchange`;
- left existing callback verify semantics unchanged;
- request body accepts exactly `stateHandle` and `code` using the bounded
  PR484F-C callback shape;
- local fail-closed checks run before state consume, token endpoint work, or
  credential write: provider allow-list, exact body shape, complete provider
  app config, valid credential encryption config, safe callback redirect URI,
  and owner/session/provider-bound state;
- state is consumed exactly once immediately before the mocked provider token
  endpoint request;
- Reddit token request uses
  `https://www.reddit.com/api/v1/access_token`, POST form encoding, HTTP Basic
  archive client auth, `grant_type=authorization_code`, callback code, and the
  accepted redirect URI;
- Discord token request uses
  `https://discord.com/api/oauth2/token`, POST form encoding, `client_id`,
  `client_secret`, `grant_type=authorization_code`, callback code, and the
  accepted redirect URI;
- token responses are bounded, scope-checked to Reddit `identity` or Discord
  `identify`, and collapsed to Station errors on provider failure;
- token material is stored only through the accepted encrypted archive
  connector credential helper, with `accountLabel: null` and no external
  account fingerprint;
- credential readback returns only the accepted safe encrypted-credential
  metadata.

## Non-Scope Confirmation

This implementation does not add provider profile/account lookup, Reddit
source/listing/saved/upvoted/history/comment/message reads, Discord guild/
member/channel/message/bot/webhook reads, refresh, revocation, recurring pull,
source inventory, import jobs or writes, archive source writes, Memory, Canon,
Continuity, public documents, review candidates, queues, workers, Redis,
Cloudflare, billing/Stripe, provider/model calls, package dependencies, broad
connector UI, marketplace behavior, or social posting.

No response returns raw access token, refresh token, OAuth code, state handle,
nonce/csrf/session values or hashes, client id, client secret, raw provider
payload, provider account id, row id, owner id, SQL/table detail, storage path,
hosted log, stack trace, private source data, prompt, signed URL, or
secret-shaped values.

## Validation

| Command / check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts` | Passed with 26 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts` | Passed with 7 tests |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Passed with 70 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Passed |
| `git diff --check` | Passed with CRLF normalization warnings only |

## Current Lane

```text
PR484G - Archive Connector OAuth Token Exchange / Credential Write
Owner: ARGUS / A3
State: READY FOR REVIEW
```

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented the accepted PR484G backend-only token exchange and encrypted credential write boundary.
- Exchange fails local config/origin/encryption checks before state consume, provider token endpoint work, or credential write.
- State is consumed exactly once immediately before the token endpoint request; token/credential failures leave the owner on restart flow.
Validation:
- archive connector route tests pass with 26 tests.
- archive connector credential storage tests pass with 7 tests.
- combined connector/callback/storage/import/social/web readiness set passes with 70 tests.
- typecheck passes.
Risk:
- ARGUS should hostile-review state consume timing, token endpoint request shape, encrypted credential material, token/provider payload redaction, and source-scope guards.
Task:
- Review PR484G. If accepted, wake MIMIR. If fixes are needed, wake DAEDALUS with the smallest repair.
```
