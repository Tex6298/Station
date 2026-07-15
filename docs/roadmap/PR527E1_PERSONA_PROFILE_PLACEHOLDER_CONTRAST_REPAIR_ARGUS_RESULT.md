# PR527E1 - Persona Profile Placeholder Contrast Repair ARGUS Result

Owner: ARGUS / A3

Reviewed commit: `c8bceb1df006da3a29d248d0fe7a742e7227c627`

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527E1_PERSONA_PROFILE_PLACEHOLDER_CONTRAST_REPAIR
```

## Verdict

ARGUS accepts the bounded Persona Profile placeholder repair. The implementation
changes only the route-scoped Avatar URL and Context handoff pseudo-elements,
mixes existing semantic page tokens, and sets explicit placeholder opacity.
It does not alter field values, controls, layout, theme tokens, mutations, or
any broader Profile, Settings, auth, API, hosted, or provider behavior.

The focused source assertion is not sufficient by itself, so ARGUS independently
rendered the real owner Profile route with intercepted synthetic reads. All `18`
required samples pass the `4.5:1` normal-text floor:

| Appearance | Resolved appearance | Viewports | Avatar URL | Context handoff |
| --- | --- | --- | ---: | ---: |
| System | Dark | `1440x900`, `390x844`, `375x812` | `7.55:1` | `7.55:1` |
| Light | Light | `1440x900`, `390x844`, `375x812` | `5.32:1` | `5.32:1` |
| Dark | Dark | `1440x900`, `390x844`, `375x812` | `7.55:1` | `7.55:1` |

Every sample had computed opacity `1`. The Avatar control remained `43px` high,
the handoff control remained `96px` high, theme changes did not shift either
control, focus retained a visible `2px` or stronger outline, and horizontal
overflow remained zero. Page errors, console errors, unknown intercepted API
calls, failed API responses, and product writes were all zero.

DAEDALUS measured `5.35:1` in its System/Light environment and `7.53:1` in Dark.
ARGUS's independent Chromium pixel normalization produced the slightly different
passing values above. Both results remain honestly above the required floor.

## Scope Review

The implementation changed exactly the two allowed product paths:

```text
apps/web/app/globals.css
apps/web/lib/public-persona-route.test.ts
```

The CSS remains under `.persona-profile-field`; no global placeholder selector,
hard-coded color, new theme token, viewport-sized type, or layout override was
introduced. The source test locks the route scope, semantic mix, and opacity.

No Cloudflare, hosted runtime, queue, partner adapter, OAuth, connector, billing,
Settings, package, lockfile, schema, auth, or broader Profile product path changed.

## Validation

| Command / proof | ARGUS result |
| --- | --- |
| Focused public Persona route test | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `264/264` |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass |
| Independent intercepted browser matrix | Pass, `18/18`; minimum `5.32:1` |
| Focus, geometry, overflow, and diagnostics | Pass |
| Hosted/product writes in this proof | `0` |

The local server and disposable browser harness were removed. No screenshot,
trace, session, private id, response body, or other proof artifact remains.

## Claim Boundary

This accepts the local placeholder repair only. PR527E still requires MIMIR to
decide the bounded hosted rerun; this result does not close PR527E or claim that
ARIADNE has remeasured the deployed page.
