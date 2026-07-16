# PR528A - Important Routes Partner Preflight

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - hosted human-eye preflight

## Task

Run a human rehearsal against the current hosted Station product and choose the
smallest route set that lets Marty and his partner judge the product honestly.
Use the accepted PR527 inventory, current roadmap, and actual hosted behavior;
do not turn the pass into a crawl of every route or button.

Start with signed-out public entry and the retained replay owner. Use the
ordinary human routes, visible controls, and browser navigation a partner would
use. ARIADNE already has the tools to inspect actions, keyboard behavior,
responsive geometry, theme, console/page/request failures, and authoritative
refresh readback; do not hand manual checking back to Marty.

## Required Preflight

1. Record the exact current hosted web/API SHA and readiness before inspection.
2. Select the principal route set and, for each route, state:
   - why it matters to partner understanding;
   - its one core action or truthful unavailable outcome;
   - signed-out/signed-in requirement;
   - data/privacy boundary; and
   - whether rehearsal can remain read-only or must use a reversible write.
3. Exercise each selected route in Light and Dark at `1440x900` and `390x844`.
4. Check the human-eye composition as well as mechanics: hierarchy, density,
   typography, contrast, state clarity, mobile fit, and whether the route feels
   like the same Station product as the accepted public front door.
5. For every finding, classify exactly:
   - `FIX_NOW_PR528`: blocks or materially distorts partner review;
   - `DEFER_PR529`: real but does not block partner judgment; or
   - `NO_ACTION`: intentional, truthful, or outside product scope.
6. For each `FIX_NOW_PR528`, identify the exact route, component/API boundary,
   user impact, acceptance check, likely owner, and smallest implementation
   slice. Separate product defects from deployment/configuration blockers.
7. Append each `DEFER_PR529` item to the paused PR529 ledger with all mandatory
   fields. Do not merely mention it in the result.

Pay particular attention to the companion home/return-to-thread experience,
Memory inbox and continuity shortcuts, the public discovery chain, Forums, and
the routes a partner naturally reaches from Studio. Billing, provider setup,
Developer Space, public persona, or Settings belong only when current evidence
shows they are principal or directly block a principal journey.

## Guardrails

- No product source edits in PR528A.
- No broad reskin, Discern CSS import, speculative feature, or unrelated
  backend expansion.
- Do not create irreversible personas, Projects, Integrity sessions, reports,
  paid Stripe state, or second-actor fixtures merely for coverage.
- Any reversible write must have an exact pre-snapshot, authoritative readback,
  cleanup, and fresh restoration proof.
- Do not print or commit credentials, tokens, private ids, private row bodies,
  or timestamps.
- A secondary counter or minor visual detail may enter PR528 only if it exposes
  dishonesty or blocks the route's core action.

## Result And Handoff

Create:

`docs/roadmap/PR528A_IMPORTANT_ROUTES_PARTNER_PREFLIGHT_ARIADNE_RESULT.md`

Include the selected route checklist, exact hosted SHA, route-by-route result,
fix-now implementation packet, explicit PR529 ledger additions, and a verdict:

```text
READY_PR528_IMPORTANT_ROUTES_PARTNER_PASS_FOR_IMPLEMENTATION
```

or an exact blocker. Change only the result, PR529's deferred-finding table,
operational status/index/baseline docs if required, and
`.station-agents/state/ARIADNE.json`.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR528A human-eye important-routes preflight and produced the bounded partner-readiness implementation packet.
Verdict:
- READY_PR528_IMPORTANT_ROUTES_PARTNER_PASS_FOR_IMPLEMENTATION (or exact blocker)
Task:
- Route the accepted PR528B fix-now slices, preserve PR529 deferrals, and keep the partner pass moving.
```

