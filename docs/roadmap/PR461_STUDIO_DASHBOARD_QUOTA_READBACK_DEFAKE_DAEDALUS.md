# PR461 - Studio Dashboard Quota Readback De-Fake

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR460 found one concrete hosted billing/quota clarity defect:

`docs/roadmap/PR460_BILLING_QUOTA_CLARITY_CLOSEOUT.md`

ARIADNE evidence:

`docs/roadmap/PR460_BILLING_QUOTA_CLARITY_REHEARSAL_RESULT.md`

## Goal

Remove or replace the Studio dashboard's synthetic quota-like Tier allocation
metric so Studio does not present locally invented quota language as if it were
authoritative billing or entitlement state.

## Scope

Primary file:

```text
apps/web/components/studio/studio-dashboard.tsx
```

Observed defect:

```text
The Studio dashboard Usage Stats This Month panel shows a Tier allocation
percentage derived locally from persona count. It reads like quota/entitlement
state but does not come from Billing, Storage, or token-credit server data.
```

Expected behavior:

```text
Quota or entitlement readbacks on Studio should either use authoritative
server-backed data or clearly route the user to Billing, Settings, Storage, or
credits surfaces that already own that truth.
```

## Patch Options

Choose the smallest honest fix that matches the current component shape:

1. Remove the synthetic Tier allocation tile.
2. Replace it with a clear route/readback pointing to authoritative Billing,
   Settings, Storage, or credits surfaces.
3. Reuse an existing server-backed token/storage readback only if the current
   Studio dashboard can do so without broad data-flow changes.

Prefer option 1 or 2 if option 3 would expand the lane.

## Guardrails

- Do not change Billing page behavior.
- Do not change Settings page behavior.
- Do not change Archive/files storage and quota behavior.
- Do not change Stripe checkout, portal, webhook, entitlement, token-credit,
  auth/session, API, database, provider/model, embedding, Railway, Supabase,
  package script, or lockfile behavior.
- Do not invent new quota math.
- Do not broaden this into a Studio dashboard redesign.

## Validation

Run the focused checks that exist locally for this surface. Expected minimum:

```text
npm exec --yes pnpm@10.32.1 -- typecheck
```

Also run any existing focused Studio/UI tests that cover the dashboard. If no
focused test exists, add the smallest useful assertion only if the local harness
already supports this surface without heavy scaffolding.

Manual/browser validation target:

```text
/studio desktop
/studio 390px
```

Confirm the dashboard no longer shows a synthetic Tier allocation quota-like
metric and still links or points clearly to authoritative usage surfaces if a
replacement is shown.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
```

Include:

- files changed;
- whether the synthetic metric was removed or replaced;
- validation run;
- any test gap that remains.
