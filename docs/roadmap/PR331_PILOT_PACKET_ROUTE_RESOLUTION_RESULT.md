# PR331 - Pilot Packet Route Resolution Result

Owner: ARIADNE

Date: 2026-06-26

Current verdict: PASS

## Summary

ARIADNE completed the hosted route-resolution rehearsal for the default
signed-in pilot packet. The route set currently recorded in PR329 still
resolves on hosted web, so no route row needs revision before tester
instructions are prepared.

This rehearsal did not contact testers, use tester accounts, submit chat,
submit reports, change moderation status, mutate hosted data, change code or
configuration, or widen product scope.

## Hosted Route Set To Use

Base URL:

```text
https://stationweb-production.up.railway.app
```

Tester-facing routes:

- `/personas/station-replay-alpha-persona`
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Monitor-only route:

- `/forums/moderation?targetType=persona`

## Route Findings

Hosted web was reachable.

Desktop viewport, `1365x900`:

| Route | Result |
| --- | --- |
| `/` | Pass |
| `/personas/station-replay-alpha-persona` | Pass |
| `/space/station-replay-alpha` | Pass |
| `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f` | Pass |
| `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf` | Pass |

Mobile viewport, `375x900`:

| Route | Result |
| --- | --- |
| `/` | Pass |
| `/personas/station-replay-alpha-persona` | Pass |
| `/space/station-replay-alpha` | Pass |
| `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f` | Pass |
| `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf` | Pass |

Onward path checks:

- The public Space still exposes the default document route.
- The default public document still exposes the default linked forum route.
- The route path does not create document-level horizontal overflow at `375px`.
- The default document and forum rows do not need replacement.

Admin monitor check:

- The admin-capable replay alias reached
  `/forums/moderation?targetType=persona`.
- The persona moderation filter was visible or preserved in route state.
- No moderation status or target action was clicked.

## Verdict

Verdict: PASS.

PR329 does not need route-row revision. The remaining real-world blocker is
still the three real signed-in tester account identities and the private
feedback channel.

Next owner: MIMIR.

Recommended next action:

- Fill the three tester account rows and private feedback channel, or record a
  pause.
- Do not send tester instructions until those remaining details are filled.
- Keep the pilot scoped to operational invite-only; do not claim
  product-enforced named-user allowlisting without a DAEDALUS lane.

## Validation

- Created and ran a temporary hosted Playwright route-resolution spec:
  `tmp-pr331-pilot-route-resolution.spec.js`.
- Final command:
  `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr331-pilot-route-resolution.spec.js --reporter=line --workers=1`
- Result: `3 passed`.
- The first checker run failed on an overly narrow harness assumption: it
  chose the first Space document card instead of checking whether the default
  document card was visible anywhere, and it did not wait for the async linked
  discussion affordance on the document page. The harness was corrected and
  rerun against the same hosted routes.
- Did not contact testers.
- Did not use tester accounts.
- Did not submit chat or reports.
- Did not click moderation status or target actions.
- Did not mutate hosted data.
- Did not change code, schemas, config, Railway, Supabase, Stripe, provider,
  model, Redis, Cloudflare, queue, worker, deploy, key, or database-admin state.
- `git diff --check`
- `git diff --cached --check`

Docs-only result work did not touch imports or scripts; `pnpm typecheck` was
not required.
