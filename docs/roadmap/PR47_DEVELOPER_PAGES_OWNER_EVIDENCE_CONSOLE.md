# PR47 - Developer Pages Owner Evidence Console

Date: 2026-06-18
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks only if ARGUS
accepts visible owner-facing changes.

## Purpose

Align the owner manage console with the public Developer Page evidence reading
path.

PR43 through PR46 proved that visitors can read public methodology, finding, and
field-log evidence across two synthetic Developer Pages. The owner console still
frames the same material as generic "Project notes." The next narrow product
step is to make owners understand and curate the evidence path they are
publishing.

## Current Truth

- Public `/developer-spaces/:slug` renders a first-class `Project evidence`
  reading path ordered by methodology, finding, field log, then notes.
- Owner `/developer-spaces/:slug/manage` can create linked documents through the
  existing template route.
- The manage page currently labels that area `Project notes`, uses generic note
  copy, and lists linked documents without the same reading-path framing.
- The existing API already supports `role`, `linkVisibility`, `publish`, and
  `sortOrder` for template documents; do not add new backend shape unless a tiny
  gap blocks the owner path.

## Scope

Improve the owner-facing evidence section on
`/developer-spaces/:slug/manage`:

- Rename/reframe the generic notes section as the Developer Page evidence path.
- Show the linked evidence in the same deterministic order as the public page.
- Reuse the public role labels and role-purpose copy where appropriate.
- Make public versus owner-only status clear enough that owners understand what
  visitors will see.
- Make the create form speak in evidence-path language:
  methodology / architecture, finding / milestone, field log / update, note /
  paper.
- If cheap and safe, expose `sortOrder` or a simple position control for newly
  created evidence, using the existing template route. Do not add drag/drop or a
  new reorder API in this lane.
- Keep existing ingestion key, visual mode, widgets, usage, export, and curl
  instruction behavior intact.
- Add focused helper/UI tests where local patterns allow.
- Update status/validation docs.

## Non-Scope

- No developer agent, chat-native workspace, repo push, log-reading tools, job
  runner, layout-update tools, or capability-request execution.
- No Tier 2 hosting, containers, databases, Redis/queue provisioning, or
  deployment pipeline.
- No route/table rename, Project abstraction, DexOS-specific widgets, public
  interaction modes, tipping, Cloudflare, or Tier 3.
- No new public document route for space-less Developer Space evidence.
- No broad manage-console redesign or Discern-wide UI import.
- No exposure of private archive text, prompts, provider payloads, owner IDs,
  ingestion keys, credentials, tokens, or unpublished document bodies to public
  views.

## Implementation Notes

Likely touched files:

- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Potentially touched only if the existing template route cannot support the
narrow position control:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`

Prefer reusing existing helpers over inventing manage-only role labels. If the
manage page needs a small helper for owner evidence copy, keep it in the same
developer-space observatory helper file and test it there.

## Acceptance

- Owner manage page clearly names and previews the evidence path that visitors
  will read.
- Linked evidence appears in the same role/sort/title order as public pages.
- Public and owner-only linked documents are visibly distinguished in owner
  view.
- Creating evidence still uses the existing owner-only/public template path and
  does not create fake public document links.
- Public routes for `station-replay-dev-alpha` and `animus-field-lab` remain
  unchanged in behavior.
- Copy stays within Phase 2A / Tier 1 showcase-window scope.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If visible web code changes beyond helper text, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

Record the known Windows Next standalone symlink `EPERM` if it appears after
successful compile/lint/typecheck/page generation.

## Handoff

Wake ARGUS when implemented with:

- exact files touched;
- what changed on the owner evidence section;
- whether any API behavior changed;
- validation results;
- privacy/overclaim notes;
- whether ARIADNE should recheck signed deployed staging after review.
