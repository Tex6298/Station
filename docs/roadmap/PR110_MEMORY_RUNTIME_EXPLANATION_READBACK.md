# PR110 - Memory Runtime Explanation Readback

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior before MIMIR closeout.
Status: closed by MIMIR on 2026-06-20

## Why This Lane

PR109 accepted the Memory UX/observability audit and recommended this as the
next narrow slice. Current owner surfaces show Memory lifecycle state,
briefing counts, runtime context buckets, and sanitized AI activity, but they do
not yet connect those facts into a simple explanation of why Memory did or did
not enter runtime context.

This lane should improve user trust in Station's memory behavior without
opening a retrieval rewrite, public Memory, raw traces, or provider work.

## Goal

Add owner-only runtime Memory explanation readback.

The owner should be able to understand, in one compact place, which Memory
items were selected for runtime context and which relevant Memory items were
held out because of lifecycle state, source readiness, query mismatch, or safe
fallback behavior.

## Scope

DAEDALUS should implement the smallest safe slice using existing owner-only
APIs where possible:

- `/memory/persona/:personaId`;
- `/memory/persona/:personaId/briefing`;
- `/conversations/persona/:personaId/context-preview`.

Acceptable implementation shapes:

- add a small explanation section to the owner Memory page;
- and/or enrich the runtime context preview with sanitized Memory explanation
  labels;
- and/or add a narrow helper that joins existing API readback client-side.

The slice should distinguish:

- active and selected for runtime;
- active but not selected for this query/context;
- quarantined, rejected, expired, superseded, or missing lifecycle and held out;
- archive/import source held out by source readiness or lifecycle gate;
- keyword/vector/fallback retrieval mode only where already safely exposed;
- unknown/no-data states with honest fallback copy.

## Privacy Requirements

Render only sanitized counts, lifecycle labels, source labels, target labels,
and short reasons.

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
- tokens/cookies/API keys/passwords/secrets;
- raw URLs;
- raw source ids that are not already safe in the owner UI.

## Non-Scope

Do not add:

- new retrieval engine;
- retrieval ranking rewrite;
- embedding/provider changes;
- autonomous memory mutation;
- public Memory surface;
- Redis/Upstash;
- Cloudflare;
- background jobs;
- Developer Space realtime;
- billing/auth/session changes;
- broad Studio redesign;
- new AI provider calls.

## Tests

Add focused tests for:

- explanation label mapping;
- active-selected versus active-not-selected copy;
- lifecycle holdout copy for quarantined/rejected/expired/superseded/missing;
- skip-count or fallback copy if present;
- no raw prompt/private content exposure in helper output;
- visible route/helper behavior if a UI section changes.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Files changed:

- `apps/web/lib/memory-lifecycle-ui.ts`
- `apps/web/lib/memory-lifecycle-ui.test.ts`
- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`

Implementation shape:

- Added `buildMemoryRuntimeExplanation`, a client-side helper that joins the
  existing owner Memory list to the existing owner-only context preview trace.
- Added focused helper tests for selected versus active-not-selected memory,
  lifecycle/source-readiness holdouts, fallback/retrieval notes, and redaction
  of raw ids, prompts, URLs, and secret-shaped values.
- Added a compact Runtime context / Memory explanation section to the owner
  Memory page. It fetches only the existing
  `/conversations/persona/:personaId/context-preview` route and can refresh the
  preview without adding a new API.

Owner-scope and privacy notes:

- Owner scoping remains enforced by the existing session token and existing
  owner-only context-preview route.
- The UI renders selected and held-out rows without raw memory ids, owner ids,
  persona ids, trace ids, raw prompts, completions, trace bodies, provider
  payloads, private archive excerpts, raw URLs, or secrets.
- Display rows contain only sanitized target labels, source labels, lifecycle
  labels, counts, and short reasons.
- Active memory selected by the context preview is labeled as selected. Active
  memory not selected by the current preview query is labeled as eligible but
  not selected. Quarantined, rejected, expired, superseded, and missing
  lifecycle rows are labeled as held out.
- Retrieval mode, memory skip counts, archive/import skip counts, and fallback
  notes are reduced to sanitized labels and counts only.

Explicit non-scope confirmation:

- No retrieval ranking rewrite, embedding/provider change, autonomous memory
  mutation, public Memory surface, Redis/Upstash, Cloudflare, background job,
  Developer Space realtime, billing/auth/session change, broad Studio redesign,
  or new AI provider call was added.

## ARGUS Review Requirements

ARGUS should verify:

- owner scoping remains intact;
- explanation output is sanitized and contains no raw trace/private payloads;
- lifecycle holdout states do not imply active runtime use;
- selected Memory rows align with runtime context preview output;
- active-not-selected copy is honest and not presented as an error;
- no non-scope infrastructure or provider work was introduced;
- validation passed.

Because this lane changes visible owner route behavior if DAEDALUS adds the
explanation to Memory/context UI, ARGUS should wake ARIADNE after technical
acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible routes change, include web build validation. If the web build reaches
compile/lint/page generation and then hits the known Windows output cleanup
`EPERM`, report that precisely rather than treating it as an app failure.

DAEDALUS validation on 2026-06-20:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 85 tests passed, including PR110 runtime Memory explanation helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, generated 36 static pages, finalized optimization, and collected build traces before the known local Windows standalone symlink `EPERM` while copying traced files. Only pre-existing raw `<img>` warnings appeared. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files. |

## ARIADNE Visible-Route Rehearsal

Accepted by ARIADNE on 2026-06-20 for MIMIR closeout.

Local browser rehearsal covered `/studio/personas/[personaId]/memory` across
owner-loaded Memory, briefing, runtime context preview, refresh preview, desktop,
and 390px mobile states.

Result:

- The page fetched only the existing owner APIs used by the lane:
  `/memory/persona/:personaId`, `/memory/persona/:personaId/briefing`, and
  `/conversations/persona/:personaId/context-preview`.
- The new section reads as an owner-only explanation of runtime Memory behavior,
  not as a retrieval debugger or raw trace viewer.
- Selected memory rendered with the reason `Selected for this runtime preview.`
- Active-but-not-selected memory rendered as eligible but not selected for the
  preview query, without sounding like an error.
- Quarantined, expired, superseded, and missing-lifecycle memory rendered as
  held out with clear lifecycle reasons.
- Retrieval/fallback/skip notes rendered as sanitized labels and counts only.
- Refresh Preview called the context-preview route again without adding a new
  API or provider call surface.
- Raw preview trace titles, raw prompts, provider payload text, bearer/token
  strings, raw URLs, owner/persona/trace/source ids, and secret-shaped values
  did not render.
- Desktop and 390px mobile rehearsals showed no horizontal overflow or offscreen
  controls.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| Local Playwright route rehearsal with temporary `codex-pr110-route-rehearsal.spec.js` | Pass | Ran against `http://127.0.0.1:3137` with mocked owner APIs. Covered selected memory, active-not-selected memory, lifecycle holdouts, fallback notes, refresh preview, sanitization, desktop, and 390px mobile. |

ARIADNE verdict: PR110 is Station-fit as owner-only runtime Memory explanation.
MIMIR can close PR110.

## MIMIR Closeout

MIMIR closes PR110 on 2026-06-20.

PR110 is accepted as owner-only runtime Memory explanation. The Memory page now
connects lifecycle state, selected runtime Memory rows, retrieval/fallback
labels, and holdout reasons using existing owner-only APIs and sanitized output
only.

The accepted slice does not add a retrieval rewrite, raw trace viewer,
embedding/provider change, public Memory surface, autonomous memory mutation,
Redis/Cloudflare/background jobs, Developer Space realtime, billing/auth/
session changes, broad Studio redesign, or new AI calls.

Next lane: move to the backend roadmap's provider-policy work for Developer
Spaces so model/data posture becomes explicit before further provider or
Cloudflare/cache work.
