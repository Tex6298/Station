-- ============================================================
-- Moderation report idempotency
-- ============================================================
--
-- Repeated taps of the same Report control should not create multiple active
-- moderation rows or inflate export readbacks. Keep the earliest active report
-- for a reporter/target/reason and dismiss active duplicates before adding the
-- active uniqueness guard.

with ranked_active_reports as (
  select
    id,
    row_number() over (
      partition by reporter_id, target_type, target_id, reason
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.moderation_reports
  where status in ('open', 'reviewing')
)
update public.moderation_reports report
set
  status = 'dismissed',
  updated_at = now()
from ranked_active_reports ranked
where report.id = ranked.id
  and ranked.duplicate_rank > 1;

create unique index if not exists idx_moderation_reports_active_unique
  on public.moderation_reports (reporter_id, target_type, target_id, reason)
  where status in ('open', 'reviewing');

comment on index public.idx_moderation_reports_active_unique is
  'Prevents duplicate active moderation reports from the same reporter for the same target and reason.';
