# Persistence schema baseline

PR-02 establishes the database shape Station already assumes, without wiring
runtime auth, replacing repositories, or changing product behavior.

## Assumed entities

The current scaffold assumes these persistence entities:

| Product area | Tables |
| --- | --- |
| Users/auth profile | `profiles` plus Supabase `auth.users` |
| Personas and context | `personas`, `memory_items`, `canon_items`, `persona_files`, `import_jobs`, `calibration_sessions` |
| Conversations/archive | `conversations`, `conversation_messages`, `archived_chat_transcripts`, `continuity_candidates` |
| Continuity ledger | `continuity_records` |
| Public Spaces/documents | `spaces`, `space_pages`, `documents` |
| Community | `forum_categories`, `threads`, `comments`, `moderation_reports`, `discover_feed` |
| Publishing/export | `social_connections`, `social_posts`, `export_packages` |
| Developer Spaces | `developer_spaces`, `developer_space_ingestion_keys`, `developer_space_nodes`, `developer_space_events`, `developer_space_snapshots` |

## Baseline notes

- Existing specialized continuity tables remain canonical for their current
  flows. `continuity_records` is the stable cross-source ledger for future
  repository-backed timeline/context views.
- Developer Space routes still use the single-key columns on
  `developer_spaces`. `developer_space_ingestion_keys` is a schema baseline for
  future key rotation/revocation work.
- RLS is enabled on user-facing tables. Broad public reads should continue to go
  through API serializers or future public-safe SQL views when tables contain
  private source data or key material.
- In-memory/local data remains a test/local fallback until PR-05 replaces repo
  calls with persistent implementations.
