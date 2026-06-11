# Supabase Setup

## 1. Create a Supabase project

Go to https://supabase.com and create a new project. Note your:
- **Project URL** (`SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`)
- **Anon key** (`SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) - keep this secret, server-side only
- **Database URL** (`DATABASE_URL`) - found in Project Settings -> Database

## 2. Run migrations

In the Supabase dashboard, go to **SQL Editor** and run the migrations in order:

1. `migrations/001_initial_schema.sql` - creates all tables, triggers, and indexes
2. `migrations/002_rls_policies.sql` - enables Row Level Security on all tables
3. `migrations/003_rag_functions.sql` - adds pgvector helper RPCs
4. `migrations/004_forum_seed_and_helpers.sql` - seeds forum categories
5. `migrations/005_social_publishing.sql` - social publishing connections
6. `migrations/006_developer_spaces.sql` - Developer Space observatories and ingestion
7. `migrations/007_document_provenance_and_visibility.sql` - publication provenance and visibility
8. `migrations/008_document_discussions.sql` - document discussion threads
9. `migrations/009_archive_export_packages.sql` - archive export packages
10. `migrations/010_archived_chat_candidates.sql` - archived chats and continuity candidates
11. `migrations/011_schema_baseline_alignment.sql` - PR-02 schema/type alignment, continuity records, and ingestion-key baseline
12. `migrations/012_storage_usage.sql` - storage usage counters and reservation RPCs
13. `migrations/013_integrity_sessions.sql` - integrity sessions
14. `migrations/014_integrity_questions_token_credits.sql` - integrity questions and token credits
15. `migrations/015_token_topup_grants.sql` - token top-up grants
16. `migrations/016_monthly_token_reset.sql` - monthly token reset RPC
17. `migrations/017_continuity_alpha_data_model.sql` - continuity source-version alignment
18. `migrations/018_developer_space_documents.sql` - Developer Space linked documents
19. `migrations/019_developer_space_exports_usage.sql` - Developer Space export packages and usage counters
20. `migrations/020_ai_observability.sql` - AI trace sessions and events
21. `migrations/021_developer_space_widget_layout.sql` - Developer Space observatory widget layout defaults
22. `migrations/022_persona_lifecycle_memory_graph.sql` - persona layer profiles, lifecycle events, handoffs, and memory graph edges
23. `migrations/023_memory_continuity_controls.sql` - owner memory blocks, memory lifecycle metadata, and memory cycle state
24. `migrations/024_community_trust_votes_moderation.sql` - community trust profiles, voting, moderation actions, and forum scoring fields
25. `migrations/025_private_archive_retrieval.sql` - private archive chunk provenance and retrieval RPCs
26. `migrations/026_memory_lifecycle_runtime_filters.sql` - runtime lifecycle filters for vector memory search
27. `migrations/027_developer_space_provider_policy.sql` - Developer Space provider/data posture
28. `migrations/028_retrieval_provider_metadata.sql` - retrieval provider metadata and active vector contract guardrails
29. `migrations/029_gemini_embedding_provider_prep.sql` - provider-aware embedding metadata guardrails and RPC overloads for `station_free_1536` proof

Or use the Supabase CLI after confirming the staging project target:
```bash
npx supabase link --project-ref <staging-project-ref>
npx supabase db push --linked
```

If you do not link the project, provide an explicit database URL instead:

```bash
npx supabase db push --db-url <percent-encoded-staging-database-url>
```

## 3. Enable pgvector

The schema migration enables pgvector automatically. If it fails, go to
**Database -> Extensions** in the Supabase dashboard and enable `vector`.

## 4. Storage bucket

Create a storage bucket called `persona-files`:
- Go to **Storage** in the Supabase dashboard
- Create a new bucket named `persona-files`
- Set it to **private** (files are served via signed URLs)

## 5. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials.
Both the API and the web app need the Supabase URL and keys.

## 6. Email auth settings

In Supabase -> **Authentication -> Settings**:
- Enable **Email provider**
- API beta signup uses the service-role admin API and deliberately creates
  confirmed email users so `/auth/signup` can return a session immediately.
  Before public launch, revisit this if Station should require email
  confirmation before first sign-in.
- Set your site URL to `http://localhost:3000` for local dev

## Tables created

| Table | Purpose |
|---|---|
| `profiles` | Extends auth.users with tier, display info, BYOK keys |
| `personas` | Named AI personas per user |
| `conversations` | Chat sessions per persona |
| `conversation_messages` | Individual messages in a conversation |
| `archived_chat_transcripts` | Owner-only archived chat transcript records |
| `continuity_candidates` | Memory/canon candidates extracted from archived chats |
| `continuity_records` | Owner-scoped continuity ledger for cross-source timelines/views |
| `memory_items` | Searchable memory archive per persona (with pgvector embeddings) |
| `canon_items` | High-priority rules always injected into persona context |
| `persona_files` | Uploaded documents/images for the persona archive |
| `import_jobs` | Background processing jobs for archive imports |
| `calibration_sessions` | Structured sessions for extracting persona style rules |
| `spaces` | Public pages (MySpace/Substack hybrid) |
| `space_pages` | Individual pages within a Space |
| `documents` | Posts, essays, manifestos published within Spaces |
| `forum_categories` | Top-level forum sections |
| `threads` | Forum threads |
| `comments` | Comments on threads, documents, and space pages |
| `moderation_reports` | User-submitted reports for moderation review |
| `discover_feed` | Feed events for the Discover page |
| `social_connections` | Owner OAuth/app-password connections for publishing |
| `social_posts` | Social publishing history |
| `export_packages` | Owner-only persona and Developer Space export manifests/packages |
| `developer_spaces` | Public/private observatories for research and builder projects |
| `developer_space_ingestion_keys` | Server/owner-only ingestion key hashes for rotation/revocation |
| `developer_space_nodes` | Live entities/nodes tracked inside Developer Spaces |
| `developer_space_events` | Ingested event stream for observatory timelines |
| `developer_space_snapshots` | Periodic full-state snapshots for history/playback |
| `developer_space_documents` | Linked methodology, findings, field logs, and notes |
| `developer_space_usage` | Developer Space ingestion/storage/public-read/export counters |
| `ai_trace_sessions` | Owner-scoped AI/LLM operation trace sessions |
| `ai_trace_events` | Trace events for LLM calls, integrity turns, errors, and output writes |
| `persona_layer_profiles` | Owner-scoped Soul/Body/Faculty/Skill/Evolution persona architecture state |
| `persona_lifecycle_events` | Persona lifecycle, handoff, layer, integrity, and memory graph events |
| `persona_handoffs` | Owner-scoped context handoff records between personas |
| `memory_item_edges` | Owner-scoped memory graph relationships |
| `owner_memory_blocks` | Shared owner profile/preferences/boundary memory blocks |
| `memory_item_lifecycle` | Per-memory trust, status, decay, evidence, and supersession metadata |
| `persona_memory_cycle_states` | Per-persona memory consolidation/cycle state |
| `community_user_profiles` | Forum trust/reputation/activity profile rows |
| `community_votes` | Normalized thread/comment voting rows |
| `community_moderation_actions` | Admin/raw moderation action log rows |
