# PR319 - Public Persona Report Moderation Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-25

Current verdict: PASS

Previous blockers:

- `BLOCKED: stale deployment`
- `BLOCKED: missing admin access`

## Summary

ARIADNE completed PR319 after MIMIR refreshed the hosted web/API deployment and
restored a dedicated admin-capable replay alias.

The final hosted rehearsal used:

- Admin replay alias only for `/forums/moderation?targetType=persona`.
- Replay owner alias only for owner aggregate/status readback.
- Non-owner tester alias only for the ordinary-user boundary.

No moderation status, report target action, account role, public interaction,
billing, provider, launch, infrastructure, or account-state mutation was
performed.

## Hosted Freshness

Required PR318 commit: `935664be`.

| Surface | Health | Ready | Commit prefix | Freshness |
| --- | --- | --- | --- | --- |
| Web | Pass | Pass | `b2591639be42` | Pass: local ancestry shows this includes `935664be`. |
| API | Pass | Pass | `b2591639be42` | Pass: local ancestry shows this includes `935664be`. |

## Admin Moderation Route

Result: Pass.

- Admin sign-in succeeded and `/auth/me` read back admin-capable.
- `/forums/moderation?targetType=persona` loaded the human moderation console.
- The target filter loaded as `persona`.
- The page used the authenticated report queue with `targetType=persona`.
- The human destination remained `/forums/moderation?targetType=persona`, not
  the raw `/reports` API.

## Persona Report Row Safety

Result: Pass.

- Persona report seed was present: `2` persona report rows.
- The API queue returned only persona reports for the persona filter.
- The first visible persona row had safe target context, a safe public persona
  route, a safe label, and report status controls.
- Persona target action count was `0`; the browser row showed the unavailable
  target-action state.
- Human-visible row text did not show raw persona ids, reporter ids, report ids,
  visitor ids, private source ids, transcripts, provider traces, billing
  identifiers, credentials, SQL, raw report notes, or raw report bodies.

## Non-Admin Boundary

Result: Pass.

- The non-owner tester read back as non-admin.
- `/forums/moderation?targetType=persona` showed the admin-required state.
- The non-admin browser route did not call the moderation reports API.
- Desktop and `375px` mobile fit passed with no document-level horizontal
  overflow.

## Owner Readback

Result: Pass.

- Replay owner read back as non-admin.
- Owner persona match count: `1`.
- Owner report aggregate readback: `2` active / `2` total.
- Status counts: `open: 2`, `reviewing: 0`, `resolved: 0`, `dismissed: 0`.
- Owner readback stayed aggregate/status-only:
  - `transcriptStored: false`
  - `visitorIdentityStored: false`
  - `rawEventsStored: false`
  - `ownerCanSeeReporterIdentity: false`
  - `ownerCanSeeReportBodies: false`
  - admin queue href not visible to the non-admin owner
- Browser owner readback showed the aggregate card and no sensitive visible
  text.

## Desktop And Mobile

Result: Pass.

- Admin moderation route passed desktop and `375px` mobile fit.
- Owner readback route passed desktop and `375px` mobile fit.
- No document-level horizontal overflow was detected.
- No dead moderation target controls were exposed for persona reports.

## Privacy And Scope

Privacy verdict: Pass.

The hosted browser rehearsal did not expose raw ids, reporter identity, report
bodies, visitor transcript, raw event rows, provider traces, private source ids,
billing identifiers, token rows, credentials, SQL, or admin report notes in the
human-visible moderation route or owner readback.

No report status control or target action was clicked.

## Validation

- Hosted Playwright rehearsal passed:
  `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr319-public-persona-moderation.spec.js --reporter=line --workers=1`
- `git diff --check`

## Earlier Blockers

First attempt:

- Hosted API reported PR318, but hosted web reported `d59be4ee8efa`.
- Local ancestry showed that web commit did not include `935664be`.
- ARIADNE stopped at `BLOCKED: stale deployment`.

Second attempt:

- Hosted web/API freshness passed at `b2591639be42`.
- Available owner, non-owner, tester, and visitor aliases all signed in but all
  read back as non-admin.
- ARIADNE stopped at `BLOCKED: missing admin access`.

Both blockers are now resolved for the final pass.

## Next Target

MIMIR can close PR319 or route the smallest concrete follow-up.
