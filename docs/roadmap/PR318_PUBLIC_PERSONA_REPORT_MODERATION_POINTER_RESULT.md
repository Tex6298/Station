# PR318 - Public Persona Report Moderation Pointer Result

Owner: DAEDALUS

Date: 2026-06-25

Status: Ready for ARGUS review

## Result

DAEDALUS hardened the public persona report moderation pointer and admin
readback path without changing report creation, duplicate handling, owner
aggregate/status counters, public chat, public launch scope, or moderation
target actions.

The owner/admin persona readback now points admins to the human moderation
console at `/forums/moderation?targetType=persona`, while non-admin owners
still receive no admin queue pointer. The moderation console honors that
`targetType=persona` URL filter and loads the existing authenticated admin data
route with the matching persona filter.

## What Changed

- Changed admin-only persona report readback from the raw data route
  `/reports?targetType=persona` to the human route
  `/forums/moderation?targetType=persona`.
- Added moderation-console helpers for:
  - human moderation console hrefs;
  - URL-derived report filters;
  - safe persona fallback labels;
  - target state labels that can show persona `public`/`private` visibility;
  - hiding raw persona report note bodies in the human admin row.
- Updated `/forums/moderation` to read `targetType=persona` from the URL and
  load the filtered admin report queue.
- Kept `/reports` as the authenticated admin data route.
- Kept persona report target actions unavailable.
- Added focused tests for owner/admin pointer routing, persona report API
  filtering, safe persona target labels, safe state display, hidden persona
  report notes, and unavailable target actions.

## Files Changed

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/web/app/forums/moderation/page.tsx`
- `apps/web/lib/moderation-console.ts`
- `apps/web/lib/moderation-console.test.ts`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/PR318_PUBLIC_PERSONA_REPORT_MODERATION_POINTER_DAEDALUS.md`
- `docs/roadmap/PR318_PUBLIC_PERSONA_REPORT_MODERATION_POINTER_RESULT.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 12 tests passed; admin owner readback points to `/forums/moderation?targetType=persona`, non-admin owner pointer remains null. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 6 tests passed; persona report admin filtering and target context remain safe. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 112 tests passed, including human moderation href/filter and persona safe-render helpers. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with known warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization notices only. |
| `git diff --cached --check` | Pass | Staged whitespace check passed. |

## Residual Risk

This is local code/test validation. ARGUS should review the human route,
filtering behavior, and rendered persona row readback before MIMIR decides
whether ARIADNE should rehearse the hosted admin moderation path.

## Requested ARGUS Review

ARGUS should verify:

- admin users can reach persona reports through `/forums/moderation?targetType=persona`;
- signed-out and ordinary signed-in users still cannot access the moderation
  queue;
- public persona report rows render safe target context without human-visible
  raw persona ids, reporter ids, visitor ids, report ids, private source ids,
  transcripts, provider traces, billing identifiers, credentials, SQL, or raw
  report bodies;
- non-admin owner readback stays aggregate/status-only with no admin pointer;
- report creation, duplicate handling, status updates, and aggregate counters
  are unchanged.
