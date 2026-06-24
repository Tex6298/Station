# PR210 Public Persona Chat Rehearsal Repair - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: open

## Frame

ARIADNE blocked PR209 on deployed Railway.

The failure is narrow:

- `/spaces/station-replay-alpha` exposes the public persona card for
  `station-replay-alpha-persona`.
- `/personas/public/station-replay-alpha-persona/context-preview` returns a
  public-safe preview.
- `/personas/public/station-replay-alpha-persona` returns 404.
- Browser route `/personas/station-replay-alpha-persona` renders
  `Public persona not found.`
- The hosted seed has no enabled public-chat persona, so ARIADNE could not
  rehearse signed-in enabled chat.

Likely fault line:

- PR208 public persona readback selects `public_chat_enabled`.
- Context preview does not select `public_chat_enabled`.
- If hosted Supabase is missing migration
  `056_public_persona_chat_alpha.sql`, readback can fail while preview still
  succeeds.

This lane repairs the rehearsal target only. Do not expand public chat scope.

## Target

Make PR209 rerunnable on hosted staging with:

1. public persona profile readback working;
2. context preview still public-safe;
3. exactly one staging replay public persona with public chat enabled for
   signed-in alpha rehearsal.

## Required Work

1. Hosted schema proof/repair
   - Prove whether `personas.public_chat_enabled` exists on the hosted Supabase
     target.
   - If missing, apply the idempotent migration from
     `infra/supabase/migrations/056_public_persona_chat_alpha.sql`.
   - Do not print secrets, tokens, database URLs, service-role keys, or raw
     connection strings.
   - Record sanitized proof only: column present, migration applied/not needed,
     and command class used.

2. Seed support
   - Extend `scripts/staging-replay-seed.mjs` to accept an optional
     `publicPersona.publicChatEnabled` boolean.
   - Default it to `false` so existing public personas remain disabled unless
     the replay corpus opts in.
   - Include `public_chat_enabled` in the public persona seed payload.
   - Update the sanitized replay corpus used by staging to enable exactly the
     `station-replay-alpha-persona` public-chat fixture.
   - Update the example corpus and validation copy if needed so future dry-runs
     show the opt-in state without exposing private material.

3. Public readback proof
   - Verify hosted:
     `/personas/public/station-replay-alpha-persona` returns the sparse public
     persona payload with `publicChat.enabled: true`.
   - Verify hosted:
     `/personas/public/station-replay-alpha-persona/context-preview` still
     returns public-safe sources and excluded private buckets.
   - Verify hosted:
     `/spaces/station-replay-alpha` still returns a routeable public persona
     card for `station-replay-alpha-persona`.
   - Verify browser route `/personas/station-replay-alpha-persona` no longer
     renders `Public persona not found.`

4. Safety boundaries
   - Do not add anonymous chat.
   - Do not add durable visitor transcripts.
   - Do not add private memory, archive, canon, continuity, integrity, owner
     setup, or BYOK/provider settings to public chat.
   - Do not add new product behavior beyond the rehearsal repair.
   - If the public readback query has an error path worth tightening, keep the
     public response generic and add a private/loggable diagnostic only if the
     repo already has a safe pattern for it.

## Validation

Run the narrow local checks you touch:

```text
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
node scripts/staging-replay-seed.mjs --dry-run
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:spaces
npm exec --yes pnpm@10.32.1 -- run test:writing
git diff --check
git diff --cached --check
```

For hosted proof, use sanitized commands and do not print secrets:

```text
npm exec --yes pnpm@10.32.1 -- run replay:seed:staging
```

Then verify the three hosted public routes named above. If the hosted repair
cannot be completed because config is missing, wake MIMIR with the exact missing
variable or permission.

## Wakeup

When complete, wake ARIADNE for the PR209 rerun:

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- DAEDALUS repaired the PR209 hosted public persona readback/seed blocker.
- The replay public persona now has public readback, context preview, and an
  enabled public-chat seed on hosted staging.
Validation:
- Include sanitized local and hosted route proof.
Task:
- Rerun docs/roadmap/PR209_PUBLIC_PERSONA_CHAT_ALPHA_REHEARSAL_ARIADNE.md.
- Verify signed-out, signed-in enabled chat, report/error states, desktop/mobile
  layout, public-source-only framing, and no private leaks.
```

If the repair exposes a security/privacy concern instead of a product blocker,
wake ARGUS. If config or hosted permission blocks the repair, wake MIMIR.
