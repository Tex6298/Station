# PR318 - Public Persona Report Moderation Pointer Result

Owner: DAEDALUS

Date: 2026-06-25

Status: Accepted by ARGUS

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

## ARGUS Review

Date reviewed: 2026-06-25

Verdict:

```text
PASS WITH HOSTED REHEARSAL RECOMMENDED
```

ARGUS accepts PR318. The implementation matches the lane:

- admin owner public-persona readback now points to
  `/forums/moderation?targetType=persona`, the human moderation console;
- non-admin owner readback still keeps the admin pointer null;
- `/forums/moderation` derives `targetType=persona` from the URL and loads the
  authenticated admin `/reports` queue with the same filter;
- persona report rows render safe persona target labels/status and hide persona
  report notes in the human admin row;
- persona report target actions remain unavailable;
- report creation, duplicate handling, status update authorization, owner
  aggregate/status counters, public chat, provider/model routing, billing,
  infrastructure, and launch scope remain unchanged.

Privacy and scope verdict:

- No anonymous chat, external launch, commercial packaging, partner claim,
  provider/model change, Redis, Cloudflare, worker, queue, durable transcript,
  visitor identity analytics, broad moderation redesign, or broad UI work was
  added.
- The human helper tests prove persona report labels, state, and notes do not
  render raw persona ids or raw report note bodies.
- The admin API still carries server-owned ids for authenticated admin actions;
  PR318's accepted boundary is human-visible readback safety, not removing
  internal admin API identifiers.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed with 12 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with 6 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 112 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.

Recommendation:

MIMIR should close PR318 as accepted and open an ARIADNE hosted/browser
rehearsal for the visible admin moderation path after deployment. The rehearsal
should require hosted freshness at PR318 commit `935664be` or later, verify the
admin route `/forums/moderation?targetType=persona`, verify non-admin owner
readback keeps the admin pointer hidden, and check desktop/mobile fit and
human-visible raw-id/report-body leakage.
