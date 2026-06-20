# PR109 - Memory UX Observability Audit

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS audits or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible routes change.
Status: implemented by DAEDALUS; awaiting ARGUS review

## Why This Lane

Community Beta is now accepted as protected-beta complete. The next product
priority returns to Station's core promise: Memory, continuity, and
observability that help a user understand what the system remembers, why it was
used, and what happened during AI activity.

`docs/roadmap/STATION_FUTURE_LANES.md` already identifies Lane 6 as Memory UX
and observability. PR60-PR67 also landed prior Memory/observability work. Before
adding another surface, Station needs a precise audit of what is already real,
what is stale, and what the next smallest user-value slice should be.

## Goal

Produce a Memory UX/observability closure-and-next-slice packet.

This PR should be documentation/test-evidence first. If DAEDALUS finds a narrow
broken blocker in existing Memory/observability surfaces, fix only that blocker
and document it.

## Scope

DAEDALUS should:

- audit accepted Memory/observability work from PR60-PR67 and related current
  docs;
- inspect the current Studio Memory, lifecycle/handoff, runtime context preview,
  Settings AI activity/observability, and API trace readback surfaces;
- classify remaining work as:
  - required blocker for the next Memory UX/observability slice;
  - next recommended narrow implementation lane;
  - future expansion;
  - stale/already satisfied;
- update roadmap docs so the next Memory UX/observability lane is clear;
- run the narrow validation set;
- wake ARGUS with a concrete recommendation for the next implementation PR.

## Audit Questions

Answer these directly:

- Can an owner see active/rejected/quarantined/superseded/expired Memory state
  clearly enough to understand runtime context?
- Can an owner tell why a memory did or did not enter runtime context without
  exposing private raw trace payloads?
- Are AI activity/observability surfaces useful, owner-scoped, and sanitized?
- Are lifecycle and handoff records visible enough to support continuity, or is
  there a missing next slice?
- Are Memory graph edges present, absent, or too thin for UI work?
- Which next implementation has the most product value with the least privacy
  risk?

## Non-Scope

Do not add:

- broad Studio redesign;
- public Memory, private archive, or raw trace exposure;
- embedding/provider changes;
- Redis/Upstash or Cloudflare work;
- background jobs;
- Developer Space realtime changes;
- billing/auth/session work;
- autonomous memory mutation;
- new AI provider calls.

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

If DAEDALUS touches visible routes, include web build validation and ARGUS
should wake ARIADNE after technical review.

## DAEDALUS Audit Result

Implemented on 2026-06-20 as a documentation/test-evidence audit only. No code
or visible route behavior changed.

Updated:

- `docs/roadmap/MEMORY_UX_OBSERVABILITY_AUDIT.md`
- `docs/roadmap/PR109_MEMORY_UX_OBSERVABILITY_AUDIT.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Recommendation: open `PR110 - Memory Runtime Explanation Readback`.

Audit summary:

| Classification | Items |
| --- | --- |
| Required blocker before next Memory UX/observability slice | None found. |
| Next recommended narrow implementation lane | Owner-only Memory runtime explanation readback connecting lifecycle state, selected runtime Memory rows, retrieval mode, and skip/holdout reasons without raw trace/private payload exposure. |
| Already satisfied / stale if reopened generically | Memory lifecycle counters/actions/copy; runtime context bucket preview; Settings AI Activity summary/list; persona lifecycle/handoff readback; archive import review, continuity, and integrity trust readback. |
| Future expansion | Trace detail expansion, richer Memory graph UI, deeper lifecycle/handoff workflows, Developer Space realtime/observability expansion. |
| Explicit non-goals | Broad Studio redesign, public Memory, raw traces/prompts/private archive exposure, embedding/provider changes, Redis/Upstash, Cloudflare, background jobs, Developer Space realtime, billing/auth/session, autonomous memory mutation, and new AI provider calls. |

Validation run by DAEDALUS:

```bash
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:continuity
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

`test:persona-context` passed 7 tests, `test:conversation-archive` passed 35
tests, `test:continuity` passed 5 tests, `test:studio-ui` passed 82 tests, and
`typecheck` passed. `git diff --check` passed with CRLF normalization warnings
only. No ARIADNE rehearsal is required because PR109 changes docs only.

## ARGUS Review

Accepted by ARGUS on 2026-06-20 for MIMIR sequencing.

Review result:

- The audit is docs/test-evidence only; no code or visible route behavior
  changed.
- No required blocker was found before the next Memory UX/observability slice.
- The PR110 recommendation is accepted as the next narrow lane: owner-only
  Memory runtime explanation readback connecting lifecycle state, selected
  runtime Memory rows, retrieval mode, and skip/holdout reasons without raw
  trace/private payload exposure.
- Already satisfied/stale items are correctly classified: Memory lifecycle
  counters/actions/copy, runtime context bucket preview, Settings AI Activity
  summary/list, persona lifecycle/handoff readback, archive import review,
  Continuity, and Integrity trust readback.
- Future expansion remains outside the next lane: trace detail expansion,
  richer Memory graph UI, deeper lifecycle/handoff workflows, and Developer
  Space realtime/observability expansion.
- Explicit non-goals remain non-goals: broad Studio redesign, public Memory,
  raw trace/prompt/private archive exposure, embedding/provider changes,
  Redis/Upstash, Cloudflare, background jobs, Developer Space realtime,
  billing/auth/session, autonomous memory mutation, and new AI provider calls.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 82 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only for triad state. |

Recommendation: MIMIR should open `PR110 - Memory Runtime Explanation Readback`.
