# PR497 - Discern UI Usability Parity Audit Result

Date: 2026-07-06

Owner: ARIADNE / A4

State: `ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION`

## Summary

ARIADNE audited Discern commits `de7b918e` and `99ae8a5c` against the current
Tex companion/persona home/chat surface.

The previous safe translation work carried over real function: shortcut routes,
Memory Inbox separation, return-to-thread controls, scoped chat polish, provider
setup safety, context rail, Runtime Preview separation, Assistant boundaries,
and owner-only route posture. The remaining gap is not a missing backend feature.
It is product hierarchy: the current persona home still asks users to parse
admin/readback machinery before the screen feels like a private companion
workspace.

Recommendation:

```text
ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION
```

The smallest safe lane is a web-only persona-home translation that makes the
companion chat and immediate continuity actions the first experience, while
moving operational diagnostics lower or into secondary sections.

## Audit Table

| Discern delta | Carried over faithfully | Translated differently and why | Rejected / ignored and why | Still should bring into Tex | Concrete blocker |
| --- | --- | --- | --- | --- | --- |
| Companion chat as complete companion home | Private `PersonaChat`, first greeting, return-to-thread card, candidate review, Memory/Canon save actions, streaming status, and provider setup copy exist. | Tex embeds chat inside a broader persona dashboard so the safety/readback surfaces remain visible. | Full shell swap and hidden-admin assumptions were correctly rejected. | Put chat, companion identity, and a small next-action rail first; keep diagnostics lower or folded. | None; web-only layout/copy. |
| Memory inbox / continuity candidate inbox | `/studio/personas/:id/memory-inbox`, Assistant safe route, and companion shortcuts exist. | The inbox is still one route among many, not a natural care loop from the companion home. | Direct `/conversations/candidates/inbox`, `source=all`, and stale Discern API assumptions stay rejected. | Add a visible "Review suggested memory" / "Memory inbox" affordance near chat with aggregate pending context only. | Live pending-only count needs a separate API; aggregate existing counts do not block PR497A. |
| Shortcut strip | Memory, Inbox, Timeline, Profile, and Integrity are present through `studioPersonaCompanionShortcuts`. | Tex presents them as dashboard navigation, preserving accepted owner routes. | Tool-like or automation-implying controls stay out of scope. | Make the strip feel like companion actions: "Review memory", "Open timeline", "Tune profile", "Run integrity". | None. |
| Return-to-thread UX | Continue, Summarize, and Start fresh are local owner-triggered actions. | Tex keeps procedural wording to avoid durable presence claims. | Auto-resume, auto-summary sends, and durable presence claims stay rejected. | Softer labels: "Pick up where you left off", "Ask for recap", "Start fresh". | None. |
| Capability / presence prompt context | Provider setup, Runtime Context Preview, and Assistant boundaries already make capability safer. | Prompt/runtime changes were not imported, which was correct because this can overclaim behavior. | Direct prompt/runtime drift, unsafe autonomy, and unproved presence claims stay rejected. | UI-only wording may say the surface is conversation-first when backed by existing behavior. | Prompt/runtime changes need ARGUS; not needed for PR497A. |
| Local chat polish | Scoped `.studio-persona-chat-*` polish, message actions, provider setup, return card, and no placeholder controls are present. | Tex is safer and denser, but less warm. | Placeholder attach/mic/tools, global CSS imports, and public bleed stay rejected. | Increase chat prominence; simplify header, empty, loading, and error states as private companion workspace states. | None; require visual/mobile proof. |
| Studio chat layout / right rail from `99ae8a5c` | Current sidebar/context rail/mobile summaries cover part of the intent. | Tex kept the existing shared Studio shell to avoid broad regression. | Full topbar/sidebar/right-panel replacement is too broad for this lane. | Translate only the persona-home first-viewport idea. | Broad shell work needs design-first planning, not PR497A. |
| Context rail | `CompanionHomeContextRail` has owner-only links and aggregate counts; Runtime Preview remains separate. | Accurate, but it reads more like a dashboard rail than companion context. | Raw private lists or thread rows stay rejected. | Rename/reframe around "what this companion is carrying" with aggregate counts, action links, and boundary copy. | None. |
| Topbar/sidebar simplification | Current shell keeps structural Station distinctions intact. | Discern simplified navigation more aggressively, but risked flattening Studio/Space/Archive boundaries. | Broad shell replacement stays rejected. | Keep shell; reduce persona-home first-viewport burden. | Later shell simplification should be design-first. |
| Current Tex admin-console feel | The current surface is truthful and legible. | It front-loads readiness gates, public interaction readback, avatar/voice/encounter/runtime/export/published panels before relationship. | Hiding safety warnings entirely would weaken trust. | Reorder/condense: companion header, chat, action strip, compact rail first; public interaction/voice/avatar/encounter/runtime/export/published lower or secondary. | None; preserve boundaries and mobile fit. |
| Visual/layout changes as product behavior | Trust labels and context exist. | PR497 shows hierarchy is product behavior, not cosmetic skin. | Visual-only reskin, one-off palette drift, or unsafe CSS imports stay rejected. | Treat first-viewport hierarchy, state copy, control prominence, and mobile spacing as acceptance criteria. | None. |

## Product Judgment

The current Tex persona home is safe and useful, but it still asks a user to
understand Station as a control panel before it lets them feel the companion
workspace. Discern's useful correction was not the exact CSS or shell; it was
the product choice to make the chat, continuity loop, and next action obvious
before diagnostics and setup machinery.

That correction should be translated narrowly into Tex.

## Recommended PR497A Scope

Target files:

- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/lib/companion-home-context.ts`
- `apps/web/lib/studio-navigation.ts`
- `apps/web/app/globals.css`
- `apps/web/lib/companion-home-context.test.ts`
- `apps/web/lib/studio-navigation.test.ts`
- `apps/web/components/studio/persona-chat.test.ts`

Behavior:

- Make the persona home first viewport companion-first: identity/header, private
  chat, immediate continuity actions, and compact context.
- Keep the shortcut strip close to the chat and label it as companion action,
  not generic navigation.
- Keep return-to-thread actions local and owner-triggered, but warm the labels.
- Reframe the context rail as aggregate companion continuity context.
- Move public interaction readback, voice/avatar readiness, encounter contracts,
  Runtime Context Preview, archive export, and published continuity history lower
  or into secondary sections without hiding critical safety copy.
- Improve private chat empty/loading/error copy without creating new backend
  claims.

Boundaries:

- No global CSS or broad Studio shell/topbar/sidebar rewrite.
- No privacy, visibility, quota, storage, billing, provider, runtime, schema,
  RLS, Redis, Cloudflare, queue, or background-job changes.
- No stale Discern endpoints, `source=all`, query-selected conversation behavior,
  placeholder controls, or unbacked autonomy/tool/browse/edit claims.
- No durable presence claims beyond existing local chat behavior.

Required validation for implementation:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

After ARGUS accepts implementation, ARIADNE should perform hosted desktop,
`375px`, and `390px` proof on `/studio/personas/:personaId`.

## Explicit Non-Recommendations

- Not `ACCEPT_PR497A_STUDIO_CHAT_LAYOUT_TRANSLATION`: the broad shell rewrite is
  too large and too regression-prone.
- Not `ACCEPT_PR497A_DISCERN_UI_MICROCOPY_AND_VISUAL_HIERARCHY`: microcopy alone
  is too small; the first-viewport hierarchy needs to change.
- Not `DESIGN_FIRST_DISCERN_UI_TRANSLATION`: useful later for shell-level
  planning, but not required for the narrow companion-home correction.
- Not `NO_SAFE_DISCERN_UI_DELTA_WITH_REASON`: there is a safe, concrete delta.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed PR497 Discern UI usability parity audit.
- Tex carried over safe function, but the current persona home still feels too
  admin-heavy before it feels like a companion workspace.
- Recommended ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION as a web-only,
  persona-home-first lane.

Next:
- Route DAEDALUS for the narrow companion-home usability translation, or adjust
  scope if MIMIR wants design-first broad shell work instead.
```
