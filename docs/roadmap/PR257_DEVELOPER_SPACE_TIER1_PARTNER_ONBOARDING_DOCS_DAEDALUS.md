# PR257 - Developer Space Tier 1 Partner Onboarding Docs

Owner: A2 / DAEDALUS

Status: open

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

ARGUS completed PR256 with a `PATCH` verdict: the next implementation may open
only as docs-only Tier 1 partner onboarding/readback. Visible public Developer
Space framing and owner-console UI copy must wait for a separate lane with
ARIADNE rehearsal.

This lane should make Tier 1 legible to a self-hosted developer without
overclaiming Station-hosted infrastructure.

## Allowed Files

You may add:

- `docs/integration/developer-space-tier1-partner-onboarding.md`

You may update only as needed:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/testing/VALIDATION_BASELINE.md`

Do not edit product code, schema, API routes, web routes, client package code,
package scripts, migrations, env templates, generated assets, screenshots, or
visible product copy.

## Required Content

The new docs must include:

- A concise Tier 1 overview:
  - Station hosts the public Developer Space showcase/readback.
  - The developer's app/runtime remains self-hosted.
  - Station does not host the developer app, database, deployment pipeline,
    jobs, or repository in Tier 1.
- Placeholder-only `curl` examples for:
  - node state ingestion;
  - event ingestion;
  - snapshot ingestion;
  - batch import;
  - observed-runtime webhook ingestion.
- Placeholder-only TypeScript examples using `@station/developer-space-client`
  for the same ingestion flows.
- A visibility and privacy section explaining:
  - public/private/community-safe fields;
  - event visibility;
  - document/link visibility;
  - scrubber behavior;
  - why raw payloads, secrets, prompts, provider data, document bodies, source
    ids, raw link ids, hosted credentials, and hosted logs must not be public.
- An owner-console readiness checklist that references existing controls
  without changing UI:
  - ingestion key;
  - observed-runtime signing secret;
  - usage/quota;
  - evidence templates and linked documents;
  - field visibility;
  - exports/readback;
  - safe developer-agent readbacks, confirmations, receipts, selected status
    notes, layout suggestions, and `run_job` dry-run/readiness readback.
- Sanitized troubleshooting for:
  - auth failures;
  - visibility mistakes;
  - quota/rate-limit responses;
  - webhook signature errors;
  - payload validation errors.
- A "not in Tier 1" section naming deferred work:
  - Station-hosted compute;
  - per-project databases;
  - Redis/queues;
  - deploy pipeline;
  - repository push/deploy;
  - real job execution;
  - key rotation by developer agent;
  - signing-secret creation by developer agent;
  - direct layout mutation;
  - Docker/Coolify/container provisioning;
  - public interaction simulator;
  - project-specific community/forum;
  - billing;
  - tipping/donation;
  - Tier 2;
  - Tier 3.

## Forbidden Claims And Changes

- Do not claim Station hosts developer apps, databases, queues, deployment
  pipelines, repositories, background jobs, Redis, Cloudflare, provider calls,
  billing/tipping, or Tier 2/Tier 3 lab infrastructure in Tier 1.
- Do not imply `push_to_repo`, real `run_job`, key rotation,
  signing-secret creation by developer agent, direct layout mutation,
  Docker/Coolify provisioning, destructive developer-agent tools, or
  chat-native infrastructure operation is available.
- Do not add or expose real API keys, webhook secrets,
  Railway/Supabase/Stripe/provider credentials, bearer tokens, env values,
  private document bodies, raw payloads, source ids, raw link ids, prompt
  content, or hosted logs.
- Do not add public route changes, owner route changes, screenshots, downloads,
  generated SDK code, CLI tools, billing copy, community/forum UI, or visible
  Developer Space framing.

## Validation

Run:

```bash
git diff --check
git diff --cached --check
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
```

Run the targeted placeholder/secret scan:

```bash
rg -n "sk_live|sk_test|DATABASE_URL|SUPABASE_SERVICE_ROLE|RAILWAY_TOKEN|STRIPE|OPENAI_API_KEY|GEMINI_API_KEY|ANTHROPIC_API_KEY|Bearer [A-Za-z0-9._-]+|station_whsec_live|station_whsec_test" docs/integration/developer-space-tier1-partner-onboarding.md
```

Expected scan result: no matches. Placeholder names such as
`<DEVELOPER_SPACE_API_KEY>` and `<WEBHOOK_SIGNING_SECRET>` are allowed.

If you discover that a required example would need product-code changes, do not
change code. Wake ARGUS with the gap.

## Wake ARGUS

When complete, commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR257 Developer Space Tier 1 Partner Onboarding Docs.
- Scope stayed docs-only / or scope issue found.
Validation:
- ...
Risk:
- ...
Task:
- Review docs for overclaim, secret/key safety, Tier 1/Tier 2 boundary, and
  whether PR258 visible framing should open.
```
