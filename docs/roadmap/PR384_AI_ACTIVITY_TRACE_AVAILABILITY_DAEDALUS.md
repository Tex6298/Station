# PR384 - AI Activity Trace Availability

Opened: 2026-06-27
Owner: DAEDALUS
Status: ready for ARGUS review

## Purpose

Resolve the PR383 caveat: Settings AI Activity was visible, but no trace detail
row was available to open during the owner continuity/search rerun.

This is a narrow trace availability/storytelling lane. It is not provider
routing, model config, Redis, Cloudflare, worker, queue, schema, migration,
billing, export, chat behavior, or broad Settings redesign.

## Current Evidence

PR383 passed the repaired owner route:

- Memory raw JSON source-material defect is gone.
- Runtime-context readback stayed safe.
- Global Archive redaction still holds.
- Archive/File and Continuity stops remain reachable.

Caveat:

- AI Activity was visible in Settings.
- No trace detail row was available to open.
- ARIADNE did not send another chat prompt in PR383 because the redaction proof
  did not require mutation.

PR381 did send one bounded chat prompt and still reported AI Activity visible
with no trace detail row available to open. That means PR384 should not assume
this is just because PR383 skipped chat.

## Investigation Targets

Map the current code paths:

- `apps/web/components/settings/ai-observability-panel.tsx`
- `apps/web/lib/ai-observability-ui.ts`
- `apps/api/src/routes/observability.ts`
- `apps/api/src/services/ai-observability.service.ts`
- conversation/integrity routes that call `startAiTrace`, `recordAiTraceEvent`,
  and `completeAiTrace`

Answer these with evidence:

- When should a replay-owner conversation create an AI trace?
- Are hosted replay/staging responses using a path that intentionally does not
  create a provider trace?
- Does `/observability/summary` count traces while `/observability/traces` lists
  none?
- Does `/observability/traces?limit=6` return rows that the UI fails to make
  openable?
- Does `/observability/traces/:traceId` work for a listed trace and stay
  sanitized?
- Is the empty state honest enough for a human replay, or does it make the
  route feel broken?

## Implementation Guidance

If the route is correct but no trace should exist:

- Patch copy/readback so the empty state explains that traces appear only after
  provider-backed chat or integrity calls, not after every safe replay readback.
- Keep it concise and product-facing.

If a trace should exist but is missing:

- Patch the smallest trace creation/completion/listing gap.
- Keep trace metadata sanitized; do not store prompt text, completion text,
  vectors, provider payload bodies, raw source bodies, keys, raw owner/persona
  IDs, SQL, or stack traces.

If trace rows exist but no detail is openable:

- Patch the list/detail UI or API boundary so each listed trace has an owner-safe
  `View details` path.
- Preserve existing sanitization helpers and tests.

Do not change provider/model routing, embedding behavior, chat answer behavior,
retrieval semantics, Redis/Cloudflare/cache/worker/queue infrastructure,
billing, exports, schema, migrations, or broad Settings layout.

## Validation

Run the most focused relevant set:

```bash
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If you touch conversation trace creation, also run the relevant conversation
tests and state which ones.

## Handoff To ARGUS

Wake ARGUS with:

- Which case the investigation found.
- Files changed, if any.
- Exact trace availability/readback behavior after the patch.
- Proof list/detail stays owner-scoped and sanitized.
- Validation commands and results.
- Whether ARIADNE should rerun the PR381/PR383 human route or run a narrower AI
  Activity hosted proof.

## DAEDALUS Result

Result doc:
`docs/roadmap/PR384_AI_ACTIVITY_TRACE_AVAILABILITY_RESULT.md`.

Investigation result:

```text
UI empty state was technically safe but too thin for replay.
```

Evidence:

- normal chat and streaming chat both call `runPersonaChatTurn`;
- `runPersonaChatTurn` starts an AI trace and records provider/budget events
  around provider-backed chat work;
- `/observability/traces?limit=6` already provides rows for the Settings panel
  to render with `View details`;
- `/observability/traces/:traceId` already has owner-scoped sanitized detail
  coverage through `test:replay-readiness`;
- read-only replay pages, Memory, Archive, Continuity, and context previews do
  not create traces by themselves.

Patch:

- Added a tested `traceListEmptyStateCopy` helper.
- Settings AI Activity now explains that no openable traces exist until
  provider-backed chat or integrity AI calls write trace rows, and that
  read-only replay pages do not create trace rows.
- No provider routing, chat behavior, trace storage, API, schema, migration,
  Redis, Cloudflare, worker, queue, billing, export, or broad Settings behavior
  changed.

Validation passed:

- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness`;
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts`;
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`;
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck`;
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`;
- `git diff --check` passed with CRLF normalization warnings only.
