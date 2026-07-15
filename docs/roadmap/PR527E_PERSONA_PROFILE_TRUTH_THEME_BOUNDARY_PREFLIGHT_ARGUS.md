# PR527E - Persona Profile Truth And Theme Boundary Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - read-only product/source boundary preflight

## Product Decision

PR527D2 is closed. Resume the ranked PR527 backlog at item `5`:

```text
Persona profile truth and theme repair
```

The owner route currently says it manages identity and public visibility, but
name, description, visibility, provider, public-chat state, and public
description are read-only. There is no persona-delete path. At the same time,
avatar URL, anonymous public chat alpha where eligible, context handoff,
continuity/archive navigation, and Integrity navigation are real behavior that
must not be flattened or broken.

The surface also hard-codes a dark workbench and fixed light text inside the
shared Light frame. Loading and error states carry separate fixed colours.

## Preflight Goal

Define the smallest route-owned implementation that:

- states exactly what the page can inspect and change;
- presents non-editable identity/provider/visibility values as read-only facts,
  not disabled or form-like promises;
- preserves and clearly distinguishes every genuinely live command;
- tokenises the whole route for System, Light, and Dark;
- fixes loading, error, focus, disabled, hover, and narrow states; and
- makes no backend, persistence, visibility, deletion, provider, or public
  persona contract change.

This preflight authorizes no source or hosted product mutation.

## Source Orientation

Inspect at minimum:

```text
apps/web/app/studio/personas/[personaId]/edit/page.tsx
apps/web/components/studio/persona-management.tsx
apps/web/app/globals.css
apps/web/lib/public-persona-route.test.ts
apps/api/src/routes/personas.ts
packages/types/src/persona.ts
docs/roadmap/PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md
```

Trace the actual API body allow-list and authorization for every visible live
mutation. Do not infer editability from a control's appearance.

## Required Decisions

### Truth map

Produce a table for every visible section and command covering:

- displayed claim;
- authoritative read source;
- whether it is read-only, navigational, or mutating;
- actual route/body contract for mutations;
- owner/auth/tier/visibility prerequisites;
- refresh/readback behavior; and
- required corrected copy or presentation.

At minimum classify:

- persona name, long/short description, provider, visibility, and public chat;
- avatar URL save/clear;
- anonymous public chat alpha toggle;
- layer architecture and memory graph;
- Memory, Canon, Archive, Files, Continuity, and Integrity links/readbacks;
- context handoff save/history;
- lifecycle and Integrity history;
- Back to chat and Run integrity; and
- persona deletion availability.

### Presentation boundary

Decide the exact route-scoped styling strategy. It must:

- use Station's shared semantic page/frame tokens rather than fixed hex dark
  surfaces or a Discern skin;
- avoid viewport-scaled typography;
- keep cards at `8px` radius or less;
- avoid cards nested as decorative page sections;
- preserve stable control geometry and clear focus-visible treatment;
- make disabled/read-only/live states visually and semantically distinct;
- fit long persona, layer, relationship, lifecycle, and handoff text without
  overlap or horizontal page overflow; and
- stay scoped to the owner Persona Profile route rather than broadly reskin
  Studio, public personas, chat, Memory, Archive, or Integrity.

Prefer static labelled facts for immutable values. A disabled select or
read-only input must not remain merely because it is already present.

### Copy boundary

Recommend exact bounded heading/supporting copy and section labels. The copy
must not imply that identity, provider, visibility, public-chat enablement, or
deletion can be changed here when they cannot. It may name true live actions
and link to existing supported destinations.

Do not invent `coming soon`, future persistence, deletion guarantees, public
discoverability, or setup behavior not established by source and hosted truth.

## Read-Only Hosted Orientation

Use the existing replay owner/persona only for GET/read-only browser
orientation. Do not save avatar, toggle anonymous chat, create a handoff, run
Integrity, edit data, or alter appearance persistence beyond reversible local
browser selection.

At `1440x900`, `390x844`, and `375x812`, inspect System, Light, and Dark far
enough to record:

- fixed-theme/contrast failures;
- heading and claim truth;
- live versus faux-control discoverability;
- loading/error behavior that can be safely observed without fault injection;
- wrapping, grid collapse, sticky/overflow behavior, and focus order; and
- current page and console diagnostics.

No hosted write is authorized.

## Implementation Recommendation

Return one exact DAEDALUS implementation slice with:

- allowed files;
- frozen files/domains;
- exact truth/copy changes;
- exact semantic classes/tokens or equivalent route-scoped treatment;
- required focused source/behavior tests;
- local rendered matrix and contrast thresholds;
- hostile ARGUS review gates; and
- final exact-SHA ARIADNE human rehearsal gates.

The likely implementation surface is the edit route, Persona Management
component, route-scoped CSS in the existing shared stylesheet, and focused
web source tests. Widen it only when source inspection proves another file is
strictly necessary.

## Frozen Scope

Do not authorize:

- persona identity, description, provider, visibility, public-chat, or delete
  API expansion;
- schema, RLS, migration, generated type, auth, tier, billing, provider,
  retrieval, Memory, Archive, Integrity, handoff, or anonymous-chat behavior
  changes;
- public persona or Discover changes;
- broad Studio/global reskin;
- package or lockfile changes; or
- hosted product writes.

## Result And Handoff

Create:

`docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md`

Record the source/hosted truth map, exact implementation allow-list, frozen
scope, copy and semantic presentation contract, local/review/hosted gates, and
one verdict:

```text
ACCEPT_PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARIES
BLOCK_PR527E_<EXACT_BLOCKER>
```

Commit and push the result, then wake MIMIR explicitly:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR527E's read-only Persona Profile truth/theme preflight.
Verdict:
- ACCEPT or BLOCK with the exact bounded reason.
Task:
- On acceptance, wake DAEDALUS with the locked implementation slice. On a blocker, open only the smallest numbered unblock lane. Do not stop without a committed handoff.
```
