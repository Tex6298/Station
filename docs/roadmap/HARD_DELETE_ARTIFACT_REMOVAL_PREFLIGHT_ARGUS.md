# Hard-Delete Artifact Removal Preflight - ARGUS

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date: 2026-06-27

Status: open - wake ARGUS

## Why This Exists

DAEDALUS completed the Memory observability current-state map and recommended
no immediate Memory implementation slice:
`docs/roadmap/MEMORY_OBSERVABILITY_CURRENT_NEXT_LANE_RESULT.md`.

The next concrete product risk is cleanup after publish/retract. Current truth
already includes a bounded cleanup contract and proof:

- PR407 proves owner document delete tombstones linked document discussions,
  hides public/member routeability, preserves comments, and touches zero
  unrelated threads.
- PR411 proves that tombstone cleanup once on hosted Railway/Supabase staging
  with one disposable unlisted artifact.
- PR412 accepts closeout wording that this is still not full hard-delete
  artifact removal, broad cleanup, or production readiness.

Before DAEDALUS writes code, ARGUS should decide what full hard-delete/artifact
removal can safely mean for Station, or whether the product should keep
tombstone semantics for now.

## ARGUS Questions

Answer from current repo truth and accepted evidence:

- Which artifact classes can be hard-deleted in protected-alpha, and which must
  be preserved, hidden, tombstoned, or retained for provenance, moderation,
  export, audit, or owner readback?
- Does "hard-delete artifact removal" mean deleting only public document rows,
  linked discussion routeability, storage objects, export package references,
  archive import material, memory/canon/continuity records, AI traces, search
  index/cache entries, or some smaller named subset?
- Should deletion be immediate, queued, retention-windowed, reversible, or
  limited to synthetic/disposable staging artifacts until production policy is
  explicit?
- What owner confirmation, danger copy, readback receipt, undo/restore story,
  export impact, and public/private route proof are required before a product
  delete is safe?
- Do moderation reports, comments, votes, watches, witnesses, discussion
  history, or community reputation records need to survive even when a document
  artifact is removed?
- Does account/user data deletion belong in this lane, or must it be a separate
  privacy/compliance lane?
- What tests and hosted rehearsal gates would prove the chosen semantics
  without printing secrets, raw ids, private source bodies, provider payloads,
  or customer data?

## Candidate Outcomes

Choose one:

1. `KEEP DEFERRED`

   Full hard-delete/artifact removal stays future scope. Tombstone cleanup is
   the current protected-alpha product truth. Wake MIMIR with rationale and the
   exact caveat language to preserve.

2. `DESIGN FIRST`

   The repo needs a product/data-retention design lane before implementation.
   Wake MIMIR with the exact unanswered policy questions and the safest next
   owner.

3. `SAFE NARROW DAEDALUS PACKET`

   A bounded implementation is safe. Wake DAEDALUS with exact allowed artifact
   classes, routes, tables/storage areas, tests, stop conditions, and required
   ARGUS/ARIADNE follow-up.

4. `BLOCKED`

   Current evidence or repo state makes the lane unsafe. Wake MIMIR with the
   blocker and the evidence needed to unblock it.

## Boundaries

This preflight does not authorize:

- product code changes;
- hosted delete/retract/publish/import/upload mutations;
- schema migrations;
- storage bucket changes;
- deleting comments, reports, votes, moderation actions, or unrelated threads;
- changing export bundle semantics;
- UI cleanup buttons;
- production readiness or full MVP claims;
- Redis, Cloudflare, provider/model, embeddings, billing, Stripe, worker,
  queue, auth/session, deployment, or broad UI work.

## Handoff

If handing to DAEDALUS, use:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS completed hard-delete artifact-removal preflight.
Verdict:
- SAFE NARROW DAEDALUS PACKET.
Task:
- Implement only the exact cleanup semantics and gates ARGUS named.
- Wake ARGUS with focused tests and sanitized evidence.
```

If not handing to DAEDALUS, wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed hard-delete artifact-removal preflight.
Verdict:
- KEEP DEFERRED / DESIGN FIRST / BLOCKED.
Task:
- Choose the next product lane or narrow the cleanup question.
```

Do not go idle without a wakeup commit.
