# PR175 - Phase 2D Observatory Status Note Gate

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews public-boundary scope, payload minimization,
idempotency, and overclaim risk.
Rehearsal: ARIADNE runs hosted desktop/mobile proof if ARGUS accepts visible
owner/public UI.
Status: open for DAEDALUS

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
