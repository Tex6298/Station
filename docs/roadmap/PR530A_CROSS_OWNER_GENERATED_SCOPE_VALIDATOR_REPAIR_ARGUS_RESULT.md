# PR530A - Cross-Owner Generated Scope Validator Repair ARGUS Result

Owner: ARGUS / A3

Date: 2026-07-18

Status:

```text
ACCEPT_PR530A_CROSS_OWNER_GENERATED_SCOPE_VALIDATOR_REPAIR_SOURCE_ONLY
```

## Verdict

ARGUS accepts PR530A as a bounded source-only repair.

Migration `087_persona_encounter_cross_owner_scope_validator.sql` replaces only
`public.persona_encounter_cross_owner_consent_scopes_valid(text[])`. It raises
the cardinality ceiling from seven to eight, admits exactly the API/type scope
set including `publish_exact_generated_revision`, remains SQL/immutable, and
does not edit historical migration `077`.

The patch does not widen consent lifecycle, participant authorization, RLS,
audit immutability, generated-publication payloads, moderation behavior, UI,
Discover/search/feed/forum/persona placement, provider routing, retrieval,
storage, billing, queue, Redis, Cloudflare, or hosted runtime scope.

## Review Notes

Accepted:

- migration `087` uses an explicit transaction and PR530-specific advisory
  lock;
- preflight assertions require the existing validator, consent table,
  consent-audit table, and both named validated CHECK constraints;
- preflight and postcondition checks use `pg_depend` so the named CHECK
  constraints must depend on the validator;
- existing consent and audit rows must validate after replacement or the
  transaction rolls back;
- `notify pgrst, 'reload schema'` is present;
- focused tests compare the migration validator labels against both
  `CROSS_OWNER_CONSENT_REQUESTED_SCOPES` and
  `PersonaEncounterCrossOwnerConsentRequestedScope`;
- fail-closed model coverage includes null, empty, null element, unknown,
  ninth element, mixed valid/invalid, generated scope alone, PR524B two-scope
  pair, and duplicate allowed-label behavior.

Honesty limitation:

- no local PostgreSQL execution was claimed or run; this repo still lacks a
  disposable PostgreSQL/PGlite migration-chain harness. The current evidence is
  static migration/source proof plus the executable predicate model in the
  focused test.

Hosted boundary:

- PR530A did not deploy or mutate hosted Supabase/PostgREST/product data.
- ARGUS's PR530 preflight blocker remains active for the hosted side: hosted
  was shown to lack the accepted generated artifact/revision/publication schema
  chain as well as this new validator repair.
- ARIADNE must not rerun PR524B until MIMIR routes a serialized hosted
  reconciliation/deploy proof for the accepted pending schema chain and `087`.

## Validation

| Check | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 run test:persona-encounters` | Pass; 88 tests |
| `npx --yes pnpm@10.32.1 run test:reports` | Pass; 9 tests |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/db build` | Pass |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR530A as a bounded source-only validator repair.
- Migration 087 replaces only the cross-owner consent scope validator, admits exactly the eight current API/type scopes, and leaves historical migrations and product behavior unchanged.
- Validation passed: test:persona-encounters 88/88, test:reports 9/9, API typecheck, and DB build.
Task:
- Close PR530A source repair and route the separate hosted reconciliation/deploy lane for accepted schema migrations 081/082 plus 087 before ARIADNE reruns PR524B.
Verdict:
- ACCEPT_PR530A_CROSS_OWNER_GENERATED_SCOPE_VALIDATOR_REPAIR_SOURCE_ONLY
```
