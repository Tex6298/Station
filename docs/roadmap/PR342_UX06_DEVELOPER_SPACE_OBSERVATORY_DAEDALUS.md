# PR342 - UX-06 Developer Space Observatory Clarity

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- PR341 passed with the original forum category/status caveat closed.
- The remaining forum kind/visibility chip caveat is data-shape evidence only, not a product defect.
- MIMIR is moving the UI/product lane to UX-06 Developer Space observatory clarity.
Task:
- Implement the smallest safe no-new-config public Developer Space observatory clarity slice.
- If implementation is not safe, return an exact route/component map and explain the blocker.
- If code changes land, wake ARGUS for hostile review.
- If no code changes land, wake MIMIR with the exact next recommendation.
```

## Product Intent

Developer Spaces should read as public observatories, not generic dashboards.
Visitors should understand what they are looking at, what is live versus a
snapshot, what counts as evidence, and how public methodology or field-log
material connects to the running project.

This lane follows the UX-03 through UX-05 public surface work. Discover, public
Space, public document, and forum browsing now have enough route/readback proof
to move the baton to Developer Space observatory clarity.

## Primary Routes

- `/developer-spaces`
- `/developer-spaces/station-replay-dev-alpha`
- `/developer-spaces/animus-field-lab`, if it exists locally or hosted
- `/developer-spaces/[slug]/manage` only when owner/private framing needs copy
  alignment; do not expose owner tools publicly.

## Scope

Implement one narrow visible slice that improves visitor comprehension on the
public observatory route.

Good targets:

- clearer public observatory reading path before the live visualization;
- explicit live versus snapshot boundary copy;
- methodology, field-log, finding, evidence, or readback framing using existing
  public-safe data;
- better labels around nodes, public signals, latest signal, active node, and
  visible widgets;
- mobile-safe hierarchy so the visitor sees explanation before canvas-heavy
  content;
- empty/thin-data states that admit what is missing without making the product
  feel broken.

If the owner manage route is touched, keep it private and frame it as the
researcher/operator console. Do not mix ingestion keys or private controls into
the public observatory.

## Non-Scope

Do not add or change:

- config;
- environment variables;
- schema or migrations;
- database-admin actions;
- provider/model routing;
- Redis, Valkey, Upstash, Cloudflare, queues, or workers;
- billing or Stripe;
- ingestion key semantics;
- auth/session behavior;
- visibility rules;
- public launch/commercial claims;
- broad restyling outside Developer Space observatory clarity.

Do not claim live runtime behavior that the existing data does not prove.

## Implementation Guidance

Start by reading the existing public route and helper copy:

- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- relevant tests under `apps/web` or package scripts for Developer Spaces

Prefer a minimal patch that reuses existing structures and public-safe fields.
Do not invent a new design system or a new data model.

If you find that the right slice needs data not currently returned by the API,
do not broaden the lane. Return a route/component map and recommend the next
small backend/API packet instead.

## Validation

Run the narrowest useful checks available from the repo:

```text
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If a listed command is unavailable or too broad for the actual patch, explain
the substitution in the result doc.

## Required Result

Create:

```text
docs/roadmap/PR342_UX06_DEVELOPER_SPACE_OBSERVATORY_RESULT.md
```

Include:

- changed routes/components;
- exact product improvement;
- explicit non-scope confirmations;
- validation commands and outcomes;
- whether ARGUS should review code changes or MIMIR should choose the next
  planning step.
