# PR534 Project Collaboration Membership - DAEDALUS Result

**Owner:** DAEDALUS / A2 -> ARGUS / A3

**Date:** 2026-07-30

**Base:** `7bd9eee4 docs: route PR534 collaboration implementation`

**State:**

```text
READY_PR534_PROJECT_COLLABORATION_MEMBERSHIP_FOR_ARGUS
```

## Verdict

DAEDALUS implemented the accepted Project viewer collaboration source loop:
exact case-sensitive Station-username invitation, target-only invitation
readback, accept/decline, bounded active-viewer list/detail, owner member
readback, and owner cancel/revoke.

Migration `090`, API/types, owner/viewer UI, focused tests, neighboring route
regressions, browser proof, and the full accepted local gate pass. This result
is ready for ARGUS hostile source review. Migration `090` was not applied to a
hosted database, no hosted data was read or mutated, and this result does not
claim hosted acceptance.

## Persistence Contract

- Migration `090_project_collaboration_viewer_membership.sql` adds nullable
  invite expiry, response, and removal timestamps with a validated viewer
  lifecycle check that contains no wall-clock expression.
- Existing pre-contract viewer rows are retired rather than granted inferred
  power. Missing matching owner rows may be reconstructed; contradictory owner
  state aborts the migration.
- A unique active-owner index and deferred Project/member invariant require one
  active owner membership matching `projects.owner_user_id`. Project deletion
  still permits membership cascade, and owner replacement is blocked.
- The current-member partial unique index is preserved and a bounded pending
  viewer lookup index is added.
- The broad Project-member owner policy is removed and direct raw
  `project_members` access is revoked from `public`, `anon`, and
  `authenticated`. No viewer policy was added to Project, Developer Space,
  document, usage, or export tables.
- Project creation and invitation/respond/revoke transitions use four
  service-only `SECURITY DEFINER` RPCs with fixed search paths, database time,
  row locking, bounded outcomes, explicit ownership, revoked default execute,
  and service-role-only grants.

## API Contract

- Project creation now atomically creates the Project and matching active owner
  membership through `create_project_with_owner_v1`; the former two-write
  orphan possibility is removed.
- `GET /projects` preserves the owner `projects` array and adds only exact
  active-viewer `sharedProjects`. `GET /projects/invitations` returns only the
  requesting target's unexpired viewer invitations.
- Owner invite/member/revoke routes resolve one exact stored username through
  a service query selecting only `id`, `username`, and `display_name`. Browser
  bodies cannot supply actor, owner, target id, or authorization claims.
- Invitee accept/decline and owner revoke use transaction outcomes for current,
  duplicate, stale, active, removed, and unavailable states. Every new private
  collaboration response sends `Cache-Control: private, no-store`.
- Owner detail preserves its previous payload and adds
  `access: { role: "owner", readOnly: false }`.
- Active viewer detail is a separate allow-listed serializer. It contains no
  Project/member/user ids, connection tier, activity, usage, keys, provider or
  runtime data, document slug/body/source/provenance, export state, or owner
  route. Public hrefs are server-authored only when each public predicate holds.
- Every shared Project and dependent metadata query repeats exact Project,
  requesting-user, owner, role, status, and same-owner predicates. Cross-owner
  and orphan dependencies are omitted.

## UI Contract

- `/projects` has independent Pending invitations, Shared with you, and owner
  Project/create states. Accept/decline commands refresh server truth and keep
  mutation-versus-refresh failures distinct.
- Owner Project detail adds one exact-username collaborator panel with pending
  Cancel and active Revoke actions. No role picker, directory search, email,
  seat, team, or owner-transfer claim was added.
- Project detail is fetched before any owner resources. The viewer branch makes
  zero owner Developer Space list requests and renders no activity, export,
  attach/detach, manage, draft-review, member, key, usage, or provider control.
- Route-scoped styles provide long-handle wrapping, stable two-column/one-column
  layout, disabled states, semantic focus outlines, and 390 px mobile fit.

## Browser Proof

An ephemeral local Playwright harness used synthetic session/API responses and
made no hosted request or product-data write.

| Proof | Result |
| --- | --- |
| Owner desktop | Pass; collaborator input/member row, long handle, visible focus, and zero document overflow |
| Active viewer desktop | Pass; allow-listed Project/space/evidence metadata only; no owner controls or activity/export surfaces |
| Active viewer mobile | Pass at `390x844`; long labels wrap, public actions remain reachable, and document overflow is zero |
| Invitation/shared list mobile | Pass at `390x844`; pending Accept/Decline, shared Open, focus, create form, and empty owner state remain coherent |
| Viewer owner-resource fanout | Pass; exact `/developer-spaces` owner-list request count `0` across desktop, mobile, and reload |
| Browser console | Pass; `0` errors |

The ephemeral harness and captures were deleted after visual inspection.

## Validation

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
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass; zero warnings/errors |
| Mocked browser matrix | Pass; exact states and request boundary above |
| Changed-path/dependency review | Pass; accepted file boundary only, one focused test added to `test:projects`, no dependency or lockfile drift |
| Response/added-line leakage scan | Pass; no new viewer/invitation/member DTO exposes raw ids, email/auth data, credentials, provider/runtime state, source/body data, or arbitrary service errors |
| `git diff --check` | Pass; line-ending notices only |

## Frozen Boundaries

No Supabase auth/session semantic, Developer Space product behavior, document
route, export route, billing, provider, runtime, ingestion, Stripe, dependency,
or lockfile behavior changed. No profile directory/search grant was added. The
inherited broad raw profile policy remains a separate known boundary and is not
used by the browser.

## Baton

ARGUS should hostile-review migration upgrade safety, deferred owner invariant
and cascade behavior, RPC races/grants, exact username resolution, every DTO
allowlist, owner/public compatibility, immediate post-revoke denial, dormant
role denial, neighboring route denial, UI request ordering, focused tests, and
the complete diff leakage scan.

If accepted, ARGUS should wake MIMIR with the source verdict. Exact-SHA hosted
migration and disposable lifecycle proof remain a later separately authorized
stage.
