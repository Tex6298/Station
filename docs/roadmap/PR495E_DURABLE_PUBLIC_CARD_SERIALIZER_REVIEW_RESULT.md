# PR495E - Durable Public Card Serializer Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts the PR495E implementation with one narrow hardening patch.

The implementation matches the accepted serializer-only contract:

- durable public-card serializer helper is server-side only;
- eligible durable rows require `source_type === "document"`,
  `status === "published"`, `visibility === "public"`, owner/source match,
  public published source document, and routeable public Space;
- durable card ids are deterministic `seminar_<16 hex>` digests of the durable
  record id, not raw record ids;
- durable cards remain source-derived internally as
  `document:<source document id>`;
- merge/dedupe helper lets durable document cards win over source-derived
  document cards for the same source while preserving thread and Space cards;
- public `/events/seminars`, public interest mark/withdraw, owner
  publish/rollback, migrations/RLS, `/studio/publishing`, and public route copy
  remain unchanged and unwired from durable records.

No hosted ARIADNE proof is required for PR495E because this lane adds no public
route sourcing, owner publish control, or hosted UI behavior. Hosted proof is
required for the later lane that enables public durable readback or owner
publish.

## ARGUS Patch

ARGUS applied a narrow malformed-input hardening patch:

- `resolveDurablePublicSeminarRecordCard` now rejects rows without a non-empty
  string durable record id before hashing;
- `mergePublicSeminarCardsWithDurableCards` now filters durable inputs to
  document cards only, so malformed durable thread or Space inputs cannot
  replace current source-derived thread/Space cards;
- the merge test now passes malformed durable thread/Space inputs and proves
  the original source-derived thread/Space slots remain unchanged.

This patch does not wire durable records into public routes. It only tightens
the accepted contract helper.

## Review Notes

Accepted:

- Serializer redacts/bounds durable title, summary, and Space title text for
  token, cookie, authorization, source/user/discussion id, IP, UUID, stack
  trace, and secret-shaped values.
- Serializer does not use source document body or source document title for the
  durable card title/description.
- Discussion href appears only when the thread is public, routeable, and linked
  to the same document.
- Ineligible rows and sources return no card: draft, ready, cancelled, private,
  non-document, source-private, source-unlisted/community, source
  draft/archived, no-Space, private-Space, unsafe-slug, UUID-slug, and
  owner/source mismatch.
- Existing public `GET /events/seminars` still ignores durable records, even
  `published` + `public` durable rows.
- Signed-in interest mark/withdraw still resolves only current source-derived
  public cards and stores `document:<source id>`, not durable record ids.
- `PublicSeminarsResponse.source` remains `discover_feed_featured`.
- No schema/RLS migration, owner publish/rollback route, public UI, Studio UI,
  runtime, provider, queue/worker, Redis, Cloudflare, billing, scheduling,
  hosting, RSVP, tickets, payments, reminders, media, transcripts, or launch
  claims entered scope.

Residual risk:

- The helper is intentionally dormant. The later public readback lane must still
  review route wiring, owner publish/rollback semantics, card resolution by id,
  interest readback on mixed cards, hosted public route proof, and rollback
  behavior.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Serializer eligibility, redaction, discussion href safety, digest card ids, source-derived interest keys, merge/dedupe behavior, and route no-drift reviewed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/live-events.test.ts apps/web/lib/live-events-route.test.ts apps/web/lib/auth-routes.test.ts` | Pass | 31 focused API/public-route/auth tests passed after the ARGUS hardening patch. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/seminar-host-readiness.test.ts apps/web/lib/publishing-ui.test.ts` | Pass | 20 focused publishing/seminar readiness tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck ran after the patch; web typecheck replayed from cache. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR495E as ACCEPT_PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_IMPLEMENTATION.
- ARGUS applied a narrow helper hardening patch: reject durable rows without a non-empty record id before hashing, and ignore malformed durable thread/Space inputs during merge so source-derived thread/Space cards remain unchanged.
- The implementation remains serializer-contract-only: public /events/seminars and interest routes are unwired from durable records, owner publish/rollback is absent, and migrations/RLS/UI/runtime scope did not change.
- Focused API/public-route/auth tests passed with 31 tests; publishing/seminar tests passed with 20 tests; typecheck, lint, and git diff --check passed.
Task:
- Close PR495E or choose the next lane for owner publish/rollback or public durable readback.
- No ARIADNE hosted proof is required for this dormant serializer-only lane; require hosted proof when a later lane wires public durable cards or owner publish controls.
```
