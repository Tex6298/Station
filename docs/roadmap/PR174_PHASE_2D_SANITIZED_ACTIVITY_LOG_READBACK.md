# PR174 - Phase 2D Sanitized Activity Log Readback

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, payload minimization, source boundaries,
and overclaim risk.
Rehearsal: ARIADNE runs hosted desktop/mobile proof if ARGUS accepts visible
owner UI.
Status: implemented by DAEDALUS; open for ARGUS review

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

DAEDALUS implemented PR174 on 2026-06-22.

Changed files:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `packages/types/src/developer-space.ts`

Implementation details:

- `read_logs` moved from blocked future vocabulary into the owner-only safe
  read action list.
- The action is served through the existing owner-scoped Developer Agent
  preview route; anonymous and non-owner access stays blocked before activity
  data is loaded.
- The readback uses existing Station rows only and does not query raw
  infrastructure logs or external log providers.
- Rows are bounded, sorted newest first, and serialized through the existing
  Developer Agent preview section/item shape.

Source list:

- `developer_space_documents` safe linked evidence metadata.
- `developer_space_events` safe event label/type/visibility/provenance.
- `developer_space_nodes` safe node label/topology/fragment count.
- `developer_space_snapshots` safe snapshot visibility/provenance/timestamp.
- `developer_space_observed_runtime_context` safe context type/provenance only.
- `developer_space_observed_runtime_webhook_receipts` status category only.
- `developer_space_agent_confirmations` action/status/timestamp only.
- `developer_space_agent_execution_receipts` action/status/timestamp only.

Sample sanitized rows:

- `Runtime event: <safe label>` with source `developer_space_events`,
  category `observed_runtime_event`, event type, visibility, provenance,
  status, and timestamp.
- `Runtime node: <safe label>` with source `developer_space_nodes`, category
  `observed_runtime_node`, topology, fragment count, status, and timestamp.
- `Observed runtime webhook receipt` with source
  `developer_space_observed_runtime_webhook_receipts`, category
  `webhook_receipt`, response status, and timestamp; delivery id and payload
  hash are omitted.
- `Developer Agent confirmation: request_capability` with source
  `developer_space_agent_confirmations`, category
  `developer_agent_confirmation`, action/status/timestamp only.

Omitted-field proof:

- Focused tests seed raw UUID-shaped ids, raw node/event/snapshot/context
  payloads, raw metrics, private source refs, private document body text,
  webhook delivery id, webhook payload hash, webhook response payload,
  confirmation preview hash, sanitized payload summary, receipt confirmation
  id, receipt summary, receipt payload summary, and receipt token-like text.
- The `read_logs` preview response is asserted not to contain those values.
- The response carries explicit omitted-field copy for raw infrastructure logs,
  raw runtime payloads, webhook bodies/headers/hashes/delivery ids, document
  bodies, prompts, provider payloads, private archive excerpts, owner ids,
  route ids, keys, tokens, cookies, and connection strings.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 39
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `git diff --check` passed with CRLF warnings only.

ARGUS should review owner scope, source boundaries, payload minimization,
public leakage, visible raw-id/secret risk, no external log-provider dependency,
and save/review/publish/capability regression risk. Because owner-visible
action vocabulary changed, ARGUS should wake ARIADNE for hosted proof if
accepted.
