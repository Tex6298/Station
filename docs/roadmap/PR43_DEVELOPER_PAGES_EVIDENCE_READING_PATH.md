# PR43 - Developer Pages Evidence Reading Path

Date: 2026-06-18
Status: accepted by ARGUS and closed by MIMIR for ARIADNE staging recheck
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks only if ARGUS
accepts visible staging-facing changes.

## Purpose

Turn the PR40/PR41/PR42 Developer Pages proof into a clearer visitor reading
path.

PR42 proved the deployed public Developer Space can show methodology, finding,
and field-log evidence safely. The next narrow step is presentation quality:
visitors should be able to understand which evidence to read first and why,
without mistaking the page for Tier 2 hosting, a developer agent, Cloudflare
retrieval, or a finished DexOS-specific product.

## Current Truth

- The public API exposes three linked public evidence documents for
  `station-replay-dev-alpha`.
- The public page shows those documents through the existing
  `Project evidence` / `project_notes` widget.
- The current evidence panel is still a compact side-card list. It proves the
  data, but it does not yet feel like a deliberate Developer Page reading path.
- Current linked-document payloads include role, sort order, title, slug,
  document type, status, visibility, published date, and an excerpt. They do
  not currently include a proven public document route for space-less Developer
  Space evidence.

## Scope

Implement the narrow visitor-path upgrade on the public Developer Space page:

- Promote public linked evidence into a first-class reading path on
  `/developer-spaces/:slug`, not only a side-card note bucket.
- Order evidence by role and explicit `sortOrder`:
  1. methodology / architecture;
  2. finding / milestone;
  3. field log / update;
  4. notes / papers.
- Make each card explain its role in plain language and show safe metadata:
  document type, published/updated date where available, and excerpt.
- If route-safe document links already exist in the payload or can be added
  without inventing a half-working public route, use them. If not, keep this
  lane in-page and do not pretend the evidence cards open full documents.
- Keep the existing live observatory readable beside the evidence path.
- Preserve owner/public boundary copy and owner-only draft labels.
- Add helper tests for ordering, role copy, and empty-state copy.
- Update roadmap/status docs with what changed and what remains future.

## Non-Scope

- No route/table rename from Developer Spaces to Developer Pages.
- No Project abstraction or nullable project ownership model.
- No Tier 2 hosted runtime, Coolify, containers, databases, Redis provisioning,
  queues, deployment pipeline, or WebSocket architecture change.
- No developer agent, chat-native tools, repo push, log-reading tools, job
  runner, layout-update tools, or capability-request execution.
- No DexOS-specific widgets beyond honest boundary copy.
- No tipping, public interaction modes, constitutional simulator, or Tier 3.
- No Cloudflare lane unless ARGUS/ARIADNE finds a concrete public-edge or
  retrieval defect in this specific flow.
- No exposure of private archive text, prompts, provider payloads, owner IDs,
  ingestion keys, tokens, credentials, or unpublished document bodies.

## Implementation Notes

Likely touched files:

- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`

Potentially touched only if necessary for safe links:

- `packages/types/src/developer-space.ts`
- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/routes/developer-spaces.test.ts`

Do not add a public link unless the route is genuinely valid for the linked
document. Space-backed Station documents use `/space/:slug/documents/:id`;
space-less Developer Space evidence may need to remain in-page until a separate
document-route lane exists.

## Acceptance

- Anonymous visitors can see a coherent evidence reading path for
  `station-replay-dev-alpha`.
- Methodology, finding, and field-log evidence are ordered and labelled as a
  deliberate path, not a random notes list.
- Empty and partial-evidence states remain honest for future Developer Pages
  that have fewer documents.
- Owner-only drafts remain hidden from anonymous public reads and clearly
  labelled in owner view.
- The page remains mobile-safe and does not introduce dead controls.
- The copy does not overclaim Tier 2 hosting, developer agents, DexOS-specific
  widgets, public interaction, Cloudflare, or production depth.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If frontend build behavior is touched beyond helper/component code, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

The known Windows Next standalone symlink `EPERM` may still appear after
compile/lint/typecheck/page generation; record it if reproduced.

## Handoff

Wake ARGUS when implemented with:

- exact files touched;
- what the visitor reading path now does;
- whether any API/type shape changed;
- validation results;
- explicit overclaim/privacy notes;
- whether ARIADNE should recheck deployed staging after review.

## DAEDALUS Implementation

DAEDALUS promoted linked Developer Space evidence into a full-width visitor
reading path on `/developer-spaces/:slug`, positioned after the summary metrics
and before the live observatory grid.

Behavior:

- Evidence is ordered by role first, then explicit `sortOrder`, then title:
  methodology, finding, field log, notes.
- Each evidence card shows role copy, document type, published or updated date,
  title, role-purpose copy, excerpt, and owner-only status/link labels when the
  owner is viewing the page.
- Empty states remain honest for public visitors and owners.
- The old `project_notes` side widget no longer duplicates the evidence; the
  main reading path is the first-class presentation.
- The page does not invent public document links for space-less Developer Space
  evidence. Cards explicitly remain in-page until a future route-safe document
  lane exists.

Files changed:

- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `docs/roadmap/PR43_DEVELOPER_PAGES_EVIDENCE_READING_PATH.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

`test:developer-spaces`, `test:developer-space-client`, and `typecheck` passed.
The web build compiled, linted/typechecked, and generated 30 pages before
reproducing the known Windows standalone symlink `EPERM`. `git diff --check`
passed with only CRLF normalization warnings.

Scope guard:

- No API shape, type package, route, table, seed, or staging data change.
- No Project abstraction, Tier 2 hosting, developer agent, DexOS-specific
  widget, public interaction mode, Cloudflare, or broader Phase 2 scope.

## ARGUS Review Result

ARGUS accepts PR43 for MIMIR closeout, 2026-06-18.

- The reading path is visible, in-page, and deliberately non-clickable because
  space-less Developer Space evidence does not yet have a route-safe public
  document page.
- Evidence ordering is deterministic: methodology, finding, field log, note,
  then explicit `sortOrder`, then title fallback.
- The copy stays inside Phase 2A: it frames evidence, live observatory
  comparison, and public/private boundaries without implying Tier 2 hosting,
  developer agents, DexOS widgets, public interaction modes, Cloudflare, or
  production infrastructure.
- Owner view keeps status/link labels visible so owner-only drafts are not
  confused with visitor-visible public evidence.
- Mobile CSS uses bounded grids and collapses the evidence header/list to one
  column below 760px. Local browser measurement remains unavailable because
  Playwright is not installed in this workspace.
- No API response shape, type package shape, route, table, seed, staging data,
  or backend behavior changed.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

`test:developer-spaces` passed 10 tests, `test:developer-space-client` passed
3 tests, and `typecheck` passed. The web build compiled, linted/type-checked,
and generated 30 pages before reproducing the known Windows Next standalone
symlink `EPERM` failure. `git diff --check` passed with only CRLF normalization
warnings.

ARIADNE should recheck deployed
`/developer-spaces/station-replay-dev-alpha` after this visible frontend change
is deployed.

## MIMIR Closeout

MIMIR closes PR43 implementation/review on 2026-06-18 and opens PR44 for the
deployed human-eye recheck. Railway web/API health now reports commit
`734c118c6c2ce3cd6abedf7610aa4b133ed71095`, which contains the PR43 visible
frontend change. PR44 should test the live public route before PR43 is marked
complete for staging.
