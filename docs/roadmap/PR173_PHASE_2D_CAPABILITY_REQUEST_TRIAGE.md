# PR173 - Phase 2D Capability Request Triage

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews payload minimization, owner scope, duplicate behavior,
and overclaim risk.
Rehearsal: ARIADNE runs hosted desktop/mobile human rehearsal if ARGUS accepts
visible owner UI.
Status: accepted by ARGUS; ARIADNE hosted proof passed; ready for MIMIR closeout

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

DAEDALUS implemented PR173 on 2026-06-22.

Changed files:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/types/src/developer-space.ts`

Implementation details:

- `request_capability` confirmations now require a bounded category and a short
  safe summary.
- Supported categories are `provider_config`, `cache_config`,
  `cloudflare_adapter`, `repo_access`, `railway_env`, `supabase_schema`,
  `stripe_webhook`, `worker_runtime`, `human_review`, and
  `roadmap_decision`.
- Confirmation and receipt payloads store only safe triage metadata:
  category, category label, summary, non-execution next step, and boundaries.
- Approved execution records one minimized `request_capability` receipt with
  `executionAvailable: false`, `mutationAvailable: false`, and
  `externalDispatch: false`.
- Repeat execution remains idempotent for the same confirmation.
- Owner manage renders a small owner-only `Capability triage` readback sourced
  from receipt records.
- Public Developer Space detail remains clean and does not expose capability
  request receipts, categories, summaries, confirmation copy, or private
  next-step instructions.

Payload examples:

- Safe create body:
  `{ action: "request_capability", capabilityCategory: "provider_config",
  capabilitySummary: "Need hosted provider configuration reviewed before
  opening an implementation lane." }`
- Minimized receipt payload:
  `{ action: "request_capability", outcome: "capability_request_recorded",
  executionAvailable: false, mutationAvailable: false,
  externalDispatch: false, capabilityRequest: { category, categoryLabel,
  summary } }`

Hostile-input behavior:

- Secret-shaped input keys such as token, secret, password, cookie,
  authorization, service-role, API-key, private-key, connection-string,
  database URL, pooler, raw prompt, and provider payload are rejected.
- Secret-shaped values such as bearer strings, `sk-...` keys, JWT-looking
  values, connection strings, service-role labels, PEM material, and
  `token=`/`password=`/`cookie=` style values are rejected before persistence.
- Focused API coverage proves rejected secret-looking input does not echo the
  submitted secret-looking strings.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 39
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `git diff --check` passed with CRLF warnings only.

ARGUS should review changed files, payload minimization, hostile-input
handling, owner-only visibility, public leakage, idempotency, overclaiming, and
save/review/publish regression risk. Because owner UI changed, ARGUS should
wake ARIADNE for hosted proof if accepted.

## ARGUS Review Acceptance - 2026-06-22

ARGUS accepted PR173 after a narrow hostile-input hardening patch.

Accepted review truth:

- `request_capability` rejects a repo-standard set of secret-shaped values,
  including webhook-like probes, authorization-token probes, credentialed URLs,
  PAT-shaped strings, UUID-shaped ids, private prompt/payload labels, and
  connection strings.
- Rejected sensitive input keys return a generic bounded error rather than
  echoing submitted probe names.
- The route remains a planning/triage receipt path only. It records minimized
  capability metadata with `executionAvailable: false`,
  `mutationAvailable: false`, and `externalDispatch: false`.
- Public Developer Space detail does not receive capability categories,
  summaries, confirmations, receipts, or private next-step copy.
- Save draft, Review draft, and selected publish behavior remain covered and
  unchanged.

## ARIADNE Hosted Browser Acceptance - 2026-06-22

ARIADNE ran the requested hosted desktop/mobile capability-triage proof after
ARGUS accepted the boundary.

Deployment identity:

- Web `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/web`, commit `4b0064596c0f`.
- API `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/api`, commit `9f4147cfd544`.
- The web runtime is the PR173 app-code patch. The API runtime descends from
  that patch and includes the A4 wakeup-consumption commit.

Hosted owner proof:

- Replay owner route `/developer-spaces/:slug/manage` loaded on desktop
  `1440x1000`.
- Developer Agent preview, future-lane vocabulary, confirmation records,
  capability triage, and receipts rendered without setup-unavailable copy or
  generic load-failure copy.
- A safe `request_capability` preview accepted category `provider_config` and
  a bounded summary.
- Confirmation create returned HTTP `201` with `executionAvailable: false` and
  a sanitized capability payload.
- Approval returned HTTP `200` with execution still unavailable.
- Receipt execution returned HTTP `201` and recorded one minimized owner-only
  capability receipt with `executionAvailable: false`,
  `mutationAvailable: false`, and `externalDispatch: false`.
- Repeat execution returned HTTP `200`, stayed idempotent, and did not duplicate
  the visible receipt for the proof summary.
- The owner UI rendered `Capability triage` readback with the category, safe
  summary, recorded state, and non-execution next-step copy.
- A generic future action such as `run_job` still showed intent-only copy and
  did not expose a receipt-execution control.

Hosted hostile-input and public-boundary proof:

- Secret-shaped summary input was rejected with HTTP `400` and did not echo the
  submitted probe text.
- A sensitive nested input-key probe was rejected with HTTP `400` and did not
  echo the submitted key name.
- Anonymous public API/detail readback did not include the capability summary,
  `provider_config`, confirmation copy, receipt copy, or private next-step copy.
- Anonymous public mobile detail did not show `Capability triage` or capability
  request receipt text.
- Owner mobile `390x900` showed the capability triage readback and generic
  receipt readback without document-level horizontal overflow.
- Visible owner and public text scans found zero UUID-shaped values and zero
  secret-shaped strings.
- Browser saw no API errors and no unexpected mutation requests.

Mutation result:

- Preview requests: `2`.
- Confirmation creates: `1`.
- Confirmation approvals: `1`.
- Receipt execute requests: `2` including the idempotent repeat.
- External executions: `0`.

Verdict:

- ARIADNE accepts PR173.
- The hosted capability-triage UI reads as owner-only planning infrastructure,
  not execution or configuration.
- The public Developer Space boundary stays clean.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr173-hosted-capability-triage-proof.spec.js --reporter=line --workers=1`
  passed: 1 test.
