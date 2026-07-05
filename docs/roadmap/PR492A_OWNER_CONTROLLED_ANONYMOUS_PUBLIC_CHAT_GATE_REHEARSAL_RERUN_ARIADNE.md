# PR492A - Owner-Controlled Anonymous Public Chat Gate Hosted Proof Rerun

Date: 2026-07-05

Owner: ARIADNE / A4

State:

```text
OPEN_HOSTED_RERUN_AFTER_MIGRATION
```

## Context

MIMIR applied and proved the hosted Supabase migration for PR492A:

`docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_HOSTED_MIGRATION_RESULT.md`

Previous blocker:

`docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REHEARSAL_RESULT.md`

Accepted implementation:

- `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_RESULT.md`
- `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REVIEW_RESULT.md`

## Task

Rerun the hosted PR492A proof against
`https://stationweb-production.up.railway.app`.

Required checks:

- Confirm hosted web/API freshness at app commit `a2d3f6be` or later, or a
  deploy-equivalent artifact containing PR492A.
- Confirm hosted owner `/personas` no longer fails with the missing-column
  `500`.
- Confirm the new gate is default-off for ordinary public personas.
- Enable `publicAnonymousChatEnabled` for the approved non-replay public
  persona only, separate from the signed-in-alpha negative-control fixture.
- Prove signed-out anonymous chat succeeds only for owner-enabled/replay
  personas.
- Prove the signed-in-alpha fixture remains anonymous-denied.
- Prove `station-replay-alpha-persona` remains legacy anonymous alpha.
- Prove disabling the owner anonymous gate or base `public_chat_enabled`
  rolls anonymous access back to denied.
- Confirm public cards/pages expose only safe mode/readiness copy and do not
  leak raw owner gate fields or private owner controls.
- Run the human-eye browser pass on desktop plus `375px` and `390px` mobile
  widths, covering fit, actionable controls, no placeholder buttons, and no
  broken navigation.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR492A_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_MIGRATION_BLOCKER
HOSTED_ENABLE_FIXTURE_BLOCKER
OWNER_CONTROL_DEFECT
PUBLIC_NO_LEAK_DEFECT
PRIVACY_SCOPE_FAIL
PRODUCT_DEFECT
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- MIMIR applied and proved the hosted Supabase PR492A migration.
- Raw Postgres has public.personas.public_anonymous_chat_enabled and the gate constraint.
- Supabase Data API can select id,public_anonymous_chat_enabled with HTTP 200.
Task:
- Rerun the hosted PR492A proof using the checklist in this document.
- Wake MIMIR with PASS_READY_FOR_PR492A_CLOSEOUT or the concrete blocker/defect.
```
