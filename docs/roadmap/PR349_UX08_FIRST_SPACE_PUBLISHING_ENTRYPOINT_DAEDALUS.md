# PR349 - UX-08 First Space Publishing Entrypoint

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR348 Onboarding/Station Assistant state map.
- First Space/public publishing is present through /space, /space/new, and /studio/publish.
- PR348 recommends the next UX-08 slice connect onboarding or Assistant next-action copy to those existing routes.
Task:
- Implement the smallest safe first Space/publishing entrypoint clarity slice.
- Keep scope route/copy/helper-level unless a blocker proves otherwise.
- Do not change publication semantics, visibility, schema, auth, billing, import, API Bridge credentials, provider calls, workers, or Assistant execution.
- Wake ARGUS for hostile review, or wake MIMIR with the exact blocker if implementation is not safe.
```

## Goal

Make first Space/public publishing feel like a real next step in onboarding and
Station Assistant guidance, without changing how Spaces or publishing work.

The user should be able to understand:

- where to create or review their first Space;
- where publishing starts from Studio;
- that Space/publishing remains owner-controlled and visibility-sensitive;
- that Station Assistant can explain the steps but does not execute publishing
  automatically.

## Scope

Implement one narrow UX-08 clarity patch using existing routes and state.

Good targets:

- add or refine onboarding path/next-action copy that points to `/space`,
  `/space/new`, or `/studio/publish`;
- add a tested helper entry for first Space/publishing guidance;
- improve Station Assistant next-action wording for Space/publishing without
  auto-sending prompts or executing tools;
- make existing Space/publishing entry labels clearer in the signed-in Studio
  journey.

Primary files to inspect:

- `apps/web/lib/onboarding-paths.ts`
- `apps/web/lib/station-assistant-ui.ts`
- `apps/web/components/studio/station-assistant-panel.tsx`
- `apps/web/app/studio/onboarding/page.tsx`
- `apps/web/app/space/page.tsx`
- `apps/web/app/space/new/page.tsx`
- `apps/web/app/studio/publish/page.tsx`
- relevant helper tests

## Non-Scope

Do not add or change:

- publication semantics;
- Space visibility rules;
- publish API behavior;
- schema or migrations;
- auth/session behavior;
- billing or Stripe;
- archive/import pipelines;
- API Bridge credentials or secret handling;
- provider/model calls;
- Assistant auto-execution or tool execution;
- Redis, Cloudflare, queues, or workers;
- broad visual redesign.

Do not claim Station Assistant publishes, creates Spaces, changes visibility, or
executes setup automatically.

## Validation

Run focused checks for touched surfaces:

```text
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If `test:spaces` is unavailable or not relevant to the final touched files,
explain the substitution in the result doc.

## Required Result

Create:

```text
docs/roadmap/PR349_UX08_FIRST_SPACE_PUBLISHING_ENTRYPOINT_RESULT.md
```

Include:

- changed files;
- exact first Space/publishing clarity improvement;
- preserved boundaries;
- validation results;
- whether ARGUS should accept or request a repair;
- any remaining UX-08 caveat.
