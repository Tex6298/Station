# PR534A Project Collaboration Hosted Migration And Deployment Result

Owner: DAEDALUS / A2 -> ARIADNE / A4

Date completed: 2026-07-30

Status:

```text
READY_PR534A_PROJECT_COLLABORATION_HOSTED_MIGRATION_FOR_ARIADNE
```

## Authority And Decision

DAEDALUS executed only the hosted schema/deployment stage authorized by:

- `docs/roadmap/PR534A_PROJECT_COLLABORATION_HOSTED_MIGRATION_DEPLOY_DAEDALUS.md`;
- `docs/roadmap/PR534_PROJECT_COLLABORATION_MEMBERSHIP_ARGUS_RESULT.md`; and
- `docs/roadmap/PR534_PROJECT_COLLABORATION_MEMBERSHIP_PREFLIGHT_ARGUS_RESULT.md`.

Accepted product source:

```text
b06502af45460ef00a4032d985f31fe35e624913
```

Exact migration:

```text
infra/supabase/migrations/090_project_collaboration_viewer_membership.sql
SHA-256 F7106E40227C9D1371FB5349B2D53E5BC9D8BEBB3C4DAB888DDF2868C73B61EF
```

Migration `090` is now applied and ledgered exactly once. Hosted web/API,
catalog security, PostgREST visibility, and read-only owner/public
compatibility pass. This stage did not create a collaborator fixture and does
not yet claim the hosted invite/accept/revoke customer lifecycle.

## Serialized Preflight

Before mutation, the hosted pooler and Railway deployment proved:

| Check | Result |
| --- | --- |
| Migration bytes | Exact accepted SHA-256 |
| Hosted ledger | One exact `089`; `090` absent by version and name |
| Target catalog | All three columns, two checks, two indexes, three triggers, and six functions absent |
| Required relations | `profiles`, `projects`, and `project_members` present |
| Retained Project shape | Four Projects and four membership rows; every Project had exactly one matching active owner |
| Contradictory ownership | Zero mismatched, inactive, duplicate, or conflicting current owner rows |
| Owner reconstruction | Zero missing owner rows required repair |
| Pre-contract viewers | Zero active or invited viewer rows required retirement |
| Hosted writers | Zero active write statements |
| Execution authority | Pooler session matched the shared table-owner context |
| Railway web/API | Both healthy and ready on `main` at exact accepted source `b06502af4546` |

Exact aggregate fingerprints bound all unrelated public/storage/Auth rows and
all unrelated columns, constraints, indexes, triggers, policies, functions,
and grants before apply. No private row, identifier, credential, URL value, or
SQL payload was printed or retained.

## Migration And Ledger

The exact checked-in migration bytes committed through the existing hosted
`SUPABASE_POOLER_URL` path. Its own transaction, advisory lock, ordered table
locks, owner checks, lifecycle normalization, DDL, function ownership and ACLs,
PostgREST reload notification, and commit ran unchanged.

After exact catalog and no-drift verification, one ledger row was inserted
under a separate migration-ledger advisory lock:

| Field | Value |
| --- | --- |
| Version | `20260730095001` |
| Name | `090_project_collaboration_viewer_membership` |
| Created by | `DAEDALUS_PR534A` |
| Idempotency key | `pr534a-090-project-collaboration-viewer-membership` |
| Statement receipt | One exact path, SHA-256, accepted-source provenance, and idempotency receipt |
| Rollback receipt | One restore-only statement; no ad hoc down migration is authorized |

A fresh independent connection proved exactly one row matching all four public
ledger fields and the exact statement/rollback receipt shape.

### Honest operator guard note

The migration transaction committed once, but the first independent
postcondition intentionally withheld the ledger row because it expected the
invariant helper to deny `service_role` execute. Read-only inspection proved
the accepted shape instead: `PUBLIC`, `anon`, and `authenticated` are denied,
while trusted `service_role` retains execute. No source or catalog repair was
needed.

A second no-drift guard then classified the new deferred Project invariant as
an unrelated constraint because PostgreSQL represents a constraint trigger in
`pg_constraint`. After excluding only that exact target constraint, every
unrelated fingerprint matched the original preflight. The ledger was inserted
only then. Row, column, index, trigger, policy, function, and grant fingerprints
never drifted; the constraint difference was exactly the accepted target
trigger.

## Catalog And Security Verification

Fresh catalog reads proved:

- nullable `timestamptz` columns `invite_expires_at`, `responded_at`, and
  `removed_at`;
- validated `project_members_viewer_lifecycle_check` and
  `project_members_owner_shape_check` constraints;
- exact unique active-owner and pending-viewer lookup indexes;
- deferred Project and membership owner-invariant triggers plus the immutable
  Project-owner trigger;
- all six exact function definitions, identities, and owner `postgres`;
- fixed `pg_catalog, public` search paths on all six functions;
- the four collaboration transition RPCs are `SECURITY DEFINER`, denied to
  `PUBLIC`, `anon`, and `authenticated`, and executable by `service_role`;
- the deferred invariant helper is also definer-owned and browser-denied; the
  immutable-owner trigger helper remains the accepted non-definer trigger-only
  function;
- RLS remains enabled on `project_members`, the broad owner policy is absent,
  and direct browser-role table privileges are zero;
- trusted `service_role` retains the direct privileges needed by the API;
- zero owner-invariant violations and zero invalid viewer lifecycle rows; and
- no unrelated row or catalog fingerprint changed.

The migration's PostgREST reload completed. Fresh service-role OpenAPI/read
checks saw the raw relation, all three columns, and all four RPC paths. The anon
schema exposed none of those paths, and a direct anon column probe returned
`401`; service-role column readback returned `200`.

## Hosted Compatibility

Read-only probes ran against the accepted Railway API and existing retained
owner. The probe created no Project, membership, invitation, attachment,
evidence, usage, export, or other product row.

| Probe | Result |
| --- | --- |
| Signed-out private `GET /projects` | `401` |
| Existing public Project GET | `200`; safe public serializer shape, no private id/owner/tier fields |
| Existing owner sign-in | `200` |
| Owner Project list | `200`; four owner Projects, zero shared Projects, `private, no-store` |
| Owner Project detail | `200`; owner access discriminator and existing owner arrays, `private, no-store` |
| Owner invitations | `200`; zero invitations, `private, no-store` |
| Owner sign-out | `204` |
| Auth cleanup | Owner session and refresh-token counts restored exactly |
| Product no-drift | Exact public/storage row fingerprint unchanged before/after all compatibility GETs |

After every database and REST check, both Railway services remained healthy
and ready on `main` at exact accepted SHA `b06502af4546`. API database,
migration-object, and storage readiness checks all remained green.

## Validation And Hygiene

| Command / proof | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `31/31` |
| Exact migration preflight/apply/postcheck | Pass |
| Fresh ledger metadata verification | Pass, exactly `1` |
| Catalog/function/RLS/grant verification | Pass |
| PostgREST service/anon visibility | Pass |
| Hosted owner/public compatibility | Pass with exact auth cleanup and product no-drift |
| Railway health/deployment identity | Pass for web and API |
| Product/config/dependency mutation | None |

Temporary `pg@8.13.1` tooling and the local operator script were removed. No
credential, token, connection string, private identifier, response body,
fixture sentinel, screenshot, trace, video, or raw hosted log is committed.

## ARIADNE Disposable Lifecycle Contract

ARIADNE now owns the separately bounded exact-SHA hosted proof. Execute the ten
accepted stages serially, retain every credential/raw id only in ignored
private evidence, and clean up in `finally`:

1. Reconfirm ready web/API source `b06502af4546` or a later docs-only commit,
   exact migration hash, one exact `090` ledger row, and the catalog/security
   receipt above before fixture creation.
2. Create unique disposable owner and invitee Auth/profile users. Record
   out-of-scope Auth/product/deployment baselines without publishing identity.
3. Create one tagged private Project through the product API and prove its one
   matching active owner row. Seed only the minimum tagged private/public
   attachment, evidence, usage, and export sentinels needed for omission proof;
   make no provider, runtime, queue, billing, or external-service call.
4. Prove exact-handle invite, sanitized owner member readback, target-only
   sanitized invitation readback, no invitation for another actor, invited
   detail denial, and anonymous private public-route denial.
5. Accept and prove shared list/detail allowlists through API and desktop/mobile
   browser. Assert zero owner Developer Space request, owner/private route,
   activity, export, mutation, collaborator-control, raw id, body, source, or
   private sentinel in network, DOM, console, captures, or public evidence.
6. With the invitee session, prove direct raw-table denial for membership,
   Project, target Developer Space/document/evidence/usage/export rows and prove
   every target owner-only API remains unavailable while viewer detail succeeds.
7. Revoke, wait for owner success, then begin fresh list/detail requests and
   prove absence/generic not-found. Refresh the browser and prove no retained
   private view or cache reuse.
8. Re-invite and decline, then prove denial. Create one controlled stale invite
   with past database expiry, prove it is hidden and unacceptable, then prove a
   fresh re-invite succeeds.
9. Serially probe dormant `admin`, `editor`, and `billing` rows as the same
   invitee and prove zero Project/dependent access. Prove a second active owner
   and mismatched owner row are rejected by the database invariant.
10. Delete tagged rows in dependency-safe order, delete the Project and both
    Auth/profile users, and prove zero tagged rows, memberships, orphans,
    sessions, refresh rows, storage objects, and temporary artifacts. Reprove
    out-of-scope baselines, one exact ledger, schema no-drift, and unchanged
    deployment SHA.

Commit only public-safe counts, statuses, field names, route classes, and exact
source/migration identity. Do not commit usernames, emails, passwords, JWTs,
service keys, cookies, raw ids, request bodies, private metadata, fixture
sentinels, screenshots, or SQL payloads. Wake ARGUS with a public-safe pass or
one exact blocker after cleanup.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS applied and ledgered exact migration 090, proved catalog/RLS/ACL/PostgREST truth, and confirmed accepted Railway source plus read-only owner/public compatibility.
- No collaboration fixture or product mutation ran; auth probe counts and product rows returned exactly to baseline.
Task:
- Execute the ten-stage disposable lifecycle contract in this result and the ARGUS preflight.
- Commit a redacted pass or exact blocker with cleanup proof, then WAKEUP A3 for hostile review.
```
