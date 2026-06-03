-- ============================================================
-- MONTHLY TOKEN RESET JOB HELPER
-- ============================================================

create or replace function public.run_monthly_token_reset()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  period date := public.current_token_period();
  inserted_count integer := 0;
begin
  insert into public.token_usage (user_id, period_start, tokens_used, tokens_limit, topup_tokens)
  select p.id, period, 0, public.token_limit_for_tier(coalesce(p.tier, 'visitor')), 0
  from public.profiles p
  on conflict (user_id, period_start) do update
  set tokens_limit = public.token_limit_for_tier((select coalesce(tier, 'visitor') from public.profiles where id = token_usage.user_id)),
      updated_at = now();

  get diagnostics inserted_count = row_count;

  insert into public.token_transactions (
    user_id,
    period_start,
    transaction_type,
    tokens_delta,
    model_used
  )
  select p.id, period, 'monthly_reset', 0, null
  from public.profiles p
  where not exists (
    select 1
    from public.token_transactions tx
    where tx.user_id = p.id
      and tx.period_start = period
      and tx.transaction_type = 'monthly_reset'
  );

  return jsonb_build_object(
    'period_start', period,
    'usage_rows_touched', inserted_count
  );
end;
$$;
