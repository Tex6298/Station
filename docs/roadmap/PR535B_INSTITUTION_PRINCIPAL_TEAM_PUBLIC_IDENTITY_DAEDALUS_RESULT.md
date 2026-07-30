# PR535B Institution Principal, Team, And Public Identity - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3

Date completed: 2026-07-30

Status:

```text
READY_PR535B_INSTITUTION_PRINCIPAL_TEAM_PUBLIC_IDENTITY_FOR_ARGUS
```

## Decision

DAEDALUS implemented the frozen first Institutional Spaces customer loop as a
source-only slice. Migration `092`, typed DB/shared surfaces, the isolated API,
four web routes, and focused hostile tests are ready for independent ARGUS
review.

Migration `092` was not applied hosted. No hosted institution fixture, ledger
row, deployment, secret, credential, or private identifier was created or
committed.

Exact migration identity:

```text
infra/supabase/migrations/092_institution_principal_team_public_identity.sql
SHA-256 928FCB9395E1803253491F1C367470F46DB9139E9A9BDCB23FD79967333B3E0D
```

## Database Boundary

Migration `092` adds exactly three tables:

- `institutions`, with one immutable `owner_user_id` principal and immutable
  name, slug, and summary identity;
- `institution_members`, with only the `member` role and invited, active, or
  removed database-clock lifecycle; and
- append-only `institution_audit_events`, with typed actions and required
  actor/subject/institution references only.

The owner is never represented by a membership row. All three tables enable
RLS and expose zero direct browser policies or table privileges. Six
fixed-search-path, definer-owned transition RPCs are executable only by
`service_role`: provision, verification, publication, invite, invitation
response, and member revoke.

Every transition revalidates authoritative profiles and admin, owner, or target
authority, locks the institution before member rows, uses database time, and
appends typed audit evidence atomically. Verification revocation atomically
makes a public institution private. Stale invitations become removed and may
start one fresh fourteen-day lifecycle. Direct audit update/delete is blocked;
parent institution cascade cleanup remains possible.

Preflight requires the exact migration-091 profile policy/grant boundary and
fails on object collisions or any pre-existing `institution_id`. Transactional
pre/post fingerprints require every existing public relation shape, policy,
and relevant table grant to remain unchanged. Postassert also proves six
service-only transitions, three zero-policy RLS tables, and zero institution
attachment to existing resources.

## API Boundary

`/institutions` implements only the frozen route set. Public routing is
registered before auth and dynamic routes; signed-in responses use
`Cache-Control: private, no-store`, while public identity uses `no-store`.

- Station admins alone provision principals and transition verification.
- Owners alone invite/revoke members and publish/unpublish verified identity.
- Exact case-sensitive existing usernames resolve only through service-owned
  profile reads.
- Invited, removed, unrelated, insufficient, malformed, and missing private
  actors receive the same bounded institution `404`; stale actions receive one
  bounded `410`.
- Active members receive only institution/team readback. Owners additionally
  receive pending invitees and truthful controls.
- Admin summaries include safe owner identity and state timestamps, never ids,
  email, member lists, authority fields, billing, or private profile data.
- Public readback is exactly name, slug, nullable summary, and literal
  `verified: true` for verified/public identities.

Runtime and static query evidence show the router touches only `institutions`,
`institution_members`, and bounded profile identity. It makes no Project,
Space, Developer Space, document, export, billing, provider, or other existing
resource query.

## Web Boundary

The four frozen routes are present:

```text
/institutions
/institutions/admin
/institutions/[slug]/team
/institutions/[slug]
```

The list handles current owner/member access and invitation responses. The
admin route provisions private/unverified principals and transitions
verification. The team route branches on server-authored access: members see
only read-only identity and active roster; owner invitation, revocation, and
publication controls mount only in the owner branch. The member request plan
contains only `/institutions/:slug/team`.

The public route leads with the institution name and literal
`Verified by Station` badge, followed by bounded summary. Existing Station
navigation and styling remain intact; no global redesign or unrelated route
rewrite was made.

## Existing Resources Stay Personal

No existing table, policy, serializer, entitlement, ownership check, route, or
resource row changed. No existing table received `institution_id`. Institution
membership grants no Project, Project member, Space, Developer Space, persona,
document, forum, Memory, Canon, Continuity, Integrity, archive, connector,
provider, credential, quota, token, export, billing, notification, or
moderation access.

Institution content, transfers, multi-author editing, billing, domains,
uploads/logos, analytics, email, queues, provider runtime, and delegated
community or Developer Space operation remain out of scope.

## Validation

| Command / proof | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- install --frozen-lockfile` | Pass; lockfile current |
| `npm exec --yes pnpm@10.32.1 -- run test:institutions` | Pass, `12/12` |
| Ephemeral libpg_query PostgreSQL parse | Pass, `67` statements; no dependency retained |
| Desktop and `390x844` Playwright route proof | Pass, all `4` routes at both viewports; no overflow or page errors |
| Member network capture | Pass; only `/auth/me` and `/institutions/station-labs/team`, with no existing-resource request |
| `npm exec --yes pnpm@10.32.1 -- run test:profile-boundary` | Pass, `5/5` |
| `npm exec --yes pnpm@10.32.1 -- run test:auth` | Pass, `24/24` |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass, `31/31` |
| `npm exec --yes pnpm@10.32.1 -- run test:spaces` | Pass, `11/11` |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass, `61/61` |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass, `35/35` |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass, `57/57` |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass, `15/15` |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass, API and web |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass, zero warnings/errors |
| `npm exec --yes pnpm@10.32.1 -- run build` | Partial / known Windows boundary: `8/9` tasks passed; web compiled, linted/typechecked, collected data, and generated `42/42` pages before standalone trace-copy symlink `EPERM` |

The build emitted only the pre-existing autoprefixer `align-items: end` warning
at `globals.css:740`; PR535B styles are later in the file and do not introduce
that declaration.

## Baton

ARGUS should hostile-review migration `092`, exact profile preflight, RLS/ACL
and RPC ownership, institution-before-member locks, audit append-only/cascade
semantics, public-state coupling, stale/re-invite lifecycle, private/public
serializer keys, cache/error boundaries, route ordering, exact-case username
lookup, member zero-fanout UI, and existing-resource non-inheritance.

If accepted, wake MIMIR with the source-only verdict. If one exact correction
is required, wake DAEDALUS with the finding. Do not apply migration `092`
hosted or expand Institutional Spaces in review.
