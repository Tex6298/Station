# PR532 Disposable Full PR524B Hosted Rehearsal - ARIADNE Result

**Date:** 2026-07-18  
**State:** `BLOCKED_PR532_GENERATED_PUBLICATION_REPORT_TARGET`  
**Hosted source:** `fd1a5870b2ed8868f516b60305e2cd30cc41274f`  
**Result owner:** ARIADNE (A4)

## Verdict

PR532 is not accepted. The disposable hosted flow reached a published, public-readable generated-material detail, then stopped when the distinct reporter attempted to create the required moderation report. The product API returned HTTP 500.

The operator recovered the hosted baseline after each stopped attempt. A separate final verification confirms zero PR532 residue and exact protected account, auth, retained-proof, migration, source, and Railway state.

## Completed evidence

- Fresh read-only preflight passed with five generated tables at zero rows, four checked cleanup triggers, zero unsafe enabled delete triggers, zero active hosted writers, four exact migration ledger rows, and exact retained PR528 evidence.
- Railway API and web services were ready, idle, on `main`, and bound to the expected source SHA. This is not a stale-deploy finding.
- ARIADNE's read-only Playwright/API probe passed at the hosted web and API origins before mutation.
- The operator created the bounded private counterparty, resolved the temporary public consent target, restored the counterparty to private, completed generated-scope consent, saved the private artifact, created the exact revision, recorded bilateral digest approval, published the detail-only result, and passed its public read allow-list assertion.
- No provider or chat-generation call was made.

Private fixture identities, credentials, raw IDs, digests, payloads, and detailed failure material remain only in CurrentUser DPAPI-encrypted ignored evidence.

## Blocking finding

The deployed API report route inserts this moderation target type:

```text
persona_encounter_cross_owner_generated_publication
```

The current `moderation_reports_target_type_check`, last replaced by migration 080, permits the older same-owner and cross-owner exhibit target types but not the generated-publication target. Migration 082 creates and wires the generated-publication surfaces but does not replace that moderation constraint.

The hosted HTTP 500 at `public_report_create` is therefore consistent with the database check rejecting the new target type. The route converts the failed insert to the public-safe `Failed to create report.` response.

Relevant source:

- `apps/api/src/routes/persona-encounters.ts` inserts the generated-publication target in the report route.
- `infra/supabase/migrations/080_persona_encounter_cross_owner_public_exhibits.sql` defines the currently tracked target-type allow-list.
- `infra/supabase/migrations/082_persona_encounter_cross_owner_generated_publications.sql` does not extend that allow-list.

## Operator correction

The first attempt exposed a separate ignored-operator assumption: the authenticated persona update response does not serialize `publicSlug`. ARIADNE corrected the recoverable local operator to resolve the slug through an exact, owner/name/visibility-bound management read. That correction changes no tracked product source and the second attempt passed that stage.

## Not completed

Because the required report could not be created, ARIADNE did not claim or simulate the remaining proof:

- signed-in duplicate-report UI readback;
- moderator remove and restore;
- participant retract and delete;
- desktop and 390px human-eye captures for all five lifecycle states;
- final full-rehearsal acceptance.

Those checks must run against the real hosted lifecycle after the constraint is corrected.

## Cleanup proof

Independent `verify` after recovery returned `PR532_BASELINE_RESTORED` with:

- requester fixture retained and private;
- PR532 tagged residue: zero;
- all five generated tables restored to zero;
- consent, audit, and moderation baseline exact;
- configured account state exact;
- auth sessions and refresh state exact;
- retained PR528 evidence exact;
- four migration ledger rows exact;
- seven route hashes bound;
- Railway API and web ready, idle, on `main`, and at `fd1a5870b2ed`.

## Required follow-up

ARGUS should review this blocker and route a narrow DAEDALUS migration patch that extends the moderation target-type constraint while preserving every existing allowed value. The patch should include a real database acceptance check for generated-publication report creation, duplicate readback, moderation remove/restore, and cleanup compatibility.

After the migration is applied and ledgered on the bound hosted project, PR532 returns to ARIADNE for the complete API and human-eye rehearsal from a fresh preflight.

## Validation

- `node .station-private/pr532/operator.mjs verify` - pass, exact baseline restored
- `node --check .station-private/pr532/operator.mjs` - pass
- `node --check .station-private/pr532/ariadne-rehearsal.mjs` - pass
- `node .station-private/pr532/ariadne-rehearsal.mjs probe` - pass
- `git diff --check` - pass
- `pnpm typecheck` - not required; the tracked change is documentation only
