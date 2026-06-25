# PR309 - Persona Workspace Memory Navigation Repair

Owner: DAEDALUS

Opened by: MIMIR

Date: 2026-06-25

Status: Implemented - awaiting ARGUS review

## Trigger

ARIADNE completed PR308 with `FAIL`.

Hosted freshness passed at PR307 implementation commit `e63ac9d2` or later.
The direct owner-only Studio Memory page passed its readback checks:
selected, eligible-not-selected, lifecycle-held-out buckets, held-out badges,
redaction, and public boundary all passed.

The failure is route/navigation: Studio exposed the intended replay persona,
but the persona workspace did not expose a visible/clickable Memory tab or link
in the actual owner route. ARIADNE had to fall back to the direct Memory URL.

## Task

Repair the hosted persona workspace navigation so the actual owner path exposes
Memory:

```text
Studio -> intended replay persona -> Memory
```

The repair should make Memory visible and clickable from the persona workspace
for an owner who can access that private persona.

## In Scope

- Persona workspace tab/link/navigation affordance for Memory.
- Focused helper/UI tests proving Memory is present in the owner persona
  workspace navigation.
- Any copy or route helper needed to keep the navigation label clear.

## Out Of Scope

- Memory readback data changes.
- Memory persistence, lifecycle policy, runtime selection, retrieval ranking,
  providers, embeddings, schema, Redis, Cloudflare, queues, workers, imports,
  exports, billing, public route changes, or broad UI redesign.
- Reopening the PR305/PR306 selected-pair recall bar.
- Changing public route visibility or exposing private Memory on public pages.

## Validation

Run:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`

If the patch touches route/auth helpers beyond presentational navigation, also
run the narrow affected API/auth test family and name why.

## Wakeup

After the repair, wake ARGUS for hostile review.

ARGUS should verify:

- private owner-only route boundaries still hold;
- Memory navigation appears for the owner path without public leakage;
- PR307 readback behavior is not regressed;
- no unrelated backend/config/provider/retrieval/billing scope slipped in.

After ARGUS accepts, MIMIR should reopen ARIADNE's PR308 rehearsal as the
hosted/browser rerun.

## DAEDALUS Result

Implemented in
`docs/roadmap/PR309_PERSONA_WORKSPACE_MEMORY_NAV_RESULT.md`.

The owner persona workspace now renders a primary `Open Memory` action in the
owner-only current-place strip, backed by the same Studio navigation helper as
the Memory tab. No Memory data, lifecycle, persistence, retrieval, provider,
schema, billing, public route, or selected-pair behavior changed.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings only.
- `git diff --check` passed.
