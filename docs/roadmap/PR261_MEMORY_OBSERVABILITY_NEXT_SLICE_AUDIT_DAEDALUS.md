# PR261 - Memory Observability Next Slice Audit

Owner: A2 / DAEDALUS

Status: open

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

Developer Space Tier 1 protected-alpha is closed for now after PR260. The
standing non-Developer-Space priority is Memory UX and observability, but Lane 6
already contains several accepted slices: runtime explanation, lifecycle review,
AI trace sanitization/readback, Memory graph relationship readback, graph edge
recording, hosted timing measurement, and Archive retrieval batching.

Before opening another implementation, audit the current Memory/observability
surface and recommend the next narrow slice from evidence.

This is a docs/audit lane. Do not implement product code.

## Inputs

- `docs/roadmap/STATION_FUTURE_LANES.md`, Lane 6.
- `docs/roadmap/MEMORY_UX_OBSERVABILITY_AUDIT.md`
- `docs/roadmap/PR109_MEMORY_UX_OBSERVABILITY_AUDIT.md`
- `docs/roadmap/PR110_MEMORY_RUNTIME_EXPLANATION_READBACK.md`
- `docs/roadmap/PR143_MEMORY_LIFECYCLE_REVIEW_SURFACE.md`
- `docs/roadmap/PR146_MEMORY_GRAPH_RELATIONSHIP_READBACK.md`
- `docs/roadmap/PR150_MEMORY_GRAPH_EDGE_RECORDING.md`
- `docs/roadmap/PR151_MEMORY_SUPERSESSION_OWNER_CONTROL.md`
- `docs/roadmap/PR192_MEMORY_CONTINUITY_OBSERVABILITY_UX_FIRST_SLICE.md`
- `docs/roadmap/PR193_ARIADNE_CONTINUITY_MEMORY_OBSERVABILITY_REHEARSAL.md`
- Current owner-facing Memory, Continuity, Archive, Integrity, Settings
  observability, and context-preview route/test files as evidence only.

## Questions To Answer

1. Which Memory/observability slices are already done enough for
   protected-alpha?
2. Which user-facing gaps still weaken Station's core promise around
   recallable memory, continuity, provenance, and trust?
3. Which gap has the best evidence-backed next implementation shape?
4. Should the next slice be:
   - deeper Memory lifecycle/handoff workflow;
   - Memory graph exploration now that edge recording exists;
   - richer AI trace detail/readback behind existing sanitization;
   - Continuity/Archive/Memory provenance stitching;
   - hosted replay measurement/rehearsal only; or
   - no immediate Memory slice until fresh user/replay evidence names a gap?
5. What exact ARGUS safety gates and ARIADNE rehearsal routes would apply if
   the next slice is visible?

## Constraints

- Keep Supabase as memory/archive/continuity truth.
- Do not change provider execution, embeddings, vector dimensions, retrieval
  ranking, Redis/Cloudflare roles, queue/worker behavior, billing, auth/session,
  migrations, env config, deployment, public memory, or public observability.
- Do not expose raw traces, prompts, completions, provider payloads, private
  archive excerpts, raw source ids, raw link ids, owner ids, bearer tokens,
  secrets, SQL, stack traces, or hosted logs.
- Do not start a broad UI redesign.
- Do not turn observability into a substitute for clear product behavior.

## Deliverables

Add:

- `docs/roadmap/MEMORY_OBSERVABILITY_NEXT_SLICE_AUDIT.md`

Update:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/testing/VALIDATION_BASELINE.md` only if you add concrete validation
  evidence.

The audit should recommend exactly one of:

- close/no immediate Memory implementation;
- one narrow DAEDALUS implementation lane;
- ARGUS preflight before implementation;
- ARIADNE rehearsal/measurement before implementation.

## Validation

Run:

```bash
git diff --check
git diff --cached --check
```

If you inspect code/tests for evidence, list the files or commands inspected.
Do not run broad suites unless the audit changes product code, which should be
out of scope.

## Wake ARGUS

When complete, commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR261 Memory Observability Next Slice Audit.
- Recommendation: ...
Validation:
- ...
Risk:
- ...
Task:
- Review the evidence, privacy boundaries, and whether the recommended next
  lane is correctly scoped.
```
