# PR173 - Phase 2D Capability Request Triage

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews payload minimization, owner scope, duplicate behavior,
and overclaim risk.
Rehearsal: ARIADNE runs hosted desktop/mobile human rehearsal if ARGUS accepts
visible owner UI.
Status: open for DAEDALUS

## Why This Lane

PR169 introduced `request_capability` as an inert receipt-only planning action.
PR170 through PR172 proved the first real artifact path: save private draft,
review it, then publish it through an explicit owner gate.

The next useful Phase 2D step is to make blocked needs visible and structured.
When the Developer Agent cannot safely proceed because it needs a capability,
configuration, permission, or future lane, it should produce a clear owner
triage request instead of vague error text or accidental user busywork.

This lane should keep the agent honest:

- it may ask for a capability by category and reason;
- it must not collect secret values;
- it must not mutate Railway, Supabase, provider, Stripe, Cloudflare, Redis,
  repository, key, webhook, layout, worker, or runtime state;
- it must not unblock any future action by itself.

## Scope

Implement the narrowest useful capability-request handoff:

- Give `request_capability` a structured, sanitized request shape.
- Use a bounded capability category vocabulary, for example:
  - `provider_config`
  - `cache_config`
  - `cloudflare_adapter`
  - `repo_access`
  - `railway_env`
  - `supabase_schema`
  - `stripe_webhook`
  - `worker_runtime`
  - `human_review`
  - `roadmap_decision`
- Allow a short safe reason/summary, but reject or strip secret-like values,
  URLs with credentials, raw tokens, raw keys, cookies, connection strings,
  service-role keys, JWTs, private event payloads, raw prompts, and provider
  payloads.
- On approved execution, record one minimized `request_capability` receipt with
  the safe category, safe summary, and non-execution boundaries.
- Surface capability-request receipts in a small owner-only triage/readback area
  on the Developer Space manage page.
- Make repeat execution idempotent for the same approved confirmation.
- Keep existing save/review/publish flows green.

## Boundaries

Do not:

- add secret entry fields;
- print or persist secret values;
- create Railway/Supabase/Stripe/Cloudflare/Redis/provider resources;
- call model/provider APIs;
- execute jobs, workers, deploys, repo pushes, webhooks, key rotation, signing
  secret creation, or layout changes;
- add autonomous loops;
- expose capability requests on public/anonymous Developer Space detail;
- claim that a requested capability is available merely because a receipt was
  recorded;
- unblock `read_logs`, `push_to_repo`, `run_job`, `update_observatory`,
  `update_layout`, `rotate_ingestion_key`, or
  `create_webhook_signing_secret`.

This is a planning and triage surface, not a config execution surface.

## Expected Behavior

Owner path:

- Owner can preview `request_capability` with a selected safe category and
  summary.
- Owner can create, approve, and execute the request.
- The owner manage page renders a dedicated capability-request readback with
  the category, safe summary, recorded state, and next-step copy.
- Repeat execution does not duplicate the visible receipt.
- Existing private draft save, Review draft, and selected publish controls keep
  working.

Public path:

- Anonymous/public Developer Space detail does not show capability-request
  receipts, categories, summaries, confirmation copy, or private next-step
  instructions.

Hostile input:

- Secret-shaped strings are rejected, redacted, or omitted before persistence
  and rendering.
- Overlong summaries are truncated safely.
- Unknown capability categories are rejected or normalized to a safe fallback.
- Non-owner and wrong-Space attempts are rejected.

## Validation

DAEDALUS should run focused validation, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if owner UI changes
- `git diff --check`

ARGUS should add hostile review around:

- secret-like input handling;
- owner-only visibility;
- wrong-owner/wrong-Space requests;
- duplicate/idempotent execution;
- receipt payload minimization;
- public leakage;
- overclaiming capability availability;
- save/review/publish regression risk.

ARIADNE should run hosted proof if owner UI changes:

- owner records one safe capability request and sees it in triage;
- hostile secret-looking text does not render or persist visibly;
- anonymous/public detail stays clean;
- mobile owner can read the triage area without horizontal overflow;
- visible text scan finds no UUID-shaped values or secret-shaped strings.

## Next Baton

DAEDALUS should implement PR173, then wake ARGUS with changed files, validation,
payload examples, hostile-input behavior, and remaining risks. ARGUS should wake
ARIADNE if visible UI requires hosted proof; otherwise ARGUS wakes MIMIR with
the verdict.
