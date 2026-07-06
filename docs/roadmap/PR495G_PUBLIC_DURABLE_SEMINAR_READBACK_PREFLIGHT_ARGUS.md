# PR495G - Public Durable Seminar Readback Preflight

Date opened: 2026-07-06

Owner: ARGUS / A3

State: OPEN_PREFLIGHT

## Why This Lane

PR495F is closed. Station now has:

- PR495E: a safe dormant durable public-card serializer, deterministic digest
  card ids, source-key dedupe, and source-derived interest identity;
- PR495F: owner publish/rollback so a durable seminar record can become
  `published` + `public` and return to `ready` + `private`;
- hosted proof that public `/events/seminars` and interest mark/withdraw still
  ignore durable records.

The next smallest product boundary is public durable seminar readback:

```text
Can eligible published/public durable seminar records appear on /events/seminars
without changing scheduling, hosting, RSVP, tickets, payments, runtime, Redis,
Cloudflare, billing, or launch claims?
```

This is not a live-room, hosting, attendance, scheduling, payment, notification,
or event-delivery lane.

## Current Repo Evidence

Relevant code:

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/app/events/seminars/page.tsx`
- `apps/web/lib/live-events-route.ts`
- `packages/types/src/live-events.ts`

Existing helper truth:

- `loadPublicSeminarCards` currently reads only `discover_feed` featured
  document/thread/Space cards.
- `resolveDurablePublicSeminarRecordCard` can safely serialize one eligible
  `published` + `public` durable document record.
- `mergePublicSeminarCardsWithDurableCards` can let durable document cards win
  over source-derived document cards for the same source interest key.
- `applySeminarInterestReadback` already counts by
  `seminarInterestKey(sourceType, sourceId)`.
- `resolvePublicSeminarTargetByCardId` currently resolves only source-derived
  discover-feed card ids.
- Existing tests intentionally assert durable helpers are not wired into public
  sourcing or interest routes yet.

Accepted proof:

- `docs/roadmap/PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_CLOSEOUT.md`
- `docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_CLOSEOUT.md`

## Preflight Task

ARGUS should hostile-review the current repo and return one of:

```text
ACCEPT_PR495G_PUBLIC_DURABLE_SEMINAR_READBACK
ACCEPT_PR495G_API_ONLY_DURABLE_READBACK
BLOCK_PR495G_NEEDS_INTEREST_RESOLUTION_CONTRACT
BLOCK_PR495G_NEEDS_PUBLIC_COPY_OR_HOSTED_DATA
DEFER_PR495G_WITH_REASON
NEEDS_MIMIR_DECISION
```

If accepted, name the exact PR495G implementation shape and wake DAEDALUS.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables public durable seminar readback.

## Candidate PR495G Shape

ARGUS may accept, patch, or reject this candidate.

### Public Durable Seminar Readback

Wire the public route to merge eligible durable records into the existing public
seminar response:

- load current source-derived `discover_feed` cards as now;
- load bounded eligible `public_seminar_records` rows where
  `status === "published"`, `visibility === "public"`, and
  `source_type === "document"`;
- resolve each durable row through `resolveDurablePublicSeminarRecordCard`;
- merge with source-derived cards through
  `mergePublicSeminarCardsWithDurableCards`;
- apply interest readback after merge so source-derived and durable cards share
  the same `document:<source_id>` aggregate;
- return durable card ids as deterministic `seminar_<16 hex>` digest handles,
  never raw durable ids;
- keep public response bounded and compatible with current web rendering.

### Durable Card Interest Resolution

Decide whether this belongs in PR495G.

Preferred shape if accepted:

- `POST /events/seminars/:seminarId/interest` and `DELETE` may resolve durable
  digest ids only by server-side durable record lookup;
- interest rows still write `source_type: "document"` and
  `source_id: <source document id>`;
- interest rows must not store raw durable record ids;
- rolled-back, draft, ready, private, stale, non-document, source-private,
  source-draft, no-Space, unsafe-Space, owner/source mismatch, or deleted
  durable targets return the existing bounded `seminar_not_found`.

If ARGUS thinks public readback can land before durable-card interest mutation,
choose `ACCEPT_PR495G_API_ONLY_DURABLE_READBACK` and specify how the web should
avoid rendering broken interest controls for durable cards.

## Questions ARGUS Should Answer

1. Can `GET /events/seminars` safely merge durable cards now that PR495E/F are
   closed?
2. Should PR495G include durable digest id resolution for interest
   mark/withdraw, or split that into PR495H?
3. Should the public response `source` remain `discover_feed_featured`, change
   to a mixed-source string, or stay unchanged for compatibility?
4. What durable-record ordering should apply when durable-only cards are
   appended: `updated_at`, `created_at`, source published time, or another
   bounded rule?
5. What limit behavior is safest when source-derived and durable-only cards are
   merged?
6. How should stale durable cards behave if the owner record remains public but
   the source document or Space later becomes private/unrouteable?
7. What exact tests should replace the current "not wired yet" assertions?
8. Is hosted ARIADNE proof required after ARGUS review accepts implementation?

## Guardrails

Do not add or claim:

- public seminar detail pages;
- owner UI changes beyond wording required to avoid contradiction;
- schema/RLS migrations or generated type changes unless ARGUS explicitly names
  a blocker that requires them;
- tickets, payment, Stripe/Billing, coupons, invoices, Connect, or paid event
  access;
- RSVP, booking guarantees, attendee lists, waitlists, reminders, calendar
  integration, email/SMS/push, or notification delivery;
- realtime rooms, livestreaming, WebSockets/SSE live-room behavior, video,
  audio, voice/avatar media, recordings, transcripts, or live chat;
- event-host dashboard, admin curation UI, moderation console work, schedule
  automation, or public attendee identity;
- provider calls, persona runtime context, memory writeback, continuity
  promotion, archive import, Redis, Cloudflare, queues, workers, hosted runtime
  expansion, broad Discover/UI redesign, or Discern CSS import.

Do not expose private Memory, Archive, Canon, Continuity, owner setup, private
documents, provider settings, raw ids, credentials, storage paths, source
bodies, visitor identity, tokens, cookies/headers, IP/user-agent values,
webhook data, SQL output, stack traces, or secret-shaped values.

## Suggested DAEDALUS Scope If Accepted

Likely allowed files:

- `apps/api/src/routes/events.ts`
- `apps/api/src/routes/live-events.test.ts`
- `apps/web/lib/live-events-route.test.ts` only if public response/copy helpers
  need focused no-drift updates;
- `packages/types/src/live-events.ts` only if the public response source label
  or card contract needs a typed change;
- focused roadmap/result docs.

Likely forbidden files:

- Supabase migrations, RLS policies, generated DB types;
- owner `/studio/publishing` behavior except maybe copy if ARGUS requires it;
- broad public page layout or global CSS;
- billing, provider runtime, queue/worker, Redis, Cloudflare, archive/import,
  persona runtime, memory/continuity, social publishing, or broad shell files.

## Suggested Validation If Accepted

DAEDALUS should likely run at least:

```powershell
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

ARGUS should confirm exact validation in the result.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR495F Owner Seminar Publish/Rollback is closed as CLOSE_PR495F_ACCEPTED.
- PR495E provides the safe durable public-card serializer/dedupe contract; PR495F provides owner publish/rollback into published/public eligibility.
- The remaining blocker is public durable seminar readback: /events/seminars and interest routes still ignore eligible durable records.
Task:
- Hostile-preflight PR495G from docs/roadmap/PR495G_PUBLIC_DURABLE_SEMINAR_READBACK_PREFLIGHT_ARGUS.md.
- Decide whether DAEDALUS can safely wire public durable readback, whether durable digest interest resolution belongs in the same slice, or what concrete blocker remains.
- If accepted, wake DAEDALUS with exact API/test/doc scope. If blocked/deferred/decision-dependent, wake MIMIR with the concrete reason and smallest next move.
Guardrails:
- No public seminar detail pages, schema/RLS migrations, owner UI expansion, scheduling, hosting, RSVP/tickets/payments/reminders/live rooms/media/transcripts/provider runtime/queues/Redis/Cloudflare/billing/launch claims, broad UI redesign, private-source exposure, or raw id/secret leakage.
```
