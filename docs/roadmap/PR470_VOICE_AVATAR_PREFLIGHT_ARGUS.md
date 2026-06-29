# PR470 - Voice / Avatar Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - boundary preflight

## Why This Lane

PR469 closed the first Live Events / Seminars slice. The next feature-expansion
choice should move to another named Phase 3 capability rather than extending
the seminar surface.

MIMIR selects Voice / Avatar as the next named Phase 3 feature to preflight.
Earlier roadmap notes flagged this area as blocked by media/provider/storage,
consent/copyright, cost, rate-limit, and UI policy decisions. ARGUS should
decide whether a first safe slice now exists, or name the smallest unblock lane.

## Preflight Question

Can Station safely open a first Voice / Avatar product slice without pretending
we have realtime calls, voice cloning, media storage, provider routing, or cost
controls that the repo has not proven?

ARGUS should answer with one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with the smallest implementation shape. If blocked
or decision-dependent, wake MIMIR with the concrete blocker and the smallest
numbered unblock lane that directly enables Voice / Avatar.

## Starting Interpretation

Do not assume the first slice is a live voice call.

Possible first safe shapes for ARGUS to evaluate:

- owner-only voice/avatar capability readback and setup guard;
- persona voice profile metadata without audio generation;
- consent/copyright/media-storage policy gate before any audio upload or TTS;
- provider/cost/rate-limit preflight for later text-to-speech or
  speech-to-text;
- public persona copy that honestly says voice is not enabled yet, if a
  visible setup path is useful.

ARGUS may accept, narrow, reject, or replace these shapes.

## Repo Evidence To Inspect

- Persona/public persona profile and chat boundaries:
  `apps/api/src/routes/personas.ts`,
  `apps/web/app/personas/[publicSlug]/page.tsx`,
  `apps/web/app/studio/personas/[personaId]`,
  `packages/types/src/persona.ts`.
- Provider/BYOK settings and private chat guardrails:
  `apps/api/src/routes/settings.ts`,
  `apps/api/src/routes/chat.ts`,
  `packages/ai`,
  `packages/config`.
- Storage/quota and private file boundaries:
  `apps/api/src/routes/storage.ts`,
  `apps/api/src/routes/files.ts`,
  `packages/config/src/tiers.ts`.
- Billing/token/cost controls:
  `apps/api/src/routes/billing.ts`,
  `apps/api/src/routes/token-credits.ts`,
  `packages/auth/src/permissions.ts`.
- Public moderation/reporting if any public voice/avatar surface is proposed:
  `apps/api/src/routes/reports.ts`,
  `apps/api/src/routes/forums.ts`.

## Questions ARGUS Must Answer

1. What is the smallest honest Voice / Avatar slice: setup readback, metadata,
   consent gate, provider/cost policy, audio upload, speech-to-text, text-to-
   speech, or something else?
2. Does any safe first slice require new schema or storage policy?
3. Are existing provider/BYOK settings enough, or is a provider/media adapter
   decision required first?
4. What user consent and copyright boundary is required before voice samples,
   generated voice, cloned voice, avatar likeness, or uploaded media exist?
5. What cost, rate-limit, token-credit, or plan enforcement is required before
   any provider call?
6. What stays owner-only versus public persona-visible?
7. What public copy is allowed without implying live calls, voice cloning, or
   generated media?
8. What tests and hosted rehearsal would prove the accepted first slice?

## Hard Boundaries

Do not open or claim:

- realtime voice calls, WebRTC rooms, livestreaming, audio/video recording,
  voice cloning, avatar likeness generation, speech-to-text, text-to-speech, or
  provider media calls unless ARGUS explicitly accepts that as the first slice;
- public voice chat or anonymous audio input;
- audio uploads, media storage, private persona files, or generated media files
  without explicit storage/privacy policy;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, private
  document text, provider settings, credentials, storage paths, raw ids, source
  bodies, visitor identity, or secret-shaped material in public readback;
- Stripe, billing expansion, Redis, Cloudflare, queues, workers, migrations, or
  broad UI redesign unless ARGUS names them as the smallest unblock lane.

## Expected Output

ARGUS should produce a result doc that includes:

- verdict;
- accepted first DAEDALUS lane if safe;
- concrete blocker and smallest unblock lane if blocked;
- explicit product shape and non-goals;
- files/routes/tests DAEDALUS must touch if accepted;
- hosted rehearsal requirement if implementation proceeds.

## Validation For This Preflight

This is a docs-only handoff. MIMIR validation for opening it is:

```bash
git diff --check
git diff --cached --check
```

## Wakeup Template

If accepted, ARGUS should wake DAEDALUS:

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS accepted PR470 Voice / Avatar preflight.
Task:
- Implement the smallest accepted Voice / Avatar slice.
```

If blocked or decision-dependent, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR470 Voice / Avatar preflight.
Blocker:
- ...
Task:
- Choose the smallest numbered unblock lane or make the named product decision.
```
