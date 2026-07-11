# PR504G - Station Press Visible Bundle Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open hosted browser proof

## Source

PR504F is accepted:

`docs/roadmap/PR504F_STATION_PRESS_VISIBLE_BUNDLE_READBACK_REVIEW_RESULT.md`

Closeout:

`docs/roadmap/PR504F_STATION_PRESS_VISIBLE_BUNDLE_READBACK_CLOSEOUT.md`

Accepted UI implementation commit:

```text
906bcb45 web: show station press bundle readback
```

## Task

Rerun the hosted `/studio/publishing` browser closeout against the accepted
PR504F UI patch.

Target:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

Do not record credentials, cookies, auth tokens, raw owner ids, raw document
ids, raw package ids, raw route ids, private bodies, source rows, storage
paths, signed URLs, SQL details, stack traces, prompts, transcripts, provider
payloads, or env values.

## Proof Requirements

Prove:

- hosted web/API are reachable;
- hosted behavior includes the PR504F UI patch, either by exposed deploy commit
  at or after `906bcb45` or by visible `View bundle files` behavior;
- owner sign-in works;
- desktop `/studio/publishing` has no horizontal overflow;
- 390px mobile `/studio/publishing` has no horizontal overflow;
- an existing completed Station Press package shows owner-only readback without
  forcing another create;
- `View bundle files` appears for a completed package;
- `View bundle files` opens a visible owner-only bundle panel or equivalent
  readback section;
- visible bundle file list is exactly `README.md`, `manifest.json`, and
  `manifest.md`;
- if a package-ready publication still has a create action, one browser create
  may be performed and must transition into visible bundle readback;
- if all package-ready publications already have completed packages, do not
  manufacture data; record that existing-package readback is the hosted proof;
- signed-out and cross-owner create/list/readback/bundle probes remain closed
  if the rehearsal harness can safely run them;
- visible UI exposes no raw ids, private/source bodies, storage paths, signed
  URLs, SQL details, stack traces, provider payloads, tokens, cookies, env
  values, public download links, or launch/package-publicity claims.

## Non-Scope

This is proof only. Do not request or implement:

- public package URLs;
- public downloads;
- signed URLs;
- storage objects;
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
- launch claims.

## Result Required

Create:

```text
docs/roadmap/PR504G_STATION_PRESS_VISIBLE_BUNDLE_HOSTED_PROOF_RESULT.md
```

Include:

- pass/block verdict;
- hosted freshness or visible-patch evidence;
- owner auth result;
- desktop and mobile fit result;
- existing completed package readback result;
- whether a browser create was performed;
- `View bundle files` result;
- exact bundle file-list result;
- signed-out/cross-owner boundary result if run;
- privacy/product-boundary result;
- validation checks;
- final wakeup.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR504F is accepted; /studio/publishing now has visible owner-only Station Press bundle readback locally.
- Accepted UI implementation commit is 906bcb45 web: show station press bundle readback.
- Final hosted browser proof is required before Station Press owner package closeout.
Task:
- Rerun hosted /studio/publishing on desktop and 390px mobile.
- Prove View bundle files opens owner-only readback and shows exactly README.md, manifest.json, and manifest.md.
- Prove privacy/product boundaries and fail-closed auth boundaries where safe.
- Wake MIMIR with pass/block verdict.
```
