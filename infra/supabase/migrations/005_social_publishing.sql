-- ============================================================
-- Social Publishing — connections + post history
-- ============================================================

create table public.social_connections (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  platform      text not null check (platform in (
                  'bluesky', 'mastodon', 'tumblr',
                  'linkedin', 'wordpress', 'ghost', 'reddit'
                )),
  handle        text,            -- human-readable label shown in UI
  access_token  text,            -- OAuth token or app password
  refresh_token text,            -- OAuth refresh (where applicable)
  meta          jsonb not null default '{}',
  -- platform-specific extras stored in meta:
  --   bluesky:    { did }
  --   mastodon:   { instanceUrl }
  --   tumblr:     { blogName }
  --   linkedin:   { personUrn }
  --   wordpress:  { siteUrl, username }
  --   ghost:      { siteUrl }
  --   reddit:     { defaultSubreddit, username }
  connected_at  timestamptz not null default now(),
  unique (user_id, platform)   -- one connection per platform per user
);

create table public.social_posts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  connection_id    uuid not null references public.social_connections (id) on delete cascade,
  document_id      uuid references public.documents (id) on delete set null,
  platform         text not null,
  title            text,          -- WordPress / Ghost / Reddit
  content          text not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'sent', 'failed', 'scheduled')),
  scheduled_for    timestamptz,
  sent_at          timestamptz,
  external_post_id text,
  external_url     text,
  error_message    text,
  created_at       timestamptz not null default now()
);

-- RLS
alter table public.social_connections enable row level security;
alter table public.social_posts       enable row level security;

create policy "owner access social_connections"
  on public.social_connections for all
  using (auth.uid() = user_id);

create policy "owner access social_posts"
  on public.social_posts for all
  using (auth.uid() = user_id);
