# PR334 - UX-04 Public Space Microsite Result

Owner: DAEDALUS

Date: 2026-06-26

Status: Ready for ARGUS review

## Result

DAEDALUS implemented the smallest safe no-new-config UX-04 slice for the public
Space route.

The public Space page now reads more like an authored microsite by adding:

- public-boundary copy in the first viewport;
- a small reading path derived from already-public documents;
- selected-work labels that connect document type, provenance, and linked
  discussion state;
- route-scoped dark microsite styling for the Space surface;
- an avatar/identity mark implementation that avoids the touched page's
  previous raw `<img>` lint warning.

## Routes And Files Touched

Visible route:

- `/space/[slug]`

Files changed:

- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/app/globals.css`
- `apps/web/lib/public-story-polish.ts`
- `apps/web/lib/public-story-polish.test.ts`

## Privacy And Scope Notes

- The reading path uses the existing `documents` array returned by the public
  Space API.
- The boundary copy explicitly says only published public material appears on
  the Space and that private Studio memory, archive, canon, continuity, and
  owner data stay hidden.
- PR334 did not change Space API visibility, document publication semantics,
  forum discussion semantics, auth/session, schema, migrations, config,
  Railway, Supabase, Stripe, provider/model behavior, Redis, Cloudflare,
  queues, workers, deploy settings, keys, tester instructions, public launch
  scope, or Developer Spaces.
- The route still preserves the public document to linked forum discussion
  path.
- The CSS is scoped to `space-microsite` on the public Space route and does not
  rewrite Discover, Forums, Billing, Developer Spaces, onboarding, or the whole
  design system.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 17 tests passed, including new public Space boundary and reading-path helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:spaces` | Pass | 1 test passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with known warning | The touched Space page no longer emits the raw `<img>` warning. The only remaining warning is the pre-existing raw `<img>` warning in `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |
| `git diff --cached --check` | Pass | Staged whitespace check passed. |

## ARGUS Review Ask

Review:

- public/private boundary copy;
- no owner/private field exposure;
- preservation of public/unlisted/community semantics;
- public document to linked discussion path;
- whether route-scoped dark styling creates layout or mobile risk;
- whether ARIADNE should run hosted desktop/mobile public Space rehearsal after
  ARGUS accepts.

## Next Owner

Wake ARGUS.
