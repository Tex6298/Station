# PR542 Institution Activity And Audit Readback - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3

Date: 2026-08-02

Status:

```text
READY_PR542_INSTITUTION_ACTIVITY_AND_AUDIT_READBACK_FOR_ARGUS
```

## Exact Sources

- Migration/application foundation: `d79cf79591a9353d8b1ba5ff061f38ac34b63e5c`
- Final API/web source: `4764e28ac27a1052c4db415df3396ed68bb6d193`
- Migration: `infra/supabase/migrations/098_institution_activity_audit_readback.sql`
- Migration version: `20260802213001`
- Migration SHA-256: `14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE`
- Hosted ledger/exact ledger: `1/1`

## Result

Migration `098` extends the existing append-only Institution ledger rather
than creating a second activity store. It adds the exact
`project_created`/`institution_project` pair, replaces
`create_institution_project_v1` so Project and audit creation are atomic,
backfills exactly one event for the retained Institution Project, adds the
bounded newest-first index, and preserves service-only RPC/table authority.

`GET /institutions/:slug/activity` is immutable-owner-only. It returns bounded
summary counts and an allow-listed typed timeline ordered by
`created_at desc, id desc`, with a hard maximum of 50 and opaque validated
cursor. Profiles and resources are projected only for the current page. The DTO
contains no audit, user, subject, or resource ids; no email/avatar/private
profile fields; no arbitrary action/resource text; and no partial response on
source/projection failure. Missing resources render `Unavailable resource`.

The private Activity workspace shows Team, Projects, Publications, Space, and
Community counts plus a chronological domain/action/actor-role/resource/time
timeline. Owner-only shortcuts exist in team, publication, Space, and community
workspaces. Members receive no shortcut, and signed-out users are redirected to
login with the exact Activity return path.

## Hosted Database And API Proof

Preflight preserved personal Projects `4` and their fingerprint, prior
non-Project audit rows `57` and their fingerprint, one Institution Project,
and Space `8/8`. Postflight reports:

- Institution Projects / Project audit events / retained Project events:
  `1/1/1`;
- retained total Institution events: `58`;
- personal Projects and pre-existing audit fingerprints unchanged;
- actual-engine transaction-scoped successful RPC observed both Project and
  exactly one audit row before rollback, with neither retained;
- a forced audit-trigger failure rolled back the Project insert, with neither
  row retained;
- ordinary audit deletion was rejected by the append-only trigger;
- owner `200`; anonymous `401`; active, invited, stale, removed, unrelated,
  and admin-without-owner-context `404`;
- complete cursor traversal exposed identity, team, Project, publication,
  Space, and community domains with no gaps or duplicate entries;
- a missing resource rendered the generic unavailable label without an href;
  raw UUID/private-field scans passed; and
- proof reports and proof Projects are `0/0`; retained Space remains `8`.

The missing-resource row was synthetic and removed only under an explicit
transaction-local replication-mode cleanup after the normal append-only delete
was proven to fail. Final state exactly matches the post-migration snapshot.

## Browser Proof

Exact deployed source `4764e28a` passed Playwright at:

- owner desktop `1440px`, light;
- owner mobile `390px`, dark;
- owner mobile `375px`, light;
- active member `390px`, dark; and
- signed-out `375px`, light.

All owner views showed complete pagination, summary/domain truth, event times,
zero horizontal overflow, zero clipped controls, no private/raw-id leakage, and
zero console/page/request diagnostics. The member had no Activity shortcut and
the direct route returned the expected bounded `404`; Chromium disclosed its
standard paired 404 resource console line. Signed-out navigation redirected to
login with the exact return path.

Screenshots and raw receipts remain ignored under `.station-private/pr542`.

## Validation

| Command | Result |
| --- | --- |
| `test:institution-activity` | Pass, `23/23` |
| `test:institutions` | Pass, `20/20` |
| `test:projects` | Pass, `33/33` |
| `test:institution-publications` | Pass, `4/4` |
| `test:institution-spaces` | Pass, `6/6` |
| `test:institution-community` | Pass, `20/20` |
| `test:community` | Pass, `59/59` |
| `test:ai-settings` | Pass, `14/14` |
| `typecheck` | Pass |
| `lint` | Pass, no warnings/errors |
| `build` | Compiled, typechecked, and generated `42/42` pages; then the established local Windows standalone symlink `EPERM` occurred |
| `git diff --check` | Pass; line-ending warnings only |

## Scope Boundary

PR542 did not add analytics, filtering, exports, member/public audit access,
community-post mirroring, billing/provider traces, retention controls, or
PR543 work. ARGUS owns independent source, database, hostile-boundary, and
hosted review.
