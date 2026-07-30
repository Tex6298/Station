# PR534A Project Collaboration Hosted Migration And Deployment

**Owner:** MIMIR / A1 -> DAEDALUS / A2 -> ARIADNE / A4

**State:** `OPEN_PR534A_PROJECT_COLLABORATION_HOSTED_MIGRATION_DEPLOY`

**Accepted source:** `b06502af4546`

**Migration:** `090_project_collaboration_viewer_membership.sql`

## Decision

Close the PR534 source-review stage as accepted and authorize the separate
hosted schema/deployment readiness stage. This lane applies only the accepted
migration and proves the hosted services are running the accepted source before
ARIADNE creates a disposable collaboration fixture.

No new configuration is required. Use the existing local environment and
connected hosted services without printing secrets.

## DAEDALUS Task

Execute serially:

1. Confirm the exact accepted migration file and hash, current hosted migration
   ledger through `089`, and absence of a conflicting `090` application.
2. Confirm the current hosted database/catalog baseline is coherent enough for
   the migration's explicit transaction, advisory lock, owner-row repair rules,
   deferred invariant, RLS revocations, and service-only RPC grants.
3. Apply exactly migration `090` with the repo's established migration path.
   Do not apply an unrelated migration or manually edit hosted catalog objects.
4. Verify exactly one `090` ledger entry and the accepted columns,
   constraints, indexes, trigger/function definitions, owners, fixed search
   paths, grants, direct-table revocations, and PostgREST schema visibility.
5. Confirm hosted web and API are healthy and report source `b06502af4546` or a
   later commit containing no additional PR534 product-code change.
6. Run read-only owner/public compatibility probes only. Do not create users,
   invitations, members, Projects, evidence, exports, or other product rows in
   this deployment stage.
7. Record a redacted result and wake ARIADNE with the full disposable hosted
   lifecycle contract from the ARGUS preflight result.

## Stop Conditions

Stop before mutation and wake MIMIR if:

- hosted migration history conflicts with the checked-in sequence;
- `090` is already present with a different hash or catalog shape;
- preflight finds contradictory Project owner/member rows that the migration is
  designed to reject;
- the exact transaction cannot apply atomically;
- applying `090` changes an unrelated table, policy, grant, function, or row;
- web/API cannot reach the accepted source or fail health after schema reload;
- cleanup or repair would require deleting or rewriting retained product data.

Do not improvise around a stop condition.

## Scope

Allowed:

- exact migration `090` apply and ledger/catalog verification;
- hosted web/API source and health verification;
- read-only owner/public compatibility probes;
- public-safe roadmap/testing result documentation.

Not allowed:

- product-code, dependency, lockfile, auth/profile, billing, provider, Redis,
  Cloudflare, queue/worker, or UI changes;
- disposable fixture creation or collaboration lifecycle rehearsal;
- retained-data cleanup or broad schema reconciliation;
- secret, credential, raw id, private row, SQL payload, or environment-value
  publication.

## Result And Baton

Write:

`docs/roadmap/PR534A_PROJECT_COLLABORATION_HOSTED_MIGRATION_DEPLOY_RESULT.md`

If accepted, wake ARIADNE:

```text
WAKEUP A4:
Codename: ARIADNE
```

ARIADNE must run the exact disposable lifecycle in the PR534 ARGUS preflight:
owner/invitee creation, invite, target-only readback, accept, viewer allowlist,
raw-table and dependent-route denial, revoke, fresh-request denial, re-invite,
decline, stale-invite handling, dormant-role denial, invariant checks, desktop
and mobile human-eye review, exact cleanup, and deployment/schema no-drift.

ARIADNE should wake ARGUS with a public-safe pass or exact blocker. ARGUS then
returns the final hosted verdict to MIMIR.
