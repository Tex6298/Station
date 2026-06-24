# PR255 - Developer Space Partner Readiness Map

Owner: A2 / DAEDALUS

Status: open

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

PR252 through PR254 closed the owner Project export UI loop. The next open
product loop with concrete evidence is Developer Spaces: they are protected
alpha, but the roadmap still marks partner-ready Developer Spaces as unfinished.

Marty's CTO brief has also evolved the Developer Pages picture. Treat it as
product direction, not as permission to jump straight into hosted
infrastructure or destructive developer-agent tools.

## Inputs

- `C:\Users\marty\Downloads\Station_Developer_Pages_CTO_Brief.docx`
- `docs/roadmap/STATION_UI_UX_ROADMAP.md`, especially UX-06.
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`, Lane 8.
- `docs/roadmap/STATION_FUTURE_LANES.md`, Phase 2D/2E and Developer Space
  notes.
- Current code under:
  - `apps/api/src/routes/developer-spaces.ts`
  - `apps/api/src/services/developer-space*.ts`
  - `apps/web/app/developer-spaces/*`
  - `packages/developer-space-client/*`
  - related tests and migrations.

## MIMIR Position

- Tier 1 showcase/ingestion/observatory readiness is the likely next product
  target.
- Tier 2 full hosted infrastructure is later and must stay gated.
- The developer-agent work already accepted in Phase 2D/2E remains bounded:
  safe readbacks, confirmation envelopes, suggestion/readback, and dry-run
  readiness are allowed; direct repo pushes, job execution, key rotation,
  signing-secret creation, layout mutation, Docker/Coolify provisioning, and
  destructive tools remain blocked until separately opened.
- Public observatory and private operator console must stay clearly separated.
- This PR is a map/preflight, not implementation.

## Task

Create or update a focused readiness map that answers:

1. What does the CTO brief require for the immediate Tier 1 path?
2. Which pieces already exist in Station, with file/route/test references?
3. Which pieces are partial or misleading if treated as partner-ready?
4. Which gaps should be first implementation candidates?
5. Which gaps must be deferred to Tier 2/full-hosted or later experimental
   lanes?
6. What ARGUS gates and ARIADNE rehearsal routes should govern the first
   implementation slice?

At minimum, compare these brief requirements against the repo:

- public Developer Space page template;
- data ingestion API and developer client;
- live observatory widgets and widget configuration;
- methodology/finding/field-log/note documents;
- project-specific updates/changelog;
- project-specific community/forum entry;
- private developer dashboard/manage route;
- usage/quota, ingestion key, and public/private field controls;
- export/readback boundaries;
- connection tiers: Tier 1 showcase, Tier 2 hosted, Tier 3 lab;
- tipping/donation, hosted compute, per-project databases, Redis/queues,
  repository push/deploy, developer agent, and chat-native workspace tools.

## Deliverables

- Add a new map document, preferably
  `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`.
- Update `docs/roadmap/STATION_FUTURE_LANES.md` with the PR255 result and the
  recommended next PR.
- Update `docs/roadmap/ACTIVE_STATUS.md` with the handoff result.
- Update `docs/testing/VALIDATION_BASELINE.md` only if you add concrete
  validation evidence that belongs there.

The result should recommend one narrow next implementation lane. If the best
next lane is "ARGUS preflight first", say that clearly and explain why.

## Non-Goals

- No schema migrations.
- No API route behavior changes.
- No frontend route behavior changes.
- No Docker, Coolify, Railway, container, database, Redis, queue, or worker
  provisioning.
- No repository push/deploy integration.
- No real developer-agent execution.
- No new billing/tipping implementation.
- No public interaction simulator.
- No broad UI reskin.
- No secrets, raw IDs, provider keys, ingestion keys, private data, or hosted
  credentials in docs.

## Validation

Run:

```bash
git diff --check
```

If you inspect tests or code for evidence, name what you inspected. Do not run
a broad suite unless your map changes code or a touched doc makes a specific
test gate necessary.

## Wake ARGUS

When complete, commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR255 Developer Space partner-readiness map.
- The map reconciles the CTO brief with current Developer Space routes,
  services, client package, tests, and accepted Phase 2D/2E boundaries.
Risk:
- Over-claiming Tier 2/full-hosted or developer-agent readiness would distort
  the roadmap.
Task:
- Review the map for unsafe overclaim, missing privacy/owner-public split
  gates, and whether the recommended next implementation slice is correctly
  bounded.
```
