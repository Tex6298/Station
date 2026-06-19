# PR60 - Memory UX And Observability First Slice

Date: 2026-06-19
Status: accepted by ARGUS; ready for ARIADNE signed owner UI rehearsal
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rehearses signed owner UI,
MIMIR decides next lane.

## Purpose

Start Phase 2 memory trust work with a small user-visible slice that makes
Station's existing memory lifecycle and AI observability foundations legible.

This follows the accepted PR59 pause on Project implementation. The next value
is not more Project scaffolding; it is helping an owner understand what Station
remembers, what is held out, and what recent AI activity did without exposing
raw private internals.

## Existing Foundations

Use what is already in the repo:

- `apps/web/app/studio/personas/[personaId]/memory/page.tsx`
- `apps/api/src/routes/memory.ts`
- `apps/api/src/services/memory-continuity.service.ts`
- `apps/api/src/routes/observability.ts`
- `apps/api/src/services/ai-observability.service.ts`
- `apps/web/components/settings/ai-observability-panel.tsx`
- `packages/types/src/persona.ts`

## Scope

Implement a bounded owner-only UI/readback slice:

### Studio Memory

- Improve the persona Memory page so lifecycle state is understandable at a
  glance.
- Show all relevant lifecycle counters, not only active/quarantined:
  - active;
  - quarantined;
  - rejected;
  - expired;
  - superseded;
  - missing lifecycle, if present in the briefing shape.
- Add clear runtime-readiness copy per memory item:
  - active memory is eligible for runtime context;
  - quarantined/rejected/expired/superseded/missing lifecycle memory is held
    out unless later restored by an owner action.
- Preserve existing owner lifecycle controls and add only the smallest useful
  action set:
  - reinforce;
  - restore/activate;
  - quarantine;
  - reject.
- Do not add complex supersession picking unless it is trivial and already
  supported cleanly by local patterns; otherwise leave supersession as a future
  richer review flow.
- Keep briefing counts refreshed after lifecycle changes.

### AI Observability

- Improve the Settings AI observability panel so recent traces are useful to a
  human owner without exposing raw prompts, completions, private archive chunks,
  provider keys, URLs, tokens, cookies, or owner/private ids.
- Show sanitized operational truth where already available:
  - source;
  - status;
  - duration;
  - token totals;
  - estimated cost;
  - provider route/profile label from metadata if present;
  - failure message if present and already sanitized.
- If adding trace detail expansion, use the existing owner-only
  `/observability/traces/:traceId` route and render only sanitized metadata or
  whitelisted fields.
- Preserve owner-only behavior; do not add public observability.

### UX Constraints

- Use existing Station UI primitives/styles where possible.
- Keep desktop and `390px` mobile fit.
- Do not start a broad redesign.
- Do not make telemetry feel like a separate product; this is trust/readback
  for the owner.

## Non-Scope

- No public memory surfaces.
- No raw AI trace prompt/completion/body display.
- No private archive excerpt display inside observability.
- No new memory truth store.
- No Redis or Cloudflare memory/index work.
- No embedding/provider migration.
- No Project work.
- No Developer Space hosted runtime, developer-agent, DexOS widgets, or
  Interconnected Lab work.
- No background worker or realtime infrastructure.
- No billing/quota/Stripe changes.
- No schema/migration work unless a tiny type/readback gap is unavoidable and
  ARGUS can review it inside this lane.

## Acceptance

ARGUS can accept PR60 if:

- The Memory page explains lifecycle states and runtime inclusion/holdout
  clearly.
- Lifecycle actions remain owner-only and preserve existing route behavior.
- Briefing counters update after lifecycle changes.
- Observability remains authenticated owner-only.
- Observability renders only sanitized operational metadata.
- No raw prompts, completions, provider payloads, private archive chunks,
  provider keys, base URLs, tokens, cookies, owner ids, persona ids, trace ids,
  or replay credentials leak into committed docs/tests/screenshots.
- Desktop and narrow mobile layouts remain usable.
- No Redis/Cloudflare/provider migration/Project/hosted-runtime/billing scope is
  added.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If observability service behavior changes, also run the focused observability
or conversation/archive tests that cover the touched path. If a web build is
run, record the known Windows standalone symlink `EPERM` separately from
compile/type/page-generation success.

## Handoff

Wake ARGUS with:

- exact web/API/type files changed;
- lifecycle labels/counters/actions added;
- runtime inclusion/holdout wording;
- observability fields rendered and sanitization boundary;
- whether trace detail expansion was added;
- desktop/mobile fit notes if checked;
- validation results;
- scope confirmation that no public memory, raw trace, Redis, Cloudflare,
  provider migration, Project, hosted-runtime, worker, billing, or DexOS work
  was added.

If ARGUS accepts, wake ARIADNE for signed owner UI rehearsal and wake MIMIR with
the review verdict. ARIADNE should check:

- a persona Memory page with active and held-out memories;
- lifecycle actions update copy and counters;
- Settings AI activity panel is understandable and not raw/private;
- `390px` layout has no horizontal overflow or offscreen controls.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.

## DAEDALUS Implementation Result

Implemented as an owner-only web/readback slice using existing API contracts.
No API route, schema, runtime store, provider, Project, billing, worker, Redis,
Cloudflare, hosted-runtime, or DexOS behavior changed.

### Studio Memory

- `apps/web/app/studio/personas/[personaId]/memory/page.tsx` now shows the full
  lifecycle counter set:
  - active;
  - quarantined;
  - rejected;
  - expired;
  - superseded;
  - missing lifecycle.
- `apps/web/lib/memory-lifecycle-ui.ts` centralizes lifecycle labels, runtime
  inclusion/holdout copy, counter derivation, and action visibility.
- Per-memory copy now distinguishes active memories as eligible for runtime
  context and held-out memories as excluded while quarantined/rejected/expired/
  superseded or missing lifecycle state.
- The per-memory action set now includes reinforce, restore, quarantine, and
  reject where relevant.
- Existing briefing refresh behavior is preserved after lifecycle changes.

### Settings AI Observability

- `apps/web/components/settings/ai-observability-panel.tsx` now renders recent
  trace facts for source, status, duration, token total, estimated cost, and
  whitelisted operational metadata.
- `apps/web/lib/ai-observability-ui.ts` centralizes formatting and client-side
  whitelisting for provider route/profile/provider/model/model-tier/policy/
  posture/domain labels.
- Failure message rendering applies defensive redaction for obvious URLs,
  secret-shaped values, tokens, cookies, authorization, API keys, passwords, and
  secrets.
- Trace detail expansion was not added in this slice. The panel uses the
  existing owner-only summary/list routes and renders only whitelisted list
  metadata.

### Focused Tests

- Added `apps/web/lib/memory-lifecycle-ui.test.ts`.
- Added `apps/web/lib/ai-observability-ui.test.ts`.
- Added both files to the existing `test:studio-ui` script.
- Updated `apps/web/lib/studio-navigation.test.ts` to match the current signed
  mobile top-nav route source of truth, which already includes `/projects`.

## Validation Result

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 32 tests passed after adding memory/observability helper coverage and correcting the stale signed mobile nav expectation for `/projects`. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed; lifecycle filtering and owner-only memory briefing stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 1 test passed; observability replay-readiness stayed auth-protected and non-secret. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

## Scope Confirmation

- No public memory surface.
- No raw prompt, completion, provider payload, private archive excerpt, provider
  key, base URL, token, cookie, owner id, persona id, trace id, or replay
  credential display.
- No Redis, Cloudflare, provider migration, Project implementation, hosted
  runtime, worker, billing/quota, schema, API route, or DexOS work.

## ARGUS Review

ARGUS accepts PR60 after one focused sanitization hardening patch.

Review notes:

- Studio Memory uses existing owner APIs and makes active versus held-out memory
  states clearer without adding public memory or changing lifecycle route
  behavior.
- The lifecycle counter/action helpers cover active, quarantined, rejected,
  expired, superseded, and missing-lifecycle states; briefing refresh after
  lifecycle actions is preserved.
- Settings AI activity stays on the existing owner-only summary/list routes and
  does not add trace detail expansion.
- ARGUS patched the client-side observability helper to also redact
  underscore-style secret values such as `sk_live_*`, bearer values, and
  secret-shaped strings that appear inside otherwise whitelisted metadata
  fields.
- No API route, schema, runtime store, public memory surface, provider
  migration, Project work, hosted runtime, worker, billing/quota, Redis,
  Cloudflare, or DexOS work changed.

ARGUS validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 32 tests passed, including strengthened observability redaction coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 7 tests passed; owner-only memory briefing and lifecycle filtering stayed green. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 1 test passed; observability replay-readiness stayed auth-protected and non-secret. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` | Partial / known Windows failure | Next compiled, linted/typechecked, collected page data, and generated 31 static pages, then hit the known standalone symlink `EPERM`. |
| `git diff --check` | Pass | No whitespace errors; CRLF normalization warnings only for touched files and local triad state. |

Verdict: PR60 is accepted for signed owner UI rehearsal. Wake ARIADNE to check
Memory lifecycle readability/actions, Settings AI activity usefulness/privacy,
and `390px` fit; wake MIMIR with the review verdict.
