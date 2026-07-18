# PR530 - Cross-Owner Generated Scope Schema Unblock Preflight Result

Owner: ARGUS / A3

Date: 2026-07-18

Status:

```text
BLOCK_PR530_CROSS_OWNER_GENERATED_SCOPE_SCHEMA_UNBLOCK_PREFLIGHT
```

## Verdict

ARGUS blocks the proposed "one additive migration is the whole hosted unblock"
claim.

Source/root cause is real and bounded: migration `077` defines
`public.persona_encounter_cross_owner_consent_scopes_valid(text[])` with
cardinality `between 1 and 7` and omits
`publish_exact_generated_revision`, while the API/types and migration `082`
require exactly eight valid scopes including that value.

However, the read-only hosted precheck found additional hosted-only drift:

- hosted has the immutable seven-scope validator;
- hosted has both consent CHECK constraints validated and calling that
  validator;
- hosted has zero existing consent rows and zero consent-audit rows that fail
  the current validator;
- hosted has no PR522/PR524A generated artifact, revision, approval,
  publication, or publication-audit tables/policies;
- hosted migration ledger evidence surfaced `077` only for this generated
  consent/publication chain.

Therefore PR530 may not be closed as "only replace one function on hosted".
The smallest honest unblock is: add the bounded validator replacement in source,
then deploy/reconcile the pending accepted schema chain so hosted contains the
already-accepted PR522/PR524A generated tables plus the new validator repair.
Do not rerun PR524B until that hosted schema precheck is green.

## Exact Additive Migration Contract

If MIMIR opens the implementation lane, DAEDALUS should add the next migration
after `086`, leaving historical migration `077` immutable.

The migration must:

- use an advisory transaction guard, for example
  `pg_advisory_xact_lock(hashtextextended('station.pr530.cross_owner_generated_scope_validator.087', 0))`;
- `create or replace function public.persona_encounter_cross_owner_consent_scopes_valid(scopes text[]) returns boolean language sql immutable`;
- keep `scopes is not null`;
- require `cardinality(scopes) between 1 and 8`;
- allow exactly these eight labels, with no wildcard and no future placeholder:
  `run_cross_owner_encounter`,
  `save_private_cross_owner_artifact`,
  `share_participant_metadata_between_owners`,
  `publish_metadata_only_public_exhibit`,
  `publish_exact_generated_revision`,
  `publish_generated_words_excerpt`,
  `publish_transcript`,
  `publish_generated_summary`;
- keep null element rejection through the `unnest(scopes)` check;
- notify PostgREST schema reload after commit.

Function replacement is sufficient for existing CHECK constraints because both
constraints call the function by OID/name and remain validated. The migration
should still assert catalog state after replacement, and only revalidate
constraints if the catalog check shows they do not call the replaced function
or are not validated.

## Required Tests

Catalog/idempotency tests:

- migration includes the advisory guard and `create or replace function`;
- function remains `immutable`;
- validator allows exactly the API/type scope set;
- both consent and consent-audit CHECK constraints call the validator and stay
  validated;
- existing valid rows remain valid.

Fail-closed schema tests:

- null array fails;
- empty array fails;
- null element fails;
- unknown scope fails;
- ninth distinct scope fails;
- mixed valid/invalid array fails;
- `publish_exact_generated_revision` alone succeeds;
- the exact two-scope PR524B invitation set succeeds:
  `save_private_cross_owner_artifact`,
  `publish_exact_generated_revision`;
- duplicate scopes are still accepted by the DB validator, matching current API
  dedupe behavior, but the API/RPC tests should continue proving duplicates do
  not widen execution semantics.

RPC/API no-drift tests:

- `create_persona_encounter_cross_owner_consent` saves the two PR524B generated
  scopes and writes audit events with the same scopes;
- legacy scope invitations still save;
- pending, nonparticipant, same-owner, wrong persona owner, inactive status,
  wrong scope version, and lifecycle transition tests remain unchanged;
- generated artifact, exact revision, bilateral approval, generated
  publication, moderation restore, retract/delete, and public detail tests still
  pass without adding generated list/search/feed placement.

## Hosted Sequence

Before any hosted mutation, DAEDALUS must run a read-only precheck that proves:

- current deployment identity;
- migration ledger state for `077` through the new PR530 migration;
- presence of PR522/PR524A generated artifact, revision, approval,
  publication, and publication-audit tables;
- expected generated-publication public RLS policy and participant/server-write
  policy absence;
- validator max cardinality is eight and includes exactly the API/type scope
  set;
- both consent CHECK constraints are validated and call the validator;
- existing consent and audit rows have zero invalid rows under the replaced
  validator.

Deployment/rehearsal must apply the accepted pending schema chain, not a
manual one-function hot patch. After deploy, rerun the same read-only catalog
precheck, then run a direct hosted API/RPC proof that the PR524B two-scope
invitation saves and can be cleaned up. Only after that may ARIADNE resume the
exact PR524B hosted proof from consent creation through generated publication
and no-drift checks.

## Validation

| Check | Result |
| --- | --- |
| `node --check .station-private/pr530/argus-preflight.mjs` | Pass |
| `node .station-private/pr530/argus-preflight.mjs` | Pass; source root cause proved and hosted additional drift found |
| `npx --yes pnpm@10.32.1 run test:persona-encounters` | Pass; 87 tests |
| `npx --yes pnpm@10.32.1 run test:reports` | Pass; 9 tests |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS blocks PR530A as phrased: the source validator repair is exactly one additive migration, but hosted is not only missing that repair.
- Read-only hosted catalog shows the immutable seven-scope validator and validated consent CHECK constraints, plus no generated artifact/revision/publication tables or policies from PR522/PR524A.
- Focused source validation remains green: test:persona-encounters 87/87 and test:reports 9/9.
Task:
- Route the smallest bounded unblock: add the PR530 validator migration, then deploy/reconcile the pending accepted generated schema chain on hosted before ARIADNE reruns PR524B.
Verdict:
- BLOCK_PR530_CROSS_OWNER_GENERATED_SCOPE_SCHEMA_UNBLOCK_PREFLIGHT
```
