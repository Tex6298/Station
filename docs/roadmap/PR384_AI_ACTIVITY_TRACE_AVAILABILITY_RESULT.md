# PR384 - AI Activity Trace Availability Result

Date: 2026-06-27
Owner: A2 / DAEDALUS
Reviewer: A3 / ARGUS
Status: ready for ARGUS review.

## Summary

DAEDALUS investigated the PR383 caveat where Settings AI Activity was visible
but no trace detail row was available to open.

The code evidence points to a storytelling/readback gap, not a traced-chat
implementation gap:

- normal chat and streaming chat both call the same `runPersonaChatTurn` path;
- that turn starts an AI trace, records budget/provider events, and completes or
  fails the trace around provider-backed chat work;
- `/observability/traces?limit=6` already renders openable rows when trace rows
  exist;
- `/observability/traces/:traceId` already has owner-scoped sanitized detail
  coverage in `test:replay-readiness`;
- read-only replay pages, Memory, Archive, Continuity, context previews, and
  similar inspection stops should not create traces by themselves.

The smallest patch is therefore honest empty-state copy in Settings AI Activity.
When no openable trace rows are returned, the UI now explains that only
provider-backed chat and integrity AI calls create trace rows, and only when
observability storage accepts the write. It also makes clear that read-only
replay surfaces do not create trace rows.

## Changed Files

- `apps/web/components/settings/ai-observability-panel.tsx`
- `apps/web/lib/ai-observability-ui.ts`
- `apps/web/lib/ai-observability-ui.test.ts`
- `docs/roadmap/PR384_AI_ACTIVITY_TRACE_AVAILABILITY_DAEDALUS.md`
- `docs/roadmap/PR384_AI_ACTIVITY_TRACE_AVAILABILITY_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Case Classification

PR384 found this case:

```text
UI empty state was technically safe but too thin for replay.
```

The patch did not add trace creation, provider routing, chat behavior, schema, or
observability API changes.

If a provider-backed chat creates a trace row, the existing list has a `View
details` action. If no row exists after a human replay, the page now says why
read-only checks do not produce rows and why trace availability depends on the
trace write succeeding.

## Sanitization And Owner Scope

- Existing `test:replay-readiness` proves trace detail is owner-scoped and
  sanitized to an allow-listed shape.
- Existing AI observability helper tests prove trace facts, event facts, labels,
  failure copy, metadata, and detail errors avoid raw ids, prompts, URLs,
  secrets, and provider payloads.
- PR384 adds empty-state coverage proving the new copy distinguishes trace
  writers from read-only replay without exposing raw ids, prompts, completions,
  or provider payload wording.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass, 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/ai-observability-ui.test.ts` | Pass, 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 126 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass. |
| `git diff --check` | Pass with CRLF normalization warnings only. |

## ARGUS Review Request

Please verify:

- the investigation classification is fair;
- the empty state is honest without implying every replay readback creates a
  trace;
- existing owner-scoped sanitized list/detail behavior remains sufficient for
  this lane;
- no provider, chat, trace storage, schema, migration, queue, Redis, Cloudflare,
  billing, export, or broad Settings behavior changed.

If accepted, wake MIMIR and recommend either a narrow hosted AI Activity proof
or folding this into the next PR381/PR383-style owner rehearsal after deploy.
