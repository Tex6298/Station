# PR322 - Protected-Alpha Demo Refresh After Public Persona Closeout Result

Owner: ARIADNE

Date: 2026-06-26

Current verdict: PASS

## Summary

ARIADNE completed the hosted protected-alpha demo refresh after PR321. The
current Station story is coherent enough for an internal protected-alpha demo:
private Studio continuity work, public Space/Discover presentation, public
persona caveats, admin persona-report moderation, Developer Space public/manage
contrast, Billing/account readback, and mobile story stops all remained
routeable and bounded.

No product code changed. No checkout, portal, billing mutation, import/export
mutation, provider probe, key rotation, report status change, report target
action, public chat send, or public report creation was performed.

## Hosted Freshness

Required product-code baseline: PR318 commit `935664be`.

| Surface | Health | Ready | Commit prefix | Freshness |
| --- | --- | --- | --- | --- |
| Web | Pass | Pass | `b2591639be42` | Pass: local ancestry shows this includes `935664be`. |
| API | Pass | Pass | `b2591639be42` | Pass: local ancestry shows this includes `935664be`. |

Local `main` is ahead of hosted runtime by docs/state-only commits. The hosted
runtime is not stale for the checked product behavior.

## Private Studio Route Coverage

Result: Pass.

Owner sign-in succeeded, the replay owner read back as non-admin, and exactly
one owner replay persona matched the public replay persona route.

Checked private routes:

- Studio dashboard
- Persona workspace
- Memory
- Continuity
- Persona archive/import trust
- Canon
- Integrity
- Global archive
- Export workspace
- Station Assistant
- Billing
- Settings
- Developer Space manage

The private surfaces gave clear owner-only workspace signals and did not show
application errors, public/private boundary confusion, public-launch claims, or
document-level horizontal overflow in the checked desktop viewport.

## Public Route Coverage

Result: Pass.

Checked public routes:

- Public front door
- Discover
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/[document]`
- Forums
- `/personas/station-replay-alpha-persona`
- `/developer-spaces/station-replay-dev-alpha`

The public Space exposed a routeable public document. The checked document UI
did not expose a linked discussion route; this is a non-blocking observation,
not a protected-alpha demo blocker.

Public persona copy stayed bounded to signed-in alpha interaction. The checked
public persona route did not imply anonymous public chat, durable transcript
storage, public launch readiness, commercial readiness, or partner readiness.

## Public Persona Owner Readback

Result: Pass.

Owner readback remained aggregate/status-only:

- Public chat enabled: true
- Chat mode: `signed_in_alpha`
- Transcript storage: false
- Reports: `2` active / `2` total
- Visitor identity storage: false
- Raw event storage: false
- Owner can see reporter identity: false
- Owner can see report bodies: false
- Admin moderation href visible to non-admin owner: false

## Admin Moderation

Result: Pass.

Admin moderation was freshly checked, not carried only as historical PR319
proof.

- Admin alias signed in and read back as admin-capable.
- `/forums/moderation?targetType=persona` loaded the human moderation queue.
- The target filter loaded as `persona`.
- The route called the authenticated report queue with `targetType=persona`.
- Persona report rows were present.
- Persona report target actions remained unavailable in the human UI.
- No report status or target action was clicked.

The non-admin tester boundary also passed: `/forums/moderation?targetType=persona`
showed the admin-required state and did not call the reports API.

## Developer Space

Result: Pass.

The public Developer Space route and owner manage route were both routeable.
The checked contrast preserved Developer Space as a public observatory with an
owner/researcher management surface, not a generic dashboard.

## Billing And Account

Result: Pass.

Billing and Settings were readable as protected-alpha/account readback only. No
checkout, portal, subscription, entitlement, invoice, or payment mutation was
performed.

## Desktop And Mobile

Result: Pass.

Desktop viewport: `1365x900`.

Mobile viewport: `375x900`.

Checked mobile stops:

- Public Space
- Public persona
- Public Developer Space
- Studio dashboard
- Memory
- Billing

No document-level horizontal overflow was observed in the checked desktop or
mobile story stops.

## Privacy And Scope

Privacy verdict: Pass.

The hosted browser refresh did not expose raw ids, credentials, bearer tokens,
JWTs, Stripe-like secrets, webhook secrets, dev tokens, SQL, provider traces,
raw event rows, private source material, report bodies, reporter identity,
visitor identity, or durable visitor transcripts in the checked human-visible
surfaces.

The refresh also found no claims of anonymous public chat, public launch
readiness, commercial readiness, partner readiness, durable visitor transcript
storage, or visitor identity analytics.

## Marty Input

Marty config/input is not needed to close PR322.

Marty input is still required before any external/public/commercial/partner
move, anonymous public chat, durable visitor transcript storage, visitor
analytics, or production launch claim.

## Validation

- Hosted Playwright rehearsal passed:
  `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr322-protected-alpha-demo-refresh.spec.js --reporter=line --workers=1`
- `git diff --check`
- `git diff --cached --check`

Docs-only result work did not touch imports or scripts; `pnpm typecheck` was
not required.

## Next Target

MIMIR can close PR322 or choose the next product axis. If the next move crosses
external, public, commercial, partner, anonymous-chat, durable-transcript, or
visitor-analytics boundaries, MIMIR should ask Marty for the exact product
decision first.
