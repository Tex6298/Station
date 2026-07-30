# PR535B - Institution Principal, Team, And Public Identity

Owner: DAEDALUS / A2

Date: 2026-07-30

Status:

```text
OPEN_PR535B_INSTITUTION_PRINCIPAL_TEAM_PUBLIC_IDENTITY
```

## Authority

ARGUS froze this product contract in:

`docs/roadmap/PR535_INSTITUTIONAL_SPACES_FOUNDATION_PREFLIGHT_ARGUS_RESULT.md`

PR535A/PR535A1 removed and independently proved the sole profile-authority
blocker. DAEDALUS may now implement this source-only first Institutional Spaces
slice. Do not apply migration `092` hosted in this lane.

## Customer Loop

Implement one complete bounded loop:

```text
Station admin provisions a private unverified institution for an exact
existing owner username -> admin verifies it -> owner invites an exact existing
member username -> member accepts or declines -> active member gets bounded
private team readback -> owner publishes the verified identity -> visitors read
the verified public institution page -> owner revokes member or admin revokes
verification -> fresh private/public reads fail closed as appropriate
```

## Principal And Authority

- Add migration
  `092_institution_principal_team_public_identity.sql` after exact accepted
  migration `091`.
- Add only `institutions`, `institution_members`, and append-only
  `institution_audit_events`.
- `institutions.owner_user_id` is the sole immutable owner authority and
  references `profiles(id) ON DELETE RESTRICT`.
- The owner is not represented by a membership role. Private readback
  synthesizes `owner` only after the authoritative owner check.
- The only member role is `member`; it grants private institution/team readback
  only. Statuses are `invited`, `active`, and `removed` with database-clock
  fourteen-day expiry and shape-valid timestamps.
- No institution admin, editor, billing, viewer, publisher, moderator, or owner
  membership role exists.

## State Transitions

- A server-authenticated Station admin may provision one private, unverified
  institution for an exact existing owner username.
- Provisioning never publishes or verifies.
- A separate admin-only transaction verifies or revokes verification.
- Verification revocation atomically makes the institution private.
- The owner alone publishes or unpublishes, and only while verified.
- The owner alone invites/revokes members; only the current exact target may
  accept or decline an unexpired invitation.
- Provision, verification, revocation, publication, unpublication, invitation,
  response, and member revocation append typed audit events atomically.
- `verified` means attested by Station in protected alpha. It does not claim
  domain ownership, legal status, KYC, or an automated check.

## Database Boundary

- All three tables have RLS enabled and zero direct browser table privilege or
  policy.
- Add six service-only, fixed-search-path, definer-owned transaction RPCs for
  provision, verification transition, publication transition, invite,
  invitation response, and member revocation.
- Revoke default execute; grant execute only to `service_role`.
- API-derived actor ids are validated inside each RPC against authoritative
  profile admin, institution owner, target, and current lifecycle state.
- Use database time, institution-before-member locking, immutable owner/identity
  guards, append-only audit guards, advisory/table migration locks, strict
  pre/post assertions, and PostgREST reload.
- Audit rows contain typed actions and required foreign keys/timestamps only;
  no free-form payload. Direct audit update/delete is blocked while authorized
  parent deletion may cascade for disposable cleanup.
- Add no `institution_id` to any existing table and change no existing policy,
  serializer, route, entitlement, ownership check, or row.

## API Contract

Implement, with static routes registered before `/:slug` routes:

```text
GET  /institutions
GET  /institutions/invitations
GET  /institutions/:slug/team
POST /institutions/:slug/invitations
POST /institutions/:slug/invitation/accept
POST /institutions/:slug/invitation/decline
POST /institutions/:slug/members/revoke
POST /institutions/:slug/publication
GET  /institutions/admin
POST /institutions/admin
POST /institutions/admin/:slug/verification
GET  /institutions/public/:slug
```

All signed-in responses use `Cache-Control: private, no-store`. Private missing,
invited, removed, unrelated, and unauthorized actors receive the same bounded
institution `404`; stale invitation actions receive one bounded `410`. Never
echo submitted usernames or service errors.

Owner/team summaries expose only institution name, slug, summary,
verification/public states, server-authored public href, and role-truthful
access booleans. Team detail exposes bounded username/display-name roster
identity and lifecycle timestamps. Active members see owner plus active members
only; owners additionally see pending invitees and controls. Removed rows are
never serialized. Admin summaries add safe owner identity and state timestamps,
not ids, email, billing, private profile fields, or the member list.

Public `GET /institutions/public/:slug` ignores authentication and returns only
when verified and public:

```text
{
  institution: {
    name,
    slug,
    summary,
    verified: true
  }
}
```

Private, unverified, revoked, missing, and malformed identities return the same
generic `404`. The response is `no-store` and exposes no owner/member identity,
raw id, email, contact, tier/admin flag, billing/usage, external URL, resource
count, or audit actor.

## Web Contract

Add only:

```text
/institutions
/institutions/admin
/institutions/[slug]/team
/institutions/[slug]
```

The public page renders institution name as the first-viewport identity, a
literal `Verified by Station` badge, and bounded summary. Private pages show
role-truthful actions and states. The member branch makes zero owner-resource
requests and renders no admin, invitation, revocation, publication, Project,
Space, Developer Space, document, export, billing, provider, or private-user
controls. Use the existing Station design system; no global reskin or unrelated
navigation rewrite.

## Existing Resources Stay Personal

Membership grants no Project, Project-member, Space, Developer Space, persona,
document, forum/subcommunity, chat, Memory, Canon, Continuity, Integrity,
Archive/import/connector, prompt/provider, credential, storage/quota, token,
export, billing, notification, or moderation access. Do not reuse document
visibility `members` as collaborator-only truth. Institution-authored content,
resource transfer, multi-author editing, custom domains, logos/uploads,
analytics, research data, billing/Stripe, support tooling, email, queues,
provider runtime, forum delegation, and Developer Space operation remain out.

## Validation

Add focused `test:institutions` coverage for migration shape, every serializer
key, all transitions, exact-case username lookup, generic errors, cache headers,
owner/admin/target/unrelated/anonymous boundaries, raw-table denial, audit
append-only behavior, public state coupling, expiry/stale/re-invite behavior,
and zero existing-resource fanout.

Run appropriate neighboring suites including profile boundary, auth, Projects,
Spaces, Developer Spaces, writing/public serialization, community, exports,
API/web typechecks, web lint, DB/types builds, migration parsing, and
desktop/`390x844` rendered route tests. Record actual counts.

## Handoff

Commit source, migration, API, web, tests, and public-safe evidence. Wake A3
ARGUS for hostile review. Do not apply migration `092` hosted, create hosted
institution fixtures, or claim Institutional Spaces accepted. On any contract
conflict or required scope expansion, stop and wake A1 with the exact blocker.
