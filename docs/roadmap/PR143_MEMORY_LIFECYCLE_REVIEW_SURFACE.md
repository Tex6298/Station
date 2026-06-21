# PR143 - Memory Lifecycle Review Surface

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE
rehearses visible behavior after ARGUS technical acceptance.
Status: accepted by ARIADNE on 2026-06-21; ready for MIMIR closeout.

## Why This Lane

ARGUS accepted PR142 as an operator packet, not a migration-ledger repair. MIMIR
accepts the missing `045`, `046`, `047`, and `048` ledger rows as an operator
caveat for now so the product roadmap can keep moving.

The user priority remains Memory UX and observability first. PR110 already made
runtime Memory selection and holdout reasons legible. The next narrow slice is
the richer owner review surface called out in Lane 6: help owners understand and
act on quarantined, rejected, expired, superseded, and otherwise held-out
Memory without exposing raw traces or private source material.

## Goal

Add an owner-only Memory lifecycle review/readback surface.

An owner should be able to tell which Memory items are active, selected,
eligible-but-not-selected, rejected, quarantined, expired, superseded, or held
out by archive/source readiness, and what action state is actually available.

## Scope

DAEDALUS should implement the smallest safe slice using existing Memory,
lifecycle, briefing, and context-preview data where possible.

Inspect current surfaces and routes before editing:

- `/studio/personas/[personaId]/memory`;
- `/memory/persona/:personaId`;
- `/memory/persona/:personaId/briefing`;
- `/conversations/persona/:personaId/context-preview`;
- existing Memory lifecycle UI helpers and tests.

The implementation should provide a compact owner-only review/readback for:

- active and selected for runtime;
- active but not selected for the current preview/query;
- rejected, quarantined, expired, superseded, or missing lifecycle;
- archive-backed or import-backed Memory held out by source readiness;
- safe lifecycle/action state where existing routes already support it.

Visible controls must either work end to end or be disabled/clearly labelled as
preview-only. Do not leave staging-demo dead buttons.

## Privacy Requirements

Render only sanitized lifecycle labels, source labels, target labels, status
counts, confidence/weight values already safe in the owner UI, and short
reasons.

Do not expose:

- raw system prompts;
- user prompts;
- completions;
- trace bodies;
- provider payloads;
- private archive excerpts;
- owner ids;
- persona ids;
- trace ids;
- raw memory ids;
- raw source ids;
- raw URLs;
- tokens, cookies, API keys, passwords, or secrets.

## Non-Scope

Do not add:

- migration-ledger repair;
- new retrieval engine;
- retrieval ranking rewrite;
- embedding/provider changes;
- Redis/Upstash as Memory truth;
- Cloudflare retrieval changes;
- background jobs;
- public Memory;
- autonomous memory mutation;
- broad Studio redesign;
- billing/auth/session changes;
- new AI provider calls.

## Tests

Add focused tests for:

- lifecycle review label mapping;
- active-selected versus active-not-selected display;
- rejected, quarantined, expired, superseded, and missing-lifecycle holdout
  display;
- action-control state, including disabled/preview-only behavior for unsupported
  controls;
- no raw prompt/private content/id/URL/secret exposure in review output;
- visible route behavior if the Memory page changes.

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible routes change, include web build validation. If the web build reaches
compile/lint/page generation and then hits the known Windows standalone symlink
`EPERM`, report that precisely rather than treating it as an app failure.

## ARGUS Review Requirements

ARGUS should verify:

- owner scoping remains intact;
- rejected, quarantined, expired, superseded, and missing-lifecycle Memory does
  not enter runtime context;
- held-out Memory is not presented as active runtime material;
- action controls are real, disabled, or clearly preview-only;
- output is sanitized and contains no raw trace/private payloads;
- no non-scope infrastructure, provider, Cloudflare, Redis, background job,
  public Memory, or ledger repair work was introduced;
- validation passed.

Because this lane is expected to change visible owner route behavior, ARGUS
should wake ARIADNE after technical acceptance for a human-eye rehearsal.

## DAEDALUS Result

DAEDALUS implemented PR143 on 2026-06-21 and woke ARGUS for technical review.

Implementation:

- Added `buildMemoryLifecycleReview` to `apps/web/lib/memory-lifecycle-ui.ts`.
- The helper maps owner Memory rows into sanitized review rows with:
  - active-selected;
  - active-not-selected;
  - held-out rejected/quarantined/expired/superseded/missing-lifecycle states;
  - source labels;
  - confidence and relevance-weight labels;
  - action-state readback for the existing owner-only lifecycle controls.
- The helper reuses the existing context-preview selected-source data and does
  not add new retrieval, ranking, provider, or AI calls.
- `/studio/personas/[personaId]/memory` now renders a compact owner-only
  Lifecycle review panel between Runtime context and Saved Memory.
- The new panel is readback-only. The actual working lifecycle controls remain
  in the existing Saved Memory item cards: Reinforce, Restore, Quarantine, and
  Reject.
- Prompt-shaped labels, raw ids, owner/persona/trace/source id markers, URLs,
  bearer values, token/key/password-shaped fields, and common secret-shaped
  values are redacted from review output.

Privacy proof:

- The review helper does not emit raw Memory ids, owner ids, persona ids, trace
  ids, source ids, URLs, prompt-shaped labels, or secret-shaped values.
- It renders sanitized target labels, source labels, lifecycle/status labels,
  confidence, weight, and bounded reasons only.
- No public Memory, private archive excerpts, provider payloads, raw prompts,
  completions, trace bodies, tokens, cookies, keys, passwords, or secrets were
  added to the visible review surface.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 88 tests passed, including new lifecycle review helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed after rerunning alone. A parallel run with web build raced `.next/types` generation and failed before the clean rerun. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 36 static pages, finalized optimization, then hit the known local Windows standalone symlink `EPERM` while copying traced files. Existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF warnings only for touched files and local DAEDALUS state. |

Non-scope preserved: no migration-ledger repair, Redis/Upstash Memory truth,
Cloudflare retrieval change, provider/embedding change, background job, public
Memory, autonomous mutation, broad Studio redesign, billing/auth/session change,
new AI provider call, API route change, or database migration was added.

## ARGUS Technical Verdict

ARGUS technically accepts PR143 on 2026-06-21 and wakes ARIADNE for visible
owner-route rehearsal.

Review findings:

- Owner scope remains bounded to the existing authenticated owner APIs:
  `/memory/persona/:personaId`, `/memory/persona/:personaId/briefing`,
  `/memory/:id/lifecycle`, and
  `/conversations/persona/:personaId/context-preview`.
- The new Lifecycle review panel is readback-only. It does not add mutation
  controls; working actions remain the existing Saved Memory item controls.
- Held-out rejected, quarantined, expired, superseded, and missing-lifecycle
  rows are not presented as active runtime material.
- ARGUS found and patched a narrow redaction gap where prompt/key-shaped labels
  with multi-word values could leave trailing words. The sanitizer now redacts
  whole prompt-shaped and sensitive key/value labels and preserves redaction
  tokens through source-label formatting.
- Added ARGUS regression coverage for full prompt and password-shaped label
  redaction.
- No migration-ledger repair, Redis/Upstash Memory truth, Cloudflare retrieval,
  provider/embedding, background job, public Memory, autonomous mutation, broad
  Studio redesign, billing/auth/session, new AI provider call, API route, or
  database migration scope was added.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 89 tests passed, including the new ARGUS full-label redaction regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed; web typecheck was a cache miss and executed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 36 static pages, finalized optimization, collected build traces, then hit the known local Windows standalone symlink `EPERM`. Existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for local triad/docs state. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

ARIADNE should rehearse `/studio/personas/[personaId]/memory` for owner-visible
layout, copy clarity, and whether the Lifecycle review panel lands cleanly
between Runtime context and Saved Memory without implying new fake controls.

## ARIADNE Visible-Route Verdict

ARIADNE accepts PR143 on 2026-06-21 and wakes MIMIR for closeout.

Rehearsal:

- Rehearsed `/studio/personas/[personaId]/memory` with deterministic owner data
  covering selected, eligible-not-selected, rejected, quarantined, expired,
  superseded, and missing-lifecycle Memory rows.
- Checked desktop and 390px mobile route behavior through the local web app.

UX verdict:

- The Lifecycle review panel lands cleanly between Runtime context and Saved
  Memory.
- The panel reads as owner-only runtime readiness/action-state readback, not as
  a new mutation surface.
- No buttons or fake controls appear in Lifecycle review.
- The existing Saved Memory controls remain visible as the working actions:
  Reinforce, Restore, Quarantine, and Reject.
- Desktop and 390px mobile scan without document-level horizontal overflow.
- Visible copy distinguishes selected, eligible-not-selected, held-out, restore,
  and existing-item-control states clearly enough for this slice.

ARIADNE validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes @playwright/test@1.41.2 test tmp-pr143-ariadne-memory-rehearsal.spec.js --reporter=line --workers=1` | Pass | Desktop and 390px mobile owner-route rehearsal passed against mocked owner APIs. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
