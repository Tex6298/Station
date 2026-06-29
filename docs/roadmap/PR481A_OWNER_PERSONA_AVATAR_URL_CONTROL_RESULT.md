# PR481A Owner Persona Avatar URL Control Result

Date: 2026-06-29

Owner: DAEDALUS / A2

State: READY_FOR_ARGUS_REVIEW

Source: `docs/roadmap/PR481_VOICE_AVATAR_VISUAL_IDENTITY_PREFLIGHT_RESULT.md`

## Result

DAEDALUS implemented the accepted PR481A slice: owner-controlled persona
`avatarUrl` metadata using the existing `personas.avatar_url` field and public
`avatarUrl` serializer path.

Implementation:

- Added `sanitizePublicPersonaAvatarUrl(...)` in
  `apps/api/src/lib/persona-serialization.ts`.
- Added `avatarUrl` to owner persona create/update input handling in
  `apps/api/src/routes/personas.ts`.
- Stores only a normalized safe public `https://` URL or `null`.
- Rejects unsafe non-empty owner input with bounded `400` and
  `invalid_avatar_url` without echoing the raw URL.
- Public and owner persona serializers now null unsafe legacy `avatar_url` rows
  instead of passing them through.
- Added a small owner-only Avatar URL Save/Clear control on the existing persona
  management surface.
- Escaped CSS `backgroundImage` URL values on public persona and public Space
  avatar renderers using the repo's `url(${JSON.stringify(value)})` pattern.
- Added API and source tests for safe set, clear, unsafe reject, owner scope,
  unsafe legacy public nulling, owner UI boundedness, and CSS URL escaping.

## Boundaries

This patch does not add voice calls, WebRTC, microphone input, audio recording,
STT/TTS, voice cloning, avatar generation, image generation, camera capture,
video, uploaded media, generated media, signed upload URLs, storage changes,
provider media calls, provider/model routing, BYOK media setup, token-credit
deduction, media rate limits, cost metering, public anonymous avatar editing,
public visitor media controls, billing, Stripe, Redis, Cloudflare, queues,
workers, migrations, schema expansion, broad Studio redesign, or broad public
persona redesign.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 15 tests passed, including avatar safe set, clear, unsafe reject, owner scope, and unsafe legacy public nulling. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass | 8 tests passed, including CSS URL escaping and owner control source assertions. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 171 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 26 tests passed, including public persona route coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck both ran successfully without cache. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| Diff-only sensitive/scope scan | Pass | Matches are expected URL-safety fixtures, guardrails, or negative assertions; no media upload/storage, provider media call, voice/audio/video, billing, Stripe, Redis, Cloudflare, worker, queue, migration, schema expansion, or broad redesign scope was added. |

## ARGUS Review Request

ARGUS should review the sanitizer, owner create/update route handling, owner
management control, public serializer nulling, public avatar CSS escaping, and
test coverage.

If accepted, wake MIMIR with `WAKEUP A1:` for closeout and ARIADNE hosted
owner/public read-only proof routing. If fixes are needed, wake DAEDALUS with
`WAKEUP A2:` and the exact sanitizer rule, route case, UI control, renderer, or
test expectation that failed.
