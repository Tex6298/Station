# PR403 - Onboarding Migrator and API Bridge Depth Result

Date: 2026-06-27
Agent: DAEDALUS
Status: ready for ARGUS review

## Implementation Path

Code changed. This is not map-only.

The slice keeps `/studio/onboarding` as the existing signed-in route, but gives
Document Migrator and API Bridge state-aware first actions using existing owner
routes and APIs.

## Current Route/State Evidence Used

- `/studio/onboarding` is authenticated by the existing session check and keeps
  signed-out users on the sign-in panel.
- Document Migrator already routes to `/studio/new?path=document-migrator`
  when no persona exists, or `/studio/personas/:personaId/files` when a
  persona exists.
- The persona Archive/files page already reads persona files, import jobs, and
  import-review candidates from existing owner-scoped endpoints.
- API Bridge already routes through `/developer-spaces` and
  `/developer-spaces/:slug/manage`.
- The owner Developer Spaces list already returns route-safe slugs and
  ingestion-key last-four readback without exposing secrets.

## Visible Behavior

Document Migrator now distinguishes:

- no persona: create a private persona before archive import;
- persona exists with no detected archive sources: add the first owner-only
  pasted/uploaded source;
- persona exists with pending import candidates: open the Import Review section
  and accept, edit, or reject candidates;
- persona exists with existing sources and no pending candidates: inspect
  archive source status or add the next source.

API Bridge now distinguishes:

- no Developer Space: create a private Developer Space first;
- Developer Space exists: open the first owner manage surface directly and
  review ingestion-key status, owner evidence, and public-safe observatory
  state.

All controls remain route-only links to existing owner surfaces.

## Files Changed

- `apps/web/lib/onboarding-paths.ts`
- `apps/web/lib/onboarding-paths.test.ts`
- `apps/web/app/studio/onboarding/page.tsx`

## Non-Scope Confirmation

No live connector OAuth/API, recurring imports, API-key secret handling,
provider/model routing, Gemini/OpenAI/NVIDIA changes, Redis, Cloudflare,
queues, workers, schema, migrations, billing, Stripe, auth/session, deployment
behavior, broad UI reskin, or autonomous Assistant execution changed.

The API Bridge copy uses existing last-four key readback only; it does not
create credentials or expose secrets.

## Validation

- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/onboarding-paths.test.ts` passed (7 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed (131 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:assistant` passed (9 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:auth` passed (20 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed (51 tests).
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed after fixing a test fixture type.
- `git diff --check` passed with CRLF normalization warnings only.

## Review Path

ARGUS should review the code for route-only behavior, signed-out privacy,
onboarding copy overclaim, API-key last-four safety, and no live connector/API
claims.

ARIADNE human-eye rehearsal is useful after ARGUS because this changes visible
`/studio/onboarding` behavior on desktop/mobile.
