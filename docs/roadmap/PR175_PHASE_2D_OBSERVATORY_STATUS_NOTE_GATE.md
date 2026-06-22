# PR175 - Phase 2D Observatory Status Note Gate

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews public-boundary scope, payload minimization,
idempotency, and overclaim risk.
Rehearsal: ARIADNE runs hosted desktop/mobile proof if ARGUS accepts visible
owner/public UI.
Status: hosted ARIADNE proof blocked on receipt retry after public event

## Why This Lane

PR174 gave the Developer Agent owner-only sanitized activity readback. The next
safe 2D mutation is not jobs, repository operations, key rotation, or layout
automation. It is a tiny public observatory update that the owner explicitly
approves.

`update_observatory` should mean one sanitized public status note/event in this
lane. It must not become broad observatory control.

## Scope

Implement the narrowest `update_observatory` gate:

- Keep generic `update_observatory` blocked unless it has a selected sanitized
  status-note payload.
- Let an owner preview, create, approve, and execute an `update_observatory`
  confirmation for one public-safe status note.
- On approved execution, create exactly one public Developer Space event/note
  using existing Developer Space event semantics.
- The note/event should carry only safe owner-approved text, safe event type,
  visibility, provenance, and timestamp metadata.
- Record one minimized receipt proving the status-note update ran.
- Make repeat execution idempotent: no duplicate receipt and no duplicate
  public event/note.
- Refresh owner detail after execution so the new public observatory note is
  visible.
- Keep `read_logs`, capability triage, private draft save, Review draft, and
  selected publish behavior green.

## Boundaries

Do not:

- update visual mode, widget layout, public field controls, topology settings,
  ingestion keys, webhook signing secrets, provider config, Railway/Supabase/
  Stripe/Cloudflare/Redis config, repository state, deployments, workers,
  billing, background jobs, or observed-runtime targets;
- publish raw activity-log rows, raw runtime payloads, metrics, snapshots,
  webhook bodies, headers, hashes, delivery ids, request bodies, prompts,
  provider payloads, private archive excerpts, document bodies, owner ids,
  route ids, confirmation ids, receipt ids, document ids, keys, tokens,
  cookies, connection strings, or secret-shaped strings;
- call model/provider APIs;
- auto-select text from raw logs;
- expose private confirmation or receipt details on public/anonymous Developer
  Space detail;
- unblock `push_to_repo`, `run_job`, `update_layout`,
  `rotate_ingestion_key`, or `create_webhook_signing_secret`.

This lane creates a public-safe observatory status note only.

## DAEDALUS Implementation Handoff

Implemented on 2026-06-22.

Changed files:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/types/src/developer-space.ts`
- `scripts/triad-watch.mjs`
- `scripts/triad-wakeups.mjs`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/PR175_PHASE_2D_OBSERVATORY_STATUS_NOTE_GATE.md`
- `docs/testing/VALIDATION_BASELINE.md`

Implementation truth:

- Generic/unselected `update_observatory` remains blocked with
  `requires_future_lane`.
- A selected `statusNote` lets the owner preview, create, approve, and execute
  one `update_observatory` confirmation.
- Status-note creation rejects missing notes, secret-shaped values, and
  sensitive/raw/private/provider fields in the input envelope.
- Approved execution creates one public `developer_agent.status_note`
  Developer Space event with public note text, public category/source labels,
  provenance `user`, visibility `public`, and a private owner-only dedupe key.
- Execution records one minimized owner receipt with the safe note/event
  metadata and no raw ids, preview hash, provider payload, prompt, key, token,
  cookie, environment value, document body, layout/config target, or runtime
  target.
- Repeat execution returns the existing receipt and does not duplicate the
  public event. If receipt insertion fails after event creation, retry uses the
  event dedupe key and still avoids duplicate public notes.
- Owner manage has a bounded status-note textarea for this lane only and
  refreshes Developer Space detail after receipt execution.

Payload examples:

- Confirmation input:
  `{ "action": "update_observatory", "statusNote": "Status note: replay harness is green and ready for public review." }`
- Public event data:
  `{ "statusNote": "...", "category": "observatory_status_note", "source": "owner_confirmed_developer_agent" }`
- Owner receipt payload:
  `{ action: "update_observatory", outcome: "observatory_status_note_published", executionAvailable: true, mutationAvailable: true, externalDispatch: false, statusNote: { note, eventType, eventLabel, visibility: "public", provenance: "user" } }`

Workflow hygiene:

- `scripts/triad-watch.mjs` now supports `--fetch`, `--ref`, and
  `--since`, plus `--no-consume`, so foreground wait can watch `fork/main`
  after the current handoff without mutating an agent state file before the
  wakeup is visible.

## Hosted Blocker And Repair

ARIADNE found a hosted blocker on 2026-06-22:

- Owner preview/create/approve worked.
- First approved execution returned HTTP `500`.
- Direct retry also returned HTTP `500`.
- Public detail had exactly one matching public
  `developer_agent.status_note` event.
- Owner receipts had zero matching `update_observatory` receipts.

DAEDALUS repair:

- Added
  `infra/supabase/migrations/053_developer_space_agent_observatory_status_note_receipts.sql`.
- The migration adds `update_observatory` to the
  `developer_space_agent_execution_receipts.action` check constraint.
- The migration recreates the owner receipt policy to include approved
  `update_observatory` confirmations.
- Updated `packages/db/src/types.ts` so DB receipt action types match app
  receipt behavior.
- Added a focused migration guard to `developer-spaces.test.ts`.

Repair validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 41
  tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/db build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed with CRLF normalization warnings only.

Hosted proof must be rerun after this repair is deployed/applied.

## Expected Behavior

Owner path:

- Owner can preview a sanitized `update_observatory` status note.
- Owner can create and approve the confirmation.
- Approved execution creates one public status note/event and one minimized
  owner-only receipt.
- Repeat execution stays idempotent.
- Owner manage detail refreshes and shows the new public observatory note.

Public path:

- Before execution, public detail does not show the pending note,
  confirmation, receipt, or owner-only next-step copy.
- After execution, public detail may show the legitimate public status note
  through the existing public observatory event/evidence path.
- Public detail must not show private confirmation/receipt metadata or raw ids.

Hostile path:

- Secret-shaped note text is rejected, redacted, or omitted before persistence.
- Overlong note text is bounded.
- Non-owner and wrong-Space attempts are rejected.
- Generic/unselected `update_observatory` remains blocked.

## Validation

DAEDALUS should run focused validation, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if owner/public UI changes
- `git diff --check`

ARGUS should review:

- owner-only confirmation and execution;
- public event/note payload minimization;
- idempotency;
- public detail before/after boundaries;
- generic `update_observatory` staying blocked without selected safe note;
- no layout/config/runtime/infrastructure mutation;
- regression risk across `read_logs`, capability triage, draft save, Review
  draft, and selected publish.

ARIADNE should run hosted proof if accepted:

- owner creates one status note and sees one receipt;
- public detail gains only the legitimate public status note after execution;
- mobile owner/public pages have no horizontal overflow;
- visible text scan finds no UUID-shaped values or secret-shaped strings;
- generic future actions stay visibly blocked.

## Next Baton

DAEDALUS should implement PR175, then wake ARGUS with changed files, validation,
payload examples, public before/after behavior, idempotency proof, and remaining
risks. ARGUS should wake ARIADNE if hosted proof is needed; ARIADNE wakes MIMIR
with the verdict.

## ARIADNE Hosted Browser Blocker - 2026-06-22

ARIADNE started the requested hosted desktop proof after ARGUS accepted the
receipt-label/readback fix.

Deployment identity:

- Web `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/web`, commit `882edabee109`.
- API `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/api`, commit `a53d348a1be1`.
- The web runtime includes the PR175 receipt-label/readback UI fix. The API
  runtime descends from the PR175 app-code patch.

Hosted proof before blocker:

- Replay owner route `/developer-spaces/:slug/manage` loaded on desktop
  `1440x1000`.
- Generic/unselected `update_observatory` preview returned the expected
  selected-status-note requirement.
- Secret-shaped status-note creation was rejected with HTTP `400` and did not
  echo the submitted probe.
- Public Developer Space detail did not show the proof note before execution.
- Owner UI could preview the selected status note, create the confirmation, and
  approve it.

Blocker:

- First approved `update_observatory` execution returned HTTP `500`.
- A direct owner retry of the same approved confirmation also returned HTTP
  `500`.
- Public detail shows exactly one matching `developer_agent.status_note` event,
  so the public event was created.
- Owner receipt list shows zero matching `update_observatory` receipt records.
- Receipt store reports available.

Why this blocks acceptance:

- PR175 requires approved execution to create exactly one public event and one
  minimized owner-only receipt.
- PR175 also requires retry after receipt failure to reuse the public event
  dedupe marker and recover the receipt without duplicating the public note.
- Hosted currently has the public event but no receipt, and retry does not
  recover the receipt.

Verdict:

- ARIADNE does not accept PR175 yet.
- DAEDALUS should repair hosted execution/receipt recovery for
  `update_observatory`, then wake ARGUS and ARIADNE for rerun.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr175-hosted-status-note-proof.spec.js --reporter=line --workers=1`
  failed: approved `update_observatory` execution returned HTTP `500`.
