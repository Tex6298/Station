# PR525A - Discern Rendered Visual Parity Specification

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
OPEN_RENDERED_PARITY_SPECIFICATION
```

## Mission

Produce the implementation-grade visual specification for PR525 by comparing
the rendered final Discern tree at `de7b918e` with current Tex Station.

This is not another audit asking whether a safe delta exists. The product owner
has already required visual rectification. Your job is to measure and lock what
DAEDALUS must reproduce, identify where newer Tex capability belongs in the
composition, and record only concrete justified deviations.

## Reference Rules

- Render `de7b918e` as the final source of truth.
- Use `99ae8a5c` only to understand lineage; do not add its removed Studio
  topbar or right panel to the final target.
- Treat both trees read-only during this lane. Do not implement or merge source
  code in PR525A.
- Use representative equivalent data and route state where practical. Do not
  mutate hosted customer/replay data merely to improve a screenshot.
- Keep temporary screenshots and credentials uncommitted. Redact private IDs
  and content in the written result.

## Required Render Matrix

Capture and inspect side by side:

| Surface | States | Viewports |
| --- | --- | --- |
| Global navigation | signed out public; signed in owner; active Studio | desktop, `390px`, `375px` |
| Persona companion route | new chat; populated active thread; return-to-thread state; provider/error state if available | desktop, `390px`, `375px` |
| Studio rail/workspace | one persona and representative multi-persona/thread state | desktop, `390px`, `375px` |
| Forums index | loading/empty only if naturally encountered; normal category data is primary | desktop, `390px`, `375px` |

Use the final reference's own rendered hierarchy. Do not assess parity from file
presence, class names, or functional checklists alone.

## Measurement Ledger

For each surface, record Discern and Tex values or visibly testable descriptions
for:

- canvas, panel, border, text, muted-text, accent, user-message, and assistant-
  message colors;
- top-nav height, rail width, content width, page padding, panel radius, border
  weight, vertical rhythm, and first-viewport occupancy;
- heading/body/meta/composer type size and weight;
- conversation/header/shortcut/thread/composer placement and dominance;
- chat bubble width, alignment, padding, spacing, and action reveal behavior;
- rail information density, thread visibility, labels, and repeated navigation;
- mobile collapse, horizontal scrolling, sticky elements, composer placement,
  and document overflow;
- forums column proportions, card density, category/community navigation,
  context rail, mobile stacking, and live-control treatment;
- global navigation link count, active treatment, account controls, and visual
  weight.

## Capability Placement Ledger

Map every current Tex capability displaced by the final composition to one of:

```text
Retain in first viewport
Retain behind disclosure
Retain on existing secondary route
Retain below the conversation workspace
Concrete justified visible deviation
```

At minimum cover Memory, Inbox, Timeline, Profile, Integrity, Canon, Archive,
provider setup, Runtime Context, encounters, publishing, export, moderation,
and Advanced Studio. Nothing may disappear silently.

## Honest-Behavior Reconciliation

The reference forums include visual treatments around activity, voting, sorting,
posting modes, and salons. Distinguish composition from unsupported behavior.
Specify how current real Tex data and controls occupy the same visual hierarchy;
do not require fabricated counts, fake activity, or no-op controls.

Likewise, preserve current owner-only and public visibility boundaries even when
the reference tree is less explicit.

## Required Output

Commit one PR525A result containing:

1. a concise side-by-side visual verdict;
2. the measurement ledger;
3. the capability placement ledger;
4. a complete visible-deviation ledger with reasons;
5. an exact current-Tex file/component map;
6. a proposed implementation slice order with the first DAEDALUS slice small
   enough to review but large enough to establish the shared composition;
7. desktop, `390px`, and `375px` pass/fail observations for both trees;
8. any rendering blocker stated precisely rather than converted into an
   assumption.

Do not close with `no remaining safe delta`, `Tex-native translation`, or a
functional-equivalence verdict. The acceptance question is whether the final
Discern interface is recognisable in the planned Tex implementation.

## Handoff

Commit the result and wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR525A rendered visual parity specification.
Task:
- Lock the implementation slices from the measured result and wake DAEDALUS
  with the first exact patch.
```

Do not return to wait without a committed result or an exact rendering blocker.
