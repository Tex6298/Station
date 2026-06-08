-- ============================================================
-- Developer Space observatory widget layout defaults
-- ============================================================

update public.developer_spaces
set visualisation_config = jsonb_set(
  coalesce(visualisation_config, '{}'::jsonb),
  '{widgets}',
  '[
    {"id":"visualisation","type":"visualisation","title":"Live visualisation","zone":"main","position":0,"visible":true},
    {"id":"event_stream","type":"event_stream","title":"Event stream","zone":"main","position":1,"visible":true},
    {"id":"reading_guide","type":"reading_guide","title":"How to read this","zone":"side","position":0,"visible":true},
    {"id":"project_notes","type":"project_notes","title":"Project notes","zone":"side","position":1,"visible":true},
    {"id":"current_nodes","type":"current_nodes","title":"Current nodes","zone":"side","position":2,"visible":true},
    {"id":"latest_snapshot","type":"latest_snapshot","title":"Latest snapshot","zone":"side","position":3,"visible":true}
  ]'::jsonb,
  true
)
where not coalesce(visualisation_config, '{}'::jsonb) ? 'widgets';

comment on column public.developer_spaces.visualisation_config is
  'Visual mode options plus observatory widget layout. widgets[] supports visible/order/zone metadata for Station-native dashboard composition.';
