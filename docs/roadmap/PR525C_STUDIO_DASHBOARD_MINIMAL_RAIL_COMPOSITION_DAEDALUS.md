# PR525C - Studio Dashboard And Minimal Rail Composition

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
READY_FOR_DAEDALUS_IMPLEMENTATION
```

## Locked Source

PR525A measured final Discern commit `de7b918e` against current Tex Station:

`docs/roadmap/PR525A_DISCERN_RENDERED_VISUAL_PARITY_SPECIFICATION_RESULT.md`

PR525B is accepted and supplies the shared warm-light tokens and exact `46px`
navigation dependency:

`docs/roadmap/PR525B_SHARED_WARM_LIGHT_FRAME_GLOBAL_NAVIGATION_CLOSEOUT_MIMIR.md`

Commit `99ae8a5c` remains lineage only. Do not restore its removed Studio
topbar/right panel or combine it with the final target.

## Exact Slice

PR525C corrects only the general Studio dashboard and the general Studio rail.
It must not begin the exact-persona companion shell, thread drawer, message
bubbles/composer, or Forums work reserved for PR525D, PR525E, and PR525F.

### Desktop rail

- At viewport widths of `960px` and above, make the general Studio rail exactly
  `156px` wide and full-height below the accepted `46px` global navigation.
- Use the locked warm rail token `#f3f1ea`, dark primary text, muted text, and a
  thin `#d7d2c8` right border. Remove the current dark rail skin and heavy
  card-like chrome.
- Do not duplicate the Station brand already present in global navigation.
- Keep the permanent rail deliberately small and ordered:
  1. New Chat and New Persona actions;
  2. the owner's compact persona list with a clear selected treatment;
  3. one named secondary-destinations disclosure;
  4. Settings at the bottom.
- Keep persona filtering reachable without reserving permanent rail height for
  the current large input. A compact named disclosure is acceptable; filtering
  behavior and no-match truth must not disappear.
- Put Public Space, Blog Posts, Publish, onboarding, Archive, Export, Assistant,
  Projects, My Space, Developer Spaces, and Billing in existing routes and the
  named secondary disclosure/account navigation as appropriate. Do not invent
  routes or delete destinations.
- Remove token and storage meters from the permanent rail. Their authoritative
  readbacks remain on Settings/Billing; expose a compact limit notice only when
  an actual action is blocked.
- Station Assistant remains an operational first-viewport dashboard action,
  not a persona and not a fake always-on companion.

### Mobile rail

- Below `960px`, render no desktop rail. Use one compact, full-width, warm-light
  Studio summary/disclosure below the `46px` global navigation.
- Preserve current-place naming, owner/private truth, all Studio destinations,
  public-presence links, personas, New Chat, New Persona, and Publish.
- The disclosure must be keyboard safe, use native links, report expanded
  state, fit at `390px` and `375px`, and avoid a second oversized sticky header.

### Dashboard first viewport

- Use the warm canvas and panel tokens from PR525B. Replace the dashboard's
  dark inline palette and nested-card treatment with restrained white/soft
  surfaces, thin borders, compact typography, and square-to-small radii.
- At `1440x900`, the first viewport below global navigation must contain:
  - the Studio heading and owner-only boundary;
  - Open Companion or zero-persona New Persona primary action;
  - New Persona, Choose Path, Open Public Space, and Station Assistant access;
  - recent/owned companions;
  - truthful Integrity due, clear, or unavailable state.
- Keep the no-persona state coherent and make no automatic redirect.
- Preserve Memory orientation, Archive/import/export, publishing, usage,
  billing, and settings capability. Secondary operational panels may continue
  below the first viewport or sit behind a clearly named disclosure; they may
  not be removed merely to shorten the page.
- Keep current honest empty/error/loading states. Do not fabricate activity,
  counts, dates, usage, due rows, or recent work.
- Do not scale display type with viewport width. Ensure every control and long
  persona name fits without document-level horizontal overflow.

## Allowed Files

```text
apps/web/app/globals.css
apps/web/app/studio/layout.tsx                       only if shell semantics require it
apps/web/app/studio/page.tsx                         only if dashboard composition requires it
apps/web/components/studio/studio-sidebar.tsx
apps/web/components/studio/studio-dashboard.tsx
apps/web/components/studio/studio-frame.tsx          only for shared Studio primitives used here
apps/web/lib/studio-navigation.ts                     pure route/composition helpers only
apps/web/lib/studio-navigation.test.ts
apps/web/components/studio/studio-dashboard.test.ts
```

No other production file is in scope without a concrete blocker committed for
MIMIR. Do not alter package metadata or lockfiles.

## Preserved Contracts

- Keep route URLs, session restoration, login redirect, sign-out, owner/persona
  scope, visibility, API calls, loading/error truth, and backend data unchanged.
- Keep all current Studio capabilities reachable; relocate rather than delete.
- Do not touch exact persona-home routing, URL-backed conversation selection,
  thread filtering/race protection, chat streaming/provider behavior, message
  actions, Memory/Continuity/Canon/Archive/Integrity contracts, or public data.
- Do not touch API, schema, auth implementation, storage, retrieval, billing
  logic, Redis, Cloudflare, queues/workers, deployment, or secrets.
- Do not recolor or restructure Developer Space observatory interiors.
- Do not wholesale import Discern CSS or broad-reskin unrelated pages.

## Acceptance Gates

- At `1440x900`, the rail computes to exactly `156px`; content consumes the
  remaining width and the named first-viewport hierarchy is visible.
- At `390x844` and `375x812`, no desktop rail renders; the compact Studio
  disclosure and dashboard fit with no clipped controls, incoherent overlap,
  or document-level horizontal overflow.
- Signed-out, loading, zero-persona, one-persona, many-persona/filter, due,
  clear, unavailable, and error states remain truthful and route-safe.
- Every destination removed from permanent rail chrome remains reachable by a
  named keyboard path with correct active/current treatment.
- Permanent rail contains no token/storage dashboard and no duplicate global
  Station brand.
- The dashboard and rail use the locked warm tokens; no dark first-viewport
  dashboard/rail block remains.
- Focused navigation/dashboard tests pass.
- `pnpm test:studio-ui`, `pnpm test:auth`, `pnpm test:developer-spaces`,
  `pnpm typecheck`, and `pnpm lint` pass.
- A local Playwright desktop/`390px`/`375px` matrix records computed rail
  geometry, first-viewport bounding boxes, destination reachability, disclosure
  keyboard behavior, overflow, and page errors.
- `git diff --check` passes with no forbidden file, package, lockfile, secret,
  backend, companion/chat, Forums, or Developer Space interior drift.

## Result And Handoff

Commit the implementation plus a PR525C result document containing:

- changed-file inventory;
- before/after rail and first-viewport measurements;
- capability relocation inventory showing every moved destination;
- desktop/mobile route and keyboard proof;
- exact validation commands/results;
- any visible deviation in PR525A's required four-line format.

Then wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR525C Studio dashboard and minimal general rail.
Task:
- Review exact 156px/960px geometry, warm composition, first-viewport hierarchy,
  route/auth/privacy preservation, capability relocation, mobile disclosure,
  tests, Developer Space no-drift, and forbidden PR525D/E/F scope.
- Patch only a narrow defect; otherwise wake MIMIR with acceptance or the exact
  blocker.
```

Do not return to foreground wait without committing either the implementation
result and `WAKEUP A3:` handoff or a concrete blocker and `WAKEUP A1:` handoff.
