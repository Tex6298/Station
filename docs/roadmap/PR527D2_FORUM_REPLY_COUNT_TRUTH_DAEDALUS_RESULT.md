# PR527D2 - Forum Reply Count Truth DAEDALUS Result

Owner: DAEDALUS / A2

Date: 2026-07-15

Result:

```text
READY_PR527D2_DATABASE_TRIGGER_OWNED_VISIBLE_REPLY_COUNT_FOR_ARGUS
```

## Scope

Changed files:

- `infra/supabase/migrations/083_forum_visible_reply_count_integrity.sql`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/api/src/routes/document-discussions.test.ts`

Docs updated:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

No migration was applied. No hosted database, API, Railway, Supabase, product
data, fixture, or counter was mutated.

## Migration Contract

Migration `083_forum_visible_reply_count_integrity.sql` runs in one explicit
transaction under an advisory lock. It fails closed if the expected pre-083
shape is absent:

- `public.increment_thread_comment_count(uuid)` exists and has the blind
  `comment_count = comment_count + 1` shape;
- `public.comments` and `public.threads` exist;
- existing `trg_comments_updated_at` exists;
- the new visible-reply trigger is not already present; and
- the new nonnegative constraint is not already present.

Objects added or replaced:

- `idx_comments_thread_visible_reply_count`
- `forum_comment_counts_as_visible_reply(text, text, boolean)`
- `apply_thread_visible_reply_count_delta(uuid, integer, timestamptz, boolean)`
- `sync_thread_visible_reply_count_from_comments()`
- `trg_comments_visible_reply_count`
- `prevent_direct_thread_comment_count_write()`
- `trg_threads_comment_count_direct_write_guard`
- `threads_comment_count_nonnegative_check`
- deprecated service-role-only `increment_thread_comment_count(uuid)` shim

Privileges:

- helper/trigger functions revoke direct execution from `PUBLIC`, `anon`, and
  `authenticated`;
- the compatibility shim revokes `PUBLIC`, `anon`, and `authenticated`;
- only `service_role` is granted execute on the compatibility shim.

Schema reload:

- migration issues `notify pgrst, 'reload schema';`

## Transition Table

Canonical visible reply predicate:

```text
parent_type = 'thread'
status = 'active'
is_hidden = false
```

| Transition | Counter effect |
| --- | --- |
| insert visible thread comment | `+1`; may advance `last_activity_at` to comment `created_at` |
| insert non-thread/non-active/hidden comment | `0` |
| delete visible old thread comment | `-1`; no activity fabrication |
| delete non-visible old comment | `0` |
| update body, pin, vote, witness, report-only fields | `0` because trigger fires only on parent/type/status/hidden columns |
| active visible -> hidden/removed/flagged/non-thread | `-1` |
| hidden/removed/flagged/non-thread -> active visible | `+1`; may advance `last_activity_at` |
| visible parent move old thread -> new thread | deterministic parent lock order, then old `-1`, new `+1` |
| same visible parent state repeated | `0` |
| missing new thread parent | transaction aborts with integrity error |
| missing old parent during hard cleanup | tolerated for the decrement side |
| negative transition | transaction aborts; no clamping |

`comment_count` and `hot_score = score + comment_count * 0.35` update together.

## Reconciliation

The migration reconciles every existing thread, including hidden or removed
parents, from the canonical aggregate:

```text
count(comments.id)
where parent_type = 'thread'
  and parent_id = threads.id
  and status = 'active'
  and is_hidden = false
```

It recomputes `hot_score` from stored `score` and the reconciled visible reply
count, then adds and validates `CHECK (comment_count >= 0)`.

## API Compatibility Boundary

`comments.ts` keeps the existing `increment_thread_comment_count` call for
thread parents:

- before migration `083`, the old RPC still increments;
- after migration `083`, the trigger owns truth and the service-role-only shim
  is a no-op; and
- the call remains non-fatal during the deployment compatibility window.

No route-local counter math, read-time substitute, public repair RPC, UI
substitution, or count consumer change was added.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `51/51` |
| `npx --yes pnpm@10.32.1 test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:reports` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

Focused static coverage locks the migration source for:

- transaction and advisory lock;
- pre-083 function/trigger/constraint shape checks;
- exact trigger events;
- canonical visibility predicate;
- deterministic cross-parent locking;
- delta application for insert/delete/move/status/hidden transitions;
- `hot_score` and `last_activity_at` rules;
- direct counter write guard;
- nonnegative check;
- deprecated compatibility shim;
- privilege revocation/grant shape;
- schema reload; and
- no local migration ledger insertion.

Document discussion coverage now asserts the retained compatibility bridge
still increments the linked discussion thread count in the local pre-083 mock.

## Static Versus Dynamic Proof Boundary

Local tests lock SQL source and API compatibility behavior only. They do not
claim the PostgreSQL trigger executed. Dynamic trigger/backfill/direct-write
proof belongs to ARGUS review and the later audited hosted migration gate.

## Rollback Packet For Later Hosted Use

If migration `083` regresses after hosted application, use one audited
transaction. Do not deliberately corrupt reconciled counter values.

```sql
begin;
select pg_advisory_xact_lock(hashtextextended('station.pr527d2.visible_reply_count.083.rollback', 0));

drop trigger if exists trg_comments_visible_reply_count on public.comments;
drop trigger if exists trg_threads_comment_count_direct_write_guard on public.threads;

alter table public.threads
  drop constraint if exists threads_comment_count_nonnegative_check;

drop function if exists public.sync_thread_visible_reply_count_from_comments();
drop function if exists public.apply_thread_visible_reply_count_delta(uuid, integer, timestamptz, boolean);
drop function if exists public.prevent_direct_thread_comment_count_write();
drop function if exists public.forum_comment_counts_as_visible_reply(text, text, boolean);

create or replace function public.increment_thread_comment_count(thread_id uuid)
returns void
language sql
security definer
as $$
  update public.threads
  set
    comment_count = comment_count + 1,
    last_activity_at = now(),
    hot_score = score + ((comment_count + 1) * 0.35)
  where id = thread_id;
$$;

revoke all on function public.increment_thread_comment_count(uuid) from public, anon, authenticated;
grant execute on function public.increment_thread_comment_count(uuid) to service_role;

notify pgrst, 'reload schema';
commit;
```

## Checks

Hosted mutation count: `0`

Secret/credential/connection print count: `0`

Scope check: no web files, Discover/export/document route count substitutes,
generated DB types, seed data, package files, lockfiles, or hosted migration
ledger rows changed.
