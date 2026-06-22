# PR166 - Phase 2D Confirmation Panel

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews. ARIADNE rehearses after ARGUS if
visible UI changes are accepted.
Status: accepted by ARGUS; awaiting ARIADNE visible UI rehearsal

## Why This Lane

PR165 added the owner-scoped Developer Agent confirmation envelope, but it is
API/schema only. The owner manage panel still shows future actions as blocked
without giving the owner a visible way to record, inspect, approve, or cancel
that intent.

The next Phase 2D slice should make the confirmation envelope visible in the
Developer Agent preview panel while preserving the same hard boundary: approval
records intent only and does not execute.

## Scope

Extend the Developer Space owner manage Developer Agent panel to use PR165
confirmation routes.

The UI should:

- load existing confirmations with
  `GET /developer-spaces/:id/agent/actions/confirmations`;
- allow a future-lane action preview to create a confirmation with
  `POST /developer-spaces/:id/agent/actions/confirmations`;
- show pending, approved, cancelled, and expired confirmation states clearly;
- let the owner approve a pending confirmation through the approve route;
- let the owner cancel a pending confirmation through the cancel route;
- make it unmistakable that approved confirmations are recorded owner intent
  only and execution is unavailable in this lane;
- refresh or update local confirmation state after create/approve/cancel;
- keep allowed read/draft preview actions working as they do in PR163;
- keep future actions visually blocked/unavailable for execution;
- keep public Developer Space pages and existing manage-console surfaces
  unchanged.

The panel may stay button/select driven. Do not add freeform chat.

## Non-Scope

- No execution route.
- No actual `publish_to_page`, `update_layout`, `run_job`,
  `update_observatory`, `request_capability`, key rotation, signing-secret
  creation, repo push, deploy, shell, queue, Cloudflare, Redis worker, hosted
  runtime, billing, provider setting, document, layout, public page, or
  observed-runtime mutation.
- No model chat loop, provider call, prompt-to-tool parser, or streaming
  assistant.
- No route/table rename from Developer Spaces to Developer Pages.
- No broad manage-console redesign.

## Implementation Notes

Likely touched files:

- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/types/src/developer-space.ts` only if the PR165 response shape
  needs a small UI-facing type export
- `apps/api/src/routes/developer-spaces.test.ts` only if a tiny API contract
  adjustment is unavoidable
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Prefer rendering confirmation records through a compact list near the future
action vocabulary. Avoid a modal unless the existing manage page already has a
clean modal pattern.

## Acceptance

- Owner can create a confirmation from a future Developer Agent action.
- Pending confirmations can be approved or cancelled from the manage panel.
- Approved confirmations visibly remain non-executing intent records.
- Expired/cancelled records do not appear actionable.
- Allowed read/draft actions still preview without requiring confirmations.
- Future action controls do not look like live execution controls.
- UI errors are generic and do not echo raw API bodies, raw ids, keys, payloads,
  prompts, provider data, logs, cookies, or tokens.
- Desktop and 390px mobile remain usable without document-level horizontal
  overflow.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
git diff --check
```

Record the known Windows standalone symlink `EPERM` only if the web build gets
through compile/lint/typecheck/static generation first.

## ARGUS Review Ask

ARGUS should review:

- whether confirmation UI can create/approve/cancel only owner-scoped records;
- whether approved records could be mistaken for executed actions;
- whether UI errors or confirmation payload rendering leak private material;
- whether existing PR163 preview behavior and PR165 API semantics remain intact;
- whether any execution/mutation path slipped in.

## ARGUS Review

ARGUS accepts PR166 on 2026-06-22 and wakes ARIADNE for visible UI rehearsal.

Findings:

- Accepted: confirmation records load from the PR165 owner-scoped route beside
  the PR162 action registry.
- Accepted: confirmation creation is only exposed after a future-lane preview.
  Allowed read/draft previews still work without durable confirmations.
- Accepted: pending records can be approved or cancelled; approved, cancelled,
  and expired records render as non-actionable history.
- Accepted: approved records read as owner intent only. Status copy says
  "Intent approved" and the record copy says execution remains unavailable in
  this lane.
- Accepted: the UI renders only action labels, status, summary, timestamps, and
  non-execution copy. It does not render ids, owner ids, preview hashes, raw
  `sanitizedPayload`, prompts, keys, provider data, logs, cookies, tokens, or
  environment values.
- Accepted: error copy for confirmation load/create/approve/cancel is generic
  and does not echo raw API bodies.
- No execution route, model chat, provider call, prompt parser, document/layout
  mutation, public-page mutation, key/signing-secret mutation, billing,
  observed-runtime write, queue, Cloudflare, Redis worker, hosted runtime, repo,
  shell, deploy, route/table rename, or public Developer Space behavior change
  slipped in.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 33
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 102 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, generated 36 static pages, finalized optimization, and
  collected traces, then hit the known local Windows standalone symlink `EPERM`
  while copying React, Next, and `@next/env` traced files.
- `git diff --check` passed with CRLF normalization warnings only.

Recommendation: ARIADNE should run the requested desktop and 390px mobile
rehearsal before MIMIR closes the visible UI lane.

## ARIADNE Rehearsal Ask

If ARGUS accepts visible UI changes, wake ARIADNE to rehearse:

- create a future-action confirmation;
- approve it and confirm it reads as non-executing intent;
- cancel a pending confirmation;
- verify allowed previews still work;
- verify desktop and 390px mobile usability.

## Handoff

DAEDALUS should wake ARGUS with:

- exact files touched;
- confirmation UI behavior;
- validation results;
- proof that approval still does not execute;
- privacy/overclaim notes;
- whether ARIADNE should run visible UI rehearsal after review.

If blocked, wake MIMIR with the exact blocker instead of going silent.
