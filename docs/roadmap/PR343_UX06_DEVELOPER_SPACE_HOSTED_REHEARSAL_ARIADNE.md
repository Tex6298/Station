# PR343 - UX-06 Developer Space Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR342 Developer Space observatory clarity.
- The public Developer Space detail route now has a tested visitor reading path and stricter public-evidence counting.
- MIMIR needs hosted desktop/mobile proof after Railway deploy before claiming deployed observatory UX.
Task:
- Run a human-eye hosted rehearsal for the public Developer Space observatory.
- Check desktop and mobile.
- Prove the new orientation strip is present, readable, mobile-safe, and does not expose private owner data.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Primary route:

```text
/developer-spaces/station-replay-dev-alpha
```

Optional route if discoverable and public:

```text
/developer-spaces/animus-field-lab
```

## Checks

Run this as a human-eye rehearsal, not a code review.

Required desktop checks:

- Load the public Developer Space observatory on hosted Railway.
- Confirm the page reflects PR342's new visitor reading path. Look for a
  `How to read this observatory` orientation strip before metrics and
  visualization-heavy content.
- Confirm the strip explains the reading order: public evidence/methodology when
  present, public-safe node/signal readback, and live versus snapshot boundary.
- Confirm thin-data states feel honest rather than broken.
- Confirm the public route does not expose owner-only ingestion keys, private
  management controls, private documents, raw credentials, secret-shaped values,
  private archive/memory/canon/continuity bodies, or unfiltered provider/runtime
  payloads.
- Confirm the public observatory still distinguishes public visitor surface from
  owner/operator console.

Required mobile checks:

- Repeat the primary route at a narrow mobile viewport, around `375px`.
- Confirm the orientation strip stacks or wraps cleanly.
- Confirm there is no horizontal overflow, clipped heading, overlapping text,
  trapped controls, or canvas-heavy content appearing before the basic reading
  path.

Freshness proof:

- Treat this as blocked if hosted Railway clearly has not deployed PR342 yet.
- If there is no deploy commit readback, use visible PR342 text as the freshness
  signal and say exactly what was or was not visible.

## Non-Scope

Do not mutate hosted data.

Do not sign in unless the route unexpectedly requires it for diagnosis.

Do not test owner console behavior except to confirm that owner/private controls
are not leaking onto the public observatory.

Do not inspect or print secrets, cookies, tokens, private payload bodies, or
source material.

Do not broaden this into Discover, forum, billing, Studio, provider/model,
Redis, Cloudflare, deployment, worker, or config testing.

## Result Doc

Create:

```text
docs/roadmap/PR343_UX06_DEVELOPER_SPACE_HOSTED_REHEARSAL_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Include:

- routes tested;
- desktop result;
- mobile result;
- freshness evidence;
- privacy/boundary result;
- caveats or defects;
- whether MIMIR can close UX-06 deployed observatory proof or should wake
  DAEDALUS with a repair packet.
