# PR526A - Discern Fresh-Head Conversational Flow Delta Audit

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
READY_FOR_ARIADNE_DELTA_AUDIT
```

## Why This Lane Exists

Discern-AI/Station advanced from the PR525A rendered visual snapshot
`de7b918e` to `ff93308b` while PR525A was being completed. The newer commit
introduces a shared conversational creation/configuration system across
fourteen surfaces. PR525A is accurate for its assigned visual target but is not
a current-head completeness assessment.

The delta is too broad and assumption-heavy to merge wholesale, and too
important to disappear behind the already accepted PR525 snapshot. PR526A is a
bounded product/render/contract audit before any implementation decision.

## Sequence Placement

- PR526A runs in parallel with PR525D-F because `ff93308b` does not change the
  main companion page, `PersonaChat`, companion rail, Forums index, Discover,
  Writing browse, or Developer Space observatory dashboards.
- PR525D-F continue against the accepted `de7b918e` composition ledger.
- PR525G hosted light-parity closeout may not call the Discern comparison
  complete until PR526A has an accepted adoption/deviation map and every
  affected pre-G item is either scheduled or explicitly deferred with a
  product reason.
- No new redesign or expansion of an affected creation/configuration surface
  should begin before PR526A and the following ARGUS boundary review.
- PR526A is audit only. Implementation, if recommended, receives separately
  numbered PR526 slices after MIMIR and ARGUS review the map.

## Exact Source Delta

```text
Discern baseline: de7b918e - feat: refine Station companion UX
Discern head:     ff93308b - feat: convert all creation/config flows to conversational interface
Tex baseline:     current fork/main after accepted PR525C
```

Inspect the complete `de7b918e..ff93308b` delta, with particular attention to:

- shared `ConversationSurface`, `MessageBubble`, `ChipGroup`,
  `InlineControls`, `ObjectCard`, `Composer`, and `useFlowEngine` primitives;
- flow definitions for Kindle companion/onboarding, persona update,
  publishing, forum-thread creation, Developer Space creation/configuration,
  public Space creation/editing, Integrity Session, Memory review, billing,
  workspace export, and profile/settings;
- `POST /flow/generate` and `DeepseekProvider` assumptions;
- localStorage persistence and restoration semantics;
- auth-token corrections and any source-only API shape assumptions;
- deleted/replaced legacy form, wizard, calibration, publish, and export flows;
- global `.conv-*` styling and its interaction with accepted Tex warm tokens.

## Required Audit Matrix

For every converted route/surface, record:

| Field | Required answer |
| --- | --- |
| Discern route/component | Exact changed route and flow definition |
| Current Tex route/component | Existing route, current UX, and product owner |
| User job | What the person is actually trying to complete |
| Source interaction | What is conversational, deterministic, generated, or merely styled like chat |
| State/persistence | In-memory, localStorage, server draft, durable mutation, resume/retry behavior |
| Backend/provider dependency | Endpoint, provider, prompt generation, auth token, and failure assumptions |
| Tex contract collision | Existing API/schema/auth/privacy/billing/moderation/retrieval rules that must win |
| Accessibility/mobile | Keyboard, focus, validation, error recovery, `390px`, and `375px` behavior |
| Recommendation | Adopt, adapt, already equivalent, split, defer, or reject, with reason |
| Numbered placement | Smallest implementation/preflight slice and dependency order |

Do not reduce the result to a list of changed files. Explain whether each
conversational surface makes the job clearer, slower, more expressive, more
recoverable, or more fragile than Tex's current implementation.

## Rendered Proof

- Render every converted surface at least at its entry and first meaningful
  interaction state against owner-safe synthetic/read-only data.
- Capture representative complete/error/resume/validation paths across the
  shared engine, including at minimum one simple settings flow, one creation
  flow, one review flow, one paid/billing flow, and one Developer Space flow.
- Check desktop, `390px`, and `375px`; record bounding boxes, document overflow,
  keyboard path, focus movement, page errors, and whether the user can recover
  without losing entered data.
- Compare the accepted Tex PR525B/C frame rather than importing Discern CSS.
- Do not mutate hosted production data or retain credentials, tokens, cookies,
  private IDs, prompts, or private content.

## Security And Product Guardrails

- Treat the source as reference, not a patch or dependency mandate.
- Do not merge or copy `POST /flow/generate`, `DeepseekProvider`, localStorage
  persistence, auth-token changes, deleted flows, global CSS, or package files.
- Conversational presentation does not justify moving deterministic validation,
  authorization, billing, moderation, or durable writes into model output.
- Distinguish deterministic client-side dialogue from provider-generated turns.
- Preserve Tex owner/persona/private/public boundaries, current providers,
  provider configurability, server-side authorization, honest errors,
  idempotency, auditability, and accessible non-chat fallbacks.
- Flag any flow that would expose secrets, prompts, private archive/memory,
  billing objects, ingestion keys, raw IDs, or moderation internals.
- Do not alter current PR525D/F files while their owners are active.

## Deliverable

Commit one implementation-grade adoption/deviation map containing:

- changed surface inventory and shared-engine anatomy;
- per-surface audit matrix;
- rendered desktop/mobile evidence;
- backend/provider/auth/persistence/security boundary map;
- reusable-primitives recommendation for Tex;
- exact dependency graph and proposed PR526B+ slices;
- explicit interaction with PR525D-G and the list of surfaces frozen pending
  this result;
- complete permitted deviations and rejected assumptions;
- no code implementation.

Then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR526A fresh-head conversational-flow delta audit.
Task:
- Review the adoption/deviation map, lock numbered implementation or deferral
  placement, and wake ARGUS for backend/security boundary preflight before any
  source-derived engine or endpoint is implemented.
```

Do not return to foreground wait without a committed audit result and MIMIR
handoff or a committed exact rendering/repository blocker.
