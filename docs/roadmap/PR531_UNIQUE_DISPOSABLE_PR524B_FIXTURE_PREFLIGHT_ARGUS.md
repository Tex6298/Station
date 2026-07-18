# PR531 Unique Disposable PR524B Fixture Preflight

Date: 2026-07-18

Owner: ARGUS / A3

Opened by: MIMIR / A1

Status:

```text
OPEN_PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PREFLIGHT
```

## Objective

Design the smallest safe hosted fixture and operator sequence that lets
ARIADNE rerun the complete PR524B generated-material publication proof now that
the schema blocker is closed.

This is a read-only source/catalog/product-route preflight. Do not create,
patch, expose, delete, or select a hosted fixture in this lane.

## Product Truth To Enable

The eventual proof must cover the original PR524B contract end to end:

1. two distinct test-account owners and personas;
2. generated-scope consent creation and bilateral approval;
3. private generated artifact save;
4. exact revision proposal and matching bilateral digest approvals;
5. detail-only public generated publication;
6. signed-out API/web privacy and desktop/390px visual proof;
7. report plus moderation remove/restore;
8. participant retract/delete;
9. generated-body no-drift checks outside the accepted detail route;
10. exact cleanup and restoration.

## Fixture Decision

Assess these paths in order:

1. **Preferred:** create fresh, uniquely tagged requester and counterparty
   personas under the two already configured staging test accounts. Temporarily
   expose only the counterparty if public target resolution requires it, then
   restore or delete both personas through bounded product routes.
2. Reuse an existing private tagged PR524B persona only if source plus read-only
   hosted evidence binds exactly one row and its full before-state/restoration
   digest. Do not choose among the nine historical consent pairs.
3. Create new Auth identities only if product routes make existing configured
   test accounts unusable and the irreversible Auth/audit cost is named. Do not
   recommend this merely for convenience.

## Required Preflight Work

- Map the exact existing API routes, payloads, participant role transitions,
  tier/visibility requirements, and web routes for every PR524B step.
- Confirm whether persona DELETE now supports exact fixture cleanup and name
  the dependency/ordering that caused or could cause the earlier hosted 500.
- Define unique run tags for personas, consent, artifact, revision,
  publication, report, and any session created by the proof.
- Define pre-run baselines and encrypted private evidence for all touched
  product, Auth/session, moderation, retained PR528, migration, and public
  placement rows.
- Define exact normal cleanup order and a separate recovery path for every
  intermediate failure point.
- Keep counterparty/private body exposure at the minimum required duration.
- Require zero provider/model calls, retrieval, embeddings, storage, billing,
  Redis, Cloudflare, queue, or unrelated UI mutation.
- Decide the owner chain for execution, human rehearsal, independent review,
  and closeout. Prefer DAEDALUS for a private bounded operator, ARIADNE for the
  human/browser proof, and ARGUS for final read-only review.

## Required Result

Create:

```text
docs/roadmap/PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PREFLIGHT_RESULT.md
```

Return one verdict:

```text
ACCEPT_PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PLAN
BLOCK_PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PLAN
```

An acceptance must include the exact fixture strategy, route sequence,
baseline/restoration contract, failure recovery, public-safe receipt shape, and
the next numbered DAEDALUS/ARIADNE lane. A block must name one concrete missing
product/config capability and the smallest numbered unblock.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR530 schema reconciliation is accepted and closed schema-only.
- PR524B remains open only because nine historical consent pairs are not a
  legitimate fixture choice and the complete product proof needs bounded
  creation/restoration planning.
Task:
- Run PR531 as a read-only preflight for one unique disposable full PR524B
  fixture and operator/rehearsal/review sequence.
- Prefer fresh tagged personas under existing configured test accounts; do not
  mutate hosted state or choose among historical rows.
- Wake MIMIR with accept/block verdict and the exact next numbered lane.
```
