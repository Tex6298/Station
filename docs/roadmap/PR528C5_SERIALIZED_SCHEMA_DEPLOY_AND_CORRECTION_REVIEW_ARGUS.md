# PR528C5 - Serialized Schema Deploy And Correction Review

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - independent hosted review

## Review Target

Review the hosted operation recorded in
`PR528B6_SERIALIZED_PARTNER_SCHEMA_DEPLOY_AND_CORRECTION_DAEDALUS_RESULT.md`
against PR528B6, PR528C2, PR528C3, and PR528C4.

The result file was staged by DAEDALUS after completing the operation but was
captured in MIMIR continuation commit `2bd58edb` before DAEDALUS created his
normal handoff commit. Do not infer execution provenance from Git authorship.
Bind the run independently to the encrypted operation ledger, migration ledger,
checked-in hashes, Railway deployment identities, catalog state, exact retained
rows, and public-safe receipt. Classify any remaining provenance ambiguity as a
finding rather than silently accepting the narrative.

## Required Review

1. Prove the private pre-run snapshot is bound to the existing PR528B4 cleanup
   ledger, exact owner/persona/three Memory rows, invariant hashes, storage
   object, forbidden-scope baselines, migration hashes, and pre-run deployment
   identities without exposing private values.
2. Verify migration `085` committed before `086`, each honest ledger row binds
   the exact checked-in SHA-256/path, and no false ledger entry exists for the
   first rolled-back `086` attempt.
3. Independently prove SQLSTATE `54000` left `086` fully rolled back, the later
   session-only `maintenance_work_mem=128MB` apply used unchanged migration
   bytes, and a fresh session returned to the hosted `32MB` default.
4. Audit hosted catalog and ACL state for nullable bounded document summary,
   numeric non-null Memory weight/default, exact numeric RPC contracts, and the
   service-role-only readiness function.
5. Bind fresh API and web Railway deployments to the exact accepted SHA
   `c13d8ea0b30ce6637cc8499feef74492dd29330c`, require both services idle, and
   require `/health/deployment` ready with latest proof `025-086` and every
   migration proof green.
6. Decrypt identifiers only in-process and prove exactly two curated rows are
   `1.25` and one file-backed Archive row is `1.5`. Require all non-weight
   invariant hashes, embeddings/metadata, lifecycle, storage, and unrelated
   retained rows unchanged apart from the three expected update timestamps.
7. Re-run bounded anonymous, cross-owner, Discover, forbidden-scope, provider,
   chat/trace/token, and storage/accounting checks. Require zero private leak or
   unauthorized write.

## Mutation Boundary

Read-only except for ordinary fresh sign-in/session effects required for
independent boundary probes; revoke only those exact sessions. Do not reapply a
migration, redeploy, alter retained rows, create public corpus, call chat,
configure a provider, or clean up retained state.

## Result And Handoff

Create:

`docs/roadmap/PR528C5_SERIALIZED_SCHEMA_DEPLOY_AND_CORRECTION_REVIEW_ARGUS_RESULT.md`

Use one exact verdict:

```text
ACCEPT_PR528B6_SERIALIZED_SCHEMA_DEPLOY_AND_CORRECTION
BLOCK_PR528B6_SERIALIZED_SCHEMA_DEPLOY_AND_CORRECTION_<EXACT_REASON>
```

Commit and push public-safe evidence only, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS independently reviewed the PR528B6 hosted migrations, exact deployment, and retained-row correction.
Verdict:
- ACCEPT_PR528B6_SERIALIZED_SCHEMA_DEPLOY_AND_CORRECTION (or exact blocker)
Task:
- If accepted, authorize the separately bounded public partner corpus lane.
```
