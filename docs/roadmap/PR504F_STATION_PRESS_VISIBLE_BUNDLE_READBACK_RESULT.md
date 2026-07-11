# PR504F - Station Press Visible Bundle Readback Result

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Review target: ARGUS / A3

Date: 2026-07-11

Status: Ready for ARGUS review

## Result

```text
REVIEW_PR504F_STATION_PRESS_VISIBLE_BUNDLE_READBACK
```

DAEDALUS implemented the narrow owner-only Station Press bundle readback patch
for `/studio/publishing`.

## Files Changed

- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/lib/publishing.ts`
- `apps/web/lib/publishing-ui.test.ts`
- `docs/roadmap/PR504F_STATION_PRESS_VISIBLE_BUNDLE_READBACK_RESULT.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/roadmap/LANE_INDEX.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Behavior Implemented

- `/studio/publishing` now loads existing
  `station_press_publication` package rows for package-ready owner
  publications on page load.
- A completed existing package exposes a `View bundle files` action without
  forcing another create.
- Creating a metadata package still uses the existing authenticated
  `POST /exports/station-press/publications/:documentId` API.
- After create succeeds, the page immediately calls the existing authenticated
  `GET /exports/:id/bundle` API and opens owner-only bundle file readback.
- The readback panel shows the exact owner bundle file list:
  `README.md`, `manifest.json`, and `manifest.md`.
- Loading and bounded-error states are compact:
  - bundle loading says owner-only bundle file readback is loading;
  - bundle failure says Station Press bundle readback is unavailable;
  - package-list failure says Station Press metadata package readback is
    unavailable.
- Visible copy distinguishes owner-only metadata proof from publishing files
  for readers or binary/PDF output.

## PR504E Blocker Coverage

PR504E blocked because the backend proof passed but a real owner could not see
bundle readback from `/studio/publishing`.

PR504F gives the owner:

- completed package status on page load when one already exists;
- a visible `View bundle files` action;
- a visible owner bundle panel;
- exact file names for the package;
- create-success transition into visible bundle readback.

## Scope Boundaries

This patch does not add or change:

- public package URLs;
- public downloads;
- signed URLs;
- storage objects or storage paths;
- PDF or binary output;
- original-file packaging;
- print/fulfillment;
- provider/model calls;
- billing/Stripe;
- social dispatch;
- queues/workers;
- Redis;
- Cloudflare;
- public routes;
- broad `/studio/publishing` redesign;
- launch claims;
- visible raw owner/document/package ids.

The implementation keeps package ids internal to API calls and state matching;
visible UI copy does not render them.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 196 Studio UI/helper tests passed, including exact Station Press bundle file-list helper coverage and dashboard source wiring coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass | 26 publishing API/UI tests passed because `apps/web/lib/publishing.ts` changed. |
| `npm exec --yes pnpm@10.32.1 -- run test:exports` | Pass | 15 export API tests passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Remaining Hosted Proof

No hosted browser proof was run from this DAEDALUS thread.

After ARGUS review, ARIADNE should rerun PR504E on `/studio/publishing` and
prove:

- desktop and 390px mobile fit without horizontal overflow;
- existing completed package readback is visible without a new create;
- create success transitions into visible bundle readback;
- `View bundle files` appears and opens the exact three-file list;
- signed-out and cross-owner API boundaries remain closed;
- visible UI exposes no raw ids, private/source bodies, storage paths, signed
  URLs, SQL details, stack traces, tokens, cookies, env values, provider
  payloads, public download links, or launch/package-publicity claims.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR504F visible owner-only Station Press bundle readback on /studio/publishing.
- Existing completed packages can show View bundle files without forcing another create.
- Create success now loads owner-only bundle file readback and shows README.md, manifest.json, and manifest.md.
Task:
- Review the narrow UI/helper patch and validation.
- If accepted, wake MIMIR for closeout and ARIADNE browser rerun routing.
- If fixes are needed, wake DAEDALUS with exact defects.
```
