# PR343 - UX-06 Developer Space Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-26

Verdict:

```text
PASS
```

## Routes Tested

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Route:

```text
/developer-spaces/station-replay-dev-alpha
```

## Summary

ARIADNE completed the hosted signed-out desktop and `375px` mobile rehearsal for
the public Developer Space observatory.

Railway appears to have deployed PR342. The public route now shows the
`How to read this observatory` orientation strip before metrics and
visualization-heavy content.

Freshness evidence visible on hosted:

- `How to read this observatory`
- `Evidence first, then live readback.`
- `Start with the public evidence`
- `Compare the current readback`
- `Separate live signals from snapshots`
- public-safe readback copy distinguishing external runtime summaries from raw
  runtime payloads

## Desktop Result

Desktop passed.

- The route loaded with HTTP `200`.
- The PR342 orientation strip appeared before metrics and live visualization.
- The reading path explained public evidence/methodology/finding/field-log
  notes first, then public-safe node/signal readback, then live-versus-snapshot
  boundaries.
- Public evidence cards and thin-data/readback explanations felt intentional,
  not broken.
- The observatory remained clearly public-facing rather than an owner/operator
  console.
- No document-level horizontal overflow was detected.

## Mobile Result

`375px` mobile passed.

- The route loaded with HTTP `200`.
- The orientation strip stacked cleanly before metrics and visualization-heavy
  content.
- The orientation cards wrapped without clipped headings, overlapping text,
  horizontal overflow, or trapped controls.
- Metrics, evidence cards, live visualization, event stream, reading guide,
  current nodes, and latest snapshot remained reachable in a sensible order.

## Privacy And Boundary Result

Passed.

The signed-out public route did not expose:

- owner-only manage controls;
- ingestion keys or secret-shaped values;
- raw event or snapshot data disclosure controls;
- private documents, archive, memory, canon, continuity, owner-only bodies, or
  unfiltered provider/runtime payloads;
- cookies, auth tokens, or credential values.

The page copy preserved the public visitor boundary: Station hosts the public
showcase, observatory, evidence path, and readback while the project runtime
remains external and self-hosted by the developer.

## Validation

Passed:

```text
$env:NODE_PATH = "$env:LOCALAPPDATA\npm-cache\_npx\68e6008f1f37a3f5\node_modules"; npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr343-devspace-hosted-rehearsal.spec.js --reporter=line --workers=1
```

Result:

```text
2 passed
```

Passed:

```text
git diff --check
```

Note: `git diff --check` printed only the expected CRLF normalization notice for
`.station-agents/state/ARIADNE.json`.

## Recommendation

MIMIR can close UX-06 deployed observatory proof as passed.

No DAEDALUS repair packet is needed from this hosted rehearsal.
