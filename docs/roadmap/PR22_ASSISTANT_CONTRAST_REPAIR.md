# PR22 Station Assistant - Contrast Repair

Status: implemented by A2 / DAEDALUS; ready for ARIADNE rerun
Owner: DAEDALUS focused UI patch, ARGUS optional if implementation touches more
than styling/helpers, ARIADNE rerun after patch.

## Blocker

ARIADNE accepted the PR22 operational behavior but blocked closeout on live
readability at `/studio/assistant`.

Railway runtime checked: `da60378b3c041df2a9a9e4b16416610a9cd3ef20`

Observed:

- global visual reconciliation changes the Assistant page background from the
  inline dark value to the Station light surface;
- the page title and lede keep dark-theme light text colors;
- desktop and `375px` mobile first-screen title/lede are too low contrast.

The action cards, links, chips, no-mutation posture, no-persona posture, and
visible leak checks passed.

## Task

Patch `/studio/assistant` contrast/readability only.

Acceptable approaches:

- align `StationAssistantPanel` to Station light surface tokens; or
- isolate this route so the intended dark surface remains coherent.

Whichever approach is smaller, ensure these remain readable on desktop and
`375px` mobile:

- page title;
- lede/helper copy;
- operational helper eyebrow;
- starter prompts;
- reply block;
- action cards;
- status/kind/priority chips;
- recent-import rows.

## Preserve

- owner-scoped Assistant API behavior;
- sanitized action data;
- exact action-card links;
- link-only action semantics;
- `operational_helper_not_persona` guardrail;
- no fake mutation controls.

## Do Not Add

- autonomous Assistant execution;
- Memory/Canon writes;
- publishing/export/candidate/integrity mutation from Assistant;
- provider calls;
- backend semantics;
- auth changes;
- broad reskin scope.

## Validation

Minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If only CSS/style constants change, broader backend gates are not required.

## Implementation

DAEDALUS aligned `StationAssistantPanel` to the established Station light page
tokens instead of preserving dark inline colors that conflicted with the global
light-surface reconciliation.

Changed only `/studio/assistant` presentation constants:

- route background and text;
- panels and reply block;
- title, lede/helper copy, eyebrow, prompts, guardrail copy;
- action cards, status chips, and recent-import rows.

Preserved Assistant API semantics, owner scoping, sanitized action data, exact
links, link-only action semantics, and `operational_helper_not_persona`.

Validation on 2026-06-18:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 17 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:assistant` | Pass, 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `git diff --check` | Pass, CRLF normalization warnings only. |

## Handoff

After patching, wake ARIADNE for a narrow rerun of `/studio/assistant` on:

- desktop around `1440x1100`;
- mobile around `375x812`.
