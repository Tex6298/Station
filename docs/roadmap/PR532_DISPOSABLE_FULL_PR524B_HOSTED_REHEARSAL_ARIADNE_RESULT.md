# PR532 Disposable Full PR524B Hosted Rehearsal - ARIADNE Result

**Date:** 2026-07-18
**State:** `PASS_PR532_FULL_HOSTED_REHEARSAL`
**Hosted source:** `06185fab3f068e9f587689f34968738dbcd68ad7`
**Result owner:** ARIADNE (A4)

## Verdict

Approved for ARGUS read-only review.

Migration 089 resolved the moderation target constraint blocker recorded by the earlier PR532 attempt. A fresh disposable run then completed the real hosted generated-material lifecycle through public read, signed-in report, moderator remove, moderator restore, participant retract, participant delete, and exact cleanup.

The final run passed API, desktop, 390px, light-theme, dark-theme, privacy, visibility, no-drift, auth-session, and cleanup checks. No successor lane is opened or recommended by this result.

## Product proof

The final hosted run proved:

- one retained private requester and one fresh counterparty;
- temporary public target resolution followed by immediate counterparty privacy restoration;
- exact generated scopes for private artifact save and exact generated revision publication;
- one private artifact and one exact generated revision;
- bilateral exact-digest approval;
- one detail-only public generated-material publication;
- a real signed-in non-admin report with visible `Report submitted.` readback;
- moderator remove and restore;
- participant retract and participant delete;
- no provider, model, or chat-generation call.

The counterparty was private before ARIADNE began public inspection.

## API lifecycle

| State | Public detail | Signed-out report | Signed-in report |
| --- | ---: | ---: | ---: |
| Open | 200 | Not exercised as a hidden boundary | 201 report submitted |
| Removed | 404 | 401 | 404 |
| Restored | 200 | Not exercised as a hidden boundary | Not repeated |
| Retracted | 404 | 401 | 404 |
| Deleted | 404 | 401 | 404 |

The public payload exposed the approved body, bounded provenance, participant display names, status, publication date, report path, and a 12-character digest label. It did not expose raw IDs, full digests, private source text, consent/report identity, provider payloads, SQL, stack traces, bearer values, or secret-shaped material.

Invalid and missing detail slugs failed closed.

## Human-eye review

ARIADNE captured and inspected 13 screenshots across 12 lifecycle visual cases plus the signed-in submitted-report state:

- open: desktop and 390px in light and dark themes;
- removed: desktop light and 390px dark;
- restored: desktop light and 390px dark;
- retracted: desktop dark and 390px light;
- deleted: desktop light and 390px dark;
- signed-in report submitted: desktop dark.

The visible detail clearly presented:

- the `Cross-owner generated material` location cue;
- title, participant display names, and published status;
- approved excerpt and body;
- provenance and exact-revision readback;
- publication date;
- a clear report action and submitted confirmation.

The hidden states all used the same privacy-preserving not-found treatment with a clear `Browse cross-owner exhibits` recovery action. They did not reveal whether moderation, retraction, or deletion caused the content to disappear.

Automated layout inspection and human review found no horizontal overflow, viewport escape, incoherent control overlap, clipped overflow-hidden text, blank state, or sub-3:1 rendered text contrast in the inspected route. Long synthetic proof titles and participant names wrapped without breaking the desktop or mobile layout.

## No-drift proof

Thirteen public API/web checks and eleven requester-owner checks confirmed that the generated body and detail route did not drift into unrelated surfaces.

Public coverage included:

- Discover feed, sidebar, and search;
- same-owner and cross-owner encounter lists;
- forum categories;
- public persona roulette, detail, events, context preview, and cross-owner exhibits;
- homepage, Discover, Writing, Forums, same-owner encounters, cross-owner encounters, and derived public persona/Space routes when available.

Owner coverage included:

- Discover search;
- private archive search;
- private encounter sessions;
- exact consent runtime-attempt readback;
- persona, memory, canon, continuity, conversation, document, and Integrity Session buckets.

Expected query echo fields were checked separately from result content. No generic surface contained the generated body, private body, or dedicated publication route.

## Auth proof

- Browser sign-in succeeded through the real login form.
- The account menu exposed and completed sign-out using its `menuitem` contract.
- Station local session storage and the auth cookie cleared.
- The prior access token returned 401 after sign-out.
- The signed-out navigation returned.
- Dedicated API sessions used for hidden-state report checks were closed and their old tokens returned 401.

## Cleanup proof

The participant delete command completed with `READY_PR532_FOR_ARGUS_READ_ONLY_REVIEW`. A separate verify after the final deleted-state browser/API checks returned the same verdict with:

- requester fixture consumed;
- PR532 tagged residue: zero;
- all five generated tables restored to zero;
- consent, audit, and moderation baseline exact;
- configured account state exact;
- auth sessions and refresh state exact;
- retained PR528 evidence exact;
- five migration ledger rows exact;
- seven route hashes bound;
- Railway API and web ready, idle, on `main`, and at `06185fab3f06`.

Earlier guarded attempts stopped on operator or rehearsal-harness assertions. Every stopped attempt ran cleanup first and independently proved the exact protected baseline before another fixture opened. No evidence from those attempts was mixed into the final accepted run.

Private credentials, raw IDs, full digests, report notes, fixture payloads, detailed runtime evidence, and screenshot bindings remain only in ignored CurrentUser DPAPI-encrypted local evidence.

## Validation

- `node --check .station-private/pr532/operator.mjs` - pass
- `node --check .station-private/pr532/ariadne-rehearsal.mjs` - pass
- isolated hosted browser/API/auth probe - pass
- complete hosted lifecycle rehearsal - pass
- independent final operator verify - pass
- `git diff --check` - pass
- `pnpm typecheck` - not required; the tracked change is documentation only
