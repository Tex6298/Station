# PR523A - Companion-First Persona Home Draft PR #1 ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date: 2026-07-12

Source:
`docs/roadmap/PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_ARGUS.md`

Reviewed target:

```text
https://github.com/Tex6298/Station/pull/1
Branch: fork/agent/companion-shell-translation
Commit: 2d4a23835e5aa0928488041168d48b4cb489e8bb
```

Result:

```text
ACCEPT_PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_FOR_ARIADNE
```

## Verdict

ARGUS accepts draft PR #1 for ARIADNE human rehearsal. No DAEDALUS fix lane is
required before ARIADNE sees it.

This is a technical boundary acceptance only. It is not a customer-facing
closeout and not a visual/mobile/accessibility proof. ARIADNE must still
rehearse the exact draft branch before MIMIR decides merge or follow-up work.

## Evidence Reviewed

ARGUS reviewed:

- GitHub PR #1 metadata with `gh pr view` and the GitHub connector;
- `fork/agent/companion-shell-translation` at
  `2d4a23835e5aa0928488041168d48b4cb489e8bb`;
- `apps/api/src/routes/conversations.ts`;
- `apps/api/src/routes/conversation-archive.test.ts`;
- `apps/web/lib/persona-conversations.ts`;
- `apps/web/lib/persona-conversations.test.ts`;
- `apps/web/lib/studio-navigation.ts`;
- `apps/web/lib/studio-navigation.test.ts`;
- `apps/web/components/studio/persona-chat.tsx`;
- `apps/web/components/studio/persona-chat.test.ts`;
- `apps/web/components/studio/persona-companion-sidebar.tsx`;
- `apps/web/app/studio/personas/[personaId]/page.tsx`;
- `apps/web/app/studio/personas/[personaId]/memory-inbox/page.tsx`;
- `apps/web/components/studio/import-review-inbox.tsx`;
- `apps/web/lib/import-review.ts`;
- `apps/web/lib/import-review.test.ts`;
- `apps/web/app/globals.css`;
- `apps/web/app/studio/layout.tsx`;
- `apps/web/components/studio/studio-sidebar.tsx`;
- `apps/web/components/studio/studio-dashboard.tsx`;
- `.github/workflows/ci.yml`;
- `package.json`.

GitHub state observed:

- PR #1 is open and draft;
- head branch is `agent/companion-shell-translation`;
- base branch is `main`;
- `gh pr view` reported `mergeable: MERGEABLE`;
- `statusCheckRollup` was empty at review time;
- changed files were limited to Studio UI, owner-authenticated conversation
  route/tests, CI, and root `package.json` script coverage.

## Boundary Answers

1. PR #1 is safe to send to ARIADNE for human rehearsal. ARGUS found no
   ownership, persona-scope, public/private drift, secret, CI, or cross-owner
   encounter blocker that requires DAEDALUS first.

2. `GET /conversations/:conversationId?personaId=...` closes the
   persona-boundary leak without breaking legitimate owner reads. The route
   still requires authenticated owner scope, and the optional `personaId`
   filter makes wrong-persona reads return the same bounded not-found shape.

3. Thread switching, sending, archiving, candidate review, and refresh logic are
   guarded by route-driven selection and generation checks. Async completions
   from an old selection are ignored instead of updating the newly selected
   thread. Writes still target the conversation/candidate selected when the
   owner action began, not a later route.

4. Lazy Advanced Studio preserves the cross-owner encounter tools. The
   companion home moves them behind an `Advanced Studio` details section, but
   keeps `PersonaEncounterContractPanel`, `CrossOwnerDisposablePreviewPanel`,
   `PersonaEncounterRuntimePreview`, readiness gates, runtime context preview,
   continuity cards, public interaction readback, and export/publishing history
   available after opening the section.

5. The companion sidebar is owner-private. It is built from
   `/personas` and `/conversations/persona/:personaId`, filters only those
   owner-scoped rows, links threads through `?c=<conversationId>`, and does not
   add public persona, Discover, cross-owner metadata, raw owner id, raw
   persona id, consent id, provider, prompt, retrieval, token, or report data.

6. Memory Inbox/import review filtering remains owner/persona scoped. The API
   now checks persona ownership in the query, candidate rows are filtered by
   `persona_id` and `owner_user_id`, import review keeps `source=import`, and
   Memory Inbox uses `source=all&status=pending` only through the same
   owner-authenticated persona candidate route.

7. CSS blast radius is acceptable for ARIADNE rehearsal. Added rules are under
   `studio-companion-*` selectors or scoped descendants of
   `.studio-companion-page`, and no public route files changed. ARIADNE should
   still visually check desktop, `390px`, and narrow `375px` behavior because
   this is a large visible shell change.

8. Package and CI changes are acceptable. `package.json` expands
   `test:studio-ui` with the new companion tests, and CI adds
   `pnpm test:studio-ui` without changing install, typecheck, build,
   deployment, secrets, providers, queues, or lockfiles.

9. No DAEDALUS fix is required before ARIADNE. Human rehearsal should focus on
   visual fit, mobile navigation, keyboard/accessibility behavior, thread
   switching, archive/return-to-thread behavior, Memory Inbox review, Advanced
   Studio discoverability, and no public-route drift.

## Non-Scope Confirmed

PR #1 does not add:

- public route changes;
- Discover, public Space, forum/Salon/community, writing, homepage, or public
  persona surfacing;
- cross-owner generated material;
- cross-owner public metadata payload expansion;
- provider/model routing changes;
- retrieval/vector/embedding changes;
- billing, storage/export infrastructure, Redis, Cloudflare, queues, workers,
  webhooks, partner adapters, migrations, package-lock changes, or deployment
  changes;
- raw ids, consent ids, report counts, private setup, prompts, provider
  payloads, retrieval bodies, token facts, env values, bearer values, cookies,
  SQL details, stack traces, or secret-shaped values in added public UI.

## Validation

All validation below ran against PR head
`2d4a23835e5aa0928488041168d48b4cb489e8bb`.

The PR body's test counts are not used as acceptance evidence; ARGUS reran the
current local gates and recorded the observed counts below.

| Command / check | Result | Notes |
| --- | --- | --- |
| `gh pr view 1 --repo Tex6298/Station --json number,title,state,isDraft,headRefName,baseRefName,files,commits,mergeable,statusCheckRollup,url` | Pass | PR #1 open draft, head `agent/companion-shell-translation`, base `main`, one commit, 24 files, `MERGEABLE`, empty status checks. |
| `git diff --check fork/main...fork/agent/companion-shell-translation` | Pass | No whitespace errors. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | 238 tests passed, including companion shell, persona chat race/copy, Advanced Studio/cross-owner helper preservation, import review, redaction, and Studio navigation coverage. |
| `npx --yes pnpm@10.32.1 run test:conversation-archive` | Pass | 43 tests passed, including persona-scoped conversation read, owner-only candidate filtering, archive retrieval, runtime history, parser, and import-review boundaries. |
| `npx --yes pnpm@10.32.1 run test:personas` | Pass | 18 tests passed, including public persona and public-source boundaries. |
| `npx --yes pnpm@10.32.1 run test:persona-encounters` | Pass | 74 tests passed, including cross-owner consent, disposable preview, metadata-only public exhibits, moderation, and Studio helper boundaries. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| Secret-shaped added-line scan | Pass | No secret-shaped added lines found in the PR diff. |
| Changed-path/surface scan | Pass | Changed paths stayed inside Studio UI, owner-authenticated conversations route/tests, CI, and package script coverage; no public route files changed. |

## ARIADNE Rehearsal Required

ARIADNE should rehearse the PR branch directly before MIMIR merge/closeout:

- exact persona home first viewport on desktop, `390px`, and `375px`;
- mobile companion navigation and no horizontal overflow;
- New chat URL flow and existing thread `?c=` selection;
- rapid thread switching while a load or send is in flight;
- archived thread read-only behavior, archive action, return card, and recap
  prefill;
- Memory Inbox pending suggestions from import and archived conversation
  sources, with accept/reject removal from the pending list;
- Advanced Studio opening and visibility of cross-owner encounter safeguards;
- public routes such as Discover, public Space, forums, writing, homepage, and
  public persona pages for no visual or data drift;
- keyboard labels, focus, live-region behavior, and screen-reader names.

## Next Wakeup

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR

ACCEPT_PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_FOR_ARIADNE
```
