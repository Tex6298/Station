# PR161 - Protected Alpha Demo Runbook Refresh

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE refreshes the human runbook.
Status: accepted by ARGUS; waking MIMIR for demo closeout

## Why This Lane

PR160 cleared the focused hosted PR159 defects on the deployed Railway runtime.
The launch-core closeout says the next useful step, if an external demo is
next, is a narrated replay/demo script. Station already has a protected-alpha
demo runbook, but it now points at older PR67/PR68/PR39-era evidence and needs
to be brought in line with PR157 through PR160.

This lane is a runbook refresh, not a new product implementation lane.

## Goal

Make the protected-alpha human demo runbook current enough to use without
guessing.

## Scope

ARIADNE should refresh the smallest useful runbook surface, starting with:

- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`, only if the existing
  recommended next move/caveat text needs a small source pointer

Required updates:

- Replace stale "current accepted runtime" references with the latest accepted
  runtime/evidence posture from PR157 through PR160.
- Include the PR159/PR160 public document and UUID-redaction recheck result as
  current hosted evidence.
- Keep the demo route order practical:
  - signed-out landing/Discover/public Space/public document/forum;
  - signed-in Studio/persona;
  - Memory, Continuity, Archive/export, Developer Space public/manage, Billing
    status/actions;
  - optional chat/context-preview only with the PR156 latency caveat.
- Preserve spoken caveats:
  - protected-alpha, not production readiness;
  - no broad "backend complete" overclaim;
  - Stripe current closeout is config/test-resource readiness unless a fresh
    hosted Checkout or signed webhook proof is part of the demo;
  - Redis is operational cache, not Memory truth;
  - Cloudflare is future adapter/index-mirror boundary, not live runtime.
- Keep "claims to avoid" explicit and current.
- If any route in the old runbook is no longer current, correct the route or
  mark it as a fallback rather than leaving a stale instruction.

## Non-Scope

Do not:

- change app code or runtime behavior;
- run a new broad browser audit unless a runbook route is ambiguous and must be
  sanity-checked;
- click Stripe Checkout/portal actions;
- mutate replay data, billing state, imports, exports, Developer Space keys,
  Redis, Cloudflare, provider config, workers, or cache state;
- print or commit secrets, cookies, tokens, raw IDs, private corpus text,
  Checkout URLs, Stripe IDs, customer/subscription IDs, or webhook payloads.

## Validation

Expected validation:

```bash
git diff --check
```

If ARIADNE runs a route sanity check, record only sanitized status/route
evidence and why it was needed.

## Handoff

If the runbook is refreshed without finding a live blocker:

- wake MIMIR with route order, spoken caveats, and ready/not-ready verdict.

If a current route in the runbook is broken:

- wake DAEDALUS with the exact route, viewport, expected behavior, actual
  behavior, and whether ARGUS should review first.

## ARIADNE Refresh Result

ARIADNE refreshed the protected-alpha demo operator pack on 2026-06-21.

Files refreshed:

- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`

Route order now used by the operator pack:

1. Signed-out landing and Discover.
2. Public Space, public document, and linked forum discussion.
3. Signed-in Studio and persona workspace.
4. Memory.
5. Continuity.
6. Archive and export.
7. Developer Space public observatory and owner manage console.
8. Billing status and visible actions.
9. Station Assistant.
10. Integrity Session.
11. Optional chat/context-preview moment with the PR156 latency caveat.

Current evidence now reflected:

- PR157 protected-alpha evidence refresh and PR156 latency closeout.
- PR158 source-of-truth reconciliation for Redis, Cloudflare, provider, Stripe,
  and backend-blocker posture.
- PR159 hosted walkthrough defects and ARGUS-accepted PR159 patch.
- PR160 focused hosted recheck on runtime `6a8bb3eea401`, including cleared
  public document 401, zero UUID-shaped visible values on the focused readback
  surfaces, and 390px mobile Memory overflow pass.
- Docs-test commits after the PR159 runtime patch may skip Railway deployment
  when no watched runtime files changed; that is not stale runtime by itself.

Spoken caveats preserved:

- Protected-alpha replay, not production readiness or product completeness.
- Stripe is current config/test-resource readiness unless a fresh hosted
  Checkout or signed webhook mutation proof is part of the demo.
- Redis/Upstash is operational cache, idempotency, rate-limit, and cache-only
  queue-state support, not canonical Memory truth.
- Cloudflare is future adapter/index-mirror boundary, not live runtime or
  authoritative private-memory retrieval.
- PR156 latency evidence closes the immediate Archive-retrieval spike for now,
  but live provider/context latency can still vary.
- Archive is trust infrastructure; Continuity is the core paid value; Station
  Assistant is operational, not a persona; Spaces are public microsites, not
  profiles; Developer Spaces are live observatories, not generic dashboards.
- Station must not broaden into IntelHub CTI, exposure, recon, finance, or
  unrelated intelligence scope.

Claims to avoid are explicit in the operator pack, including production-launch
polish, broad backend completion, public Discover over private Studio data,
public Continuity, comprehensive private-text redaction, current Stripe paid
activation without fresh proof, Redis canonical Memory truth, Cloudflare live
runtime, and generic-dashboard framing.

Verdict: ready for a prepared protected-alpha human demo, with caveats spoken
aloud. No live blocker was found or reopened during this docs-only refresh.

Validation:

- `git diff --check`
- No route sanity check was run; the refresh used accepted PR157 through PR160
  evidence and corrected stale route instructions to avoid old hard-coded
  public document/forum IDs.

## MIMIR ARGUS Review Handoff

MIMIR accepts ARIADNE's runbook refresh as ready for hostile wording review.
ARGUS should review the refreshed operator pack before MIMIR treats it as final
demo closeout.

Review focus:

- no production-readiness or product-completeness overclaim;
- no broad "backend complete" overclaim;
- Stripe remains current config/test-resource readiness unless a fresh hosted
  Checkout or signed webhook proof is explicitly included;
- Redis remains operational cache, not canonical Memory truth;
- Cloudflare remains future adapter/index-mirror boundary, not live runtime;
- PR156 latency is framed as protected-alpha evidence, not a permanent
  performance guarantee;
- route instructions avoid stale hard-coded public document/forum IDs;
- no secrets, raw IDs, Checkout URLs, Stripe IDs, customer/subscription IDs,
  webhook payloads, or private corpus text were added.

If ARGUS accepts, wake MIMIR with the ready-for-demo verdict and any caveats
that must be spoken aloud. If wording or route instructions need correction,
patch the docs narrowly and then wake MIMIR.

## ARGUS Review

ARGUS accepted PR161 on 2026-06-22 after a hostile wording review of:

- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/roadmap/PR161_PROTECTED_ALPHA_DEMO_RUNBOOK_REFRESH.md`

Narrow ARGUS patch:

- `STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md` now labels the `508b4acc2dbe`
  health/deployment checks as PR157 source evidence and names PR160's
  `6a8bb3eea401` deployment as the current app-code runtime evidence for the
  public-read and UUID-redaction recheck.

Review verdict:

- Accepted for a prepared protected-alpha human demo, with caveats spoken
  aloud.
- No production-readiness, product-completeness, broad backend-complete,
  current Stripe paid-activation, Redis Memory-truth, Cloudflare live-runtime,
  or permanent-latency overclaim remains.
- Route instructions use Discover, visible Space document lists, public search,
  and `:personaId` placeholders instead of stale hard-coded public
  document/forum IDs.
- No secrets, UUID-shaped raw IDs, private corpus text, Stripe IDs, Checkout
  URLs, customer/subscription IDs, webhook payloads, or secret-shaped values
  were added.
- No app code/runtime behavior, route testing, billing mutation, replay-data
  mutation, Redis, Cloudflare, provider, worker, or cache scope changed.

ARGUS validation:

- `git diff --check`
- `git diff --cached --check`
- Staged secret-shaped value scan

Final recommendation:

- Wake MIMIR to close PR161 and use the runbook for the prepared demo unless
  the live demo itself reveals a concrete route-level blocker.
