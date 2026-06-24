# PR256 - Developer Space Tier 1 Partner Readiness Preflight

Owner: A3 / ARGUS

Status: open

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

PR255 accepted the Developer Space partner-readiness map. The next work will
likely touch partner-facing docs and possibly visible Developer Space public or
owner framing. ARGUS should set the hostile gates before DAEDALUS implements,
so Tier 1 readiness does not drift into Tier 2 hosting claims or unsafe
developer-agent scope.

## Inputs

- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/roadmap/PR255_DEVELOPER_SPACE_PARTNER_READINESS_MAP_DAEDALUS.md`
- `docs/roadmap/STATION_UI_UX_ROADMAP.md`, especially UX-06.
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`, Lane 8.
- Current Developer Space routes, services, web pages, client package, tests,
  and export/readback behavior.

## Proposed PR257 Shape To Review

MIMIR's tentative implementation shape is narrow Tier 1 partner onboarding and
readback:

- standalone partner ingestion docs with placeholder-only curl and TypeScript
  examples for node state, events, snapshots, batch import, and
  observed-runtime webhooks;
- owner-console readiness copy/checklist that points to existing ingestion key,
  usage/quota, export, evidence-document, public/private field-control, and
  safe agent-readback surfaces;
- small public Developer Space framing improvements only if ARGUS judges them
  safe in the same slice: Tier 1 showcase language, live status, key stats, and
  evidence reading path;
- no schema, API behavior, hosted infrastructure, billing, repository, worker,
  Redis, Cloudflare, provider, or real developer-agent execution changes.

ARGUS may patch this into a smaller PR257. If visible public/owner framing
would make the lane too broad, split docs-only partner onboarding first and
leave visible UI framing for a later DAEDALUS/ARIADNE lane.

## ARGUS Task

Return one verdict:

- `ACCEPT`: PR257 can open with an exact bounded implementation brief.
- `PATCH`: PR257 can open only after narrowing or splitting the scope.
- `BLOCK`: no implementation should open until a named missing fact, route,
  test, or product decision is resolved.

Answer these questions:

1. What exact claims may PR257 make about Tier 1 Developer Spaces?
2. What exact claims must remain forbidden about Tier 2, Tier 3, hosted
   infrastructure, developer agents, jobs, keys, and billing/tipping?
3. Should PR257 include only docs, or docs plus small visible public/owner
   framing?
4. Which public/owner routes require ARIADNE rehearsal if visible framing
   changes?
5. Which tests and checks are required for PR257?
6. What should DAEDALUS avoid even if it looks easy?

## Mandatory Safety Gates

- Public/owner split: public pages and docs must not reveal owner-console raw
  operational detail, private fields, raw payloads, secret material, document
  bodies, provider data, source ids, or hosted credentials.
- Key/signing safety: examples must use placeholders only. No real local,
  hosted, ingestion, webhook, Railway, Supabase, provider, or Stripe secret may
  appear.
- Field visibility: public examples and copy must respect current visibility
  classes, event visibility, document link visibility, and scrubber behavior.
- Developer-agent boundaries: repo push, real job execution, key rotation,
  signing-secret creation, direct layout mutation, Docker/Coolify/container
  provisioning, and destructive chat-native tools remain blocked.
- Product claims: Tier 1 is showcase/ingestion/observatory/evidence/readback
  for self-hosted developers. Tier 2 hosted infrastructure and Tier 3 lab work
  remain deferred.
- Billing/tipping: do not implement or imply active tipping/donation flows.

## Suggested Validation Gates For PR257

If docs-only:

```bash
git diff --check
```

If web copy/framing changes:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If export/readback copy changes, add:

```bash
npm exec --yes pnpm@10.32.1 -- run test:exports
```

## Wake MIMIR

When complete, commit with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR256 Developer Space Tier 1 Partner Readiness Preflight.
- Verdict: ACCEPT/PATCH/BLOCK.
- Recommended PR257 shape: ...
Risk:
- ...
Validation:
- ...
Task:
- Sequence the next DAEDALUS lane or resolve the blocker.
```
