# PR174 - Phase 2D Sanitized Activity Log Readback

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, payload minimization, source boundaries,
and overclaim risk.
Rehearsal: ARIADNE runs hosted desktop/mobile proof if ARGUS accepts visible
owner UI.
Status: open for DAEDALUS

## Why This Lane

The Phase 2D Developer Agent can now save, review, publish, and record
capability requests through explicit owner gates. The next safe step is better
operator awareness, not more execution.

`read_logs` is already registered as future vocabulary, but raw logs are too
dangerous. This lane should make it a bounded owner-only read action that
summarizes recent Developer Space activity without exposing raw payloads or
touching infrastructure log providers.

## Scope

Implement the narrowest sanitized activity readback:

- Move `read_logs` from blocked future vocabulary into a safe owner-only read
  action, or add the smallest compatible action plumbing that preserves the
  existing vocabulary.
- Return recent sanitized activity rows from existing Station data only, such
  as:
  - Developer Space evidence/document changes;
  - observed-runtime event labels/statuses/counts;
  - webhook receipt status categories;
  - Developer Agent confirmations/receipts;
  - capability-request, draft-save, and publish-gate receipts.
- Each row should use safe labels, categories, timestamps, status, visibility,
  and counts only.
- Keep rows bounded in number and ordered predictably.
- Render the readback through the owner Developer Agent preview/readback
  surface if web changes are needed.
- Keep save/review/publish/capability triage behavior green.

## Boundaries

Do not:

- read Railway, Supabase, provider, Cloudflare, Redis, operating-system, CI, or
  container raw logs;
- expose raw `event_data`, `metrics`, `snapshot_data`, classified payloads,
  webhook bodies, request bodies, headers, IP addresses, auth claims, cookies,
  tokens, keys, connection strings, service-role values, JWTs, provider
  payloads, raw prompts, private archive excerpts, document bodies, owner ids,
  confirmation ids, receipt ids, document ids, or route-only ids;
- add external log integrations;
- call model/provider APIs;
- mutate documents, evidence, layout, keys, signing secrets, repo, deploy,
  workers, billing, webhooks, Redis, Cloudflare, Railway, Supabase config, or
  observed-runtime targets;
- expose activity readback on public/anonymous Developer Space detail;
- unblock `push_to_repo`, `run_job`, `update_observatory`, `update_layout`,
  `rotate_ingestion_key`, or `create_webhook_signing_secret`.

This lane is a sanitized internal activity digest, not raw logging and not an
execution permission.

## Expected Behavior

Owner path:

- Owner can preview `read_logs` from a Developer Space they own/administer.
- Response contains a bounded list of sanitized activity rows with safe source,
  category, label, status, visibility, and timestamp fields.
- Response copy makes clear that raw logs and private payloads are not shown.
- Empty state is explicit and non-alarming.
- Existing agent flows still work: capability triage, private draft save, Review
  draft, selected publish, and generic future-action blocking.

Hostile path:

- Non-owner and wrong-Space access is rejected.
- Visible owner UI does not render UUID-shaped values or secret-shaped strings.
- Secret-like source labels or summaries are redacted, omitted, or replaced with
  safe categories.

Public path:

- Anonymous/public Developer Space detail does not expose sanitized owner
  activity readback, private confirmation/receipt state, or owner-only
  next-step copy.

## Validation

DAEDALUS should run focused validation, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if owner UI changes
- `git diff --check`

ARGUS should review:

- no raw-log provider or infrastructure dependency was added;
- owner-only authorization and wrong-Space rejection;
- payload minimization across activity sources;
- visible raw-id and secret-shaped string risk;
- public boundary cleanliness;
- save/review/publish/capability regression risk;
- no other future action was unblocked.

ARIADNE should run hosted proof if visible UI changes:

- owner previews sanitized activity readback and sees bounded safe rows or the
  empty state;
- public detail stays clean;
- mobile owner readback has no horizontal overflow;
- visible text scan finds no UUID-shaped values or secret-shaped strings;
- save/review/publish/capability controls still read as expected.

## Next Baton

DAEDALUS should implement PR174, then wake ARGUS with changed files, validation,
source list, sample sanitized rows, proof of omitted raw fields, and remaining
risks. ARGUS should wake ARIADNE if visible UI needs hosted proof; otherwise
ARGUS wakes MIMIR with the verdict.
