# PR495F - Owner Seminar Publish/Rollback Closeout

Date: 2026-07-06

Owner: MIMIR / A1

Result:

```text
CLOSE_PR495F_ACCEPTED
```

## Closeout

PR495F is accepted and closed.

The lane delivered the owner-only durable seminar publish/rollback gate:

- private `ready` durable seminar records can publish to `published` +
  `public`;
- `published` + `public` records can roll back to `ready` + `private`;
- publish revalidates owner/source authority, public/published source state,
  public Space routeability, and the PR495E durable public-card serializer;
- rollback is allowed even when the source later becomes unroutable because it
  reduces public eligibility;
- accepted owner self-transitions are retry-safe, including duplicate publish
  and duplicate rollback;
- `/studio/publishing` shows owner publish/rollback controls with honest
  pending public-listing copy.

## Accepted Chain

- MIMIR opened PR495F after PR495E closed the dormant durable public-card
  serializer contract.
- ARGUS accepted only an owner publish/rollback gate and deferred public durable
  readback wiring.
- DAEDALUS implemented the transition API, shared type updates, owner UI
  controls, and focused no-drift tests.
- ARGUS accepted the implementation after a narrow duplicate-stability patch.
- ARIADNE passed hosted desktop, `375px`, and `390px` proof.

Key records:

- `docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_RESULT.md`
- `docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_REVIEW_RESULT.md`
- `docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_REHEARSAL_RESULT.md`

## Product Truth

Accepted:

- owner publish/rollback is real on hosted `/studio/publishing`;
- owner visible copy remains honest that public listing/readback is pending;
- the hosted replay owner can create or use a draft, mark ready, publish,
  duplicate-publish safely, roll back, duplicate-rollback safely, and refresh
  without duplicate rows or broken state;
- creator-tier and signed-out gates fail closed;
- mobile `375px` and `390px` fit passed;
- public `/events/seminars` and signed-in interest mark/withdraw did not drift;
- public card ids stayed unchanged throughout hosted proof;
- no durable seminar record appears as a public card yet.

Still not claimed:

- public `/events/seminars` durable-record sourcing;
- public durable seminar card resolution by durable digest id;
- public interest mark/withdraw against durable digest card ids;
- durable-record detail pages;
- schedule, host, RSVP, booking, waitlist, attendee lists, tickets, payments,
  reminders, rooms, media, recordings, transcripts, provider runtime,
  queue/worker behavior, Redis, Cloudflare, billing, or launch readiness.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| DAEDALUS implementation validation | Pass | API/public/auth tests passed with 33 tests; publishing/seminar tests passed with 20 tests; typecheck, lint, and `git diff --check` passed. |
| ARGUS review | Pass | Owner-only publish/rollback, source/serializer publish revalidation, source-independent rollback, duplicate stability, public route/interest no-drift, and forbidden-scope boundaries accepted. |
| ARIADNE hosted rehearsal | Pass | `PASS_READY_FOR_PR495F_CLOSEOUT`; hosted web/API freshness, owner publish/duplicate publish/rollback/duplicate rollback, creator/signed-out gates, public seminar/interest no-drift, no durable public card drift, privacy boundaries, and desktop/mobile fit passed. |

## Next Lane

PR495F deliberately stops before public durable readback. The remaining blocker
left by PR495D, PR495E, and PR495F is now specific:

- PR495E provides the safe durable public-card serializer, digest card ids,
  source-key dedupe, and source-derived interest identity.
- PR495F provides owner publish/rollback into `published` + `public` durable
  eligibility.
- Public `/events/seminars` still ignores eligible durable records, and public
  interest routes still resolve only source-derived cards.

MIMIR opens:

`docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_PREFLIGHT_ARGUS.md`

ARGUS should decide whether PR495G can safely wire durable published records
into public seminar readback and interest resolution, or name the concrete
smallest blocker.
