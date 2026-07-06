-- ============================================================
-- PR499A Public seminar schedule metadata
-- ============================================================

alter table public.public_seminar_records
  add column if not exists scheduled_starts_at timestamptz null,
  add column if not exists scheduled_time_zone text null,
  add column if not exists scheduled_duration_minutes integer null;

alter table public.public_seminar_records
  drop constraint if exists public_seminar_records_schedule_metadata_check;

alter table public.public_seminar_records
  add constraint public_seminar_records_schedule_metadata_check
  check (
    (
      scheduled_starts_at is null
      and scheduled_time_zone is null
      and scheduled_duration_minutes is null
    )
    or (
      scheduled_starts_at is not null
      and scheduled_time_zone is not null
      and length(btrim(scheduled_time_zone)) > 0
      and (
        scheduled_duration_minutes is null
        or scheduled_duration_minutes between 15 and 480
      )
    )
  );

create index if not exists idx_public_seminar_records_public_schedule
  on public.public_seminar_records (scheduled_starts_at)
  where status = 'published'
    and visibility = 'public'
    and scheduled_starts_at is not null;

comment on column public.public_seminar_records.scheduled_starts_at is
  'Nullable owner-entered seminar schedule instant. Not derived from record lifecycle timestamps.';

comment on column public.public_seminar_records.scheduled_time_zone is
  'Owner-entered IANA time zone or UTC for public-safe schedule readback. No calendar invite, reminder, room, registration, ticket, provider, or runtime behavior is implied.';

comment on column public.public_seminar_records.scheduled_duration_minutes is
  'Optional bounded schedule duration metadata only, constrained to 15 through 480 minutes when present.';
