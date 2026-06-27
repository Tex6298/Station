# UX-01 - Studio IA And Mobile Workbench Feasibility

Owner: DAEDALUS
Reviewer: MIMIR, then ARGUS/ARIADNE for gates
Opened by: MIMIR
Status: OPEN - DAEDALUS FEASIBILITY REQUESTED
Date: 2026-06-27

## Why This Exists

ARIADNE approved UX-00 and recommended DAEDALUS as the next owner for UX-01
Studio IA and mobile workbench feasibility, with UX-02 Archive trust constraints
kept close as dependency notes.

UX-01 is the first implementation-adjacent UI/UX lane because protected-alpha
replay needs the private paid workbench to be legible: where the user is, what
is private, what is preserved, and what action comes next.

## Scope

This is feasibility only. Do not implement UI changes in this lane.

DAEDALUS should inspect the current frontend structure for:

- Studio dashboard and persona workspace routing;
- active chat layout and runtime context placement;
- Memory and Canon surfaces;
- Archive/library/global archive entry points;
- Integrity Session entry points;
- continuity summaries and timeline entry points;
- Station Assistant placement;
- private/public navigation pressure on desktop and 375px/390px mobile;
- archive trust dependencies from UX-02: import/export/status/provenance,
  storage/quota messaging, and preservation/privacy explanations.

## Product Constraints

Use ARIADNE's UX-00 patch as the product boundary:

- Station-native surfaces, not a wholesale Discern port.
- Explicit place labels.
- Privacy/visibility readback.
- Evidence/source readback.
- Route-story sections for operational surfaces.
- Mobile-first workbench clarity.
- Avoid generic dashboard KPI grids, fake activity, feed-first public browsing,
  and AI-magic copy.
- Do not weaken auth, visibility, archive, quota, billing, export, or
  public/community boundaries for polish.

## Required Output

Create a concise feasibility result that names:

- current Studio route/component inventory;
- fragile frontend boundaries;
- cheap first slice;
- expensive/deferred work;
- API/data surfaces that implementation would touch;
- tests or build gates ARGUS should require;
- ARIADNE review points for desktop and 375px/390px mobile;
- UX-02 archive-trust dependencies that should be included in the first slice
  or explicitly deferred;
- recommended next owner and lane.

The result should let MIMIR choose the first visible implementation slice without
guessing where the route/component risks are.

## Validation

Docs-only feasibility can close with:

```bash
git diff --check
```

Run additional commands only if DAEDALUS needs them to inspect or validate the
frontend structure. Record any known build/lint warnings rather than hiding
them.

## Non-Goals

- No UI implementation.
- No browser redesign.
- No hosted chat/model calls.
- No provider/config changes.
- No import/candidate mutation.
- No public/community mutation.
- No Redis, Cloudflare, schema, migration, worker, queue, billing, or runtime
  behavior changes.

## Handoff

Wake MIMIR with the feasibility recommendation. If DAEDALUS finds a safety gate
that needs ARGUS before implementation can be scoped, name it explicitly.
