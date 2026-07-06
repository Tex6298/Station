# PR500 - Social Publishing Connector Boundary Preflight Result

Owner: ARGUS / A3

Date: 2026-07-06

Status: Accepted

## Verdict

```text
ACCEPT_PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT
```

ARGUS accepts PR500A as a social-specific encrypted credential storage
contract plus legacy live-code quarantine.

This is not an OAuth, account-link, post composer, provider-call, scheduling,
or execution lane.

## Decision

The smallest safe next Social Publishing slice is not OAuth and not posting.
The concrete blocker is credential safety: the current repo has legacy
`social_connections.access_token` / `refresh_token` plaintext schema and
dormant live-shaped posting code, while the active PR476A route/UI fence stays
readback-only and fail-closed.

PR484 archive connector credential/OAuth work is a useful pattern, but it is
archive-specific. PR500A must create a social-specific contract instead of
reusing archive credential rows, archive OAuth states, archive provider config,
or archive source-inventory assumptions.

## Accepted PR500A Scope

DAEDALUS may implement only:

- a new social-specific encrypted credential storage migration, expected as
  `infra/supabase/migrations/072_social_connector_credentials.sql`;
- a new social credential table separate from legacy `social_connections`,
  owner-scoped with RLS, active uniqueness, safe status fields, and encrypted
  credential payload storage only;
- a separate `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` contract using an
  AES-256-GCM envelope such as `station.social_connector.credential.v1`;
- backend storage helpers/tests that prove encryption, owner scope, bounded
  failures, no plaintext persistence, and safe metadata-only readback;
- deletion or explicit quarantine of dormant live posting code that currently
  contains provider `fetch` calls or calls paused social mutation endpoints:
  `apps/api/src/services/social.service.ts` and
  `apps/web/components/social/post-composer.tsx`;
- tests proving active `/social/*` routes remain PR476A readback-only and
  paused before social table writes or provider calls;
- docs/status/testing updates for the PR500A implementation handoff.

Provider set:

- PR500A should prove the contract with the smallest manual-credential provider
  fixture, preferably `bluesky`.
- Do not expand to all platforms unless the code is pure schema/type
  enumeration and the tests still prove no UI, OAuth, provider call, or posting
  behavior is enabled.

## Forbidden Scope

PR500A must not:

- store social access tokens, refresh tokens, app passwords, Ghost admin keys,
  OAuth codes, provider account ids, callback query values, webhook payloads,
  or handles in plaintext;
- write to or rely on legacy `social_connections` or `social_posts` for new
  credential behavior;
- migrate, decrypt, backfill, expose, or clean up any existing legacy social
  secret rows;
- start OAuth redirects, callback verification, token exchange, refresh, or
  provider account lookup;
- call external provider APIs or add provider SDK/package/lockfile changes;
- post, cross-post, schedule, retry, delete, retract, edit, import comments,
  import metrics, or create public syndication readback;
- add queue, worker, retry, webhook, Redis, Cloudflare, billing, Stripe, plan,
  or public metric behavior;
- re-enable `/settings/social` credential inputs, Connect/OAuth/disconnect/save
  buttons, or document-level live composer controls;
- expose secret tails, raw encrypted payloads, env values, callback URLs,
  provider payloads, account ids, owner ids, SQL/table details, stack traces,
  hosted logs, private document text, or secret-shaped values.

## Allowed Files

- `infra/supabase/migrations/072_social_connector_credentials.sql`
- `packages/db/src/types.ts`
- `apps/api/src/services/social-connectors/credential-contract.ts`
- `apps/api/src/services/social-connectors/credential-storage.ts`
- focused tests beside those service files
- `apps/api/src/routes/social.test.ts`
- `apps/web/lib/social-publishing-readiness.test.ts`
- deletion/quarantine of:
  - `apps/api/src/services/social.service.ts`
  - `apps/web/components/social/post-composer.tsx`
- roadmap and validation docs

If DAEDALUS needs route, Settings UI, OAuth, provider, execution, package,
billing, or hosted config changes, stop and wake MIMIR/ARGUS with the concrete
blocker instead of widening PR500A.

## Required Tests

PR500A should add or update focused coverage proving:

- missing or malformed `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` fails
  closed before storage;
- stored credential payloads are encrypted and do not contain the submitted
  credential, token-shaped values, app passwords, OAuth codes, provider account
  ids, handles, callback values, or env values;
- safe readback contains provider/status/timestamp/category metadata only, with
  no secret tails or raw encrypted payload;
- owner scope and active uniqueness hold;
- storage failures return bounded errors without SQL/table/stack detail;
- active `/social/readiness` remains authenticated and readback-only;
- paused legacy `/social/*` mutation routes still return bounded `423` before
  DB writes or provider calls;
- `/settings/social` remains paused and has no credential inputs or active
  Connect/OAuth/disconnect/save/post controls;
- document owner pages do not import or render a live social composer;
- no active code imports deleted/quarantined provider posting helpers.

## Required Validation

DAEDALUS should run:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a diff/source scan proving no provider `fetch`, `dispatchPost`,
`social_posts` write, legacy `social_connections` secret write, OAuth redirect,
token exchange, queue/worker/webhook, billing, package, lockfile, credential UI,
or live-posting claim entered PR500A.

## Hosted Rehearsal

ARIADNE hosted rehearsal is not required if PR500A remains backend/storage-only
plus dead-code quarantine and does not alter visible `/settings/social`,
document pages, OAuth routes, provider calls, hosted config, or public behavior.

Hosted proof is required if DAEDALUS changes any visible Settings/document
surface, exposes any owner credential readback route, or claims deployed social
credential readiness.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| PR500/PR476/PR484 docs and source inspection | Pass | Confirmed PR476A fence, legacy plaintext social schema, dormant provider posting service/composer, and archive-specific credential/OAuth patterns. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts` | Pass | 101 social/auth/archive connector tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors before ARGUS docs edits. |

## Handoff

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
```

MIMIR should route PR500A to DAEDALUS only as the narrow social connector
credential contract described above. Do not broaden into OAuth, live posting,
provider calls, queues/workers, billing, or visible credential setup.
