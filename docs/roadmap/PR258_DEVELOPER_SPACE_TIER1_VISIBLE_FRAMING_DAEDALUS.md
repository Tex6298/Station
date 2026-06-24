# PR258 - Developer Space Tier 1 Visible Framing

Owner: A2 / DAEDALUS

Status: open

Opened by: A1 / MIMIR on 2026-06-24

## Why This Lane Exists

PR257 made Tier 1 partner onboarding legible in docs only. The visible
Developer Space product still needs to say the same thing in the browser:
Station is hosting a public showcase, observatory, evidence path, and private
owner console for a developer whose runtime remains self-hosted.

This lane is copy/framing and helper-test work on the existing public and owner
Developer Space routes. It is not a new infrastructure, API, schema, billing,
community, or developer-agent capability lane.

## Inputs

- `docs/integration/developer-space-tier1-partner-onboarding.md`
- `docs/roadmap/DEVELOPER_SPACE_PARTNER_READINESS_MAP.md`
- `docs/roadmap/PR256_DEVELOPER_SPACE_TIER1_PARTNER_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR257_DEVELOPER_SPACE_TIER1_PARTNER_ONBOARDING_DOCS_DAEDALUS.md`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`

## Allowed Scope

You may update:

- public Developer Space framing on `/developer-spaces/[slug]`;
- owner manage-console copy on `/developer-spaces/[slug]/manage`;
- existing Developer Space observatory helper copy;
- focused helper tests for the copy/readback decisions;
- roadmap/status/validation docs.

Keep the implementation within existing routes, APIs, serializers, controls,
and data. Do not add routes, schema, migrations, package scripts, env vars, SDK
methods, generated assets, screenshots, billing, forum/community features, or
hosted runtime behavior.

## Public Developer Space Requirements

Make the anonymous/member public page read as a Tier 1 showcase:

- The project runtime is external/self-hosted.
- Station displays public-safe node, event, snapshot, and evidence readback.
- The page is an observatory and reading path, not a hosted app console.
- Methodology, findings, field logs, and notes are the evidence layer when
  public documents are linked.
- Live signals are public state summaries, not raw runtime payloads.
- Private fields, owner-only links, raw payloads, document bodies, source ids,
  prompt/provider data, secrets, hosted logs, and credentials stay out of the
  public surface.

Use the current visual structure unless a small copy/layout adjustment is
needed to make the Tier 1 boundary obvious. Avoid a broad reskin.

## Owner Manage Console Requirements

Make the owner route read as the private Tier 1 operating console:

- Ingestion key and observed-runtime instructions are for the developer's
  runtime environment, never browser code or public pages.
- Visual mode and widgets configure the public observatory frame only.
- Evidence path controls curate methodology, findings, field logs, notes, and
  public-safe document links.
- Exports/readback remain owner-only.
- Developer Agent areas remain bounded to preview/readback, confirmations,
  receipts, selected status notes, layout suggestions, and `run_job`
  dry-run/readiness readback.
- Copy must not imply repo push, real job execution, key rotation,
  signing-secret creation by agent, direct layout mutation, provider execution,
  deploys, workers, billing, Redis/queues, Cloudflare, Docker/Coolify, or
  Station-hosted partner runtime.

Do not add a new checklist component unless the existing page needs a small
readback block to prevent misunderstanding. If you add one, it must be derived
from existing state only and have no new actions.

## Forbidden Changes And Claims

- No schema, migration, API route, serializer, auth/session, package, SDK, env,
  deployment, Railway, Supabase, Redis, Cloudflare, provider, billing, tipping,
  community/forum, Project, persona, export payload, or background-job changes.
- No new real developer-agent action. No repo push, deploy, key/webhook secret
  mutation, direct layout mutation, worker execution, shell execution, or
  provider call.
- No public exposure of raw ids, private document bodies, source ids, raw link
  ids, prompts, provider payloads, credentials, secrets, SQL, stack traces,
  hosted logs, ingestion keys, signing secrets, or bearer tokens.
- No claim that Tier 1 hosts a developer app, database, queue, repository,
  deployment pipeline, provider runtime, or job worker.

## Required Validation

Run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

Also scan changed Developer Space web/helper files for secret-shaped material
before review. Report the pattern used and the result; do not print secrets.

## Wake ARGUS

When complete, commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR258 Developer Space Tier 1 Visible Framing.
- Public and owner Developer Space browser copy now frames Tier 1 as external
  runtime plus Station-hosted showcase/observatory/readback.
Validation:
- ...
Risk:
- This is visible browser behavior and requires ARIADNE desktop/mobile
  rehearsal after ARGUS review.
Task:
- Review for Tier 1/Tier 2 overclaim, owner/public boundary safety, secret/raw
  payload exposure, developer-agent scope drift, and whether ARIADNE can
  rehearse the visible routes.
```

If you discover that the visible framing needs schema, API, serializer, route,
or new control behavior, stop and wake ARGUS with the blocker instead of
expanding scope.
