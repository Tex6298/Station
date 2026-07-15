# PR527D2B - Forum Reply Count Hosted Migration Proof DAEDALUS Result

Owner: DAEDALUS / A2

Date: 2026-07-15

Result:

```text
READY_PR527D2B_EXACT_MIGRATION_083_HOSTED_PROOF_FOR_ARGUS
```

## Deployment Anchor

Railway API and web health returned `200`. The API deployment readiness endpoint
reported ready on `main` at deployed SHA prefix `da105cf0`. The deployed SHA
contains accepted review commit `da105cf077b224abfa2a3e48e0cc00b52bd34455`.

Locked source drift check from the accepted review commit to deployed SHA:

```text
infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql
apps/api/src/routes/comments.ts
apps/api/src/routes/community.test.ts
apps/api/src/routes/document-discussions.test.ts
```

Result: `0` changed locked files.

Migration hash recomputed locally:

```text
DA4BBF4021723768F9DCEC41E0AD91C6FA4D909BAE17012B72FDF0462907C44B
```

The API, web, Supabase, and database targets were confirmed configured,
hosted, HTTPS where applicable, and non-local. No URLs, credentials, tokens,
cookies, connection strings, row ids, identities, or bodies are recorded here.

## Preflight

Read-only hosted preflight passed:

| Check | Result |
| --- | --- |
| Migration `083` ledger rows before apply | `0` |
| New visible-reply trigger before apply | absent |
| New direct-counter guard trigger before apply | absent |
| New nonnegative constraint before apply | absent |
| New helper functions before apply | absent |
| Legacy `increment_thread_comment_count(uuid)` blind shape | present |
| `public.comments` / `public.threads` | present |
| Shared table owner and migration owner context | pass |
| Existing comments updated-at trigger | present |
| Migration hash | matched authorized hash |

Canonical aggregate before apply:

| Metric | Count |
| --- | ---: |
| Total threads | `12` |
| Matching threads | `10` |
| Mismatched threads | `2` |
| Undercount threads / delta | `1 / 1` |
| Overcount threads / delta | `1 / 1` |

## Hosted Apply

The exact checked-in migration bytes were applied through the hosted pooler in
one transaction. After schema postcheck passed, one hosted ledger row was
inserted into `supabase_migrations.schema_migrations` with name
`083_forum_visible_reply_count_integrity` and version prefix `20260715`.

Post-apply durable state:

| Check | Result |
| --- | --- |
| Migration transaction | pass |
| Ledger rows named `083_forum_visible_reply_count_integrity` | `1` |
| Visible-reply trigger | present |
| Direct-counter guard trigger | present |
| Nonnegative constraint | present and validated |
| Helper/shim functions | present |
| Function owner context | table-owner context |
| Fixed search path | pass for all migration functions |
| Internal helper execute revoked from `PUBLIC`, `anon`, `authenticated` | pass |
| Compatibility shim execute | service-role only |
| Compatibility shim no-write check | pass |

Post-apply aggregate:

| Metric | Count |
| --- | ---: |
| Total threads | `12` |
| Matching threads | `12` |
| Counter mismatches | `0` |
| Hot-score mismatches | `0` |
| Canonical visible replies | `6` |

The prior aggregate mismatch shape reconciled from one undercount and one
overcount to zero mismatches. No existing product row was hand-edited.

## Disposable Lifecycle

One uniquely tagged disposable beta user/profile and one public-safe standalone
Forum fixture were created and removed in `finally`. The profile was promoted
only to the minimum tier needed to exercise the authenticated comment route.

All lifecycle checks passed:

| Transition | Stored/canonical count |
| --- | --- |
| Initial standalone thread | `0 / 0` |
| Route-created visible reply | `1 / 1` |
| Direct service-role visible reply | `2 / 2` |
| Hide | `1 / 1` |
| Repeated hide | `1 / 1` |
| Unhide | `2 / 2` |
| Repeated unhide | `2 / 2` |
| Remove | `1 / 1` |
| Restore | `2 / 2` |
| Owner soft delete through API | `1 / 1` |
| Hard delete | `0 / 0` |
| Repeated compatibility shim | `0 / 0` |
| Failed mutation rollback | comment and counter rolled back |

Every lifecycle count also had matching count-derived hot score.

Rollback-only trusted-activity adversary check passed: a direct reply with a
caller-supplied far-future `created_at` advanced parent activity only to a
trusted database time, hide/unhide update replay did not create a future pin,
and the rollback left zero probe residue.

## Cross-Surface Readback

While the disposable fixture had one final visible reply:

| Surface | Result |
| --- | --- |
| Forum thread detail | `200`, count `1`, one visible comment |
| Forum category listing | `200`, fixture found, count `1` |
| Discover rising feed | `200`, fixture found, count `1` |
| Discover search | `200`, fixture found; this endpoint does not expose a reply-count field |

The existing public document-linked discussion sample also matched through the
document discussion endpoint and Forum thread detail:

| Surface | Count |
| --- | ---: |
| Database stored count | `2` |
| Database canonical count | `2` |
| `/documents/:id/discussion` linked thread | `2` |
| `/threads/:id` linked thread | `2` |

## Cleanup

Cleanup ran in `finally`.

Tagged residue after cleanup:

| Area | Count |
| --- | ---: |
| Auth users | `0` |
| Auth sessions | `0` |
| Auth refresh tokens | `0` |
| Profiles | `0` |
| Threads | `0` |
| Comments | `0` |
| Notifications | `0` |
| Reports | `0` |

Global aggregate after cleanup:

| Check | Count |
| --- | ---: |
| Counter mismatches | `0` |
| Hot-score mismatches | `0` |

The only intended durable hosted changes are migration `083` objects, one
ledger row, and reconciled canonical counters/hot scores.

## Scope And Hygiene

Committed files are limited to this result and roadmap/testing status docs.
No product source, config, package, lockfile, UI, route, RLS, seed, generated
type, Railway config, or unrelated PR527 file changed.

Temporary `pg@8.13.1` tooling was installed under the system temp directory and
removed before this result was written.

Secret/credential/connection print count: `0`.
