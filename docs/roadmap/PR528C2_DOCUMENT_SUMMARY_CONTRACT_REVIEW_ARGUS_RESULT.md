# PR528C2 - Document Summary Contract Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted for serialized migration and deployment proof

```text
ACCEPT_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_DEPLOYMENT
```

## Findings

No blocking product-source finding.

DAEDALUS commit `d1e47b11ba30754778ebc330af327ee1fa7dfb87`
matches the bounded PR528B3 lane. It adds the nullable document-summary
contract, carries it through authorized owner/public reads and version history,
and presents it only on the requested public surfaces. It does not add summary
generation, provider use, ranking changes, hosted corpus writes, or adjacent
product scope.

The submitted test covered hostile historical Space ownership but did not
directly prove the contract's separate historical persona/source-persona and
discussion-pointer cases. ARGUS made a test-only correction to the existing
summary route test. The added assertions pass and found no product defect.

This verdict accepts source for a serialized migration and deployment proof. It
does not claim that migration `085` has been applied, that a hosted deployment
is ready, or that public corpus creation may begin before that proof succeeds.

## Migration Audit

| Requirement | Review result |
| --- | --- |
| Additive and idempotent | `085_documents_summary.sql` takes a migration-specific advisory lock, verifies `public.documents`, uses `add column if not exists`, and replaces the named constraint inside one transaction. |
| Legacy compatibility | `summary` is nullable, has no default, and has no backfill. Existing rows remain valid and retain canonical-body fallback behavior. |
| Normalized bound | Non-null values must have a `btrim` length from `1` through `500`. API writes trim input, reject values over `500`, and normalize empty input to `null`. |
| No policy or storage drift | The migration adds no RLS policy, index, trigger, generated value, storage object, or unrelated table change. |
| Readiness before deploy | Deployment readiness now selects `documents.version,summary`; a host without migration `085` fails the schema proof rather than reporting ready. No document value is exposed. |

The migration ends with the existing PostgREST schema-reload notification. It
does not apply itself or mutate hosted data in this review.

## API And Privacy Review

- Create and update use the same trim/null normalization and preserve the
  canonical `body` field.
- Owner list/read paths return `summary`; current anonymous public reads return
  it only through the existing document readability rules.
- Private and unpublished documents do not become public, and the focused test
  confirms a private summary is absent from both the response and serialized
  error body.
- Discover search still uses its existing title eligibility and returns the
  canonical body alongside summary. Visibility, provenance, routeability, and
  public-Space eligibility remain unchanged.
- Generated DB types model `summary` as nullable. The shared projected document
  type permits nullable/omitted summary for legacy and partial consumers.

No secret, provider credential, raw source label, private document value, or
owner-only identifier was added to logs, errors, UI, docs, or public payloads.

## Version And Discussion Review

`summary` participates in document change detection, prior-state snapshots,
version serialization, owner history readback, and owner-only restoration.
Restore snapshots the current row before applying historical document fields,
increments the current version, and preserves both non-null and null summary
states.

ARGUS independently proved that restore:

- rejects a historical Space owned by another user;
- rejects both a historical persona and historical source persona owned by
  another user;
- hides the document/version from a different owner;
- preserves the current live `discussion_thread_id` instead of accepting a
  forged historical pointer; and
- applies current discussion policy to that live pointer, locking and hiding it
  when the restored document state is not discussion-eligible.

The unrelated historical thread remains untouched. Historical content cannot
rewire the live discussion or reactivate discussion eligibility outside the
restored document's current policy.

## Public Surface Review

| Surface | Review result |
| --- | --- |
| Public document detail | Renders summary as separate supporting copy before the unchanged canonical body. |
| Discover feed | Uses `summary ?? body` for excerpts and retains existing eligibility and ordering. |
| Discover search presentation | Carries summary for the existing summary-first presentation while preserving title-only search eligibility and body readback. |
| Public Space document list | Selects summary and uses `summary ?? body`; private/unpublished disclosure rules are unchanged. |
| Shared document card | Uses the same null fallback without deriving, generating, or replacing canonical body. |

The remaining document-body consumers in events, persona context, discussions,
exports, approvals, imports, Continuity, and Station Assistant retain their
existing canonical-body or metadata-only contracts.

## Scope Audit

All 17 files in the DAEDALUS commit are necessary to the migration, API/type
contract, requested public consumers, readiness proof, focused tests, or result
record. The diff contains no Writing workflow, Developer Space evidence,
assistant, export, generated-summary, provider, ranking, Cloudflare, queue,
billing, storage, or hosted-runtime implementation.

No migration, deployment, hosted owner, document, Space, thread, persona,
provider, corpus, credential, billing row, queue, or configuration was read or
mutated during ARGUS review.

## Validation

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 --filter @station/types --filter @station/config --filter @station/db --filter @station/auth build` | Pass |
| Focused community, Space, readiness, and publishing UI tests | Pass, `80/80` |
| Document discussion, continuity publication, writing feed, and public story regressions | Pass, `21/21` |
| Post-review `apps/api/src/routes/community.test.ts` with the added hostile-history assertions | Pass, `36/36` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, zero warnings/errors |
| `git diff --check d1e47b11^ d1e47b11` | Pass |

## Deployment Boundary

The accepted source may proceed only through a serialized proof:

1. Apply migration `085` to the intended hosted target.
2. Verify the migration ledger/hash and catalog shape, including the nullable
   column and normalized `1..500` constraint.
3. Deploy the exact accepted source SHA.
4. Confirm `/health/deployment` reports ready with the summary schema proof.
5. Only then reconsider the separately blocked public-corpus write.

This review does not authorize corpus creation, provider configuration, or any
other PR528B4 work.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed the PR528B3 document summary source and migration contract.
Verdict:
- ACCEPT_PR528B3_DOCUMENT_SUMMARY_CONTRACT_FOR_DEPLOYMENT
Task:
- If accepted, serialize migration/deployment proof before public corpus creation.
```
