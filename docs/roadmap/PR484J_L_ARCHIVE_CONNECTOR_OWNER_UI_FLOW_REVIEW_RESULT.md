# PR484J-L - Archive Connector Owner UI Flow Review Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for MIMIR

## Verdict

```text
ACCEPT_PR484J_L_ARCHIVE_CONNECTOR_OWNER_UI_FLOW
```

ARGUS accepts the PR484J-L owner UI flow after a narrow review patch.

Accepted implementation:

- the first owner-visible connector flow lives in the existing persona Archive
  tab at `/studio/personas/[personaId]/files`;
- the UI exposes one Reddit saved-items owner flow over accepted archive
  connector APIs only;
- the live OAuth callback path uses callback exchange and receives the
  already-safe `localRedirectPath` from the consumed state;
- source inventory is filtered to `reddit_user_history` / `saved_items` and
  rendered as generic `Reddit saved items` copy;
- account lookup, source inventory, import intent, activation, source preview,
  staging, import preview, and final connector import remain explicit owner
  button actions after OAuth;
- no new connector list/recovery endpoint, database table, background job,
  staged-run listing route, import execution behavior, `/imports/chat`
  connector use, generic parser reuse, Discord content, broader Reddit source,
  queue/worker, pagination, recurring pull, hosted/runtime, billing, Redis,
  Cloudflare, marketplace, partner adapter, social behavior, public write,
  Canon, Continuity, or review-candidate work enters scope.

ARGUS patch:

- callback success now always offers a safe return link, falling back to
  `/studio/archive` when callback exchange has no `localRedirectPath`;
- completed connector imports now report import completion even if the
  follow-up Archive library refresh fails, avoiding a false retryable-error
  label after a successful final import.

## Boundary Review

Owner, auth, and persona boundaries are intact:

- persona Archive placement keeps the flow inside the owner workspace;
- all connector calls use the owner token path already accepted for this lane;
- import intent and final import still require persona/source/run linkage
  rechecks in the accepted backend routes;
- post-OAuth writes remain owner-confirmed actions rather than automatic
  callback side effects.

Privacy and secret boundaries are intact:

- OAuth query parameters are scrubbed before live callback exchange;
- no OAuth codes, state values, authorization URLs, access tokens, refresh
  tokens, provider payloads, raw provider ids, usernames, subreddit names, URLs,
  authors, source bodies, encrypted batch contents, SQL details, stack traces,
  or secret-shaped values are rendered in the owner flow;
- source readback is generic and saved-items-only;
- callback exchange readback is limited to a safe local redirect path.

Scope boundaries are intact:

- no Cloudflare, hosted runtime, queues, workers, billing, Redis, marketplace,
  partner adapter, social behavior, public write, Discord content-read, broader
  Reddit history/subreddit import, pagination crawl, or recurring pull behavior
  was added.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts` | Pass | 10 owner-flow/callback tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts apps/api/src/routes/archive-connectors.test.ts` | Pass | 116 tests passed across owner-flow helpers, callback bridge, Studio navigation, Archive trust, and archive connector API routes. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 152 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint completed with no lint warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Not rerun | PR484J-L used the ARGUS-named validation set. The known local Windows Next standalone symlink `EPERM` caveat remains the build truth if build is rerun here. |

## Residual Risk

This is a local technical review. Because PR484J-L is a visible owner workflow,
ARGUS recommends MIMIR either close the lane with that limitation called out or
route the accepted implementation to ARIADNE for desktop plus 375px/390px
mobile rehearsal.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted PR484J-L Archive Connector Owner UI Flow after a narrow review patch.
- The persona Archive Reddit saved-items flow stays owner-only, uses accepted connector APIs only, filters to saved items, keeps final import owner-confirmed, and does not add Discord content, broader Reddit sources, queues/workers, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, or new backend import behavior.
- ARGUS patched callback success fallback navigation and import-success/readback honesty when the follow-up archive refresh fails.
Validation:
- Owner-flow/callback focused tests: 10 pass.
- PR484J-L lane suite: 116 pass.
- Broader archive/social/background/import/error suite: 152 pass.
- Typecheck: pass.
- Lint: pass.
- Diff check: pass.
Task:
- Close PR484J-L or route the accepted visible implementation to ARIADNE for desktop/mobile rehearsal.
```
