# PR45 - Developer Pages Second Example

Date: 2026-06-18
Status: accepted by ARGUS and closed by MIMIR for ARIADNE staging recheck
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks only after deploy
and seed if ARGUS accepts.

## Purpose

Add a second public-safe Developer Page example so the Phase 2A / Tier 1
showcase-window pattern is not proven only by `station-replay-dev-alpha`.

PR40 through PR44 proved the first staging Developer Page: public evidence,
visitor reading path, live observatory, and public/private boundaries. The next
narrow proof should add a second synthetic project with different public
evidence and live-state texture, then prove the public index/detail routes can
carry more than one serious-looking Developer Page.

## Current Truth

- `station-replay-dev-alpha` is the first deployed staging proof.
- The codebase already has `animus-field` style Developer Space fixtures in
  tests, but the live staging seed currently centers on one Developer Space.
- `scripts/staging-replay-seed.mjs` currently validates and seeds a single
  `corpus.developerSpace` block.
- The current public page can render role-ordered evidence without new API
  shape.

## Scope

Implement a second synthetic public-safe Developer Page example:

- Extend the staging replay corpus/seed path to support one additional public
  Developer Space example, either through an `additionalDeveloperSpaces` array
  or a similarly narrow structured field.
- Seed a second public Developer Space with a distinct slug, description,
  visual mode/config, node, event, snapshot, and at least three public evidence
  documents:
  - methodology / architecture;
  - finding / milestone;
  - field log / update.
- Prefer a synthetic `animus-field` / `animus-observatory` style example if it
  fits existing tests and avoids product confusion.
- Keep all content synthetic, public-safe, and clearly non-production.
- Prove both examples appear in public-safe Developer Space reads or Discover
  where the existing route already supports them.
- Preserve `station-replay-dev-alpha` behavior and PR43 evidence-path ordering.
- Update validation/status docs.

## Non-Scope

- No real DexOS onboarding unless the user provides explicit public-safe DexOS
  content.
- No DexOS-specific widgets, hosted runtime, developer agent, chat-native tools,
  Cloudflare, public interaction modes, tipping, Project abstraction,
  route/table rename, or Tier 2/Tier 3 work.
- No new public document route for space-less Developer Space evidence.
- No private archive text, prompts, provider payloads, tokens, credentials,
  owner IDs, or unpublished document bodies.
- No broad Discover redesign or UI polish unless a tiny copy/card adjustment is
  required for the second example to be visible and truthful.

## Implementation Notes

Likely touched files:

- `scripts/staging-replay-seed.mjs`
- checked-in replay/staging corpus fixture if one exists in the repo
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Potentially touched tests:

- `apps/api/src/routes/developer-spaces.test.ts`
- seed validation tests or replay readiness tests if they cover corpus shape

Do not commit ignored local private corpus files. If the active staging seed
still depends on an ignored local corpus, document exactly what was required and
keep committed code able to validate the public repo fixture shape.

## Acceptance

- `replay:seed:validate` proves the corpus shape for both Developer Page
  examples before staging writes.
- `replay:seed:staging` creates/updates both public Developer Spaces on the
  active staging target.
- Anonymous/public readback proves both public Developer Spaces are readable and
  each has methodology, finding, and field-log public evidence.
- The original `station-replay-dev-alpha` route remains unchanged in behavior.
- The second route does not overclaim production depth, DexOS scope, Tier 2
  hosting, developer-agent capability, Cloudflare, or public interaction.
- ARGUS can review without secrets, private bodies, raw credentials, or owner
  IDs being printed.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If Discover/public feed code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
```

## Handoff

Wake ARGUS when implemented with:

- second example slug and public route;
- corpus/seed shape change;
- public readback proof for both examples;
- validation results;
- privacy/overclaim notes;
- whether ARIADNE should recheck deployed staging routes after review.

## DAEDALUS Implementation

DAEDALUS extended the staging replay corpus shape with
`additionalDeveloperSpaces`, preserving the existing primary
`developerSpace` block for `station-replay-dev-alpha`.

Second example:

- Slug: `animus-field-lab`
- Public route after deploy: `/developer-spaces/animus-field-lab`
- Project name: `Animus Field Lab`
- Visual mode: `timeline`
- Evidence roles: `methodology`, `finding`, `field_log`
- Evidence document types: `research`, `research`, `field_log`

Seed behavior:

- `scripts/staging-replay-seed.mjs` now validates and seeds the primary
  `developerSpace` plus any `additionalDeveloperSpaces`.
- Each Developer Space gets one node, one public event, one public snapshot,
  public linked evidence documents, and usage counters.
- Summary output now reports total Developer Space counts plus per-slug
  evidence roles.
- Existing `station-replay-dev-alpha` behavior is preserved.

Local staging note:

- `replay:seed:staging` still reads the ignored local corpus from
  `STATION_REPLAY_CORPUS_PATH`.
- DAEDALUS copied the checked-in public-safe `additionalDeveloperSpaces` block
  into the ignored local corpus before running the staging seed.
- The ignored local corpus remains uncommitted.

Public readback proof:

- Direct Supabase public-predicate readback returned both public Developer
  Spaces in the public index: `station-replay-dev-alpha` and `animus-field-lab`.
- `station-replay-dev-alpha` returned 3 public linked evidence rows with roles
  `methodology`, `finding`, `field_log`, document types `research`, `research`,
  `field_log`, and no private/draft rows under the public predicate.
- `animus-field-lab` returned 3 public linked evidence rows with roles
  `methodology`, `finding`, `field_log`, document types `research`, `research`,
  `field_log`, and no private/draft rows under the public predicate.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
```

All passed. `node --check scripts/staging-replay-seed.mjs` also passed.
`git diff --check` passed with only CRLF normalization warnings.

Scope guard:

- No Discover/public feed code changed.
- No API response shape, type package shape, route/table rename, Project
  abstraction, Tier 2 hosting, developer agent, DexOS-specific widget, public
  interaction mode, Cloudflare, or broad UI polish was added.

## ARGUS Review Result

ARGUS accepts PR45 for MIMIR closeout, 2026-06-18.

- The corpus shape is backward-compatible: the original `developerSpace` remains
  the primary example and `additionalDeveloperSpaces` adds optional extra public
  examples.
- The second example, `animus-field-lab`, is synthetic, public-safe, and does
  not claim hosted runtime, DexOS onboarding, developer-agent execution, public
  interaction modes, Cloudflare delivery, or production infrastructure.
- ARGUS patched corpus validation so evidence document slugs must be unique
  across all Developer Space examples. This prevents the existing
  `author_user_id,slug` document upsert from accidentally reusing one document
  across spaces.
- ARGUS also added validation for optional Developer Space visualisation types
  and provider policies before staging writes.
- Both public slugs read back through the public predicate:
  `station-replay-dev-alpha` and `animus-field-lab` each have methodology,
  finding, and field-log evidence, document types `research`, `research`, and
  `field_log`, and zero hidden rows under the public predicate.
- No API response shape, type package shape, Discover/public feed code, route/
  table rename, Project abstraction, Tier 2 hosting, developer agent,
  DexOS-specific widget, public interaction mode, Cloudflare, or broad UI polish
  changed.

Validation:

```bash
node --check scripts/staging-replay-seed.mjs
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

All passed. ARIADNE should recheck deployed
`/developer-spaces/station-replay-dev-alpha` and
`/developer-spaces/animus-field-lab` after deploy/seed.

## MIMIR Closeout

MIMIR confirmed deployed anonymous API readback for both public routes and web
shell responses for both pages. PR46 now sends the two deployed routes to
ARIADNE for human-eye recheck.
