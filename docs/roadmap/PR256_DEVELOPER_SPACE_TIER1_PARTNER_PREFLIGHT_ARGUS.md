# PR256 - Developer Space Tier 1 Partner Readiness Preflight

Owner: A3 / ARGUS

Status: completed - ARGUS PATCH, awaiting MIMIR review

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

## ARGUS Preflight Verdict

ARGUS completed PR256 on 2026-06-24.

Verdict:

- `PATCH`.
- PR257 may open, but only as a docs-only Tier 1 partner onboarding/readback
  lane.
- Visible public Developer Space framing and owner-console UI copy must be split
  into a later DAEDALUS lane with ARIADNE desktop/mobile rehearsal.

Why PATCH:

- The proposed PR257 shape mixes partner docs with visible public/owner framing.
  That is too broad for the first post-map implementation because public
  Developer Space copy, owner console copy, and browser layout need separate
  route-level proof.
- Docs-only onboarding can safely clarify Tier 1 partner claims, examples, and
  owner controls without changing serializers, public pages, owner routes, or
  browser behavior.

## Exact PR257 Shape

Open **PR257 - Developer Space Tier 1 Partner Onboarding Docs** for DAEDALUS.

Allowed files:

- Add `docs/integration/developer-space-tier1-partner-onboarding.md`.
- Update roadmap/status/validation docs only as needed:
  `docs/roadmap/ACTIVE_STATUS.md`,
  `docs/roadmap/STATION_FUTURE_LANES.md`, and
  `docs/testing/VALIDATION_BASELINE.md`.
- Do not edit product code, schema, API routes, web routes, client package code,
  package scripts, migrations, env templates, or generated assets.

Allowed PR257 claims:

- Tier 1 is a Station-hosted public Developer Space showcase/readback for a
  developer whose app/runtime remains self-hosted.
- Station can display public-safe observatory state that the developer pushes
  through existing ingestion APIs.
- Station currently has owner-managed Developer Space controls for ingestion
  keys, observed-runtime signing secrets, usage/quota, field visibility,
  evidence/document links, exports/readback, and safe developer-agent previews,
  confirmations, receipts, selected status notes, layout suggestions, and
  `run_job` dry-run/readiness readback.
- Developers control what becomes visible through existing visibility fields,
  document/link visibility, and scrubber behavior.
- Developer Space exports/readbacks are owner-only.

Required PR257 content:

- A concise Tier 1 overview that explicitly says Station does not host the
  developer app/runtime, database, deployment pipeline, jobs, or repository in
  this tier.
- Placeholder-only `curl` examples for:
  - node state ingestion;
  - event ingestion;
  - snapshot ingestion;
  - batch import;
  - observed-runtime webhook ingestion.
- Placeholder-only TypeScript examples using `@station/developer-space-client`
  for the same ingestion flows.
- A "visibility and privacy" section explaining public/private/community-safe
  fields, document/link visibility, scrubbers, and why raw payloads, secrets,
  prompts, provider data, document bodies, source ids, and hosted credentials
  must not be public.
- An owner-console readiness checklist that references existing controls without
  changing UI: ingestion key, observed-runtime signing secret, usage/quota,
  evidence templates/links, field visibility, exports/readback, and safe
  developer-agent readbacks/receipts.
- A bounded troubleshooting section for auth failures, visibility mistakes,
  quota/rate-limit responses, webhook signature errors, and payload validation
  errors. Error examples must be sanitized and machine-readable, not copied
  from live secrets or hosted logs.
- A "not in Tier 1" section naming deferred work: Station-hosted compute,
  per-project databases, Redis/queues, deploy pipeline, repository push/deploy,
  real job execution, key rotation by developer agent, signing-secret creation
  by developer agent, direct layout mutation, Docker/Coolify/container
  provisioning, public interaction simulator, project-specific community/forum,
  billing, tipping/donation, Tier 2, and Tier 3.

Forbidden PR257 claims and changes:

- Do not claim Station hosts developer apps, databases, queues, deployment
  pipelines, repositories, background jobs, Redis, Cloudflare, provider calls,
  billing/tipping, or Tier 2/Tier 3 lab infrastructure in Tier 1.
- Do not imply `push_to_repo`, real `run_job`, key rotation, signing-secret
  creation by developer agent, direct layout mutation, Docker/Coolify
  provisioning, destructive developer-agent tools, or chat-native infrastructure
  operation is available.
- Do not add or expose real API keys, webhook secrets, Railway/Supabase/Stripe/
  provider credentials, bearer tokens, env values, private document bodies, raw
  payloads, source ids, raw link ids, prompt content, or hosted logs.
- Do not add public route changes, owner route changes, screenshots, downloads,
  generated SDK code, CLI tools, billing copy, community/forum UI, or visible
  Developer Space framing.

## PR257 Validation Gates

Required for docs-only PR257:

```bash
git diff --check
git diff --cached --check
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
```

Also run and report a targeted placeholder/secret scan over the new docs:

```bash
rg -n "sk_live|sk_test|DATABASE_URL|SUPABASE_SERVICE_ROLE|RAILWAY_TOKEN|STRIPE|OPENAI_API_KEY|GEMINI_API_KEY|ANTHROPIC_API_KEY|Bearer [A-Za-z0-9._-]+|station_whsec_live|station_whsec_test" docs/integration/developer-space-tier1-partner-onboarding.md
```

Expected scan result: no matches. Placeholder names such as
`<DEVELOPER_SPACE_API_KEY>` and `<WEBHOOK_SIGNING_SECRET>` are allowed.

If DAEDALUS changes web UI, public route copy, owner route copy, API behavior,
or client package code, PR257 is out of scope. MIMIR should open a separate
visible-framing lane with at least:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Visible framing also requires ARIADNE rehearsal on:

- anonymous `/developer-spaces/:slug`;
- owner `/developer-spaces/:slug/manage`;
- desktop and 390px mobile;
- no-secret checks for key, usage, quota, evidence, observatory, and
  developer-agent panels.

## PR256 Validation

```text
git diff --check passed with CRLF warnings only.
git diff --cached --check passed.
```
