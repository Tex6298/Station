# PR490B - Public Persona Anonymous Chat Readiness Copy Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed accepted with fixture gap

## Verdict

```text
CLOSED_ACCEPTED_WITH_FIXTURE_GAP
```

PR490A/PR490B are closed as a readback and readiness-copy lane. The work did
not expand anonymous public persona chat runtime behavior.

## What Closed

PR490 began as a hostile preflight for anonymous public persona chat expansion
beyond the single replay alpha persona. ARGUS rejected direct runtime expansion
as the first slice and accepted owner/admin eligibility readback instead:

- `docs/roadmap/PR490_PUBLIC_PERSONA_ANONYMOUS_CHAT_EXPANSION_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_PREFLIGHT_RESULT.md`

DAEDALUS implemented the readback; ARGUS reviewed and patched the source-scope
copy; ARIADNE then found one hosted copy defect:

- `docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_RESULT.md`
- `docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_REVIEW_RESULT.md`
- `docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_REHEARSAL_RESULT.md`

PR490B repaired that defect by making owner-visible anonymous eligibility copy
name fail-closed rate-limit posture plus provider readiness/blocker state:

- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_REPAIR_RESULT.md`
- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_REPAIR_REVIEW_RESULT.md`
- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_RERUN_RESULT.md`

ARIADNE's hosted rerun passed at web/API commit `890f9692` on desktop, `375px`,
and `390px`.

## Accepted Truth

- Anonymous public persona chat remains available only for the replay alpha
  slug: `station-replay-alpha-persona`.
- Ordinary public personas remain signed-in public chat only and anonymous-deny
  by default.
- Owner/admin readback now exposes the current eligibility truth more honestly:
  replay-only anonymous availability, public-source-only chat scope,
  fail-closed rate-limit posture, rate-limit backing readiness, provider route
  readiness/blocker state, no visitor transcript/identity/raw event storage,
  aggregate counters only, and owner rollback.
- Public persona pages did not gain owner/admin readiness readback.
- Public prompts and sources remain public profile, published public documents,
  and linked public discussions only; no public Salon prompt-source overclaim
  remains.
- No anonymous runtime eligibility, provider/model routing, rate-limit behavior,
  API contract, schema, billing, worker, queue, Redis, Cloudflare, connector,
  OAuth, social dispatch, public reporting/moderation, or broad UI behavior
  changed in PR490A/PR490B.

## Fixture Gap

Hosted public route discovery still found only:

```text
station-replay-alpha-persona
```

That absence does not block closing PR490A/PR490B, because these lanes were
readback/copy repair lanes. It does block stronger hosted proof that an
ordinary public persona remains signed-in-only before opening a broader
anonymous runtime or owner-controlled anonymous gate.

Next lane should therefore remove that blocker before any runtime expansion
claim.

## Validation

Accepted validation across PR490A/PR490B included:

- `npm exec --yes pnpm@10.32.1 -- run test:personas`
- `npm exec --yes pnpm@10.32.1 -- run test:reports`
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/public-persona-interaction.test.ts`
- `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-interaction.test.ts`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- hosted ARIADNE desktop, `375px`, and `390px` rerun at `890f9692`
- `git diff --check`

## Next

Open PR491 as the smallest unblock lane for Phase 3 anonymous public persona
expansion:

```text
PR491 - Public Persona Second Fixture And Signed-In-Only Proof Preflight
Owner: ARGUS / A3
```

PR491 should decide the exact safe boundary for a non-production ordinary public
persona fixture and hosted signed-in-only/anonymous-deny proof, or explain why
the owner-controlled anonymous gate can proceed without it.
