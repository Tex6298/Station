# PR479A - Owner Version Compare Readback Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR479A as accepted.

ARGUS accepted the implementation after applying one narrow owner-access review
patch: the Studio Version History / compare panel now renders only after the
existing owner-only `/documents/:id/versions` fetch succeeds.

## Accepted Product Shape

- Owner-only version compare/readback appears on the existing Studio publish
  Version History surface.
- Compare output is metadata-only.
- Compared fields include title, slug, document type, status, visibility,
  discussion setting, Space/persona presence, publication state, provenance
  label, and snapshot time.
- Secret-shaped source labels and UUID-like values are redacted before display.
- No prior-version body, private source row, raw document ID, raw discussion or
  thread ID, owner ID, source ID, approval internal, or public prior-version
  history is exposed.
- No restore, revert, publish, retract, delete, approval, API, schema, auth,
  public read, provider, queue, billing, Cloudflare, Redis, worker, or
  deployment behavior changed.

## Evidence

- `docs/roadmap/PR479_NATIVE_AUTHORING_VERSIONING_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR479A_OWNER_VERSION_COMPARE_READBACK_RESULT.md`
- `docs/roadmap/PR479A_OWNER_VERSION_COMPARE_READBACK_REVIEW_RESULT.md`

## Validation Accepted

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/publishing-ui.test.ts`: pass 15
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`: pass 171
- `npm exec --yes pnpm@10.32.1 -- run test:community`: pass 41
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`: pass 4
- `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals`: pass 20
- `npm exec --yes pnpm@10.32.1 -- run typecheck`: pass
- `git diff --check`: pass
- `git diff --cached --check`: pass
- API/schema diff check: pass
- diff-only sensitive/scope scan: pass

## Rehearsal Decision

No ARIADNE hosted proof is required for safety in this lane. ARGUS accepted the
owner-access gate and no mutation or public exposure behavior changed.

MIMIR closes without an optional human-eye rerun so the next distinct product
lane can start.

## Next Lane

Per the feature-expansion rule, MIMIR opens a different named customer-facing
roadmap lane:

`docs/roadmap/PR480_DEVELOPER_SPACE_PARTNER_READY_PREFLIGHT_ARGUS.md`
