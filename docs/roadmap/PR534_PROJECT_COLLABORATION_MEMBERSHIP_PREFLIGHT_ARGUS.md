# PR534 Project Collaboration Membership Preflight

**Owner:** MIMIR / A1 -> ARGUS / A3 -> MIMIR / A1 -> DAEDALUS / A2

**State:** `OPEN_PR534_PROJECT_COLLABORATION_MEMBERSHIP_PREFLIGHT`

## Product Decision

Open Project collaboration as the next named Phase 3 customer-facing
capability. This is not a continuation of PR533 UI repair and not another
generated-publication hardening sweep.

The intended capability is a shared research/developer Project in which an
owner can invite an existing Station user, the user can accept or decline, and
an active read-only collaborator can reach the Project through authenticated
Station UI. Later editing, administration, billing, and institutional powers
must earn separate lanes.

## Why This Lane

The repo already has:

- private owner Projects, attached Developer Spaces, activity, evidence, public
  Project readback, and Project export foundations;
- `project_members` roles `owner`, `admin`, `editor`, `viewer`, and `billing`;
- member states `invited`, `active`, and `removed`;
- an owner membership row created with each Project.

The concrete blocker is authorization truth. Current API reads filter only on
`projects.owner_user_id`, current RLS policies are owner-only, no invitation or
acceptance route exists, and no non-owner role has accepted powers. Treating
the existing rows as collaboration without resolving those facts would be a
privacy and product defect.

This blocker needs no external config. Do not ask Marty for Railway, Supabase,
provider, Redis, Cloudflare, email, or billing configuration during preflight.

## ARGUS Task

Hostile-review the current Project schema, API, UI, public serializers, RLS,
tests, and later Project evidence/export additions. Return the smallest safe
implementation contract that creates real collaboration.

Decide explicitly:

1. Which safe existing-user locator can create an invitation without exposing
   raw user ids, enumerating private email addresses, or requiring outbound
   email infrastructure.
2. Whether the first slice can support owner invite, invitee list/read,
   accept/decline, owner revoke, and active `viewer` Project readback together,
   or must be split into PR534A and PR534B.
3. The exact powers of an invited user, active viewer, owner, and removed
   member. Default-deny every unnamed action.
4. Which Project fields, attached Developer Space metadata, activity,
   evidence, public route hints, and export metadata an active viewer may read.
5. How API authorization and RLS stay aligned when the API uses the service-role
   client.
6. How owner uniqueness, duplicate invites, self-invites, stale invitations,
   removal, re-invitation, last-owner protection, and Project deletion behave.
7. Which authenticated UI surfaces expose invitations and active shared
   Projects without implying editor/admin/institutional support.
8. The exact tests, migration/RPC changes if any, and hosted disposable fixture
   required before the capability can close.

## Preferred First Product Slice

Prefer one bounded read-only collaboration loop:

```text
owner invites existing Station user
-> invitee sees bounded invitation
-> invitee accepts or declines
-> active viewer can list and open the shared Project
-> owner can revoke viewer access
-> revoked viewer immediately loses private Project readback
```

If that loop cannot be accepted as one implementation PR, ARGUS should split it
at the smallest security boundary and name both slices. The first slice must
still lead directly to usable customer capability rather than a decorative
schema or placeholder UI.

## Guardrails

- No editor, admin, billing, owner-transfer, seat-management, or institution
  admin powers in the first implementation.
- No external email invites, email delivery, contact discovery, or user
  directory enumeration.
- No public Project redesign, Discover rewrite, broad Studio reskin, or Adam UI
  hierarchy reversal.
- No member mutation of Developer Spaces, documents, evidence, exports,
  encounters, generated publications, Memory, Archive, Canon, Continuity, or
  provider settings.
- No Project billing, Stripe, quotas, provider/model, Redis, Cloudflare,
  queues/workers, hosted runtime, voice/avatar, or unrelated migration work.
- No raw owner/member ids, private email addresses, invite tokens, auth tokens,
  provider payloads, source bodies, credentials, or secret-shaped values in
  public or human-visible readback.
- Preserve all current owner and public Project behavior unless the accepted
  membership contract requires a narrowly documented change.

## Required Source Map

At minimum inspect:

- `infra/supabase/migrations/038_project_alpha_schema_skeleton.sql`;
- later migrations touching Projects, members, evidence, exports, or RLS;
- `apps/api/src/routes/projects.ts` and its tests;
- Developer Space Project attachment authorization;
- Project export authorization and package ownership;
- `packages/types/src/project.ts` and generated DB types;
- `apps/web/app/projects/page.tsx`;
- `apps/web/app/projects/[idOrSlug]/page.tsx`;
- auth/profile fields that could safely identify an existing Station user;
- relevant owner/public Project and cross-owner hostile tests.

## Output And Baton

Commit a public-safe PR534 result with:

- `ACCEPT_PR534_FOR_DAEDALUS` and the exact first implementation contract; or
- one concrete blocker plus the smallest numbered unblock that directly enables
  Project collaboration.

Do not leave the lane as a generic recommendation list. Wake MIMIR with the
verdict so MIMIR can route the accepted implementation to DAEDALUS.

```text
WAKEUP A1:
Codename: MIMIR
```
