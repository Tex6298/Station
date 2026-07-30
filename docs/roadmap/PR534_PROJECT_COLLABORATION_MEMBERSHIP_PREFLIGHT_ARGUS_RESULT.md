# PR534 Project Collaboration Membership Preflight ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-30

Status:

```text
ACCEPT_PR534_FOR_DAEDALUS
```

## Verdict

ARGUS accepts one bounded read-only Project collaboration implementation slice.
It must deliver the complete usable loop together:

```text
owner invites one existing Station username
-> invitee sees a bounded invitation
-> invitee accepts or declines
-> active viewer lists and opens a bounded shared Project
-> owner revokes the viewer
-> every request begun after successful revocation loses private readback
```

Do not split this into decorative invitation schema and later authorization.
The migration, atomic membership transitions, API serializers, and owner/viewer
UI are one source lane because none is a truthful customer capability alone.
Source acceptance and exact-SHA hosted proof remain separate review stages.

This verdict accepts only the implementation contract. It does not claim that
collaboration exists, migration `090` has applied, a hosted invite has passed,
or any editor, admin, billing, institution, or owner-transfer power exists.
No external configuration is required.

## Hostile Source Findings

| Surface | Current truth | PR534 ruling |
| --- | --- | --- |
| Project authority | `projects.owner_user_id` is authoritative. API list/detail and Project RLS are owner-only. | Preserve it as the only owner authority. A membership row with role `owner` must never independently confer ownership. |
| Membership skeleton | `project_members` names five roles and three statuses, but has no invite lifecycle or accepted non-owner power. | Only exact `viewer` plus exact `active` gains the new bounded read contract. Every other non-authoritative role/status is denied. |
| Project creation | The API inserts the Project and owner membership in two separate writes, so owner-row failure can leave a Project behind. | Move create plus matching active owner row into one service-only transaction RPC before collaboration relies on owner-row invariants. |
| Owner detail | Current readback contains Project and Developer Space ids, connection tier, activity/usage, private evidence metadata, and owner draft routes. | Preserve it for the authoritative owner only. It is forbidden as a viewer serializer. |
| Developer Spaces and documents | Their direct RLS and API routes are owner-scoped; Developer Space rows can lead to key/config/runtime surfaces. | Keep all underlying routes and tables owner-only. Return only the explicit viewer metadata DTO from the Project API. |
| Exports | Project package create/list/read/bundle paths are owner-scoped. | Keep every export path and all package metadata owner-only. Hide the export panel from viewers. |
| Public Project | The anonymous serializer already filters to public same-owner Developer Spaces and eligible public evidence. | Preserve it unchanged. Collaboration must not weaken or redesign public readback. |
| Profile locator | `profiles.username` is a unique public handle; signup accepts 3-30 ASCII letters, digits, underscore, or hyphen. The raw `profiles` relation is not a safe browser locator because its inherited public SELECT policy covers private columns too. | Resolve one exact, case-sensitive stored username through an explicit service-only `id, username, display_name` select. Do not add a browser profile query, search, suggestions, email input, directory listing, or new profile grant. |
| Current Project UI | The detail page fetches owner Developer Spaces alongside Project detail and renders owner activity, evidence, attach controls, and exports. | Fetch Project detail first and branch on the server access discriminator. A viewer must never start the owner Developer Space request or render owner controls. |

## Locked Identity Contract

The invitation locator is the target user's exact current Station username.

- Input is a single `username` string, trimmed and validated against the
  existing 3-30 character signup grammar.
- Resolution is exact and case-sensitive against the stored username. Do not
  lowercase a request in SQL: the current database uniqueness is also
  case-sensitive, so case folding could select an ambiguous account.
- Resolution happens only in the authenticated Project API. The browser must
  not query `profiles`, and the service query must name only `id`, `username`,
  and `display_name`; the id remains internal to the transaction.
- The owner must know or paste the complete handle. There is no prefix,
  substring, fuzzy, email, display-name, or raw-id lookup and no suggestion or
  result list.
- An unsuccessful invalid, missing, self, or unavailable target returns stable
  bounded copy and no profile fields. It must not echo database errors or the
  submitted value.
- A successful invitation may return the target's username and public display
  name. No response may return profile id, email, tier, admin state, auth
  metadata, avatar storage details, or membership id.
- No invite token and no outbound email are created. The invitation belongs to
  the authenticated target account through its server-resolved user id.

Invitations expire at the database clock after 14 days. The API and client
cannot choose or extend that interval. This longer in-product window is
deliberate because the slice has no email delivery.

## Locked Role Powers

| Actor/state | Exact powers | Default-denied examples |
| --- | --- | --- |
| Authoritative owner | All current Project owner behavior, plus exact-username invite, sanitized current-member list, pending-invite cancel, and active-viewer revoke. | No owner transfer, second owner, editor/admin/billing assignment, seats, institution, or invitation by email. |
| Invited viewer | List their own unexpired sanitized invitations and accept or decline their own invitation. | No Project detail/shared list, member list, Developer Space/document/evidence/activity/export read, mutation, or public-visibility change. |
| Active viewer | List and open the bounded shared Project DTO described below. | No mutation anywhere; no attach/detach, manage, draft review, ingestion, keys, usage, provider/runtime, export, member, billing, or owner controls. |
| Removed, declined, or expired viewer | No private Project or invitation readback and no membership action. | All collaboration reads/actions fail closed. A later owner re-invite creates a fresh invitation lifecycle. |
| `admin`, `editor`, or `billing` member | No power, regardless of `status`. | Every Project collaboration and dependent-resource path is denied. These dormant schema labels are not product roles. |
| Stray `owner` member | No power unless the user is also `projects.owner_user_id` and owns the matching active owner row. | A role string never overrides authoritative Project ownership. |
| Anonymous or unrelated authenticated user | Existing public Project contract only when visibility is Public; otherwise no Project readback. | No invitation, membership, shared Project, or private dependent-resource access. |

All unnamed actions are denied. Viewer membership must not alter authorization
in Developer Space, document, evidence-link, usage, export, encounter,
publication, Memory, Archive, Canon, Continuity, provider, or billing routes.

## Locked API Contract

All routes remain behind the existing authenticated Project router except the
unchanged `/projects/public/:slug` route. Static invitation routes must be
registered before `/:idOrSlug`.

| Method and route | Authority | Contract |
| --- | --- | --- |
| `GET /projects` | Authenticated | Preserve `projects` as the existing owner array and add `sharedProjects` containing only active-viewer summaries. |
| `GET /projects/invitations` | Authenticated | Return only this user's unexpired `viewer/invited` rows as sanitized invitations. |
| `POST /projects/:idOrSlug/invitations` | Project owner | Body is exactly `{ "username": string }`; create one 14-day viewer invitation through the transaction RPC. |
| `GET /projects/:idOrSlug/members` | Project owner | Return sanitized pending and active viewers only. Do not return removed history or owner/dormant rows. |
| `POST /projects/:idOrSlug/invitation/accept` | Target invitee | Atomically accept this user's current unexpired viewer invitation. Empty body. |
| `POST /projects/:idOrSlug/invitation/decline` | Target invitee | Atomically remove this user's current unexpired viewer invitation. Empty body. |
| `POST /projects/:idOrSlug/members/revoke` | Project owner | Body is exactly `{ "username": string }`; atomically remove a current pending or active viewer. |
| `GET /projects/:idOrSlug` | Owner or active viewer | Preserve full owner response; add `access`. Return the separate allow-listed viewer DTO below. Everyone else receives the same generic not-found response. |

New private collaboration responses use `Cache-Control: private, no-store`.
The existing web API client already requests `no-store`; the server response
must make the boundary explicit too. The UI grants nothing optimistically.

Every service-role read performs an explicit joined predicate over the current
Project, requesting user, exact role, and exact status. Unknown Project,
unrelated user, inactive membership, and dormant role all map to stable generic
not-found or no-longer-available copy. Arbitrary database messages, request
values, ids, and nested service payloads are never returned.

RPC actor ids come only from `requireAuth` server context. No route schema
accepts an actor, owner, target-user, member, or Project id supplied as an
authorization claim by the browser.

### Invitation DTO

The invitee may receive only:

```text
project: name, slug, description, visibility
owner: username, displayName
role: viewer
status: invited
invitedAt
expiresAt
```

The owner member list may receive only:

```text
username
displayName
role: viewer
status: invited | active
invitedAt
expiresAt only while invited
respondedAt only while active
```

No invitation or member DTO contains Project, member, owner, or user ids.

### Shared Project Summary

`sharedProjects` contains only:

```text
name
slug
description
visibility
createdAt
updatedAt
owner: username, displayName
access: role=viewer, readOnly=true
publicHref only when the Project is Public, otherwise null
```

It does not contain `id`, `ownerUserId`, `connectionTier`, member counts,
activity, evidence, export state, or billing/provider metadata.

### Viewer Detail DTO

The viewer detail response is a separately typed serializer. It may contain:

```text
access: role=viewer, readOnly=true
owner: username, displayName
project:
  name, slug, description, visibility, createdAt, updatedAt
  publicHref only when Public, otherwise null
developerSpaces[]:
  projectName, slug, description, visibility, visualisationType, updatedAt
  publicHref only when that Developer Space is Public, otherwise null
evidence[]:
  developerSpace: projectName, slug
  document: title, documentType, updatedAt, publishedAt when present
  role
  publicHref only when the Space is Public, the link is Public, and the
    document is both Published and Public; otherwise null
```

Private evidence metadata is shared only because the owner explicitly invited
the viewer to this Project. The invitation UI must state that read-only access
includes the Project's attached Developer Space and evidence metadata. It does
not share document or source bodies.

Every dependent viewer query is same-owner and same-Project scoped even though
the service client can bypass RLS. A Developer Space must match both the
Project id and `projects.owner_user_id`; an evidence link must match that Space
and owner; a document must match the link and authoritative Project owner.
Hostile cross-owner or orphan rows are omitted, and tests must inject them.

The viewer serializer must omit:

```text
all database ids and owner/member/user ids
connectionTier
Developer Space key, secret, config, provider-policy, usage, trace, and runtime fields
Project activity: nodes, events, snapshots, storageBytes, publicReads, exports
document slug, status, visibility, sourceLabel, provenanceType, body, and storage path
private draft and Studio routes
link visibility, sort order, and internal timestamps
all export package metadata, status, history, content, and bundle routes
```

Public hrefs are server-authored. The client must not construct a route from a
private slug or infer routeability from a visibility label.

## Membership Lifecycle And Races

- Self-invite is rejected before any write.
- One partial unique current-membership constraint continues to allow at most
  one non-removed row per Project/user across all roles.
- A current unexpired invitation returns conflict; an active viewer returns
  conflict. Neither creates or extends a row.
- Accept changes exact `viewer/invited` to `viewer/active`, records the database
  response time, and never changes role.
- Decline and owner cancel/revoke change the row to `removed` and record the
  database removal time.
- Expired invitations are absent from lists and cannot be accepted or declined.
  An attempted stale response retires that row and returns bounded stale copy.
- Re-invite atomically retires any stale row and inserts a new invited row with
  a new server expiry. Removed, declined, or revoked history never regains
  power.
- Accept/decline/revoke lock the same current membership row. A completed owner
  revoke wins over every request that begins afterward. The API rechecks exact
  active viewer state on every shared list/detail request and serves no cached
  private response.
- Project deletion remains the only way to remove the authoritative owner.
  Existing `ON DELETE CASCADE` removes all membership rows. No Project-delete
  UI or API is added in this lane.
- Collaboration RPCs cannot target, remove, demote, or replace the authoritative
  owner row. `projects.owner_user_id` is immutable through this lane.

## Migration 090 Contract

Add exactly one migration named for Project viewer collaboration. It must:

1. Add nullable `invite_expires_at`, `responded_at`, and `removed_at`
   timestamps to `project_members`.
2. Fail closed on contradictory existing owner/non-owner lifecycle rows. It may
   reconstruct a missing matching active owner membership from authoritative
   `projects.owner_user_id`; it must not silently bless a mismatched owner.
3. Add and validate viewer lifecycle checks: invited requires a non-null expiry
   with no response/removal; active requires a response and no removal; removed
   requires a removal time. Do not put `now()` in a row check constraint; RPCs
   own the 14-day clock comparison. Owner and dormant roles cannot carry
   invitation lifecycle fields.
4. Add a unique active-owner-per-Project index and a deferred invariant that an
   existing Project has one matching active owner membership. Project cascade
   deletion must still succeed.
5. Add the bounded pending-invitation lookup index needed by user, role, status,
   and expiry. Preserve the existing current-member partial unique index.
6. Replace the broad `project_members_all_project_owner` policy and revoke
   direct `project_members` access from `public`, `anon`, and `authenticated`.
   Owners and invitees use the sanitized API, not a raw row containing ids.
7. Keep `projects`, `developer_spaces`, `developer_space_documents`,
   `documents`, usage, and export tables owner-only under direct RLS. Do not add
   a viewer table policy: row-level policy cannot hide secret or raw-id columns.
8. Define service-only, `SECURITY DEFINER`, fixed-search-path transaction RPCs:

```text
create_project_with_owner_v1
invite_project_viewer_v1
respond_project_viewer_invitation_v1
revoke_project_viewer_v1
```

Each function validates the supplied authenticated actor against authoritative
rows inside the transaction, uses database time, locks transition rows where
needed, and returns no owner/member/user id or database error. Membership
transitions return bounded outcome codes; create may return the inserted
Project to the service for the unchanged owner serializer. Fully qualify
relation/function references. Revoke default execute from `public`, `anon`,
and `authenticated`; grant only `service_role`.

This is deliberate asymmetric defense in depth: the service-role API may
return one column-safe viewer DTO after explicit authorization, while direct
table RLS remains stricter and denies the viewer raw rows. The API must never
use service-role bypass as an implicit authorization decision.

## Locked UI Surfaces

`/projects` gains three independent authenticated regions without a broader
navigation or visual redesign:

- Pending invitations with Project/owner metadata and Accept/Decline commands.
- Shared with you with active read-only Project summaries.
- Existing owner Projects and create form, behavior preserved.

The owner Project detail gains one compact collaborator panel with exact
username input, truthful sharing disclosure, pending rows with Cancel, and
active viewer rows with Revoke. Removed history, role pickers, seat counts,
email language, and team/institution claims are absent.

The Project detail loader must first fetch Project detail, inspect `access`,
and only then fetch `/developer-spaces` for an owner. Viewer rendering uses the
viewer DTO alone and contains no Project export panel, activity counters,
attach/detach controls, manage/Open owner routes, draft-review routes, member
panel, or owner Developer Space request.

Loading, independent-read failure, stale action, empty, success, and denied
states must be truthful. Mutation commands disable while pending, require a
fresh explicit action after failure, preserve typed username where useful, and
refresh from server truth after success. Keyboard, focus, long handles, long
Project/evidence labels, and mobile wrapping are required. Use existing
semantic theme variables and route-scoped Project styles.

## Exact Implementation Boundary

DAEDALUS may change only the collaboration migration/types, existing Project
API/UI, focused tests/helpers, scoped Project CSS, and result/status/testing
documentation:

```text
infra/supabase/migrations/090_project_collaboration_viewer_membership.sql
packages/db/src/types.ts
packages/types/src/project.ts
apps/api/src/routes/projects.ts
apps/api/src/routes/projects.test.ts
apps/web/app/projects/page.tsx
apps/web/app/projects/[idOrSlug]/page.tsx
apps/web/lib/project-collaboration.ts
apps/web/lib/project-collaboration.test.ts
apps/web/app/globals.css
package.json
docs/roadmap/PR534_PROJECT_COLLABORATION_MEMBERSHIP_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

`package.json` may change only to include the focused helper in
`test:projects`. `globals.css` may receive only Project collaboration selectors
using existing semantic variables. Additional files require MIMIR approval or
an exact ARGUS blocker.

No Developer Space, document, export, public/Discover, auth/signup/profile,
billing, provider, queue/worker, Cloudflare, Railway, dependency, lockfile, or
unrelated migration source may change. Hosted deployment and fixture artifacts
are not part of the source implementation commit.

The inherited broad `profiles_select_public` policy is a known unsafe raw-table
boundary and is not repaired or endorsed here. PR534 avoids it by forbidding
browser profile reads and selecting an exact safe column set server-side. A
future profile projection/grant redesign remains separate roadmap work.

## Required Source Tests

Focused Project tests must prove at least:

- create RPC atomically returns the existing owner response and cannot leave a
  Project without its matching active owner row;
- exact case-sensitive username resolution, invalid/unavailable/self target
  safety, duplicate pending/active conflict, expiry, stale retirement,
  re-invite, and transition outcome mapping;
- only the target sees one unexpired invitation, with the exact field allowlist
  and no id/email/token/tier leakage;
- only the authoritative owner sees sanitized current viewers and can
  cancel/revoke; cross-owner and stray-role attempts fail before side effects;
- invited, declined, expired, removed, `admin`, `editor`, `billing`, and stray
  `owner` rows cannot list or open shared Projects;
- exact active viewer can list/open, the DTO matches the allowlist, public hrefs
  obey all eligibility predicates, and private route/body/source/export/activity
  fields are absent recursively;
- owner detail and anonymous public Project response stay byte-shape compatible
  apart from the additive owner `access` discriminator;
- every membership/database failure returns stable public copy with no submitted
  username, SQL text, ids, service payload, or secret-shaped value;
- migration source has the exact columns, validated constraints, invariant,
  indexes, function ownership/search path/grants, and raw-table RLS revocations.

Adjacent regression tests must prove that active membership grants no target
Developer Space detail/manage/usage/key/document route and no Project export
create/list/read/bundle route. The web helper and mocked browser proof must
cover owner, invited, active viewer, stale/removed, loading, partial failure,
mobile, keyboard/focus, and the no-owner-request viewer branch.

DAEDALUS and ARGUS must run:

```text
npx --yes pnpm@10.32.1 test:projects
npx --yes pnpm@10.32.1 test:developer-spaces
npx --yes pnpm@10.32.1 test:exports
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 --filter @station/db build
npx --yes pnpm@10.32.1 --filter @station/types build
npx --yes pnpm@10.32.1 --filter @station/api typecheck
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

Review must scan the complete diff for raw ids, private emails, invite/auth
tokens, credentials, provider/source bodies, debug logging, arbitrary error
echo, dependency drift, and forbidden paths. No secret value may be printed or
committed.

## Required Hosted Disposable Proof

After source acceptance, rehearse the exact accepted web/API SHA with the
existing private admin configuration and no new external service:

1. Record exact ready web/API deployment SHA before and after proof. Confirm
   migration `090` has exactly one ledger entry and exact catalog columns,
   constraints, indexes, deferred invariant, policies, grants, function owners,
   fixed search paths, and service-only execute privileges.
2. Create unique disposable owner and invitee Auth/profile users. Retain all
   credentials and raw ids only in ignored private evidence.
3. Create one tagged private Project through the product API and prove one
   matching active owner row. Seed tagged private/public attachment, evidence,
   usage, and export sentinels only as needed to prove omission; make no
   provider/runtime/queue call.
4. Prove exact-handle invite, owner sanitized member readback, invitee sanitized
   invitation readback, no invitation for another actor, invited detail denial,
   and private anonymous public-route denial.
5. Accept, then prove shared list/detail allowlists in API and browser at desktop
   and mobile. Assert no owner Developer Space request, no private route, no
   activity/export/control surface, and no raw/private sentinel in network,
   DOM, console, capture, or public result.
6. With the invitee JWT, prove direct raw-table denial for Project membership,
   Project, target Developer Space/document/evidence/usage/export rows. Prove
   target owner-only APIs remain unavailable even while viewer detail succeeds.
7. Revoke, wait for the successful owner response, then begin fresh shared-list
   and detail requests and prove absence/generic not-found. Refresh the browser
   and prove no retained private view.
8. Re-invite and decline, then prove denial. Create one controlled stale invite
   with a past database expiry, prove it is hidden/unacceptable, and prove a
   fresh re-invite succeeds.
9. Serially probe dormant `admin`, `editor`, and `billing` rows as the same
   disposable invitee and prove zero Project/dependent access. Prove a second
   active owner or mismatched owner row is rejected by the database invariant.
10. Delete tagged fixture rows in dependency-safe order, delete the Project and
    both Auth/profile users, and prove exact zero tagged rows, memberships,
    orphans, sessions, refresh rows, storage objects, and temporary artifacts.
    Prove out-of-scope product/Auth baselines and deployment SHA are unchanged.

Hosted proof may contain only sanitized counts, statuses, field names, route
classes, and exact source/migration identity. Do not commit usernames, emails,
passwords, JWTs, service keys, cookies, raw ids, request bodies, private
metadata, captures, or fixture sentinels.

## Preflight Verification

| Check | Result | Notes |
| --- | --- | --- |
| Wake consumption | Pass | Committed MIMIR wake `d08fd2cf` was consumed explicitly for A3; uncommitted watcher state was not treated as a handoff. |
| Schema/RLS audit | Pass as contract evidence | Migration `038`, later Project/evidence/export migrations through `089`, generated DB types, Project/member policies, and profile locator were reviewed. The current member skeleton grants no accepted collaboration power. The inherited broad raw `profiles` SELECT policy is explicitly unsafe for client lookup and remains outside this lane. |
| API/UI audit | Pass as defect evidence | Project owner/public serializers, service-role queries, two-write create, Project pages, Developer Space attachment routes, evidence, and export paths were reviewed. Current owner detail is unsafe to reuse for viewers. |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `17/17` | Establishes current owner/public/error/evidence baseline only. |
| `npx --yes pnpm@10.32.1 test:developer-spaces` | Pass, `61/61` | Establishes owner/private, secret, attachment, usage, and runtime baseline only. |
| `npx --yes pnpm@10.32.1 test:exports` | Pass, `15/15` | Establishes owner-only Project package and malformed/cross-owner baseline only. |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` | Establishes authenticated middleware, stable auth error, protected-route, session, and username-normalization baseline only. |
| Opening handoff diff check | Pass | No whitespace error or secret-shaped value was found in the committed PR534 handoff. |
| Product implementation | None | ARGUS changed only public roadmap/testing status and its watcher receipt. Hosted state was not read or mutated. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts one bounded read-only Project collaboration implementation slice.
Verdict:
- ACCEPT_PR534_FOR_DAEDALUS
Task:
- Route DAEDALUS the exact migration, API DTO, role, lifecycle, UI, test, and hosted gates recorded here.
- Keep source acceptance and exact-SHA hosted proof as separate review stages.
```
