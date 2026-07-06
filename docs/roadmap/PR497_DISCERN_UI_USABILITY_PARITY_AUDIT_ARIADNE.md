# PR497 - Discern UI Usability Parity Audit

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Why This Lane

Foreground watch surfaced an unprocessed A1 correction wakeup at commit
`921b4860`:

```text
wake: reassess Discern UI correction
```

The correction is that our earlier PR494 conclusion was too narrow. We treated
the recent Discern-AI companion/UI changes as mostly functional widgets plus
unsafe/broad skin. Marty is saying the visual/product-owner changes may be the
usability correction: Station may still be too admin-heavy, less warm, and less
obvious than the product should feel.

This lane is not a request to paste Discern global CSS. It is a request to audit
what useful product-feel and simplification we filtered out.

## Reference Commits

Inspect these as reference implementations, not merge patches:

- `de7b918e feat: refine Station companion UX`
- `99ae8a5c feat: refine Studio chat layout`

Relevant changed areas:

- `apps/web/app/globals.css`
- `apps/web/app/studio/layout.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/components/studio/studio-sidebar.tsx`
- `apps/web/components/studio/studio-topbar.tsx`
- `apps/web/components/studio/studio-right-panel.tsx`
- `apps/web/app/studio/personas/[personaId]/memory-inbox/page.tsx`
- `apps/api/src/routes/conversations.ts`
- `packages/ai/src/companion-capabilities.ts`
- `packages/ai/src/companion-presence.ts`

## MIMIR Initial Delta Map

ARIADNE should verify, correct, and sharpen this table from a human-eye product
view.

| Area | Current MIMIR classification | Why |
| --- | --- | --- |
| Companion shortcut strip | Carried over | Tex has Memory/Inbox/Timeline/Profile/Integrity-style owner links through Studio navigation and persona home shortcuts. |
| Memory inbox / continuity candidate inbox | Carried over functionally | Tex has `/studio/personas/:id/memory-inbox`, but the human feel may still read as admin review rather than a natural companion inbox. |
| Return-to-thread controls | Carried over functionally | Tex PersonaChat has Continue, Summarize, and Start fresh, but ARIADNE should judge whether the controls are prominent, warm, and understandable enough. |
| Companion capability/presence prompt context | Carried over with safer boundaries | Tex has private-only capability and same-thread presence prompt context. It avoids public/autonomy overclaims. |
| Companion Home Context Rail | Translated differently | Tex added an owner-only rail and runtime preview separation, but this may preserve a technical dashboard feel instead of a companion home. |
| Studio chat layout from `99ae8a5c` | Translated only partially | Tex has scoped chat polish, but may not have the simpler chat-first layout, warmer right panel, topbar/sidebar composition, or less admin-heavy flow. |
| Discern global CSS and broad shell | Rejected too broadly | Unsafe wholesale CSS import is still rejected, but visual hierarchy, spacing, warmth, and simplified layout choices may be product corrections worth translating. |
| Stale endpoints/source=all/query-selected behavior | Rejected correctly | Do not import stale endpoint assumptions or unsafe query-driven source selection. |
| Placeholder controls/autonomy claims | Rejected correctly | Do not import unwired controls, durable presence claims, or unsupported companion autonomy. |
| Missing likely product-feel delta | Still should bring into Tex if verified | A more complete companion home that feels like working with a companion first, with admin/status material secondary and owner next actions obvious. |

## ARIADNE Task

Perform a Discern-to-Tex usability parity audit focused on product-owner
experience.

Produce:

```text
docs/roadmap/PR497_DISCERN_UI_USABILITY_PARITY_AUDIT_RESULT.md
```

Your result must include a table with these columns:

- carried over faithfully;
- translated differently and why;
- rejected/ignored and why;
- still should bring into Tex;
- concrete blocker if any.

Audit specifically:

- companion chat as a more complete companion home;
- Memory inbox / continuity candidate inbox;
- companion shortcut strip: Memory inbox, Timeline, Profile, Integrity;
- return-to-thread UX: continue, summarize, start fresh;
- companion capability/presence prompt context;
- local chat surface polish;
- Studio chat layout, right rail, topbar, and sidebar simplification from
  `99ae8a5c`;
- whether current Tex persona home/chat feels too much like an admin console;
- what Discern made warmer, simpler, more obvious, more fun, or more useful;
- which visual/layout changes are actually product behavior because they change
  what the owner understands and does first.

## Guardrails

Do not recommend:

- wholesale Discern global CSS import;
- broad reskin of unrelated pages;
- unsafe autonomy/presence claims;
- stale endpoints or Discern-only API assumptions;
- placeholder/unwired controls;
- public/private boundary weakening;
- provider/runtime/schema/billing/Redis/Cloudflare work unless a concrete UI
  dependency proves it is unavoidable.

Do not reject a change merely because it is visual, broad, or hard to classify.
If it makes Station less admin-heavy and easier to use, classify it as a
product-feel candidate and name the smallest safe translation.

## Required Recommendation

End with one recommended next lane:

```text
ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION
ACCEPT_PR497A_STUDIO_CHAT_LAYOUT_TRANSLATION
ACCEPT_PR497A_DISCERN_UI_MICROCOPY_AND_VISUAL_HIERARCHY
DESIGN_FIRST_DISCERN_UI_TRANSLATION
NO_SAFE_DISCERN_UI_DELTA_WITH_REASON
```

If you recommend implementation, give DAEDALUS:

- exact target files;
- exact user-visible behavior to change;
- exact boundaries not to cross;
- required tests;
- whether hosted desktop/375px/390px proof is required.

## Handoff

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- MIMIR parked PR496 before review because foreground watch surfaced an earlier
  A1 correction wakeup.
- The correction says PR494 was too narrow: Discern's visual/product-owner
  changes may be a usability correction, not optional skin.
- PR497 asks ARIADNE to audit Discern commits de7b918e and 99ae8a5c against the
  current Tex companion/persona home/chat experience.
Task:
- Produce the PR497 Discern UI usability parity audit result table.
- End with the smallest concrete next lane to make Tex Station warmer, simpler,
  more obvious, or more useful without importing unsafe Discern assumptions.
```
