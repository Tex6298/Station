# PR431 - Hosted Developer Space Export Readback Rehearsal

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARIADNE / A4

Status: open - hosted visible verification

## Why This Lane

PR430 added Developer Space owner manifest and portable bundle readback
controls to close the PR429 hosted caveat. ARGUS accepted the technical/privacy
boundary:

`docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_REVIEW_RESULT.md`

This lane verifies the visible hosted owner route after deployment. It is not a
new feature lane and not a broad staging demo.

## Hosted Target

Use hosted Railway staging:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Deployment freshness:

- Check web and API `/health/deployment`.
- Treat web runtime as fresh for this rehearsal only if it serves PR430 product
  code commit `1d9bce0a` or later, or if the deployment endpoint reports a
  later accepted runtime commit.
- If Railway has not deployed PR430 yet, wait/retry once if that is already in
  ARIADNE's normal rehearsal tooling; otherwise mark `BLOCKED` and wake MIMIR.

## Route Sequence

1. Sign in as the replay owner through the product UI.
2. Open `/developer-spaces`.
3. Open the accepted replay Developer Space owner/manage route:
   `/developer-spaces/:slug/manage`.
4. Find the Developer Space export/status surface.
5. Verify completed export readback controls:
   - `View manifest`;
   - `View portable bundle`;
   - manifest readback;
   - portable bundle file-summary readback.
6. Repeat the key manage/export readback surface at 390px or equivalent mobile
   width.

## Pass Conditions

Pass if hosted product UI shows:

- owner-only JSON/Markdown Developer Space export status;
- completed package state;
- manifest readback control and visible readback;
- portable bundle readback control and visible file-summary readback;
- file names, media types, byte counts, and short SHA-256 prefixes only for
  bundle contents;
- no raw UUID-shaped IDs in normal UI/readback;
- no secrets, cookies, tokens, database URLs, provider payloads, prompts,
  completions, private source bodies, transcript bodies, storage paths, or raw
  bundle file contents;
- no claim of database backup/restore, managed backup, full workspace export,
  PDF/binary export, storage-object backup, production disaster recovery,
  RPO/RTO, hosted backup readiness, or hosted data coverage;
- no document-level horizontal overflow on desktop or mobile.

## Allowed Mutations

Allowed:

- sign-in/session restore;
- opening existing owner-only export readbacks;
- creating a Developer Space export package only if no completed package exists
  and the existing accepted UI offers that action.

Not allowed:

- publish/retract/delete;
- billing, Stripe, token top-up, provider/model, Redis, Cloudflare, worker,
  queue, Supabase dashboard, SQL, storage, migration, Railway config, or
  private archive creation;
- copying raw manifests, raw bundle bodies, private bodies, IDs, cookies,
  tokens, secrets, prompts, completions, or provider payloads into docs.

## Verdict

Return one of:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Wake MIMIR with route labels checked, desktop/mobile result, deployment
freshness result, and any concrete defect.

Wake DAEDALUS directly only for a concrete reproducible PR430 product defect
with route, visible label, expected behavior, and actual behavior.
