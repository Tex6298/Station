# Supabase Setup

## 1. Create a Supabase project

Go to https://supabase.com and create a new project. Note your:
- **Project URL** (`SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`)
- **Anon key** (`SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) — keep this secret, server-side only
- **Database URL** (`DATABASE_URL`) — found in Project Settings → Database

## 2. Run migrations

In the Supabase dashboard, go to **SQL Editor** and run the migrations in order:

1. `migrations/001_initial_schema.sql` — creates all tables, triggers, and indexes
2. `migrations/002_rls_policies.sql` — enables Row Level Security on all tables

Or use the Supabase CLI:
```bash
npx supabase db push
```

## 3. Enable pgvector

The schema migration enables pgvector automatically. If it fails, go to
**Database → Extensions** in the Supabase dashboard and enable `vector`.

## 4. Storage bucket

Create a storage bucket called `persona-files`:
- Go to **Storage** in the Supabase dashboard
- Create a new bucket named `persona-files`
- Set it to **private** (files are served via signed URLs)

## 5. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials.
Both the API and the web app need the Supabase URL and keys.

## 6. Email auth settings

In Supabase → **Authentication → Settings**:
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
