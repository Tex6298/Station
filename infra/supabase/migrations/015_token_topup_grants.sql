-- ============================================================
-- TOKEN TOP-UP GRANTS FROM VERIFIED STRIPE WEBHOOKS
-- ============================================================

create or replace function public.grant_topup_purchase(
  p_user_id uuid,
  p_stripe_payment_id text,
  p_pack_id text,
  p_amount_pence integer,
  p_tokens_purchased bigint,
  p_model_tier text
)
returns public.token_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  usage_row public.token_usage;
  period date := public.current_token_period();
  expiry date := (date_trunc('month', now() at time zone 'utc') + interval '1 month')::date;
  inserted_count integer := 0;
begin
  usage_row := public.ensure_current_token_usage(p_user_id);

  insert into public.topup_purchases (
    user_id,
    stripe_payment_id,
    pack_id,
    amount_pence,
    tokens_purchased,
    model_tier,
    period_start,
    expires_at,
    status
  )
  values (
    p_user_id,
    p_stripe_payment_id,
    p_pack_id,
    p_amount_pence,
    p_tokens_purchased,
    p_model_tier,
    period,
    expiry,
    'completed'
  )
  on conflict (stripe_payment_id) do nothing;

  get diagnostics inserted_count = row_count;

  if inserted_count > 0 then
    update public.token_usage
    set topup_tokens = topup_tokens + p_tokens_purchased,
        updated_at = now()
    where user_id = p_user_id
      and period_start = period
    returning * into usage_row;

    insert into public.token_transactions (
      user_id,
      period_start,
      transaction_type,
      tokens_delta,
      model_used
    )
    values (
      p_user_id,
      period,
      'topup_purchase',
      p_tokens_purchased,
      p_model_tier
    );
  end if;

  return usage_row;
end;
$$;
