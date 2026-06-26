# PR327 - Named Signed-In Pilot Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-26

Current verdict: PASS

## Summary

ARIADNE completed the hosted rehearsal for the named signed-in pilot shape using
internal/replay aliases only. No real external tester entered the product.

The rehearsal proves the gated pilot path is ready for MIMIR/Marty decision:

- signed-out visitors can read the public persona route but cannot chat or
  report;
- a signed-in replay tester can use the public persona path;
- one capped signed-in public persona chat completed during the rehearsal;
- one capped public persona report completed during the rehearsal;
- owner readback stayed aggregate/status-only;
- admin moderation readback stayed routeable and safe;
- the public Space/document/discussion chain works on desktop and mobile;
- no moderation status, target action, billing, provider, deploy, key, or
  infrastructure mutation was performed.

## Hosted Freshness

Required gates:

- PR318 public persona moderation pointer: `935664be`
- PR323 public document discussion entrypoint: `f89dd2b9`

| Surface | Health | Ready | Commit prefix | Freshness |
| --- | --- | --- | --- | --- |
| Web | Pass | Pass | `f89dd2b921c9` | Includes PR318 and PR323. |
| API | Pass | Pass | `f89dd2b921c9` | Includes PR318 and PR323. |

PR327 was not passed against stale hosted runtime.

## Identities Used

Internal/replay aliases only:

- signed-out visitor: browser with no session
- signed-in replay tester: non-admin
- replay owner: non-admin
- admin-capable replay alias: admin

No real tester account was used or invited.

## Signed-Out Boundary

Result: Pass.

- Public persona read route returned `200`.
- Signed-out public persona chat POST returned `401`.
- Signed-out public persona report POST returned `401`.
- Desktop public persona route showed signed-in chat gating.
- `375px` mobile public persona route showed signed-in chat gating.
- No document-level horizontal overflow was observed.

## Signed-In Public Persona

Result: Pass.

The signed-in replay tester could reach
`/personas/station-replay-alpha-persona` and see the signed-in alpha chat form.

Mutation note:

- The first PR327 run completed one signed-in public persona chat and one public
  persona report before an overbroad owner-page scanner stopped the run.
- The final clean rerun deliberately skipped additional chat/report mutations
  and verified the outcome through owner aggregate readback.

Accepted posture remained intact:

- public chat mode: `signed_in_alpha`
- transcript storage: false
- report confirmation stayed status-only

## Owner Readback

Result: Pass.

Owner readback stayed aggregate/status-only:

- Replay persona match count: `1`
- Public chat enabled: true
- Chat mode: `signed_in_alpha`
- Transcript storage: false
- Reports: `3` active / `3` total
- Last 7 days chat attempts: `4`
- Last 7 days chat successes: `4`
- Last 7 days reports created: `2`
- Visitor identity storage: false
- Raw event storage: false
- Owner can see reporter identity: false
- Owner can see report bodies: false
- Admin moderation href visible to non-admin owner: false

## Admin Moderation

Result: Pass.

- `/forums/moderation?targetType=persona` loaded for the admin alias.
- The target filter loaded as `persona`.
- The browser route called the authenticated persona report queue.
- Persona target actions remained unavailable.
- No moderation status or target action was clicked.

## Public Space Document Discussion Chain

Result: Pass.

Desktop viewport: `1365x900`.

```text
/ -> /space/station-replay-alpha -> /space/station-replay-alpha/documents/[document] -> /forums/documents-and-codexes/[thread]
```

Mobile viewport: `375x900`.

```text
/ -> /space/station-replay-alpha -> /space/station-replay-alpha/documents/[document] -> /forums/documents-and-codexes/[thread]
```

The public Space showed `Open document and linked discussion`, the public
document showed `Open linked discussion`, and the linked action reached the
forum discussion route on both viewports.

## Mutations Performed

Performed:

- one signed-in public persona chat during the first PR327 run;
- one public persona report during the first PR327 run.

Not performed:

- real external tester entry;
- additional chat/report mutation during the final clean rerun;
- moderation status change;
- moderation target action;
- billing, Stripe, provider/model, deploy, key, infrastructure, Redis,
  Cloudflare, queue, worker, or database-admin mutation.

## Privacy And Scope

Privacy verdict: Pass.

The checked public, owner, and admin-visible surfaces did not expose raw ids as
visible user-facing text, credentials, bearer tokens, JWTs, Stripe-like values,
webhook secrets, dev tokens, provider traces, SQL, raw event rows, private
source bodies, public chat transcript text, report bodies, reporter identity,
visitor identity, or durable visitor transcripts.

The checked copy did not claim anonymous public chat, public launch readiness,
commercial/customer readiness, partner readiness, durable transcript storage, or
visitor identity analytics.

## Next Owner

Next owner: MIMIR.

No DAEDALUS repair is needed from PR327.

No ARGUS privacy/scope escalation is needed from PR327.

Real tester entry remains blocked until Marty/MIMIR names the 3-5 trusted
testers, allowed actions, monitoring owners, and pilot start/stop window.

## Validation

- Initial hosted rehearsal completed the capped chat/report mutation path, then
  stopped on an overbroad owner-page scanner.
- Final hosted no-additional-mutation rerun passed:
  `PR327_SKIP_PUBLIC_PERSONA_MUTATIONS=1 npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr327-named-signed-in-pilot-rehearsal.spec.js --reporter=line --workers=1`
- `git diff --check`
- `git diff --cached --check`

Docs-only result work did not touch imports or scripts; `pnpm typecheck` was
not required.
