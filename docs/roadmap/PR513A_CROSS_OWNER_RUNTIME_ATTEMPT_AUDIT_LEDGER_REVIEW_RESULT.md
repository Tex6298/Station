# PR513A - Cross-Owner Runtime Attempt Audit Ledger ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Reviewed implementation:

- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_DAEDALUS.md`
- `docs/roadmap/PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER_RESULT.md`
- `infra/supabase/migrations/078_persona_encounter_cross_owner_runtime_attempts.sql`
- `packages/db/src/types.ts`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`

Result:

```text
ACCEPT_PR513A_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_LEDGER
```

## Verdict

ARGUS accepts PR513A with a narrow review patch.

DAEDALUS implemented the accepted audit-ledger-only lane: migration `078`, typed
RPC support, API helper shape, participant-only runtime-attempt readback, and
focused tests. The lane stays out of provider-backed preview, prompt assembly,
generated words, token rows, private sessions, public exhibits, reports,
retrieval, UI, package, billing, worker, Redis, Cloudflare, and deployment
scope.

## ARGUS Patch

ARGUS found one audit-honesty gap: the RPC accepted caller-supplied consent
status and scope/version metadata without validating it against the parent
consent row. Since this table is meant to become the durable provenance trail
for cross-owner consent consumption, the database helper must not allow
misstated consent state.

ARGUS patched migration `078` and the in-memory test harness so
`record_persona_encounter_cross_owner_runtime_attempt` now:

- rejects missing consent ids;
- rejects consent status values that do not match the current consent row;
- rejects requested scope version values that do not match the current consent
  row;
- rejects provider-success/failure/empty lifecycle rows unless readiness is
  `ready`, the consent is currently `approved`, the requested scope is
  `run_cross_owner_encounter`, and the consent includes that scope.

The patch adds regression coverage for mismatched status, mismatched version,
invalid readiness code, and provider lifecycle attempts without ready approved
runtime consent.

## Boundary Findings

Accepted:

- migration `078` creates bounded runtime attempt metadata tied to the existing
  cross-owner consent row;
- participant owners can read attempt metadata through the parent consent row;
- no public/nonparticipant read path is created;
- no direct participant insert/update/delete policy is created;
- update/delete triggers keep rows append-only;
- route readback returns bounded metadata and a non-executable consent summary;
- generic consent readback remains `executable: false`;
- provider-backed preview remains blocked.

Still blocked:

- provider-backed cross-owner preview;
- prompt assembly;
- generated words;
- token usage/transactions;
- private cross-owner sessions;
- public exhibits;
- reports;
- memory/canon/archive/continuity/export/jobs/storage/public rows;
- public surfacing;
- UI, package, billing, provider/retrieval, Redis, Cloudflare, worker, webhook,
  deployment, and browser proof scope.

## Next Routing

Because PR513A adds migration `078` and participant-visible API readback, ARGUS
recommends:

```text
PR513B - Cross-Owner Runtime Attempt Audit Hosted Proof
Owner: ARIADNE / A4
```

Hosted proof scope:

- hosted web/API freshness includes PR513A review floor;
- migration `078` is present;
- runtime attempt table/function/RLS policies exist with no public/nonparticipant
  read path;
- owner A/B can read bounded attempt metadata for a consent they participate in;
- nonparticipant gets `404` or empty readback without row inference;
- signed-out gets `401`;
- generic consent readback remains `executable: false`;
- no provider calls, prompts, generated words, token rows, private sessions,
  public exhibits, reports, memory/canon/archive/continuity/export/jobs/storage
  writes, public surfacing, package, billing, provider/retrieval, Redis,
  Cloudflare, worker, webhook, deployment, or UI drift;
- privacy scan contains no raw owner ids, raw persona ids, private prompts,
  private profile fields, provider payloads, generated words, token values,
  traces, SQL details, env values, cookies, bearer values, or secret-shaped
  strings.

Browser proof is not required because PR513A changes no visible UI.

Hosted provider-generation proof is not part of PR513B.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Implementation review | Pass | Reviewed DAEDALUS packet/result, migration `078`, DB types, route/helper/readback code, tests, PR513 preflight, and PR512B hosted context proof. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 48 tests passed, including the ARGUS audit-honesty regression for status/version mismatch and provider lifecycle readiness. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; PR513A adds no visible UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Staged path scan | Pass | Staged changes are limited to migration `078`, persona encounter tests, and PR513A review/status/testing docs. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the staged diff. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
