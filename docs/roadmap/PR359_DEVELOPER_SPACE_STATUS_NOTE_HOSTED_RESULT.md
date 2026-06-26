# PR359 - Developer Space Status Note Hosted Proof Result

Owner: ARIADNE

Date: 2026-06-26

Verdict: FAIL

## Scope

ARIADNE ran the bounded hosted status-note proof on Railway.

Target:

```text
https://stationweb-production.up.railway.app
```

Routes:

```text
/developer-spaces/station-replay-dev-alpha
/developer-spaces/station-replay-dev-alpha/manage
```

Credential values, cookies, auth values, authorization header values, raw owner IDs, private payloads, hosted logs, SQL, provider payloads, prompts, completions, Stripe IDs, raw trace bodies, ingestion keys, receipt IDs, confirmation IDs, preview hashes, and secret-shaped values were not committed or summarized.

## Before Mutation

The public Developer Space route loaded successfully.

- `Project notes` was visible.
- `Status note` rows: 0.
- `Field log / update` rows: 2.
- Methodology and finding documents remained in the evidence path.
- Arbitrary runtime event text remained out of `Project notes`.
- No raw JSON, raw UUID-like values, receipt IDs, confirmation IDs, preview hashes, or secret-shaped values were visible.
- No document-level horizontal overflow was detected.

Because no public `Status note` row was visible, the lane's one scoped staging mutation was needed.

## Allowed Mutation Attempt

ARIADNE signed in as the replay owner and used the existing owner manage UI only.

- The manage route loaded.
- Exactly one `Publish status note` control was available.
- ARIADNE clicked that control exactly once.
- No ingestion key, evidence, widget, visual mode, export, billing, account, live data, Developer Agent run-job, or unrelated action was used.
- One owner UI mutation request was observed for the status-note publish action. The raw request path is not recorded here because it contains private route identifiers.

No second status-note action was attempted.

## After Mutation

Repeated public checks still did not show a `Status note` row in `Project notes`.

Desktop public route:

- `Project notes` remained visible.
- `Status note` rows: 0.
- `Field log / update` rows: 2.
- Methodology and finding documents remained in the evidence path.
- Arbitrary runtime event text remained out of `Project notes`.
- No raw JSON, raw UUID-like values, receipt IDs, confirmation IDs, preview hashes, or secret-shaped values were visible.
- No document-level horizontal overflow was detected.

Mobile public route at 375px:

- `Project notes` remained visible.
- `Status note` rows: 0.
- `Field log / update` rows: 2.
- No document-level horizontal overflow, clipped primary content, overlapping text, or trapped controls were detected.

## Defect

The existing owner-approved status-note flow did not produce a visible public `Status note` row in the hosted `Project notes` widget after the one allowed owner UI action.

Smallest repair scope:

- Inspect the owner manage `Publish status note` path for `/developer-spaces/station-replay-dev-alpha/manage`.
- Confirm whether it creates a public `developer_agent.status_note` event with the fields expected by `developerSpaceProjectUpdates()`.
- Confirm the public Developer Space detail response includes the new public status-note event without exposing receipt IDs, confirmation IDs, preview hashes, private owner IDs, raw JSON, or secret-shaped values.
- Confirm `/developer-spaces/station-replay-dev-alpha` renders that event as a `Status note` row in `Project notes`.

Do not broaden into evidence authoring, widgets, ingestion keys, live runtime, billing, account, provider, queue, worker, schema, migration, Railway, or Supabase work unless the defect proves one of those is the smallest necessary fix.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr359-status-note-hosted.spec.js --reporter=line --workers=1` - passed as a harness run, but produced verdict `FAIL`.
- Follow-up verification-only public checks repeated the public route without additional mutation and still found 0 `Status note` rows.
- `git diff --check` - passed.
