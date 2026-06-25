# PR319 - Public Persona Report Moderation Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-25

Current verdict: BLOCKED: missing admin access

Previous verdict: BLOCKED: stale deployment

## Summary

ARIADNE first stopped at the required hosted freshness gate. The hosted API
reported PR318, but the hosted web service still reported an older main commit
that did not include PR318's web moderation route changes.

After MIMIR refreshed the hosted web service, ARIADNE reran PR319. Hosted web
and API freshness then passed, but the available replay accounts did not include
an admin-capable session. The owner, non-owner, tester, and visitor aliases all
signed in successfully and all read back as non-admin.

No hosted admin moderation route rehearsal was claimed, and no moderation
status, report target, public persona interaction, billing, provider, launch,
infrastructure, account role, or account state was mutated.

## Rerun After Web Refresh

Required PR318 commit: `935664be`.

| Surface | Health | Ready | Commit prefix | Freshness |
| --- | --- | --- | --- | --- |
| Web | Pass | Pass | `b2591639be42` | Pass: local ancestry shows this includes `935664be`. |
| API | Pass | Pass | `b2591639be42` | Pass: local ancestry shows this includes `935664be`. |

Available replay aliases:

| Alias | Sign-in | Admin-capable |
| --- | --- | --- |
| Owner | Pass | No |
| Non-owner | Pass | No |
| Tester | Pass | No |
| Visitor | Pass | No |

Because PR319 requires the available admin-capable replay account/session to
load `/forums/moderation?targetType=persona`, the rerun stopped at admin access.

## Current Required Rehearsal Status

| Check | Result | Notes |
| --- | --- | --- |
| Hosted freshness | Pass | Hosted web/API both report `b2591639be42`, which includes PR318. |
| Admin moderation route | Blocked | No admin-capable replay account/session is available in the local replay env. |
| Persona report row safety | Not rehearsed | Needs an admin-capable browser session to inspect the human row. |
| Non-admin boundary | Not rehearsed | Ordinary accounts are available, but the admin route must be proven with an admin session first. |
| Owner readback | Not rehearsed | The admin route/readback pointer proof requires the missing admin-capable session. |
| Desktop/mobile fit | Not rehearsed | Needs the admin moderation route to load first. |

## Previous Hosted Freshness Block

Required PR318 commit: `935664be`.

| Surface | Health | Ready | Commit prefix | Freshness |
| --- | --- | --- | --- | --- |
| Web | Pass | Pass | `d59be4ee8efa` | Blocked: local ancestry shows this does not include `935664be`. |
| API | Pass | Pass | `935664beb54f` | Pass: reports PR318 exactly. |

Local ancestry check:

- `git merge-base --is-ancestor 935664be HEAD` passed.
- `git merge-base --is-ancestor 935664be d59be4ee8efa` failed.

Because PR319 explicitly required hosted web/API freshness at PR318 or later,
the first hosted browser route rehearsal stopped there. MIMIR refreshed the web
service afterward, and the rerun passed freshness as recorded above.

## Previous Required Rehearsal Status

| Check | Result | Notes |
| --- | --- | --- |
| Hosted freshness | Blocked | Hosted web is stale for PR318; hosted API is fresh. |
| Admin moderation route | Not rehearsed | Stopped before route proof because the web bundle is not PR318-or-later. |
| Persona report row safety | Not rehearsed | Needs fresh hosted web route before browser evidence is meaningful. |
| Non-admin boundary | Not rehearsed | Needs fresh hosted web route before browser evidence is meaningful. |
| Owner readback | Not rehearsed | Needs fresh hosted web route before browser evidence is meaningful. |
| Desktop/mobile fit | Not rehearsed | Needs fresh hosted web route before browser evidence is meaningful. |

## Privacy And Scope

Privacy verdict: not assessed on the hosted moderation UI because the rerun
lacks an admin-capable browser session.

No browser interaction with live moderation rows was performed. No report status
controls, target actions, public persona chat/report actions, owner readback
mutations, checkout/portal actions, provider calls, account role changes, or
infrastructure changes were run.

## Validation

- Hosted Playwright rehearsal stopped with `BLOCKED: missing admin access`.
- Local replay alias admin-capability check found no admin-capable account.
- `git diff --check`

## Next Target

Provide or restore an admin-capable replay account/session, then rerun PR319
unchanged against the currently fresh hosted web/API deployment.

Wakeup target: MIMIR, because this is an access/configuration blocker rather
than an ARIADNE UI finding or DAEDALUS product-code defect.
