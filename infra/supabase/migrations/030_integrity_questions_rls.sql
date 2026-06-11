-- ============================================================
-- INTEGRITY QUESTIONS RLS
-- ============================================================
--
-- integrity_questions is seeded question-bank/config data. Active rows are
-- readable by clients; writes remain service-role or migration-only.

alter table public.integrity_questions enable row level security;

drop policy if exists "integrity_questions_select_active_anon" on public.integrity_questions;
create policy "integrity_questions_select_active_anon"
  on public.integrity_questions
  for select
  to anon
  using (active = true);

drop policy if exists "integrity_questions_select_active_authenticated" on public.integrity_questions;
create policy "integrity_questions_select_active_authenticated"
  on public.integrity_questions
  for select
  to authenticated
  using (active = true);

comment on table public.integrity_questions is
  'Seeded Integrity Session question-bank/config data. Active rows are readable by clients; writes are service-role or migration-only.';
