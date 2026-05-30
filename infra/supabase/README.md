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

Or use the Supabase CLI:
```bash
npx supabase db push
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
- For beta: you can disable "Confirm email" to allow instant sign-in
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
| `export_packages` | Owner-only archive export manifests/packages |
| `developer_spaces` | Public/private observatories for research and builder projects |
| `developer_space_ingestion_keys` | Server/owner-only ingestion key hashes for future rotation |
| `developer_space_nodes` | Live entities/nodes tracked inside Developer Spaces |
| `developer_space_events` | Ingested event stream for observatory timelines |
| `developer_space_snapshots` | Periodic full-state snapshots for history/playback |
