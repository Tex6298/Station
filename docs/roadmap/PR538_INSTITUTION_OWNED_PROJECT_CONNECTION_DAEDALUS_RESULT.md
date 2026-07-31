# PR538 Institution-Owned Project Connection - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3

Date completed: 2026-07-31

Status:

```text
READY_PR538_INSTITUTION_OWNED_PROJECT_CONNECTION_FOR_ARGUS
```

## Decision

PR538 is ready for independent review. Migration `093` is applied and ledgered
exactly once, source `bb5674cf` is live on both Railway services, and one public
Project is retained with `Station Institutional Alpha` as its sole principal.

The Institution owner can create, list, read, and change Project visibility.
The active Institution member can list and read with an explicit read-only
role. Invited, stale, removed, unrelated, and anonymous actors cannot enter the
private path or create an Institution Project. Personal Project owner/viewer
behavior remains operational and schema-valid.

## Schema Checkpoint

| Field | Result |
| --- | --- |
| Migration | `093_institution_owned_projects` |
| Version | `20260731150001` |
| SHA-256 | `E95DB00E8A1D1AA706C69123B222D6C20EFABF96E492D183BAF3359947EFF435` |
| Ledger rows | `1` |
| Accepted source | `bb5674cf083ee065b178d8b95e16ccf2e5fef4b9` |
| `institution_id` column / XOR constraint | `1 / 1` |
| Institution FK delete boundary | `RESTRICT` |
| Service/browser create RPC authority | `1 / 0` |
| Invalid principals / personal owners | `0 / 0` |
| Institution Project owner rows | `0` |

Existing personal Projects retained their `owner_user_id` values and exact-one
matching active owner rows. Institution Projects have no hidden human owner and
no owner row in `project_members`; access derives from the Institution owner or
an active Institution member. Both principal columns are immutable.

## Retained Hosted State

The retained Project is `Station Institution Project Alpha`, slug
`station-institution-project-alpha`. It is public and belongs solely to the
retained verified/public `Station Institutional Alpha` identity.

Final restarted verification found:

- one retained Institution and one active retained member;
- one retained Institution Project and four unchanged personal Projects;
- owner and member list/detail HTTP `200` with `institution_owner` and
  `institution_member` role truth;
- signed-out public Project HTTP `200` with only bounded Institution name,
  slug, and routeable verified identity link;
- zero invalid principal rows and zero Institution Project owner memberships;
- zero tagged Auth users, profiles, or Institution memberships; and
- retained owner admin authority restored to false.

No response exposed raw principal/member/profile ids, email, invitation state,
audit actors, billing/provider fields, tokens, or private evidence.

## Lifecycle And Hostile Proof

Station routes proved owner create/list/detail, active-member list/detail,
member visibility denial, private anonymous denial, owner private/public
visibility transitions, public attribution, and verification revocation. While
the Institution was revoked/private, public Project reachability returned 404
without destroying owner or member private access. Re-verification and
publication restored the same bounded public route.

Disposable valid-username accounts proved invited, pre-aged stale, removed,
and unrelated denials. All were removed after the run. A separate disposable
viewer proved the unchanged personal Project invite, accept, viewer detail,
revoke, and post-revoke denial lifecycle; its Project and account were removed.

The first serialized lifecycle completed one valid verification
revoke/restore/publication cycle, then stopped because the retained member's
legacy 31-character username correctly fails the 30-character Project viewer
boundary. Cleanup completed. The resumed run used a valid disposable viewer
and passed. Institution audit events therefore advanced from `12` to `18`:
three expected append-only events per completed verification cycle. This is the
only retained non-Project data delta and is fully accounted for.

## Product Surface

- Institution team page: Project count/list for owner and member, owner-only
  create form, and explicit member read-only copy.
- Institution Project page: Institution named as principal, truthful owner or
  member role, owner-only visibility control, and no personal collaboration or
  Developer Space management affordance.
- Public Project page: verified Institution attribution only when the
  Institution identity is verified and public.
- Personal Project pages and collaboration remain on their prior paths.

Desktop owner, mobile member, and dark-mode public checks found zero horizontal
overflow and zero off-screen buttons/links. The member view exposed no Project
management control.

## Validation

| Command or proof | Result |
| --- | --- |
| Hosted migration/ledger/catalog | Pass; exact one apply and ledger row |
| Hosted retained lifecycle | Pass; owner/member/public and six denial classes |
| Fresh restarted hosted verifier | Pass; accepted source, fixture residue `0`, authority restored |
| `install --frozen-lockfile` | Pass |
| `lint` / `typecheck` | Pass; zero warnings/errors |
| `test:projects` | Pass, `33/33` |
| `test:institutions` | Pass, `16/16` |
| `test:auth` / `test:profile-boundary` | Pass, `24/24` and `5/5` |
| `test:developer-spaces` / `test:writing` | Pass, `61/61` and `35/35` |
| `test:spaces` / `test:community` / `test:exports` | Pass, `11/11`, `57/57`, `15/15` |
| Root build | Compile, checks, `42/42` pages, optimization, and traces pass; known local Windows standalone symlink copy ends with `EPERM` |
| Desktop/mobile/light/dark UI | Pass; role truth, no false affordance, overflow `0` |

Detailed receipts, screenshots, credentials, tokens, ids, and raw database
state remain under ignored `.station-private/pr538`.

## Boundary And Baton

PR538 adds no Institution Space aggregation, community ownership, Developer
Space ownership, audit UI, billing, branding, custom domains, or later PR536
scope.

ARGUS should independently review migration `093`, the exact ledger and Railway
source, principal/owner-row invariants, retained owner/member/public behavior,
verification revocation, the explained append-only audit delta, disposable
cleanup, personal compatibility, and role-truthful UI. If accepted, wake MIMIR;
if correction is required, wake DAEDALUS with exact findings.
