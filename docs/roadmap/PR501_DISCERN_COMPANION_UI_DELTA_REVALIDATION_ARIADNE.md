# PR501 - Discern Companion UI Delta Revalidation

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-06

Status: Open human-eye preflight

## Why This Lane Exists

Marty sent a fresh A1 wakeup asking MIMIR to inspect the recent
Discern-AI/Station companion/UI commits and open a numbered Tex Station lane
to translate the useful product behavior without importing Discern's skin.

Reference commits:

- `de7b918e` - `feat: refine Station companion UX`
- `99ae8a5c` - `feat: refine Studio chat layout`

MIMIR confirmed those references were already processed in earlier Tex lanes:

- PR485A-E: shortcuts, Memory inbox, return-to-thread, prompt-context and
  chat-polish slices.
- PR494 / PR494A / PR494B: companion context rail and no-remaining-delta
  review.
- PR497 / PR497A / PR497B: Discern UI usability audit, companion-home
  hierarchy translation, and hosted scroll-containment repair.

Because the wakeup is concrete and current, do not dismiss it as stale without
a fresh human-eye check. The point of PR501 is to verify current HEAD still
matches the intended Discern-derived companion product direction after later
lanes, then name either the exact remaining DAEDALUS slice or the exact reason
there is no safe remaining delta.

PR500A Social Publishing credential-contract work is accepted but not opened in
this lane. Keep it as ready backlog; do not mix social connectors into PR501.

## Product Question

Does current Tex Station still carry the useful companion/UI behavior from the
Discern reference commits in its own architecture and visual language?

Assess these targets from a human-eye owner route, not just source search:

- companion chat as a more complete companion home;
- Memory inbox / continuity candidate inbox as a natural care loop;
- companion shortcut strip: Memory inbox, Timeline, Profile, Integrity;
- return-to-thread UX: continue, summarize, start fresh;
- companion capability/presence prompt context without overclaiming autonomy;
- local chat surface polish where it improves Station without importing
  Discern's shell or global CSS.

## ARIADNE Task

1. Inspect the current Tex implementation and the prior PR494/PR497 closeouts.
2. Compare against the two Discern reference commits as product references, not
   patches.
3. Run a human-eye route check on the current companion/persona surface,
   including desktop and narrow mobile if a hosted or local route is available.
4. Decide one of the outcomes below and wake MIMIR.

## Accepted Outcomes

```text
ACCEPT_PR501A_COMPANION_UI_DELTA_TRANSLATION
```

Use this only if there is a concrete missing behavior that is distinct from
PR485A-E, PR494A, and PR497A/B. Include the smallest DAEDALUS slice, files,
acceptance criteria, and hosted/browser proof needed.

```text
CLOSE_PR501_NO_REMAINING_SAFE_DELTA
```

Use this if current Tex still carries the safe Discern-derived behavior and the
remaining Discern material is duplicate, unsafe, broad shell/skin work, or
unsupported by current product architecture.

```text
ROUTE_PR501A_COMPANION_UI_DEFECT_FIX
```

Use this if the intended behavior exists in code/docs but is broken, hidden,
or misleading in the live/human route. Name the exact defect and the smallest
repair lane.

```text
BLOCK_PR501_WITH_CONCRETE_REASON
```

Use this only for a real external blocker, such as unavailable hosted auth,
missing reference access, or a product decision that cannot be inferred from
the repo.

## Guardrails

- Do not wholesale import Discern global CSS.
- Do not broad-reskin unrelated pages.
- Do not replace the Studio shell, topbar, sidebar, or right rail unless a
  later design-first lane explicitly accepts that scope.
- Do not import stale Discern endpoints such as
  `/conversations/candidates/inbox`, `source=all`, query-selected
  conversation behavior, or placeholder controls.
- Do not add durable presence, autonomy, browsing, editing, tools, attachment,
  mic, provider/runtime, prompt, migration, API, queue, Redis, Cloudflare,
  billing, Stripe, connector, OAuth, or public-chat behavior.
- Keep private Memory, Canon, Archive, Continuity, Integrity, provider config,
  prompts, raw ids, cookies/headers, tokens, and source bodies private.
- Translate product behavior into Tex Station's current design system.

## Suggested Validation

If this remains audit/preflight only:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If ARIADNE opens a DAEDALUS repair/translation slice, specify the exact focused
tests and whether hosted desktop/375px/390px rehearsal is required after ARGUS
review.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- MIMIR received a fresh A1 wakeup to inspect Discern commits de7b918e and
  99ae8a5c and move the next product lane toward companion/UI translation.
- PR485A-E, PR494A/B, and PR497A/B already claim the safe Discern-derived
  companion behavior, but this needs a fresh human-eye revalidation against
  current HEAD before DAEDALUS touches code.
- PR500A social credential-contract work is accepted backlog, not part of this
  UI lane.
Task:
- Run PR501 as a human-eye preflight.
- Decide whether there is a concrete remaining companion/UI delta, an actual
  route defect, no remaining safe delta, or a concrete blocker.
- Wake MIMIR with the verdict and exact next owner if implementation is needed.
```
