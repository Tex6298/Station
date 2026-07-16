# PR528C5 - Serialized Schema Deploy And Correction Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted; public partner corpus remains separately gated

```text
ACCEPT_PR528B6_SERIALIZED_SCHEMA_DEPLOY_AND_CORRECTION
```

## Findings

No blocking schema, deployment, retained-state, privacy, provider, or scope
finding.

ARGUS did not use the Git author of `2bd58edb` as evidence that DAEDALUS
executed the operation. The review instead bound the exact checked-in migration
hashes, encrypted pre-run and operation evidence, hosted migration ledger and
catalog, Railway deployment identities and history, retained corpus invariants,
storage proof, and current public-safe receipt.

One provenance limitation remains and is recorded explicitly: the ignored
operator and DPAPI envelopes are not signed by an agent-specific key, so they
do not cryptographically attest the human or agent process that pressed
execute. This is non-blocking for this lane because every durable hosted outcome
and every private-state binding required by PR528C5 was independently verified;
the verdict makes no person-level execution claim.

## Pre-Run Binding

The private snapshot decrypts under the existing local Windows-user boundary
and is bound to:

- the current PR528B4 cleanup-ledger ciphertext hash and ledger revision;
- the exact retained owner, persona, two curated Memory rows, one Archive
  Memory row, file, lifecycle, and related corpus identifiers;
- pre-correction weights `1`, `1`, and `2`;
- invariant hashes for all three Memory rows excluding only
  `relevance_weight` and `updated_at`;
- hashes of all lifecycle and unrelated retained rows;
- the one private storage object, its list metadata, and `1,145` accounted
  bytes;
- all `46` forbidden-owner-scope baselines plus the two unavailable connector
  scopes;
- exact migration hashes and the pre-run hosted catalog; and
- pre-run API and web Railway deployment identities on the accepted SHA.

The separate credential envelope still contains only the owner sign-in pair.
No credential value appears in the cleanup ledger, snapshot, operation ledger,
receipt, result, console output, or committed file.

## Migration And Retry Proof

ARGUS recomputed the checked-in SHA-256 values:

| Migration | SHA-256 |
| --- | --- |
| `085_documents_summary.sql` | `F6A7A4AEB661A49D13F930D80E1F9124B4BD71533EEF00B4BF023C17AE397425` |
| `086_fractional_memory_relevance_weight.sql` | `F2330528BE2A2D233BADC7CDE8977C324ED8BCE3C3740E62D8CB5CC6F654B518` |

The hosted migration ledger contains exactly one target row for each migration.
Both rows bind the exact checked-in path, hash, version, `created_by`, and
idempotency key. Their PostgreSQL transaction IDs order `085` before `086`.
There is no extra or false `086` row.

The encrypted failure envelope is ordered after the immutable pre-run snapshot
and before the completed operation ledger. It records the exact `086` apply
failure, HTTP `400`, PostgreSQL SQLSTATE `54000`, a `61 MB` rewrite requirement,
and the session's `32 MB` `maintenance_work_mem` value.

The exact `086` file is one `BEGIN`/`COMMIT` transaction. PostgreSQL therefore
aborted all statements in that failed request. The reviewed operator returns on
the failed management request and can insert the `086` ledger row only after a
successful catalog postcheck. Together with the exact single final `086` row,
this proves that the first attempt neither left partial schema state nor wrote a
false ledger receipt.

For the successful retry, the operator reads the hash-verified migration file
directly and prepends only:

```sql
set maintenance_work_mem = '128MB';
```

The migration bytes themselves are interpolated once and unchanged. A fresh
independent management session now returns `32MB`, proving the retry setting was
not persisted.

## Hosted Catalog

Independent catalog reads passed:

| Contract | Result |
| --- | --- |
| `documents.summary` | Nullable `text`, null default, named trimmed `1..500` constraint, comment present |
| `memory_items.relevance_weight` | `numeric`, `NOT NULL`, default `1` |
| `match_memory_items` | Exact six-input SQL `STABLE` invoker shape; one numeric relevance output |
| `match_private_archive_chunks` | Exact seven-input SQL `STABLE` invoker shape; one numeric relevance output |
| `memory_relevance_weight_contract()` | Reports all three numeric contracts ready |
| Readiness ACL | No `PUBLIC`, `anon`, or `authenticated` execute; `service_role` execute present |

The API deployment proof independently reports both `documents_version` and
`memory_weight_contract` green along with every other migration proof.

## Exact Deployment

Railway was read through the explicit production project boundary. The project
contains exactly the expected API and web services. Each currently has one
active successful deployment, all instances are `RUNNING`, and neither service
has a queued, building, deploying, waiting, or removing deployment in the
reviewed history.

Both current deployments bind exact SHA:

```text
c13d8ea0b30ce6637cc8499feef74492dd29330c
```

The current API and web deployment IDs differ from the snapshot's pre-run IDs;
both pre-run identities are present in Railway history on the same accepted
SHA. Later roadmap and wakeup commits are `SKIPPED` because they changed no
watched runtime path.

Public `/health/deployment` reads agree with Railway: API and web are ready on
`main`, the API latest migration range is `025-086`, and all seven migration
proofs are green.

## Retained Correction

Identifiers were decrypted only in-process. Current hosted state contains
exactly the ledger-bound rows:

| Row class | Count | Snapshot | Current |
| --- | ---: | ---: | ---: |
| Curated manual Memory | `2` | `1` | `1.25` |
| File-backed Archive Memory | `1` | `2` | `1.5` |

For every row, the current invariant hash equals both the pre-run snapshot and
the completed private correction receipt. Content, summary, source class,
Archive source link, embeddings, provider/model/dimension/index metadata,
chunk metadata, creation state, and provenance are unchanged. Exactly the
three expected `updated_at` values advanced and match the encrypted operation
receipt.

All lifecycle and unrelated retained profile, persona, layer, lifecycle-event,
file, import, candidate, Continuity, token-usage, and storage-usage rows retain
their pre-run hashes. The storage object body hash, object-list metadata hash,
object count, and `1,145`-byte accounting are unchanged.

## Privacy And Provider Boundary

Fresh independent owner and unrelated-owner sessions passed and were revoked
with local-session scope after the probes.

| Check | Result |
| --- | --- |
| Owner Memory API readback | Exact `1.25`, `1.25`, `1.5` |
| Seven anonymous private routes | All `401`; zero disclosure |
| Seven cross-owner routes plus persona list | Zero private disclosure |
| Five anonymous and cross-owner Discover searches | Zero private matches |
| Private persona `discover_feed` rows | `0` |
| Forbidden owner scopes | `46` checked, `0` rows |
| Unavailable connector scopes | `2`, still absent |
| Conversations / archived transcripts | `0` / `0` |
| AI trace sessions / events | `0` / `0` |
| Token transactions / tokens used | `0` / `0` |

The review made no chat or generation call, provider configuration, public
corpus write, billing action, queue operation, cleanup, Cloudflare change,
migration apply, deployment, or retained-row mutation.

## Validation

| Command / proof | Result |
| --- | --- |
| `node --check .station-private/pr528b6/argus-review.mjs` | Pass |
| Independent ignored ARGUS hosted verifier | Pass |
| Supabase management catalog, ledger, transaction-order, ACL, and fresh-session setting reads | Pass |
| Railway production status plus API/web deployment history reads with `--limit 100` | Pass; both services idle |
| Exact retained corpus, invariant, lifecycle, storage, privacy, forbidden-scope, and provider checks | Pass |

The verifier printed aggregate evidence only. No secret, credential, private
identifier, storage path, private text, signed URL, or private timestamp was
printed or committed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS independently reviewed the PR528B6 hosted migrations, exact deployment, and retained-row correction.
Verdict:
- ACCEPT_PR528B6_SERIALIZED_SCHEMA_DEPLOY_AND_CORRECTION
Task:
- If accepted, authorize the separately bounded public partner corpus lane.
```
