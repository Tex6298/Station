# PR120 - 2C Observed Runtime Fixture Preflight

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements. ARGUS reviews hostile visibility, serialization,
and overclaim risk. ARIADNE only rehearses if a visible route changes.
Status: implemented by DAEDALUS; pending ARGUS review

## Why This Lane

PR119 closed the scoped Railway replay path as staging demo-steady with caveats.
The next useful product direction is the first deliberate Phase 2C preflight:
prove Station can ingest and read back observed external runtime data without
claiming to host that runtime.

This lane follows
`docs/roadmap/2C_EXTERNAL_OBSERVED_RUNTIME_FIXTURE_NOTE.md`.

## Scope

Build the first neutral synthetic observed-runtime fixture contract:

- define a JSON fixture shape for source descriptor, nodes/entities,
  events/signals, snapshots, zones, resources/economy, graph edges,
  provenance, and field classification;
- add at least one canonical synthetic fixture and, if cheap, shadow fixtures
  that stress Animus-like identity observability and MUDD-like world/community
  observability without partner-specific branding;
- add parser/normalizer tests that reject malformed or overexposed fixture
  fields;
- prove public, member, owner, private, and secret field filtering in focused
  tests;
- prove Developer Space observatory readback can consume normalized public-safe
  observed data;
- document the future webhook shape as a later step, without requiring live
  secrets or a deployed endpoint.

## Non-Scope

- No hosted runtime, container execution, job scheduler, worker, queue, or
  background loop.
- No Cloudflare Worker, Vectorize index, D1 binding, live Cloudflare call, or
  Cloudflare config request.
- No partner-specific adapter or partner-branded route.
- No user-pasted secrets, vault UI, ingestion-key redesign, or secret storage
  feature.
- No Developer Space broad redesign, public interaction mode, billing, Stripe,
  Redis memory truth, provider routing, or chat-native developer agent.
- No claim that Station executes, controls, or hosts the external runtime.

## Implementation Notes

Prefer small library/helpers plus tests before UI. Likely locations:

- `apps/web/lib/developer-space-observatory.ts` for readback helpers if the
  current Developer Space helper is the cleanest existing boundary;
- `apps/web/lib/developer-space-observatory.test.ts` for focused readback and
  filtering tests;
- a new fixture file under an existing test fixture/docs location, or a small
  new `docs/fixtures` / `apps/web/lib/__fixtures__` location if the repo has no
  better local pattern;
- `docs/architecture` or `docs/roadmap` for the future webhook shape.

Keep the implementation file/sample first. Webhook-capable comes later after
ARGUS accepts the neutral visibility contract.

## Acceptance

- A canonical synthetic fixture exists and is rich enough to represent nodes,
  signals, snapshots, zones, resources/economy, graph edges, provenance, and
  field classifications.
- Every field family that could cross visibility boundaries has an explicit
  classification.
- Public readback excludes private and secret fixture material.
- Owner readback may show owner-safe details but never serializes secret-class
  values.
- Developer Space observatory readback can display normalized public-safe
  observed data.
- Docs clearly say this is observed-runtime import/readback proof, not hosted
  runtime or Cloudflare execution.

## Validation

Run the narrowest relevant test set first:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If API code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
```

If visible web code changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
```

Record the known Windows Next standalone symlink `EPERM` only if the build
reaches successful compile/lint/typecheck/page generation first.

## Handoff

Wake ARGUS when implemented with:

- exact files touched;
- fixture shape and normalization summary;
- visibility filtering proof, especially private/secret handling;
- whether Developer Space public or owner UI changed;
- validation results;
- explicit overclaim notes around hosted runtime, Cloudflare, workers, queues,
  partner adapters, and secrets.

If implementation cannot proceed, wake MIMIR with the exact blocker. Do not
leave the lane silent.

## DAEDALUS Implementation Notes

Implemented on 2026-06-20 as a file/sample preflight only:

- added `apps/web/lib/observed-runtime-fixture.ts` with parser, visibility
  validation, secret-shaped-field rejection, and Developer Space readback
  normalization;
- added canonical, identity-shadow, and world-shadow synthetic fixtures under
  `apps/web/lib/__fixtures__`;
- added focused coverage to `apps/web/lib/developer-space-observatory.test.ts`
  for fixture parsing, malformed external-runtime claims, missing
  classifications, overexposed secret-shaped fields, public/member/owner/
  private/secret filtering, and observatory helper readback;
- documented the fixture and future webhook boundary in
  `docs/architecture/observed-runtime-fixture-preflight.md`.

No API route, hosted runtime, Cloudflare, worker, queue, background execution,
partner adapter, user-pasted secret, billing, Stripe, Redis, provider-routing,
or visible Developer Space UI behavior changed.
