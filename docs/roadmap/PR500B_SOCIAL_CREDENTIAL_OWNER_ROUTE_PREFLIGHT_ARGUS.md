# PR500B - Social Credential Owner Route Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open hostile preflight

## Background

PR500A is closed and accepted:

`docs/roadmap/PR500A_SOCIAL_CONNECTOR_CREDENTIAL_CONTRACT_CLOSEOUT.md`

PR500A added the social-specific encrypted credential storage contract and
removed dormant live posting code, while keeping Social Publishing paused and
readback-only.

The next useful social connector step is likely an owner-only route contract
that lets Station store/read safe credential metadata/revoke a manual Bluesky
credential using the PR500A storage helper. Before DAEDALUS implements
anything, ARGUS should hostile-preflight the boundary.

## Product Question

What is the smallest safe next lane after PR500A?

Candidate:

```text
ACCEPT_PR500B_SOCIAL_CREDENTIAL_OWNER_API
```

An authenticated owner-only backend API for the smallest manual credential
fixture, likely Bluesky, with safe metadata readback and local revoke/
disconnect semantics only.

Alternative:

```text
ACCEPT_PR500B_HOSTED_MIGRATION_072_PROOF_FIRST
```

Use this if no route should be built until hosted Supabase is proven to have
migration 072 applied, or until DAEDALUS applies the already-accepted migration
and proves the table/index/RLS shape.

Other possible outcomes:

```text
BLOCK_PR500B_WITH_CONCRETE_REASON
REJECT_PR500B_SOCIAL_CREDENTIAL_ROUTE
```

Name the exact blocker or rejection reason.

## Preflight Questions

1. Can DAEDALUS safely expose a backend-only owner credential API now, or must
   hosted migration 072 proof come first?
2. If a route is accepted, what are the exact methods and paths?
3. Should the route support create/list/revoke only, or create/list/revoke/
   replace?
4. What is the exact allowed provider fixture: Bluesky manual credential only,
   or a provider enum with only Bluesky enabled?
5. What metadata may be returned without leaking handles, account ids,
   encrypted blobs, secret tails, callback values, env values, provider
   payloads, owner ids, or SQL details?
6. What tests must prove no Social Publishing route or UI is unpaused?

## Guardrails

- No OAuth redirect, callback, token exchange, refresh, state, account lookup,
  provider profile call, or provider SDK.
- No external provider call of any kind.
- No posting, cross-posting, scheduling, retry, delete, retract, edit, metric
  import, comment import, queue, worker, webhook, Redis, Cloudflare, billing,
  Stripe, public syndication, or readiness-unpause behavior.
- No Settings Social credential UI, Connect/OAuth/disconnect/save controls, or
  document-level live composer unless ARGUS explicitly opens a later visible UI
  lane.
- No use of legacy `social_connections` or `social_posts` for new credential
  behavior.
- No migration/backfill/decrypt/cleanup of existing legacy social secret rows.
- No plaintext storage or response of handles, provider ids, tokens, app
  passwords, OAuth codes, callback query values, webhook payloads, env values,
  encrypted payloads, owner ids, SQL/table details, stack traces, private
  document text, or secret-shaped values.

## Suggested Acceptance Shape

If ARGUS accepts an owner API, keep it backend-only and narrow:

- `GET /social/connectors/credentials` returns safe metadata rows only.
- `POST /social/connectors/credentials` stores one Bluesky manual credential
  using the PR500A encrypted storage helper.
- `DELETE /social/connectors/credentials/:credentialId` or a provider-scoped
  revoke route marks the owner credential revoked without provider calls.
- Route errors are bounded and generic.
- Existing `/social/readiness` and paused mutation routes remain unchanged.
- Settings Social and document pages remain paused with no new credential form.

If ARGUS requires hosted migration proof first, specify exactly what DAEDALUS
must probe or apply:

- table exists;
- owner/provider/purpose active uniqueness index exists;
- owner/status index exists;
- trigger exists;
- RLS enabled and owner policy exists;
- no secrets or connection strings printed.

## Expected Validation For A Route Lane

If route implementation is accepted, require DAEDALUS to run at least:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/services/social-connectors/credential-contract.test.ts apps/api/src/services/social-connectors/credential-storage.test.ts apps/api/src/routes/social.test.ts apps/web/lib/social-publishing-readiness.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/archive-connectors.test.ts apps/web/lib/archive-connector-owner-flow.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also require source scans for no provider calls, no OAuth/token exchange, no
legacy social secret table writes, no live composer, no credential UI, no
package/lockfile drift, and no readiness-unpause claims.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR500A social connector credential contract is accepted and closed.
- MIMIR is not opening OAuth/posting/UI; the next question is the smallest safe
  owner credential route boundary, or whether hosted migration 072 proof must
  happen first.
Task:
- Run docs/roadmap/PR500B_SOCIAL_CREDENTIAL_OWNER_ROUTE_PREFLIGHT_ARGUS.md.
- Decide ACCEPT_PR500B_SOCIAL_CREDENTIAL_OWNER_API,
  ACCEPT_PR500B_HOSTED_MIGRATION_072_PROOF_FIRST, BLOCK, or REJECT.
- Wake MIMIR with exact scope and next owner.
```
