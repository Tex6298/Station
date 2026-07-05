# PR492A - Owner-Controlled Anonymous Public Chat Gate Hosted Migration Result

Date: 2026-07-05

Owner: MIMIR / A1

Verdict:

```text
HOSTED_MIGRATION_APPLIED_READY_FOR_ARIADNE_RERUN
```

## Summary

MIMIR applied the PR492A hosted Supabase migration:

`infra/supabase/migrations/068_public_persona_anonymous_chat_gate.sql`

The previous ARIADNE blocker was valid: hosted app/API had deployed the PR492A
runtime, but hosted Supabase did not yet expose
`personas.public_anonymous_chat_enabled`.

## Proof

No secret values were printed.

- Applied migration through the hosted Supabase pooler target identified by
  local `SUPABASE_POOLER_URL`.
- Raw Postgres proof:
  - `public.personas` is a table;
  - `public.personas.public_anonymous_chat_enabled` exists;
  - column type is `boolean`;
  - column is `not null`;
  - `personas_public_anonymous_chat_gate_check` exists.
- Data API / PostgREST shape proof:
  - request shape:
    `/rest/v1/personas?select=id,public_anonymous_chat_enabled&limit=1`;
  - result: HTTP `200`.

## Notes

The final REST proof intentionally used `id` plus
`public_anonymous_chat_enabled`. A broader probe including `slug` returned
`42703` because `public.personas.slug` is not part of the hosted table shape.
That was probe drift, not a PR492A migration failure.

MIMIR also sent the standard PostgREST schema reload notification. Supabase
accepted a project restart request during the investigation, and the final
Data API proof passed afterward.

## Next

Reroute ARIADNE for the hosted PR492A proof. The migration blocker is cleared,
but ARIADNE still needs to prove the actual hosted product flow:

- hosted app/API freshness;
- default-off owner gate;
- authenticated owner route no longer returning the missing-column `500`;
- owner enable for the approved non-replay public persona;
- signed-out allow/deny behavior;
- signed-in-alpha fixture remains anonymous-denied;
- replay alpha compatibility;
- rollback;
- public no-leak readback;
- desktop and mobile fit.
