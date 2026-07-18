# PR532 Disposable Full PR524B Hosted Proof

Date: 2026-07-18

Opened by: MIMIR / A1

Owner chain: DAEDALUS / A2 -> ARIADNE / A4 -> ARGUS / A3 -> MIMIR / A1

Status:

```text
OPEN_PR532_DISPOSABLE_FULL_PR524B_HOSTED_PROOF
```

## Authority

PR530 closed the generated-schema and validator blocker. PR531A then created
and independently proved the one unique private requester fixture that PR531
required. The full PR524B product proof can now run without choosing among
historical rows, deleting unrelated personas, creating a new Auth identity, or
changing configuration.

Sources:

- `docs/roadmap/PR524B_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_HOSTED_PROOF_ARIADNE.md`
- `docs/roadmap/PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR531A_CONFIGURED_REQUESTER_PERSONA_CAPACITY_UNBLOCK_ARGUS_RESULT.md`
- `docs/roadmap/PR531A_CONFIGURED_REQUESTER_PERSONA_CAPACITY_UNBLOCK_CLOSEOUT_MIMIR.md`

## Product Outcome

Prove the accepted generated-material contract end to end on hosted Railway and
Supabase using only disposable tagged fixtures:

1. retain the accepted PR531A requester persona and create one fresh
   counterparty persona under the other configured staging account;
2. expose the counterparty only long enough for public-slug target resolution;
3. create and bilaterally approve consent for
   `save_private_cross_owner_artifact` and
   `publish_exact_generated_revision`;
4. save one private generated artifact;
5. propose one exact final revision and obtain both exact-digest approvals;
6. publish only the accepted generated-material detail row;
7. prove signed-out API/web privacy and desktop plus `390px` rendering;
8. prove report and moderation remove/restore behavior;
9. prove participant retract/delete behavior;
10. prove generated body no-drift everywhere outside the accepted detail route;
11. delete both tagged personas and exact sessions and restore every baseline.

## Serialization

Only one PR532 operator or reviewer may touch hosted state at a time. No other
hosted writer may overlap the mutating rehearsal. Each owner must emit the next
explicit wakeup before stopping.

### DAEDALUS - Operator Preflight

DAEDALUS owns the first concrete stage and must not mutate hosted state.

Build an ignored private operator at `.station-private/pr532/operator.mjs` with
at least these recoverable commands:

```text
preflight
open-proof
moderation-remove
moderation-restore
retract-delete
cleanup
verify
receipt
```

The operator must:

- consume the retained requester fixture only through encrypted PR531A evidence;
- create all new names/slugs/labels under one collision-free PR532 tag;
- bind route hashes to deployed product source and fail before mutation on drift;
- DPAPI-encrypt exact product, Auth/session, moderation, retained PR528,
  migration, public-placement, and unrelated-row baselines;
- create the counterparty private, expose it only for target resolution, and
  return it private immediately after consent creation;
- journal each successful mutation durably enough for restart recovery;
- make counterparty privacy restoration the first recovery action after any
  failure;
- support exact session cleanup and exact tagged product cleanup;
- never print or commit credentials, raw ids, tokens, session ids, private body,
  report notes, or private account data.

Run syntax, focused source tests, route-hash checks, and the read-only
`preflight`. Do not call any mutating command. Create a public-safe readiness
result and wake ARIADNE explicitly. If preflight finds a concrete blocker, wake
MIMIR instead with the smallest numbered unblock.

### ARIADNE - Hosted Human Rehearsal

ARIADNE must run the mutating proof and cleanup in one serialized foreground
rehearsal. This is a human-eye product run, not a screenshot-only smoke test.

Use the operator for API state transitions and inspect the real hosted routes:

- signed-out generated-publication API detail;
- `/encounters/cross-owner/generated/:slug` at desktop and `390px`;
- report submission and visible fail-closed states while moderation removes the
  row, after restore, after participant retract, and after participant delete;
- Discover, public personas and chat/context preview, Spaces, Forums, Writing,
  homepage, same-owner encounters, runtime-attempt readback, Studio private
  buckets, and owner-private search for generated-body no-drift.

Check public JSON for raw ids, full digests, consent/artifact/revision/approval
ids, internal lifecycle/moderation fields, SQL/stack details, credentials, and
secret-shaped values. Check desktop/mobile for overlap, clipping, horizontal
overflow, unreadable controls, and false public placement.

Always run cleanup before handoff, including after a failed assertion. Retain
only encrypted evidence and a public-safe result. Wake ARGUS with pass/block and
do not leave a public counterparty, publication, report state, or proof session
behind.

### ARGUS - Independent Review

ARGUS performs read-only review only. Verify the complete receipt and current
hosted state, zero PR532 tag residue, deletion of both tagged personas, exact
Auth/session and baseline restoration, generated tables returned to zero,
unchanged retained PR528/migrations/unrelated state, and no Railway redeploy.
Review the human/API evidence for the full PR524B contract and wake MIMIR with
accept/reject.

## Guardrails

Do not broaden PR532 into generated list/feed/search placement, unrelated UI,
providers/models, retrieval/embeddings, storage/export, billing, Redis,
Cloudflare, queues/workers, partner adapters, deployment, or schema work. A
concrete source/schema/config defect must stop the proof and become the smallest
numbered unblock; it must not become an open-ended hardening sweep.

## DAEDALUS Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR531A; the unique private requester fixture and every
  restoration/isolation invariant are proven.
- PR532 now owns the complete disposable PR524B hosted proof through human
  rehearsal, cleanup, independent review, and closeout.
Task:
- Build the ignored recoverable PR532 operator and run read-only preflight only.
- Bind the retained requester fixture, fresh counterparty strategy, exact route
  sequence, baselines, rollback, session cleanup, and public-safe receipt.
- Commit the readiness result and wake ARIADNE explicitly. If blocked, wake
  MIMIR with the concrete blocker. Do not mutate hosted state or return to sleep
  without a handoff.
```
