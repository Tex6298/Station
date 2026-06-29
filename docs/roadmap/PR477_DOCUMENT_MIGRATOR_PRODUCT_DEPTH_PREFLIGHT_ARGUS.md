# PR477 - Document Migrator Product Depth Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARGUS

## Why This Lane

PR476A is closed. The next feature-expansion choice should move to a different
named Phase 3/customer-facing capability, not deepen the Social Publishing
surface again.

Station's reopened/future loops still include mature onboarding wizards and
richer Document Migrator / API Bridge product depth. Existing protected-alpha
truth is routeable but not yet a mature migration experience:

- four alpha onboarding paths are accepted as routeable;
- PR403/PR404 made Document Migrator and API Bridge state-aware and proved the
  hosted route-only behavior;
- private archive intake supports owner-only pasted/uploaded material and
  import-review surfaces;
- live Reddit/Discord/social OAuth/API pulls, recurring sync, external
  connector execution, workers, queues, Redis, and Cloudflare remain out of
  scope.

The useful next question is:

```text
Can Station open a first mature Document Migrator product-depth slice using
existing owner-scoped archive/import contracts, without live external pulls or
new secret/config requirements?
```

## Preflight Task

ARGUS should hostile-review the current repo and return one of:

```text
ACCEPT_PR477A_DOCUMENT_MIGRATOR_PREVIEW
ACCEPT_PR477A_ONBOARDING_IMPORT_GUIDE
BLOCKED_UNBLOCK_FIRST
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted, name the smallest PR477A implementation shape and wake DAEDALUS.

Preferred first slice:

1. Owner-only Document Migrator preview/readback:
   - use existing private archive/import parser or staging contracts if already
     safe;
   - let an owner inspect a bounded preview of what an import would create
     before committing to the existing import flow;
   - preserve owner confirmation before any archive source/import job is
     created;
   - no live external API pull or recurring sync.
2. If parser-backed preview is unsafe or too broad, owner-only onboarding import
   guide/readback:
   - make the Document Migrator path explain current source types, privacy
     boundaries, route targets, and next owner action from existing state;
   - keep it as a route/preview helper, not a new parser/import runtime.

If blocked, name the exact blocker and the smallest numbered unblock lane that
directly enables mature Document Migrator product depth. Examples: import
preview contract, parser redaction contract, source-type inventory contract, or
owner confirmation boundary.

## Questions ARGUS Should Answer

1. What private archive/import endpoints, parsers, and UI surfaces already exist
   for pasted/uploaded material?
2. Can the first PR477A slice safely preview import results without writing
   archive sources, import jobs, memory, canon, continuity, or public material?
3. If a write is unavoidable, what owner confirmation and rollback boundary is
   required before DAEDALUS touches code?
4. Which file types/source families can be included without live external API
   claims: plain text, Markdown, ChatGPT JSON, Claude JSON, Reddit JSON,
   Discord JSON, or only a subset?
5. What private source text, metadata, raw parser errors, SQL/table details, or
   stack traces must be redacted from UI/API readback?
6. Should API Bridge remain out of PR477A unless Document Migrator is blocked?
7. What exact files/tests should DAEDALUS touch if accepted?
8. What ARIADNE human rehearsal would prove the slice on hosted desktop/mobile
   without requiring new config or real external accounts?

## Guardrails

Do not add or claim:

- live Reddit, Discord, social, website, cloud drive, or external API pulls;
- OAuth, bot tokens, API keys, webhook setup, recurring sync, provider account
  linking, connector credentials, or secret storage;
- automatic import into Memory, Canon, Continuity, public documents, or
  external services without explicit owner confirmation;
- background workers, queues, retries, scheduled jobs, Redis, Cloudflare,
  vector-index changes, provider/model calls, billing, Stripe, schema changes,
  migrations, or hosted deployment/config changes;
- broad onboarding redesign, API Bridge credential creation, Developer Space
  runtime changes, full workspace export, PDF/binary export, or archive
  redundancy.

Do not print or persist private source bodies, raw parser dumps, secrets,
tokens, OAuth codes, provider payloads, hosted logs, SQL output, table names, or
stack traces in docs, tests, UI, or API responses.

## Inputs

- `docs/roadmap/PR476A_OWNER_SOCIAL_PUBLISHING_READINESS_CLOSEOUT.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/PR403_ONBOARDING_MIGRATOR_API_BRIDGE_DEPTH_RESULT.md`
- `docs/roadmap/PR404_ONBOARDING_MIGRATOR_API_BRIDGE_REHEARSAL_RESULT.md`
- `apps/web/app/studio/onboarding/page.tsx`
- `apps/web/lib/onboarding-paths.ts`
- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/api/src/services/imports/parsers`
- Current archive/import review tests.

## Wakeup Templates

If accepted:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR477 Document Migrator Product Depth preflight.
Task:
- Implement the exact PR477A slice ARGUS names.
Guardrails:
- No live external pulls, OAuth/API tokens, recurring sync, automatic import without owner confirmation, workers/queues, Redis, Cloudflare, provider calls, billing, schema changes, or private source leakage.
```

If blocked or decision-dependent:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR477 Document Migrator Product Depth preflight.
Verdict:
- BLOCKED_UNBLOCK_FIRST | REJECT_DEFER | NEEDS_MIMIR_DECISION
Task:
- Choose the smallest numbered unblock lane or pick a different named Phase 3/customer-facing feature.
```
