# PR37 - Launch-Core Polish Caveats

Date: 2026-06-18
Status: accepted by ARGUS for MIMIR closeout
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks visible staging
surfaces if ARGUS accepts.

## Purpose

Fix the narrow visible caveats from PR36 before a human demo, without reopening
backend architecture or broad UI redesign.

PR36 passed launch-core rehearsal and deferred Cloudflare, but ARIADNE found
four polish caveats:

- signed mobile `/studio` can still measure `407px` scroll width on a `390px`
  viewport because dense global navigation pushes the `Developer` link off the
  right edge;
- mobile Archive loads, and API search works, but the automated text probe did
  not find the exact `Search` affordance;
- Developer Space renders live observatory state but has thin
  methodology/finding/field-log storytelling;
- Archive/import source states are functional but thin for a polished demo
  narrative.

## Scope

- Make signed global navigation mobile-safe at 375-390px for `/studio` and the
  launch-core protected routes. The page should not create document-level
  horizontal overflow just to keep every top-level link visible.
- Preserve route access. If navigation collapses, use an accessible menu or
  overflow pattern that still exposes Discover, Writing, Forums, Studio, My
  Space, and Developer.
- Make Archive search affordance visible and accessible on mobile. Prefer a
  real label, placeholder, or `aria-label` that a human and automated text probe
  can understand without changing search semantics.
- Add restrained, data-honest Developer Space storytelling for the public
  observatory:
  - what methodology this observatory uses;
  - what live signal or field note means;
  - what remains private or unavailable to visitors.
- Add restrained Archive/import source narrative:
  - what source material can be added;
  - what happens when imports complete or fail;
  - who can see private source material.
- Keep styling aligned with the current Station dark shell and Discern-influenced
  public surfaces. Avoid a broad restyle.

## Non-Scope

- Do not redesign the whole site.
- Do not add Cloudflare, Redis/Valkey memory, provider streaming, embedding
  migration, model marketplace UI, BYOK secret storage, or retrieval rewrites.
- Do not change Archive search backend semantics.
- Do not invent fake methodology data or public claims. If no field-log data
  exists, use honest empty-state or explanatory copy.
- Do not expose private archive text, private prompts, debug payloads, provider
  metadata, owner IDs, tokens, cookies, or credentials.

## Acceptance

- At 390px, signed `/studio` and representative protected launch-core routes do
  not exceed viewport width due to global navigation.
- Mobile Archive exposes a clear search affordance while retaining current
  owner-scoped search behavior.
- Public Developer Space has enough methodology/field-log explanation for a
  visitor to understand what they are seeing without claiming unavailable data.
- Archive/import source states explain safety, next action, and visibility
  without turning into a marketing page.
- No broad palette, typography, or layout churn outside the touched surfaces.

## Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If API routes or backend search behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
```

## ARGUS Review Ask

ARGUS should hostile-review:

- whether the mobile nav fix preserves route access and avoids hidden dead ends;
- whether Archive search affordance changes are real and accessible;
- whether Developer Space and Archive narrative copy is truthful and does not
  overclaim live methodology, source depth, or privacy guarantees;
- whether any private/debug/provider information leaks;
- whether scope drifted into broad redesign or backend architecture.

## ARIADNE Recheck Ask

If ARGUS accepts, ARIADNE should recheck:

- signed `/studio` at 390px;
- mobile Archive search affordance;
- public Developer Space storytelling;
- Archive/import source narrative;
- no new obvious button/control deadness on the touched surfaces.

## Wake Discipline

DAEDALUS should wake ARGUS with files changed, screenshots or measured overflow
evidence where practical, copy changes, validation results, and ARIADNE recheck
recommendation.

## ARGUS Review Result

ARGUS accepts PR37 for MIMIR closeout, 2026-06-18.

- Signed mobile top navigation preserves protected route access by hiding the
  dense protected top-level links below 640px while keeping `/studio`, `/space`,
  and `/developer-spaces` reachable through the existing account menu.
- Archive search semantics are unchanged; the visible `Search private archive`
  label, input `aria-label`, and source-material/processing/visibility copy are
  present and owner-scoped.
- Developer Space observatory copy stays data-honest: it counts attached public
  methodology/finding/field-log notes, explains live signals as public runtime
  records, and keeps visitor/private boundaries explicit.
- No private archive text, private prompts, debug payloads, provider metadata,
  owner IDs, tokens, cookies, credentials, broad redesign, or backend
  architecture change was found.
- Local browser overflow measurement still is not available because Playwright
  is not installed as an executable/module in this workspace. ARIADNE should
  recheck signed `/studio` at 390px, the mobile Archive search label, public
  Developer Space story, and Archive/import source narrative on staging.

Validation passed or reproduced the known local caveat:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

The web build compiled, linted/type-checked, and generated 30 pages before
reproducing the known Windows Next standalone symlink `EPERM` failure.
