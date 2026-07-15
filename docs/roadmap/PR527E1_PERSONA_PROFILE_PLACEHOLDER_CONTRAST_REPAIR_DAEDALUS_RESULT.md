# PR527E1 - Persona Profile Placeholder Contrast Repair Result

Owner: DAEDALUS / A2

Date: 2026-07-15

Status: Ready for ARGUS hostile review

```text
READY_PR527E1_PLACEHOLDER_CONTRAST_REPAIR_FOR_ARGUS
```

## Scope

Changed only:

- `apps/web/app/globals.css`
- `apps/web/lib/public-persona-route.test.ts`

The repair is route-scoped to Persona Profile placeholders. No component,
owner/readback logic, navigation, API, schema, auth, package, config, or hosted
product data changed.

## Repair

Added a Persona Profile placeholder rule for:

```text
.persona-profile-field input::placeholder
.persona-profile-field textarea::placeholder
```

The rule uses existing semantic Station page tokens through a scoped
`color-mix(in srgb, var(--station-page-muted) 78%, var(--station-page-text))`
and explicit `opacity: 1`. It does not alter entered text, labels, panels,
controls, global form fields, or another route.

The focused source test now requires the route-scoped placeholder rule, the
semantic token mix, and explicit opacity.

## Validation

| Command / proof | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass, `14/14` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `264/264` |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass |
| `git diff --check` | Pass |

## Rendered Contrast Proof

Temporary local intercepted browser proof served Next at `127.0.0.1:3157`
with API calls intercepted at `127.0.0.1:4999`. No hosted route or product
mutation was reached.

All 18 placeholder samples passed:

| Theme | Viewports | Avatar | Handoff |
| --- | --- | --- | --- |
| System resolved Light | `1440x900`, `390x844`, `375x812` | `5.35:1` | `5.35:1` |
| Light | `1440x900`, `390x844`, `375x812` | `5.35:1` | `5.35:1` |
| Dark | `1440x900`, `390x844`, `375x812` | `7.53:1` | `7.53:1` |

Every sample had placeholder opacity `1`, zero horizontal overflow, zero page
errors, and zero unfiltered browser console errors. The proof filtered only
the existing unrelated local Next dev autoprefixer warning for `globals.css`
line `740`.

Temporary harnesses and the local server were removed. No screenshots,
sessions, tokens, cookies, ids, headers, or artifacts were committed.
