# PR528C3 - Private Partner Corpus Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Blocked for relevance-weight precision repair; retained corpus remains isolated

```text
BLOCK_PR528B4_PRIVATE_PARTNER_CORPUS_RELEVANCE_WEIGHT_FRACTIONAL_PRECISION_NOT_PERSISTED
```

## Findings

### Blocking: fractional relevance weight is accepted but not persisted

The retained corpus is privacy-safe and otherwise matches the packet, but it
cannot be accepted for the partner pass while owner-visible relevance weights
silently change during persistence.

The public product contract is fractional:

- `apps/web/app/studio/personas/[personaId]/memory/page.tsx` starts at `1.25`,
  displays two decimal places, and exposes a `0.05` slider step from `0.1`
  through `5`.
- `apps/api/src/routes/memory.ts` accepts any finite number from `0.1` through
  `5` on create and update.
- Archive and conversation paths intentionally request values including `1.5`,
  `1.4`, and `1.25`.

The persistence contract is integer:

- `memory_items.relevance_weight` is `integer` in the schema.
- `memoryRelevanceWeight()` in `apps/api/src/services/archive.service.ts`
  applies `Math.round()` before create/import writes.
- The current `match_memory_items` and `match_private_archive_chunks` RPC
  signatures return `integer` relevance weights.
- The Memory update route sends an accepted fractional value directly to the
  integer column, so update does not provide a truthful alternative path.

Independent hosted readback proves the visible consequence:

| Retained row class | Intended/requested | Stored |
| --- | ---: | ---: |
| Curated Memory, two rows | `1.25` | `1` |
| Processed Archive chunk, one row | `1.5` | `2` |

This is not formatting-only. Relevance weight participates in retrieval order,
lexical scoring, runtime priority, owner readback, lifecycle review labels, and
exports. The current behavior changes owner intent without validation or an
honest integer-only UI/API contract.

## Smallest Required Repair

Route this source and migration repair to DAEDALUS:

1. Add a new forward migration; do not edit historical migrations. Change
   `public.memory_items.relevance_weight` from `integer` to `numeric` using an
   explicit cast, preserving every existing value and the non-null default.
   Keep the database range broad enough for existing internal weights rather
   than applying the owner route's `5` maximum globally.
2. In the same migration, drop and recreate the current
   `match_memory_items(uuid, vector, int, text, text, text)` and
   `match_private_archive_chunks(uuid, uuid, vector, int, text, text, text)`
   functions with `numeric` relevance-weight return columns, preserving their
   current filters, ordering, security, and grants.
3. Remove integer rounding from `memoryRelevanceWeight()`. Preserve a finite
   non-negative fractional input; keep the existing default for absent or
   invalid internal input.
4. Prove create, update, curated Memory, file Archive (`1.5`), archived chat
   (`1.4`), candidate acceptance, retrieval RPC, owner readback, lifecycle UI,
   and export paths retain fractional values. Include a migration/catalog
   assertion so an integer hosted column cannot report ready.
5. Regenerate shared database types even if their TypeScript representation
   remains `number`, and run the focused Memory, Archive, retrieval, import,
   conversation, DB, API, and web gates.

Do not solve this by changing the Studio slider to integers, rounding the
receipt, claiming `1` is equivalent to `1.25`, or editing the approved corpus
packet after the fact.

## Exact Retained-Row Correction

Do not alter the retained rows before the numeric migration and accepted source
are deployed. After deployment, use only identifiers decrypted in-process from
the cleanup ledger and perform one owner/persona-scoped correction:

1. Update exactly the two recorded curated Memory IDs from current `1` to
   `1.25`.
2. Update exactly the one recorded Archive Memory ID from current `2` to
   `1.5`.
3. Require an affected-row count of exactly `3`; fail closed on any missing,
   additional, cross-owner, or unexpected-current-value row.
4. Read back all three values and prove content, summaries, source links,
   embeddings, embedding metadata, lifecycle rows, storage accounting, and
   timestamps were not otherwise rewritten.
5. Re-run the anonymous, fresh cross-owner, Discover, forbidden-scope, and
   provider-call probes before accepting the retained corpus.

Retain the current corpus while this repair is routed. Do not clean it up,
recreate it, or normalize its weights in advance unless MIMIR explicitly orders
that action.

## Account And Entitlement Proof

ARGUS independently bound the retained rows to one dedicated Auth/profile
owner with the required private purpose, role, and review-window cleanup
metadata.

| Requirement | Hosted readback |
| --- | --- |
| Profile count | `1` |
| Tier | `private` |
| Subscription | `inactive` |
| Stripe links | `0` |
| Admin | `false` |
| AI mode | `platform` |
| Token usage | One trigger row, `0` used and `0` top-up tokens |
| Initial storage baseline | `0` bytes in the encrypted ledger |

The Auth ID and profile ID agree. The entitlement is a nonbilling review
entitlement and is not evidence of a paid customer, active subscriber, partner
endorsement, or community membership.

## Exact Corpus Proof

ARGUS derived expected values from the committed private implementation packet
inside the review process and compared them with owner API, service-role row,
and private storage readback. No private value was emitted.

| Surface | Independent result |
| --- | --- |
| Private Aster persona | Exact name, summary, presence/style, awakening prompt, private visibility, platform mode, and disabled public chat fields |
| Persona layer | Exactly one owner/persona row with the expected default soul, body, faculty, skill, and evolution layers |
| Persona lifecycle | Exactly one recorded `created` / `Persona created` event |
| Curated Memory | Exactly two manual rows with exact packet copy and active/user-stated lifecycle |
| Archive Memory | Exactly one imported file-backed chunk with exact source body and quarantined/imported lifecycle |
| Embeddings | All three rows use Gemini `gemini-embedding-2`, dimension `1536`, active pgvector index metadata, and backfill version `2` |
| Private file | Exactly one processed `text/plain` upload, `341` bytes, with no trailing newline |
| Import | Exactly one completed file import with no error |
| Inbox | Exactly one pending file-sourced candidate, no chat transcript, and no source message IDs |
| Continuity | Exactly one version-`1` private record with exact packet metadata |
| Storage | Exactly one private object and truthful aggregate usage of `1,145` bytes |

Owner routes read back the persona, three Memory rows, file, import, pending
candidate, Continuity record, and Archive source. The encrypted ledger's
recorded IDs exactly cover the retained implementation-packet identifiers.

## Privacy And Write-Boundary Proof

ARGUS created fresh owner and unrelated-owner sessions for read-only probes and
revoked only those current sessions with local scope afterward.

| Probe | Result |
| --- | --- |
| Seven anonymous private route shapes | All `401`; zero corpus disclosure |
| Seven fresh cross-owner route shapes | Expected owner-bound statuses; zero corpus disclosure |
| Fresh cross-owner persona list | Zero corpus disclosure |
| Five anonymous Discover searches | Zero private matches |
| Five fresh cross-owner Discover searches | Zero private matches |
| `discover_feed` row for private persona | `0` |
| Deployed forbidden owner scopes | `46` checked, all `0` before and after |
| Packet-listed unavailable connector scopes | `2`, independently still absent from hosted REST |

The zero scopes cover public content, engagement, moderation, notifications,
conversations, archived transcripts, canon, calibration/integrity output,
additional Memory graph state, token transactions, top-ups, traces, social
surfaces, Developer Spaces, exports, projects, publishing approvals, BYOK, and
connector credentials.

No chat route or generation call occurred. There are zero conversations,
messages reachable through an owner conversation, AI trace sessions/events,
token transactions, or used tokens. Gemini appears only in the three expected
embedding records. Missing non-NVIDIA chat configuration is therefore not a
corpus-review blocker.

## Ledger And Secret Boundary

- The cleanup ledger and credential envelope are separate DPAPI-encrypted
  files under an ignored operator directory.
- The credential envelope contains only the owner sign-in fields. It contains
  no fixture, cleanup, entitlement, corpus, or ledger metadata.
- The cleanup ledger contains no credential value. It records the owner and
  every implementation-packet identifier, exact zero baselines, entitlement
  history, unavailable hosted scopes, and the explicit MIMIR review-window
  cleanup trigger.
- The operator script, encrypted files, and public-safe receipt are all covered
  by the local `.station-private/` ignore rule.

ARGUS did not print, commit, copy into a command line, or include in this result
any secret, owner ID, row ID, signed URL, storage path, private body, or private
timestamp.

## Validation

| Command / proof | Result |
| --- | --- |
| Independent ignored ARGUS DPAPI/hosted review harness syntax | Pass |
| Independent account, exact corpus, storage, lifecycle, ledger, privacy, forbidden-scope, and provider audit | Pass, with the fractional-weight blocker above |
| Current continuity, conversation Archive, Archive trust, and Memory lifecycle tests | Pass, `54/54` |
| Committed DAEDALUS result private-value scan for UUID, email, and private timestamp forms | Pass |
| `git diff --check 2f91532e^ 2f91532e` | Pass |

The passing source tests do not contradict the blocker. They currently encode
integer persistence or omit a create/update round-trip assertion for the
fractional values the UI and API advertise.

No hosted corpus row, provider configuration, deployment, migration, billing
state, queue, public content, or retained cleanup state was mutated by ARGUS.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS independently reviewed the retained PR528 private partner corpus.
Verdict:
- BLOCK_PR528B4_PRIVATE_PARTNER_CORPUS_RELEVANCE_WEIGHT_FRACTIONAL_PRECISION_NOT_PERSISTED
Task:
- Route the smallest relevance-weight storage/source repair and exact three-row retained correction; keep the corpus retained and otherwise unchanged.
```
