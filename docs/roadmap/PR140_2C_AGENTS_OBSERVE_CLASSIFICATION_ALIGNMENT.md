# PR140 2C Agents Observe Classification Alignment

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

## Why This Lane

PR139 cleared the observed-runtime webhook receipt blocker on staging:
migration `047` metadata/RLS/PostgREST visibility is proved, and the live-send
path no longer stops on receipt claim.

The current blocker is now payload validation:

```text
developer_space_observed_runtime_classification_failed
```

That means the deployed route is reached, auth/signing fallback is working, and
receipt claim/finalization is working. The remaining work is to align the
Agents Observe staging payload with the existing observed-runtime classification
contract from PR120-PR123 without weakening privacy boundaries.

## Scope

- Inspect the Agents Observe transform/live-send payload shape in:
  - `packages/developer-space-client/src/agents-observe.ts`;
  - `packages/developer-space-client/src/index.ts`;
  - `packages/developer-space-client/examples/agents-observe-offline-dry-run.ts`;
  - relevant tests.
- Compare the generated payload with the deployed API validator in
  `apps/api/src/routes/developer-spaces.ts`.
- Identify the exact classification mismatch that causes
  `developer_space_observed_runtime_classification_failed`.
- Fix the adapter/client/test fixture so:
  - every persisted public/member/owner/private field has matching
    `fieldClassifications`;
  - secret-shaped paths are classified as `secret`;
  - secret-class values are stripped before persistence;
  - secret field names are not persisted if the existing validator forbids them;
  - supporting context follows the same classification rules as nodes, events,
    and snapshots.
- Keep legacy dry-run and guarded live-send behavior intact.
- Rerun the bounded staging smoke on `station-replay-dev-alpha` with a temporary
  named key:
  - raw key in memory only;
  - no legacy rotation;
  - targeted revoke and cleanup proof.
- If validation passes, prove accepted import plus public/owner readback and
  safe receipt replay.
- If validation still fails, capture the safest available error classification
  without printing private payload, raw ids, fixture bodies, credentials, or
  secrets.

## Acceptance

- The Agents Observe payload passes local validation against the API
  observed-runtime classification rules.
- Local tests prove the privacy contract:
  - overexposed secret-shaped public/member/owner/private fields are rejected;
  - secret values are stripped;
  - public/member/owner readbacks do not leak private or secret data.
- Guarded live-send still requires explicit opt-in and required environment
  config.
- Staging current-timestamp live send no longer stops on
  `developer_space_observed_runtime_classification_failed`, or the remaining
  mismatch is precisely classified.
- Temporary staging key is revoked and cleanup is proved.
- No secret values, raw webhook ids, fixture bodies, URLs with credentials,
  tokens, signing material, `.env` values, or Railway variables are printed,
  written, or committed.

## Ledger Note

Migration ledger rows for direct-applied `046`, `047`, and `048` remain absent
after official Supabase repair failed on the pooler prepared-statement
collision. PR140 should not hand-edit migration history and should not block
classification alignment on ledger repair. Continue recording the ledger state
as an operator/tooling gap unless a separate MIMIR lane explicitly opens it.

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

- classification mismatch/fix summary;
- named-key create/revoke status classes;
- no legacy rotation proof;
- live-send accepted/bounded response class;
- receipt replay response class if reached;
- public/owner readback status classes and safe counts;
- unchanged `046`/`047`/`048` ledger classification.

## Non-Scope

- No migration ledger repair.
- No direct schema migration apply.
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

- exact classification mismatch found;
- adapter/client/test changes;
- local validation results;
- staging named-key create/revoke proof;
- no legacy rotation proof;
- accepted/bounded live-send response;
- receipt replay proof if reached;
- public/owner readback proof if reached;
- unchanged ledger classification for `046`/`047`/`048`;
- no-secret proof;
- explicit non-claims.

Wake MIMIR instead if the validator requires a product/privacy decision, if the
staging error cannot be classified without exposing private data, or if the
remaining blocker requires new schema rather than payload alignment.
