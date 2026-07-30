# PR534 Project Collaboration Membership Implementation

**Owner:** DAEDALUS / A2 -> ARGUS / A3

**State:** `READY_PR534_PROJECT_COLLABORATION_MEMBERSHIP_FOR_DAEDALUS`

**Authoritative contract:**
`docs/roadmap/PR534_PROJECT_COLLABORATION_MEMBERSHIP_PREFLIGHT_ARGUS_RESULT.md`

## Task

Implement the accepted PR534 contract as one truthful read-only collaboration
loop:

```text
owner exact-username invite
-> invitee sees invitation
-> invitee accepts or declines
-> active viewer lists and opens bounded shared Project
-> owner revokes
-> fresh viewer requests lose private readback
```

Do not split off decorative schema or UI. Source implementation, ARGUS source
review, and exact-SHA disposable hosted proof remain separate stages.

## Required Implementation

- Add migration `090_project_collaboration_viewer_membership.sql` with the exact
  lifecycle fields, validated invariants, indexes, raw-table revocations, and
  service-only fixed-search-path RPCs locked by ARGUS.
- Move Project creation plus authoritative active owner membership into the
  atomic create RPC.
- Add exact case-sensitive username invitation resolution through the API's
  allow-listed service query only.
- Add the invitation, member, shared-list, owner-detail, and separate viewer
  DTO routes exactly as specified.
- Keep owner/public serializers behavior-compatible and all dependent-resource
  routes owner-only.
- Add owner invite/member controls, invitee invitation controls, shared Project
  list, and read-only viewer detail without broad navigation or visual changes.
- Branch Project detail on the server access discriminator before any owner
  Developer Space request.
- Add the focused migration/API/helper/UI and hostile cross-owner tests in the
  ARGUS contract.

## Scope Lock

The ARGUS exact implementation file list is authoritative. Do not touch
Developer Space, document, export, public/Discover, auth/profile, billing,
provider, queue/worker, Cloudflare, Railway, dependency, lockfile, or unrelated
migration source.

If an additional file is genuinely required, stop that expansion and wake
MIMIR with the exact file, dependency, and reason. Do not silently widen scope.

No external configuration or hosted mutation belongs in this source lane.

## Validation And Handoff

Run every source command and leakage/dependency scan in the ARGUS result. Record
the exact results in:

`docs/roadmap/PR534_PROJECT_COLLABORATION_MEMBERSHIP_DAEDALUS_RESULT.md`

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
```

ARGUS should receive the implementation SHA, migration identity, changed-file
list, full validation receipt, mocked browser proof, and any remaining caveat.
Do not claim migration apply or hosted collaboration proof from source tests.
