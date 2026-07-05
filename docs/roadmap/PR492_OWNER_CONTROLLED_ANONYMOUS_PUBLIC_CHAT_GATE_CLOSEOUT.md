# PR492 - Owner-Controlled Anonymous Public Chat Gate Closeout

Date: 2026-07-05

Owner: MIMIR / A1

Verdict:

```text
ACCEPTED_CLOSE_PR492A_PR492B
```

## Summary

MIMIR closes PR492 / PR492A / PR492B as accepted.

PR492 moved anonymous public persona chat from the single replay alpha exception
to a bounded owner-controlled alpha gate for eligible non-replay public
personas.

## Accepted Chain

- ARGUS accepted the PR492 hostile preflight:
  `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_PREFLIGHT_RESULT.md`
- DAEDALUS implemented the owner gate:
  `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_RESULT.md`
- ARGUS accepted implementation:
  `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REVIEW_RESULT.md`
- ARIADNE found a hosted migration blocker:
  `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REHEARSAL_RESULT.md`
- MIMIR applied/proved hosted migration 068:
  `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_HOSTED_MIGRATION_RESULT.md`
- ARIADNE found the hosted owner-enable fixture blocker:
  `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REHEARSAL_RERUN_RESULT.md`
- MIMIR opened PR492B fixture setup:
  `docs/roadmap/PR492B_OWNER_GATED_PUBLIC_PERSONA_FIXTURE_SETUP_ARIADNE.md`
- ARIADNE passed PR492B / PR492A hosted proof:
  `docs/roadmap/PR492B_OWNER_GATED_PUBLIC_PERSONA_FIXTURE_SETUP_RESULT.md`

## Accepted Behavior

- `public_chat_enabled` remains the base public chat enable/disable and
  rollback switch.
- `public_anonymous_chat_enabled` is a separate default-off owner consent gate.
- Non-replay public personas require owner gate enablement before anonymous
  public chat is allowed.
- Replay alpha compatibility remains intact for `station-replay-alpha-persona`.
- `station-replay-signed-in-alpha-persona` remains signed-in alpha and
  anonymous-denied.
- Owner gate enablement and rollback were proven on
  `station-replay-owner-gate-alpha-persona`.
- The proof fixture was restored to public chat enabled and anonymous owner gate
  disabled.
- Public persona routes, roulette cards, Discover cards, and public pages expose
  safe mode/readiness copy without raw owner gate fields.
- Anonymous public chat remains public-source-only, owner-paid, fail-closed for
  rate/provider/quota issues, and aggregate-counter only.
- No anonymous transcript, visitor identity, or raw event storage was added.

## Hosted Proof

ARIADNE proved on hosted Railway/Supabase:

- web/API health at app commit `a2d3f6be`;
- hosted Supabase migration present;
- owner route recovery after migration;
- owner gate default-off, enable, and rollback;
- signed-out anonymous success for the owner-enabled fixture and replay alpha;
- negative-control denial for the signed-in fixture;
- public no-leak behavior across route, roulette, and Discover cards;
- desktop, `375px`, and `390px` browser fit/no-placeholder checks.

## Residual Boundaries

This closeout does not claim:

- public launch readiness;
- broad anonymous runtime expansion for all public personas;
- transcript persistence;
- voice mode;
- public Salon/live event chat;
- new provider, billing, queue, Redis, Cloudflare, or worker architecture.

The feature is accepted as a protected-alpha owner-gated anonymous public chat
capability.

## Next

Per the Phase 3/customer-facing expansion rule, MIMIR opens a distinct named
Phase 3 feature preflight:

`docs/roadmap/PR493_PERSONA_ROULETTE_VISITOR_ENCOUNTER_PREFLIGHT_ARGUS.md`

PR493 should assess whether Persona Roulette can now move from discovery
readback to a bounded visitor text encounter using the proven owner-gated
anonymous public chat path.
