# PR523A - Companion-First Persona Home Draft PR #1 ARGUS Review

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_ARGUS_REVIEW
```

## Target

Review draft PR #1 as the companion-first UI source of truth:

```text
https://github.com/Tex6298/Station/pull/1
```

Branch:

```text
fork/agent/companion-shell-translation
```

Commit:

```text
2d4a23835e5aa0928488041168d48b4cb489e8bb
```

Do not review this as optional polish. Review it as the intended companion
persona-home direction, with normal hostile boundary discipline.

## Review Mission

Decide whether draft PR #1 is safe to send to ARIADNE for human rehearsal, or
whether it needs DAEDALUS fixes first.

Focus on:

- ownership and persona scoping;
- thread-selection race conditions;
- conversation read/write and archive boundaries;
- Memory Inbox, continuity candidate, and import review scoping;
- Advanced Studio preservation for cross-owner encounter UI;
- public/private payload drift;
- public route drift;
- CSS/global-style blast radius;
- CI/script changes;
- secret/raw-id/private data leakage.

## Specific Surfaces To Inspect

Inspect at least:

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
- `.github/workflows/ci.yml`;
- `package.json`.

## Required Checks

Run or justify skipping:

```text
gh pr view 1 --repo Tex6298/Station --json number,title,state,isDraft,headRefName,baseRefName,files,commits,mergeable,statusCheckRollup,url
git diff --check fork/main...fork/agent/companion-shell-translation
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run typecheck
```

Also scan the PR diff for secret-shaped values and forbidden public payload
expansion.

## Review Questions

Answer directly:

1. Is PR #1 safe to send to ARIADNE for human rehearsal?
2. Does `GET /conversations/:conversationId?personaId=...` close the
   persona-boundary leak without breaking legitimate reads?
3. Do thread switching, sending, archiving, candidate review, and state refresh
   avoid stale writes after navigation?
4. Does lazy Advanced Studio preserve the cross-owner encounter tools without
   hiding required safeguards?
5. Does the sidebar expose only owner-private threads/personas and no public or
   cross-owner metadata it should not?
6. Does Memory Inbox/import review filtering remain owner/persona scoped?
7. Does CSS stay scoped enough for Station, or does it contaminate unrelated
   public pages?
8. Are package/CI changes acceptable?
9. What must DAEDALUS fix before ARIADNE sees it, if anything?

## Output

Create:

```text
docs/roadmap/PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_ARGUS_RESULT.md
```

Wake MIMIR with exactly one of:

```text
ACCEPT_PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_FOR_ARIADNE
BLOCK_PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1
```

If blocked, name concrete files and fixes. Do not broaden into generic UI
reskinning or unrelated backend work.
