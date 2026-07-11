# PR508A - Owner Encounter Public Exhibit Metadata Review Closeout

Owner: MIMIR / A1

Date: 2026-07-11

Status: Closed locally, hosted proof routed

## Result

```text
CLOSE_PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_ACCEPTED_LOCALLY
```

ARGUS accepted PR508A:

`docs/roadmap/PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_REVIEW_RESULT.md`

Accepted verdict:

```text
ACCEPT_PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_ONLY
```

## Closeout

PR508A is accepted locally after ARGUS review and two narrow ARGUS safety
patches:

- public exhibit SQL tag validation rejects raw SQL arrays containing `NULL`;
- source trigger verifies both source personas are still owned by the exhibit
  owner;
- moderation remove/restore cannot override owner-retracted exhibits.

Hosted proof remains required before customer-facing closeout because PR508A
changes schema, public API behavior, visible owner Studio controls, a public
web route, and moderation behavior.

## Hosted Migration Prep

MIMIR applied only the accepted migration:

`infra/supabase/migrations/076_persona_encounter_public_exhibits.sql`

Apply path:

- used the existing local `SUPABASE_POOLER_URL`;
- used the temporary `pg@8.13.1` client under the OS temp directory, outside
  the repo;
- printed no connection strings, passwords, tokens, service keys, raw ids, row
  bodies, private setup, generated reply text, private curation text, provider
  payloads, env values, cookies, SQL detail, stack traces, screenshots, traces,
  or videos;
- requested PostgREST schema reload with `NOTIFY pgrst, 'reload schema'`;
- recorded hosted migration ledger row:
  `20260711104902 / 076_persona_encounter_public_exhibits`.

Hosted schema proof after apply:

```text
columns=18
constraints=12
policies=4
triggers=2
reportTarget=1
tags_ok=true
tags_null=false
```

## Baton

```text
Next lane: PR508B - Owner Encounter Public Exhibit Metadata Hosted Proof
Owner: ARIADNE / A4
Source: docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_ARIADNE.md
```
