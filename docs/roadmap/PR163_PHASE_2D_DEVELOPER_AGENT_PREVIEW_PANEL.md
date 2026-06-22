# PR163 - Phase 2D Developer Agent Preview Panel

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews. ARIADNE rehearses after ARGUS if
visible UI changes are accepted.
Status: closed by MIMIR

## Why This Lane

PR162 created the first safe Phase 2D contract: an owner-only Developer Space
agent action registry plus preview/readback routes. It intentionally shipped no
visible UI, model chat loop, autonomous execution, or mutation surface.

The next useful 2D step is to make that contract visible in the owner workspace
without adding autonomy. A Developer Space owner should be able to open the
manage console, ask for safe readbacks/drafts through the typed preview route,
and see future actions as clearly blocked until a later confirmation/execution
lane exists.

This starts the chat-native developer workspace as a controlled cockpit, not an
agent that can run away with keys, repos, jobs, deployments, or public pages.

## Scope

Add a bounded owner-only Developer Agent preview panel to the Developer Space
manage surface.

The panel should:

- call `GET /developer-spaces/:id/agent/actions` to load available action
  vocabulary;
- call `POST /developer-spaces/:id/agent/actions/preview` for allowed preview
  actions;
- show allowed read/draft actions clearly:
  - `read_developer_space_brief`
  - `read_observed_runtime_status`
  - `read_provider_policy_posture`
  - `read_evidence_path`
  - `draft_project_update`
- show future mutation/execution actions as disabled or blocked, using the
  route response/copy rather than pretending they work;
- render preview output as safe sections/cards/lists without exposing raw ids,
  keys, metrics blobs, event payloads, context payloads, source refs,
  document-body excerpts, prompts, provider payloads, logs, or secrets;
- keep the current manage-console evidence, ingestion key, visual mode, widget,
  usage, export, and curl instruction behavior intact;
- keep public Developer Space pages unchanged;
- add focused web/helper tests where the current patterns support them.

The first version may be button/select driven rather than freeform chat. The
important 2D progress is that the owner workspace now talks to a typed agent
contract; freeform model chat can wait until the action/confirmation boundary is
better proven.

## Non-Scope

- No model chat loop or provider call.
- No streaming assistant.
- No autonomous tool execution.
- No mutation of documents, public pages, visual layout, keys, signing secrets,
  provider settings, billing, observed-runtime state, repos, deployments,
  queues, Cloudflare, Redis workers, or hosted runtime.
- No freeform prompt-to-tool parser.
- No arbitrary shell, repo push, deploy, or log reading.
- No route/table rename from Developer Spaces to Developer Pages.
- No broad manage-console redesign.
- No DexOS-specific widget framework.

## Implementation Notes

Likely touched files:

- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `apps/api/src/routes/developer-spaces.test.ts` only if the PR162 route
  contract needs a tiny web-facing fixture adjustment
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Prefer reusing the existing `card`, `panel`, `pill`, `input`, and button
patterns on the manage page. The UI should feel like a practical operator
surface, not a marketing assistant hero.

## Acceptance

- Owner manage page exposes a Developer Agent preview panel.
- Allowed actions call the PR162 preview endpoint and render safe readback or
  draft output.
- Future actions are visible only as unavailable/blocked/future-lane actions or
  are omitted from the live control set; they do not look broken.
- Preview loading/error/empty states are clear and do not shift the whole
  manage layout.
- No existing manage-console controls regress.
- Anonymous/non-owner users cannot reach the manage surface or preview data.
- Public Developer Space reads remain unchanged.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If full root `typecheck` is blocked by local Windows Application Control on
Turbo, record that blocker and keep the direct package typechecks.

## ARGUS Review Ask

ARGUS should review:

- whether the owner UI exposes only PR162-safe preview output;
- whether future actions look blocked rather than broken or secretly live;
- whether errors can leak raw API response bodies, ids, keys, payloads, prompts,
  logs, or provider data;
- whether any existing Developer Space public/private or ingestion/key behavior
  changed unexpectedly;
- whether copy overclaims autonomous execution, hosted runtime, repo push,
  deployment, Cloudflare, Redis, or model chat ability.

## ARIADNE Rehearsal Ask

If ARGUS accepts visible UI changes, wake ARIADNE to rehearse the owner manage
page as a human:

- can an owner understand what the Developer Agent can safely preview now;
- are future actions clearly unavailable rather than broken;
- does the panel feel like a serious developer workspace surface;
- does desktop and 390px mobile remain usable without overlap or horizontal
  overflow.

## Handoff

DAEDALUS should wake ARGUS with:

- exact files touched;
- what changed in the manage panel;
- allowed and future actions rendered;
- validation results;
- privacy/overclaim notes;
- whether ARIADNE should run the human-eye rehearsal after review.

If blocked, wake MIMIR with the exact blocker instead of going silent.

## ARGUS Review

Accepted on 2026-06-22.

Findings:

- The Developer Agent panel remains on the owner manage surface and calls the
  PR162 owner/admin registry and preview routes by Developer Space id.
- The UI renders only route-provided summaries, sections, facts, and items; it
  does not render arbitrary preview JSON or raw response bodies.
- Error states are generic and do not echo raw API errors, ids, keys, payloads,
  prompts, logs, provider data, or response bodies.
- Item links are clickable only for local `/developer-spaces/...` hrefs;
  non-local preview hrefs render as text.
- Future mutation/execution actions are visually separated as blocked boundary
  vocabulary. Clicking them only previews the PR162 `requires_future_lane`
  response and does not add execution or mutation.
- Existing evidence, ingestion-key, visual-mode, widget, usage, export, public
  page, and webhook behavior was not changed.
- No model chat loop, provider call, autonomous execution, document/public-page
  mutation, layout mutation, key/signing-secret mutation, provider setting
  mutation, billing mutation, observed-runtime write, shell/repo/deploy path,
  queue/worker, Cloudflare, Redis worker, hosted runtime, route/table rename,
  or public Developer Space behavior changed.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 31
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 102 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` reached
  successful compile/lint/typecheck/page-data/static-page generation/
  optimization/trace collection, then hit the known local Windows standalone
  symlink `EPERM` while copying traced React/Next/@next/env files.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` remains blocked before
  TypeScript because Windows Application Control blocks the local Turbo binary
  with `spawnSync ... UNKNOWN`.
- `git diff --check` passed with CRLF normalization warnings only.
- `git diff --cached --check` passed.
- Staged secret-shaped value scan passed.

Recommendation:

- Wake ARIADNE for the visible owner UI rehearsal requested by PR163.

## ARIADNE Visible UI Rehearsal

Accepted on 2026-06-22.

Method:

- Ran the real Next manage page locally at `http://127.0.0.1:3138` with
  mocked owner-only API responses for the Developer Space detail, usage,
  exports, PR162 action registry, and preview routes.
- Used synthetic labels only. No hosted data, replay data, billing state,
  imports, exports, Developer Space keys, webhooks, Redis, Cloudflare, provider
  config, workers, cache state, or public pages were mutated.

Human-eye result:

- The Developer Agent preview panel reads as an owner-only operator surface,
  not a generic assistant or autonomous agent.
- The panel explains the typed Phase 2D action contract without promising model
  chat, execution, mutation, repo/deploy operations, Cloudflare, Redis workers,
  billing, or hosted-runtime control.
- Boundary facts are visible and understandable: owner-only yes, autonomous
  execution no, mutation no, raw payloads no.
- Available actions are scannable as safe readbacks or draft previews.
- The empty state tells the owner to choose an available action for a safe
  readback.
- A forced preview API failure showed only generic UI copy:
  `Could not preview that Developer Agent action.` The raw-looking mocked
  backend message did not render.
- Safe preview output rendered as summary, sections, facts, and items. A local
  `/developer-spaces/...` preview link was clickable; an external preview href
  rendered as plain text.
- Future lane actions are visibly separated under `Future lane vocabulary` and
  read as blocked boundary actions. Clicking `Run job` returned a
  `Blocked for future lane` preview with owner review required, not a broken or
  live execution affordance.
- The desktop and 390px mobile layouts remained usable. The 390px mobile pass
  showed no document-level horizontal overflow.
- No browser page errors were observed during the mocked rehearsal.

Verdict:

- PR163 is product-experience accepted. The panel is ready as a bounded
  owner-only preview cockpit for the PR162 action contract.
- No DAEDALUS follow-up is required from this rehearsal.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr163-agent-preview-rehearsal.spec.js --reporter=line --workers=1`
  passed: 1 test.

## MIMIR Closeout

MIMIR closes PR163 on 2026-06-22. ARGUS accepted the owner manage preview panel
as bounded to the PR162 action contract, and ARIADNE accepted the visible UI
rehearsal against the real Next manage page with mocked owner APIs.

Next lane: PR164 should prove the visible Developer Agent preview panel on
hosted Railway staging before MIMIR opens deeper Phase 2D work such as
confirmation envelopes, model chat, or mutating tools.
