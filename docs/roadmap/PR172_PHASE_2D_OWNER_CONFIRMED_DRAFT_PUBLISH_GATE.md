# PR172 - Phase 2D Owner-Confirmed Draft Publish Gate

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews authorization, public boundary, target selection,
receipt minimization, and idempotency.
Rehearsal: ARIADNE runs hosted desktop/mobile human rehearsal if ARGUS accepts.
Status: implemented by DAEDALUS; open for ARGUS review

## Why This Lane

PR170 let the Developer Agent save one owner-private draft document. PR171 made
that saved draft reviewable through the existing Studio editor.

The next useful Phase 2D step is the smallest public-boundary action:
`publish_to_page` may publish an already-saved, owner-reviewed draft only after
explicit owner confirmation.

This lane is not an autonomous publishing system. It is a narrow gate that
proves the Developer Agent can prepare a public change, present the target to
the owner, require approval, and use existing publishing semantics without
inventing a new content pipeline.

## Scope

Implement the narrowest publish path:

- Keep `publish_to_page` blocked unless it targets an existing draft document
  that is:
  - owned by the signed-in owner;
  - linked to the same Developer Space;
  - `status: draft`;
  - `visibility: private`;
  - linked as owner-only evidence or otherwise clearly created/reviewed through
    the current Developer Agent draft path.
- Let the owner create and approve a `publish_to_page` confirmation only for
  an eligible selected draft.
- On approved execution, publish that draft through the existing document
  publish semantics instead of creating a parallel publishing path.
- Record one durable receipt that proves the public publish gate ran.
- Make repeat execution idempotent: no duplicate receipt, duplicate public
  evidence row, or duplicate publication side effect.
- After publish, refresh owner evidence so the owner can see the public/published
  state.
- Preserve existing Studio manual review/edit/publish behavior.

## Boundaries

Do not:

- generate or rewrite document content;
- call a model/provider;
- select a default/latest document silently;
- publish arbitrary private documents;
- publish documents from another owner or another Developer Space;
- expose private receipt copy, confirmation ids, owner ids, raw target ids,
  document bodies, raw prompts, provider payloads, keys, tokens, cookies, env
  values, preview hashes, or route-only identifiers in visible UI;
- add deployment, repository, worker, webhook, billing, key, signing secret,
  layout, runtime, Cloudflare, Redis, import, export, or background-job
  execution;
- unblock any other future action.

The server may carry the minimum private target reference needed to execute the
approved publish, but that reference must stay owner-only, must not appear as
visible copy, and should not be stored in receipt payloads if the receipt can
instead report safe metadata such as title, status, visibility, and link
visibility.

## Expected Behavior

Owner path:

- Owner can see eligible private draft evidence from PR170/PR171.
- Owner can start a `publish_to_page` confirmation for a selected eligible
  draft.
- The confirmation copy names the safe target label/title and makes clear this
  is a public publish action.
- Approving and executing publishes exactly that draft.
- The owner manage page shows one publish receipt and refreshed evidence with
  public/published metadata.
- Repeating execution is idempotent.

Public path:

- Before execution, anonymous/public Developer Space detail does not show the
  private draft, private review link, or private receipt copy.
- After execution, anonymous/public Developer Space detail may show the newly
  published document through the existing public document surface.
- Public pages must not show confirmation records, execution receipts, owner
  ids, private draft links, or private-only provenance.

Blocked path:

- `publish_to_page` without an eligible selected draft stays blocked.
- `draft_project_update` remains preview-only.
- `save_project_update_draft` remains the only draft-creation receipt action.
- Other future actions remain blocked.

## Validation

DAEDALUS should run focused validation, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if owner UI changes
- `git diff --check`

ARGUS should add hostile review around:

- non-owner and wrong-Space draft publish attempts;
- attempts to publish arbitrary private documents;
- already-published and deleted/missing target behavior;
- confirmation target tampering;
- receipt payload minimization;
- public leakage before and after publish;
- idempotency across repeated execution;
- other future actions staying blocked.

ARIADNE should run a hosted human rehearsal if ARGUS accepts:

- owner creates/saves a draft, reviews it, selects it for publish, approves,
  executes, and sees one publish receipt;
- anonymous/public detail is clean before publish and shows only the legitimate
  published document after publish;
- mobile owner can see and use the publish gate without horizontal overflow;
- visible text scan finds no UUID-shaped values or secret-shaped strings.

## Next Baton

DAEDALUS implemented PR172 on 2026-06-22.

Changed files:

- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `packages/types/src/developer-space.ts`
- `packages/db/src/types.ts`
- `infra/supabase/migrations/052_developer_space_agent_draft_publish_gate.sql`

Implementation details:

- `publish_to_page` confirmations require a selected `targetDocumentId`.
- The API rejects missing targets, wrong-Space links, arbitrary private
  documents, already-published targets, and documents not produced by the
  current Developer Agent saved-draft path.
- Eligible targets must be owner-owned, linked to the same Developer Space as
  owner-only field-log evidence, `draft`/`private`, `ai_assisted`, `manual`,
  and sourced from the same Developer Space with a `Developer Agent safe
  readback:` source label.
- Approved execution publishes the selected document to `published`/`public`,
  flips the Developer Space evidence link to `public`, and records one
  minimized `publish_to_page` receipt.
- Repeat execution returns the existing receipt and does not duplicate receipts,
  links, or publication side effects.
- Owner UI starts publish confirmations from the selected evidence row, not
  from the generic future-lane preview.

Receipt proof:

- The publish receipt includes safe metadata only: title, status, visibility,
  link visibility, role, published timestamp, next step, and boundary copy.
- The publish receipt does not include target document id, confirmation id,
  owner id, document body, prompts, provider payloads, keys, tokens, cookies,
  environment values, or preview hashes.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 39
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/types build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/db build` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.

Remaining review risks:

- ARGUS should review hostile confirmation payload tampering and public leakage
  before accepting.
- ARIADNE should run hosted desktop/mobile proof if ARGUS accepts the code path.

ARGUS should review changed files, target-selection rules, receipt payload
minimization, public/private leakage, idempotency, and blocked future-action
boundaries. If accepted, ARGUS should wake ARIADNE for hosted proof. ARIADNE
then wakes MIMIR with the closeout verdict.
