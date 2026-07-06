# PR500A - Social Connector Credential Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open implementation

## Source

ARGUS accepted PR500A in:

`docs/roadmap/PR500_SOCIAL_PUBLISHING_CONNECTOR_BOUNDARY_PREFLIGHT_RESULT.md`

Verdict:

```text
ACCEPT_PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT
```

PR501 companion/UI revalidation is closed and has no remaining implementation
delta. The baton returns to the accepted PR500A backlog item.

## Task

Implement only the social-specific encrypted credential storage contract plus
legacy live-code quarantine accepted by ARGUS.

This is not OAuth, account linking, posting, scheduling, provider execution,
credential UI, billing, or public syndication.

## Required Implementation Shape

DAEDALUS may add:

- `infra/supabase/migrations/072_social_connector_credentials.sql`;
- a new social credential table separate from legacy `social_connections`;
- owner-scoped RLS, active uniqueness, safe status fields, and encrypted
  credential payload storage only;
- a separate `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` contract;
- an AES-256-GCM envelope such as `station.social_connector.credential.v1`;
- backend storage helpers/tests proving encryption, owner scope, bounded
  failures, no plaintext persistence, and safe metadata-only readback;
- deletion or explicit quarantine of dormant live posting code in:
  - `apps/api/src/services/social.service.ts`;
  - `apps/web/components/social/post-composer.tsx`;
- tests proving active `/social/*` routes remain PR476A readback-only and
  paused before social table writes or provider calls;
- docs/status/testing updates.

Provider fixture:

- Prefer the smallest manual-credential fixture, likely `bluesky`.
- Do not expand to every platform unless the code is pure type/schema
  enumeration and tests still prove no UI, OAuth, provider call, or posting
  behavior is enabled.

## Forbidden Scope

Do not:

- store social access tokens, refresh tokens, app passwords, Ghost admin keys,
  OAuth codes, provider account ids, callback query values, webhook payloads,
  or handles in plaintext;
- write to or rely on legacy `social_connections` or `social_posts` for new
  credential behavior;
- migrate, decrypt, backfill, expose, or clean up existing legacy social secret
  rows;
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

## Expected Files

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

If route, Settings UI, OAuth, provider, execution, package, billing, or hosted
config changes appear necessary, stop and wake MIMIR/ARGUS with the concrete
blocker instead of widening PR500A.

## Required Tests

Add or update coverage proving:

- missing or malformed `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` fails
  closed before storage;
- stored credential payloads are encrypted and do not contain submitted
  credentials, token-shaped values, app passwords, OAuth codes, provider
  account ids, handles, callback values, or env values;
- safe readback contains provider/status/timestamp/category metadata only;
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

Run:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run a source scan proving no provider `fetch`, `dispatchPost`,
`social_posts` write, legacy `social_connections` secret write, OAuth redirect,
token exchange, queue/worker/webhook, billing, package, lockfile, credential UI,
or live-posting claim entered PR500A.

## Handoff

Wake ARGUS after implementation.

```text
WAKEUP A3:
Codename: ARGUS
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR501 companion/UI revalidation closed with no remaining safe delta.
- ARGUS accepted PR500A as a social-specific encrypted credential storage
  contract plus legacy live-code quarantine.
- Social Publishing must remain PR476A paused/readback-only.
Task:
- Implement docs/roadmap/PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT_DAEDALUS.md.
- Keep scope to encrypted social credential storage plus dormant live-code
  deletion/quarantine.
- Do not add OAuth, provider calls, posting, queues/workers, billing,
  credential UI, or public syndication.
- Wake ARGUS with the implementation result.
```
