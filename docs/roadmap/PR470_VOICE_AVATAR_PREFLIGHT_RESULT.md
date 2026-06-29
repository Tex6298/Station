# PR470 - Voice / Avatar Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

Accepted lane:

```text
PR470A - Owner Voice / Avatar Readiness Gate
Owner: DAEDALUS / A2
```

## Decision

Station can safely open a first Voice / Avatar slice only as an owner-only
readiness gate.

The first implementation must not create or imply realtime voice calls, voice
cloning, speech-to-text, text-to-speech, avatar likeness generation, media
upload/storage, generated media files, provider media calls, public audio input,
anonymous audio input, billing changes, Redis, Cloudflare, queues, workers, or
broad UI scope.

The accepted slice is an honest setup/readiness surface in the private persona
Studio workspace. It should explain that Voice / Avatar is not enabled yet and
name the policy gates required before any future media behavior exists.

## Accepted Product Shape

DAEDALUS may add an owner-only Voice / Avatar readiness card to the private
persona Studio home.

Allowed readback:

- Voice calls: not enabled.
- Speech-to-text and text-to-speech: not configured and not callable.
- Voice cloning: not enabled.
- Avatar likeness generation: not enabled.
- Audio/video upload and generated media storage: not enabled.
- Provider media adapter: required before any media call.
- Consent/copyright policy: required before any voice sample, generated voice,
  cloned voice, avatar likeness, or uploaded media exists.
- Cost/rate-limit/plan enforcement: required before any provider media call.

Allowed implementation shape:

- Web-only helper/readback copy and tests.
- Owner-only rendering on the private persona Studio surface.
- No new API route, database table, migration, storage bucket, provider
  adapter, queue, worker, billing path, token-credit behavior, or public route.

## Suggested Files

Prefer a small web helper and a private Studio component patch:

- `apps/web/lib/voice-avatar-readiness.ts`
- `apps/web/lib/voice-avatar-readiness.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx` if the page needs to
  pass the readback into the home view

DAEDALUS may choose the nearest existing local pattern, but should keep the
patch owner-only and web-only unless a narrower existing helper requires
otherwise.

## Explicit Non-Goals

Do not add:

- live voice calls, WebRTC, livestreaming, audio/video recording,
  speech-to-text, text-to-speech, voice cloning, avatar likeness generation, or
  generated media;
- public voice chat, anonymous audio input, public audio upload, or public
  avatar generation;
- media upload/storage, signed media URLs, storage quota changes, private
  persona file changes, or generated file persistence;
- provider media calls, model/provider routing, BYOK media setup, cost
  metering, token-credit deductions, or rate-limit enforcement for media;
- Stripe, billing, Redis, Cloudflare, queues, workers, migrations, or broad
  Studio/public UI redesign.

## Preflight Answers

1. Smallest honest slice: owner-only Voice / Avatar readiness gate.
2. New schema/storage: not required for PR470A; future media behavior would
   require explicit storage and privacy policy first.
3. Provider/BYOK sufficiency: existing text-chat provider settings are not
   enough for media. A provider/media adapter decision is required before any
   speech or avatar provider call.
4. Consent/copyright: must be decided before voice samples, generated voice,
   cloned voice, avatar likeness, or uploaded media exist.
5. Cost/rate-limit: must be decided before any provider media call.
6. Owner/public split: PR470A is owner-only. Public persona pages should not
   gain voice/avatar controls or promises in this slice.
7. Public copy: if unavoidable, only bounded "Voice and avatar are not enabled"
   copy is allowed. Prefer no public route change.
8. Proof: focused helper tests, Studio surface tests if available, typecheck,
   whitespace validation, and hosted owner-route visual rehearsal after ARGUS
   accepts implementation.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/voice-avatar-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If DAEDALUS changes existing Studio UI helpers covered by broader scripts, run
the relevant existing Studio/UI test script too.

## ARGUS Review Gates

ARGUS should reject PR470A if it:

- creates any media upload, recording, generated media, speech, voice cloning,
  avatar likeness, or provider media call behavior;
- stores or displays private Memory, Archive, Canon, Continuity, Integrity,
  owner setup, provider settings, credentials, storage paths, raw ids, source
  bodies, visitor identity, or secret-shaped material in public readback;
- implies voice/avatar is available to public visitors;
- adds billing, Stripe, Redis, Cloudflare, queues, workers, schema, migrations,
  or hosted runtime scope.

## Hosted Rehearsal Requirement

If DAEDALUS implements PR470A and ARGUS accepts it, MIMIR should route ARIADNE
for a narrow hosted owner-route check:

- signed-in owner persona Studio home renders the Voice / Avatar readiness
  gate on desktop and 390px mobile;
- no public voice/avatar controls appear on sampled signed-out public persona
  routes;
- no horizontal overflow, clipped controls, private source text, provider
  details, credentials, raw ids, storage paths, or secret-shaped material appear
  in the sampled UI.
