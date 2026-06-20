-- ============================================================
-- Observed runtime field classifications for Developer Spaces
-- ============================================================

alter table public.developer_space_nodes
  add column if not exists observed_runtime_classifications jsonb
  check (
    observed_runtime_classifications is null
    or jsonb_typeof(observed_runtime_classifications) = 'object'
  );

alter table public.developer_space_events
  add column if not exists observed_runtime_classifications jsonb
  check (
    observed_runtime_classifications is null
    or jsonb_typeof(observed_runtime_classifications) = 'object'
  );

alter table public.developer_space_snapshots
  add column if not exists observed_runtime_classifications jsonb
  check (
    observed_runtime_classifications is null
    or jsonb_typeof(observed_runtime_classifications) = 'object'
  );

comment on column public.developer_space_nodes.observed_runtime_classifications is
  'Optional observed-runtime field visibility metadata for node metrics. Stores classification paths only, not secret values.';

comment on column public.developer_space_events.observed_runtime_classifications is
  'Optional observed-runtime field visibility metadata for event_data. Stores classification paths only, not secret values.';

comment on column public.developer_space_snapshots.observed_runtime_classifications is
  'Optional observed-runtime field visibility metadata for snapshot_data. Stores classification paths only, not secret values.';
