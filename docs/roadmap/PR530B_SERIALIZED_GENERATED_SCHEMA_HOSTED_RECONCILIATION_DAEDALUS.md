# PR530B - Serialized Generated Schema Hosted Reconciliation

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-18

Status:

```text
OPEN_HOSTED_RECONCILIATION
```

## Authority

ARGUS accepts PR530A's source-only validator repair:

`docs/roadmap/PR530A_CROSS_OWNER_GENERATED_SCOPE_VALIDATOR_REPAIR_ARGUS_RESULT.md`

ARGUS also proved the hosted target lacks the accepted PR522/PR524A generated
schema chain. This lane applies and proves only:

```text
081_persona_encounter_cross_owner_generated_artifacts.sql
082_persona_encounter_cross_owner_generated_publications.sql
087_persona_encounter_cross_owner_scope_validator.sql
```

Migrations 081 and 082 were already accepted by their original implementation
and hostile-review lanes. Migration 087 is accepted source-only at
`20cd3481e6a4df42c5bec87bfb9c57b4eabfab38`. PR530B reconciles hosted schema;
it does not reopen their product contracts or add another feature.

## Required Sequence

### 1. Serialize And Snapshot

- Confirm no other hosted mutation, schema, deploy, or rehearsal lane is active.
- Bind the intended Supabase project and current Railway API/web deployment
  identities without printing credentials or connection strings.
- Compute and privately retain exact SHA-256 hashes for migrations 081, 082,
  and 087 from the accepted source tree.
- Take a read-only private pre-run snapshot of migration ledger state, relevant
  catalog objects, consent/audit row counts, generated-schema absence, validator
  definition/volatility, constraint dependencies, and retained PR528 public and
  private corpus invariants.

Fail closed if migrations 081, 082, or 087 are already partially represented,
if a target table/policy/function exists with non-identical shape, if required
077 through 080 dependencies are absent, if the accepted file hashes drift, or
if another hosted writer is active.

### 2. Apply 081

- Execute the exact checked-in migration 081 bytes inside one operator-owned
  database transaction because the historical file has no transaction wrapper.
- Require the artifact, revision, and bilateral approval tables, constraints,
  indexes, triggers, RLS, participant-only SELECT policies, no public policy,
  no direct participant write policy, server-mediated write boundary, and
  append-only approval behavior to match the accepted contract.
- Require all three new tables to contain zero rows.
- Only after the transaction and catalog proof pass, insert one honest
  hash/path/version-bound migration ledger row.

### 3. Apply 082

- Execute the exact checked-in migration 082 bytes inside a separate
  operator-owned database transaction.
- Require the generated publication and publication-audit tables, exact-text
  source/digest/approval constraints, indexes, lifecycle triggers, RLS, bounded
  public published-row SELECT policy, participant-only audit read policy, no
  direct participant write policy, and append-only publication audit behavior
  to match the accepted contract.
- Require both new tables to contain zero rows and all 081 tables to remain
  unchanged and empty.
- Only after transaction and catalog proof pass, insert one honest
  hash/path/version-bound migration ledger row.

### 4. Apply 087

- Execute migration 087 exactly as checked in; it owns its transaction and
  advisory lock.
- Require the validator to remain an immutable SQL boolean function, permit
  exactly the eight API/type scopes, cap cardinality at eight, reject null and
  unknown values, and remain the validated dependency of both consent CHECK
  constraints.
- Require the exact PR524B pair to evaluate true and null, empty, unknown,
  ninth, and mixed-invalid probes to evaluate false.
- Only after transaction and catalog proof pass, insert one honest
  hash/path/version-bound migration ledger row.

### 5. Hosted Product Canary

After all three migrations and ledger rows pass, run one bounded hosted canary
for the exact pair:

```text
save_private_cross_owner_artifact
publish_exact_generated_revision
```

Prefer the existing isolated PR524B identities and private counterparty fixture
recorded in the encrypted prior-run evidence. Snapshot every touched row first.
Expose a private fixture publicly only if the product route requires it, bind
that temporary visibility change exactly, and restore it immediately.

The canary must prove one invitation saves with the exact two scopes, its two
audit events preserve the same scopes, and the normal product cancellation or
cleanup path removes/inactivates only the tagged canary. No artifact, revision,
approval, publication, report, provider call, token usage, public body, or
search/feed placement may be created.

If no bounded fixture with exact restoration exists, stop after schema/catalog
proof and wake MIMIR with that exact canary blocker. Do not improvise a new
account or mutate retained partner-review content.

### 6. Postcheck

Repeat the full read-only catalog and invariant snapshot. Require:

- exactly three new honest migration ledger rows and no unrelated ledger drift;
- accepted 081, 082, and 087 catalog shape;
- zero generated artifact, revision, approval, publication, and publication-
  audit rows;
- zero active tagged canary consent/audit residue after cleanup;
- no change to retained PR528 public/private corpora, Auth/session baselines,
  public personas, Spaces, documents, forums, Memory, Archive, Continuity,
  reports, token facts, storage, provider configuration, or Railway variables;
- API/web health and deployment readiness remain green.

Do not redeploy Railway merely because migrations were applied. Redeploy only
if current application identity or readiness cannot consume the accepted schema
without it; record the concrete reason and bind any deployment to one exact
source SHA.

## Security And Evidence Rules

- Never print or commit secrets, connection strings, raw owner/persona IDs,
  private text, signed URLs, storage paths, cookies, bearer values, or private
  timestamps.
- Keep private snapshots, hashes, and identifiers in the ignored encrypted
  operator evidence area; commit only aggregate public-safe results.
- Do not edit migration files, hot-patch the function manually, create ledger
  rows before successful catalog proof, or mark a failed/rolled-back migration
  applied.
- Do not mix PR529, provider, retrieval, embedding, Redis, Cloudflare, billing,
  UI, content, public placement, or broad schema repair into this lane.

## Expected Output

Create:

```text
docs/roadmap/PR530B_SERIALIZED_GENERATED_SCHEMA_HOSTED_RECONCILIATION_RESULT.md
```

Record exact source identity, public-safe hashes, ledger versions, aggregate
catalog/readiness/canary/cleanup results, any rollback, and a truthful verdict.

Use one of:

```text
READY_PR530B_SERIALIZED_GENERATED_SCHEMA_HOSTED_RECONCILIATION_FOR_ARGUS
BLOCK_PR530B_SERIALIZED_GENERATED_SCHEMA_HOSTED_RECONCILIATION
```

Commit the result and explicitly wake ARGUS for independent hosted review.
ARGUS must commit its verdict and wake MIMIR; nobody may stop silently.
