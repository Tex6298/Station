# PR525 - Discern Final Visual Composition Rectification

Owner: MIMIR / A1

Date opened: 2026-07-14

Status:

```text
OPEN_RECTIFICATION_SEQUENCE
```

## Corrected Product Premise

The requested Discern work was primarily a visual and interaction-design
correction. Earlier Tex lanes preserved useful behavior and safety but then
treated the authored composition as optional reference material. That inverted
the product priority.

Passing functional, privacy, accessibility, responsive, and route gates does
not prove visual carry-over. PR523D fixed entry discoverability only. PR525 must
make the final Discern interface recognisable in Tex Station while preserving
the newer safe product underneath it.

## Source Of Truth

Use the rendered final Discern tree at:

```text
de7b918e - feat: refine Station companion UX
```

Commit `99ae8a5c` is supporting lineage only. It introduced a Studio topbar and
Memory/Canon/Archive right panel that `de7b918e` deliberately removed from the
final persona route. PR525 must not combine both commits or resurrect those
superseded intermediate components.

The Discern source is a visual/compositional reference, not a patch to merge.

## Visible Target

PR525 must faithfully recover the final composition, including:

- the restrained warm-light palette and thin-border visual system across
  global navigation, Studio, and forums;
- the compact `46px` global navigation with low visual weight;
- the full-height, conversation-dominant Studio workspace;
- the final narrow, minimal persona/workspace rail rather than the current wide
  dark navigation and full thread-directory treatment;
- tight spacing, compact typography, soft blue user messages, warm-neutral
  assistant messages, hover-revealed message actions, and a small composer;
- first-viewport hierarchy that keeps the conversation primary and moves newer
  administrative/diagnostic capability behind disclosure or secondary routes;
- the restrained forum composition from the final tree, adapted to real Tex
  data and working controls rather than fabricated counts or no-op filters;
- the same composition at desktop, `390px`, and `375px`, with responsive changes
  limited to fitting the layout rather than redesigning it.

## Capability Preservation

Keep Tex's newer safe behavior beneath the corrected interface:

- owner/persona/privacy boundaries;
- URL-backed thread selection and race protection;
- honest Memory, Continuity, Canon, Archive, and Integrity state;
- provider setup and failure states;
- encounters, publishing, exports, moderation, and Advanced Studio routes;
- accessible names, keyboard behavior, focus, reduced motion, and contrast;
- public/private/community visibility truth.

Newer or administrative capability may move behind an appropriate disclosure,
secondary navigation, or existing dedicated route when it distorts the intended
first viewport. It must not be deleted merely to make the screenshot match.

## Permitted Deviations

A visible deviation requires a concrete accessibility, privacy, security, data-
truth, or technical incompatibility. Record each deviation with:

```text
Discern source behavior
Tex behavior
Reason the visible match is unsafe or impossible
Closest faithful treatment retained
```

`Tex-native translation`, broad regression risk, familiarity with the current
skin, or a previous behavior-only acceptance is not a sufficient waiver.

Unsafe Discern backend assumptions, stale endpoints, `source=all`, fabricated
activity/vote counts, no-op sort controls, unsupported capability claims, and
secret/private-data exposure remain forbidden. Preserve the composition while
binding it to honest Tex behavior.

## Sequence

1. **PR525A - Rendered Visual Parity Specification**: ARIADNE renders
   `de7b918e` and current Tex side by side and commits a measurable
   implementation specification and deviation ledger. This is not a decision
   on whether to implement; implementation is already required.
2. **PR525B - Shared Warm-Light Frame And 46px Global Navigation** establishes
   the shared tokens and page-height dependency without recoloring Developer
   Space observatory interiors.
3. **PR525C - Studio Dashboard And Minimal Rail Composition** applies the
   `156px` rail, warm first-viewport dashboard hierarchy, mobile collapse, and
   locked capability relocation.
4. **PR525D - Full-Height Companion Shell And Thread Disclosure** makes the
   conversation the dominant workspace and moves the existing URL-backed
   thread directory into an accessible disclosure.
5. **PR525E - Compact Chat Visual System And Honest States** applies the
   measured bubbles, composer, message actions, return flow, and provider/error
   treatments without weakening current behavior.
6. **PR525F - Forums Three-Column Honest Composition** translates the final
   Discern frame using only real Tex categories, subcommunities, recognition,
   reports, actions, and provenance.
7. **PR525G - Hosted Light-Parity Rehearsal** proves desktop, `390px`, and
   `375px` geometry against the PR525A ledger using screenshots and bounding
   rectangles.
8. **ARGUS review per implementation slice**: protect owner, route, data-truth,
   accessibility, and newer-capability boundaries without redistilling the
   visual target.
9. **ARIADNE hosted comparison**: desktop, `390px`, and `375px` side-by-side
   proof plus product-owner recognition closeout.

The Discern-derived light interface comes first. Dark mode follows only after
light parity is accepted, using shared theme tokens so color and contrast change
without changing composition. Dark mode is not PR525A scope.

## Parallel Roadmap State

PR525 corrects an already requested UI integration and does not resume the
paused Phase 3 generated-publication expansion. PR524B remains blocked until
hosted Supabase/RPC/schema accepts the generated consent scopes.
