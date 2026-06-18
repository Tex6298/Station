# PR49 - Developer Project Abstraction Map

Date: 2026-06-18
Status: accepted by ARGUS after MIMIR completion
Owner: MIMIR completed the map, ARGUS reviewed, MIMIR decides whether to open
PR50.

## Purpose

Close the loop from the P38 / Phase 2 reconciliation note into the next
Developer Pages lane.

PR40 through PR48 proved the current Tier 1 Showcase Window: public Developer
Pages can present live project state, readable evidence, multiple examples, an
owner evidence console, and deployed human-eye proof. The next question is not
more surface polish. It is whether the current `Developer Space` model can grow
into Phase 2B: a real Project abstraction and ownership model.

This PR is an architecture map only. Do not implement schema, routes, auth
changes, billing changes, or UI changes in this lane.

## Source Truth

Use these as the primary references:

- `docs/product/DEVELOPER_PAGES_CTO_BRIEF.md`
- `docs/product/Station_Document_2_Technical_Specification.md`
- `docs/roadmap/PR40_DEVELOPER_PAGES_PHASE2A_ALIGNMENT.md`
- `docs/roadmap/PR47_DEVELOPER_PAGES_OWNER_EVIDENCE_CONSOLE.md`
- `docs/roadmap/PR48_DEVELOPER_PAGES_OWNER_EVIDENCE_RECHECK_ARIADNE.md`

Important framing:

- Phase 1 / P38 closes Station as Home.
- Phase 2 opens Station as Ecosystem.
- Phase 2A / Tier 1 Showcase Window is now proven enough for staging.
- Phase 2B should model projects, ownership, contributors, quotas, billing
  boundaries, and future institutional/API relationships before Tier 2 hosting.

## Scope

Produce a concrete map covering:

- Current tables/types/routes that assume direct user ownership for Developer
  Spaces, Spaces, documents, usage, exports, discussions, and billing.
- Where nullable `project_id` or a project membership relation would be needed
  later.
- What can remain user-owned for protected-alpha and what must become
  project-aware before Tier 2 hosted runtime.
- How subscription tier and Developer Page connection depth should stay
  separate.
- How the current seeded `station-replay-dev-alpha` and `animus-field-lab`
  examples would map into a future Project record.
- Owner/privacy risks: team members, public evidence, owner-only drafts,
  exports, ingestion keys, API clients, and quota counters.
- A proposed implementation sequence split into small PRs, with the first PR
  small enough for DAEDALUS to implement and ARGUS to review.

## Non-Scope

- No database migration.
- No route/table rename.
- No Project implementation.
- No contributor/member UI.
- No Tier 2 hosting, containers, databases, Redis queues, worker provisioning,
  deployment pipeline, Cloudflare lane, developer agent, chat-native tools, or
  DexOS-specific widgets.
- No changes to staging data.
- No broad UI/UX redesign.

## Deliverable

Create:

`docs/roadmap/PR49_DEVELOPER_PROJECT_ABSTRACTION_MAP_DAEDALUS.md`

Include:

- current-state inventory;
- proposed future data model at a conceptual level;
- migration/compatibility notes;
- risk register;
- recommended PR sequence;
- explicit answer to: "Does the evolved Developer Pages picture conflict with
  the current Developer Space implementation?"

## Acceptance

ARGUS can accept the map if:

- it cites current repo reality, not just product imagination;
- it separates user subscription tier from project connection depth;
- it preserves owner/privacy boundaries;
- it does not invent implementation work inside this lane;
- it gives MIMIR one clear next implementation choice.

## Validation

Docs-only lane:

```bash
git diff --check
```

If DAEDALUS reads code with helper scripts, do not commit generated scratch
files.

## Handoff

Wake ARGUS with:

- files inspected;
- exact doc created;
- the direct conflict/no-conflict answer;
- recommended first implementation PR;
- any unresolved decisions MIMIR must make.

If blocked, wake MIMIR instead with the blocker. Do not leave the lane silent.

## MIMIR Completion Note

DAEDALUS did not consume the initial PR49 wakeup or the re-wake. MIMIR completed
the requested architecture map in:

`docs/roadmap/PR49_DEVELOPER_PROJECT_ABSTRACTION_MAP_DAEDALUS.md`

Direct answer: the evolved Developer Pages picture does not conflict with the
current Developer Space implementation while it remains Phase 2A / Tier 1
Showcase Window. The conflict begins in Phase 2B when Station needs
multi-account project ownership, project-level billing/quotas, institutional
ownership, or Tier 2 hosted runtime.

ARGUS accepted the map with one planning clarification: PR50 should add
`projects`, `project_members`, and nullable `project_id` on Developer Spaces
and Developer Space usage only. `export_packages.project_id` should wait for
the project-aware export lane, where actor audit and membership permissions can
be designed with the column.
