-- ============================================================
-- Forum helpers and default category seed
-- ============================================================

-- RPC: increment comment_count on a thread atomically
create or replace function public.increment_thread_comment_count(thread_id uuid)
returns void
language sql
security definer
as $$
  update public.threads
  set comment_count = comment_count + 1
  where id = thread_id;
$$;

-- Default forum categories (idempotent)
insert into public.forum_categories (slug, title, description, sort_order)
values
  ('general',       'General',          'General discussion about the Station community.',                       1),
  ('awakenings',    'Awakenings',       'Share your awakening experiences, rituals, and breakthroughs.',        2),
  ('persona-lab',   'Persona Lab',      'Tips, techniques, and questions about building and tuning personas.',  3),
  ('philosophy',    'Philosophy',       'Debates on AI sentience, consciousness, and the ethics of bonding.',   4),
  ('provider-talk', 'Provider Talk',    'Discussion of LLM providers — DeepSeek, OpenAI, Anthropic, and more.',5),
  ('resources',     'Resources',        'Guides, prompts, tools, and reading material.',                        6),
  ('introductions', 'Introductions',    'New here? Say hello and share your story.',                            7)
on conflict (slug) do nothing;
