# PR527E1 - Persona Profile Placeholder Contrast Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - smallest route-scoped hosted blocker repair

## Purpose

ARIADNE's exact-SHA hosted rehearsal blocked PR527E only because the empty
Avatar URL and Context handoff placeholders fail the locked normal-text
contrast floor in all nine appearance/viewport cases:

```text
System/Dark: 2.94:1
Light:       3.83:1
Required:    4.5:1
```

Every other Persona Profile text, boundary, focus, hover, disabled, wrapping,
geometry, navigation, owner-truth, and zero-write gate passed. Repair only the
two route-scoped empty-field placeholders and lock the result with a focused
source test plus intercepted rendered proof.

## Exact Implementation

Inside the existing `.persona-profile-page` presentation block, give only
`.persona-profile-field input::placeholder` and
`.persona-profile-field textarea::placeholder` an opaque semantic muted color.
Use the existing Station page token and explicit opacity; do not hardcode a
palette value or alter entered text, labels, controls, panels, global form
fields, or another route.

Extend the existing Persona Profile source contract test so it rejects a
missing route-scoped placeholder rule, the wrong semantic token, or inherited
placeholder opacity.

Allowed product/test paths:

```text
apps/web/app/globals.css
apps/web/lib/public-persona-route.test.ts
```

Do not edit the component, owner/readback logic, navigation copy, API, schema,
auth, packages, configuration, migration files, or any other route.

## Validation

Run at minimum:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/public-persona-route.test.ts
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

Use an intercepted local browser fixture with empty Avatar URL and Context
handoff fields. Measure both placeholders in System, Light, and Dark at
`1440x900`, `390x844`, and `375x812`. All `18` samples must meet `4.5:1` while
the previously accepted boundary, focus, wrapping, control geometry, and zero
horizontal-overflow gates remain green. Intercept every API call; no hosted
route or real product mutation is authorized.

Remove temporary harnesses, screenshots, sessions, and servers.

## Result And Handoff

Create:

`docs/roadmap/PR527E1_PERSONA_PROFILE_PLACEHOLDER_CONTRAST_REPAIR_DAEDALUS_RESULT.md`

Record changed paths, exact tests, all 18 measured placeholder results,
diagnostics, artifact cleanup, and zero hosted mutation. Do not claim PR527E
closed; ARGUS review and a bounded ARIADNE hosted rerun remain required.

Commit this result together with the separately assigned PR484J-N1 schema
unblock result only after both bounded tasks are complete. On success, wake
ARGUS with one explicit handoff covering both tasks. On a blocker, make no
speculative widening or partial hosted change; commit the exact blocker and
wake MIMIR.

