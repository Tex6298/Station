# PR496C - Workspace Export Readback UI Boundary Result

Date: 2026-07-06

Owner: DAEDALUS / A2

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Change

Patched `/studio/export` workspace manifest bundle readback so it stays local
to the selected package row and no longer prints the internal package id in
owner-visible copy.

Exact UI behavior:

- `View bundle files` now clears any previous readback and marks the selected
  package row as loading.
- While the request is in flight, the selected package row shows inline
  `Loading the selected workspace manifest bundle files.`
- After readback succeeds, the selected package row shows `Bundle file readback`
  with only the returned file summaries.
- The visible readback copy says `Selected workspace manifest bundle contains
  only these owner-only readback files.`
- The internal package id remains only in component state/keys and API request
  routing; it is not rendered as owner-visible bundle copy.

## Scope

This is web-only:

- no export API semantics changed;
- no migration, RLS, Supabase schema, hosted config, or migration 070 change;
- no bundle file content or file-name change;
- no owner-only protection change;
- no full archive, original-file, PDF, binary, backup, restore, public export,
  share/signed URL, provider/runtime, queue/worker, Redis, Cloudflare, billing,
  Stripe, Archive connector, OAuth/API credential, public chat, or broad Studio
  shell scope.

## Files Changed

- `apps/web/components/studio/export-workspace.tsx`
- `apps/web/lib/export-trust.test.ts`
- `docs/roadmap/PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/LANE_INDEX.md`

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass: 190 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass. |
| `git diff --check` | Pass: CRLF normalization warnings only. |
| `git diff --cached --check` | Pass. |

`test:exports` was not run because PR496C changes only the web UI and focused
Studio UI source coverage; API/shared export behavior was not touched.

## Hosted Proof

Hosted ARIADNE rerun is required because the defect was observed in browser UI
on desktop, `375px`, and `390px`.

## Handoff

ARGUS should review:

- internal package ids stay out of owner-visible workspace bundle readback copy;
- readback/loading feedback is local to the selected package row;
- focused Studio UI coverage proves the boundary;
- export API, owner-only protection, bundle files, and high-level inventory
  scope did not drift.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
