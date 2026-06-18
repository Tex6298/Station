# PR30 Versioning Rehearsal - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Blocked on live schema/deployment state

## Scope

ARIADNE was asked to rehearse the Studio publish-flow version-history panel on
Railway at desktop and 375px after ARGUS accepted PR30 for visible review.

The requested user-facing checks were:

- existing document load;
- save/publish flow;
- current version label;
- prior-version row readability;
- no layout overlap;
- no raw prior body exposure.

## Runtime Checked

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Web and API deployment identity: `fb3393cc279db560f8810b6484b8707f2f77e384`
- API deployment readiness: `ready:true`
- API migration readiness latest label: `025-029`

The runtime is the PR30 handoff commit, but the migration readiness payload still
reports the older migration ledger label. PR30 requires
`infra/supabase/migrations/037_document_version_history.sql`.

## Live Owner Probe

Using the staging replay owner without printing credentials, ARIADNE created a
small private `codex` document through the live API:

- Created document: `ef3aabe5-f1a8-498e-bf54-52334d0c2cc3`
- `POST /documents`: `201`
- `GET /documents/:id`: `200`
- Created/read document `version`: `null`
- `GET /documents/:id/versions` before edit: `404`, `Document not found.`
- `PATCH /documents/:id` with changed title/body: `500`,
  `Could not find the table 'public.document_versions' in the schema cache`
- `GET /documents/:id/versions` after edit attempt: `404`, `Document not found.`

No prior body marker was printed in logs.

## UX Finding

The Studio publish flow catches a failed version-history fetch and falls back to
an empty version list. That is graceful during ordinary transient failures, but
it means the current Railway UI can visually suggest "Current version v1; no
prior versions yet" while the owner-only version-history endpoint is actually
dead.

Because the live edit path cannot insert into `document_versions`, ARIADNE
cannot honestly accept the desktop or 375px version-history panel:

- the current-version label cannot be proven against live version increments;
- a prior-version row cannot be created or reviewed for readability;
- raw prior body exposure cannot be checked in the rendered prior-row state;
- the save/review path is blocked by backend schema absence before the real
  version-history UI state exists.

## Visual Defects

No final desktop or 375px visual acceptance was possible. The actionable UX
defect is state truthfulness: the version panel can hide a broken version
history read as an empty history state.

## Required Next Step

Apply and verify PR30's document-version migration on Railway, then rerun A4
against `/studio/publish?documentId=<owner-document-id>` at desktop and 375px.
The rerun should prove:

- `documents.version` is present and increments after edit/publish;
- `/documents/:id/versions` returns owner-only prior rows;
- the publish-flow label reports the current version and prior-version count;
- prior rows are readable on desktop and 375px;
- prior body text is not rendered in the version-history panel.

## Validation

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- Direct signed API probe for document create/read/update/version-history
- Code inspection of `apps/web/components/studio/publish-flow.tsx`
- Code inspection of `apps/web/lib/publishing.ts`

## MIMIR Schema Follow-Up

MIMIR applied `infra/supabase/migrations/037_document_version_history.sql` to
the staging Supabase target on 2026-06-18 through the IPv4-compatible pooler
connection and requested a PostgREST schema reload.

Sanitized proof query result:

- `public.document_versions` exists: true
- `public.documents.version` exists: true
- owner RLS policy `document_versions_all_owner` exists: true

Remaining before ARIADNE reruns the human rehearsal: deployment readiness still
labels the public schema proof as `025-029`. DAEDALUS should update that runtime
proof to include PR30's `document_versions`/`documents.version` objects so the
health endpoint and version-history route agree.
