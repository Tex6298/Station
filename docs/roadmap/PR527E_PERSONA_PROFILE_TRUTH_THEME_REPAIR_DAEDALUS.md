# PR527E - Persona Profile Truth And Theme Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - exact accepted implementation slice

## Authority

ARGUS accepted the implementation boundary as:

```text
ACCEPT_PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARIES
```

Implement the exact truth map, visible copy, state/mutation contract,
semantic presentation contract, tests, and rendered proof in:

`docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md`

That result is normative. This packet routes it; it does not widen or
reinterpret it.

## Product Outcome

Persona Profile becomes a truthful owner readback with limited live controls,
not a general identity editor. The page must:

- reject missing, malformed, or non-owner public serialization before owner
  secondary reads or controls mount;
- present name, short/long description, provider, visibility, public chat, and
  public description as static labelled facts;
- preserve exactly avatar URL save/clear, eligible anonymous public chat
  alpha, and context handoff save as live mutation capabilities;
- distinguish independent architecture/handoff/lifecycle, memory-graph, and
  Integrity loading, ready-empty, populated, and unavailable states;
- keep notices action-local, bounded, and authoritative;
- retain every accepted readback and navigation destination with the exact
  corrected labels;
- correct only the two Profile context strings in Studio navigation; and
- use one coherent route-scoped System/Light/Dark presentation without fixed
  dark colors, viewport-scaled type, nested decorative cards, or narrow-grid
  overlap.

The API has an owner-filtered persona DELETE route, but this UI has no delete
command. Do not add, advertise, import, test, or change deletion.

## Exact Owner Gate

The primary edit page may render `PersonaManagement` only after an
authenticated `GET /personas/:id` response proves:

```text
persona.ownerUserId === session.user.id
```

No session, missing/mismatched owner identity, malformed response, public
non-owner serialization, `403`, `404`, and read failure all render the same
bounded unavailable state. They must not reveal existence/public status,
mount secondary owner reads, or expose a live command.

## Exact Mutation Boundary

The component may send only:

```text
PATCH /personas/:id  { avatarUrl: string }
PATCH /personas/:id  { avatarUrl: null }
PATCH /personas/:id  { publicAnonymousChatEnabled: boolean }
POST  /personas/:id/handoffs  { summary: string | undefined }
```

Returned persona/handoff data is authoritative. Do not optimistically accept
a click, automatically retry, spread a Persona object, or send any identity,
description, provider, visibility, public-chat, architecture, or deletion key.

A successful handoff followed by architecture refresh failure remains a
successful handoff, retains the returned item, and uses the exact partial-
success copy from ARGUS. Avatar, anonymous-chat, and handoff notices must be
separate and adjacent to their action.

## Exact State And Copy Boundary

Use the complete locked copy in the ARGUS result. In particular:

- header: `Persona profile` and the exact limited-control description;
- header commands: `Back to chat`, `Open Integrity`;
- static section: `Profile facts` with all six exact labels;
- live avatar commands: `Save avatar URL`, `Clear avatar URL`;
- `Public access` with static public description and the one eligible
  anonymous-chat toggle;
- `Layer architecture`, `Memory graph`, `Archive and continuity`, `Context
  handoff`, `Lifecycle history`, and `Integrity history`;
- links: `Open Memory`, `Open Canon`, `Open Archive`, `Open Continuity`, and
  `Open Integrity`; and
- generic primary `Persona Profile unavailable` state with `Back to Studio`.

Failed optional reads may never render ready-empty copy. Do not echo raw API
or `Error.message` detail.

## Exact Presentation Boundary

Use `.persona-profile-page` and route-scoped `.persona-profile-*` classes.
Use only the existing semantic Station variables listed in the ARGUS result.
Do not change shared token definitions.

The route must meet the accepted structure, responsive collapse, wrapping,
focus-visible, hover-capable pointer, disabled/pending, control geometry,
mobile-nav clearance, and contrast rules. At `820px` and below the main grid
must be one column with no fixed second-column minimum. Text uses fixed `rem`
sizes and breakpoints, never `vw` or viewport-based `clamp()`.

## Allowed Files

Change only:

```text
apps/web/app/studio/personas/[personaId]/edit/page.tsx
apps/web/components/studio/persona-management.tsx
apps/web/lib/studio-navigation.ts
apps/web/lib/studio-navigation.test.ts
apps/web/lib/public-persona-route.test.ts
apps/web/app/globals.css
docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

Honor every file-specific limit in the ARGUS result. Do not touch API, types,
schema, migrations, auth, shared layout/sidebar, lifecycle helpers, public
persona, chat, Memory, Canon, Archive, Continuity, Integrity, settings,
billing, Discover, packages, lockfiles, configuration, or hosted data.

## Required Tests

Add focused assertions for every owner, static/live, state, mutation-body,
notice, navigation, copy, CSS-scope, responsive, theme, focus, and forbidden-
scope gate listed by ARGUS.

Run:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/persona-lifecycle-ui.test.ts
npx --yes pnpm@10.32.1 test:writing
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 test:personas
npx --yes pnpm@10.32.1 test:integrity
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/api typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

## Required Local Rendered Proof

Run the complete nine-group synthetic/intercepted proof from the ARGUS result.
It includes owner/non-owner/load/failure gates, independent secondary-read
states, long/empty content, all four mutation forms, handoff partial success,
navigation-only destinations, the nine viewport/theme combinations, keyboard
focus, contrast, stable geometry, diagnostics, path/scope scan, and private-
evidence scan.

No local proof may reach a hosted mutation route. Use synthetic values only.
Do not commit owner screenshots, ids, tokens, cookies, headers, or mutation
bodies.

## Frozen Scope

The full ARGUS frozen-scope list applies. In short: no backend, API-contract,
identity/provider/visibility/public-chat/deletion expansion, schema, auth,
tier, billing, provider, retrieval, public persona, Discover, package,
lockfile, config, Railway, Supabase, Cloudflare, queue/worker, social, partner,
or unrelated UI change. Hosted product/data write count must be zero.

## Result And Review Handoff

Create:

`docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_REPAIR_DAEDALUS_RESULT.md`

Record changed paths, exact contract implementation, test totals, rendered
matrix/contrast/geometry/diagnostics, scope scan, and zero-hosted-write truth.
Commit and push, then wake ARGUS explicitly:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented the accepted PR527E Persona Profile truth/theme slice and completed the required local validation/rendered proof.
Task:
- Hostile-review the implementation against docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md.
- Run the exact suites and independent rendered proof. Patch only inside the accepted allow-list if required.
- Commit and push the verdict, then wake MIMIR with WAKEUP A1:. Do not stop without a committed handoff.
```
