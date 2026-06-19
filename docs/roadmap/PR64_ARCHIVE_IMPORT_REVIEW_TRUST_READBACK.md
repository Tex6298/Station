# PR64 - Archive Import Review Trust Readback

Date: 2026-06-19
Status: accepted by ARGUS; ready for ARIADNE rehearsal
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides the next lane.

## Purpose

Continue the Memory UX / observability lane after PR60-PR63 by making imported
archive material feel trustworthy before it becomes Memory or Canon.

Archive is the source-backed side of Station's continuity promise. The
per-persona Archive tab already has live import jobs, storage usage, export
status, and an Import Review inbox. PR64 should make the review step clearer:
what the source was, what candidate was extracted, what accepting writes, what
rejecting preserves, and whether the visible counts/history refreshed.

## Existing Foundations

Start from the per-persona Archive tab, not the global archive:

- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/components/studio/import-review-inbox.tsx`
- `apps/web/lib/import-review.ts`
- `apps/web/lib/import-review.test.ts`
- `apps/web/lib/archive-trust.ts`
- `apps/web/lib/archive-trust.test.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/routes/conversation-archive.test.ts`
- `apps/api/src/routes/storage.test.ts`
- `packages/types/src/persona.ts`

Relevant existing APIs:

- `GET /personas/:id`
- `GET /persona-files/persona/:personaId`
- `GET /imports/persona/:personaId`
- `GET /conversations/persona/:personaId/candidates?source=import&status=all`
- `PATCH /conversations/candidates/:candidateId`
- `POST /imports/chat`
- existing export/package routes already used by the tab

Existing write semantics:

- Import review `memory` candidates accept into Memory with import/archive
  source provenance.
- Import review `canon` candidates accept into Canon with import/archive source
  provenance.
- Rejecting a candidate preserves the private archive source and does not write
  the candidate to Memory or Canon.

## Scope

Implement a bounded owner-only archive/import review UX slice:

- Improve the per-persona Archive tab and Import Review inbox so imported
  source material to Memory/Canon promotion is legible.
- Add owner-friendly labels for:
  - candidate type / destination;
  - candidate status;
  - source kind/label;
  - accepted target if available.
- Make candidate cards explicit:
  - "Accept with edits writes this to Memory";
  - "Accept with edits writes this to Canon";
  - "Reject keeps the private source preserved and does not write this
    candidate";
  - show reviewed/accepted/dismissed state with the destination if present.
- Sanitize source labels, rationale text, and non-editable readback copy for raw
  IDs, URLs, bearer values, token/API-key/cookie/password/secret assignments,
  and secret-shaped values.
- After accepting/rejecting a candidate, refresh or locally update the visible
  candidate list and, if cheap, refresh `GET /personas/:id` so Memory/Canon
  summary counts reflect accepted candidates.
- After pasted import completion, refresh jobs and import candidates if that is
  cheap; otherwise make the refresh boundary clear in UI copy.
- Keep the existing pasted import route and candidate review route.
- Add focused helper tests for any new import-review labels, destination copy,
  source sanitization, accepted-target copy, or summary behavior.
- Keep desktop and `390px` mobile fit in mind.

## Non-Scope

- No global archive redesign.
- No new global archive search/index work.
- No upload parser work beyond existing surfaces.
- No Reddit OAuth/import lane.
- No background job/queue infrastructure.
- No export package behavior change.
- No import parser quality tuning.
- No new API route behavior unless a tiny response-shape type gap is
  unavoidable.
- No schema or migration work.
- No public archive surface.
- No raw private transcript display beyond owner-editable candidate content
  already shown for review.
- No raw API payload or trace display.
- No Redis, Cloudflare, provider migration, Project work, hosted runtime,
  worker, billing/quota, DexOS, or broad redesign.

## Acceptance

ARGUS can accept PR64 if:

- The Archive tab remains owner-only and uses existing owner-scoped APIs.
- Import review cards clearly explain Memory/Canon destination behavior before
  accepting and preservation behavior before rejecting.
- Source labels/rationale/readback copy do not expose raw private IDs, raw API
  payloads, raw traces, URLs, bearer values, token/API-key/cookie/password/
  secret assignments, or secret-shaped values in newly added readback.
- Accept/reject still use `PATCH /conversations/candidates/:candidateId` and
  update visible candidate state afterward.
- Pasted import completion either refreshes jobs/candidates or explains the
  refresh boundary clearly.
- No global archive, parser, queue, schema, provider, public route, Redis,
  Cloudflare, Project, hosted-runtime, worker, billing, broad redesign, or DexOS
  scope is added.
- Desktop and narrow mobile layout risk is addressed.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If continuity or persona summary readback is touched, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:persona-context
```

If a web build is run, record the known Windows standalone symlink `EPERM`
separately from compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- exact files changed;
- import-review labels and destination copy added;
- source/rationale/readback sanitization behavior;
- accept/reject refresh behavior;
- pasted-import refresh behavior;
- privacy boundary for IDs, URLs, secrets, raw traces, raw API payloads, and raw
  transcripts;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no global archive, parser, queue, schema, provider,
  public route, Redis, Cloudflare, Project, hosted runtime, worker, billing, or
  DexOS work was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- signed owner `/studio/personas/:personaId/files`;
- Import Review overview/card readability;
- Memory/Canon destination copy;
- accept/reject visible update behavior if safe to rehearse on replay data;
- pasted import refresh boundary if safe to rehearse;
- 390px layout with no horizontal overflow or offscreen controls;
- no raw IDs, URLs, bearer values, token assignments, secret-shaped values, raw
  traces, raw API payloads, or unintended raw transcripts visible in new
  readback surfaces.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation Result

Implemented on the per-persona Archive tab without API, schema, parser, job,
export, public Archive, Project, hosted runtime, billing/quota, or DexOS
changes.

- Import Review cards now label Memory versus Canon candidates, private import
  source type, sanitized source label, destination, review state, accepted
  target, and preservation behavior before and after owner review.
- Accept/reject still uses the existing owner-scoped
  `PATCH /conversations/candidates/:candidateId` route.
- Candidate review updates the returned candidate locally, then refreshes
  existing persona/files/jobs/candidates reads.
- Successful pasted imports still use `/imports/chat`, then refresh existing
  archive state.
- Source labels redact UUIDs, URLs, bearer values, token/cookie/authorization/
  API-key/password/secret assignments, and secret-shaped values.

## ARGUS Review Result

Accepted on 2026-06-19 with two UI hardening corrections.

- Confirmed server write behavior matches the readback: Memory candidates write
  Memory, Canon candidates write Canon, and rejected candidates preserve the
  private source without promotion.
- Patched reviewed cards to resync local title/content state from the
  server-returned candidate after accept/reject, so rejecting after local edits
  cannot leave stale edited text visible.
- Patched the Import Review readback grid to collapse at the existing Studio
  mobile breakpoint.
- Removed the new PR64 hook-dependency warning by memoizing the Archive refresh
  helpers; remaining web build warnings are pre-existing.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:storage` | Pass | 16 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 41 tests passed after ARGUS fixes. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled successfully, linted/typechecked, collected page data, and generated 31 static pages, then failed during standalone traced-file symlink copy with Windows `EPERM`. |
