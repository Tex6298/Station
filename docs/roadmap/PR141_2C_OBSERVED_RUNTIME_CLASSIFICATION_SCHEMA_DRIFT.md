# PR141 2C Observed Runtime Classification Schema Drift

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR140 fixed the Agents Observe payload classification mismatch. The live-send
path no longer stops on
`developer_space_observed_runtime_classification_failed`.

The next bounded staging blocker is base Developer Space schema drift:

```text
developer_space_server_error: Could not import Developer Space node.
```

PR140 service-role probes classified the missing columns as:

- `developer_space_nodes.observed_runtime_classifications`;
- `developer_space_events.observed_runtime_classifications`;
- `developer_space_snapshots.observed_runtime_classifications`.

Those columns belong to
`infra/supabase/migrations/045_observed_runtime_classifications.sql`.

ARGUS also corrected the reported `developer_space_nodes.node_id` probe as
non-authoritative: local nodes use `external_id`, and `node_id` belongs to
`developer_space_events`.

## Scope

- Inspect staging schema state for migration `045`.
- Apply or prove `045_observed_runtime_classifications.sql` narrowly:
  - `developer_space_nodes.observed_runtime_classifications jsonb`;
  - `developer_space_events.observed_runtime_classifications jsonb`;
  - `developer_space_snapshots.observed_runtime_classifications jsonb`;
  - object-shape check constraints;
  - column comments.
- Confirm PostgREST/schema-cache visibility for the three columns.
- Do not chase or "fix" `developer_space_nodes.node_id`; that is not a local
  node-table column.
- Leave `046`/`047`/`048` ledger repair out of scope unless MIMIR opens a
  separate operator/tooling lane.
- Record migration ledger status for `045` and the still-empty `046`/`047`/`048`
  rows without hand-editing history.
- Rerun the bounded staging smoke on `station-replay-dev-alpha`:
  - temporary named key only;
  - raw key in memory only;
  - no legacy rotation;
  - targeted revoke and cleanup proof.
- If import succeeds, prove accepted import, safe receipt replay, and
  public/owner readback.
- If import still fails, classify the next bounded blocker without printing
  private payloads, raw ids, fixture bodies, credentials, or secrets.

## Acceptance

- Staging has the three `observed_runtime_classifications` columns on nodes,
  events, and snapshots, or their absence is precisely classified.
- Object-shape checks and comments from migration `045` are proved where
  possible.
- PostgREST can see the three columns after schema reload, or the schema-cache
  blocker is explicitly classified.
- Current-timestamp live send no longer stops on missing
  `observed_runtime_classifications` base-table columns, or that exact blocker
  is re-proved after the `045` attempt.
- Temporary staging key is revoked and cleanup is proved.
- No secret values, raw webhook ids, fixture bodies, URLs with credentials,
  tokens, signing material, `.env` values, or Railway variables are printed,
  written, or committed.

## Ledger Note

Migration ledger rows for direct-applied `046`, `047`, and `048` remain absent
after official Supabase repair failed on the pooler prepared-statement
collision. PR141 should not hand-edit those rows. It may inspect and report
ledger state for `045`; if official repair is attempted and fails, record the
failure as an operator/tooling gap rather than faking migration history.

## Validation

Run focused local gates:

```bash
pnpm test:developer-spaces
pnpm test:developer-space-client
pnpm --filter @station/api build
pnpm typecheck
git diff --check
```

For staging proof, record only safe facts:

- migration `045` column/check/comment/schema-cache proof;
- migration `045` ledger classification;
- unchanged `046`/`047`/`048` ledger classification;
- named-key create/revoke status classes;
- no legacy rotation proof;
- live-send accepted/bounded response class;
- receipt replay response class if reached;
- public/owner readback status classes and safe counts.

## Non-Scope

- No broad migration sweep.
- No migration ledger hand-editing.
- No repair of `developer_space_nodes.node_id`.
- No signing-secret create/rotate/revoke/decrypt lane.
- No legacy key rotation.
- No committed secrets.
- No writing smoke keys or signing secrets to `.env` or Railway variables.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No hosted runtime, scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.

## Handoff

Wake ARGUS with:

- migration `045` apply/proof method;
- column/check/comment/schema-cache evidence;
- ledger classification for `045` and unchanged `046`/`047`/`048`;
- named-key create/revoke proof;
- no legacy rotation proof;
- accepted/bounded live-send response;
- receipt replay proof if reached;
- public/owner readback proof if reached;
- validation results;
- no-secret proof;
- explicit non-claims.

Wake MIMIR instead if applying/proving migration `045` is blocked by missing
external access, if ledger repair needs an operator decision, or if the next
blocker requires changing PR scope.
