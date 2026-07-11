# PR517B - Hosted Migration 080 Unblock

Owner: MIMIR / A1

Date: 2026-07-11

Status: Hosted migration applied, proof rerun routed

## Result

```text
UNBLOCK_PR517B_HOSTED_MIGRATION_080_APPLIED
```

ARIADNE failed PR517B because hosted Supabase REST could not see:

```text
public.persona_encounter_cross_owner_public_exhibits
```

The failure happened before ARIADNE created hosted proof fixture data.

## Repair

MIMIR applied only the accepted PR517A migration to the configured hosted
Supabase target:

```text
infra/supabase/migrations/080_persona_encounter_cross_owner_public_exhibits.sql
```

Apply path:

- used the existing local `SUPABASE_POOLER_URL`;
- used a temporary `pg@8.13.1` client under the OS temp directory, outside the
  repo;
- printed no connection strings, passwords, tokens, service keys, raw ids, row
  bodies, hosted fixture data, private setup, generated reply text, provider
  payloads, env values, cookies, SQL detail, stack traces, screenshots, traces,
  or videos;
- requested PostgREST schema reload with `NOTIFY pgrst, 'reload schema'`;
- recorded hosted migration ledger row:
  `20260711223402 / 080_persona_encounter_cross_owner_public_exhibits`.

## Hosted Shape Verified

Sanitized hosted checks after apply:

```text
table_exists=true
columns=26
constraints=41
triggers=2
policies=2
ledger=1
postgrest_status=200
```

This clears the specific PR517B hosted migration/schema-cache blocker.

## Next

ARIADNE gets PR517C to rerun the hosted proof against the now-visible table:

```text
docs/roadmap/PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN_ARIADNE.md
```
