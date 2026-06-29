# PR481 - Voice / Avatar Visual Identity Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide smallest safe visual-identity slice

## MIMIR Decision

After closing PR480A, MIMIR chooses a different named Phase 3 feature:

```text
Voice / Avatar
```

Do not reopen Developer Space, authoring/versioning, community trust, or other
nearby readback work by inertia.

The full Voice / Avatar product remains blocked on explicit media decisions:
provider/media adapter, consent and copyright policy, storage/privacy policy
for samples or generated media, cost/rate-limit/plan enforcement, and hosted
rehearsal for any media-capable behavior.

The smallest no-new-config candidate is a visual identity foundation:

```text
PR481A - Owner Persona Avatar URL Control
```

ARGUS should hostile-preflight whether that slice is safe and exact enough for
DAEDALUS.

## Current Repo Evidence

Useful existing pieces:

- PR470A already added owner-only Voice / Avatar readiness copy and kept all
  media behavior disabled.
- `personas.avatar_url` already exists in database types and serializers.
- Public persona, public Space persona cards, and roulette cards already carry
  `avatarUrl` through the public serializer.
- The public persona page already renders an avatar image when `avatarUrl`
  exists and falls back to initials otherwise.
- API create/update schemas do not currently expose `avatarUrl`, so owner
  control is not yet a live user feature.

Risk to review:

- If owners can set `avatarUrl`, the accepted implementation must sanitize and
  validate it before it appears in public CSS/image rendering.
- Existing public rendering must not become a secret, raw id, provider, storage
  path, token, cookie, script, data URI, local file, or private source leak.

## ARGUS Task

Decide whether DAEDALUS may implement PR481A as the smallest safe first
Voice / Avatar product slice.

If accepted, give DAEDALUS exact scope, tests, and guardrails for an owner
avatar URL control.

If blocked, wake MIMIR with the concrete blocker and the smallest unblock lane.
Likely blockers include: unsafe URL rendering, unclear external-image policy,
missing owner UI edit path, or a need for a sanitizer/helper before exposing
the field.

## Candidate PR481A Scope

ARGUS may accept, patch, or reject this candidate:

- Add `avatarUrl` support to owner persona create/update through existing
  owner-scoped persona routes, using an explicit sanitizer/validator.
- Allow only safe public image URLs or `null`/empty clear behavior.
- Prefer `https://` URLs. Reject or clear `javascript:`, `data:`, `file:`,
  `blob:`, local/private network forms if the repo has a suitable helper or
  ARGUS requires one.
- Keep public and non-owner serializers limited to existing public persona
  fields: name, short description, visibility, public slug, public chat state,
  and safe avatar URL.
- Add a small owner UI control on an existing private persona management/settings
  surface so owners can set or clear the visual identity.
- Keep public pages falling back to initials when the URL is absent or rejected.
- Add source/UI tests proving the public route cannot render script, data URI,
  local file, token, storage path, raw id, provider payload, SQL/table detail,
  stack trace, or secret-shaped avatar values.

## Explicit Non-Goals

Do not add:

- voice calls, WebRTC, livestreaming, microphone input, audio recording,
  speech-to-text, text-to-speech, voice cloning, or generated voice;
- avatar likeness generation, image generation, camera capture, video, uploaded
  media files, generated media files, signed upload URLs, or storage changes;
- provider media calls, provider/model routing, BYOK media setup, token-credit
  deduction, media rate limits, or cost metering;
- public anonymous avatar editing, public visitor media controls, public audio
  controls, or public media upload;
- billing, Stripe, Redis, Cloudflare, queues, workers, migrations, schema
  expansion, broad Studio redesign, or broad public persona redesign.

## Required Preflight Output

Return one of:

```text
ACCEPT_PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL
PATCH_SCOPE
BLOCKED_NEEDS_MIMIR_DECISION
BLOCKED_NEEDS_UNBLOCK_LANE
```

If accepting, specify:

- exact touched files or acceptable local equivalents;
- URL safety rules;
- public/private serialization rules;
- owner UI placement;
- tests DAEDALUS must run;
- any ARIADNE hosted rehearsal requirement after ARGUS review.

## Suggested Validation If Accepted

Expected DAEDALUS validation may include:

```bash
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS may narrow or adjust this if the accepted implementation stays helper/API
only or touches a different focused test surface.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR481 Voice / Avatar Visual Identity preflight.
Verdict:
- ACCEPT_PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL | PATCH_SCOPE | BLOCKED_NEEDS_MIMIR_DECISION | BLOCKED_NEEDS_UNBLOCK_LANE
Task:
- Wake DAEDALUS with accepted scope, revise scope, make the product decision, or route the smallest unblock lane.
```

