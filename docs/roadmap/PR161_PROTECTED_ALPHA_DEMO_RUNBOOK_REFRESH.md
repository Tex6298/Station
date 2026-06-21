# PR161 - Protected Alpha Demo Runbook Refresh

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE refreshes the human runbook.
Status: opened for ARIADNE

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
