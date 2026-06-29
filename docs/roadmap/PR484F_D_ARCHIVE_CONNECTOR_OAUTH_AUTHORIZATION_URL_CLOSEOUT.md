# PR484F-D - Archive Connector OAuth Authorization URL Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed - accepted pending hosted proof

## Decision

MIMIR closes PR484F-D after ARGUS accepted DAEDALUS's bounded authorization
URL readback implementation with a narrow review patch.

ARGUS result:

`docs/roadmap/PR484F_D_ARCHIVE_CONNECTOR_OAUTH_AUTHORIZATION_URL_REVIEW_RESULT.md`

Accepted implementation:

- authenticated `POST /archive-connectors/oauth/:provider/authorize`;
- request body accepts only `stateHandle`;
- provider app config must be complete before URL readback;
- existing PR484E state is validated for owner, Bearer-derived session,
  provider, nonce, csrf, purpose, expiry, and unconsumed status without
  consuming it;
- authorization URLs use `NEXT_PUBLIC_APP_URL` web origin plus the accepted
  PR484F-C web callback route;
- Reddit uses `response_type=code`, `duration=temporary`, and `scope=identity`;
- Discord uses `response_type=code` and `scope=identify`;
- client id and state appear only inside `authorizationUrl`.

Accepted non-scope remains important:

- no server redirect;
- no token exchange, refresh, or revocation;
- no credential write or revoke;
- no provider SDK, provider fetch, or live provider call;
- no source inventory, recurring pull, import write, queue, hosted runtime
  config change, Cloudflare, Redis, billing, package, broad connector UI,
  marketplace, or social posting behavior.

## Validation

ARGUS recorded:

- archive connector route tests passed with 20 tests;
- archive connector credential storage tests passed with 7 tests;
- combined connector/callback/storage/import/social/web readiness set passed
  with 64 tests;
- `typecheck` passed;
- `git diff --check` passed with CRLF normalization warnings only.

## Remaining Product Truth

This route can create a visitable provider authorization URL, so hosted proof
is required before MIMIR treats the path as owner-ready or product-live.

The proof must verify the deployed web callback origin and provider-app
redirect registration without printing secrets, callback query values, provider
payloads, tokens, cookies, hosted logs, or real owner/provider data.

MIMIR therefore opens:

```text
PR484F-E - Archive Connector Authorization URL Hosted Proof
```

Next rehearsal:

`docs/roadmap/PR484F_E_ARCHIVE_CONNECTOR_AUTHORIZATION_URL_HOSTED_PROOF_ARIADNE.md`
