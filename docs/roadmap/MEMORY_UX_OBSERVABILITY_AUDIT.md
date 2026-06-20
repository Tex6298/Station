# Memory UX Observability Audit

Date: 2026-06-20

Status: PR109 DAEDALUS audit result, awaiting ARGUS review.

## Recommendation

Open a narrow Memory Runtime Explanation slice next.

Recommended next lane:

```text
PR110 - Memory Runtime Explanation Readback
```

Goal: help an owner understand why specific Memory items did or did not enter
runtime context, using the existing owner-only Memory briefing, lifecycle state,
and runtime context preview/trace shapes. This should be a small readback slice,
not a redesign or a new retrieval system.

No required blocker was found before opening that lane. Current Memory UX and
observability surfaces are useful enough to build from, but the clearest
remaining user-value gap is that runtime inclusion/holdout explanations are
split across the Memory page, Memory briefing counts, and Runtime Context
Preview. Owners can see state and selected sources, but the next slice should
connect those facts more directly.

## Direct Audit Answers

| Question | Answer |
| --- | --- |
| Can an owner see active/rejected/quarantined/superseded/expired Memory state clearly enough to understand runtime context? | Mostly yes. `/studio/personas/:personaId/memory` shows lifecycle counters and per-item runtime copy for active, quarantined, rejected, expired, superseded, and missing-lifecycle states through `apps/web/lib/memory-lifecycle-ui.ts`. The gap is not state visibility; it is explaining selection and non-selection beside runtime preview. |
| Can an owner tell why a memory did or did not enter runtime context without exposing private raw trace payloads? | Partially. `RuntimeContextPreview` shows selected source buckets and reasons from `/conversations/persona/:id/context-preview`; API trace metadata records searched/skipped counts. The UI does not yet connect individual Memory lifecycle holdouts, retrieval mode, skip counts, and selected Memory rows into one owner-readable explanation. |
| Are AI activity/observability surfaces useful, owner-scoped, and sanitized? | Yes for current protected-alpha use. `/settings` loads `/observability/summary` and `/observability/traces?limit=6` only after session restore. `apps/web/lib/ai-observability-ui.ts` whitelists operational facts and redacts URLs, secret-shaped values, bearer values, token/cookie/authorization/API-key/password/secret assignments, owner/private ids, and oversized metadata. |
| Are lifecycle and handoff records visible enough to support continuity, or is there a missing next slice? | Visible enough for protected-alpha continuity. Persona management renders lifecycle labels, safe handoff previews, handoff freshness, continuity/archive/integrity counts, and bounded memory graph readback. The next slice should not be lifecycle/handoff unless rehearsal finds users cannot use the current summaries. |
| Are Memory graph edges present, absent, or too thin for UI work? | Too thin for the next implementation slice. Persona management shows node/edge counts and the first nodes, and `memoryGraphReadback` handles zero-edge states. There is not enough current product pressure to build a graph UI before runtime explanation. |
| Which next implementation has the most product value with the least privacy risk? | Memory Runtime Explanation Readback. It can reuse owner-only routes and sanitized helper patterns, avoid raw prompt/trace/private archive exposure, and directly improve user trust in Station's memory behavior. |

## Classification

| Area | Classification | Evidence / decision |
| --- | --- | --- |
| Persona Memory lifecycle counters and per-item state | Already satisfied / stale if reopened as generic "show Memory state" | PR60 landed lifecycle counters/actions/copy. Current files: `apps/web/app/studio/personas/[personaId]/memory/page.tsx`, `apps/web/lib/memory-lifecycle-ui.ts`, `apps/web/lib/memory-lifecycle-ui.test.ts`. |
| Runtime context source bucket preview | Already satisfied as baseline; next lane should refine explanation | `RuntimeContextPreview` shows canon, integrity, continuity, memory, and archive sections plus selected source reasons. It is shared into persona/continuity surfaces. |
| Individual Memory inclusion/non-inclusion explanation | Next recommended narrow implementation lane | Current Memory state and runtime preview are separate. Add a small owner-only explanation that connects lifecycle state, selected Memory rows, retrieval mode, and skip counts without exposing raw trace payloads. |
| Settings AI Activity / observability summary and traces | Already satisfied for protected-alpha | `AiObservabilityPanel` renders trace count, failures, token/cost totals, recent source/status/duration/tokens/cost, and sanitized metadata. Owner-only API routes are under `observabilityRouter.use(requireAuth)`. |
| Trace detail expansion | Future expansion | Existing list/summary are enough for current UX. Detail views should open only with a sanitization spec and ARGUS privacy gates. |
| Persona lifecycle and handoff readback | Already satisfied for protected-alpha | `PersonaManagement` and `persona-lifecycle-ui` render lifecycle labels, safe handoff previews, freshness copy, and sanitized event/handoff summaries. |
| Memory graph UI | Future expansion | Current node/edge readback is intentionally bounded. Build graph exploration only when memory graph edges become meaningful enough for owner decisions. |
| Archive import review, continuity, and integrity trust readback | Already satisfied for this audit | PR62 through PR64 made these routes legible enough to support Memory/observability trust. They are not the next narrow slice. |
| Developer Space observability | Future separate product lane | PR65 accepted owner/public observatory readback. PR109 should not reopen Developer Space realtime or usage work. |
| Provider/embedding/Redis/Cloudflare/background jobs | Explicit non-goal | No current Memory UX evidence requires provider, vector, cache, queue, edge, or background infrastructure changes. |
| Public Memory or raw trace/prompt/private archive exposure | Explicit non-goal | Current route and UI posture is owner-only and sanitized; future slices must preserve that boundary. |

## Proposed PR110 Shape

Scope:

- Add a compact explanation on the owner Memory page and/or runtime context
  preview that distinguishes:
  - active and selected for runtime;
  - active but not selected for this query;
  - quarantined/rejected/expired/superseded/missing lifecycle and held out;
  - archive/import source held out by lifecycle/source readiness;
  - keyword/vector/fallback retrieval mode where already exposed safely.
- Use existing owner-only APIs where possible:
  - `/memory/persona/:personaId`;
  - `/memory/persona/:personaId/briefing`;
  - `/conversations/persona/:personaId/context-preview`.
- Render sanitized counts, state labels, source labels, and reasons only.
- Add focused helper tests for explanation labels, skip-count copy, safe
  fallback copy, and no raw prompt/private content exposure.

Non-scope:

- no new retrieval engine;
- no autonomous memory mutation;
- no public Memory surface;
- no raw system prompt, prompt, completion, trace body, provider payload,
  private archive excerpt, owner id, persona id, trace id, token, cookie, API
  key, password, secret, or URL exposure;
- no Redis/Upstash, Cloudflare, background jobs, provider/embedding migration,
  Developer Space realtime, billing/auth/session, or broad Studio redesign.

Validation for PR110 should include:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If PR110 changes visible routes, ARGUS should wake ARIADNE for owner-route
rehearsal after technical acceptance.

## PR109 Validation

DAEDALUS ran the required PR109 gate on 2026-06-20:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass, 7 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass, 35 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass, 5 tests |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 82 tests |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass |
| `git diff --check` | Pass, CRLF normalization warnings only |

PR109 changed docs only. No ARIADNE rehearsal is required unless ARGUS finds a
visible-route implication.

## ARGUS review

ARGUS accepted this audit on 2026-06-20 and recommends MIMIR open
`PR110 - Memory Runtime Explanation Readback`.

ARGUS validation repeated the PR109 gate: `test:persona-context` 7 passed,
`test:conversation-archive` 35 passed, `test:continuity` 5 passed,
`test:studio-ui` 82 passed, `typecheck` passed, and `git diff --check` passed
with CRLF normalization warnings only.
