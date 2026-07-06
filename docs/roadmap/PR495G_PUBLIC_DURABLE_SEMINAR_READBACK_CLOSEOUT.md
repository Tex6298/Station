# PR495G - Public Durable Seminar Readback Closeout

Owner: MIMIR / A1

Date: 2026-07-06

Status: Closed

## Decision

MIMIR closes PR495G as accepted.

PR495G completed the full route:

- MIMIR opened the durable public seminar readback preflight.
- ARGUS accepted the bounded durable readback and durable interest contract.
- DAEDALUS implemented the route/API changes.
- ARGUS accepted the implementation.
- ARIADNE passed the hosted desktop and mobile rehearsal.

## Accepted Product Shape

- Public `/events/seminars` now reads from existing public source cards and
  eligible durable seminar records.
- Durable records can replace a matching source-derived card by source key.
- Durable-only public records append as bounded public seminar cards.
- Durable card ids use versioned digest ids, not raw database ids.
- Durable interest mark, duplicate mark, withdraw, and repeated withdraw return
  aggregate and viewer-local state only.
- Rolled-back or stale durable digest actions return bounded
  `seminar_not_found` responses.
- Source-derived seminar interest behavior remains source-derived and
  unchanged.

## Validation Accepted

Accepted evidence:

- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_REVIEW_RESULT.md`
- `docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_REHEARSAL_RESULT.md`

Hosted proof passed:

- web/API health at accepted PR495G runtime;
- signed-out public seminar readback;
- owner create/publish/rollback setup for durable public records;
- durable replacement and durable-only card readback;
- signed-out mutation denial;
- signed-in mark/duplicate/withdraw/repeated-withdraw loop;
- stale digest bounded failure after rollback;
- desktop, 375px, and 390px browser fit;
- privacy and secret-shaped visible-readback scan.

## Boundaries Kept

PR495G did not add a public seminar detail page, scheduling, hosting, RSVP,
tickets, payments, reminders, attendance, live rooms, media, recordings,
transcripts, provider runtime, Redis, Cloudflare, billing, launch readiness, or
Discern CSS/shell changes.

No private owner data, raw durable ids, raw source ids, storage paths, provider
payloads, cookies, tokens, stack traces, SQL/table detail, or secret-shaped
values are exposed by the accepted public readback.

## Stale Wakeup Reconciliation

The later A1 wakeup asking MIMIR to inspect Discern commits
`de7b918e` and `99ae8a5c` is reconciled as stale, not reopened.

Those Discern companion/home improvements have already been translated or
rejected by the accepted PR485/PR494 path:

- companion shortcut strip;
- Memory inbox / continuity candidate inbox;
- return-to-thread continue, summarize, and start-fresh UX;
- private companion capability and presence prompt context;
- local private chat polish;
- owner-only Companion Home Context Rail;
- Runtime Context Preview separation.

Reference closeout:

- `docs/roadmap/PR494B_DISCERN_COMPANION_HOME_COMPLETION_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR494_DISCERN_COMPANION_HOME_TRANSLATION_CLOSEOUT.md`

Remaining Discern material is duplicate, broad shell/CSS skin, stale behavior,
placeholder controls, autonomy/presence overclaiming, or API/prompt/runtime
drift. MIMIR therefore does not open another Discern companion lane.

## Next Lane

MIMIR opens a different customer-facing Phase 3/product-depth preflight:

`docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_ARGUS.md`

Later correction: foreground watch surfaced the earlier A1 Discern usability
correction at `921b4860`. MIMIR parked PR496 before review and opened PR497 as
the active lane:

`docs/roadmap/PR497_DISCERN_UI_USABILITY_PARITY_AUDIT_ARIADNE.md`
