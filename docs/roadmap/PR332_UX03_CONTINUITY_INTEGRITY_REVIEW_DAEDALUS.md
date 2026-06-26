# PR332 - UX-03 Continuity And Integrity Review

Owner: DAEDALUS

Date: 2026-06-26

Status: Open

## Why This Opens

PR331 passed the final repo-defined pilot-route prep check. The remaining pilot
blocker is real signed-in tester identities plus a private feedback channel,
which MIMIR cannot safely invent.

MIMIR is not leaving the baton idle. The next bounded internal lane comes from
the accepted UI/UX roadmap:

```text
UX-03 - Continuity and Integrity review UX
Purpose: help users see continuity accumulating without mystifying the system.
DAEDALUS first: identify where continuity, archive, memory, canon, and
integrity data already meet in the frontend.
```

This lane improves Station's core promise without new config and without
touching the external pilot.

## Inputs

Read:

- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/PR262_OWNER_RUNTIME_PROVENANCE_STITCHING_READBACK.md`
- `docs/roadmap/PR263_OWNER_RUNTIME_PROVENANCE_STITCHING_REHEARSAL_RESULT.md`
- `docs/roadmap/PR264_PERSONA_ARCHIVE_TRUST_STATES.md`
- `docs/roadmap/PR265_ARCHIVE_TRUST_REHEARSAL_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`

If any exact filename has moved, use `rg` to find the corresponding PR262-PR265
result docs before proceeding.

## Goal

Identify the smallest safe UX-03 product slice for owner-visible continuity and
integrity review clarity.

Prefer a tiny implementation if one is obvious and no-new-config. Otherwise
return a precise implementation packet for the next PR.

The target user question:

```text
What changed in this persona's durable continuity, why, and what source or
review state supports it?
```

## Scope

Allowed areas:

- owner-only Studio persona continuity route;
- existing owner-only continuity timeline records;
- existing owner-only memory/canon/archive/integrity readbacks;
- existing sanitized runtime provenance helpers;
- labels, grouping, review affordance copy, empty states, and source-link
  clarity;
- focused tests for touched helpers/routes.

Keep the work owner-only and readback-only unless an existing route already
supports the action. Do not invent new review actions.

## Hard Limits

Do not change:

- provider/model behavior;
- embeddings;
- retrieval ranking;
- memory truth;
- Redis, Cloudflare, queues, workers, billing, Stripe, Railway, Supabase config,
  migrations, auth/session, deploy, keys, or webhooks;
- public routes or publication behavior;
- external pilot route set, tester instructions, or pilot scope;
- private source body exposure;
- compiled prompt/provider payload visibility;
- product-enforced named-user allowlisting.

Do not broaden into a site-wide visual redesign.

## Expected Output

Create:

```text
docs/roadmap/PR332_UX03_CONTINUITY_INTEGRITY_REVIEW_RESULT.md
```

If implementing code, include:

- exactly what visible owner-only UX changed;
- exact routes/components/helpers touched;
- privacy boundary notes;
- tests run;
- whether ARIADNE hosted/browser review is required;
- wake ARGUS for review.

If not implementing code, include:

- route/component map;
- why no safe implementation slice should land now;
- exact recommended next PR packet;
- wake MIMIR.

## Validation Guidance

Scale validation to the touched surface. Likely commands:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run test:continuity`
- `npm exec --yes pnpm@10.32.1 -- run test:integrity`
- `npm exec --yes pnpm@10.32.1 -- run test:persona-context`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`

Run only the relevant focused subset if the final change is docs-only or helper
only, but explain the choice in the result.
