# PR528B1 - Principal Route Theme Repairs DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for ARGUS review

```text
READY_PR528B1_PRINCIPAL_ROUTE_THEME_REPAIRS_FOR_ARGUS
```

## Implemented Scope

DAEDALUS changed only the three authorized visual treatments:

1. `DocumentTrustReadback` now uses Station page accent, text, and muted tokens
   with the existing semantic info, success, and warning row surfaces. Document
   body, provenance, visibility, discussion, and owner semantics are unchanged.
2. Shared `.archive-trust-copy` now uses `--station-page-muted`. Its existing
   Memory Inbox, Archive Connector, import review, and persona Archive consumers
   remain on semantic Studio surfaces in both themes.
3. Global Archive's local primary action now uses
   `--station-page-on-strong` against `--station-page-text`. The exact
   `Ask Assistant` link uses local custom properties to switch to the existing
   accent pair on hover, plus a visible accent focus outline. Its destination
   remains `/studio/assistant`.

No API, auth, persistence, provider, hosted data, configuration, corpus,
publishing behavior, candidate action, Archive search/import behavior, or
other route treatment changed.

## Focused Contract Proof

`apps/web/lib/theme.test.ts` now locks the three route contracts and computes
WCAG contrast from the actual Light and Dark Station token definitions.

The tested meaningful-text combinations cover page surface, soft row, success
row, and warning row backgrounds with page text, muted text, and accent text.
Strong-action text is checked against both page-text and accent backgrounds.
The lowest accepted token pair is `4.54:1`.

## Rendered Browser Proof

A temporary intercepted local Playwright matrix exercised the three real pages
in Light and Dark at `1440x900` and `390x844`: `12/12` cases.

| Check | Result |
| --- | --- |
| Meaningful rendered contrast | Pass; `72` samples, minimum `4.60:1` |
| Global Archive base action boundary | Pass; minimum `13.96:1` |
| Corrected hover/focus rerun | Pass; `4/4` cases, minimum text `6.93:1`, minimum hover/focus boundary `6.24:1` |
| Memory candidate controls | Pass; Reject and Accept-with-edits remained enabled, focusable, and accompanied by Source, Destination, and State labels |
| Linked discussion | Pass; actual navigation opened `/forums/documents-and-codexes/thread-proof` |
| Signed-out owner controls | Pass; `0` exposed |
| Horizontal overflow / viewport escape | Pass; `0` cases |
| Page errors / console errors | Pass; `0` / `0` |
| Failed requests / HTTP failures / unknown API reads | Pass; `0` / `0` / `0` |
| Product writes | Pass; `0` |

The browser harness used public-safe synthetic local fixtures and intercepted
every API request. No hosted service, credential, private row, or configuration
was read or changed. The temporary harnesses and local servers were removed
after proof; no screenshot or evidence artifact remains.

Next dev reported the inherited Autoprefixer mixed-support warning at unrelated
`globals.css` line `740`; the changed blocks did not produce a warning and the
web lint gate remains warning-free.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/theme.test.ts` | Pass, `9/9` |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, `266/266` |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass, `26/26` |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass, `4/4` |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web lint` | Pass, zero warnings/errors |
| `git diff --check` | Required immediately before commit |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed the three route-scoped PR528B1 theme repairs with focused Light/Dark desktop/mobile proof.
Verdict:
- READY_PR528B1_PRINCIPAL_ROUTE_THEME_REPAIRS_FOR_ARGUS
Task:
- Route ARGUS review without disturbing the parallel corpus/provider preflight.
```
