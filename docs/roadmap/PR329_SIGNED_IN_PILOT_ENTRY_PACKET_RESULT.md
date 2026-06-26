# PR329 - Signed-In Pilot Entry Packet Result

Owner: ARIADNE

Date: 2026-06-26

Current verdict: PASS

## Summary

ARIADNE prepared the signed-in pilot entry packet for MIMIR/Marty to fill before
any real tester entry.

This packet does not start the pilot, contact testers, use tester accounts,
mutate hosted data, change code/config, or widen the product promise. Real
tester entry remains blocked until MIMIR/Marty complete the missing tester,
route, action, monitoring, window, and rollback details below.

## One-Screen Pilot Readiness Checklist

Complete every item before tester instructions are sent:

- [ ] Name 3-5 trusted testers.
- [ ] Record each tester's signed-in account email or agreed account alias.
- [ ] Complete one allowed-action row per tester.
- [ ] Confirm the exact public persona route testers may use.
- [ ] Confirm the exact public Space/document/discussion route set testers may
  use.
- [ ] Assign the owner monitor.
- [ ] Assign the admin monitor.
- [ ] Record the pilot start time.
- [ ] Record the pilot stop time.
- [ ] Name the rollback owner who can stop the pilot early.
- [ ] Confirm the monitoring cadence during the pilot window.
- [ ] Confirm public persona chat can be disabled if rollback is needed.
- [ ] Confirm testers receive only named in-scope routes and instructions.
- [ ] Confirm Station is not claiming product-enforced named-user allowlisting.
- [ ] Send tester instructions only after every checklist item above is filled.

## Required Details Before Entry

| Detail | Value To Fill |
| --- | --- |
| Tester 1 | `[tester name]` / `[signed-in account email or alias]` |
| Tester 2 | `[tester name]` / `[signed-in account email or alias]` |
| Tester 3 | `[tester name]` / `[signed-in account email or alias]` |
| Tester 4, if used | `[tester name]` / `[signed-in account email or alias]` |
| Tester 5, if used | `[tester name]` / `[signed-in account email or alias]` |
| Owner monitor | `[owner monitor name]` |
| Admin monitor | `[admin monitor name]` |
| Monitoring cadence | `[cadence during pilot window]` |
| Pilot start | `[start date/time and timezone]` |
| Pilot stop | `[stop date/time and timezone]` |
| Early stop authority | `[person who can stop early]` |
| Rollback owner | `[rollback owner name]` |
| Tester feedback channel | `[private feedback channel]` |

## Safe Route Set

Tester-facing routes:

- Public persona: `/personas/station-replay-alpha-persona`
- Public Space: `/space/station-replay-alpha`
- Public document: `/space/station-replay-alpha/documents/[document]`
- Linked forum discussion: `/forums/documents-and-codexes/[thread]`

Monitor-only routes:

- Owner persona readback: `/studio/personas/[replay-persona]`
- Admin persona moderation: `/forums/moderation?targetType=persona`

Use placeholders for document, thread, and owner-route identifiers until
MIMIR/Marty supply the exact tester packet links. Do not send monitor-only
routes to testers unless they are explicitly assigned as monitors.

## Allowed-Action Matrix

Fill this table before instructions are sent. Each tester receives only their
assigned row.

| Tester | Account | Public Persona Chat | Public Persona Report | Space/Document/Discussion Navigation | Read-Only Navigation | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `[tester 1]` | `[email or alias]` | none / one chat / read-only | none / one report / read-only | yes / no | yes / no | `[monitor focus]` |
| `[tester 2]` | `[email or alias]` | none / one chat / read-only | none / one report / read-only | yes / no | yes / no | `[monitor focus]` |
| `[tester 3]` | `[email or alias]` | none / one chat / read-only | none / one report / read-only | yes / no | yes / no | `[monitor focus]` |
| `[tester 4]` | `[email or alias]` | none / one chat / read-only | none / one report / read-only | yes / no | yes / no | `[monitor focus]` |
| `[tester 5]` | `[email or alias]` | none / one chat / read-only | none / one report / read-only | yes / no | yes / no | `[monitor focus]` |

## Tester Instruction Copy

Subject:

```text
Station signed-in pilot: private instructions
```

Body:

```text
This is a controlled signed-in Station pilot, not a public launch.

Please use only the named routes in your assigned row. Sign in with the account
provided by Marty/MIMIR before testing. Your allowed actions depend on your row:
you may be assigned public persona chat, public persona report, public
Space/document/discussion navigation, read-only navigation, or a narrow
combination of those actions.

Do not paste private data, credentials, secrets, personal data, or third-party
confidential material into Station during this pilot.

If your row allows public persona chat, submit at most one short,
public-safe question. Public persona chat should use public sources only; it
must not use private Station memory, archive, canon, or continuity data.

If your row allows public persona reporting, submit at most one report, and only
for something that looks confusing, broken, unsafe, or leaky.

If your row allows public Space/document/discussion navigation, stay within the
named Space, document, and linked discussion routes.

Please report anything confusing, broken, unsafe, or leaky back through the
private feedback channel named in your instructions. Do not share these links or
instructions publicly.
```

## Owner Monitoring Checklist

During the pilot window, the owner monitor should check only aggregate and
status-safe readback:

- Public persona chat attempts as aggregate counts.
- Public persona chat successes as aggregate counts.
- Public persona chat failures as aggregate counts.
- Public persona chat mode remains signed-in alpha.
- Transcript storage remains off.
- Visitor identity storage remains off.
- Raw event storage remains off.
- Persona report totals remain status-only.
- Persona active/closed status counts remain status-only.
- Owner readback does not expose reporter identity.
- Owner readback does not expose report bodies.
- Owner readback does not expose visitor identity, transcript text, raw event
  rows, raw ids, private source bodies, credentials, tokens, provider traces,
  SQL, or private Station memory/archive/canon/continuity data.

## Admin Monitoring Checklist

During the pilot window, the admin monitor should check only safe persona
moderation context:

- `/forums/moderation?targetType=persona` loads for the assigned admin.
- The moderation queue is filtered to persona context.
- Persona rows show safe target context.
- Persona target actions remain unavailable unless a separate lane explicitly
  authorizes them.
- Admin readback does not expose private persona/source material, reporter
  identity, report bodies, visitor identity, transcript text, raw event rows,
  raw ids, credentials, tokens, provider traces, or SQL.
- Rate-limit, quota, provider-unavailable, and public-persona-disabled states
  are understandable if encountered.
- Public Space, document, and linked discussion routes remain routeable on
  desktop and mobile.

## Stop And Rollback Checklist

Stop the pilot immediately if any stop condition appears:

- A tester list does not exist or does not match the people using the routes.
- A tester performs an action outside their assigned row.
- Owner/admin monitoring is unavailable or unassigned.
- The stop window or rollback owner is missing.
- Signed-out users can chat or report.
- Owner readback exposes reporter identity, report bodies, visitor identity,
  transcript text, raw event rows, raw ids, private source bodies, credentials,
  tokens, provider traces, SQL, or private Station memory/archive/canon/
  continuity data.
- Admin persona moderation is unavailable or leaks private material.
- Public persona chat stores transcripts or durable visitor identity.
- The hosted runtime is stale for a relevant runtime fix.
- MIMIR wants product-enforced named-user allowlisting without a DAEDALUS
  access-control lane.

Rollback actions:

- Disable public persona chat.
- Stop sharing route links and tester instructions.
- Pause the pilot and tell testers to stop using the routes.
- Preserve a short evidence summary without secrets, raw ids, private data,
  source text, transcripts, report bodies, credentials, or provider payloads.
- Do not change moderation status or target actions unless a separate lane
  explicitly authorizes that mutation.

Wake the right owner:

- Wake MIMIR for tester-detail gaps, route/window/rollback decisions, or a
  product decision about whether to continue.
- Wake ARGUS for privacy, visibility, scope, signed-out access, transcript
  storage, durable visitor identity, raw/private leakage, or moderation safety
  concerns.
- Wake DAEDALUS for concrete implementation defects, broken route behavior,
  unavailable required admin/owner surfaces, or any new requirement for
  product-enforced named-user allowlisting.

## Out Of Scope

This packet does not authorize:

- anonymous public persona chat or reporting;
- public launch;
- commercial, customer, or partner readiness;
- durable visitor transcripts;
- visitor identity analytics;
- billing, provider/model, deploy, key, infrastructure, Railway, Supabase,
  Stripe, Redis, Cloudflare, queue, worker, or database-admin changes;
- product-enforced named-user allowlisting;
- generalized all-users, all-personas, or production-readiness claims.

## Verdict And Next Owner

Verdict: PASS.

The packet is ready for MIMIR to fill with Marty details. No exact missing
product detail blocked packet creation; every missing real-pilot detail is
represented as a placeholder.

Real tester entry remains blocked until MIMIR/Marty fill the tester accounts,
allowed actions, monitors, safe route set, start/stop window, monitoring
cadence, feedback channel, and rollback owner.

## Validation

- Prepared docs-only result packet.
- Did not contact testers.
- Did not use tester accounts.
- Did not run hosted mutation.
- Did not change code, schemas, config, Railway, Supabase, Stripe, provider,
  model, Redis, Cloudflare, queue, worker, deploy, key, or database-admin state.
- Did not widen scope beyond the accepted PR328 pilot boundary.
- `git diff --check`
- `git diff --cached --check`

Docs-only result work did not touch imports or scripts; `pnpm typecheck` was
not required.
