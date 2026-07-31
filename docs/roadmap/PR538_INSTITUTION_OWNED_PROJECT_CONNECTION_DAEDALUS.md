# PR538 - Institution-Owned Project Connection

Owner: DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-31

Status:

```text
OPEN_PR538_INSTITUTION_OWNED_PROJECT_CONNECTION
```

## Customer Result

The retained protected-alpha Institution owns one real Station Project. Its
owner can create and manage the Project, its active member can find and read it
with an honest read-only role, an unrelated account cannot see private state,
and a public visitor can read only the deliberately public Project profile.

This must be genuine organisation ownership. A link from the Institution to a
personally owned Project, a subscription label, or duplicated viewer rows does
not satisfy PR538.

## Principal Model

Migration `093` evolves `public.projects` from a person-only owner into an
explicit exactly-one-principal resource:

- make `owner_user_id` nullable without changing any existing value;
- add nullable `institution_id` referencing `public.institutions(id)` with a
  deletion boundary that cannot silently cascade organisation work;
- validate an exact XOR constraint: a Project has either `owner_user_id` or
  `institution_id`, never both and never neither;
- index the Institution principal path; and
- prevent changing either principal after creation.

Do not retain a hidden human owner or call a steward the principal. Existing
personal Projects continue to use `owner_user_id` exactly as before.

For `project_members`, preserve the current personal invariant: every personal
Project has exactly one active `owner` row matching `owner_user_id`. An
Institution Project has no `owner` row in `project_members`; its authority is
derived from `institutions` and active `institution_members`. Existing personal
viewer invitations remain unchanged. PR538 does not duplicate Institution
members into Project viewer records or activate dormant Project roles.

## Authority And Routes

Add one service-owned create transition for an Institution Project and expose
it through an authenticated Institution route. It must:

- resolve the Institution by bounded identity;
- require the immutable Institution owner as actor;
- reject member, invited, removed, stale, unrelated, and anonymous actors;
- create the Project and principal atomically; and
- return only the allow-listed Project and Institution identity DTO.

Update Project list/detail resolution so access is explicit and role-truthful:

| Principal | Private Institution Project | Management |
| --- | --- | --- |
| Institution owner | Read | Owner actions allowed by this lane |
| Active Institution member | Read-only | No Project management or viewer lifecycle |
| Invited/stale/removed member | Denied | Denied |
| Unrelated authenticated user | Denied | Denied |
| Anonymous visitor | Denied | Denied |

For a deliberately public Institution Project, the existing public route may
return its public profile with an allow-listed Institution attribution. That
attribution is routeable only while the Institution is verified and public.
It must expose no raw principal/member/profile ids, email, invitation state,
audit actor, billing/provider value, or private Project evidence.

Keep personal owner and viewer DTOs backward compatible. Add explicit
Institution access labels rather than pretending an active Institution member
is a personal Project viewer.

## Product Surface

Translate the new contract into the existing Tex Station design system:

- the Institution owner/member page gets a Projects section;
- the owner gets a clear create action;
- owner and active member can open the retained Project;
- the member sees an explicit Institution-member/read-only state and no false
  management affordance;
- the Project page names the Institution as principal and links to its current
  identity route; and
- personal Projects continue to render and behave unchanged.

This is a bounded customer interaction, not a reskin. Do not broaden global
CSS or redesign unrelated Project, Institution, Studio, or Discover pages.

## Retained Hosted Proof

After source validation and exact migration preflight, serialize the hosted
apply/deploy/lifecycle. Retain one clearly tagged public Project owned solely by
`Station Institutional Alpha`; use the existing retained owner and active
member. Prove through Station routes:

1. exact migration `093` source/hash/ledger/catalog identity and one apply;
2. owner create/list/detail and correct Institution-principal DTO;
3. active-member list/detail with read-only role truth;
4. member management denial;
5. invited, stale, removed, unrelated, and anonymous-private denial;
6. signed-out public Project read with bounded verified Institution attribution;
7. private/public visibility transitions only by the Institution owner;
8. revoked Institution verification removes routeable public attribution or
   public reachability without destroying private owner/member access;
9. at least one existing personal Project owner/viewer lifecycle remains exact;
10. all disposable negative fixtures are removed and non-target rows, profile
    authority, Auth users, migrations, grants, policies, and accepted Railway
    source show no unexplained drift.

Never print or commit credentials, ids, tokens, private profile values, or raw
database receipts. Keep detailed operator state under ignored
`.station-private/pr538` and publish only a redacted result.

## Required Validation

- focused migration source/shape tests for the XOR principal and split owner
  invariant;
- focused Institution and Project route tests, including hostile states and
  strict serializers;
- existing Project collaboration and public Project tests unchanged where the
  contract is unchanged;
- Institution, auth/profile-boundary, Developer Space, writing, Space,
  community, and export neighbour suites;
- lint, API/web typecheck, and root build with any known local-only packaging
  failure reported precisely; and
- desktop/mobile checks of the changed Institution and Project surfaces with
  button, role-label, overflow, light/dark, and no-false-affordance assertions.

## Exclusions

PR538 does not add institution publication editing, branded Institutional
Space aggregation, community ownership, owner audit readback, Developer Space
ownership, advanced Institution roles, billing, custom domains, analytics, or
global UI work. Those stay in PR539-PR543 or the finished-product horizon.

## Baton

DAEDALUS implements the exact source and serialized hosted proof, commits a
public-safe result, and wakes ARGUS for hostile review. If ARGUS does not
consume the handoff, wake MIMIR with the exact completed/blocking state; do not
silently enter foreground sleep while PR536 has no active owner.
