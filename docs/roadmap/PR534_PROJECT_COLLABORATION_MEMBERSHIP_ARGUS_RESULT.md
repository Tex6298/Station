# PR534 Project Collaboration Membership - ARGUS Result

**Owner:** ARGUS / A3 -> MIMIR / A1

**Date:** 2026-07-30

**Reviewed commit:** `c7a3c2a2b075c6611584653766840f8c0dd07933`

**State:**

```text
ACCEPT_PR534_PROJECT_COLLABORATION_MEMBERSHIP_SOURCE_ONLY_WITH_ARGUS_PATCH
READY_PR534_PROJECT_COLLABORATION_MEMBERSHIP_FOR_MIMIR
```

## Verdict

ARGUS accepts the bounded PR534 source implementation with a narrow review
patch. Exact-handle invitation, target-only invitation handling, active-viewer
Project readback, owner member management, strict viewer DTOs, and owner/viewer
UI branching remain inside the accepted lane. No Cloudflare, hosted runtime,
queue, partner adapter, billing, general team, profile-directory, or unrelated
product scope was added.

This is source acceptance only. Migration `090` has not been run against a real
PostgreSQL or hosted Supabase instance, and no hosted collaboration behavior is
claimed. MIMIR owns the next route and any separately authorized exact-SHA
hosted migration and disposable lifecycle proof.

## ARGUS Patch

- Invitation and member reads now compare expiry against PostgreSQL `now`
  instead of the API process clock. Stale rows are excluded by database time.
- Migration `090` now has an explicit transaction, transaction-scoped advisory
  lock, ordered Project/member write locks, and a PostgREST schema reload
  notification. This closes the old create path while the invariant and atomic
  replacement RPC are installed.
- The deferred owner-membership invariant trigger function is now
  `SECURITY DEFINER`, with execute revoked from `public`, `anon`, and
  `authenticated`, so revoking raw table access does not make legitimate
  service writes fail at deferred-trigger time.
- The invitation response RPC now rejects a null action explicitly instead of
  allowing SQL null semantics to route it as a decline.
- Project list/detail surfaces now distinguish failed reads from true empty
  states, refresh terminal stale actions, and disclose the exact read-only
  Project, Developer Space, and evidence-metadata visibility before invitation.
- Focused source and route tests cover database-clock predicates, transaction
  and lock scaffolding, trigger privilege, null action, stale rows, disclosure,
  and truthful failure states.

## Hostile Review

- Raw `project_members` access remains denied to browser roles. The four
  lifecycle functions are service-role-only, use fixed search paths, derive the
  actor from authenticated API context, and serialize conflicting transitions.
- Owner state remains exactly one matching active owner membership. Existing
  viewer rows are retired, contradictory owner rows abort, and Project delete
  cascade remains possible.
- Viewer list/detail responses are separate allow-listed DTOs. They expose no
  raw user, Project, membership, Developer Space, document, or export ids; no
  connection tier, activity, usage, credential, provider/runtime state,
  document body/source/provenance, or arbitrary service error.
- Viewer dependent reads repeat Project, viewer, owner, role, status, and
  same-owner predicates. Developer Space management, document management,
  activity, usage, and export routes remain owner-only.
- Exact case-sensitive username lookup is server-side and selects only `id`,
  `username`, and `display_name`. The browser does not query raw profiles.
- Owner and public behavior remain compatible apart from the additive access
  discriminator and the atomic Project-create repair.
- The complete implementation and review patch add no dependency or lockfile
  drift and no secret-shaped literal.

The inherited broad `profiles_select_public` policy remains a known separate
boundary. PR534 neither repairs nor relies on that policy, and this verdict does
not claim the raw relation is safe.

## Independent Validation

| Command / review | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `31/31` |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass, `61/61` |
| `npx --yes pnpm@10.32.1 test:exports` | Pass, `15/15` |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 --filter @station/db build` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/types build` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, zero warnings/errors |
| Independent mocked browser proof | Pass at `1440x900` and `390x844`; truthful list/detail failures and invitation disclosure render; viewer owner-resource requests `0`; mobile overflow `0`; six expected synthetic failure responses classified; unclassified console errors and unexpected requests `0` |
| Migration/RPC source audit | Pass for explicit transaction, advisory/table locks, database time, owner invariant privilege, grants, null-action rejection, and PostgREST reload |
| DTO/route/privacy audit | Pass; strict viewer allowlist, same-owner dependent predicates, immediate revoked/stale denial, and owner-only adjacent routes |
| Changed-path/dependency scan | Pass; accepted source/test/docs boundary, one test script addition, no lockfile or dependency change |
| Added-line high-risk secret scan | Pass, zero candidates |
| `git diff --check` | Pass; line-ending notices only |

The browser proof used synthetic intercepted API responses and made no hosted
request or product-data write. A PostgreSQL migration engine was not available
for local apply/rollback execution, so exact-SHA hosted schema and lifecycle
proof remains mandatory before hosted acceptance.

## Baton

MIMIR should close the source-review stage and choose the next authorized move.
No hosted migration, deployment, cleanup, or broader roadmap work is authorized
by this result.
