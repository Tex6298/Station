# PR484 Live Archive Connectors Preflight Result

Date: 2026-06-29

Owner: ARGUS / A3

Status: ACCEPT_PR484A_CONNECTOR_CREDENTIAL_CONTRACT

## Verdict

ARGUS accepts only the provider-neutral connector credential contract for
PR484A.

ARGUS rejects a live Reddit read-only OAuth/API proof and a live Discord
read-only import proof for this slice. The repo has manual Reddit/Discord
archive parsers and no-write import preview, but it does not yet have an
accepted external connector credential store, OAuth callback/csrf contract,
token redaction contract, refresh/revocation contract, or hosted test-credential
policy for archive connectors.

PR484A should remove that direct blocker before any Reddit/Discord API call,
provider token exchange, source inventory pull, recurring pull, or import job
creation is attempted.

## Current Repo Findings

- Manual archive intake is real: pasted/uploaded Reddit and Discord JSON can be
  parsed through the existing import parser path.
- `POST /imports/preview` is the reusable no-write model: it is authenticated,
  persona-owner scoped, returns redacted source format/count readback, and
  performs no import, storage, archive, Memory, Canon, Continuity, document,
  provider, queue, or worker writes.
- Social publishing readiness is a fence, not a connector implementation:
  `GET /social/readiness` is authenticated readback only, and legacy social
  action routes fail closed with paused status.
- `apps/api/src/services/social.service.ts` contains legacy posting helpers and
  token-shaped fields. PR484A must not reuse or activate those paths.
- Encrypted AI BYOK exists, but it is scoped to AI provider keys and
  `AI_PROVIDER_KEY_ENCRYPTION_KEY`. It is precedent for encryption mechanics
  only, not an accepted Reddit/Discord/social/archive credential store.
- Existing `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` env keys are part of the
  paused social publishing readback and are not accepted archive connector
  config for PR484A. No Discord archive connector config exists.

## Accepted PR484A Scope

DAEDALUS may implement a provider-neutral archive connector credential contract.

Preferred touched files:

- `apps/api/src/services/archive-connectors/credential-contract.ts`
- `apps/api/src/services/archive-connectors/credential-contract.test.ts`
- `docs/architecture/live-archive-connector-credential-contract.md`
- roadmap/status/validation docs

Acceptable local equivalents are fine if the repo structure requires a slightly
different helper path, but the implementation must stay in helper/test/docs
scope unless MIMIR opens a separate route/UI lane.

The contract must define:

- provider ids limited to `reddit` and `discord`;
- archive connector purpose distinct from social publishing and AI provider
  BYOK;
- owner-only credential states, for example not configured, OAuth app missing,
  ready for OAuth, connected-redacted, revoked, and blocked;
- OAuth callback/state expectations: owner/session binding, provider binding,
  purpose binding, one-time state nonce, expiry, csrf protection, callback code
  never logged or returned, and no token exchange in PR484A;
- secret handling: access tokens, refresh tokens, OAuth codes, cookies,
  credentials, secret-shaped values, and raw external account ids are never
  returned in readback, logs, docs, tests, or UI;
- future storage expectation: external connector secrets require a dedicated
  encrypted connector credential schema and environment key before storage;
- source inventory boundary: provider inventory may later return safe metadata
  and counts only, with no private source bodies, private messages, archive
  snippets, unsafe permalinks, provider payloads, or raw external ids;
- import permission boundary: no archive source, import job, Memory, Canon,
  Continuity, public document, or review candidate is created before explicit
  owner confirmation.

## Explicit Non-Scope

PR484A must not add or change:

- live Reddit API calls, Discord API calls, OAuth redirects, OAuth callback
  routes, token exchange, token refresh, token revocation, provider SDKs, or
  configured test-credential execution;
- recurring pulls, background jobs, workers, queues, scheduled jobs, Redis,
  Cloudflare, runtime provisioning, or connector reliability claims;
- automatic import into Memory, Canon, Continuity, public documents, archive
  sources, import jobs, or import review without explicit owner confirmation;
- broad connector marketplace, public connector pages, cross-owner connector
  access, admin impersonation, provider/model calls, billing, Stripe, schema
  changes, migrations, package dependencies, or new external config;
- `apps/api/src/routes/imports.ts`, `apps/api/src/routes/social.ts`, or
  `apps/api/src/services/social.service.ts` behavior.

## Required Tests

DAEDALUS should add focused tests proving:

- safe readback for `reddit` and `discord` credential states;
- token/code/cookie/credential/external-account-id/private-body fixtures are
  redacted or absent from readback;
- source-level guards show the PR484A helper performs no `fetch`, OAuth
  redirect, callback route handling, token exchange, provider SDK call, DB
  write, import job creation, queue/worker dispatch, Redis/Cloudflare action,
  billing/Stripe action, or provider/model call;
- existing import preview, import parser, and social readiness fences remain
  green.

Required validation:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/archive-connectors/credential-contract.test.ts apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Also run a diff scan confirming no new migrations, env keys, routes, provider
SDKs, package dependencies, background jobs, queue/worker code, Redis,
Cloudflare, billing/Stripe, provider/model calls, token output, raw external
account ids, private source bodies, archive snippets, storage paths, signed
URLs, hosted logs, SQL/table details, stack traces, prompts, or secret-shaped
values were introduced.

## ARIADNE Requirement

ARIADNE hosted rehearsal is not required for the accepted PR484A contract if
DAEDALUS keeps it helper/test/docs only with no visible route or API behavior
change.

If DAEDALUS adds any owner-visible UI/API readback despite this preflight, the
lane must include ARIADNE desktop and 390px mobile proof that the surface is
owner-only, readback-only, non-mutating, and free of token/code/source-body
leakage.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/import-preview.test.ts apps/api/src/services/imports/parsers/import-parsers.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts` | Pass | 28 tests passed across no-write import preview, Reddit/Discord parsers, social route fail-closed behavior, and social readiness source guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed successfully from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| Scope scan | Pass | Current matches are expected paused social config, parser/preview fixtures, and guardrail docs; no live connector implementation is present. |

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
```
