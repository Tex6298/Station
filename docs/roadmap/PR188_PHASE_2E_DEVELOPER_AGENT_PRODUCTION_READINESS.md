# PR188 - Phase 2E Developer Agent Production Readiness

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS
Rehearsal: ARIADNE only if DAEDALUS changes visible owner/public flows.
Status: closed by MIMIR after ARGUS acceptance.

## Why This Lane

Phase 2D made the Developer Agent real enough for protected-alpha use. It did
not make every registered tool production-ready.

2D closed with:

- safe owner readbacks;
- confirmation envelopes;
- non-external capability receipts;
- private draft save;
- selected draft publish;
- sanitized activity readback;
- selected public observatory status note;
- five risky future actions still blocked after owner approval.

After PR176, the correct next step was a protected-alpha human rehearsal. That
has now happened and did not identify a blocking product defect. So the next
mission step is Phase 2E: decide what it takes to graduate Developer Agent from
bounded protected-alpha to production-ready behavior without unlocking dangerous
tools by inertia.

## Phase 2E Question

Answer this directly:

> Which Developer Agent actions are production-capable now, which remain
> protected-alpha only, which must stay blocked, and which single production
> hardening lane should open first?

## DAEDALUS Task

Create a production-readiness packet covering every Developer Agent action:

- `read_developer_space_brief`
- `read_observed_runtime_status`
- `read_provider_policy_posture`
- `read_evidence_path`
- `read_logs`
- `draft_project_update`
- `request_capability`
- `save_project_update_draft`
- `publish_to_page`
- `update_observatory`
- `update_layout`
- `push_to_repo`
- `run_job`
- `rotate_ingestion_key`
- `create_webhook_signing_secret`

For each action, classify:

- `prod-capable now`
- `protected-alpha only`
- `blocked until Phase 2E hardening`
- `blocked beyond Phase 2E`

For each classification, record:

- current implementation truth;
- owner-confirmation and audit requirements;
- data/private payload exposure risk;
- external side-effect risk;
- idempotency and rollback posture;
- tests already present;
- exact missing proof before production.

## Candidate 2E Implementation Slices

DAEDALUS should recommend exactly one first implementation slice. Candidate
directions:

- production audit log and receipt export hardening;
- owner-confirmed layout suggestion gate, still no direct layout mutation;
- background-job dry-run/readiness gate, still no worker execution;
- repo-push planning packet only, still no push;
- key-rotation rehearsal packet only, still no key mutation;
- webhook-signing-secret design packet only, still no secret creation.

The recommendation should prefer the slice that improves real production
trust most while adding the least irreversible external power.

## Boundaries

Do not:

- mark all Developer Agent tools production-ready because Phase 2D passed;
- open repo push, shell, deployment, worker execution, key rotation, signing
  secret creation, Cloudflare, Redis, provider, billing, Railway, or Supabase
  config mutation in this audit lane;
- weaken owner scoping, confirmation, idempotency, or minimized receipt rules;
- treat user approval alone as enough for external side effects.

Allowed:

- docs and focused tests proving current production-readiness claims;
- small guard repairs if a production-readiness claim is false;
- a recommended first 2E implementation lane with scope and validation.

## Expected Output

Update:

- this file;
- `docs/roadmap/ACTIVE_STATUS.md`;
- `docs/roadmap/STATION_FUTURE_LANES.md` if the 2E status changes;
- `docs/testing/VALIDATION_BASELINE.md` only if validation truth changes.

Wake ARGUS if docs/tests/code change. Wake MIMIR directly only if no patch is
needed and the packet is verdict-only.

## Validation

Minimum:

- `git diff --check`

If touching Developer Agent guards:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- targeted route/service tests for the touched action family

If touching web helpers:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client`

If touching TypeScript:

- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck`

## DAEDALUS Production-Readiness Packet - 2026-06-23

Verdict: Phase 2E should not unlock new external powers first. The safest first
production-readiness slice is production audit-log and receipt export hardening
for the already-implemented owner-confirmed receipt paths.

### Classification Summary

| Action | Classification |
| --- | --- |
| `read_developer_space_brief` | prod-capable now |
| `read_observed_runtime_status` | prod-capable now |
| `read_provider_policy_posture` | prod-capable now |
| `read_evidence_path` | prod-capable now |
| `read_logs` | prod-capable now |
| `draft_project_update` | prod-capable now as preview-only |
| `request_capability` | protected-alpha only |
| `save_project_update_draft` | protected-alpha only |
| `publish_to_page` | protected-alpha only |
| `update_observatory` | protected-alpha only |
| `update_layout` | blocked until Phase 2E hardening |
| `run_job` | blocked until Phase 2E hardening |
| `push_to_repo` | blocked beyond Phase 2E |
| `rotate_ingestion_key` | blocked beyond Phase 2E |
| `create_webhook_signing_secret` | blocked beyond Phase 2E |

### Action Readiness Details

| Action | Current implementation truth | Confirmation and audit | Data/private payload risk | External side-effect and rollback posture | Tests already present | Missing proof before production |
| --- | --- | --- | --- | --- | --- | --- |
| `read_developer_space_brief` | Owner-only safe preview of Space posture, counts, and route hints. | No confirmation; action registry is owner-gated. | Low; no raw payloads or provider calls. | None; read-only. | Developer Agent preview tests cover owner-only access and hidden raw values. | None beyond keeping owner gating and preview sanitization in regression coverage. |
| `read_observed_runtime_status` | Owner-only counts, timestamps, labels, and bounded runtime status. | No confirmation; action registry is owner-gated. | Low; raw metrics and payloads are omitted. | None; read-only. | Developer Agent preview tests cover safe runtime readback. | None beyond continued sanitization regression coverage. |
| `read_provider_policy_posture` | Owner-only provider/privacy posture preview; no provider execution. | No confirmation; action registry is owner-gated. | Low; exposes policy posture, not keys or payloads. | None; read-only. | Developer Agent preview tests cover safe action registry/readback shape. | None beyond continued proof that provider keys and payloads stay absent. |
| `read_evidence_path` | Owner-only evidence titles, roles, publication states, and visibility without document bodies. | No confirmation; action registry is owner-gated. | Low; body text and raw ids are omitted/redacted. | None; read-only. | Developer Agent preview tests cover redaction and no private body leakage. | None beyond continued body/id redaction coverage. |
| `read_logs` | Owner-only sanitized activity readback from existing Station rows. | No confirmation; activity is readback only. | Medium-low; reads operational rows but explicitly omits raw logs, webhook bodies, payload hashes, prompts, provider payloads, ids, cookies, keys, tokens, and connection strings. | None; read-only. | PR174 tests and hosted proof cover owner-only readback, public cleanliness, omitted raw fields, and mobile readback. | None for production readback; keep the 14-row bounded/newest-first posture unless product asks for export/search. |
| `draft_project_update` | Owner preview text generated from safe counts and labels only. | Registry says confirmation is required, but the API rejects durable confirmation for allowed preview actions with `developer_space_agent_confirmation_not_required`. | Medium-low; can shape owner copy, but uses safe route-generated readback and stores nothing. | None; preview-only, no persistence or publication. | Preview tests cover draft preview, no AI trace/provider call, and no private prompt/key leakage. | Keep production claim scoped to preview-only; durable draft save remains `save_project_update_draft`. |
| `request_capability` | Owner-confirmed non-external planning receipt with bounded category and safe summary. | Requires owner confirmation, approval, receipt write, minimized owner receipt, and idempotent repeat. | Medium; owner-provided summary can contain sensitive intent, so secret-shaped input is rejected and public detail stays clean. | No external dispatch; no mutation beyond owner-only confirmation/receipt rows. Idempotent repeat returns existing receipt. | PR173 tests and hosted proof cover secret rejection, owner scoping, receipt minimization, public cleanliness, and idempotency. | Production audit/export proof for receipts, retention/deletion policy, and operator review workflow. |
| `save_project_update_draft` | Owner-confirmed execution saves one private draft document plus owner-only Developer Space link. | Requires owner confirmation, approval, execution receipt, and owner receipt readback. | Medium; private draft content is route-generated and document body stays in the private document row, not receipt payload. | Private Station mutation only; no public publication or external dispatch. Repeat is idempotent. | PR170/PR171 tests and hosted proof cover private draft save, public hiding, receipt write, and idempotency. | Production audit/export proof for receipts and saved artifacts, plus retention/deletion/readback policy. |
| `publish_to_page` | Owner-confirmed public mutation for an explicitly selected owner-reviewed private draft linked to the same Developer Space. | Requires selected eligible target, owner confirmation, approval, receipt write, public readback. | High; publishes previously private content. Payload omits body, target id, confirmation id, and owner id. | Public Station mutation only; no external dispatch. Receipt insert failure triggers rollback to draft/private owner link. Repeat is idempotent. | PR172 tests and hosted proof cover target eligibility, non-owner blocks, tamper mismatch, rollback, public cleanliness, minimized receipt, and idempotency. | Production audit-log/export hardening, clearer rollback/readback evidence, deletion/unpublish policy, and operator-facing receipt reconciliation. |
| `update_observatory` | Owner-confirmed public status-note event with selected sanitized note only. | Requires selected note, owner confirmation, approval, receipt write, public event readback. | High; publishes public note text. Secret-shaped notes/input are rejected; private dedupe/receipt fields stay owner-only. | Public Station event mutation only; no external dispatch. Event/receipt retry is idempotent, including event-created/no-receipt repair. | PR175 tests and hosted proof cover hostile note rejection, public cleanliness, receipt failure retry, idempotency, and migration `053`. | Production audit-log/export hardening, retention/deletion/readback policy, and operator-facing receipt reconciliation. |
| `update_layout` | Preview/confirmation can record owner intent only; approved execute is blocked. | Owner confirmation can be recorded, but `executionAvailable` and `mutationAvailable` are false. | Medium; owner intent may include layout details, sanitized before persistence. | No layout/config mutation; approved execute returns `developer_space_agent_execution_action_blocked`; no receipt. | PR176 risky-action guard proves no visual config or visibility change. | Phase 2E layout-suggestion design: suggestion-only artifact, no direct mutation, explicit diff/readback, rollback story, and ARIADNE route review. |
| `run_job` | Preview/confirmation can record owner intent only; approved execute is blocked. | Owner confirmation can be recorded, but `executionAvailable` and `mutationAvailable` are false. | Medium-high; job intent can include commands/private details, sanitized before persistence. | No job/worker/provider execution; no receipt. | PR176 risky-action guard proves no AI trace/job/worker side effects. | Phase 2E dry-run/readiness packet only: no worker execution until job target, idempotency, status readback, timeout, retry, and audit semantics are proven. |
| `push_to_repo` | Preview/confirmation can record owner intent only; approved execute is blocked. | Owner confirmation can be recorded, but `executionAvailable` and `mutationAvailable` are false. | High; repo intent can expose code/secret context if not tightly summarized. | No repo write, branch, commit, PR, shell, or deploy action; no receipt. | PR176 risky-action guard proves no side effects. | Actual repo push is beyond Phase 2E. A future planning packet may describe repo intent only, with no push, after audit/export hardening lands. |
| `rotate_ingestion_key` | Preview/confirmation/cancel paths record owner intent only; approved execute is blocked. | Owner confirmation can be recorded, but `executionAvailable` and `mutationAvailable` are false. | High; key lifecycle touches credentials and operational access. | No key mutation, no new key, no revocation, no receipt. | PR176 risky-action guard proves no ingestion key mutation. | Actual key rotation is beyond Phase 2E. Needs dedicated key lifecycle design, recovery, audit, user warning, and rollback/dual-key period. |
| `create_webhook_signing_secret` | Preview/confirmation paths record owner intent only; approved execute is blocked. | Owner confirmation can be recorded, but `executionAvailable` and `mutationAvailable` are false. | High; creates credential material and webhook trust boundary. | No signing-secret creation, storage, display, or receipt. | PR176 risky-action guard proves no signing secret mutation. | Actual secret creation is beyond Phase 2E. Needs secret storage/display-once policy, rotation/revocation, audit, and webhook verification rollout. |

### First Phase 2E Implementation Slice

Recommendation: open `PR189 - Developer Agent production audit and receipt
export hardening`.

Scope:

- Add an owner-facing audit/export packet for Developer Agent confirmations and
  execution receipts.
- Cover `request_capability`, `save_project_update_draft`, `publish_to_page`,
  and `update_observatory` receipts.
- Keep safe previews read-only.
- Keep `update_layout`, `push_to_repo`, `run_job`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret` blocked.
- Do not add repo push, job execution, key rotation, signing-secret creation,
  provider call, worker, Cloudflare, Redis, Railway, Supabase config, billing,
  or layout mutation.

Why this first:

- It improves production trust for the four already-implemented
  owner-confirmed receipt paths before adding any new power.
- It strengthens owner review, exportability, auditability, and reconciliation
  around actions that already write Station state.
- It avoids irreversible external side effects.
- It gives ARGUS a concrete hostile-review surface: owner scoping, minimized
  payloads, retention/deletion/export semantics, and public cleanliness.

Suggested validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces`
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` if owner UI
  helpers change.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` if API types
  change.
- `git diff --check`

### Validation

- `git diff --check` passed for this docs-only packet.

## ARGUS Verdict - 2026-06-23

Verdict: accepted with a narrow docs correction.

Accepted production-readiness classification:

- Production-capable now: safe readbacks plus preview-only
  `draft_project_update`.
- Protected-alpha pending audit/export hardening:
  `request_capability`, `save_project_update_draft`, `publish_to_page`, and
  `update_observatory`.
- Blocked pending Phase 2E hardening: `update_layout` and `run_job`.
- Blocked beyond Phase 2E: `push_to_repo`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret`.

ARGUS review patch aligned `STATION_FUTURE_LANES.md` so repo push, key
rotation, and signing-secret creation are not described as unblockable by
ordinary Phase 2E hardening.

ARGUS validation:

- code spot-check of Developer Agent registry, executable-action set, and
  receipt payloads
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed 42/42
- `git diff --check`
- `git diff --cached --check`
- credential-shaped diff scans clean

## MIMIR Closeout - 2026-06-23

MIMIR accepts ARGUS's PR188 verdict and closes the Phase 2E readiness packet.

The first implementation lane is PR189: Developer Agent production audit and
receipt export hardening for the existing owner-confirmed receipt paths.
