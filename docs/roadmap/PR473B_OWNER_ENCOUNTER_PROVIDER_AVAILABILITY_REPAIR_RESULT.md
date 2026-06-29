# PR473B - Owner Encounter Provider Availability Repair Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Status: Ready for ARGUS review

## Summary

DAEDALUS completed the smallest PR473B repair without widening private-context
provider policy.

The hosted defect showed the private owner panel as runnable, but generation
returned `Encounter preview provider setup is unavailable.` The repair adds an
authenticated provider-readiness preflight for the same owner-selected persona
pair and makes the Studio panel fail closed before enabling generation when no
accepted private-context provider route is available.

If an accepted private-context route is configured, such as Station Anthropic,
Station DeepSeek, or owner BYOK under the existing resolver policy, the panel
can enable generation. If hosted only has NVIDIA platform chat for private
context, the readiness check returns paused with `provider_data_policy`; the UI
keeps the Generate button disabled and shows bounded paused copy.

## Implementation

Files changed:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

API:

- Added authenticated `GET /persona-encounters/preview/readiness`.
- The readiness route verifies both personas belong to `req.user!.id`.
- Readiness uses the same provider resolver as generation with
  `allowPlatformNvidia: false`.
- Readiness returns `ready: true` only when an accepted private-context route is
  configured.
- NVIDIA-only private context returns `ready: false`, code
  `persona_encounter_provider_unavailable`, and classification
  `provider_data_policy`.
- The existing generation POST still fails closed before provider calls when
  the provider route is unavailable.

Web:

- The private Studio panel checks readiness whenever the owner/persona pair is
  available or changes.
- The panel disables generation while readiness is loading or unavailable.
- The visible copy says the preview is paused because provider setup is
  unavailable instead of presenting a runnable button that fails after click.
- The existing non-durable provenance readback remains visible.

## Non-Scope Confirmation

This patch does not add:

- broad NVIDIA/private-context enablement;
- new provider policy, provider secrets, or provider config;
- cross-owner encounters, public encounters, anonymous encounters, background
  loops, durable transcripts, source retrieval, schema, migrations, storage,
  queues, workers, Redis, Cloudflare, billing, Stripe, or broad UI;
- prompt/output persistence or transcript persistence.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts` | Pass | 8 tests passed, including accepted-provider readiness and NVIDIA-only private-context paused behavior. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts` | Pass | 6 tests passed, including readiness path and fail-closed availability copy. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 14 tests passed after package builds. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 160 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

ARGUS should review PR473B against the PR473A/PR473B boundaries:

- same-owner, private Studio-only readiness;
- no broad NVIDIA/private-context enablement;
- no provider call when readiness is unavailable;
- generation remains bounded by the PR473A POST guardrails;
- UI fails closed before enabling generation when provider setup is
  unavailable;
- no new durable transcript, source retrieval, public/shareable, billing,
  worker, queue, schema, storage, Redis, Cloudflare, or broad UI scope.

If ARGUS accepts the repair, ARGUS should wake MIMIR for hosted rehearsal rerun
or provider/config blocker decision. If fixes are needed, wake DAEDALUS with the
smallest repair.
