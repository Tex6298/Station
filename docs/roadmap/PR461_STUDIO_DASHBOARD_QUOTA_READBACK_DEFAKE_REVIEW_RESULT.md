# PR461 - Studio Dashboard Quota Readback De-Fake Review Result

Owner: ARGUS / A3

Implementer: DAEDALUS / A2

Date: 2026-06-28

## Verdict

ARGUS accepts PR461 after one narrow review patch.

The Studio dashboard no longer shows a locally invented quota-like `Tier
allocation` metric or the surrounding synthetic usage counters. The replacement
panel routes owners to existing surfaces instead of fabricating Billing,
token-credit, storage, or Archive usage state.

## ARGUS Patch

ARGUS tightened the Archive route-card copy in
`apps/web/components/studio/studio-dashboard.tsx`:

- changed the Archive card value from `Storage` to `Sources`;
- changed the Archive card detail to point to the owner-wide Archive source
  surface instead of implying `/studio/archive` is the Settings storage meter.

This keeps the route targets honest:

- Billing -> `/billing` for plan, entitlement limits, and subscription state.
- Settings -> `/settings` for token-credit and server-reported storage readbacks.
- Archive -> `/studio/archive` for owner-wide archive source state.

## Review Findings

- The synthetic `Tier allocation` percentage is removed from the live Studio
  dashboard component.
- The former `Usage Stats This Month` metric block is gone.
- The new `Authoritative Usage` panel contains route cards only; it does not
  compute quota percentages, byte usage, token balances, or entitlement state.
- The dashboard still uses existing protected Studio routing and does not add a
  new API, mutation, billing action, Stripe action, storage action, provider
  call, import/export mutation, schema change, migration, worker, queue,
  Cloudflare, Railway, Supabase config, or Developer Space behavior.
- Local browser screenshots were not recorded because Playwright is unavailable
  in this checkout, so ARGUS is not claiming visual screenshot proof.

## Validation

Passed after the ARGUS patch on 2026-06-28:

- `npm exec --yes pnpm@10.32.1 -- typecheck`
  - Turbo API/web typecheck passed.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
  - 143 tests passed.
- `git diff --check`
  - passed with CRLF normalization warnings only.
- `git diff --cached --check`
  - passed.

Expected local gap:

- `npm exec --yes pnpm@10.32.1 -- exec node -e "try { console.log(require.resolve('@playwright/test')); } catch (error) { console.error(error.message); process.exit(1); }"`
  confirms `@playwright/test` is not available in this checkout.

## Baton

Wake MIMIR for closeout or hosted/browser confirmation:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR461 after a narrow Archive route-card copy patch.
- Studio no longer shows the synthetic Tier allocation or invented monthly usage counters; replacement cards route to Billing, Settings, and Archive source surfaces without fabricating usage math.
Risk:
- Local browser screenshots were not possible because Playwright is unavailable in this checkout.
Task:
- Decide whether to close PR461 on code review plus tests, or open/route hosted browser confirmation.
```
