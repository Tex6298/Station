# PR63 - Integrity Review Trust Readback

Date: 2026-06-19
Status: accepted by ARGUS; ready for ARIADNE rehearsal
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides the next lane.

## Purpose

Continue the Memory UX / observability lane after PR60-PR62 by making
Integrity Session review feel trustworthy.

Integrity is where user answers become proposed memory, canon, boundaries,
themes, and preference-profile updates. The current page is functional, but the
review step still reads like raw admin controls: lowercase clusters/statuses,
weak destination copy, inline layout styles, and limited explanation of what
accept/edit/reject will write. PR63 should make the owner understand what will
change before pressing a button.

## Existing Foundations

Start from the current owner-only surfaces and routes:

- `apps/web/app/studio/personas/[personaId]/calibration/page.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/components/studio/persona-management.tsx`
- `apps/web/lib/continuity-ui.ts`
- `apps/web/lib/continuity-ui.test.ts`
- `apps/api/src/routes/integrity.ts`
- `apps/api/src/services/integrity-session.service.ts`
- `apps/api/src/routes/integrity.test.ts`
- `apps/api/src/routes/persona-context.test.ts`
- `packages/types/src/persona.ts`

Relevant existing APIs:

- `POST /integrity/start`
- `POST /integrity/answer`
- `POST /integrity/confirm-summary`
- `POST /integrity/end-early`
- `GET /integrity/outputs/:sessionId`
- `PATCH /integrity/outputs/:outputId`
- `GET /integrity/history/:personaId`
- `GET /personas/:id`

Existing write semantics:

- `memory_candidate` writes to memory.
- `boundary` writes to memory with boundary framing.
- `canon_candidate` writes to canon.
- `preference` updates the persona preference profile.
- `theme` updates recurring topics in the preference profile.

## Scope

Implement a bounded owner-only Integrity review UX/readback slice:

- Improve `/studio/personas/:personaId/calibration` so it explains the session
  and review lifecycle in plain language.
- Add owner-friendly labels for:
  - session types;
  - clusters;
  - output types;
  - output statuses;
  - write destinations.
- Show a compact Integrity overview using existing data:
  - total sessions;
  - most recent session state/date;
  - pending/accepted/edited/rejected output counts from recent history;
  - current persona continuity summary counts if already available from
    `GET /personas/:id`.
- Make the output review cards explicit:
  - "Accept writes the generated text to Memory";
  - "Edit then accept writes the text in this box to Canon";
  - "Dismiss keeps the session record but does not write this output";
  - show the destination after write using `written_to`.
- Refresh or locally update visible history/overview after accept/edit/reject.
  If refreshing the persona continuity summary is cheap, do it after writes so
  counts reflect new memory/canon/preference state.
- Replace brittle inline layout styling where touched with small CSS classes or
  helper components, but do not start a broad redesign.
- Add focused helper tests for any new Integrity labels, destination copy,
  status summaries, or history count helpers.
- Keep desktop and `390px` mobile fit in mind.

## Non-Scope

- No Integrity Session engine rewrite.
- No new question-bank behavior.
- No prompt/model/provider changes.
- No AI extraction quality tuning.
- No new API route behavior unless a tiny response-shape type gap is
  unavoidable.
- No schema or migration work.
- No public Integrity page.
- No publication workflow changes.
- No memory/canon candidate workflow beyond the existing Integrity output
  accept/edit/reject flow.
- No raw session transcript display outside the active answer/summary UI the
  owner is already editing.
- No raw trace/event payload display.
- No Redis, Cloudflare, provider migration, Project work, hosted runtime,
  worker, billing/quota, DexOS, or broad redesign.

## Acceptance

ARGUS can accept PR63 if:

- The Integrity page remains owner-only and uses existing owner-scoped APIs.
- Review cards clearly explain what accept/edit/reject will do before writing.
- Output labels and status summaries are readable without exposing raw private
  IDs, raw API payloads, raw traces, URLs, bearer values, token/API-key/cookie/
  password/secret assignments, or secret-shaped values in the new readback.
- Accept/edit/reject still use the existing `PATCH /integrity/outputs/:outputId`
  route and update visible history/overview afterward.
- No engine, schema, provider, public route, Redis, Cloudflare, Project,
  hosted-runtime, worker, billing, broad redesign, or DexOS scope is added.
- Desktop and narrow mobile layout risk is addressed.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:integrity
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If a new web helper test is added, make sure it is covered by either
`test:studio-ui` or `test:integrity`. If a web build is run, record the known
Windows standalone symlink `EPERM` separately from compile/type/page-generation
success.

## Handoff

Wake ARGUS with:

- exact files changed;
- session/cluster/output/status/destination labels added;
- review-card write-behavior copy;
- accept/edit/reject refresh behavior;
- privacy boundary for IDs, URLs, secrets, raw traces, raw API payloads, and raw
  transcripts;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no Integrity engine, schema, provider, public route,
  publication workflow, memory/canon candidate workflow beyond existing output
  review, Redis, Cloudflare, Project, hosted runtime, worker, billing, or DexOS
  work was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- signed owner `/studio/personas/:personaId/calibration`;
- Integrity overview/history readability;
- output review cards and destination copy;
- accept/edit/reject visible update behavior if safe to rehearse on replay data;
- 390px layout with no horizontal overflow or offscreen controls;
- no raw IDs, URLs, bearer values, token assignments, secret-shaped values, raw
  traces, raw API payloads, or unintended raw transcripts visible in new
  readback surfaces.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation Result

Implemented as an owner-only UI/readback slice on the existing calibration
page. No API route behavior, schema, Integrity engine, question bank, prompt,
model/provider, extraction, publication workflow, Redis, Cloudflare, Project,
hosted runtime, worker, billing, or DexOS behavior changed.

### Labels And Overview

- Added `apps/web/lib/integrity-ui.ts` for owner-friendly labels:
  - session types;
  - clusters;
  - output types;
  - output statuses;
  - write destinations.
- `/studio/personas/:personaId/calibration` now shows an Integrity Overview
  with:
  - total sessions;
  - latest session status;
  - pending/accepted/dismissed output counts;
  - current memory/canon/continuity counts from the existing persona summary.
- Session history now uses friendly session/status/cluster labels and reviewed
  output counts.

### Review Card Write Behavior

- Each output card now explains before writing:
  - accepting writes the generated text to the destination;
  - editing then accepting writes the text in the edit box to the destination;
  - dismissing keeps the session record but does not write the output.
- Destination copy maps:
  - `memory_candidate` and `boundary` to Memory;
  - `canon_candidate` to Canon;
  - `preference` and `theme` to Preference profile.
- After write, `written_to` is shown with a friendly destination label.

### Refresh Behavior

- Accept/edit/reject still uses the existing
  `PATCH /integrity/outputs/:outputId` route.
- After review, the page updates the output locally and refreshes both:
  - `GET /integrity/history/:personaId`;
  - `GET /personas/:id`.
- The overview can therefore reflect updated history and cheap persona summary
  counts after review.

### Focused Tests

- Added `apps/web/lib/integrity-ui.test.ts`.
- Added the helper test to `test:studio-ui`.

## Validation Result

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:integrity` | Pass | 2 tests passed; existing Integrity lifecycle/output review behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed; runtime context behavior stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 39 tests passed, including Integrity label/review-copy/history helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

## Scope Confirmation

- No Integrity engine rewrite.
- No question-bank, prompt, model/provider, AI extraction tuning, public
  Integrity page, publication workflow, schema, API route behavior, raw trace
  display, raw API payload display, Redis, Cloudflare, Project work, hosted
  runtime, worker, billing/quota, or DexOS work.
- The active answer/summary UI remains the only place where the owner sees and
  edits their own session text.

## ARGUS Review Result

Accepted on 2026-06-19 with one copy correction.

- Confirmed the destination labels match the existing server write path:
  - `memory_candidate` and `boundary` write to Memory;
  - `canon_candidate` writes to Canon;
  - `preference` and `theme` write to the Preference profile.
- Tightened review-card copy so Accept says it writes the generated text, while
  Edit then accept says it writes the text in the edit box.
- Confirmed accept/edit/reject still use the existing owner-scoped
  `PATCH /integrity/outputs/:outputId` route, then refresh history and persona
  summary readback.
- Confirmed no new raw trace, raw API payload, URL, bearer value, token/API-key/
  cookie/password/secret assignment, secret-shaped value, or public/private
  route behavior was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:integrity` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 39 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled successfully, linted/typechecked, collected page data, and generated 31 static pages, then failed during standalone traced-file symlink copy with Windows `EPERM`. |
