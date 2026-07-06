# PR495E - Durable Public Card Serializer Closeout

Date: 2026-07-06

Owner: MIMIR / A1

Result:

```text
CLOSE_PR495E_ACCEPTED
```

## Closeout

PR495E is accepted and closed.

The lane delivered the dormant durable public-card serializer contract:

- server-side durable public seminar record serializer helper;
- eligible durable cards require `source_type === "document"`,
  `status === "published"`, `visibility === "public"`, owner/source match,
  public published source document, and routeable public Space;
- durable card ids are deterministic `seminar_<16 hex>` digest handles, not raw
  record ids;
- durable document cards keep internal interest identity source-derived as
  `document:<source document id>`;
- merge/dedupe helper lets durable document cards win over source-derived
  document cards for the same source while preserving thread and Space cards;
- malformed durable rows and malformed durable thread/Space merge inputs are
  rejected or ignored safely;
- public `/events/seminars` and public interest routes remain unwired from
  durable records.

## Accepted Chain

- MIMIR opened PR495E after PR495D hosted-proved private owner ready/draft
  transitions.
- ARGUS accepted only the dormant durable public-card serializer and
  merge/dedupe contract.
- DAEDALUS implemented the serializer helper, card-id rule, dedupe helper, and
  focused tests.
- ARGUS accepted the implementation after a narrow malformed-input hardening
  patch.
- MIMIR closes the lane without ARIADNE because no hosted route, UI, or public
  sourcing behavior changed.

Key records:

- `docs/roadmap/PR495E_PUBLIC_SEMINAR_DURABLE_CARD_CONTRACT_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR495E_PUBLIC_SEMINAR_DURABLE_CARD_CONTRACT_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_RESULT.md`
- `docs/roadmap/PR495E_DURABLE_PUBLIC_CARD_SERIALIZER_REVIEW_RESULT.md`

## Product Truth

Accepted:

- durable public-card serialization is now specified and tested;
- durable card ids are stable digest handles and do not expose raw durable
  record ids;
- serializer eligibility excludes draft, ready, cancelled, private,
  non-document, source-private, source-unlisted/community, source-draft,
  source-archived, no-Space, private-Space, unsafe-slug, UUID-slug, and
  owner/source mismatch rows;
- title, summary, Space title, and discussion href output are bounded and
  privacy-reviewed;
- current public `/events/seminars` still ignores durable records, including
  eligible-looking rows;
- current public interest mark/withdraw remains source-derived and unchanged.

Still not claimed:

- owner publish or rollback controls;
- owner transition from `ready` to `published`;
- any public `/events/seminars` durable-record sourcing;
- public card resolution by durable card id;
- mixed durable/source interest readback in the live route;
- hosted public durable card proof;
- seminar detail pages;
- proposal, scheduling, hosting, RSVP, booking, waitlists, attendee lists,
  tickets, payments, reminders, live rooms, media, recordings, transcripts,
  provider runtime, queue/worker behavior, Redis, Cloudflare, billing, or
  launch readiness.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| ARGUS review | Pass | Serializer eligibility/redaction, discussion href safety, digest card ids, source-derived interest keys, merge/dedupe behavior, and route no-drift accepted. |
| API/public-route/auth tests | Pass | 31 focused tests passed after the ARGUS hardening patch. |
| Publishing/seminar tests | Pass | 20 focused tests passed. |
| Typecheck | Pass | API typecheck ran after the ARGUS patch; web typecheck replayed from cache. |
| Lint | Pass | Web lint passed during ARGUS review. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |

## Next Lane

PR495E deliberately stops before any owner publish/rollback action or public
durable readback wiring. The next real product step is to decide the owner
publication boundary now that the public serializer contract exists.

MIMIR opens:

`docs/roadmap/PR495F_OWNER_SEMINAR_PUBLISH_ROLLBACK_PREFLIGHT_ARGUS.md`

This should decide whether the next implementation is an owner publish/rollback
gate, public durable readback wiring, a combined slice, or a concrete blocker.
