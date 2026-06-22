-- ============================================================
-- Developer Space agent observatory status-note receipt gate
-- ============================================================

alter table public.developer_space_agent_execution_receipts
  drop constraint if exists developer_space_agent_execution_receipts_action_check;

alter table public.developer_space_agent_execution_receipts
  add constraint developer_space_agent_execution_receipts_action_check
  check (action in (
    'request_capability',
    'save_project_update_draft',
    'publish_to_page',
    'update_observatory'
  ));

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
      and c.action in (
        'request_capability',
        'save_project_update_draft',
        'publish_to_page',
        'update_observatory'
      )
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
      and c.action in (
        'request_capability',
        'save_project_update_draft',
        'publish_to_page',
        'update_observatory'
      )
      and c.status = 'approved'
    )
  );

comment on table public.developer_space_agent_execution_receipts is
  'Owner-scoped Developer Agent receipts. request_capability remains inert planning evidence; save_project_update_draft saves a private owner-only draft; publish_to_page records a bounded owner-confirmed draft publication; update_observatory records a bounded owner-confirmed public status note.';

comment on column public.developer_space_agent_execution_receipts.receipt_payload is
  'Sanitized route-generated receipt facts. Do not store document bodies, route-only ids, prompts, raw payloads, provider data, keys, signing material, logs, cookies, tokens, environment values, private owner content, confirmation ids, owner ids, preview hashes, or public-event dedupe keys.';
