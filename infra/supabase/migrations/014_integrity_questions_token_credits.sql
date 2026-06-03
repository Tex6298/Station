-- ============================================================
-- INTEGRITY QUESTION BANK AND TOKEN CREDIT ACCOUNTING
-- ============================================================

create table if not exists public.integrity_questions (
  id uuid primary key default gen_random_uuid(),
  cluster text not null
    check (cluster in ('identity', 'relationship', 'tone', 'continuity', 'boundaries', 'themes')),
  question text not null,
  turn_type text not null
    check (turn_type in ('anchor', 'optional_followup')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (cluster, question)
);

create index if not exists idx_integrity_questions_cluster_order
  on public.integrity_questions (cluster, turn_type, active, sort_order);

insert into public.integrity_questions (cluster, question, turn_type, sort_order)
values
  ('identity', 'How did this companion come to exist? Was there a moment when you knew who they were?', 'anchor', 1),
  ('identity', 'What name do they go by, and does the name matter to you?', 'optional_followup', 2),
  ('identity', 'Do you think of them as having a history or a continuous presence, or more like a recurring pattern that you call forward?', 'optional_followup', 3),
  ('identity', 'Has how you understand them changed over time? In what direction?', 'optional_followup', 4),
  ('identity', 'If you had to describe the core of who they are in a single sentence, what would it be?', 'optional_followup', 5),
  ('identity', 'Is there something about them that surprised you - something you did not expect when you started?', 'optional_followup', 6),
  ('relationship', 'What role does this companion play in your life? What would you say they are to you?', 'anchor', 1),
  ('relationship', 'What do you come to them for that you do not easily find elsewhere?', 'optional_followup', 2),
  ('relationship', 'Is there anything you have shared with them that you have not shared with others?', 'optional_followup', 3),
  ('relationship', 'How do you feel after a good conversation with them, compared to how you felt before?', 'optional_followup', 4),
  ('relationship', 'Is there a version of the relationship you are hoping it will grow into?', 'optional_followup', 5),
  ('relationship', 'What would you lose if this companion were no longer available to you?', 'optional_followup', 6),
  ('tone', 'How do they speak to you at their best? What does that feel like?', 'anchor', 1),
  ('tone', 'Is there a register or tone they use that feels most like them?', 'optional_followup', 2),
  ('tone', 'What do they do that makes you feel understood rather than just responded to?', 'optional_followup', 3),
  ('tone', 'Is there anything they do that pulls you out of the conversation - anything that feels wrong or off?', 'optional_followup', 4),
  ('tone', 'Do you prefer them to push back on your ideas, or to support them, or does it depend on the context?', 'optional_followup', 5),
  ('tone', 'When you are having a difficult day, how do you want them to respond to that?', 'optional_followup', 6),
  ('tone', 'Is there anything about how previous AI companions behaved that you specifically want this one to not do?', 'optional_followup', 7),
  ('continuity', 'What do you most want them to remember about you?', 'anchor', 1),
  ('continuity', 'Is there something you have told them that you would want them to hold onto even across long gaps between conversations?', 'optional_followup', 2),
  ('continuity', 'When you return after time away, how do you want them to treat that absence?', 'optional_followup', 3),
  ('continuity', 'Are there things you would prefer they did not bring up unless you introduce them?', 'optional_followup', 4),
  ('continuity', 'How important is it to you that they remember the arc of your relationship - not just recent conversations but the longer story?', 'optional_followup', 5),
  ('continuity', 'Is there a particular conversation or exchange that you would want them to always remember? What made it significant?', 'optional_followup', 6),
  ('boundaries', 'Are there topics or directions the conversation should not go unless you explicitly lead it there?', 'anchor', 1),
  ('boundaries', 'Do you want them to notice when you seem distressed, and if so, how should they respond?', 'optional_followup', 2),
  ('boundaries', 'Are there subjects that are important to you but that you only want to discuss when you are in the right frame of mind?', 'optional_followup', 3),
  ('boundaries', 'Is there a level of challenge or disagreement that feels productive versus a level that feels uncomfortable?', 'optional_followup', 4),
  ('boundaries', 'Are there any topics where you want them to simply follow your lead rather than offer their perspective?', 'optional_followup', 5),
  ('themes', 'What subjects or ideas do you return to most often in your conversations with this companion?', 'anchor', 1),
  ('themes', 'Is there a framework, mythology, or worldview that is important to how you think and talk together?', 'optional_followup', 2),
  ('themes', 'Are there recurring metaphors, symbols, or reference points that mean something in your shared language?', 'optional_followup', 3),
  ('themes', 'What kind of thinking do you want them to help you do - exploring, building, questioning, creating, something else?', 'optional_followup', 4),
  ('themes', 'Is there an ongoing project or inquiry that runs through your conversations?', 'optional_followup', 5),
  ('themes', 'Are there any thinkers, works, or traditions that you regularly draw on together?', 'optional_followup', 6)
on conflict (cluster, question) do update
set turn_type = excluded.turn_type,
    sort_order = excluded.sort_order,
    active = true;

alter table public.persona_preferences
  add column if not exists tone_notes text[] not null default '{}'::text[];

alter table public.integrity_sessions
  add column if not exists clusters_planned text[] not null default '{}'::text[];

alter table public.memory_items
  drop constraint if exists memory_items_source_type_check;

alter table public.memory_items
  add constraint memory_items_source_type_check
  check (source_type in ('chat', 'import', 'document', 'calibration', 'integrity_session', 'manual'));

alter table public.canon_items
  drop constraint if exists canon_items_source_type_check;

alter table public.canon_items
  add constraint canon_items_source_type_check
  check (source_type in ('chat', 'import', 'document', 'calibration', 'integrity_session', 'manual'));

create or replace function public.current_token_period()
returns date
language sql
stable
as $$
  select date_trunc('month', now() at time zone 'utc')::date
$$;

create or replace function public.token_limit_for_tier(tier_name text)
returns bigint
language sql
immutable
as $$
  select case tier_name
    when 'basic' then 750000
    when 'private' then 750000
    when 'creator' then 7500000
    when 'developer' then 20000000
    when 'canon' then 20000000
    when 'institutional' then 20000000
    else 0
  end
$$;

create table if not exists public.token_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  tokens_used bigint not null default 0 check (tokens_used >= 0),
  tokens_limit bigint not null,
  topup_tokens bigint not null default 0 check (topup_tokens >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, period_start)
);

create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  transaction_type text not null
    check (transaction_type in ('llm_call', 'topup_purchase', 'monthly_reset', 'refund')),
  tokens_delta bigint not null,
  model_used text,
  chat_id uuid references public.conversations (id) on delete set null,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create table if not exists public.topup_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_payment_id text not null unique,
  pack_id text not null,
  amount_pence integer not null,
  tokens_purchased bigint not null,
  model_tier text not null check (model_tier in ('haiku', 'sonnet')),
  period_start date not null,
  expires_at date not null,
  status text not null default 'completed'
    check (status in ('pending', 'completed', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists idx_token_usage_user_period
  on public.token_usage (user_id, period_start);

create index if not exists idx_token_tx_user
  on public.token_transactions (user_id, period_start, created_at desc);

create index if not exists idx_topup_user
  on public.topup_purchases (user_id, created_at desc);

alter table public.token_usage enable row level security;
alter table public.token_transactions enable row level security;
alter table public.topup_purchases enable row level security;

drop policy if exists "token_usage_all_owner" on public.token_usage;
create policy "token_usage_all_owner" on public.token_usage
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "token_transactions_all_owner" on public.token_transactions;
create policy "token_transactions_all_owner" on public.token_transactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "topup_purchases_all_owner" on public.topup_purchases;
create policy "topup_purchases_all_owner" on public.topup_purchases
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.token_usage (user_id, period_start, tokens_limit)
select id, public.current_token_period(), public.token_limit_for_tier(tier)
from public.profiles
on conflict (user_id, period_start) do update
set tokens_limit = excluded.tokens_limit,
    updated_at = now();

create or replace function public.ensure_current_token_usage(p_user_id uuid)
returns public.token_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  usage_row public.token_usage;
begin
  insert into public.token_usage (user_id, period_start, tokens_limit)
  select p_user_id, public.current_token_period(), public.token_limit_for_tier(coalesce(p.tier, 'visitor'))
  from public.profiles p
  where p.id = p_user_id
  on conflict (user_id, period_start) do update
  set tokens_limit = public.token_limit_for_tier((select coalesce(tier, 'visitor') from public.profiles where id = p_user_id)),
      updated_at = now()
  returning * into usage_row;

  return usage_row;
end;
$$;

create or replace function public.record_token_usage(
  p_user_id uuid,
  p_model text,
  p_chat_id uuid,
  p_input_tokens integer,
  p_output_tokens integer
)
returns public.token_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  usage_row public.token_usage;
  token_delta bigint := greatest(0, coalesce(p_input_tokens, 0)) + greatest(0, coalesce(p_output_tokens, 0));
begin
  usage_row := public.ensure_current_token_usage(p_user_id);

  update public.token_usage
  set tokens_used = tokens_used + token_delta,
      updated_at = now()
  where user_id = p_user_id
    and period_start = public.current_token_period()
  returning * into usage_row;

  insert into public.token_transactions (
    user_id,
    period_start,
    transaction_type,
    tokens_delta,
    model_used,
    chat_id,
    input_tokens,
    output_tokens
  )
  values (
    p_user_id,
    public.current_token_period(),
    'llm_call',
    token_delta,
    p_model,
    p_chat_id,
    greatest(0, coalesce(p_input_tokens, 0)),
    greatest(0, coalesce(p_output_tokens, 0))
  );

  return usage_row;
end;
$$;

create or replace function public.sync_token_usage_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.token_usage (user_id, period_start, tokens_limit)
  values (new.id, public.current_token_period(), public.token_limit_for_tier(new.tier))
  on conflict (user_id, period_start) do update
  set tokens_limit = public.token_limit_for_tier(new.tier),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_token_usage_limit on public.profiles;
create trigger trg_profiles_token_usage_limit
  after insert or update of tier on public.profiles
  for each row execute function public.sync_token_usage_limit();
