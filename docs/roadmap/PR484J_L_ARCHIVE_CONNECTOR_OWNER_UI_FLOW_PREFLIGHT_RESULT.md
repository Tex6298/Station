# PR484J-L - Archive Connector Owner UI Flow Preflight Result

Owner: ARGUS / A3

Date: 2026-06-30

Status: Accepted for DAEDALUS

## Verdict

```text
ACCEPT_PR484J_L_ARCHIVE_CONNECTOR_OWNER_UI_FLOW
```

ARGUS accepts the smallest safe owner UI lane for the accepted archive
connector backend pipeline.

The lane may make one owner-visible Reddit saved-items connector flow usable
from the existing persona Archive tab. It must not add provider expansion,
Discord content reads, new backend import behavior, queues, workers, recurring
pulls, pagination crawls, billing, Redis, Cloudflare, marketplace, partner
adapters, social behavior, public writes, Canon, Continuity, or review-candidate
writes.

## Route Placement

Build the first visible flow inside the existing persona Archive surface:

```text
/studio/personas/[personaId]/files
```

Rationale:

- the accepted connector import path is persona-bound;
- the Global Archive route already points source intake and deeper review to
  persona Archive tabs;
- keeping the UI inside the owner persona workspace avoids inventing a new
  connector dashboard, Settings workflow, public route, billing surface, or
  social-publishing path.

DAEDALUS may add a small component/helper split under the web app if useful,
but the visible product entry remains the persona Archive tab. A Global Archive
link or broad navigation rewrite is not required for this lane.

## Accepted Web/API Boundary

DAEDALUS may add:

- one owner-only persona Archive connector panel for Reddit saved items;
- thin web client helpers/types for the existing archive connector API
  endpoints;
- local state-machine helpers for safe copy, disabled states, source filtering,
  and retry/readback labels;
- a narrow callback helper that posts to the existing OAuth callback exchange
  route;
- one bounded API DTO shaping change if needed:
  `POST /archive-connectors/oauth/:provider/callback/exchange` may return the
  consumed state's already-validated `localRedirectPath`.

The lane must use only accepted backend operations:

- `GET /archive-connectors/readiness`;
- `GET /archive-connectors/credentials`;
- `POST /archive-connectors/oauth/reddit/start`;
- `POST /archive-connectors/oauth/reddit/authorize`;
- `POST /archive-connectors/oauth/reddit/callback/exchange`;
- `POST /archive-connectors/credentials/reddit/account/lookup`;
- `GET /archive-connectors/reddit/source-inventory`;
- `POST /archive-connectors/reddit/import-intents`;
- `POST /archive-connectors/import-intents/:intentId/activate`;
- `POST /archive-connectors/import-intents/:intentId/source-preview`;
- `POST /archive-connectors/import-intents/:intentId/source-staging-runs`;
- `POST /archive-connectors/source-staging-runs/:runId/import-preview`;
- `POST /archive-connectors/source-staging-runs/:runId/import`;
- existing persona Archive refresh calls already used by the page, such as
  persona, files, import jobs, import review candidates, and export readback.

Do not add a new connector list/recovery endpoint, new database table, new
background job, new staged-run listing route, or new import execution route in
PR484J-L. If the owner hard-refreshes after an in-page intent or staging step,
the first UI slice may honestly ask them to restart the connector flow; the
backend idempotency and duplicate gates remain the source of truth.

## Callback Rule

For the live credential-connection flow, the web callback must call the
exchange route as the terminal OAuth callback action.

Do not call callback `verify` first and then `exchange`; the accepted verify
route consumes OAuth state and would make the exchange fail. The callback page
must:

- parse and scrub `state`, `code`, and provider error query values before auth
  recovery, rendering, or API work;
- recover the current owner session from the existing safe session helper;
- call `POST /archive-connectors/oauth/reddit/callback/exchange` with only
  `stateHandle` and `code`;
- never render, log, persist, or re-place OAuth code/state values into a URL;
- return the owner to the safe local redirect path from the exchange response,
  falling back to the persona Archive or Global Archive surface with generic
  copy if the response has no redirect.

The existing no-write verify helper may stay for tests or future non-storage
flows, but PR484J-L's live owner setup path must exchange.

## Owner Flow

The visible Reddit saved-items flow should be staged and explicit:

1. Load persona Archive, connector readiness, and credential readback.
2. If connector credential encryption or Reddit app config is unavailable,
   render a disabled setup state with generic copy and no provider redirect.
3. If the Reddit credential is missing, revoked, or not source-ready, start a
   Reddit `source_inventory` OAuth state with local redirect back to the persona
   Archive tab, request an authorization URL, then send the browser to the
   provider URL without displaying the URL contents.
4. After callback exchange succeeds, return to the persona Archive tab and
   refresh credential readback.
5. If account proof is missing, require an explicit owner action that calls
   `POST /archive-connectors/credentials/reddit/account/lookup`.
6. Read Reddit source inventory only after source-ready credential and account
   proof gates pass.
7. Filter source inventory to the accepted saved-items source only:
   `sourceFamily = reddit_user_history` and `sourceKind = saved_items`.
8. Create an import intent for the current persona using the accepted saved
   items source metadata, but render only safe generic labels.
9. Activate the intent.
10. Run source preview and show counts only.
11. Create one source-staging run and show safe run metadata only.
12. Run staged import preview and show aggregate metadata only.
13. On final owner confirmation, import the staged run through the connector
   import route and refresh the persona Archive import library.

All mutating steps after OAuth must remain button/owner-action driven. The page
may automatically refresh safe readbacks, but it must not automatically import
private source material after OAuth.

## Required Visible States

The implementation and tests must cover at least:

- signed out or missing owner session;
- persona not found or not owned, using the existing persona page behavior;
- connector readiness unavailable;
- credential encryption missing;
- Reddit OAuth app missing or partial;
- missing Reddit credential;
- connect-proof-only or otherwise not-source-ready Reddit credential;
- OAuth start failure;
- authorization URL failure;
- provider-cancelled callback;
- invalid or expired callback state;
- callback exchange success;
- callback exchange failure without code/state/provider payload readback;
- source-ready credential without account proof;
- account lookup success and bounded failure;
- source inventory unavailable;
- source inventory with no supported saved-items source;
- import intent pending or duplicate pending;
- import intent activated or duplicate activated;
- source preview unavailable or ready;
- staging run created;
- staging run expired, revoked, superseded, failed, or imported via bounded API
  responses or in-page state;
- import preview ready;
- final import pending, completed, already completed, failed, and retryable.

Because PR484J-L does not add list/recovery endpoints, persisted recovery after
a hard refresh is not required. The UI must be honest about that limitation and
restart from safe readbacks when needed.

## Readback And Copy Rules

The UI may render:

- provider label `Reddit`;
- safe generic source label `Reddit saved items`;
- readiness booleans and generic disabled reasons;
- credential state labels and source-scope readiness;
- aggregate counts, truncation, page limit, timestamps, and job status;
- safe import job source name and status;
- bounded retry/next-action copy.

The UI must not render, log, test-fixture-leak, or document as user-visible
output:

- access tokens, refresh tokens, OAuth codes, state handles, nonce/csrf values,
  session bindings, encrypted credential values, encryption keys, client
  secrets, env values, cookies, or signed URLs;
- authorization URLs after they are received, except as the browser navigation
  target;
- raw provider ids, account ids, account labels that include usernames, Reddit
  usernames, subreddit names, authors, URLs, saved item bodies, normalized
  source text, private snippets, provider payloads, provider headers, cursors,
  item fingerprints, snapshot fingerprints, encrypted batch contents, SQL
  details, stack traces, storage internals, or secret-shaped values.

If an accepted backend response contains source inventory rows beyond saved
items, this UI must filter them out and must not render subreddit or Discord
source names in this lane.

## Explicit Non-Scope

PR484J-L must not add or change:

- Discord source inventory UI calls, Discord channel/message/member reads, or
  Discord content imports;
- broader Reddit history categories, subreddit imports, pagination crawls, or
  recurring pulls;
- generic `/imports/chat` use for connector data;
- generic import parser use for staged connector batches;
- new source inventory, staging, import, queue, worker, scheduled, or retry
  backend behavior beyond the exchange `localRedirectPath` DTO shaping named
  above;
- connector job tables or new persistence tables;
- `persona_files`, Memory, Canon, Continuity, public documents, review
  candidates, publication, export, or social writes;
- billing, entitlements, Redis, Cloudflare, hosted runtime config, marketplace,
  partner adapters, Stripe, provider model calls, packages, or broad navigation
  redesign;
- committed secrets, real OAuth credentials, live token values, hosted logs, or
  provider payload snapshots.

## Required Tests

DAEDALUS should add focused coverage proving:

- the persona Archive page or extracted connector panel renders signed-out,
  readiness-disabled, missing-credential, not-source-ready, account-proof,
  no-supported-source, preview, staging, import-preview, completed, failed, and
  retryable states with safe copy;
- the owner flow builds only accepted archive connector paths and strict empty
  POST bodies where the API requires them;
- OAuth start uses `scopeProfile: "source_inventory"` and a safe local redirect
  to the current persona Archive tab;
- the callback page scrubs query values before auth/API work and calls exchange
  for the live connection path, not verify-then-exchange;
- the exchange helper sends only `stateHandle` and `code` in the JSON body and
  Bearer auth in headers;
- source inventory filtering exposes only the Reddit saved-items source and
  does not render subreddit, guild, raw account, URL, author, body, cursor, or
  fingerprint values;
- the UI never posts to `/imports/chat` for connector data;
- final import uses only
  `/archive-connectors/source-staging-runs/:runId/import`;
- existing callback public-route protections remain intact;
- safe copy and rendered snapshots do not contain token/code/state/client
  secret/credential/provider-payload/SQL/stack/secret-shaped markers;
- static guards show no Cloudflare, Redis, billing, marketplace, partner
  adapter, social posting, queue, worker, recurring import, broad provider, or
  Discord content drift.

Suggested validation command set for DAEDALUS:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/archive-connector-owner-flow.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts apps/api/src/routes/archive-connectors.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-storage.test.ts apps/api/src/routes/archive-connectors.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/background-jobs.test.ts apps/api/src/services/background-jobs.service.test.ts apps/api/src/routes/social.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/api/src/middleware/error-handler.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If DAEDALUS runs `npm exec --yes pnpm@10.32.1 -- run build`, report the known
local Windows Next standalone symlink `EPERM` truth honestly if it recurs after
compile/type/static-generation.

## ARIADNE Rehearsal Requirements

After DAEDALUS implements PR484J-L and ARGUS accepts the technical boundary,
wake ARIADNE for a human-eye route rehearsal.

ARIADNE should rehearse desktop plus 375px and 390px mobile. If live provider
config or a real Reddit login is unavailable, ARIADNE may use a mocked local
API route rehearsal; hosted live OAuth proof remains a separate MIMIR decision.

ARIADNE should verify:

- persona Archive placement feels like private source intake, not a new public
  connector product;
- disabled readiness and credential states are honest and non-shaming;
- callback success and failure copy does not expose provider details;
- saved-items-only selection is understandable;
- preview, staging, import preview, final import, failure, and retry states are
  visually distinct and mobile-readable;
- no token/code/state/provider payload/private source/raw username/subreddit/
  URL/body/error-internal text appears on screen;
- unsupported Discord, subreddit, pagination, recurring import, social, and
  billing behaviors are not implied.

## ARGUS Preflight Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Route placement review | Pass | Existing `/studio/personas/[personaId]/files` is the safest first surface because the backend flow is persona-bound and existing Global Archive copy points source intake to persona Archive tabs. |
| Callback flow review | Pass with requirement | Current web callback verifies only; PR484J-L must switch the live connection path to callback exchange because verify consumes state. |
| Backend recovery review | Pass | Existing accepted endpoints can drive the flow without a new list/recovery backend. Hard-refresh recovery can be honest restart plus backend idempotency. |
| Scope review | Pass | Accepted lane is one Reddit saved-items owner UI over accepted APIs only, with no provider/backend expansion beyond exchange `localRedirectPath` DTO shaping. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-oauth-callback.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/archive-trust.test.ts` | Pass | 110 tests passed across connector routes, OAuth callback bridge, Studio navigation, and Archive trust helpers. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors before doc updates. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR484J-L Archive Connector Owner UI Flow.
- Build one owner-visible Reddit saved-items connector flow inside the existing persona Archive tab using accepted archive connector APIs only.
- The live OAuth callback must exchange, not verify-then-exchange; only a safe exchange `localRedirectPath` DTO addition is accepted if needed.
- Keep Discord content, broader Reddit sources, queues/workers, pagination, recurring pulls, `/imports/chat` connector use, parser reuse, new backend import behavior, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, public writes, Canon, Continuity, and review candidates out.
Task:
- Implement the persona Archive owner UI flow, safe helpers, callback exchange wiring, state coverage, redaction tests, and validation named in this preflight.
- After implementation, wake ARGUS for technical review; ARGUS will decide whether ARIADNE should rehearse the visible route.
```
