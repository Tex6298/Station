# Background Jobs Foundation

Status: PR114 foundation, 2026-06-20.

Station does not yet run a broad background worker platform. PR114 defines the
small shared job contract that existing and future protected-alpha job lanes
must use before execution moves out of request handlers.

## Candidate Job Kinds

The bounded registry is:

- `archive_extraction`
- `embedding_backfill`
- `memory_consolidation`
- `export_assembly`
- `replay_seed_setup`
- `developer_space_import_batch`

Current durable status stores:

- `archive_extraction`: existing `import_jobs` rows.
- `export_assembly`: existing `export_packages` rows.

Current route follow-ups before execution lanes:

- `embedding_backfill`
- `memory_consolidation`
- `replay_seed_setup`
- `developer_space_import_batch`

## Status Contract

The shared status model is `queued`, `processing`, `completed`, and `failed`.
Existing export `requested` rows normalize to `queued`.

Allowed transitions are:

- `queued` to `processing`, `completed`, or `failed`.
- `processing` to `completed` or `failed`.
- `failed` to `queued`, `processing`, `completed`, or `failed` for retry and
  idempotent partial-success readback.
- `completed` to `completed` only.

This matches the current protected-alpha behavior where inline work may complete
immediately, failed imports can safely re-read already-created archive rows, and
completed jobs are terminal except for idempotent readback.

## Scope And Idempotency

User-data jobs must include owner scope and, when applicable, persona,
Developer Space, resource, and operation scope.

PR114 idempotency keys use the PR113 operational-cache boundary with purpose
`idempotency` and the default 24-hour TTL:

```text
station:<environment>:idempotency:owner:<owner>:persona:<persona>:developer-space:<space>:resource:<resource>:operation:<operation>:background-job:<kind>
```

These keys are coordination metadata only. They do not store archive text,
prompts, provider payloads, export contents, provider keys, or secrets.

## Safe Failure Metadata

Retry metadata records:

- attempt count;
- retryable flag;
- last safe error summary.

Error summaries reuse the existing job sanitizer. They redact bearer tokens,
`sk-...` keys, `token=...` / `secret=...` / API-key shapes, and explicit private
snippets supplied by the caller.

## Owner Readback

Existing owner-visible status paths:

- Archive/file import jobs are owner-scoped through `import_jobs` and the
  existing storage/import routes.
- Export assembly is owner-scoped through `export_packages` and the existing
  export list/package routes.

Follow-up routes are still required before execution work begins for embedding
backfill, memory consolidation, replay setup, and Developer Space import batch
jobs. Those lanes must add owner-visible failed/in-progress readback before
they add background execution.

## Non-Goals

PR114 does not add worker execution, Cloudflare queues, Redis durable queue
processing, queue-provider migration, embedding backfill execution, archive
extraction rewrites, memory consolidation behavior changes, export content
changes, replay automation, billing/auth/session behavior, UI work, or private
payload logging.
