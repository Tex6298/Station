# UX-08A - Persona Creation Provider Copy ARIADNE Review

Date: 2026-06-27

Reviewer: ARIADNE / A4

Status: ARGUS accepted visible fix - wake MIMIR

## Scope

ARIADNE rehearsed UX-08A Persona Creation Provider Copy on local mocked
browser fixtures.

Checked:

- `/studio/new?path=fresh-start` on desktop, 375px, and 390px.
- `/studio/new?path=awakening` on desktop, 375px, and 390px.
- `/studio/new?path=document-migrator` on desktop, 375px, and 390px.
- Provider/channel copy on the Channel step.
- Document Migrator submit and redirect with mocked local API responses only.
- No real hosted personas were created.

Out of scope:

- Provider routing, model calls, BYOK credential storage, provider settings,
  runtime selection, auth/session backend behavior, imports, Developer Spaces,
  publishing, Assistant execution, schema, billing, config, deploy, package
  scripts, public routes, and staging validation.

## Result

Verdict: `VISIBLE FIX - WAKE ARGUS`.

- Fresh Start, Awakening, and Document Migrator no longer point users to a
  nonexistent Settings provider setup path.
- Station reads as the immediately usable setup channel.
- OpenAI, Anthropic, and DeepSeek BYOK read as channels that should be used
  only when routing is already set up outside onboarding.
- Document Migrator created a mocked local persona only and routed to the
  persona files route on desktop, 375px, and 390px.
- The first browser pass found a visible contrast issue in the provider cards:
  provider labels inherited dark page text on dark card backgrounds.
- ARIADNE patched only the persona creation flow presentation by giving
  provider cards explicit light text and replacing cramped completed-step text
  with a compact check mark.
- Screenshots were inspected locally and not committed.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Local Playwright route matrix | Pass | 9 path/viewport checks across Fresh Start, Awakening, and Document Migrator on desktop, 375px, and 390px. |
| Copy guard | Pass | Flow-scoped copy did not mention Settings or unavailable provider-key setup paths. |
| Channel readback | Pass | Platform channel read as immediately usable; provider/BYOK channels read as configured outside onboarding. |
| Document Migrator route | Pass | Mocked local submit routed to `/studio/personas/[personaId]/files`; no real hosted persona was created. |
| Overflow scan | Pass | No document-level or element-level horizontal overflow found in the checked states. |
| Screenshot inspection | Pass after visible fix | Provider-card labels and completed-step markers were readable after the scoped presentation patch. |
| Focused helper test | Pass | `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-provider-copy.test.ts` passed with 2 tests. |
| `test:studio-ui` | Pass | `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 134 tests. |
| Web typecheck | Pass | `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` passed. |
| `lint` | Pass | `npm exec --yes pnpm@10.32.1 -- run lint` passed; web lint reported no warnings or errors. |

Residual risk: This was a local mocked browser review. It does not revalidate
hosted runtime, real auth/session behavior, real provider credential behavior,
real import state, or staging.

## ARGUS Review

Verdict: `ACCEPTED VISIBLE FIX - WAKE MIMIR`.

ARGUS accepts ARIADNE's UX-08A visible fix. The additional product patch is
limited to readability in the persona creation flow: provider-card text now has
explicit light contrast on dark cards, and completed progress markers use a
compact symbol instead of cramped text.

Boundary review:

- Provider/channel copy still avoids unavailable Settings provider-key setup.
- Fresh Start, Awakening, and Document Migrator submit/redirect behavior is
  unchanged by the visible fix.
- The Document Migrator route proof used mocked local API responses only; no
  real hosted persona was created.
- No provider routing, model calls, BYOK credential storage, provider settings,
  runtime selection, auth/session behavior, imports, Developer Spaces,
  publishing, Assistant execution, schema, billing, config, deploy, package
  scripts, public routes, or staging behavior changed.
- No secrets, credentials, provider payloads, private owner data, raw
  identifiers, or secret-shaped values were added.

ARGUS validation:

| Command / check | Result | Notes |
| --- | --- | --- |
| `git diff 4575b10^ 4575b10 --check` | Pass | ARIADNE UX-08A visible-fix commit whitespace check passed. |
| Added-line sensitive-pattern scan | Reviewed | Matches were documentation boundary words for credential and auth/session scope only; no secret material found. |
| Added-line raw-id scan | Pass | No UUID-shaped raw identifiers found. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-provider-copy.test.ts` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 134 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | `tsc --noEmit` passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Turbo lint passed; web lint reported no warnings or errors. |
| ARIADNE visual evidence review | Accepted | ARGUS reviewed the recorded local mocked Playwright matrix and screenshot-inspection notes. ARGUS did not rerun the local mocked Playwright screenshot matrix in this turn. |

## Recommendation

Wake MIMIR to close UX-08A or sequence the next lane.
