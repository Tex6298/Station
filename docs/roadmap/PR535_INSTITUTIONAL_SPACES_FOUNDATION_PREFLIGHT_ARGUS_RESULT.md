# PR535 Institutional Spaces Foundation Preflight - ARGUS Result

**Owner:** ARGUS / A3 -> MIMIR / A1

**Date:** 2026-07-30

**State:**

```text
BLOCK_PR535_PROFILE_AUTHORITY_AND_PRIVATE_COLUMN_BOUNDARY
PROPOSE_PR535A_PROFILE_AUTHORITY_AND_PRIVATE_COLUMN_BOUNDARY_REPAIR
```

## Verdict

ARGUS does not authorize Institutional Spaces implementation yet. The product
shape is viable, but the current `profiles` boundary cannot safely authorize an
admin-provisioned organisation or support the non-negotiable no-private-user-
data claim.

Source and hosted catalog agree that `profiles_select_public` permits every row
and that browser roles have column access to private billing, provider-key,
tier, and admin fields. `profiles_update_own` is row-scoped but not column-
scoped; hosted grants permit an authenticated account to update both `tier` and
`is_admin` on its own row. ARGUS performed no profile read or mutation: a
`limit=0` sensitive projection and catalog-only checks were sufficient.

The smallest direct unblock is PR535A, a profile authority/private-column ACL
and RLS repair. It must land and pass exact-SHA hosted proof before MIMIR may
authorize a separate PR535B institution principal/team/public-identity slice.
This result does not start either implementation.

## Blocker Evidence

The checked-in schema still has only the original two profile policies from
migration `002`:

- `profiles_select_public` is `SELECT USING (true)` over a relation containing
  `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, three
  legacy BYOK key columns, `ai_mode`, `tier`, and `is_admin` alongside public
  identity fields.
- `profiles_update_own` is `UPDATE USING (auth.uid() = id)` with no column ACL
  restriction. No later migration replaces either policy or revokes profile
  table privileges.

Fresh hosted, value-free inspection proved:

| Check | Hosted result |
| --- | ---: |
| Profile RLS enabled | `true` |
| Public all-row SELECT policy | `true` |
| Own-row UPDATE policy | `true` |
| Anon/authenticated table SELECT | `true` / `true` |
| Authenticated table UPDATE | `true` |
| Sensitive profile columns selectable by anon/authenticated | `9` / `9` |
| Authority columns updatable by authenticated | `2` (`tier`, `is_admin`) |
| Policies whose expressions depend on profile authority | `11` |
| Anon sensitive `limit=0` projection | `200` |
| Profile rows or values read | `0` |

This is a direct PR535 blocker. Institution provisioning would otherwise rely
on an `is_admin` value that a browser role can update, and an institutional team
account would retain the same raw private-profile projection available to every
other browser role. A route-level allowlist cannot repair either database
authority defect.

Two adjacent truths are also frozen:

- `subscription_tier = 'institutional'` is a personal profile entitlement. It
  currently grants the highest personal Space, Developer Space, publishing,
  community, storage, and token limits; it is not an organisation principal.
- Document visibility value `members` is currently treated as paid/community-
  tier visibility in database policy and the personal Space route. It is not a
  designated-collaborator boundary and must not back an institutional team area.

## Proposed PR535A Unblock

MIMIR may authorize one schema/security-only lane:

```text
PR535A_PROFILE_AUTHORITY_AND_PRIVATE_COLUMN_BOUNDARY_REPAIR
infra/supabase/migrations/091_profiles_private_column_authority_boundary.sql
```

The exact contract is:

1. Run migration `091` in one explicit transaction under a transaction-scoped
   advisory lock. Verify the expected profile columns, policies, grants, RLS,
   and eleven dependent policy expressions before changing anything; abort on
   drift.
2. Drop `profiles_select_public` and `profiles_update_own`. Revoke all table and
   column privileges on `public.profiles` from `public`, `anon`, and
   `authenticated` before granting the minimum replacement.
3. Add one SELECT policy, scoped to `anon` and `authenticated`, whose only
   visible row is `auth.uid() = id`. Grant those roles column SELECT only on
   `id`, `tier`, and `is_admin`. Anonymous callers therefore see no row;
   authenticated callers can supply only their own authority values to existing
   RLS predicates. No public identity field is read directly from the base table.
4. Grant browser roles no profile INSERT, UPDATE, or DELETE privilege and add no
   browser mutation policy. Profile creation remains trigger/service-owned;
   billing, provider settings, and server-authenticated reads remain API/service
   operations.
5. Preserve explicit trusted `service_role` SELECT/INSERT/UPDATE/DELETE needed
   by current API services and verified billing/settings flows. Reload the
   PostgREST schema after commit.
6. Do not alter a profile row, rotate a credential, expose a non-null count, add
   a public view, change auth/session semantics, or rewrite the eleven dependent
   policies in this lane. Their definitions and all unrelated schema/data
   fingerprints must remain exact.
7. Add focused migration assertions and a `test:profile-boundary` script. Keep
   auth `24/24`, Spaces `11/11`, community `57/57`, billing `16/16`, AI settings
   `14/14`, Projects `31/31`, Developer Spaces `61/61`, and exports `15/15`
   green, plus API/DB/types builds and typechecks.
8. Run a separate exact-SHA hosted proof. Anon and authenticated sensitive
   projections must be denied without reading values; authenticated own
   `id/tier/is_admin` must work, another profile must be absent, direct updates
   to `tier`, `is_admin`, and benign display fields must fail, and all authority
   values must remain unchanged. Exercise representative tier/admin-dependent
   policies and public API serializers before and after.
9. Prove one exact `091` ledger row, zero unrelated row/catalog drift, healthy
   Railway web/API, and exact disposable Auth/session cleanup. Commit only
   statuses, counts, object names, and source/migration identity.
10. Stop before mutation if grants/policies differ from preflight, a dependent
    policy cannot work with own-row authority SELECT, a browser update remains
    possible, or repair requires reading/printing/rewriting private values.

Closing future access cannot prove historical non-access. Any private
credential inventory, rotation, or incident-response decision belongs to a
separate operator-controlled security decision and must never publish values.

## Post-Unblock PR535 Shape

The following answers the requested product questions and freezes the smallest
safe institution slice. It is design evidence, not implementation authority.

### 1. Principal Choice

An institution must be a new durable principal in `public.institutions`, with no
Project or personal Space link in the first slice. A constrained Project subtype
fails because Projects remain personal-owner workspaces with connection tiers,
dependent Developer Space/evidence behavior, and only the accepted viewer role;
their dormant `admin`, `editor`, and `billing` labels have no authority. A
personal `institutional` tier fails because it is a user entitlement. An
immediate organisation-to-Project link fails because it would imply resource
ownership before transfer and member permissions exist.

### 2. Authoritative Owner

`institutions.owner_user_id` is the only owner authority and references
`profiles(id) ON DELETE RESTRICT`. It is immutable in this slice. Owners are not
stored as membership-role rows; the private DTO synthesizes role `owner` only
after an exact `owner_user_id = req.user.id` check. No role string can create,
replace, or transfer ownership.

### 3. Roles And Statuses

`institution_members.role` has one allowed value: `member`. It grants private
institution/team readback only. Lifecycle statuses are `invited`, `active`, and
`removed`, with a fourteen-day database-clock expiry and the same explicit
timestamp-shape discipline proven for PR534. There is no institution `admin`,
`editor`, `billing`, `viewer`, publisher, moderator, or owner membership role.

### 4. Provisioning And Verification

After PR535A, a server-authenticated Station `is_admin` may provision one
private, unverified institution for an exact existing owner username. Provision
never publishes or verifies. A separate admin-only transaction grants or
revokes verification; revocation atomically makes the identity private. A
separate owner-only transaction publishes or unpublishes only while verified.
Every provision, verification, revocation, publication, and unpublication
appends a typed audit event. "Verified" means explicitly attested by Station in
protected alpha, not domain ownership, legal/KYC status, or an automated claim.

### 5. Public Route And DTO

`GET /institutions/public/:slug` ignores authentication and returns only when
verification is `verified` and publication is `public`:

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

Missing, private, unverified, and revoked identities return the same generic
`404`. The response is `no-store`. It exposes no owner/member identity, raw id,
email, avatar URL, contact, tier, admin flag, billing/usage state, external URL,
Project/Space/resource count, or audit actor. The web route is
`/institutions/[slug]` and renders the institution name as the first-viewport
identity with a literal "Verified by Station" badge and bounded summary.

### 6. Private Routes And DTOs

All signed-in responses are `Cache-Control: private, no-store`:

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
```

Owner/team summaries contain only `name`, `slug`, `summary`,
`verificationStatus`, `publicStatus`, server-authored `publicHref`, and an access
object with role `owner` or `member` plus exact management booleans. Team detail
adds an owner identity and roster identities containing only exact username,
display name, role, status, and applicable invitation/join timestamps. Active
members see only the owner and active members; only the owner sees pending
invitees and management actions. Removed rows are never serialized. Admin
summaries add safe owner identity and state timestamps but no member list, id,
email, billing data, or private profile field.

Invited, removed, unrelated, and missing actors receive the same private
institution `404`; stale invitation actions return one bounded `410`. Submitted
usernames and service errors are never echoed. Web surfaces are
`/institutions`, `/institutions/[slug]/team`, and `/institutions/admin`. The
member branch makes zero owner-resource requests and renders no admin, invite,
revoke, publication, Project, Space, Developer Space, document, export, billing,
or provider control.

### 7. Resources That Remain Personal

Every existing resource remains profile-owned: Projects and project members,
personal Spaces/pages, Developer Spaces and usage/keys/runtime state, personas,
documents, forums/subcommunities, conversations/messages, Memory, Canon,
Continuity, Integrity, Archive/imports/connectors, prompts/provider settings,
credentials, storage/quota, token usage, exports, billing, notifications, and
moderation. The first institution migration adds no `institution_id` to an
existing table and changes no existing policy, serializer, route, entitlement,
or ownership check. Institution membership grants none of those resources.

The existing document value `members` is not collaborator-only truth. PR535B
must not attach documents or reuse the personal Space public route. Global
five-state visibility and institution-authored content remain later explicit
lanes.

### 8. Database Contract

Conditionally after migration `091`, PR535B uses migration `092` and only three
new relations: `institutions`, `institution_members`, and append-only
`institution_audit_events`. Institutions carry immutable owner/name/slug/
summary, verification/publication states and shape timestamps. Members carry
one `member` role, lifecycle status/timestamps, and a unique current
institution/user index. Audit actions are typed and contain no free-form
payload; direct update/delete is blocked while parent deletion may cascade for
authorized disposable cleanup.

All three tables have RLS enabled and zero direct browser table privilege or
policy. Six service-only, fixed-search-path, definer-owned RPCs provision,
transition verification, transition publication, invite, respond, and revoke.
Default execute is revoked; only `service_role` executes. Each function validates
the actor against authoritative profile/admin/owner/member state, uses database
time, locks institution before membership rows, and commits state plus audit in
one transaction. Migration `092` has its own advisory/table locks, immutable
owner/identity trigger, PostgREST reload, and no existing-row rewrite.

### 9. Disposable Proof

Local tests must cover every serializer key, role/status transition, exact-case
username resolution, owner/admin/cross-owner denial, public-state transition,
audit append-only behavior, raw-table denial, generic errors, cache headers,
and zero existing-resource query fanout. Desktop and `390x844` browser proof
covers admin provision/verification, owner invitation/publication, target
accept/decline, active member roster, public identity, revoked member, revoked
verification, truthful failures, and zero overflow/private payload.

The later separately authorized hosted proof creates disposable admin, owner,
member, and unrelated accounts. It proves default private/unverified state,
admin-only verification, owner-only publication/team control, target-only
invitation, accept/decline/stale/re-invite/revoke, member roster filtering,
public DTO exactness, hostile cross-owner denial, raw-table denial, and zero
institution-derived access to tagged owner-private Project/Developer Space/
document/usage/export and persona/chat/Memory/Canon/Continuity/Archive/Integrity/
provider sentinels. Finally it deletes institution rows before Auth users and
proves zero product/Auth/session/refresh/storage residue, exact schema/ledger,
unchanged unrelated fingerprints, and stable deployment identity.

### 10. External Configuration

No external configuration is required. Protected-alpha admin authority,
in-app exact-username invitations, Supabase persistence, and existing Railway
web/API are sufficient. Custom domains, email, logos/uploads, analytics,
billing/Stripe, support tooling, provider/runtime access, queues, institution
publishing, forum delegation, and research-data access remain explicitly out of
scope.

## Validation

| Command / review | Result |
| --- | --- |
| Product/vision/technical reconciliation | Blocker plus viable post-unblock principal contract above |
| Source profile policy/grant audit | Block; broad SELECT and own-row unscoped UPDATE remain unrepaired after migration `090` |
| Hosted value-free profile audit | Block; exact catalog/ACL counts above, sensitive `limit=0` projection `200`, rows read `0` |
| `node --check .station-private/pr535/argus-profile-boundary-audit.mjs` | Pass |
| `npx --yes pnpm@10.32.1 test:auth` | Pass, `24/24` |
| `npx --yes pnpm@10.32.1 test:spaces` | Pass, `11/11` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `57/57` |
| `npx --yes pnpm@10.32.1 test:billing` | Pass, `16/16` |
| `npx --yes pnpm@10.32.1 test:ai-settings` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `31/31` |
| Neighboring Developer Space/export baseline | Pass, `61/61` and `15/15` |
| Private audit artifact hygiene | Pass; ignored locally, no credential or row value printed/read/committed |

## Baton

MIMIR should authorize only the PR535A profile boundary repair above or pause
PR535. Institutional principal/team implementation remains blocked until that
repair has independent source and exact-SHA hosted acceptance.
