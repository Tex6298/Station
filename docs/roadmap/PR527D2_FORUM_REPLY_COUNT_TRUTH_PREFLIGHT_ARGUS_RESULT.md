# PR527D2 - Forum Reply Count Truth Boundary Preflight ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Reviewed handoff: `6cfe67f80467c37bf15b8fcbf1eac12cbb3138f3`

Verdict:

```text
ACCEPT_PR527D2_DATABASE_TRIGGER_OWNED_VISIBLE_REPLY_COUNT_WITH_TRANSACTIONAL_RECONCILIATION
```

## Decision

`threads.comment_count` must canonically mean the number of comments for that
thread whose `parent_type` is `thread`, whose `status` is `active`, and whose
`is_hidden` value is false. In product language, it is the currently
renderable reply count for any viewer already authorized to read the parent
thread.

The smallest durable repair is one database migration that:

- makes comment insert, delete, parent move, status change, and hidden-state
  change maintain the count transactionally through a database trigger;
- reconciles every existing thread from the canonical predicate in the same
  migration transaction;
- keeps `hot_score` coherent with the repaired count;
- adds a nonnegative count invariant;
- blocks callers from writing the database-owned counter directly; and
- removes public mutation authority from the current blind increment RPC.

The current RPC name may remain temporarily as a service-role-only no-op
compatibility shim so migration application cannot race an older deployed API
that still calls it. The trigger, not an application callback, owns count
integrity after migration `083`.

No read-time aggregate, thread-detail-only substitution, UI patch, hosted
write, migration application, or backfill was performed in this preflight.

## Sanitized Hosted Diagnosis

ARGUS used the accepted deployed product SHA
`ae349fc9f71c533333751a68515572a45bcff72b`. Public API reads and a Supabase
management query wrapped in `BEGIN TRANSACTION READ ONLY` / `ROLLBACK` returned
only in-memory aggregates. No id, slug, title, body, owner identity, URL,
credential, token, cookie, connection value, raw row, or raw response was
printed or retained.

Hosted totals were stable across repeated reads:

| Scope | Result |
| --- | --- |
| Forum categories returned to anonymous API read | `9` |
| Unique anonymous-listed and detail-readable threads | `6` |
| Anonymous-readable count mismatches | `1` |
| Other anonymous-readable mismatches | `0` |
| All live, non-hidden threads | `6` |
| All live, non-hidden mismatches | `1` |
| All stored threads / comments / thread-comments | `12 / 7 / 7` |
| All stored thread mismatches | `2` |

The retained PR527D fixture is the sole live mismatch:

| Stored counter | Total rows | Active | Hidden | Removed | Flagged | Viewer-visible |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `2` | `2` | `0` | `0` | `0` | `2` |

Its safe classification is active, public, document-linked, non-hidden, and
undercounted by one. The other stored mismatch is an inaccessible removed
standalone public thread with an overcount. That second row is not a visible
product defect today, but it proves that a live-only or detail-only correction
would leave restore truth broken.

Catalog readback found:

- one comments trigger, the existing updated-at trigger;
- zero reply-count triggers;
- no nonnegative `threads.comment_count` check;
- one `increment_thread_comment_count(uuid)` function that is security
  definer and performs a blind `+ 1` delta;
- execute privilege on that function for both `anon` and `authenticated`;
- table and column update privilege that lets an authenticated thread author,
  under the existing author RLS policy, submit a direct counter update; and
- authenticated direct comment write privileges, constrained by comment RLS,
  that can bypass the Station API routes.

The public security-definer increment is a data-integrity gap, not merely a
maintenance smell. Public thread ids are route material, so an anonymous
caller currently has the database privilege needed to inflate a known
thread's counter. ARGUS did not invoke it. Migration `083` must revoke this
authority and prevent direct counter writes before PR527D2 can be accepted.

## Source Path Map

### Visible-state writers

`apps/api/src/routes/comments.ts` owns the normal Station routes:

- `POST /comments` validates the parent and inserts the comment, then calls
  `increment_thread_comment_count` only for thread parents;
- the RPC is a separate transaction after the insert and is intentionally
  non-fatal;
- Supabase RPC failures normally resolve as an `{ error }` result, so the
  surrounding `try/catch` does not by itself prove success;
- `DELETE /comments/:id` soft-removes an own/admin comment without decrement;
  and
- `PATCH /comments/:id/moderation` can hide, unhide, remove, or restore without
  count maintenance.

The same moderation route serves admin and delegated subcommunity safety
actions. The reports route changes `reported_count` and `moderation_state` to
`needs_review` only; it does not itself change reply visibility.

Additional write paths are:

- authenticated direct Supabase comment insert/update/delete under author
  RLS;
- service-role or operator DML;
- `scripts/staging-replay-seed.mjs`, which directly inserts or patches a
  thread comment and never calls the increment RPC;
- profile/auth cleanup cascades that can hard-delete comments;
- document-discussion creation in `documents.ts` and
  `publishing-approval.service.ts`, which correctly starts a thread at zero
  but delegates later replies to the shared comment paths; and
- document cleanup, which tombstones the linked thread while preserving its
  comments.

The direct replay seed is a credible explanation for the live undercount
shape, but the retained hosted aggregates do not prove historical causation.
This result therefore records it as a bypass path, not as the asserted cause
of the specific row.

No checked-in migration currently inserts a thread comment. Migration `042`
updates comment authorship metadata only. The current profile-level
`community_user_profiles.comment_count` is a separate author-activity metric
and is not the thread reply counter in this lane.

### Count consumers

- `GET /threads/:id` returns stored `thread.comment_count` while separately
  loading active, non-hidden thread comments. The Forum detail page displays
  both.
- `GET /forums/categories/:slug` returns stored counts to category cards.
- The document route returns its linked discussion thread count, and the
  public document page displays it.
- Discover selects and returns stored counts, orders the rising database query
  by them, and uses them again in the client-side rising formula.
- Thread `hot_score` also embeds the stored count and drives hot category
  ordering.
- Owner export serializes the counter as `commentCount` while separately
  retaining owner-authored moderated history. Its counter must be understood
  as visible-reply count, not as the length of that private export array.
- Public persona source queries select the field but do not currently expose
  it in their serialized source/event shape.

Replacing only the thread-detail label with `comments.length` would make that
one page look correct while category, document, Discover, export metadata, and
ranking remained stale.

## Canonical Contract

For every thread row, including a hidden or removed parent that may later be
restored:

```text
comment_count = COUNT(comments)
WHERE parent_type = 'thread'
  AND parent_id = threads.id
  AND status = 'active'
  AND is_hidden = false
```

Consequences:

- removed, flagged, and hidden comments do not count;
- pin, vote, witness, report, body, authorship, and moderation-note changes do
  not change the count;
- a permitted parent move decrements the old thread and increments the new
  thread exactly once when the comment is visible;
- owner and admin thread detail use the same visible comment projection, so
  the summary is not viewer-specific;
- owner/admin moderation history and owner export may contain rows that are
  intentionally outside this visible count;
- public, unlisted, community, and private/subcommunity parent access remains
  enforced before the thread and count are returned; and
- the count reveals nothing about an unreadable parent because unreadable
  parent routes remain `404` or absent from lists.

This definition matches the noun `reply` on every visible UI surface and does
not disclose hidden or removed moderation activity.

## Repair Shape Comparison

| Shape | Assessment |
| --- | --- |
| Detail-only `comments.length` | Rejected. It masks one page and leaves category, document, Discover, export metadata, hot/rising ranking, and stored data inconsistent. |
| Read-time aggregate on every consumer | Truthful per read, but duplicates logic, complicates RLS and pagination, makes Discover sort before/after aggregation easy to get wrong, and adds recurring query cost. |
| Symmetric route/RPC maintenance | Rejected as the owner of truth. Direct RLS, seed, service-role, cascade, retry, and partial-failure paths can still bypass or double-apply it. |
| Database trigger plus reconciliation | Accepted core. It is atomic with comment state, covers all DML paths, preserves cheap reads, and can repair every historical thread once. |
| Hybrid trigger plus read/repair | Keep only a bounded operational audit and transactional migration backfill. Do not add a second per-route read aggregate or another publicly executable repair RPC. |

## Locked Implementation Boundary

MIMIR should open one DAEDALUS implementation lane around migration:

```text
infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql
apps/api/src/routes/comments.ts
apps/api/src/routes/community.test.ts
apps/api/src/routes/document-discussions.test.ts
docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

`comments.ts` is allowed only to align the compatibility-call comment and
error handling with trigger ownership. The initial deployment must not remove
the existing RPC call before migration `083` is applied; otherwise a code-
before-schema window could stop counting new replies. No web file, seed,
document route, Discover route, export route, generated database type, or
existing migration needs a behavior change.

Migration `083` must:

1. Run in one transaction under an advisory lock and verify the expected
   existing function/trigger/constraint shape before changing it.
2. Add an `AFTER INSERT OR DELETE OR UPDATE OF parent_type, parent_id,
   status, is_hidden` trigger on `comments`.
3. Apply `+1`, `-1`, or zero from old/new canonical visibility and acquire
   affected parent thread locks in deterministic order before a cross-parent
   move.
4. Treat a missing new thread parent as an integrity failure. A missing old
   parent during a hard parent cleanup may be tolerated.
5. Update `comment_count` and `hot_score` in the same thread-row statement.
   Preserve current monotonic `last_activity_at`; a newly visible reply may
   move it forward, while hide/remove/delete must not fabricate older time.
6. Use a security-definer trigger function owned by the table owner with a
   fixed `search_path`, and revoke direct execute from `PUBLIC`, `anon`, and
   `authenticated`.
7. Add a thread insert/update guard so non-owner execution contexts cannot set
   `comment_count` directly. Internal trigger/backfill execution by the table
   owner remains allowed.
8. Reconcile every thread, not only live/public rows, from the canonical
   aggregate and recompute `hot_score = score + comment_count * 0.35`.
9. Add and validate `CHECK (comment_count >= 0)` after reconciliation. Do not
   clamp a bad negative transition silently.
10. Replace the blind increment function with a no-write compatibility shim,
    revoke `PUBLIC`/`anon`/`authenticated`, grant only `service_role`, retain
    the existing signature, and document its deprecation.
11. Request PostgREST schema reload. If hosted application records migration
    history separately, add exactly one fresh honest `083` ledger row in the
    same audited operation.

The trigger failure must abort the comment mutation in the same database
transaction. Notification fanout remains after comment creation and remains
non-authoritative for count truth.

## Validation Gates

Local implementation validation must include:

```text
npx --yes pnpm@10.32.1 test:community
npx --yes pnpm@10.32.1 test:document-discussions
npx --yes pnpm@10.32.1 test:reports
npx --yes pnpm@10.32.1 --filter @station/api typecheck
git diff --check
```

Focused coverage must lock:

- migration source contains insert/delete/relevant-update trigger events,
  canonical visibility checks, deterministic parent handling, backfill,
  `hot_score` reconciliation, direct-counter guard, nonnegative constraint,
  fixed search paths, and exact privilege revocation;
- normal API create changes `0 -> 1` exactly once;
- repeated compatibility calls do not increment again;
- body/pin/vote/witness/report-only changes are zero-delta;
- hide/unhide/remove/restore and repeated same-state calls produce exact
  `-1/+1/-1/+1/0` behavior;
- own soft-delete and hard-delete decrement once;
- direct seed/service-style insert and parent movement are covered;
- failed or rolled-back comment writes leave both row and count unchanged;
- document-linked, standalone, public, community, and hidden/removed parent
  cases retain their access boundaries; and
- category, thread detail, document discussion, and Discover consume the same
  repaired stored value without a route-local substitute.

ARGUS's preflight baseline passes:

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `50/50` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |

## Hosted Proof Gate

After ARGUS reviews the implementation, hosted proof must:

1. Confirm exact web/API SHA, readiness, migration absence, current catalog
   preconditions, and sanitized pre-migration aggregates.
2. Apply only exact migration `083` in one locked transaction; abort and roll
   back on any precondition or statement failure.
3. Prove all `12` existing thread counters equal the canonical aggregate after
   reconciliation. The retained live fixture must become `2`, and the removed
   standalone overcount must also reconcile without exposing either row.
4. Prove the count trigger and guard are enabled, the check is validated, the
   blind delta body is gone, and anon/authenticated can neither execute the
   shim nor update the counter directly.
5. Use a bounded public-safe disposable standalone thread to prove API create,
   direct service-style insert, hide, repeated hide, unhide, remove, restore,
   own delete, hard delete, repeated shim call, and rollback behavior.
6. Read the disposable count consistently through detail, category, and
   Discover rising; read the corrected existing document-linked count through
   its document entrypoint and thread detail.
7. Clean all disposable comments, thread, profile/auth, notifications, votes,
   witnesses, reports, and related rows in `finally`, then prove zero tagged
   residue and restored global row baselines. The migration, ledger row, and
   intended counter/hot-score reconciliation are expected durable changes,
   not fixture residue.
8. Retain only aggregate evidence. No id, body, identity, credential, token,
   cookie, connection value, SQL response, or secret-shaped value may enter
   logs or docs.

A post-commit rollback packet must be prepared before execution: disable/drop
the new triggers and constraint and restore the prior RPC definition and
grants through an audited transaction if the migration itself causes a
regression. Corrected counter values need not be corrupted again during a
rollback.

## Frozen Scope

PR527D2 must not change reply bodies, status vocabulary, thread visibility,
subcommunity policy, owner/admin access, RLS row ownership, Watch, vote,
witness, report, notification, document lifecycle, UI copy or CSS, auth,
billing, queues, Cloudflare, hosted adapters, seed content, or PR527E.

`community_user_profiles.comment_count`, document comment behavior, owner
export retention, and broader score/vote integrity remain separate. This lane
only makes the thread's visible-reply counter and its count-derived hot score
truthful.

## Claim Boundary

The hosted mismatch and catalog gaps are proven. The historical operation that
created each mismatch is not. ARGUS sent zero hosted writes, invoked no RPC,
changed no row, and applied no migration or backfill. The temporary browser
profile and read-only probe were deleted before this result was written.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the read-only PR527D2 Forum reply-count truth preflight.
- The sole live mismatch is stored 1 versus 2 active, non-hidden replies; a removed thread is also historically overcounted.
- Database trigger ownership plus full transactional reconciliation is the smallest durable repair, and the public blind RPC/direct counter-write gaps must close in the same migration.
Verdict:
- ACCEPT_PR527D2_DATABASE_TRIGGER_OWNED_VISIBLE_REPLY_COUNT_WITH_TRANSACTIONAL_RECONCILIATION
Task:
- Open the locked migration 083 implementation lane for DAEDALUS, then return it to ARGUS before any hosted mutation.
```
