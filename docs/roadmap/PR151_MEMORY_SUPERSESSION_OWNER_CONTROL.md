# PR151 - Memory Supersession Owner Control

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks; ARGUS reviews; ARIADNE
rehearses after technical acceptance because this changes visible owner UI.
Status: accepted by ARGUS; waking ARIADNE for owner-visible rehearsal

## Why This Lane

PR150 made explicit lifecycle supersession create real owner-scoped
`memory_item_edges` rows. That gives Station a meaningful Memory graph edge
path, but the owner-facing Memory page still only exposes Reinforce, Restore,
Quarantine, and Reject controls.

Without a visible owner control for choosing a replacement memory, the new graph
edge path remains mostly API/test-only. The next useful slice is therefore not a
graph canvas or inferred relationship engine. It is a small owner-only control
that lets a user mark one memory as superseded by another existing memory.

## Goal

Let an owner explicitly mark a memory item as superseded by another memory item
from the Memory page, using the existing `PATCH /memory/:id/lifecycle` route and
the PR150 edge recording behavior.

## Scope

DAEDALUS should inspect:

- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`;
- `apps/web/lib/memory-lifecycle-ui.ts`;
- `apps/web/lib/memory-lifecycle-ui.test.ts`;
- `apps/api/src/routes/memory.ts`;
- `apps/api/src/routes/persona-context.test.ts`;
- `apps/web/components/studio/persona-management.tsx`;
- `apps/web/lib/persona-lifecycle-ui.ts`.

Implement the smallest safe slice:

- add an owner-only supersession control to saved Memory items when at least one
  other memory item can be selected as the replacement;
- exclude the source memory itself from replacement choices;
- submit `{ status: "superseded", supersededByMemoryItemId: replacementId }`
  through the existing lifecycle route;
- preserve the existing Restore behavior that clears `supersededByMemoryItemId`;
- use sanitized labels/summaries for replacement choices and action copy;
- after a successful supersession, update local lifecycle state and refresh the
  Memory briefing/runtime preview as the page already does;
- keep Persona Management relationship readback unchanged except for any needed
  copy/link that helps the owner find the graph readback after a supersession;
- add focused helper tests for replacement-option labels/copy and redaction;
- run the API graph tests from PR150 to prove the UI action still targets the
  safe route.

If a compact inline select makes the Memory cards too dense, DAEDALUS may use a
small reveal/details area, but this should remain a bounded owner control, not a
redesign of the Memory page.

## Privacy Requirements

Visible UI must not show:

- raw memory item ids;
- owner ids;
- persona ids;
- raw edge ids;
- raw source ids;
- raw URLs;
- raw prompts, completions, trace bodies, provider payloads, or private archive
  excerpts;
- tokens, cookies, API keys, passwords, bearer values, webhook secrets, DB URLs,
  or other secret-shaped values.

IDs may be used internally as select values and route payloads, but option text
and status copy must be sanitized and bounded.

## Non-Scope

Do not add:

- graph canvas/force-directed visualization;
- public Memory graph surfaces;
- embedding/provider relationship inference;
- fuzzy or automatic relationship generation;
- Redis/Upstash or Cloudflare graph/index work;
- background jobs or workers;
- import retry repair;
- context-preview latency optimization;
- billing/auth/session changes;
- broad Studio or site-wide redesign.

## Tests

Run focused validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If DAEDALUS adds no API code, `test:persona-context` still matters because the
UI control relies on the PR150 lifecycle edge route.

## Review Focus

ARGUS should review:

- replacement choices exclude self and cannot bypass the API same-owner checks;
- visible option labels and action copy do not leak raw ids or private payloads;
- the UI does not imply Station inferred semantic relationships automatically;
- Restore still clears supersession state;
- relationship readback remains honest and only shows real edge rows.

ARIADNE should rehearse the owner flow after ARGUS acceptance:

- sign in as the replay owner;
- open the Memory page for a replay persona with at least two memory items;
- mark one memory as superseded by another;
- verify the Memory page shows the superseded state without raw ids;
- verify Persona Management Memory Graph relationship readback shows the real
  supersession edge after refresh;
- record only statuses, counts, labels, and high-level pass/fail observations.

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

Behavior:

- Saved Memory cards now include a compact `Supersession` reveal.
- The control lists other saved Memory items as replacement choices and excludes
  the source Memory itself.
- Submitting the control calls the existing
  `PATCH /memory/:id/lifecycle` route with
  `{ status: "superseded", supersededByMemoryItemId }`.
- Existing Restore behavior is unchanged and still clears
  `supersededByMemoryItemId`.
- After the lifecycle update succeeds, the page updates local lifecycle state
  and refreshes the Memory briefing/runtime preview through the existing reload
  helpers.
- Persona Management relationship readback was left unchanged; it remains
  honest and shows rows only when real graph edge rows exist.

Privacy:

- Replacement option text uses sanitized/bounded labels and status details.
- Raw Memory ids are used only as select values and route payloads.
- Helper tests cover redaction of raw URLs, owner/persona-like ids, prompt-ish
  labels, and secret-shaped values in visible option/copy output.

Non-claims:

- No graph canvas, public Memory graph, embedding/provider relationship
  inference, automatic relationship generation, Redis/Upstash graph work,
  Cloudflare graph/index work, worker, import repair, context latency
  optimization, billing, auth, session, broad Studio, or site-wide redesign was
  added.

Validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 99 tests passed, including supersession option/copy coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed; PR150 lifecycle edge route remains green. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typechecks passed. |
| `git diff --check` | Pass | CRLF warnings only for touched files and local triad state. |

## ARGUS Review

Accepted on 2026-06-21 after a narrow visible-label privacy patch.

ARGUS findings:

- The Supersession control is owner-visible only on the existing authenticated
  Memory page and uses the existing `PATCH /memory/:id/lifecycle` route with
  `{ status: "superseded", supersededByMemoryItemId }`.
- Replacement choices exclude the source Memory in the UI, and the API route
  remains the authority for same-owner/same-persona and self-supersession
  rejection.
- Raw Memory ids remain select values and route payloads only; visible labels and
  details are sanitized and bounded.
- Restore behavior remains on the existing lifecycle patch path and still clears
  `supersededByMemoryItemId` when restoring a held-out Memory.
- Persona Management relationship readback was not changed; it still shows rows
  only when real graph edge rows exist.
- No graph canvas, public Memory graph, embedding/provider inference, automatic
  relationship generation, Redis/Upstash graph work, Cloudflare graph/index
  work, worker, import repair, context latency optimization, billing, auth,
  session, broad Studio, or site-wide redesign was added.

ARGUS review patch:

- Hardened the shared Memory lifecycle display sanitizer for human-readable
  prompt and secret labels such as `system prompt`, `api key`, `database url`,
  and spaced owner/persona/source id labels.
- Added DB URL redaction for Memory UI helper labels.
- Added focused supersession-option regressions for spaced prompt/secret labels,
  multi-word secret-like values, DB URLs, and owner-id-shaped text.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 100 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed with 8
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff --check` passed with CRLF warnings only.

Because PR151 changes visible owner Memory UI, ARGUS wakes ARIADNE for rehearsal.
ARIADNE should supersede one replay Memory with another, verify option labels and
status copy do not show raw ids or private payloads, exercise Restore to confirm
the lifecycle state returns to active without raw ids, and refresh Persona
Management Memory Graph readback to verify the real supersession edge appears.
Record only statuses, counts, sanitized labels, and high-level pass/fail notes.
