# Station PR plan v3

Date: 2026-06-06
Status: active successor roadmap. Activated after ARGUS reviewed the draft on
2026-06-06. `docs/roadmap/STATION_PR_PLAN_V2.md` remains the historical record
for PR-00 through PR-17.

## Why this roadmap exists

The bounded v2 roadmap is complete through PR-17. The next useful lane is not
new product surface by default; it is making the post-v2 foundation measurable,
boring, and hard to accidentally break.

## Product boundary

- Keep Station focused on continuity, publishing, archive, community,
  Developer Spaces, and paid entitlement foundations.
- Do not import IntelHub CTI, exposure, recon, finance, dark-provider,
  browser-worker, PM, model-gateway, marketplace, or broad billing-platform
  scope.
- Keep every PR narrow enough for DAEDALUS to build and ARGUS to review with a
  focused validation command.

## Active sequence

## Validation-script rule

Some proposed acceptance commands are new named gates, not current root scripts.
If a v3 slice references a missing script, that slice must add the script and
focused test file before claiming acceptance. At activation time,
`test:storage`, `test:integrity`, and `test:token-credits` are proposed gates
that still need to be created by their owning slices.

### V3-00 - Successor roadmap acceptance

Purpose: turn the reviewed draft into the accepted successor roadmap.

Tasks:

- Complete: ARGUS reviewed the draft against `ACTIVE_STATUS`,
  `CURRENT_MAIN_RECONCILIATION`, and `VALIDATION_BASELINE`.
- Complete: MIMIR activated v3 after accepting ARGUS's storage-led direction.
- Keep `ACTIVE_STATUS` aligned when each v3 lane starts or closes.

Acceptance:

```bash
git diff --check
```

### V3-01 - Storage quota hardening

Status: accepted by ARGUS on 2026-06-06.

Purpose: make storage quota behavior trustworthy enough to support archive,
import, export, and paid limits.

Tasks:

- Add focused coverage for `storage_usage`, tier storage limits, reserve/release
  RPC behavior, rollback, delete release, and limit-exceeded paths.
- Cover `/storage/me` owner response shape and tier limit behavior.
- Confirm archive/import/persona-file flows keep storage accounting balanced.

Acceptance:

```bash
pnpm typecheck
pnpm test:storage
pnpm test:conversation-archive
```

### V3-02 - Integrity and calibration hardening

Purpose: make Integrity useful as a protected alpha workflow, not just schema
and route scaffolding.

Tasks:

- Cover integrity session lifecycle, question bank selection, output review, and
  summary generation fallback.
- Prove persona public-publishing preflight omits private rules and preserves
  provenance.
- Clarify how integrity outputs feed runtime context and continuity summaries.

Acceptance:

```bash
pnpm typecheck
pnpm test:integrity
pnpm test:persona-context
pnpm test:continuity-publication
```

### V3-03 - Token-credit accounting hardening

Purpose: make token accounting measurable before expanding AI workflows.

Tasks:

- Cover token spend accounting, insufficient-credit behavior, admin/unlimited
  tier behavior, monthly reset, and transaction history.
- Reconcile token-credit top-ups with PR-17 subscription entitlement rules.
- Keep provider/model routing bounded to existing adapter scaffolding.

Acceptance:

```bash
pnpm typecheck
pnpm test:token-credits
pnpm test:billing
```

### V3-04 - Archive and export job reliability

Purpose: prepare long-running archive/export work without changing the product
promise.

Tasks:

- Define a bounded job/status model for archive imports and export package
  generation.
- Keep owner-only visibility and package provenance from v2.
- Avoid background infrastructure that is not needed for the local protected
  alpha path.

Acceptance:

```bash
pnpm typecheck
pnpm test:conversation-archive
pnpm test:exports
```

### V3-05 - Visibility-safe search

Purpose: make private, public, community, and Developer Space content findable
without weakening visibility rules.

Tasks:

- Add owner-private search over archive, documents, continuity, and runtime
  memory sources.
- Add public/community search over published documents, Spaces, forums, and
  Developer Spaces using existing visibility rules.
- Prove private artifacts never appear in public/community result sets.

Acceptance:

```bash
pnpm typecheck
pnpm test:community
pnpm test:developer-spaces
pnpm test:continuity
```

## Not in this roadmap

- New IntelHub domain imports.
- Marketplace, Connect, financial-account, or broad Stripe expansion.
- Broad visual redesign.
- Public launch claims.
- Production queue, worker, or model-gateway architecture beyond the minimum
  needed by accepted v3 slices.
