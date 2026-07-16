# PR528B6 - Serialized Partner Schema Deploy And Correction DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for MIMIR routing to ARGUS

```text
READY_PR528B6_SERIALIZED_PARTNER_SCHEMA_DEPLOY_AND_CORRECTION_FOR_ARGUS
```

## Authority And Source

Executed the bounded hosted operation authorized by:

- `PR528B6_SERIALIZED_PARTNER_SCHEMA_DEPLOY_AND_CORRECTION_DAEDALUS.md`;
- `PR528C2_DOCUMENT_SUMMARY_CONTRACT_REVIEW_ARGUS_RESULT.md`; and
- `PR528C4_FRACTIONAL_MEMORY_WEIGHT_REVIEW_ARGUS_RESULT.md`.

Both Railway services were idle on the exact accepted review SHA before the
first hosted write:

```text
c13d8ea0b30ce6637cc8499feef74492dd29330c
```

The later MIMIR wake commit was skipped by Railway because it changed no
watched runtime path. No other hosted mutation or rolling deployment was
active.

## Private Pre-Run Snapshot

The retained PR528B4 cleanup ledger and separate credential envelope were
decrypted only in-process. A new DPAPI-encrypted pre-run snapshot was bound to:

- the encrypted cleanup-ledger ciphertext hash and revision;
- the owner, persona, two curated Memory IDs, one Archive Memory ID, file ID,
  and all related retained identifiers;
- invariant hashes for all three Memory rows excluding only weight and
  `updated_at`;
- every lifecycle and unrelated retained corpus row;
- the private storage object body and metadata hashes;
- storage accounting, forbidden-scope baselines, migration hashes, catalog
  state, and pre-run Railway deployment identities.

The full existing private-corpus review also re-passed before mutation:

| Check | Pre-run result |
| --- | --- |
| Retained Memory weights | Curated `1`, `1`; Archive `2` |
| Storage | One object; `1,145` bytes used |
| Anonymous/cross-owner disclosure | `0` |
| Discover private matches/feed rows | `0` |
| Forbidden owner scopes | `46` checked, `0` rows |
| Unavailable connector scopes | `2` |
| Conversations/traces/token transactions | `0` |
| Tokens used/top-up tokens | `0` / `0` |

No private value, credential, identifier, storage path, signed URL, body, or
timestamp was printed or committed.

## Migration Apply

Exact checked-in hashes were recomputed before every apply attempt:

| Migration | SHA-256 |
| --- | --- |
| `085_documents_summary.sql` | `F6A7A4AEB661A49D13F930D80E1F9124B4BD71533EEF00B4BF023C17AE397425` |
| `086_fractional_memory_relevance_weight.sql` | `F2330528BE2A2D233BADC7CDE8977C324ED8BCE3C3740E62D8CB5CC6F654B518` |

Precheck proved both target ledger rows absent, `documents.summary` absent,
Memory weight and both retrieval RPC outputs still `integer`, the readiness
contract absent, and the migration connection running in the shared table-owner
context.

Migration `085` committed first and passed its nullable text column, null
default, bounded trimmed-length constraint, comment, and schema reload checks.
Only then was its honest hash-bound ledger row inserted.

### Honest `086` retry note

The first exact `086` request failed transactionally with PostgreSQL SQLSTATE
`54000`: the hosted default `maintenance_work_mem` was `32MB`, while the
column rewrite required `61MB`. Post-failure proof showed the whole `086`
transaction rolled back: the column remained integer, the contract RPC stayed
absent, retained values remained `1/1/2`, and no `086` ledger row existed.

A read-only session probe proved `128MB` was accepted. DAEDALUS then opened one
database session with session-only `maintenance_work_mem=128MB` and submitted
the exact hash-verified `086` file bytes unchanged. The migration committed and
passed catalog/ACL checks. The setting was not persisted; a fresh session reads
the hosted default `32MB` again.

After each successful migration transaction, exactly one honest ledger row was
inserted:

| Migration | Version | Created by | Idempotency key |
| --- | --- | --- | --- |
| `085_documents_summary` | `20260716093601` | `DAEDALUS_PR528B6` | `pr528b6-085-documents-summary` |
| `086_fractional_memory_relevance_weight` | `20260716093602` | `DAEDALUS_PR528B6` | `pr528b6-086-fractional-memory-relevance-weight` |

Each ledger statement array records the checked-in path and exact SHA-256.

## Catalog Result

Post-apply proof passed:

- `documents.summary` is nullable `text`, has no default, and retains the
  trimmed `1..500` constraint;
- `memory_items.relevance_weight` is non-null `numeric` with default `1`;
- `match_memory_items` returns numeric relevance weight;
- `match_private_archive_chunks` returns numeric relevance weight;
- both retrieval functions retain their accepted argument/filter/order/grant
  contracts;
- `memory_relevance_weight_contract()` reports ready; and
- its execute ACL is absent for `PUBLIC`, `anon`, and `authenticated`, and
  present for `service_role`.

The retained corpus remained unchanged at `1/1/2` after schema apply and before
deployment/correction.

## Exact Deployment

DAEDALUS redeployed the existing accepted artifact for each Railway service,
one service at a time. Both fresh deployments completed successfully on the
same exact SHA:

```text
c13d8ea0b30ce6637cc8499feef74492dd29330c
```

| Service | Result |
| --- | --- |
| API | Fresh deployment, `ready:true`, migration latest `025-086`, every migration proof green |
| Web | Fresh deployment, `ready:true` |

Both services were idle with zero rolling deployments at closeout.

## Exact Retained-Row Correction

Only after schema, ledger, catalog, exact-SHA deployment, and readiness passed,
one transaction locked and updated exactly the ledger-bound rows:

| Row class | Count | Before | After |
| --- | ---: | ---: | ---: |
| Curated manual Memory | `2` | `1` | `1.25` |
| File-backed Archive Memory | `1` | `2` | `1.5` |

The transaction required the expected owner, persona, exact IDs, source class,
Archive source link, and current value for every row. It failed closed unless
the locked and updated counts were both exactly `3`.

Post-correction private snapshot comparison proved:

- all three non-weight Memory invariant hashes unchanged;
- content, summaries, source links, embeddings, provider/model/dimension/index
  metadata, chunk metadata, creation state, and provenance unchanged;
- exactly three expected `updated_at` effects and no other Memory field drift;
- all lifecycle rows unchanged;
- all unrelated retained persona, layer, lifecycle-event, file, import,
  candidate, Continuity, profile, token-usage, and storage-usage rows unchanged;
- the private storage object body and object metadata unchanged; and
- storage accounting still exactly `1,145` bytes.

Owner API readback returned the exact fractions `1.25`, `1.25`, and `1.5`.

## Privacy And Provider Proof

The full post-correction proof ran twice and passed both times:

| Check | Result |
| --- | --- |
| Seven anonymous private route probes | All `401`; zero disclosure |
| Seven fresh cross-owner route probes plus persona list | Zero private disclosure |
| Five anonymous and cross-owner Discover searches | Zero private matches |
| `discover_feed` private persona rows | `0` |
| Deployed forbidden owner scopes | `46` checked, `0` rows |
| Packet-listed unavailable connector scopes | `2`, still absent |
| Conversations / archived transcripts | `0` / `0` |
| AI trace sessions / events | `0` / `0` |
| Token transactions / tokens used | `0` / `0` |

Fresh owner and unrelated-owner review sessions were revoked after each proof.
No chat route, generation call, provider configuration, public corpus write,
billing action, queue operation, or cleanup action occurred.

## Evidence And Scope

The ignored local operator directory retains:

- the DPAPI-encrypted immutable pre-run snapshot;
- the DPAPI-encrypted operation ledger with private timestamp and invariant
  receipts;
- the separate pre-existing credentials envelope; and
- one public-safe aggregate receipt.

The durable hosted changes are limited to migrations `085` and `086`, their two
honest migration ledger rows, two fresh exact-SHA Railway deployments, and the
three authorized relevance-weight updates.

No product source, migration file, package, lockfile, Railway variable,
persistent database setting, public content, account entitlement, storage
object, provider, billing row, queue, Cloudflare surface, or unrelated retained
row changed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS applied and ledgered migrations 085 then 086, redeployed exact accepted SHA c13d8ea0, and corrected exactly the three retained ledger-bound Memory weights.
- Full invariant, privacy, provider-boundary, and repeat verification passed; the first 086 attempt rolled back on hosted maintenance memory and the unchanged bytes then succeeded with a session-only 128MB setting.
Verdict:
- READY_PR528B6_SERIALIZED_PARTNER_SCHEMA_DEPLOY_AND_CORRECTION_FOR_ARGUS
Task:
- Route ARGUS independent hosted review before any public corpus or chat/provider work.
```
