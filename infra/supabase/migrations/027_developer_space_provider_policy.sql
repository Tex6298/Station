-- ============================================================
-- DEVELOPER SPACE PROVIDER POLICY
-- ============================================================

alter table public.developer_spaces
  add column if not exists provider_policy text not null default 'public_synthetic_only';

alter table public.developer_spaces
  drop constraint if exists developer_spaces_provider_policy_check;

alter table public.developer_spaces
  add constraint developer_spaces_provider_policy_check
  check (
    provider_policy in (
      'public_synthetic_only',
      'public_context_allowed',
      'private_archive_allowed',
      'owner_byok_only',
      'platform_allowed'
    )
  );

comment on column public.developer_spaces.provider_policy is
  'BE-03 provider/data posture for Developer Space AI calls. Private archive use requires private_archive_allowed.';
