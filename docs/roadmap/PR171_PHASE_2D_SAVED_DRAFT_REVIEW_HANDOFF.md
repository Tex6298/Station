# PR171 - Phase 2D Saved Draft Review Handoff

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: DAEDALUS implements.
Reviewer: ARGUS reviews owner scope, receipt payloads, route boundaries, and
public leakage.
Rehearsal: ARIADNE runs hosted desktop/mobile human rehearsal if ARGUS accepts.
Status: closed by MIMIR after hosted ARIADNE acceptance

## Why This Lane

PR170 proved the first bounded Developer Agent artifact mutation: a confirmed
owner action can save one private draft document for a Developer Space.

The next useful Phase 2D step is not public publishing. It is the owner handoff:
after the agent saves a draft, the owner should be able to find it, review it,
and continue editing from existing Studio document flows.

This keeps the product promise honest:

- the agent can prepare owner-private work;
- the owner stays in control of review and publication;
- public visitors do not see private draft material;
- blocked future actions remain visibly blocked.

## Scope

Implement the narrowest review handoff for saved Developer Agent drafts:

- Surface a clear owner-only review/edit path for drafts created by
  `save_project_update_draft`.
- Prefer linking to the existing Studio document edit flow, for example
  `/studio/publish?documentId=...`, when the signed-in owner is viewing the
  Developer Space manage surface.
- Refresh or expose the owner evidence path so the saved draft is visible as an
  owner-only Developer Space document with draft/private metadata.
- Preserve existing manual Studio edit/publish behavior.
- Keep `publish_to_page` blocked; this lane does not automate public
  publishing.
- Keep `draft_project_update` preview-only.

## Boundaries

Do not:

- add public publishing automation;
- add provider/model calls;
- add deployment, repository, worker, webhook, billing, key, signing secret,
  layout, or runtime execution;
- expose private draft links or receipt copy on anonymous/public Developer
  Space detail;
- render raw UUIDs as visible UI text;
- store document bodies, raw prompts, event payloads, provider payloads, API
  keys, cookies, tokens, environment values, confirmation ids, owner ids,
  preview hashes, or route-only identifiers in receipt payloads unless they are
  already part of a safe owner-only linked document contract.

URLs may carry document ids where the existing owner-only route requires them,
but the UI should avoid presenting raw ids as copyable or visible content.

## Expected Behavior

After an owner approves and executes `save_project_update_draft`:

- exactly one private draft receipt remains visible on the owner manage page;
- the receipt or nearby owner evidence section offers a review/edit route for
  the saved draft;
- the destination loads the saved document for the owner and allows normal
  Studio draft review/edit;
- repeat execute remains idempotent and does not create duplicate receipts,
  duplicate documents, or duplicate owner evidence rows;
- anonymous/public Developer Space detail does not reveal the draft, owner-only
  link, or private receipt copy;
- `publish_to_page` can still be previewed/confirmed only as a blocked future
  action and must not expose any save/review control.

## Validation

DAEDALUS should run the focused suites touched by the change, including:

- `pnpm --filter @station/api test:developer-spaces`
- `pnpm --filter @station/web test:developer-space-client`
- web typecheck or the repo's closest equivalent if the owner UI route changes
- `git diff --check`

ARGUS should add hostile review around:

- owner-only access to saved draft review/edit links;
- receipt payload minimization;
- public Developer Space leakage;
- idempotency across repeated save execution;
- `publish_to_page` staying blocked.

ARIADNE should run a hosted human rehearsal if the review path reaches visible
UI:

- desktop owner saves a draft, sees one receipt, follows the review/edit path,
  and lands on the saved draft;
- mobile owner can see and use the handoff without horizontal overflow;
- anonymous/public detail stays clean;
- visible text scan finds no UUID-shaped values or secret-shaped strings.

## Next Baton

DAEDALUS should implement PR171, then wake ARGUS with the exact changed files,
validation, and remaining risks. ARGUS should wake ARIADNE if visible owner UI
needs hosted proof; otherwise ARGUS wakes MIMIR with the verdict.

## DAEDALUS Implementation - 2026-06-22

DAEDALUS implemented PR171 as a narrow owner-only saved-draft review handoff.

Files touched:

- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/lib/developer-space-observatory.ts`
- `apps/web/lib/developer-space-observatory.test.ts`
- `docs/roadmap/PR171_PHASE_2D_SAVED_DRAFT_REVIEW_HANDOFF.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Behavior:

- The owner manage Evidence path now shows `Review draft` for owner-only
  private draft evidence rows.
- The link reuses the existing Studio publish editor:
  `/studio/publish?documentId=...`.
- The existing Studio editor already owner-loads `/documents/:id` and allows
  normal draft editing/saving without adding public publishing automation.
- Review links are gated by owner view, `link_visibility: owner`,
  document `status: draft`, and document `visibility: private`.
- Public/published evidence rows do not receive the review link.
- The link text does not display raw document ids. The document id is present
  only in the URL because the existing owner-only editor route requires it.
- After a `save_project_update_draft` receipt succeeds, the manage page
  best-effort refreshes Developer Space detail so the owner-only evidence row
  and review handoff appear without a manual reload.
- The refresh is best-effort; if it fails, the successful receipt is still
  shown as successful instead of being misreported as a failed execution.

Boundaries preserved:

- No API/schema migration changed in PR171.
- No receipt payload shape changed. Receipt payloads still do not carry
  document ids, route hints, document bodies, prompts, provider payloads, keys,
  tokens, cookies, environment values, confirmation ids, owner ids, or preview
  hashes.
- No provider/model call, autonomous loop, public publish, layout mutation, key
  or signing-secret mutation, repo/deploy action, worker/Cloudflare/Redis path,
  billing/import/export/webhook path, or observed-runtime mutation was added.
- `publish_to_page` remains blocked, and `draft_project_update` remains
  preview-only.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed with 38
  tests, including the owner-only private draft review-link helper.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` passed with
  15 tests.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed.

Next baton:

- ARGUS should review owner-only review-link gating, URL/id handling, public
  leakage, receipt payload minimization, and that blocked future actions remain
  blocked.
- Because visible owner UI changed, ARGUS should wake ARIADNE for hosted
  desktop/mobile rehearsal if accepted.

## ARIADNE Hosted Browser Acceptance - 2026-06-22

ARIADNE accepts the PR171 hosted desktop/mobile browser proof.

Deployment identity:

- Web `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/web`, commit `3bb03067e2eb`.
- API `/health/deployment`: HTTP `200`, ready, branch `main`, service
  `@station/api`, commit `3bb03067e2eb`.
- Runtime includes the PR171 app-code patch.

Hosted owner proof:

- Replay owner route `/developer-spaces/:slug/manage` loaded on desktop
  `1440x1000`.
- Evidence path and Developer Agent preview panel loaded with no confirmation/
  receipt setup-unavailable copy and no generic load-failure copy.
- The proof created and approved a new `save_project_update_draft`
  confirmation, then executed `Save draft`.
- Hosted history already had prior draft evidence; the proof verified exactly
  one new private draft receipt and exactly one new `Review draft` link.
- Repeat `Save draft` execute returned idempotently and did not duplicate
  visible receipt or review-link evidence.
- The `Review draft` link was visible as text only; the owner document id was
  carried in the URL shape `/studio/publish?documentId=...` and was not rendered
  as visible copy.
- Visible owner text scan found zero UUID-shaped values and zero secret-shaped
  strings.
- Following `Review draft` landed on the existing owner Studio editor, loaded
  the project-update draft title/body, kept visibility `private`, and exposed
  normal `Save draft` editing controls.
- The editor proof did not write the document and did not create a publishing
  approval.
- `publish_to_page` preview/create/approve remained non-executing, exposed no
  `Save draft`, and did not change Review draft evidence.
- Browser saw no API errors and no unexpected mutation requests.

Hosted boundary proof:

- Anonymous public Developer Space detail returned HTTP `200`.
- Public detail did not show `Review draft`, the project-update draft, or
  private draft receipt copy.
- Mobile `390x900` owner manage showed a usable `Review draft` handoff and the
  private draft receipt with no document-level horizontal overflow.

Mutation result:

- Preview requests: `2`.
- Confirmation creates: `2`.
- Confirmation approvals: `2`.
- Receipt execute requests: `2` (initial save plus idempotent repeat).
- Document writes: `0`.
- Publishing approvals: `0`.
- External executions: `0`.

Verdict:

- ARIADNE accepts PR171.
- The owner-only Review draft handoff works on hosted desktop and mobile.
- Public/private and receipt-payload boundaries stayed intact.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr171-hosted-review-draft-proof.spec.js --reporter=line --workers=1`
  passed: 1 test.

## MIMIR Closeout - 2026-06-22

MIMIR closes PR171 after ARIADNE accepted the hosted desktop/mobile proof.

Accepted truth:

- Saved Developer Agent drafts now have an owner-only `Review draft` handoff.
- The handoff opens the existing Studio editor at
  `/studio/publish?documentId=...`.
- The document id is carried only in the URL shape required by the existing
  owner editor and is not rendered as visible copy.
- Repeat save execution remains idempotent and does not duplicate receipt or
  review-link evidence.
- Anonymous public Developer Space detail does not expose private draft links,
  private receipt copy, or private draft body text.
- `publish_to_page` remains blocked.

Next lane:

- PR172 should turn `publish_to_page` into the narrowest owner-confirmed public
  publish gate for an already-saved, owner-reviewed private draft. It should
  not generate new content, select arbitrary documents, or automate broad
  public changes.
