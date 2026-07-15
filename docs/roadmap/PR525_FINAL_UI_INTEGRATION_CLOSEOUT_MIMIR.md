# PR525 - Visual Foundation Closeout

> Superseded completion label, 2026-07-15: product-owner correction
> `6ee89b5a` retains PR525A-H as accepted visual-foundation evidence but rejects
> the claim that overall Station UI integration is complete. PR527 now owns the
> working-and-pretty hosted product gate.

Owner: MIMIR / A1

Date closed: 2026-07-15

Current status:

```text
CLOSE_PR525_VISUAL_FOUNDATION_ACCEPTED_PRODUCT_UI_INTEGRATION_REMAINS_OPEN
```

Superseded historical label:

```text
CLOSE_PR525_UI_INTEGRATION_ACCEPTED_AND_RESTORE_MAINLINE_PAUSE
```

## Decision

PR525 is closed accepted as Station's Discern-informed visual foundation. Its
implemented companion/UI translation, independent review, and hosted light and
System/Light/Dark evidence remain valid. No correction remains open inside the
bounded PR525 visual sequence.

That evidence did not exercise the supported product's complete mutation,
readback, refresh, cleanup, failure-recovery, and real-content journeys. PR527
therefore reopens only UI/product completeness. The existing PR524B blocker and
unrelated Phase 3 product expansion remain paused.

## Accepted Sequence

| Lane | Accepted result |
| --- | --- |
| PR525A | Rendered parity specification for Discern source `de7b918e`, with measurable desktop and mobile composition rather than wholesale source import. |
| PR525B | Shared warm Station frame and exact `46px` global navigation. |
| PR525C | General Studio dashboard and minimal `156px` desktop rail. |
| PR525D | Full-height companion home, persona/thread disclosures, shortcuts, and responsive shell. |
| PR525E | Compact chat header, bounded log, truthful states/actions, message treatment, and exact `66px` composer. |
| PR525F | Honest three-column Forums index using real current routes and data only. |
| PR525G | Hosted light-parity rehearsal across public/private desktop and narrow routes. |
| PR525H | Shared System/Light/Dark preference, semantic dual-theme treatment, hostile review, and hosted dual-theme rehearsal. |
| PR526A/B | Fresh Discern head `ff93308b` audited and its guided-task ideas bounded; no source action engine or implementation was silently imported. |

## Product Result

- Public and private Station surfaces now share one restrained visual frame
  instead of presenting as unrelated generic dashboards.
- Studio keeps a quiet workbench hierarchy while the exact persona route is a
  complete companion home with Memory/Inbox/Timeline/Profile/Integrity access,
  URL-backed thread selection, and return-to-thread actions.
- Companion chat retains real streaming/provider/archive/candidate behavior,
  exposes owner-visible failures, and does not fabricate live actions.
- Forums uses the measured rail/feed/context composition while retaining only
  supported categories, subcommunities, recognition/report routes, and honest
  loading/error/empty states.
- The appearance control offers exactly System, Light, and Dark before first
  paint, follows live system changes, persists explicit browser-local choices,
  and remains isolated from account/private data.
- Desktop, `390px`, and `375px` navigation, Studio, companion, chat, Forums,
  and observatory boundaries are measured and frozen by tests and rehearsal.

## Review Corrections Retained

The accepted result includes ARGUS's narrow corrections across the sequence:

- mobile Studio disclosure selection and long-name truth;
- companion inherited padding, mobile wrapping/height, and focus return;
- assistant mutation failures, bounded archive/error visibility, and warm
  hover treatment;
- unsupported Forums `Feeds` framing corrected to `Navigate`;
- denied browser storage no longer strands auth/navigation;
- dark Discover selected-tab contrast corrected from `1.16:1` to `13.55:1`;
- the Developer Space node-field interior is isolated from global theme
  inheritance while its surrounding Station frame responds to appearance.

## Deliberate Deviations

These are accepted translation decisions, not missing parity:

1. Discern global CSS, skin, removed persona topbar/right panel, and
   Discern-only product assumptions were not imported.
2. Commit `99ae8a5c` remains lineage context; PR525's measured visual source is
   `de7b918e`, reconciled against fresh head `ff93308b` by PR526A/B.
3. Discern's generic flow runner, `POST /flow/generate`, hard-coded provider,
   private localStorage draft model, replacement flows, and ambiguous-success
   behavior were rejected. PR526C-F remain proposals only.
4. Unsupported Forum ranking, voting, activity, feed, provenance, posting-mode,
   and hard-coded Salon controls were omitted rather than rendered as no-ops.
5. The public Developer Space visualization remains a bounded product interior
   rather than being recolored by broad global theme selectors.
6. Existing advanced Studio capabilities remain reachable through truthful
   secondary navigation rather than being removed to mimic a screenshot.

## Hosted Proof

PR525G passed the accepted light composition on ready Railway web/API services
at `0e090a0c` across 12 signed-out/replay-owner desktop and mobile cases.

PR525H passed the final exact-SHA rehearsal at `857a7e73` across 45 System,
Light, and Dark cases covering signed-out Discover, Forums, and the public
Developer Space observatory plus replay-owner Studio and companion/chat at
`1440x900`, `390x844`, and `375x812`.

The final hosted matrix proved first-paint resolution, live System changes,
explicit persistence, auth isolation, refresh, complete menus, keyboard/touch
operation, focus return, semantic contrast, exact frozen geometry, observatory
isolation, visibility boundaries, zero page errors, and zero horizontal
overflow. It performed no hosted product mutation.

Authoritative evidence:

- `docs/roadmap/PR525G_HOSTED_LIGHT_PARITY_REHEARSAL_CLOSEOUT_MIMIR.md`
- `docs/roadmap/PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT_ARGUS_RESULT.md`
- `docs/roadmap/PR525H_SHARED_LIGHT_DARK_THEME_TREATMENT_HOSTED_REHEARSAL_RESULT.md`

## Parked And Blocked

- PR526C-F guided-task implementation proposals remain parked. They require a
  later explicit product decision and their documented server-owned action,
  reconciliation, authorization, provenance, and draft-state contracts.
- PR524B generated-material publication hosted proof remains blocked on hosted
  Supabase/RPC/schema freshness for generated scopes. Its next valid action is
  a hosted proof rerun after that external state is corrected.
- Provider/setup and transient Forum-state evidence that cannot be safely
  forced on hosted services retains accepted local proof; this does not block
  the implemented route/theme integration.
- Redis, Cloudflare, retrieval, billing, providers, background work, and other
  backend/product lanes are neither completed nor reopened by this closeout.

## Superseded Mainline Pause

This was the terminal state recorded at `01b89902`. Product-owner correction
`6ee89b5a` explicitly superseded it and opened PR527 without reopening PR524B
or broader Phase 3 work.

PR527 is the active UI Product Completeness Definition and Hosted Journey
Inventory. ARIADNE owns its first human/product inventory baton.

## Validation

| Check | Final truth |
| --- | --- |
| Latest local Studio UI suite | Pass, `261/261`. |
| Community suite | Pass, `48/48`. |
| Developer Space suite | Pass, `61/61`. |
| Auth suite | Pass, `22/22`. |
| Web typecheck and lint | Pass. |
| Hosted light rehearsal | Pass at exact accepted SHA. |
| Hosted System/Light/Dark rehearsal | Pass, 45 cases at exact accepted SHA. |
| Scope/privacy | No secret/private evidence committed; no API/schema/provider/dependency expansion entered. |
| Closeout changes | Documentation and agent wake-state only. |
