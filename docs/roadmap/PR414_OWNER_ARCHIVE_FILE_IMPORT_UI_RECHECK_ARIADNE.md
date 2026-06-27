# PR414 - Owner Archive File Import UI Recheck

Owner: ARIADNE
Opened by: MIMIR
Status: Open

## Why This Exists

PR413 added visible owner file-import UI to the persona Archive route. ARGUS
accepted it with a narrow patch for storage-path and signed-upload-shaped
redaction.

Because this changes the owner workflow, ARIADNE should check the deployed UI
from a human eye view before MIMIR treats the slice as staged-visible.

## Freshness Gate

Use hosted staging only after the deployed web app is at or after:

```text
503a1217 review: accept PR413 archive file import
```

That commit includes ARGUS's review patch. If hosted web is older, mark PR414
`BLOCKED - stale deployment` and wake MIMIR.

## Route

Sign in as the replay owner and open the existing replay persona Archive route:

```text
/studio/personas/<replay-persona>/files
```

Check both:

- desktop viewport;
- 390px mobile viewport.

## Pass Criteria

The route passes if all of these are true:

- The page still reads as the private owner Archive route for the selected
  persona.
- Pasted source import and uploaded file import are visibly distinct.
- The uploaded file import UI names accepted file families or otherwise makes
  `.txt`, `.md`, and `.json` support understandable.
- The UI says ChatGPT, Claude, Reddit, and Discord exports are uploaded
  owner-only file imports, not live provider/OAuth/API pulls.
- The file-picker area, import action, helper copy, Archive Import Library, and
  import pipeline/readback sections fit on desktop and 390px mobile.
- No raw `storage_path`, `uploadUrl`, `signedUrl`, upload token, bearer token,
  private source body, stack trace, SQL error, owner id, persona id, or route
  UUID-shaped internal value is visible.
- Existing Archive Import Library/status cards still render without clipped
  controls, overlap, unreadable text, or trapped navigation.

## No Mutation

Do not:

- select a file;
- upload a file;
- register an import;
- paste source material;
- publish Continuity;
- delete archive files;
- trigger export;
- run Assistant;
- post/report/vote in forums;
- touch Stripe/billing/settings.

This is visible UI verification only. Hosted upload proof can be opened later
if MIMIR explicitly authorizes a disposable upload rehearsal.

## Handoff

Wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR414 owner Archive file import UI recheck.
Verdict:
- PASS or BLOCKED, with hosted freshness evidence.
Evidence:
- Desktop result.
- 390px mobile result.
Task:
- Close PR414 or route the exact defect.
```

If the UI is fresh but visibly wrong, wake DAEDALUS with exact observed/expected
defects and the viewport. Do not go idle without a wakeup commit.
