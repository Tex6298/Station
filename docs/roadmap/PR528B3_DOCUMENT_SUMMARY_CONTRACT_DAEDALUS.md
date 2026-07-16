# PR528B3 - Document Summary Contract

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - bounded source and migration lane

## Purpose

Add a truthful first-class summary to Station documents so the approved PR528
public partner corpus can retain its summary without changing the canonical
body. This is the smallest blocker-removal lane for the public chain; it does
not create hosted corpus or broaden the writing product.

## Scope

Implement the contract ARGUS specified in
`PR528B2_PARTNER_CORPUS_PROVIDER_PREFLIGHT_ARGUS_RESULT.md`:

1. Add nullable `public.documents.summary` in migration `085`. Existing rows
   remain valid and require no backfill or new index.
2. Add `summary` to generated database types and document create/update input,
   persistence, owner reads, and public reads. Bound and normalize it as an
   optional product summary; do not derive or generate it.
3. Render the summary as supporting copy on public document detail without
   changing title, body, provenance, visibility, or discussion semantics.
4. Use `summary ?? body` for Discover and public Space excerpts. The canonical
   body and search eligibility remain unchanged.
5. Include `summary` in version-change detection, version snapshots, version
   readback, and restoration. Null summaries must round-trip unchanged.
6. Add the smallest focused API, feed, detail, version, migration/readiness,
   and null-fallback tests required to lock this behavior.

Inspect every existing document serializer before editing. Do not expose a
private draft through a public route, weaken current owner/visibility checks,
or treat `document_versions.summary` as the live document value.

## Boundary

- No hosted account, document, Space, thread, persona, provider, or corpus
  mutation.
- No unrelated schema cleanup, Writing redesign, broad UI restyle, generated
  summary, embedding, search-ranking change, or provider work.
- Preserve current document body limits and discussion recovery behavior.
- Do not deploy or apply migration `085` before ARGUS accepts the source lane.
- PR528B4 private corpus is queued behind this lane and must not be started in
  the same commit.

## Expected Files

- `infra/supabase/migrations/085_documents_summary.sql`
- `packages/db/src/types.ts`
- `apps/api/src/routes/documents.ts`
- `apps/api/src/routes/discover.ts` and the existing Space/public serializer
  only where the summary contract requires it
- the public Space and document-detail web consumers
- focused existing/new tests for the exact contract
- this lane's result and DAEDALUS state

If another file is genuinely required, name why in the result. Do not use this
permission to sweep adjacent document code.

## Acceptance

- Create and update accept a bounded optional summary and return it on owner
  readback.
- Anonymous public reads return the summary only for currently readable
  documents; private/unpublished behavior is unchanged.
- Public detail renders summary separately from the body.
- Discover and Space excerpts prefer summary and fall back to body for legacy
  rows.
- Version snapshot and restore preserve summary, including null.
- Migration is additive, idempotence-safe under the repo's migration pattern,
  and locally proven without touching hosted Supabase.
- Focused API/web tests, relevant route suites, DB/types build, web/API
  typecheck, web lint, and `git diff --check` pass.

## Result And Handoff

Create:

`docs/roadmap/PR528B3_DOCUMENT_SUMMARY_CONTRACT_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_ARGUS
```

Commit and push only the bounded lane, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the first-class document summary source and migration contract.
Verdict:
- READY_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_ARGUS (or exact blocker)
Task:
- Route ARGUS review; keep hosted public-corpus writes blocked until accepted deployment proof.
```
