-- ============================================================
-- STORAGE USAGE AND SERVER-SIDE QUOTA ENFORCEMENT
-- ============================================================

create or replace function public.storage_limit_bytes_for_tier(tier_name text)
returns bigint
language sql
immutable
as $$
  select case tier_name
    when 'private' then 5::bigint * 1024 * 1024 * 1024
    when 'creator' then 50::bigint * 1024 * 1024 * 1024
    when 'canon' then 200::bigint * 1024 * 1024 * 1024
    when 'institutional' then 200::bigint * 1024 * 1024 * 1024
    else 0
  end
$$;

create table if not exists public.storage_usage (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  bytes_used bigint not null default 0 check (bytes_used >= 0),
  bytes_limit bigint not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_storage_usage_updated_at
  on public.storage_usage (updated_at desc);

alter table public.storage_usage enable row level security;

drop policy if exists "storage_usage_all_owner" on public.storage_usage;
create policy "storage_usage_all_owner" on public.storage_usage
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.storage_usage (user_id, bytes_limit)
select id, public.storage_limit_bytes_for_tier(tier)
from public.profiles
on conflict (user_id) do update
set bytes_limit = excluded.bytes_limit,
    updated_at = now();

create or replace function public.sync_storage_usage_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.storage_usage (user_id, bytes_limit)
  values (new.id, public.storage_limit_bytes_for_tier(new.tier))
  on conflict (user_id) do update
  set bytes_limit = public.storage_limit_bytes_for_tier(new.tier),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_storage_usage_limit on public.profiles;
create trigger trg_profiles_storage_usage_limit
  after insert or update of tier on public.profiles
  for each row execute function public.sync_storage_usage_limit();

create or replace function public.reserve_storage_bytes(p_user_id uuid, p_bytes bigint)
returns public.storage_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.storage_usage;
begin
  if p_bytes < 0 then
    raise exception 'Storage byte reservation must be non-negative.';
  end if;

  insert into public.storage_usage (user_id, bytes_limit)
  select p_user_id, public.storage_limit_bytes_for_tier(coalesce(p.tier, 'visitor'))
  from public.profiles p
  where p.id = p_user_id
  on conflict (user_id) do nothing;

  update public.storage_usage
  set bytes_used = bytes_used + p_bytes,
      updated_at = now()
  where user_id = p_user_id
    and bytes_used + p_bytes <= bytes_limit
  returning * into updated;

  if updated.user_id is null then
    raise exception 'Storage Limit Reached' using errcode = 'P0001';
  end if;

  return updated;
end;
$$;

create or replace function public.release_storage_bytes(p_user_id uuid, p_bytes bigint)
returns public.storage_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.storage_usage;
begin
  if p_bytes < 0 then
    raise exception 'Storage byte release must be non-negative.';
  end if;

  update public.storage_usage
  set bytes_used = greatest(0, bytes_used - p_bytes),
      updated_at = now()
  where user_id = p_user_id
  returning * into updated;

  return updated;
end;
$$;
