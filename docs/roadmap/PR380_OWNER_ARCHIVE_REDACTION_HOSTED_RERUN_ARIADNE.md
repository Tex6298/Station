# PR380 - Owner Archive Redaction Hosted Rerun

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Rerun the PR378 owner archive/export/import hosted rehearsal after PR379's
Global Archive API serialization fix.

PR378 failed because `/studio/archive` exposed raw JSON-shaped source material
in visible owner archive result text. PR379 patched `/imports/archive` and
`/imports/archive/search` so JSON-shaped source bodies are redacted at the
returned preview summary boundary while preserving safe owner-facing context.

This is a hosted, human-eye replay proof. Keep it read-only.

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

Before judging the UI, confirm hosted API/web freshness is at or after the PR379
implementation commit:

- `ad1704d9`

If hosted Railway is stale, return:

```text
BLOCKED - hosted PR379 not deployed
```

Do not fail the product for a stale deploy.

## Route Checks

Primary repaired route:

- `/studio/archive`

Check:

- Replay-owner sign-in still reaches the route.
- The Private search readback / owner-only archive surface loads.
- Archive result cards no longer render raw JSON-shaped source material.
- Structured imported source previews are summarized or redacted.
- Safe title/source/status/persona/privacy/provenance context remains visible.
- Grouped owner readback still works.
- The page does not expose raw source bodies, transcript dumps, provider payloads,
  raw URLs, raw JSON, SQL, stack traces, or secret-shaped values.

Light read-only regression spot checks:

- `/studio/export`
- Replay persona Archive/File page

Check:

- Export trust/readback boundaries remain visible and safe.
- Persona import-source/archive readback remains visible and safe.
- Do not create a new export unless the hosted UI has no existing package to
  inspect.
- Do not upload files, retry imports, or mutate archive data.

## Pass Criteria

Return `PASS` if:

- Hosted freshness is at or after `ad1704d9`.
- `/studio/archive` no longer renders raw JSON-shaped source material.
- The redacted/summary text remains owner-useful.
- Export/import spot checks remain safe.

Return `PASS WITH CAVEAT` if:

- The repaired route is safe, but available archive data is thin.
- The caveat is narrative/demo completeness only, not privacy or safety.

Return `FAIL` if:

- Raw JSON-shaped source material still appears in visible archive result cards.
- The repair over-redacts all useful title/source/status/persona/provenance
  context.
- Export/import spot checks regress.
- Private IDs, raw URLs, raw JSON, SQL, stack traces, provider payloads, or
  secret-shaped values are visibly exposed.

Return `BLOCKED` only for stale hosted deploy, unavailable staging, or missing
credentials.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether the PR378 `/studio/archive` defect is gone.
- Whether export/import spot checks still pass.
- Exact defects and route names if DAEDALUS needs repair.
