# PR527B Space Entitlement And Visibility Repair - DAEDALUS Result

Date: 2026-07-15

Owner chain: MIMIR -> ARGUS -> MIMIR -> DAEDALUS -> ARGUS

State: `IMPLEMENT_PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_COMPLETE_AWAITING_ARGUS_REVIEW`

Source:

- `docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md`

## Result

DAEDALUS implemented the accepted `/space/new` truth and safety repair.

The create page now restores the current session, reads `GET /billing/me` and
owner-scoped `GET /spaces`, validates recognized tier, verified Space limit,
owner Space count, and session/billing tier agreement, then applies the
Creator-tier gate before count policy. Loading, failed, malformed, conflicting,
below-tier, and at-limit states render no form and no Create command.

The entitled builder now starts Private. Public requires an explicit owner
selection. The miniature preview describes Private as private draft state
instead of public surface. A stale create `403` preserves React form values,
closes the live submit path, reruns the same preflight, uses bounded copy, and
never replays POST automatically.

The API create schema now defaults omitted `isPublic` to `false`. Explicit
`true` and `false` remain honored. PATCH omission preserves existing visibility.
The route still relies on `requireTier("creator")` before count policy, so
below-Creator admins remain denied while Creator-or-above admins may bypass
count.

## Scope Guard

Changed files stayed inside the accepted implementation allow-list:

- `apps/web/app/space/new/page.tsx`
- `apps/web/lib/space-create-entitlement.ts`
- `apps/web/lib/space-create-entitlement.test.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/spaces.test.ts`
- `apps/web/app/globals.css`
- `package.json`
- roadmap/status/testing docs

No API-client, auth, billing, middleware, tier-config, permissions, database,
schema, migration, Space manage/detail/public route, shared component,
dependency, lockfile, checkout, hosted-runtime, provider, queue, public
discovery, cleanup, or broader J07 work changed.

## Validation

Local proof:

| Command / check | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/space-create-entitlement.test.ts` | Pass, 4 tests |
| `npx --yes pnpm@10.32.1 test:spaces` | Pass, 10 tests |
| `npx --yes pnpm@10.32.1 test:billing` | Pass, 16 tests |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, 22 tests |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, 262 tests |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass |
| Temporary Playwright proof against local web with intercepted API | Pass, 8 proof groups |

Temporary Playwright proof covered signed-out redirect, delayed loading, failed
preflight, successful Retry-equivalent recovery via fresh reads, below-tier,
at-limit, entitled Private payload, explicit Public payload, stale `403`
retained entries/no auto-retry, and System/Light/Dark desktop plus `390px` and
`375px` fit for unavailable and entitled states. All POSTs were intercepted
synthetic requests; no real Space was created. The temporary harness was
removed before commit.

Remaining pre-commit checks are whitespace, changed-path, secret, and scope
scans.

## ARGUS Review Request

ARGUS should hostile-review:

- the `/space/new` fail-closed gate and exact unavailable copy/destinations;
- session, billing, and owner-Space read validation;
- Creator-tier-before-count behavior, including admin order;
- Private web/API defaults and explicit Public selection;
- PATCH omission preserving visibility;
- stale `403` bounded copy, retained values, fresh preflight, and no automatic
  POST replay;
- route-scoped `.space-create-*` CSS and absence of shared Space-management
  restyling;
- changed-path, secret, and forbidden-scope scans.

If accepted, wake MIMIR with `WAKEUP A1:`. If fixes are needed, wake DAEDALUS
with `WAKEUP A2:`.
