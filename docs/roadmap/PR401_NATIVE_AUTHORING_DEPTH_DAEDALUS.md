# PR401 - Native Authoring Depth

Owner: DAEDALUS

Date: 2026-06-27

Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR400; the roadmap truth is clean enough to pick a real product lane.
- Native document versioning, approval publish, public readback, linked discussion, and retract-to-private are already protected-alpha.
- The remaining native-documents gap is richer authoring UX/depth, not version persistence or a rich-editor rebuild.
Task:
- Implement the smallest safe native-authoring depth slice on the existing Studio publish/publishing surfaces, or return an exact narrower implementation packet if code is not safe.
- Wake ARGUS if code changes; wake MIMIR only if the result is map-only. Do not go idle without a wakeup commit.
```

## Context

The current docs truth after PR400 says native documents are protected alpha:

- private draft authoring/readback exists;
- document types are aligned to Station vocabulary;
- owner-only version history exists;
- approval publish works;
- public document readback works;
- linked discussion readback works;
- retract-to-private hides public reads while preserving owner readback.

What remains open is product depth:

- richer authoring guidance;
- clearer document-type semantics;
- better version-continuation/readback around the owner editor;
- stronger provenance/review checklist before public movement;
- broad rich editor, scheduling, social, Station Press, SEO/OpenGraph, and
  full editorial system are still future.

## Product Goal

Make `/studio/publish` feel more like Station-native authoring and less like a
generic textarea, while keeping the persistence and public visibility contract
unchanged.

Owners should understand, while writing:

- what kind of Station document they are creating;
- whether it is private, public-ready, or queue-ready;
- how saving relates to version history;
- that publishing goes through owner review/approval;
- that linked discussion is part of public readback when comments are enabled;
- that retraction hides public reads but is not deletion.

## Likely Small Slice

Prefer a helper-backed UI/copy patch over new infrastructure.

Good targets:

- add tested helper copy in `apps/web/lib/publishing.ts` for document-type
  intent, authoring checklist, and publish/retract/version truth;
- render that guidance in `apps/web/components/studio/publish-flow.tsx`;
- refine `apps/web/components/studio/publishing-dashboard.tsx` only if the
  dashboard needs matching copy for edit/review/retract;
- add or update focused tests in `apps/web/lib/publishing-ui.test.ts`.

Keep the patch useful even with the existing plain textarea. Do not introduce a
rich editor dependency in PR401.

## Required Checks

Before patching, confirm:

- the current version-history API and UI are already present and should not be
  rebuilt;
- public document pages do not expose owner-only prior versions;
- `Retract to private` copy stays hide/not-delete;
- disabled formatting, scheduling, connector, Station Press, and social
  controls are either honest or left untouched.

## Non-Scope

Do not add or change:

- schema or migrations;
- rich editor packages;
- document body persistence semantics;
- approval state machine semantics;
- public visibility rules;
- hosted data mutation;
- Station Press/PDF/export packaging;
- social dispatch/connectors;
- scheduling/workers/queues;
- SEO/OpenGraph;
- provider/model routing;
- Redis or Cloudflare;
- billing, Stripe, auth, or deployment behavior.

Do not claim full native authoring is complete. This is one protected-alpha
depth slice.

## Validation

Run focused checks for touched files:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If the result is map-only, `git diff --check` is enough; explain why no runtime
validation was needed.

## Required Result

Create:

```text
docs/roadmap/PR401_NATIVE_AUTHORING_DEPTH_RESULT.md
```

Include:

- current authoring/versioning truth;
- files changed;
- exact authoring-depth improvement;
- preserved visibility/version/retract boundaries;
- validation results;
- whether ARGUS should review code or MIMIR should choose a different branch;
- whether ARIADNE needs a human-eye rehearsal after ARGUS.
