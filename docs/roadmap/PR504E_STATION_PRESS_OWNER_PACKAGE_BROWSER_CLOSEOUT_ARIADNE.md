# PR504E - Station Press Owner Package Browser Closeout

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status: Open hosted browser proof

## Source

PR504D is accepted:

`docs/roadmap/PR504D_STATION_PRESS_OWNER_PACKAGE_CREATE_PATH_REPAIR_REVIEW_RESULT.md`

Closeout:

`docs/roadmap/PR504D_STATION_PRESS_OWNER_PACKAGE_CREATE_PATH_REPAIR_CLOSEOUT.md`

## Why This Exists

DAEDALUS and ARGUS proved the hosted backend create/readback/bundle blocker is
fixed after applying migration 073. PR504B, however, was a hosted browser proof
for the visible `/studio/publishing` owner flow. The final closeout should prove
the human path now works end to end, not just the API runner.

## Target

Use the hosted production Railway URL:

```text
https://stationweb-production.up.railway.app/studio/publishing
```

Do not record credentials, cookies, auth tokens, raw owner ids, raw document
ids, raw package ids, raw route ids, private bodies, source rows, storage
paths, signed URLs, SQL details, stack traces, prompts, transcripts, provider
payloads, or env values.

## Task

Run a hosted browser/human-eye closeout for Station Press owner package
creation.

Prove:

- hosted web and API are reachable and identify the deployed commit if the app
  exposes it;
- owner sign-in works;
- `/studio/publishing` renders on desktop without horizontal overflow;
- `/studio/publishing` renders at 390px mobile without horizontal overflow;
- the visible Station Press package surface is understandable and bounded;
- the browser can create or open a Station Press owner package from a
  package-ready publication;
- the UI reaches authenticated readback for the created/opened package;
- the UI exposes the bundle readback with exactly:
  `README.md`, `manifest.json`, and `manifest.md`;
- visible package readback omits raw ids, private/source bodies, storage paths,
  signed URLs, SQL details, stack traces, provider payloads, cookies, tokens,
  env values, public download links, and package-publicity or launch claims;
- signed-out and cross-owner create/list/read/bundle probes still fail closed
  if the rehearsal harness can safely run them without exposing secrets.

If an existing completed package is used for readback, explicitly say whether
the browser also performed a create action during this run. If creation is not
possible because every package-ready publication already has a completed
package, do not manufacture data in the UI; record that as a bounded rerun
condition and prove readback/bundle from the existing package.

## Non-Scope

Do not request or implement:

- public package URLs;
- public downloads;
- signed URLs;
- storage objects;
- PDF or binary generation;
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
- raw ids in visible/readback copy;
- private body/source exposure.

This is proof and closeout, not a new product expansion.

## Result Required

Create:

```text
docs/roadmap/PR504E_STATION_PRESS_OWNER_PACKAGE_BROWSER_CLOSEOUT_RESULT.md
```

Include:

- pass/block verdict;
- hosted freshness;
- owner auth result;
- desktop and mobile visual fit result;
- whether browser create was performed or an existing package was opened;
- package readback result;
- bundle file list result;
- privacy/product-boundary result;
- signed-out/cross-owner boundary result if run;
- screenshots or screenshot paths only if they are already part of the normal
  sanitized rehearsal pattern;
- validation commands/checks;
- final wakeup.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR504D is accepted; hosted migration 073 was missing and is now applied.
- Backend hosted create/readback/bundle now passes with signed-out 401 and cross-owner 404 boundaries intact.
- PR504B still needs a visible hosted /studio/publishing browser closeout before final Station Press owner package closure.
Task:
- Run the PR504E hosted browser/human-eye closeout.
- Prove desktop/mobile fit, package create-or-open, readback, exact README.md / manifest.json / manifest.md bundle files, and privacy/product boundaries.
- If blocked, name the exact human-flow blocker; otherwise wake MIMIR with pass verdict.
```
