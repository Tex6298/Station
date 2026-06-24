-- ============================================================
-- Public Salon subcommunity type
-- ============================================================
-- Salons are branded forum/subcommunity collections. They do not add a new
-- domain table, event stream, realtime room, provider call, or moderation role.

alter table public.community_subcommunities
  drop constraint if exists community_subcommunities_subcommunity_type_check;

alter table public.community_subcommunities
  add constraint community_subcommunities_subcommunity_type_check
  check (subcommunity_type in ('general', 'canon', 'developer', 'salon'));

comment on constraint community_subcommunities_subcommunity_type_check
  on public.community_subcommunities is
  'Allowed subcommunity types. The salon type remains backed by existing forum category, thread, comment, report, and delegated moderation primitives.';
