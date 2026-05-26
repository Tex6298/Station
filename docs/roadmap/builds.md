# Station build roadmap

This roadmap is the conservative prep-lane truth for the current Station tree. It is intentionally stricter than a progress report: a lane is only marked **protected** when code plus a test/CI guard exists, and a lane is only marked **done** when it satisfies the prepared Station product documents end-to-end.

Current state: **alpha spine with several protected loops, not a finished Station MVP**.

## Current validation gate

The repo-level gate for the protected alpha spine is:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:developer-spaces
pnpm test:spaces
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:document-discussions
pnpm test:exports
pnpm --filter @station/api build
pnpm build
git diff --check
```

Remote deployment status is tracked separately from local validation. Do not call the lane fully green until the GitHub/Vercel status for the pushed head is also green or explicitly waived.

## Milestones

| Milestone | Status | Notes |
| --- | --- | --- |
| Foundation Alpha | Protected | Monorepo typecheck/build/API build and CI gates are in place. Remote deployment truth still needs separate verification. |
| Studio Alpha | Protected alpha | Persona workspace, Memory, Canon, Archive, Integrity, context preview, archive-chat, and export surfaces exist. Mobile polish and Station Assistant remain open. |
| Continuity Alpha | Protected alpha | Continuity data is stored, used in runtime context, publishable as separate public copies, discussable, archivable, and exportable. Candidate extraction and retrieval still need hardening. |
| Calibration / Integrity Beta | Partial / reopened | Integrity sessions are persisted and used in context/publication/export. The fuller guided reflective workflow still needs product polish and Station Assistant support. |
| Public Space Beta | Beta candidate | Public Spaces now behave more like authored microsites and are covered by smoke tests. Rich media/page composition and public persona interaction remain open. |
| Community Beta | Partial / reopened | Document discussions and forum primitives exist. Full categories, tier participation, subcommunities, moderation workflow, notifications, and recognition/witness mechanics remain open. |
| Developer Spaces | Protected alpha | Ingestion, observatory, owner/private split, and smoke tests exist. Partner-ready realtime, quotas, scheduled jobs, project ownership, and data export remain open. |
| Archive Trust | Protected alpha | Owner-only export manifests exist. Portable bundles, original file packaging, background jobs, redundancy, and Station Press remain open. |
| Launch Candidate | Open | Requires the reopened loops in the PR plan to be completed or explicitly deferred. |

## Protected alpha loops

1. External project data -> Developer Space observatory.
2. Space config -> authored microsite surface.
3. Memory / Canon / Archive / Integrity -> continuity store.
4. Continuity store -> persona runtime context.
5. Active chat -> archived transcript -> continuity candidates.
6. Continuity artifact -> separate published document with provenance.
7. Published document -> discussion thread.
8. Persona archive -> owner-only export manifest.

## Reopened loops

1. Remote deployment truth.
2. Four onboarding paths.
3. Native authoring and versioning.
4. Full forum/community beta.
5. Search and archive retrieval.
6. Station Assistant workflows.
7. External archive intake.
8. Jobs, realtime, usage tracking, limits, and backup posture.
9. Partner-ready Developer Spaces.
10. Portable export bundles and archive redundancy.

## Planning documents

- [`prep-lane-audit.md`](./prep-lane-audit.md) records the conservative status audit.
- [`pr-plan.md`](./pr-plan.md) is the full PR-ready backlog with deliverables and acceptance criteria.
