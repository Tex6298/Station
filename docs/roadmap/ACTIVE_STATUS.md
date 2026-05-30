# Station active status

This file is the short operational status companion to
`docs/roadmap/STATION_PR_PLAN_V2.md`. Update it when the active roadmap changes,
when a PR lands, or when validation truth changes.

## Active roadmap

- Source of truth: `docs/roadmap/STATION_PR_PLAN_V2.md`.
- Current lane: PR-00, roadmap reset and source-of-truth docs.
- Next lane: PR-01, repo health and validation baseline.
- Foundation block after PR-01: PR-02 Supabase schema baseline, PR-03
  Supabase auth/session wiring, and PR-05 persistent DB repos.

## Current repo truth

- The repo is a pnpm/Turbo monorepo with `apps/web`, `apps/api`, shared packages,
  docs, and Supabase infra.
- The working tree was clean on `main` when this reset was started.
- README still described Station Studio Alpha and loose next steps before PR-00.
- Existing docs describe protected alpha loops, but v2 treats auth, persistence,
  and validation as the required foundation before more product expansion.
- Developer Spaces exists as a Station-native observatory slice, with hardening,
  live updates, Discover integration, linked documents, exports/quotas, SDK, and
  visual editors moved into PR-10 through PR-16.

## Near-term rule

Do the boring foundation work before the attractive surface work:

1. Reset docs and planning truth.
2. Prove repo health and local validation.
3. Baseline Supabase schema and auth/session behavior.
4. Replace in-memory/local assumptions with persistent repositories.
5. Then continue through community, continuity, publishing, Developer Spaces, and
   paid entitlements.

## Current validation commands

Use the narrow command set required by each PR. PR-01 should establish the full
local gate:

```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test:spaces
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:exports
pnpm test:developer-spaces
```

## Out of scope for the current roadmap

- IntelHub CTI, finance, exposure, recon, dark-provider, browser-worker, PM, and
  model-gateway layers.
- Stripe/paid entitlements before auth, persistence, validation, continuity, and
  Developer Spaces hardening are sane.
- Developer Spaces visual polish before ingestion auth, validation, limits, and
  safe serialization.

