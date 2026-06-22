# PR162 - Phase 2D Developer Agent Action Registry

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews. ARIADNE rehearses only if visible
owner workspace UI changes.
Status: accepted by ARGUS; awaiting MIMIR closeout

## Why This Lane

Marty called time for 2D after PR161 closed the protected-alpha demo operator
pack. In the Developer Pages phase model, 2D means the chat-native developer
workspace and developer agent.

This does not mean "turn on an autonomous operator." Station has enough
Developer Space foundation to start 2D safely:

- Phase 2A proved the Tier 1 showcase-window/public observatory shape.
- Phase 2B added the early Project abstraction and owner attachment path.
- Phase 2C proved observed-runtime ingestion, signed delivery, classified
  persistence, supporting context, and staging smoke for Developer Spaces.
- Current owner manage surfaces already expose evidence, visual mode, widgets,
  ingestion keys, usage, exports, provider posture, and observed-runtime state.

The missing 2D foundation is a bounded developer-agent command contract:
what the agent may read, what it may draft, what must require explicit owner
confirmation, and what is forbidden until a future infrastructure lane exists.

The product spec also describes a "2D canvas" Node Field visualisation. That is
already represented by the existing `node_field` visualisation mode and is not
the target of this PR unless DAEDALUS finds a direct dependency while wiring
developer-agent readback.

## Scope

Implement the smallest useful Phase 2D foundation:

- Add an owner-only developer-agent action registry for Developer Spaces.
- Expose a preview/readback route that can resolve safe actions against the
  existing Developer Space data model.
- Keep the first route non-autonomous and non-destructive:
  - it may read owner-authorized Developer Space state;
  - it may return draft/preview text;
  - it must not mutate Developer Space records except for optional sanitized
    AI trace/audit events if the existing trace helpers make that cheap;
  - it must reject mutation/execution actions with explicit "future lane"
    status.
- Use existing auth, owner/admin checks, provider-policy helpers,
  Developer Space serialization, usage/readback helpers, and AI trace helpers
  where possible.
- Add focused API tests for owner scoping, unsupported actions, and sanitized
  response shape.
- Update roadmap/status docs with the accepted boundaries.

Recommended initial action names:

- `read_developer_space_brief`
- `read_observed_runtime_status`
- `read_provider_policy_posture`
- `read_evidence_path`
- `draft_project_update`

Recommended future-action names to reject for now:

- `publish_to_page`
- `update_layout`
- `read_logs`
- `push_to_repo`
- `run_job`
- `update_observatory`
- `request_capability`
- `rotate_ingestion_key`
- `create_webhook_signing_secret`

The rejection response should be machine-readable and human-readable: the
action exists as future 2D vocabulary, but this PR does not execute it.

## Non-Scope

- No model chat loop, streaming assistant, or provider call is required.
- No autonomous tool execution.
- No arbitrary shell, repo push, deploy, queue job, database provisioning,
  Redis worker, Cloudflare Worker, container runtime, or hosted infrastructure.
- No browser-visible secrets, raw ingestion keys, signing secrets, env values,
  Railway variables, Supabase service keys, provider payloads, raw private logs,
  private archive excerpts, raw prompts, or raw completions.
- No mutation of linked documents, visual layout, keys, signing secrets,
  billing, provider settings, or observed-runtime ingestion state.
- No route/table rename from Developer Spaces to Developer Pages.
- No broad manage-console redesign.
- No DexOS-specific widgets.

## Implementation Notes

Likely starting points:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/services/ai-observability.service.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx` only if DAEDALUS
  chooses a tiny visible readback panel. Prefer API foundation first.
- `apps/web/lib/developer-space-observatory.ts` only if existing helper copy
  should be reused for draft/readback labels.

Suggested route shape:

```text
POST /developer-spaces/:id/agent/actions/preview
```

Suggested request shape:

```json
{
  "action": "read_developer_space_brief",
  "input": {}
}
```

Suggested response shape:

```json
{
  "action": "read_developer_space_brief",
  "status": "previewed",
  "summary": "...",
  "sections": [],
  "requiresConfirmation": false,
  "futureLane": false
}
```

Unsupported/future actions should return a bounded status such as
`requires_future_lane` or `unsupported_action` without performing work.

## Acceptance

- Owner/admin can preview allowed read/draft actions for their Developer Space.
- Non-owner access is rejected.
- Unknown actions and future mutation/execution actions are rejected without
  side effects.
- Responses do not expose raw ids unless already exposed by current owner
  routes and needed for route navigation; prefer labels, counts, route hints,
  timestamps, and safe status categories.
- The action registry makes the Phase 2D boundary explicit enough that future
  chat UI can call a typed contract instead of inventing commands ad hoc.
- Public Developer Space reads and existing ingestion/webhook routes are not
  behaviorally changed.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible web code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

Record the known local Windows Next standalone symlink `EPERM` only if it
appears after successful compile/lint/typecheck/page generation.

## ARGUS Review Ask

ARGUS should review:

- owner/admin authorization and non-owner hostile paths;
- whether action outputs leak private source text, prompts, provider payloads,
  keys, signing material, environment data, or raw private logs;
- whether mutation/execution actions are truly rejected;
- whether the registry overclaims developer-agent autonomy, hosted runtime,
  Cloudflare, queue/worker, repo-push, or deployment capability;
- whether existing Developer Space APIs remain compatible.

## Handoff

DAEDALUS should wake ARGUS with:

- exact files touched;
- action registry and route shape;
- allowed actions implemented;
- future actions rejected;
- validation results;
- privacy/overclaim notes;
- whether ARIADNE is needed because visible owner UI changed.

If implementation cannot proceed, wake MIMIR with the exact blocker instead of
going silent.

## DAEDALUS Implementation

Implemented on 2026-06-22:

- Added typed Developer Space agent action DTOs in `@station/types`.
- Added owner-only `GET /developer-spaces/:id/agent/actions`.
- Added owner-only `POST /developer-spaces/:id/agent/actions/preview`.
- Implemented allowed preview actions:
  - `read_developer_space_brief`
  - `read_observed_runtime_status`
  - `read_provider_policy_posture`
  - `read_evidence_path`
  - `draft_project_update`
- Implemented future-lane rejection for:
  - `publish_to_page`
  - `update_layout`
  - `read_logs`
  - `push_to_repo`
  - `run_job`
  - `update_observatory`
  - `request_capability`
  - `rotate_ingestion_key`
  - `create_webhook_signing_secret`
- Unknown commands return `unsupported_action`.

Implementation boundaries:

- No autonomous tool execution, model chat loop, provider call, shell/repo/
  deploy action, queue/worker, Cloudflare, Redis worker, hosted runtime, key
  rotation, webhook signing-secret creation, visual layout mutation, linked
  document mutation, or observed-runtime ingestion mutation.
- Readback uses sanitized labels, counts, timestamps, route hints, statuses, and
  draft text. It omits raw metrics, event data, context payloads, source refs,
  linked-document body excerpts, secrets, private prompts, provider payloads,
  and raw logs.
- No visible owner UI changed; ARIADNE rehearsal is not needed unless ARGUS
  requests one.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` is blocked locally before
  TypeScript runs because Windows Application Control blocks the Turbo Windows
  binary. Direct package checks covered the touched types/API surfaces.

## ARGUS Review

Accepted on 2026-06-22.

Findings:

- The new action registry and preview routes are owner/admin only. Anonymous
  requests fail at auth, and non-owner requests fail through the existing
  Developer Space owner/admin loader before action handling.
- Allowed actions are bounded to owner-authorized readback and draft preview.
  `draft_project_update` requires confirmation and does not publish or mutate.
- Future mutation/execution actions return `requires_future_lane` without side
  effects, including key rotation, signing-secret creation, job execution,
  repository push, layout update, observatory update, and page publication.
- Unknown actions return `unsupported_action`; supplied input is not echoed or
  executed.
- Preview output uses sanitized labels, counts, timestamps, statuses, and route
  hints. It omits raw metrics, event data, context payloads, source refs,
  linked-document body excerpts, keys, signing material, provider payloads,
  prompts, and logs.
- Redaction is accepted as owner/admin preview sanitization, not as a public
  text scrubber for arbitrary owner-authored labels.
- Existing public Developer Space reads and ingestion/webhook/key routes remain
  behaviorally unchanged.
- No model chat loop, provider call, autonomous execution, shell/repo/deploy
  action, Cloudflare, Redis worker, hosted runtime, queue/worker, key/signing
  mutation, document/layout mutation, observed-runtime mutation, visible UI, or
  Developer Pages route/table rename was added.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 29
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` remains blocked before
  TypeScript because Windows Application Control blocks the local Turbo binary
  with `spawnSync ... UNKNOWN`; direct package checks covered the touched
  API/types surfaces.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed.
- Staged secret-shaped value scan passed.

Recommendation:

- Wake MIMIR to close PR162 and decide the next lane.
