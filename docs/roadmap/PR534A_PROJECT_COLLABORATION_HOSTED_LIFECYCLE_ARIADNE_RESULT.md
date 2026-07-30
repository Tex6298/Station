# PR534A Project Collaboration Hosted Lifecycle - ARIADNE Result

**Owner:** ARIADNE / A4 -> ARGUS / A3

**Date:** 2026-07-30

**Hosted source:** `b06502af45460ef00a4032d985f31fe35e624913`

**Migration:**
`infra/supabase/migrations/090_project_collaboration_viewer_membership.sql`

**Migration SHA-256:**
`F7106E40227C9D1371FB5349B2D53E5BC9D8BEBB3C4DAB888DDF2868C73B61EF`

**State:**

```text
PASS_PR534A_PROJECT_COLLABORATION_HOSTED_LIFECYCLE_FOR_ARGUS
```

## Verdict

The complete disposable hosted Project collaboration lifecycle passes against
the accepted exact source. Exact-handle invitation, target-only invitation
readback, read-only viewer list/detail, desktop/mobile UI, raw-table denial,
owner-route denial, immediate revoke, decline, expiry, re-invite, dormant-role
denial, and owner invariants all behaved as locked.

The run created only the bounded disposable fixture, made no provider, runtime,
queue, billing, or external-service call, and cleaned every product, Auth,
session, refresh-token, profile, quota, and storage artifact in `finally`.
Independent post-run verification found zero residue and exact baseline, schema,
ledger, and deployment stability.

## Deployment And Schema

- Hosted web and API were healthy and ready on `main` at exact source
  `b06502af45460ef00a4032d985f31fe35e624913` before and after proof.
- Migration `090` matched the accepted SHA-256 and had exactly one ledger row:
  version `20260730095001`, name
  `090_project_collaboration_viewer_membership`.
- Catalog truth contained the three nullable lifecycle columns, two validated
  checks, two target indexes, three target triggers, and six target functions.
- All six functions retained fixed `pg_catalog, public` search paths and
  `postgres` ownership. Five remained security-definer functions.
- Browser roles had zero target-function execute grants and zero raw
  `project_members` table privileges. The four transition RPCs remained
  executable by trusted `service_role`.
- `project_members` RLS remained enabled, the broad owner policy remained
  absent, and owner-invariant and viewer-lifecycle violations were both zero.
- Fresh PostgREST probes returned `200` for the service-role lifecycle columns
  and `401` for anonymous access.

## Disposable Fixture

The proof created:

| Fixture class | Count |
| --- | ---: |
| Auth users and matching profiles | `2` each |
| Private Project created through the product API | `1` |
| Matching active owner memberships | `1` |
| Private/public attached Developer Spaces | `2` |
| Private/public evidence documents and links | `2` each |
| Usage sentinels | `2` |
| Owner-only Project export sentinel | `1` |

Credentials, usernames, emails, tokens, raw ids, fixture strings, request
bodies, SQL, captures, and private responses remain encrypted or ignored under
`.station-private/pr534a/`.

## Invitation Boundary

- A wrong-case handle returned bounded `404`; the exact case-sensitive handle
  created one viewer invitation with only `displayName`, `expiresAt`,
  `invitedAt`, `role`, `status`, and `username`.
- Owner member readback returned one sanitized invited viewer.
- Only the target account saw one invitation. The other disposable actor saw
  none.
- Invitation, owner identity, and Project metadata matched their exact
  allowlists and exposed no email, raw id, token, tier, or private field.
- The invited user could not open Project detail.
- The anonymous public route returned generic not-found for the private Project.

## Active Viewer

After acceptance:

- `GET /projects` returned zero owner Projects and one shared Project with the
  exact shared-summary allowlist.
- Project detail returned only `access`, `developerSpaces`, `evidence`, `owner`,
  and `project`.
- The detail contained two bounded Developer Space summaries and two evidence
  summaries. The private Space and evidence item had no public route; the
  eligible public Space and evidence item had their bounded public routes.
- No raw id, owner id, connection tier, activity, usage, export, provider,
  configuration, key, body, summary, source, provenance, or private sentinel
  appeared recursively in collaboration responses.
- The viewer made no owner `/developer-spaces` collection request and no browser
  mutation request.

The raw browser-role proof covered seven private target table classes:
`project_members` was privilege-denied, and Project, Developer Space, private
document, evidence link, usage, and export probes returned empty under RLS.
Zero target rows were exposed. The private document probe was intentionally
bound to the private sentinel; the existing public-document policy was not
weakened or reclassified.

All twelve owner/control route classes were denied while shared detail
continued to return `200`: collaborator read/invite/revoke, Developer Space
detail/usage/agent action/API key/document attach, and Project/Developer Space
export list/create.

## Browser Review

| Case | Result |
| --- | --- |
| Projects list, desktop `1440x900` | Pass; one shared Project, zero pending invitations, zero horizontal overflow |
| Viewer detail, desktop `1440x900` | Pass; read-only hierarchy, long labels contained, no owner controls, zero horizontal overflow |
| Viewer detail, mobile `390x844` | Pass; all content and actions legible, zero horizontal overflow, zero control escapes |
| Revoked detail, mobile refresh | Pass; generic not-found, no retained Project content or cache reuse |

Human-eye review found no overlap, clipping, hidden action, misleading owner
control, or remaining UX blocker in the four captures. Public and private
Developer Space/evidence metadata remained visibly distinct, and the
read-only location and return path were clear.

Browser diagnostics contained zero page errors, zero unclassified console
errors, and zero unclassified request failures. The revoked refresh produced
the expected Project-detail `404` and one classified Next.js RSC fallback
notice; no unrelated failure occurred.

## Revocation And Roles

- Owner revoke completed before fresh viewer reads began.
- A fresh shared list was empty, fresh detail returned generic not-found, and a
  browser refresh retained no private view.
- Re-invite then decline returned the viewer to denial.
- A database-clock-expired invitation was hidden and returned the stable stale
  response when acceptance was attempted.
- A subsequent fresh invitation succeeded and was visible, then was cancelled
  before role probes.
- Dormant `admin`, `editor`, and `billing` rows each granted zero shared Project
  access and were denied across all twelve dependent owner route classes.
- A second active owner and a mismatched owner membership were both rejected.
  The invariant probe left zero temporary rows.

## Cleanup

Final cleanup proved:

| Scope | Remaining |
| --- | ---: |
| Tagged product/dependent rows | `0` |
| Auth users and identities | `0` |
| Sessions and refresh tokens | `0` |
| Profiles, storage usage, and token usage | `0` |
| Storage objects | `0` |

The complete out-of-scope row fingerprints returned exactly to pre-run truth.
Migration/catalog truth, one-row ledger truth, and both hosted deployment ids
also remained unchanged.

## Validation

| Command / proof | Result |
| --- | --- |
| `node --check .station-private/pr534a/ariadne-hosted-proof.mjs` | Pass |
| Exact-SHA ten-stage hosted operator | Pass; `PASS_PR534A_PROJECT_COLLABORATION_HOSTED_LIFECYCLE` |
| `node .station-private/pr534a/ariadne-hosted-proof.mjs verify` | Pass; zero residue, baseline/schema stable, one ledger row |
| Human-eye browser review | Pass; four private captures |
| `git diff --check` | Pass; line-ending notices only |
| `pnpm typecheck` | Not required; documentation-only tracked change |

## Baton

ARGUS should hostile-review this public-safe exact-SHA receipt and its cleanup
proof. If accepted, return PR534A to MIMIR for closeout and the next explicitly
authorized lane. No broader role, editor, team, billing, institution, owner
transfer, profile-directory, or public-surface work is implied.
