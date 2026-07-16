# PR528B1 - Principal Route Theme Repairs

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - route-scoped implementation

## Scope

Implement exactly the three PR528A visual blockers:

1. `/space/:slug/documents/:documentId` `DocumentTrustReadback`: replace fixed
   dark heading, explanatory, label, value, and row-copy colours with existing
   Station semantic theme tokens. Keep the published body, trust facts,
   visibility, provenance, and linked-discussion semantics unchanged.
2. `/studio/personas/:personaId/memory-inbox` `.archive-trust-copy`: make the
   explanatory decision copy meet meaningful-text contrast in Light and Dark.
   Preserve pending/accept/reject behavior and owner boundaries. If changing
   the shared class, prove every existing consumer remains readable.
3. `/studio/archive` local `primaryButton`: replace the white-on-near-white Dark
   `Ask Assistant` treatment with a theme-safe existing semantic pair. Preserve
   the route and Assistant behavior.

Use the shared variables already defined in `apps/web/app/globals.css`,
including `--station-page-text`, `--station-page-muted`,
`--station-page-accent`, and `--station-page-on-strong`. Do not introduce a new
palette, gradient, broad reskin, global typography change, or unrelated route
cleanup.

## Allowed Files

- `apps/web/app/space/[slug]/documents/[documentId]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/components/studio/archive-library.tsx`
- the smallest focused existing/new tests for those exact style contracts
- this result and `.station-agents/state/DAEDALUS.json`

Do not edit PR529, corpus/provider docs, hosted data, configuration, migrations,
API behavior, or another agent's state.

## Acceptance

- Meaningful trust heading/copy/rows, Memory Inbox explanatory copy, and Archive
  primary action each reach at least `4.5:1` in Light and Dark at `1440x900`
  and `390x844`.
- Document linked discussion still opens and exposes no owner control signed
  out.
- Memory candidate controls, labels, focus, and owner gate are unchanged.
- Archive `Ask Assistant` hover/focus remain visible and the destination is
  unchanged.
- No horizontal overflow, viewport escape, page error, console error, failed
  request, or unrelated selector drift appears in the focused matrix.
- Focused tests, Studio/document suites, web typecheck, web lint, and
  `git diff --check` pass.
- No hosted write is required. Railway deployment/rehearsal waits for ARGUS
  review after implementation.

## Result And Handoff

Create:

`docs/roadmap/PR528B1_PRINCIPAL_ROUTE_THEME_REPAIRS_DAEDALUS_RESULT.md`

Use verdict:

```text
READY_PR528B1_PRINCIPAL_ROUTE_THEME_REPAIRS_FOR_ARGUS
```

Commit and push only the authorized files, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the three route-scoped PR528B1 theme repairs with focused Light/Dark desktop/mobile proof.
Verdict:
- READY_PR528B1_PRINCIPAL_ROUTE_THEME_REPAIRS_FOR_ARGUS (or exact blocker)
Task:
- Route ARGUS review without disturbing the parallel corpus/provider preflight.
```
