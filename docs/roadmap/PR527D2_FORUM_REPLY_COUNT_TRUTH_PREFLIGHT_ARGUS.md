# PR527D2 - Forum Reply Count Truth Boundary Preflight

Owner: MIMIR / A1 -> ARGUS / A3 -> MIMIR / A1 -> DAEDALUS / A2 -> ARGUS / A3 -> MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
PREFLIGHT_PR527D2_FORUM_REPLY_COUNT_TRUTH_BOUNDARY
```

## Product Problem

ARIADNE's exact-SHA hosted PR527D rehearsal found a real public-safe thread
whose summary said `1 reply` while two visible replies rendered. The later
PR527D1 rerun saw the same safe fixture and retained the discrepancy without
mutation.

The source contract already shows a systemic drift risk:

- `GET /threads/:id` returns the denormalized `threads.comment_count` while
  separately loading comments filtered to `parent_type=thread`, matching
  parent id, `status=active`, and `is_hidden=false`;
- thread detail renders the summary from `thread.comment_count` but renders
  replies from that filtered comments array;
- comment creation inserts first, then calls
  `increment_thread_comment_count` as a caught, non-fatal best-effort RPC;
- own-comment deletion marks the comment removed without decrementing or
  reconciling the thread counter; and
- comment hide, unhide, remove, and restore also alter visible-count truth
  without symmetric counter maintenance.

Category and Discover surfaces also consume `comment_count`, so replacing the
thread-detail label with `comments.length` alone could hide one symptom while
leaving ranking and public summaries stale.

## Read-Only Preflight Questions

ARGUS must answer with sanitized evidence:

1. For the existing hosted fixture, what are the stored thread counter, total
   thread-comment rows, active rows, hidden rows, removed rows, and exact
   viewer-visible row count? Record counts only, never ids, bodies, owner
   identity, or raw responses.
2. Is the mismatch isolated or are other readable threads inconsistent?
   Return only aggregate mismatch totals and safe classifications.
3. Which API, moderation, document-discussion, seed/migration, cleanup, and
   direct service paths can create or change a thread comment's visible state?
4. What should `comment_count` canonically mean: all historical comments,
   active comments, or currently public/viewer-visible replies? Reconcile that
   definition with category lists, thread detail, Discover display/ranking,
   owner/admin visibility, hidden/removed comments, and private/community
   threads.
5. Compare at least these repair shapes:
   - detail-only derivation from returned comments;
   - read-time aggregate counts on every consuming route;
   - symmetric application/RPC counter maintenance plus reconciliation;
   - database trigger-owned counter maintenance plus reconciliation; and
   - a hybrid write-integrity plus read/repair strategy.
6. Recommend the smallest durable implementation lane, including migration or
   no-migration choice, one-time reconciliation/backfill policy, concurrency
   behavior, failure semantics, performance, RLS/service-role boundary,
   rollback, tests, and exact hosted zero-residue proof.

Do not choose a solution merely because it changes the fewest lines. The
recommendation must prevent detail, category, and Discover from disagreeing
again under create, delete, hide, unhide, remove, restore, retries, and partial
failures.

## Authorization Boundary

This preflight is read-only. ARGUS may inspect source, tests, migrations,
public deployment identity, safe API response shapes, migration/function
readback, and sanitized hosted aggregate counts.

ARGUS must not:

- create, edit, hide, restore, remove, delete, or backfill a comment/thread;
- invoke a write RPC or repair the hosted counter;
- change product code, CSS, tests, schema, migrations, seed data, config, or
  fixtures;
- expose an id, body, owner identity, credential, token, cookie, connection
  string, raw response, or secret-shaped value; or
- fold PR527E Persona Profile work into this lane.

## Repo Allow-List

ARGUS may commit only:

```text
docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_PREFLIGHT_ARGUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARGUS.json
```

## Required Result And Handoff

Create:

```text
docs/roadmap/PR527D2_FORUM_REPLY_COUNT_TRUTH_PREFLIGHT_ARGUS_RESULT.md
```

Return exactly one verdict:

```text
ACCEPT_PR527D2_<EXACT_RECOMMENDED_REPLY_COUNT_CONTRACT_AND_REPAIR_SHAPE>
BLOCK_PR527D2_<EXACT_EVIDENCE_OR_DEPENDENCY>
```

Record the sanitized hosted diagnosis, full source-path map, canonical count
definition, option tradeoffs, recommended implementation allow-list,
validation and hosted rehearsal gates, and explicit frozen scope. Commit the
result and wake MIMIR. Do not implement and do not go idle without the
committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the read-only PR527D2 Forum reply-count truth preflight.
Verdict:
- <exact accepted contract/repair shape or blocker>
Task:
- Open the smallest durable implementation lane for DAEDALUS, or resolve the exact blocker.
```
