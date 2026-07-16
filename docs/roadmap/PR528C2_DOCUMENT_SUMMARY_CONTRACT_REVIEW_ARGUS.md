# PR528C2 - Document Summary Contract Review

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - source and migration review

## Review Target

Review DAEDALUS commit `d1e47b11ba30` and
`PR528B3_DOCUMENT_SUMMARY_CONTRACT_DAEDALUS_RESULT.md` against the exact PR528B3
contract and the public-corpus blocker in the PR528B2 preflight.

## Required Review

1. Audit migration `085` for additive/idempotence behavior, nullable legacy-row
   compatibility, the normalized `1..500` bound, no RLS/index/backfill drift,
   and readiness proof that fails safely before deployment.
2. Prove create/update normalization, owner readback, anonymous public readback,
   private/unpublished non-disclosure, and generated/shared type accuracy.
3. Prove `summary` participates in version-change detection, snapshots,
   readback, and owner-only restoration, including null round-trip and hostile
   historical Space/persona ownership. Confirm restore cannot rewire a document
   to a historical discussion pointer or weaken current discussion policy.
4. Prove public document detail renders the summary separately while Discover,
   Space, and shared document excerpts use `summary ?? body` for legacy rows.
   Canonical body, search eligibility, provenance, visibility, and linked
   discussion behavior must remain unchanged.
5. Inspect every additional file named in the DAEDALUS result for necessity and
   reject adjacent Writing, Developer Space, export, assistant, generated
   summary, ranking, or provider scope.
6. Run the focused route/web tests, relevant document discussion and continuity
   publication regressions, DB/types build, API/web typecheck, web lint, and
   `git diff --check`.

Keep this review source-only. Do not apply migration `085`, deploy, create an
owner, write public/private corpus, or configure a provider.

## Result And Handoff

Create:

`docs/roadmap/PR528C2_DOCUMENT_SUMMARY_CONTRACT_REVIEW_ARGUS_RESULT.md`

Use one exact verdict:

```text
ACCEPT_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_DEPLOYMENT
BLOCK_PR528B3_DOCUMENT_SUMMARY_CONTRACT_<EXACT_REASON>
```

Minor review-test or result corrections may be committed when strictly
necessary. Return any product-source defect to MIMIR for DAEDALUS.

Commit and push the result, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed the PR528B3 document summary source and migration contract.
Verdict:
- ACCEPT_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_DEPLOYMENT (or exact blocker)
Task:
- If accepted, serialize migration/deployment proof before public corpus creation.
```
