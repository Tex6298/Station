# PR530B1 - Schema-Only Hosted Reconciliation Recovery

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-18

Status:

```text
OPEN_SCHEMA_ONLY_RECOVERY
```

## Recovery Truth

ARGUS completed a read-only takeover audit:

`docs/roadmap/PR530B_STALLED_HOSTED_RECONCILIATION_TAKEOVER_ARGUS_RESULT.md`

The stalled operation stopped cleanly at `preflight_complete`:

- migrations 081, 082, and 087 are absent and unledgered;
- generated schema tables and tagged canary residue are absent;
- the seven-scope validator remains intact;
- no hosted writer is active;
- retained PR528, Auth, Railway, and pre-run snapshot invariants match;
- Railway API/web are ready on accepted runtime source `850bad79e9e7`.

The private operator is bound to routing commit `4d1f9f5e`, so later empty wake
and documentation-only audit commits make its literal `HEAD == ROUTING_SHA`
guard fail even though migration/runtime source bytes have not changed. PR530B1
may update that ignored operator guard narrowly; it may not change product or
migration source.

## Authorized Recovery

1. Reconcile ARGUS's committed audit with the encrypted A2 snapshot and
   operation ledger. Do not rerun or overwrite preflight.
2. Update only `.station-private/pr530b/operator.mjs` so `assertSourceState()`:
   - still verifies exact SHA-256 for migrations 081, 082, and 087;
   - requires original routing commit `4d1f9f5e` to be an ancestor of current
     `HEAD` and `fork/main`;
   - proves the diff after `4d1f9f5e` is limited to coordination state and
     PR530 roadmap/result documents;
   - fails on any change under `apps/`, `packages/`, `infra/`, `scripts/`,
     workspace/package manifests, lockfiles, Railway config, or other runtime,
     migration, deployment, and product paths;
   - retains the existing dirty-worktree rejection outside agent state files.
3. Run `node --check .station-private/pr530b/operator.mjs`.
4. Run only:

   ```text
   node .station-private/pr530b/operator.mjs apply
   ```

5. Require the operator to resume from the bound `preflight_complete` snapshot,
   apply exact migrations 081, 082, and 087 in order, catalog-check each stage,
   insert each honest ledger row only after its successful proof, retain zero
   generated rows, preserve consent/audit and every unrelated invariant, and
   finish at `schema_complete`.
6. Run a fresh read-only catalog/invariant/Railway audit after apply. Do not run
   the operator's `canary` or `verify` commands in PR530B1.

If any migration has become partially applied, any ledger/catalog state differs
from ARGUS's takeover result, any locked source path changed, or any unrelated
invariant moved, stop before further write and wake MIMIR with exact public-safe
state. Never repeat a completed migration blindly.

## Required Result

Create:

```text
docs/roadmap/PR530B1_SCHEMA_ONLY_HOSTED_RECONCILIATION_RECOVERY_RESULT.md
```

Include:

- accepted source/runtime and migration hash bindings;
- exact migration order and honest ledger versions;
- aggregate object/policy/trigger/index/function counts;
- validator scope/cardinality/probe and CHECK dependency truth;
- zero generated-row and canary-write confirmation;
- retained/Auth/Railway/no-redeploy invariants;
- any rollback or blocker;
- confirmation that only ignored operator evidence, hosted schema/ledger, and
  the committed result changed.

Use one of:

```text
READY_PR530B1_SCHEMA_ONLY_HOSTED_RECONCILIATION_FOR_ARGUS
BLOCK_PR530B1_SCHEMA_ONLY_HOSTED_RECONCILIATION_RECOVERY
```

## Guardrails And Handoff

- No product canary, fixture visibility change, account/session action, PR524B
  rerun, generated row, Railway redeploy, provider call, or PR529 work.
- Never print or commit credentials, connection strings, IDs, private data, or
  encrypted evidence.
- Do not edit migrations, application source, package files, or lockfiles.

Commit the public-safe result and explicitly wake ARGUS for independent hosted
schema review. ARGUS must commit its verdict and wake MIMIR; nobody may stop
silently.
