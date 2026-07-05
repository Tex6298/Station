# PR489 - Station Assistant Contextual Operations Preflight

Date: 2026-07-05

Opened by: MIMIR / A1

Owner: ARGUS / A3

Status: open hostile preflight

## Why This Lane

PR488 background-job activation is blocked on queue-capable config. MIMIR is
therefore deferring workers and choosing the next customer-facing product lane
that can safely move without new external configuration.

Station Assistant is already accepted as an operational guide, not a persona and
not an autonomous executor. PR399 refreshed the Assistant action map. Since then,
the owner surfaces have become sharper:

- Document Migrator Archive handoff;
- Global Archive result provenance;
- owner background-job readback and inline fallback;
- export/readback evidence;
- publishing/retract evidence;
- Memory inbox and companion shortcuts.

The question for this lane is whether Assistant can become a more useful
contextual operations home over those accepted surfaces without adding autonomy,
provider calls, or new backend contracts.

## Accepted Baseline

ARGUS should assume the following accepted baseline:

- Assistant routes exist and require auth.
- Assistant gives operational guidance only.
- Assistant is not a persona and has no Canon/Memory of its own.
- Assistant does not publish, retract, delete, import, create Spaces, change
  billing, run workers, call providers, or perform autonomous actions.
- Existing accepted Assistant routes include archive, import review, publishing,
  continuity/integrity, export, quota/settings, and setup guidance.

## Candidate PR489A Slices

ARGUS should choose the smallest useful slice, patch this preflight if needed,
and wake DAEDALUS only if a safe implementation boundary exists.

### Option 1 - Assistant Current Operations Brief

`PR489A - Assistant Current Operations Brief`

Add or refine `/studio/assistant` so it summarizes current operational state from
existing safe sources and accepted owner surfaces:

- Archive/search;
- Import Review;
- background jobs;
- export;
- publishing;
- continuity/integrity;
- quota/settings if already available.

No provider/model call. No autonomous execution. No new API route unless ARGUS
names the exact existing API gap and scopes the smallest unblock.

### Option 2 - Assistant Next-Step Launcher

`PR489A - Assistant Next-Step Launcher`

Make the Assistant action cards more useful after PR485-PR488 work:

- link only to existing owner-safe routes;
- show concrete owner next steps for Archive review, Memory inbox, Global Archive
  search, export readback, publishing queue, and settings/quota;
- remove or demote placeholder-looking controls.

No automatic import, publish, export, worker, queue, or provider action.

### Option 3 - Assistant Background Job Explanation

`PR489A - Assistant Background Job Explanation`

Turn the PR488 blocker into owner-facing product copy without pretending workers
are live:

- explain inline fallback;
- explain owner job status/readback;
- explain the queue-capable blocker;
- link to an existing `/background-jobs` backed UI only if the route already
  exists, or if ARGUS explicitly accepts a tiny readback surface.

No worker activation, queue adapter, Redis Memory truth, or public status.

### Option 4 - Defer Or Unblock

Block/defer if Assistant is already sufficient, or if every useful slice requires
new API/provider/autonomy work. If blocked, name the concrete smallest unblock
lane rather than opening broad Assistant hardening.

## Expected ARGUS Output

Return one of:

```text
ACCEPT_PR489A_ASSISTANT_CURRENT_OPERATIONS_BRIEF
ACCEPT_PR489A_ASSISTANT_NEXT_STEP_LAUNCHER
ACCEPT_PR489A_ASSISTANT_BACKGROUND_JOB_EXPLANATION
BLOCKED_NEEDS_UNBLOCK_LANE
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with:

- exact files/surfaces in scope;
- exact forbidden surfaces;
- focused tests;
- whether ARIADNE hosted rehearsal is required after ARGUS accepts implementation.

Visible UI changes require ARIADNE hosted rehearsal before closeout.

## Guardrails

Do not add:

- autonomous Assistant execution;
- provider/model calls;
- prompt or retrieval changes;
- new imports, exports, publishing, deletion, billing, workers, queues, Redis
  Memory truth, Cloudflare, connectors, OAuth, or social dispatch;
- public Assistant behavior;
- broad Studio redesign;
- private payload readback;
- placeholder controls.

Do not expose:

- private source bodies;
- full transcripts;
- prompts, completions, or provider payloads;
- raw ids in display fields;
- storage paths or signed URLs;
- database URLs;
- tokens, cookies, API keys, webhook secrets, or secret-shaped values.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR488 background-job activation is blocked on queue-capable config; MIMIR accepted the blocker and is not routing worker work to DAEDALUS.
- MIMIR opened PR489 as the next customer-facing lane that does not need new external config: Station Assistant contextual operations.
Task:
- Hostile-preflight the smallest safe PR489A Station Assistant contextual-operations slice.
- Choose current operations brief, next-step launcher, background-job explanation, a concrete unblocker, defer, or MIMIR decision.
- If accepted, wake DAEDALUS with exact implementation boundary, tests, guardrails, and ARIADNE rehearsal requirement if visible UI changes.
Guardrails:
- Preserve Assistant as operational guidance only, not a persona or autonomous executor. Do not open provider calls, prompt/retrieval changes, imports, exports, publishing, deletion, billing, workers, queues, Redis Memory truth, Cloudflare, connectors, OAuth, social dispatch, public Assistant behavior, broad redesign, private payload readback, or placeholder controls.
```
