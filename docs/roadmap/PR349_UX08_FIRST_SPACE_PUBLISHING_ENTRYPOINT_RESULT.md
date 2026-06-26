# PR349 - UX-08 First Space Publishing Entrypoint Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Summary

PR349 adds a narrow signed-in onboarding entrypoint for first Space/public
publishing. The patch points users to existing routes only: `/space`,
`/space/new`, and `/studio/publish`.

No publishing semantics, Space visibility behavior, Assistant execution, schema,
auth, billing, import, API Bridge, provider/model, worker, queue, Redis, or
Cloudflare behavior changed.

## Changed Files

- `apps/web/lib/onboarding-paths.ts`
- `apps/web/lib/onboarding-paths.test.ts`
- `apps/web/app/studio/onboarding/page.tsx`
- `docs/roadmap/PR349_UX08_FIRST_SPACE_PUBLISHING_ENTRYPOINT_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## First Space / Publishing Improvement

`apps/web/lib/onboarding-paths.ts` now exports
`firstSpacePublishingGuide()`, a tested helper that describes the current first
Space/public publishing route set:

- `/space` for the signed-in Space dashboard;
- `/space/new` for creating the first Space;
- `/studio/publish` for drafting public work in Studio.

`/studio/onboarding` renders that helper as a signed-in "Public step" panel
after the four accepted alpha onboarding path cards. It gives users a concrete
next place to go after private setup without adding another primary onboarding
mode or changing the existing four-path PR73 baseline.

The panel also includes an Assistant handoff link. Like PR348, it only prefills
`/studio/assistant?prompt=...`; it does not send a message or execute setup.

## Preserved Boundaries

- Publishing remains owner-controlled.
- Station Assistant can explain the steps, but does not create Spaces, change
  visibility, publish, or submit approval work automatically.
- `/space`, `/space/new`, and `/studio/publish` keep their existing auth,
  entitlement, visibility, and API behavior.
- No file upload/import pipeline, connector, API Bridge credential, schema,
  migration, auth/session, billing, Stripe, provider/model, Redis, Cloudflare,
  queue, worker, or broad visual redesign work changed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 113 tests passed, including first Space publishing guide coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:assistant` | Pass | 9 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:spaces` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | No ESLint warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |

## Review Request

ARGUS should review that the new onboarding panel and helper copy do not imply
Assistant execution, automatic publishing, visibility changes, publication queue
submission, new Space creation behavior, or a new backend route.

If accepted, ARGUS should wake MIMIR. If the copy overclaims, ARGUS should wake
DAEDALUS with the exact repair.

## Remaining UX-08 Caveat

This patch makes first Space/public publishing visible from onboarding, but it
does not add durable onboarding progress, richer Assistant action chips,
publishing walkthrough state, or hosted browser proof. Those should remain
separate UX-08 slices if MIMIR wants them.

## ARGUS Review

Verdict: `PASS`

ARGUS accepted PR349 with no code patch required.

- The implementation matches the PR349 lane: route/copy/helper-level first
  Space and publishing entrypoint clarity from signed-in onboarding.
- The new panel points only to existing routes: `/space`, `/space/new`, and
  `/studio/publish`.
- The Assistant handoff remains prompt-prefill-only and does not imply automatic
  publishing, Space creation, visibility mutation, approval submission,
  backend route execution, or tool autonomy.
- Signed-out users still see the onboarding sign-in boundary before private or
  publishing guidance.
- No publication semantics, Space visibility rules, publish API behavior,
  schema, migration, auth/session, billing, Stripe, import pipeline, API Bridge
  credential, provider/model, Redis, Cloudflare, queue, worker, or broad design
  behavior changed.

ARGUS reran the requested validation on 2026-06-26:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 113 tests passed, including first Space publishing guide coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:assistant` | Pass | 9 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:spaces` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | No ESLint warnings or errors. |
| `git diff --check` | Pass | Whitespace check passed. |
