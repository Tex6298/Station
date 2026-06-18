# Station build roadmap

> Planning source of truth moved to `docs/roadmap/STATION_PR_PLAN_V2.md`.
> Use `docs/roadmap/ACTIVE_STATUS.md` for the current lane and validation status.

This roadmap is the conservative prep-lane truth for the current Station tree. It is intentionally stricter than a progress report: a lane is only marked **protected** when code plus a test/CI guard exists, and a lane is only marked **done** when it satisfies the prepared Station product documents end-to-end.

Current state: **launch-core sufficient for protected-alpha replay, not a
finished Station MVP**.

See [`STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`](./STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md)
for the current evidence map, replay script, and required caveats.

## Current validation gate

The repo-level gate for the protected alpha spine is:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:billing
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
| Studio Alpha | Protected alpha | Persona workspace, Memory, Canon, Archive, Integrity, context preview, archive-chat, export surfaces, Import Review Inbox, private archive search, and Station Assistant operations are protected for replay. Broad polish remains open. |
| Continuity Alpha | Protected alpha | Continuity data is stored, used in runtime context, publishable as separate public copies, discussable, archivable, and exportable. Candidate extraction and retrieval still need hardening. |
| Calibration / Integrity Beta | Partial / reopened | Integrity sessions are persisted and used in context/publication/export. The fuller guided reflective workflow still needs product polish and Station Assistant support. |
| Public Space Beta | Beta candidate | Public Spaces now behave more like authored microsites and are covered by smoke tests. Rich media/page composition and public persona interaction remain open. |
| Community Beta | Partial / reopened | Document discussions and forum primitives exist. Full categories, tier participation, subcommunities, moderation workflow, notifications, and recognition/witness mechanics remain open. |
| Developer Spaces | Protected alpha | Ingestion, observatory, owner/private split, and smoke tests exist. Partner-ready realtime, quotas, scheduled jobs, project ownership, and data export remain open. |
| Archive Trust | Protected alpha | Owner-only JSON/Markdown manifests and portable bundle readback exist. Original file packaging, PDF/binary/full workspace exports, background jobs, redundancy, and Station Press remain open. |
| Launch Candidate | Protected-alpha replay sufficient | The PR24 closeout accepts the current Railway/Supabase staging line as launch-core sufficient for protected-alpha replay with caveats. Production readiness and full MVP remain open. |

## Protected alpha loops

1. External project data -> Developer Space observatory.
2. Space config -> authored microsite surface.
3. Memory / Canon / Archive / Integrity -> continuity store.
4. Continuity store -> persona runtime context.
5. Active chat -> archived transcript -> continuity candidates.
6. Continuity artifact -> separate published document with provenance.
7. Published document -> discussion thread.
8. Persona archive -> owner-only export manifest/bundle readback.
9. External manual Reddit/Discord archive -> private archive -> review queue.
10. Creator-capable draft -> approval queue -> public Space document -> forum discussion.
11. Station Assistant -> owner-safe operational action map.

## Reopened loops

1. Remote deployment truth.
2. Four onboarding paths.
3. Native authoring and versioning.
4. Full forum/community beta.
5. Production vector retrieval, Cloudflare adapters, and Redis memory design.
6. Autonomous Assistant workflows, if ever desired.
7. Live Reddit/Discord OAuth/API intake and recurring pulls.
8. Durable deployed workers, realtime, usage tracking, limits, and backup posture.
9. Partner-ready Developer Spaces.
10. Full workspace/PDF/binary export and archive redundancy.

## Planning documents

- [`prep-lane-audit.md`](./prep-lane-audit.md) records the conservative status audit.
- [`STATION_PR_PLAN_V2.md`](./STATION_PR_PLAN_V2.md) is the active PR-ready roadmap with deliverables and acceptance criteria.
- [`ACTIVE_STATUS.md`](./ACTIVE_STATUS.md) records the current lane and validation posture.
- [`SUPERSEDED.md`](./SUPERSEDED.md) records historical notes that should not drive new work.
