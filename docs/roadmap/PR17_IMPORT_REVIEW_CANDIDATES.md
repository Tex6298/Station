# PR17 - Import Review Candidates

Date: 2026-06-17
Status: implemented by A2 / DAEDALUS; ready for A3 / ARGUS review
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if a visible review
surface changes materially.

## Why This Lane Is Next

PR14 made external conversation parsing explicit. PR15 made job execution
truthful. PR16 made uploaded-file import jobs durably claimable. The remaining
import-pipeline safety gap is review: parsed external imports still become
private archive memory chunks through the protected-alpha path, but they do not
yet produce a clear owner review queue before becoming durable Memory or Canon.

Before Reddit intake, recurring pulls, export workers, or Cloudflare retrieval,
Station needs a narrow backend bridge from imported source material to
reviewable continuity candidates.

## Goal

Treat imported conversations as private source material first, then generate
owner-reviewable Memory/Canon candidates from that source.

The replay proof should be:

> A ChatGPT or Claude import is preserved privately in the archive, does not
> silently become active runtime memory before review, creates owner-scoped
> pending candidates with source provenance, and only becomes active Memory or
> Canon when the owner accepts or edits a candidate.

## Current Baseline

- `processUploadedFile` parses ChatGPT, Claude, legacy role/content arrays,
  text, and Markdown through the PR14 parser boundary.
- Imported text is chunked into `memory_items` with `source_type: "import"`.
- `ensureMemoryLifecycle` currently defaults imported memory to active
  `llm_extracted` memory.
- `continuity_candidates` exists for archived chats and has accept/reject logic
  in `apps/api/src/routes/conversations.ts`.
- `continuity_candidates.archived_chat_transcript_id` is currently required, so
  import-backed candidates need either a narrow schema extension or a separate
  owner-scoped candidate table.

## Scope

Schema:

- Prefer extending `continuity_candidates` narrowly so candidates can reference
  either an archived chat transcript or an import/archive source.
- Preserve existing archived-chat candidate behavior and tests.
- Add source fields only as needed, for example `source_table`, `source_id`,
  `source_label`, or equivalent.
- If `archived_chat_transcript_id` becomes nullable, add a check constraint so
  every candidate still has a valid source reference.
- Update DB types if this repo maintains them manually.

Import behavior:

- For parsed external conversation imports, create pending review candidates
  tied to the import job, persona file, or created archive chunks.
- Keep raw file bodies, raw private transcripts, and provider secrets out of
  candidate summaries, public responses, logs, and wakeups.
- Imported archive chunks should remain private and searchable as archive source
  material.
- Imported archive chunks should not be injected into persona runtime context
  before review. Use the existing lifecycle controls if possible, for example
  quarantining `source_type: "import"` memory until a candidate is accepted.
- Accepting a memory candidate should create or activate owner-scoped Memory with
  provenance back to the import source.
- Accepting a canon candidate should create owner-scoped Canon with provenance or
  at least an auditable source label.
- Rejecting a candidate should not delete the private archive source.

Route/service behavior:

- Reuse the existing candidate accept/reject route if it can safely support
  import-backed candidates.
- If a new route is cleaner, keep it narrow and owner-scoped.
- Existing archived-chat candidate review must keep working.
- Other owners must not list, accept, reject, or infer another owner's import
  candidates.

## Out Of Scope

- Full import review workspace UI.
- Reddit OAuth/import.
- Discord production parser.
- Recurring pulls.
- BullMQ/Redis worker deployment.
- Export worker redesign.
- Broad quota enforcement.
- Cloudflare retrieval, vector reindexing, Redis memory truth, public
  publishing, or UI reskin.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:integrity` only if Integrity Session output review is touched. Add
`test:exports` only if export package contents/status change.

## Required Tests

- Parsed ChatGPT import creates private archive material plus pending
  import-backed candidates.
- Parsed Claude import creates private archive material plus pending
  import-backed candidates.
- Imported memory chunks are not injected into runtime context before owner
  review.
- Accepting a memory candidate creates or activates active owner-scoped Memory
  and records source provenance.
- Accepting a canon candidate creates owner-scoped Canon and records source
  provenance or source label.
- Rejecting a candidate leaves archive source material intact.
- Existing archived-chat candidate accept/reject behavior still works.
- Other owners cannot read or mutate import-backed candidates.
- Unknown or malformed JSON still fails safely and does not create candidates.

## DAEDALUS Implementation Notes

- Migration `036_import_review_candidates.sql` makes
  `continuity_candidates.archived_chat_transcript_id` nullable only when an
  import source reference is present, and adds `source_table`, `source_id`, and
  `source_label`.
- Import-backed candidates use `source_table: "persona_files"` plus the
  uploaded file id and parser-labelled source label, for example
  `chatgpt.json (chatgpt import)`.
- `processUploadedFile` creates pending Memory and Canon candidates for parsed
  ChatGPT and Claude imports only. Plain text/Markdown stay archive-only, and
  unknown or malformed JSON still fails before memory or candidate creation.
- Imported archive chunks still write to private `memory_items`, but
  `ensureMemoryLifecycle` now defaults `source_type: "import"` rows to
  `quarantined`. Runtime persona context calls private archive retrieval with
  quarantined archive chunks excluded.
- Accepting an import-backed Memory candidate creates a new owner-scoped memory
  with `source_type: "import"` and `archive_source_type: "persona_file"`, then
  activates its lifecycle as owner-reviewed. Accepting an import-backed Canon
  candidate creates owner-scoped canon with `source_type: "import"`.
- Rejecting a candidate updates only candidate status; private archive source
  material remains intact.
- Existing archived-chat candidate behavior is preserved.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- schema and type changes;
- exact source reference shape for import-backed candidates;
- how imported archive chunks are kept out of runtime context before review;
- candidate generation rules and redaction limits;
- accept/reject behavior for memory and canon candidates;
- owner-scope and non-owner rejection evidence;
- validation commands and results;
- caveats about deferred UI, Reddit, workers, quotas, Cloudflare, vectors, and
  export redesign.

ARGUS should review private-source leakage, runtime-memory poisoning, owner
scoping, archived-chat regression, candidate overclaiming, deletion/export
semantics, and accidental scope creep.
