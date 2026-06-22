-- ============================================================
-- Developer Space agent private draft-document save
-- ============================================================

alter table public.developer_space_agent_confirmations
  drop constraint if exists developer_space_agent_confirmations_action_check;

alter table public.developer_space_agent_confirmations
  add constraint developer_space_agent_confirmations_action_check
  check (action in (
    'publish_to_page',
    'update_layout',
    'read_logs',
    'push_to_repo',
    'run_job',
    'update_observatory',
    'request_capability',
    'save_project_update_draft',
    'rotate_ingestion_key',
    'create_webhook_signing_secret'
  ));

alter table public.developer_space_agent_execution_receipts
  drop constraint if exists developer_space_agent_execution_receipts_action_check;

alter table public.developer_space_agent_execution_receipts
  add constraint developer_space_agent_execution_receipts_action_check
  check (action in ('request_capability', 'save_project_update_draft'));

drop policy if exists "developer_space_agent_execution_receipts_all_owner"
  on public.developer_space_agent_execution_receipts;

create policy "developer_space_agent_execution_receipts_all_owner"
  on public.developer_space_agent_execution_receipts
  for all using (
    auth.uid() = owner_user_id
    and exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
    and exists (
      select 1 from public.developer_space_agent_confirmations c
      where c.id = confirmation_id
      and c.developer_space_id = developer_space_id
      and c.owner_user_id = owner_user_id
      and c.action in ('request_capability', 'save_project_update_draft')
      and c.status = 'approved'
    )
  )
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1 from public.developer_spaces s
      where s.id = developer_space_id
      and s.owner_user_id = auth.uid()
    )
    and exists (
      select 1 from public.developer_space_agent_confirmations c
      where c.id = confirmation_id
      and c.developer_space_id = developer_space_id
      and c.owner_user_id = owner_user_id
      and c.action in ('request_capability', 'save_project_update_draft')
      and c.status = 'approved'
    )
  );

comment on table public.developer_space_agent_execution_receipts is
  'Owner-scoped Developer Agent receipts. request_capability remains inert planning evidence; save_project_update_draft records a bounded private owner-only draft-document save.';

comment on column public.developer_space_agent_execution_receipts.receipt_payload is
  'Sanitized route-generated receipt facts. Do not store document bodies, prompts, raw payloads, ids for display, provider data, keys, signing material, logs, cookies, tokens, environment values, or private owner content.';
