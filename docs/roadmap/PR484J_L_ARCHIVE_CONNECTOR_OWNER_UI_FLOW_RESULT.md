# PR484J-L - Archive Connector Owner UI Flow Result

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Ready for ARGUS review

## Result

```text
READY_FOR_ARGUS_REVIEW
```

DAEDALUS implemented the accepted PR484J-L boundary: one owner-visible Reddit
saved-items connector flow inside the existing persona Archive tab at
`/studio/personas/[personaId]/files`.

This is not a connector dashboard, Settings flow, social surface, provider
expansion, worker lane, or new backend import lane. The UI drives only accepted
archive connector APIs and keeps every source/body/token/provider detail out of
visible readback.

## Implemented

- Added a persona Archive connector panel:
  `apps/web/components/studio/archive-connector-owner-panel.tsx`.
- Added web helper/types/state copy in
  `apps/web/lib/archive-connector-owner-flow.ts`.
- Mounted the panel inside
  `apps/web/app/studio/personas/[personaId]/files/page.tsx`.
- Wired the live callback page to
  `POST /archive-connectors/oauth/reddit/callback/exchange` instead of
  verify-then-exchange.
- Kept the existing callback verify helper as a no-write helper for tests/future
  non-storage flows.
- Added the allowed exchange DTO shape:
  `localRedirectPath` is returned from the consumed, already-validated OAuth
  state.

## Owner Flow

The visible flow is explicit and button-driven after OAuth:

- load connector readiness and credential readback;
- show disabled setup states for missing credential encryption or Reddit app
  config;
- start Reddit source-inventory OAuth with a safe local redirect back to the
  current persona Archive tab;
- navigate to the provider authorization URL without rendering that URL;
- after callback exchange, return to the persona Archive tab and refresh safe
  readbacks;
- require owner action for Reddit account proof;
- require owner action to read source inventory;
- filter inventory to `reddit_user_history` / `saved_items` only;
- create and activate an import intent;
- preview saved-items counts only;
- stage one encrypted private source batch;
- preview aggregate staged-import metadata only;
- final owner confirmation imports the staged run and refreshes the import
  library.

Hard-refresh recovery is intentionally limited to safe readbacks and honest
restart copy. PR484J-L adds no staged-run list/recovery endpoint.

## Readback

The UI may show:

- provider label `Reddit`;
- generic source label `Reddit saved items`;
- readiness and credential state;
- source-scope/account-proof gates;
- aggregate counts, truncation, page limit, timestamps, job status, and chunk
  count;
- bounded retry/next-action copy.

The UI does not render OAuth codes, state handles, authorization URLs, tokens,
refresh tokens, client secrets, raw provider ids, usernames, subreddit names,
URLs, authors, source bodies, normalized source text, cursors, fingerprints,
encrypted batch contents, SQL details, stack traces, or secret-shaped values.

## Still Forbidden

- Discord content reads or Discord source inventory UI calls;
- broader Reddit source categories, subreddit imports, pagination crawls, or
  recurring pulls;
- generic `/imports/chat` connector use or staged connector parser reuse;
- new connector list/recovery endpoints, tables, queues, workers, jobs, or
  import execution behavior;
- `persona_files`, Canon, Continuity, public documents, review candidates,
  publication, export, social writes, billing, Redis, Cloudflare, hosted/runtime
  config, marketplace, partner adapters, Stripe, provider model calls, packages,
  committed secrets, or provider payload snapshots.

## Tests

Focused coverage was added in `apps/web/lib/archive-connector-owner-flow.test.ts`
for:

- signed-out, readiness-disabled, missing credential, not-source-ready,
  account-proof, no-supported-source, preview, staging, import-preview,
  completed, processing, failed, and retryable states;
- exact accepted endpoint paths and strict empty POST bodies;
- Reddit OAuth start using `scopeProfile: "source_inventory"` and a safe persona
  Archive redirect;
- saved-items-only source filtering and generic source label readback;
- owner-flow error copy redaction;
- static no-drift checks for `/imports/chat`, Discord source UI calls, generic
  parsers, review candidates, Canon/Continuity, queues/workers, Cloudflare,
  Redis, billing, marketplace, partner/social behavior, source text, tokens,
  fingerprints, SQL, stack traces, and secret-shaped values.

Callback coverage was updated so the live callback page proves scrub-before-auth
and exchange-before-render behavior.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts` | Pass | 10 owner-flow/callback tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts apps/api/src/routes/archive-connectors.test.ts` | Pass | 116 tests passed across owner-flow helpers, callback bridge, Studio navigation, Archive trust, and archive connector API routes. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts` | Pass | 152 tests passed across connector storage/routes, import preview/parsers, background job readback/helpers, social fail-closed routes, web callback/readiness guards, and error handling. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck completed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Next lint completed with no lint warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only. |
| `npm exec --yes pnpm@10.32.1 -- run build` | Not rerun | PR484J-L used the ARGUS-named validation set. The known local Windows Next standalone symlink `EPERM` caveat from prior validation remains the build truth if build is rerun here. |

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR484J-L as one owner-visible Reddit saved-items flow inside the existing persona Archive tab.
- The callback live path now uses callback exchange, and exchange returns the consumed safe localRedirectPath.
- The UI uses accepted connector APIs only, filters to reddit_user_history/saved_items, renders generic Reddit saved items copy, keeps post-OAuth writes button-driven, and adds no Discord content, broader Reddit sources, queues/workers, pagination, recurring pulls, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, or new backend import behavior.
Validation:
- Owner-flow/callback focused tests: 10 pass.
- PR484J-L lane suite: 116 pass.
- Broader archive/social/background/import/error suite: 152 pass.
- Typecheck: pass.
- Lint: pass.
- Diff check: pass.
- Build: not rerun; known local Windows Next standalone symlink EPERM caveat remains documented.
Risk:
- Review callback exchange flow, safe local redirect handling, saved-items-only filtering, UI redaction, owner-action gates, and static no-drift tests.
Task:
- Review PR484J-L and wake MIMIR with `WAKEUP A1:` if accepted, or wake DAEDALUS with `WAKEUP A2:` if fixes are needed.
```
